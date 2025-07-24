const axios = require("axios");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs");

module.exports.config = {
    name: "ytb",
    version: "1.0.4",
    hasPermission: 0,
    credits: "Nguyễn Trương Thiện Phát (Pcoder)",
    description: "Tìm kiếm và tải video từ YouTube",
    commandCategory: "Tiện ích",
    usages: "/ytb {search}",
    cooldowns: 5
};

const YOUTUBE_API_KEY = "AIzaSyBK1GqiaujUpy3CIzzD2vfmSmW3V4_-GwI";

async function searchYouTube(query) {
    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                q: query,
                key: YOUTUBE_API_KEY,
                part: "snippet",
                maxResults: 10,
                type: "video",
            },
        });
        return response.data.items.map((video, index) => ({
            index: index + 1,
            title: video.snippet.title,
            videoId: video.id.videoId,
            thumbnail: video.snippet.thumbnails.high.url,
            url: `https://www.youtube.com/watch?v=${video.id.videoId}`
        }));
    } catch (error) {
        console.error("Lỗi khi tìm kiếm video:", error);
        return null;
    }
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    if (!args[0]) {
        return api.sendMessage("furin yeu cau nhap tu khoa tim kiem!", threadID, messageID);
    }
    
    const query = args.join(" ");
    const results = await searchYouTube(query);
    if (!results) return api.sendMessage("❌ Lỗi khi tìm kiếm video!", threadID, messageID);
    
    let message = "🔍 Kết quả tìm kiếm:\n";
    results.forEach(video => {
        message += `${video.index}. ${video.title}\n${video.url}\n`;
    });
    message += "📌 Trả lời tin nhắn này với số thứ tự + mp3 hoặc mp4 để tải!";
    
    const attachments = await Promise.all(
        results.map(async (video) => {
            const response = await axios({ url: video.thumbnail, responseType: "stream" });
            return response.data;
        })
    );
    
    return api.sendMessage({ body: message, attachment: attachments }, threadID, (err, info) => {
        global.client.handleReply.push({
            name: "ytb",
            messageID: info.messageID,
            author: event.senderID,
            results
        });
    }, messageID);
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, messageID, senderID, body } = event;
    if (handleReply.author !== senderID) return;
    
    const args = body.split(" ");
    const index = parseInt(args[0]);
    const type = args[1];
    if (isNaN(index) || !["mp3", "mp4"].includes(type)) {
        return api.sendMessage("❌ Định dạng không hợp lệ! Vui lòng nhập số thứ tự + mp3 hoặc mp4.", threadID, messageID);
    }
    
    const selectedVideo = handleReply.results.find(v => v.index === index);
    if (!selectedVideo) return api.sendMessage("❌ Không tìm thấy video tương ứng!", threadID, messageID);
    
    const url = selectedVideo.url;
    const format = type === "mp3" ? "audioonly" : "videoandaudio";
    const filePath = `/tmp/${selectedVideo.videoId}.${type}`;
    
    try {
        api.sendMessage(`⏳ Đang tải ${type.toUpperCase()} từ: ${selectedVideo.title}`, threadID, messageID);
        
        const stream = ytdl(url, { filter: format, quality: "highestaudio" });
        const file = fs.createWriteStream(filePath);
        
        stream.pipe(file);
        file.on("finish", async () => {
            api.sendMessage({ body: `🎵 Đây là ${type.toUpperCase()} của: ${selectedVideo.title}`, attachment: fs.createReadStream(filePath) }, threadID, messageID);
        });
    } catch (error) {
        console.error("Lỗi khi tải video:", error);
        return api.sendMessage("❌ Lỗi khi tải video!", threadID, messageID);
    }
};
