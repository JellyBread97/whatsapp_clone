import React from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/login/Login";

import HomePage from "./components/pages/HomePage";
import { ToastContainer } from "react-toastify";
import Home from "./components/pages/Home.jsx";

function App() {
  return (
    <Router>
      {/* <NavBar /> */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
      <ToastContainer position="top-center" />
    </Router>
  );
}

export default App;
