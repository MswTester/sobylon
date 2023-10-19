import express from 'express';
import { Server, Socket } from 'socket.io';
import { Player, World } from './types';

const app = express()

app.use('/public', express.static(`${__dirname}/../../front/dist`))

app.get('/', (req,res) => {
    res.redirect('/public/index.html');
});

const spawnpoints = {
    'bridge':[10, 10, -10, 3],
    'stairs':[10, 10, 0, 3],
    'spin':[0, 10, 0, 3],
}
 
const server = app.listen(3000)
const io = new Server(server)

let logger:string[] = []
let worlds:World[] = []

const getTime = () => {
    const d = new Date(Date.now())
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const date = d.getDate()
    const hour = d.getHours()
    const minute = d.getMinutes()
    const second = d.getSeconds()
    if(year && month && date && hour && minute && second){
        return `${year}-${month}-${date} ${hour}:${minute}:${second}`
    }
}
const log = (eventType:string, socket:Socket, ...args:any[]) => {
    let str = `\u001b[32m[${getTime()}]\u001b[0m \u001b[33m${eventType}\u001b[0m \u001b[35m${socket.handshake.address}\u001b[0m:\u001b[34m${socket.id}\u001b[0m ${args.join(' ')}`;
    logger.push(str)
    console.log(str);
}
io.on('connection', socket => {
    log('CONNECT', socket)
    socket.on('log', () => {
        log('GET_LOG', socket)
        socket.emit('log', logger)
    })
    socket.on('createRoom', (name:string, map:string, maxPlayers:number) => {
        log('CREATE_ROOM', socket, name, map, maxPlayers)
        const world:World = {
            gravity: 1,
            speed: 1,
            jumpHeight: 8,
            jumpCooltime: 300,
            dashPower: 15,
            dashCooltime: 400,
            damping: 0.5,
            restitution: 1.5,
            maxlife: 1,
            name,
            map,
            maxPlayers,
            ownerId: socket.id,
            players: {},
            status: 'waiting',
            chat: [],
        }
        worlds.push(world)
        socket.emit('createdRoom', world)
        socket.broadcast.emit('getRooms', worlds)
    })
    socket.on('joinRoom', (worldId:string, nickname:string, color:string) => {
        log('JOIN_ROOM', socket, worldId, nickname, color)
        const world = worlds.find(world => world.ownerId === worldId)
        if(world){
            const player:Player = {
                nickname,
                color,
                position: [0,0,0],
                velocity: [0,0,0],
                life:1,
            }
            world.players[socket.id] = player
            socket.emit('joinedRoom', world)
            socket.emit('getRooms', worlds)
            socket.broadcast.emit('getRooms', worlds)
        }
    })
    socket.on('getRooms', () => {
        log('GET_ROOMS', socket)
        socket.emit('getRooms', worlds)
    })
    socket.on('updateRoom', (changeWorld:World) => {
        log('UPDATE_ROOM', socket, changeWorld.gravity, changeWorld.speed, changeWorld.jumpHeight, changeWorld.jumpCooltime, changeWorld.damping, changeWorld.restitution)
        const world = worlds.find(world => world.ownerId === socket.id)
        if(world){
            world.gravity = changeWorld.gravity
            world.speed = changeWorld.speed
            world.jumpHeight = changeWorld.jumpHeight
            world.jumpCooltime = changeWorld.jumpCooltime
            world.dashPower = changeWorld.dashPower
            world.dashCooltime = changeWorld.dashCooltime
            world.damping = changeWorld.damping
            world.restitution = changeWorld.restitution
            world.maxlife = changeWorld.maxlife
            socket.emit('getRooms', worlds)
            socket.broadcast.emit('getRooms', worlds)
        }
    })
    socket.on('startGame', (worldId:string) => {
        log('START_GAME', socket)
        const world = worlds.find(world => world.ownerId === worldId)
        if(world){
            world.status = 'playing'
            Object.keys(world.players).forEach((key, index) => {
                let spawnPos = [0, 0, 0]
                spawnPos[0] = spawnpoints[world.map][0] + Math.random() * spawnpoints[world.map][3] * 2 - spawnpoints[world.map][3]
                spawnPos[1] = spawnpoints[world.map][1]
                spawnPos[2] = spawnpoints[world.map][2] + Math.random() * spawnpoints[world.map][3] * 2 - spawnpoints[world.map][3]
                world.players[key].position = spawnPos
                world.players[key].velocity = [0,0,0]
                world.players[key].life = world.maxlife
            })
            socket.broadcast.emit('getRooms', worlds)
            socket.emit('gameStarted', world)
            socket.broadcast.emit('gameStarted', world)
        }
    })
    socket.on('debug', (data:any) => {
        log('DEBUG', socket, JSON.stringify(data))
    })
    socket.on('init', (worldId:string) => {
        let world = worlds.find(world => world.ownerId === worldId)
        socket.emit('init', world)
    })
    socket.on('update', (pos:number[], velocity:number[], life:number) => {
        worlds.forEach(world => {
            if(world.players[socket.id]){
                world.players[socket.id].position = pos
                world.players[socket.id].velocity = velocity
                world.players[socket.id].life = life
            }
        })
        socket.broadcast.emit('update', socket.id, pos, velocity)
    })
    const endGame = (world:World) => {
        const playerKeys = Object.values(world.players)
        const leftPlayers = playerKeys.filter(player => player.life > 0)
        if(leftPlayers.length === 1){
            const winnerId = Object.keys(world.players).find(key => world.players[key].life > 0)
            if(winnerId){
                socket.emit('gameEnd', winnerId)
                socket.broadcast.emit('gameEnd', winnerId)
                world.status = 'waiting'
                socket.emit('getRooms', worlds)
                socket.broadcast.emit('getRooms', worlds)
            }
        }
    }
    socket.on('gameOver', (worldId:string) => {
        log('GAME_OVER', socket)
        let world = worlds.find(world => world.ownerId === worldId)
        if(world){
            world.players[socket.id].life = 0
            socket.broadcast.emit('gameOver', socket.id)
            endGame(world)
        }
    })
    socket.on('disconnect', () => {
        log('DISCONNECT', socket)
        const world = worlds.find(world => world.ownerId === socket.id)
        worlds.forEach(world => {
            delete world.players[socket.id]
        })
        if(world){
            const keys = Object.keys(world.players)
            if(keys.length > 0){
                const newOwnerId = keys[0]
                socket.broadcast.emit('ownerChanged', world.ownerId, newOwnerId)
                world.ownerId = newOwnerId
            } else {
                worlds = worlds.filter(world => world.ownerId !== socket.id)
            }
        }
        // End Game
        worlds.forEach(world => {
            endGame(world)
        })
        socket.broadcast.emit('disconnected', socket.id)
        socket.broadcast.emit('getRooms', worlds)
    })
})