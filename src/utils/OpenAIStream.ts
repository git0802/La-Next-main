import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

// Function to establish a streaming connection to OpenAI API
export async function OpenAIStream(payload: any) {
  const encoder = new TextEncoder(); // TextEncoder instance for encoding text
  const decoder = new TextDecoder(); // TextDecoder instance for decoding received chunks

  let counter = 0,
    messages = [
      {
        role: "system",
        content:
          "",
      },
    ];
  //console.log(payload.prompt)
  // Add user messages Start with an initial assistant message
  messages.push({ role: "user", content: payload.prompt[0] });

  // Loop through the prompt array starting from index 1
  for (let i = 1; i < payload.prompt.length; i += 2) {
    const userMessage = payload.prompt[i];
    const assistantMessage = payload.prompt[i + 1];

    messages.push(
      { role: "assistant", content: userMessage },
      { role: "user", content: assistantMessage }
    );
  }
  console.log(messages);

  // Make a POST request to OpenAI's API for chat completions
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify({
      model: "gpt-4", // "gpt-3.5-turbo",  // gpt-4
      messages: messages,
      temperature: 0.1, // keep this low for reliability
      stream: payload.stream, // Enable streaming
    }),
  });

  if (!payload.stream) return res as any;

  // Create a ReadableStream for processing incoming data
  const stream = new ReadableStream({
    async start(controller) {
      // Function to handle parsed events from the stream
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          // Check if it's an event and not a reconnect interval

          const data = event.data;
          if (data === "[DONE]") {
            // End of stream
            controller.close(); // Close the stream controller
            return;
          }
          try {
            // Parse the received data as JSON and extract relevant content
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;

            // Skip first two messages with new lines
            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }

            // Encode the text and enqueue it to the stream controller
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++; // Increment the counter
          } catch (e) {
            // Error handling
            controller.error(e);
          }
        }
      }

      // Create a parser to feed incoming data for parsing
      const parser = createParser(onParse);

      // Process the body in chunks and feed to the parser
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream; // Return the created ReadableStream
}
