import React, { useState } from "react";
import { useNavigate } from "react-router";
import ErrorLogger from "./ErrorLogger"; // Import the new ErrorLogger component

const FeedbackButtons = ({ currentQuestion, curans }) => {
  const [selectedButton, setSelectedButton] = useState(null);
  const navigate = useNavigate();

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const handleLike = async () => {
    setSelectedButton("like");
    const likedConversation = {
      username: getCookie("name"),
      email: getCookie("email"),
      question: currentQuestion,
      response: curans,
      voicebot: "HeartBot",
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch("https://backend.supermilla.com/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(likedConversation),
      });

      if (response.ok) {
        console.log("Liked conversation stored successfully.");
      } else {
        console.error("Failed to store liked conversation.");
      }
    } catch (error) {
      // Use the ErrorLogger component
      ErrorLogger({
        email: getCookie("email"),
        errorName: "handleLike in FeedbackButtons",
        errorMessage:
          error.message || "An error occurred while storing liked conversation",
      });

      navigate("/ErrorPage");
    }
  };

  const handleDislike = async () => {
    setSelectedButton("dislike");
    const dislikedConversation = {
      username: getCookie("name"),
      email: getCookie("email"),
      question: currentQuestion,
      response: curans,
      voicebot: "HeartBot",
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch("https://backend.supermilla.com/dislike", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dislikedConversation),
      });

      if (response.ok) {
        console.log("Disliked conversation stored successfully.");
      } else {
        console.error("Failed to store disliked conversation.");
      }
    } catch (error) {

      ErrorLogger({
        email: getCookie("email"),
        errorName: "handleDislike in FeedbackButtons",
        errorMessage:
          error.message || "An error occurred while HandleDislike error occurred.",
      });

      navigate("/ErrorPage");
    }
  };

  return (
    <div className="thumb-buttons">
      <button
        className={`thumb-button dislike-button ${
          selectedButton === "dislike" ? "active" : ""
        }`}
        onClick={handleDislike}
      >
        <i className="fas fa-thumbs-down"></i>
      </button>
      <button
        className={`thumb-button like-button ${
          selectedButton === "like" ? "active" : ""
        }`}
        onClick={handleLike}
      >
        <i className="fas fa-thumbs-up"></i>
      </button>
    </div>
  );
};

export default FeedbackButtons;
