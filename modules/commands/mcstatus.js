let response;
let axios = require('axios');
this.config = {
  name: "mcstatus",
  version: "1.1.1",
  hasPermission: 0,
  credits: "HuyKaiser",
  description: "Check Minecraft server status",
  commandCategory: "Tìm kiếm",
  usages: "Java/BedRock + ip:port",
  cooldowns: 2,
};

this.run = async function ({ args, api, event }) {
  const vhks = args[0];
  const hks = args[1];

  const send = msg => api.sendMessage(msg, event.threadID, event.messageID);

  if (!vhks || !hks) {
    return send(`Kiểm Tra Trạng Thái của 1 server MC\nUsage: ${this.config.usages}`, event.threadID);
  }

  try {
    switch (vhks) {
      case 'java':
        response = await axios.get(`https://api.mcstatus.io/v2/status/java/${hks}`);
        break;
      case 'bedrock':
        response = await axios.get(`https://api.mcstatus.io/v2/status/bedrock/${hks}`);
        break;
      default:
        return send("Vui Lòng Chọn Phiên Bản Java/BedRock", event.threadID);
    }

    const { online, host, port, players, motd, gamemode, version: serverVersion } = response.data;

    const a = players.online || 0;
    const b = players.max || 0;
    const c = motd.clean || "Not Data!";
    const d = gamemode || "Not Data!";

    send(`°Furin kiểm tra trạng thái\nModel: [ Java/Bedrock ]\nOnline: ${online}\nServer: ${host}:${port}\nHost: ${host}\nPort: ${port}\nOnline: ${a}\nMax Players: ${b}\Tên Server: ${c}\nPhiên Bản: ${serverVersion.name}\n Kiểm Tra bởi Furin Track Server `,
      event.threadID
    );
  } catch (error) {
    send(`Furin Không Thể tìm thấy server . Vui lòng thử lại nhé`, event.threadID);
  }
};
      
