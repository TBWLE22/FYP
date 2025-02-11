import { createContext, useState, useContext, ReactNode } from "react";

type DataContextType = {
  isData: boolean;
  setIsData: React.Dispatch<React.SetStateAction<boolean>>;
  flowsAnalyzed: number;
  setFlowsAnalyzed: React.Dispatch<React.SetStateAction<number>>;
  spoofedFlowCount: number;
  setSpoofedFlowCount: React.Dispatch<React.SetStateAction<number>>;
  packetLength: number;
  setPacketLength: React.Dispatch<React.SetStateAction<number>>;
  flowArray: [];
  setFlowArray: React.Dispatch<React.SetStateAction<[]>>;
};

const initialContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

const DataContext = ({ children }: DataProviderProps) => {
  const [isData, setIsData] = useState(false);
  const [flowsAnalyzed, setFlowsAnalyzed] = useState(0);
  const [spoofedFlowCount, setSpoofedFlowCount] = useState(0);
  const [packetLength, setPacketLength] = useState(0);
  const [flowArray, setFlowArray] = useState([]);

  return (
    <initialContext.Provider
      value={{
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
      }}
    >
      {children}
    </initialContext.Provider>
  );
};

export default DataContext;

// custom hook
export const useDataContext = () => {
  const context = useContext(initialContext);
  if (!context) throw new Error("Context is not wrapped inside Provider");
  return context;
};
