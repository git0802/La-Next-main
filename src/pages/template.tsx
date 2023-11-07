import React, { useEffect, useState } from "react";
import { useUserAuth } from "../context/userAuthContext";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "next-export-i18n";
import { apiCall } from "@/utils/apiClient";

import Modal from "@/app/components/Modal";

const QuizList = React.lazy(() => import("@/app/components/QuizList"));

const Profile = () => {
  //@ts-ignore
  const { user, logOut } = useUserAuth();
  const router = useRouter();

  const [showPopup, setShowPopup] = useState(false);
  const [_msg, setMessage] = useState("");
  const [msgType, setMsgType] = useState(0);

  // const { i18n } = useTranslation();
  // // console.log(router.locale)
  // useEffect(() => {
  //   //@ts-ignore
  //   i18n.changeLanguage(router.locale ?? "en");
    
  // }, [router.locale, i18n]);
  useEffect(() => {
    apiCall('/quizzes')
      .then((data: any[] | string) => {
        console.log(data)
        if (typeof data === "string" && data === "error") {
          //setShowPopup(true);
          setMessage("Something went wrong. Please try again later.");
        } else {
          
        }
      })
      .catch(() => {
        // This is to handle any unexpected errors that might occur outside of the returned 'error' string
        setMessage("An example error");
        setShowPopup(true);
      });
  }, []);

  const { t } = useTranslation();
  

  if (user) {

    

    return (
      <>
        <Head>
          <meta name="description" content="Profile Page" />
          <title>Profile</title>
        </Head>

        <QuizList />
      </>
    );
  }
};
export default Profile;
