const express = require('express');
const router = require('./router/router');
const dotenv = require('dotenv');
dotenv.config();

const port  = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// API key middleware
const checkApiKey = (req, res, next) => {
  // read API key from headers (supports 'x-api-key' or 'Authorization: Bearer <key>')
  const apiKey = req.get('x-api-key');
    
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};


// API VALIDATION MIDDLEWARE
const validate = (req, res, next) => {

  const body = req.body;

  if (!body.to){
    return res.status(400).json({ message: 'Phone number is required' });
  }

  if (!body.message) {
    return res.status(400).json({ message: 'Message content is required' });
  }

  if (!body.projectName) {
    return res.status(400).json({ message: 'Project name is required' });
  }

  next();
};

app.use('/sms', checkApiKey, validate, router);

app.listen(port, () => {
  console.log(`SMS API server running at http://localhost:${port}`);
});

