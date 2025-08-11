const sequelize = require('./src/db/sequelize');
const Event = require('./src/db/Event');

(async () => {
  try {
    console.log('Forcing sync of Event model...');
    await Event.sync({ force: true });
    console.log('Event model synced successfully');
    
    // Verify the table structure
    const [columns] = await sequelize.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'events\'');
    console.log('Events table columns:', columns);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();