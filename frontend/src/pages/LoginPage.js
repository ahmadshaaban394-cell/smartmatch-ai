import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/login", {
        email,
        password,
        role,
      });

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));

        if (role === "freelancer") {
          navigate("/freelancer");
        } else {
          navigate("/client");
        }
      } else {
        alert(res.data.message || "Wrong login");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <h1>SmartMatch AI</h1>
        <p>Find the best match for jobs and freelancers</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>

        <button type="submit">Login</button>

        <p className="signup-link" onClick={() => navigate("/signup")}>
          Create new account
        </p>
      </form>
    </div>
  );
}

export default LoginPage;