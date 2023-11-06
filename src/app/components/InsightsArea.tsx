import { Fragment, useState, useEffect } from "react";
import { formatDateToRelative } from "@/utils/functions";
import { Insight, Quiz, Score } from "@/utils/types";
import { useTranslation } from "next-i18next";
import { apiCall } from "@/utils/apiClient";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { GPTInsights } from "@/utils/OpenAIFunctions";
import { useModal } from "@/context/modalContext";
import Skeleton from "./Skeleton";
import Link from "next/link";

interface InsightsAreaProps {
    activeQuiz: Quiz;
    scores: Score[];
    singleUser?: boolean;
}

const InsightsArea: React.FC<InsightsAreaProps> = ({ activeQuiz, scores, singleUser = false }) => {

    const [selectedInsight, setSelectedInsight] = useState < string > ('');

    const [insights, setInsights] = useState < Insight[] > ([]);
    const [insight, setInsight] = useState("");
    const [insightLoading, setInsightLoading] = useState < boolean > (false);


    function classNames(...classes: string[]): string {
        return classes.filter(Boolean).join(' ')
    }

    const { t } = useTranslation();
    const { showModal } = useModal();

    function processInsightResponse(response: string) {
        if (response.substring(0, 6) === "[DONE]") {
            /* 
            Not using cache here, so no need to do this
            if (response !== "[DONE]") {
              setInsight((prevState) => prevState + response.substring(6));
            }*/
            setInsightLoading(false);

        } else {
            setInsight((prevState) => prevState + response);
        }
    }



    async function generateInsights(type = "general-insights") {
        setInsightLoading(true);
        GPTInsights(
            scores,
            activeQuiz?.questions,
            type + (singleUser ? "|single-user" : ""),
            processInsightResponse
        );
    }

    // Function to handle the dropdown change
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedInsight(e.target.value);
    };

    useEffect(() => {
        // Upload insight to database
        if (!insightLoading && insight) {
            apiCall('/insights', { "insight": insight, "quiz_id": activeQuiz.id }).then((data: Insight | string) => {
                if (typeof data !== "string") {
                    setInsights((prevState) => [...prevState, data]);
                    setSelectedInsight(data.insight)
                }
                setInsight("")
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [insightLoading]);

    useEffect(() => {
        if (activeQuiz) {
            // Get insights
            apiCall('/getinsightsbyquizid/' + window.location.hash.substring(1))
                .then((data: Insight[] | string) => {
                    if (typeof data !== "string" && data.length) {
                        setInsights(data);
                    }
                })
                .catch(() => {
                    showModal("quiz-fail", 0, "go-home", "home");
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeQuiz]);







    return (
        <>
            {activeQuiz.name ? (
                <>
                    <div className="custom-main-div">
                        <div className="min-w-0 flex-1">
                            <h2 className="custom-h2">

                                <Link href={"quiz#" + activeQuiz.quiz_code}> {t("scores-for")}  &apos;{activeQuiz.name}&apos;</Link>

                            </h2>
                        </div>


                        <div className="mt-4 flex md:ml-4 md:mt-0">

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
                                    <Menu.Items className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none dark:bg-gray-700 ">
                                        <Menu.Item>
                                            <a
                                                onClick={() => generateInsights("general-insights")}
                                                className=
                                                ' font-bold dark:bg-gray-600 block px-3 py-1 leading-6 text-gray-900 dark:text-white'
                                            >
                                                {t("generate-insights")}<span className="sr-only">{t("generate-insights")}</span>
                                            </a>

                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <a
                                                    onClick={() => generateInsights("general-insights")}
                                                    className={classNames(
                                                        active ? 'bg-gray-200 dark:bg-gray-600' : '',
                                                        'custom-a'
                                                    )}
                                                >
                                                    {t("general-insights")}<span className="sr-only">{t("general-insights")}</span>
                                                </a>
                                            )}
                                        </Menu.Item>
                                        {!singleUser && <Menu.Item>
                                            {({ active }) => (
                                                <a
                                                    onClick={() => generateInsights("student-by-student")}
                                                    className={classNames(
                                                        active ? 'bg-gray-200 dark:bg-gray-600' : '',
                                                        'custom-a'
                                                    )}
                                                >
                                                    {t("student-by-student")}<span className="sr-only">{t("student-by-student")}</span>
                                                </a>
                                            )}
                                        </Menu.Item>}
                                        <Menu.Item>
                                            {({ active }) => (
                                                <a
                                                    onClick={() => generateInsights("common-errors")}
                                                    className={classNames(
                                                        active ? 'bg-gray-200 dark:bg-gray-600' : '',
                                                        'block px-3 py-1 text-sm leading-6 '
                                                    )}
                                                >
                                                    {t("common-errors")}<span className="sr-only">{t("common-errors")}</span>
                                                </a>
                                            )}
                                        </Menu.Item>
                                        {!singleUser && <Menu.Item>
                                            {({ active }) => (
                                                <a
                                                    onClick={() => generateInsights("teacher-recommendations")}
                                                    className={classNames(
                                                        active ? 'bg-gray-200 dark:bg-gray-600 ' : '',
                                                        'block px-3 py-1 text-sm leading-6'
                                                    )}
                                                >
                                                    {t("teacher-recommendations")}<span className="sr-only">{t("teacher-recommendations")}</span>
                                                </a>
                                            )}
                                        </Menu.Item>}
                                        {singleUser && <Menu.Item>
                                            {({ active }) => (
                                                <a
                                                    onClick={() => generateInsights("student-recommendations")}
                                                    className={classNames(
                                                        active ? 'bg-gray-200 dark:bg-gray-600 ' : '',
                                                        'block px-3 py-1 text-sm leading-6'
                                                    )}
                                                >
                                                    {t("student-recommendations")}<span className="sr-only">{t("student-recommendations")}</span>
                                                </a>
                                            )}
                                        </Menu.Item>}
                                        <Menu.Item>
                                            {({ active }) => (
                                                <a
                                                    onClick={() => showModal("insight-describe", 2, "get-insight", generateInsights, "", 2)}
                                                    className={classNames(
                                                        active ? 'bg-gray-200 dark:bg-gray-600' : '',
                                                        'block px-3 py-1 text-sm leading-6 '
                                                    )}
                                                >
                                                    {t("custom-insight")}...<span className="sr-only">{t("custom-insight")}</span>
                                                </a>
                                            )}
                                        </Menu.Item>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        </div>
                    </div>


                    {(insights.length && !insight) ?
                        (
                            <>
                                {/* Dropdown for previous insights */}
                                <div>
                                    <select onChange={handleSelectChange}
                                        value={selectedInsight}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white">
                                        <option value="">View insight...</option>
                                        {insights.map((ins, index) => (
                                            <option key={index} value={ins.insight}>
                                                {ins.updated_at ? formatDateToRelative(ins.updated_at) + " - " + ins.insight.split(' ').slice(0, 10).join(" ") + "..." : "New insight"}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Display the selected insight in a rounded rectangle */}
                                {selectedInsight && (
                                    <div className="mt-4 mb-4 p-4 pt-1 bg-gray-200 rounded dark:bg-gray-700 dark:text-white">
                                        {selectedInsight.split('\n').map((paragraph: string, index: number) => (
                                            <p className="pt-2" key={index}>{paragraph}</p>
                                        ))}
                                    </div>
                                )}

                            </>) :
                        insight && <div className="m-4 p-4 pt-1 bg-gray-200 rounded dark:bg-gray-700 dark:text-white">
                            {insight.split('\n').map((paragraph: string, index: number) => (
                                <p className="pt-2" key={index}>{paragraph}</p>
                            ))}
                        </div>
                    }
                </>
            ) :
                <Skeleton />
            }
        </>
    );
};

export default InsightsArea;
