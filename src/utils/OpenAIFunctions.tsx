import { Question, Score } from "./types";
import { hashStringWithSHA1 } from "./hashFunction";

// Function to call the GPT API
const GPTApiCall = async (
    prompt: string[],
    chunkFunction: (chunkValue: string) => void,
    trained: boolean = false,
    stream: boolean = false,
    vision: string = ""
) => {

    const response = await fetch("/api/GPT", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt,
            vision: vision,
            streaming: stream,
            trained
        }),
    });

    // Check if the response is OK
    if (!response.ok) {
        chunkFunction("[error]");
    } else {
        if (stream) {
            // Get the response body as a stream
            const data = response.body;
            if (!data) {
                chunkFunction("[error]");
                return "Error";
            }
            const reader = data.getReader();
            const decoder = new TextDecoder();
            let done = false;

            // Read the stream in chunks and process each chunk
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value);
                chunkFunction(chunkValue);
            }
        } else {
            if (trained) {
                await response
                    .json()
                    .then((data) => chunkFunction(data.data))
                    .catch((error) => chunkFunction(error.message));
            } else {
                const data = await response.json();
                chunkFunction(data.choices[0].message.content);
            }
        }
        // Streaming process has completed - do something in the parent component here if necessary
        chunkFunction("[DONE]");
    }
};

async function checkCache(
    promptArr: string[],
    chunkFunction: (chunkValue: string) => void,
    trained: boolean = false,
    stream: boolean = false,
    vision: string = ""
) {
    hashStringWithSHA1(promptArr.join("") + vision).then(async (hashValue) => {
        try {
            const response = await fetch(
                "https://learnanything-uk.stackstaging.com/r/" + hashValue
            );
            if (!response.ok) {
                GPTApiCall(promptArr, chunkFunction, trained, stream, vision); // cache response failed, call GPT API
            }
            const data = await response.text();
            try {
                // Check response starts with [DONE]
                if (data.substring(0, 6) == "[DONE]") {
                    chunkFunction(data);
                } else {
                    GPTApiCall(promptArr, chunkFunction, trained, stream, vision); // cache response is invalid format, call GPT API
                }
            } catch (error) {
                GPTApiCall(promptArr, chunkFunction, trained, stream, vision); // cache response is invalid format, call GPT API
            }
        } catch (error) {
            GPTApiCall(promptArr, chunkFunction, trained, stream, vision); // cache response failed, call GPT API
        }
    });
}



