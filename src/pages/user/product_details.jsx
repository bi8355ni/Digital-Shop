import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../../firebase"; // Import auth from firebase.js
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // Firebase auth method to check user state

const ProductDetails = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [user, setUser] = useState(null); // State for holding user info
    const [quantity, setQuantity] = useState(1); // State for holding quantity

    // Use onAuthStateChanged to check the current user state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Set user to the state when authentication state changes
        });

        // Cleanup the listener when the component is unmounted
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                console.error("No product ID provided");
                return;
            }

            const productDoc = doc(db, "products", productId);
            const productSnapshot = await getDoc(productDoc);

            if (productSnapshot.exists()) {
                setProduct(productSnapshot.data());
            } else {
                console.error("No such product found!");
            }
        };

        fetchProduct();
    }, [productId]);

    const addToCart = async () => {
        if (!user) {
            alert("Please log in to add items to your cart.");
            return;
        }
    
        try {
            const userCartRef = doc(db, "cart", user.uid);
            const cartSnapshot = await getDoc(userCartRef);
    
            if (cartSnapshot.exists()) {
                const cartData = cartSnapshot.data();
                const updatedItems = [...cartData.items, { product: doc(db, "products", productId), quantity }];
    
                await updateDoc(userCartRef, {
                    items: updatedItems,
                });
                alert("Product added to cart!");
            } else {
                const newCart = {
                    userId: user.uid, // Correctly set userId
                    items: [{ product: doc(db, "products", productId), quantity }],
                };
    
                await setDoc(userCartRef, newCart);
                alert("Cart created and product added!");
            }
        } catch (error) {
            console.error("Error adding product to cart:", error);
            alert("Failed to add the product to the cart.");
        }
    };

    if (!product) {
        return <div className="text-center text-gray-700 text-xl">Loading...</div>;
    }

    return (
        <div className="flex flex-col py-8">
            <div className="bg-white p-6 rounded w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Image Section */}
                    <div className="col-span-1">
                        <img
                            src={product.imageUrl || "default-image-url.jpg"}
                            alt={product.title}
                            className="w-full h-auto object-cover rounded-lg shadow-md"
                        />
                    </div>

                    {/* Product Details Section */}
                    <div className="col-span-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                        <h2 className="text-md font-light text-gray-700 mb-4">{product.description}</h2>
                        <h2 className="text-xl font-light text-gray-700 mb-4">$ {product.price}</h2>
                        <p className="text-gray-600 mb-4">{product.description}</p>

                        {/* Add to Cart Button */}
                        <div className="flex gap-4 items-center">
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                min="1"
                                className="border border-gray-300 rounded-md px-2 py-1 w-16"
                            />
                            <button
                                onClick={addToCart}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
