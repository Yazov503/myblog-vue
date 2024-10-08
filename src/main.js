import Vue from 'vue'
import App from './App.vue'
import router from './router';
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import "@/assets/iconfont/iconfont.css"
import './assets/iconfont/iconfont.css'
import './assets/iconfont/iconfont.js'
import './assets/css/iconfont.css'
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'
import axios from 'axios';
import GlobalBanner from './components/GlobalBanner.vue'
import './config/axios_config.js'
import './config/live2d_config.js'
import "./assets/css/common.css";
// import clickEffect from './config/click_effect_1.js';

// axios全局配置
Vue.prototype.$axios = axios;
axios.defaults.baseURL = 'http://localhost:8888';

// element-ui配置
Vue.use(ElementUI);
Vue.use(Viewer);

// 阻止启动生产消息
Vue.config.productionTip = false

// 全局引入导航栏
Vue.component('GlobalBanner', GlobalBanner);

new Vue({
  router,
  render: h => h(App),
  // mounted() {
  //   clickEffect(); // 初始化特效
  // },
}).$mount('#app')
