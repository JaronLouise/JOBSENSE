import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getFirestore, collection, doc, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
// Firebase configuration
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
const db = getFirestore(app);
const auth = getAuth(app);

let currentUserId = null;
let currentQuestionIndex = 0;
let currentScore = 0;
let selectedDifficulty = 'easy';

// Monitor auth state to get the current user's ID
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        console.log("User logged in:", currentUserId);
    } else {
        console.log("No user logged in");
        // Handle cases where the user is not logged in (redirect or show login prompt)
    }
});

// Load quiz based on selected difficulty
function loadQuiz(level) {
    selectedDifficulty = level;
    currentQuestionIndex = 0;
    currentScore = 0;
    document.getElementById('result').innerText = '';  // Clear previous result
    document.getElementById('level-selection').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    loadQuestion();
}

window.loadQuiz = loadQuiz;
window.checkAnswer = checkAnswer;


// Function to save quiz score to Firestore
function saveScoreToFirebase(score, level) {
    if (!currentUserId) {
        console.error("User not logged in. Cannot save score.");
        return;
    }

    const userRef = doc(db, "users", currentUserId);

    // Add quiz score to a new subcollection "quizScores" under the user document
    addDoc(collection(userRef, "quizScores"), {
        level: level,
        score: score,
        timestamp: serverTimestamp()
    })
    .then(() => {
        console.log("Score saved successfully!");
    })
    .catch((error) => {
        console.error("Error saving score: ", error);
    });
}
// Quiz data structure (easy, medium, hard)
const quizData = {
    easy: [
        {
            question: 'Easy - Question 1',
            jobs: [
                { name: 'Job A', details: '(Profit: $20, Deadline: 2)' },
                { name: 'Job B', details: '(Profit: $15, Deadline: 1)' },
                { name: 'Job C', details: '(Profit: $10, Deadline: 2)' }
            ],
            correctSequence: ['Job B', 'Job A']
        },
        {
            question: 'Easy - Question 2',
            jobs: [
                { name: 'Job A', details: '(Profit: $30, Deadline: 2)' },
                { name: 'Job B', details: '(Profit: $25, Deadline: 1)' },
                { name: 'Job C', details: '(Profit: $5, Deadline: 2)' }
            ],
            correctSequence: ['Job B', 'Job A']
        },
        {
            question: 'Easy - Question 3',
            jobs: [
                { name: 'Job A', details: '(Profit: $15, Deadline: 1)' },
                { name: 'Job B', details: '(Profit: $40, Deadline: 2)' },
                { name: 'Job C', details: '(Profit: $10, Deadline: 2)' }
            ],
            correctSequence: ['Job A', 'Job B']
        }
    ],
    medium: [
        {
            question: 'Medium - Question 1',
            jobs: [
                { name: 'Job A', details: '(Profit: $50, Deadline: 3)' },
                { name: 'Job B', details: '(Profit: $20, Deadline: 1)' },
                { name: 'Job C', details: '(Profit: $40, Deadline: 2)' },
                { name: 'Job D', details: '(Profit: $30, Deadline: 2)' }
            ],
            correctSequence: ['Job D', 'Job C', 'Job A']
        },
        {
            question: 'Medium - Question 2',
            jobs: [
                { name: 'Job A', details: '(Profit: $45, Deadline: 2)' },
                { name: 'Job B', details: '(Profit: $10, Deadline: 1)' },
                { name: 'Job C', details: '(Profit: $20, Deadline: 2)' },
                { name: 'Job D', details: '(Profit: $35, Deadline: 3)' }
            ],
            correctSequence: ['Job C', 'Job A', 'Job D']
        },
        {
            question: 'Medium - Question 3',
            jobs: [
                { name: 'Job A', details: '(Profit: $60, Deadline: 3)' },
                { name: 'Job B', details: '(Profit: $30, Deadline: 2)' },
                { name: 'Job C', details: '(Profit: $50, Deadline: 2)' },
                { name: 'Job D', details: '(Profit: $25, Deadline: 1)' }
            ],
            correctSequence: ['Job B', 'Job C', 'Job A']
        }
    ],
    hard: [
        {
            question: 'Hard - Question 1',
            jobs: [
                { name: 'Job A', details: '(Profit: $70, Deadline: 4)' },
                { name: 'Job B', details: '(Profit: $20, Deadline: 1)' },
                { name: 'Job C', details: '(Profit: $50, Deadline: 3)' },
                { name: 'Job D', details: '(Profit: $30, Deadline: 2)' },
                { name: 'Job E', details: '(Profit: $40, Deadline: 2)' }
            ],
            correctSequence: ['Job D', 'Job E', 'Job C', 'Job A']
        },
        {
            question: 'Hard - Question 2',
            jobs: [
                { name: 'Job A', details: '(Profit: $100, Deadline: 4)' },
                { name: 'Job B', details: '(Profit: $45, Deadline: 3)' },
                { name: 'Job C', details: '(Profit: $25, Deadline: 1)' },
                { name: 'Job D', details: '(Profit: $60, Deadline: 2)' },
                { name: 'Job E', details: '(Profit: $35, Deadline: 2)' }
            ],
            correctSequence: ['Job E', 'Job D', 'Job B', 'Job A']
        },
        {
            question: 'Hard - Question 3',
            jobs: [
                { name: 'Job A', details: '(Profit: $20, Deadline: 2)' },
                { name: 'Job B', details: '(Profit: $55, Deadline: 3)' },
                { name: 'Job C', details: '(Profit: $40, Deadline: 1)' },
                { name: 'Job D', details: '(Profit: $75, Deadline: 4)' },
                { name: 'Job E', details: '(Profit: $90, Deadline: 4)' }
            ],
            correctSequence: ['Job C', 'Job B', 'Job D', 'Job E']
        }
    ]
};

