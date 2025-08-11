const Profile = require('../../db/Profile');
const Point = require('../../db/Point');
const User = require('../../db/User'); // Import User model
const ApiLog = require('../../db/ApiLog');
const PointRule = require('../../db/PointRule');
const pointsService = require('../points/points.service');
const userService = require('../user/user.service'); // Import userService for user creation
const { signupSchema } = require('../user/user.validation'); // Import signup schema for validation
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx'); // Import xlsx library

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
    const totalEvents = await require('../../db/Event').count();
    const pendingCertifications = await require('../../db/Submission').count({ where: { status: 'PENDING' } });
    
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
      { model: User, attributes: ['email'] } // Include User to get email
    ],
  });
  
  const records = students.map(s => ({
    id: s.id,
    name: s.name,
    email: s.User ? s.User.email : 'N/A', // Get email from User model
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
      // Validate row data using signupSchema
      const validatedData = signupSchema.parse({
        email: row.email,
        password: row.password,
        role: row.role || 'STUDENT', // Default to STUDENT if not provided
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
        errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
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

module.exports = { getApiLogs, exportStudentsCsv, getPointRules, updatePointRule, getSystemStats, bulkUploadUsers };