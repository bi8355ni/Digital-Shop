import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import AuthPage from "./pages/auth";
import AdminDashboard from "./pages/admin/admin_dashboard";
import ManageOrders from "./pages/admin/manage_orders";
import UserLayout from "./pages/user/user_layout";
import CartPage from "./pages/user/cart_page";
import ProfilePage from "./pages/user/profile_page";
import CheckoutPage from "./pages/user/order_page";
import Layout from "./pages/admin/layout";
import Products from "./pages/admin/products";
import Homepage from "./pages/user/homepage";
import ProductDetails from "./pages/user/product_details";

const PrivateRoute = ({ children, requiredRole }) => {
  const role = localStorage.getItem("role");
  return role === requiredRole ? children : <Navigate to="/auth" />;
};

const App = () => {
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role);
            localStorage.setItem("role", userData.role)
          } else {
            console.error("User document not found.");
            setRole("user"); // Default to user if document missing
            localStorage.setItem("role", "user");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole("user"); // Default to user on error
          localStorage.setItem("role", "user");
        }
      } else {
        setIsAuthenticated(false);
        setRole(null);
        localStorage.removeItem("role");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Just a moment...</div>; // Show loading indicator
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole="admin">
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<ManageOrders />} />
        </Route>
        <Route path="/user" element={<PrivateRoute requiredRole="user"><UserLayout /></PrivateRoute>}>
          <Route index element={<Homepage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="product/:productId" element={<ProductDetails/>} />
          <Route path="order" element={<CheckoutPage/>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;