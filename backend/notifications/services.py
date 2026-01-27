from datetime import date
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .models import Notification
from warranties.models import Warranty


def get_notification_message(notification_type, warranty):
    """Generate notification title and message based on type."""
    messages = {
        '30_days': {
            'title': f'⚠️ Warranty Expiring Soon - {warranty.product_name}',
            'message': f'Your warranty for {warranty.product_name} ({warranty.brand}) will expire in 30 days on {warranty.expiry_date.strftime("%B %d, %Y")}. Please take necessary action if needed.'
        },
        '20_days': {
            'title': f'⚠️ Warranty Alert - {warranty.product_name}',
            'message': f'Only 20 days left! Your warranty for {warranty.product_name} ({warranty.brand}) expires on {warranty.expiry_date.strftime("%B %d, %Y")}.'
        },
        '10_days': {
            'title': f'⚠️ Warranty Expiring - {warranty.product_name}',
            'message': f'Just 10 days remaining! Your warranty for {warranty.product_name} ({warranty.brand}) expires on {warranty.expiry_date.strftime("%B %d, %Y")}.'
        },
        '3_days': {
            'title': f'🚨 Urgent: Warranty Expiring - {warranty.product_name}',
            'message': f'Only 3 days left! Your warranty for {warranty.product_name} ({warranty.brand}) expires on {warranty.expiry_date.strftime("%B %d, %Y")}. Act now!'
        },
        '2_days': {
            'title': f'🚨 Urgent: 2 Days Left - {warranty.product_name}',
            'message': f'Your warranty for {warranty.product_name} ({warranty.brand}) expires in 2 days on {warranty.expiry_date.strftime("%B %d, %Y")}.'
        },
        '1_day': {
            'title': f'🚨 Last Day: Warranty Expires Tomorrow - {warranty.product_name}',
            'message': f'Final reminder! Your warranty for {warranty.product_name} ({warranty.brand}) expires tomorrow on {warranty.expiry_date.strftime("%B %d, %Y")}.'
        },
        'expired': {
            'title': f'❌ Warranty Expired - {warranty.product_name}',
            'message': f'Your warranty for {warranty.product_name} ({warranty.brand}) has expired as of {warranty.expiry_date.strftime("%B %d, %Y")}.'
        },
    }
    return messages.get(notification_type, {
        'title': 'Warranty Alert',
        'message': 'Please check your warranty.'
    })


def create_notification(user, warranty, notification_type):
    """Create in-app notification."""
    msg = get_notification_message(notification_type, warranty)
    
    notification = Notification.objects.create(
        user=user,
        warranty=warranty,
        notification_type=notification_type,
        title=msg['title'],
        message=msg['message']
    )
    return notification


def send_email_notification(notification):
    """Send email notification to user."""
    try:
        subject = notification.title
        warranty = notification.warranty
        
        # Plain text message
        plain_message = notification.message
        
        # HTML message
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .warranty-details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }}
                .detail-row {{ margin: 10px 0; }}
                .label {{ font-weight: bold; color: #1f2937; }}
                .value {{ color: #4b5563; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🛡️ Warranty Vault</h1>
                    <p>Warranty Expiry Notification</p>
                </div>
                <div class="content">
                    <h2>{notification.title}</h2>
                    <p>{notification.message}</p>
                    
                    <div class="warranty-details">
                        <h3>Warranty Details:</h3>
                        <div class="detail-row">
                            <span class="label">Product:</span>
                            <span class="value">{warranty.product_name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Brand:</span>
                            <span class="value">{warranty.brand}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Category:</span>
                            <span class="value">{warranty.category}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Purchase Date:</span>
                            <span class="value">{warranty.purchase_date.strftime("%B %d, %Y")}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Expiry Date:</span>
                            <span class="value">{warranty.expiry_date.strftime("%B %d, %Y")}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Days Remaining:</span>
                            <span class="value">{warranty.days_remaining} days</span>
                        </div>
                    </div>
                    
                    <p>Login to your Warranty Vault account to view all your warranties and take necessary action.</p>
                </div>
                <div class="footer">
                    <p>This is an automated notification from Warranty Vault.</p>
                    <p>© 2026 Warranty Vault. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[notification.user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        notification.email_sent = True
        notification.save()
        return True
    except Exception as e:
        print(f"Failed to send email to {notification.user.email}: {e}")
        return False


def check_warranties_and_notify():
    """Main function to check warranties and create notifications."""
    today = date.today()
    notifications_created = 0
    emails_sent = 0
    
    # Get all active warranties
    for warranty in Warranty.objects.filter(expiry_date__gte=today):
        days_remaining = (warranty.expiry_date - today).days
        
        notification_type = None
        
        # Determine notification type based on days remaining
        if days_remaining == 30:
            notification_type = '30_days'
        elif days_remaining == 20:
            notification_type = '20_days'
        elif days_remaining == 10:
            notification_type = '10_days'
        elif days_remaining == 3:
            notification_type = '3_days'
        elif days_remaining == 2:
            notification_type = '2_days'
        elif days_remaining == 1:
            notification_type = '1_day'
        elif days_remaining == 0:
            notification_type = 'expired'
        
        if notification_type:
            # Check if notification already exists
            existing = Notification.objects.filter(
                warranty=warranty,
                notification_type=notification_type
            ).exists()
            
            if not existing:
                # Create in-app notification
                notification = create_notification(
                    warranty.user,
                    warranty,
                    notification_type
                )
                notifications_created += 1
                
                # Send email
                if send_email_notification(notification):
                    emails_sent += 1
    
    return {
        'notifications_created': notifications_created,
        'emails_sent': emails_sent
    }