// Function to prepare the GPT prompt and call the GPT API for marking an answer, creating a quiz or responding to a chat
export const GPTInteraction = async (
    answers: string[],
    question: Question | string = "",
    type: string = "explain",
    chunkFunction: (chunkValue: string) => void,
    chatHistory: string[] = [],
    trained: boolean = false,
    stream: boolean = true
): Promise<string> => {
    let introduction = "",
        explain = "",
        marking = "",
        studentResponse = "",
        promptArr = [];
    promptArr.push(""); // create a blank prompt for the first call

    const vision = (typeof (question) !== "string" && question.interface == "vision") ? answers[0] : "";

    if (type == "createQuiz") {
        // process the quiz creation prompt


        promptArr[0] =
            `create a test made up of questions and a mark scheme for each question based on the instructions below (after the triple quotes). Put the easier questions and those with fewer marks at the beginning. If no indication of length is given, make the test 10 questions long. The questions should be in clear and simple language. Use latex for all maths and surround any latex with <m>..</m>. IMPORTANT: when the mark scheme is looking for specific things, the question should make clear what sort of things are required so the student knows how to get full marks. Try to avoid using the same phrasing for multiple questions. Choose an appropriate number of marks for each question, and assign each mark an appropriate requirement in the mark scheme. Roughly, one mark should be for one part of the answer. The mark scheme should break down the ideal student response into parts so that if a student gets part of the response correct they get part of the marks. Incorrect answers should never form part of the mark scheme. Please follow the exact format below for your response:

[question text only - no question numbers]
~-
[mark scheme in the format "A1 - [requirements for that mark]\nB1 - [requirements for that mark]..."]
~-
[number of marks for that question just as an integer]
~-
[if student response would consist of computer code, write "code". if it would consist mostly of math expressions, write "maths"]
~~
... (repeat for each question)
~'~
[title of the test]

        """` + answers[0];
    } else {


        const createPromptFromChat = (chat: string, answer?: string): string => {
            if (chat.includes("find-video")) {
                return (
                    "The student has asked for a youtube video to help with this question. If possible, recommend the channel and title of a Youtube video on this topic in the form Try '[video title]' on the [channel name] channel. if not, say that you couldn't find a video directly related to this topic and offer them some general assistance instead. Reply in the same language as this: '" + chat.replace("find-video", "") + "'"
                ); // if the student asks for a Youtube video, add this to the prompt
            } else if (chat.includes("similar-example")) {
                return ("The student has asked for a similar example to help with this question. If possible, create a similar question and give them a worked solution to it. If not, say that you couldn't find a similar example and offer them some general assistance instead. Reply in the same language as this: '" + chat.replace("similar-example", "") + "'")
            } else {
                return (
                    `The student's prompt is """${chat
                    }"""` + ((answer && answer != "course-chat") ? `and their current answer to the question is """${answer
                        }"""` : ``)
                ); // add the student's prompt and current answer (if different to the previous answer) to the prompt
            }
        }

        // process the chat or marking prompt
        if (chatHistory.length > 1) {

            // format the student's reponses to include their answers (the first response will be dealt with below)
            for (let i = 1; i < chatHistory.length; i++) {
                if (i % 2 === 0) {
                    // create prompt, and send answer if it has changed
                    promptArr.push(createPromptFromChat(chatHistory[i], (answers[i / 2] != answers[(i / 2) - 1]) ? answers[i / 2] : ""))
                } else promptArr.push(chatHistory[i]); // add the teacher's response to the prompt
            }
        }

        // Create the first prompt
        // Set the introduction based on the subject

        introduction = "You are a supportive and helpful teacher ";


        if (type == "chat") {
            // chat query
            introduction +=
                ". You are having a conversation with the student. Speak directly to the student. Avoid conversations on all topics except the question/topic below, but you can recommend online resources to help if they ask for them. Importantly, avoid giving them the answer to the question (or any of the marks of the mark scheme), just offer guidance. Never apologise, use simple language (ELI 5) and keep your replies brief. Use latex for all math, contained in <m>...</m> tags. ";

            if (chatHistory.length)
                introduction += createPromptFromChat(chatHistory[0], answers[0]);
        } else {
            // marking query
            introduction += ", marking student work. ";
            if (typeof question !== "string") {
                if (question.interface == "maths") marking += "If an expression from the mark scheme is present in the answer, they should get the mark, even if they calculate that expression incorrectly. ";
                else if (vision) marking += "Look at the image and give marks for the parts of the diagram that are correct according to the mark scheme. ";

                // Configure marking instructions based on the subject
                if (question.subject == "french")
                    marking +=
                        "Return your mark only as a number";
                else if (question.markingType == "grid") marking +=
                    " there are " + question.marks + " mark(s) for this question. Respond with ONLY your marking and nothing else on the first line of your response in the form of an array of numbers which are the marks for each category in the mark scheme (eg. [3,5,1,0,4]). ";
                else marking +=
                    " there are " + question.marks + " mark(s) for this question. Respond with ONLY your marking and nothing else on the first line of your response in the form of an array of 0s and 1s corresponding to the marks in order (each of, eg. A1, M1 etc is a single mark)  (like " + JSON.stringify(Array.from({ length: question.marks }, (_, i) => (i % 2 === 0 ? 1 : 0))) + ". ";
            }
            // Set explanation instructions based on the type
            if (type == "explain")
                explain =
                    " If they get all the marks, do not give an explanation. Otherwise, explain your reasoning very briefly for each mark, as if talking to the student. Say \'In your response\' or similar when talking about their answer. Never give them the answers, and keep your explanation short and simple. Use latex for any math, and surround your latex with <m>...</m>";


            // Add in the student's answer  if they have entered one
            if (answers.length > 0 && answers[0] != undefined) {
                // Don't give the student's answer if it is a vision question
                if (!vision) {
                    studentResponse =
                        `This is the student answer to the question, delimited by triple quotes:
    
      """` +
                        answers[0] +
                        `"""`;
                }
            } else {
                studentResponse =
                    "The student has not yet entered an answer to the question.";
            }
        }
        // Concatenate all parts to form the full GPT prompt

        promptArr[0] = (typeof question === "string") ? introduction + "The topic they are working on is: " + question :
            introduction +
            `
    This is the question, delimited by triple quotes:
    
      """`+ question.questionText + `"""` + studentResponse +
            marking +
            explain +
            `Here is the mark scheme for the question, delimited by triple quotes` + ((typeof question !== "string") ? `(The rules in the mark scheme must always be followed and must take priority over whether you think the student 'deserves' the mark):` : ``) + `
      """`+ (question.markScheme ?? "").replaceAll("1ft", "1 (follow through - for this mark, if the student does the correct working with an incorrect previous part of their answer they still get the mark)") + `"""`
            ;
    }

    // Try the cache, and if that fails Call the GPT API with the constructed prompt
    checkCache(promptArr, chunkFunction, trained, stream, vision);

    // what is returned is what will be cached - for marking this is the whole prompt, for chat it is the question+answer+mark scheme+prompt+student prompt + vision (the drawing object) if presentgit push origin <your-branch-name> --force
    return promptArr.join("") + vision;
};


