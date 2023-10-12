import express from 'express';
import { Server, Socket } from 'socket.io';
import { Player, World } from './types';

const app = express()

app.use('/public', express.static(`${__dirname}/../../front/dist`))

app.get('/', (req,res) => {
    res.redirect('/public/index.html');
});

const server = app.listen(3000)
const io = new Server(server)

let worlds:World[] = []

io.on('connection', socket => {
    console.log('connected', socket.id)
    socket.on('createRoom', (name:string, map:string, maxPlayers:number) => {
        const world:World = {
            gravity: 9.81,
            speed: 5,
            jumpHeight: 5,
            jumpCooltime: 0.5,
            damping: 0.5,
            restitution: 0.5,
            name,
            map,
            maxPlayers,
            ownerId: socket.id,
            players: {},
            status: 'waiting',
        }
        worlds.push(world)
        socket.emit('createdRoom', world)
        socket.broadcast.emit('getRooms', worlds)
    })
    socket.on('joinRoom', (worldId:string, nickname:string, color:string) => {
        const world = worlds.find(world => world.ownerId === worldId)
        if(world){
            const player:Player = {
                nickname,
                color,
                position: [Math.random() * 10 - 5,10,Math.random() * 10 - 5],
                velocity: [0,0,0],
            }
            world.players[socket.id] = player
            socket.emit('joinedRoom', world)
            socket.emit('getRooms', worlds)
            socket.broadcast.emit('getRooms', worlds)
        }
    })
    socket.on('getRooms', () => {
        socket.emit('getRooms', worlds)
    })
    socket.on('startGame', (worldId:string) => {
        const world = worlds.find(world => world.ownerId === worldId)
        if(world){
            world.status = 'playing'
            socket.broadcast.emit('getRooms', worlds)
            socket.emit('gameStarted', world)
            socket.broadcast.emit('gameStarted', world)
        }
    })
    socket.on('debug', (data:any) => {
        console.log('debug', data)
    })
    socket.on('init', (worldId:string) => {
        let world = worlds.find(world => world.ownerId === worldId)
        socket.emit('init', world)
    })
    socket.on('update', (pos:number[], velocity:number[]) => {
        worlds.forEach(world => {
            if(world.players[socket.id]){
                world.players[socket.id].position = pos
                world.players[socket.id].velocity = velocity
            }
        })
        socket.broadcast.emit('update', socket.id, pos, velocity)
    })
    socket.on('disconnect', () => {
        console.log('disconnected', socket.id)
        worlds = worlds.filter(world => world.ownerId !== socket.id)
        worlds.forEach(world => {
            delete world.players[socket.id]
        })
        socket.broadcast.emit('disconnected', socket.id)
        socket.broadcast.emit('getRooms', worlds)
    })
})