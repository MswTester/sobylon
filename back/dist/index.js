"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
app.use('/public', express_1.default.static(`${__dirname}/../../front/dist`));
app.get('/', (req, res) => {
    res.redirect('/public/index.html');
});
const server = app.listen(3000);
const io = new socket_io_1.Server(server);
let worlds = [];
io.on('connection', socket => {
    console.log('connected', socket.id);
    socket.on('createRoom', (name, map, maxPlayers) => {
        const world = {
            gravity: 1,
            speed: 1,
            jumpHeight: 8,
            jumpCooltime: 400,
            damping: 0.5,
            restitution: 1.5,
            name,
            map,
            maxPlayers,
            ownerId: socket.id,
            players: {},
            status: 'waiting',
        };
        worlds.push(world);
        socket.emit('createdRoom', world);
        socket.broadcast.emit('getRooms', worlds);
    });
    socket.on('joinRoom', (worldId, nickname, color) => {
        const world = worlds.find(world => world.ownerId === worldId);
        if (world) {
            const player = {
                nickname,
                color,
                position: [Math.random() * 10 - 5, 10, Math.random() * 10 - 5],
                velocity: [0, 0, 0],
                life: 1,
            };
            world.players[socket.id] = player;
            socket.emit('joinedRoom', world);
            socket.emit('getRooms', worlds);
            socket.broadcast.emit('getRooms', worlds);
        }
    });
    socket.on('getRooms', () => {
        socket.emit('getRooms', worlds);
    });
    socket.on('startGame', (worldId) => {
        const world = worlds.find(world => world.ownerId === worldId);
        if (world) {
            world.status = 'playing';
            socket.broadcast.emit('getRooms', worlds);
            socket.emit('gameStarted', world);
            socket.broadcast.emit('gameStarted', world);
        }
    });
    socket.on('debug', (data) => {
        console.log('debug', data);
    });
    socket.on('init', (worldId) => {
        let world = worlds.find(world => world.ownerId === worldId);
        socket.emit('init', world);
    });
    socket.on('update', (pos, velocity) => {
        worlds.forEach(world => {
            if (world.players[socket.id]) {
                world.players[socket.id].position = pos;
                world.players[socket.id].velocity = velocity;
            }
        });
        socket.broadcast.emit('update', socket.id, pos, velocity);
    });
    socket.on('disconnect', () => {
        console.log('disconnected', socket.id);
        worlds = worlds.filter(world => world.ownerId !== socket.id);
        worlds.forEach(world => {
            delete world.players[socket.id];
        });
        socket.broadcast.emit('disconnected', socket.id);
        socket.broadcast.emit('getRooms', worlds);
    });
});
//# sourceMappingURL=index.js.map