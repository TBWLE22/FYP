from fastapi import FastAPI, WebSocket
from scapy.all import sniff
from scapy.layers.inet import IP
import asyncio
from queue import Queue

app = FastAPI()
spoofed_ip_count = 0
packet_queue = Queue()


def is_spoofed(ip):
    private_ips = ["10.", "172.", "192.168."]
    return any(ip.startswith(prefix) for prefix in private_ips)


def packet_sniffer_callback(packet):
    if IP in packet:
        packet_info = {
            "src": packet[IP].src,
            "dst": packet[IP].dst,
        }
        if is_spoofed(packet[IP].src):
            packet_info["spoofed"] = True
        else:
            packet_info["spoofed"] = False
        packet_queue.put(packet_info)


def start_packet_sniffing():
    sniff(prn=packet_sniffer_callback, store=False)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        loop = asyncio.get_event_loop()
        loop.run_in_executor(None, start_packet_sniffing)

        while True:
            if not packet_queue.empty():
                packet_info = packet_queue.get()
                await websocket.send_json(packet_info)
    except Exception as e:
        print(f"WebSocket connection closed: {e}")
    finally:
        await websocket.close()
