import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/profile/${user.id}`);

      if (res.data.success && res.data.profile) {
        setFullName(res.data.profile.full_name || "");
        setBio(res.data.profile.bio || "");
        setLocation(res.data.profile.location || "");
        setPhoneNumber(res.data.profile.phone_number || "");
        setCurrentImage(res.data.profile.profile_picture || "");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load profile");
    }
  };

  const saveProfile = async () => {
    try {
      const res = await axios.post("http://localhost:8000/profile", {
        user_id: user.id,
        full_name: fullName,
        bio,
        location,
        phone_number: phoneNumber,
      });

      if (!res.data.success) {
        alert(res.data.message || "Failed to save profile");
        return;
      }

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("user_id", user.id);

        const uploadRes = await axios.post(
          "http://localhost:8000/profile/upload-picture",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (uploadRes.data.success) {
          setCurrentImage(uploadRes.data.profile_picture);
        }
      }

      alert("Profile saved successfully");
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  const goBackToDashboard = () => {
    if (!user) {
      navigate("/");
      return;
    }

    navigate(user.role === "client" ? "/client" : "/freelancer");
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="page-container">
      <div className="dashboard-box">
        <div className="section-header">
          <h1 className="dashboard-title">Profile</h1>

          <div className="top-actions">
            <button className="back-btn" onClick={goBackToDashboard}>
              Back to Dashboard
            </button>

            <button className="secondary-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <div className="hero-strip">
          <div className="hero-left">
            <p className="hero-label">USER PROFILE</p>
            <h2>Manage your personal information</h2>
            <p className="muted-text">
              Update your full name, bio, location, phone number, and profile picture.
            </p>
          </div>

          <div className="hero-right">
            <span className="hero-number">
              {user?.role === "freelancer" ? "F" : "C"}
            </span>
            <span className="hero-caption">
              {user?.role === "freelancer" ? "Freelancer" : "Client"}
            </span>
          </div>
        </div>

        <div className="form-card">
          <div className="form-grid">
            <div className="form-grid-full">
              <label className="field-label">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
              <label className="field-label">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="form-grid-full">
              <label className="field-label">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="form-grid-full">
              <label className="field-label">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>
          </div>

          <button className="primary-btn top-space" onClick={saveProfile}>
            Save Profile
          </button>
        </div>

        {currentImage && (
          <div className="section-card light-card">
            <h3>Current Profile Picture</h3>
            <img
              src={`http://localhost:8000${currentImage}`}
              alt="Profile"
              style={{
                width: "180px",
                height: "180px",
                objectFit: "cover",
                borderRadius: "20px",
                marginTop: "10px",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;