import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from core.config import settings
from models.order import Order

def send_email(to_email: str, subject: str, html_content: str):
    if not settings.SMTP_PASSWORD:
        print("SMTP_PASSWORD not configured. Skipping email send.")
        return

    msg = MIMEMultipart()
    msg['From'] = f"Mother's Love <{settings.SMTP_USER}>"
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(html_content, 'html'))

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"Email sent successfully to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")

def send_order_confirmation_email(order: Order):
    if not order.shipping_email:
        return
        
    subject = f"Order Confirmation - Mother's Love (#{str(order.id)[:8]})"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #2D3329;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #A96142;">Thank you for your order!</h2>
                <p>Hi {order.shipping_name},</p>
                <p>We've received your payment and your order is now being processed. We will notify you once it ships.</p>
                
                <h3>Order Summary:</h3>
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Total Amount:</strong> ₹{order.total_amount}</p>
                <p><strong>Status:</strong> Processing</p>
                
                <h3>Shipping Details:</h3>
                <p>{order.shipping_name}<br>
                {order.shipping_flat}, {order.shipping_street}<br>
                {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
                
                <p style="margin-top: 30px;">Thank you for shopping with Mother's Love!</p>
            </div>
        </body>
    </html>
    """
    
    send_email(order.shipping_email, subject, html_content)


def send_order_status_email(order: Order):
    if not order.shipping_email:
        return
        
    subject = f"Order Status Update - Mother's Love (#{str(order.id)[:8]})"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #2D3329;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #A96142;">Order Status Update</h2>
                <p>Hi {order.shipping_name},</p>
                <p>Your order status has been updated to: <strong>{order.status.value.upper()}</strong></p>
                
                <p><strong>Order ID:</strong> {order.id}</p>
                
                <p style="margin-top: 30px;">If you have any questions, feel free to reply to this email.</p>
                <p>Thank you,<br>Mother's Love</p>
            </div>
        </body>
    </html>
    """
    
    send_email(order.shipping_email, subject, html_content)
