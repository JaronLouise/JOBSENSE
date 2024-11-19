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
const quizHistoryBody = document.getElementById('quiz-history-body');


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


            // Fetch quiz history for the user
            await fetchQuizHistory(user.uid);


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




// Add this variable to store the quiz data globally
let quizData = [];


// Modified fetchQuizHistory function
async function fetchQuizHistory(userId) {
    try {
        quizHistoryBody.innerHTML = '';
       
        const quizHistorySnapshot = await db.collection('users')
            .doc(userId)
            .collection('quizScores')
            .get();


        if (!quizHistorySnapshot.empty) {
            // Store the quiz data globally
            quizData = quizHistorySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    level: data.level || 'N/A',
                    score: data.score,
                    timestamp: data.timestamp?.toDate() || new Date(0),
                    timestampString: data.timestamp?.toDate().toLocaleString() || 'N/A'
                };
            });


            // Initial sort by date
            sortAndDisplayQuizHistory('date');
        } else {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="3">No quiz history available</td>`;
            quizHistoryBody.appendChild(row);
        }
    } catch (error) {
        console.error('Error fetching quiz history:', error);
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="3">Error loading quiz history</td>`;
        quizHistoryBody.appendChild(row);
    }
}


// Add sorting functionality
function sortAndDisplayQuizHistory(sortBy) {
    const sortedData = [...quizData].sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return b.timestamp - a.timestamp;
            case 'level':
                const levelOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
                return levelOrder[a.level.toLowerCase()] - levelOrder[b.level.toLowerCase()];
            case 'score':
                return b.score - a.score;
            default:
                return 0;
        }
    });


    // Clear and repopulate the table
    quizHistoryBody.innerHTML = '';
    sortedData.forEach(data => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.level}</td>
            <td>${data.score}</td>
            <td>${data.timestampString}</td>
        `;
        quizHistoryBody.appendChild(row);
    });
}


// Add event listener for the sort dropdown
document.addEventListener('DOMContentLoaded', () => {
    const sortDropdown = document.getElementById('sort-by');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', (e) => {
            sortAndDisplayQuizHistory(e.target.value);
        });
    }
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


