
import React, { useEffect, useState } from "react";
import { Quiz } from "@/utils/types";
import ErrorAlert from "./Alert";
import Modal from "./Modal";
import { apiCall } from "@/utils/apiClient";

const data = {
  questions: JSON.stringify({
    "title": "Example Quiz",
    "questions": [
      {
        "subject": "maths",
        "questionText": "There are two angles on a straight line, one is 120 degrees. Find the other angle. <br><br>There is is a third angle which is double the second angle. Find that angle.",
        "markScheme": "Answer      Mark\n180 - 120      A1\n60              B1\n60*2            C1ft\n120             D1",
        "marks": "4"
      },
      {
        "subject": "maths",
        "questionText": "Which is bigger, 1/2 or 2/3? Explain your answer.",
        "markScheme": "Answer       Mark\nGets correct fraction    A1\nHas a valid explanation     B1",
        "marks": "2"
      },{
        "subject": "maths",
        "questionText": "Solve 3x+1=5",
        "markScheme": "3x=4   A1\nx=4/3    B1",
        "marks": "2",
        "interface": "maths"
      },{
        "subject": "physics",
        "questionText": "Describe a method to determine the extension of a string being stretched by weights.",
        "markScheme": "Mark        Answer\nA1        measure the original length of the spring and the extended length of the spring (with the metre rule)\nB1             extension = extended length – original length",
        "marks": "2"
      },{
        "subject": "geog",
        "questionText": "Outline <b>one</b> advantage of recycling waste. (2 marks)",
        "markScheme": "One mark for a basic statement, eg\n Reduces amount going to landfill (a1)\n Saves resources (a1)\n Reduction in energy consumption (a1)\n\nTwo marks for a developed idea, eg\n Reduces amount going to landfill (a1) which cuts the amount of land needed to bury waste (b1)\n Saves resources (a1) as new materials do not have to be found to replace those thrown away (b1)\n Reduction in energy consumption (a1) as recycling is a less energy intensive process (b1)\nCredit any reasonable advantage.\nNo credit for description of a recycling process.",
        "marks": "2"
      },{
        "subject": "french",
        "questionText": "In French, write about what you did last summer (10 marks)",
        "markScheme": "9-10 A very good response covering all aspects of the task. Communication is clear and a lot of information is conveyed. Opinions are expressed.\n7-8 A good response covering all aspects of the task. Communication is mostly clear but perhaps with occasional lapses. Quite a lot of information is conveyed. Opinions are expressed.\n5-6 A reasonable response covering almost all aspects of the task. Communication is generally clear but there are likely to be lapses. Some information is conveyed. An opinion is expressed.\n3-4 A basic response covering some aspects of the task. Communication is sometimes clear but there are instances where messages break down. Little information is conveyed. An opinion is expressed.\n-2 A limited response covering some aspects of the task. Communication is often not clear and there may be frequent instances where messages break down. Very little information is conveyed. There may be no opinions expressed.\n0 The content does not meet the standard required for a mark at this tier.",
        "marks": "10",
        "starter": "L'été dernier, j'ai passé de merveilleux moments à profiter du soleil et à explorer de nouveaux endroits. J'ai commencé par des vacances en famille à la plage, où nous nous sommes baignés dans les eaux cristallines et avons construit des châteaux de sable. Ensuite, j'ai rejoint un groupe d'amis pour un road trip épique à travers la campagne. Nous avons fait du camping, avons randonné dans de magnifiques sentiers et avons apprécié des paysages à couper le souffle. J'ai également eu l'occasion de me plonger dans mes passe-temps préférés, comme la lecture de livres captivants et la pratique de la photographie. Dans l'ensemble, mon été a été rempli de moments inoubliables et de précieuses expériences qui resteront gravés dans ma mémoire pour toujours."
      },{
        "subject": "computing",
        "questionText": "Write a javascript function to produce the first 5 prime numbers. Make it as efficient as possible. (4 marks)",
        "markScheme": "A1 - some attempt to write some relevant javascript\nB1 - working code that produces at least one prime number, or buggy code that almost produces all 5 prime numbers\nC1 - working code that produces the 5 prime numbers\nD1 - efficient working code that produces the 5 prime numbers",
        "marks": "2",
        "starter": "console.log(2)"
      }
    ]
  }),
  name: "Example Quiz",
};
const updatedata = {
  questions: "[1, 2, 3]",
  name: "Updated quiz for robpercival81@gmail.com",
};
/*
postQuiz(data).then((res) => {
  console.log(res);
});

postQuizById(37,updatedata).then(res=>{
    console.log(res)

 })

 getQuizById(60).then(res=>{
    console.log(res)
 })
*/


const QuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [error, setError] = useState<boolean | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [_msg, setMessage] = useState("");
  const [msgType, setMsgType] = useState(0);

  useEffect(() => {
    apiCall('/quizzes')
      .then((data: Quiz[] | string) => {
        console.log(data)
        if (typeof data === "string" && data === "error") {
          //setShowPopup(true);
          setMessage("Something went wrong. Please try again later.");
        } else {
          setQuizzes(data as Quiz[]);
        }
      })
      .catch(() => {
        // This is to handle any unexpected errors that might occur outside of the returned 'error' string
        setMessage("An example error");
        setShowPopup(true);
      });
  }, []);

  return (
    <div>
      {showPopup && (
        <Modal
          open={showPopup}
          setOpen={setShowPopup}
          message={_msg}
          type={msgType}
        />
      )}
      <h2 className="font-bold">Your Quizzes</h2>
      {_msg ? (
        <ErrorAlert />
      ) : quizzes === null || quizzes === undefined ? (
        <div className="max-w-sm animate-pulse">
          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
          <span className="sr-only">Loading...</span>
        </div>
      ) : quizzes && quizzes.length === 0 ? (
        <div>You don{"'"}t have any quizzes</div>
      ) : (
        <div>
          <ul>
            {quizzes.map((quiz) => (
              <li key={quiz.id}>{quiz.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuizList;
