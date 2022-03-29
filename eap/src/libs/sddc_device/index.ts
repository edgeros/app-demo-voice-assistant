import Device from 'device';
import EventEmitter from 'events';
import { IController, ISimpleDevice } from './type';

class DeviceManager extends EventEmitter {
  private devMap: Map<string, ISimpleDevice>;
  private controllerMap: Map<string, IController>;

  constructor() {
    super();
    this.devMap = new Map();
    this.controllerMap = new Map();
    this.init();
  }

  private init() {
    // 获取当前所有所有设备！
    Device.list(false, (error, list) => {
      if (error) {
        console.error('Device.list error!' + error);
        return this.emit('error', '页面异常，请刷新或退出页面重试！');
      } else {
        this.devMap.clear();
        list.map((item) => {
          Device.info(item.devid, (error, info) => {
            if (error) {
              console.error('Device.info error!' + error);
              this.emit('error', `设备 ${item.alias} 信息初始化失败, 请刷新重试！`);
            } else {
              const type = this.getDeviceType(info);
              this.devMap.set(item.devid, {
                devid: item.devid,
                alias: info.alias,
                type
              });
            }
          });
        });
      }
    });
    Device.on('join', (devid, info) => {
      const type = this.getDeviceType(info);
      const dev: ISimpleDevice = {
        devid,
        alias: info.alias as string,
        type
      };
      this.devMap.set(devid, dev);
      this.emit('join', dev);
    });
    Device.on('lost', (devid) => {
      // 删除控制器
      if (this.controllerMap.has(devid)) {
        this.controllerMap.delete(devid);
      }
      const lostDev = this.devMap.get(devid);
      if (!devid || !lostDev) {
        /* 这里的话，有时候会为空 */
        return this.emit('error', '设备丢失出错异常，请刷新页面！');
      }
      // this.devMap.delete(devid);
      this.emit('lost', lostDev);
    });
  }

  // info(devid: string) {
  //   return new Promise((resolve, reject) => {
  //     Device.info(devid, (error, info) => {
  //       if (error) {
  //         reject(error)
  //       } else {
  //         this.devMap.set(devid, {
  //           devid: devid,
  //           ...info
  //         });
  //         resolve({
  //           devid: devid,
  //           ...info
  //         })
  //       }
  //     });
  //   })
  // }

  /* 构建设备控制对象 */
  generateController(devid: string): Promise<Device | Error> {
    if (this.controllerMap.has(devid)) {
      return Promise.resolve(this.controllerMap.get(devid));
    }
    const controller = new Device();
    return new Promise((resolve, reject) => {
      controller.request(devid, (error) => {
        if (error) {
          console.error('Failed to build device control object', error);
          reject(error);
        } else {
          this.controllerMap.set(devid, controller);
          resolve(controller);
        }
      });
    });
  }

  /* 删除控制器 */
  destroyController(devid: string) {
    this.controllerMap.delete(devid);
  }

  /* 获取设备控制器 */
  getController(devid: string) {
    return this.controllerMap.get(devid);
  }

  /* 获取设备信息 */
  getDevice(devid: string) {
    return this.devMap.get(devid);
  }

  /* 获取设备列表信息 */
  getDeviceList() {
    return [...this.devMap.values()];
  }

  /* 发送设备消息 */
  sendDeviceInfo(devid: string, data: any): Promise<any> {
    const controller = this.controllerMap.get(devid);
    if (!controller) {
      return Promise.reject('Device control object does not exist!');
    }
    return new Promise((resolve, reject) => {
      controller.send(
        data,
        (err) => {
          if (err) {
            reject('Failed to send device message!');
          } else {
            resolve(null);
          }
        },
        1
      );
    });
  }

  /**
   * 获取设备类型
   * @param info 设备信息
   * @returns 设备类型
   */
  private getDeviceType(info) {
    const {
      report: { type, model, name, vendor }
    } = info;
    if (model === 'aqcn02' && name === 'light' && vendor === 'lumi') {
      return 'light';
    }
    return 'other';
  }
}

const devManager = new DeviceManager();

export default devManager;
