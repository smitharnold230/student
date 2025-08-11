const sequelize = require('../db/sequelize');
const { DataTypes } = require('sequelize');

class Migration {
  constructor() {
    this.migrations = [
      {
        name: '001_add_certification_deadline',
        up: async () => {
          try {
            const [results] = await sequelize.query(`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'events' AND column_name = 'certificationDeadline'
            `);
            
            if (results.length === 0) {
              console.log('Adding certificationDeadline column...');
              await sequelize.query(`
                ALTER TABLE events 
                ADD COLUMN "certificationDeadline" TIMESTAMP WITH TIME ZONE
              `);
              console.log('certificationDeadline column added successfully');
            } else {
              console.log('certificationDeadline column already exists');
            }
          } catch (error) {
            console.error('Error adding certificationDeadline column:', error);
            throw error;
          }
        }
      },
      {
        name: '002_add_verified_by_id',
        up: async () => {
          try {
            const [results] = await sequelize.query(`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'submissions' AND column_name = 'verifiedById'
            `);
            
            if (results.length === 0) {
              console.log('Adding verifiedById column...');
              await sequelize.query(`
                ALTER TABLE submissions 
                ADD COLUMN "verifiedById" UUID
              `);
              console.log('verifiedById column added successfully');
            } else {
              console.log('verifiedById column already exists');
            }
          } catch (error) {
            console.error('Error adding verifiedById column:', error);
            throw error;
          }
        }
      },
      {
        name: '003_add_manual_adjustment_to_points',
        up: async () => {
          try {
            const [results] = await sequelize.query(`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'points' AND column_name = 'manualAdjustment'
            `);
            
            if (results.length === 0) {
              console.log('Adding manualAdjustment column...');
              await sequelize.query(`
                ALTER TABLE points 
                ADD COLUMN "manualAdjustment" INTEGER DEFAULT 0
              `);
              console.log('manualAdjustment column added successfully');
            } else {
              console.log('manualAdjustment column already exists');
            }
          } catch (error) {
            console.error('Error adding manualAdjustment column:', error);
            throw error;
          }
        }
      },
      {
        name: '004_add_status_to_event_participation',
        up: async () => {
          try {
            const [results] = await sequelize.query(`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'eventparticipations' AND column_name = 'status'
            `);
            
            if (results.length === 0) {
              console.log('Adding status column to event participations...');
              await sequelize.query(`
                ALTER TABLE eventparticipations 
                ADD COLUMN "status" VARCHAR(255) DEFAULT 'CONFIRMED'
              `);
              console.log('status column added successfully');
            } else {
              console.log('status column already exists');
            }
          } catch (error) {
            console.error('Error adding status column:', error);
            throw error;
          }
        }
      },
      {
        name: '005_fix_certification_deadline',
        up: async () => {
          try {
            // First check if the column exists with the correct case
            const [results] = await sequelize.query(`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'events' AND lower(column_name) = lower('certificationDeadline')
            `);
            
            if (results.length === 0) {
              // Column doesn't exist at all, create it
              console.log('Adding certificationDeadline column (missing)...');
              await sequelize.query(`
                ALTER TABLE events 
                ADD COLUMN "certificationDeadline" TIMESTAMP WITH TIME ZONE
              `);
              console.log('certificationDeadline column added successfully');
            } else if (results[0].column_name !== 'certificationDeadline') {
              // Column exists but with wrong case, rename it
              console.log('Fixing certificationDeadline column case...');
              await sequelize.query(`
                ALTER TABLE events 
                RENAME COLUMN "${results[0].column_name}" TO "certificationDeadline"
              `);
              console.log('certificationDeadline column renamed successfully');
            } else {
              console.log('certificationDeadline column already exists with correct case');
            }
          } catch (error) {
            console.error('Error fixing certificationDeadline column:', error);
            throw error;
          }
        }
      },
      {
        name: '006_fix_submission_event_fkey_data_integrity',
        up: async () => {
          try {
            console.log('Checking and fixing submission eventId data integrity...');
            // Fetch all submissions with non-null eventId
            const [submissions] = await sequelize.query(`SELECT id, "eventId" FROM submissions WHERE "eventId" IS NOT NULL`);
            // Fetch all existing event IDs
            const [events] = await sequelize.query(`SELECT id FROM events`);
            const existingEventIds = new Set(events.map(e => e.id));

            let fixedCount = 0;
            for (const submission of submissions) {
              // If eventId is present but not in the existing event IDs
              if (submission.eventId && !existingEventIds.has(submission.eventId)) {
                console.log(`Fixing submission ${submission.id}: eventId ${submission.eventId} does not exist in events table. Setting to NULL.`);
                await sequelize.query(`UPDATE submissions SET "eventId" = NULL WHERE id = $1`, { bind: [submission.id] });
                fixedCount++;
              }
            }
            console.log(`Fixed ${fixedCount} submission eventId foreign key violations.`);
          } catch (error) {
            console.error('Error fixing submission eventId data integrity:', error);
            throw error;
          }
        }
      }
    ];
  }

  async runMigrations() {
    console.log('Starting database migrations...');
    
    try {
      // Create migrations table if it doesn't exist
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Get executed migrations
      const [executedMigrations] = await sequelize.query(
        'SELECT name FROM migrations'
      );
      const executedMigrationNames = executedMigrations.map(m => m.name);

      // Run pending migrations
      for (const migration of this.migrations) {
        if (!executedMigrationNames.includes(migration.name)) {
          console.log(`Running migration: ${migration.name}`);
          await migration.up();
          
          // Mark migration as executed
          await sequelize.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            { bind: [migration.name] }
          );
          
          console.log(`Migration ${migration.name} completed successfully`);
        } else {
          console.log(`Migration ${migration.name} already executed`);
        }
      }
      
      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
}

module.exports = Migration;