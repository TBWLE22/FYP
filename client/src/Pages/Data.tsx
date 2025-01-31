import { useEffect, useState } from "react";
import "../styles/Data.css";

type Packet = {
  src: string;
  dst: string;
  spoofed: boolean;
};

type DataProps = {
  isWebSocketActive: boolean;
};

const Data = ({ isWebSocketActive }: DataProps) => {
  const [packets, setPackets] = useState<Packet[]>([]);

  useEffect(() => {
    let ws: WebSocket | null = null;

    if (isWebSocketActive) {
      ws = new WebSocket("ws://127.0.0.1:8000/ws");

      ws.onopen = () => {
        console.log("Connected to the WebSocket server");
      };
      ws.onmessage = function (event) {
        const packetData = JSON.parse(event.data);
        console.log({ packetData });
        try {
          // Append new packet data at the beginning of the state array
          setPackets((prevPackets) =>
            [...prevPackets, packetData].slice(0, 50)
          );
        } catch (err) {
          console.log(err);
        }
      };

      // Clean up the WebSocket connection when isWebSocketActive changes
      return () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
          console.log("WebSocket closed after filter complete");
        }
      };
    }

    // If not active, just return to avoid trying to use ws
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
        console.log("WebSocket connection closed");
      }
    };
  }, [isWebSocketActive]);

  console.log({ packets });

  // Map the packets to display them as live comments
  const packetList = packets.map((packet, index) => (
    <div key={index} className="packet-item">
      <p>
        <strong>Source IP:</strong> {packet.src}
      </p>
      <p>
        <strong>Destination IP:</strong> {packet.dst}
      </p>
      <p>
        <strong>Spoofed:</strong> {packet.spoofed ? "Yes" : "No"}
      </p>
    </div>
  ));

  return (
    <div className="packet-container">
      <h1 className="my-4 text-gray-900 sm:text-xl">Live Packet Feed</h1>
      <div className="packet-feed">{packetList}</div>
    </div>
  );
};

export default Data;
