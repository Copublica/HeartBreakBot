import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './App.css';
import { jwtDecode } from "jwt-decode";
import {
  BrowserRouter,
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";
import SpleshScreen from './components/SpleshScreen';

import LoginPage from './components/LoginPage';
import SignUp from './components/SignUp';
import MainPage from './components/MainPage';


import WelcomeLogin from './components/welcomeLogin';

import ForgotPassword from './components/ForgotPassword';
import PrivateRoute from './PrivateRoute';
import MaintenancePage from './components/MaintenancePage';

import HeartBot from './components/HeartBot';
import BugReport from './components/BugReport';
import ErrorPage from './components/ErrorPage';

// import HeartBot4 from './components/HeartBot4';npm


function App() {
  const [user, setUser] = useState(null);
  return (
<div>
<BrowserRouter >
    <Routes>
      <Route path='/' element={<SpleshScreen/>}></Route>
   
      <Route path='/LoginPage' element={<LoginPage/>}></Route>
      <Route path='/SignUp' element={<SignUp/>}></Route>

      {/* <Route path='/MainPage' element={<MainPage/>}></Route> */}
      <Route path='/MainPage' element={ <PrivateRoute><MainPage/></PrivateRoute>}></Route>
      {/* <Route path='/MainPage' element={ <MainPage/>}></Route> */}
     
     
      
      {/* <Route path='Test' element={<Test/>}></Route> */}

      <Route path='WelcomeLogin' element={<WelcomeLogin/>}></Route>

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/errorpage" element={<ErrorPage />} />

      <Route path='*' element={<MaintenancePage/>}></Route>

      <Route path='HeartBot' element={<HeartBot/>}></Route>
          <Route path='Bug' element={<BugReport />}></Route>
         
    

    </Routes>
</BrowserRouter>

      {/* <div className='google-signUp' id='signInDiv'>
      <GoogleOAuthProvider clientId="338976857027-orhikrsb7037ussbjb5c083ksfu5679c.apps.googleusercontent.com">
        
        <GoogleLogin
          onSuccess={credentialResponse => {
            const decodedCredential = jwtDecode(credentialResponse.credential);
            console.log(decodedCredential);
            setUser(decodedCredential); // Set user state with decoded credential
            document.getElementById("signInDiv").hidden=true;  
              }}
          onError={() => {
            console.log('Login Failed');
          }}
        />
      </GoogleOAuthProvider>
      </div>
      
      {user && // Render user information if user is available
        <div>
          <img src={user.picture} alt="User profile"></img>
          <p>{user.name}</p>
          <p>{user.email}</p>
        </div>
      } */}
    </div>

  );
}

export default App;
