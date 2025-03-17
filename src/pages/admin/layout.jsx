import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { auth, signOut } from "../../firebase";
import { FaTachometerAlt, FaBook, FaShoppingCart, FaSignOutAlt } from "react-icons/fa";

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            // Sign out from Firebase
            await signOut(auth);

            // Redirect to login page or home page after logout
            navigate("/auth"); // Adjust to your login route
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-100 text-black p-4">
                <h2 className="text-2xl font-semibold mb-4">My Admin</h2>
                <nav>
                    <Link to="/admin/" className={`block py-2 px-3 hover:bg-gray-200 ${isActive('/admin/') ? 'bg-gray-200' : ''}`}>
                        <FaTachometerAlt className="inline-block mr-2" /> Dashboard
                    </Link>
                    <Link to="/admin/products" className={`block py-2 px-3 hover:bg-gray-200 ${isActive('/admin/products') ? 'bg-gray-200' : ''}`}>
                        <FaBook className="inline-block mr-2" /> Products
                    </Link>
                    <Link to="/admin/orders" className={`block py-2 px-3 hover:bg-gray-200 ${isActive('/admin/orders') ? 'bg-gray-200' : ''}`}>
                        <FaShoppingCart className="inline-block mr-2" /> Orders
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="flex justify-between items-center bg-slate-100 text-black p-4">
                    <h1 className="text-xl font-semibold">Dashboard</h1>
                    <FaSignOutAlt
                        onClick={handleLogout}
                        className="cursor-pointer hover:bg-gray-200 p-2 rounded-full"
                        size={30}
                    />
                </header>

                {/* Content */}
                <main className="flex-1 p-4">
                    <Outlet /> {/* Render nested routes here */}
                </main>
            </div>
        </div>
    );
};

export default Layout;