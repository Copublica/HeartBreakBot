import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./BugReport.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function BugReport() {
  const [selectedIssues, setSelectedIssues] = useState([]); // Use an array for multiple selections
  const [selectedSeverity, setSelectedSeverity] = useState(null);
  const [selectedFrequency, setSelectedFrequency] = useState(null);
  const [bugDescription, setBugDescription] = useState("");
  const navigate = useNavigate();

  const issues = [
    { id: "audio", label: "Audio Issues" },
    { id: "language", label: "Language Support" },
    { id: "user interface", label: "User Interface" }, 
    { id: "input recognition", label: "Input Recognition" },
    { id: "output deplay", label: "Output Deplay" },
    { id: "other", label: "Other Issues" },
  ];

  const severityLevels = [
    { id: "minor", label: "Minor" },
    { id: "major", label: "Major" },
    { id: "critical", label: "Critical" },
  ];

  const frequencyOptions = [
    { id: "rarely", label: "Rarely" },
    { id: "sometimes", label: "Sometimes" },
    { id: "often", label: "Very Often" },
    { id: "always", label: "Always" },
  ];

  const handleIssueSelection = (issue) => {
    if (selectedIssues.includes(issue)) {
      // Remove the issue if it is already selected
      setSelectedIssues(selectedIssues.filter((i) => i !== issue));
    } else {
      // Add the issue if it is not selected
      setSelectedIssues([...selectedIssues, issue]);
    }
  };

  const handleSeveritySelection = (level) => {
    setSelectedSeverity(level);
  };

  const handleFrequencySelection = (frequency) => {
    setSelectedFrequency(frequency);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gather all form data
    const bugReportData = {
      issues: selectedIssues,
      severity: selectedSeverity,
      frequency: selectedFrequency,
      description: bugDescription,
    };

    // Log the collected data (for demonstration purposes)
    console.log(bugReportData);

    // Show a success toast notification
    toast.success("Bug Report Submitted Successfully!", {});
    setTimeout(() => {
      navigate("/MainPage");
    }, 1000);
  };

  return (
    <>
      <div className="display">
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

        <div
          className="container voice-ui"
          style={{ backgroundSize: "cover", minHeight: "100vh" }}
        >
          <div className="d-flex">
            <div className="milaNav" style={{ zIndex: "99" }}>
              <div className="navbar-4">
                <Link to="/MainPage">
                  <button className="back-button" type="button">
                    <i className="fas fa-angle-left"></i>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1>Bug Report</h1>

          {/* Instruction Text */}
          <p>Select the issues you are currently facing:</p>

          <form onSubmit={handleSubmit} className="form-group">
            <div className="row">
              {issues.map((issue, index) => (
                <div
                  className={`col-md-6 mb-3 ${
                    index % 2 === 0 ? "mb-md-0" : ""
                  }`}
                  key={issue.id}
                >
                  <button
                    className={`issue_btn rounded-pill ${
                      selectedIssues.includes(issue.id) ? "active" : ""
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
                      selectedSeverity === severity.id ? "selected" : ""
                    }`}
                    onClick={() => handleSeveritySelection(severity.id)}
                  >
                    {severity.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency of Occurrence */}
            <div className="mt-4 p-3 shadow-sm bg-light rounded">
              <p className="h5">Frequency of Occurrence:</p>
              <div
                className="btn-group btn-group-toggle d-flex flex-wrap"
                data-toggle="buttons"
              >
                {frequencyOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`flex-fill m-1 rounded-pill frequency-option-btn ${
                      selectedFrequency === option.id ? "selected" : ""
                    }`}
                    onClick={() => handleFrequencySelection(option.id)}
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
              <input type="file" className="form-control" />
            </div>

            <div className="text-center mt-4">
              <button type="submit" className=" rounded-pill btn-submit">
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
