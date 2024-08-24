import { createContext, useState, useContext, ReactNode } from "react";

type DataContextType = {
  isData: boolean;
  setIsData: React.Dispatch<React.SetStateAction<boolean>>;
};

const initialContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

const DataContext = ({ children }: DataProviderProps) => {
  const [isData, setIsData] = useState(false);

  return (
    <initialContext.Provider value={{ isData, setIsData }}>
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
