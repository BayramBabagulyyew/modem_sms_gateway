const { Router } = require('express');
const {  getMessages } = require('../utils/send-sms.util');
const fs = require('fs').promises;
const path = require('path');
const { sendSMSQueue } = require('../config/bull.config');
const router = Router();

router.post('/send-sms', async (req, res) => {

    const { to, message, projectName } = req.body;
    const logsPath = path.join(__dirname, '..', 'sent.json');
    const logEntry = {
        id: (typeof require('crypto').randomUUID === 'function') ? require('crypto').randomUUID() : require('crypto').randomBytes(8).toString('hex'),
        timestamp: new Date().toISOString(),
        to: to,
        message: message,
        projectName: projectName || null,
        ip: req.ip,
        status: 'pending'
    };

    try {
        let logs = [];
        try {
            const content = await fs.readFile(logsPath, 'utf8');
            logs = JSON.parse(content);
            if (!Array.isArray(logs)) logs = [];
        } catch (e) {
            // file doesn't exist or is invalid -> start with empty array
        }
        logs.push(logEntry);
        await fs.writeFile(logsPath, JSON.stringify(logs, null, 2), 'utf8');

        await sendSMSQueue.add({ to, message, id: logEntry.id }, { delay: 5000 });
        return res.json({ 
                    success: true, 
                    data: { 
                        message: 'SMS queued for sending', 
                        logId: logEntry.id 
                    } 
                });
    } catch (err) {
        return res.status(err.status || 500).json({ success: false, message: err.message });
    }
});

router.get('/get-messages', async (req, res) => {
    try {
        const messages = await getMessages();
        try {
            const takenPath = path.join(__dirname, '..', 'taken.json');
            const takenContent = await fs.readFile(takenPath, 'utf8');
            let takenData = JSON.parse(takenContent);

            const takenMap = new Map();

            if (Array.isArray(takenData)) {
                for (const item of takenData) {
                    if (typeof item === 'string') {
                        takenMap.set(item, true);
                    } else if (item && (item.id || item._id)) {
                        takenMap.set(item.id || item._id, item);
                    }
                }
            } else if (takenData && typeof takenData === 'object') {
                for (const [k, v] of Object.entries(takenData)) {
                    takenMap.set(k, v);
                }
            }

            for (const msg of messages) {
                const key = msg.id || msg._id || msg.messageId || msg.uuid;
                const t = key ? takenMap.get(key) : undefined;
                if (t !== undefined) {
                    msg.taken = true;
                    if (typeof t === 'object' && t !== true) msg.takenInfo = t;
                } else {
                    msg.taken = false;
                }
            }
        } catch (e) {
            // ignore missing/invalid taken.json and return messages unchanged
        }
        res.json({ success: true, data:{messages} });
    } catch (err) {
        res.status(err.status || 500).json({ success: false, error: err.message });
    }
});

router.get('/health', async (req, res) => {
    try {
        
        res.json({ 
            success: true, 
            data: {
                message: "I'm alone, bro. Thank you for remembering me.",
                status: "ok"
            } 
        });
    } catch (err) {
        res.status(err.status || 500).json({ success: false, error: err.message });
    }
});

module.exports = router;