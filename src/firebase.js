import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"; // Import signOut here
import { getFirestore, setDoc, doc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBKUhzBjJ-mum8X7v01zWcQu6ZF6WPuiDY",
  authDomain: "ecom-18523.firebaseapp.com",
  projectId: "ecom-18523",
  storageBucket: "ecom-18523.firebasestorage.app",
  messagingSenderId: "222017371468",
  appId: "1:222017371468:web:62975971d379a4af2263e9",
};

const app = initializeApp(firebaseConfig);

// Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firebase Authentication Functions
export const createUserWithEmailAndPasswordHandler = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Save user role in Firestore (default is "user")
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "user",  // Default role for new users
      });
  
      return user;
    } catch (error) {
      throw new Error(error.message || "Error signing up. Please try again.");
    }
  };

  export const signInWithEmailAndPasswordHandler = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(user);
  
      // Check user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      console.log(userDoc);
      const userData = userDoc.data();
      console.log(userData);
      const userRole = userData?.role || "user";  // Default to "user" if no role found
  
      return { user, role: userRole };
    } catch (error) {
      throw new Error(error.message || "Invalid email or password. Please try again.");
    }
  };

export { signOut };  // Export signOut separately

export default app;
