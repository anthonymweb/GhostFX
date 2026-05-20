from app.tasks.celery_app import celery_app


@celery_app.task(name="ghostfx.scan_markets")
def scan_markets() -> dict:
    return {"status": "queued", "message": "Use this task hook to run scheduled market scans and alerts."}
