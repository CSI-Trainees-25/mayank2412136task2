
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

let taskQueue = [];
let currentTaskIndex = 0;
let isQueueActive = false;

let currentTimer = null;
let timeRemaining = 0;
let isTimerRunning = false;
let isTimerPaused = false;
let sessionStartTime = 0;
let totalSessionTime = 0;

loadTasks();
function initializeTaskQueue() {
    const currentTasks = getTasks();
    taskQueue = currentTasks.filter(task => task.doNow && task.state !== "Done");
    currentTaskIndex = 0;
    isQueueActive = taskQueue.length > 0;
    
    if (isQueueActive) {
        displayCurrentTask();
    } else {
        displayAllTasksComplete();
    }
    updateTimerProgress();
}

function displayCurrentTask() {
    const taskContainer = document.querySelector(".task-in-progress-list");
    taskContainer.innerHTML = ''; 
    
    if (currentTaskIndex >= taskQueue.length) {
        displayAllTasksComplete();
        return;
    }
    
    const task = taskQueue[currentTaskIndex];
    const currentTasks = getTasks();
    
    const originalIndex = currentTasks.findIndex(t => 
        t.name === task.name &&
        t.date === task.date && 
        t.priority === task.priority &&
        t.doNow === true &&
        t.state !== "Done"
    );
    
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('current-task-display');
    taskDiv.innerHTML = `
        <div class="task-card">
            <h2>Current Task (${currentTaskIndex + 1} of ${taskQueue.length})</h2>
            <h3 class="task-name">${task.name}</h3>
            
            
            <div class="task-details">
                <div class="detail-item">
                    <span class="label">Priority:</span>
                    <span class="priority-${task.priority.toLowerCase()}">${task.priority}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Duration:</span>
                    <span>${formatSeconds(task.durationSeconds)}</span>
                </div>
                ${task.date ? `<div class="detail-item">
                    <span class="label">Due Date:</span>
                    <span>${task.date}</span>
                </div>` : ''}
                <div class="detail-item">
                    <span class="label">Status:</span>
                    <span class="status">${task.state}</span>
                </div>
            </div>
                
            <!-- Timer Display -->
            <div class="timer-display">
                <div class="countdown-timer" id="countdown-display">
                    ${formatSeconds(task.durationSeconds)}
                </div>
                <div class="timer-controls">
                    <button class="start-timer-btn" id="start-timer">Start Timer</button>
                    <button class="pause-timer-btn" id="pause-timer" style="display: none;">Pause</button>
                    <button class="stop-timer-btn" id="stop-timer" style="display: none;">Stop</button>
                    
            <div class="task-actions">
                <button class="mark-done-btn" data-index="${originalIndex}">
                    ✓ Mark as Done
                </button>
                <button class="skip-task-btn" data-index="${originalIndex}">
                    → Skip Task
                </button>
            </div>
                </div>
            </div>
        </div>
        
        ${taskQueue.length > 1 ? `<div class="queue-preview">
            <h4>Next Tasks:</h4>
            <div class="next-tasks">
                ${taskQueue.slice(currentTaskIndex + 1, currentTaskIndex + 4).map((nextTask, index) => `
                    <div class="next-task-item">
                        <span class="task-number">${currentTaskIndex + index + 2}</span>
                        <span class="task-name">${nextTask.name}</span>
                        <span class="task-duration">${formatSeconds(nextTask.durationSeconds)}</span>
                    </div>
                `).join('')}
                ${taskQueue.length > currentTaskIndex + 4 ? `
                    <div class="more-tasks">... and ${taskQueue.length - currentTaskIndex - 4} more tasks</div>
                ` : ''}
            </div>
        </div>` : ''}
    `;
    
    taskContainer.appendChild(taskDiv);
    
    initializeTaskTimer(task);
}

function displayAllTasksComplete() {
    const taskContainer = document.querySelector(".task-in-progress-list");
    window.location.href = "summary.html";
    isQueueActive = false;
}

function moveToNextTask() {
    if (!isQueueActive) return;
    
    stopTimer();
    
    sessionStartTime = 0;
    totalSessionTime = 0;
    
    currentTaskIndex++;
    
    if (currentTaskIndex >= taskQueue.length) {
        displayAllTasksComplete();
    } else {
        displayCurrentTask();
    }
    updateTimerProgress();
}

function handleMarkTaskDone(originalIndex) {
    if (isTimerRunning && sessionStartTime > 0) {
        const elapsedTime = Math.floor((Date.now() - sessionStartTime) / 1000);
        totalSessionTime += elapsedTime;
        
        const currentTasks = getTasks();
        if (currentTasks[originalIndex]) {
            updateTask(originalIndex, { 
                timeSpent: (currentTasks[originalIndex].timeSpent || 0) + totalSessionTime,
                state: 'Done',
                doNow: false
            });
        }
    } else {
        if (markTaskDoneSimple(originalIndex)) {
        }
    }
    
    moveToNextTask();
    return true;
}

