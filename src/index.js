import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'bootstrap/dist/css/bootstrap.min.css';

import ReactGA from 'react-ga4';


ReactGA.initialize("G-3R6SE2F7TZ")
ReactGA.send({
  hitType: "pageview",
  page: window.location.pathname,
});


const Root = () => {
  // const [showTitlePage, setShowTitlePage] = useState(false);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setShowTitlePage(true);
  //   }, 3500); // 3 seconds delay

  //   return () => clearTimeout(timer); // Cleanup the timer
  // }, []);

  return (
      <App/>
  );
};

ReactDOM.render(<Root />, document.getElementById('root'));

reportWebVitals();
