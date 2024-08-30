// Import modules
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness.js'
import { createYjsProvider, debuggerUrl } from '@y-sweet/client';
import { IndexeddbPersistence } from 'y-indexeddb';

// In action to register service worker
const registerServiceWorker = async () => {
  // Check if the service worker is supported
  if ('serviceWorker' in navigator) {
    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register("./sw.js", {
        scope: "/",
      });

      // Output status
      if (registration.installing) {
        console.log("[Service Worker in Registration] Message: Service worker installing");
      }
      else if (registration.waiting) {
        console.log("[Service Worker in Registration] Message: Service worker installed");
      }
      else if (registration.active) {
        console.log("[Service Worker in Registration] Message: Service worker active");
      }
    } catch (error) {
      console.error(`[Service Worker in Registration] Error: Registration failed with ${error}`);
    }
  }
};
registerServiceWorker();

// In action when DOM content is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize the UI text field, button, and list
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    // Initialize a DistinctElement Set
    const distinctTaskEleSet = new Set();

    // Initialize the Yjs document
    const ydoc = new Y.Doc();

    // Initialize the Yjs shared data structure --> Y-Map
    const ymap = ydoc.getMap('tasks');

    // Set up for Syncing changes from Task App to Y-Map Doc & Handle UI Changes
    ymap.observe(event => {
        event.changes.keys.forEach((change, key) => {
            // Report event status with task data
            if (change.action === 'add') {
                const taskData = ymap.get(key).content;
                // If key not found in the set, display element UI
                if (!distinctTaskEleSet.has(key)) {
                    console.log(`[YMap Observe] I am adding element with ${key} -> ${ymap.get(key).content}`);
                    // Create a Task UI Element
                    createTaskElement({
                        id: key,
                        content: taskData
                    });
                    // Mark this key as found
                    distinctTaskEleSet.add(key);
                }
                console.log(`[Y-Map Observe] Message: Task added ${key} -> ${taskData}`);
            }
            else if (change.action === 'update') {
                // Update a Task UI Element --> In the Future
                const taskData = ymap.get(key).content;
                console.log(`[Y-Map Observe] Message: Task updated ${key} -> ${taskData}`);
            }
            else if (change.action === 'delete') {
                // Delete a Task UI Element
            removeTaskElement(key);
                console.log(`[Y-Map Observe] Message: Task deleted ${key}`);
            }
        });
    });

    // Display all the Tasks elements once it loads
    displayTaskElements(ymap);

    // Initialize the IndexedDB persistence for offline functionality
    const indexeddbProvider = new IndexeddbPersistence('tasks-db', ydoc);

    // IndexedDB Provider event listener listens for syncing changes from IndexDB to Y-Map Doc
    indexeddbProvider.on('synced', () => {
        // Inform the Indexed DB load data to Ymap Doc
        console.log('[Indexed DB Provider] Message: content from the database is loaded');

        // Load all the local data from IndexDB when page loaded
        for (const key of ymap.keys()) {
            // If key not found in the set, display element UI
            if (!distinctTaskEleSet.has(key)) {
                console.log(`[IndexedDB On Sync] I am adding element with ${key} -> ${ymap.get(key).content}`);
                createTaskElement({
                    id: key,
                    content: ymap.get(key).content
                });
                // Mark this key as found
                distinctTaskEleSet.add(key);
            };
        };
    });

    // Initalize the WebSocket Provider for real-time updates & online functionality 
    const setUpWebSocket = async(ydoc) => {
        // If possible, Get the DocId from the current URL
        // const url = new URL('http://localhost:3000/client-token');
        const url = new URL('/client-token', window.location.origin);
        const Params = new URLSearchParams(window.location.search); 
        const docId = Params.get('doc');
        if (docId) {
            url.searchParams.set('doc', docId);
        }

        // Fetch Client Token and DocId for setting up the WebSocket Provider hosted by Y-Sweet server   
        const res = await fetch(url);
        const clientToken = await res.json();

        // If NOT possible, then server creates one for the client
        if (!docId) {
            const url = new URL(window.location.href);
            url.searchParams.set('doc', clientToken.docId);
            window.history.replaceState({}, '', url);
        }

        // Set up the Web Socket Provider 
        const wsProvider = new createYjsProvider(ydoc, clientToken, {
            connect: true,
            awareness: new awarenessProtocol.Awareness(ydoc),
            WebSocketPolyfill: WebSocket,
            resyncInterval: 1000,
            maxBackoffTime: 100,
            disableBc: false
        });

        console.log(`[Web Socket] Debugging Link --> ${debuggerUrl(clientToken)}`);
        console.log(`[Web Socket] Message: Here are client token information:\n URL: ${clientToken.url}\n DocId: ${clientToken.docId}\n Token: ${clientToken.token}`);
    };
    setUpWebSocket(ydoc);

    // Event listener for adding a task
    addTaskBtn.addEventListener('click', () => {
        handleCreateTaskData();
    });

    taskInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleCreateTaskData();
        }
    });

    // A Function to handle task creation
    function handleCreateTaskData() {
        const taskContent = taskInput.value.trim();
        if (taskContent) {
            // Package data info with generated unique ID
            const taskId = `task-${Date.now()}`;
            const task = {
                id: `task-${Date.now()}`,
                content: taskContent
            };

            // Add the task to the Yjs shared data structure regardless online/offline
            ymap.set(task.id, { content: task.content });

            // Clear the input field
            taskInput.value = '';

            // // Debugging Purpose: Display Specific Info
            // console.log(`[handleCreateTask] Message: The size of YJS Map: ${ymap.size}`);
            // console.log(`[handleCreateTask] Message: Current Added Data: ${ymap.get(taskId).content}`);
        }
    };

    // A function that handles the remove task data [All]
    function handleRemoveTaskData(removeBtn, task) {
        // Define an event listener for clicking the remove button   
        removeBtn.addEventListener('click', () => {
            // Delete the task from the Yjs shared data structure
            ymap.delete(task.id);

            // // Debugging Purpose: Display Specific Info
            // console.log(`[handleDeleteTask] Message: The size of YJS Map: ${ymap.size}`);
        });
    };

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

    // Render task items once page loaded
    function displayTaskElements(ymap) {
        // Loaded all the offline and online data stored fro
        for (const key of ymap.keys()) {
            console.log(`[displayTaskElements] I am adding element with ${key} -> ${ymap.get(key).content}`);
            // If key not found in the set, display element UI
            if (!distinctTaskEleSet.has(key)) {
                createTaskElement({
                    id: key,
                    content: ymap.get(key).content
                });
                // Mark this key as found
                distinctTaskEleSet.add(key);
            }
        }   
    };
});