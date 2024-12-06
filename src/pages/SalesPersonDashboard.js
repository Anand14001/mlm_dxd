import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import "./SalespersonDashboard.css";

export default function SalespersonDashboard() {
  const [quotations, setQuotations] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, accepted: 0, commissions: 0 });
  const [downline, setDownline] = useState([]);
  const [currentUserName, setCurrentUserName] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await auth.signOut();
    window.location.reload();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchQuotations(),
      calculateMetrics(),
      fetchDownline(),
      fetchCurrentUserName(),
    ]);
    setLoading(false);
  };

  const fetchCurrentUserName = async () => {
    try {
      const userId = auth.currentUser?.uid;
      const userSnapshot = await getDoc(doc(db, "users", userId));

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setCurrentUserName(userData.name || "Your Name");
      } else {
        console.error("User document does not exist");
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  };

  const fetchQuotations = async () => {
    try {
      const userId = auth.currentUser?.uid;
      const q = query(
        collection(db, "Quotation_form_submission"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const fetchedQuotations = [];
      querySnapshot.forEach((doc) => fetchedQuotations.push({ id: doc.id, ...doc.data() }));
      setQuotations(fetchedQuotations);
    } catch (error) {
      console.error("Error fetching quotations:", error);
    }
  };

  const calculateMetrics = async () => {
    try {
      const userId = auth.currentUser?.uid;
      const q = query(collection(db, "Quotation_form_submission"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      let total = 0,
        accepted = 0,
        commissions = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        total++;
        if (data.status === "Accepted") {
          accepted++;
          commissions += parseFloat(data.commissionValue) || 0;
        }
      });

      setMetrics({ total, accepted, commissions });
    } catch (error) {
      console.error("Error calculating metrics:", error);
    }
  };

  const fetchDownline = async () => {
    try {
      const userId = auth.currentUser?.uid;
      const userSnapshot = await getDoc(doc(db, "users", userId));

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const downlines = Object.keys(userData)
          .filter((key) => key.startsWith("downline"))
          .map((key) => userData[key]);

        setDownline(downlines);
      } else {
        console.error("User document does not exist");
      }
    } catch (error) {
      console.error("Error fetching downline:", error);
    }
  };

  const renderLoader = () => <div className="loader">Loading...</div>;

  return (
    <div className="dashboard-container">
      <h1 className="header">Welcome, {currentUserName}</h1>

      <div className="card">
        <h2 className="card-title">My Quotations</h2>
        {loading ? (
          renderLoader()
        ) : quotations.length > 0 ? (
          quotations.map((quotation) => (
            <div key={quotation.id} className="quotation-item">
              <p>
                <strong>Product:</strong> {quotation.product.name}
              </p>
              <p>
                <strong>Client Name:</strong> {quotation.clientName}
              </p>
              <p>
                <strong>Status:</strong> {quotation.status || "Pending"}
              </p>
              <p>
                <strong>Commission:</strong> ₹{quotation.commissionValue || 0}.00
              </p>
              <p>
                <strong>Payment Status:</strong> {quotation.paymentStatus || "Pending"}
              </p>
            </div>
          ))
        ) : (
          <p className="no-data">No quotations found</p>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">Sales Metrics</h2>
        <p>Total Quotations Submitted: {metrics.total}</p>
        <p>Accepted Quotations: {metrics.accepted}</p>
        <p>Commissions Earned: ₹{metrics.commissions.toFixed(2)}</p>
      </div>

      <div className="card">
        <h2 className="card-title">My Downlines</h2>
        {downline.length > 0 ? (
          downline.map((member, index) => (
            <div key={index} className="downline-item">
              <p>
                <strong>{member.name}</strong>
              </p>
              <p>{member.email}</p>
            </div>
          ))
        ) : (
          <p className="no-data">No downline members found</p>
        )}
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
