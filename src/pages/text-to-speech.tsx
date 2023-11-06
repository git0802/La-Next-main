import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { TextToSpeech } from "@capacitor-community/text-to-speech";

// components
import Background from "@/app/components/Background"; // background blur effect
import Sidebar from "@/app/components/Sidebar";
import Button from "@/app/components/Button"; // button component

export default function CreateQuizPage() {
  const { t } = useTranslation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const speak = async () => {
    await TextToSpeech.speak({
      text: "Text to speech is working",
      lang: "en-US",
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      category: "ambient",
    });
  };

  useEffect(() => {
    // Update state after mount to access `window`
    setSidebarOpen(window.innerWidth >= 1024);
  }, []);

  return (
    <>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`${sidebarOpen ? "lg:pl-72" : "lg:pl-8 pl-4"}`}>
        <div className="custom-div-title">
          {/* Central column */}
          <Background />

          <div className="custom-main-div">
            <div className="min-w-0 flex-1">
              <h2 className="custom-h2">{t("text-to-speech")}</h2>
            </div>
          </div>

          <div className="flex ">
            <Button onClick={() => speak()} buttonText="Test"></Button>
          </div>
        </div>
      </main>
    </>
  );
}
