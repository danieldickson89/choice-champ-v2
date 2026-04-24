const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Socket.io
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

const PORT = process.env.PORT || 5000;

const routes = require('./routes');

app
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(express.static(path.join(__dirname, 'public')))
    .use(cors())
    .use('/', routes);

io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('party-member-joined');
    });

    socket.on('member-remote-increment', (code) => {
        socket.to(code).emit('member-increment');
    });

    socket.on('member-remote-decrement', (code) => {
        socket.to(code).emit('member-decrement');
    });

    socket.on('start-remote-party', (code) => {
        socket.to(code).emit('start-party');
    });

    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
    });

    socket.on('user-leave-party', (code) => {
        socket.to(code).emit('party-member-left');
    });

    // Party page sockets
    socket.on('vote-remote-increment', (id, code) => {
        socket.to(code).emit('vote-increment', id);
    });

    socket.on('vote-remote-decrement', (id, code) => {
        socket.to(code).emit('vote-decrement', id);
    });

    socket.on('super-choice-remote', (id, code) => {
        socket.to(code).emit('super-choice', id);
    });

    socket.on('remove-super-choice-remote', (id, code) => {
        socket.to(code).emit('remove-super-choice', id);
    });

    socket.on('votes-needed-remote', (votesNeeded, code) => {
        socket.to(code).emit('votes-needed', votesNeeded, code);
    });

    socket.on('random-remote-selected', (id, code) => {
        socket.to(code).emit('random-selected', id);
    });

    socket.on('user-ready-remote', (code) => {
        socket.to(code).emit('user-ready');
    });

    socket.on('user-not-ready-remote', (code) => {
        socket.to(code).emit('user-not-ready');
    });

    socket.on('party-remote-deleted', (code) => {
        socket.to(code).emit('party-deleted');
        socket.leave(code);
    });

    // Collection page sockets
    socket.on('remove-remote-item', (id, collectionId) => {
        socket.to(collectionId).emit('remove-item', id);
    });

    socket.on('watched-remote-item', (item, collectionId) => {
        socket.to(collectionId).emit('watched-item', item);
    });

    // Search page socket
    socket.on('add-remote-item', (item, collectionId) => {
        socket.to(collectionId).emit('add-item', item);
    });

    socket.on('finish-early-remote', (code) => {
        socket.to(code).emit('finish-early');
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
