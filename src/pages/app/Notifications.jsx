import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // ✅ import this
import defaultImg from "../../assets/default_img.jpg";

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate(); // ✅ initialize navigate

  useEffect(() => {
    if (!user) return;

    const notifRef = collection(db, "users", user.uid, "notifications");
    const q = query(notifRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user]);

  const handleNotificationClick = async (notif) => {
  try {
    const notifDoc = doc(db, "users", user.uid, "notifications", notif.id);
    await updateDoc(notifDoc, { read: true });

    if (notif.type === "like" || notif.type === "comment") {

      if (notif.postId && notif.postUsername) {
        navigate(`/${notif.postUsername}/status/${notif.postId}`);
      }
    } else if (notif.type === "rating") {

      if (notif.senderId) {
        navigate(`/profile/${user.uid}`); 
      }
    }
  } catch (error) {
    console.error("Error handling notification click:", error);
  }
};

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="xl:min-w-[650px] border border-gray-200 bg-white rounded-lg p-7 min-h-screen">
      <h1 className="text-xl text-[#2e7d32] font-bold mb-4">Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                notif.read ? "bg-gray-50" : "bg-[#e8f5e9]"
              }`}
              onClick={() => handleNotificationClick(notif)} // ✅ now triggers navigation
            >
              <img
                src={notif.senderPhoto || defaultImg}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">{notif.senderName}</span>{" "}
                  {notif.type === "like" && "liked your post."}
                  {notif.type === "rating" && `rated you ${notif.value} ⭐.`}
                  {notif.type === "comment" && "commented on your post."}
                </p>
                <p className="text-xs text-gray-500">{formatTime(notif.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