// Load the current question and jobs
function loadQuestion() {
    const currentQuestion = quizData[selectedDifficulty][currentQuestionIndex];
    document.getElementById('quiz-title').innerText = currentQuestion.question;
    createJobList(currentQuestion.jobs);
    createAnswerContainer();
}

// Create the list of jobs dynamically
function createJobList(jobs) {
    const jobListContainer = document.getElementById('job-list');
    jobListContainer.innerHTML = '';

    jobs.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.classList.add('job');
        jobElement.draggable = true;
        jobElement.innerText = `${job.name} ${job.details}`;
        jobElement.dataset.name = job.name;

        jobElement.addEventListener('dragstart', () => {
            jobElement.classList.add('dragging');
        });

        jobElement.addEventListener('dragend', () => {
            jobElement.classList.remove('dragging');
        });

        jobListContainer.appendChild(jobElement);
    });

    enableDragAndDrop();
}

// Create answer container for drag-and-drop
function createAnswerContainer() {
    const answerContainer = document.getElementById('answer-container');
    answerContainer.innerHTML = '';
}

function enableDragAndDrop() {
    const jobList = document.getElementById('job-list');
    const answerContainer = document.getElementById('answer-container');

    jobList.addEventListener('dragover', e => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(jobList, e.clientX);
        if (afterElement == null) {
            jobList.appendChild(draggingElement);
        } else {
            jobList.insertBefore(draggingElement, afterElement);
        }
    });

    answerContainer.addEventListener('dragover', e => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        answerContainer.appendChild(draggingElement);
    });
}

function getDragAfterElement(container, x) {
    const elements = [...container.querySelectorAll('.job:not(.dragging)')];
    return elements.reduce(
        (closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        },
        { offset: Number.NEGATIVE_INFINITY }
    ).element;
}

// Check the answer after the user arranges jobs
function checkAnswer() {
    const answerContainer = document.getElementById('answer-container');
    const selectedSequence = [...answerContainer.querySelectorAll('.job')].map(job => job.dataset.name);

    const currentQuestion = quizData[selectedDifficulty][currentQuestionIndex];
    const resultElement = document.getElementById('result');
    if (selectedSequence.length === currentQuestion.correctSequence.length) {
        const isCorrect = JSON.stringify(selectedSequence) === JSON.stringify(currentQuestion.correctSequence);
        document.getElementById('result').innerText = isCorrect ? 'Correct!' : 'Incorrect. Try again!';
        if (isCorrect) currentScore++;

        setTimeout(() => {
            resultElement.innerText = '';
            nextQuestion();
        }, 2000);
    } else {
        document.getElementById('result').innerText = "Please arrange all jobs.";
    }
}

// Proceed to the next question or show final result
function nextQuestion() {
    currentQuestionIndex++;
    const currentLevelData = quizData[selectedDifficulty];
    if (currentQuestionIndex < currentLevelData.length) {
        loadQuestion();
    } else {
        document.getElementById('result').innerText = `Your total score: ${currentScore}`;
        // Save the score to Firebase after quiz completion
        saveScoreToFirebase(currentScore, selectedDifficulty);
        setTimeout(() => {
            document.getElementById('quiz-container').style.display = 'none';
            document.getElementById('level-selection').style.display = 'block';
        }, 3000);
    }
}

// Assuming the quiz.js has the following setup
document.getElementById('reset-button').addEventListener('click', function() {
    // Get the answer container and job list container
    const answerContainer = document.getElementById('answer-container');
    const jobList = document.getElementById('job-list');

    // Move all jobs from answer-container back to job-list
    while (answerContainer.firstChild) {
        jobList.appendChild(answerContainer.firstChild);
    }
});
