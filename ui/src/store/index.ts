
import Vuex from 'vuex';
import Vue from 'vue';

Vue.use(Vuex);

const state = {
  token: '',
  srand: '',
  accountInfo: {
    acoid: '',
    nickname: '',
    profile: ''
  },
  devices: []
};

const getters = {};

export default new Vuex.Store({
  state,
  getters,
  mutations: {
    update(state, data) {
      Object.keys(data).forEach((key: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (state as any)[key] = data[key];
      });
    }
  }
});
