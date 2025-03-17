import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPasswordHandler, signInWithEmailAndPasswordHandler } from "../firebase";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleAuth = async () => {
        setError(""); // Reset error message
        if (!email || !password) {
            setError("Email and Password cannot be empty");
            toast.error("Email and Password cannot be empty");
            return;
        }
        try {
            if (isRegister) {
                // Registration logic
                await createUserWithEmailAndPasswordHandler(email, password);
                navigate("/user"); // Redirect to user dashboard after successful registration
            } else {
                // Login logic
                const { user, role } = await signInWithEmailAndPasswordHandler(email, password);
                console.log(role);
                // Check if the user is admin or user
                if (role === "admin") {
                    console.log("Admin");
                    localStorage.setItem("role", "admin");
                    navigate("/admin/");
                } else {
                    console.log("User");
                    localStorage.setItem("role", "user");
                    navigate("/user/");
                }
            }
        } catch (err) {
            setError(err.message); // Show error message if login/registration fails
            toast.error(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="p-8 bg-white shadow-2xl rounded-lg w-96">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    {isRegister ? "Create Account" : "Welcome Back"}
                </h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleAuth}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                    {isRegister ? "Sign Up" : "Login"}
                </button>

                <p
                    className="text-sm text-center mt-4 cursor-pointer text-blue-500 hover:text-blue-800 transition duration-300"
                    onClick={() => setIsRegister(!isRegister)}
                >
                    {isRegister ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
