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


// Get elements for displaying and editing user profile
const nameElement = document.getElementById('name');
const usernameElement = document.getElementById('username');
const editButton = document.getElementById('edit-button');
const saveButton = document.getElementById('save-button');
const emailElement = document.getElementById('email');
const logoutButton = document.getElementById('logout-button');


// Listen for authentication state changes
auth.onAuthStateChanged(async (user) => {
    if (user) { // If a user is authenticated
        try {
            // Fetch the user document from the Firestore database
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data(); // Retrieve user data


                // Display fetched data on the profile page
                nameElement.value = userData.name || 'Not provided';
                usernameElement.value = userData.username || 'Not provided';
                emailElement.value = user.email; // Email comes from Firebase Authentication
            } else {
                // If user document is missing
                nameElement.value = 'User data not found';
                usernameElement.value = 'User data not found';
                emailElement.value = 'User data not found';
            }
        } catch (error) {
            // Handle errors during Firestore fetch
            console.error('Error retrieving user data:', error);
            nameElement.value = 'Error loading data';
            usernameElement.value = 'Error loading data';
            emailElement.value = 'Error loading data';
        }
    } else {
        // Redirect unauthenticated users to the login page
        window.location.href = 'login.html';
    }
});


// Enable editing for username
editButton.addEventListener('click', () => {
    usernameElement.removeAttribute('readonly');
    editButton.style.display = 'none';
    saveButton.style.display = 'inline-block';
});


// Save the updated username to Firestore
saveButton.addEventListener('click', async () => {
    const newUsername = usernameElement.value.trim();
    if (auth.currentUser && newUsername) {
        try {
            // Save the updated username to Firestore
            await db.collection('users').doc(auth.currentUser.uid).update({ username: newUsername });


            // Show success alert
            alert('Username has been updated successfully!');


            // Disable editing
            usernameElement.setAttribute('readonly', true);
            editButton.style.display = 'inline-block';
            saveButton.style.display = 'none';
            console.log('Username updated successfully');
        } catch (error) {
            console.error('Error updating username:', error);
            alert('Failed to update username');
        }
    } else {
        alert('Username cannot be empty');
    }
});


// Logout button click handler
logoutButton.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            console.log('User signed out');
            window.location.href = 'login.html';
        })
        .catch((error) => {
            console.error('Error signing out:', error);
        });
});


