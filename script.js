class Job {
  constructor(id, deadline, profit) {
    this.id = id;
    this.deadline = deadline;
    this.profit = profit;
  }
}

let jobs = [];
let scheduledJobs = [];
let totalProfit = 0;
let currentStep = 0;

function generateJobs() {
  const jobCount = parseInt(document.getElementById("jobCount").value);
  const maxDeadline = parseInt(document.getElementById("maxDeadline").value);
  const maxProfit = parseInt(document.getElementById("maxProfit").value);

  jobs = [];
  for (let i = 1; i <= jobCount; i++) {
    const deadline = Math.floor(Math.random() * maxDeadline) + 1;
    const profit = Math.floor(Math.random() * maxProfit) + 10;
    jobs.push(new Job(`Job ${i}`, deadline, profit));
  }
  
  displayJobs();
  resetSimulation();
}

function displayJobs() {
  const jobList = document.getElementById("jobList");
  jobList.innerHTML = "";
  jobs.forEach((job) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${job.id}: Deadline ${job.deadline}, Profit $${job.profit}`;
    jobList.appendChild(listItem);
  });
}

function resetSimulation() {
  scheduledJobs = Array(jobs.length).fill(null);
  totalProfit = 0;
  currentStep = 0;
  document.getElementById("scheduledJobList").innerHTML = "";
  document.getElementById("totalProfit").textContent = "Total Profit: $0";
}

function stepSequenceJobs() {
  if (currentStep === 0) jobs.sort((a, b) => b.profit - a.profit);

  if (currentStep < jobs.length) {
    const job = jobs[currentStep];
    const jobList = document.getElementById("scheduledJobList");

    for (let j = Math.min(jobs.length, job.deadline) - 1; j >= 0; j--) {
      if (!scheduledJobs[j]) {
        scheduledJobs[j] = job;
        totalProfit += job.profit;
        
        const listItem = document.createElement("li");
        listItem.textContent = `${job.id}: Profit $${job.profit}`;
        jobList.appendChild(listItem);

        document.getElementById("totalProfit").textContent = `Total Profit: $${totalProfit}`;
        break;
      }
    }
    currentStep++;
  } else {
    alert("Simulation complete!");
  }
}

function exportResults(format) {
  const data = scheduledJobs.filter(job => job !== null);
  let content;

  if (format === "csv") {
    const csvContent = data.map(job => `${job.id},${job.deadline},${job.profit}`).join("\n");
    content = `data:text/csv;charset=utf-8,Job ID,Deadline,Profit\n${csvContent}`;
  } else if (format === "json") {
    content = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  }

  const downloadLink = document.createElement("a");
  downloadLink.href = content;
  downloadLink.download = `jobs.${format}`;
  downloadLink.click();
}

function clearSimulation() {
  // Clear job list, scheduled jobs, and reset profit and step count
  jobs = [];
  scheduledJobs = [];
  totalProfit = 0;
  currentStep = 0;

  // Clear the display
  document.getElementById("jobList").innerHTML = "";
  document.getElementById("scheduledJobList").innerHTML = "";
  document.getElementById("totalProfit").textContent = "Total Profit: $0";
}
