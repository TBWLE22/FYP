from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from scapy.all import sniff
from scapy.layers.inet import IP
import asyncio
import threading
from queue import Queue

app = FastAPI()
spoofed_ip_count = 0
packet_queue = Queue()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/hello")
def get_spoofed_ip_count():
    return {"spoofed_ip_count": spoofed_ip_count}


def is_spoofed(ip):
    private_ips = ["10.", "172.", "192.168."]
    return any(ip.startswith(prefix) for prefix in private_ips)


def packet_sniffer_callback(packet):
    global spoofed_ip_count
    if IP in packet:
        packet_info = {
            "src": packet[IP].src,
            "dst": packet[IP].dst,
            "spoofed": is_spoofed(packet[IP].src)
        }
        if packet_info["spoofed"]:
            spoofed_ip_count += 1
        packet_queue.put(packet_info)


def start_packet_sniffing():
    sniff(prn=packet_sniffer_callback, store=False)


sniffer_thread = threading.Thread(target=start_packet_sniffing, daemon=True)
sniffer_thread.start()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            if not packet_queue.empty():
                packet_info = packet_queue.get()
                await websocket.send_json(packet_info)
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except asyncio.CancelledError:
        print("WebSocket task was cancelled")
    except Exception as e:
        print(f"WebSocket connection error: {e}")
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
