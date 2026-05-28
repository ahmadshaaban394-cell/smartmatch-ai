import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [companyName, setCompanyName] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const res = await axios.post("http://localhost:8000/signup", {
      email,
      password,
      role,
      company_name: companyName
    });

    if (res.data.success) {
      alert("Account created!");
      navigate("/");
    } else {
      alert(res.data.message || "Error");
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSignup}>
        <h2>Signup</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <select onChange={(e) => setRole(e.target.value)}>
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>

        {role === "client" && (
          <input
            placeholder="Company Name"
            onChange={(e) => setCompanyName(e.target.value)}
          />
        )}

        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default SignupPage;