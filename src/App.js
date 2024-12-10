import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase/firebase";

import "./App.css"; // Import the CSS file

import Loading from "./components/Loading";
import AdminDashboard from "./pages/AdminDashboard";
import SalespersonDashboard from "./pages/SalesPersonDashboard";
import Login from "./components/Login";
import SignUp from "./components/Signup";
import Referral from "./pages/Referral";
import MLM from "./pages/MlmScreen";
import Products from "./pages/Products";
import CommissionHistory from "./pages/ComissionHistory";
import QuotationManagement from "./pages/QuotationManagement";

const Navbar = ({ userRole, handleLogout }) => {
  
  const location = useLocation(); // This will now have access to the Router context

  return (
    <nav className="navbar">
      <ul className="nav-list">
        {userRole === "Admin" && (
          <>
            <li className="nav-item">
              <Link
                to="/"
                className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
              >
                Admin Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/quotations"
                className={`nav-link ${location.pathname === "/quotations" ? "active" : ""}`}
              >
                Quotation Management
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/mlm"
                className={`nav-link ${location.pathname === "/mlm" ? "active" : ""}`}
              >
                MLM
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/products"
                className={`nav-link ${location.pathname === "/products" ? "active" : ""}`}
              >
                Products
              </Link>


            </li>
          </>
        )}
        {userRole === "salesperson" && (
          <>
            <li className="nav-item">
              <Link
                to="/"
                className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
              >
                Salesperson Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/referral"
                className={`nav-link ${location.pathname === "/referral" ? "active" : ""}`}
              >
                Referral
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/commission-history"
                className={`nav-link ${location.pathname === "/commission-history" ? "active" : ""}`}
              >
                Commission History
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/products"
                className={`nav-link ${location.pathname === "/products" ? "active" : ""}`}
              >
                Products
              </Link>
            </li>

          </>
        )}
        {!userRole && (
          <>
            <li className="nav-item">
              <Link
                to="/login"
                className={`nav-link ${location.pathname === "/login" ? "active" : ""}`}
              >
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/signup"
                className={`nav-link ${location.pathname === "/signup" ? "active" : ""}`}
              >
                Sign Up
              </Link>
            </li>
          </>
        )}
      </ul>
      <button className="logout-button1" onClick={handleLogout}>
    Log Out
  </button>
    </nav>
  );
};

const App = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await auth.signOut();
    window.location.reload(); // Or use navigation to redirect to the login page
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        } else {
          console.error("No user document found!");
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <Loading />;

  return (
    <Router>
      {/* Navbar */}
      <Navbar userRole={userRole} handleLogout={handleLogout} />

      {/* Routes */}
      <Routes>
        {userRole === "Admin" ? (
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/quotations" element={<QuotationManagement />} />
            <Route path="/mlm" element={<MLM />} />
            <Route path="/products" element={<Products />} />
          </>
        ) : userRole === "salesperson" ? (
          <>
            <Route path="/" element={<SalespersonDashboard />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/commission-history" element={<CommissionHistory />} />
            <Route path="/products" element={<Products />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
