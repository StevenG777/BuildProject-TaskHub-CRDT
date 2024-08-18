// Define an event trigger for loading the website
document.addEventListener('DOMContentLoaded', () => {
    // Initialize socket & define connection to WS client [Online]
    const socket = io('http://localhost:3000');

    // Intialize the text field, button, list & id generator [All]
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    let idGenerator = 0;

    // Initialize the IndexesDB (Dexie) database and its table schema of first version [Offline]
    var db = new Dexie("TaskDatabase");
    db.version(1).stores({
        task: 'id, name'
    })

    // Check internet connection [All]
    async function checkNetworkStatus() {
        // Create a request object and use Fetch API to receive response
        const testUrl = 'http://localhost:3000'; // Use a testing website to test connection

        const timeOut = 5000; // Time out duration
        const controller = new AbortController(); // Controller to abort fetch request
        const signal = controller.signal; // Signal is used to determine if an action should be aborted
        const timeOutID = setTimeout(() => { // Manage timeout
            controller.abort();
        }, timeOut);

        try{
            // Fetch API Request & Response
            const req = new Request(testUrl, {signal})
            const res = await fetch(req);
            // Clear timeout if reciving response within timeOut
            clearTimeout(timeOutID);

            // Internet connection is on
            if (res.ok){
                console.log("[checkNetworkStatus] -> Network is online!");
                return true;
            }
            else{
                console.log(`[checkNetworkStatus] -> Network is online but received a non-ok response: ${response.status}`);
                return false;
            }
        } catch (err){
            if (err.name == "TimeoutError"){
                console.log("[checkNetworkStatus] -> Timeout: It took more than 5 seconds to get the result!");
                return false;
            }
            else if (err.name === "AbortError"){
                console.log("[checkNetworkStatus] -> Fetch aborted by user action (browser stop button, closing tab, etc.",);
                return false;
            }
            else if (err.name == "TypeError"){
                console.log("[checkNetworkStatus] -> AbortSignal.timeout() method is not supported");
                return false;
            }
            else{
                console.log(`[checkNetworkStatus] -> Error Type: ${err.name}, Message: ${err.message}`);
                return false
            }
        }
    }

    // Event listens from clicking the "add" button to send CreateTask data [Online]
    addTaskBtn.addEventListener('click', () => {
        handleCreateTaskData();
    });

    // Event listens from pressing down the "Enter" key to send CreateTask data [Online]
    taskInput.addEventListener('keydown', (event) => {
        if (event.key == 'Enter'){
            handleCreateTaskData();
        };
    });

    // Define a function that handles displaying all IndexedDB Task Items [Offline]
    function handleDisplayTaskData() {
        db.task.toArray().then((tasks => {
            // Get each task and create task element
            tasks.forEach(task => {
                createTaskElement(task);
            });
        })).catch(error => {
            console.error('Failed to load tasks from IndexedDB:', error);
        })
    };

    // Display the task data from IndexedDB when DOM content is fully loaded [Offline]
    handleDisplayTaskData();

    // Define a function that handles the create task data [All]
    async function handleCreateTaskData() {
        // Get text field input
        const taskContent = taskInput.value.trim();
        // If text field not empty
        if (taskContent) {
            // Package task info
            const task = {
                id: ++idGenerator,
                content: taskContent
            };

            // Detect internet connection status
            const isOnline = await checkNetworkStatus();
            if (isOnline){
                // If online, emit to WS server to create task [Online]
                console.log("Hey I am online!")
                socket.emit('createTask', task);
            } else {
                // If offline, store the data to IndexDB [Offline]
                console.log("Hey I am offline!")
                db.task.add(task)
                createTaskElement(task);
            }

            // Clear the text field
            taskInput.value = '';
        }
    };

    // Define a function that handles the remove task data [All]
    async function handleRemoveTaskData(removeBtn, task) {
        // Define an event listener for clicking the remove button   
        removeBtn.addEventListener('click', async () => {
            // Detect internet connection status
            const isOnline = await checkNetworkStatus();
            if (isOnline){
                // If online, emit to WS server to remove task [Online]
                console.log("Hey I am online!")
                socket.emit('removeTask', task.id);
            } else {
                // If offline, remove the data from IndexDB [Offline]
                console.log("Hey I am offline!")
                db.task.delete(task.id)
                removeTaskElement(task.id);
            }
        });
    };

    // If it's online, Socket.io listen for connection & disconnection from WS client [Online]
    checkNetworkStatus().then(isOnline => {
        if (isOnline){
            // Socket.io listen for connection from WS client [Online]
            socket.on('connect', () => {
                console.log(`Socket.io-Client: A user with id: ${socket.id} connected to server!`);
            });


            // Socket.io listen for disconnection from WS client [Online]
            socket.on('disconnect', (reason) => {
                console.log(`Socket.io-Client: A user with id: ${socket.id} disconnected from server with reason: ${reason}`);
            });
        }
    });

    // Socket.io listens to call createTaskElement() [Online]
    socket.on('taskCreated', (task) => { 
        createTaskElement(task); 
    });

    // Socket.io listens to call removeTaskElement() [Online]
    socket.on('taskRemoved', (id) => {
        removeTaskElement(id);
    });

    // Create a new task item to the list [All]
    function createTaskElement(task) {
        // Create & name the task item
        const li = document.createElement('li');
        li.textContent = task.content;
        li.setAttribute('data-id', task.id);
        li.classList.add('task-item'); // Add class for styling

        // Create & name the remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove Task';
        removeBtn.classList.add('remove-task');

        // Define an event listener for clicking the remove button   
        handleRemoveTaskData(removeBtn, task);

        // Attach remove button to task item
        li.appendChild(removeBtn);

        // Add the whole task item to the list
        taskList.appendChild(li);
    };

    // Remove an old task item from the list [All]
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
});
