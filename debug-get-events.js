const sequelize = require('./src/db/sequelize');
const Event = require('./src/db/Event');

(async () => {
  try {
    console.log('Debugging getEvents function...');
    
    // Check if the Event model is properly defined
    console.log('Event model attributes:', Object.keys(Event.rawAttributes));
    
    // Check if there are any events in the database
    const count = await Event.count();
    console.log(`Total events in database: ${count}`);
    
    // Try to fetch events using raw SQL first
    console.log('\nFetching events using raw SQL:');
    const [events] = await sequelize.query('SELECT * FROM events');
    console.log(`Found ${events.length} events via raw SQL`);
    if (events.length > 0) {
      console.log('First event:', events[0]);
    }
    
    // Try to fetch events using Sequelize findAll with specific attributes
    console.log('\nFetching events using Sequelize findAll with specific attributes:');
    try {
      const safeAttributes = ['id', 'name', 'link', 'date', 'type', 'organizer', 'url', 'createdAt', 'updatedAt'];
      const eventsWithAttributes = await Event.findAll({
        attributes: safeAttributes
      });
      console.log(`Found ${eventsWithAttributes.length} events via Sequelize with specific attributes`);
    } catch (error) {
      console.error('Error fetching with specific attributes:', error.message);
    }
    
    // Try to fetch events using Sequelize findAll without certificationDeadline
    console.log('\nFetching events using Sequelize findAll with all attributes except certificationDeadline:');
    try {
      const eventsWithoutCertDeadline = await Event.findAll({
        attributes: { exclude: ['certificationDeadline'] }
      });
      console.log(`Found ${eventsWithoutCertDeadline.length} events via Sequelize excluding certificationDeadline`);
    } catch (error) {
      console.error('Error fetching excluding certificationDeadline:', error.message);
    }
    
    // Try to fetch events using Sequelize findAll with raw: true
    console.log('\nFetching events using Sequelize findAll with raw: true:');
    try {
      const eventsRaw = await Event.findAll({ raw: true });
      console.log(`Found ${eventsRaw.length} events via Sequelize with raw: true`);
    } catch (error) {
      console.error('Error fetching with raw: true:', error.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();