import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  WhatsappShareButton,
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from 'react-share';
import Popup from "reactjs-popup";

const SharePopup = ({ isPopupOpen, setOpenPopup }) => {
  const handleCopy = async () => {
    try {
      navigator.clipboard.writeText('https://heartbot.live/');
      setOpenPopup(false);
    } catch (error) {
      console.error('Error updating conversation count:', error);
    }
  };

  return (
    <Popup
    open={isPopupOpen}
    onClose={() => setOpenPopup(false)}
    modal
    closeOnDocumentClick={false} // Disable closing on outside click
    overlayStyle={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
      contentStyle={{
        width: '80%',
        maxWidth: '400px',
        height: 'auto',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <div className="popup-content-share">
        <Link to="/MainPage">
          <button
            className="close-button-share"
            type="button"
            onClick={() => setOpenPopup(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        </Link>

        <div style={{ marginBottom: '20px' }}>
          <i
            className="fa-solid fa-envelope-open-text"
            style={{
              width: '80%',
              padding: '10px',
              borderRadius: '5px',
              textAlign: 'center',
              fontSize: '40px',
              color: '#15057B',
            }}
          ></i>
        </div>

        <p>Share with friends to get additional conversations!</p>

        <div
          className="copy-link-section"
          style={{ marginTop: '20px', marginBottom: '20px' }}
        >
          <p>Share the code below:</p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value="https://heartbot.live/"
              readOnly
              style={{
                width: '60%',
                padding: '10px',
                borderRadius: '5px',
                textAlign: 'center',
                marginRight: '10px',
                border: '1px solid #ccc',
              }}
            />
            <button
              onClick={handleCopy} // Call handleCopy on click
              style={{
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: '#15057B',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <i className="fas fa-link"></i>
            </button>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#f0f0f0',
            padding: '20px',
            borderRadius: '10px',
          }}
        >
          <p>Share on Social Media:</p>
          <div
            className="share-buttons"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <WhatsappShareButton url="https://heartbot.live/" title="Check this out!" className="share-button">
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>

            <FacebookShareButton url="https://heartbot.live/" quote="Check this out!" className="share-button">
              <FacebookIcon size={32} round />
            </FacebookShareButton>

            <TwitterShareButton url="https://heartbot.live/" title="Check this out!" className="share-button">
              <TwitterIcon size={32} round />
            </TwitterShareButton>

            <LinkedinShareButton url="https://heartbot.live/" title="Check this out!" className="share-button">
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default SharePopup;
