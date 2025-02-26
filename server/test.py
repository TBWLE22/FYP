import subprocess
def block_ip_windows(ip_address):
    try:
        subprocess.run(["netsh", "advfirewall", "firewall", "add", "rule", "name=BlockIP", "dir=in",
                        "action=block", "remoteip=" + ip_address], check=True)
        print(f"Blocked IP: {ip_address}")
    except subprocess.CalledProcessError as e:
        print(f"Error blocking IP {ip_address}: {e}")

block_ip_windows("192.168.1.100")