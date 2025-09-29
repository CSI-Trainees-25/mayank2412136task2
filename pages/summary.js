
import { 
    tasks, 
    saveTasks, 
    loadTasks, 
    formatSeconds, 
    updateTaskList, 
    updateProgressNavigation, 
    updatedonowlist, 
    runDoNowSequence,
    getTasks,
    updateTask,
    markTaskDone,
    removeFromDoNow,
    markTaskDoneSimple,
    removeFromDoNowSimple
} from '../script.js';
loadTasks();
let tasksummary = [];
function initializeTaskSummary() {
    tasksummary = getTasks();
    updateTaskSummary();
}
function updateTaskSummary() {
    const summaryContainer = document.querySelector(".summary-list");
    summaryContainer.innerHTML = '';
    
    tasksummary.forEach(function(task, index) {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-item");
        
        taskElement.innerHTML = `
            <h3 class="task-name">${task.name}</h3>
            <p  id="due">Due-Date:${task.date}</p>
            <p class="duration">Duration: ${formatSeconds(task.durationSeconds || 0)}</p>
            <p class="status">Status: ${task.state}</p>
            <p class="priority">Priority: ${task.priority}</p>
            <p class="do-now">Do Now: ${task.doNow ? 'Yes' : 'No'}</p>
            <p class="time-spent">Time Spent: ${formatSeconds(task.timeSpent || 0)}</p>
        `;
        
      let color;
switch(task.state) {
    case "Not started":
        color = "red";
        break;
    case "In Progress":
        color = "orange";
        break;
    case "Done":
        color = "green";
        break;
    default:
        color = "grey";
}
let priority_color;
switch(task.priority) {
    case "High":
        priority_color = "red";
        break;
    case "Medium":
        priority_color = "orange";
        break;
    case "Low":
        priority_color = "green";
        break;
    default:
        priority_color = "grey";
}
        taskElement.innerHTML=`

        <h3>${task.name}</h3> <br><hr>
        <div class=status-priority>
<p class=${color}>Status:${task.state}</p>
         <p class=${priority_color}>Priority: ${task.priority}</p>
  </div>
    <p  id="due">Due-Date:${task.date}</p>
    <p class="duration">Duration: ${formatSeconds(task.durationSeconds || 0)}</p>
         <div class="button-container">    
            <p class="time-spent">Time Spent: ${formatSeconds(task.timeSpent || 0)}</p>
        </div>
        `;
        
        summaryContainer.appendChild(taskElement);
    });

    updateTotalTime();
}

function updateTotalTime() {
    const totalSeconds = tasksummary.reduce((total, task) => {
        return total + (task.timeSpent || 0);
    }, 0);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const hoursEl = document.getElementById('h');
    const minutesEl = document.getElementById('m');
    const secondsEl = document.getElementById('s');
    
    if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
    if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
    if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
}

document.addEventListener('DOMContentLoaded', () => {
    initializeTaskSummary();
    updateSummaryProgress();
});

function updateSummaryProgress() {
    const totalTasks = tasksummary.length;
    const completedTasks = tasksummary.filter(task => task.state === "Done").length;
    const inProgressTasks = tasksummary.filter(task => task.state === "In Progress").length;
    
    document.querySelector(".progress-navigation").innerHTML = 
        `<p>${totalTasks} Tasks | ${inProgressTasks} In Progress | ${completedTasks} Done</p>`;
}
   

export {  updateTaskSummary, initializeTaskSummary, updateTotalTime, updateSummaryProgress };