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
        theme === "dark" ? "text-white" : "text-[#111111]"
      }`}
    >
      <Navbar />
      <main className="flex-1 w-full">
        <div className="page-padding max-w-6xl mx-auto w-full pt-8 pb-16">
          <Outlet />
        </div>
      </main>
      <Footer />
      <Toast toast={toast} />
    </div>
  );
};

export default Layout;
