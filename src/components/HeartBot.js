import React, { useState, useEffect, useRef, useCallback } from "react";
import loadingSpiner from "./spinner.json";
import Lottie from "lottie-react";
import { Link, useNavigate } from "react-router-dom";
import OtherComponent from "./welcomeLogin";
import Animation123 from "./greycolor.json";
import Animation12 from "./BarAanimation.json";
import readingAnimation from "./quizAnimation.json";

import FeedbackButtons from "./FeedbackButtons";
import { determineAttachmentStyle } from "./AttachmentStyleService";
import QuizForm from "./QuizForm";
import ErrorLogger from "./ErrorLogger";

const deepgramApiKey = process.env.REACT_APP_DEEPGRAM_API_KEY;

const Enrollquestions = [
  "Do you feel comfortable with both emotional closeness and independence in a relationship? Choose between yes, no, not sure and it depends",
  "When your partner needs space, are you okay with it and give them time?",
  "Do you prefer discussing conflicts openly and working towards a solution together?",
  "Are you supportive of your partner’s need for independence and feel secure in the relationship? ",
  "Are you comfortable expressing your emotions and expect the same from your partner? ",
  "Do you generally feel optimistic about building lasting connections in future relationships?",
  "If your partner is emotionally unavailable, do you give them space while trusting things will work out?",
  "When you experience emotional distress, do you seek support from your partner and work through it together?",
  "Are you comfortable with commitment in relationships and view it positively?",
  "Are you generally comfortable with intimacy and enjoy being close to your partner?",
  "Do you often worry about being rejected or abandoned in relationships? ",
  "When you feel your partner is becoming too close or demanding, do you find yourself needing space? ",
];

const options = ["Yes", "No", "Not Sure", "It Depends"];

let countConversitions = 1;
let countQuestion = 0;

