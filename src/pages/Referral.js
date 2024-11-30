import React, { useEffect, useState } from 'react';
import { db, auth } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import Lottie from 'react-lottie';
import animationData from "./refer.json"; // Make sure the correct path is set

import './ReferralPage.css';

const ReferralPage = () => {
  const [referralId, setReferralId] = useState('');

  useEffect(() => {
    fetchReferralId();
  }, []);

  const fetchReferralId = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const userDoc = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setReferralId(userData.referralId || 'N/A');
      } else {
        console.error('No such document!');
        alert('No such document!')
      }
    } catch (error) {
      console.error('Error fetching referral ID:', error);
      alert(error)
    }
  };

  // Function to copy referral ID to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralId)
      .then(() => alert('Referral ID copied to clipboard!'))
      .catch(err => console.error('Error copying referral ID:', err));
  };

  // Function to share referral ID
  const shareReferralId = async () => {
    try {
      await navigator.share({
        title: 'Join us using my referral code',
        text: `Join us using my referral code: ${referralId}!`,
      });
    } catch (error) {
      console.error('Error sharing referral ID:', error);
    }
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div className="container">
      {/* Lottie Animation */}
      <Lottie options={defaultOptions} height={220} width={220} />

      <h2 className="title">Your Unique Referral Code</h2>

      <div className="referral-container">
        <p className="referral-text">{referralId || 'Loading...'}</p>
      </div>

      <div className="actions-container">
        <button className="action-button" onClick={copyToClipboard}>
          Copy Code
        </button>
        <button className="action-button share-button" onClick={shareReferralId}>
          Share Code
        </button>
      </div>
    </div>
  );
};

export default ReferralPage;
