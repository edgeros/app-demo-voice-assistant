import { Vue, Component, Watch } from 'vue-property-decorator';
import '@/styles/animation.less';
import style from '@/styles/views/home.module.less';
import { Route } from 'vue-router';

interface HistoryPath {
  index: number;
  fullPath?: string;
}

@Component({

})
export default class Home extends Vue {
  private transitionName = 'slide-left';
  private historyRouter: Array<HistoryPath> = [];

  @Watch('$route')
  onRouteChange(to: Route, from: Route) {
    const { fullPath, meta } = from;
    if (to.meta.index > from.meta.index) {
      this.transitionName = 'slide-left';
      this.historyRouter.push({ fullPath, index: meta.index });
    } else {
      this.transitionName = 'slide-right';
      this.historyRouter.pop();
    }
  }

  public render() {
    return (
      <div class={style['home']}>
        <div class={style['home-container']}>
          <transition name={this.transitionName}>
            <router-view />
          </transition>
        </div>
      </div>
    );
  }
}
