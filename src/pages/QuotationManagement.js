import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import "./QuotationManagement.css";

const QuotationManagement = () => {
  const [quotations, setQuotations] = useState([]);
  const [commissionPercentages, setCommissionPercentages] = useState({});
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [estimatedPrices, setEstimatedPrices] = useState({});
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "Quotation_form_submission"));
        const fetchedQuotations = [];
        querySnapshot.forEach((doc) => {
          fetchedQuotations.push({ id: doc.id, ...doc.data() });
        });
        setQuotations(fetchedQuotations);
        setFilteredQuotations(fetchedQuotations);
      } catch (error) {
        console.error("Error fetching quotations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterQuotations(query, filterStatus);
  };

  const handleFilterStatus = (status) => {
    setFilterStatus(status);
    filterQuotations(searchQuery, status);
  };

  const filterQuotations = (query, status) => {
    let filtered = quotations;
    if (query) {
      filtered = filtered.filter((q) =>
        q.clientName.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (status) {
      filtered = filtered.filter((q) => q.status === status);
    }
    setFilteredQuotations(filtered);
    setCurrentPage(1); // Reset to the first page
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= Math.ceil(filteredQuotations.length / itemsPerPage)) {
      setCurrentPage(page);
    }
  };

  const handleCommissionChange = (id, percentage) => {
    setCommissionPercentages({ ...commissionPercentages, [id]: percentage });
  };

  const handleEstimatedPriceChange = (id, price) => {
    setEstimatedPrices({ ...estimatedPrices, [id]: price });
  };

  const calculateCommissionValue = (estimatedPrice, commissionPercentage) => {
    return (estimatedPrice * (commissionPercentage / 100)).toFixed(2);
  };

  const updateQuotationStatus = async (id, status) => {
    const quotationRef = doc(db, "Quotation_form_submission", id);
    const quotation = quotations.find((q) => q.id === id);

    if (!quotation) return;

    const estimatedPrice = estimatedPrices[id] || quotation.estimatedPrice || 0;
    const commissionPercentage = commissionPercentages[id] || 0;
    const commissionValue = calculateCommissionValue(estimatedPrice, commissionPercentage);

    try {
      await updateDoc(quotationRef, {
        status,
        commissionPercentage,
        commissionValue,
        estimatedPrice,
      });

      const updatedQuotations = quotations.map((q) =>
        q.id === id ? { ...q, status } : q
      );
      setQuotations(updatedQuotations);
    } catch (error) {
      console.error("Error updating quotation status:", error);
    }
  };

  const handleFollowUp = (id) => {
    alert(`Follow-up action for quotation ID: ${id}`);
    // Add your follow-up logic here
  };

  const handleDeleteQuotation = async (id) => {
    try {
      await updateDoc(doc(db, "Quotation_form_submission", id), {
        status: "Deleted",
      });
      setQuotations((prev) => prev.filter((quotation) => quotation.id !== id));
      alert("Quotation deleted successfully.");
    } catch (error) {
      console.error("Error deleting quotation:", error);
      alert("Failed to delete the quotation. Please try again.");
    }
  };

  const currentItems = filteredQuotations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isApproveButtonDisabled = (id) => {
    const estimatedPrice = estimatedPrices[id] || 0;
    const commissionPercentage = commissionPercentages[id] || 0;
    return !(estimatedPrice > 0 && commissionPercentage > 0);
  };

  return (
    <div className="container">
      <h2 className="header">Quotation Management</h2>

      {/* Filters */}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Search by Client Name"
          className="filter-input"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => handleFilterStatus(e.target.value)}
          className="filter-dropdown"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <table className="quotation-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Product</th>
              <th>Status</th>
              <th>Estimated Price</th> {/* New column */}
              <th>Commission (%)</th> {/* New column */}
              <th>Commission Value</th> {/* New column */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => {
              const commissionValue = calculateCommissionValue(
                estimatedPrices[item.id] || item.estimatedPrice,
                commissionPercentages[item.id] || item.commissionPercentage || 0
              );

              return (
                <tr key={item.id}>
                  <td>{item.clientName}</td>
                  <td>{item.product.name}</td>
                  <td>{item.status}</td>
                  <td>{estimatedPrices[item.id] || item.estimatedPrice || "N/A"}</td> {/* Display Estimated Price */}
                  <td>{commissionPercentages[item.id] || item.commissionPercentage || "N/A"}</td> {/* Display Commission Percentage */}
                  <td>{commissionValue}</td> {/* Display Commission Value */}
                  <td>
                    {item.status === "Pending" && (
                      <>

                        <label className="input-label">
                          Estimated Price <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="Enter Estimated Price"
                          onChange={(e) =>
                            handleEstimatedPriceChange(item.id, parseFloat(e.target.value))
                          }
                          className="inp"
                        />
                        <label className="input-label">
                          Commission (%) <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="Enter Commission (%)"
                          onChange={(e) =>
                            handleCommissionChange(item.id, parseFloat(e.target.value))
                          }
                          className="inp"
                        />
                        <button
                          className="Approve-button"
                          onClick={() => updateQuotationStatus(item.id, "Accepted")}
                          disabled={isApproveButtonDisabled(item.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="Reject-button"
                          onClick={() => updateQuotationStatus(item.id, "Rejected")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {item.status === "Accepted" && (
                      <button className="Follow-up-button" onClick={() => handleFollowUp(item.id)}>
                        Follow Up
                      </button>
                    )}
                    {item.status === "Rejected" && (
                      <button className="Delete-button" onClick={() => handleDeleteQuotation(item.id)}>
                        Delete Quotation
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="pagination-container">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === Math.ceil(quotations.length / itemsPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default QuotationManagement;
