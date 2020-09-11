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
// 导入树状表格
import TreeTable from 'vue-table-with-tree-grid'
// 导入vue富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// axios全局配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(function (config) {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 将axios添加到Vue原型对象中
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

Vue.use(VueQuillEditor)

// 全局过滤器，用于格式化时间
Vue.filter('dataFormat', function (value) {
  const time = new Date(value)
  const y = time.getFullYear()
  const m = (time.getMonth() + 1 + '').padStart(2, '0')
  const d = (time.getDay() + '').padStart(2, '0')
  const hh = (time.getHours() + '').padStart(2, '0')
  const mm = (time.getMinutes() + '').padStart(2, '0')
  const ss = (time.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
