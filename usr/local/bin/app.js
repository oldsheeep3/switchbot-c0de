import { config } from 'dotenv';
import express from 'express';
import SwitchBot from 'switchbot-api';
import noble from '@abandonware/noble';

// .envファイルの読み込み
config();
const app = express()

// .env読み込み
const PORT = process.env.PORT;
// const TOKEN = process.env.TOKEN;
// const SECRET = process.env.SECRET;
const DEVICEID = process.env.DEVICEID;

const SWITCHBOT_SERVICE_UUID = 'f000aa00-0451-4000-b000-000000000000';
const SWITCHBOT_CHARACTERISTIC_UUID = 'f000aa01-0451-4000-b000-000000000000';

// プリフィックスセットアップ
// const switchbot = new SwitchBot(TOKEN);

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

// SwitchBotの操作
async function connectToDevice(deviceId) {
  noble.on('stateChange', async (state) => {
      if (state === 'poweredOn') {
          console.log('Bluetooth is powered on, starting scan...');
          noble.startScanning([SWITCHBOT_SERVICE_UUID], false);
      } else {
          noble.stopScanning();
      }
  });

  noble.on('discover', async (peripheral) => {
      if (peripheral.id === deviceId) {
          console.log(`Found device: ${peripheral.id}, connecting...`);
          noble.stopScanning();

          peripheral.connect((error) => {
              if (error) {
                  console.error('Connection error:', error);
                  return;
              }
              console.log('Connected to device:', peripheral.id);
              setupNotifications(peripheral);
          });
      }
  });
}

function setupNotifications(peripheral) {
  peripheral.discoverSomeServicesAndCharacteristics(
      [SWITCHBOT_SERVICE_UUID],
      [SWITCHBOT_CHARACTERISTIC_UUID],
      (error, services, characteristics) => {
          const characteristic = characteristics[0];
          // ここでロックとロック解除の関数を定義
          lockDevice(characteristic);
          // unlockDevice(characteristic); // ロック解除の関数を呼ぶ場合
      }
  );
}

function lockDevice(characteristic) {
  // ロックコマンドを送信
  const lockCommand = Buffer.from([0x57, 0x01, 0x00, 0x00, 0x00, 0x00]); // ロックコマンドの例
  characteristic.write(lockCommand, false, (error) => {
      if (error) {
          console.error('Lock command error:', error);
      } else {
          console.log('Lock command sent');
      }
  });
}

function unlockDevice(characteristic) {
  // アンロックコマンドを送信
  const unlockCommand = Buffer.from([0x57, 0x02, 0x00, 0x00, 0x00, 0x00]); // アンロックコマンドの例
  characteristic.write(unlockCommand, false, (error) => {
      if (error) {
          console.error('Unlock command error:', error);
      } else {
          console.log('Unlock command sent');
      }
  });
}

// あなたのSwitchBotデバイスのIDを指定
connectToDevice(DEVICEID);

// API本体
app.post('/api/lock', (req, res) => {
  const data = req.body;
  const serial = data.serial;
  const isLocked = checkIsLocked();
  if (auth(serial)) {
    res.json({
      "serial": serial,
      "isLocked": isLocked
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
    res.json({
      "serial": serial,
      "isLocked": isLocked
    })
  } else {
    res.json(res401(serial, isLocked))
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
