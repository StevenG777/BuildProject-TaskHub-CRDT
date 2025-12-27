# Build-Project-Task-Hub
## Features
- **Local-first principle**: All the functionalities will still be available even offline, you have full data ownership if you do not want to share your data with others.
- **Real-time update**: Enabling users to see instant updates from you and vice versa.
- **Collaboration**: Empowering strong collaboration between people, your local data can be synced up with other users in the cloud once your network connection gets back online.

## Functionalities
- **Create Task**: Create a task item to the list by specifying the task name
- **Delete Task**: Delelte a task item from the list
- In Future Development
  - **Clear Task**: Clear all the tasks in the list
  - **Create Task Description**: Create a description to detail the specific task items
  - **Edit Task Description**: Modify the existing description
  - **Clear Task Description**: Clear existing description
  - **Specify User Name**: A pop-out window for you to specify your name for future collaboration
  - **Show Changes**: A side section to show changes by different users (with user names) in collaboration setting
  - **Status Dropdown Menu**: A drop menu to specify the status of a task (Not Started, In Progress, Complete)
  - **Preference**: A Preference Page to set up preferences in Data-Syncing, Light/Dark/Auto mode, Task Status Customization and many more...

## Tech Stack
- **Front-end:**
  - HTML/CSS/Javascript
  - CRDT Module(Y.js)
  - IndexedDB(Y-IndexedDBY)
  - Web Socket Client(Y-Sweet Client)
  - Build Tool (Vite.js)
- **Back-end:**
  - Javascript
  - Runtime (Node.js)
  - Server (Express.js)
  - Web Socket Server & Y-Sweet Cloud\[Y.js As a Service\] & S3-like Persistence Storage(Y-Sweet SDK)
 
## Use TaskHub App in the Development Environment
1. Go to the **[server folder](https://github.com/StevenG777/Build-Project-TaskHub-CRDT-/tree/main/server)**: `cd server`.
2. Build the modules for the front-end: `npm run build`.
4. Start the express server: `npm start`.
5. Go to the browser and access the app through **localhost:3000**

## Use TaskHub App in the Production Environment
- The app is hosted in Render
- [Access the app here](https://task-hub-app.onrender.com/?doc=CBpzB8brmIsLgFmc9tfuQ)
