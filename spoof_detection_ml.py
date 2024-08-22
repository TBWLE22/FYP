import joblib
from sklearn.ensemble import RandomForestClassifier

#Loading pre-trained model
model = joblib.load('spoof_detection_model.pkl')
def ml_based_spoof_detection(packet):
    if IP in packet:
        src_ip=packet[IP].src
        #Extract features from the packet
        features = extract_features(packet)
        #Predict spoofing
        is_spoofed = model.predict([features])[0]
        if is_spoofed:
            print(f"Detected spoofed packet from {src_ip} using ML")
            #Take action: drop, log, alert, etc.
def extract_features(packet):
    #Extract relevant fetures for ML model
    return [
        len(packet),
        packet[IP].ttl,
        packet[IP].proto,
    ]