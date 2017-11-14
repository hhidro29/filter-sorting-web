import Vue from 'vue'
import Router from 'vue-router'
import BootstrapVue from 'bootstrap-vue'
import nav from '@/components/navbar'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(Router)
Vue.use(BootstrapVue)
export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: nav
    }
  ]
})
