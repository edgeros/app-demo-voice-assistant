import Vue from 'vue';
import './registerServiceWorker';
import router from './router';
import 'normalize.css';
import { edger } from '@edgeros/web-sdk';
import 'vant/lib/index.less';
import App from './App';
import store from '@/store';
import { initSocket } from './services/socket';
edger.avoidKeyboardOverlay();
Vue.config.productionTip = false;

Vue.prototype.$edger = edger;


edger.permission.request({
  code: ['network', 'phone.camera', 'phone.contacts', 'phone.microphone', 'photo.geolocation'],
  type: 'permissions'
}).then(() => {
  console.log('=============== then')
}).catch(() => {
  console.log('============= catch')
}).finally(() => {
  console.log('=========== finally')
})

edger.orientation.lock('portrait')

edger.token().then(data => {
  if (data) {
    store.commit('update', { token: data.token, srand: data.srand });
    // initSocket(data);
  }
});

edger.onAction('token', data => {
  if (data) {
    store.commit('update', { token: data.token, srand: data.srand });
  }
});

initSocket()

edger
  .user()
  .then(result => {
    if (result && result.acoid) {
      console.info(result)
      store.commit('update', { accountInfo: result });
    }
  })
  .catch((error: Error) => {
    throw error;
  })
  .finally(() => {
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app');
  });
