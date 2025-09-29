let tasks = [];
const TASKS_KEY = 'todo_tasks_v1';
function saveTasks(){
    
        localStorage.setItem(TASKS_KEY
            , JSON.stringify(tasks));
    
}
function loadTasks(){
   
        const raw = localStorage.getItem(TASKS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(t => ({
            name: t.name || '',
            state: t.state || 'Not started',
            date: t.date || '',
            priority: t.priority || 'Low',
            doNow: !!t.doNow,
            durationSeconds: typeof t.durationSeconds === 'number' ? t.durationSeconds : 0,
            timeSpent: typeof t.timeSpent === 'number' ? t.timeSpent : 0,
        })) : [];
    
}

// Functions to get and modify tasks from external modules
function getTasks() {
    return tasks;
}

function updateTask(index, updates) {
    if (tasks[index]) {
        Object.assign(tasks[index], updates);
        saveTasks();
        
        // Only update UI elements if they exist (for main page)
        if (document.querySelector('.task-list')) {
            updateTaskList();
        }
        if (document.querySelector('.progress-navigation')) {
            updateProgressNavigation();
        }
        if (document.querySelector('.donow')) {
            updatedonowlist();
        }
        
        return true;
    }
    return false;
}

function markTaskDone(index) {
    return updateTask(index, { state: 'Done', doNow: false });
}

function removeFromDoNow(index) {
    return updateTask(index, { doNow: false });
}

// Timer-specific functions that don't update main page UI
function markTaskDoneSimple(index) {
    if (tasks[index]) {
        Object.assign(tasks[index], { state: 'Done', doNow: false });
        saveTasks();
        return true;
    }
    return false;
}

function removeFromDoNowSimple(index) {
    if (tasks[index]) {
        Object.assign(tasks[index], { doNow: false });
        saveTasks();
        return true;
    }
    return false;
}

function addTimeSpentToTask(index, timeSpentSeconds) {
    if (tasks[index]) {
        const currentTimeSpent = tasks[index].timeSpent || 0;
        Object.assign(tasks[index], { timeSpent: currentTimeSpent + timeSpentSeconds });
        saveTasks();
        return true;
    }
    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    tasks = loadTasks();
    updateTaskList();
    updateProgressNavigation();
    updatedonowlist();
    
    // Only add event listeners if elements exist (main page)
    const addTaskBtn = document.querySelector(".add-task-btn");
    if (addTaskBtn) {
        addTaskBtn.addEventListener("click",function(){
            document.querySelector(".popup").style.display="flex";
            document.querySelector("#task-title").focus();
        });
    }
    
    const closeBtn = document.querySelector(".close-btn");
    if (closeBtn) {
        closeBtn.addEventListener("click",function(){
            document.querySelector(".popup").style.display="none";
        });
    }
    
    const submitBtn = document.querySelector(".submit-btn");
    if (submitBtn) {
        submitBtn.addEventListener("click",function(e){
        e.preventDefault(); 
        
        let taskname = document.querySelector("#task-title").value.trim();
        let titleError = document.querySelector("#title-error");
        
       
        if (!taskname || taskname === "") {
            titleError.style.display = "block";
            document.querySelector("#task-title").style.borderColor = "red";
            document.querySelector("#task-title").focus();
            return;
        } else {
            titleError.style.display = "none";
            document.querySelector("#task-title").style.borderColor = "#ccc";
        }

        let taskdate=document.querySelector("#task-date").value    ;
         let taskpriority=document.querySelector("#task-priority").value;
         let taskstate=document.querySelector('#task-state').value;
         
         let durH = parseInt(document.querySelector('#task-duration-hours')?.value || '0') || 0;
         let durM = parseInt(document.querySelector('#task-duration-minutes')?.value || '0') || 0;
         let durS = parseInt(document.querySelector('#task-duration-seconds')?.value || '0') || 0;
         let durationSeconds = Math.max(0, durH*3600 + durM*60 + durS);
        let newtask={

            name:taskname,
            state: durationSeconds === 0 ? 'Done' : taskstate,
            date:taskdate,
            priority:taskpriority,
            doNow:false,
            durationSeconds: durationSeconds,
            timeSpent: 0,
        }
        tasks.push(newtask);
        saveTasks();
        document.querySelector(".popup").style.display="none";
        document.querySelector("#task-title").value="";
        document.querySelector("#task-state").value="Not started";
        document.querySelector("#task-date").value="";
        document.querySelector("#task-time").value="";
        document.querySelector("#task-priority").value="Low";
        document.querySelector("#task-duration-hours").value="0";
        document.querySelector("#task-duration-minutes").value="0";
        document.querySelector("#task-duration-seconds").value="0";
      
        updateProgressNavigation();
        updateTaskList();
        updatedonowlist();
        });
    }

 
    const taskTitleInput = document.querySelector("#task-title");
    if (taskTitleInput) {
        taskTitleInput.addEventListener("input", function() {
            let titleError = document.querySelector("#title-error");
            if (this.value.trim() !== "") {
                titleError.style.display = "none";
                this.style.borderColor = "#ccc";
            }
        });
    }
    document.addEventListener('click', function(e){
        const target = e.target;
        if ( target.classList.contains('start-all-btn')){
           
            const timerPopup = document.querySelector('.timer-popup');
            if (timerPopup) timerPopup.style.display = 'flex';
            runDoNowSequence();
        }
        if ( target.classList.contains('pause-resume-btn')){
            paused = !paused;
            target.textContent = paused ? 'Resume' : 'Pause';
        }
        if (target.closest('.skiptask')){
            if (activeIntervalCancel){
                activeIntervalCancel();
            }
            
            if (!isBreak){
                const idx = tasks.findIndex(t => t.state === 'In Progress' || t.state === 'Not started');
                if (idx !== -1){
                    tasks[idx].state = 'Done';
                    tasks[idx].doNow = false;
                    saveTasks();
                    updateTaskList();
                    updateProgressNavigation();
                    updatedonowlist();
                }
            }
        }
    });
});

