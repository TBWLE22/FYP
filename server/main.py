from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from scapy.all import sniff, IP, TCP, UDP
import asyncio
import threading
from queue import Queue
from collections import defaultdict
import pandas as pd
import numpy as np
from xgboost import XGBClassifier
import subprocess
import socket

model = XGBClassifier()
model.load_model('xgboost_model.json')

app = FastAPI()
spoofed_ip_count = 0
flow_count = 0
packet_queue = Queue()

spoofed = []


def check_spoofed_ip(flow):
    global spoofed_ip_count, flow_count
    flow.drop(["Source IP", "Destination IP"], inplace=True, axis=1)
    preds = model.predict(flow)
    print(preds)
    spoofed_ip_count += sum(preds)
    flow_count += len(flow)
    return preds


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

flows = defaultdict(lambda: {
    'timestamps': [],
    'Total Fwd Packets': 0,
    'Total Backward Packets': 0,
    'Fwd Packets Length Total': 0,
    'Bwd Packets Length Total': 0,
    'Fwd Packet Lengths': [],
    'Bwd Packet Lengths': [],
    'Fwd IAT': [],
    'Bwd IAT': [],
    'Start Time': None,
    'End Time': None,
    'Protocol': None,
    'Source IP': None,
    'Destination IP': None
})


def process_packet(packet):
    if IP in packet:
        src_ip = packet[IP].src
        dst_ip = packet[IP].dst
        protocol = packet[IP].proto
        src_port = None
        dst_port = None

        if TCP in packet:
            src_port = packet[TCP].sport
            dst_port = packet[TCP].dport
        elif UDP in packet:
            src_port = packet[UDP].sport
            dst_port = packet[UDP].dport

        flow_key = (src_ip, dst_ip, src_port, dst_port, protocol)

        flows[flow_key]['timestamps'].append(packet.time)
        flows[flow_key]['Protocol'] = protocol
        flows[flow_key]['Source IP'] = src_ip
        flows[flow_key]['Destination IP'] = dst_ip

        if flows[flow_key]['Start Time'] is None:
            flows[flow_key]['Start Time'] = packet.time
        flows[flow_key]['End Time'] = packet.time

        packet_length = len(packet)
        if src_ip == flow_key[0]:
            flows[flow_key]['Total Fwd Packets'] += 1
            flows[flow_key]['Fwd Packets Length Total'] += packet_length
            flows[flow_key]['Fwd Packet Lengths'].append(packet_length)
            if len(flows[flow_key]['Fwd Packet Lengths']) > 1:
                flows[flow_key]['Fwd IAT'].append(
                    packet.time - flows[flow_key]['timestamps'][-2])
        else:
            flows[flow_key]['Total Backward Packets'] += 1
            flows[flow_key]['Bwd Packets Length Total'] += packet_length
            flows[flow_key]['Bwd Packet Lengths'].append(packet_length)
            if len(flows[flow_key]['Bwd Packet Lengths']) > 1:
                flows[flow_key]['Bwd IAT'].append(
                    packet.time - flows[flow_key]['timestamps'][-2])


def is_spoofed(ip):
    private_ips = ["10.", "172.", "192.168."]
    return any(ip.startswith(prefix) for prefix in private_ips)


def start_packet_sniffing():
    sniff(prn=process_packet, store=False)


sniffer_thread = threading.Thread(target=start_packet_sniffing, daemon=True)
sniffer_thread.start()


