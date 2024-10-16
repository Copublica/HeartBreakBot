import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BeatLoader from "react-spinners/BeatLoader";
import "./Register.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CustomButton } from "./LoginGuestPopup";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import Popup from "reactjs-popup";
import { useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

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

const SignUpPopup = ({ isPopupOpen, setOpenPopup, handleMic }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();

  const [showPopup, setShowPopup] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  const handlePopupToggle = () => setShowPopup(!showPopup);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false); // State for signup popup

  const handleTermsChange = (e) => {
    setTermsChecked(e.target.checked);
  };

  useEffect(() => {
    let interval;
    if (showOtpInput && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [showOtpInput, timer]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleOtpChange = (element, index) => {
    const value = element.value;

    if (/^\d*$/.test(value)) {
      let newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input box when a digit is entered
      if (value && index < 5) {
        document.getElementById(`otp${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const otpArray = pasteData.split("");
      setOtp(otpArray);

      const lastIndex = otpArray.findIndex((digit, idx) => idx === 5);
      document.getElementById("otp5").focus(); // Focus on the last box
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = formData;

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address....");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords Mismatch..");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://backend.supermilla.com/hbregister",
        { username, email, password }
      );
      setUserId(response.data.userId);
      setShowOtpInput(true); // Show OTP input field
      setShowOtpPopup(true); // Show OTP popup
      setTimer(60); // Reset timer
      setIsResendDisabled(true); // Disable resend button
      setLoading(false);
      setNotification("OTP has been sent to your email.");
      toast.success("OTP has been sent to your email.");
    } catch (error) {
      setLoading(false);

      if (error.response && error.response.status === 400) {
        if (
          error.response.data.error ===
          "User already exists with this email address."
        ) {
          toast.error("User already exists with this email.");
          setNotification("User already exists with this email.");
        } else {
          toast.error("Validation error: " + error.response.data.error);
        }
      } else {
        toast.error("Failed to send OTP. Please try again.");
        setNotification("Failed to send OTP. Please try again.");
      }
    }
  };
  

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    const { username, email} = formData;

    try {
      const response = await axios.post(
        "https://backend.supermilla.com/hbregister/verify-otp",
        { userId, otp: enteredOtp }
      );
      toast.success("Registration successful.");
      setCookie("name", username, 7);
      setCookie("email",email, 7);
      const guestEmail = getCookie("guestEmail");
            if (guestEmail) {
              await updateMessageAndTitle(
                guestEmail,
                email,
                username
              );
            }
      setOpenPopup(false)
      handleMic(false);
    } catch (error) {
      console.error("There was an error!", error);
      toast.error("Invalid OTP.");
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        "https://backend.supermilla.com/hbregister/resend-otp",
        { userId }
      );
      setTimer(60); // Reset timer
      setIsResendDisabled(true); // Disable resend button
      setLoading(false);
      setNotification("OTP has been resent to your email.");
      toast.success("OTP has been resent to your email.");
    } catch (error) {
      console.error("There was an error!", error);
      setLoading(false);
      setNotification("Failed to resend OTP. Please try again.");
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <>
      <div className="container text-center px-4" id="loginpage">
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

        <p className="title-text text-center font-weight-bold text-secondary">
          <span className="text-dark">Get Started</span>
        </p>
        <p className="text-center text-dark mb-3">
          by creating a <span className="text-danger">free account</span>
        </p>

        {notification && (
          <p className="text-center text-success">{notification}</p>
        )}
        {loading && (
          <div className="text-center">
            <BeatLoader color="#007bff" />
          </div>
        )}

        {!showOtpInput ? (
          <>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  placeholder="Full name"
                  onChange={handleChange}
                  required
                />
                <i className="far fa-user-circle"></i>
              </div>
              <div className="form-group">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Email ID"
                  onChange={handleChange}
                  required
                />
                <i className="far fa-envelope"></i>
              </div>
              <div className="form-group position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="password"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                />
                <i
                  className={
                    showPassword ? "fa-solid fa-eye" : "fa-regular fa-eye-slash"
                  }
                  onClick={togglePasswordVisibility}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "10px",
                    cursor: "pointer",
                  }}
                ></i>
              </div>
              <div className="form-group position-relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  id="confirmPassword"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  required
                />
                <i
                  className={
                    showConfirmPassword
                      ? "fa-solid fa-eye"
                      : "fa-regular fa-eye-slash"
                  }
                  onClick={toggleConfirmPasswordVisibility}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "10px",
                    cursor: "pointer",
                  }}
                ></i>
              </div>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input register-check-box"
                  id="terms"
                  checked={termsChecked}
                  onChange={handleTermsChange}
                  required
                />
                <label className="form-check-label-register" htmlFor="terms">
                  By checking the box you agree to our{" "}
                  <a href="#" onClick={handlePopupToggle}>
                    <span className="text-red">Terms</span> and{" "}
                    <span className="text-red">Conditions</span>
                  </a>
                </label>
              </div>

              <div className="form-group">
                <button
                  type="submit"
                  className="btn-login btn btn-primary py-1 border-0"
                >
                  Sign up
                </button>
              </div>
            </form>
            <div className="or-container">
          <hr className="or-line" />
          <p className="or-text">OR</p>
          <hr className="or-line" />
        </div>
            <div className="switch-login mt-2 mb-2">
              <GoogleOAuthProvider clientId="338976857027-gq4dq4k9rp20cdukhinchc6nec48gt4m.apps.googleusercontent.com">
                <GoogleLogin
                  //   onSuccess={handleGoogleLoginSuccess}
                  onError={() => {
                    console.log("Login Failed");
                    toast.error("Login Failed");
                  }}
                />
                <CustomButtonSignupPopup
                  setIsLoggedIn={setIsLoggedIn}
                  setOpenPopup={setOpenPopup}
                  handleMic={handleMic}
                />
              </GoogleOAuthProvider>
            </div>
          </>
        ) : (
            <form onSubmit={handleOtpSubmit}>
            <div className="form-group otp-input-group">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  className="otp-input"
                  id={`otp${index}`}
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  maxLength="1"
                  onPaste={handlePaste} 
                />
              ))}
            </div>
            <div className="form-group">
              <button
                type="submit"
                className="btn-login btn btn-primary py-1 border-0"
              >
                Verify OTP
              </button>
            </div>
            <div className="form-group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleResendOtp}
                disabled={isResendDisabled}
              >
                Resend OTP {isResendDisabled ? `(${timer}s)` : ""}
              </button>
            </div>
          </form>
        )}
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-inner">
            <div className="popup-inner-top">
              <span>Terms and Conditions</span>
              <span>&</span>
              <span>Privacy Policy</span>
            </div>
            <div className="popup-content">
              <h3 className="fw-bold">
                Terms and Conditions w.e.f 13 January 2024
              </h3>
              <h4>1. Acceptance of Terms</h4>
              <p>
                By accessing or using the COPUBLICA Voicebot Service
                ("Service"), you agree to comply with and be bound by these
                Terms and Conditions ("Terms"). If you do not agree to these
                Terms, please do not use our Service.
              </p>
              <h4>2. Privacy Policy Integration</h4>
              <p>
                Your use of the Service is also governed by our Privacy Policy,
                which is incorporated by reference. Please review our Privacy
                Policy(supermilla.com/privacy-policy) to understand how we
                collect, use, and protect your personal data.
              </p>
              <h4>3. User Consent and Data Collection</h4>
              <p>
                Consent for data collection is implied through service usage
                without explicit opt-in. By using our Service, users acknowledge
                and agree to the terms outlined in our Privacy Policy. We
                collect various types of personal data, as detailed in the
                Privacy Policy, to provide and improve our Service.
              </p>
              <h4>4. Data Access and Retention</h4>
              <p>
                Only authorized employees of COPUBLICA have access to user data.
                We retain personal data for 1 year to provide the Service, train
                our AI, generate analytics, and comply with legal obligations.
                After 1 year, data is anonymized.
              </p>
              <h4>5. User Rights</h4>
              <p>
                Users have the right under GDPR to access or delete the personal
                data we hold. Contact{" "}
                <a href="mailto:support@copublica.dk">support@copublica.dk</a>{" "}
                to make requests.
              </p>
              <h4>6. Data Security</h4>
              <p>
                We implement appropriate technical and organizational measures
                to protect user data, including encryption, access controls,
                auditing, and regular security reviews.
              </p>
              <h4>7. Marketing Communications</h4>
              <p>
                Users are automatically subscribed to receive marketing
                communications. To opt-out, users need to contact our support
                team at{" "}
                <a href="mailto:support@copublica.dk">support@copublica.dk</a>{" "}
                for prompt assistance.
              </p>
              <h4>8. User Profiling</h4>
              <p>
                We use data for detailed user profiling and automated decisions
                to enhance user experiences. This includes tailoring
                interactions based on user preferences and behavior patterns.
              </p>
              <h4>9. Children's Privacy</h4>
              <p>
                Our Service is designed for users of all ages, including
                children. We are committed to complying with child privacy laws
                and implementing measures to ensure the safety and protection of
                young users.
              </p>
              <h4>10. Disclosure of Data</h4>
              <p>
                We may disclose data if required by law to comply with legal
                processes, regulatory requirements, or law enforcement requests,
                prioritizing user privacy and protection.
              </p>
              <h4>11. Policy Updates</h4>
              <p>
                If we make changes to these Terms or the Privacy Policy, active
                registered users will be notified by email. We encourage
                periodic review of these documents.
              </p>
              <h4>12. Contact Information</h4>
              <p>
                For any inquiries or concerns related to these Terms or our
                Privacy Policy, please email{" "}
                <a href="mailto:voicebot@copublica.dk">voicebot@copublica.dk</a>
                .
              </p>

              <h2 className="fw-bold">
                Privacy Policy w.e.f 13rd January 2024
              </h2>
              <p>
                This privacy policy discloses how COPUBLICA collects, uses,
                shares, and protects the personal data of users of our voicebot
                service.
              </p>
              <h4>Data Collection</h4>
              <p>
                We collect the following types of personal data when you use our
                service:
              </p>
              <ul>
                <li>
                  - Usage data such as session duration, number of messages, bot
                  interactions
                </li>
                <li>
                  - Contact details such as name, email address, phone number
                </li>
                <li>
                  - Voice recordings which are transcribed into text by our
                  service
                </li>
              </ul>
              <h4>Data is collected via:</h4>
              <ul>
                <li>
                  - Direct input from users when setting up an account and using
                  features
                </li>
                <li>
                  - Cookies, analytics tools, and other technologies to track
                  usage
                </li>
                <li>- Third-party services linked to our voicebot</li>
              </ul>
              <p>
                This data allows us to provide and improve our service, follow
                legal obligations, and send marketing communications.
              </p>
              <h4>Data Access and Retention</h4>
              <p>
                Only authorized employees of COPUBLICA have access to user data.
                We retain personal data for 1 year in order to provide our
                service, train our AI, generate analytics, and comply with legal
                obligations. After 1 year, data is anonymized.
              </p>
              <h4>User Rights</h4>
              <p>
                Users have the right under GDPR to access, edit, delete,
                restrict processing of, and receive copies of the personal data
                we hold. Contact{" "}
                <a href="mailto:support@copulica.dk">support@copulica.dk</a> to
                make requests.
              </p>
              <h4>Data Security</h4>
              <p>
                We implement appropriate technical and organizational measures
                to protect user data, including encryption, access controls,
                auditing, and regular security reviews.
              </p>
              <h4>Voice Data</h4>
              <p>
                Voice recordings from our service are automatically transcribed
                into text. The text transcriptions are stored, but the original
                voice recordings are deleted after transcription is complete.
              </p>
              <h4>Marketing Communications</h4>
              <p>
                Users are automatically subscribed to receive marketing
                communications when signing up for our service. To opt-out,
                users need to contact our support team at{" "}
                <a href="mailto:support@copublica.dk">support@copublica.dk</a>{" "}
                for prompt assistance.
              </p>
              <h4>Disclosure of Data</h4>
              <p>
                We may disclose user data if required to by law to comply with
                legal process, regulatory requirements, or law enforcement
                requests.
              </p>
              <h4>Policy Updates</h4>
              <p>
                We reserve the right to update this Privacy Policy at any time
                to reflect changes to our practices or for legal, regulatory, or
                operational reasons. We will notify active registered users of
                any changes by email.
              </p>
              <h4>Contact Information</h4>
              <p>
                For any inquiries or concerns related to this Privacy Policy,
                please email{" "}
                <a href="mailto:voicebot@copublica.dk">voicebot@copublica.dk</a>
                .
              </p>
            </div>
            <div className="popup-actions container">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="popupTerms"
                  checked={termsChecked}
                  onChange={handleTermsChange}
                />
                <label className="form-check-label" htmlFor="popupTerms">
                  I agree to the terms and conditions
                </label>
              </div>
              <button
                onClick={handlePopupToggle}
                className="accpet-button close-button mt-3 rounded-5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showOtpPopup && ( // Show OTP pop-up when true
        <div className="otp-popup">
          <div className="otp-popup-content">
            <h2>OTP Verification</h2>
            <p>Enter the 6-digit OTP sent to your email:</p>
            <form className="otp-form" onSubmit={handleOtpSubmit}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste} 
                />
              ))}
              <button type="submit" className="verify-button rounded-5 mt-3">
                Verify
              </button>
            </form>

            <div className="resend-otp mt-3">
              <p>
                Didn't receive the OTP?{" "}
                <button
                  className="btn btn-link"
                  onClick={handleResendOtp}
                  disabled={isResendDisabled}
                >
                  Resend OTP {isResendDisabled && `in ${timer}s`}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignUpPopup;

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

export const CustomButtonSignupPopup = ({
  setIsLoggedIn,
  setOpenPopup,
  handleMic,
}) => {
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

            // Close the login popup
            const guestEmail = getCookie("guestEmail");
            if (guestEmail) {
              await updateMessageAndTitle(
                guestEmail,
                user.email,
                user.username
              );
            }
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
