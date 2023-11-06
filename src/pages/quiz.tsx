import { useState, useEffect } from "react";
import { useUserAuth } from "../context/userAuthContext";

// components
import EditableContent from "@/app/components/EditableContent"; // editable div component
import MathquillContainer from "@/app/components/MathQuillContainer";
import MCContainer from "@/app/components/MCContainer";
import RightSidebar from "../app/components/RightSidebar"; // right sidebar
import Button from "@/app/components/Button"; // button component
import Skeleton from "@/app/components/Skeleton"; // skeleton loading component
import { AcademicCapIcon } from "@heroicons/react/24/outline"; // icons
import Background from "@/app/components/Background"; // background blur effect
import Sidebar from "@/app/components/Sidebar";
import { useModal } from "@/context/modalContext";
import { useTranslation } from "next-i18next";

// utils
import { GPTInteraction } from "@/utils/OpenAIFunctions"; // for making api calls to ChatGPT
import { Quiz, Question, NavigationItem, Score, MarkData } from "../utils/types"; // relevant types
import { hashStringWithSHA1 } from "@/utils/hashFunction"; // for hashing strings for the cache
import { apiCall } from "@/utils/apiClient";
import { ArrowSmallLeftIcon, ArrowSmallRightIcon } from "@heroicons/react/20/solid";
import RenderMath from "@/app/components/RenderMath";
import AudioPlayer from "@/app/components/AudioPlayer";
import withAuthorization from "./withAuthorization";

 function QuizPage() {
  // control sidebars
  const [showRightColumn, setShowRightColumn] = useState(false);
  // quiz state
  const [activeQuestion, setAQ] = useState < number > (-1); // currently displayed question

  //@ts-ignore
  const [score, setScore] = useState < Score > ({ marks: {}, answers: [] }); // variable for user answers and marks
  const [activeQuiz, setActiveQuiz] = useState < Quiz > ({} as Quiz); // currently active quiz object - contains questions and other quiz info

  // top left menu items (questions)
  const [navigation, setNavigation] = useState([] as NavigationItem[]);

  const [isColumnLayout, setIsColumnLayout] = useState(false); // State to toggle layout

  // marking state
  const [markingResponse, setMarkingResponse] = useState(""); // response from GPT (streamed)
  const [markingExplanation, setMarkingExplanation] = useState(""); // GPT marking explanation
  const [currentMarking, setCurrentMarking] = useState < number[] > ([]); // output from marking, eg. [1,1,0,1]
  const [gptActive, setGptActive] = useState(0); // 0 - not active, 1 - marking, 2 - chat, 3 - marking finished, needs processing, 4 - chat finished, needs processing

  const [explanationIsVisible, setExplanationIsVisible] = useState(false); // whether explanation is visible or not
  const [whyButtonIsVisible, setWhyButtonIsVisible] = useState(false); // whether why button is visible or not
  const [gptPrompt, setGptPrompt] = useState(""); // track full GPT request, to be sent to cache




  // chat and quiz creation states (not used yet)
  const [chatResponse, setChatResponse] = useState("");
  const [chatHistory, setChatHistory] = useState < string[] > ([]);
  const [answerHistory, setAnswerHistory] = useState < string[] > ([]);
  const [quizResponse, setQuizResponse] = useState("");

  const [recentHashValue, setRecentHashValue] = useState(""); // save hash value for feedback

  const [audioToPlay, setAudioToPlay] = useState(""); // text for audio player

  //@ts-ignore
  const { user } = useUserAuth();
  const { t } = useTranslation();

  // function to handle changes to editable div, updates answers array and localstorage
  const editableContentHandleChange = (val: string) => {
    setScore((prevState) => {
      const updatedAnswers = [...prevState.answers];
      updatedAnswers[activeQuestion] = val;
      return {
        ...prevState,
        answers: updatedAnswers,
      };
    });
  };

  // function to handle clicks to the left sidebar menu to change the active question
  function setActiveQuestion(i: number) {
    if (!gptActive) setAQ(i);
  }

  //@ts-ignore
  const { showModal } = useModal();

  const nextQuestion = () => {
    if (activeQuestion < activeQuiz.questions.length - 1) setAQ(activeQuestion + 1);
  }

  // function to begin marking of question
  async function markQuestion() {
    // remove focus from math field
    if (document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }
    if (!score.answers[activeQuestion]) {
      showModal("no-answer"); // nothing in answer box
    } else {
      setCurrentMarking([]); // reset current marking (in case of multiple attempts)
      setMarkingResponse(""); // reset marking response (in case of multiple attempts)
      setMarkingExplanation(""); // reset explanation (in case of multiple attempts
      setWhyButtonIsVisible(false); // hide why button
      try {
        if (activeQuiz?.questions[activeQuestion].interface == "mc") {
          const MC = JSON.parse(activeQuiz?.questions[activeQuestion].markScheme)
          let mark: MarkData = ["", ""]
          if (MC.correctAnswer == score.answers[activeQuestion]) {
            mark = ["[1]", ""] // correct
          } else {
            mark = ["[0]", MC.whyIncorrect[score.answers[activeQuestion]]] // incorrect
          }
          processMark(mark);
        } else {
          setGptActive(1); // set marking active (activates loading states for button and right column)
          const result = await GPTInteraction(
            [score.answers[activeQuestion]],
            activeQuiz?.questions[activeQuestion],
            "explain",
            processMarkResponse
          );

          setGptPrompt(result);
        }
      } catch (error) {
        showModal("marking-failed");
      }
    }
  }

  const startChatResponse = async (chatInput: string) => {
    if (!activeQuiz?.id) {
      showModal("no-chat-while-generating");
    } else {
      // set chatinput to question, or Help me if no question
      chatInput = chatInput ? chatInput : "Help me!";
      setChatResponse(""); // reset chat response
      setGptActive(2); // set chat fetch active (activates loading states for button and right column)

      // call GPT
      const result = await GPTInteraction(
        [...answerHistory, score.answers[activeQuestion]],
        activeQuiz?.questions[activeQuestion],
        "chat",
        processChatResponse,
        [...chatHistory, chatInput]
      );

      // remove special instructions for chatGPT from chatInput

      chatInput = chatInput.replace(/(find-video|similar-example)/g, '').trim();

      // update state variables for future calls
      setChatHistory((prevChatHistory) => [...prevChatHistory, chatInput]);
      setAnswerHistory((prevAnswerHistory) => [
        ...prevAnswerHistory,
        score.answers[activeQuestion],
      ]);
      setGptPrompt(result);
    }
  };

  // when chunk is received from chatGPT, check to see if it is the final response and process it
  function processChatResponse(response: string) {
    if (response.substring(0, 6) == "[DONE]") {
      if (response != "[DONE]") {
        setChatResponse((prevState) => prevState + response.substring(6)); // remove [DONE] from response if received all in one go (from cache)
      }
      setGptActive(4); // indicate gpt streaming has finished, needs to be processed
    } else {
      setChatResponse((prevState) => prevState + response);
    }
  }

  // when chunk is received from chatGPT, check to see if it is the final response and process it
  function processMarkResponse(response: string) {
    if (response.substring(0, 6) == "[DONE]") {
      if (response != "[DONE]") {
        setMarkingResponse((prevState) => prevState + response.substring(6)); // remove [DONE] from response if received all in one go (usually from cache)
      }
      setGptActive((prevState) => prevState + 2); // indicate gpt streaming has finished, needs to be processed
    } else {
      setMarkingResponse((prevState) => prevState + response);
    }

  }
  // Process quiz creation response (here, checking for DONE is done in the quizResponse useeffect)
  function processQuizResponse(response: string) {
    if (response == "[error]") {
      const urlSearchParams = new URLSearchParams(window.location.search);
      showModal("quiz-creation-failed", 0, "go-back", "create-quiz?description=" + urlSearchParams.get("description"));
    } else {
      setQuizResponse((prevState) => prevState + response);
    }
  }

  function sendComment(message: string) {

    try {
      const body = {
        feedback: message,
        sha: recentHashValue,
        user: user.uid,
      };
      fetch(`https://learnanything-uk.stackstaging.com/feedback.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }).then((response) => {
        // Use setTimeout inside a function to delay the execution
        setTimeout(() => {
          showModal("feedback-sent", 2);
        }, 1000);

        // Return the response so it can be further processed if needed
        return response;
      })

    } catch (error) {
      setTimeout(() => {
        showModal("feedback-fail");
      }, 1000)
      // do nothing here, saving to cache failed
    }
  }

  function sendFeedback() {
    showModal("feedback-describe", 1, "send", sendComment, "", 2);
  }


  function processMark(mark: MarkData) {
    const tempCurrentMarking = JSON.parse(mark[0]), isWrong = tempCurrentMarking.reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0) < activeQuiz.questions[activeQuestion].marks;
    setCurrentMarking(tempCurrentMarking); // update current marking
    //@ts-ignore
    let updatedMarks = { ...score.marks } || {};
    updatedMarks[activeQuestion] = mark; // update marks in score
    // update score
    //@ts-ignore
    setScore((prevState) => {
      return {
        ...prevState,
        marks: { ...updatedMarks },
        updated: false
      };
    });

    if (isWrong) {
      setShowRightColumn(true); // display the marking, right column and why button
    } else {
      // response is correct, show modal 
      if (activeQuestion < activeQuiz.questions.length - 1) {
        showModal("question-correct", 2, "next-question", nextQuestion);
      } else {
        showModal("question-correct", 2, "view-score", "your-score#" + activeQuiz.id, "view-score-option", 1);
      }
    }
    if (mark[1]) {
      setWhyButtonIsVisible(true);  // if there is an explanation, show why button
      setMarkingExplanation(mark[1]);
    } else setWhyButtonIsVisible(false);
  }

  // Process quizResponse when it changes to populate activeQuiz
  useEffect(() => {
    if (quizResponse) {
      // remove [DONE] from response
      const currentQuizResponse = quizResponse.replaceAll("[DONE]", "");

      const quizArr = currentQuizResponse.split("\n~'~\n");
      let newActiveQuiz = {} as Quiz;

      newActiveQuiz.id = -1;

      newActiveQuiz.questions = [];
      newActiveQuiz.name = (quizArr[1]) ? quizArr[1] : "Creating quiz...";
      quizArr[0].split("\n~~\n").forEach(question => {
        const questionDetails = question.split("\n~-\n");
        let newQuestion = { questionText: questionDetails[0], markScheme: "", marks: 1, interface: "" };
        if (questionDetails[1]) newQuestion.markScheme = questionDetails[1];
        if (questionDetails[2]) newQuestion.marks = parseInt(questionDetails[2]);
        if (questionDetails.length == 4) newQuestion.interface = (questionDetails[3]) ? questionDetails[3] : "standard";
        newActiveQuiz.questions.push(newQuestion);
      });
      if (activeQuestion == -1) setActiveQuestion(0)
      setActiveQuiz(newActiveQuiz);

      // if quiz creation complete process it
      if (quizResponse.includes("[DONE]")) {

        if (quizResponse.slice(-6) == "[DONE]") { // [DONE] at end means came from GPT stream, so cache
          setQuizResponse((prevState) => prevState.slice(0, -6))
          setGptActive(10); // indicate gpt streaming has finished, needs to be cached
        }

        // save to API under user account and update URL with quiz_id

        apiCall('/quizzes', newActiveQuiz).then((r) => {

          // update score id so that it can be saved
          if (r.score && r.score.id) {
            setScore((prevState) => {
              return {
                ...prevState,
                id: r.score.id,
                updated: false
              };
            });
          }


          function processHistory(type: string) {
            let tempHistory: Record<number, string[]> = JSON.parse(localStorage.getItem(type) ?? "[]");
            if (tempHistory[-1]) {
              console.log(type, tempHistory)
              tempHistory[r.id] = tempHistory[-1];
              console.log(tempHistory)
              localStorage.setItem(type, JSON.stringify(tempHistory));
            }
          }
          processHistory("answerHistory");
          processHistory("chatHistory");

          setActiveQuiz(r)
          window.history.replaceState({}, '', 'quiz#' + r.quiz_code);
        })


      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizResponse]);

  // when gptActive becomes false, marking is completed, send results to cache
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (gptActive > 2) {
      // gptActive is 3 (marking) or 4 (chat) when gpt has finished streaming

      // Update score as not updated to trigger send to API
      if (gptActive == 3) {

        // update score
        setScore((prevState) => {
          return {
            ...prevState,
            updated: false
          };
        });

      }

      if ((gptActive == 3 && currentMarking.length > 0) || gptActive == 4 || gptActive == 10) { // check we didn't get a cache response (don't want to repost cache to cache) TODO Find a way to check for cache response in chat/quiz

        //post to cache
        hashStringWithSHA1(gptPrompt).then((hashValue) => {
          setRecentHashValue(hashValue)
          try {
            const body = {
              sent: gptPrompt,
              received:
                gptActive == 3
                  ? markingResponse
                  : gptActive == 4 ? chatResponse
                    : quizResponse,
              sha: hashValue,
              user: user.uid,
            };

            fetch(`https://learnanything-uk.stackstaging.com/cache.php`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            });

          } catch (error) {
            // do nothing here, saving to cache failed
          }
        });
      } else {
        hashStringWithSHA1(gptPrompt).then((hashValue) => {
          setRecentHashValue(hashValue)
        });
      }
      if (chatResponse) {
        setChatHistory((prevChatHistory) => [...prevChatHistory, chatResponse]);
        setAudioToPlay(chatResponse);
      }

      setGptActive(0); // indicate gpt streaming has finished
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gptActive]);

  // Update "chatHistory" in local storage when chatHistory changes
  useEffect(() => {
    toLocalStorage("chatHistory", chatHistory, activeQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatHistory]);

  // Update score online when score changes
  useEffect(() => {
    console.log("Score changed!", score)
    if (score.id && score.updated == false) {
      console.log("Doing score api call")
      apiCall('/marks/' + score.id, { ...score });
      score.updated = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);



  // Update "answerHistory" in local storage when answerHistory changes
  useEffect(() => {
    toLocalStorage("answerHistory", answerHistory, activeQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerHistory]);

  // when markingResponse changes, check for errors and display marking
  useEffect(() => {
    try {
      if (markingResponse == "[error]") {
        // show error state
        showModal("marking-failed");
        setGptActive(0);
        setWhyButtonIsVisible(false);
      } else if (markingResponse.includes("]")) {

        let responseArr = markingResponse.split("\n").filter(item => item !== "" && item !== " ");

        processMark([responseArr.shift() ?? "", responseArr.join("\n") ?? ""])

      }
    } catch (error) {
      // this means the first line of the response is not an array of 0s and 1s, which is bad
      // Show error and stop marking
      // console.log("Error parsing response from GPT: " + markingResponse)
      showModal(""); // show generic error
      setGptActive(0);
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markingResponse]);

  // when activeQuiz.questions changes (on page load or while quiz is building), set navigation (top left menu links) to the questions in the quiz
  useEffect(() => {
    if (Array.isArray(activeQuiz?.questions))
      setNavigation(
        activeQuiz.questions.map((question, index) => {
          return {
            name: t("question") + " " + (index + 1).toString(),
            id: index,
            current: index === 0 ? true : false,
          };
        })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuiz.questions]);



  // Store data in localstorage
  function toLocalStorage(
    varName: string,
    value: string[] | string[][],
    activeQuestion?: number
  ) {
    const activeQuizId = activeQuiz.id;
    if (activeQuizId) {
      const existingData = localStorage.getItem(varName);
      let storedData: {
        [key: string]:
        | string[]
        | string[][]
        | { [subKey: string]: string[] | string[][] };
      } = existingData ? JSON.parse(existingData) : {};

      if (activeQuestion !== undefined) {
        if (!storedData[activeQuizId]) {
          storedData[activeQuizId] = {} as {
            [subKey: string]: string[] | string[][];
          };
        }
        (
          storedData[activeQuizId] as {
            [subKey: string]: string[] | string[][];
          }
        )[activeQuestion] = value;
      } else {
        storedData[activeQuizId] = value;
      }

      localStorage.setItem(varName, JSON.stringify(storedData));

    }
  }

  function fromLocalStorage(
    varName: string,
    setFunction: (value: string[]) => void,
    questionForData?: number
  ) {
    const activeQuizId = activeQuiz.id;
    if (activeQuizId) {
      const storedDataString = localStorage.getItem(varName);

      let storedData: {
        [key: string]: string[] | { [subKey: string]: string[] };
      } = {};

      if (storedDataString) {
        try {
          storedData = JSON.parse(storedDataString);
        } catch (error) {
          console.error("Failed to parse stored data, starting fresh.");
          setFunction([]);
          return;
        }
      }

      if (questionForData != undefined) {
        const objectData = storedData[activeQuizId] as {
          [subKey: string]: string[];
        };
        if (objectData && objectData[questionForData]) {

          setFunction(objectData[questionForData]);
        } else setFunction([]);
      } else {
        if (storedData[activeQuizId] !== undefined) {
          setFunction(storedData[activeQuizId] as string[]);
        } else setFunction([]);
      }
    }
  }

  // when activeQuestion changes get new data
  useEffect(() => {
    fromLocalStorage("answerHistory", setAnswerHistory, activeQuestion);
    fromLocalStorage("chatHistory", setChatHistory, activeQuestion);

    try {

      //@ts-ignore
      if (score?.marks?.[activeQuestion]?.length) {
        setMarkingExplanation(score.marks[activeQuestion][1]);
        setCurrentMarking(JSON.parse(score.marks[activeQuestion][0]));
        if (score.marks[activeQuestion][1]) setWhyButtonIsVisible(true);
      } else {
        setMarkingResponse("");
        setCurrentMarking([]);
        setWhyButtonIsVisible(false);
      }
    } catch (error) { console.error(error); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestion]);

  // API call to get quiz by id once the user variable is available
  useEffect(() => {
    async function getData() {
      localStorage.removeItem("answerHistory")
      localStorage.removeItem("chatHistory")

      if (user && !activeQuiz.questions) {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const quizDescription = urlSearchParams.get("description");
        if (quizDescription) {
          //  if there are no questions and a quiz description is in the url, create a quiz from the description (and remove any temporary quiz data from localstorage)
          activeQuiz.questions = [];
          activeQuiz.id = -1;


          const result = await GPTInteraction(
            [quizDescription],
            {} as Question,
            "createQuiz",
            processQuizResponse
          );
          setGptPrompt(result);
        } else {
          //showModal("quiz-disclaimer")

          const activeQuizCode = window.location.hash.substring(1);
          if (!activeQuizCode) {
            showModal("no-quiz", 0, "go-home", "home"); // if no quiz id in url, show error
          } else {
            /*
            let token = await user.getIdToken(); // This returns a promise with the JWT token
            fetch(`/quiz/api?id=${"/getquizbycode/" + activeQuizCode}&token=${token}`)
              .then((data) => data.json())
              //@ts-ignore
              .then((_data: Quiz | string) => {*/
            apiCall('/getquizbycode/' + activeQuizCode).then((_data: Quiz | string) => {
              if (typeof _data === "string") {
                showModal("no-quiz", 0, "go-home", "home");
              } else {
                // remove data.users if not the current user to hide Edit button
                if (user.uid != _data.users) _data.users = ""
                if (activeQuestion == -1) setActiveQuestion(0)

                // update answerHistory and chatHistory from localstorage (saved while using temporary quiz id)
                fromLocalStorage("answerHistory", setAnswerHistory, activeQuestion);
                fromLocalStorage("chatHistory", setChatHistory, activeQuestion);

                if (_data.score) {
                  setScore(_data.score)
                }

                setActiveQuiz(_data); // set active quiz to the quiz returned from the api
                console.log(localStorage)

              }
            })
              .catch((e) => {
                console.error(e)
                showModal("quiz-fail", 0, "go-home", "home");
              });
          }
        }
      }
    }
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Update state after mount to access `window`
    setSidebarOpen(window.innerWidth >= 1024);
  }, []);

  return (
    <>

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navigation={navigation}
        head={activeQuiz?.name}

        //@ts-ignore
        quizLink={(activeQuiz?.quiz_code) ? activeQuiz?.id + "," + Object.values(score.marks).reduce((acc, curr) => {
          try {
            const parsedArray = JSON.parse(curr[0]);
            ///@ts-ignore
            return acc + parsedArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
          } catch (e) {
            return 0;
          }
        }, 0) + "," + activeQuiz.questions.reduce((acc, question) => {
          ///@ts-ignore
          return acc + parseInt(question.marks);
        }, 0) + ((activeQuiz?.users) ? ",," + activeQuiz?.quiz_code : "") : ""}
        menuClick={setActiveQuestion}
        activeQuestion={activeQuestion}
      />
      <main className={`${sidebarOpen ? 'lg:pl-72' : 'lg:pl-8 pl-4'}`}>

        {/* Add padding right if right column is showing */}
        <div className={showRightColumn ? "md:pr-96" : ""}>

          {activeQuiz.questions?.length > 0 && <div className="lg:hidden flex justify-center mt-2">
            {activeQuestion > 0 && <a
              onClick={() => setAQ(activeQuestion - 1)}
            ><ArrowSmallLeftIcon className="h-8 inline-block cursor-pointer" /></a>}
            <span className='pt-1'>{activeQuestion + 1} / {activeQuiz.questions.length}</span>
            {activeQuestion + 1 < activeQuiz.questions.length && <a
              onClick={nextQuestion}
            ><ArrowSmallRightIcon className="h-8 inline-block cursor-pointer" /></a>}
          </div>}
          <div className=" px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
            {/* Central column */}
            <Background />

            {/* Show question/answer anrea if activeQuiz.questions exists, loading Skeleton if not */}

            <div>
              <div className={`flex flex-col ${activeQuiz?.questions?.[activeQuestion]?.questionText?.length > 200 ? 'md:flex-row' : ''} overflow-hidden`}>
                {/* Question Area */}
                <div className={`w-full ${activeQuiz?.questions?.[activeQuestion]?.questionText?.length > 200 ? 'md:w-1/2 md:max-h-[100vh] md:overflow-y-auto md:overflow-x-clip' : ''}`}>
                  {(activeQuiz?.questions?.[activeQuestion]?.questionText) ? (
                    <div className="px-4 max-lg:mr-4 mt-4 font-bold text-lg w-full">
                      <RenderMath content={activeQuiz?.questions?.[activeQuestion]?.questionText} activeQuestion={activeQuestion + 1} />
                      <p className="text-sm mt-3">
                        {`${activeQuiz?.questions?.[activeQuestion]?.marks ?? 0} mark${(activeQuiz?.questions?.[activeQuestion]?.marks ?? 0) > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  ) : <><div className="h-5"></div><Skeleton lines={3} /></>}
                </div>

                {/* Answer Area */}
                <div className={`w-full ${activeQuiz?.questions?.[activeQuestion]?.questionText?.length > 200 ? 'md:w-1/2 md:max-h-[100vh] md:overflow-y-auto' : ''}`}>
                  {typeof activeQuiz?.questions?.[activeQuestion]?.interface === 'string' ? (
                    <>
                      {activeQuiz.questions[activeQuestion].interface === "maths" ? (
                        <MathquillContainer
                          activeQuestion={activeQuestion}
                          answers={score.answers}
                          handleChange={editableContentHandleChange}
                          type={activeQuiz.questions[activeQuestion].questionText.includes("\\sum") ? 2 : activeQuiz.questions[activeQuestion].questionText.includes("ntegr") ? 1 : 0}
                        />
                      ) :
                        activeQuiz.questions[activeQuestion].interface === "mc" ? (
                          <MCContainer
                            activeQuestion={activeQuestion}
                            answers={score.answers}
                            handleChange={editableContentHandleChange}
                            markScheme={activeQuiz.questions[activeQuestion].markScheme}
                          />
                        ) : (
                          <EditableContent
                            handleChange={(e) => editableContentHandleChange(e.target.value)}
                            content={score.answers[activeQuestion] ?? ""}
                            type={activeQuiz.questions[activeQuestion].interface ?? "standard"}
                          />
                        )}
                      <Button
                        onClick={markQuestion}
                        isNormalState={gptActive === 0}
                        buttonText="submit"
                        style={1}
                        extraClasses="relative -top-12 right-2 float-right"
                      />
                    </>
                  ) : (
                    <Skeleton height="h-80" />
                  )}
                </div>
              </div>

              {/* Toggle Button */}
              <button
                className={`max-md:hidden fixed bottom-4 ${sidebarOpen ? 'left-[300px]' : 'left-4'} max-lg:left-4`}
                onClick={() => setIsColumnLayout(!isColumnLayout)}>
                <svg
                  className={`dark:text-white text-gray-900 w-8 h-8 ${isColumnLayout ? 'transform rotate-90' : ''}`}
                  width="800px" height="800px" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19.9 13.5H4.1C2.6 13.5 2 14.14 2 15.73V19.77C2 21.36 2.6 22 4.1 22H19.9C21.4 22 22 21.36 22 19.77V15.73C22 14.14 21.4 13.5 19.9 13.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.9 2H4.1C2.6 2 2 2.64 2 4.23V8.27C2 9.86 2.6 10.5 4.1 10.5H19.9C21.4 10.5 22 9.86 22 8.27V4.23C22 2.64 21.4 2 19.9 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* top right button, opens right column */}
            <button
              className="rounded-full text-sm font-semibold text-indigo-600 dark:text-white shadow-sm  focus-visible:outline absolute top-4 right-4"
              onClick={() => {
                // remove focus from math field
                if (document.activeElement) {
                  (document.activeElement as HTMLElement).blur();
                }
                setShowRightColumn(!showRightColumn)
              }}
            >
              <AcademicCapIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/*// Rob Only!! */}
            {user?.uid == "fMpTHfks6ENABDw2QDrte8olAMJ3---" ? (
              <AudioPlayer content={audioToPlay} startChatResponse={startChatResponse} />
            ) : null}

          </div>
        </div>
      </main >

      {/* Right sidebar */}
      < RightSidebar
        showRightColumn={showRightColumn}
        setShowRightColumn={setShowRightColumn}
        markingExplanation={markingExplanation}
        currentMarking={currentMarking}
        gptActive={gptActive}
        explanationIsVisible={explanationIsVisible}
        setExplanationIsVisible={setExplanationIsVisible}
        whyButtonIsVisibile={whyButtonIsVisible}
        question={activeQuiz?.questions?.[activeQuestion] ?? {}}
        startChatResponse={startChatResponse}
        chatResponse={chatResponse}
        chatHistory={chatHistory}
        quizID={typeof activeQuiz?.questions?.[activeQuestion]?.interface === 'string' ? activeQuiz.id : 0} // needed to tell whether the question has loaded or not
        activeQuestion={activeQuestion}
        totalQuestions={activeQuiz?.questions?.length ?? 0
        }
        ///@ts-ignore
        setActiveQuestion={setActiveQuestion}
        sendFeedback={sendFeedback}
      />
    </>
  );
}


export default withAuthorization(QuizPage);