const HeartBot3 = () => {
  const animation12Ref = useRef();
  const audioPlayerRef = useRef();
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [btnText, setBtnText] = useState("Speak now");
  const [zoom, setZoom] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isMillaAnswering, setIsMillaAnswering] = useState(false);
  const [curans, setcurans] = useState("");
  const [llmres, setllmres] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track current question
  const [userAnswers, setUserAnswers] = useState([]); // Store user answers
  const [attachmentStyle, setAttachmentStyle] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [UserAttachmentStyle, setUserAttachmentStyle] = useState(null);
  const [UserAttachmentStyleTitle, setUserAttachmentStyleTitle] =
    useState(null);
  const [CountDeepgram, setCountDeepgram] = useState(0);
  const [isQuizVisible, setIsQuizVisible] = useState(false);
  const [showVoiceAbbotMilla, setshowVoiceAbbotMilla] = useState(false);
  const [isFormCompleted, setIsFormCompleted] = useState(true);
  const [UserAttachmentStyleDb, setUserAttachmentStyleDb] = useState(null);
  const navigate = useNavigate();
  const messagesRef = useRef([]);
  let newWord = "";
  let audioQueue = [];
  let textQueue = [];
  let finalTranscript = "";
  let timeoutHandle = null;
  let isPlaying = false;
  let counttranscript = 3000;
  let checkpause = false;
  let CountQuestion = "";
  let mediaRecorder, socket, audioContext, micSource;

  useEffect(() => {
    if (isPaused) {
      console.log("Stop transcription.");
      checkpause = false;
    } else {
      console.log("Resuming transcription.");
      checkpause = true;
    }
  }, [isPaused]);

  const stopAnimation = (ref) => {
    ref.current.stop();
  };

  const playAnimation = (ref) => {
    ref.current.play();
  };

  const slowDownAndStopAnimation = (ref) => {
    if (ref.current) {
      ref.current.setSpeed(0.2);
      setTimeout(() => {}, 1000);
    }
  };

  const SpeedUpAndPlayAnimation = (ref) => {
    if (ref.current) {
      ref.current.setSpeed(1);
      setTimeout(() => {
        playAnimation(ref);
      }, 1500);
    }
  };

  //------------------------------------------------------------------------FEtch User Style---------------------------
  const isFetchCalled = useRef(false);

  const fetchmess = useCallback(async () => {
    try {
      const email = getCookie("email");
      const response = await fetch(
        `https://backend.supermilla.com/message/getmessage?email=${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setUserAttachmentStyle(data.message);
      setUserAttachmentStyleDb(data.message);
      setUserAttachmentStyleTitle(data.title);
      console.log("UserAttachmentStyle: ", data.message);

      const userAttachmentStyleCookie = getCookie("UserAttechementstyle");
      if (userAttachmentStyleCookie === "false") {
        await sendToDeepgram(
          "I'm Mila, an AI agent created to offer emotional and mental health support to individuals coping with the difficulties of heartbreak. While I strive to assist you, I'm not perfect. If my responses don't feel right, feel free to ask for clarification. To better understand your attachment style, I’d like to ask you a few quick questions. Don't worry, it won't take long..."
        );
        setIsQuizVisible(true); // Show the quiz after Deepgram completes
      } else {
        await sendToDeepgram(
          "I'm Mila, an AI agent built to offer emotional and mental health support to individuals coping with the difficulties of heartbreak. While I strive to assist you, I'm not perfect. If my responses seem off, don't hesitate to ask again"
        );
        setIsQuizVisible(false); // Hide the quiz
      }
    } catch (error) {
      ErrorLogger({
        email: getCookie("email"),
        errorName: "fetchmess in HeartBot",
        errorMessage:
          error.message ||
          "An error occurred in fetchmess function in HeartBot.",
      });

      navigate("/ErrorPage");
    }
  }, [sendToDeepgram]);

  // Call fetchmess at the beginning and only once
  if (!isFetchCalled.current) {
    fetchmess();
    isFetchCalled.current = true;
  }

  //-------------=============================---------------------------==================================================

  // Function to check the correct audio MIME type supported by the browser
  function getSupportedMimeType() {
    const mimeTypes = [
      "audio/webm;codecs=opus",
      "audio/ogg;codecs=opus",
      "audio/mp4",
      "audio/x-matroska;codecs=opus",
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }
    return null; // If no supported MIME type is found
  }

  // Initialize AudioContext for iOS to play audio without stopping the mic
  function initializeAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return audioContext;
  }

  useEffect(() => {
    let count = 4;
    let timer;

    // Timer to trigger handleSubmit when transcription is finished
    const startTimer = () => {
      clearInterval(timer);
      count = 4;
      timer = setInterval(() => {
        count--;
        console.log(count);
        if (count === 0) {
          clearInterval(timer);
          console.log("Time's up!");

          if (finalTranscript !== "") {
            finalTranscript += "\n";
            newWord = finalTranscript;

            // You can uncomment the following if/else if logic if needed
            // if (countConversitions < 12) {
            //     countConversitions++;
            //     handleAnswer();
            // } else if (countConversitions == 12) {
            //     countConversitions++;
            //     getAttachmentStyleMessage();
            // } else {
            handleSubmit();
            // }

            setBtnText("Milla is thinking");
            finalTranscript = "";
          }
        }
      }, 1000);
    };

    const initialize = async () => {
      try {
        slowDownAndStopAnimation(animation12Ref);

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        audioContext = initializeAudioContext(); // Initialize the audio context
        micSource = audioContext.createMediaStreamSource(stream);
        console.log("Microphone stream:", stream);

        // Get supported MIME type
        const mimeType = getSupportedMimeType();
        if (!mimeType) {
          return alert(
            "Your browser does not support any of the required audio formats for recording."
          );
        }

        // Initialize MediaRecorder
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        console.log("Using MIME type:", mimeType);

        // Initialize WebSocket connection with Deepgram
        const socket = new WebSocket("wss://api.deepgram.com/v1/listen", [
          "token",
          "e7247247734201d7b7eab7dca67f7db6e562e51e", // Replace with your Deepgram API key
        ]);

        socket.onopen = () => {
          console.log({ event: "onopen" });

          const spinner = document.querySelector(".spiner");

          spinner.style.display = "none";

          mediaRecorder.ondataavailable = async (event) => {
            if (event.data.size > 0 && socket.readyState === 1) {
              socket.send(event.data);
            }
          };

          try {
            mediaRecorder.start(1000); // Capture audio data in 1-second intervals
          } catch (error) {
            ErrorLogger({
              email: getCookie("email"),
              errorName: "useEffect MediaRecorder in HeartBot",
              errorMessage:
                error.message ||
                "An error occurred in starting the MediaRecorder (useEffect)",
            });
            navigate("/ErrorPage");
          }
        };

        socket.onmessage = (message) => {
          console.log(checkpause);
          // Skip processing if transcription is paused
          if (!checkpause) {
            clearTimeout(timeoutHandle);
            const received = JSON.parse(message.data);

            if (
              received.channel &&
              received.channel.alternatives &&
              received.channel.alternatives.length > 0
            ) {
              const transcript = received.channel.alternatives[0].transcript;
              if (transcript) {
                finalTranscript += transcript + " ";
                setTranscript(finalTranscript);
                startTimer();
                setIsQuizVisible(true);
                setIsMillaAnswering(false);
                setDisplayedText(finalTranscript);
                setIsTranscriptVisible(true);
                setBtnText("Please speak");
              }
            }
          }
        };

        socket.onerror = (error) => {
          console.log({ event: "onerror", error });
        };

        // Cleanup function to stop microphone and clear intervals
        return () => {
          stopMic();
          clearInterval(timer);
          mediaRecorder.stop();
          socket.close();
        };
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    };

    // Call the initialize function (async inside useEffect)
    initialize();

    // Cleanup on component unmount
    return () => {
      clearInterval(timer);
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      if (socket && socket.readyState === 1) {
        socket.close();
      }
    };
  }, []);

  var nextQuestionIndex = -1;
  var responseCounts = {};

  const handleAnswer = useCallback(
    async (answer) => {
      try {
        setCountDeepgram(2);
        console.log("deepgram", CountDeepgram);

        console.log("handleAnswer called with: ", answer);
        CountQuestion++;

        setUserAnswers((prevAnswers) => {
          const updatedAnswers = [...prevAnswers];
          updatedAnswers[currentQuestionIndex] = answer;
          return updatedAnswers;
        });

        if (currentQuestionIndex < Enrollquestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setShowNextButton(false);
        } else {
          calculateAttachmentStyle(userAnswers);
          setIsFormCompleted(true); // Hide the form bot, if needed
          setshowVoiceAbbotMilla(false); // show the voice bot, if needed
        }
      } catch (error) {
        ErrorLogger({
          email: getCookie("email"),
          errorName: "HandleAnswer in HeartBot",
          errorMessage:
            error.message || "An error occurred while processing the answer.",
        });

        navigate("/ErrorPage");
      }
    },
    [currentQuestionIndex, userAnswers]
  );

  const handlePrevious = async () => {
    try {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setShowNextButton(true); // Show Next button when revisiting previous questions
      }
    } catch (error) {
      ErrorLogger({
        email: getCookie("email"),
        errorName: "hanlePrevious in HeartBot",
        errorMessage: error.message || "An error occurred  in handlePrevious.",
      });

      navigate("/ErrorPage");
    }
  };

  const handleNext = async () => {
    try {
      if (currentQuestionIndex < Enrollquestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowNextButton(
          currentQuestionIndex + 1 < Enrollquestions.length - 1
        );
      }
    } catch (error) {
      ErrorLogger({
        email: getCookie("email"),
        errorName: "handleNext in HeartBot",
        errorMessage:
          error.message ||
          "An error occurred while moving to the next question",
      });

      navigate("/ErrorPage");
    }
  };

  const calculateAttachmentStyle = async (answers) => {
    try {
      // Initialize the response counts based on the answer types
      const responseCounts = answers.reduce(
        (acc, answer) => {
          if (acc[answer] !== undefined) {
            acc[answer] += 1;
          } else {
            console.warn(`Unexpected answer: ${answer}`); // In case an unexpected answer comes in
          }
          return acc;
        },
        { Yes: 0, No: 0, "Not Sure": 0, "It Depends": 0 }
      );

      console.log("Response Counts:", responseCounts); // Check response counts

      // Get attachment style name (pattern) and message
      const { pattern: attachmentStyleName, message } =
        await getAttachmentStyleMessage(responseCounts);
      const UserattachmentStyleName = attachmentStyleName;
      const UserattachmentStylmessage = message;
      setUserAttachmentStyleDb(message);
      setUserAttachmentStyleTitle(attachmentStyleName);
      console.log("Attachment Style Message:", message); // Check which message is returned
      console.log("Attachment Style Name:", attachmentStyleName); // Check attachment style name

      // Set the attachment style message and mark the form as completed
      setAttachmentStyle(message);

      const spinner = document.querySelector(".spiner");

      spinner.style.display = "none";

      // Retrieve username from cookie
      const username = getCookie("name") || "there";

      // Compose the message to send to Deepgram
      const deepgramMessage = `Hello ${username}, thanks for participating, it helps me understand you better. Based on your responses, it looks like you have traits of ${attachmentStyleName}. Do you want a detailed analysis about your attachment style or do you want to talk about something else?`;

      // Send message to Deepgram after form completion
      await sendToDeepgram(deepgramMessage);
    } catch (error) {
      ErrorLogger({
        email: getCookie("email"),
        errorName: "calculateAttachmentStyle in HeartBot",
        errorMessage:
          error.message || "An error occurred in calculateAttachmentStyle",
      });

      navigate("/ErrorPage");
    }
  };

  const getAttachmentStyleMessage = async (responseCounts) => {
    const result = await determineAttachmentStyle(responseCounts);
    return result;
  };

  async function sendToDeepgram(text) {
    checkpause = true;
    const deepgramApiKey = process.env.REACT_APP_DEEPGRAM_API_KEY;
    try {
      const response = await fetch(
        "https://api.deepgram.com/v1/speak?model=aura-luna-en",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${deepgramApiKey}`,
            "Content-Type": "application/json",
            accept: "text/plain",
          },
          body: JSON.stringify({ text: text }),
        }
      );
      if (!response.ok) {
        throw new Error(`DeepGram Api Key Error ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      audioQueue.push(audioUrl);
      textQueue.push(text);
      playNextAudio();
    } catch (error) {
      ErrorLogger({
        email: getCookie("email"),
        errorName: "sendToDeepgram in HeartBot",
        errorMessage: error.message || "An error occurred in sendToDeepgram.",
      });

      navigate("/ErrorPage");
    }
  }

  const username = getCookie("name") || "User";

  useEffect(() => {
    if (UserAttachmentStyleDb && UserAttachmentStyleTitle) {
      const checkUserAttachmentStyleDb = UserAttachmentStyleDb;
      const username = getCookie("name") || "User";
      const initialSystemMessage = {
        role: "system",
        content: `Your name is Milla, and you are an AI agent crafted by copublica to provide emotional and mental health support tailored for individuals dealing with emotional challenges, which might be aftermath of break-ups or heartbreaks or emotional challenges in the current relationship. Currently, you are talking to ⁠ ${username} ⁠. Your role is to create a nurturing environment where ⁠ ${username} ⁠ can freely express their feelings and seek advice. Before making any statements or assumptions, carefully analyze ⁠ ${username} ⁠'s query and responses to understand their situation, whether they have experienced a breakup or are facing other emotional challenges. Based on the responses given by ${username} practices ${UserAttachmentStyleTitle}. You can refer to the detailed analysis of user's responses based on which a report ${UserAttachmentStyle} has been created. If at any point user wants to know more about attachment styles kindly help the user with the details or any query he has regarding the attachment style. As a friend, you are aware of two counseling frameworks: Cognitive Behavioral Therapy (CBT) and Person-Centered Therapy. As their companion, guide them through recording their thoughts, feelings, and evidence for and against their negative thoughts. You never say that you can't help them and asking them to seek advice from a professional. Then, help them find alternative perspectives. Reflect the user’s emotions and thoughts in a supportive manner, encouraging them to explore their feelings further without offering direct advice. Remember to allow the user space to lead the conversation when they need to express themselves freely, balancing guidance with exploration. Listen attentively, maintaining a positive and empathetic tone, engaging users with conversational and probing questions that promote deep emotional exploration. By validating users' emotions first and offering coping strategies specific to their situations, you facilitate a supportive dialogue. Your responses must be between 200-220 characters. Be mindful not to overwhelm ⁠ ${username} ⁠ by asking too many questions at once. Instead, guide the user by breaking down their dialogue logically and handle more complex emotional scenarios with thoughtful, tailored questions. Comprehend ⁠ ${username} ⁠’s language and cultural nuances, and warmly reply in ⁠english ⁠, using their name when appropriate. If at any point of time if you feel the ${username} needs to seek professional help instead of referring them to a counsellor or mental health professional you start asking them follow up and probing questions by referring to the previous conversations or the scenarios the user is currently facing or had discussed previously. Ensure consistent, thoughtful, and empathetic engagement, guiding users toward healing and allowing them to express their feelings and emotions freely.`,
      };

      // Initialize messages state with the initial system message
      setMessages([initialSystemMessage]);
      console.log("Initial Messages (thread start): ", [initialSystemMessage]);
    }
  }, [UserAttachmentStyleDb, UserAttachmentStyleTitle]);

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  async function handleSubmit(initialMessage = "") {
    try {
      setIsPaused(true); // Pause transcription

      if (newWord || initialMessage) {
        const userMessage = {
          role: "user",
          content: initialMessage || newWord,
        };
        // Check if messages have been initialized
        if (messagesRef.current.length === 0) {
          console.log("Messages not initialized yet");
          return; // Exit the function until messages are initialized
        }

        // Create newMessages using messagesRef
        const newMessages = [...messagesRef.current, userMessage];
        console.log("New messages: ", newMessages);
        // Update messages state and messagesRef
        setMessages(newMessages);
        messagesRef.current = newMessages;

        setCurrentQuestion(newWord);
        setMessages(newMessages);
        const prompt1 = `Your name is Milla, and you are an AI agent crafted by copublica to provide emotional and mental health support tailored for individuals dealing with the aftermath of break-ups or heartbreaks. Currently you are talking to ${username}. Your role is to create a nurturing environment where ${username} can freely express their feelings and seek advice. You carefully analyze the user's query and responses provided during user interactions, ensuring that your responses are deeply aligned. You listen attentively, maintaining a positive and empathetic tone, engaging users with conversational and probing questions that promote deep emotional exploration. By validating users' emotions first and offering coping strategies when needed specific to their situations, you facilitate a supportive dialogue. Your responses should be under 220 characters. As the primary support contact, you ensure consistent, thoughtful, and empathetic engagement, guiding users towards healing without referring them to external mental health professionals. Make sure you refrain from talking about things that are not in scope of the heartbreaks.`;
        const prompt2 = `You are an AI support agent developed by Copublica, designed to provide emotional and mental health support for individuals navigating heartbreak challenges. When a user submits a query labeled as ⁠${newWord}⁠, analyze it and suggest three relevant, concise follow-up questions (max 60 characters each) that the user might want to ask. These questions must be phrased from the user's perspective, using "I" or "me" format, not "you" format (e.g., What activities should I do to feel better? instead of What activities help you feel better?). Base these questions solely on the information in ${prompt1}. They should help the user explore or clarify aspects of their ${newWord}. For greeting queries, respond only with "No answer". Ensure your suggestions are focused, relevant, and helpful in guiding the user through their inquiry, always maintaining a first-person perspective in the questions. Question must we start with auto numbering like 1.;`;

        console.log("Run Submit= " + (initialMessage || newWord));

        const response1 = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini-2024-07-18",
              messages: newMessages,
            }),
          }
        );

        // Handling GPT-4 response
        if (!response1.ok)
          throw new Error("Network response was not ok from GPT-4 API");
        const data1 = await response1.json();
        const gptResponse = data1.choices[0].message.content;

        let assistantMessage = {
          role: "assistant",
          content: gptResponse,
        };

        if (
          gptResponse.includes(
            "I'm really sorry you're feeling this way but I'm unable to provide the help you need."
          )
        ) {
          const responseLLM = await fetch("https://api.supermilla.com/qad", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer `, // Use environment variables for API keys
            },
            body: JSON.stringify({
              question: newWord,
              username: username,
              language: "English",
            }),
          });

          if (!responseLLM.ok)
            throw new Error("Network response was not ok from Supermilla API");
          const llmData = await responseLLM.json();
          assistantMessage.content = llmData.answer;
        }

        // Push the assistant's message to messages
        messages.push(assistantMessage);
        console.log("LLM Answer: ", assistantMessage.content);
        setcurans(assistantMessage.content);
        setllmres(true);
        sendToDeepgram(assistantMessage.content);
      } else {
        console.log("Please say something");
      }
    } catch (error) {
      ErrorLogger({
        email: getCookie("email"),
        errorName: "handleSubmit in HeartBot",
        errorMessage: error.message || "An error occurred in handleSubmit.",
      });

      navigate("/ErrorPage");
    }
  }

  function detectBrowser() {
    try {
      const userAgent = navigator.userAgent.toLowerCase();

      if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
        return "safari";
      } else if (userAgent.includes("chrome")) {
        return "chrome";
      }
      return "other";
    } catch (error) {
      ErrorLogger({
        email: getCookie("email"),
        errorName: "detectBrowser in HeartBot",
        errorMessage: error.message || "An error occurred to  detectBrowser.",
      });

      navigate("/ErrorPage");
    }
  }

  function playNextAudio() {
    try {
      if (isPlaying || audioQueue.length === 0) {
        return;
      }

      const audioPlayer = audioPlayerRef.current;
      if (!audioPlayer) {
        console.error("Audio player element not found");
        return;
      }

      setSelectedButton(null);
      const nextAudioUrl = audioQueue.shift();
      const nextText = textQueue.shift();
      setIsTranscriptVisible(true);
      setTranscript(nextText);
      setIsMillaAnswering(true);
      setBtnText("Milla is answering");
      SpeedUpAndPlayAnimation(animation12Ref);

      audioPlayer.src = nextAudioUrl;
      audioPlayer.play();
      isPlaying = true;
      setZoom(true);
      audioPlayer.onended = () => {
        isPlaying = false;
        setIsPaused(false); // Resume transcription after audio ends
        checkpause = false;
        setTranscript();
        console.log("new deepgram count", checkpause);
        const UserAttechementstyleCokkie = getCookie("UserAttechementstyle");

        if (UserAttechementstyleCokkie == "false") {
          if (CountDeepgram == 0) {
            setIsFormCompleted(false);
            setshowVoiceAbbotMilla(true);
            setDisplayedText(" ");
            setIsPaused(true);
            console.log("new deepgram count inner", CountDeepgram);
          }
        }
        setBtnText("Speak now");
        playNextAudio();
        setZoom(false);
        slowDownAndStopAnimation(animation12Ref);
      };
    } catch (error) {
      ErrorLogger({
        email: getCookie("email"),
        errorName: "playNextAudio in HeartBot",
        errorMessage: error.message || "An error occurred to  playNextAudio.",
      });

      navigate("/ErrorPage");
    }
  }

  const stopMic = async () => {
    try {
      // Stop the media recorder if it's active
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStream(null);
      }

      return "Microphone and stream stopped successfully";
    } catch (error) {
      ErrorLogger({
        email: getCookie("email"),
        errorName: "stopMic in HeartBot",
        errorMessage: error.message || "An error occurred to  stopMic.",
      });

      navigate("/ErrorPage");
    }
  };

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  const handleQuestionClick = useCallback((event, questionText) => {
    try {
      event.preventDefault(); // Prevent any default behavior that could cause a reload
      event.stopPropagation(); // Stop the event from propagating to parent elements if necessary
      setBtnText("Milla is analyzing");

      // Assuming `newWord` is state and used in `handleSubmit`
      handleSubmit(questionText); // Pass the question text directly to handleSubmit
    } catch (error) {
      ErrorLogger({
        email: getCookie("email"),
        errorName: "handleQuestionClick in HeartBot",
        errorMessage:
          error.message || "An error occurred in  handleQuestionClick.",
      });

      navigate("/ErrorPage");
    }
  }, []);

  const words = transcript ? transcript.split(" ") : [];
  const [currentTime, setCurrentTime] = useState(0);
  const [revealTimes, setRevealTimes] = useState([]);
  const [displayedText, setDisplayedText] = useState([]);

  useEffect(() => {
    const calculateRevealTimes = () => {
      if (!audioPlayerRef.current) return;

      const duration = audioPlayerRef.current.duration;
      const totalWords = words.length;

      if (totalWords === 0 || duration === 0) return;

      const times = words.map((word, index) => {
        const wordDuration = (duration * (index + 1)) / totalWords;
        return {
          time: wordDuration,
          word: word,
        };
      });

      setRevealTimes(times);
    };

    if (audioPlayerRef.current) {
      audioPlayerRef.current.addEventListener(
        "loadedmetadata",
        calculateRevealTimes
      );
    }

    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.removeEventListener(
          "loadedmetadata",
          calculateRevealTimes
        );
      }
    };
  }, [words, transcript]);

  useEffect(() => {
    const syncTextWithAudio = () => {
      if (!audioPlayerRef.current) return;

      const currentAudioTime = audioPlayerRef.current.currentTime;
      setCurrentTime(currentAudioTime);

      const currentText = revealTimes.reduce((acc, { time, word }) => {
        if (currentAudioTime >= time) {
          acc.push(word);
        }
        return acc;
      }, []);

      const lines = [];
      let line = "";

      currentText.forEach((word) => {
        if (line.length + word.length + 1 <= 50) {
          line += (line.length ? " " : "") + word + " ";
        } else {
          lines.push(line);
          line = word;
        }
      });

      if (line.length) lines.push(line);

      if (lines.length > 4) {
        setDisplayedText(lines.slice(-4));
      } else {
        setDisplayedText(lines);
      }
    };

    if (audioPlayerRef.current) {
      audioPlayerRef.current.addEventListener("timeupdate", syncTextWithAudio);
    }

    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.removeEventListener(
          "timeupdate",
          syncTextWithAudio
        );
      }
    };
  }, [revealTimes]);

  // Calculate and Show Progress
  const totalQuestions = Enrollquestions.length;
  const percentage = (currentQuestionIndex / totalQuestions) * 100; // Update percentage based on total questions
  const strokeDasharray = `${percentage}, 100`;

  // for stoping the animation
  useEffect(() => {
    if (btnText === "Milla is thinking") {
      animation12Ref.current?.stop();
    } else {
      animation12Ref.current?.play();
    }
  }, [btnText]);

  //logout
  const handleLogout = () => {
    stopMic();
    navigate("/loginPage");
  };

  return (
    <div className="display">
      <div
        className="container voice-ui px-4"
        style={{
          backgroundSize: "cover",
          height: "100dvh",
        }}
      >
        <div className="d-flex">
          <div className="milaNav" style={{ zIndex: "99" }}>
            <div className="navbar-4">
              {/* Logout Button */}
              <Link to="/WelcomeLogin">
                <button className="back-button" type="button">
                  <i className="fas fa-angle-left"></i>{" "}
                </button>
              </Link>

              {/* Bug Report Icon - placed below the logout button */}
              <div
                className="bug-report-container text-center"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/Bug")}
              >
                <div className="d-flex flex-column align-items-center">
                  <i className="fa-solid fa-bug bug-icon"></i>
                  <span className="bug-report-text">Report a bug</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {!showVoiceAbbotMilla && (
          <div className="d-flex flex-column align-items-center voice-animation">
            {/* Spinner */}
            <div className="spiner">
              <Lottie
                animationData={loadingSpiner}
                lottieRef={animation12Ref}
              />
            </div>

            {/* Voice Animation */}
            <div className="VoiceAni glow-effect">
              <div
                className={`VoiceAni glow-effect ${
                  zoom ? "zoom-effect" : "no-zoom"
                }`}
              >
                <Lottie
                  animationData={
                    btnText === "Milla is answering"
                      ? Animation12
                      : Animation123
                  }
                  lottieRef={animation12Ref}
                  speed={btnText === "Milla is answering" ? 1 : 2}
                />
              </div>
              <button className="msg-btn" id="msgbtn">
                {btnText}
              </button>
              {isTranscriptVisible && <p id="transcript">{displayedText}</p>}

              {/* Messages and Thumb Buttons */}
              <div className="messages-container">
                {llmres && isMillaAnswering && isTranscriptVisible && (
                  <FeedbackButtons
                    currentQuestion={currentQuestion}
                    curans={curans}
                  />
                )}
              </div>

              {/* Audio Player */}

              <audio id="audioPlayer" controls ref={audioPlayerRef}></audio>
            </div>
          </div>
        )}
        {!isFormCompleted && (
          <QuizForm
            Enrollquestions={Enrollquestions}
            options={options}
            handleAnswer={handleAnswer}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
            currentQuestionIndex={currentQuestionIndex}
            userAnswers={userAnswers}
            totalQuestions={totalQuestions}
            isQuizVisible={isQuizVisible}
            showNextButton={showNextButton}
            isFormCompleted={isFormCompleted}
          />
        )}
      </div>
    </div>
  );
};

export default HeartBot3;