function updateTaskList()
{
    let tasklistcontainer=document.querySelector(".task-list");
    if (!tasklistcontainer) return; 
    tasklistcontainer.innerHTML="";
    tasks.forEach(function(task,index){
        let taskitem=document.createElement("div");
        taskitem.classList.add("task-item");


        taskitem.setAttribute('draggable','true');
        taskitem.setAttribute('data-index', index);
        taskitem.addEventListener('dragstart', (ev) => {
            ev.dataTransfer.setData('text/plain', String(index));
        });
        
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
        taskitem.innerHTML=`

        <h3>${task.name}</h3> <br><hr>
        <div class=status-priority>
<p class=${color}>Status:${task.state}</p>
         <p class=${priority_color}>Priority: ${task.priority}</p>
  </div>
    <p  id="due">Due-Date:${task.date}</p>
    <p class="duration">Duration: ${formatSeconds(task.durationSeconds || 0)}</p>
    
         <div class="button-container">    
        <button class="edit-btn" data-index="${index}">Edit</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
        <button class="donow-btn" data-index="${index}">Do Now</button>
        </div>
        `;
        tasklistcontainer.appendChild(taskitem);
    });
    document.querySelectorAll(".delete-btn").forEach(function(button){
        button.addEventListener("click",function(){
            let index=this.getAttribute("data-index");
            tasks.splice(index,1);
            saveTasks();
            updateTaskList();
            
    updateProgressNavigation();
    updatedonowlist();
  
        });
    });
    document.querySelectorAll(".edit-btn").forEach(function(button){
       
        button.addEventListener("click",function(){
            let index=this.getAttribute("data-index");
            let task=tasks[index];
            document.querySelector("#task-title").value=task.name;
            document.querySelector("#task-state").value=task.state;

            document.querySelector("#task-time").value=task.time;
            document.querySelector("#task-priority").value=task.priority;
            document.querySelector(".popup").style.display="flex";
            tasks.splice(index,1);
            saveTasks();
            updateTaskList();
            
    updateProgressNavigation();
    updatedonowlist();
  
        });
    });

document.querySelectorAll(".donow-btn").forEach(function(button){
       
        button.addEventListener("click",function(){
            let index=this.getAttribute("data-index");
            let task=tasks[index];
             if (task.durationSeconds === 0) {
            tasks[index].state = 'Done';
            saveTasks();
            updateTaskList();
            updateProgressNavigation();
            updatedonowlist();
            alert("Task completed instantly (0 duration)");
            return;
        }
            if (task.state!=="Done"){ 
        
    tasks[index].doNow = true;
    saveTasks();
        updatedonowlist();
        
        }
            else{
                alert("Task already completed");
            }
  
        });
    });

}
function updateProgressNavigation(){
    let progressNav = document.querySelector(".progress-navigation");
    if (!progressNav) return; 
    
    let totalTasks=tasks.length;
    let completedTasks=tasks.filter(task=>task.state==="Done").length;
    let inprogressTasks=tasks.filter(task=>task.state==="In Progress").length;
    progressNav.innerHTML=`<p> ${totalTasks} Tasks | ${inprogressTasks} In Progress | ${completedTasks} Done  </p>`;
}

