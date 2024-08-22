from scapy.all import sniff, IP
def ingress_filter(packet):
    if IP in packet:
        src_ip = packet[IP].src
        # Define network's valid IP range
        valid_ip_range = "192.168.1.0/24"
        if not packet[IP].src.startswith("192.168."):
            print(f"Dropping spoofed packet from {src_ip}")
            return False
        return True
def capture_packets():
    sniff(filter= 'ip', prn= ingress_filter, store = 0)
capture_packets()
