function generateJobInputs() {
    const numJobs = parseInt(document.getElementById("numJobs").value);
    if (isNaN(numJobs) || numJobs <= 0) {
        alert("Please enter a valid number of jobs.");
        return;
    }

    const jobInputsDiv = document.getElementById("jobInputs");
    const jobDetailsDiv = document.getElementById("jobDetails");
    
    jobDetailsDiv.innerHTML = "";
    jobInputsDiv.style.display = "block";

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

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function calculateJobSequence() {
    const jobRows = document.querySelectorAll('#jobDetails tr');
    const jobs = [];
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<h2>Job Sequencing Steps:</h2>";

    // Iterate over each row and get job data
    jobRows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input');
        const jobId = inputs[0].value;
        const profit = parseInt(inputs[1].value);
        const deadline = parseInt(inputs[2].value);

        if (jobId && profit > 0 && deadline > 0) {
            jobs.push({ id: jobId, profit: profit, deadline: deadline });
        } else {
            alert(`Please fill out all fields for Job ${index + 1} with valid values.`);
            return;
        }
    });

    if (jobs.length === 0) {
        alert("No valid job data provided.");
        return;
    }

    // Sort jobs by profit in descending order
    jobs.sort((a, b) => b.profit - a.profit);
    const maxDeadline = Math.max(...jobs.map(job => job.deadline));
    const result = new Array(maxDeadline).fill(null);
    let totalProfit = 0;
    let stepCount = 1;

    // Process each job with visualization
    for (const job of jobs) {
        resultDiv.innerHTML += `
            <div class="step-explanation">
                <h3>Step ${stepCount}: Processing ${job.id}</h3>
                <p>Profit: ${job.profit}, Deadline: ${job.deadline}</p>
            </div>
        `;

        // Show current timeline before assignment
        await visualizeTimelineStep(result, maxDeadline, null, resultDiv);
        await sleep(1000);

        let slotFound = false;
        for (let j = job.deadline - 1; j >= 0; j--) {
            if (result[j] === null) {
                resultDiv.innerHTML += `
                    <p>The last empty slot available for ${job.id} before deadline is slot ${j}-${j + 1}</p>
                `;
                result[j] = job;
                totalProfit += job.profit;
                slotFound = true;

                // Show updated timeline after assignment
                await visualizeTimelineStep(result, maxDeadline, j, resultDiv);
                await sleep(1000);
                break;
            }
        }

        if (!slotFound) {
            resultDiv.innerHTML += `
                <p>No available slot found for ${job.id} before its deadline</p>
            `;
        }

        stepCount++;
    }

    // Display final sequence and total profit
    resultDiv.innerHTML += `
        <div class="final-result">
            <h3>Final Job Sequence</h3>
            <p>All the slots are filled. The sequence of jobs is: ${result.map(job => job ? job.id : 'Empty').join(' ')}</p>
            <p>Total Profit: Php ${totalProfit}</p>
        </div>
    `;
}


async function visualizeTimelineStep(result, maxDeadline, highlightSlot, container) {
    const timelineDiv = document.createElement('div');
    timelineDiv.className = 'timeline-step';
    timelineDiv.style.marginBottom = '30px';
    
    // Create job slots container
    const slotsDiv = document.createElement('div');
    slotsDiv.className = 'slot-container';
    slotsDiv.style.display = 'flex';
    slotsDiv.style.paddingLeft = '20px';
    
    // Constants for spacing
    const slotWidth = 80;
    const lineWidth = 120; // Increased line width
    
    // Add initial empty container before first job slot
    const initialContainer = document.createElement('div');
    initialContainer.className = 'slot-wrapper';
    initialContainer.style.position = 'relative';
    initialContainer.style.display = 'flex';
    initialContainer.style.alignItems = 'center';
    
    const initialSlot = document.createElement('div');
    initialSlot.className = 'slot';
    initialSlot.style.width = `${slotWidth}px`;
    initialSlot.style.height = '40px';
    initialSlot.style.backgroundColor = '#f8f8f8';
    initialSlot.style.border = '1px dashed #ccc';
    initialSlot.style.borderRadius = '4px';
    
    initialContainer.appendChild(initialSlot);
    
    // Add connection line after initial container
    const initialLine = document.createElement('div');
    initialLine.className = 'connection-line';
    initialLine.style.width = `${lineWidth}px`;
    initialLine.style.height = '2px';
    initialLine.style.backgroundColor = '#ffa726';
    initialContainer.appendChild(initialLine);
    
    // Add the number for this line (0-1) above the connection line
    const initialNumber = document.createElement('div');
    initialNumber.className = 'slot-number';
    initialNumber.textContent = '0-1'; // Format as 0-1
    initialNumber.style.position = 'absolute';
    initialNumber.style.top = '-20px'; // Adjust as needed to position it above the line
    initialNumber.style.left = '50%';
    initialNumber.style.transform = 'translateX(-50%)';
    initialContainer.appendChild(initialNumber);
    
    slotsDiv.appendChild(initialContainer);
    
    // Create job slots with connection lines and numbers above them
    for (let i = 0; i < maxDeadline; i++) {
        const slotWrapper = document.createElement('div');
        slotWrapper.className = 'slot-wrapper';
        slotWrapper.style.position = 'relative';
        slotWrapper.style.display = 'flex';
        slotWrapper.style.alignItems = 'center';
        
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.style.width = `${slotWidth}px`;
        slot.style.height = '40px';
        slot.style.display = 'flex';
        slot.style.justifyContent = 'center';
        slot.style.alignItems = 'center';
        slot.style.borderRadius = '4px';
        
        if (result[i]) {
            slot.style.backgroundColor = '#a8e6ff';
            slot.textContent = result[i].id;
        } else {
            slot.style.backgroundColor = '#eee';
        }
        
        if (i === highlightSlot) {
            slot.style.backgroundColor = '#4fc3f7';
            slot.style.color = 'white';
        }
        
        slotWrapper.appendChild(slot);
        
        // Add connection line if not the last slot
        if (i < maxDeadline - 1) {
            const line = document.createElement('div');
            line.className = 'connection-line';
            line.style.width = `${lineWidth}px`; // Using increased line width
            line.style.height = '2px';
            line.style.backgroundColor = '#ffa726';
            slotWrapper.appendChild(line);
            
            // Add number above the connection line (e.g., 1-2)
            const lineNumber = document.createElement('div');
            lineNumber.className = 'slot-number';
            lineNumber.textContent = `${i + 1}-${i + 2}`; // Format as X-Y
            lineNumber.style.position = 'absolute';
            lineNumber.style.top = '-20px'; // Adjust as needed to position it above the line
            lineNumber.style.left = '50%';
            lineNumber.style.transform = 'translateX(-50%)';
            slotWrapper.appendChild(lineNumber);
        }
        
        slotsDiv.appendChild(slotWrapper);
    }
    
    timelineDiv.appendChild(slotsDiv);
    container.appendChild(timelineDiv);
}