async def send_flow_data(websocket):
    while True:
        await asyncio.sleep(10)
        flow_data = []
        for flow_key, flow_info in flows.items():
            if len(flow_info['timestamps']) == 0:
                continue

            flow_duration = flow_info['End Time'] - flow_info['Start Time']

            fwd_packet_length_max = max(
                flow_info['Fwd Packet Lengths'], default=0)
            fwd_packet_length_min = min(
                flow_info['Fwd Packet Lengths'], default=0)
            fwd_packet_length_mean = np.mean(
                flow_info['Fwd Packet Lengths']) if flow_info['Fwd Packet Lengths'] else 0
            fwd_packet_length_std = np.std(
                flow_info['Fwd Packet Lengths']) if flow_info['Fwd Packet Lengths'] else 0

            bwd_packet_length_max = max(
                flow_info['Bwd Packet Lengths'], default=0)
            bwd_packet_length_min = min(
                flow_info['Bwd Packet Lengths'], default=0)
            bwd_packet_length_mean = np.mean(
                flow_info['Bwd Packet Lengths']) if flow_info['Bwd Packet Lengths'] else 0
            bwd_packet_length_std = np.std(
                flow_info['Bwd Packet Lengths']) if flow_info['Bwd Packet Lengths'] else 0

            fwd_iat_mean = np.mean(
                flow_info['Fwd IAT']) if flow_info['Fwd IAT'] else 0
            fwd_iat_std = np.std(
                flow_info['Fwd IAT']) if flow_info['Fwd IAT'] else 0
            fwd_iat_max = max(flow_info['Fwd IAT'], default=0)
            fwd_iat_min = min(flow_info['Fwd IAT'], default=0)

            bwd_iat_mean = np.mean(
                flow_info['Bwd IAT']) if flow_info['Bwd IAT'] else 0
            bwd_iat_std = np.std(
                flow_info['Bwd IAT']) if flow_info['Bwd IAT'] else 0
            bwd_iat_max = max(flow_info['Bwd IAT'], default=0)
            bwd_iat_min = min(flow_info['Bwd IAT'], default=0)

            flow_bytes_per_sec = (flow_info['Fwd Packets Length Total'] +
                                  flow_info['Bwd Packets Length Total']) / flow_duration if flow_duration > 0 else 0
            flow_packets_per_sec = (
                flow_info['Total Fwd Packets'] + flow_info['Total Backward Packets']) / flow_duration if flow_duration > 0 else 0

            flow_data.append({
                'Protocol': flow_info['Protocol'],
                'Flow Duration': flow_duration,
                'Total Fwd Packets': flow_info['Total Fwd Packets'],
                'Total Backward Packets': flow_info['Total Backward Packets'],
                'Fwd Packets Length Total': flow_info['Fwd Packets Length Total'],
                'Bwd Packets Length Total': flow_info['Bwd Packets Length Total'],
                'Fwd Packet Length Max': fwd_packet_length_max,
                'Fwd Packet Length Min': fwd_packet_length_min,
                'Fwd Packet Length Mean': fwd_packet_length_mean,
                'Fwd Packet Length Std': fwd_packet_length_std,
                'Bwd Packet Length Max': bwd_packet_length_max,
                'Bwd Packet Length Min': bwd_packet_length_min,
                'Bwd Packet Length Mean': bwd_packet_length_mean,
                'Bwd Packet Length Std': bwd_packet_length_std,
                'Flow Bytes/s': flow_bytes_per_sec,
                'Flow Packets/s': flow_packets_per_sec,
                'Fwd IAT Mean': fwd_iat_mean,
                'Fwd IAT Std': fwd_iat_std,
                'Fwd IAT Max': fwd_iat_max,
                'Fwd IAT Min': fwd_iat_min,
                'Bwd IAT Mean': bwd_iat_mean,
                'Bwd IAT Std': bwd_iat_std,
                'Bwd IAT Max': bwd_iat_max,
                'Bwd IAT Min': bwd_iat_min,
                'Source IP': flow_info['Source IP'],
                'Destination IP': flow_info['Destination IP']
            })

        flow_df = pd.DataFrame(flow_data)

        hostname = socket.gethostname()
        private_ip = socket.gethostbyname(hostname)

        flow_df = flow_df[flow_df['Source IP'] != private_ip]

        test = check_spoofed_ip(flow_df.copy())

        flow_df['Spoofed IP'] = test

        flow_df['Spoofed IP'] = flow_df['Spoofed IP'].apply(
            lambda x: True if x == 1 else False)

        global spoofed
        flow_df[flow_df["Spoofed IP"] == True]["Source IP"].apply(
            lambda x: spoofed.append(x))

        await websocket.send_json(flow_df.to_dict(orient='records'))

        flows.clear()
        flow_data.clear()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        await send_flow_data(websocket)
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


@app.get("/count")
async def get_counts():
    global spoofed_ip_count
    global flow_count
    global spoofed
    block_ips(spoofed)
    spoofed_ips = list(set(spoofed))
    return {'spoofed_flow_count': int(spoofed_ip_count), 'flows_analyzed': int(flow_count), 'spoofed_ips': spoofed_ips}


def block_ips(ips):
    ips = list(set(ips))
    for ip in ips:
        try:
            subprocess.run(["netsh", "advfirewall", "firewall", "add", "rule", "name=BlockIPIDPF", "dir=in",
                            "action=block", "remoteip=" + ip], check=True)
            print(f"Blocked IP: {ip}")
        except subprocess.CalledProcessError as e:
            print(f"Error blocking IP {ip}: {e}")
