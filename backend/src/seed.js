const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  console.log('Seeding database (JS version)...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection;

    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('projects').deleteMany({});
    await db.collection('tasks').deleteMany({});
    await db.collection('activities').deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const memberHash = await bcrypt.hash('Member@123', 10);

    const adminId = new mongoose.Types.ObjectId();
    const member1Id = new mongoose.Types.ObjectId();
    const member2Id = new mongoose.Types.ObjectId();

    await db.collection('users').insertMany([
      {
        _id: adminId,
        name: 'Alex Turner',
        email: 'admin@taskflow.com',
        passwordHash: adminHash,
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: member1Id,
        name: 'Sarah Chen',
        email: 'sarah@taskflow.com',
        passwordHash: memberHash,
        role: 'MEMBER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: member2Id,
        name: 'Marcus Johnson',
        email: 'marcus@taskflow.com',
        passwordHash: memberHash,
        role: 'MEMBER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log('Users created');

    // Create projects
    const p1Id = new mongoose.Types.ObjectId();
    const p2Id = new mongoose.Types.ObjectId();

    await db.collection('projects').insertMany([
      {
        _id: p1Id,
        name: 'E-Commerce Platform',
        description: 'Build a scalable online shopping experience with modern UX',
        createdBy: adminId,
        members: [adminId, member1Id, member2Id],
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 30 * 86400000),
        updatedAt: new Date(),
      },
      {
        _id: p2Id,
        name: 'Mobile App Redesign',
        description: 'Revamp the iOS and Android apps with new design system',
        createdBy: adminId,
        members: [adminId, member1Id],
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 20 * 86400000),
        updatedAt: new Date(),
      }
    ]);
    console.log('Projects created');

    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    const nextWeek = new Date(now.getTime() + 7 * 86400000);

    // Create tasks
    await db.collection('tasks').insertMany([
      { title: 'Set up authentication flow', description: 'JWT-based auth with refresh tokens', projectId: p1Id, assignedTo: member1Id, status: 'DONE', priority: 'HIGH', dueDate: yesterday, createdBy: adminId, tags: ['auth', 'backend'], createdAt: new Date(), updatedAt: new Date() },
      { title: 'Design product listing page', description: 'Create responsive grid layout', projectId: p1Id, assignedTo: member1Id, status: 'IN_PROGRESS', priority: 'HIGH', dueDate: nextWeek, createdBy: adminId, tags: ['frontend', 'design'], createdAt: new Date(), updatedAt: new Date() },
      { title: 'Integrate payment gateway', description: 'Add Stripe payment processing', projectId: p1Id, assignedTo: member2Id, status: 'TODO', priority: 'HIGH', dueDate: nextWeek, createdBy: adminId, tags: ['backend', 'payments'], createdAt: new Date(), updatedAt: new Date() },
      { title: 'Implement onboarding screens', description: '3-step onboarding with animations', projectId: p2Id, assignedTo: member1Id, status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: nextWeek, createdBy: adminId, tags: ['mobile', 'ui'], createdAt: new Date(), updatedAt: new Date() },
      { title: 'Fix navigation drawer bug', description: 'Drawer not closing on Android 12', projectId: p2Id, assignedTo: member2Id, status: 'TODO', priority: 'HIGH', dueDate: now, createdBy: adminId, tags: ['bug', 'mobile'], createdAt: new Date(), updatedAt: new Date() },
    ]);
    console.log('Tasks created');

    console.log('Database seeded successfully!');
    console.log('');
    console.log('Demo Accounts:');
    console.log('  Admin:  admin@taskflow.com  /  Admin@123');
    console.log('  Member: sarah@taskflow.com  /  Member@123');

  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
