const ApiLog = require('../db/ApiLog');

async function apiLogger(req, res, next) {
  const start = Date.now();
  const oldSend = res.send;
  let responseBody;
  res.send = function (body) {
    responseBody = body;
    return oldSend.apply(this, arguments);
  };
  res.on('finish', async () => {
    try {
      await ApiLog.create({
        userId: req.user ? req.user.userId : null,
        method: req.method,
        endpoint: req.originalUrl,
        status: res.statusCode,
        requestBody: req.body,
        responseBody: tryParseJson(responseBody),
        timestamp: new Date(),
      });
    } catch (err) {
      // fail silently
    }
  });
  next();
}

function tryParseJson(body) {
  if (!body) return null;
  try {
    return typeof body === 'string' ? JSON.parse(body) : body;
  } catch {
    return body;
  }
}

module.exports = apiLogger; 