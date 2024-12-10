import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/firebase"; // Firebase config
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [quotations, setQuotations] = useState([]);
  const [mlmLevels, setMlmLevels] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [isMlmConfigured, setIsMlmConfigured] = useState(false);

  const navigate = useNavigate(); // Use the useNavigate hook to navigate

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login"); // Navigate to login page after sign out
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Quotation_form_submission"), (querySnapshot) => {
      const fetchedQuotations = [];
      querySnapshot.forEach((doc) => {
        fetchedQuotations.push({ id: doc.id, ...doc.data() });
      });
      setQuotations(fetchedQuotations);

      fetchedQuotations.forEach((quotation) => {
        if (!quotation.status) {
          updateQuotationStatus(quotation.id, "Pending");
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const updateQuotationStatus = async (id, status) => {
    const updatedQuotations = quotations.map((quotation) =>
      quotation.id === id ? { ...quotation, status } : quotation
    );
    setQuotations(updatedQuotations);

    const quotationRef = doc(db, "Quotation_form_submission", id);
    try {
      await updateDoc(quotationRef, { status });
    } catch (error) {
      console.error("Error updating quotation status:", error);
    }
  };

  const handleApprove = (id) => updateQuotationStatus(id, "Accepted");
  const handleReject = (id) => updateQuotationStatus(id, "Rejected");

  const configureMlmMatrix = () => {
    setIsMlmConfigured(true);
    console.log(`MLM Levels: ${mlmLevels}, Commission Rate: ${commissionRate}`);
  };

  const generateReports = () => console.log("Generating Reports...");

  const getQuotationCounts = () => {
    let approved = 0, rejected = 0, pending = 0;
    quotations.forEach(({ status }) => {
      if (status === "Accepted") approved++;
      else if (status === "Rejected") rejected++;
      else pending++;
    });
    return { approved, rejected, pending };
  };

  const { approved, rejected, pending } = getQuotationCounts();

  const calculateTotalEstimatedPrice = () =>
    quotations.reduce((total, { estimatedPrice }) => total + parseFloat(estimatedPrice || 0), 0);

  const totalEstimatedPrice = calculateTotalEstimatedPrice().toFixed(2);

  return (
    <div className="dashboard-container">
      <h1 className="header">Admin Dashboard</h1>

      <div className="card">
        <h2 className="sub-header">Quotation Management</h2>
        <p>Total Quotations: {quotations.length}</p>
        <p className="approved">Approved: {approved}</p>
        <p className="rejected">Rejected: {rejected}</p>
        <p className="pending">Pending: {pending}</p>
        <p>Total Estimated Price: ₹{totalEstimatedPrice}</p>
        <button className="button" onClick={() => navigate("/quotations")}>
          Manage Quotations
        </button>
      </div>

      <div className="card">
        <h2 className="sub-header">MLM Matrix Setup</h2>
        <input
          type="number"
          className="input"
          placeholder="Enter Levels (e.g., 3)"
          value={mlmLevels}
          onChange={(e) => setMlmLevels(e.target.value)}
        />
        <input
          type="number"
          className="input"
          placeholder="Enter Commission Rate (%)"
          value={commissionRate}
          onChange={(e) => setCommissionRate(e.target.value)}
        />
        <button className="button" onClick={configureMlmMatrix}>
          Configure MLM
        </button>
        {isMlmConfigured && <p className="success">MLM Matrix Configured Successfully!</p>}
      </div>

      <div className="card">
        <h2 className="sub-header">Reporting</h2>
        <button className="button" onClick={generateReports}>
          Generate Reports
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
