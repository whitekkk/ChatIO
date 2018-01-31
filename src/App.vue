<template>
  <div v-show="nameMe" id="app" class="container-fluid">
    <div class="btn-group" role="group" aria-label="..." style="margin-top:50px;">
      <button type="button" class="btn btn-default" @click="changeRoom(1)">Room1  <span class="badge"> {{countRoom.room1}}</span></button>
      <button type="button" class="btn btn-default" @click="changeRoom(2)">Room2  <span class="badge"> {{countRoom.room2}}</span></button>
      <button type="button" class="btn btn-default" @click="changeRoom(3)">Room2  <span class="badge">  {{countRoom.room3}}</span></button>
    </div>
    <div class="" style="margin-top:20px;">
      {{capitalizeFirstLetter(room)}}
      <button v-show="roomCheck" type="button" class="btn btn-danger" @click="changeRoom(-1)">X</button>
    </div>
    <div v-show="roomCheck" class="col-md-7 col-md-offset-3" style="margin-top:20px;">
      <div class="col-md-8">
        <div class="thumbnail" style="height:50rem;">
          <table class="table table">
            <thead>
                <tr>
                  <th><center>Name</center></th>
                  <th><center>Message</center></th>
                  <th><center>Time</center></th>
                </tr>
            </thead>
            <tbody>
              <tr v-for="item in message">
                <td>{{ item.who }}</td>
                <td>{{ item.message }}</td>
                <td>{{ item.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="input-group">
          <input v-model="myMessage" class="form-control">
            <span class="input-group-btn">
            <button @click="sentMessage" type="button" class="btn btn-default">sent</button>
          </span>
        </div>
      </div>
      <div class="col-md-3">
        <div class="thumbnail" style="height:24rem;">
          <h4>All Users</h4><hr style="margin-top:-5px;">
          <table class="table">
            <tr v-for="item in users">
              <td>{{ item.user }}</td>
              <td>{{ capitalizeFirstLetter(item.room) }}</td>
            </tr>
          </table>
      </div>
      </div>
      <div class="col-md-3">
        <div class="thumbnail" style="height:24rem;">
          <h4>User in Room</h4><hr style="margin-top:-5px;">
        <div v-for="item in joinUsers">
          {{ item.user }}
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
/* global swal */
export default {
  name: 'app',
  data () {
    return {
      nameMe: '',
      message: [],
      room: '',
      myMessage: '',
      users: [],
      joinUsers: [],
      countRoom: {
        room1: 0,
        room2: 0,
        room3: 0
      },
      roomCheck: false
    }
  },
  sockets: {
    connect () {
      console.log('socket connected')
    },
    sendMessage (data) {
      data.time = new Date().toLocaleTimeString()
      this.message.push(data)
    },
    subscribed (data) {
      this.room = data
    },
    nameInvalid (data) {
      if (!data) {
        this.nameMe = ''
      }
    },
    getUsers (data) {
      this.users = data
    },
    roomCount (data) {
      this.countRoom.room1 = data.room1
      this.countRoom.room2 = data.room2
      this.countRoom.room3 = data.room3
    },
    usersInRoom (data) {
      this.joinUsers = data
    }
  },
  methods: {
    changeRoom (num) {
      this.joinUsers = []
      if (this.room !== 'room' + num) {
        this.message = []
        this.roomCheck = true
      }
      this.$socket.emit('unsub', {room: this.room, name: this.nameMe})
      if (num === -1) {
        this.room = ''
        this.roomCheck = false
      } else {
        this.$socket.emit('subscribe', {room: 'room' + num, name: this.nameMe})
      }
    },
    sentMessage () {
      var vm = this
      this.$socket.emit('onChat', {room: this.room, name: this.nameMe, message: this.myMessage})
      this.message.push({message: vm.myMessage, who: vm.nameMe, time: new Date().toLocaleTimeString()})
      this.myMessage = ''
    },
    setName (check) {
      var vm = this
      if (check) {
        swal({
          title: 'Welcome',
          text: 'Input your name.',
          type: 'input',
          inputPlaceholder: '0-8 Charecter',
          html: true
        },
        function (inputValue) {
          if (inputValue === false) {
            return false
          }
          vm.nameMe = inputValue.substring(0, 8)
          if (inputValue === '') {
            vm.nameMe = 'Guest' + Math.floor(Math.random() * 999)
          }
          vm.$socket.emit('nameCheck', vm.nameMe)
          vm.wrongName()
        })
      } else {
        swal({
          title: 'Oop',
          text: 'Your name Invalid.',
          type: 'input',
          inputPlaceholder: '0-8 Charecter',
          html: true
        },
        function (inputValue) {
          if (inputValue === false) {
            return false
          }
          vm.nameMe = inputValue.substring(0, 8)
          if (inputValue === '') {
            vm.nameMe = 'Guest' + Math.floor(Math.random() * 999)
          }
          vm.$socket.emit('nameCheck', vm.nameMe)
          vm.wrongName()
        })
      }
    },
    wrongName () {
      var vm = this
      this.setName()
      setTimeout(function () {
        if (vm.nameMe === '') {
          vm.setName(false)
        }
      }, 1000)
    },
    capitalizeFirstLetter (string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    }
  },
  mounted () {
    this.setName(true)
  },
  computed: {

  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /*margin-top: 60px;*/
}
</style>
<style src="../static/css/page1.css"> </style>
