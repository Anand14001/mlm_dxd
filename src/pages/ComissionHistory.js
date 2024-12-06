import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import "./CommissionHistory.css";

export default function CommissionHistory() {
  const [commissions, setCommissions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommissions = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.warn("User is not authenticated.");
        return;
      }

      const q = query(collection(db, 'Quotation_form_submission'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("No commission history found.");
        setCommissions([]);
        return;
      }

      const fetchedCommissions = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedCommissions.push({
          id: doc.id,
          ...data,
          date: new Date(data.timestamp),
          paymentStatus: data.paymentStatus || 'Unknown',
        });
      });

      setCommissions(fetchedCommissions);
    } catch (error) {
      console.error("Error fetching commission history:", error);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommissions();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const handleSort = (key) => {
    setSortBy(key);
    setCommissions((prevCommissions) =>
      [...prevCommissions].sort((a, b) => {
        if (key === 'date') return new Date(b.date) - new Date(a.date);
        if (key === 'commissionValue') return parseFloat(b.commissionValue) - parseFloat(a.commissionValue);
        if (key === 'paymentStatus') return a.paymentStatus.localeCompare(b.paymentStatus);
        return 0;
      })
    );
  };

  const filteredCommissions = commissions.filter((item) =>
    [item.product?.name, item.clientName, item.clientEmail].some((field) =>
      field?.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <div className="commission-history-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search by product, client, or email"
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <div className="sort-container">
        <button className="sort-button" onClick={() => handleSort('date')}>Sort by Date</button>
        <button className="sort-button" onClick={() => handleSort('commissionValue')}>Sort by Commission</button>
        <button className="sort-button" onClick={() => handleSort('paymentStatus')}>Sort by Payment</button>
      </div>

      <div className="table-header">
        <span className="header-text">S.No</span>
        <span className="header-text">Product</span>
        <span className="header-text">Client</span>
        <span className="header-text">Email</span>
        <span className="header-text">Date</span>
        <span className="header-text">Commission</span>
        <span className="header-text">Payment Status</span>
      </div>

      <div className="commission-list">
        {filteredCommissions.length > 0 ? filteredCommissions.map((item, index) => (
          <div key={item.id} className="table-row">
            <span className="cell">{index + 1}</span>
            <span className="cell">{item.product?.name}</span>
            <span className="cell">{item.clientName}</span>
            <span className="cell">{item.clientEmail}</span>
            <span className="cell">{item.date.toLocaleDateString()}</span>
            <span className="cell">₹{item.commissionValue || 0}.00</span>
            <span className="cell">{item.paymentStatus || 'Pending'}</span>
          </div>
        )) : (
          <div>No Commission History Found!</div>
        )}
      </div>

      
    </div>
  );
}
