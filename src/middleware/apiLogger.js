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
    const end = Date.now();
    const responseTime = end - start;

    // Create a copy of the request body and redact sensitive fields
    const requestBodyToLog = { ...req.body };
    if (requestBodyToLog.password) {
      requestBodyToLog.password = '[REDACTED]'; // Mask the password
    }
    // Add other sensitive fields here if necessary, e.g., if (requestBodyToLog.token) { requestBodyToLog.token = '[REDACTED]'; }

    try {
      await ApiLog.create({
        userId: req.user ? req.user.userId : null,
        method: req.method,
        endpoint: req.originalUrl,
        status: res.statusCode,
        requestBody: requestBodyToLog, // Use the redacted body
        responseBody: tryParseJson(responseBody),
        timestamp: new Date(),
        responseTime: responseTime,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
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
