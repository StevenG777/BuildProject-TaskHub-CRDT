// Define an event trigger for loading the website
document.addEventListener('DOMContentLoaded', () => {
    // Initialize socket & define connection to WS client
    const socket = io('http://localhost:3000');

    // Socket.io listen for connection from WS client
    socket.on('connect', () => {
        console.log(`Socket.io-Client: A user with id: ${socket.id} connected to server!`);
    });

    // Socket.io listen for disconnection from WS client
    socket.on('disconnect', (reason) => {
        console.log(`Socket.io-Client: A user with id: ${socket.id} disconnected from server with reason: ${reason}`);
    });

    // Get the text field, button and list
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    let idGenerator = 0;

    // Define an event trigger for the add button
    addTaskBtn.addEventListener('click', () => {
        omitCreateTaskMessage();
    });

    // Define an event trigger for the "Enter" key
    taskInput.addEventListener('keydown', (event) => {
        if (event.key == 'Enter'){
            omitCreateTaskMessage();
        };
    });

    // Define a function to omit message to WS server to create task
    function omitCreateTaskMessage() {
        // Get text field input
        const taskContent = taskInput.value.trim();
        if (taskContent) {
            // Package task info before emitting
            const task = {
                id: ++idGenerator,
                content: taskContent
            };
            // Emit to WS server
            socket.emit('createTask', task);
            // Clear the text field
            taskInput.value = '';
        }
    };

    // Create a new task item to the list
    function createTaskElement(task) {
        // Create & name the task item
        const li = document.createElement('li');
        li.textContent = task.content;
        li.setAttribute('data-id', task.id);
        li.classList.add('task-item'); // Add class for styling

        // Create & name the remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove Task';
        removeBtn.classList.add('remove-task'); // Add class for styling

        // Define an event listener for clicking the remove button   
        removeBtn.addEventListener('click', () => {
            // Emit to WS server
            socket.emit('removeTask', task.id);
        });

        // Attach remove button to task item
        li.appendChild(removeBtn);

        // Add the whole task item to the list
        taskList.appendChild(li);
    };

    // Remove an old task item from the list
    function removeTaskElement(id) {
        // Get array of li tag element by tag name 'li'
        const items = taskList.getElementsByTagName('li');
        // Iterate the array
        for (let i = 0; i < items.length; i++) {
            // For each array element, get its id attribute & compare to input id
            if (items[i].dataset.id === id.toString()) {
                // If found, remove the item
                taskList.removeChild(items[i]);
                break;
            }
        }
    };

    // Socket.io listens to call createTaskElement()
    socket.on('taskCreated', (task) => { 
        createTaskElement(task); 
    });

    // Socket.io listens to call removeTaskElement()
    socket.on('taskRemoved', (id) => {
        removeTaskElement(id);
    });
});
