const sequelize = require('./src/db/sequelize');
const Event = require('./src/db/Event');

(async () => {
  try {
    console.log('Checking events table structure...');
    
    // First, check if there are any events in the table
    const [events] = await sequelize.query('SELECT COUNT(*) FROM events');
    console.log('Current events count:', events[0].count);
    
    // Check if the certificationDeadline column exists
    const [certDeadlineColumn] = await sequelize.query(
      'SELECT column_name FROM information_schema.columns WHERE table_name = \'events\' AND column_name = \'certificationDeadline\''
    );
    
    if (certDeadlineColumn.length === 0) {
      console.log('Adding certificationDeadline column to events table...');
      await sequelize.query('ALTER TABLE events ADD COLUMN "certificationDeadline" TIMESTAMP WITH TIME ZONE');
      console.log('Column added successfully');
    } else {
      console.log('certificationDeadline column already exists');
    }
    
    // Verify the table structure
    const [columns] = await sequelize.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'events\'');
    console.log('Events table columns:', columns);
    
    // Create a test event to verify everything works
    console.log('Creating a test event...');
    const testEvent = await Event.create({
      name: 'Test Event After Fix',
      link: 'https://example.com',
      date: new Date(),
      type: 'WORKSHOP',
      organizer: 'Test Org',
      url: 'https://example.com',
      certificationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    console.log('Test event created successfully:', testEvent.toJSON());
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();