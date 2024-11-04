from fastapi import FastAPI, WebSocket
from scapy.all import sniff
from scapy.layers.inet import IP
import asyncio
from queue import Queue

app = FastAPI()
spoofed_ip_count = 0
packet_queue = Queue()

# Check for spoofed IPs (can be enhanced with more complex logic)


def is_spoofed(ip):
    private_ips = ["10.", "172.", "192.168."]
    return any(ip.startswith(prefix) for prefix in private_ips)

# Scapy packet callback (synchronous)


def packet_sniffer_callback(packet):
    if IP in packet:
        packet_info = {
            "src": packet[IP].src,
            "dst": packet[IP].dst,
        }
        print(packet)
        # Check for spoofed IPs
        if is_spoofed(packet[IP].src):
            packet_info["spoofed"] = True
        else:
            packet_info["spoofed"] = False

        # Place the packet into the queue to be sent via WebSocket
        packet_queue.put(packet_info)

# Start packet sniffing in a separate thread


def start_packet_sniffing():
    sniff(prn=packet_sniffer_callback, store=False)

# WebSocket handler (asynchronous)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # Start the packet sniffing in a background thread
        loop = asyncio.get_event_loop()
        loop.run_in_executor(None, start_packet_sniffing)

        while True:
            # Check if there are packets in the queue
            if not packet_queue.empty():
                packet_info = packet_queue.get()
                # Send packet data to WebSocket
                await websocket.send_json(packet_info)
    except Exception as e:
        print(f"WebSocket connection closed: {e}")
    finally:
        await websocket.close()
