import React, { useState } from "react";
import { auth, db } from "../firebase/firebase"; // Firebase Auth and Firestore instance
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("salesperson"); // Default role is salesperson
  const [refreshing, setRefreshing] = useState(false); // State to track refresh
  const navigate = useNavigate(); // Use the useNavigate hook

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      console.log("Logged in user:", user);
  
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const userRole = userData.role ? userData.role.toLowerCase() : null; // Make sure the role exists and is lowercase
  
        console.log("User role from Firestore:", userRole);
        console.log("Selected role from state:", role.toLowerCase());
  
        // Check if the role from Firestore matches the selected role
        if (userRole === role.toLowerCase()) {
          alert("Login successful!");
  
          // Navigate based on the user role
          if (userRole === "admin") {
            navigate("/"); // Navigate to Admin Dashboard
          } else if (userRole === "salesperson") {
            navigate("/"); // Navigate to Salesperson Dashboard
          }
        } else {
          alert("Role Mismatch: Your role does not match the selected login type.");
        }
      } else {
        alert("Error: User data not found.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert(`Login Error: ${error.message}`);
    }
  };
  
  

  // Refresh function to reset fields
  const refreshScreen = () => {
    setRefreshing(true);
    setTimeout(() => {
      setEmail("");
      setPassword("");
      setRole("salesperson");
      setRefreshing(false);
    }, 1000); // Simulate a 1-second delay for the refresh
  };

  return (
    <div className="login-container">
      <h1 className="title">
        {role === "admin" ? "Admin Login" : "Salesperson Login"}
      </h1>

      {/* Dropdown for selecting role */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="picker"
      >
        <option value="admin">Admin</option>
        <option value="salesperson">Salesperson</option>
      </select>

      {/* Email Input */}
      <input
        type="email"
        className="input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* Password Input */}
      <input
        type="password"
        className="input"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Login Button */}
      <button className="button" onClick={handleLogin}>
        Login
      </button>

      <p className="link" onClick={() => navigate("/signup")}>
        Don't have an account? <span>Sign up</span>
      </p>
    </div>
  );
};

export default Login;
