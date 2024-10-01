import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import './MainPage.css';

function MainPage() {
  const [showPopup, setShowPopup] = useState(false);
  console.log("welcome to main page");

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  const setCookie=(name, value, days)=> {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  useEffect(() => {
    const fetchmess = async () => {
        try {
            const email = getCookie("email");
            const response = await fetch(`https://backend.supermilla.com/message/getmessage?email=${email}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = await response.json();

            if (data.message=="No Data Found") {
              setCookie('UserAttechementstyle', "false", 30); 
              // console.log("User has logged in before.");
            }
            else
            {
              setCookie('UserAttechementstyle', "true", 30); 
            }
        } catch (error) {
            console.error("Error fetching attachment style:", error);
        }
    };
    fetchmess();
}, []);

  const userName = getCookie('name');
  const email = getCookie('email');
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  const handleLeftArrowClick = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const handleRightArrowClick = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  function deleteAllCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
  }

  const handleLogout = () => {
    deleteAllCookies();
    navigate('/LoginPage');
  };

  const recordVoiceBotUsage = async (voiceBotName, path) => {
    try {
      await axios.post("https://backend.supermilla.com/log-voicebot", {
        email,
        username: userName,
        voiceBotUsed: voiceBotName,
      });

      // Navigate to the corresponding route
      navigate(path);
    } catch (error) {
      console.error("Error recording voice bot usage:", error);
      navigate(path); // Ensure navigation happens even if logging fails
    }
  };


  // function detectBrowser() {
  //   const userAgent = navigator.userAgent.toLowerCase();
  //   const isIOS = /iphone|ipad|ipod/.test(userAgent); // Check for iOS or iPadOS
  
  //   if (userAgent.includes('crios')) {
  //     return 'chrome'; // Chrome on iOS
  //   } else if (userAgent.includes('safari') && !userAgent.includes('crios') && !userAgent.includes('chrome') && isIOS) {
  //     return 'safari'; // Safari on iOS or iPadOS only
  //   }
  //   return 'other';
  // }

 

  return (
    <div className="hero-container" id="MainPage">
      <div className="heroGreeting">
        <nav className="NavBar navbar navbar-expand-lg">
          <div className="container-fluid">
            <div className="NavBar-left navbar-brand">
              <h1>Hi {userName ? userName : 'Guest'}</h1>
            </div>
            {userName && (
              <div className="NavBar-right ml-auto d-flex align-items-center">
                <button className="logout-button btn btn-dark" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </nav>

        <div className="container">
          <div className="row">
            {/* <div className="col-6 col-left">
              <div
                className="card card-left d-flex mt-2 myCard"
                onClick={() => recordVoiceBotUsage("Social Emotional Learning", "/HeartBot")}
              >
                Social emotional learning
              </div>
              <div
                className="card card-right mt-2 myCard"
                onClick={() => recordVoiceBotUsage("AIDS Awareness", "/HeartBot")}
              >
                AIDS awareness
              </div>
            </div> */}
            {/* <div className="col-6 col-right">
              <div
                className="card card-right mt-2 myCard"
                onClick={() => recordVoiceBotUsage("Mental Health", "/HeartBot")}
              >
                Mental health
              </div>
              <div
                className="card card-left d-flex mt-2 myCard"
                onClick={() => recordVoiceBotUsage("Learn about voicebots", "/HeartBot")}
              >
                Learn about voicebots
              </div>
            </div> */}
            {/* <div className="col-12">
              <div
                className="card card-right mt-2 myCard"
                onClick={() => recordVoiceBotUsage("Menopause & Midlife Crisis", "/Mmc")}
              >
                Menopause & midlife crisis
              </div>
            </div> */}
            <div className="col-12">
           
              <div
                className=" mt-2 myCard newcardcss" 
               >
                <div>
                
                <img src="./assets/images/Heartbot.png" className="bot-image" style={{ width: '150px' }} alt="HeartBot" />

              </div>
                <p className="bot-text">Looks like you beat the crowd! <br></br> Being an early bird you can now enjoy our AI heartbot for free.</p>

                <button className="btn btn-light hearbot-btn"  onClick={() => recordVoiceBotUsage("Menopause & Midlife Crisis", "/HeartBot")}>Try for free</button>

              </div>
            </div>
          </div>
        </div>

        <h4 className="mt-3 faq">Frequently asked questions</h4>
        <div className="convo-history">
          <div className="link">
            <div className="accordion1">
              <p>How do I cope with the pain and loneliness after a recent breakup?
 </p>
            </div>
          </div>
          <div className="link">
            <div className="accordion1">
              <p>How do I stop overthinking and worrying about everything constantly?</p>
            </div>
          </div>
          <div className="link">
            <div className="accordion1">
              <p>How can I improve my relationships and communicate more effectively?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
}

export default MainPage;