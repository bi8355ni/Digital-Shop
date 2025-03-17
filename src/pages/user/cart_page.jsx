import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { collection, doc, getDoc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore"; // Import necessary Firestore functions
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Use useNavigate for React Router v6+

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate(); // Use useNavigate hook for navigation in v6+

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribeAuth(); // Cleanup auth listener
    }, []);

    useEffect(() => {
        const fetchCartItems = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const userCartRef = doc(db, "cart", user.uid);
                const cartSnapshot = await getDoc(userCartRef);

                if (cartSnapshot.exists()) {
                    const cartData = cartSnapshot.data();
                    console.log("Cart data:", cartData);
                    const items = await Promise.all(cartData.items.map(async (item) => {
                        if (item.product) { // Ensure item.product is defined
                            const productSnapshot = await getDoc(item.product);  // Use the reference stored in the cart
                            if (productSnapshot.exists()) {
                                return {
                                    product: productSnapshot.data(),
                                    quantity: item.quantity,
                                };
                            }
                        }
                        return null; // Product not found or item.product is undefined
                    }));

                    setCartItems(items.filter(item => item !== null)); // Filter out products not found
                } else {
                    setCartItems([]); // Cart is empty
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching cart items:", error);
                setLoading(false);
            }
        };

        fetchCartItems();
    }, [user]);

    const updateQuantity = async (product, quantity) => {
        console.log("Updating quantity:", product.name, quantity);
        if (quantity < 1) return; // Prevent quantity less than 1

        try {
            const userCartRef = doc(db, "cart", user.uid);
            const cartSnapshot = await getDoc(userCartRef);
            const cartData = cartSnapshot.data();

            const updatedItems = cartData.items.map(item => 
                item.product.id === product.id ? { product: item.product, quantity } : item
            );

            await updateDoc(userCartRef, { items: updatedItems });
            setCartItems(cartItems.map(item => 
                item.product.name === product.name ? { ...item, quantity } : item
            ));
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const removeProduct = async (product) => {
        try {
            const userCartRef = doc(db, "cart", user.uid);
            const cartSnapshot = await getDoc(userCartRef);
            const cartData = cartSnapshot.data();

            const updatedItems = cartData.items.filter(item => item.product.id !== product.id);

            await updateDoc(userCartRef, { items: updatedItems });
            setCartItems(cartItems.filter(item => item.product.name !== product.name));
        } catch (error) {
            console.error("Error removing product:", error);
        }
    };

    const handleProceedToOrder = () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty! Please add items to proceed.");
            return;
        }

        // Navigate to the order page and pass cart items as state
        navigate("/user/order", { state: { cartItems } });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            {cartItems.length === 0 ? (
                <div className="flex flex-col items-center h-64 mt-20">
                    <p className="text-lg mb-4">Your cart is empty.</p>
                    <img src="https://cdn-icons-png.flaticon.com/256/11329/11329060.png" alt="Empty Cart" className="w-32 h-32 mb-4" />
                    <button
                        onClick={() => navigate("/user")}
                        className="bg-blue-500 text-white px-4 py-2 rounded">
                        Go to Shop
                    </button>
                </div>
            ) : (
                <div>
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border p-2 text-left">Product</th>
                                <th className="border p-2 text-left">Price</th>
                                <th className="border p-2 text-left">Quantity</th>
                                <th className="border p-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item) => (
                                <tr key={item.product.title}>
                                    <td className="border p-2 flex items-center gap-2">
                                        <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-12 mr-2" /> 
                                        {item.product.name}
                                    </td>
                                    <td className="border p-2">$ {item.product.price}</td>
                                    <td className="border p-2">
                                        <input 
                                            type="number" 
                                            value={item.quantity} 
                                            onChange={(e) => updateQuantity(item.product, parseInt(e.target.value))} 
                                            className="w-16 p-1 border rounded"
                                        />
                                    </td>
                                    <td className="border p-2">
                                        <button 
                                            onClick={() => removeProduct(item.product)} 
                                            className="bg-red-500 text-white px-2 py-1 rounded">
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4">
                        <button
                            onClick={handleProceedToOrder}
                            className="bg-blue-500 text-white px-4 py-2 rounded">
                            Proceed to Order
                        </button>
                    </div>
                </div>
            )}


        </div>
    );
};

export default CartPage;
