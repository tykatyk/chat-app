const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {Users} = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
const {isRealString} = require('./utils/validation');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('join', function(params, callback) {
    if(!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room are required');
    }
      socket.join(params.room);
      users.addUser(socket.id, params.name, params.room);

      io.to(params.room).emit('updateUserList', users.getUserList(params.room));
      socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
      socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));
      callback();
  });

  socket.on('createMessage', (message, cb) => {
    console.log('createMessage', message);
    var user = users.getUser(socket.id);
    io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    cb();
  });

  socket.on('createLocationMessage', function (coords) {
    var user = users.getUser(socket.id);
    io.to(user.room).emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
  });

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
