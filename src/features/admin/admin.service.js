const Profile = require('../../db/Profile');
const Point = require('../../db/Point');
const ApiLog = require('../../db/ApiLog');
const PointRule = require('../../db/PointRule');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

async function getApiLogs({ userId, endpoint, method, limit = 100 } = {}) {
  const where = {};
  if (userId) where.userId = userId;
  if (endpoint) where.endpoint = endpoint;
  if (method) where.method = method;
  return ApiLog.findAll({ where, order: [['timestamp', 'DESC']], limit });
}

async function getPointRules() {
  return PointRule.findAll();
}

async function updatePointRule(key, value, description) {
  const [rule, created] = await PointRule.upsert({ key, value, description });
  return rule;
}

async function exportStudentsCsv() {
  const students = await Profile.findAll({
    include: [Point],
  });
  const records = students.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    degree: s.degree,
    class: s.class,
    status: s.status,
    transport: s.transport,
    hostelInfo: s.hostelInfo,
    batch: s.batch,
    points: s.Point ? s.Point.value : 0,
    progression: s.Point ? s.Point.progression : 'Beginner',
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
      { id: 'progression', title: 'Progression' },
    ],
  });
  await csvWriter.writeRecords(records);
  return filePath;
}

module.exports = { getApiLogs, exportStudentsCsv, getPointRules, updatePointRule }; 