import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-export-i18n";

// components
import Button from "@/app/components/Button"; // button component
import { useModal } from "@/context/modalContext";

// utils
import Background from "@/app/components/Background";
import Sidebar from "@/app/components/Sidebar";
import withAuthorization from "./withAuthorization";
function CreateQuizPage() {

  const { t } = useTranslation();
  //@ts-ignore
  const { showModal } = useModal();

  const [description, setDescription] = useState('');

  // Get description from URL if present

  useEffect(() => {
    const descriptionFromUrl = new URLSearchParams(window.location.search).get("description");
    if (descriptionFromUrl) {
      setDescription(descriptionFromUrl);
    }
  }, []);

  const router = useRouter();
  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };

  function createQuiz() {
    if (description) router.push(`/quiz?description=${encodeURIComponent(description)}`); else showModal("enter-quiz-description");
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Update state after mount to access `window`
    setSidebarOpen(window.innerWidth >= 1024);
  }, []);

  return (
    <>


      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen} />

      <main className={`${sidebarOpen ? 'lg:pl-72' : 'lg:pl-8 pl-4'}`}>
        {/* Add padding right if right column is showing */}

        <div className=" px-4 py-20 sm:px-6 lg:px-8 lg:py-6">
          {/* Central column */}
          <Background />

          <div className="custom-main-div">
            <div className="min-w-0 flex-1">
              <h2 className="custom-h2">
                {t("create-a-quiz")}
              </h2>
            </div>
          </div>

          <div className="col-span-full ">
            <label htmlFor="description" className="custom-label">
              {t("enter-quiz-description-label")}
            </label>
            <div className="mt-2">
              <textarea
                id="description"
                name="description"
                rows={7}
                onChange={handleDescriptionChange}
                className="custom-textarea"
                defaultValue={description}
                placeholder={t("enter-quiz-description-placeholder")}
              />
            </div>
            <Button
              onClick={createQuiz}
              isNormalState={true}
              buttonText="create-quiz"
              extraClasses="mt-4"
            />
          </div>
        </div>
      </main>


    </>
  )
}


export default withAuthorization(CreateQuizPage);