import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyDW4YaKyRsrxYn6u-744MKAqALajS_BJeU",
    authDomain: "login-form-dd694.firebaseapp.com",
    projectId: "login-form-dd694",
    storageBucket: "login-form-dd694.firebasestorage.app",
    messagingSenderId: "600112311901",
    appId: "1:600112311901:web:f9c87eead4ff40584be7b4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Reference to the documents in Firestore
const docRef1 = doc(db, "quiz level", "easy", "Question 1", "Question 1");
const docRef2 = doc(db, "quiz level", "easy", "Question 2", "Question 2");
const docRef3 = doc(db, "quiz level", "easy", "Question 3", "Question 3");
const docRef4 = doc(db, "quiz level", "medium", "Question 1", "Question 1");
const docRef5 = doc(db, "quiz level", "medium", "Question 2", "Question 2");
const docRef6 = doc(db, "quiz level", "medium", "Question 3", "Question 3");
const docRef7 = doc(db, "quiz level", "hard", "Question 1", "Question 1");
const docRef8 = doc(db, "quiz level", "hard", "Question 2", "Question 2");
const docRef9 = doc(db, "quiz level", "hard", "Question 3", "Question 3");

async function displayData(docRef, elementId) {
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();

        // Format the data for display
        let formattedData = '';
        for (const [key, value] of Object.entries(data)) {
            formattedData += `<strong>${key}</strong>: ${value}<br>`;
        }

        // Display the formatted data in the HTML element
        document.getElementById(elementId).innerHTML = formattedData;
    } else {
        console.log("No such document!");
    }
}

// Call displayData for each document reference and display it in different elements
displayData(docRef1, 'data-container1');
displayData(docRef2, 'data-container2');
displayData(docRef3, 'data-container3');
displayData(docRef4, 'data-container4');
displayData(docRef5, 'data-container5');
displayData(docRef6, 'data-container6');
displayData(docRef7, 'data-container7');
displayData(docRef8, 'data-container8');
displayData(docRef9, 'data-container9');
