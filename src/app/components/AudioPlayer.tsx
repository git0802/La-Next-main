import React, { useState, useEffect } from 'react';
import { MicrophoneIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import LoadingDots from './LoadingDots';

type Props = {
    content: string;
    startChatResponse: (chatInputRef: string) => void;
};

const AudioPlayer: React.FC<Props> = ({ content, startChatResponse }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const convertTextToVoice = async (text: string) => {
        try {
            // Samuel: NUo8ZuOZfhyPMJaAKw45
            // Normal male: Yko7PKHZNXotIFUBG7I9
            // Australian: ZQe5CZNOzWyzPSCn5a3c
            const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/NUo8ZuOZfhyPMJaAKw45?optimize_streaming_latency=0&output_format=mp3_44100_128', {
                method: 'POST',
                headers: {
                    'accept': 'audio/mpeg',
                    'xi-api-key': 'b68b874be7dd9df463c3652b9d9352d4',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "text": text,
                    "model_id": "eleven_monolingual_v1",
                    "voice_settings": {
                        "stability": 0,
                        "similarity_boost": 0,
                        "style": 0,
                        "use_speaker_boost": true
                    }
                }),
            });
            setIsProcessing(false);
            if (response.ok) {

                const blob = await response.blob();
                const audio = new Audio(URL.createObjectURL(blob));
                audio.play();
                audio.onended = () => {
                    URL.revokeObjectURL(audio.src);
                };
            } else {
                console.error('Failed to convert text to voice');
            }
        } catch (error) {
            setIsProcessing(false);
            console.error('Error:', error);
        }
    };


    const startListening = () => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            // @ts-ignore
            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const result = event.results[0][0].transcript;
                startChatResponse(result);
                console.log(result)
                setIsProcessing(true)
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } else {
            console.error('Speech recognition is not supported in this browser.');
        }
    };

    useEffect(() => {
        if (content) {
            convertTextToVoice(content);
        }
    }, [content]);

    return (
        <>
            <button
                className="w-12 h-12 p-0 rounded-full flex items-center justify-center bg-purple-500 border-2 border-white text-white text-sm font-semibold shadow-sm focus:outline-none fixed bottom-4 right-4"
                onClick={() => {
                    if (!isListening) startListening();
                    setIsListening(!isListening);
                }}
            >
                {isProcessing ?
                    <LoadingDots /> :
                    <MicrophoneIcon
                        className={`${isListening ? "animate-pulse" : ""} h-6 w-6`}
                        aria-hidden="true"
                    />

                }
            </button>

        </>
    );
};

export default AudioPlayer;




/*
This code attempts to send one sentence at a time to elevenlabs but I've not been able to get this working so just doing whole thing at once for now

import React, { useState, useEffect } from 'react';
import { MicrophoneIcon } from '@heroicons/react/20/solid';

type Props = {
 content: string;
 startChatResponse: (chatInputRef: string) => void;
};

const AudioPlayer: React.FC<Props> = ({ content, startChatResponse }) => {
 const [isListening, setIsListening] = useState(false);
 const [sentences, setSentences] = useState < number > (0);
 const [audioUrls, setAudioUrls] = useState < string[] > ([]);
 const [isAudioPlaying, setIsAudioPlaying] = useState(false);

 const convertTextToVoice = async (text: string) => {
     try {
         const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/NUo8ZuOZfhyPMJaAKw45?optimize_streaming_latency=0&output_format=mp3_44100_128', {
             method: 'POST',
             headers: {
                 'accept': 'audio/mpeg',
                 'xi-api-key': 'b68b874be7dd9df463c3652b9d9352d4',
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify({
                 "text": text,
                 "model_id": "eleven_monolingual_v1",
                 "voice_settings": {
                     "stability": 0,
                     "similarity_boost": 0,
                     "style": 0,
                     "use_speaker_boost": true
                 }
             }),
         });

         if (response.ok) {
             const blob = await response.blob();
             const audioUrl = URL.createObjectURL(blob);
             setAudioUrls((prevUrls) => [...prevUrls, audioUrl]);
             playNextAudio();
         } else {
             console.error('Failed to convert text to voice');
         }
     } catch (error) {
         console.error('Error:', error);
     }
 };

 const startListening = () => {
     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
         const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

         recognition.onstart = () => {
             console.log('Listening...');
         };

         recognition.onresult = (event) => {
             const result = event.results[0][0].transcript;
             console.log('You said: ' + result);
             startChatResponse(result);
         };

         recognition.onend = () => {
             console.log('Stopped listening');
             setIsListening(false);
         };

         recognition.start();
     } else {
         console.error('Speech recognition is not supported in this browser.');
     }
 };

 const playNextAudio = () => {
     console.log(audioUrls)
     console.log(isAudioPlaying)
     if (audioUrls.length > 0 && !isAudioPlaying) {
         setIsAudioPlaying(true);
         console.log("Playing...")
         const audio = new Audio(audioUrls[0]);
         audio.play();
         setAudioUrls((prevUrls) => prevUrls.slice(1));


         audio.onended = () => {
             setIsAudioPlaying(false);
             playNextAudio();
         };
     }
 };

 useEffect(() => {
     if (content) {
         
      

         const newSentences = content.split('. ');
         if (newSentences.length < 2) {
             setSentences(1);
             setAudioUrls([]);
         } else if (newSentences.length > sentences) {
             convertTextToVoice(newSentences[sentences - 1]);
             setSentences(prev => prev + 1);
         }

     }
 }, [content]);

 return (
     <>
         <button
             className="w-12 h-12 p-2 rounded-full flex items-center justify-center bg-purple-500 border-2 border-white text-white text-sm font-semibold shadow-sm focus:outline-none fixed bottom-4 right-4"
             onClick={() => {
                 if (!isListening) startListening();
                 setIsListening(!isListening);
             }}
         >
             <MicrophoneIcon className={isListening ? "animate-pulse" : ""} aria-hidden="true" />
         </button>
     </>
 );
};

export default AudioPlayer;
*/