const env = require('../src/config/env');
const { connectDb } = require('../src/config/db');
const User = require('../src/models/User');
const Schedule = require('../src/models/Schedule');
const { hashPassword } = require('../src/services/password.service');

async function seed() {
  await connectDb(env.mongoUri);

  await Promise.all([User.deleteMany({}), Schedule.deleteMany({})]);

  const manager = await User.create({
    employeeId: 'M100',
    name: 'Manager Demo',
    role: 'manager',
    department: 'Operations',
    passwordHash: hashPassword('ManagerPass123!'),
  });

  const worker = await User.create({
    employeeId: 'W200',
    name: 'Worker Demo',
    role: 'worker',
    department: 'Operations',
    passwordHash: hashPassword('WorkerPass123!'),
  });

  await Schedule.insertMany([
    {
      employeeId: worker.employeeId,
      date: new Date('2026-04-06T00:00:00.000Z'),
      startTime: '09:00',
      endTime: '17:00',
      location: 'HQ',
      notes: 'Morning shift',
      createdBy: manager._id,
    },
    {
      employeeId: worker.employeeId,
      date: new Date('2026-04-07T00:00:00.000Z'),
      startTime: '10:00',
      endTime: '18:00',
      location: 'HQ',
      notes: 'Late shift',
      createdBy: manager._id,
    },
  ]);

  console.log('Seed complete. Demo credentials:');
  console.log('Manager: M100 / ManagerPass123!');
  console.log('Worker: W200 / WorkerPass123!');

  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});

