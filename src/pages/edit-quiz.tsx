import { useState, useEffect, useRef } from "react";
import { useUserAuth } from "../context/userAuthContext";
import { apiCall } from "@/utils/apiClient";
import { useTranslation } from "next-i18next";

// components
import Button from "@/app/components/Button"; // button component
import Skeleton from "@/app/components/Skeleton"; // skeleton loading component
import { useModal } from "@/context/modalContext";
import Sidebar from "@/app/components/Sidebar";

// utils
import { Quiz, NavigationItem, Question } from "../utils/types"; // relevant types
import Background from "@/app/components/Background";
import withAuthorization from "./withAuthorization";

 function CreateQuizPage() {

  // top left menu items (questions)
  const [navigation, setNavigation] = useState([] as NavigationItem[]);

  // quiz state
  const [activeQuiz, setActiveQuiz] = useState < Quiz > ({} as Quiz); // currently active quiz object - contains questions and other quiz info
  const [activeQuestion, setActiveQuestion] = useState < number > (0); // currently displayed question

  // Form items refs
  const questionTextRef = useRef < HTMLTextAreaElement > (null);
  const markSchemeRef = useRef < HTMLTextAreaElement > (null);
  const marksRef = useRef < HTMLInputElement > (null);
  const interfaceRef = useRef < HTMLSelectElement > (null);


  // button loading state
  const [loading, setLoading] = useState(false); // currently displayed question

  const { t } = useTranslation()

  //@ts-ignore
  const { showModal } = useModal();

  //@ts-ignore
  const { user } = useUserAuth(); // get user from context

  // function to handle clicks to the left sidebar menu to change the active question
  function sideBarMenuClick(i: number) {
    // add sidebar menu functions here
    setActiveQuestion(i)
  }

  // API call to get quiz by id once the user variable is available
  useEffect(() => {
    async function getData() {
      if (user) {
        const activeQuizId = window.location.hash.substring(1);
        if (!activeQuizId) {
          showModal("no-quiz", 0, "go-home", "home"); // if no quiz id in url, show error
        } else {
          apiCall('/getquizbycode/' + activeQuizId).then((data) => {
            if (typeof data === "string") {
              showModal("no-quiz", 0, "go-home", "home");
            } else {
              setActiveQuiz(data); // set active quiz to the quiz returned from the api
            }
          })
            .catch(() => {
              showModal("quiz-fail", 0, "go-home", "home");
            });
        }

      }
    }
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // when activeQuiz.questions.length changes add navigation items (questions) to sidebar
  useEffect(() => {

    if (activeQuiz?.questions)
      setNavigation(
        activeQuiz.questions.map((question, index) => {
          return {
            name: t("question") + " " + (index + 1).toString(),
            id: index,
            current: index === 0 ? true : false,
          };
        })
      );

  }, [activeQuiz?.questions?.length]);

  // update Form values when active question changes
  useEffect(() => {
    if (questionTextRef.current) {
      questionTextRef.current.value = activeQuiz.questions[activeQuestion].questionText || "";
    }
    if (markSchemeRef.current) {
      markSchemeRef.current.value = activeQuiz.questions[activeQuestion].markScheme || "";
    }
    if (marksRef.current) {
      marksRef.current.value = activeQuiz.questions[activeQuestion].marks.toString() || "";
    }
    if (interfaceRef.current) {
      interfaceRef.current.value = activeQuiz.questions[activeQuestion].interface || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestion]);

  const updateQuiz = () => {

    // update active quiz with form values

    setLoading(true)
    try {
      apiCall('/quizzes/' + activeQuiz.id, activeQuiz).then((r) => {
        if (typeof r == "string") {
          showModal("save-quiz-failed");
        } else {

          setActiveQuiz(r)
        }
        setLoading(false)
      })
    } catch {
      showModal("save-quiz-failed");
    }
  };

  const quizNameRef = useRef < HTMLHeadingElement > (null);

  const handleTitleEdit = () => {
    if (quizNameRef.current) {
      const newName = quizNameRef.current.innerText;
      setActiveQuiz({ ...activeQuiz, name: newName });
    }
  };

  // Define the updateActiveQuiz function
  const updateActiveQuiz = (key: string, value: string) => {
    setActiveQuiz((prevQuiz) => {
      const newQuiz = { ...prevQuiz };
      //@ts-ignore
      newQuiz.questions[activeQuestion][key] = value;
      return newQuiz;
    });
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Update state after mount to access `window`
    setSidebarOpen(window.innerWidth >= 1024);
  }, []);

  return (
    <>



      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen} navigation={navigation} head={activeQuiz?.name} activeQuestion={activeQuestion} menuClick={sideBarMenuClick} />

      <main className={`${sidebarOpen ? 'lg:pl-72' : 'lg:pl-8 pl-4'}`}>

        <div className=" px-4 py-10 sm:px-6 lg:px-8 lg:py-6 max-lg:mt-5">
          {/* Central column */}
          <Background />
          {/* Show content activeQuiz.questions exists, loading Skeleton if not */}
          {activeQuiz?.questions ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight dark:text-white"
                    contentEditable={true}
                    ref={quizNameRef}
                    onBlur={handleTitleEdit}>
                    {activeQuiz.name}
                  </h2>
                </div>
                <div className="flex md:ml-4 md:mt-0">

                  <Button
                    onClick={updateQuiz}
                    isNormalState={!loading}
                    buttonText="update-quiz"
                  />
                </div>
              </div>



              <form>
                <div className=" space-y-6">
                  <h2 className="text-base font-semibold leading-7 text-gray-900 border-b border-gray-900/10 pb-4 dark:text-white dark:border-gray-400">{t("question")} {activeQuestion + 1}</h2>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 ">

                    <div className="col-span-full ">
                      <label htmlFor="questionText" className="custom-label">
                        {t('question-text')}
                      </label>
                      <div className="mt-2">
                        <textarea
                          ref={questionTextRef}
                          id="questionText"
                          name="questionText"
                          rows={activeQuiz.questions[activeQuestion].questionText?.split("\n").length + 2}
                          className="custom-textarea"
                          onChange={(e) => updateActiveQuiz("questionText", e.target.value)}
                          defaultValue={activeQuiz.questions[activeQuestion].questionText}
                        />
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label htmlFor="about" className="custom-label">
                        {t('mark-scheme')}
                      </label>
                      <div className="mt-2">
                        <textarea
                          ref={markSchemeRef}
                          id="markScheme"
                          name="markScheme"
                          rows={activeQuiz.questions[activeQuestion].markScheme.split("\n").length + 2}
                          className="custom-textarea"
                          onChange={(e) => updateActiveQuiz("markScheme", e.target.value)}
                          defaultValue={activeQuiz.questions[activeQuestion].markScheme}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="marks" className="custom-label">
                        {t("number-of-marks")}
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          ref={marksRef}
                          id="marks"
                          name="marks"
                          onChange={(e) => updateActiveQuiz("marks", e.target.value)}
                          defaultValue={activeQuiz.questions[activeQuestion].marks}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="interface" className="custom-label">
                        {t("response-type")}
                      </label>
                      <div className="mt-2">
                        <select
                          ref={interfaceRef}
                          id="interface"
                          name="interface"
                          defaultValue={activeQuiz.questions[activeQuestion].interface}
                          onChange={(e) => updateActiveQuiz("interface", e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white"
                        >
                          <option value="">Standard</option>
                          <option value="code">Computer code</option>
                          <option value="maths">Mathematics</option>
                          <option value="mc">Multiple Choice</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <Skeleton lines={3} />
          )
          }
        </div>
      </main >


    </>
  )
}
export default withAuthorization(CreateQuizPage)