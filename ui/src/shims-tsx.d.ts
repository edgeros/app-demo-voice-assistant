import Vue, { VNode } from 'vue';
import Api from './services/apis/index';
import { edger } from '@edgeros/web-sdk';
import store from './store';
import Message from '@/common/Message';

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $api: typeof Api;
    $edger: typeof edger;
    $message: Message;
  }
}