function handleSkipTask(originalIndex) {
    if (isTimerRunning && sessionStartTime > 0) {
        const elapsedTime = Math.floor((Date.now() - sessionStartTime) / 1000);
        totalSessionTime += elapsedTime;
        
        const currentTasks = getTasks();
        if (currentTasks[originalIndex]) {
            updateTask(originalIndex, { 
                timeSpent: (currentTasks[originalIndex].timeSpent || 0) + totalSessionTime 
            });
        }
    }
    
    moveToNextTask();
}

function updateTimerProgress() {
    const remainingTasks = taskQueue.length - currentTaskIndex;
    const completedTasks = currentTaskIndex;
    document.querySelector(".progress-navigation-timer").innerHTML = 
        `<p>${remainingTasks} Remaining | ${completedTasks} Completed</p>`;
}

function initializeTaskTimer(task) {
    timeRemaining = task.durationSeconds;
    isTimerRunning = false;
    isTimerPaused = false;
    sessionStartTime = 0;
    totalSessionTime = 0;
    
    if (currentTimer) {
        clearInterval(currentTimer);
        currentTimer = null;
    }
    
    updateTimerDisplay();
}

function startTimer() {
    if (timeRemaining <= 0) return;
    
    isTimerRunning = true;
    isTimerPaused = false;
    sessionStartTime = Date.now();
    
    updateTimerButtons();
    
    currentTimer = setInterval(() => {
        if (!isTimerPaused && timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();
            
            if (timeRemaining <= 0) {
                
                stopTimer();
                const markDoneBtn = document.querySelector('.mark-done-btn');
                if (markDoneBtn) {
                    markDoneBtn.click();
                }
            }
        }
    }, 1000);
}

function pauseTimer() {
    if (!isTimerRunning) return;
    
    if (!isTimerPaused) {
        const elapsedTime = Math.floor((Date.now() - sessionStartTime) / 1000);
        totalSessionTime += elapsedTime;
        isTimerPaused = true;
    } else {
        sessionStartTime = Date.now();
        isTimerPaused = false;
    }
    
    updateTimerButtons();
}

function stopTimer() {
    if (isTimerRunning && sessionStartTime > 0) {
        const elapsedTime = Math.floor((Date.now() - sessionStartTime) / 1000);
        totalSessionTime += elapsedTime;
        
        const currentTask = taskQueue[currentTaskIndex];
        if (currentTask) {
            const currentTasks = getTasks();
            const originalIndex = currentTasks.findIndex(t => 
                t.name === currentTask.name &&
                t.date === currentTask.date && 
                t.priority === currentTask.priority &&
                t.doNow === true
            );
            
            if (originalIndex !== -1) {
                updateTask(originalIndex, { timeSpent: (currentTasks[originalIndex].timeSpent || 0) + totalSessionTime });
            }
        }
    }
    
    if (currentTimer) {
        clearInterval(currentTimer);
        currentTimer = null;
    }
    isTimerRunning = false;
    isTimerPaused = false;
    sessionStartTime = 0;
    totalSessionTime = 0;
    
    const currentTask = taskQueue[currentTaskIndex];
    if (currentTask) {
        timeRemaining = currentTask.durationSeconds;
    }
    
    updateTimerDisplay();
    updateTimerButtons();
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('countdown-display');
    if (timerDisplay) {
        timerDisplay.textContent = formatSeconds(timeRemaining);
        
    }
}

function updateTimerButtons() {
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    const stopBtn = document.getElementById('stop-timer');
    
    if (startBtn && pauseBtn && stopBtn) {
        if (isTimerRunning) {
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            stopBtn.style.display = 'inline-block';
            pauseBtn.textContent = isTimerPaused ? 'Resume' : 'Pause';
        } else {
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            stopBtn.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeTaskQueue();
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('mark-done-btn')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        stopTimer();
        handleMarkTaskDone(index);
    }
    
    if (e.target.classList.contains('skip-task-btn')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        stopTimer();
        handleSkipTask(index);
    }
    
    if (e.target.classList.contains('restart-queue-btn')) {
        stopTimer();
        initializeTaskQueue();
    }
    
    if (e.target.id === 'start-timer') {
        startTimer();
    }
    
    if (e.target.id === 'pause-timer') {
        pauseTimer();
    }
    
    if (e.target.id === 'stop-timer') {
        stopTimer();
    }
});

export { 
    updateTimerProgress, 
    displayCurrentTask, 
    initializeTaskQueue, 
    moveToNextTask,
    handleMarkTaskDone,
  
};
