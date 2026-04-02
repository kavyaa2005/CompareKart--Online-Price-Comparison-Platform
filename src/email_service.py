"""
Email notification service for price alerts and recommendations.
Supports SMTP-based email sending with HTML templates.
"""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Email configuration - can be updated via environment variables
class EmailConfig:
    """Email configuration"""
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SENDER_EMAIL = os.getenv("SENDER_EMAIL", "noreply@priceintelligence.com")
    SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "")
    SENDER_NAME = "Price Intelligence"
    USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    ENABLED = os.getenv("EMAIL_NOTIFICATIONS_ENABLED", "true").lower() == "true"


class EmailTemplates:
    """Email templates for various notifications"""
    
    @staticmethod
    def alert_created_email(user_name: str, product_name: str, target_price: float, current_price: float) -> tuple[str, str]:
        """Template for alert creation notification"""
        subject = f"Alert Created: {product_name}"
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px;">
                            Price Alert Created ✓
                        </h2>
                        
                        <p>Hi {user_name},</p>
                        
                        <p>Your price tracking alert has been successfully created!</p>
                        
                        <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 10px 0;"><strong>Product:</strong> {product_name}</p>
                            <p style="margin: 10px 0;"><strong>Current Price:</strong> ₹{current_price:,.2f}</p>
                            <p style="margin: 10px 0;"><strong>Target Price:</strong> ₹{target_price:,.2f}</p>
                            <p style="margin: 10px 0;"><strong>Created:</strong> {datetime.now().strftime('%d %B %Y, %I:%M %p')}</p>
                        </div>
                        
                        <p>We'll notify you by email as soon as the price drops to your target price or below.</p>
                        
                        <p style="color: #7f8c8d; margin-top: 30px;">
                            Best regards,<br>
                            <strong>Price Intelligence Team</strong>
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return subject, html_body
    
    @staticmethod
    def alert_triggered_email(user_name: str, product_name: str, target_price: float, current_price: float, 
                             savings: float) -> tuple[str, str]:
        """Template for alert trigger notification"""
        subject = f"🎉 Price Drop Alert! {product_name} - ₹{current_price:,.2f}"
        
        savings_percent = (savings / target_price) * 100 if target_price > 0 else 0
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 5px solid #27ae60;">
                        <h2 style="color: #27ae60;">🎉 Price Alert Triggered!</h2>
                        
                        <p>Hi {user_name},</p>
                        
                        <p>Great news! The price of <strong>{product_name}</strong> has dropped to your target price!</p>
                        
                        <div style="background-color: #d5f4e6; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #27ae60;">
                            <p style="margin: 10px 0; font-size: 18px;"><strong>Current Price:</strong> ₹{current_price:,.2f}</p>
                            <p style="margin: 10px 0; font-size: 18px;"><strong>Target Price:</strong> ₹{target_price:,.2f}</p>
                            <p style="margin: 10px 0; font-size: 18px; color: #27ae60;"><strong>You Save:</strong> ₹{savings:,.2f} ({savings_percent:.1f}%)</p>
                        </div>
                        
                        <p>This is a great time to make your purchase! Visit our dashboard to check the latest deals.</p>
                        
                        <a href="https://your-app.com/dashboard" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                            View Product
                        </a>
                        
                        <p style="color: #7f8c8d; margin-top: 30px; font-size: 12px;">
                            This is an automated notification from Price Intelligence. You can manage your notification preferences in your account settings.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return subject, html_body
    
    @staticmethod
    def recommendation_email(user_name: str, products: List[dict]) -> tuple[str, str]:
        """Template for AI recommendations notification"""
        subject = f"📊 Your AI-Generated Recommendations - {len(products)} Great Deals Found!"
        
        products_html = ""
        for product in products[:5]:  # Show top 5 recommendations
            products_html += f"""
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #ecf0f1; vertical-align: top;">
                    <p style="margin: 0; font-weight: bold;">{product.get('productName', 'Product')}</p>
                    <p style="margin: 5px 0; color: #7f8c8d; font-size: 12px;">{product.get('platform', 'Unknown Platform')}</p>
                </td>
                <td style="padding: 15px; border-bottom: 1px solid #ecf0f1; text-align: right; vertical-align: top;">
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #27ae60;">₹{product.get('currentPrice', 0):,.2f}</p>
                    <p style="margin: 5px 0; color: #7f8c8d; font-size: 12px;">Confidence: {product.get('confidence', 0):.0%}</p>
                </td>
            </tr>
            """
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px;">
                            📊 Your AI Recommendations
                        </h2>
                        
                        <p>Hi {user_name},</p>
                        
                        <p>Based on your shopping preferences and price history, we found <strong>{len(products)} great deals</strong> you might be interested in:</p>
                        
                        <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #ecf0f1;">
                                    <th style="padding: 15px; text-align: left; font-weight: bold;">Product</th>
                                    <th style="padding: 15px; text-align: right; font-weight: bold;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products_html}
                            </tbody>
                        </table>
                        
                        <a href="https://your-app.com/recommendations" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold;">
                            View All Recommendations
                        </a>
                        
                        <p style="color: #7f8c8d; margin-top: 30px;">
                            Best regards,<br>
                            <strong>Price Intelligence Team</strong>
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return subject, html_body


