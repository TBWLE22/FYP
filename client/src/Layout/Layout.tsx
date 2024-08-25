import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-center items-center flex-1">
        <Navbar />
      </div>
      <div className="flex flex-1 justify-center items-center">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
