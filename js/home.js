// Import the necessary Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDW4YaKyRsrxYn6u-744MKAqALajS_BJeU",
    authDomain: "login-form-dd694.firebaseapp.com",
    projectId: "login-form-dd694",
    storageBucket: "login-form-dd694.firebasestorage.app",
    messagingSenderId: "600112311901",
    appId: "1:600112311901:web:f9c87eead4ff40584be7b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// Replace the @username placeholder with the actual username
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User authenticated:", user);

        try {
            // Fetch user data from Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const username = userData.username || "User"; // Fallback if username is missing

                // Replace @username in the welcome message
                document.querySelector('.main-header h1').textContent = `Welcome ${username}!`;
            } else {
                console.warn("User document not found in Firestore.");
                document.querySelector('.main-header h1').textContent = "Welcome!";
            }
        } catch (error) {
            console.error("Error fetching user data from Firestore:", error);
        }
    } else {
        console.warn("No user is signed in.");
        document.querySelector('.main-header h1').textContent = "Welcome, guest!";
    }
});
