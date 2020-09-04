import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入axios，用于发送请求
import axios from 'axios'
// axios全局配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 将axios添加到Vue原型对象中
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
