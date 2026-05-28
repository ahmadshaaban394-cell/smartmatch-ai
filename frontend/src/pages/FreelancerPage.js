import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function FreelancerPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [expectedSalary, setExpectedSalary] = useState("");
  const [availability, setAvailability] = useState("");
  const [location, setLocation] = useState("");
  const [skill, setSkill] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [freelancerId, setFreelancerId] = useState(null);
  const [latestJobs, setLatestJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [aiLoading, setAiLoading] = useState(false);
  const [detectedSkills, setDetectedSkills] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [extractedTextPreview, setExtractedTextPreview] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    fetchLatestJobs();
  }, [user, navigate]);

  const fetchLatestJobs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/jobs/latest");
      setLatestJobs(res.data || []);
    } catch (error) {
      console.error("Error fetching latest jobs:", error);
    }
  };

  const fetchApplications = async (savedFreelancerId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/applications/freelancer/${savedFreelancerId}`
      );
      setApplications(res.data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const analyzeFreelancerPdf = async (file, savedFreelancerId) => {
    try {
      setAiLoading(true);

      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("freelancer_id", savedFreelancerId);

      const res = await axios.post(
        "http://localhost:9000/analyze/freelancer-pdf",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        setDetectedSkills(res.data.detected_skills || []);
        setMatchedJobs(res.data.top_matches || []);
        setExtractedTextPreview(res.data.extracted_text_preview || "");
      } else {
        alert("AI analysis failed");
      }
    } catch (error) {
      console.error("AI analysis error:", error);
      alert("AI server error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await axios.post("http://localhost:8000/freelancer/profile", {
        user_id: user.id,
        expected_salary: expectedSalary,
        availability,
        location,
      });

      if (!res.data.success) {
        alert(res.data.message || "Error saving freelancer data");
        return;
      }

      const savedFreelancerId = res.data.freelancer_id;
      setFreelancerId(savedFreelancerId);
      fetchApplications(savedFreelancerId);

      if (pdfFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("pdf", pdfFile);
        uploadFormData.append("freelancer_id", savedFreelancerId);

        const uploadRes = await axios.post(
          "http://localhost:8000/freelancer/upload-pdf",
          uploadFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (!uploadRes.data.success) {
          alert("PDF uploaded path save failed");
          return;
        }

        await analyzeFreelancerPdf(pdfFile, savedFreelancerId);
      }

      alert("Freelancer data saved successfully");
    } catch (error) {
      console.error("Save freelancer error:", error);
      alert("Server error");
    }
  };

  const addSkill = async () => {
    if (!freelancerId) {
      alert("Save freelancer data first");
      return;
    }

    if (!skill.trim()) {
      alert("Enter a skill first");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/freelancer/skill", {
        freelancer_id: freelancerId,
        skill,
      });

      if (res.data.success) {
        alert("Skill added");
        setSkill("");
      } else {
        alert(res.data.message || "Error adding skill");
      }
    } catch (error) {
      console.error("Add skill error:", error);
      alert("Server error");
    }
  };

  const applyToJob = async (jobId) => {
    if (!freelancerId) {
      alert("Save freelancer data first");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/apply", {
        freelancer_id: freelancerId,
        job_id: jobId,
      });

      if (res.data.success) {
        alert("Applied successfully");
        fetchApplications(freelancerId);
      } else {
        alert(res.data.message || "Apply failed");
      }
    } catch (error) {
      console.error("Apply error:", error);
      alert("Server error");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="page-container">
      <div className="dashboard-box">
        <div className="section-header">
          <h1 className="dashboard-title">Freelancer Dashboard</h1>
          <div className="top-actions">
            <button className="secondary-btn" onClick={() => navigate("/profile")}>
              Profile
            </button>
            <button className="secondary-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <div className="hero-strip">
          <div className="hero-left">
            <p className="hero-label">BUILD YOUR PROFILE</p>
            <h2>Show your skills clearly</h2>
            <p className="muted-text">
              Add your salary, availability, location, upload your experience PDF,
              and explore the latest job opportunities.
            </p>
          </div>

          <div className="hero-right">
            <span className="hero-number">{matchedJobs.length || latestJobs.length}</span>
            <span className="hero-caption">Job results</span>
          </div>
        </div>

        <div className="form-card">
          <div className="form-grid">
            <div>
              <label className="field-label">Expected Salary</label>
              <input
                type="number"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
              />
            </div>

            <div>
              <label className="field-label">Availability</label>
              <input
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              />
            </div>

            <div className="form-grid-full">
              <label className="field-label">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-grid-full">
              <label className="field-label">Upload Experience PDF</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
              />
            </div>
          </div>

          <button className="primary-btn top-space" onClick={handleSaveProfile}>
            Save Freelancer Data
          </button>
        </div>

        <div className="section-card light-card">
          <h3>Your Skills</h3>
          <p className="muted-text">
            Add your important professional skills one by one.
          </p>

          <div className="skill-row">
            <input
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            />
            <button className="primary-btn" onClick={addSkill}>
              Add Skill
            </button>
          </div>
        </div>

        <div className="section-card light-card">
          <div className="section-header">
            <h3>AI Analysis</h3>
            {aiLoading && <span className="badge">Analyzing...</span>}
          </div>

          {!aiLoading && detectedSkills.length === 0 && !extractedTextPreview && (
            <p className="muted-text">
              Upload a PDF and save freelancer data to start automatic AI analysis.
            </p>
          )}

          {detectedSkills.length > 0 && (
            <>
              <h4>Detected Skills</h4>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                {detectedSkills.map((item, index) => (
                  <span key={index} className="badge">
                    {item.skill_name}
                  </span>
                ))}
              </div>
            </>
          )}

          {extractedTextPreview && (
            <div style={{ marginTop: "18px" }}>
              <h4>Extracted Text Preview</h4>
              <p className="muted-text" style={{ whiteSpace: "pre-wrap" }}>
                {extractedTextPreview}
              </p>
            </div>
          )}
        </div>

        <div className="section-card dark-card">
          <div className="section-header">
            <h3>Matched Jobs</h3>
            <span className="badge">{matchedJobs.length}</span>
          </div>

          {aiLoading ? (
            <p className="empty-text">Analyzing PDF and finding best matches...</p>
          ) : matchedJobs.length === 0 ? (
            <p className="empty-text">No AI matches yet.</p>
          ) : (
            <div className="cards-grid">
              {matchedJobs.map((job, index) => (
                <div className="info-card" key={`${job.job_id}-${index}`}>
                  <p className="mini-label">MATCHED JOB</p>
                  <h4>{job.title}</h4>
                  <p>
                    <strong>Score:</strong> {job.match_score}%
                  </p>
                  <p>
                    <strong>Location:</strong> {job.location || "N/A"}
                  </p>
                  <p>
                    <strong>Budget:</strong> {job.budget_min || 0} - {job.budget_max || 0}
                  </p>
                  <button
                    className="primary-btn"
                    style={{ marginTop: "10px" }}
                    onClick={() => applyToJob(job.job_id)}
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-card dark-card">
          <div className="section-header">
            <h3>Job Suggestions</h3>
            <span className="badge">{latestJobs.length}</span>
          </div>

          {latestJobs.length === 0 ? (
            <p className="empty-text">No jobs found yet.</p>
          ) : (
            <div className="cards-grid">
              {latestJobs.map((job) => (
                <div className="info-card" key={job.id}>
                  <p className="mini-label">LATEST JOB</p>
                  <h4>{job.title}</h4>
                  <p>{job.description || "No description available."}</p>
                  <p>
                    <strong>Budget:</strong> {job.budget_min || 0} - {job.budget_max || 0}
                  </p>
                  <p>
                    <strong>Location:</strong> {job.location || "N/A"}
                  </p>
                  <p>
                    <strong>Company:</strong> {job.company_name || "N/A"}
                  </p>
                  <button
                    className="primary-btn"
                    style={{ marginTop: "10px" }}
                    onClick={() => applyToJob(job.id)}
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-card dark-card">
          <div className="section-header">
            <h3>My Applications</h3>
            <span className="badge">{applications.length}</span>
          </div>

          {applications.length === 0 ? (
            <p className="empty-text">No applications yet.</p>
          ) : (
            <div className="cards-grid">
              {applications.map((app) => (
                <div className="info-card" key={app.id}>
                  <p className="mini-label">APPLICATION</p>
                  <h4>{app.title}</h4>
                  <p>
                    <strong>Status:</strong> {app.status}
                  </p>
                  <p>
                    <strong>Location:</strong> {app.location || "N/A"}
                  </p>
                  <p>
                    <strong>Budget:</strong> {app.budget_min || 0} - {app.budget_max || 0}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FreelancerPage;