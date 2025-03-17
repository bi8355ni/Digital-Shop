import React, { useState, useEffect } from 'react';
import { db, auth } from "../../firebase";
import { collection, doc, getDoc, updateDoc, deleteDoc, writeBatch, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Add this import

const CheckoutPage = () => {
    const [name, setName] = useState('');
    const [phone, setphone] = useState('');
    const [address, setaddress] = useState('');
    const [orderSummary, setOrderSummary] = useState({ items: [], total: 0 });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate(); // Add this line

    // Fetch cart details and user data
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            
            if (currentUser) {
                // Check if user is admin
                try {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists() && userDoc.data().role === 'admin') {
                        setIsAdmin(true);
                    }
                } catch (error) {
                    console.error("Error checking admin status:", error);
                }
            }
        });

        if (user) {
            const fetchCartDetails = async () => {
                try {
                    const userCartRef = doc(db, "cart", user.uid);
                    const cartSnapshot = await getDoc(userCartRef);

                    if (cartSnapshot.exists()) {
                        const cartData = cartSnapshot.data();
                        const items = await Promise.all(
                            cartData.items.map(async (item) => {
                                const productSnapshot = await getDoc(item.product);
                                if (productSnapshot.exists()) {
                                    return {
                                        product: { id: productSnapshot.id, ...productSnapshot.data() },
                                        quantity: item.quantity,
                                    };
                                } else {
                                    return null;
                                }
                            })
                        );

                        const total = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
                        setOrderSummary({
                            items: items.filter(item => item !== null),
                            total: total,
                        });
                    } else {
                        setOrderSummary({ items: [], total: 0 });
                    }
                } catch (error) {
                    console.error('Error fetching cart details:', error);
                }
                setLoading(false);
            };

            fetchCartDetails();
        }

        return () => unsubscribeAuth();
    }, [user]);

    // Place the order without updating book quantities directly
    const handlePlaceOrder = async () => {
        if (!name || !phone || !address) {
            alert("Please enter your name, phone number, and shipping address.");
            return;
        }

        if (orderSummary.items.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        try {
            // Create the order document
            const orderRef = doc(collection(db, "orders"));
            const orderData = {
                userId: user.uid,
                name,
                phone,
                address,
                items: orderSummary.items.map(item => ({
                    productId: item.product.id,
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
                total: orderSummary.total,
                createdAt: serverTimestamp(),
                status: 'pending',
            };
            
            // Set the order first
            await setDoc(orderRef, orderData);
            
            // After successful order creation, clear the cart
            const userCartRef = doc(db, "cart", user.uid);
            await deleteDoc(userCartRef);
            
            // If user is admin, update book quantities
            if (isAdmin) {
                const batch = writeBatch(db);
                orderSummary.items.forEach(item => {
                    const productRef = doc(db, "products", item.product.id);
                    batch.update(productRef, {
                        quantity: item.product.quantity - item.quantity,
                    });
                });
                await batch.commit();
            }
            
            alert('Order placed successfully!');
            // Clear form fields after successful order
            setName('');
            setphone('');
            setaddress('');
            setOrderSummary({ items: [], total: 0 });
            
        } catch (error) {
            console.error("Error placing order:", error);
            alert('There was an issue placing your order. Please try again.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (orderSummary.items.length === 0) {
        return (
            <div className="flex flex-col items-center h-64 mt-20">
                <p className="text-lg mb-4">Your cart is empty.</p>
                <img src="https://cdn-icons-png.flaticon.com/256/11329/11329060.png" alt="Empty Cart" className="w-32 h-32 mb-4" />
                <button
                    onClick={() => navigate("/user")}
                    className="bg-blue-500 text-white px-4 py-2 rounded">
                    Go to Shop
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-container p-4 flex flex-col md:flex-row">
            <div className="md:w-1/2 md:pr-4">
                <h1 className="text-2xl font-bold mb-4">Checkout</h1>

                <div className="mb-4">
                    <h2 className="text-lg font-semibold">Name</h2>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                    />
                </div>

                <div className="mb-4">
                    <h2 className="text-lg font-semibold">Phone Number</h2>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={phone}
                        onChange={(e) => setphone(e.target.value)}
                        placeholder="Enter your phone number"
                    />
                </div>

                <div className="mb-4">
                    <h2 className="text-lg font-semibold">Shipping Address</h2>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={address}
                        onChange={(e) => setaddress(e.target.value)}
                        placeholder="Enter your shipping address"
                    />
                </div>

                <button
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    onClick={handlePlaceOrder}
                >
                    Place Order
                </button>
            </div>

            <div className="md:w-1/2 md:pl-4 mt-4 md:mt-0">
                <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                <div className="border p-4 rounded shadow-md">
                    <ul>
                        {orderSummary.items.map((item, index) => (
                            <li key={index} className="py-1 flex justify-between">
                                <span>{item.product.name}</span>
                                <span>${item.product.price} x {item.quantity}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="font-bold mt-2 text-right">Total: ${orderSummary.total}</p>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;