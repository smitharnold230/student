const sequelize = require('./src/db/sequelize');
const Event = require('./src/db/Event');

(async () => {
  try {
    console.log('Checking events table structure...');
    
    // Check table structure
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'events'
      ORDER BY ordinal_position
    `);
    
    console.log('Events table columns:');
    columns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
    });
    
    // Check if there are any events in the table
    const count = await Event.count();
    console.log(`\nTotal events in database: ${count}`);
    
    if (count > 0) {
      // Try to fetch events using raw query
      console.log('\nFetching events using raw query:');
      const [events] = await sequelize.query('SELECT * FROM events LIMIT 5');
      console.log(JSON.stringify(events, null, 2));
      
      // Try to fetch events using Sequelize
      console.log('\nFetching events using Sequelize:');
      try {
        const sequelizeEvents = await Event.findAll({ limit: 5 });
        console.log(JSON.stringify(sequelizeEvents.map(e => e.toJSON()), null, 2));
      } catch (error) {
        console.error('Error fetching with Sequelize:', error.message);
      }
    }
    
    // Check if there's a mismatch between model and table
    console.log('\nChecking for model-table mismatches:');
    const modelAttributes = Object.keys(Event.rawAttributes);
    const tableColumns = columns.map(c => c.column_name);
    
    console.log('Model attributes:', modelAttributes);
    console.log('Table columns:', tableColumns);
    
    const missingInTable = modelAttributes.filter(attr => !tableColumns.includes(attr));
    const missingInModel = tableColumns.filter(col => !modelAttributes.includes(col));
    
    if (missingInTable.length > 0) {
      console.log('\nAttributes in model but missing in table:', missingInTable);
    }
    
    if (missingInModel.length > 0) {
      console.log('\nColumns in table but missing in model:', missingInModel);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();