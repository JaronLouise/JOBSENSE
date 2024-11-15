// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyDW4YaKyRsrxYn6u-744MKAqALajS_BJeU",
    authDomain: "login-form-dd694.firebaseapp.com",
    projectId: "login-form-dd694",
    storageBucket: "login-form-dd694.appspot.com",
    messagingSenderId: "600112311901",
    appId: "1:600112311901:web:f9c87eead4ff40584be7b4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Get elements for displaying user profile
const usernameElement = document.getElementById('username');
const emailElement = document.getElementById('email');
const logoutButton = document.getElementById('logout-button');

// Listen for authentication state changes
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in, retrieve their profile info from Firestore
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                usernameElement.textContent = userData.username || 'Not provided';
                emailElement.textContent = user.email;
            } else {
                usernameElement.textContent = 'User data not found';
                emailElement.textContent = 'User data not found';
            }
        } catch (error) {
            console.error('Error retrieving user data:', error);
            usernameElement.textContent = 'Error loading data';
            emailElement.textContent = 'Error loading data';
        }
    } else {
        // User is not signed in, redirect to the login page
        window.location.href = 'login.html';
    }
});

// Logout button click handler
logoutButton.addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log('User signed out');
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
});
