import React, { useState } from "react";
import Lottie from "lottie-react";
import readingAnimation from "./quizAnimation.json";

const QuizForm = ({
  Enrollquestions,
  options,
  handleAnswer,
  handlePrevious,
  handleNext,
  currentQuestionIndex,
  userAnswers,
  totalQuestions,
  isQuizVisible,
  showNextButton,
  isFormCompleted,
}) => {
  // Calculate and Show Progress
  const percentage = (currentQuestionIndex / totalQuestions) * 100; // Update percentage based on total questions
  const strokeDasharray = `${percentage}, 100`;

  return (
    !isFormCompleted && (
      <div className="attachmentStyleForm">
        <Lottie animationData={readingAnimation} />
        {isQuizVisible && (
          <>
            <div className="card card-left mt-5 quiz-card position-relative">
              {/* Circular Progress Bar */}
              <div
                className="progress-circle position-absolute"
                style={{
                  top: "-30px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <svg viewBox="0 0 100 100" className="circular-chart blue">
                  <defs>
                    <linearGradient
                      id="gradientStroke"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        style={{ stopColor: "rgba(59, 32, 225, 0.39)" }}
                      />
                      <stop offset="14%" style={{ stopColor: "#3B20E1" }} />
                      <stop offset="24%" style={{ stopColor: "#15057B" }} />
                      <stop offset="63%" style={{ stopColor: "#090232" }} />
                      <stop offset="100%" style={{ stopColor: "#000000" }} />
                    </linearGradient>
                  </defs>
                  <path
                    className="circle-bg"
                    d="M50 10 A40 40 0 1 1 50 90 A40 40 0 1 1 50 10"
                    fill="none"
                    stroke="#e6e6e6"
                    strokeWidth="10"
                  />
                  <path
                    className="circle"
                    strokeDasharray={strokeDasharray}
                    d="M50 10 A40 40 0 1 1 50 90 A40 40 0 1 1 50 10"
                    fill="none"
                    stroke="url(#gradientStroke)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <text
                    x="50"
                    y="55"
                    className="percentage"
                    textAnchor="middle"
                    fontSize="20"
                  >
                    {Math.round(percentage)}%
                  </text>
                </svg>
              </div>
              <p className="mt-4">{Enrollquestions[currentQuestionIndex]}</p>
            </div>

            {/* Render Options Outside the Card */}
            <div className="d-flex flex-column align-items-center mt-4">
              {options.map((option) => (
                <div key={option} className="mb-2" style={{ width: "80%" }}>
                  <button
                    type="button"
                    className={`btn w-100 quiz-button rounded-pill ${
                      userAnswers[currentQuestionIndex] === option
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </button>
                </div>
              ))}

              {/* Navigation Buttons */}
              <div
                className="d-flex justify-content-between mt-4"
                style={{ width: "80%" }}
              >
                {/* Previous Button */}
                {currentQuestionIndex > 0 && (
                  <div>
                    <button
                      type="button"
                      className="btn btn-secondary rounded-pill"
                      onClick={handlePrevious}
                    >
                      <i className="fas fa-angle-left"></i>
                    </button>
                  </div>
                )}

                {/* Next Button */}
                {showNextButton && currentQuestionIndex < Enrollquestions.length - 1 && (
                  <div>
                    <button
                      type="button"
                      className="btn btn-primary rounded-pill"
                      onClick={handleNext}
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    )
  );
};

export default QuizForm;
