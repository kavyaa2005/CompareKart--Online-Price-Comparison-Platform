# WebSocket Real-Time Updates Documentation

## Overview

The Price Intelligence system includes WebSocket support for real-time price updates, alert notifications, and user-specific events. This enables instant notifications to users without requiring them to refresh the page.

## Backend Setup

### WebSocket Service (`src/websocket_service.py`)

The WebSocket service provides:
- Connection management
- Message broadcasting
- Real-time notifications
- Heartbeat mechanism
- Connection statistics

### WebSocket Endpoint

**URL:** `/ws/updates/{token}`

**Authentication:** JWT token (same as REST API)

**Protocol:** WebSocket

**Example Connection:**
```javascript
const token = localStorage.getItem('token');
const ws = new WebSocket(`ws://localhost:8000/ws/updates/${token}`);

ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

## Message Types

### Connection Established

Sent immediately upon successful connection.

```json
{
  "type": "connection_established",
  "message": "WebSocket connection established",
  "timestamp": "2024-01-01T12:00:00"
}
```

### Heartbeat

Sent periodically to keep connection alive (every 30 seconds from server).

```json
{
  "type": "heartbeat",
  "message": "Connection active",
  "timestamp": "2024-01-01T12:00:30"
}
```

### Alert Created

Sent when user creates a new price alert.

```json
{
  "type": "alert_created",
  "alertId": "alert_123",
  "productId": "iPhone 15",
  "targetPrice": 50000,
  "status": "Active",
  "message": "Alert created for iPhone 15",
  "timestamp": "2024-01-01T12:05:00"
}
```

### Alert Triggered

Sent when a price alert is triggered (price drops to target or below).

```json
{
  "type": "alert_triggered",
  "alertId": "alert_123",
  "productId": "iPhone 15",
  "targetPrice": 50000,
  "currentPrice": 45000,
  "savings": 5000,
  "message": "Price alert triggered for iPhone 15!",
  "timestamp": "2024-01-01T12:10:00"
}
```

### Price Update

Broadcast to all connected users when prices update.

```json
{
  "type": "price_update",
  "productId": "iPhone 15",
  "currentPrice": 45000,
  "previousPrice": 50000,
  "platform": "Amazon",
  "timestamp": "2024-01-01T12:15:00"
}
```

### Wishlist Updated

Sent when user modifies their wishlist.

```json
{
  "type": "wishlist_updated",
  "productId": "iPhone 15",
  "action": "added",
  "message": "Product added to wishlist",
  "timestamp": "2024-01-01T12:20:00"
}
```

### Product Recommended

Sent when AI generates new recommendations for the user.

```json
{
  "type": "product_recommended",
  "productId": "Samsung S24",
  "productName": "Samsung Galaxy S24",
  "currentPrice": 45000,
  "confidence": 0.85,
  "reason": "Similar to your viewed products",
  "timestamp": "2024-01-01T12:25:00"
}
```

## Frontend Usage

### Using `useWebSocket` Hook

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

