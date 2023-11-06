import { useState, ChangeEvent, useCallback, useEffect } from "react";

import { NextPage } from "next";

interface PageProps {
  className?: string;
}
const BASE_URL = "https://a.learnanything.uk";

const Stream2: NextPage<PageProps> = ({ className }) => {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [generating, setGenerating] = useState(false);
  const [training, setTraining] = useState(false);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const getText = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/train`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.text();
        setText(data);
      } catch (error) {
        console.log(error);
      }
    };
    getText();
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setTraining(true);
      const response = await fetch(`${BASE_URL}/api/train`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      setTraining(false);
    } catch (error) {
      setTraining(false);
      console.log(error);
    }
  }, [text]);

  const handleAsk = useCallback(() => {
    if (!query) return;

    try {
      setGenerating(true);
      const xhr = new XMLHttpRequest();

      xhr.open("POST", `${BASE_URL}/api/question`, true);
      xhr.setRequestHeader("Content-Type", "application/json");

      // Handle incoming messages
      xhr.onprogress = function () {
        if (xhr.getResponseHeader("transfer-encoding") === "chunked") {
          setAnswer(xhr.responseText);
        } else {
          setAnswer(JSON.parse(xhr.responseText).data);
        }
      };

      xhr.onload = function () {
        setGenerating(false);
        setQuery("");
      };

      xhr.onerror = function () {
        console.error("Request failed.");
        setGenerating(false);
      };

      xhr.send(
        JSON.stringify({
          question: query.trim(),
          model: "gpt-3.5-turbo",
          streaming: true,
          temperature: 0.1,
        })
      );
    } catch (error) {
      setGenerating(false);
      console.error(error);
    }
  }, [query]);

  return (
    <div className={className}>
      <div className='mx-auto w-1/2'>
        <div className='text-center my-8 font-bold text-lg'>Chat</div>
        <input
          className='flex h-10 custom-input-text disabled:cursor-not-allowed disabled:opacity-50'
          value={query}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setQuery(event.target.value)
          }
          placeholder='Ask any question'
        />

        <button
          className='button-ring relative flex select-none flex-row items-center justify-center whitespace-nowrap rounded-md border disabled:cursor-not-allowed hover:bg-neutral-900 border-neutral-800 bg-neutral-800 text-neutral-100 disabled:border-transparent disabled:text-neutral-500 hover:disabled:bg-opacity-100 px-4 py-2 text-sm mx-auto w-full mt-4'
          onClick={handleAsk}
          disabled={generating}
        >
          {generating ? "Generating..." : "Ask"}
        </button>
        {answer ? (
          <div className='my-4 p-2 rounded-lg border'>{answer}</div>
        ) : null}
        <div className='text-center my-8 font-bold text-lg'>Train</div>
        <textarea
          className='flex min-h-[80px] custom-textarea'
          rows={15}
          value={text}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setText(event.target.value);
          }}
        ></textarea>
        <button
          className='button-ring relative flex select-none flex-row items-center justify-center whitespace-nowrap rounded-md border disabled:cursor-not-allowed hover:bg-neutral-900 border-neutral-800 bg-neutral-800 text-neutral-100 disabled:border-transparent disabled:text-neutral-500 hover:disabled:bg-opacity-100 px-4 py-2 text-sm mx-auto w-full mt-4'
          onClick={handleSubmit}
          disabled={training}
        >
          {training ? "Training..." : "Train"}
        </button>
      </div>
    </div>
  );
};

export default Stream2;
