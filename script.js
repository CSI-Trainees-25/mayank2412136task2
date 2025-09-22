tasks=[];
let currentTimerTaskIndex = null; 
document.querySelector(".add-task-btn").addEventListener("click",function(){
    document.querySelector(".popup").style.display="flex";
    document.querySelector("#task-title").focus();
    
});
document.querySelector(".close-btn").addEventListener("click",function(){
    document.querySelector(".popup").style.display="none";

});
document.querySelector(".submit-btn").addEventListener("click",function(){
    let taskname=document.querySelector("#task-title").value;

    let taskdate=document.querySelector("#task-date").value    ;
     let taskpriority=document.querySelector("#task-priority").value;
     let taskstate=document.querySelector('#task-state').value;
    let newtask={

        name:taskname,
        state:taskstate,
        date:taskdate,
        priority:taskpriority,
    }
    tasks.push(newtask);
    console.log(tasks);
    document.querySelector(".popup").style.display="none";
    document.querySelector("#task-title").value="";
    document.querySelector("#task-state").value="";

    document.querySelector("#task-time").value="";
    document.querySelector("#task-priority").value="";
  
    updateProgressNavigation();
    updateTaskList();
});
function updateTaskList()
{
    let tasklistcontainer=document.querySelector(".task-list");
    tasklistcontainer.innerHTML="";
    tasks.forEach(function(task,index){
        let taskitem=document.createElement("div");
        taskitem.classList.add("task-item");
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
            updateTaskList();
            
    updateProgressNavigation();
  
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
            updateTaskList();
            
    updateProgressNavigation();
  
        });
    });

document.querySelectorAll(".donow-btn").forEach(function(button){
       
        button.addEventListener("click",function(){
            let index=this.getAttribute("data-index");
            let task=tasks[index];
            if (task.state!=="Done"){ updatedonowlist();
        
        }
            else{
                alert("Task already completed");
            }
  
        });
    });

}
function updateProgressNavigation(){
    let totalTasks=tasks.length;
    let completedTasks=tasks.filter(task=>task.state==="Done").length;
    let inprogressTasks=tasks.filter(task=>task.state==="In Progress").length;
    let notstartedTasks=tasks.filter(task=>task.state==="Not started").length;
    document.querySelector(".progress-navigation").innerHTML=`<p> ${totalTasks} Tasks | ${inprogressTasks} In Progress | ${completedTasks} Done  </p>`;


}
function startCountdown(totalSeconds,taskIndex){
    let countdownElement=document.querySelector("#countdown-timer");
    let countdownWrapper=document.querySelector(".countdown-display");
    if (countdownWrapper) countdownWrapper.style.display = "block";
    let countdownInterval=setInterval(function(){
        let hours=Math.floor(totalSeconds/3600);
        let minutes=Math.floor((totalSeconds%3600)/60);
        let seconds=totalSeconds%60;
        countdownElement.innerHTML=`${hours.toString().padStart(2,"0")}:${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`;
        if(totalSeconds<=0){
            clearInterval(countdownInterval);
            countdownElement.innerHTML="Time's up!";
            tasks[taskIndex].state="Done";
            updateTaskList();
            updateProgressNavigation();
        }
        totalSeconds--;
    },1000);
    
updateTaskList();
updateProgressNavigation();
}

const donowContainer = document.querySelector(".donow");
if (donowContainer) {
    donowContainer.addEventListener("click", function(e){
        const target = e.target;
        if (target && target.classList && target.classList.contains("start-timer-btn")) {
            const idxAttr = target.getAttribute("data-index");
            currentTimerTaskIndex = idxAttr !== null ? parseInt(idxAttr,10) : null;
            document.querySelector(".timer-popup").style.display = "flex";
        }
    });
}
const closeTimerBtn = document.querySelector(".close-timer-btn");
if (closeTimerBtn) {
    closeTimerBtn.addEventListener("click", function(){
        document.querySelector(".timer-popup").style.display = "none";
    });
}
const startTimerBtn = document.querySelector(".start-timer");
if (startTimerBtn) {
    startTimerBtn.addEventListener("click", function(e){
        e.preventDefault();
        let hours = parseInt(document.querySelector("#timer-hours").value) || 0;
        let minutes = parseInt(document.querySelector("#timer-minutes").value) || 0;
        let seconds = parseInt(document.querySelector("#timer-seconds").value) || 0;
        let totalSeconds = hours*3600 + minutes*60 + seconds;
        if(totalSeconds>0 && currentTimerTaskIndex !== null){
            startCountdown(totalSeconds, currentTimerTaskIndex);
        }
        else{
            alert("Please select a task and enter a valid time");
        }
    });

}
const skiptimerbtn=document.querySelector(".skip-timer-btn");
if (skiptimerbtn) {
    skiptimerbtn.addEventListener("click", function(){
        if (currentTimerTaskIndex !== null) {
            tasks[currentTimerTaskIndex].state = "Done";
            updateTaskList();
            updateProgressNavigation();
        }
        document.querySelector(".timer-popup").style.display = "none";
    }
);
}
function updatedonowlist(){
    let donowlistcontainer=document.querySelector(".donow");
    donowContainer.innerHTML="";
    tasks.forEach(function(task,index){
        let donowitem=document.createElement("div");
        donowitem.classList.add("donow-item");
        if (task.state !== "Done") {
            donowitem.innerHTML=`
            <div class="donow-item">
            <h3>${task.name}</h3>
            <p id="due">Due-Date:${task.date}</p>
            </div>
            <button class="start-timer-btn" data-index="${index}">Start Timer</button>
            
            `
            donowlistcontainer.appendChild(donowitem);
            }
        });
        
        }
