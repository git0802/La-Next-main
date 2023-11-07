import { FullScore, Quiz } from "@/utils/types";
import { useState } from "react";
import { useTranslation } from "next-export-i18n";
import dynamic from "next/dynamic";
import "../app/components/mathquill.css";
import withAuthorization from "./withAuthorization";

type Props = {
  fullScores: FullScore[];
  activeQuiz?: Quiz;
};

const FullScoreList: React.FC<Props> = ({ fullScores = [], activeQuiz = {} }) => {
  const [showComment, setShowComment] = useState(0);
  const { t } = useTranslation();

  const DynamicStaticMathField = dynamic(
    () => import('react-mathquill').then((mod) => mod.StaticMathField),
    { ssr: false }
  );
  const render = (text: string, type = "") => {
    if (type === "maths") {
      const lines = text.split('\n');
      return lines.map((line, lineIndex) => {
        return <DynamicStaticMathField key={`part-${lineIndex}`}>{line}</DynamicStaticMathField>;
      })
    } else {
      const parts = text.split(/<m>(.*?)<\/m>/g);

      return parts.map((part, index) => {
        if (index % 2 === 0) {
          return part;
        } else {
          return <DynamicStaticMathField key={index}>{part}</DynamicStaticMathField>;
        }
      });
    }
  };

  return (
    <ul role="list" className="gap-x-6 gap-y-8 xl:gap-x-8 block">

      {fullScores && fullScores.map((fullScore) => (
        <li key={fullScore.answer} className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600">
          <div className="gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6 dark:bg-gray-700 ">
            <div className="flex align-text-bottomtext-sm font-medium leading-6 text-gray-900 dark:text-white"><span className="self-end">{fullScore.question_number}. {render(activeQuiz?.questions?.[fullScore.id]?.questionText ?? "")}</span></div>

          </div>
          <dl className="-my-3 custom-ul px-6 py-4 text-sm leading-6 bg-white dark:bg-gray-900">
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-800 dark:text-gray-200 flex-grow-0 overflow-x-auto">
                {
                  (fullScore.answer ?? "").split("\n").map((str, index, array) => {
                    //@ts-ignore
                    if (activeQuiz?.questions?.[fullScore.id]?.interface === "code") {
                      return (
                        <pre key={index}>
                          {
                          //@ts-ignore
                          render(str, activeQuiz?.questions?.[fullScore.id]?.interface ?? "")}
                        </pre>
                      );
                    } else {
                      return (
                        <p key={index}>
                          {
                          //@ts-ignore
                          render(str, activeQuiz?.questions?.[fullScore.id]?.interface ?? "")}
                        </p>
                      );
                    }
                  })
                }
              </dt>
              <dd className="text-gray-800 dark:text-gray-200 text-center w-40 flex-shrink-0 border-l border-gray-300">
                {fullScore.total} out of {fullScore.outOf}
                <div>
                  <button
                    type="button"
                    onMouseEnter={() => {
                      setShowComment(fullScore.id + 1);
                    }}
                    onMouseLeave={() => {
                      setShowComment(0);
                    }}
                    className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    {t("view-comment")}
                  </button>
                  {showComment == fullScore.id + 1 && (
                    <div className="absolute 
                    bg-white 
                    dark:bg-gray-800 
                    border 
                    dark:border-gray-700 
                    rounded 
                    p-2 
                     z-50
                    dark:text-white"
                    >
                      {fullScore.explanation}
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onMouseEnter={() => {
                      setShowComment(100 + fullScore.id);
                    }}
                    onMouseLeave={() => {
                      setShowComment(0);
                    }}
                    className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    {t("view-markscheme")}
                  </button>
                  {(showComment == (100 + fullScore.id)) && (
                    <pre className="absolute 
                    bg-white 
                    dark:bg-gray-800 
                    border 
                    dark:border-gray-700 
                    rounded 
                    p-2 
                     z-50
                    dark:text-white"
                    >
                      {render(activeQuiz?.questions?.[fullScore.id]?.markScheme || "")}
                    </pre>
                  )}
                </div>
              </dd>
            </div>
          </dl>
        </li>

      ))}
    </ul>
  );
};

// Export the Button component
export default withAuthorization(FullScoreList);
