import { Routes, Route } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import FlowHistory from "./Pages/FlowHistory";
import Layout from "./Layout/Layout";
import "./index.css";
import DataContext from "./context/DataContext";
import Details from "./Pages/Details";
import SpoofPackets from "./Pages/SpoofPackets";
import Filtered from "./Pages/Filtered";
import FlowAnalysis from "./Pages/FlowAnalysis";

const App = () => {
  return (
    <DataContext>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/details" element={<Details />} />
          <Route path="/spoofed" element={<SpoofPackets />} />
          <Route path="/flowAnalysis" element={<FlowAnalysis />} />
          <Route path="/history" element={<FlowHistory />} />
        </Route>
      </Routes>
    </DataContext>
  );
};

export default App;
