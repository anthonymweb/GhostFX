from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.websocket_manager import websocket_manager


router = APIRouter(tags=["websocket"])


@router.websocket("/ws/agent")
async def agent_ws(websocket: WebSocket) -> None:
    room = websocket.query_params.get("room", "global")
    await websocket_manager.connect(room, websocket)
    try:
        while True:
            payload = await websocket.receive_json()
            await websocket_manager.broadcast(room, {"type": "message", "payload": payload})
    except WebSocketDisconnect:
        websocket_manager.disconnect(room, websocket)
