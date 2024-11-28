// Show the tutorial popup when the page loads
window.addEventListener('load', () => {
    const tutorialPopup = document.getElementById('tutorial-popup');
    const skipButton = document.getElementById('skip-tutorial');
    const closeButton = document.getElementById('close-tutorial');  // Get the close button


    console.log(tutorialPopup, skipButton, closeButton);  // Debugging line to check if elements are found


    // Display the tutorial popup
    tutorialPopup.style.display = 'flex';


    // Close the tutorial when the close button (X) is clicked
    closeButton.addEventListener('click', () => {
        console.log('Close button clicked');  // Debugging line to check if event triggers
        tutorialPopup.style.display = 'none';
    });
});


// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyDW4YaKyRsrxYn6u-744MKAqALajS_BJeU",
    authDomain: "login-form-dd694.firebaseapp.com",
    projectId: "login-form-dd694",
    storageBucket: "login-form-dd694.firebasestorage.app",
    messagingSenderId: "600112311901",
    appId: "1:600112311901:web:f9c87eead4ff40584be7b4"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();




let currentUserId = null;
let currentQuestionIndex = 0;
let currentScore = 0;
let selectedDifficulty = 'easy';
let questions = [];


// Monitor auth state to get the current user's ID
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUserId = user.uid;
        console.log("User logged in:", currentUserId);
    } else {
        console.log("No user logged in");
    }
});


async function loadQuiz(difficulty) {
    selectedDifficulty = difficulty;
    currentQuestionIndex = 0;
    currentScore = 0;
    document.getElementById('level-selection').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';


    // Load questions from Firestore based on selected difficulty
    questions = await fetchQuestions(difficulty);
    if (questions.length > 0) {
        displayQuestion(questions[currentQuestionIndex]);
    } else {
        console.error("No questions found for this level.");
        document.getElementById('quiz-title').innerText = "No questions available for this level.";
    }
}


async function fetchQuestions(difficulty) {
    const questions = [];
    try {
        // Access the subcollection of the selected difficulty within the 'quizLevels' collection
        const querySnapshot = await db.collection('quizLevel').doc(difficulty).collection('questions').get();


        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Push each question to the questions array
                questions.push({
                    title: doc.id, // Using document ID as the title (e.g., "Question 1")
                    problem: data.problem, // Problem description
                    jobs: parseJobs(data.jobs), // Parse the jobs object
                    correctSequence: parseCorrectSequence(data.correctSequence)
                });
            });
        } else {
            console.error("No questions found for the given difficulty.");
        }
    } catch (error) {
        console.error("Error fetching questions:", error);
    }
    return questions;
}


function parseJobs(jobsString) {
    console.log('Jobs string from Firestore:', jobsString); // Log the raw jobs string


    // Check if jobsString is defined and not empty
    if (!jobsString || typeof jobsString !== 'string') {
        console.error('Invalid jobs string:', jobsString);
        return [];
    }


    // Split the string by commas and trim whitespace
    const jobList = jobsString.split(',').map(job => job.trim());


    // Log the parsed jobs to verify
    console.log('Parsed Jobs:', jobList);
    return jobList; // Return an array of job names
}
function parseCorrectSequence(sequenceString) {
    if (!sequenceString || typeof sequenceString !== 'string') {
        console.error('Invalid correct sequence:', sequenceString);
        return [];
    }
    // Split the string by commas and trim whitespace to create an array
    return sequenceString.split(',').map(job => job.trim());
}
function createJobList(jobs) {
    const jobListContainer = document.getElementById('job-list');
    jobListContainer.innerHTML = ''; // Clear previous content
    console.log('Jobs for current question:', jobs); // Log jobs for current question
    // Iterate over the job names and create divs for each
    jobs.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.classList.add('job');
        jobElement.draggable = true;
        // Display only the job name
        jobElement.innerText = job; // Display job name directly
        jobElement.dataset.name = job; // Set job name as a data attribute
        // Add event listeners for drag and drop
        jobElement.addEventListener('dragstart', () => {
            jobElement.classList.add('dragging');
        });
        jobElement.addEventListener('dragend', () => {
            jobElement.classList.remove('dragging');
        });
        // Append the job element to the container
        jobListContainer.appendChild(jobElement);
    });
    enableDragAndDrop(); // Enable drag-and-drop functionality
}


function displayQuestion(question) {
    document.getElementById('quiz-title').innerText = question.title;
    document.getElementById('problem-window').innerText = question.problem; // Display problem description


    // Clear the answer container when displaying a new question
    const answerContainer = document.getElementById('answer-container');
    answerContainer.innerHTML = '';


    createJobList(question.jobs); // This will show only the jobs for the current question
}


