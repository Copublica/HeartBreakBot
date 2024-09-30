
import React, { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Popup from "reactjs-popup";


const setCookie = (name, value, days) => {
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
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

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


function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!validateEmail(email)) {
      toast.error("Invalid Email Address...");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters...");
      return;
    }
    setLoading(true)

    try {
      const response = await axios.post("https://backend.supermilla.com/login", formData);

      console.log(response.data);
      if (response.data.message === 'Login successful') {
        setCookie('name', response.data.user.username, 7);
        setCookie('email', response.data.user.email, 7);
        setLoading(false);
        fetchmess();
        navigate("/HeartBot"); 
      } else {
        setLoading(false);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('There was an error!', error);
      setLoading(false);
      toast.error('Incorrect Email Address or Password...');
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {

    const decodedCredential = jwtDecode(credentialResponse.credential);
    const user = {
      email: decodedCredential.email,
      username: decodedCredential.name,
    };

    try {
      const response = await axios.post('https://backend.supermilla.com/auth/google-login', user);
      console.log('Google login response:', response.data);
      setCookie('name', user.username, 7); 
      setCookie('email', user.email, 7);
      fetchmess();
      navigate('/HeartBot'); 
    } catch (error) {
      console.error('Error during Google login:', error);
      toast.error("Google Login Failed");
    }
  };

//added
  function detectBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('crios')) {
      return 'chrome'; // Chrome on iOS
    } else if (userAgent.includes('safari') && !userAgent.includes('crios') && !userAgent.includes('chrome')) {
      return 'safari'; // Safari on iOS or Mac
    }
    return 'other';
  }

  useEffect(() => {
    const browser = detectBrowser();
    if (browser === 'safari') {
      setShowPopup(true);
    }
  }, []);

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate('/WelcomeLogin')
  };
  

  return (
    <div className="container px-4" id="loginpage">
       {showPopup && (
        <Popup open={showPopup} closeOnDocumentClick onClose={handlePopupClose}
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
          border:'none',
          borderRadius: "10px",
          textAlign: "center",
          position: "relative", // Added relative positioning to the popup content
        }}>
          <div className="popup-content-main">
            <h3>Recommended Browser</h3>
            <p>For the best experience, we recommend using Google Chrome.</p>
            <button onClick={handlePopupClose} className="popup-close">Close</button>
          </div>
        </Popup>
      )}
      <ToastContainer
          position="top-center"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      <div className='d-flex'>
        <div className="milaNav" style={{ zIndex: '99' }}>
          <div className="navbar-4">
            <Link to="/WelcomeLogin"><button className="back-button" type="button"><i className='fas fa-angle-left'></i> </button></Link>
          </div>
        </div>
      </div>

      <div className="container px-4 mt-5 py-5">
        <p className="title-text text-center font-weight-bold text-secondary">
          Let’s get
          <br />
          <span className="text-dark">started</span> 
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="email" className="form-control" id="email" placeholder="Email address" onChange={handleChange} />
            <i className="far fa-envelope"></i>
          </div>
          <div className="form-group position-relative">
            <input type={showPassword ? "text" : "password"} className="form-control" id="password" placeholder="Password" onChange={handleChange} />
            <i className={showPassword ? "fa-solid fa-eye" : "fa-regular fa-eye-slash"} onClick={togglePasswordVisibility} style={{ position: 'absolute', right: '10px', top: '10px', cursor: 'pointer' }}></i>
          </div>
          <div className="form-group">
            <button type="submit" className="btn-login btn btn-primary py-1 border-0">Login</button>
          </div>
        </form>
        <div className="text-center">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <div className="social-media text-center mt-4">
          <span className="fw-bold"/>Or
          <div className="social-media-icons">
            <div className="s-col-4">
            <GoogleOAuthProvider clientId="338976857027-gq4dq4k9rp20cdukhinchc6nec48gt4m.apps.googleusercontent.com">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => {
                    console.log('Login Failed');
                    toast.error("Login Failed");
                  }}
                />
                <CustomButton />
              </GoogleOAuthProvider>
            </div>
          </div>
        </div>
        <div className="switch-login mt-2">
          <p className="text-center mt-2 h6">Don’t have an account? <Link to="/SignUp">Sign up</Link></p>
        </div>
      </div>
      <Popup 
        open={loading} 
        closeOnDocumentClick={false} 
        modal
        overlayStyle={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
        }} 
        contentStyle={{ 
          width: '100%',  // Full width but controlled with Bootstrap classes
          maxWidth: '350px',  // Limit maximum width
          height: 'auto',  // Auto height for content adaptability
          padding: '1rem',  // Bootstrap padding in rem
          borderRadius: '10px', 
          textAlign: 'center',
          border: 'none', 
          background: 'white',
        }}>
        <div className="spinner d-flex justify-content-center">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </Popup>
    </div>
  );
}

export default LoginPage;

export const CustomButton = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setLoading(true);
      const { access_token } = tokenResponse;
      const options = { 
        method: 'GET',
        headers: { Authorization: `Bearer ${access_token}` },
      };
      fetch('https://www.googleapis.com/oauth2/v2/userinfo', options)
        .then((response) => response.json())
        .then(async (data) => {
          console.log(data);

          const user = {
            email: data.email,
            username: data.given_name,
          };

          // Send data to your backend to store in MongoDB
          try {
            const response = await axios.post('https://backend.supermilla.com/auth/google-login', user);
            console.log('Google login response:', response.data);
            setCookie('name', user.username, 7); // Expires in 7 days
            setCookie('email', user.email, 7);
            setLoading(false);
            fetchmess();
            navigate('/HeartBot'); // Redirect to the main page
          } catch (error) {
            console.error('Error during Google login:', error);
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
      console.error('Google login error:', error);
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
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
  }} 
  contentStyle={{ 
    width: '100%',  // Full width but controlled with Bootstrap classes
    maxWidth: '350px',  // Limit maximum width
    height: 'auto',  // Auto height for content adaptability
    padding: '1rem',  // Bootstrap padding in rem
    borderRadius: '10px', 
    textAlign: 'center',
    border: 'none', 
    background: 'white',
  }}>
  <div className="spinner d-flex justify-content-center">
    <div className="dot"></div>
    <div className="dot"></div>
    <div className="dot"></div>
  </div>
</Popup>


    {/* Google login button */}
    {!loading && (
      <button onClick={login} className="w-custom-google-btn">
        <img src="assets/images/search.png" alt="Google icon" className="w-google-icon" />
        <span className="w-google-text">Sign in with Google</span>
      </button>
    )}
    </>
  );
};