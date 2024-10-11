import React, { useState, useRef } from "react";
import axios from "axios";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import Popup from "reactjs-popup";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const setCookie = (name, value, days) => {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
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

const LoginGuestPopup = ({ isPopupOpen, setOpenPopup, handleMic, loading }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const decodedCredential = jwtDecode(credentialResponse.credential);
    const user = {
      email: decodedCredential.email,
      username: decodedCredential.name,
    };

    try {
      const response = await axios.post(
        "https://backend.supermilla.com/hbauth/google-login",
        user
      );
      setCookie("name", user.username, 7);
      setCookie("email", user.email, 7);
      setIsLoggedIn(true);
      setOpenPopup(false);  // Close login popup
    //   handleMic(false);
    const guestEmail = getCookie("guestEmail");
    if (guestEmail) {
      // Send a request to update the message and title in the database
      try {
        const updateResponse = await axios.put(
          "https://backend.supermilla.com/message/updateMessage",
          {
            guestEmail: guestEmail, // The guest email to find the message and title
            userEmail: user.email, // The user's Gmail to replace the message and title with
          }
        );

        console.log(
          "Message and title updated from guestEmail to user email:",
          updateResponse.data
        );
      } catch (error) {
        console.error("Error updating message and title:", error);
        toast.error("Failed to update message and title for guest email.");
      }
    }
    } catch (error) {
      toast.error("Google Login Failed");
    }
  };

  return (
    !loading && (
      <Popup
        open={isPopupOpen}
        modal
        closeOnDocumentClick={false}
        onClose={() => setOpenPopup(false)}
        overlayStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          contentStyle={{
            width: "100%",
            maxWidth: "350px",
            padding: "1rem",
            borderRadius: "10px",
            textAlign: "center",
            border: "none",
            background: "white",
          }}
      >
        <div className="google-login" style={{ margin: "10px 10px" ,height:"none"}}>
         

          <GoogleOAuthProvider clientId="338976857027-gq4dq4k9rp20cdukhinchc6nec48gt4m.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => toast.error("Login Failed")}
            />
           <CustomButton
  setIsLoggedIn={setIsLoggedIn}
  setOpenPopup={setOpenPopup}
  handleMic={handleMic}  
/>
          </GoogleOAuthProvider>
        </div>
      </Popup>
    )
  );
};

export default LoginGuestPopup;

export const CustomButton = ({ setIsLoggedIn, setOpenPopup, handleMic }) => {
    const [loading, setLoading] = useState(false);
  
    const login = useGoogleLogin({
      onSuccess: (tokenResponse) => {
        setLoading(true);
        const { access_token } = tokenResponse;
        const options = {
          method: "GET",
          headers: { Authorization: `Bearer ${access_token}` },
        };
  
        fetch("https://www.googleapis.com/oauth2/v2/userinfo", options)
          .then((response) => response.json())
          .then(async (data) => {
            const user = {
              email: data.email,
              username: data.given_name,
            };
  
            try {
              const response = await axios.post(
                "https://backend.supermilla.com/hbauth/google-login",
                user
              );
              setCookie("name", user.username, 7);
              setCookie("email", user.email, 7);
              setIsLoggedIn(true);
              setOpenPopup(false); 
              const guestEmail = getCookie("guestEmail");
              if (guestEmail) {
                // Send a request to update the message and title in the database
                try {
                  const updateResponse = await axios.put(
                    "https://backend.supermilla.com/message/updateMessage",
                    {
                      guestEmail: guestEmail, // The guest email to find the message and title
                      userEmail: user.email, // The user's Gmail to replace the message and title with
                    }
                  );
        
                  console.log(
                    "Message and title updated from guestEmail to user email:",
                    updateResponse.data
                  );
                } catch (error) {
                  console.error("Error updating message and title:", error);
                  toast.error("Failed to update message and title for guest email.");
                }
              }
              
              // Close the login popup
            } catch (error) {
              toast.error("Google Login Failed");
            } finally {
              setLoading(false);  // Hide the loading spinner
              handleMic(false);  // Disable the microphone
            }
          })
          .catch((error) => {
            setLoading(false);  // Hide the loading spinner on error
            handleMic(false);  // Disable the microphone on error
            toast.error("Google Login Failed");
          });
      },
      onError: () => {
        setLoading(false);  // Hide the loading spinner on error
        handleMic(false);   // Disable the microphone on error
        toast.error("Google Login Failed");
      },
    });
  
    return (
      <>
        {/* Loading spinner popup */}
        <Popup
          open={loading}
          closeOnDocumentClick={false}
          modal
          overlayStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          contentStyle={{
            width: "100%",
            maxWidth: "350px",
            padding: "1rem",
            borderRadius: "10px",
            textAlign: "center",
            border: "none",
            background: "white",
          }}
        >
          <div className="spinner d-flex justify-content-center">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </Popup>
  
        {!loading && (
          <button onClick={login} className="w-custom-google-btn">
            <img
              src="assets/images/search.png"
              alt="Google icon"
              className="w-google-icon"
            />
            <span className="w-google-text">Sign in with Google</span>
          </button>
        )}
      </>
    );
  };
  
  