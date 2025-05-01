const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const BotName = 'Health Bot';

//Run when a Clients Connects
io.on('connection', socket=> {
    socket.on('joinRoom',({username, room})=>{
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

             //Welcome Current User 
    socket.emit('message',formatMessage(BotName, 'Welcome to JRU Live Consultation'));
    
    setTimeout(() => {
        socket.emit('message', formatMessage(BotName, 'Please Wait for the health Consultant that will assist you, Thank you!'));
      }, 2000);

      setTimeout(() => {
        socket.emit('message', formatMessage(BotName, 'While Waiting Please Make Sure that you already prepared all the needing info'));
      }, 3000);

      setTimeout(() => {
        socket.emit('message', formatMessage(BotName, 'Once the health Consultant is here Make Sure to provide you ID-Number, Full Name, Age, Program and Year, Thank You!'));
      }, 5000);


    //Broadcast When a Student Connects
    socket.broadcast.to(user.room).emit('message',formatMessage(BotName, `Student ${user.username} has Joined the Chat`));

        // Send user room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });

    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username , msg));
    });

    //Runs When User Disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(BotName, `Student ${user.username} has left the chat`));

          // Send user room info
          io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }


    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
