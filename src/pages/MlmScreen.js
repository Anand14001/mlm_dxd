import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import "./DownlineScreen.css";

const DownlineScreen = () => {
  const [users, setUsers] = useState([]);
  const [expandedLevel1, setExpandedLevel1] = useState({}); // Track expanded level 1 users

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const buildTree = () => {
    const levels = {};
    const rootUser = users.find((user) => user.mlmLevel === 0 && user.parentId === "null");

    if (!rootUser) return levels; // Return empty if no root user found

    levels[0] = [rootUser];

    // Group users by mlmLevel and associate them with their parent
    users.forEach((user) => {
      if (user.mlmLevel === 1) {
        if (!levels[1]) levels[1] = [];
        levels[1].push(user);
      }
    });

    return levels;
  };

  const treeLevels = buildTree();

  const handleViewDownlines = (parentId) => {
    setExpandedLevel1((prevState) => ({
      ...prevState,
      [parentId]: !prevState[parentId], // Toggle the visibility of level 2 users
    }));
  };

  const renderTree = () => {
    const nodeSize = 50;
    const verticalSpacing = 100;
    const horizontalSpacing = 60;

    return Object.keys(treeLevels).map((level) => {
      const nodes = treeLevels[level];
      return (
        <div key={level} className="level-row">
          {nodes.length > 1 && (
            <div
              className="horizontal-line"
              style={{
                width: nodes.length * (nodeSize + horizontalSpacing) - horizontalSpacing,
              }}
            />
          )}

          {nodes.map((user) => {
            const parent = users.find((u) => u.uid === user.parentId);
            const iconColor = user.mlmLevel === 0 ? "#FFD166" : "#06D6A0";

            return (
              <div key={user.uid} className="node-container">
                {parent && (
                  <div
                    className="vertical-line"
                    style={{ top: -verticalSpacing / 2 }}
                  />
                )}

                <div className="node">
                  <span className="icon" style={{ color: iconColor }}>👤</span>
                  <div className="node-text">{user.name}</div>
                  <div className="node-text">{user.email}</div>

                  {user.mlmLevel === 1 && (
                    <button
                      className="downline-button"
                      onClick={() => handleViewDownlines(user.uid)}
                    >
                      View Downlines
                    </button>
                  )}

                  {user.mlmLevel === 1 && expandedLevel1[user.uid] && (
                    <div className="downline-container">
                      {users
                        .filter(
                          (downlineUser) =>
                            downlineUser.mlmLevel === 2 &&
                            downlineUser.parentId === user.uid
                        )
                        .map((downlineUser) => (
                          <div key={downlineUser.uid} className="downline-node-container">
                            <div
                              className="vertical-line-between-nodes"
                              style={{
                                height: verticalSpacing / 2,
                              }}
                            />
                            <div className="downline-node">
                              <span className="icon" style={{ color: "#118AB2" }}>👤</span>
                              <div className="node-text">{downlineUser.name}</div>
                              <div className="node-text">{downlineUser.email}</div>
                            </div>
                          </div>
                        ))}
                      {users.filter(
                        (downlineUser) =>
                          downlineUser.mlmLevel === 2 &&
                          downlineUser.parentId === user.uid
                      ).length === 0 && (
                        <div className="no-downlines-text">No downline records found</div>
                      )}
                    </div>
                  )}
                </div>

                {level === "0" && <div className="vertical-line-below" />}
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="container">
      <div>{renderTree()}</div>
    </div>
  );
};

export default DownlineScreen;
