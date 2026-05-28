import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import FreelancerPage from "./pages/FreelancerPage";
import ClientPage from "./pages/ClientPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/freelancer" element={<FreelancerPage />} />
        <Route path="/client" element={<ClientPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;