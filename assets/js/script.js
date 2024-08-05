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
        <div class="task-card" id="${task.id}" draggable="true">
            <h3>${task.title}</h3>
            <p>${task.desc}</p>
            <p>Deadline: ${task.deadline}</p>
            <button class="delete-button" data-id="${task.id}">Delete</button>
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
        $(`#${task.status}-list`).append(createTaskCard(task));
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
        status: 'not-started'
    };
    taskList.push(task);
    renderTaskList();
    $('#task-modal').hide();
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
    const newStatus = $(this).attr('id').replace('-list', '');
    const task = taskList.find(task => task.id === taskId);
    task.status = newStatus;
    renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $('#add-task-button').on('click', function() {
        $('#task-modal').show();
    });

    $('.close-button').on('click', function() {
        $('#task-modal').hide();
    });

    $(window).on('click', function(event) {
        if ($(event.target).is('#task-modal')) {
            $('#task-modal').hide();
        }
    });

    $('#task-form').on('submit', handleAddTask);

    $(document).on('click', '.delete-button', handleDeleteTask);

    $('.task-list').droppable({
        drop: handleDrop
    });
});
