import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase/firebase";

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

const App = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <nav style={{ backgroundColor: '#333', padding: '1rem',alignItems:'center' }}>
        <ul style={{ listStyleType: 'none', display: 'flex', gap: '20px' }}>
          {userRole === 'Admin' && (
            <>
              <li><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Admin Dashboard</Link></li>
              <li><Link to="/quotations" style={{ color: 'white', textDecoration: 'none' }}>Quotation Management</Link></li>
              <li><Link to="/mlm" style={{ color: 'white', textDecoration: 'none' }}>MLM</Link></li>
              <li><Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>Products</Link></li>
            </>
          )}
          {userRole === 'salesperson' && (
            <>
              <li><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Salesperson Dashboard</Link></li>
              <li><Link to="/referral" style={{ color: 'white', textDecoration: 'none' }}>Referral</Link></li>
              <li><Link to="/commission-history" style={{ color: 'white', textDecoration: 'none' }}>Commission History</Link></li>
              <li><Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>Products</Link></li>
            </>
          )}
          {!userRole && (
            <>
              <li><Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link></li>
              <li><Link to="/signup" style={{ color: 'white', textDecoration: 'none' }}>Sign Up</Link></li>
            </>
          )}
        </ul>
      </nav>

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
