var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var server = require('http').Server(app)
var io = require('socket.io')(server)
var word = require('./word')
var allRoom = {
  room1: [0],
  room2: [0],
  room3: [0]
}
var allUser = []
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('dist'))
io.on('connection', function (socket) {
  function sentRoom (room1, room2, room3) {
    // ฟังคฺ์ชันส่งค่าการนับจำนวนในแต่ละห้อง
    console.log(room1, room2, room3)
    // if พวกนี้กัน bug
    if (room1 === NaN) {
      room1 = 0
    }
    if (room2 === NaN) {
      room2 = 0
    }
    if (room2 === NaN) {
      room2 = 0
    }
    io.sockets.emit('roomCount', {
      room1: room1,
      room2: room2,
      room3: room3
    })
  }
  function getOut (id) {
    // เตะคอนออกจากห้องจาก ID
    for (i in allRoom) {
      if (allRoom[i].findIndex(who => who.id === id) !== -1) {
        allRoom[i].splice(allRoom[i].findIndex(who => who.id === id), 1)
        allRoom[i][allRoom[i].length - 1]--
      }
    }
  }
  function changeUserRoom (name, room) {
    // จัดการ User ทั้งหมด
    if (allUser[allUser.findIndex(who => who.user === name)].room) {
      allUser[allUser.findIndex(who => who.user === name)].room = room
    }
  }
  socket.emit('getUsers', allUser)
  sentRoom (allRoom.room1[allRoom.room1.length - 1], allRoom.room2[allRoom.room2.length - 1], allRoom.room3[allRoom.room3.length - 1])
  socket.on('subscribe', function (data) {
    getOut (this.id)
    if (allRoom[data.room][allRoom[data.room].length - 1] < 8){
      console.log(data.name, 'joining ', data.room)
      socket.join(data.room)
      allRoom[data.room].splice(allRoom[data.room].length - 1,1)
      allRoom[data.room].push({user: data.name, id: this.id})
      allRoom[data.room].push(allRoom[data.room].length)
      changeUserRoom (data.name, data.room)
      io.sockets.emit('getUsers', allUser)
      sentRoom (allRoom.room1[allRoom.room1.length - 1], allRoom.room2[allRoom.room2.length - 1], allRoom.room3[allRoom.room3.length - 1])
      io.sockets.to(data.room).emit('usersInRoom', allRoom[data.room])
      socket.emit('subscribed', data.room)
    } else {
      socket.emit('usersJoin', -1)
    }
  })
  socket.on('unsub', function (data) {
    getOut (this.id)
    changeUserRoom (data.name, 'Lobby')
    io.sockets.emit('getUsers', allUser)
    io.sockets.to(data.room).emit('usersInRoom', allRoom[data.room])
    sentRoom (allRoom.room1[allRoom.room1.length - 1], allRoom.room2[allRoom.room2.length - 1], allRoom.room3[allRoom.room3.length - 1])
    socket.leave(data.room)
  })
  socket.on('onChat', function (data) {
    socket.broadcast.to(data.room).emit('sendMessage', {
      message: data.message,
      who: data.name,
    })
  })
  socket.on('nameCheck', function (data) {
    let check = true
    if (allUser.findIndex(someuser => someuser.user === data) !== -1) {
      check = !check
    } else {
      allUser.push({user: data, id: this.id, room: 'Lobby'})
      io.sockets.emit('getUsers', allUser)
    }
    socket.emit('nameInvalid', check)
  })
  socket.on('disconnect', function () {
    getOut (this.id)
    allUser.splice(allUser.findIndex(who => who.id === this.id), 1)
    io.sockets.emit('getUsers', allUser)
    sentRoom (allRoom.room1[allRoom.room1.length - 1], allRoom.room2[allRoom.room2.length - 1], allRoom.room3[allRoom.room3.length - 1])
  })
})
app.set('port', (process.env.PORT || 3000))
server.listen(app.get('port'), function () {
  console.log('Express server listening on port %d in %s mode', this.address().port, app.settings.env)
})
