import { NavBar } from 'vant';
import { Vue, Component } from 'vue-property-decorator';
import style from '../styles/views/audio.module.less';

@Component({
  components: {
    'van-nav-bar': NavBar
  }
})
export default class Audio extends Vue {
  private msg = '';
  private client: WebSocket | undefined = undefined;

  created() {
    console.log('wss://' + location.host);
    this.client = new WebSocket('wss://' + location.host);
    this.client.onopen = () => {
      console.log('websocket open');
    };

    this.client.onmessage = e => {
      // console.log('websocket message: ', e.data);

      this.msg = typeof e.data === 'string' ? e.data : this.msg
    };

    this.client.onclose = () => {
      console.log('websocket close');
    };
  }

  public render() {
    return (
      <eap-layout>
        <van-nav-bar slot='header' title='语音控制测试'></van-nav-bar>
        <div class={style['audio-text']}>{this.msg || '-'}</div>
        <img src={require('../assets/btn.png')} alt='btn' width='80' on-click={this.openXunfeiWebsocket}/>
      </eap-layout>
    );
  }

  private openXunfeiWebsocket() {
    this.client?.OPEN === 1 && this.client.send('start')
  }
}
