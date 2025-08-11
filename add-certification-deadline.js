const sequelize = require('./src/db/sequelize');

(async () => {
  try {
    console.log('Adding certificationDeadline column to events table...');
    
    // Check if the column already exists
    const [columns] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'events'
      AND column_name = 'certificationDeadline'
    `);
    
    if (columns.length === 0) {
      // Add the column
      await sequelize.query(`
        ALTER TABLE events
        ADD COLUMN "certificationDeadline" TIMESTAMP WITH TIME ZONE
      `);
      console.log('Column added successfully');
    } else {
      console.log('Column already exists');
    }
    
    // Verify the column was added
    const [verifyColumns] = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'events'
      AND column_name = 'certificationDeadline'
    `);
    
    if (verifyColumns.length > 0) {
      console.log(`Column verified: ${verifyColumns[0].column_name} (${verifyColumns[0].data_type})`);
    } else {
      console.log('Column verification failed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();