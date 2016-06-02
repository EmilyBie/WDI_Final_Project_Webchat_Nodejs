var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var mongoose = require('mongoose');
var path = require('path');
var engine = require('ejs-locals');
var users = {};

server.listen(3000);

app.engine( 'ejs', engine );
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs'); 

app.use(express.static(path.join(__dirname, 'public')));

//mongodb connection
mongoose.connect('mongodb://localhost/chat', function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('connected to mongodb');
  }
});

var chatSchema = mongoose.Schema({
  nick: String,
  msg: String,
  created: {type: Date, default: Date.now}
});

var Chat = mongoose.model('Message',chatSchema);

//routes
app.get('/', function(req, res) {
  res.render('home');
});

app.get('/group',function(req, res) {
  res.render('groupchat');
});

app.get('/private',function(req, res){
  res.render('privatechat');
});


// server side socket
io.sockets.on('connection',function(socket) {
  var query = Chat.find({});
  query.sort('-created').limit(8).exec(function(err, docs) {
    if (err) throw err;
    socket.emit('load old msgs', docs);
  });

  socket.on('new user', function(data, callback) {
    if (data in users) {
      callback(false);
    } else {
      callback(true);
      socket.nickname = data;
      users[socket.nickname] = socket;
      updateNicknames();
    }

  });

  function updateNicknames() {
    io.sockets.emit('usernames', Object.keys(users));
  }

  socket.on('send message', function(data, callback) {
    var msg = data.trim();
    if (msg.substr(0,3) === '/w ') {
      msg = msg.substr(3);
      var index = msg.indexOf(' ');
      if (index != -1) {
        var name = msg.substring(0,index);
        var msg = msg.substring(index+1);
        if (name in users) {
          users[name].emit('whisper', {msg: msg, nick: socket.nickname});
        } else {
          callback('Error! Enter a valid user');
        }
      } else {
        callback('Error! Please enter a message for your whisper');
      }

    } else {
      var newMsg = new Chat({msg: msg, nick: socket.nickname});
      newMsg.save(function(err) {
        debugger
        if (err) { throw err;}
        io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
      });
    }
  });

  socket.on('disconnect', function(data) {
    if (!socket.nickname) return;
    delete users[socket.nickname];
    updateNicknames();

  });

});