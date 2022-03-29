console.inspectEnable = true;
import WebApp from 'webapp';
import { initSocketIO } from './libs/socket_server';
const app = WebApp.createApp();
app.use(WebApp.static('./public'));
import devManager from './libs/sddc_device';
import { ICallBack } from './interfaces/api.interface';
import Device from 'device';

const io = initSocketIO(app);
io.sockets.on('connection', (socket) => {
  console.info('socket connection');

  socket.on('disconnect', () => {
    console.error('disconnect');
  });

  /**
   * 获取设备列表
   */
  socket.on('list', (cb: ICallBack) => {
    cb({ result: true, message: '获取设备列表成功！', data: devManager.getDeviceList() });
  });

  /**
   * 添加控制设备
   */
  socket.on('add-device', (devid: string, cb: ICallBack) => {
    devManager.generateController(devid).then(
      (controller: Device) => {
        const dev = devManager.getDevice(devid);
        controller.on('message', (data) => {
          console.log(data);
        });

        cb({ result: true, message: '添加设备成功！' });
      },
      () => {
        cb({ result: false, message: '请检查应用是否具有控制设备的权限或者重新尝试！' });
      }
    );
  });

  /**
   * 发送设备控制信息
   */
  socket.on('send-message', (devid: string, data: any, cb: ICallBack) => {
    console.log('ai send-message: ', devid, data)
    devManager.sendDeviceInfo(devid, data).then(
      () => {
        cb({ result: true, message: '控制设备成功！' });
      },
      () => {
        cb({ result: false, message: '控制设备失败！' });
      }
    );
  });
});

function emitMessage(event: string, data?: any) {
  io.sockets.emit(event, data);
}

devManager.on('join', (dev) => {
  console.info('ai device join: ', dev.devid, dev.type);
  // 注：设备上线这里未做控制对象自动创建操作！
  emitMessage('list', devManager.getDeviceList())
});

devManager.on('lost', (dev) => {
  console.warn('ai device lost: ', dev.devid, dev.type);
  emitMessage('list', devManager.getDeviceList())
  emitMessage('lost', dev)
});

app.start();
require('iosched').forever();