function enableDragAndDrop() {
    const jobList = document.getElementById('job-list');
    const answerContainer = document.getElementById('answer-container');


    jobList.addEventListener('dragover', e => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        jobList.appendChild(draggingElement);
    });


    answerContainer.addEventListener('dragover', e => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        answerContainer.appendChild(draggingElement);
    });
}


function saveScoreToFirebase(score, level) {
    if (!currentUserId) return;


    db.collection('users').doc(currentUserId).collection('quizScores').add({
        level: level,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}


// Helper function to format the date as 'YYYY-MM-DD'
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// Helper function to check if two dates are consecutive
function isDateConsecutive(lastDateString, currentDateString) {
    const lastDate = new Date(lastDateString);
    const currentDate = new Date(currentDateString);


    // Difference in days
    const differenceInDays = Math.ceil((currentDate - lastDate) / (1000 * 60 * 60 * 24));
    return differenceInDays === 1;
}


async function handleQuizCompletion() {
    const user = auth.currentUser;
    if (!user) {
        console.error("No authenticated user");
        return;
    }


    const currentDate = new Date();
    const dateString = formatDateToLocalTimezone(currentDate); // Format as 'YYYY-MM-DD'


    console.log("Current date string:", dateString);


    const streakRef = db.collection('streaks').doc(user.uid);


    try {
        const streakDoc = await streakRef.get();
        let streakData = streakDoc.exists
            ? streakDoc.data()
            : { completedDates: {}, currentStreak: 0, bestStreak: 0, lastCompleted: null };


        console.log("Fetched streak data:", streakData);


        const completedDates = streakData.completedDates || {};


        // Check if the current date is already recorded
        if (completedDates[dateString]) {
            console.log("Quiz already completed for today. Streak unchanged.");
            return; // Exit the function without making changes
        }


        // Get the last completed date
        const lastCompletedDate = streakData.lastCompleted;


        console.log("Last completed date:", lastCompletedDate);


        // Determine if the streak should be incremented or reset
        let isConsecutive = false;
        if (lastCompletedDate) {
            isConsecutive = isDateConsecutive(lastCompletedDate, dateString);
        }


        console.log("Is date consecutive:", isConsecutive);


        if (isConsecutive) {
            streakData.currentStreak += 1;
        } else {
            streakData.currentStreak = 1; // Reset streak if not consecutive
        }


        // Update best streak
        streakData.bestStreak = Math.max(streakData.currentStreak, streakData.bestStreak);


        // Mark the current date as completed
        completedDates[dateString] = true;


        // Update `lastCompleted` explicitly
        streakData.lastCompleted = dateString;


        console.log("Updated streak data:", {
            completedDates,
            currentStreak: streakData.currentStreak,
            bestStreak: streakData.bestStreak,
            lastCompleted: streakData.lastCompleted,
        });


        // Save the updated streak data to Firestore
        await streakRef.set({
            completedDates,
            currentStreak: streakData.currentStreak,
            bestStreak: streakData.bestStreak,
            lastCompleted: streakData.lastCompleted, // Explicitly include `lastCompleted`
        }, { merge: true });


        console.log("Streak updated successfully");


    } catch (error) {
        console.error("Error updating streak data:", error);
    }
}




// Helper function to check if dates are consecutive
function isDateConsecutive(lastDateString, currentDateString) {
    const lastDate = new Date(lastDateString);
    const currentDate = new Date(currentDateString);


    // Difference in days
    const differenceInDays = Math.ceil((currentDate - lastDate) / (1000 * 60 * 60 * 24));
    return differenceInDays === 1;
}


function formatDateToLocalTimezone(date) {
    // Get the local date as 'YYYY-MM-DD'
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return localDate.toISOString().split('T')[0];
}




// Function to check the answer
async function checkAnswer() {
    const answerContainer = document.getElementById('answer-container');
    const selectedSequence = [...answerContainer.querySelectorAll('.job')].map(job => job.dataset.name);
    const currentQuestion = questions[currentQuestionIndex];


    // Check if the answer container is empty (no jobs inside)
    if (answerContainer.children.length === 0) {
        alert("Please place your answer in the container before checking!");
        return;  // Exit the function without checking the answer
    }


    console.log('Selected Sequence:', selectedSequence);
    console.log('Correct Sequence:', currentQuestion.correctSequence);


    if (JSON.stringify(selectedSequence) === JSON.stringify(currentQuestion.correctSequence)) {
        document.getElementById('result').innerText = 'Correct!';
        currentScore++;
    } else {
        // Display the correct sequence as an alert if the answer is incorrect
        alert(`Incorrect! The correct sequence is: ${currentQuestion.correctSequence.join(', ')}`);
        document.getElementById('result').innerText = 'Incorrect. Try again!';
    }


    // Reset the answer container and move to the next question after a short delay
    setTimeout(() => {
        document.getElementById('result').innerText = '';
        answerContainer.innerHTML = '';
        nextQuestion();
    }, 2000);
}


// Reset button functionality
document.getElementById('reset-button').addEventListener('click', function() {
    // Get the answer container and job list container
    const answerContainer = document.getElementById('answer-container');
    const jobList = document.getElementById('job-list');


    // Move all jobs from answer-container back to job-list
    while (answerContainer.firstChild) {
        jobList.appendChild(answerContainer.firstChild);
    }
});


async function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion(questions[currentQuestionIndex]);
    } else {
        document.getElementById('total-score').innerText = currentScore;
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('final-score').style.display = 'block';
        saveScoreToFirebase(currentScore, selectedDifficulty);
        await handleQuizCompletion(); // Update streak after quiz completion


        // Display a custom feedback message based on the final score
        let feedbackMessage = '';
        if (currentScore === 3) {
            feedbackMessage = "Perfect! You aced the quiz!";
        } else if (currentScore === 2) {
            feedbackMessage = "Almost there! Great effort!";
        } else if (currentScore === 1) {
            feedbackMessage = "Try again next time! Don't give up, practice makes perfect.";
        } else {
            feedbackMessage = "Keep practicing and you'll get better!";
        }


        // Display the feedback message in the 'feedback-message' element
        const feedbackElement = document.getElementById('feedback-message');
        if (feedbackElement) {
            feedbackElement.innerText = feedbackMessage; // Update feedback message
        } else {
            console.error("'feedback-message' element not found in the DOM.");
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const backgroundMusic = document.getElementById('background-music');
    const correctSound = document.getElementById('correct-sound');
    const incorrectSound = document.getElementById('incorrect-sound');

    // Set volumes
    backgroundMusic.volume = 0.1; // Lower background music to 10%
    correctSound.volume = 0.5; // Set correct sound to 50%
    incorrectSound.volume = 0.5; // Set incorrect sound to 50%

    // Create music toggle button
    const musicToggleBtn = document.createElement('button');
    musicToggleBtn.textContent = '🎵 Music: On';
    musicToggleBtn.style.position = 'fixed';
    musicToggleBtn.style.bottom = '20px';
    musicToggleBtn.style.right = '20px';
    musicToggleBtn.style.zIndex = '1000';
    musicToggleBtn.style.padding = '10px';
    musicToggleBtn.style.borderRadius = '5px';

    // Music toggle functionality
    musicToggleBtn.addEventListener('click', () => {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
            musicToggleBtn.textContent = '🎵 Music: On';
        } else {
            backgroundMusic.pause();
            musicToggleBtn.textContent = '🎵 Music: Off';
        }
    });
    document.body.appendChild(musicToggleBtn);

    // Modify existing loadQuiz function to start music
    const originalLoadQuiz = loadQuiz;
    loadQuiz = async function(difficulty) {
        // Try to play background music when quiz starts
        try {
            backgroundMusic.play();
        } catch (error) {
            console.log('Autoplay was prevented. User interaction required.');
        }
        
        // Call the original loadQuiz function
        return originalLoadQuiz(difficulty);
    };

    // Modify checkAnswer function to add sound effects
    const originalCheckAnswer = checkAnswer;
    checkAnswer = async function() {
        const answerContainer = document.getElementById('answer-container');
        const selectedSequence = [...answerContainer.querySelectorAll('.job')].map(job => job.dataset.name);
        const currentQuestion = questions[currentQuestionIndex];

        // Check if the answer container is empty (no jobs inside)
        if (answerContainer.children.length === 0) {
            alert("Please place your answer in the container before checking!");
            return;  // Exit the function without checking the answer
        }

        if (JSON.stringify(selectedSequence) === JSON.stringify(currentQuestion.correctSequence)) {
            // Play correct sound
            correctSound.play().catch(error => {
                console.error('Error playing correct sound:', error);
            });

            document.getElementById('result').innerText = 'Correct!';
        } else {
            // Play incorrect sound
            incorrectSound.play().catch(error => {
                console.error('Error playing incorrect sound:', error);
            });
        }

        // Call the original checkAnswer logic
        return originalCheckAnswer();
    };

    // Modify nextQuestion to stop music when quiz ends
    const originalNextQuestion = nextQuestion;
    nextQuestion = async function() {
        // Call the original nextQuestion function first
        await originalNextQuestion();

        // If quiz is completed, stop the background music
        if (currentQuestionIndex >= questions.length) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
    };
});
