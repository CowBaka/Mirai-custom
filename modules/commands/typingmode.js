module.exports.config = {
    name: "typingmode",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "FurinDev Build Team",
    description: "Bật hoặc tắt chế độ giả lập gõ tay",
    commandCategory: "tiện ích",
    usages: "typingmode on | off",
    cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
    const option = args[0]?.toLowerCase();
    if (option !== "on" && option !== "off")
        return api.sendMessage("⚙️ Dùng: typingmode on | off", event.threadID, event.messageID);

    global.simulateTyping = option === "on";
    return api.sendMessage(
        global.simulateTyping
            ? "✅ Đã bật chế độ giả lập gõ tay."
            : "❌ Đã tắt chế độ giả lập gõ tay.",
        event.threadID,
        event.messageID
    );
};
