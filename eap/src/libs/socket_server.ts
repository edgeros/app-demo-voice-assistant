import SocketIO from 'socket.io';

export function initSocketIO(app: any, option?: any) {
  const opts = typeof option === 'object' ? option : {}
  return SocketIO(app, {
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
    ...opts
  });
}
