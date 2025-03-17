import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { auth } from "../../firebase"; // Import Firebase auth instance
import { signOut } from "firebase/auth"; // Import signOut function

const UserLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-slate-100 text-gray-800 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Happy Commerce</h1>
          <nav className="flex space-x-4">
            <Link to="/user/" className="text-lg font-semibold hover:text-blue-500">
              Home
            </Link>
            <Link to="/user/cart" className="text-lg font-semibold hover:text-blue-500">
              Cart
            </Link>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-lg font-semibold hover:text-blue-500"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
