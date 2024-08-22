from scapy.all import sniff, IP
import logging
# Set up logging
logging.basicConfig(filename='packet_log.txt',level=logging.INFO)
def log_packet(packet):
    if IP in packet:
        src_ip = packet[IP].src
        dst_ip = packet[IP].dst
        logging.info(f"Packet from {src_ip} to {dst_ip}") 
#Start packet capure and logging
sniff(filter="ip", prn=log_packet, store=0)
        