const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Database connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: console.log
});

async function main() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Check if events table exists
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
    console.log('Current events table columns:', columns);

    // Check if certificationDeadline column exists
    const certificationDeadlineExists = columns.some(col => col.column_name === 'certificationDeadline');
    
    if (!certificationDeadlineExists) {
      console.log('Adding certificationDeadline column to events table...');
      await sequelize.query(
        "ALTER TABLE events ADD COLUMN \"certificationDeadline\" TIMESTAMP WITH TIME ZONE;"
      );
      console.log('certificationDeadline column added successfully.');
    } else {
      console.log('certificationDeadline column already exists.');
    }

    // Define Event model with all columns
    const Event = sequelize.define('Event', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      link: {
        type: DataTypes.STRING
      },
      date: {
        type: DataTypes.DATE
      },
      type: {
        type: DataTypes.STRING
      },
      organizer: {
        type: DataTypes.STRING
      },
      url: {
        type: DataTypes.STRING
      },
      certificationDeadline: {
        type: DataTypes.DATE
      }
    }, {
      tableName: 'events',
      timestamps: true
    });

    // Force sync the model with the database
    console.log('Syncing Event model with database...');
    await Event.sync({ alter: true });
    console.log('Event model synced successfully.');

    // Try to create a test event with certificationDeadline
    console.log('Creating test event with certificationDeadline...');
    const testEvent = await Event.create({
      name: 'Test Event',
      link: 'https://example.com',
      date: new Date(),
      type: 'WORKSHOP',
      organizer: 'Test Org',
      url: 'https://example.com',
      certificationDeadline: new Date(Date.now() + 30*24*60*60*1000)
    });
    console.log('Test event created successfully:', testEvent.toJSON());

    // Fetch the test event to verify certificationDeadline is saved
    const fetchedEvent = await Event.findByPk(testEvent.id);
    console.log('Fetched test event:', fetchedEvent.toJSON());

    // Clean up - delete the test event
    await testEvent.destroy();
    console.log('Test event deleted.');

    console.log('All operations completed successfully.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

main();