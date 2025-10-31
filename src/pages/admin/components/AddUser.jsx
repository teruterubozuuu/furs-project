import { useState } from "react";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { auth, db } from "../../../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export default function AddUser({ isOpen, onClose }) {
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("Community Volunteer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState("Role");

  const role = ["Rescuer", "Community Volunteer", "Admin"];

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    setUsername("");
    setEmail("");
    setPassword("");
    setUserType("Community Volunteer");
    setVerified(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // 🧠 Create a temporary secondary auth instance
      const secondaryAuth = getAuth();
      const tempApp = auth.app; // current Firebase app
      const tempAuth = getAuth(tempApp);

      // Create user without signing out current admin
      const userCredential = await createUserWithEmailAndPassword(
        tempAuth,
        email,
        password
      );

      const newUser = userCredential.user;

      // Store user info in Firestore
      await setDoc(doc(db, "users", newUser.uid), {
        username,
        email,
        userType: selectedRole,
        verified,
        profilePhoto: "",
        description: "Add a description...",
        totalRatingSum: 0,
        totalRatingCount: 0,
      });

      // 🧹 Sign out the new user to keep the admin logged in
      await tempAuth.signOut();

      handleClose();
    } catch (err) {
      console.error("Error adding user:", err);
      setError("Failed to add user. Email might already be in use.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 h-screen flex justify-center items-center">
      <div className="bg-[#fefefe] px-6 py-5 rounded-md shadow-lg w-full max-w-md relative">
        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#115315]">Add User</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
            onClick={handleClose}
            type="button"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <p className="text-sm text-red-700 bg-red-100 border border-red-300 rounded p-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              className="border border-gray-300 rounded-sm w-full p-2 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="border border-gray-300 rounded-sm w-full p-2 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="border border-gray-300 rounded-sm w-full p-2 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <Menu as="div" className="relative inline-block">
              <MenuButton className="inline-flex border cursor-pointer hover:bg-gray-200 border-gray-200 w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-gray-700">
                {selectedRole}
                <ChevronDownIcon className="-mr-1 size-5 text-gray-700" />
              </MenuButton>
              <MenuItems className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-lg border border-gray-200 bg-white transition">
                <div className="py-1">
                  {role.map((type) => (
                    <MenuItem key={type}>
                      <button
                        type="button"
                        onClick={() => setSelectedRole(type)}
                        className="cursor-pointer text-gray-700 hover:bg-gray-100 block w-full text-left px-4 py-2 text-sm"
                      >
                        {type}
                      </button>
                    </MenuItem>
                  ))}
                </div>
              </MenuItems>
            </Menu>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="verified"
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
            />
            <label htmlFor="verified" className="text-sm font-medium">
              Mark as Verified
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-2 rounded-sm text-white font-medium ${
              isSubmitting ? "bg-gray-400" : "bg-[#2e7d32] hover:bg-[#256428]"
            }`}
          >
            {isSubmitting ? "Adding..." : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
}
