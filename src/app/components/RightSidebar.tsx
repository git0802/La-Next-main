import React, { useRef, useEffect } from "react";
import { useRouter } from "next/router";

import {
    ChevronDownIcon,
    XMarkIcon,
    QuestionMarkCircleIcon,
    TvIcon,
    PencilIcon,
    StarIcon,
    AcademicCapIcon,
    PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";
import { Transition } from "@headlessui/react"; // animations? Not certain these are workng, are they needed?
import Button from "./Button";
import LoadingDots from "./LoadingDots"; // loading dots animation component
import Skeleton from "./Skeleton";
import { Question } from "@/utils/types";

import { useCustomTranslation } from "../../utils/useTranlsation";
import { HandThumbDownIcon } from "@heroicons/react/20/solid";
import RenderMath from "./RenderMath";

const menuItems = [
    { icon: <QuestionMarkCircleIcon />, text: "where-wrong" },
    { icon: <StarIcon />, text: "give-hint" },
    { icon: <TvIcon />, text: "find-video" },
    { icon: <PencilIcon />, text: "similar-example" },
];

type RightSidebarProps = {
    showRightColumn: boolean;
    setShowRightColumn: React.Dispatch<React.SetStateAction<boolean>>;
    markingExplanation?: string;
    currentMarking?: number[];
    gptActive: number;
    explanationIsVisible?: boolean;
    setExplanationIsVisible?: React.Dispatch<React.SetStateAction<boolean>>;
    whyButtonIsVisibile?: boolean;
    question?: Question;
    startChatResponse: (chatInputRef: string) => void;
    chatResponse: string;
    chatHistory: string[];
    quizID: number;
    activeQuestion: number;
    totalQuestions?: number;
    setActiveQuestion?: React.Dispatch<React.SetStateAction<number>>;
    sendFeedback: () => void;
};

export default function RightSidebar({
    showRightColumn,
    setShowRightColumn,
    markingExplanation,
    currentMarking,
    gptActive,
    explanationIsVisible,
    setExplanationIsVisible,
    whyButtonIsVisibile,
    question,
    startChatResponse,
    chatResponse,
    chatHistory,
    quizID,
    activeQuestion,
    totalQuestions,
    setActiveQuestion,
    sendFeedback
}: RightSidebarProps) {
    const listRef = useRef(null);


    console.log("explanationIsVisible",explanationIsVisible);
    // this is required to make the chat text box display properly on mobile
    useEffect(() => {
        function setDynamicHeight() {
            const div = document.querySelector('.chat-window');
            let windowHeight = window.innerHeight;

            if(explanationIsVisible)
            {
                windowHeight = windowHeight- 150;
            }
            //it's a csae of mobile 
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                //@ts-ignore
                div.style.height = `${windowHeight - 300}px`;
            }
            else {
                //@ts-ignore
                div.style.height = `${windowHeight - 250}px`;
            }
        }

        // Add event listener for window resize
        window.addEventListener('resize', setDynamicHeight);
        // Initial call to set height
        setDynamicHeight();
        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', setDynamicHeight);
        };
    }, [explanationIsVisible]); // Empty dependency array ensures this effect runs once after component mounts


    const { t } = useCustomTranslation();

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && gptActive <= 0) {
            startChatResponse(chatInputRef.current?.value ?? "");
        }
    };
    function scrollToBottom() {
        if (listRef.current) {
            //@ts-ignore
            listRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }
    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    useEffect(() => {
        scrollToBottom();
    }, [chatResponse]);

    const chatInputRef = useRef < HTMLInputElement > (null);

    const router = useRouter();

    function redirect(url: string) {
        router.push(url);
    }

    function extractMarks(str: string) {
        const regex = /^([A-Z])(\d+)/gm;
        let match;
        const result = [];

        while ((match = regex.exec(str)) !== null) {
            result.push([match[1], match[2]]);
        }

        return result;
    }

    const extractedMarks = extractMarks(question?.markScheme ?? "");

    return (
        <>
            <aside
                className={`md:border-l md:border-l-gray-200 md:dark:border-l-gray-600 fixed inset-y-0 right-0 ${showRightColumn ? "block" : "hidden"
                    } md:w-96 w-screen h-screen`}
            >
                {/* Top right button to close right column */}
                <button
                    type="button"
                    className="absolute text-gray-900 top-4 right-4 dark:text-white"
                    onClick={() => setShowRightColumn(false)}
                >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon className="h-6 w-6 md:text-white" aria-hidden="true" />
                </button>

                <div className="flex h-full flex-col divide-y divide-gray-200 dark:divide-gray-600 bg-white shadow-xl w-full">
                    {/* h-0 flex-1 dark:bg-gray-800 overflow-y-auto */}
                    <div className="h-0 flex-1 dark:bg-gray-800">
                        <div className="bg-indigo-600 dark:bg-gray-900 px-4 py-6 sm:px-6">
                            <div className="flex items-center justify-between">
                                {" "}
                                {/* min-h-[78.5px] is the height of the top section, add to maintain the height when loading dots are displayed */}
                                <div className="text-base font-semibold leading-6 text-white text-center w-full ">
                                    {/* Shows marking when available, Question Help when not, and Loading dots while marking (and skeleton while loading */}

                                    {(quizID && currentMarking) ? (
                                        currentMarking.length ? (
                                            <>
                                                <div>
                                                    {t("your-mark")}:{" "}
                                                    {currentMarking.reduce((accumulator, currentValue) => accumulator + currentValue, 0)}{" "}
                                                    {t("out-of")} {question?.marks}
                                                    <a
                                                        onClick={sendFeedback}>
                                                        <HandThumbDownIcon className="relative -top-[2px] h-4 inline-block pl-2 cursor-pointer" />
                                                    </a>
                                                </div>
                                                <hr className="my-3"></hr>
                                                <Menu
                                                    as="div"
                                                    className="w-full"
                                                >

                                                    <Menu.Button>
                                                        {
                                                            currentMarking.map((mark, index) => {

                                                                const answer = (parseInt(extractedMarks?.[index]?.[1] ?? "0") > 1) ? mark : mark === 0 ? "✘" : "✓";

                                                                return (
                                                                    <span
                                                                        className="mr-4 whitespace-nowrap"
                                                                        key={index}
                                                                    >{`${extractedMarks?.[index]?.[0] ?? "M"}${extractedMarks?.[index]?.[1] ?? "1"} - ${answer}`}</span>
                                                                );
                                                            })}
                                                        <span className="text-sm relative -left-2">&#9660;</span>
                                                        {/* 'Why' button allows users to view/hide the explanation for the marking      */}

                                                    </Menu.Button>

                                                    {(whyButtonIsVisibile && markingExplanation && setExplanationIsVisible) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setExplanationIsVisible(!explanationIsVisible);
                                                            }}
                                                            className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                        >
                                                            {t(explanationIsVisible ? "hide" : "why")}
                                                        </button>
                                                    )}

                                                    <Transition
                                                        as={React.Fragment}
                                                        enter="transition ease-out duration-100"
                                                        enterFrom="transform opacity-0 scale-95"
                                                        enterTo="transform opacity-100 scale-100"
                                                        leave="transition ease-in duration-75"
                                                        leaveFrom="transform opacity-100 scale-100"
                                                        leaveTo="transform opacity-0 scale-95"
                                                    >
                                                        <Menu.Items className="absolute mt-2 w-[335px] origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 bg-gray-100 text-gray-900 overflow-y-scroll max-h-96 px-4 py-2 text-sm text-left">

                                                            <Menu.Item>
                                                                <div>
                                                                    <p className="pb-4 text-base">
                                                                        Mark Scheme
                                                                    </p>
                                                                    <RenderMath content={question?.markScheme ?? ""} />
                                                                </div>
                                                            </Menu.Item>

                                                        </Menu.Items>
                                                    </Transition>
                                                </Menu>
                                            </>
                                        ) : gptActive == 1 ? (
                                            <>
                                                <LoadingDots />
                                            </>
                                        ) : t("question-help")
                                    ) : (
                                        <div className="w-80 mt-8">
                                            <Skeleton lines={2} />
                                        </div>
                                    )}


                                </div>
                            </div>
                            <div className="mt-1 text-sm text-indigo-100 max-h-96 overflow-y-scroll">

                                {/* Show marking explanation if present */}
                                {
                                    explanationIsVisible && currentMarking?.length ? (
                                        <RenderMath content={markingExplanation ?? ""} />
                                    ) : null
                                }


                            </div>
                        </div>

                        <div className="flex flex-1 flex-col justify-between">
                            <div className="divide-y divide-gray-200 dark:divide-gray-600 px-4 sm:px-6">
                                <div className="pb-5 pt-6 w-full flex justify-center">
                                    {/* Dropdown button with suggested actions to get help */}
                                    {quizID ? (
                                        <>
                                            <div className="w-1/3 text-center md:hidden">
                                                <Button
                                                    onClick={() => setShowRightColumn(false)}
                                                    buttonText="retry"
                                                    style={1} // 1 = white bg, 0 = indigo bg
                                                />
                                            </div>
                                            <div className="w-1/3 md:w-[200px]">
                                                <Menu
                                                    as="div"
                                                    className="text-center relative"
                                                >
                                                    <div>
                                                        <Menu.Button className="inline-flex w-100 justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-500 dark:text-white">
                                                            <AcademicCapIcon
                                                                className="h-5 w-5"
                                                                aria-hidden="true"
                                                            />
                                                            {t("help")}
                                                            <ChevronDownIcon
                                                                className="-mr-1 h-5 w-5 text-gray-400"
                                                                aria-hidden="true"
                                                            />
                                                        </Menu.Button>
                                                    </div>


                                                    <Transition
                                                        as={React.Fragment}
                                                        enter="transition ease-out duration-100"
                                                        enterFrom="transform opacity-0 scale-95"
                                                        enterTo="transform opacity-100 scale-100"
                                                        leave="transition ease-in duration-75"
                                                        leaveFrom="transform opacity-100 scale-100"
                                                        leaveTo="transform opacity-0 scale-95"
                                                    >
                                                        <Menu.Items className="absolute -right-28 lg:-right-[70px] z-10 mt-2 w-[21rem] origin-top-right custom-ul rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                            <div className="py-1">
                                                                {menuItems.map((item, index) => (
                                                                    <Menu.Item key={index}>
                                                                        <a
                                                                            className="group flex items-center px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-200"
                                                                            onClick={() => {
                                                                                // if the item is find-video or similar-example, append the translation to the message (so that the request can be processed in the correct language)
                                                                                let messageToSend = (item.text === 'find-video' || item.text === 'similar-example')
                                                                                    ? item.text + t(item.text)
                                                                                    : t(item.text);
                                                                                startChatResponse(messageToSend);
                                                                            }}
                                                                        >
                                                                            {React.cloneElement(item.icon, {
                                                                                className:
                                                                                    "mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500",
                                                                                "aria-hidden": "true",
                                                                            })}
                                                                            {t(item.text)}
                                                                        </a>
                                                                    </Menu.Item>
                                                                ))}
                                                            </div>
                                                        </Menu.Items>
                                                    </Transition>
                                                </Menu>
                                            </div>
                                            <div className="w-1/3 md:hidden text-center">
                                                {(setActiveQuestion && totalQuestions) && (activeQuestion < totalQuestions - 1 ? (
                                                    <Button
                                                        onClick={() => {
                                                            setActiveQuestion(activeQuestion + 1)
                                                            setShowRightColumn(false)
                                                        }
                                                        }
                                                        buttonText="next-q"
                                                        style={1}
                                                    />
                                                ) : (
                                                    <Button
                                                        onClick={() => {
                                                            redirect("your-score#" + quizID)
                                                        }
                                                        }
                                                        buttonText="view-score"
                                                        style={1}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full">
                                            <Skeleton height="h-8" />
                                        </div>
                                    )}
                                </div>

                                {/* chat window  */}
                                {/* <div className="pt-4 flex-grow"> */}
                                <div style={{ marginTop: "0px" }} className={`flex-1 justify-between flex flex-col chat-window overflow-y-auto pb-20`}>
                                    {quizID ? (
                                        <div
                                            className="flex flex-col space-y-4 p-3"
                                        >
                                            {chatHistory && chatHistory.map((chat, index) => (
                                                <div
                                                    ref={listRef}
                                                    key={index}
                                                    className="chat-message"
                                                >
                                                    {index % 2 === 0 ? (
                                                        <div className="flex items-end justify-end">
                                                            <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end">
                                                                <div>
                                                                    <span className="px-4 py-2 rounded-lg inline-block rounded-br-none bg-indigo-600 text-white">
                                                                        {t(chat)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-end">
                                                            <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
                                                                <div>
                                                                    <span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-200 text-gray-900">
                                                                        <RenderMath content={chat} />
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {gptActive == 2 && (
                                                <div className="chat-message">
                                                    <div className="flex items-end">
                                                        <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
                                                            <div>
                                                                <span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-200 text-gray-900">
                                                                    <RenderMath content={chatResponse} />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full">
                                            <Skeleton lines={6} />
                                        </div>
                                    )}
                                </div>
                                {/* </div> */}
                            </div>
                        </div>
                    </div>

                    {/* chat input and send button*/}
                    <div className="flex flex-shrink-0 px-4 py-4 dark:bg-gray-900 bg-white z-10">
                        {quizID ? (
                            <div className="mt-2 flex rounded-md shadow-sm w-full">
                                <input
                                    ref={chatInputRef}
                                    onKeyUp={handleKeyPress}
                                    className="custom-input-text w-full"
                                    placeholder={t("help-me")}
                                />
                                <button
                                    type="button"
                                    disabled={gptActive > 0}
                                    onClick={() => startChatResponse(chatInputRef.current?.value ?? "")}
                                    className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 bg-indigo-600 hover:bg-indigo-500"
                                >
                                    <PaperAirplaneIcon
                                        className="-ml-0.5 h-5 w-5 text-white"
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                        ) : (
                            <div className="w-full h-12">
                                <Skeleton height="h-8" />
                            </div>
                        )}
                    </div>
                </div>
            </aside >
        </>
    );
}