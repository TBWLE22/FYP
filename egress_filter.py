from scapy.all import sniff, IP
def egress_filter(packet):
    if IP in packet:
        src_ip = packet[IP].src
        #Define network's IP range
        local_ip_range = "192.168.1.0/24"
        if not src_ip.startswith("192.168."):
            print(f"Blocking outgoing packet with spoofed : {src_ip}")
            return False #Block the packet
        return True #Allow the packet
# Capture packets and apply the egress filter
def monitor_outgoing_traffic():
    sniff(filter="ip", prn=egress_filter, store=0, iface='Wi-Fi')
monitor_outgoing_traffic()