function formatSeconds(totalSeconds){
    totalSeconds = totalSeconds || 0;
    const h = Math.floor(totalSeconds/3600);
    const m = Math.floor((totalSeconds%3600)/60);
    const s = totalSeconds%60;
    return  `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

const donowContainer = document.querySelector(".donow");
if (donowContainer) {
    donowContainer.addEventListener('dragover', function(e){
        e.preventDefault();
    });
    donowContainer.addEventListener('drop', function(e){
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        const idx = parseInt(data, 10);
        if (!Number.isNaN(idx) && tasks[idx]){
            if (tasks[idx].state !== 'Done'){
                tasks[idx].doNow = true;
                saveTasks();
                updatedonowlist();
            } else {
                alert('Task already completed');
            }
        }
    });
    
}
function updatedonowlist(){
    const donowRoot = document.querySelector(".donow");
    if (!donowRoot) return;

    let itemsContainer = donowRoot.querySelector(".donow-items");
    if (!itemsContainer) {
        itemsContainer = document.createElement("div");
        itemsContainer.className = "donow-items";
        donowRoot.appendChild(itemsContainer);
    }
    itemsContainer.innerHTML = "";

        const remaining = tasks.filter(t => t.doNow && t.state !== "Done");
    remaining.forEach(function(task, taskIndex) {
       
        const originalIndex = tasks.findIndex(t => 
            t.name === task.name && 
            t.date === task.date && 
            t.priority === task.priority &&
            t.doNow === true
        );
        
        const donowitem = document.createElement("div");
        donowitem.classList.add("donow-item");
        donowitem.innerHTML = `
            <div class="donow-item-content status-priority">
                <h3>${task.name}</h3>
                <p id="due">Due-Date:${task.date || ""}</p>
                <p class="duration">Duration: ${formatSeconds(task.durationSeconds || 0)}</p>
                <button class="remove-donow-btn" data-index="${originalIndex}">Remove from Do Now</button>
            </div>
        `;
        itemsContainer.appendChild(donowitem);
    });

    const summaryEl = donowRoot.querySelector(".completion-summary");
    
           summaryEl.textContent = `${remaining.length}`;
    
    
    document.querySelectorAll(".remove-donow-btn").forEach(function(button) {
        button.addEventListener("click", function() {
            let index = parseInt(this.getAttribute("data-index"));
            if (tasks[index]) {
                tasks[index].doNow = false;
                saveTasks();
                updatedonowlist();
                updateTaskList(); 
            }
        });
    });
}


let sequencing = false;
let activeIntervalCancel = null; 
let isBreak = false; 
let paused = false;
let activeTick = null; 
let remainingSeconds = 0; 
async function runDoNowSequence(){
    if (sequencing) return; 
    sequencing = true;
    try{
       
        const timerPopup = document.querySelector('.timer-popup');
        if (timerPopup) timerPopup.style.display = 'flex';
        const controlsToDisable = document.querySelectorAll('#timer-hours, #timer-minutes, #timer-seconds, .start-timer');
        controlsToDisable.forEach(el => { if (el) el.disabled = true; });
        const startAllBtn = document.querySelector('.start-all-btn');
        if (startAllBtn) startAllBtn.disabled = true;
        
        const queue = tasks
            .map((t, idx) => ({ t, idx }))
            .filter(x => x.t.doNow);
        for (let i=0; i<queue.length; i++){
            const { idx } = queue[i];
            const duration = tasks[idx].durationSeconds || 0;
             if (duration <= 0) {
                tasks[idx].state = 'Done';
                tasks[idx].doNow = false;
                saveTasks();
                updateTaskList();
                updateProgressNavigation();
                updatedonowlist();
                continue;
            }
                isBreak = false;
            const nameEl = document.querySelector('.taskname');
                if (nameEl)
                    {
                        nameEl.textContent = tasks[idx]?.name || '';
                    } 
            await countdownPromise(duration, idx);
            
            
            tasks[idx].state = 'Done';
           tasks[idx].doNow = false;
            saveTasks();
            updateTaskList();
            updateProgressNavigation();
            updatedonowlist();
            //break here
            if (i < queue.length - 1){
                isBreak = true;
                document.querySelector('.taskname').textContent = '';
                
                await breakCountdownPromise(30);
            }
        }
    } finally {
        sequencing = false;
       

        const controlsToEnable = document.querySelectorAll('#timer-hours, #timer-minutes, #timer-seconds, .start-timer');
        
    controlsToEnable.forEach(el => { if (el) el.disabled = false; });
        const startAllBtn = document.querySelector('.start-all-btn');
        
      
            startAllBtn.disabled = false;
                      
                  const timerPopup = document.querySelector('.timer-popup');
             timerPopup.style.display = 'none';
       
        updateTaskList();
        updateProgressNavigation();
        updatedonowlist();
    }
}

function countdownPromise(totalSeconds){
    return new Promise(resolve => {
        
        const countdownElement = document.querySelector('#countdown-timer');
        const countdownWrapper = document.querySelector('.countdown-display');
        if (countdownWrapper) countdownWrapper.style.display = 'block';
        let secondsLeft = totalSeconds;
        remainingSeconds = secondsLeft;
        const interval = setInterval(() => {
            if (paused) return; 
            const h = Math.floor(secondsLeft/3600);
            const m = Math.floor((secondsLeft%3600)/60);
            const s = secondsLeft%60;
            if (countdownElement) countdownElement.innerHTML = `Time Remaining: ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
            if (secondsLeft <= 0){
                clearInterval(interval);
                if (countdownElement) countdownElement.innerHTML = "Time's up!";
                resolve();
            }
            secondsLeft--;
            remainingSeconds = secondsLeft;
        }, 1000);
        activeTick = interval;
        activeIntervalCancel = () => { clearInterval(interval); resolve(); };
    });
}

function breakCountdownPromise(totalSeconds){
    return new Promise(resolve => {
        const countdownElement = document.querySelector('#countdown-timer');
        const countdownWrapper = document.querySelector('.countdown-display');
        if (countdownWrapper) countdownWrapper.style.display = 'block';
        let secondsLeft = totalSeconds;
        remainingSeconds = secondsLeft;
        const interval = setInterval(() => {
            if (paused) return;
            const h = Math.floor(secondsLeft/3600);
            const m = Math.floor((secondsLeft%3600)/60);
            const s = secondsLeft%60;
            if (countdownElement) countdownElement.innerHTML = `Break: ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
            if (secondsLeft <= 0){
                clearInterval(interval);
                resolve();
            }
            secondsLeft--;
            remainingSeconds = secondsLeft;
        }, 1000);
        activeTick = interval;
        activeIntervalCancel = () => { clearInterval(interval); resolve(); };
    });
}

export { tasks, saveTasks, loadTasks, formatSeconds, updateTaskList, updateProgressNavigation, updatedonowlist, runDoNowSequence, getTasks, updateTask, markTaskDone, removeFromDoNow, markTaskDoneSimple, removeFromDoNowSimple, addTimeSpentToTask };  

