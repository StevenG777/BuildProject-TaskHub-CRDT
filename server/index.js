// Import modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
// const io = require('socket.io')(3000, {
//     cors: {origin: "*"} });

// Intialize Express app
app = express();

// Create http server and attach Express to it
const server = http.createServer(app);

// Attach Socket.io to the same HTTP server
const io = socketIo(server, {
    cors: { origin: "*" }
});

// Socket.io listens connection made by user from WS client
io.on('connection', (socket) => {
    console.log(`Socket.io-Server: A user with id: ${socket.id} connected!`);
    
    // Socket.io listens for create task from WS client
    socket.on('createTask', (task) => {
        console.log(`The Server received createTask message from user ${socket.id}`);
        // Emit to WS client
        io.emit('taskCreated', task);
    });

    // Socket.io listens for remove task from WS client
    socket.on('removeTask', (id) => {
        console.log(`The Server received removeTask message from user ${socket.id}`);
        // Emit to WS client
        io.emit('taskRemoved', id);
    });

    // Socket.io listens for disconnection from WS client
    socket.on('disconnect', () => {
        console.log(`Socket.io-Server: A user with id: ${socket.id} disconnected!`);
    });
});

// app.use(express.static('public'));

// App listens on port 3000
PORT = 3000 || process.env.PORT
server.listen(PORT, () => {
    console.log(`Localhost server running on port ${PORT}`)
})
