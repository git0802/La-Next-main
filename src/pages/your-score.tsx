import { useState, useEffect, Fragment } from "react";
import { useUserAuth } from "../context/userAuthContext";
import { useRouter } from 'next/router';
import { apiCall } from "@/utils/apiClient";
import { useTranslation } from "next-i18next";
import { Quiz, Score } from "@/utils/types";

// components
import InsightsArea from "@/app/components/InsightsArea";
import Skeleton from "@/app/components/Skeleton"; // skeleton loading component
import Background from "@/app/components/Background"; // background blur effect
import ScoresList from "@/app/components/ScoresList";
import { useModal } from "@/context/modalContext";
import Sidebar from "@/app/components/Sidebar";
import withAuthorization from "./withAuthorization";


function CreateQuizPage() {

  const { t } = useTranslation();
  //@ts-ignore
  const { showModal } = useModal();

  // scores list state
  const [activeQuiz, setActiveQuiz] = useState < Quiz > ({} as Quiz);
  const [scores, setScores] = useState < Score[] > ([]);

  //@ts-ignore
  const { user } = useUserAuth(); // get user from context


  // API call to get marks and quiz by id once the user variable is available
  useEffect(() => {

    const activeQuizId = parseInt(window.location.hash.substring(1));
    if (activeQuizId === 0) return;
    async function getData() {
      if (user) {
        apiCall('/quizzes/' + activeQuizId)
          .then((_data: Quiz | string) => {
            if (typeof _data === "string") {
              showModal("no-quiz", 0, "go-home", "home");
            } else {
              setActiveQuiz(_data); // set active quiz to the quiz returned from the api
            }
          })
          .catch(() => {
            showModal("quiz-fail", 0, "go-home", "home");
          });


        apiCall('/getmarksbyquizid/' + activeQuizId)
          .then((_data: Score[] | string) => {
            if (typeof _data === "string") {
              showModal("marks-fail", 0, "go-to-your-quizzes", "your-quizzes");
            } else {
              if (!_data.length) {
                showModal("no-marks", 0, "go-to-your-quizzes", "your-quizzes");
              }

              setScores(_data.map(({ user_name, ...rest }) => rest)); // set active quiz to the quiz returned from the api
            }
          })
          .catch(() => {
            showModal("marks-fail", 0, "go-to-your-quizzes", "your-quizzes");
          });


      }
    }
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);



  const router = useRouter();

  const followLink = (url: string) => {
    router.push(url);
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
        <div className="custom-div-title">
          {/* Central column */}
          <Background />

          <InsightsArea
            activeQuiz={activeQuiz}
            scores={scores}
            singleUser={true}
          />

          {scores.length ? (

            <ScoresList scores={scores} quizzes={{ [activeQuiz.id]: activeQuiz }} singleUser={true} />

          ) : (
            <Skeleton lines={10} />
          )
          }

        </div>
      </main >


    </>
  )
}


export default withAuthorization(CreateQuizPage);