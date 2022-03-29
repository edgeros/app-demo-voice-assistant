console.inspectEnable = true;
import WebApp from 'webapp';
import WebSocket from 'websocket';
import crypto from 'crypto';
import socket from 'socket';
import fs from 'fs';
// import { initSocketIO } from './libs/socket_server';
const app = WebApp.createApp();
app.use(WebApp.static('./public'));

const APP_ID = '6499821f';
const API_SECRET = 'MTg4YTU0MmIyZGYxZTA4ODc0YTdmODVh'
const API_KEY = 'b5b7206502c5d71d46867e71239c4788'

let xunfeiClient = undefined;
let xunfeiClientStatus = false;

const buf = fs.readFile('../assets/iat_pcm_8k.pcm') // 测试的音频文件

// const io = initSocketIO(app);
// io.sockets.on('connection', (socket) => {
//   console.info('socket connection')
//   socket.on('disconnect', () => {
//     console.error('disconnect');
//   });
// });
// function emitMessage(event: string, data?: any) {
//   io.sockets.emit(event, data);
// }

const wsServer = WebSocket.createServer('/', app)
wsServer.on('start', () => {
  console.log('websocket start.')
})
wsServer.on('connection', (channel) => {
  console.log('websocket connection.')
  let t = undefined;
  let count = 0;

  // channel.on('message', function (buf) {
  //   // console.log('websocket channel message.', +new Date());
  //   if (!Buffer.isBuffer(buf)) {
  //     if (buf === 'start') {
  //       // 创建讯飞连接
  //       createXunfeiClient()
  //     }
  //     return
  //   }
  //   // console.log(buf.byteLength, xunfeiClientStatus)
  //   // console.log(buf)
  //   // console.log(buf.toString('base64'))
  //   // 40ms 1280 
  //   // 连接讯飞通信
  //   if (xunfeiClientStatus) {
  //     // 通用参数
  //     if (!count) {
  //       // 发送第一个帧数据
  //       console.log('first chunk')
  //       count++;
  //       const params = {
  //         common: {
  //           app_id: APP_ID,
  //         },
  //         business: {
  //           language: 'zh_cn',
  //           domain: 'iat',
  //           accent: 'mandarin',
  //           dwa: 'wpgs',
  //           ptt: 0
  //         },
  //         data: {  
  //           status: 0,
  //           format: 'audio/L16;rate=16000',
  //           encoding: 'raw',
  //           audio: buf.toString('base64')
  //         }
  //       }
  //       xunfeiClientStatus && xunfeiClient.send(params)
  //     } else {
  //       // 发送中间帧数据（超时会进行结束帧数据发送，所以这里都是中间帧数据）
  //       count++
  //       xunfeiClientStatus && xunfeiClient.send({
  //         data: {
  //           status: 1,
  //           format: 'audio/L16;rate=16000',
  //           encoding: 'raw',
  //           audio: buf.toString('base64')
  //         }
  //       })
  //     }
  //     clearTimeout(t);
  //     t = setTimeout(() => {
  //       // 500毫秒内没有接收到消息，则判定为说话结束，发送结束帧数据
  //       console.log('last chunk')
  //       count && xunfeiClientStatus && xunfeiClient.send({
  //         data: {
  //           status: 2,
  //           format: 'audio/L16;rate=16000',
  //           encoding: 'raw',
  //           audio: '',
  //         }
  //       })
  //       console.log('chunk count: ', count)
  //       count = 0
  //     }, 500)
  //   } else {
  //     // createXunfeiClient()
  //   }
  // });
  channel.on('close', () => {
    console.log('websocket channel close.');
  });
})
wsServer.on('stop', () => {
  console.log('websocket stop.')
})
wsServer.start()

createXunfeiClient()
function createXunfeiClient() {
  const url = getAiAudioWebsocketUrl();
  console.info(url)
  // 15s没有音频传输会自动断连
  xunfeiClient = WebSocket.createClient(url, undefined, {
    loadDefaultCerts: true,
    rejectUnauthorized: false
  });


  if (xunfeiClient) {
    xunfeiClient.on('open', () => {
      console.info('xunfei client open.')
      // console.time('xunfei')
      xunfeiClientStatus = true;
      // 讯飞通信测试     

      if (buf) {
        let p = 0,
          chunkSize = 1280;
        const params = {
          common: {
            app_id: APP_ID,
          },
          business: {
            language: 'zh_cn',
            domain: 'iat',
            accent: 'mandarin',
            dwa: 'wpgs',
            ptt: 0
          },
          data: {}
        }
        // console.log(buf.slice(p, p + chunkSize).toString('base64'))
        params.data = {
          status: 0,
          format: 'audio/L16;rate=16000',
          encoding: 'raw',
          audio: buf.slice(p, p + chunkSize).toString('base64'),
        }
        p += chunkSize;
        xunfeiClientStatus && xunfeiClient.send(params)
        const t = setInterval(() => {
          if (p <= buf.byteLength) {
            // console.log(buf.slice(p, p + chunkSize).toString('base64'))

            xunfeiClientStatus && xunfeiClient.send({
              data: {
                status: 1,
                format: 'audio/L16;rate=16000',
                encoding: 'raw',
                audio: buf.slice(p, p + chunkSize).toString('base64'),
              }
            })
            p += chunkSize
          } else {
            xunfeiClientStatus && xunfeiClient.send({
              data: {
                status: 2,
                format: 'audio/L16;rate=16000',
                encoding: 'raw',
                audio: '',
              }
            })
            clearInterval(t)
          }
        }, 40)
      }
    })

    xunfeiClient.on('message', (res: any) => {
      console.info('xunfei client message: ', res)
      // wsServer && wsServer.broadcast(res)
      const resObj = JSON.parse(res)
      if (resObj.code !== 0) {
        console.log(`error code ${resObj.code}, reason ${resObj.message}`)
        return
      }
      if (resObj.data.status !== 2) {
        let str = ''
        resObj.data.result.ws.map((item) => {
          console.log(JSON.stringify(item))
          str += item.cw[0].w
        })
        wsServer && wsServer.broadcast(str)
      }
    })

    xunfeiClient.on('close', () => {
      // console.timeEnd('xunfei')
      console.error('xunfei client close.')
      xunfeiClientStatus = false;
      createXunfeiClient()
    })

    xunfeiClient.on('ping', () => {
      console.log('xunfei client ping.')
    })
  } else {
    console.error('create xunfeiClient error.')
  }
}

function getAiAudioWebsocketUrl() {
  // 请求地址根据语种不同变化
  let url = 'wss://rtasr.xfyun.cn/v1/ws';
  let ts = new Date().getTime() / 1000;
  let md5 = '';
  const sha = crypto.createHmac('sha256', md5);
  sha.update(API_KEY);
  const base64Str = sha.digest('base64').toString();
  return url + '?appid=' + APP_ID + '&ts=' + ts + '&signa=' + encodeURIComponent(base64Str)
}

app.start();
require('iosched').forever();
