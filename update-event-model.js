const path = require('path');
require('dotenv').config();

// Import the Event model directly from the project
const Event = require('./src/db/Event');
const sequelize = require('./src/db/sequelize');

async function main() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Get the current model attributes
    console.log('Current Event model attributes:', Object.keys(Event.rawAttributes));

    // Check if events table exists and its structure
    const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    const eventsTableExists = tables.some(t => t.table_name === 'events');
    
    if (!eventsTableExists) {
      console.error('Events table does not exist!');
      return;
    }

    // Check table structure
    const [columns] = await sequelize.query(
      "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'events';"
    );
    console.log('Current events table columns:', columns.map(col => col.column_name));

    // Modify the Event model in the database
    console.log('Syncing Event model with database...');
    await Event.sync({ alter: true });
    console.log('Event model synced successfully.');

    // Try to fetch events without certificationDeadline
    console.log('Fetching events without certificationDeadline...');
    const events = await Event.findAll({
      attributes: { exclude: ['certificationDeadline'] }
    });
    console.log(`Found ${events.length} events:`, events.map(e => e.id));

    console.log('All operations completed successfully.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

main();