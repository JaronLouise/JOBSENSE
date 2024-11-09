// Import the necessary functions from Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
const db = getFirestore();

// Function to show messages to the user
function showMessage(message, divId) {
    const messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function () {
        messageDiv.style.opacity = 0;
    }, 5000);
}

// Register form submission event listener
document.getElementById("registerForm")?.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get values from the form
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Register the user in Firebase Authentication
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userData = {
                email: email,
                name: name,
                username: username,
            };

            showMessage('Account Created Successfully', 'signUpMessage');

            // Store additional user data (excluding password) in Firestore
            const docRef = doc(db, "users", user.uid);
            setDoc(docRef, userData)
                .then(() => {
                    window.location.href = "login.html"; // Redirect to login.html after registration
                })
                .catch((error) => {
                    console.error("Error writing document: ", error);
                    showMessage('Error saving user data', 'signUpMessage');
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode === 'auth/email-already-in-use') {
                showMessage('Email Address Already Exists!', 'signUpMessage');
            } else {
                showMessage('Unable to create user', 'signUpMessage');
            }
        });
});

// Login form submission event listener
document.getElementById("loginForm")?.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get values from the form
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Authenticate the user with Firebase Authentication
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Login successful
            showMessage('Login successful!', 'signInMessage');
            window.location.href = "home.html"; // Redirect to home.html on successful login
        })
        .catch((error) => {
            const errorCode = error.code;
            console.error('Error during login:', error);

            if (errorCode === 'auth/wrong-password') {
                showMessage('Incorrect password. Please try again.', 'signInMessage');
            } else if (errorCode === 'auth/user-not-found') {
                showMessage('No account found with this email. Please register.', 'signInMessage');
            } else {
                showMessage('Login failed. Please try again.', 'signInMessage');
            }
        });
});
