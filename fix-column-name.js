const sequelize = require('./src/db/sequelize');

(async () => {
  try {
    // Check if the column exists with the wrong name
    const [deadlineColumn] = await sequelize.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'events\' AND column_name = \'deadline\'');
    
    if (deadlineColumn && deadlineColumn.length > 0) {
      console.log('Found column with name "deadline", renaming to "certificationDeadline"');
      await sequelize.query('ALTER TABLE events RENAME COLUMN "deadline" TO "certificationDeadline"');
      console.log('Column renamed successfully');
    } else {
      console.log('No "deadline" column found, checking for "certificationDeadline"');
      
      const [certDeadlineColumn] = await sequelize.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'events\' AND column_name = \'certificationDeadline\'');
      
      if (certDeadlineColumn && certDeadlineColumn.length > 0) {
        console.log('"certificationDeadline" column already exists');
      } else {
        console.log('Creating "certificationDeadline" column');
        await sequelize.query('ALTER TABLE events ADD COLUMN "certificationDeadline" TIMESTAMP WITH TIME ZONE');
        console.log('Column created successfully');
      }
    }
    
    // Verify the column was added/renamed
    const [results] = await sequelize.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'events\' AND column_name = \'certificationDeadline\'');
    console.log('certificationDeadline column info:', results);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();