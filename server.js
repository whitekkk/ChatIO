var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var server = require('http').Server(app)
var io = require('socket.io')(server)
var word = require('./word')
var allRoom = {}
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('dist'))
io.on('connection', function (socket) {
  socket.on('setName', function (data) {
    console.log(data)
    socket.broadcast.to(data.room).emit('getName', {
      name: data.name
    })
  })
  socket.on('getReady', function (data) {
    console.log(data)
    socket.broadcast.to(data.room).emit('getReady', data.ready)
    if (data.ready) {
      allRoom[data.room][allRoom[data.room].length - 2]++
    } else {
      allRoom[data.room][allRoom[data.room].length - 2]--
    }
    if (allRoom[data.room][allRoom[data.room].length - 2] === 2) {
      socket.emit('statusPlayer', true)
      socket.broadcast.to(data.room).emit('statusPlayer', true)
    }
  })
  socket.on('get', function (data) {
    console.log(data)
    var inRoom = {
      key: data.room,
      word: allRoom[data.room][data.stat],
      player: allRoom[data.room][allRoom[data.room].length - 1]
    }
    socket.emit('players', inRoom)
    console.log('sending room post', data.room)
    socket.emit('yourLevel', {
      message: data.message,
      who: 'me',
      level: data.stat
    })
    socket.broadcast.to(data.room).emit('rivalLevel', {
      message: data.message,
      who: 'rival',
      level: data.stat
    })
  })
  socket.on('subscribe', function (data) {
    console.log(data)
    console.log(allRoom[data.room])
    if (allRoom[data.room]) {
      console.log('joining room', data.room)
      // console.log(allRoom[data.room][allRoom[data.room].length - 1])
      var check = allRoom[data.room][allRoom[data.room].length - 1]
      if (check === 0) {
        allRoom[data.room][allRoom[data.room].length - 1] = 1
        var inRoom = {
          key: data.room,
          word: allRoom[data.room][0],
          player: 1
        }
        socket.emit('players', inRoom)
        socket.broadcast.to(data.room).emit('players', inRoom)
      } else if (check === 1) {
        allRoom[data.room][allRoom[data.room].length - 1] = 2
        inRoom = {
          key: data.room,
          word: allRoom[data.room][0],
          player: 2
        }
        socket.emit('players', inRoom)
        socket.broadcast.to(data.room).emit('players', inRoom)
      } else {
        socket.emit('players', -1)
      }
      socket.join(data.room)
    } else {
      socket.emit('players', -2)
    }
  })
  socket.on('genRoom', function (data) {
    // console.log("getid");
    var genWord = []
    for (var i = 0; i < word.length; i++) {
      var posi = Math.floor(Math.random() * word[i].length)
      genWord[i] = (word[i][posi])
    }
    // genWord[genWord.length] = Date.now()
    genWord[genWord.length] = 0
    genWord[genWord.length] = 0
    var id = makeId()
    // allRoom.push({[id]: genWord})
    allRoom[id] = genWord
    // console.log(allRoom);
    var waiting = {
      id,
      player: genWord[genWord.length - 1]
    }
    socket.emit('genRoom', waiting)
  })
  socket.on('remove', function (data) {
    // console.log("REMOVE " + data.room);
    // console.log(allRoom[data.room])
    // console.log(allRoom[data.room][allRoom[data.room].length - 1])
    if (allRoom[data.room]) {
      if (allRoom[data.room][allRoom[data.room].length - 1] === 2) {
        allRoom[data.room][allRoom[data.room].length - 1] = 3
        socket.broadcast.to(data.room).emit('players', data.level)
      } else {
        delete allRoom[data.room]
      }
    }
    console.log(allRoom)
  })
  socket.on('singleWords', function () {
    var genWord = []
    for (var i = 0; i < word.length; i++) {
      var posi = Math.floor(Math.random() * word[i].length)
      genWord[i] = (word[i][posi])
    }
    socket.emit('singleWords', genWord)
  })
})
function makeId () {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < 20; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
app.set('port', (process.env.PORT || 3000))
server.listen(app.get('port'), function () {
  console.log('Express server listening on port %d in %s mode', this.address().port, app.settings.env)
})
