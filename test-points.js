require('dotenv').config();
const sequelize = require('./src/db/sequelize');
const pointsService = require('./src/features/points/points.service');

async function testPointCalculation() {
  try {
    console.log('Testing point calculation system...');
    
    // Sync database
    await sequelize.sync({ force: false });
    console.log('Database synced');
    
    // Test getting point rules
    console.log('\n1. Testing point rules...');
    const rules = await pointsService.getPointRules();
    console.log('Point rules:', rules);
    
    // Test point statistics
    console.log('\n2. Testing point statistics...');
    const stats = await pointsService.getPointStatistics();
    console.log('Point statistics:', stats);
    
    // Test updating all user points
    console.log('\n3. Testing update all user points...');
    const results = await pointsService.updateAllUserPoints();
    console.log('Updated points for users:', results.length);
    
    console.log('\nPoint calculation system test completed successfully!');
  } catch (error) {
    console.error('Error testing point calculation:', error);
  } finally {
    await sequelize.close();
  }
}

testPointCalculation(); 