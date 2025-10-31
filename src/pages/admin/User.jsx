import { useEffect, useState, useRef } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { db } from "../../firebase/config";
import AddUser from "./components/AddUser";

export default function User() {
  const [users, setUsers] = useState([]);
  const [isOpenPost, setIsOpenPost] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const auth = getAuth();

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);

  // 🧠 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔁 Reset password
  const handleResetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error("Error sending password reset:", error);
      alert("Failed to send reset email. Make sure the email exists in Firebase Auth.");
    }
  };

  // 🚫 Disable account (update user status in Firestore)
  const handleDisableUser = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { disabled: true });
      alert("User account disabled successfully.");
    } catch (error) {
      console.error("Error disabling user:", error);
      alert("Failed to disable account.");
    }
  };

  // 🗑️ Delete user from Firestore
  const handleDeleteUser = async (userId) => {
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter((user) => user.id !== userId));
      alert("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#115315]">User Management</h1>

      {/* 🧮 Display user count */}
      <p className="text-sm font-light">
        {users.length > 0
          ? `${users.length} user${users.length > 1 ? "s" : ""} found`
          : "No users found"}
      </p>

      {/* Add + Search */}
      <div className="flex justify-between items-center py-3 flex-wrap gap-3">
        <button
          className="bg-[#115315] text-white px-3 py-1 rounded-md hover:bg-[#0a320d] transition-all"
          onClick={() => setIsOpenPost(true)}
        >
          Add user
        </button>
        <input
          type="text"
          placeholder="Search user..."
          className="border border-gray-300 rounded-md p-1 focus:outline"
        />
      </div>

      <AddUser isOpen={isOpenPost} onClose={() => setIsOpenPost(false)} />

      {/* User Table */}
{/* User Table */}
<div className="lg:overflow-visible overflow-x-auto relative">
  {/* Header */}
  <div className="min-w-[400px] flex items-center justify-between bg-[#115315] py-2 px-3 text-white rounded-md">
    <div className="flex-1 grid grid-cols-3 text-center">
      <span>Email</span>
      <span>Username</span>
      <span>Role</span>
    </div>
    <span className="w-[24px]">{""}</span>
  </div>

        {/* Rows */}
        {users.map((u) => (
          <div
            key={u.id}
            className="min-w-[400px] flex items-center justify-between bg-[#D3ECD4] py-2 px-3 text-[#115315] rounded-md mt-3 relative"
          >
            {/* User Info */}
            <div className="flex-1 grid grid-cols-3 text-center">
              <span className="truncate px-2">{u.email}</span>
              <span className="truncate px-2">{u.username}</span>
              <span className="truncate px-2">{u.userType}</span>
            </div>

            {/* Menu Icon + Dropdown */}
            <div className="relative flex flex-col items-end" ref={menuRef}>
              <i
                onClick={() =>
                  setOpenMenuId(openMenuId === u.id ? null : u.id)
                }
                className="cursor-pointer bi bi-three-dots-vertical text-[#115315] text-xl hover:text-[#0b3e10] transition duration-150 ease-in-out"
              ></i>

              {openMenuId === u.id && (
                <div className="flex flex-col items-start border border-gray-200 bg-white w-[150px] rounded-md absolute top-6 right-0 z-10 shadow-md">
                  <button
                    onClick={() => {
                      handleResetPassword(u.email);
                      setOpenMenuId(null);
                    }}
                    className="cursor-pointer text-sm text-start pl-3 text-gray-700 w-full hover:bg-gray-200 transition duration-150 ease-in-out py-2"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => {
                      handleDisableUser(u.id);
                      setOpenMenuId(null);
                    }}
                    className="cursor-pointer text-sm text-start pl-3 text-gray-700 w-full hover:bg-gray-200 transition duration-150 ease-in-out py-2"
                  >
                    Disable Account
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteUser(u.id);
                      setOpenMenuId(null);
                    }}
                    className="cursor-pointer text-sm text-start pl-3 text-red-600 w-full hover:bg-red-100 transition duration-150 ease-in-out py-2"
                  >
                    Delete Account
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
