import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
   <button
      onClick={() => setDark(!dark)}
      className="flex items-center justify-center w-10 h-10 rounded-full 
      bg-gray-100 dark:bg-gray-800 
      text-gray-600 dark:text-yellow-400 
      hover:scale-105 transition-all duration-200 shadow-sm"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;