class EmailService:
    """Email service for sending notifications"""
    
    @staticmethod
    def send_email(to_email: str, subject: str, html_body: str) -> bool:
        """
        Send email with HTML content
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_body: Email body in HTML format
            
        Returns:
            True if email sent successfully, False otherwise
        """
        if not EmailConfig.ENABLED:
            logger.info(f"Email notifications disabled. Email to {to_email} not sent.")
            return True
        
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{EmailConfig.SENDER_NAME} <{EmailConfig.SENDER_EMAIL}>"
            message["To"] = to_email
            
            # Add HTML body
            message.attach(MIMEText(html_body, "html"))
            
            # Send email
            with smtplib.SMTP(EmailConfig.SMTP_SERVER, EmailConfig.SMTP_PORT) as server:
                if EmailConfig.USE_TLS:
                    server.starttls()
                
                # Only authenticate if password is provided
                if EmailConfig.SENDER_PASSWORD:
                    server.login(EmailConfig.SENDER_EMAIL, EmailConfig.SENDER_PASSWORD)
                
                server.send_message(message)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    @staticmethod
    def send_alert_created_notification(user_email: str, user_name: str, product_name: str, 
                                       target_price: float, current_price: float) -> bool:
        """Send alert creation notification"""
        subject, html_body = EmailTemplates.alert_created_email(user_name, product_name, target_price, current_price)
        return EmailService.send_email(user_email, subject, html_body)
    
    @staticmethod
    def send_alert_triggered_notification(user_email: str, user_name: str, product_name: str,
                                         target_price: float, current_price: float, savings: float) -> bool:
        """Send alert trigger notification"""
        subject, html_body = EmailTemplates.alert_triggered_email(user_name, product_name, target_price, 
                                                                   current_price, savings)
        return EmailService.send_email(user_email, subject, html_body)
    
    @staticmethod
    def send_recommendations_notification(user_email: str, user_name: str, products: List[dict]) -> bool:
        """Send recommendations notification"""
        subject, html_body = EmailTemplates.recommendation_email(user_name, products)
        return EmailService.send_email(user_email, subject, html_body)
    
    @staticmethod
    def send_welcome_email(user_email: str, user_name: str) -> bool:
        """Send welcome email to new user"""
        subject = "Welcome to Price Intelligence! 🎉"
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h1 style="color: #3498db;">Welcome to Price Intelligence! 🎉</h1>
                        
                        <p>Hi {user_name},</p>
                        
                        <p>Thank you for joining <strong>Price Intelligence</strong>. We're excited to help you find the best deals and save money on your purchases!</p>
                        
                        <h3 style="color: #2c3e50;">What You Can Do:</h3>
                        <ul>
                            <li>✅ Set price alerts for your favorite products</li>
                            <li>✅ Get AI-powered product recommendations</li>
                            <li>✅ Track prices across multiple platforms</li>
                            <li>✅ Receive instant notifications when prices drop</li>
                            <li>✅ Build your personalized watchlist</li>
                        </ul>
                        
                        <p>Start by exploring the dashboard and setting up your first price alert!</p>
                        
                        <p style="color: #7f8c8d; margin-top: 30px;">
                            Best regards,<br>
                            <strong>Price Intelligence Team</strong>
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return EmailService.send_email(user_email, subject, html_body)
