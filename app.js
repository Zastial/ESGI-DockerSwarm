const express = require('express');
const os = require('os');

const app = express();

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.json({
    hostname: os.hostname()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`);
  console.log(`Hostname: ${os.hostname()}`);
});

module.exports = app;
