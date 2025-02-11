import { useLocation } from "react-router-dom";

// Define the type for flowArray if you know the structure
type FlowData = {
  Protocol: string;
  "Flow Bytes/s": number;
  "Source IP": string;
  "Destination IP": string;
  "Spoofed IP": boolean;
};

const Details = () => {
  const location = useLocation();
  const { flowArray } = location.state || {}; // Safely destructure the flowArray from location.state

  return (
    <div className="m-4 p-4">
      <h1 className="text-xl font-semibold mb-4 text-center">Details Page</h1>
      <p className="mb-4">Displaying {flowArray.length} flow(s).</p>

      {flowArray.length === 0 && <p>No data available</p>}
      {flowArray.map((flowData, index) => (
        <>
          <h1 className="font-semibold m-4 text-center">Flow {index + 1}</h1>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">S.No.</th>
                <th className="border border-gray-300 p-2 text-left">
                  Protocol
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Flow Bytes/s
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Source IP
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Destination IP
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Spoofed IP
                </th>
              </tr>
            </thead>
            <tbody>
              {flowData.map((flow: FlowData, index: number) => (
                <tr
                  key={index}
                  className={flow["Spoofed IP"] ? "bg-red-200" : "bg-green-200"}
                >
                  <td className="border border-gray-300 p-2">{index + 1}</td>
                  <td className="border border-gray-300 p-2">
                    {flow.Protocol}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {flow["Flow Bytes/s"]}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {flow["Source IP"]}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {flow["Destination IP"]}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {flow["Spoofed IP"].toString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ))}
    </div>
  );
};

export default Details;
