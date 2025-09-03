import { initializeDatabase } from './index';
import { seedDatabase } from './service';

async function main() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    
    console.log('Seeding database...');
    await seedDatabase();
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();