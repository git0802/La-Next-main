import { useState, useEffect } from "react";
import { useUserAuth } from "../context/userAuthContext";
import { useRouter } from "next/router";

// components
import RightSidebar from "../app/components/RightSidebar"; // right sidebar
import Skeleton from "@/app/components/Skeleton"; // skeleton loading component
import { AcademicCapIcon } from "@heroicons/react/24/outline"; // icons
import Background from "@/app/components/Background"; // background blur effect
import Sidebar from "@/app/components/Sidebar";
import { useModal } from "@/context/modalContext";
import Button from "@/app/components/Button";

// utils
import { GPTInteraction, GPTCourse } from "@/utils/OpenAIFunctions"; // for making api calls to ChatGPT
import { NavigationItem, Course } from "../utils/types"; // relevant types
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
  const [activeTopic, setAT] = useState < number > (-1); // currently displayedtopic

  const [activeCourse, setActiveCourse] = useState < Course > ({} as Course); // currently active quiz object - contains questions and other quiz info

  // top left menu items (questions)
  const [navigation, setNavigation] = useState([] as NavigationItem[]);

  const [gptActive, setGptActive] = useState(0); // 0 - not active, 1 - marking, 2 - chat, 3 - marking finished, needs processing, 4 - chat finished, needs processing

  const [gptPrompt, setGptPrompt] = useState(""); // track full GPT request, to be sent to cache

  // chat and quiz creation states (not used yet)
  const [chatResponse, setChatResponse] = useState("");
  const [chatHistory, setChatHistory] = useState < string[] > ([]);
  const [courseResponse, setCourseResponse] = useState("");
  const [videoURLs, setVideoURLs] = useState < string[] > ([]);

  const [recentHashValue, setRecentHashValue] = useState(""); // save hash value for feedback

  const [audioToPlay, setAudioToPlay] = useState(""); // text for audio player

  //@ts-ignore
  const { user } = useUserAuth();

  // function to handle clicks to the left sidebar menu to change the active question
  function setActiveTopic(i: number) {
    if (!gptActive) setAT(i);
  }

  //@ts-ignore
  const { showModal } = useModal();
  const router = useRouter();

  const nextTopic = () => {
    if (activeTopic < activeCourse.topics.length - 1) setAT(activeTopic + 1);
  }

  const startChatResponse = async (chatInput: string) => {
    if (!activeCourse?.id) {
      showModal("no-chat-while-generating");
    } else {
      // set chatinput to question, or Help me if no question
      chatInput = chatInput ? chatInput : "Help me!";
      setChatResponse(""); // reset chat response
      setGptActive(2); // set chat fetch active (activates loading states for button and right column)

      // call GPT
      const result = await GPTInteraction(
        ["course-chat"],
        activeCourse?.topics?.[activeTopic].topicText,
        "chat",
        processChatResponse,
        [...chatHistory, chatInput]
      );

      // remove special instructions for chatGPT from chatInput

      chatInput = chatInput.replace(/(find-video|similar-example)/g, '').trim();

      // update state variables for future calls
      setChatHistory((prevChatHistory) => [...prevChatHistory, chatInput]);

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

  // Process quiz creation response (here, checking for DONE is done in the courseResponse useeffect)
  function processCourseResponse(response: string) {
    if (response == "[error]") {
      const urlSearchParams = new URLSearchParams(window.location.search);
      showModal("quiz-creation-failed", 0, "go-back", "create-quiz?description=" + urlSearchParams.get("description"));
    } else {
      setCourseResponse((prevState) => prevState + response);
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

  function cleanString(str: string): string {
    // Remove \n from the beginning and end
    str = str.replace(/^\n+|\n+$/g, '');

    // Remove " or ' from the beginning and end
    str = str.replace(/^["']+|["']+$/g, '');

    return str;
  }

  // Process courseResponse when it changes to populate activeCourse
  useEffect(() => {
    if (courseResponse) {
      // remove [DONE] from response
      const currentCourseResponse = courseResponse.replaceAll("[DONE]", "");

      const courseArr = currentCourseResponse.split("\n~'~\n");
      let newactiveCourse = {} as Course;

      newactiveCourse.id = -1;

      newactiveCourse.topics = [];



      newactiveCourse.name = (courseArr[1]) ? cleanString(courseArr[1]) : "Creating course...";
      courseArr[0].split("\n~~\n").forEach((topic, index) => {
        const topicDetails = topic.split("\n~-\n");

        let newTopic = { title: "", topicText: topicDetails[0], video: "", quiz: "" };
        newTopic.title = cleanString(topicDetails[0]);
        if (topicDetails[1]) newTopic.topicText = topicDetails[1];
        if (videoURLs[index] && videoURLs[index] != "fetching") newTopic.video = videoURLs[index];
        if (topicDetails[3]) {
          newTopic.quiz = topicDetails[3];
          // get video url if needed
          if (topicDetails[2] && !videoURLs[index]) {
            fetch(`https://learnanything-uk.stackstaging.com/youtubeapi.php?query=${encodeURIComponent(topicDetails[2])}`)
              .then((r) => {
                try {
                  if (r.ok) {
                    return r.text(); // Assuming the response is plain text
                  } else {
                    throw new Error(`HTTP Error ${r.status}`);
                  }
                } catch (e) {
                  console.error(e);
                }
              })
              .then((textData) => {
                // Handle the plain text data here
                console.log("fetched video url " + index + " " + textData)
                const updatedVideoURLs = [...videoURLs];
                updatedVideoURLs[index] = textData ?? "";
                setVideoURLs(updatedVideoURLs);
              })
              .catch((error) => {
                console.error(error);
              });

          }


        }
        newactiveCourse.topics.push(newTopic)
      });

      if (activeTopic == -1) setActiveTopic(0)
      console.log(newactiveCourse)
      setActiveCourse(newactiveCourse);

      // if quiz creation complete process it
      if (courseResponse.includes("[DONE]")) {

        if (courseResponse.slice(-6) == "[DONE]") { // [DONE] at end means came from GPT stream, so cache
          setCourseResponse((prevState) => prevState.slice(0, -6))
          setGptActive(10); // indicate gpt streaming has finished, needs to be cached
        }

        // save to API under user account and update URL with quiz_id

        apiCall('/course', newactiveCourse).then((r) => {
          try {
            setActiveCourse(r)
            window.history.replaceState({}, '', 'course#' + r.id);
          } catch (e) {
            console.error(e)
          }
        })


      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseResponse]);

  // when gptActive becomes false, marking is completed, send results to cache
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (gptActive > 2) {
      // gptActive is 4 (chat) when gpt has finished streaming

      //post to cache
      hashStringWithSHA1(gptPrompt).then((hashValue) => {
        setRecentHashValue(hashValue)
        try {
          const body = {
            sent: gptPrompt,
            received: chatResponse,
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
    toLocalStorage("chatHistory", chatHistory, activeTopic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatHistory]);

  // when activeCourse.topics changes (on page load or while quiz is building), set navigation (top left menu links) to the topics in the course
  useEffect(() => {
    if (Array.isArray(activeCourse?.topics))
      setNavigation(
        activeCourse.topics.map((topic, index) => {
          return {
            name: topic.title,
            id: index,
            current: index === 0 ? true : false,
          };
        })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCourse.topics]);



  // Store data in localstorage
  function toLocalStorage(
    varName: string,
    value: string[] | string[][],
    activeTopic?: number
  ) {
    const activeCourseId = activeCourse.id;
    if (activeCourseId) {
      const existingData = localStorage.getItem(varName);
      let storedData: {
        [key: string]:
        | string[]
        | string[][]
        | { [subKey: string]: string[] | string[][] };
      } = existingData ? JSON.parse(existingData) : {};

      if (activeTopic !== undefined) {
        if (!storedData[activeCourseId]) {
          storedData[activeCourseId] = {} as {
            [subKey: string]: string[] | string[][];
          };
        }
        (
          storedData[activeCourseId] as {
            [subKey: string]: string[] | string[][];
          }
        )[activeTopic] = value;
      } else {
        storedData[activeCourseId] = value;
      }

      localStorage.setItem(varName, JSON.stringify(storedData));

    }
  }

  function fromLocalStorage(
    varName: string,
    setFunction: (value: string[]) => void,
    questionForData?: number
  ) {
    const activeCourseId = activeCourse.id;
    if (activeCourseId) {
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
        const objectData = storedData[activeCourseId] as {
          [subKey: string]: string[];
        };
        if (objectData && objectData[questionForData] !== undefined) {

          setFunction(objectData[questionForData]);
        } else setFunction([]);
      } else {
        if (storedData[activeCourseId] !== undefined) {
          setFunction(storedData[activeCourseId] as string[]);
        } else setFunction([]);
      }
    }
  }

  function redirect(url: string) {
    router.push(url);
  }

  // when activeTopic changes get new data
  useEffect(() => {
    fromLocalStorage("chatHistory", setChatHistory, activeTopic * -1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopic]);

  // API call to get course by id once the user variable is available
  useEffect(() => {
    async function getData() {


      if (user && !activeCourse?.topics) {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const courseDescription = urlSearchParams.get("description");
        if (courseDescription) {
          console.log(courseDescription)
          const result = await GPTCourse(
            courseDescription,
            processCourseResponse
          );
          setGptPrompt(result);
        } else {
          const activeCourseCode = window.location.hash.substring(1);

          if (!activeCourseCode) {
            showModal("no-course", 0, "go-home", "home"); // if no quiz id in url, show error
          } else {
            /*
            let token = await user.getIdToken(); // This returns a promise with the JWT token
            fetch(`/quiz/api?id=${"/getquizbycode/" + activeCourseCode}&token=${token}`)
              .then((data) => data.json())
              //@ts-ignore
              .then((_data: Quiz | string) => {*/
            apiCall('/course/' + activeCourseCode).then((r: Course | string) => {
              if (typeof r === "string") {
                showModal("no-course", 0, "go-home", "home");
              } else {

                if (activeTopic == -1) setActiveTopic(0)

                // update answerHistory and chatHistory from localstorage (saved while using temporary quiz id)
                fromLocalStorage("chatHistory", setChatHistory, activeTopic * -1);

                setActiveCourse(r)


              }
            })
              .catch((e) => {
                console.error(e)
                showModal("course-fail", 0, "go-home", "home");
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
        head={activeCourse?.name}
        menuClick={setActiveTopic}
        activeQuestion={activeTopic}
      />
      <main className={`${sidebarOpen ? 'lg:pl-72' : 'lg:pl-8 pl-4'}`}>

        {/* Add padding right if right column is showing */}
        <div className={showRightColumn ? "md:pr-96" : ""}>

          {activeCourse.topics?.length > 0 && <div className="lg:hidden flex justify-center mt-2">
            {activeTopic > 0 && <a
              onClick={() => setAT(activeTopic - 1)}
            ><ArrowSmallLeftIcon className="h-8 inline-block cursor-pointer" /></a>}
            <span className='pt-1'>{activeTopic + 1} / {activeCourse.topics.length}</span>
            {activeTopic + 1 < activeCourse.topics.length && <a
              onClick={nextTopic}
            ><ArrowSmallRightIcon className="h-8 inline-block cursor-pointer" /></a>}
          </div>}
          <div className=" px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
            {/* Central column */}
            <Background />

            {/* Show question/answer anrea if activeCourse.questions exists, loading Skeleton if not */}

            {(activeCourse?.topics?.[activeTopic]?.title) ? (
              <div className="px-4 max-lg:mr-4 mt-4 font-bold text-lg w-full">
                <RenderMath content={activeCourse?.topics?.[activeTopic]?.title} activeQuestion={activeTopic + 1} />
              </div>
            ) : (
              <>
                <div className="h-5"></div>
                <Skeleton lines={6} />
              </>
            )}
            <div className="relative w-full max-w-3xl">
              {activeCourse?.topics?.[activeTopic]?.video && (
                <div className="flex justify-center items-center">
                  <iframe
                    className="m-5 w-full h-[56.25vw] md:w-[350px] md:h-[195px] lg:w-[400px] lg:h-[225px]"
                    src={`https://www.youtube.com/embed/${activeCourse?.topics?.[activeTopic]?.video}`}
                    allowFullScreen
                  ></iframe>
                </div>
              )}


              {(activeCourse?.topics?.[activeTopic]?.topicText) ? (
                <div className="px-4 mt-4 text-sm">
                  <RenderMath content={activeCourse?.topics?.[activeTopic]?.topicText || ""} />

                  {activeCourse?.topics?.[activeTopic]?.quiz ? <Button
                    onClick={() => redirect("quiz?description=" + activeCourse?.topics?.[activeTopic]?.quiz)}
                    buttonText="take-quiz"
                    extraClasses="mt-4"
                  ></Button> : ""}

                </div>
              ) : ""}



            </div>



            {/* top right button, opens right column */}
            <button
              className="rounded-full text-sm font-semibold text-indigo-600 dark:text-white shadow-sm  focus-visible:outline absolute top-4 right-4"
              onClick={() => setShowRightColumn(!showRightColumn)}
            >
              <AcademicCapIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/*// Rob Only!! */}
            {user?.uid == "FTNxXAvWP9N49dkwfOxX1vaERx03" ? (
              <AudioPlayer content={audioToPlay} startChatResponse={startChatResponse} />
            ) : null}

          </div>
        </div>
      </main >

      {/* Right sidebar */}
      < RightSidebar
        showRightColumn={showRightColumn}
        setShowRightColumn={setShowRightColumn}
        gptActive={gptActive}
        startChatResponse={startChatResponse}
        chatResponse={chatResponse}
        chatHistory={chatHistory}
        quizID={activeCourse?.id}
        activeQuestion={activeTopic}
        totalQuestions={activeCourse?.topics?.length ?? 0
        }
        sendFeedback={sendFeedback}
      />
    </>
  );
}


export default withAuthorization(QuizPage)