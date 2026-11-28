from sqlalchemy.orm import Session
from app.models.user import User, Role, Notification
from app.models.audit import AuditLog

def notify_admin(db: Session, title: str, message: str, category: str = "admin_alert", link: str = "/admin"):
    """
    Broadcasts an important operational notification to all Administrator accounts.
    """
    try:
        admins = db.query(User).join(Role).filter(Role.name == "Administrator").all()
        for admin in admins:
            notif = Notification(
                user_id=admin.id,
                title=title,
                message=message,
                category=category,
                link=link
            )
            db.add(notif)
        db.commit()
    except Exception as e:
        print(f"Failed to notify admin: {e}")

def notify_user(db: Session, user_id: str, title: str, message: str, category: str = "info", link: str = "/dashboard"):
    """
    Sends a targeted notification to an entrepreneur/client account.
    """
    try:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            category=category,
            link=link
        )
        db.add(notif)
        db.commit()
    except Exception as e:
        print(f"Failed to notify user: {e}")
