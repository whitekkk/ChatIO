// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueSocketio from 'vue-socket.io'
Vue.use(VueSocketio, '192.168.1.25:3000') // Automaticly socket connect from url string
// var url = window.location.href // get url
// Vue.use(VueSocketio, url)
// Vue.use(VueSocketio, '192.168.1.3:3000') // white
Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
