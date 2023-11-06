import React, { useState, useEffect } from 'react';
import FullScoreList from '../../pages/FullScoreList';
import { Score, ProcessedScore, FullScore, Quiz } from '@/utils/types';
import Button from './Button';
import { formatDateToRelative } from '@/utils/functions';

import { useTranslation } from "next-i18next";

interface ScoresListProps {
  scores: Score[];
  quizzes?: { [key: number]: Quiz };
  singleUser?: boolean;
}

const createCSVDownload = (
  data: FullScore[][],
  quizzes: { [key: number]: Quiz },
  processedScores: ProcessedScore[]
) => {
  const headers = ['', 'Question Text', 'Answer', 'Mark', 'Total', 'Explanation'];
  const csvRows: string[] = [];


  // Add headers only once at the top
  csvRows.push(headers.join(','));

  data.forEach((fullScoreArray, index) => {
    if (fullScoreArray.length === 0) return; // Skip empty score arrays

    const firstItem = fullScoreArray[0];
    const quizInfo = quizzes[firstItem.quiz_id];
    const scoreInfo = processedScores[index];

    const displayName = scoreInfo?.user_name || quizInfo?.name || scoreInfo?.name;

    if (displayName) {
      csvRows.push(displayName);
    }

    fullScoreArray.forEach((item) => {
      const questionText = quizInfo?.questions?.[item.question_number - 1]?.questionText || '';
      const row = [
        item.question_number,
        `"${questionText.replace(/"/g, '""')}"`,
        `"${item.answer.replace(/"/g, '""')}"`, // Escape any quotes in `answer`
        item.total,
        item.outOf,
        `"${item.explanation.replace(/"/g, '""').replace(/\n/g, ' ')}"` // Escape any quotes and remove line breaks in `explanation`
      ];
      csvRows.push(row.join(','));
    });

    // Insert a blank row at the end of each quiz
    csvRows.push('');
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = 'Scores.csv';
  link.click();

  URL.revokeObjectURL(blobUrl);
};




const ScoresList: React.FC<ScoresListProps> = ({ scores, quizzes, singleUser = false }) => {
  const [showFullResults, setShowFullResults] = useState < { [key: string]: boolean } > ({});
  const [processedScores, setProcessedScores] = useState < ProcessedScore[] > ([]);
  const [fullScores, setFullScores] = useState < FullScore[][] > ([]);

  const { t } = useTranslation();

  // Function to toggle the visibility of the full score list for a specific score
  const handleToggle = (scoreId: number) => {
    setShowFullResults((prevState) => ({
      ...prevState,
      [scoreId]: !prevState[scoreId],
    }));
  };


  let tempProcessedScores: ProcessedScore[] = [], tempFullScores: FullScore[][] = [];

  useEffect(() => {
    if (singleUser) setShowFullResults({ 0: true })

    scores.forEach((score, i) => {
      let fullScore: FullScore[] = []; // Initialize as an empty array
      try {
        let total = 0, outOf = 0, attempted = 0;
        for (const currentQuestion in score.marks) {
          if (Object.hasOwnProperty.call(score.marks, currentQuestion)) {
            const mark = score.marks[parseInt(currentQuestion)];
            if (mark[0]) {
              mark[0] = JSON.parse(mark[0])
              attempted++;
              const questionOutOf = mark[0].length;
              outOf += questionOutOf;
              let questionTotal = 0;
              for (let m of mark[0]) {
                questionTotal += parseInt(m);
              }
              total += questionTotal;
              fullScore.push({
                question_number: parseInt(currentQuestion) + 1,
                answer: score.answers[parseInt(currentQuestion)],
                total: questionTotal,
                outOf: questionOutOf,
                explanation: mark[1],
                id: fullScore.length,
                quiz_id: score.quiz_id || 0,
              });
            }
          }
        }
        outOf = quizzes && score && score.quiz_id && quizzes[score.quiz_id]?.questions
          ? quizzes[score.quiz_id].questions.reduce((acc, question) => {
            const marks = Number(question.marks);
            if (!isNaN(marks)) {
              return acc + marks;
            }
            return acc;
          }, 0)
          : outOf;

        const decimalScore = total / outOf;

        tempProcessedScores.push({
          id: i,
          name: scores[i].name || "",
          updated_at: scores[i].updated_at || "",
          total: total,
          outOf: outOf,
          attempted: attempted,
          status: decimalScore > 0.9 ? "green" : decimalScore > 0.7 ? "grey" : "yellow",
          quiz_id: score.quiz_id || 0,
          user_name: score.user_name || "",
        });
        tempFullScores.push(fullScore);
      } catch (error) {
        // Handle any errors here
        console.error(error);
      }
    });

    if (!tempProcessedScores.length || !tempFullScores.length) {
      //showModal("no-marks", 0, "go-to-your-quizzes", "your-quizzes");
    } else {
      console.log(tempFullScores)
      setFullScores(tempFullScores)
      setProcessedScores(tempProcessedScores)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores]);

  const statuses = {
    'green': 'text-green-700 bg-green-50 ring-green-600/20',
    'grey': 'text-gray-600 bg-gray-50 ring-gray-500/10',
    'yellow': 'text-yellow-800 bg-yellow-50 ring-yellow-600/20',
  }

  return (
    <ul role="list" className=' mb-60'>
      {/* Export Button */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => createCSVDownload(fullScores, quizzes || {}, processedScores)}
          buttonText="export"
        />
      </div>

      {processedScores.map((score: ProcessedScore) => (
        <div key={score.id}>
          <li className="flex items-center justify-between gap-x-6 py-5">
            <div className="min-w-0">
              <div className="flex items-start gap-x-3">
                <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                  {score.user_name || quizzes?.[score?.quiz_id]?.name || score.name}
                </p>
                <p
                  className={`rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statuses[score.status]
                    }`}
                >
                  {score.total + " " + t('out-of') + " " + score.outOf}
                </p>
              </div>
              <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-700 dark:text-gray-300">
                <p className="whitespace-nowrap">
                  {t("completed")} <time dateTime={score.updated_at}>{formatDateToRelative(score.updated_at)}</time>
                </p>
                <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                  <circle cx={1} cy={1} r={1} />
                </svg>
                <p className="truncate">{score.attempted} {t("question" + (score.attempted == 1 ? "" : "s") + "-completed")}</p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              <Button
                onClick={() => handleToggle(score.id)} // Pass the score id to handleToggle
                style={1}
                buttonText={showFullResults[score.id] ? 'hide-results' : 'full-results'}
              />
            </div>
          </li>
          {showFullResults[score.id] && (

            <FullScoreList fullScores={fullScores[score.id]} activeQuiz={quizzes?.[score.quiz_id]} />

          )}
        </div>
      ))}
    </ul>
  );
};

export default ScoresList;
