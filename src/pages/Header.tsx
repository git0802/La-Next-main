// components/Header.js
import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

function Header() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/">Next-Learn</Link>
        <ul className="flex space-x-4">
          <li>
            <button
              onClick={() => changeLanguage("en")}
              className="cursor-pointer"
            >
              English
            </button>
          </li>
          <li>
            <button
              onClick={() => changeLanguage("fr")}
              className="cursor-pointer"
            >
              Français
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
