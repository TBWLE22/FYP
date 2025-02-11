import { useEffect, useState } from "react";
import "../styles/Data.css";

type Packet = {
  "Source IP": string;
  "Destination IP": string;
  "Spoofed IP"?: boolean;
  "Flow Bytes/s": number;
};

type DataProps = {
  isWebSocketActive: boolean;
  // setPacketLength: number;
};

const Data = ({
  isWebSocketActive,
  setPacketLength,
  setFlowArray,
}: DataProps) => {
  const [packets, setPackets] = useState<Packet[]>([]);

  useEffect(() => {
    let ws: WebSocket | null = null;

    if (isWebSocketActive) {
      ws = new WebSocket("ws://127.0.0.1:8000/ws");

      ws.onopen = () => {
        console.log("Connected to the WebSocket server");
      };
      ws.onmessage = function (event) {
        try {
          const packetData = JSON.parse(event.data);
          setPackets(packetData);
          // append the packet data to the flowArray
          setFlowArray((prev) => [...prev, packetData]);
          setPacketLength(packetData.length);
        } catch (err) {
          console.log(err);
        }
      };
      ws.onclose = () => console.log("WebSocket connection closed");

      // Clean up the WebSocket connection when isWebSocketActive changes
      return () => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.close();
          console.log("WebSocket closed after filter complete");
        }
      };
    }

    // If not active, just return to avoid trying to use ws
    return () => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.close();
        console.log("WebSocket connection closed");
      }
    };
  }, [isWebSocketActive, setPacketLength]);

  console.log({ packets });

  // Map the packets to display them as live comments
  const packetList = packets.map((packet, index) => (
    <div
      key={index}
      className={`packet-item ${
        packet["Spoofed IP"] === false ? "bg-green-200 " : "bg-red-200"
      }`}
    >
      <p>
        <strong>Source IP:</strong> {packet["Source IP"]}
      </p>
      <p>
        <strong>Destination IP:</strong> {packet["Destination IP"]}
      </p>
      <p>
        <strong>Spoofed IP:</strong> {packet["Spoofed IP"]?.toString()}
      </p>
      <p>
        <strong>Flow Bytes/s:</strong> {packet["Flow Bytes/s"]}
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
