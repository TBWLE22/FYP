import axios from "axios";
import React, { useState, useEffect } from "react";

type FlowData = {
  Protocol: string;
  "Flow Bytes/s": number;
  "Source IP": string;
  "Destination IP": string;
  "Spoofed IP": boolean;
};

type FlowDocument = {
  _id: string;
  data: FlowData[][];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

const FlowHistory = () => {
  const [flowDocuments, setFlowDocuments] = useState<FlowDocument[]>([]);

  const getFlowHistory = async () => {
    try {
      const { data } = await axios.get<{ result: FlowDocument[] }>(
        "http://localhost:9000/api/v1/flows"
      );
      // Assume data.result is an array of documents, each with a "data" array
      setFlowDocuments(data.result);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getFlowHistory();
  }, []);

  // console.log(flowDocuments);

  return (
    <div className="mt-12">
      <strong>Flow History</strong>
      {flowDocuments.length === 0 && <p>No data available</p>}

      {flowDocuments.map((doc, docIndex) => (
        <div key={doc?._id || docIndex} className="mb-8">
          <h2 className="text-xl font-bold mb-2">Document {docIndex + 1}</h2>
          <p className="mb-4">
            Created At: {new Date(doc?.createdAt).toLocaleString()}
          </p>
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
              {doc.data.map((innerArray, outerIndex) => (
                <React.Fragment key={outerIndex}>
                  {/* Optionally, render a header or divider for each inner array */}
                  <tr>
                    <td
                      colSpan={6}
                      className="bg-gray-300 text-center font-bold"
                    >
                      Flow Group {outerIndex + 1}
                    </td>
                  </tr>
                  {innerArray.map((flow, innerIndex) => (
                    <tr
                      key={`${outerIndex}-${innerIndex}`}
                      className={
                        flow["Spoofed IP"] ? "bg-red-200" : "bg-green-200"
                      }
                    >
                      <td className="border border-gray-300 p-2">
                        {innerIndex + 1}
                      </td>
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
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default FlowHistory;
