// utils/typing.js
const delay = ms => new Promise(res => setTimeout(res, ms));

function patchSendMessage(api, { interval = 70, minLength = 1 } = {}) {
    const originalSendMessage = api.sendMessage;

    api.sendMessage = async function(message, threadID, messageID, callback) {
        if (!global.simulateTyping || typeof message !== 'string' || message.length <= minLength) {
            return originalSendMessage.call(api, message, threadID, messageID, callback);
        }

        try {
            api.sendTypingIndicator(threadID, true);
            let typed = '';
            for (let i = 0; i < message.length; i++) {
                typed += message[i];
                await delay(interval);
            }
            api.sendTypingIndicator(threadID, false);
            return originalSendMessage.call(api, typed, threadID, messageID, callback);
        } catch (err) {
            console.error('[simulateTyping] Error:', err);
            return originalSendMessage.call(api, message, threadID, messageID, callback);
        }
    };
}

module.exports = { patchSendMessage };