function MyComponent() {
  const token = localStorage.getItem('token');
  const { 
    isConnected, 
    lastMessage, 
    error, 
    send, 
    disconnect 
  } = useWebSocket(token, {
    reconnectAttempts: 5,
    reconnectDelay: 3000,
    autoConnect: true,
  });

  useEffect(() => {
    if (lastMessage?.type === 'alert_triggered') {
      console.log('Alert triggered:', lastMessage);
      // Show notification to user
    }
  }, [lastMessage]);

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Real-Time Alert Updates

```typescript
function AlertsPage() {
  const token = localStorage.getItem('token');
  const [alerts, setAlerts] = useState([]);
  const { lastMessage } = useWebSocket(token);

  useEffect(() => {
    // Handle real-time alert creation
    if (lastMessage?.type === 'alert_created') {
      setAlerts(prev => [...prev, {
        id: lastMessage.alertId,
        productId: lastMessage.productId,
        targetPrice: lastMessage.targetPrice,
        status: lastMessage.status,
        createdAt: new Date(lastMessage.timestamp),
      }]);
    }

    // Handle alert trigger
    if (lastMessage?.type === 'alert_triggered') {
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === lastMessage.alertId
            ? { ...alert, triggered: true }
            : alert
        )
      );
      
      // Show notification
      showNotification({
        title: 'Price Alert Triggered!',
        message: `${lastMessage.productId} is now ₹${lastMessage.currentPrice}`,
        type: 'success',
      });
    }
  }, [lastMessage]);

  return (
    // Render alerts...
  );
}
```

### Real-Time Wishlist Updates

```typescript
function WishlistPage() {
  const token = localStorage.getItem('token');
  const { lastMessage } = useWebSocket(token);

  useEffect(() => {
    if (lastMessage?.type === 'wishlist_updated') {
      // Refresh wishlist from API or update local state
      refetchWishlist();
    }
  }, [lastMessage]);

  return (
    // Render wishlist items...
  );
}
```

### Real-Time Recommendations

```typescript
function RecommendationsPage() {
  const token = localStorage.getItem('token');
  const [recommendations, setRecommendations] = useState([]);
  const { lastMessage } = useWebSocket(token);

  useEffect(() => {
    if (lastMessage?.type === 'product_recommended') {
      // Add new recommendation to the top
      setRecommendations(prev => [
        {
          id: lastMessage.productId,
          productName: lastMessage.productName,
          currentPrice: lastMessage.currentPrice,
          confidence: lastMessage.confidence,
          reason: lastMessage.reason,
        },
        ...prev,
      ]);

      // Toast notification
      toast.success(`New recommendation: ${lastMessage.productName}`);
    }
  }, [lastMessage]);

  return (
    // Render recommendations...
  );
}
```

## Environment Variables

Add to your `.env` file for WebSocket configuration:

```env
# WebSocket configuration
VITE_WS_URL=ws://localhost:8000
# OR use this if WebSocket and API share the same base URL
VITE_API_URL=http://localhost:8000
```

## Connection Lifecycle

1. **Initialization**: User logs in, token stored in localStorage
2. **Connection**: WebSocket connects using token from `/ws/updates/{token}`
3. **Authentication**: Server verifies JWT token
4. **Active**: Receives real-time messages
5. **Heartbeat**: Server sends heartbeat every 30 seconds
6. **Disconnect**: User logs out or connection drops
7. **Reconnection**: Auto-reconnect with exponential backoff (up to 5 attempts)

## Testing WebSocket Connections

### Using Browser Console

```javascript
// Connect
const token = localStorage.getItem('token');
const ws = new WebSocket(`ws://localhost:8000/ws/updates/${token}`);

ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Message:', JSON.parse(e.data));
ws.onerror = (e) => console.error('Error:', e);
ws.onclose = () => console.log('Disconnected');

// Send test message
ws.send(JSON.stringify({ type: 'ping' }));
```

### Getting Connection Stats

```bash
# Get statistics about WebSocket connections
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/ws/stats
```

Response:
```json
{
  "user_id": "user_123",
  "total_connections": 2,
  "total_messages_received": 5,
  "total_messages_sent": 10,
  "connections": [
    {
      "connected_at": "2024-01-01T12:00:00",
      "messages_received": 2,
      "messages_sent": 5
    }
  ]
}
```

## Performance Considerations

- **Connection Pooling**: Multiple tabs on same domain can share connections or have separate ones
- **Message Frequency**: Real-time updates every 1-5 seconds for price changes
- **Payload Size**: Messages are kept under 1KB
- **Memory**: Each connected user uses ~50KB of server memory
- **Scaling**: Can handle ~1000 concurrent connections per server instance

## Best Practices

1. **Always Disconnect**: Call `disconnect()` when component unmounts
2. **Dynamic Token**: Refresh WebSocket connection if token changes
3. **Error Handling**: Gracefully handle connection errors
4. **Message Type Checking**: Always check `message.type` before processing
5. **Debouncing**: Debounce rapid updates from the same product
6. **UI Feedback**: Show connection status indicator to users
7. **Testing**: Test reconnection behavior and message handling

## Troubleshooting

### Connection Fails with 4001 Error
- **Cause**: Invalid or expired token
- **Solution**: Re-login to get new token

### Connection Drops Frequently
- **Cause**: Network instability or server overload
- **Solution**: Adjust `reconnectDelay` in hook options

### No Messages Received
- **Cause**: WebSocket connected but no events triggered
- **Solution**: Create an alert or perform action to trigger WebSocket messages

### High Memory Usage
- **Cause**: Too many open connections
- **Solution**: Ensure clients properly disconnect on logout

## Future Enhancements

- [ ] Message compression (deflate)
- [ ] Selective message filtering per user
- [ ] Message queuing during connection loss
- [ ] Binary message support
- [ ] Custom message priorities
- [ ] Server-side connection pooling
