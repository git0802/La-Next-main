'use client'
import React from "react";

interface MCContainerProps {
  activeQuestion: number;
  answers: string[];
  handleChange: (latex: string) => void;
  markScheme: string;
}

const MCContainer: React.FC<MCContainerProps> = ({
  activeQuestion,
  answers,
  handleChange,
  markScheme
}) => {


  const handleClick = (value: string) => {
    handleChange(value);
  };

  const MS = JSON.parse(markScheme)

  return (
    <div className="p-8 pb-24">
      <div className="flex flex-col space-y-4">
        {Object.entries(MS.answers).map(([key, value]) => (
          <button
            key={key}
            className={`text-lg p-4 rounded border ${answers[activeQuestion] === key ? 'bg-indigo-400 dark:bg-indigo-600 ' : 'bg-white dark:bg-gray-800 '
              }`}
            onClick={() => handleClick(key)}
          >
            {`${key}: ${value}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MCContainer;
