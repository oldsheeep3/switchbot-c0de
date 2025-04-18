import { config } from 'dotenv';
import express from 'express';
import { SwitchBotBLE } from "node-switchbot";
import noble from '@abandonware/noble';

// .envファイルの読み込み
config();
const app = express()

// .env読み込み
const PORT = process.env.PORT;
const DEVICEID = process.env.DEVICEID;
const TOKEN = process.env.TOKEN;
const SECRET = process.env.SECRET;
const KEY = process.env.KEY;
const ENC = process.env.ENC;
// https://github.com/shizuka-na-kazushi/switchbot-get-encryption-key

// レスポンス
const res401 = (serial, isLocked) => {
  return {
    "serial": serial,
    "isLocked": isLocked,
    "message": "Authentication failed. Please try again or check your id"
  }
}

app.use(express.json());

// 関数
function auth(id) {
  return true
}

function logWrite(action, sid, msg) {

}

function checkIsLocked() {
  return true
}

const setLock = (lock) => {
  const switchbot = new SwitchBotBLE();
  return switchbot
    .discover({ id: DEVICEID.toUpperCase(), duration: 1000 })
    .then((device_list) => {
      if (device_list.length <= 0) {
        return Promise.resolve("no device detected.");
      }
      const lockDevice = device_list[0];
      lockDevice.setKey(KEY, ENC);
      return lock ? lockDevice.lock() : lockDevice.unlock();
    })
}

// API本体
app.post('/api/lock', (req, res) => {
  const data = req.body;
  const serial = data.serial;
  const isLocked = checkIsLocked();
  console.log('run lock command by',serial,'to',DEVICEID.replace(/[-:]/g, '').toLowerCase());
  console.log('now lock is',isLocked);
  if (auth(serial)) {
    setLock(true).then((result) => {
      console.log(result);
      res.json({
        "serial": serial,
        "isLocked": true
      })
    }).catch((error) => {
      console.error(error);
      res.json(res401(serial, isLocked))
    })
  } else {
    res.json(res401(serial, isLocked))
  }
})

app.post('/api/unlock', (req, res) => {
  const data = req.body;
  const serial = data.serial;
  const isLocked = checkIsLocked();
  if (auth(serial)) {
    setLock(false).then((result) => {
      console.log(result);
      res.json({
        "serial": serial,
        "isLocked": true
      })
    }).catch((error) => {
      console.error(error);
      res.json(res401(serial, isLocked))
    })
  } else {
    res.json(res401(serial, isLocked))
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
