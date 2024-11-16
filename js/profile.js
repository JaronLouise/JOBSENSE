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
const editUsernameInput = document.getElementById('edit-username');
const editButton = document.getElementById('edit-button');
const saveButton = document.getElementById('save-button');
const emailElement = document.getElementById('email');
const logoutButton = document.getElementById('logout-button');

// Listen for authentication state changes
auth.onAuthStateChanged(async (user) => {
    if (user) {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                nameElement.textContent = userData.name || 'Not provided';
                usernameElement.textContent = userData.username || 'Not provided';
                editUsernameInput.value = userData.username || '';
                emailElement.textContent = user.email;
            } else {
                nameElement.textContent = 'User data not found';
                usernameElement.textContent = 'User data not found';
                emailElement.textContent = 'User data not found';
            }
        } catch (error) {
            console.error('Error retrieving user data:', error);
            nameElement.textContent = 'Error loading data';
            usernameElement.textContent = 'Error loading data';
            emailElement.textContent = 'Error loading data';
        }
    } else {
        window.location.href = 'login.html';
    }
});

// Edit button click handler
editButton.addEventListener('click', () => {
    editUsernameInput.style.display = 'inline-block';
    usernameElement.style.display = 'none';
    editButton.style.display = 'none';
    saveButton.style.display = 'inline-block';
});

// Save button click handler
saveButton.addEventListener('click', async () => {
    const newUsername = editUsernameInput.value.trim();
    if (auth.currentUser && newUsername) {
        try {
            await db.collection('users').doc(auth.currentUser.uid).update({ username: newUsername });
            usernameElement.textContent = newUsername;
            editUsernameInput.style.display = 'none';
            usernameElement.style.display = 'inline';
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
    auth.signOut().then(() => {
        console.log('User signed out');
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
});
