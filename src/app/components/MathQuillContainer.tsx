'use client'
import React, {
  useState,
  createRef,
  useEffect,
  RefObject,
  KeyboardEvent,
} from "react";
import MathInput from "./Mathquill";

let inputValues: string[] = [];

interface MathquillContainerProps {
  activeQuestion: number;
  answers: string[];
  handleChange: (latex: string) => void;
  type: number;
}

const MathquillContainer: React.FC<MathquillContainerProps> = ({
  activeQuestion,
  answers,
  handleChange,
  type = 0
}) => {
  const [inputs, setInputs] = useState < number[] > ([]);
  const [focusedIndex, setFocusedIndex] = useState < number | null > (null);

  const inputRefs: RefObject<HTMLDivElement>[] = inputs.map(() => createRef());

  useEffect(() => {
    // set focus when focusedIndex changes
    if (focusedIndex !== null && inputRefs[focusedIndex]?.current) {
      const element = inputRefs[focusedIndex].current?.firstChild?.firstChild
        ?.firstChild?.firstChild as HTMLElement;
      element?.focus();
    }
  }, [focusedIndex, inputRefs]);

  useEffect(() => {
    const latex = answers[activeQuestion] ?? ""
    inputValues = latex.split("\n");
    setInputs([0, 1, 2, 3, 4, 5, 6]);
  }, [activeQuestion, answers]);

  const handleKeyDown = (
    e: KeyboardEvent,
    index: number,
    mathExpression: string
  ) => {
    if (e.key === "Enter") {
      const newId = inputs.length > 0 ? Math.max(...inputs) + 1 : 0;
      const updatedInputs = [...inputs];
      updatedInputs.splice(index + 1, 0, newId);
      inputValues.splice(index + 1, 0, "");
      setInputs(updatedInputs);
      setFocusedIndex(index + 1);
    } else if (
      e.key === "Backspace" &&
      mathExpression === "" &&
      inputs.length > 1
    ) {/*{
      Commented out 16 Oct 23 don't know what it's doing here! Pretty sure not needed
      const updatedInputs = [...inputs];
      if (mathExpression === "") {
        updatedInputs.splice(index, 1);
        inputValues.splice(index, 1);
        setInputs(updatedInputs);
        const newIndex = index === 0 ? 0 : index - 1;
        setFocusedIndex(newIndex);
      }
    }*/}
  };

  const handleInputChange = (value: string, index: number) => {
    inputValues[index] = value;
    const latexArray = inputValues.map((value) => value || "");
    const latexText = latexArray.join("\n");
    if (activeQuestion + 1) {
      handleChange(latexText);
    }
  };

  return (
    <>
      <div className="w-full mt-4">
        {inputs.map((id, index) => (
          <div
            className={`border-l border-r border-gray-400 dark:text-white dark:bg-gray-950 dark:border-gray-700 dark:focus:border-white bg-white  ${index === 0 ? "border-t rounded-tl-lg rounded-tr-lg" : ""
              } ${index === inputs.length - 1
                ? "border-b rounded-bl-lg rounded-br-lg"
                : ""
              }`}
            key={id}
            ref={inputRefs[index]}
          >
            <MathInput
              onEnterDown={handleKeyDown}
              index={index}
              content={inputValues[index]}
              onValueChange={handleInputChange}
              type={type}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default MathquillContainer;
