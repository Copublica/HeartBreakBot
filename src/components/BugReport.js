import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './BugReport.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Function to get cookie by name
const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

function BugReport() {
  const [email, setEmail] = useState(''); // State for email
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [selectedSeverity, setSelectedSeverity] = useState(null);
  const [selectedFrequency, setSelectedFrequency] = useState(null);
  const [bugDescription, setBugDescription] = useState('');
  const [file, setFile] = useState(null); // State for file input
  const fileInputRef = useRef(null); // Ref to access the file input element
  const navigate = useNavigate();

  // Get email from cookies and set it in the state
  useEffect(() => {
    const userEmail = getCookie('email'); // Assuming the cookie is named 'email'
    if (userEmail) {
      setEmail(userEmail);
    }
  }, []); // Run this effect once when the component mounts

  const issues = [
    { id: 'audio', label: 'Audio Issues' },
    { id: 'language', label: 'Language Support' },
    { id: 'user interface', label: 'User Interface' },
    { id: 'input recognition', label: 'Input Recognition' },
    { id: 'output delay', label: 'Output Delay' },
    { id: 'other', label: 'Other Issues' }
  ];

  const severityLevels = [
    { id: 'minor', label: 'Minor' },
    { id: 'major', label: 'Major' },
    { id: 'critical', label: 'Critical' }
  ];

  const frequencyOptions = [
    { id: 'rarely', label: 'Rarely' },
    { id: 'sometimes', label: 'Sometimes' },
    { id: 'often', label: 'Very Often' },
    { id: 'always', label: 'Always' }
  ];

  const handleIssueSelection = (issue) => {
    if (selectedIssues.includes(issue)) {
      setSelectedIssues(selectedIssues.filter((i) => i !== issue));
    } else {
      setSelectedIssues([...selectedIssues, issue]);
    }
  };

  // Function to handle removing the selected file
  const handleRemoveFile = () => {
    setFile(null); // Clear the file state
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the file input value
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('email', email); // Append the email from cookies
    formData.append('issues', JSON.stringify(selectedIssues));
    formData.append('severity', selectedSeverity);
    formData.append('frequency', selectedFrequency);
    formData.append('description', bugDescription);
    if (file) {
      formData.append('file', file); // Only append if a file is selected
    }

    try {
      const response = await fetch('https://backend.supermilla.com/bug', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast.success('Bug Report Submitted Successfully!');
        setTimeout(() => {
          navigate('/MainPage');
        }, 1000);
      } else {
        toast.error('Failed to submit bug report.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while submitting the bug report.');
    }
  };

  return (
    <>
      <div className="display">
        <ToastContainer />
        <div className="container voice-ui">
          <div className="d-flex">
            <div className="milaNav">
              <div className="navbar-4">
                <Link to="/MainPage">
                  <button className="back-button" type="button">
                    <i className="fas fa-angle-left"></i>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <h1>Bug Report</h1>
          <p>Select the issues you are currently facing:</p>

          <form onSubmit={handleSubmit} className="form-group">
            {/* Email (pre-filled from cookies) */}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Update email manually if needed
                required
                disabled // Disable email field as it's fetched from cookies
              />
            </div>

            {/* Issues Selection */}
            <div className="row">
              {issues.map((issue, index) => (
                <div
                  className={`col-md-6 mb-3 ${index % 2 === 0 ? 'mb-md-0' : ''}`}
                  key={issue.id}
                >
                  <button
                    className={`issue_btn rounded-pill ${
                      selectedIssues.includes(issue.id) ? 'active' : ''
                    }`}
                    type="button"
                    onClick={() => handleIssueSelection(issue.id)}
                  >
                    {issue.label}
                  </button>
                </div>
              ))}
            </div>

            {/* Severity Level */}
            <div className="mt-4 p-3 shadow-sm bg-light rounded">
              <p className="font-weight-bold">Severity Level:</p>
              <div className="d-flex justify-content-between">
                {severityLevels.map((severity) => (
                  <button
                    key={severity.id}
                    type="button"
                    className={`severity-level-btn rounded-pill ${
                      selectedSeverity === severity.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedSeverity(severity.id)}
                  >
                    {severity.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency of Occurrence */}
            <div className="mt-4 p-3 shadow-sm bg-light rounded">
              <p className="h5">Frequency of Occurrence:</p>
              <div className="btn-group btn-group-toggle d-flex flex-wrap" data-toggle="buttons">
                {frequencyOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`flex-fill m-1 rounded-pill frequency-option-btn ${
                      selectedFrequency === option.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedFrequency(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bug Description */}
            <div className="mt-4">
              <textarea
                className="form-control"
                rows="5"
                placeholder="Describe the bug..."
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
              ></textarea>
            </div>

            {/* File Upload */}
            <div className="mt-4">
              <label className="form-label">Upload Bug Image/Video:</label>
              <input
                type="file"
                className="form-control"
                ref={fileInputRef} // Attach ref to the file input
                onChange={(e) => setFile(e.target.files[0])} // Handle file input
              />
            </div>

            {/* Display Remove File button if a file is selected */}
            {file && (
              <div className="mt-2">
                <p>Selected File: {file.name}</p>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleRemoveFile} // Call the remove function
                >
                  Remove File
                </button>
              </div>
            )}

            <div className="text-center mt-4">
              <button type="submit" className="rounded-pill btn-submit">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default BugReport;
