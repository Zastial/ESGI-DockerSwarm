const express = require('express');
const os = require('os');
const morgan = require('morgan');

const app = express();

const PORT = process.env.PORT || 8080;

// Middleware de logs HTTP
app.use(
  morgan(':method :url :status :response-time ms', {
    stream: {
      write: (message) => console.log(`[HTTP] ${message.trim()}`)
    }
  })
);

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
  console.log(`[BOOT] Server listening on 0.0.0.0:${PORT}`);
  console.log(`[BOOT] Hostname: ${os.hostname()}`);
});

module.exports = app;
