import { useNavigate } from "react-router";
import ErrorLogger from "./ErrorLogger";

const setCookie=(name, value, days)=> {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
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

const attachmentStyleMessages = {
  "Mixed Attachment Style": {
    message: "Your responses indicate a diverse mixture of attachment tendencies, reflecting traits from secure, anxious, avoidant, and fearful-avoidant styles.",
    pattern: "Mixed",
  },
  "Confident-Cautious Attachment Style": {
    message: "Your responses show confidence in relationships, but with some cautious tendencies, especially around commitment and emotional closeness.",
    pattern: "Confident-Cautious",
  },
  "Secure with tendencies of Fearful-Avoidant and Situational Influences": {
    message: "Your responses indicate a mix of secure and fearful-avoidant tendencies, influenced by specific situations.",
    pattern: "Secure-Fearful-Avoidant",
  },
  "Confident-Situational Attachment Style": {
    message: "Your approach to relationships is generally confident, but with variations depending on the situation.",
    pattern: "Confident-Situational",
  },
  "Reluctant-Uncertain Attachment Style": {
    message: "Your responses suggest reluctance and uncertainty in relationships, especially when it comes to emotional dependence.",
    pattern: "Reluctant-Uncertain",
  },
  "Resistant-Adaptable Attachment Style": {
    message: "You show resistance to deeper engagement in relationships but adaptability based on specific circumstances.",
    pattern: "Resistant-Adaptable",
  },
  "Uncertain-Situational Attachment Style": {
    message: "You exhibit a situational attachment style, where your emotional needs depend heavily on the context.",
    pattern: "Uncertain-Situational",
  },
  "Secure Attachment Style": {
    message: "You have a secure attachment style, characterized by comfort with intimacy and independence.",
    pattern: "Secure",
  },
  "Anxious-Avoidant Attachment Style": {
    message: "You exhibit an anxious-avoidant attachment style, marked by hesitance towards intimacy and fear of abandonment.",
    pattern: "Anxious-Avoidant",
  },
  "Fearful-Avoidant Attachment Style": {
    message: "You display fearful-avoidant attachment tendencies, with mixed emotions about closeness and trust.",
    pattern: "Fearful-Avoidant",
  },
  "Situationally Adaptive Attachment Style": {
    message: "You adapt your attachment behaviors based on circumstances, but may have underlying uncertainties.",
    pattern: "Situationally Adaptive",
  },
};

// Function to send a message to the backend
const sendMessage = async (message, titlename) => {
  const payload = {
    username: getCookie("name"),
    email: getCookie("email"),
    message: message,
    title: titlename,
  };

  try {
    const response = await fetch("https://backend.supermilla.com/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log("Message stored successfully");
      setCookie("UserAttechementstyle", "true", 30);
    } else {
      console.error("Failed to store message");
    }
  } catch (error)
  {
    console.error("Error storing message:", error);
  }
  // {
  //   ErrorLogger({
  //     email: getCookie("email"),
  //     errorName: "handleQuestionClick in HeartBot",
  //     errorMessage:
  //       error.message || "An error occurred in  handleQuestionClick.",
  //   });

  //   navigate("/ErrorPage");
  // }
};

// Function to determine the user's attachment style based on their responses
export const determineAttachmentStyle = async (responseCounts) => {
  const {
    Yes = 0,
    No = 0,
    "Not Sure": NotSure = 0,
    "It Depends": ItDepends = 0,
  } = responseCounts;

  const maxValue = Math.max(Yes, No, NotSure, ItDepends);

  // Check for equal combinations first
  if (Yes === No && No === NotSure && NotSure === ItDepends) {
    const message = attachmentStyleMessages["Mixed Attachment Style"].message;
    const attachmentStyleName = "Mixed Attachment Style";
    await sendMessage(message, attachmentStyleName);
    return { message, pattern: attachmentStyleName };
  }

  // Handle the case where Yes and No are equal but not max
  if (Yes === No && Yes == maxValue) {
    const message = attachmentStyleMessages["Confident-Cautious Attachment Style"].message;
    const attachmentStyleName = "Confident-Cautious Attachment Style";
    await sendMessage(message, attachmentStyleName);
    return { message, pattern: attachmentStyleName };
  }

  // Handle the case where Yes and Not Sure are equal but not max
  if (Yes === NotSure && Yes == maxValue) {
    const message = attachmentStyleMessages["Secure with tendencies of Fearful-Avoidant and Situational Influences"].message;
    const attachmentStyleName = "Secure with tendencies of Fearful-Avoidant and Situational Influences";
    await sendMessage(message, attachmentStyleName);
    return { message, pattern: attachmentStyleName };
  }

  // Handle the case where Yes and It Depends are equal but not max
  if (Yes === ItDepends && Yes == maxValue) {
    const message = attachmentStyleMessages["Confident-Situational Attachment Style"].message;
    const attachmentStyleName = "Confident-Situational Attachment Style";
    await sendMessage(message, attachmentStyleName);
    return { message, pattern: attachmentStyleName };
  }

  // Handle the case where No and Not Sure are equal but not max
  if (No === NotSure && No == maxValue) {
    const message = attachmentStyleMessages["Reluctant-Uncertain Attachment Style"].message;
    const attachmentStyleName = "Reluctant-Uncertain Attachment Style";
    await sendMessage(message, attachmentStyleName);
    return { message, pattern: attachmentStyleName };
  }

  // Handle the case where No and It Depends are equal but not max
  if (No === ItDepends && No == maxValue) {
    const message = attachmentStyleMessages["Resistant-Adaptable Attachment Style"].message;
    const attachmentStyleName = "Resistant-Adaptable Attachment Style";
    await sendMessage(message, attachmentStyleName);
    return { message, pattern: attachmentStyleName };
  }

  // Handle the case where Not Sure and It Depends are equal but not max
  if (NotSure === ItDepends && NotSure == maxValue) {
    const message = attachmentStyleMessages["Uncertain-Situational Attachment Style"].message;
    const attachmentStyleName = "Uncertain-Situational Attachment Style";
    await sendMessage(message, attachmentStyleName);
    return { message, pattern: attachmentStyleName };
  }

  // Handle the case where one value is the max
  if (maxValue === Yes) {
    const message = attachmentStyleMessages["Secure Attachment Style"].message;
    const attachmentStyleName = "Secure Attachment Style";
    await sendMessage(message, attachmentStyleName);
    return { message, pattern: attachmentStyleName };
  }

  if (maxValue === No) {
    const message = attachmentStyleMessages["Anxious-Avoidant Attachment Style"].message;
    const attachmentStyleName = "Anxious-Avoidant Attachment Style";
    await sendMessage(message, attachmentStyleName);
    return { message, pattern: attachmentStyleName };
  }

  if (maxValue === NotSure) {
    const message = attachmentStyleMessages["Fearful-Avoidant Attachment Style"].message;
    const attachmentStyleName = "Fearful-Avoidant Attachment Style";
    await sendMessage(message, attachmentStyleName);
    return { message, pattern: attachmentStyleName };
  }

  if (maxValue === ItDepends) {
    const message = attachmentStyleMessages["Situationally Adaptive Attachment Style"].message;
    const attachmentStyleName = "Situationally Adaptive Attachment Style";
    await sendMessage(message, attachmentStyleName);
    return { message, pattern: attachmentStyleName };
  }

  // Handle combined patterns (Equal values of different types)
  if (Yes === No && NotSure === ItDepends) {
    const message = attachmentStyleMessages["Confident-Cautious Attachment Style"].message;
    const attachmentStyleName = "Confident-Cautious Attachment Style";
    await sendMessage(message, attachmentStyleName);
    return { message, pattern: attachmentStyleName };
  }

  if (No === NotSure && ItDepends === Yes) {
    const message = attachmentStyleMessages["Fearful-Avoidant with tendencies of Anxious-Avoidant and Situational Influences"].message;
    const attachmentStyleName = "Fearful-Avoidant with tendencies of Anxious-Avoidant and Situational Influences";
    await sendMessage(message, attachmentStyleName);
    return { message, pattern: attachmentStyleName };
  }

  if (Yes === No && ItDepends > NotSure) {
    const message = attachmentStyleMessages["Secure with tendencies of Anxious-Avoidant and Situational Influences"].message;
    const attachmentStyleName = "Secure with tendencies of Anxious-Avoidant and Situational Influences";
    await sendMessage(message, attachmentStyleName);
    return { message, pattern: attachmentStyleName };
  }

  return { message: "Unable to determine attachment style.", pattern: "Unknown" };
};
