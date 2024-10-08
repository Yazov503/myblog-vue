import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '@/views/Index.vue'
import BlogDetail from '@/views/BlogDetail.vue'
import NewLogin from '@/views/NewLogin.vue'
import BlogEditor from '@/views/BlogEditor.vue'
import BlogViewer from '@/views/BlogViewer.vue'
import PersonalPage from '@/views/PersonalPage.vue'
import TreeHole from '@/views/TreeHole.vue'
import MessageCenter from '@/views/MessageCenter.vue'
// import AdminLogin from '@/views/AdminLogin.vue'
import test from '@/views/test.vue'

Vue.use(VueRouter)

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}

const routes = [
  {
    path: '/test',
    name: 'test',
    component: test
  },
  {
    path: '/',
    name: 'Index',
    component: Index
  },
  {
    path: '/login',
    name: 'Login',
    component: NewLogin,
  },
  // {
  //   path: '/admin/login',
  //   name: 'AdminLogin',
  //   component: AdminLogin,
  // },
  {
    path: '/blog/view',
    name: 'BlogViewer',
    component: BlogViewer,
  },
  {
    path: '/blog/edit/:blogId?',
    name: 'BlogEditor',
    component: BlogEditor,
    props: true,
  },
  {
    path: '/blog/:blogId',
    name: 'BlogDetail',
    component: BlogDetail,
    props: true,
  },
  {
    path: '/user/:userId',
    name: 'PersonalPage',
    component: PersonalPage,
    props: true,
  },
  {
    path: '/treehole',
    name: 'TreeHole',
    component: TreeHole,
  },
  {
    path: '/message-center',
    name: 'MessageCenter',
    component: MessageCenter,
  },
]

const router = new VueRouter({
  routes,
  mode: 'history',
})

export default router
