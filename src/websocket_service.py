"""
WebSocket service for real-time price updates and notifications.
Manages WebSocket connections and broadcasts updates to connected clients.
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Set, Dict, List
import json
import logging
import asyncio
from datetime import datetime

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections and message broadcasting"""
    
    def __init__(self):
        # Store active connections: {user_id: Set[WebSocket]}
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Track connection metadata: {user_id: {websocket: metadata}}
        self.connection_metadata: Dict[str, Dict[WebSocket, dict]] = {}
    
    async def connect(self, user_id: str, websocket: WebSocket):
        """
        Accept and register a new WebSocket connection
        
        Args:
            user_id: The user ID for this connection
            websocket: The WebSocket connection object
        """
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
            self.connection_metadata[user_id] = {}
        
        self.active_connections[user_id].add(websocket)
        self.connection_metadata[user_id][websocket] = {
            "connected_at": datetime.now().isoformat(),
            "messages_received": 0,
            "messages_sent": 0,
        }
        
        logger.info(f"WebSocket connected for user {user_id}. Total connections: {len(self.active_connections[user_id])}")
        
        # Send connection confirmation
        await websocket.send_json({
            "type": "connection_established",
            "message": "WebSocket connection established",
            "timestamp": datetime.now().isoformat(),
        })
    
    def disconnect(self, user_id: str, websocket: WebSocket):
        """
        Unregister a WebSocket connection
        
        Args:
            user_id: The user ID for this connection
            websocket: The WebSocket connection object
        """
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            
            if user_id in self.connection_metadata:
                self.connection_metadata[user_id].pop(websocket, None)
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                if user_id in self.connection_metadata:
                    del self.connection_metadata[user_id]
            
            logger.info(f"WebSocket disconnected for user {user_id}")
    
    async def send_personal_message(self, user_id: str, message: dict):
        """
        Send a message to all connections of a specific user
        
        Args:
            user_id: The user ID
            message: The message data to send
        """
        if user_id not in self.active_connections:
            logger.debug(f"No active connections for user {user_id}")
            return
        
        disconnected = []
        for websocket in self.active_connections[user_id]:
            try:
                message_with_timestamp = {**message, "timestamp": datetime.now().isoformat()}
                await websocket.send_json(message_with_timestamp)
                
                # Update metadata
                if user_id in self.connection_metadata and websocket in self.connection_metadata[user_id]:
                    self.connection_metadata[user_id][websocket]["messages_sent"] += 1
                
                logger.debug(f"Message sent to user {user_id}")
            except Exception as e:
                logger.error(f"Failed to send message to user {user_id}: {str(e)}")
                disconnected.append(websocket)
        
        # Clean up disconnected sockets
        for websocket in disconnected:
            self.disconnect(user_id, websocket)
    
    async def broadcast_price_update(self, message: dict):
        """
        Broadcast price update to all connected users
        
        Args:
            message: Price update message containing:
                - type: "price_update"
                - productId: Product identifier
                - currentPrice: Current price
                - previousPrice: Previous price
                - platform: Platform name
        """
        if not self.active_connections:
            logger.debug("No active connections to broadcast to")
            return
        
        broadcast_message = {**message, "timestamp": datetime.now().isoformat()}
        
        all_users = list(self.active_connections.keys())
        for user_id in all_users:
            await self.send_personal_message(user_id, broadcast_message)
    
    async def notify_alert_triggered(self, user_id: str, alert_data: dict):
        """
        Notify user that their price alert has been triggered
        
        Args:
            user_id: The user ID
            alert_data: Alert trigger data containing:
                - type: "alert_triggered"
                - alertId: Alert ID
                - productId: Product ID
                - targetPrice: Target price
                - currentPrice: Current price (actual trigger price)
                - savings: Savings amount
        """
        message = {
            "type": "alert_triggered",
            **alert_data,
            "timestamp": datetime.now().isoformat(),
        }
        await self.send_personal_message(user_id, message)
        logger.info(f"Alert triggered notification sent to user {user_id}")
    
    async def notify_product_recommendation(self, user_id: str, product_data: dict):
        """
        Notify user about a new AI-generated recommendation
        
        Args:
            user_id: The user ID
            product_data: Product recommendation data
        """
        message = {
            "type": "product_recommended",
            **product_data,
            "timestamp": datetime.now().isoformat(),
        }
        await self.send_personal_message(user_id, message)
        logger.info(f"Product recommendation sent to user {user_id}")
    
    async def notify_wishlist_update(self, user_id: str, update_data: dict):
        """
        Notify user about wishlist updates
        
        Args:
            user_id: The user ID
            update_data: Update data containing:
                - type: "wishlist_item_added" or "wishlist_item_removed"
                - productId: Product ID
                - action: "added" or "removed"
        """
        message = {
            "type": "wishlist_updated",
            **update_data,
            "timestamp": datetime.now().isoformat(),
        }
        await self.send_personal_message(user_id, message)
        logger.info(f"Wishlist update sent to user {user_id}")
    
    async def send_heartbeat(self, user_id: str):
        """
        Send heartbeat message to keep connection alive
        
        Args:
            user_id: The user ID
        """
        message = {
            "type": "heartbeat",
            "message": "Connection active",
            "timestamp": datetime.now().isoformat(),
        }
        await self.send_personal_message(user_id, message)
    
    def get_connection_count(self, user_id: str = None) -> int:
        """
        Get number of active connections
        
        Args:
            user_id: Optional user ID to get count for specific user
            
        Returns:
            Number of active connections
        """
        if user_id:
            return len(self.active_connections.get(user_id, set()))
        else:
            return sum(len(conns) for conns in self.active_connections.values())
    
    def get_all_active_users(self) -> List[str]:
        """
        Get list of all users with active connections
        
        Returns:
            List of user IDs
        """
        return list(self.active_connections.keys())
    
    async def get_connection_stats(self, user_id: str = None) -> dict:
        """
        Get statistics about connections
        
        Args:
            user_id: Optional user ID for specific user stats
            
        Returns:
            Statistics dictionary
        """
        if user_id and user_id in self.connection_metadata:
            connections = list(self.connection_metadata[user_id].values())
            return {
                "user_id": user_id,
                "total_connections": len(connections),
                "total_messages_received": sum(c.get("messages_received", 0) for c in connections),
                "total_messages_sent": sum(c.get("messages_sent", 0) for c in connections),
                "connections": connections,
            }
        else:
            total_users = len(self.active_connections)
            total_connections = self.get_connection_count()
            return {
                "total_users_connected": total_users,
                "total_connections": total_connections,
                "active_users": self.get_all_active_users(),
            }


