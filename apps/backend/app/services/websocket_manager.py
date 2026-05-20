from collections import defaultdict

from fastapi import WebSocket


class WebSocketManager:
    def __init__(self) -> None:
        self.connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, room: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections[room].append(websocket)

    def disconnect(self, room: str, websocket: WebSocket) -> None:
        if websocket in self.connections.get(room, []):
            self.connections[room].remove(websocket)

    async def broadcast(self, room: str, payload: dict) -> None:
        for socket in list(self.connections.get(room, [])):
            await socket.send_json(payload)


websocket_manager = WebSocketManager()
