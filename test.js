
import { config } from "dotenv";
import { SwitchBotBLE } from "node-switchbot"
config();
const discovery = async () => {
  const switchbot = new SwitchBotBLE();
  console.log('start',process.env.DEVICEID);
  try {
    const device = await switchbot.discover({ id: process.env.DEVICEID, duration: 5000});
    console.log(device)
  } catch(error) {
    console.error(error);
  }
}

discovery();