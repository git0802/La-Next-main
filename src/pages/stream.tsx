// ChatGPT stream test page

import { useState } from "react";
import type { NextPage } from "next";
import { GPTInteraction } from "@/utils/OpenAIFunctions";

const Stream: NextPage = () => {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  function processMarkResponse(responseText: string) {
    console.log(responseText);
    setAnswer((data) => data + responseText);
  }

  const callGPT = async () => {
    setAnswer("");
    GPTInteraction(
      ["a type of train"],
      {
        marks: 4,
        subject: "maths",
        markScheme:
          "A1 - gets answer correct",
        questionText:
          "what is Sefsefghuaaa",
      },
      "explain",
      processMarkResponse,
      [],
      true, // trained
      true // stream
    );
  };

  return (
    <div>
      <button
        className='bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full'
        onClick={callGPT}
        disabled={loading}
      >
        {loading ? "Waiting answer..." : "GO"}
      </button>
      {answer ? (
        <div className='my-4 p-2 rounded-lg border'>{answer}</div>
      ) : null}
    </div>
  );
};

export default Stream;