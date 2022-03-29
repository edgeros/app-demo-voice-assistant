import Vue from 'vue';
import io from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';
import { edger } from '@edgeros/web-sdk';
import store from '@/store';

export let socket: SocketIOClient.Socket;

export function initSocket() {
  if (socket) {
    socket.disconnect();
  }
  socket = io({
    query: {
      'edger-token': store.state.token || '',
      'edger-srand': store.state.srand || ''
    },
    transports: ['websocket']
  });
  socket.on('connect', () => {
    edger.notify.success('通信服务启动成功！');
    console.log(`[Socket.io] connect: `, socket.connected, socket.disconnected);
  });
  socket.on('disconnect', (reason: string) => {
    console.warn(`[Socket.io] disconnect:`, reason);
  });
  socket.on('connect_error', (err: Error) => {
    console.error(`[Socket.io] connect_error:`, err);
  });
  socket.on('connect_timeout', (err: Error) => {
    console.error(`[Socket.io] connect_timeout:`, err);
  });
  socket.on('reconnect', (num: number) => {
    console.log(`[Socket.io] reconnect: ${num}`);
  });
  socket.on('reconnect_attempt', (num: number) => {
    console.log(`[Socket.io] reconnect_attempt: ${num}`);
    edger.notify.error('通信网络中断，正在尝试重新连接！');
    socket.io.opts.query = {
      'edger-token': store.state.token || '',
      'edger-srand': store.state.srand || ''
    };
  });
  socket.on('reconnecting', (num: number) => {
    console.log(`[Socket.io] reconnecting: ${num}`);
  });
  socket.on('reconnect_error', (err: Error) => {
    // 当在reconnectionAttempts次数内无法重新连接的错误事件
    console.error(`[Socket.io] reconnect_error:`, err);
  });
  Vue.use(VueSocketIOExt, socket);
}
