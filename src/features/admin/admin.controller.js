const adminService = require('./admin.service');
const fs = require('fs');

async function getApiLogs(req, res, next) {
  try {
    const { userId, endpoint, method, limit } = req.query;
    const logs = await adminService.getApiLogs({ userId, endpoint, method, limit: limit ? parseInt(limit) : 100 });
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

async function getPointRules(req, res, next) {
  try {
    const rules = await adminService.getPointRules();
    res.json({
      success: true,
      data: rules
    });
  } catch (err) {
    next(err);
  }
}

async function updatePointRule(req, res, next) {
  try {
    const { key, value, description } = req.body;
    const rule = await adminService.updatePointRule(key, value, description);
    res.json(rule);
  } catch (err) {
    next(err);
  }
}

async function exportStudentsCsv(req, res, next) {
  try {
    const filePath = await adminService.exportStudentsCsv();
    res.download(filePath, 'students_export.csv', err => {
      if (err) res.status(500).json({ error: 'Failed to download CSV' });
      fs.unlinkSync(filePath);
    });
  } catch (err) {
    next(err);
  }
}

async function getSystemStats(req, res, next) {
  try {
    const stats = await adminService.getSystemStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { getApiLogs, exportStudentsCsv, getPointRules, updatePointRule, getSystemStats }; 