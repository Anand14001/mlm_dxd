import React, { useState, useEffect } from "react";
import { auth } from "../firebase/firebase"; // Firebase Auth instance
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom"; 
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import "./Signup.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasSponsor, setHasSponsor] = useState(false); // Track sponsor selection
  const [sponsorEmail, setSponsorEmail] = useState(""); // Store sponsor email
  const [sponsorData, setSponsorData] = useState(null); // Store sponsor data
  const navigate = useNavigate();
  
  const role = "salesperson";
  const db = getFirestore();

  const generateReferralId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let referralId = "";
    for (let i = 0; i < 8; i++) {
      referralId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return referralId;
  };

  const handleSignUp = async () => {
    try {
      if (hasSponsor) {
        if (!sponsorData) {
          alert("Error: No sponsor found with this email.");
          return;
        }

        const sponsorRef = doc(db, "users", sponsorData.uid);
        const sponsorDoc = await getDoc(sponsorRef);

        if (sponsorDoc.exists()) {
          const sponsorDocData = sponsorDoc.data();
          const downlineKeys = ["downline1", "downline2", "downline3"];
          const hasAvailableSlot = downlineKeys.some((key) => !sponsorDocData[key]);

          if (!hasAvailableSlot) {
            alert("Error: Sponsor has no available downline slots.");
            return;
          }
        } else {
          alert("Error: Sponsor data is missing.");
          return;
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const referralId = generateReferralId();
      await setDoc(doc(db, "users", user.uid), {
        name,
        email: user.email,
        role,
        uid: user.uid,
        referralId,
        parentId: hasSponsor ? sponsorData.uid : null,
        sponsorReferralId: hasSponsor ? sponsorData.referralId : null,
        sponsorName: hasSponsor ? sponsorData.name : null,
        sponsorEmail: hasSponsor ? sponsorEmail : null,
        sponsorUid: hasSponsor ? sponsorData.uid : null,
      });

      if (hasSponsor) {
        const sponsorRef = doc(db, "users", sponsorData.uid);
        const sponsorDoc = await getDoc(sponsorRef);
        const sponsorDocData = sponsorDoc.data();
        const downlineKeys = ["downline1", "downline2", "downline3"];

        for (const downlineKey of downlineKeys) {
          if (!sponsorDocData[downlineKey]) {
            await updateDoc(sponsorRef, {
              [downlineKey]: {
                name,
                email: user.email,
                uid: user.uid,
                referralId,
              },
            });
            break;
          }
        }
      }

      alert("Signup successful! Account created.");
      navigate("/login");
    } catch (error) {
      alert(`Signup Error: ${error.message}`);
    }
  };

  const searchSponsorByEmail = async (email) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setSponsorData(null);
      } else {
        setSponsorData(querySnapshot.docs[0].data());
      }
    } catch (error) {
      alert("Error searching for sponsor: " + error.message);
    }
  };

  useEffect(() => {
    if (hasSponsor && sponsorEmail) {
      searchSponsorByEmail(sponsorEmail);
    } else {
      setSponsorData(null);
    }
  }, [sponsorEmail, hasSponsor]);

  return (
    <div className="signup-container">
      <h1 className="title">Create Your Account</h1>
      <label className="label">Name<span className="asterisk">*</span></label>
      <input
        type="text"
        className="input"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label className="label">Email<span className="asterisk">*</span></label>
      <input
        type="email"
        className="input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label className="label">Password<span className="asterisk">*</span></label>
      <input
        type="password"
        className="input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="checkbox-container">
        <input
          type="checkbox"
          className="checkbox"
          checked={hasSponsor}
          onChange={() => setHasSponsor(!hasSponsor)}
        />
        <label className="checkbox-label">Do you have a sponsor?</label>
      </div>
      {hasSponsor && (
        <div>
          <label className="label">Sponsor Email</label>
          <input
            type="email"
            className="input"
            value={sponsorEmail}
            onChange={(e) => setSponsorEmail(e.target.value)}
          />
          {sponsorData ? (
            <div className="sponsor-info">
              <p>Found Sponsor:</p>
              <p>Name: {sponsorData.name}</p>
              <p>Email: {sponsorData.email}</p>
              <p>Referral ID: {sponsorData.referralId}</p>
            </div>
          ) : (
            <p>No sponsor found with this email.</p>
          )}
        </div>
      )}
      <button className="button" onClick={handleSignUp}>Signup</button>
      <p className="link" onClick={() => navigate("/login")}>
        Already have an account? <span>Login</span>
      </p>
    </div>
  );
};

export default Signup;
