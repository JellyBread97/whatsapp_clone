import React from "react";
// import Login from "./components/login/Login";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import NavBar from "./components/navigation/NavBar";

import LoginPage from "./components/pages/LoginPage";
import HomePage from "./components/pages/HomePage";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <Router>
      {/* <NavBar /> */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      <ToastContainer position="top-center" />
    </Router>
  );
}

export default App;
