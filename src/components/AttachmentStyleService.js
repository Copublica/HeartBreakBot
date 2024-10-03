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
    message:  "Your responses indicate a diverse mixture of attachment tendencies, reflecting traits from secure, anxious, avoidant, and fearful-avoidant styles. This complexity suggests that you may react differently depending on the context or specific relationship dynamics. Here’s a deeper look into what this might mean for you. Your responses indicate a generally positive view of relationships and comfort with emotional closeness. You openly express emotions and expect the same from your partner, which fosters secure attachments. However, there are signs of concern about rejection, leading to a need for reassurance and occasional dependency on your partner's emotional availability. At times, you seek emotional distance, especially when situations become overwhelming. There is some hesitance towards deep commitment, likely due to concerns about autonomy, along with mixed feelings about intimacy and closeness, reflecting an internal conflict in emotionally charged situations... I hope this insight was useful.  Let me know if you want to talk more about attachment styles or about something else.",
    pattern: "Mixed",
  },

  "Confident-Cautious Attachment Style": {
    message: "Your responses indicate a mix of confidence and caution in relationships, reflecting both secure and uncertain tendencies. While you show strong comfort with emotional expression and a positive outlook on intimacy, suggesting secure attachment traits, there is also noticeable ambivalence. This uncertainty is evident in your hesitance around commitment and emotional closeness, possibly reflecting past experiences or fears. As a result, you may find yourself deeply connected in some areas of relationships, while simultaneously holding back in others. This balance of strengths and uncertainties shapes how you approach relational dynamics and navigate emotional challenges.",
    pattern: "Confident-Cautious",
  },

  "Secure with tendencies of Fearful-Avoidant and Situational Influences": {
    message: "Your responses indicate a mix of secure and fearful-avoidant tendencies, influenced by specific situations.",
    pattern: "Secure-Fearful-Avoidant",
  },
  
  "Confident-Situational Attachment Style": {
    message: "Your responses show a distinctive pattern where you balance strong confidence in certain aspects of relationships with a cautious, situation-dependent approach in others. This combination suggests that you are both secure in your relational capabilities and mindful of the complexities involved in intimacy and commitment. Your answers show confidence and comfort with closeness, commitment, and managing conflicts, reflecting a secure attachment style. You trust your ability to form stable, fulfilling relationships and are comfortable expressing emotions. However, it also suggests that while capable of deep emotional connections, your engagement may vary based on circumstances or past experiences. This indicates a thoughtful, adaptive approach to relationships, where you manage emotional investments based on your comfort and vulnerability.",
    pattern: "YesAndItDependsEqual",
    pattern: "Confident-Situational",
  },
  "Reluctant-Uncertain Attachment Style": {
    message: "Your responses indicate a notable combination of reluctance and uncertainty in your approach to relationships. You seem to hesitate when it comes to emotional dependence, intimacy, and commitment, while also showing some ambiguity around closeness and trust. This blend of reluctance and indecisiveness may complicate your emotional connections and decision-making within relationships. You might find it challenging to express emotions or rely on your partner, which could impact the depth of your connections. Additionally, your uncertainty may stem from past experiences or internal conflicts, affecting your ability to make clear choices about relationship dynamics.",
    pattern: "Reluctant-Uncertain",
  },
  "Resistant-Adaptable Attachment Style": {
    message:  "Your survey responses reveal a notable combination of resistance and adaptability in how you approach relationships. Your responses suggest that while you often exhibit hesitance or reluctance towards certain aspects of relationships, you also show a capacity to adapt your responses based on specific circumstances. This dual nature can affect your relationship experiences in complex ways. They also suggest resistance to deeper engagement in relationships, possibly due to fears of losing independence or past negative experiences. This can lead to avoiding emotional intimacy or commitment, with strict emotional boundaries as a protective mechanism. This indicates that your engagement varies based on context, such as a partner's behavior or the emotional demands of the situation. This pragmatic but guarded approach shows that you adjust your boundaries and expectations, a valuable skill for managing diverse relationship dynamics effectively.",
    pattern: "Resistant-Adaptable",
  },
  "Uncertain-Situational Attachment Style": {
    message: "Your responses show a significant tendency toward uncertainty and conditional behaviors in relationships. The pattern indicates a nuanced approach to intimacy and commitment, where your feelings and reactions are heavily influenced by specific circumstances. Your uncertainty about relationships suggests mixed feelings or unclear attachment preferences, likely influenced by past experiences. This may indicate a need for self-reflection to better understand your emotional needs. Your attachment behaviors seem highly context-dependent, shifting with past interactions, current mood, or perceived future outcomes. While this adaptability allows you to navigate relationships flexibly, it may also reflect a cautious approach, adjusting closeness based on perceived safety or risk.",
    pattern: "Uncertain-Situational",
  },

  "Secure Attachment Style": {
    message: "Your responses strongly suggest that you exhibit a secure attachment style, characterized by a comfortable approach to relationships, emotional openness, and a healthy balance between intimacy and independence. This attachment style is associated with positive relationship outcomes, including deeper emotional connections and more satisfying interactions. You show comfort with closeness and an ability to form deep, lasting connections. You balance intimacy and independence well, supporting both personal growth and relationship satisfaction. You express emotions openly, fostering an environment for constructive discussions and resolution. Even with secure attachment, growth is always possible. Continuing to enhance emotional understanding and communication will lead to even richer relationships. Nurturing vulnerability and mutual support remains key to maintaining healthy, fulfilling connections...  I hope this insight was useful.  Let me know if you want to talk more about attachment styles or about something else.",
  },

  "Anxious-Avoidant Attachment Style": {
    message: "Your responses predominantly indicate an Anxious or Avoidant Attachment style, characterized by a hesitance or resistance to intimacy, possibly coupled with a fear of abandonment or a preference for emotional distance. Understanding and addressing these tendencies can lead to healthier and more fulfilling relationships. You may feel uneasy with emotional closeness, sometimes withdrawing when things become too intimate or feeling insecure and needing reassurance. Concerns about being rejected or left may lead you to either cling to your partner or distance yourself to avoid potential hurt. You might find it difficult to openly discuss feelings, desires, or conflicts, possibly due to fear of conflict or negative reactions. Focusing on activities that build self-security, such as therapy or self-help strategies, can boost self-esteem. Learning to express your needs and feelings clearly and constructively can help reduce fears related to intimacy...  I hope this insight was useful.  Let me know if you want to talk more about attachment styles or about something else.",
  },

  "Fearful-Avoidant Attachment Style": {
    message: "Your responses suggest a predominant pattern of uncertainty in relationships, indicating traits of a Fearful-Avoidant Attachment style. This attachment style is often marked by mixed emotions about closeness, where you may desire intimacy but fear the potential emotional risks involved. This ambivalence could make it challenging to navigate decisions around intimacy and trust. You might find it difficult to fully open up or trust others, leading to hesitation in forming deep connections. By building self-awareness, gradually exposing yourself to vulnerability in safe environments, and seeking support from therapy, you can work toward healthier and more secure relational dynamics.",
    pattern: "Fearful-Avoidant",
  },


  "Situationally Adaptive Attachment Style": {
    message: "Your survey responses suggest that your approach to relationships is highly situational and adaptive. This flexibility can be a strength, allowing you to navigate different relational dynamics effectively. However, it may also indicate underlying uncertainties or conditional engagement strategies that could benefit from further exploration to enhance relationship stability and satisfaction. Your responses indicate that you adapt your behavior based on circumstances, showing perceptiveness and responsiveness to relationship dynamics. You may adjust how open or close you feel depending on specific conditions, influenced by past experiences or current situations. While this adaptability helps manage interactions, it might limit deeper connections if not balanced. Your answers suggest you weigh the risks and benefits of emotional engagement, which can protect you but also restrict full connection. Try practicing consistent vulnerability in trusted relationships to explore if more openness deepens connections. Identifying triggers that influence your engagement can help you address them constructively. While adaptability is a strength, maintaining a balance that provides both flexibility and predictability is key to fostering secure and stable relationships...  I hope this insight was useful.  Let me know if you want to talk more about attachment styles or about something else.",
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
    const response = await fetch("http://localhost:5000/message", {
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
