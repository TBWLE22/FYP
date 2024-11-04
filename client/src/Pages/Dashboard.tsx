import { useNavigate } from "react-router-dom";
import { useDataContext } from "../context/DataContext";
import { useState } from "react";
import { Spinner } from "@material-tailwind/react";
import Data from "./Data";

const Dashboard = () => {
  const { isData, setIsData } = useDataContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col mt-12">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            IP Spoofing and DOS Attacks
          </h2>

          <p className="mt-4 text-gray-500 sm:text-xl">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione
            dolores laborum labore provident impedit esse recusandae facere
            libero harum sequi.
          </p>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col rounded-lg border border-gray-100 px-4 py-8 text-center">
            <dt className="order-last text-lg font-medium text-gray-500">
              Total Number of Packets
            </dt>

            <dd className="text-4xl font-extrabold text-blue-600 md:text-5xl">
              {isData ? <p>4.8m</p> : <p>0</p>}
            </dd>
          </div>

          <div className="flex flex-col rounded-lg border border-gray-100 px-4 py-8 text-center">
            <dt className="order-last text-lg font-medium text-gray-500">
              Incoming/Outgoing Packets
            </dt>

            <dd className="text-4xl font-extrabold text-blue-600 md:text-5xl">
              {isData ? <p>86k/80k</p> : <p>0</p>}
            </dd>
          </div>

          <div
            className="flex flex-col rounded-lg border border-gray-100 px-4 py-8 text-center hover:cursor-pointer hover:bg-gray-50"
            onClick={() => {
              if (isData) navigate("/filtered");
              else alert("filter first");
            }}
          >
            {isProcessing ? (
              <div className="flex justify-center align-center">
                <Spinner
                  color="blue"
                  onPointerEnterCapture={() => {}}
                  onPointerLeaveCapture={() => {}}
                  className="h-16 w-16"
                />
              </div>
            ) : (
              <>
                <dt className="order-last text-lg font-medium text-gray-500">
                  Packets Filtered
                </dt>

                <dd className="text-4xl font-extrabold text-blue-600 md:text-5xl">
                  {isData ? <p>24</p> : <p>0</p>}
                </dd>
              </>
            )}
          </div>

          <div
            className="flex flex-col rounded-lg border border-gray-100 px-4 py-8 text-center hover:cursor-pointer hover:bg-gray-50"
            onClick={() => {
              if (isData) navigate("/spoofed");
              else alert("filter first");
            }}
          >
            {isProcessing ? (
              <div className="flex justify-center align-center">
                <Spinner
                  color="blue"
                  onPointerEnterCapture={() => {}}
                  onPointerLeaveCapture={() => {}}
                  className="h-16 w-16"
                />
              </div>
            ) : (
              <>
                {" "}
                <dt className="order-last text-lg font-medium text-gray-500">
                  Spoofed Packets Detected
                </dt>
                <dd className="text-4xl font-extrabold text-blue-600 md:text-5xl">
                  {isData ? <p>86</p> : <p>0</p>}
                </dd>
              </>
            )}
          </div>
        </dl>
      </div>
      <section className="bg-gray-50">
        <div className="mx-auto max-w-screen-xl px-4 py-10 lg:flex lg:h-full lg:items-center">
          <div className="mx-auto max-w-l text-center">
            <h1 className="text-3xl font-extrabold sm:text-5xl">
              Inter Domain Packet Filtering
              {/* <strong className="font-extrabold text-red-700 sm:block">
                {" "}
                Increase Conversion.{" "}
              </strong> */}
            </h1>

            <p className="mt-4 sm:text-xl/relaxed">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nesciunt
              illo tenetur fuga ducimus numquam ea!
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {!isData ? (
                <button
                  className="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto hover:cursor-pointer"
                  onClick={() => {
                    setIsProcessing(true);
                    setTimeout(() => {
                      setIsData(!isData);
                      setIsProcessing(false);
                    }, 1000);
                  }}
                >
                  Start Filtering
                </button>
              ) : (
                <button
                  className="block w-full rounded bg-blue-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring active:bg-blue-500 sm:w-auto hover:cursor-pointer"
                  onClick={() => {
                    setIsData(!isData);
                  }}
                >
                  Filter Again
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="m-12">
        {isProcessing ? (
          <div className="flex justify-center align-center">
            <Spinner
              color="blue"
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
              className="h-16 w-16"
            />
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

                <p className="font-medium sm:text-lg">Filtering Complete!</p>
              </div>

              <p className="mt-4 text-gray-500">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam
                ea quo unde vel adipisci blanditiis voluptates eum. Nam, cum
                minima?
              </p>

              <div className="mt-6 sm:flex sm:gap-4">
                <button
                  className="inline-block w-full rounded-lg bg-blue-500 px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto"
                  onClick={() => navigate("/details")}
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
      <Data />
    </div>
  );
};

export default Dashboard;
