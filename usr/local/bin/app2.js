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

async function checkIsLocked() {
  return false
}

const setLock = async (lock) => {
  const switchbot = new SwitchBotBLE({ 'noble': noble});
  console.log('start device discovery');
  try {
    await switchbot.startScan();
    const device = await switchbot.discover({ id: DEVICEID.replace(/[-:]/g, ''), duration: 10000 })
    console.log('find device',device)
    await switchbot.stopScan()
    console.log('divice discovery complete.');
    console.log(device.length)
    if (device.length <= 0) {
      throw new Error('No device detected.');
    }

    const lockDevice = device[0]
    lockDevice.setKey(KEY,ENC);
    console.log('change lock',lockDevice);
    return lock ? await lockDevice.lock() : await lockDevice.unlock()
  } catch(error) {
    console.error(error);
    throw error;
  }
}

// API本体
app.post('/api/lock', async (req, res) => {
  const data = req.body;
  const serial = data.serial;
  const isLocked = await checkIsLocked();
  console.log('run lock command by',serial,'to',DEVICEID.replace(/[-:]/g, '').toLowerCase());
  console.log('now lock is',isLocked);
  if (isLocked) {
    console.log('already locked')
    res.json(res401(serial, isLocked))
  }else{
  if (auth(serial)) {
    try {
      await setLock(true);
      res.json({
        "serial": serial,
        "isLocked": true
      })
    } catch (error) {
      console.error(error);
      res.json(res401())
    }
  } else {
    res.json(res401(serial, isLocked))
  }}
})

app.post('/api/unlock', async (req, res) => {
  const data = req.body;
  const serial = data.serial;
  const isLocked = await checkIsLocked();
  console.log('run unlock command by',serial,'to',DEVICEID.replace(/[-:]/g, '').toLowerCase());
  console.log('now lock is',isLocked);
  if (!isLocked) {
    console.log('already unlocked')
    res.json(res401(serial, isLocked))
  }else{
  if (auth(serial)) {
    try {
      await setLock(false);
      res.json({
        "serial": serial,
        "isLocked": true
      })
    } catch (error) {
      console.error(error);
      res.json(res401())
    }
  } else {
    res.json(res401(serial, isLocked))
  }}
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
