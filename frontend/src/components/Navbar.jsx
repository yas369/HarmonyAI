import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";

import { useTheme } from "../context/ThemeContext.jsx";

const navItems = [
  { label: "Composer", to: "/" },
  { label: "History", to: "/history" },
  { label: "Settings", to: "/settings" },
  { label: "About", to: "/about" }
];

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="py-6">
      <div className="page-padding">
        <div className="max-w-6xl mx-auto glass-card px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-brand-purple via-brand-aqua to-brand-highlight flex items-center justify-center text-xl font-heading font-semibold text-[#0D0D0D]">
              🎶
            </div>
            <div>
              <p className="text-lg font-heading font-semibold">HarmonyAI</p>
              <p className="text-sm text-white/60 dark:text-black/60">Compose from emotion & words</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `transition-colors hover:text-brand-aqua ${
                    isActive ? "text-brand-highlight" : "text-white/70 dark:text-black/70"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="size-10 rounded-full border border-white/10 dark:border-black/10 bg-white/10 dark:bg-black/10 flex items-center justify-center hover:shadow-glow transition"
            >
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <button
              type="button"
              className="md:hidden size-10 rounded-full border border-white/10 dark:border-black/10 flex items-center justify-center"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
        {isOpen ? (
          <div className="max-w-6xl mx-auto mt-3 glass-card px-6 py-4 flex flex-col gap-3 md:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2 transition-colors ${
                    isActive
                      ? "bg-brand-purple/20 text-brand-highlight"
                      : "text-white/80 dark:text-black/70 hover:bg-white/10"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Navbar;