// Function to prepare the GPT prompt and call the GPT API for insights
export const GPTInsights = async (
    scores: Score[],
    questions: Question[],
    type: string = "general-insights",
    chunkFunction: (chunkValue: string) => void,
    trained: boolean = false,
    stream: boolean = true
): Promise<string> => {
    let prompt = "", singleUser = false;
    if (!type) type = "general-insights"; else if (type.includes("single-user")) {
        singleUser = true;
        type = type.split("|")[0];
    }

    prompt = (singleUser) ? "Below are the details of a quiz (questions and mark schemes) and a single student's reponses, in JSON format. Address the student directly in your response - use 'you'."
        :
        "Below are the details of a quiz (questions and mark schemes) and a set of student responses, in JSON format. ";

    prompt += "The student responses are in the form of an array of arrays of 0s and 1s, where each inner array corresponds to a student response to a question, and each element of the inner array corresponds to a mark in the mark scheme for that question. 1 means the student got the mark, 0 means they didn't. The first element of the inner array corresponds to the first mark in the mark scheme, the second element to the second mark in the mark scheme, and so on. If any responses are missing, that means the student didn't complete that question. Keep your response brief, mentioning the most important aspects and separate different ideas/students with \n. Do not describe the json data directly. ";

    if (type == "general-insights") prompt += (singleUser) ? "Respond first with how many questions there were in the quiz, and how many the student completed. then add a summary of the scores, mentioning any exceptional responses, common errors or misconceptions, and any other insights you can find, or recommendations for the student."
        :
        "Respond first with how many questions there were in the quiz, and how many each student completed. then add a summary of the scores, mentioning any exceptional student results, common errors or misconceptions, and any other insights you can find, or recommendations for a teacher. ";
    else if (type == "student-by-student") prompt += "Respond with a student by student breakdown of performance, mentioning any particular errors in understanding or other insights.";
    else if (type == "common-errors") prompt += "Respond with any common errors you can find among the student responses.";
    else if (type == "teacher-recommendations") prompt += "Respond with advice for their teacher on what they might need to cover in the next lesson to support the students.";
    else if (type == "student-recommendations") prompt += "Respond with advice for the student on what they might need to study or practise to improve their performance.";
    else prompt += type;


    prompt += JSON.stringify(questions) + JSON.stringify(scores);

    // Try the cache, and if that fails Call the GPT API with the constructed prompt
    checkCache([prompt], chunkFunction, trained, stream);

    // what is returned is what will be cached - for marking this is the whole prompt, for chat it is the question+answer+mark scheme+prompt+student prompt
    return prompt;
};



// Function to create a course
export const GPTCourse = async (
    description: string,
    chunkFunction: (chunkValue: string) => void,
    trained: boolean = false,
    stream: boolean = true
): Promise<string> => {

    const prompt =
        `create a curriculum to teach a student the topic below (after the triple quotes). If no indication of length is given, create an appropriate number of topics to suitably cover the content (never more than 10 topics). If no age group is given, make it suitable for a 12 year old. No quotation marks around titles. Please follow the exact format below for your response (don't miss out the ~~ between each question):

[title of topic only (no topic number)]
~-
[topic content, like a page of a text book. Always use latex for any math, surrounded by <m>..</m> and use \times for multiply. The content for each topic should be 500-1000 words, using short paragraphs. for any worked examples, surround with <example>..</example> - don't say 'for example', and for math examples give the solution line by line, with each step on a separate line. use <b>..</b> to highlight key words and phrases make sure you actually teach the content, not just say what you will cover in this section]
~-
[if possible, the title and channel of a relevant youtube video]
~-
[a description for a quiz on this topic, in the form 'quiz testing ...'. this will be used to create a quiz using the chatgpt api]
~~
... (repeat for each topic)
~'~
[title of the course]

    """` + description;

    // Try the cache, and if that fails Call the GPT API with the constructed prompt
    checkCache([prompt], chunkFunction, trained, stream);

    // what is returned is what will be cached - for marking this is the whole prompt, for chat it is the question+answer+mark scheme+prompt+student prompt
    return prompt;
};

