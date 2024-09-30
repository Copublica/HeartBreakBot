import React from "react";

const ErrorLogger = async ({ email, errorName, errorMessage }) => {
  const errorLog = {
    email, // User email
    errorName, // Function name as error name
    errorMessage, // Error message
    date: new Date().toISOString(), // Current date
  };

  // Log error message to the backend
  try {
    await fetch("https://backend.supermilla.com/errorlogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(errorLog),
    });
    console.log("Error log stored successfully.");
  } catch (logError) {
    console.error("Error logging to the backend:", logError);
  }
};

export default ErrorLogger;
