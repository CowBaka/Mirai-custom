const os = require('os');
const moment = require('moment-timezone');
const fs = require('fs').promises;
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
    config: {
        name: "upt",
        version: "3.1.0",
        hasPermission: 2,
        credits: "Vtuan rmk Niio-team",
        description: "Hiển thị thông tin hệ thống của bot",
        commandCategory: "Admin",
        usages: "[cpu/ram/all]",
        cooldowns: 5,
        usePrefix: false,
        image: []
    },
    run: async ({ api, event, args }) => {
        const startTime = Date.now();

        function getSystemRAMUsage() {
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            return {
                totalMem: Math.round(totalMem / 1024 / 1024),
                usedMem: Math.round(usedMem / 1024 / 1024),
                freeMem: Math.round(freeMem / 1024 / 1024)
            };
        }

        function getHeapMemoryUsage() {
            const heap = process.memoryUsage();
            return {
                heapTotal: Math.round(heap.heapTotal / 1024 / 1024),
                heapUsed: Math.round(heap.heapUsed / 1024 / 1024),
                external: Math.round(heap.external / 1024 / 1024),
                rss: Math.round(heap.rss / 1024 / 1024)
            };
        }

        async function getDependencyCount() {
            try {
                const packageJsonString = await fs.readFile('package.json', 'utf8');
                const packageJson = JSON.parse(packageJsonString);
                return Object.keys(packageJson.dependencies).length;
            } catch (error) {
                console.error('Không thể đọc file package.json:', error);
                return -1;
            }
        }

        function getFilteredUptime() {
            const uptime = process.uptime();
            const days = Math.floor(uptime / (24 * 60 * 60));
            const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((uptime % (60 * 60)) / 60);
            const seconds = Math.floor(uptime % 60);

            let uptimeString = '';
            if (days > 0) uptimeString += `${days} ngày `;
            if (hours > 0) uptimeString += `${hours} giờ `;
            if (minutes > 0) uptimeString += `${minutes} phút `;
            if (seconds > 0 || uptimeString === '') uptimeString += `${seconds} giây`;

            return uptimeString.trim();
        }

        async function getCPUUsage() {
            const startMeasure = process.cpuUsage();
            await new Promise(resolve => setTimeout(resolve, 100));
            const endMeasure = process.cpuUsage(startMeasure);
            const userUsage = endMeasure.user / 1000000;
            const systemUsage = endMeasure.system / 1000000;
            return (userUsage + systemUsage).toFixed(1);
        }

        const systemRAM = getSystemRAMUsage();
        const heapMemory = getHeapMemoryUsage();
        const uptimeString = getFilteredUptime();
        const dependencyCount = await getDependencyCount();
        const cpuUsage = await getCPUUsage();

        try {
            const pingReal = Date.now() - startTime;
            const botStatus = (pingReal < 200) ? 'mượt mà' : (pingReal < 800) ? 'bình thường' : 'lag';

            const fullInfo = `
°Furin Uptime :>
°Thời gian hoạt động: ${uptimeString}
°Trạng thái bot: ${botStatus}
°RAM còn lại: ${(systemRAM.freeMem / 1024).toFixed(2)}GB
°Ping: ${pingReal}ms
° * Sử dụng /upt cpu/ram để tìm hiểu sâu ! *
`.trim();

            const cpuInfo = `
💻 Thông tin CPU:
   Số core: ${os.cpus().length}
   Sử dụng: ${cpuUsage}%
`.trim();

            const ramInfo = `
📊 Thông tin RAM:
   Tổng RAM hệ thống: ${systemRAM.totalMem}MB
   RAM đã sử dụng: ${systemRAM.usedMem}MB
   RAM còn trống: ${systemRAM.freeMem}MB
🧠 Bộ nhớ Heap:
   Tổng: ${heapMemory.heapTotal}MB
   Đã dùng: ${heapMemory.heapUsed}MB
   Bên ngoài: ${heapMemory.external}MB
   RSS: ${heapMemory.rss}MB
`.trim();

            let replyMsg = '';
            const command = args[0]?.toLowerCase();

            switch (command) {
                case 'cpu':
                    replyMsg = cpuInfo;
                    break;
                case 'ram':
                    replyMsg = ramInfo;
                    break;
                case 'all':
                default:
                    replyMsg = fullInfo;
            }
			let uid = event.senderID;
            api.shareContact(replyMsg, uid, event.threadID, event.messageID);

        } catch (error) {
            console.error('Lỗi khi lấy thông tin hệ thống:', error.message);
            api.sendMessage('Đã xảy ra lỗi khi lấy thông tin hệ thống.', event.threadID, event.messageID);
        }
    }
};
