import { useState, useEffect, Fragment } from "react";
import { useUserAuth } from "../context/userAuthContext";
import { apiCall } from "@/utils/apiClient";
import { Quiz, Score } from "@/utils/types";


// components
import Sidebar from "@/app/components/Sidebar";
import Skeleton from "@/app/components/Skeleton"; // skeleton loading component
import Background from "@/app/components/Background"; // background blur effect
import { useModal } from "@/context/modalContext";

import InsightsArea from "@/app/components/InsightsArea";

import ScoresList from "@/app/components/ScoresList";
import withAuthorization from "./withAuthorization";

 function ScoresPage() {
  const [scores, setScores] = useState < Score[] > ([]);
  const [activeQuiz, setActiveQuiz] = useState < Quiz > ({} as Quiz);

  //@ts-ignore
  const { showModal } = useModal();

  //@ts-ignore
  const { user } = useUserAuth(); // get user from context


  // API call to get quiz by id once the user variable is available
  useEffect(() => {
    async function getData() {
      if (user) {

        apiCall('/quizzes/' + window.location.hash.substring(1))
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

        apiCall('/getmarksbyquizid/' + window.location.hash.substring(1))
          .then((_data: Score[] | string) => {
            if (typeof _data === "string") {
              showModal("marks-fail", 0, "go-to-your-quizzes", "your-quizzes");
            } else {
              if (!_data.length) {
                showModal("no-marks", 0, "go-to-your-quizzes", "your-quizzes");
              } else {
                setScores(_data);
              }
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
          />


          {scores.length ? (

            <ScoresList scores={scores} quizzes={{ [activeQuiz.id]: activeQuiz }} />

          ) : (
            <Skeleton lines={10} />
          )
          }



        </div>
      </main >


    </>
  )
}

export default withAuthorization(ScoresPage);