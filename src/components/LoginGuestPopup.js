import React, { useState } from "react";
import axios from "axios";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import Popup from "reactjs-popup";
import { useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import SignUpPopup from "./SignUpPopup";

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

const updateMessageAndTitle = async (guestEmail, userEmail, userName) => {
  try {
    const updateResponse = await axios.put(
      "https://backend.supermilla.com/message/updateMessage",
      {
        guestEmail: guestEmail,
        userEmail: userEmail,
        userName: userName,
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
};

const LoginGuestPopup = ({ isPopupOpen, setOpenPopup, handleMic, loading }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false); // State for signup popup

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
      setOpenPopup(false); // Close login popup
      const guestEmail = getCookie("guestEmail");
      if (guestEmail) {
        await updateMessageAndTitle(guestEmail, user.email, user.username);
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
        <div
          className="google-login"
          style={{ margin: "10px 10px", height: "none" }}
        >
          <GoogleOAuthProvider clientId="338976857027-ttmrm7i13t68kf22c3n36q0k03quql4i.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => toast.error("Login Failed")}
            />

            <CustomButton
              setIsLoggedIn={setIsLoggedIn}
              setOpenPopup={setOpenPopup}
              handleMic={handleMic}
            />

            <button
              className="btn-login-popup mt-2"
              onClick={() => setIsSignupOpen(true)}
            >
              Sign Up
            </button>
          </GoogleOAuthProvider>
        </div>

        {/* Signup popup */}
        <Popup
          open={isSignupOpen}
          modal
          closeOnDocumentClick={false}
          onClose={() => setIsSignupOpen(false)}
          overlayStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          contentStyle={{
            width: "100%",
            maxWidth: "450px",
            padding: "1rem",
            borderRadius: "10px",
            textAlign: "center",
            border: "none",
            background: "white",
          }}
        >
          <SignUpPopup setIsLoggedIn={setIsLoggedIn}
              setOpenPopup={setOpenPopup}
              handleMic={handleMic} />
        </Popup>
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
              await updateMessageAndTitle(
                guestEmail,
                user.email,
                user.username
              );
            }

            // Close the login popup
          } catch (error) {
            toast.error("Google Login Failed");
          } finally {
            setLoading(false); // Hide the loading spinner
            handleMic(false); // Disable the microphone
          }
        })
        .catch((error) => {
          setLoading(false); // Hide the loading spinner on error
          handleMic(false); // Disable the microphone on error
          toast.error("Google Login Failed");
        });
    },
    onError: () => {
      setLoading(false); // Hide the loading spinner on error
      handleMic(false); // Disable the microphone on error
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
        <>
          <p>Apologies! To proceed with the conversation kindly sign in.</p>
          <button onClick={login} className="w-custom-google-btn">
            <img
              src="assets/images/search.png"
              alt="Google icon"
              className="w-google-icon"
            />
            <span className="w-google-text">Sign in with Google</span>
          </button>
        </>
      )}
    </>
  );
};