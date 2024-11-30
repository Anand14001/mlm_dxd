import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import "./QuotationManagement.css";

const QuotationManagement = () => {
  const [quotations, setQuotations] = useState([]);
  const [commissionPercentages, setCommissionPercentages] = useState({});
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [estimatedPrices, setEstimatedPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuotations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Quotation_form_submission"));
      const fetchedQuotations = [];
      querySnapshot.forEach((doc) => {
        fetchedQuotations.push({ id: doc.id, ...doc.data() });
      });
      setQuotations(fetchedQuotations);
    } catch (error) {
      console.error("Error fetching quotations:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchQuotations().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQuotations();
    setRefreshing(false);
  };

  const handleCommissionChange = (id, percentage) => {
    setCommissionPercentages({ ...commissionPercentages, [id]: percentage });
  };

  const handleEstimatedPriceChange = (id, price) => {
    setEstimatedPrices({ ...estimatedPrices, [id]: price });
  };

  const calculateCommission = (price, percentage) => {
    return (price * (percentage / 100)).toFixed(2);
  };

  const updateQuotationStatus = async (id, status) => {
    setLoading(true);
    const quotationRef = doc(db, "Quotation_form_submission", id);
    const quotation = quotations.find((q) => q.id === id);

    if (!quotation) {
      console.error("Quotation not found!");
      setLoading(false);
      return;
    }

    const estimatedPrice = estimatedPrices[id] || quotation.estimatedPrice || 0;
    const commissionPercentage = commissionPercentages[id] || 0;

    if (!estimatedPrice || !commissionPercentage) {
      alert("Estimated Price and Commission Percentage must be entered to approve the quotation.");
      setLoading(false);
      return;
    }

    const commissionValue = calculateCommission(estimatedPrice, commissionPercentage);

    try {
      await updateDoc(quotationRef, {
        status: status,
        commissionPercentage: commissionPercentage,
        commissionValue: commissionValue,
        estimatedPrice: estimatedPrice,
      });

      setQuotations((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status } : q))
      );
    } catch (error) {
      console.error("Error updating quotation status:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (id, status) => {
    setLoading(true);
    const quotationRef = doc(db, "Quotation_form_submission", id);
    try {
      await updateDoc(quotationRef, { paymentStatus: status });
      setPaymentStatuses({ ...paymentStatuses, [id]: status });
    } catch (error) {
      console.error("Error updating payment status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="header">Quotation Management</h2>
      {loading && <div className="loader">Loading...</div>}
      <div className="quotations">
        {quotations.map((item) => {
          const commissionPercentage = commissionPercentages[item.id] || '';
          const commissionValue = calculateCommission(estimatedPrices[item.id] || item.estimatedPrice, commissionPercentage);

          return (
            <div key={item.id} className="card">
              <h3>Client Details</h3>
              <p><strong>Name:</strong> {item.clientName}</p>
              <p><strong>Email:</strong> {item.clientEmail}</p>
              <p><strong>Phone:</strong> {item.clientPhone}</p>

              <h3>Measurement Details</h3>
              <p><strong>Product:</strong> {item.product.name}</p>
              <p><strong>Height:</strong> {item.height}ft <strong>Width:</strong> {item.width}ft</p>

              <h3>Payment Details</h3>
              <input
                type="number"
                placeholder="Enter Estimated Price"
                onChange={(e) => handleEstimatedPriceChange(item.id, parseFloat(e.target.value))}
              />
              <input
                type="number"
                placeholder="Commission (%)"
                value={commissionPercentage}
                onChange={(e) => handleCommissionChange(item.id, parseFloat(e.target.value))}
              />
              <p><strong>Commission Value:</strong> ₹{commissionValue}</p>

              <h3>Payment Status</h3>
              <select
                value={paymentStatuses[item.id] || 'Pending'}
                onChange={(e) => updatePaymentStatus(item.id, e.target.value)}
              >
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Canceled">Canceled</option>
              </select>

              <p className={`status ${item.status === 'Accepted' ? 'status-accepted' : item.status === 'Rejected' ? 'status-rejected' : 'status-pending'}`}>
                Quotation Status: {item.status}
              </p>

              <div className="button-container">
                {item.status === 'Pending' && (
                  <>
                    <button onClick={() => updateQuotationStatus(item.id, 'Accepted')}>Approve</button>
                    <button  onClick={() => updateQuotationStatus(item.id, 'Rejected')}>Reject</button>
                  </>
                )}
                {item.status === 'Accepted' && <button onClick={() => alert("Follow-up action for the quotation")}>Follow Up</button>}
                {item.status === 'Rejected' && <button onClick={() => alert("Delete quotation action")}>Delete Quotation</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuotationManagement;
