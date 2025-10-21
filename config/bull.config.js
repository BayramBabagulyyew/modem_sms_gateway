const Queue = require("bull");
const {
  SENDMESSAGEQUEUE
} = require("../constants/queue.const");
const { sendSMS, checkBalance } = require("../utils/send-sms.util");
const path = require('path');
const fs = require('fs').promises;
require("dotenv").config();

const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  },
};

// Create a new queue
const sendSMSQueue = new Queue(SENDMESSAGEQUEUE, redisConfig);

// Process jobs videos
sendSMSQueue.process(async (job) => {
  try {
    
    const sent = await sendSMS(job.data.to, job.data.message, job.data.id);

    const logsPath = path.join(__dirname, '..', 'sent.json');
    const logEntry = {
      id: (typeof require('crypto').randomUUID === 'function') ? require('crypto').randomUUID() : require('crypto').randomBytes(8).toString('hex'),
      timestamp: new Date().toISOString(),
      to: job.data.to,
      message: job.data.message,
      projectName: job.data.projectName || null,
      ip: job.data.ip || null,
      status: 'sent'
    };

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
    
  } catch (err) {
    console.log(err);
    checkBalance()
  }
});

// Handle completed jobs
sendSMSQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});


module.exports = { sendSMSQueue };
