const sequelize = require('./src/db/sequelize');

(async () => {
  try {
    console.log('Checking event_participations table...');
    
    // Check if there are any event participations with invalid event IDs
    const [invalidParticipations] = await sequelize.query(`
      SELECT ep.* FROM event_participations ep
      LEFT JOIN events e ON ep."eventId" = e.id
      WHERE e.id IS NULL
    `);
    
    console.log('Found invalid participations:', invalidParticipations.length);
    
    if (invalidParticipations.length > 0) {
      console.log('Removing invalid event participations...');
      const invalidIds = invalidParticipations.map(p => `'${p.id}'`).join(',');
      await sequelize.query(`DELETE FROM event_participations WHERE id IN (${invalidIds})`);
      console.log('Invalid participations removed');
    }
    
    // Check if the foreign key constraint exists
    const [constraints] = await sequelize.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'event_participations'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name = 'event_participations_eventId_fkey'
    `);
    
    if (constraints.length === 0) {
      console.log('Adding foreign key constraint...');
      await sequelize.query(`
        ALTER TABLE event_participations
        ADD CONSTRAINT event_participations_eventId_fkey
        FOREIGN KEY ("eventId") REFERENCES events(id)
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('Foreign key constraint added');
    } else {
      console.log('Foreign key constraint already exists');
    }
    
    console.log('Event participations table fixed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();