# Global connection manager instance
manager = ConnectionManager()


async def handle_websocket_connection(user_id: str, websocket: WebSocket):
    """
    Handle WebSocket connection for a user
    Manages heartbeat and message processing
    
    Args:
        user_id: The user ID
        websocket: The WebSocket connection
    """
    await manager.connect(user_id, websocket)
    heartbeat_task = None
    
    try:
        # Start heartbeat task
        heartbeat_task = asyncio.create_task(_heartbeat_loop(user_id))
        
        # Keep listening for incoming messages
        while True:
            try:
                data = await websocket.receive_json()
                
                # Update message counter
                if user_id in manager.connection_metadata and websocket in manager.connection_metadata[user_id]:
                    manager.connection_metadata[user_id][websocket]["messages_received"] += 1
                
                # Handle ping/pong for connection keepalive
                if data.get("type") == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat(),
                    })
                
                logger.debug(f"Message received from user {user_id}: {data.get('type')}")
                
            except json.JSONDecodeError:
                await websocket.send_json({"error": "Invalid JSON format"})
            except Exception as e:
                logger.error(f"Error processing message from user {user_id}: {str(e)}")
                break
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user {user_id}")
        manager.disconnect(user_id, websocket)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {str(e)}")
        manager.disconnect(user_id, websocket)
    finally:
        # Cancel heartbeat task
        if heartbeat_task:
            heartbeat_task.cancel()
            try:
                await heartbeat_task
            except asyncio.CancelledError:
                pass


async def _heartbeat_loop(user_id: str, interval: int = 30):
    """
    Send periodic heartbeat messages to keep connection alive
    
    Args:
        user_id: The user ID
        interval: Heartbeat interval in seconds
    """
    try:
        while True:
            await asyncio.sleep(interval)
            await manager.send_heartbeat(user_id)
    except asyncio.CancelledError:
        logger.debug(f"Heartbeat loop cancelled for user {user_id}")
    except Exception as e:
        logger.error(f"Error in heartbeat loop for user {user_id}: {str(e)}")
