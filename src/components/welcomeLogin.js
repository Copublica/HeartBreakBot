import React, { useState, useEffect } from "react";
// import logo from '../logo.jpg';
import {
  GoogleOAuthProvider,
  GoogleLogin,
  useGoogleLogin,
} from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Popup from "reactjs-popup";

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

const fetchmess = async () => {
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

    if (data.message == "No Data Found") {
      setCookie("UserAttechementstyle", "false", 30);
      // console.log("User has logged in before.");
    } else {
      setCookie("UserAttechementstyle", "true", 30);
    }
  } catch (error) {
    console.error("Error fetching attachment style:", error);
  }
};

const WelcomeLogin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", picture: "", exp: "" });
  const [showPopup, setShowPopup] = useState(false);

  // const handleGoogleSuccess = (credentialResponse) => {
  //   const decoded = jwtDecode(credentialResponse.credential);
  //   setUser({
  //     name: decoded.name,
  //     picture: decoded.picture,
  //     exp: decoded.exp,
  //   });
  //   console.log(decoded);
  // }

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const decodedCredential = jwtDecode(credentialResponse.credential);
    const user = {
      email: decodedCredential.email,
      username: decodedCredential.name,
    };

    try {
      const response = await axios.post(
        "https://backend.supermilla.com/auth/google-login",
        user
      );
      console.log("Google login response:", response.data);
      setCookie("name", user.username, 7);
      setCookie("email", user.email, 7);
      fetchmess();
      navigate("/MainPage");
    } catch (error) {
      console.error("Error during Google login:", error);
      toast.error("Google Login Failed");
    }
  };

  const handleGoogleError = () => {
    console.log("Login Failed");
  };

  useEffect(() => {
    if (user.name) {
      console.log("User state has been updated: ", user);
    }
  }, [user]);


  return (
    <div className="auth-container text-center">
      <div className="auth-contents">
        <div className="logo-section">
          <div className="logo">
            <img className="" src="/assets/images/logo.png" alt="logo" />
          </div>
        
          <div className="logo-heading">
            
            <h3 className="mt-3 fs-5"></h3>
            <p>You made it in time! As an early bird, Heartbot is yours to use for free.</p>
            {/* <p className='w-p-text'>Hello! Ready to begin?</p> */}
          </div>
        </div>
        <div className="button-section">
          <div>
            <Link to="/SignUp">
              {" "}
              <button className="register welcome-button">Register</button>
            </Link>
          </div>
          <div>
            <Link to="/LoginPage">
              <button className="login welcome-button">Login</button>
            </Link>
          </div>
        </div>
        <div className="google-login">
          <div className="line"></div>

          <GoogleOAuthProvider clientId="338976857027-gq4dq4k9rp20cdukhinchc6nec48gt4m.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => {
                console.log("Login Failed");
                toast.error("Login Failed");
              }}
            />
            <CustomButton />
          </GoogleOAuthProvider>
        </div>
        {/* {user.name && (
          <div className="user-info">
            <img src={user.picture} alt={user.name} />
            <h3>{user.name}</h3>
            <p>Token expires at: {new Date(user.exp * 1000).toLocaleString()}</p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default WelcomeLogin;

export const CustomButton = () => {
  const navigate = useNavigate();
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
          console.log(data);

          const user = {
            email: data.email,
            username: data.given_name,
          };

          // Send data to your backend to store in MongoDB
          try {
            const response = await axios.post(
              "https://backend.supermilla.com/auth/google-login",
              user
            );
            console.log("Google login response:", response.data);
            setCookie("name", user.username, 7); // Expires in 7 days
            setCookie("email", user.email, 7);
            setLoading(false);
            fetchmess();
            navigate("/MainPage"); // Redirect to the main page
          } catch (error) {
            console.error("Error during Google login:", error);
            setLoading(false);
            toast.error("Google Login Failed");
          }
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setLoading(false);
      toast.error("Google Login Failed");
    },
  });

  return (
    <>
      {/* Popup to show while loading */}
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
          width: "100%", // Full width but controlled with Bootstrap classes
          maxWidth: "350px", // Limit maximum width
          height: "auto", // Auto height for content adaptability
          padding: "1rem", // Bootstrap padding in rem
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

      {/* Google login button */}
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