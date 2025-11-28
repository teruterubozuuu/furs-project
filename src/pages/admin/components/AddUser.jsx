import { useState } from "react";
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification } from "firebase/auth";
import { db } from "../../../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export default function AddUser({ isOpen, onClose }) {
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState("Community Volunteer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const roles = ["Rescuer", "Community Volunteer", "Admin"];
  const auth = getAuth();

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    setUsername("");
    setEmail("");
    setPassword("");
    setSelectedRole("Community Volunteer");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // 1️⃣ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // 2️⃣ Send email verification
      await sendEmailVerification(newUser);

      // 3️⃣ Add user to Firestore
      await setDoc(doc(db, "users", newUser.uid), {
        username,
        email,
        userType: selectedRole,
        profilePhoto: "",
        description: "Add a description...",
        totalRatingSum: 0,
        totalRatingCount: 0,
      });

      // 4️⃣ Optionally sign out the temporary created user (so admin stays signed in)
      await auth.signOut();

      handleClose();
      alert("User added successfully!");
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
            <Menu as="div" className="relative inline-block w-full">
              <MenuButton className="inline-flex border cursor-pointer hover:bg-gray-200 border-gray-200 w-full justify-between items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700">
                {selectedRole}
                <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-700" />
              </MenuButton>
              <MenuItems className="absolute left-0 z-10 mt-2 w-full origin-top-right rounded-lg border border-gray-200 bg-white transition">
                {roles.map((role) => (
                  <MenuItem key={role}>
                    <button
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className="cursor-pointer text-gray-700 hover:bg-gray-100 block w-full text-left px-4 py-2 text-sm"
                    >
                      {role}
                    </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-2 rounded-sm text-white font-medium ${
              isSubmitting ? "bg-gray-400" : "bg-[#2e7d32] hover:bg-[#256428] cursor-pointer"
            }`}
          >
            {isSubmitting ? "Adding..." : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
}
