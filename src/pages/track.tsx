import { useState, useEffect, Fragment } from "react";
import { useUserAuth } from "../context/userAuthContext";
import { useRouter } from 'next/router';
import { apiCall } from "@/utils/apiClient";
import { useTranslation } from "next-i18next";
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { Quiz } from "../utils/types"; // relevant types
import Link from "next/link";

// components
import Button from "@/app/components/Button"; // button component
import Skeleton from "@/app/components/Skeleton"; // skeleton loading component
import Background from "@/app/components/Background"; // background blur effect
import Sidebar from "@/app/components/Sidebar";
import { useModal } from "@/context/modalContext";

import { formatDateToRelative } from '@/utils/functions';

export default function YourQuizzesPage() {

  const { t } = useTranslation();
  //@ts-ignore
  const { showModal } = useModal();

  // quiz list state
  const [quizzes, setQuizzes] = useState < Quiz[] > ([])
  const [deleteQuizID, setDeleteQuizID] = useState < number > (0)

  //@ts-ignore
  const { user } = useUserAuth(); // get user from context

  // API call to get quiz by id once the user variable is available
  useEffect(() => {
    async function getData() {
      if (user) {
        apiCall('/track/bmat')
          //@ts-ignore
          .then((_data: Quiz[] | string) => {
            if (typeof _data === "string") {
              showModal("quizlist-fail", 0, "go-home", "home");
            } else {
              console.log(_data);
            }
          })
          .catch((e) => {
            showModal("quizlist-fail", 0, "go-home", "home");
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

  const deleteQuiz = () => {
    // Find the index of the quiz to delete
    const quizIndex = quizzes.findIndex((quiz) => quiz.id === deleteQuizID);

    // Find the quiz object
    const quiz = quizzes[quizIndex];

    if (quiz) {
      // Create a new array without the quiz to delete
      const newQuizzes = quizzes.filter((quiz) => quiz.id !== deleteQuizID);

      // Update the state with the new array
      setQuizzes(newQuizzes);

      // Mark the quiz as deleted
      quiz.users = "deleted" + (user.uid ?? "");

      // Make the API call to delete the quiz
      apiCall('/quizzes/' + deleteQuizID, quiz)
        .then((_data: Quiz | string) => {
          if (typeof _data === "string") {
            // Insert the quiz back at its original position
            newQuizzes.splice(quizIndex, 0, quiz);

            // Update the state again
            setQuizzes([...newQuizzes]);

            // Show the modal
            showModal("quiz-remove-fail", 0, "close", "");
          }
        });

      setDeleteQuizID(0);
    }
  };


  function classNames(...classes: string[]): string {
    return classes.filter(Boolean).join(' ')
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

          <div className="custom-main-div">
            <div className="min-w-0 flex-1">
              <h2 className="custom-h2">
                {t("your-quizzes")}
              </h2>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0">

              <Button
                onClick={() => followLink("create-quiz")}
                buttonText="create-a-quiz"
                style={1}
              />
            </div>
          </div>

          {/* Show quizzes if they exist, loading Skeleton if not */}
          {quizzes.length ? (

            <ul role="list" className="custom-ul">
              {quizzes.map((quiz) => (
                <li key={quiz.id} className="flex items-center justify-between gap-x-6 pb-3 pt-3">
                  <div className="min-w-0">
                    <div className="flex items-start gap-x-3">
                      <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">{quiz.name} -  <a
                        className="cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(quiz.quiz_code);
                          showModal("quiz-code-copied", 2)
                        }}>{quiz.quiz_code}</a></p>
                      {/* add status if needed
                    <p
                      className={classNames(
                        statuses[quiz.status],
                        'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset'
                      )}
                    >
                      {quiz.status}
                    </p>
                      */}
                    </div>
                    <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-700 dark:text-gray-300">
                      {quiz.created_at &&
                        <>
                          <p className="whitespace-nowrap">
                            {t("created")} <time dateTime={quiz.created_at}>{formatDateToRelative(quiz.created_at)}</time>
                          </p>

                          <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                            <circle cx={1} cy={1} r={1} />
                          </svg>
                        </>
                      }
                      {quiz.updated_at &&
                        <p className="truncate">{t("updated")} <time dateTime={quiz.updated_at}>{formatDateToRelative(quiz.updated_at)}</time></p>
                      }
                    </div>
                  </div>
                  <div className="flex flex-none items-center gap-x-4">
                    <Button
                      onClick={() => followLink("quiz#" + quiz.quiz_code)}
                      buttonText="view-quiz"
                    />

                    <Menu as="div" className="relative flex-none">
                      <Menu.Button className="custom-menu-option">
                        <span className="sr-only">Open options</span>
                        <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none dark:bg-gray-700 ">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                onClick={() => {
                                  navigator.clipboard.writeText(quiz.quiz_code);
                                  showModal(quiz.quiz_code, 2, undefined, undefined, "share-quiz-instructions");
                                }}
                                className={classNames(
                                  active ? 'bg-gray-200 dark:bg-gray-600' : '',
                                  'custom-a'
                                )}
                              >
                                {t("share-quiz")}<span className="sr-only">, {t("share-quiz")}</span>
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href={"scores#" + quiz.id}
                                className={classNames(
                                  active ? 'bg-gray-200 dark:bg-gray-600' : '',
                                  'custom-a'
                                )}
                              >
                                {t("view-scores")}<span className="sr-only">, {t("view-scores")}</span>
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href={"edit-quiz#" + quiz.quiz_code}
                                className={classNames(
                                  active ? 'bg-gray-200 dark:bg-gray-600' : '',
                                  'custom-a'
                                )}
                              >
                                {t("edit")} {t("quiz")}<span className="sr-only">, {t("edit")} {t("quiz")}</span>
                              </Link>

                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a

                                onClick={() => {
                                  setDeleteQuizID(quiz.id);
                                  showModal("delete-confirm", 1, "delete", deleteQuiz, "", 1)
                                }}
                                className={classNames(
                                  active ? 'bg-gray-200 dark:bg-gray-600 text-red-400' : '',
                                  'block px-3 py-1 text-sm leading-6 text-red-500'
                                )}
                              >
                                {t("delete")} {t("quiz")}<span className="sr-only">, {t("delete")} {t("quiz")}</span>
                              </a>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </li>
              ))}
            </ul>

          ) : (
            <Skeleton lines={6} />
          )
          }



        </div>
      </main >


    </>
  )
}
