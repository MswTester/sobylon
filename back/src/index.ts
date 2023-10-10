import express from 'express';
import { Server, Socket } from 'socket.io';

const app = express()

app.use('/public', express.static(`${__dirname}/../../front/dist`))

app.get('/', (req,res) => {
    res.redirect('/public/index.html');
});

const server = app.listen(3000)
const io = new Server(server)

let world:{[key:string]:number[]} = {}

io.on('connection', socket => {
    console.log('connected', socket.id)
    world[socket.id] = [0,5,0]
    socket.emit('init', world)
    socket.on('update', (pos:number[]) => {
        world[socket.id] = pos
        socket.broadcast.emit('update', socket.id, pos)
    })
    socket.on('disconnect', () => {
        console.log('disconnected', socket.id)
        delete world[socket.id]
        socket.broadcast.emit('disconnected', socket.id)
    })
})