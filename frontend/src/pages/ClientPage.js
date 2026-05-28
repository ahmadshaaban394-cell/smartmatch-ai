import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ClientPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [location, setLocation] = useState("");
  const [skill, setSkill] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [latestFreelancers, setLatestFreelancers] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);

  const [aiLoading, setAiLoading] = useState(false);
  const [detectedSkills, setDetectedSkills] = useState([]);
  const [matchedFreelancers, setMatchedFreelancers] = useState([]);
  const [extractedTextPreview, setExtractedTextPreview] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    fetchLatestFreelancers();
    fetchLatestClientJob();
    fetchClientApplications();
  }, [user, navigate]);

  const fetchLatestFreelancers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/freelancers/latest");
      setLatestFreelancers(res.data || []);
    } catch (error) {
      console.error("Error fetching latest freelancers:", error);
    }
  };

  const fetchLatestClientJob = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/client/latest-job/${user.id}`
      );

      if (res.data.success && res.data.job) {
        setJobId(res.data.job.id);
      }
    } catch (error) {
      console.error("Error fetching latest client job:", error);
    }
  };

  const fetchClientApplications = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/applications/client/${user.id}`
      );
      setJobApplications(res.data || []);
    } catch (error) {
      console.error("Error fetching client applications:", error);
    }
  };

  const analyzeJobPdf = async (file, savedJobId) => {
    try {
      setAiLoading(true);

      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("job_id", savedJobId);

      const res = await axios.post(
        "http://localhost:9000/analyze/job-pdf",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        setDetectedSkills(res.data.detected_skills || []);
        setMatchedFreelancers(res.data.top_matches || []);
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

  const handleCreateJob = async () => {
    if (!title.trim()) {
      alert("Please enter the job title");
      return;
    }

    if (!location.trim()) {
      alert("Please enter the location");
      return;
    }

    if (!description.trim()) {
      alert("Please enter the description");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/client/job", {
        user_id: user.id,
        title,
        description,
        budget_min: budgetMin,
        budget_max: budgetMax,
        location,
      });

      if (!res.data.success) {
        alert(res.data.message || "Error creating job");
        return;
      }

      const savedJobId = res.data.job_id;
      setJobId(savedJobId);
      fetchClientApplications();

      if (pdfFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("pdf", pdfFile);
        uploadFormData.append("job_id", savedJobId);

        const uploadRes = await axios.post(
          "http://localhost:8000/job/upload-pdf",
          uploadFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (!uploadRes.data.success) {
          alert("PDF uploaded path save failed");
          return;
        }

        await analyzeJobPdf(pdfFile, savedJobId);
      }

      alert("Job created successfully");
    } catch (error) {
      console.error("Create job error:", error);
      alert("Server error");
    }
  };

  const addSkill = async () => {
    if (!jobId) {
      alert("Create job first");
      return;
    }

    if (!skill.trim()) {
      alert("Enter a skill first");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/job/skill", {
        job_id: jobId,
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

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:8000/applications/${applicationId}/status`,
        {
          status: newStatus,
        }
      );

      if (res.data.success) {
        alert("Application status updated");
        fetchClientApplications();
      } else {
        alert(res.data.message || "Update failed");
      }
    } catch (error) {
      console.error("Update application error:", error);
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
          <h1 className="dashboard-title">Client Dashboard</h1>
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
            <p className="hero-label">POST A NEW JOB</p>
            <h2>Create a smart opportunity</h2>
            <p className="muted-text">
              Add job details, required skills, upload the requirements PDF,
              and let AI suggest the best freelancers automatically.
            </p>
          </div>

          <div className="hero-right">
            <span className="hero-number">
              {matchedFreelancers.length || latestFreelancers.length}
            </span>
            <span className="hero-caption">Freelancer results</span>
          </div>
        </div>

        <div className="form-card">
          <div className="form-grid">
            <div>
              <label className="field-label">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="field-label">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="field-label">Budget Min</label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
            </div>

            <div>
              <label className="field-label">Budget Max</label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </div>

            <div className="form-grid-full">
              <label className="field-label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-grid-full">
              <label className="field-label">Upload Requirements PDF</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
              />
            </div>
          </div>

          <button className="primary-btn top-space" onClick={handleCreateJob}>
            Create Job
          </button>
        </div>

        <div className="section-card light-card">
          <h3>Required Skills</h3>
          <p className="muted-text">
            Add the important skills needed for this job.
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
              Upload a PDF and create the job to start automatic AI analysis.
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
            <h3>Matched Freelancers</h3>
            <span className="badge">{matchedFreelancers.length}</span>
          </div>

          {aiLoading ? (
            <p className="empty-text">Analyzing PDF and finding best matches...</p>
          ) : matchedFreelancers.length === 0 ? (
            <p className="empty-text">No AI matches yet.</p>
          ) : (
            <div className="cards-grid">
              {matchedFreelancers.map((freelancer, index) => (
                <div className="info-card" key={`${freelancer.freelancer_id}-${index}`}>
                  <p className="mini-label">MATCHED FREELANCER</p>
                  <h4>#{freelancer.freelancer_id}</h4>
                  <p>
                    <strong>Score:</strong> {freelancer.match_score}%
                  </p>
                  <p>
                    <strong>Location:</strong> {freelancer.location || "N/A"}
                  </p>
                  <p>
                    <strong>Expected Salary:</strong> {freelancer.expected_salary || "N/A"}
                  </p>
                  <p>
                    <strong>Availability:</strong> {freelancer.availability || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {freelancer.phone_number || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-card dark-card">
          <div className="section-header">
            <h3>Freelancer Suggestions</h3>
            <span className="badge">{latestFreelancers.length}</span>
          </div>

          {latestFreelancers.length === 0 ? (
            <p className="empty-text">No freelancers found yet.</p>
          ) : (
            <div className="cards-grid">
              {latestFreelancers.map((freelancer) => (
                <div className="info-card" key={freelancer.id}>
                  <p className="mini-label">LATEST FREELANCER</p>
                  <h4>#{freelancer.id}</h4>
                  <p>
                    <strong>Salary:</strong> {freelancer.expected_salary || "N/A"}
                  </p>
                  <p>
                    <strong>Location:</strong> {freelancer.location || "N/A"}
                  </p>
                  <p>
                    <strong>Availability:</strong> {freelancer.availability || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {freelancer.phone_number || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-card dark-card">
          <div className="section-header">
            <h3>Job Applications</h3>
            <span className="badge">{jobApplications.length}</span>
          </div>

          {jobApplications.length === 0 ? (
            <p className="empty-text">No applications yet.</p>
          ) : (
            <div className="cards-grid">
              {jobApplications.map((app) => (
                <div className="info-card" key={app.id}>
                  <p className="mini-label">APPLICATION</p>
                  <h4>Freelancer #{app.freelancer_id}</h4>
                  <p>
                    <strong>Job:</strong> {app.title || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong> {app.status}
                  </p>
                  <p>
                    <strong>Freelancer Location:</strong> {app.freelancer_location || "N/A"}
                  </p>
                  <p>
                    <strong>Expected Salary:</strong> {app.expected_salary || "N/A"}
                  </p>
                  <p>
                    <strong>Availability:</strong> {app.availability || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {app.phone_number || "N/A"}
                  </p>

                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button
                      className="primary-btn"
                      onClick={() => updateApplicationStatus(app.id, "accepted")}
                    >
                      Accept
                    </button>

                    <button
                      className="secondary-btn"
                      onClick={() => updateApplicationStatus(app.id, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientPage;