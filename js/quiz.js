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

async function checkAnswer() {
    const answerContainer = document.getElementById('answer-container');
    const selectedSequence = [...answerContainer.querySelectorAll('.job')].map(job => job.dataset.name);
    const currentQuestion = questions[currentQuestionIndex];

    console.log('Selected Sequence:', selectedSequence);
    console.log('Correct Sequence:', currentQuestion.correctSequence);

    if (JSON.stringify(selectedSequence) === JSON.stringify(currentQuestion.correctSequence)) {
        document.getElementById('result').innerText = 'Correct!';
        currentScore++;
    } else {
        document.getElementById('result').innerText = 'Incorrect. Try again!';
    }

    setTimeout(() => {
        document.getElementById('result').innerText = '';
        answerContainer.innerHTML = '';
        nextQuestion();
    }, 2000);
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

async function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion(questions[currentQuestionIndex]);
    } else {
        document.getElementById('total-score').innerText = currentScore;
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('final-score').style.display = 'block';
        saveScoreToFirebase(currentScore, selectedDifficulty);
    }
}
