import { OpenAIStream } from "@/utils/OpenAIStream";

export const config = {
  runtime: "edge",
};

const handler = async (req: Request) => {
  const { prompt, question, model, streaming, temperature, trained } =
    (await req.json()) as {
      prompt?: string;
      question: string;
      model: string;
      streaming: boolean;
      temperature: number;
      trained: boolean;
    };

  if (trained) {
    try {
      const response = await fetch("https://a.learnanything.uk/api/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          model,
          streaming,
          temperature,
          prompt,
          trained,
        }),
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  } else {
    const payload = {
      prompt,
      stream: streaming
    };

    const stream = await OpenAIStream(payload);

    return streaming ? new Response(stream) : stream;
  }
};

export default handler;
