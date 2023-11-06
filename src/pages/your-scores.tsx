import { useState, useEffect } from "react";
import { useUserAuth } from "../context/userAuthContext";
import { useRouter } from 'next/router';
import { apiCall } from "@/utils/apiClient";
import { useTranslation } from "next-i18next";
import { Quiz, Score } from "@/utils/types";

// components
import Skeleton from "@/app/components/Skeleton"; // skeleton loading component
import Background from "@/app/components/Background"; // background blur effect
import ScoresList from "@/app/components/ScoresList";
import { useModal } from "@/context/modalContext";
import Sidebar from "@/app/components/Sidebar";
import withAuthorization from "./withAuthorization";


function CreateQuizPage() {
  const [scores, setScores] = useState < Score[] > ([]);

  const { t } = useTranslation();
  //@ts-ignore
  const { showModal } = useModal();

  // scores and quizzes state
  const [quizObject, setQuizObject] = useState < { [key: number]: Quiz } > ({});

  //@ts-ignore
  const { user } = useUserAuth(); // get user from context

  // API call to get quiz by id once the user variable is available
  useEffect(() => {
    async function getData() {
      if (user) {

        apiCall('/marks')
          .then((_data: Score[] | string) => {
            console.log(_data)
            if (typeof _data === "string") {
              showModal("marks-fail", 0, "go-to-your-quizzes", "your-quizzes");
            } else {
              if (!_data.length) {
                showModal("no-marks", 0, "go-to-your-quizzes", "your-quizzes");
              }
              setScores(_data); // set active quiz to the quiz returned from the api

              const uniqueQuizIds: number[] = [];

              _data.forEach((quizObject) => {
                //@ts-ignore
                if (!uniqueQuizIds.includes(quizObject.quiz_id)) {
                  //@ts-ignore
                  uniqueQuizIds.push(quizObject.quiz_id);
                }
              });
              console.log({ "quiz_ids": uniqueQuizIds })
              apiCall('/quizzes_data', { "quiz_ids": uniqueQuizIds })
                .then((_data: Quiz[] | string) => {
                  if (typeof _data === "string") {
                    showModal("quizlist-fail", 0, "go-home", "home");
                  } else {
                    console.log(_data)
                    if (!_data.length) {
                      showModal("quizlist-fail", 0, "go-home", "home");
                    }
                    _data.forEach((quiz) => {
                      setQuizObject((prevState) => ({
                        ...prevState,
                        [quiz.id]: quiz,
                      }));
                    });
                    console.log(_data); // set active quiz to the quiz returned from the api
                  }
                })
                .catch(() => {
                  showModal("quizlist-fail", 0, "go-home", "home");
                });
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

          < div className="custom-main-div">
            <div className="min-w-0 flex-1">
              <h2 className="custom-h2">

                {t("your-scores")}

              </h2>
            </div>
          </div>


          {scores.length ? (

            <ScoresList scores={scores} quizzes={quizObject} />

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