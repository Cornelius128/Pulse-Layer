import { seedAccountsDatabase } from './indexer';

async function run() {
  console.log('Running database seed script...');
  await seedAccountsDatabase(1050);
  console.log('Seeding finished.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
