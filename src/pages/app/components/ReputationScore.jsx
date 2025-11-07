import { useState, useEffect } from "react";
import { db } from "../../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";

export default function ReputationScore() {
  const { user } = useAuth();
  const [reputation, setReputation] = useState({ score: 0, count: 0 });
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchReputation = async () => {
if (!user?.uid) {
        setUsername("Guest");
        setReputation({ score: 0, count: 0 });
        return;
      }

      const userRef = doc(db, "users", user.uid);

      try {
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUsername(data.username || "Unknown User");
          const sum = data.totalRatingSum || 0;
          const count = data.totalRatingCount || 0;

          if (count > 0) {
            const score = sum / count;
            setReputation({ score, count });
          } else {
            setReputation({ score: 0, count: 0 });
          }
        } else {
            setUsername("Unknown User");
          setReputation({ score: 0, count: 0 });
        }
      } catch (error) {
        console.error("Error fetching reputation score:", error);
        setUsername("Error Fetching User");
        setReputation({ score: 0, count: 0 });
      }
    };

    fetchReputation();
  }, [user?.uid]);
  return (
    <div>
      {reputation.count > 0 ? (
        <div className="text-start">
        <p className="text-lg font-semibold text-[#2e7d32]">
        {username}'s Reputation Score
        </p>
        <p className="text-[#edb425] font-medium text-md">
           {reputation.score.toFixed(2)} Stars{" "}
                             <span className="text-xs text-gray-500">
            {" "}
            ({reputation.count} ratings)
          </span>
        </p>
        </div>
        
      ) : (
        <p className="text-sm text-gray-500 italic">No reputation score yet.</p>
      )}
    </div>
  );
}
