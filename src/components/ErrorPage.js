import React from 'react';
import { Link } from 'react-router-dom';

function ErrorPage() {
  return (
    <>
      <div className="container text-center px-4" id="error-page">
        <img src="assets/images/Multiplehandlady.png" id="ErrorImg" alt="Apologies! Currently Mila is overloaded with too many call requests" />
        <p className="title-text text-center font-weight-bold text-secondary">
          <span className="text-dark">Whoopsie Daisy!</span>
        </p>
        <p className="text-center text-dark mb-3">Oops! Mila's juggling more calls than an octopus at a phone bank. Take a deep breath, count to 10, and reload the screen. Mila promises to grow a few extra arms to handle the load!</p>
        {/* <p className="text-center text-dark mb-3">Thank you for your patience.</p> */}
        
      </div>
    </>
  );
}

export default ErrorPage;
