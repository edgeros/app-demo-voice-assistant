import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home'),
    redirect: 'audio',
    children: [{ path: '/audio', name: 'audio', component: () => import('../views/Audio') }]
  }
];

const router = new VueRouter({
  routes
});

export default router;
