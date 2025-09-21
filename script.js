tasks=[];
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

    updateTaskList();
});
function updateTaskList(){
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
        color = "gray";
}
let priority_color;
switch(task.priority) {
    case "High":
        priority_color = "red";
        break;
    case "Medium":
        priority_color = "orange";
        break;
    case "Low   ":
        priority_color = "green";
        break;
    default:
        priority_color = "gray";
}
        taskitem.innerHTML=`

        <h3>${task.name}</h3> <br><hr>
        <div class=status-priority>
<p class=${color}>Status:${task.state}</p>
         <p class=${priority_color}>Priority: ${task.priority}</p>
  </div>
        <p  id="due">Due-Date:${task.date}</p>
         <div button-container >    
        <button class="edit-btn" data-index="${index}">Edit</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
        </div>
        `;
        tasklistcontainer.appendChild(taskitem);
    });
    document.querySelectorAll(".delete-btn").forEach(function(button){
        button.addEventListener("click",function(){
            let index=this.getAttribute("data-index");
            tasks.splice(index,1);
            updateTaskList();
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
        });
    });

}
