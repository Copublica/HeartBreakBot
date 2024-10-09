import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  WhatsappShareButton,
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from "react-share";
import Popup from "reactjs-popup";

  const SharePopup = ({ isPopupOpen, setOpenPopup, handleMic }) => {
  const [uniqueLink, setUniqueLink] = useState("");
  const [hasShared, setHasShared] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false); // Track if we are waiting for confirmation
  const timerRef = useRef(null);

  useEffect(() => {
    // Fetch the unique ID from the backend using the user's email
    const getCookie = (name) => {
      const nameEQ = name + "=";
      const ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
          return c.substring(nameEQ.length, c.length);
      }
      return null;
    };

    const fetchUniqueKey = async () => {
      const email = getCookie("email");
      if (email) {
        try {
          const response = await axios.get(
            `https://backend.supermilla.com/generate/getkey?email=${email}`
          );
          const uniqueKey = response.data.uniqueKey;
          setUniqueLink(`https://heartbot.live?id=${uniqueKey}`);
        } catch (error) {
          console.error("Error fetching unique key:", error);
        }
      }
    };

    fetchUniqueKey();
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleShareClick = () => {
    if (!hasShared) {
      setHasShared(true);
      setIsWaiting(true); 

      timerRef.current = setTimeout(() => {
        setIsWaiting(false);
        setShowThanks(true);
      }, 7000); 
    }
  };

  const handleContinue = () => {
    setOpenPopup(false);
    setHasShared(false);
    setShowThanks(false);
    setIsWaiting(false);
    handleMic(false);


    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return (
    <Popup
      open={isPopupOpen}
      onClose={() => {
        setOpenPopup(false);
        setHasShared(false);
        setShowThanks(false);
        setIsWaiting(false);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      }}
      modal
      closeOnDocumentClick={false}
      overlayStyle={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      contentStyle={{
        width: "80%",
        maxWidth: "400px",
        height: "auto",
        padding: "20px",
        borderRadius: "10px",
        textAlign: "center",
        position: "relative",
      }}
    >
      <div className="popup-content-share">
        {/* Icon and initial message */}
        {!hasShared && !showThanks && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <i
                className="fa fa-share-alt"
                style={{
                  width: "80%",
                  padding: "10px",
                  borderRadius: "5px",
                  textAlign: "center",
                  fontSize: "40px",
                  color: "#15057B",
                }}
              ></i>
            </div>

            <p>Share with friends to get additional conversations!</p>

            <div
              style={{
                backgroundColor: "#f0f0f0",
                padding: "20px",
                borderRadius: "10px",
              }}
            >
              <p>Share on Social Media:</p>
              <div
                className="share-buttons"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <WhatsappShareButton
                  url={uniqueLink}
                  title="Check this out!"
                  className="share-button"
                  onClick={handleShareClick} // Handle share click
                >
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>

                <FacebookShareButton
                  url={uniqueLink}
                  quote="Check this out!"
                  className="share-button"
                  onClick={handleShareClick}
                >
                  <FacebookIcon size={32} round />
                </FacebookShareButton>

                <TwitterShareButton
                  url={uniqueLink}
                  title="Check this out!"
                  className="share-button"
                  onClick={handleShareClick}
                >
                  <TwitterIcon size={32} round />
                </TwitterShareButton>

                <LinkedinShareButton
                  url={uniqueLink}
                  title="Check this out!"
                  className="share-button"
                  onClick={handleShareClick}
                >
                  <LinkedinIcon size={32} round />
                </LinkedinShareButton>
              </div>
            </div>
          </>
        )}

        {/* Waiting for confirmation message */}
        {isWaiting && !showThanks && (
          <div className="spinner d-flex justify-content-center">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}

        {/* "Thanks for sharing" message and Continue button */}
        {showThanks && (
          <div className="thanks-section">
            <p>Thanks for sharing!</p>
            <button
              onClick={handleContinue}
              style={{
                padding: "10px 20px",
                borderRadius: "5px",
                backgroundColor: "#15057B",
                color: "white",
                border: "none",
                cursor: "pointer",
                marginTop: "20px",
              }}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </Popup>
  );
};

export default SharePopup;