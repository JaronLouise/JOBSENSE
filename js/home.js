// Load navbar.html content
document.addEventListener('DOMContentLoaded', () => {
    const navbarContainer = document.getElementById('navbar-container');
    fetch('navbar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            navbarContainer.innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading navbar:', error);
        });
});

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

// Detect user authentication and initialize the calendar
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
                // Display user name in the welcome message
                document.querySelector('#welcome-message').innerHTML = `Welcome <span class="username">${username}!</span>`;

                // Fetch and display the streak data
                await fetchStreakData(user);

                // Initialize the calendar for the authenticated user
                const calendar = new Calendar(user);
                calendar.renderCalendar();
            } else {
                console.warn("User document not found in Firestore.");
                document.querySelector('#welcome-message').textContent = "Welcome!";
            }
        } catch (error) {
            console.error("Error fetching user data from Firestore:", error);
        }
    } else {
        console.warn("No user is signed in.");
    }
});

// Function to fetch and display streak data
async function fetchStreakData(user) {
    const streakRef = doc(db, 'streaks', user.uid);

    try {
        const streakDoc = await getDoc(streakRef);
        if (streakDoc.exists()) {
            const streakData = streakDoc.data();
            const currentStreak = streakData.currentStreak || 0;
            const bestStreak = streakData.bestStreak || 0;

            // Update the streak display with "day" or "days" based on the value
            document.getElementById('currentStreak').textContent = `${currentStreak} ${getDayWord(currentStreak)}`;
            document.getElementById('bestStreak').textContent = `${bestStreak} ${getDayWord(bestStreak)}`;

            console.log("Current streak:", currentStreak);
            console.log("Best streak:", bestStreak);
        } else {
            console.warn("Streak document not found in Firestore.");
        }
    } catch (error) {
        console.error("Error fetching streak data:", error);
    }
}

// Function to determine whether to use "day" or "days"
function getDayWord(streakCount) {
    return streakCount === 1 ? 'day' : 'days';
}

// Calendar class for rendering and tracking completed dates
class Calendar {
    constructor(user) {
        this.user = user;
        this.date = new Date();
        this.currentMonth = this.date.getMonth();
        this.currentYear = this.date.getFullYear();
        this.currentDay = this.date.getDate();
        this.months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        this.init();
    }

    init() {
        // Get DOM elements
        this.monthDisplay = document.getElementById('monthDisplay');
        this.calendarGrid = document.querySelector('.calendar-grid');
        this.prevButton = document.getElementById('prevMonth');
        this.nextButton = document.getElementById('nextMonth');

        // Add event listeners for month navigation
        this.prevButton.addEventListener('click', () => this.changeMonth(-1));
        this.nextButton.addEventListener('click', () => this.changeMonth(1));
    }

    async renderCalendar() {
        // Clear previous dates
        this.calendarGrid.innerHTML = '';

        // Set month and year in header
        this.monthDisplay.textContent = `${this.months[this.currentMonth]} ${this.currentYear}`;

        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'weekday';
            dayHeader.textContent = day;
            this.calendarGrid.appendChild(dayHeader);
        });
        
        // Get first day of the month and total days
        const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

        // Fetch completed quiz dates
        const completedDates = await this.getCompletedDates();

        // Add blank spaces for days before the start of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            const blankDay = document.createElement('div');
            blankDay.className = 'date empty';
            this.calendarGrid.appendChild(blankDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'date';
            dateDiv.textContent = day;

            // Format date as YYYY-MM-DD
            const dateString = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Logic for highlighting completed dates and the current day
            if (completedDates.includes(dateString)) {
                if (
                    day === this.currentDay &&
                    this.currentMonth === new Date().getMonth() &&
                    this.currentYear === new Date().getFullYear()
                ) {
                    // Highlight today's completed date in blue
                    dateDiv.classList.add('completed-today');
                    dateDiv.style.backgroundColor = '#56bf56';
                    dateDiv.style.color = 'white';
                } else {
                    // Highlight other completed dates in green
                    dateDiv.classList.add('completed');
                    dateDiv.style.backgroundColor = 'green';
                    dateDiv.style.color = 'white';
                }
            } else if (
                day === this.currentDay &&
                this.currentMonth === new Date().getMonth() &&
                this.currentYear === new Date().getFullYear()
            ) {
                // Highlight today's date without red outline
                dateDiv.classList.add('current');
                dateDiv.style.backgroundColor = 'lightgray';
                dateDiv.style.color = 'black';
            }

            this.calendarGrid.appendChild(dateDiv);
        }
    }

    async getCompletedDates() {
        try {
            const streakRef = doc(db, 'streaks', this.user.uid);
            const streakDoc = await getDoc(streakRef);

            if (streakDoc.exists()) {
                const streakData = streakDoc.data();
                const completedDatesMap = streakData.completedDates || {};

                // Return keys where value is true
                return Object.keys(completedDatesMap).filter(date => completedDatesMap[date]);
            } else {
                console.warn("No streak document found for the user.");
                return [];
            }
        } catch (error) {
            console.error("Error fetching completed dates:", error);
            return [];
        }
    }

    changeMonth(direction) {
        this.currentMonth += direction;

        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }

        this.renderCalendar();
    }
}
