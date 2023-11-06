import { useState, useEffect } from "react";
import { useUserAuth } from "../context/userAuthContext";
import Link from "next/link";
import { apiCall } from "@/utils/apiClient";
import { useTranslation } from "next-i18next";
import { Course } from "@/utils/types";

// components
import Skeleton from "@/app/components/Skeleton"; // skeleton loading component
import Background from "@/app/components/Background"; // background blur effect
import { useModal } from "@/context/modalContext";
import Sidebar from "@/app/components/Sidebar";
import withAuthorization from "./withAuthorization";


 function CreateQuizPage() {
  const [courses, setCourses] = useState < Course[] > ([]);

  const { t } = useTranslation();
  //@ts-ignore
  const { showModal } = useModal();


  //@ts-ignore
  const { user } = useUserAuth(); // get user from context

  // API call to get quiz by id once the user variable is available
  useEffect(() => {
    async function getData() {
      if (user) {

        apiCall('/course')
          .then((_data: Course[] | string) => {
            if (typeof _data === "string") {
              showModal("course-fail", 0, "go-home", "home");
            } else {
              if (!_data.length) {
                showModal("no-courses", 0, "create-course", "create-course");
              }
              setCourses(_data); // set active quiz to the quiz returned from the api

            }
          })
          .catch(() => {
            showModal("course-fail", 0, "go-home", "home");
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

          < div className="custom-main-div">
            <div className="min-w-0 flex-1">
              <h2 className="custom-h2">

                {t("your-courses")}

              </h2>
            </div>
          </div>


          {courses.length ? (
            <div>
              <ul>
                {courses.map((course) => (
                  <li key={course.id}>
                    <Link href={`/course#${course.id}`}>
                      {course.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Skeleton lines={10} />
          )}



        </div>
      </main >


    </>
  )
}

export default withAuthorization(CreateQuizPage);
