import React, { useState, useEffect, MouseEvent } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@heroicons/react/20/solid";

interface Theme {
  systemTheme?: string;
  theme?: "light" | "dark";
  setTheme: (theme: string) => void;
}

const ThemeToggleButton: React.FC = () => {
  const { systemTheme, theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before attempting to set theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = (event: MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  // If not mounted, don't render anything
  if (!mounted) return null;

  const ThemeIconComponent = theme === "light" ? SunIcon : MoonIcon;

  return (
    <ThemeIconComponent
      className="h-6 w-6 text-white"
      aria-hidden="true"
      onClick={handleThemeToggle}
    />
  );
};

export default ThemeToggleButton;
