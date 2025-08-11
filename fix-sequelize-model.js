const sequelize = require('./src/db/sequelize');
const Event = require('./src/db/Event');

(async () => {
  try {
    console.log('Fixing Sequelize model cache issue...');
    
    // Force Sequelize to refresh its internal model cache
    await sequelize.sync({ alter: true });
    
    console.log('Sequelize models synced with database');
    
    // Verify the Event model can access the certificationDeadline field
    const eventAttributes = Object.keys(Event.rawAttributes);
    console.log('Event model attributes:', eventAttributes);
    
    // Check database table structure
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'events'
      ORDER BY ordinal_position
    `);
    
    console.log('Database table columns:');
    columns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });
    
    // Try to create a test event with certificationDeadline
    const testEvent = await Event.create({
      name: 'Test Event With Certification Deadline',
      link: 'https://example.com',
      date: new Date(),
      type: 'WORKSHOP',
      organizer: 'Test Org',
      url: 'https://example.com',
      certificationDeadline: new Date()
    });
    
    console.log('Successfully created test event with certificationDeadline:', testEvent.id);
    
    // Try to fetch the event back
    const fetchedEvent = await Event.findByPk(testEvent.id);
    console.log('Fetched event:', fetchedEvent.toJSON());
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();