import { useNavigate } from "react-router-dom";
import { useDataContext } from "../context/DataContext";
import { useState, useEffect } from "react";
import { Spinner } from "@material-tailwind/react";
import Data from "./Data";
import axios from "axios";

const Dashboard = () => {
  const {
    isData,
    setIsData,
    flowsAnalyzed,
    setFlowsAnalyzed,
    spoofedFlowCount,
    setSpoofedFlowCount,
    packetLength,
    setPacketLength,
    flowArray,
    setFlowArray,
  } = useDataContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWebSocketActive, setIsWebSocketActive] = useState(false);
  const [spoofedIps, setSpoofedIps] = useState([]);

  const navigate = useNavigate();

  const getFlowAnalysis = async () => {
    const {
      data: { flows_analyzed, spoofed_flow_count, spoofed_ips },
    } = await axios.get("http://127.0.0.1:8000/count");
    setFlowsAnalyzed(flows_analyzed);
    setSpoofedFlowCount(spoofed_flow_count);
    setSpoofedIps(spoofed_ips);
  };

  useEffect(() => {
    // Start the WebSocket connection when isProcessing is true
    if (isProcessing) {
      setIsWebSocketActive(true);
    } else {
      setIsWebSocketActive(false);
    }
  }, [isProcessing]);

  return (
    <div className="flex flex-col mt-12">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 ">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            IP Spoofing Detection
          </h2>
          <p className="mt-4 text-gray-500 sm:text-xl">
            This dashboard provides real-time analysis of network traffic,
            helping you to detect IP spoofing attempts. Keep track of the number
            of flows analyzed and the number of spoofed flows detected to ensure
            network security.
          </p>
        </div>
        {spoofedIps.length > 0 && (
          <div className="flex flex-col rounded-lg border border-gray-100 px-4 py-8 text-center mt-5">
            <h1 className="text-xl ">The following IPs have been blocked</h1>
            {spoofedIps.map((ip) => (
              <p key={ip}>{ip}</p>
            ))}
          </div>
        )}
        <dl className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
          <div
            className="flex flex-col rounded-lg border border-gray-100 px-4 py-8 text-center hover:cursor-pointer hover:bg-gray-50"
            onClick={() => {
              if (isData) navigate("/flowAnalysis");
              else alert("Please Detect First");
            }}
          >
            {isProcessing ? (
              <div className="flex justify-center align-center">
                <Spinner color="blue" className="h-16 w-16" />
              </div>
            ) : (
              <>
                <dt className="order-last text-lg font-medium text-gray-500">
                  Total Number of Packets Analyzed
                </dt>
                <dd className="text-4xl font-extrabold text-blue-600 md:text-5xl">
                  {isData ? <p>{flowsAnalyzed}</p> : <p>0</p>}
                </dd>
              </>
            )}
          </div>
          <div className="flex flex-col rounded-lg border border-gray-100 px-4 py-8 text-center">
            <dt className="order-last text-lg font-medium text-gray-500">
              Total Number of Packets in{" "}
              {isData ? <strong>Last</strong> : <strong>Current</strong>} Flow
            </dt>
            <dd className="text-4xl font-extrabold text-blue-600 md:text-5xl">
              <p>{packetLength}</p>
            </dd>
          </div>
          <div
            className="flex flex-col rounded-lg border border-gray-100 px-4 py-8 text-center hover:cursor-pointer hover:bg-gray-50"
            onClick={() => {
              if (isData) navigate("/spoofed");
              else alert("Please Detect First");
            }}
          >
            {isProcessing ? (
              <div className="flex justify-center align-center">
                <Spinner color="blue" className="h-16 w-16" />
              </div>
            ) : (
              <>
                {" "}
                <dt className="order-last text-lg font-medium text-gray-500">
                  Spoofed Packets Detected
                </dt>
                <dd className="text-4xl font-extrabold text-red-600 md:text-5xl">
                  {isData ? <p>{spoofedFlowCount}</p> : <p>0</p>}
                </dd>
              </>
            )}
          </div>
        </dl>
      </div>
      {isProcessing && (
        <Data
          isWebSocketActive={isWebSocketActive}
          setPacketLength={setPacketLength}
          setFlowArray={setFlowArray}
        />
      )}
      {/* <Data /> */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-screen-xl px-4 py-10 lg:flex lg:h-full lg:items-center">
          <div className="mx-auto max-w-l text-center">
            <h1 className="text-3xl font-extrabold sm:text-5xl">
              Inter Domain Packet Filtering
            </h1>

            <p className="mt-4 sm:text-xl/relaxed">
              Implementing inter-domain packet filtering helps to enhance
              network security by detecting and filtering malicious traffic
              between different network domains. It ensures that only legitimate
              traffic is allowed to flow across the network.
              <br />
              <strong> The detection process spans for 80 seconds.</strong>
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {!isData ? (
                <div className="flex flex-col rounded-lg border border-gray-100 px-4 py-8 text-center gap-4">
                  <button
                    className="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto hover:cursor-pointer"
                    onClick={() => {
                      setIsProcessing(true);
                      setTimeout(() => {
                        setIsData(!isData);
                        setIsProcessing(false);
                        getFlowAnalysis();
                      }, 80000);
                    }}
                    disabled={isProcessing}
                  >
                    {/* {isProcessing ? <p>Detecting...</p> : <p>Start Detecting</p>} */}
                    {isProcessing ? (
                      <p>Detecting...</p>
                    ) : (
                      <p>Start Detecting</p>
                    )}
                  </button>
                  {isProcessing && (
                    <button
                      className="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto hover:cursor-pointer"
                      onClick={() => {
                        setIsData(!isData);
                        setIsProcessing(false);
                        setFlowsAnalyzed(0);
                        setSpoofedFlowCount(0);
                        setPacketLength(0);
                        setFlowArray([]);
                      }}
                    >
                      Stop Detection Process
                    </button>
                  )}
                </div>
              ) : (
                <button
                  className="block w-full rounded bg-blue-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring active:bg-blue-500 sm:w-auto hover:cursor-pointer"
                  onClick={async () => {
                    const res = await axios.post(
                      "http://localhost:9000/api/v1/flows",
                      { data: flowArray }
                    );
                    console.log(res);
                    setIsData(!isData);
                    setFlowsAnalyzed(0);
                    setSpoofedFlowCount(0);
                    setPacketLength(0);
                    setFlowArray([]);
                  }}
                >
                  Detect Again
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="m-12">
        {isProcessing ? (
          <div className="flex justify-center align-center">
            <Spinner color="blue" className="h-16 w-16" />
          </div>
        ) : isData ? (
          <>
            <div
              className="rounded-2xl border border-blue-100 bg-white p-4 shadow-lg sm:p-6 lg:p-8"
              role="alert"
            >
              <div className="flex items-center gap-4">
                <span className="shrink-0 rounded-full bg-blue-400 p-2 text-white">
                  <svg
                    className="size-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                      fillRule="evenodd"
                    />
                  </svg>
                </span>

                <p className="font-medium sm:text-lg">Detecting Complete!</p>
              </div>

              <p className="mt-4 text-gray-500">
                The Detecting process is complete. You can now view the results
                of the packet detecting process, including the analyzed flows
                and any detected spoofed packets.
              </p>

              <div className="mt-6 sm:flex sm:gap-4">
                <button
                  className="inline-block w-full rounded-lg bg-blue-500 px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto"
                  onClick={() => navigate("/details", { state: { flowArray } })}
                >
                  View Details
                </button>
              </div>
            </div>
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Dashboard;
