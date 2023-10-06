"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: '*'
    }
});
const port = 3000;
let room = {
    users: [],
};
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/test', (req, res) => {
    res.send('hahaha');
});
io.on('connection', (socket) => {
    console.log(`user connected:${socket.id}`);
    socket.emit('me', socket.id);
    room.users.push({ x: 0, y: 0, z: 0, rotation: 0, id: socket.id });
    socket.on('update', (data) => {
        const user = room.users.find(user => user.id === socket.id);
        if (user) {
            user.x = data.x;
            user.y = data.y;
            user.z = data.z;
            user.rotation = data.rotation;
        }
        socket.broadcast.emit('update', room);
    });
    socket.on('disconnect', e => {
        console.log(`user disconnected:${socket.id}`);
        room.users = room.users.filter(user => user.id !== socket.id);
    });
});
server.listen(port, () => {
    console.log(`listening on *:${port}`);
});
