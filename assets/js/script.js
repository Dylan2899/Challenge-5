// Retrieve tasks and nextId from localStorage or initialize if not available
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task ID
function generateTaskId() {
    return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
    const taskCard = $(`
        <div class="task-card card mb-3" id="${task.id}" draggable="true">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.desc}</p>
                <p class="card-text"><small class="text-muted">Deadline: ${task.deadline}</small></p>
                <button class="btn btn-danger delete-button" data-id="${task.id}">Delete</button>
            </div>
        </div>
    `);

    const deadline = new Date(task.deadline);
    const now = new Date();
    if (deadline < now) {
        taskCard.addClass('deadline-overdue');
    } else if ((deadline - now) / (1000 * 60 * 60 * 24) <= 3) {
        taskCard.addClass('deadline-near');
    }

    taskCard.on('dragstart', function(event) {
        event.originalEvent.dataTransfer.setData("taskId", task.id);
    });

    return taskCard;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
    $('.task-list').empty();
    taskList.forEach(task => {
        $(`#${task.status}-cards`).append(createTaskCard(task));
    });
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
}

// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
    const task = {
        id: generateTaskId(),
        title: $('#task-title').val(),
        desc: $('#task-desc').val(),
        deadline: $('#task-deadline').val(),
        status: 'to-do'
    };
    taskList.push(task);
    renderTaskList();
    $('#formModal').modal('hide');
    $('#task-form')[0].reset();
}

// Function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(event.target).data('id');
    taskList = taskList.filter(task => task.id !== taskId);
    renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable.attr('id');
    const newStatus = $(this).attr('id').replace('-cards', '');
    const task = taskList.find(task => task.id === taskId);
    task.status = newStatus;
    renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $('#add-task-button').on('click', function() {
        $('#formModal').modal('show');
    });

    $('.btn-close').on('click', function() {
        $('#formModal').modal('hide');
    });

    $('#task-form').on('submit', handleAddTask);

    $(document).on('click', '.delete-button', handleDeleteTask);

    $('.task-list').droppable({
        drop: handleDrop
    });
});
