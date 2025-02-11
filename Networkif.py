from scapy.all import *
from collections import defaultdict
import time
import threading
import numpy as np

flows = defaultdict(lambda: {'start_time': None, 'packets': [
], 'bytes': 0, 'tcp_flags': defaultdict(int)})


def reset_and_feed():
    global flows
    while True:
        time.sleep(10)
        calculate_stats_and_feed_to_model(flows)
        flows = defaultdict(lambda: {'start_time': None, 'packets': [
        ], 'bytes': 0, 'tcp_flags': defaultdict(int)})  # Reset state


def calculate_stats_and_feed_to_model(flows):
    for flow_key, flow_data in flows.items():

        src_ip, dst_ip, src_port, dst_port = flow_key
        packets = flow_data['packets']
        bytes_sent = flow_data['bytes']
        tcp_flags = flow_data['tcp_flags']

        flow_duration = packets[-1].time - packets[0].time

        packet_lengths = [len(packet) for packet in packets]
        packet_length_min = np.min(packet_lengths)
        packet_length_max = np.max(packet_lengths)
        packet_length_mean = np.mean(packet_lengths)
        packet_length_std = np.std(packet_lengths)
        packet_length_variance = np.var(packet_lengths)

        # IAT (Inter-arrival time statistics)
        if len(packets) > 1:  # Only calculate IAT if there are at least two packets
            iat = [packets[i].time - packets[i -
                                             1].time for i in range(1, len(packets))]
            flow_iat_mean = np.mean(iat)
            flow_iat_std = np.std(iat)
            flow_iat_max = np.max(iat) if len(
                iat) > 0 else 0  # Ensure max is safe
            flow_iat_min = np.min(iat) if len(
                iat) > 0 else 0  # Ensure min is safe
        else:
            # If there are fewer than 2 packets, set IAT stats to 0
            flow_iat_mean = flow_iat_std = flow_iat_max = flow_iat_min = 0

        # TCP Flag Counts
        syn_count = tcp_flags['S']
        ack_count = tcp_flags['A']
        fin_count = tcp_flags['F']
        rst_count = tcp_flags['R']
        psh_count = tcp_flags['P']
        urg_count = tcp_flags['U']

        # Feed stats to your ML model
        features = {
            'Protocol': 'TCP',
            'Flow Duration': flow_duration,
            'Total Fwd Packets': len([pkt for pkt in packets if pkt[IP].src == src_ip]),
            'Total Backward Packets': len([pkt for pkt in packets if pkt[IP].dst == dst_ip]),
            'Fwd Packets Length Total': np.sum([len(pkt) for pkt in packets if pkt[IP].src == src_ip]),
            'Bwd Packets Length Total': np.sum([len(pkt) for pkt in packets if pkt[IP].dst == dst_ip]),
            'Fwd Packet Length Max': packet_length_max,
            'Fwd Packet Length Min': packet_length_min,
            'Fwd Packet Length Mean': packet_length_mean,
            'Fwd Packet Length Std': packet_length_std,
            'Flow Bytes/s': bytes_sent / flow_duration if flow_duration > 0 else 0,
            'Flow Packets/s': len(packets) / flow_duration if flow_duration > 0 else 0,
            'Flow IAT Mean': flow_iat_mean,
            'Flow IAT Std': flow_iat_std,
            'Flow IAT Max': flow_iat_max,
            'Flow IAT Min': flow_iat_min,
            'FIN Flag Count': fin_count,
            'SYN Flag Count': syn_count,
            'RST Flag Count': rst_count,
            'PSH Flag Count': psh_count,
            'ACK Flag Count': ack_count,
            'URG Flag Count': urg_count,
            # Adjust if needed
            'Down/Up Ratio': (flow_data['bytes'] / flow_data['bytes']) if flow_data['bytes'] else 0,
            'Avg Packet Size': np.mean(packet_lengths),
            'Label': 0  # Adjust based on detection model output
        }

        # For example, print the features (or send to model)
        print(features)
        # Here you could feed these features to your ML model for classification

# Function to process packets


def packet_handler(packet):
    if packet.haslayer(IP):
        src_ip = packet[IP].src
        dst_ip = packet[IP].dst
        # Track flow based on IP & Port
        flow_key = (src_ip, dst_ip, packet.sport, packet.dport)

        # Update flow state
        if flow_key not in flows:
            # Set start time on first packet
            flows[flow_key]['start_time'] = packet.time
        flows[flow_key]['packets'].append(packet)
        flows[flow_key]['bytes'] += len(packet)  # Accumulate bytes
        if packet.haslayer(TCP):
            for flag in ['S', 'A', 'F', 'R', 'P', 'U']:  # TCP flags
                if flag in packet[TCP].flags:
                    flows[flow_key]['tcp_flags'][flag] += 1


# Start capturing packets and reset every minute
if __name__ == "__main__":
    # Start the timer thread to reset and feed stats every minute
    timer_thread = threading.Thread(target=reset_and_feed)
    timer_thread.daemon = True
    timer_thread.start()

    # Start sniffing packets in the background
    # You can filter more specifically based on your needs
    sniff(prn=packet_handler, store=0, filter="ip")
