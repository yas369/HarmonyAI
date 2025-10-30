import { Outlet } from "react-router-dom";

import { useTheme } from "../context/ThemeContext.jsx";
import { useComposition } from "../context/CompositionContext.jsx";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import Toast from "./Toast.jsx";

const Layout = () => {
  const { theme } = useTheme();
  const { toast } = useComposition();

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        theme === "dark" ? "bg-[#0D0D0D] text-white" : "bg-gray-50 text-[#111111]"
      }`}
    >
      <Navbar />
      <main className="flex-1 page-padding pt-8 pb-16">
        {/* React Router outlet renders child pages */}
        <Outlet />
      </main>
      <Footer />
      <Toast toast={toast} />
    </div>
  );
};

export default Layout;
