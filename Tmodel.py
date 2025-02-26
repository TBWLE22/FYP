import pandas as pd
from scapy.all import sniff, IP, TCP, UDP
import time

# List to store packet details
packet_data = []

# Function to process a packet


def process_packet(packet):
    if IP in packet:
        ip_src = packet[IP].src
        ip_dst = packet[IP].dst
        proto = packet[IP].proto
        packet_len = len(packet)
        timestamp = packet.time

        # Forward and backward packet lengths based on the direction
        if packet[IP].src == ip_src:
            fwd = True
            fwd_packet_len = packet_len
            bwd_packet_len = 0
        else:
            fwd = False
            fwd_packet_len = 0
            bwd_packet_len = packet_len

        # TCP/UDP flags (for SYN, ACK, etc.)
        if TCP in packet:
            flags = packet[TCP].flags
        elif UDP in packet:
            flags = packet[UDP].flags
        else:
            flags = None

        packet_data.append({
            'timestamp': timestamp,
            'ip_src': ip_src,
            'ip_dst': ip_dst,
            'proto': proto,
            'packet_len': packet_len,
            'fwd_packet_len': fwd_packet_len,
            'bwd_packet_len': bwd_packet_len,
            'flags': flags
        })


# Sniff packets for a set amount of time or continuously
sniff(prn=process_packet, store=0, timeout=30)  # Adjust timeout as needed

# Convert packet data into DataFrame
df = pd.DataFrame(packet_data)

# Helper function to compute flow statistics


def compute_flow_stats(df):
    df['flow'] = df['ip_src'] + '-' + \
        df['ip_dst'] + '-' + df['proto'].astype(str)

    # Grouping by flow and 10 seconds window (timestamp // 10)
    df['time_window'] = (df['timestamp'] // 10) * 10

    # Aggregating features per flow
    flow_stats = df.groupby(['flow', 'time_window']).agg(
        Flow_Duration=('timestamp', 'max'),
        Total_Fwd_Packets=('fwd_packet_len', 'count'),
        Total_Backward_Packets=('bwd_packet_len', 'count'),
        Fwd_Packets_Length_Total=('fwd_packet_len', 'sum'),
        Bwd_Packets_Length_Total=('bwd_packet_len', 'sum'),
        Fwd_Packet_Length_Max=('fwd_packet_len', 'max'),
        Fwd_Packet_Length_Min=('fwd_packet_len', 'min'),
        Fwd_Packet_Length_Mean=('fwd_packet_len', 'mean'),
        Fwd_Packet_Length_Std=('fwd_packet_len', 'std'),
        Bwd_Packet_Length_Max=('bwd_packet_len', 'max'),
        Bwd_Packet_Length_Min=('bwd_packet_len', 'min'),
        Bwd_Packet_Length_Mean=('bwd_packet_len', 'mean'),
        Bwd_Packet_Length_Std=('bwd_packet_len', 'std'),
        Flow_Bytes_s=('packet_len', 'sum'),
        Flow_Packets_s=('packet_len', 'count'),
        Flow_IAT_Mean=('timestamp', lambda x: x.diff().mean()),
        Flow_IAT_Std=('timestamp', lambda x: x.diff().std()),
        Flow_IAT_Max=('timestamp', lambda x: x.diff().max()),
        Flow_IAT_Min=('timestamp', lambda x: x.diff().min())
    ).reset_index()

    return flow_stats


# Compute flow statistics
flow_statistics = compute_flow_stats(df)

# Print flow statistics
print(flow_statistics)
