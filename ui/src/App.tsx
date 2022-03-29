import { Vue, Component } from "vue-property-decorator";
import "@/styles/eap.less";

@Component
export default class App extends Vue {
  public render() {
    return (
      <div id="app">
          <router-view></router-view>
      </div>
    );
  }
}
