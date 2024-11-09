function generateJobInputs() {
    const numJobs = parseInt(document.getElementById("numJobs").value);
    if (isNaN(numJobs) || numJobs <= 0) {
        alert("Please enter a valid number of jobs.");
        return;
    }

    const jobInputsDiv = document.getElementById("jobInputs");
    const jobDetailsDiv = document.getElementById("jobDetails");
    
    jobDetailsDiv.innerHTML = ""; // Clear previous job inputs
    jobInputsDiv.style.display = "block"; // Show job input section

    // Create input fields for each job in the table
    for (let i = 1; i <= numJobs; i++) {
        jobDetailsDiv.innerHTML += `
            <tr class="job-container">
                <td><input type="text" id="job${i}" placeholder="Job ID (e.g., J${i})" required></td>
                <td><input type="number" id="profit${i}" placeholder="Profit" min="1" required></td>
                <td><input type="number" id="deadline${i}" placeholder="Deadline" min="1" required></td>
            </tr>
        `;
    }
}

function calculateJobSequence() {
    const numJobs = parseInt(document.getElementById("numJobs").value);
    const jobs = [];

    // Collect job data
    for (let i = 1; i <= numJobs; i++) {
        const jobId = document.getElementById(`job${i}`).value;
        const profit = parseInt(document.getElementById(`profit${i}`).value);
        const deadline = parseInt(document.getElementById(`deadline${i}`).value);

        if (jobId && profit > 0 && deadline > 0) {
            jobs.push({ id: jobId, profit: profit, deadline: deadline });
        } else {
            alert(`Please fill out all fields for Job ${i} with valid values.`);
            return;
        }
    }

    // Sort jobs by profit in descending order
    jobs.sort((a, b) => b.profit - a.profit);

    const maxDeadline = Math.max(...jobs.map(job => job.deadline));
    const result = new Array(maxDeadline).fill(null);
    let totalProfit = 0;

    // Greedy method for job sequencing
    for (const job of jobs) {
        for (let j = job.deadline - 1; j >= 0; j--) {
            if (result[j] === null) {
                result[j] = job;
                totalProfit += job.profit;
                break;
            }
        }
    }

    // Display results
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<h2>Job Sequence:</h2><ul>";

    result.forEach((job, index) => {
        if (job) {
            resultDiv.innerHTML += `<li>Time Slot ${index + 1}: ${job.id} (Profit: ${job.profit})</li>`;
        } else {
            resultDiv.innerHTML += `<li>Time Slot ${index + 1}: Empty</li>`;
        }
    });

    resultDiv.innerHTML += `</ul><p>Total Profit: Php ${totalProfit}</p>`;
}
