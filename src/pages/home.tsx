import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from 'next/router';
import { useUserAuth } from "../context/userAuthContext";

// components
import Button from "@/app/components/Button"; // button component
import { useModal } from "@/context/modalContext";
import Link from "next/link";
import axios from 'axios';
import Contant from "../context/contant";

// utils
import Background from "@/app/components/Background";
import Sidebar from "@/app/components/Sidebar";
import withAuthorization from "./withAuthorization";
function CreateQuizPage() {

  const [username, setUsername] = useState('');
  const [updatingUsername, setUpdatingUsername] = useState(false);
  const [quizCode, setQuizCode] = useState('');

  const { t } = useTranslation();
  //@ts-ignore
  const router = useRouter();
  //@ts-ignore
  const { showModal } = useModal();
  //@ts-ignore
  const { user } = useUserAuth(); // get user from context

  const updateUsername = async () => {
    // Implement your update logic here
    setUpdatingUsername(true);
    if (!username) showModal("no-username"); else {

      const config = {
        headers: {
          'Authorization': localStorage.getItem("token"),
          // Other headers can be added here as needed
        }
      };

      const formData = new FormData();
      formData.append('user_name', username);
      formData.append('action', 'update_user_info');
      const user = await axios.post(Contant.API, formData, config);
      let data = user.data;
      //@ts-ignore
      if (data.success == true) {
        setUpdatingUsername(false);
      }
      else {
        setUpdatingUsername(false);
        showModal("username-update-fail");
      }
      /*
      try {
        apiCall('/user_update', { "user_name": username }).then((data) => {
          setUpdatingUsername(false);
          if (typeof data === "string" && data.includes("error")) {
            showModal("username-update-fail");
          }
        });
      } catch (e) {
        setUpdatingUsername(false);
        showModal("username-update-fail");
      }*/
    }

  }

  useEffect(() => {
    if (user) {
      try {
        const config = {
          headers: {
            'Authorization': localStorage.getItem("token"),
            // Other headers can be added here as needed
          }
        };
        axios(Contant.API, config).then((data) => {
          let _data = data?.data;
          if (_data?.user) {
            setUsername(_data?.user?.user_name);
          }
        });
      } catch (e) {
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function redirect(url?: string) {
    if (!url) {
      if (quizCode) url = "quiz#" + (quizCode.toUpperCase()); else {
        showModal("no-quizcode");
        return;
      }
    }
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
        <div className=" px-4 py-20 sm:px-6 lg:px-8 lg:py-6 ">
          {/* Central column */}
          <Background />

          <div className="custom-main-div">
            <div className="min-w-0 flex-1">
              <h2 className="custom-h2">
                {t("learn-anything")}
              </h2>
            </div>
          </div>

          <div className="col-span-full">
            <p className="custom-label">
              {t("welcome-text")}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="m-2">
                <Button
                  onClick={() => redirect("create-quiz")}
                  buttonText="create-a-quiz"
                ></Button>
              </div>
              <div className="m-2">
                <Button
                  onClick={() => redirect("quiz#OA7FN")}
                  buttonText="try-a-quiz"
                ></Button>
              </div><div className="m-2">
                <Button
                  onClick={() => redirect("your-quizzes")}
                  buttonText="your-quizzes"
                ></Button>
              </div><div className="m-2">
                <Button
                  onClick={() => redirect("your-scores")}
                  buttonText="your-scores"
                ></Button>
              </div>
            </div>

            <div className="col-span-full border-t mt-4 pt-4">
              <p className="custom-p text-lg font-bold">
                {t("enter-quiz-code")}
              </p>
              <p className="custom-p">
                {t("quizcode-description")}
              </p>
              <input
                type="text"
                onChange={(e) => setQuizCode(e.target.value)}
                className="block mt-4 mb-4 custom-input-text"
              />
              <Button
                onClick={redirect}
                style={2}
                buttonText="submit" />

            </div>
            {username ? (
              <div className="border-t mt-4 pt-4">
                <p className="custom-p text-lg font-bold">
                  {t("your-username")}
                </p>
                <p className="custom-p">
                  {t("username-description")}
                </p>
                <input
                  type="text"
                  value={username}
                  defaultValue={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-[300px] mt-4 mb-4 rounded-md custom-input-text"
                />
                <Button
                  onClick={updateUsername}
                  isNormalState={!updatingUsername}
                  style={2}
                  buttonText="update" />

              </div>)
              : ""}

          </div>

        </div>
      </main >


    </>
  )

}

export default withAuthorization(CreateQuizPage);