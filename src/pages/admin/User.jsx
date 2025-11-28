import { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  startAt,
  endAt,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { db } from "../../firebase/config";
import AddUser from "./components/AddUser";

const PAGE_SIZE = 10;

export default function User() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastDocs, setLastDocs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isOpenPost, setIsOpenPost] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const auth = getAuth();

  const fetchUsers = async (page = 1, search = "") => {
    try {
      let usersQuery;

      if (search) {
        // For search, order by 'email' and use startAt/endAt for prefix search
        const searchLower = search.toLowerCase();
        usersQuery = query(
          collection(db, "users"),
          orderBy("email"),
          startAt(searchLower),
          endAt(searchLower + "\uf8ff"),
          limit(PAGE_SIZE)
        );
      } else {
        usersQuery = query(
          collection(db, "users"),
          orderBy("email"),
          limit(PAGE_SIZE)
        );

        if (page > 1 && lastDocs[page - 2]) {
          usersQuery = query(
            collection(db, "users"),
            orderBy("email"),
            startAfter(lastDocs[page - 2]),
            limit(PAGE_SIZE)
          );
        }
      }

      const querySnapshot = await getDocs(usersQuery);
      const fetchedUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(fetchedUsers);

      if (!search) {
        // store last doc for pagination only if not searching
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        if (lastVisible) {
          const updatedLastDocs = [...lastDocs];
          updatedLastDocs[page - 1] = lastVisible;
          setLastDocs(updatedLastDocs);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // fetch when page or search changes
  useEffect(() => {
    fetchUsers(currentPage, searchText);
  }, [currentPage, searchText]);

useEffect(() => {
  const handleClickOutside = (event) => {
    // Only close if click is outside any menu
    if (!event.target.closest(".user-menu")) {
      setOpenMenuId(null);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  const handleResetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error("Error sending password reset:", error);
      alert(
        "Failed to send reset email. Make sure the email exists in Firebase Auth."
      );
    }
  };

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

  const functionBaseUrl =
    window.location.hostname === "localhost"
      ? "http://127.0.0.1:5001/furs-project-7a0a3/us-central1/api" // Local emulator
      : "https://us-central1-furs-project-7a0a3.cloudfunctions.net/api"; // Production

  const handleDeleteUser = async (userId) => {
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      // Call backend to delete from Firebase Auth
      const response = await fetch(`${functionBaseUrl}/deleteUser/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user from Auth");
      }

      // Delete from Firestore
      await deleteDoc(doc(db, "users", userId));

      // Update UI immediately
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

      alert(`User ${userId} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#115315]">User Management</h1>
      <p className="text-sm font-light">
        {users.length > 0
          ? `${users.length} user(s) on this page`
          : "No users found"}
      </p>

      <div className="flex justify-between items-center py-3 flex-wrap gap-3">
        <button
          className="bg-[#115315] text-white px-3 py-1 rounded-md hover:bg-[#0a320d] transition-all cursor-pointer"
          onClick={() => setIsOpenPost(true)}
        >
          Add user
        </button>
        <input
          type="text"
          placeholder="Search by email..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1); // reset page when searching
          }}
          className="border border-gray-300 rounded-md p-1 focus:outline"
        />
      </div>

      <AddUser isOpen={isOpenPost} onClose={() => setIsOpenPost(false)} />

      <div className="lg:overflow-visible overflow-x-auto relative">
        <div className="min-w-[400px] flex items-center justify-between bg-[#115315] py-2 px-3 text-white rounded-md">
          <div className="flex-1 grid grid-cols-4 text-center">
            <span>User UID</span>
            <span>Email</span>
            <span>Username</span>
            <span>Role</span>
          </div>
          <span className="w-[24px]">{""}</span>
        </div>

        {users.map((u) => (
          <div
            key={u.id}
            className="min-w-[400px] flex items-center justify-between bg-[#D3ECD4] py-2 px-3 text-[#115315] rounded-md mt-3 relative"
          >
            <div className="flex-1 grid grid-cols-4 text-center">
              <span>{u.id}</span>
              <span className="truncate px-2">{u.email}</span>
              <span className="truncate px-2">{u.username}</span>
              <span className="truncate px-2">{u.userType}</span>
            </div>

            <div className="relative flex flex-col items-end" ref={menuRef}>
              <i
                onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                className="cursor-pointer bi bi-three-dots-vertical text-[#115315] text-xl hover:text-[#0b3e10] transition duration-150 ease-in-out"
              ></i>

              {openMenuId === u.id && (
                <div className="user-menu flex flex-col items-start border border-gray-200 bg-white w-[150px] rounded-md absolute top-6 right-0 z-10 shadow-md">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleResetPassword(u.email);
                      setOpenMenuId(null);
                    }}
                    className="cursor-pointer text-sm text-start pl-3 text-gray-700 w-full hover:bg-gray-200 transition duration-150 ease-in-out py-2"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDisableUser(u.id);
                      setOpenMenuId(null);
                    }}
                    className="cursor-pointer text-sm text-start pl-3 text-gray-700 w-full hover:bg-gray-200 transition duration-150 ease-in-out py-2"
                  >
                    Disable Account
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
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

        {/* Pagination */}
        {!searchText && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              className="px-3 py-1 bg-[#115315] text-white rounded hover:bg-[#0a320d] transition-all cursor-pointer"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="px-3 py-1">{currentPage}</span>
            <button
              onClick={() =>
                lastDocs[currentPage - 1] && setCurrentPage(currentPage + 1)
              }
              className="px-3 py-1 bg-[#115315] text-white rounded hover:bg-[#0a320d] transition-all cursor-pointer"
              disabled={!lastDocs[currentPage - 1]}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
