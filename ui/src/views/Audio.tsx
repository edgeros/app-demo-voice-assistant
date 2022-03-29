import { Vue, Component, Watch } from 'vue-property-decorator';
import IatRecorder from '@/assets/xunfei/IatRecorder.js';
import { Button, Checkbox, CheckboxGroup, Dialog, NavBar, Notify, Switch } from 'vant';
import style from '../styles/views/audio.module.less';
import timgGif from '../assets/timg.gif';
import timgPng from '../assets/timg.png';
import robot1Png from '../assets/robot1.gif';
// import robot2Png from '../assets/robot2.gif';
// import robot3Png from '../assets/robot3.gif';
// import robot4Png from '../assets/robot4.gif';
import prepareAudio from '../assets/audio/好的我在.mp3';
import okAudio from '../assets/audio/好的主人.mp3';
import undefineAudio from '../assets/audio/没有听懂您的意思.mp3';
import { ISimpleDevice } from '@/interfaces/device.interface';
import { IResponse } from '@/interfaces/common.interface';

// const LIGHT_SCENES = [
//   // 灯泡场景
//   'relax', // 亮黄光 - smile
//   'night', // 暗黄光 - sad
//   'movies', // 浅黄
//   'wakeup', // 白光 - neutral
//   'dinner', // 浅浅黄
//   'reading' // 浅浅黄
// ];

Vue.use(Dialog);

@Component({
  components: {
    'van-nav-bar': NavBar,
    'van-checkbox-group': CheckboxGroup,
    'van-checkbox': Checkbox,
    'van-button': Button,
    'van-switch': Switch
  },
  sockets: {
    list(data: ISimpleDevice[]) {
      this.$data.devList = data;
    },
    lost(data: ISimpleDevice) {
      if (this.$data.selectedDevids.includes(data.devid)) {
        Notify({ message: `${data.alias}设备掉线！` });
        this.$data.selectedDevids = this.$data.selectedDevids.filter((item: string) => {
          return item !== data.devid;
        });
        this.$data.selectedDevs = this.$data.selectedDevids.filter((item: ISimpleDevice) => {
          return item.devid !== data.devid;
        });
      }
    }
  }
})
export default class Audio extends Vue {
  iatRecorder: any = null;
  audio = '';
  devList: ISimpleDevice[] = [];
  selectedDevids: string[] = [];
  selectedDevs: ISimpleDevice[] = [];
  t = 0;
  showDeviceDialog = false;
  init = false;

  public created() {
    this.$socket.client.emit('list', (res: IResponse) => {
      if (res.result) {
        this.devList = res.data || [];
      }
    });
  }

  public mounted() {
    this.iatRecorder = new IatRecorder();
  }

  @Watch('iatRecorder.resultText', { immediate: true })
  public watchText(result: string) {
    if (result) {
      if (result.includes('小爱小爱')) {
        Notify({ message: '主人我在！', type: 'success' });
        this.playAudio(prepareAudio);
        this.t = setTimeout(() => {
          this.playAudio(undefineAudio);
        }, 8000);
      } else if (result.includes('开灯')) {
        this.playAudio(okAudio);
        this.selectedDevs.map(item => {
          if (item.type === 'light') {
            Notify({ message: '开始打开灯光...', type: 'success' });
            this.$socket.client.emit('send-message', item.devid, { channel0: true }, (res: IResponse) => {
              console.log(res);
            });
          }
        });
      } else if (result.includes('关闭灯光') || result.includes('关灯')) {
        this.playAudio(okAudio);
        this.selectedDevs.map(item => {
          if (item.type === 'light') {
            Notify({ message: '开始关闭灯光...', type: 'success' });
            this.$socket.client.emit('send-message', item.devid, { channel0: false }, (res: IResponse) => {
              console.log(res);
            });
          }
        });
      } else if (result.includes('打开夜晚模式')) {
        this.playAudio(okAudio);
        this.selectedDevs.map(item => {
          if (item.type === 'light') {
            Notify({ message: '开始打开夜晚模式...', type: 'success' });
            this.$socket.client.emit('send-message', item.devid, { scenes: 'night' }, (res: IResponse) => {
              console.log(res);
            });
          }
        });
      } else if (result.includes('打开日常模式')) {
        this.playAudio(okAudio);
        this.selectedDevs.map(item => {
          if (item.type === 'light') {
            Notify({ message: '开始打开日常模式...', type: 'success' });
            this.$socket.client.emit('send-message', item.devid, { scenes: 'wakeup' }, (res: IResponse) => {
              console.log(res);
            });
          }
        });
      }
    }
  }

  public render() {
    return (
      <div class={style['audio']}>
        <audio ref='audio' src={this.audio} muted={false} autoplay></audio>
        <h2>语音控制测试</h2>
        {this.init && (
          <div class={style['audio-robot']}>
            <img src={robot1Png} alt='robot' />
          </div>
        )}
        {this.iatRecorder && <div class={style['audio-text']}>{this.iatRecorder.resultText || '-'}</div>}

        <div class={style['audio-status']}>
          <van-button
            type={this.selectedDevids.length ? 'primary' : 'default'}
            icon='plus'
            on-click={() => {
              this.showDeviceDialog = true;
            }}>
            设备管理
          </van-button>
          
          <van-button
            type={this.iatRecorder?.status === 'ing' ? 'primary' : 'danger'}
            icon={this.iatRecorder?.status === 'ing' ? 'success' : 'cross'}>
            讯飞连接
          </van-button>
        </div>

        <van-dialog v-model={this.showDeviceDialog} title='选择控制设备' showConfirmButton={false} closeOnClickOverlay>
          <div class={style['audio-device']}>
            <van-checkbox-group v-model={this.selectedDevids}>
              {this.devList.map(item => {
                return (
                  <van-checkbox name={item.devid} on-click={() => this.switchDeviceSelect(item)}>
                    {item.alias}
                  </van-checkbox>
                );
              })}
            </van-checkbox-group>
          </div>
        </van-dialog>

        {!this.init && (
          <div class={style['audio-btn']}>
            <img
              // src={this.iatRecorder && this.iatRecorder.status === 'ing' ? timgGif : timgPng}
              src={timgPng}
              alt='btn'
              on-click={this.switchStatus}
            />
          </div>
        )}

        <p class={style['audio-tips']}>
          控制可用命令：【小爱小爱】； 【打开灯光】； 【开灯】； 【关闭灯光】； 【关灯】； 【打开夜晚模式】；
          【打开日常模式】
        </p>
      </div>
    );
  }

  switchStatus() {
    if (this.iatRecorder && !this.init) {
      this.init = true;
      if (this.iatRecorder.status === 'ing') {
        this.iatRecorder.stop();
      } else {
        this.iatRecorder.start();
      }
    }
  }

  playAudio(src: string) {
    clearTimeout(this.t);
    this.audio = src;
    (this.$refs.audio as HTMLAudioElement).load();
  }

  private switchDeviceSelect(dev: ISimpleDevice) {
    if (this.selectedDevids.includes(dev.devid)) {
      // 添加
      this.$socket.client.emit('add-device', dev.devid, (res: IResponse) => {
        if (res.result) {
          this.selectedDevs.push(dev);
          this.$edger.notify.success(res.message);
        } else {
          this.selectedDevids = this.selectedDevids.filter(item => {
            return item !== dev.devid;
          });
          this.$edger.notify.error(res.message);
        }
      });
    } else {
      // 移除
      this.$edger.notify.success('移除设备成功！');
      this.selectedDevs = this.selectedDevs.filter(item => {
        return item.devid !== dev.devid;
      });
    }
  }
}
