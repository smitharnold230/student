const sequelize = require('./src/db/sequelize');

(async () => {
  try {
    await sequelize.query('ALTER TABLE events ADD COLUMN "certificationDeadline" TIMESTAMP WITH TIME ZONE');
    console.log('certificationDeadline column added successfully');
    
    // Verify the column was added
    const [results] = await sequelize.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'events\' AND column_name = \'certificationDeadline\'');
    console.log('certificationDeadline column info:', results);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();