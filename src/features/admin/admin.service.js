const Profile = require('../../db/Profile');
const Point = require('../../db/Point');
const User = require('../../db/User');
const ApiLog = require('../../db/ApiLog');
const PointRule = require('../../db/PointRule');
const Event = require('../../db/Event'); // Added top-level import
const Submission = require('../../db/Submission'); // Added top-level import
const pointsService = require('../points/points.service');
const userService = require('../user/user.service');
const { bulkSignupSchema } = require('../user/user.validation');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

async function getApiLogs({ userId, endpoint, method, limit = 100 } = {}) {
  const where = {};
  if (userId) where.userId = userId;
  if (endpoint) where.endpoint = endpoint;
  if (method) where.method = method;
  return ApiLog.findAll({ where, order: [['timestamp', 'DESC']], limit });
}

async function getPointRules() {
  return await pointsService.getPointRules();
}

async function updatePointRule(key, value, description) {
  const [rule, created] = await PointRule.upsert({ key, value, description });
  return rule;
}

async function getSystemStats() {
  try {
    const totalStudents = await Profile.count();
    const totalEvents = await Event.count(); // Using top-level imported Event
    const pendingCertifications = await Submission.count({
      where: { status: 'PENDING' },
    }); // Using top-level imported Submission

    const pointStats = await pointsService.getPointStatistics();

    return {
      totalStudents,
      totalEvents,
      pendingCertifications,
      activeUsers: Math.floor(totalStudents * 0.7), // Estimate
      totalPoints: pointStats.totalPoints,
      averagePoints: pointStats.averagePoints,
    };
  } catch (error) {
    console.error('Error getting system stats:', error);
    return {
      totalStudents: 0,
      totalEvents: 0,
      pendingCertifications: 0,
      activeUsers: 0,
      totalPoints: 0,
      averagePoints: 0,
    };
  }
}

async function exportStudentsCsv() {
  const students = await Profile.findAll({
    include: [
      { model: Point, attributes: ['value'] },
      { model: User, attributes: ['email'] },
    ],
  });

  const records = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.User ? s.User.email : 'N/A',
    degree: s.degree,
    class: s.class,
    status: s.status,
    transport: s.transport,
    hostelInfo: s.hostelInfo,
    batch: s.batch,
    points: s.Point ? s.Point.value : 0,
  }));

  const filePath = path.join(__dirname, '../../students_export.csv');
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'degree', title: 'Degree' },
      { id: 'class', title: 'Class' },
      { id: 'status', title: 'Status' },
      { id: 'transport', title: 'Transport' },
      { id: 'hostelInfo', title: 'Hostel Info' },
      { id: 'batch', title: 'Batch' },
      { id: 'points', title: 'Points' },
    ],
  });
  await csvWriter.writeRecords(records);
  return filePath;
}

async function exportApiLogsCsv() {
  const logs = await ApiLog.findAll({
    order: [['timestamp', 'DESC']],
    include: [
      {
        model: User,
        attributes: ['email'],
      },
    ],
  });

  const records = logs.map((log) => ({
    id: log.id,
    method: log.method,
    endpoint: log.endpoint,
    statusCode: log.status,
    responseTime: log.responseTime,
    timestamp: log.timestamp.toISOString(),
    userId: log.userId,
    userEmail: log.User ? log.User.email : 'N/A',
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    requestBody: JSON.stringify(log.requestBody),
    responseBody: JSON.stringify(log.responseBody),
  }));

  const filePath = path.join(__dirname, '../../api_logs_export.csv');
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'Log ID' },
      { id: 'method', title: 'Method' },
      { id: 'endpoint', title: 'Endpoint' },
      { id: 'statusCode', title: 'Status Code' },
      { id: 'responseTime', title: 'Response Time (ms)' },
      { id: 'timestamp', title: 'Timestamp' },
      { id: 'userId', title: 'User ID' },
      { id: 'userEmail', title: 'User Email' },
      { id: 'ipAddress', title: 'IP Address' },
      { id: 'userAgent', title: 'User Agent' },
      { id: 'requestBody', title: 'Request Body' },
      { id: 'responseBody', title: 'Response Body' },
    ],
  });
  await csvWriter.writeRecords(records);
  return filePath;
}

async function bulkUploadUsers(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  const results = {
    total: data.length,
    successful: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2; // +2 for 1-based index and header row

    try {
      // Validate row data using bulkSignupSchema
      const validatedData = bulkSignupSchema.parse({
        email: row.email,
        password: row.password,
        role: row.role, // Pass role as is, schema will validate/default
      });

      // Check if user already exists
      const existingUser = await userService.findByEmail(validatedData.email);
      if (existingUser) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          email: row.email,
          reason: 'User with this email already exists.',
        });
        continue;
      }

      // Create user
      await userService.createUser(validatedData);
      results.successful++;
    } catch (error) {
      results.failed++;
      let errorMessage = 'Unknown error';
      if (error.errors && Array.isArray(error.errors)) {
        errorMessage = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join('; ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      results.errors.push({
        row: rowNumber,
        email: row.email || 'N/A',
        reason: errorMessage,
      });
    }
  }

  return results;
}

module.exports = {
  getApiLogs,
  exportStudentsCsv,
  getPointRules,
  updatePointRule,
  getSystemStats,
  bulkUploadUsers,
  exportApiLogsCsv,
};
