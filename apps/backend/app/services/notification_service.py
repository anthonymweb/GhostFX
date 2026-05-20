from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.models.user import User


class NotificationService:
    async def create(self, db: AsyncSession, user: User, channel: str, title: str, body: str, metadata: dict | None = None) -> Notification:
        notification = Notification(
            user_id=user.id,
            channel=channel,
            title=title,
            body=body,
            sent=channel == "in_app",
            metadata_json=metadata or {},
        )
        db.add(notification)
        await db.commit()
        await db.refresh(notification)
        return notification
