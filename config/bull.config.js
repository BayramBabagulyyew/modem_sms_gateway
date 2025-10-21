const Queue = require("bull");
const {
  SENDMESSAGEQUEUE
} = require("../constants/queue.const");
const { sendSMS } = require("../utils/send-sms.util");
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
    
    return sendSMS(job.data.to, job.data.message, job.data.id);
  } catch (err) {
    console.log(err);
  }
});

// Handle completed jobs
sendSMSQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});


module.exports = { sendSMSQueue };
