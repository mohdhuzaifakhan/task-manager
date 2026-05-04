import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';

async function seed() {
  console.log('🌱 Seeding database...');
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection;

  // Clear existing data
  await db.collection('users').deleteMany({});
  await db.collection('projects').deleteMany({});
  await db.collection('tasks').deleteMany({});
  await db.collection('activities').deleteMany({});

  // Create users
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const memberHash = await bcrypt.hash('Member@123', 10);
  const member2Hash = await bcrypt.hash('Member@123', 10);

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
      passwordHash: member2Hash,
      role: 'MEMBER',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Create projects
  const p1Id = new mongoose.Types.ObjectId();
  const p2Id = new mongoose.Types.ObjectId();
  const p3Id = new mongoose.Types.ObjectId();

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
    },
    {
      _id: p3Id,
      name: 'Analytics Dashboard',
      description: 'Real-time data visualization and business intelligence portal',
      createdBy: adminId,
      members: [adminId, member2Id],
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 10 * 86400000),
      updatedAt: new Date(),
    },
  ]);

  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);
  const nextWeek = new Date(now.getTime() + 7 * 86400000);
  const overdue = new Date(now.getTime() - 3 * 86400000);

  // Create tasks
  await db.collection('tasks').insertMany([
    // E-Commerce Platform tasks
    { title: 'Set up authentication flow', description: 'JWT-based auth with refresh tokens', projectId: p1Id, assignedTo: member1Id, status: 'DONE', priority: 'HIGH', dueDate: yesterday, createdBy: adminId, tags: ['auth', 'backend'], createdAt: new Date(Date.now() - 25 * 86400000), updatedAt: new Date() },
    { title: 'Design product listing page', description: 'Create responsive grid layout with filters', projectId: p1Id, assignedTo: member1Id, status: 'IN_PROGRESS', priority: 'HIGH', dueDate: nextWeek, createdBy: adminId, tags: ['frontend', 'design'], createdAt: new Date(Date.now() - 20 * 86400000), updatedAt: new Date() },
    { title: 'Integrate payment gateway', description: 'Add Stripe payment processing', projectId: p1Id, assignedTo: member2Id, status: 'TODO', priority: 'HIGH', dueDate: nextWeek, createdBy: adminId, tags: ['backend', 'payments'], createdAt: new Date(Date.now() - 15 * 86400000), updatedAt: new Date() },
    { title: 'Shopping cart functionality', description: 'Persistent cart with local storage sync', projectId: p1Id, assignedTo: member2Id, status: 'TODO', priority: 'MEDIUM', dueDate: nextWeek, createdBy: adminId, tags: ['frontend'], createdAt: new Date(Date.now() - 12 * 86400000), updatedAt: new Date() },
    { title: 'Write unit tests for API', description: 'Achieve 80% test coverage on backend', projectId: p1Id, assignedTo: member1Id, status: 'TODO', priority: 'LOW', dueDate: overdue, createdBy: adminId, tags: ['testing'], createdAt: new Date(Date.now() - 10 * 86400000), updatedAt: new Date() },
    { title: 'Deploy to staging environment', description: 'CI/CD pipeline setup with Docker', projectId: p1Id, assignedTo: adminId, status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: overdue, createdBy: adminId, tags: ['devops'], createdAt: new Date(Date.now() - 8 * 86400000), updatedAt: new Date() },

    // Mobile App tasks
    { title: 'Create new design system tokens', description: 'Define color palette, typography, spacing', projectId: p2Id, assignedTo: member1Id, status: 'DONE', priority: 'HIGH', dueDate: yesterday, createdBy: adminId, tags: ['design'], createdAt: new Date(Date.now() - 18 * 86400000), updatedAt: new Date() },
    { title: 'Implement onboarding screens', description: '3-step onboarding with animations', projectId: p2Id, assignedTo: member1Id, status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: nextWeek, createdBy: adminId, tags: ['mobile', 'ui'], createdAt: new Date(Date.now() - 14 * 86400000), updatedAt: new Date() },
    { title: 'Fix navigation drawer bug', description: 'Drawer not closing on Android 12', projectId: p2Id, assignedTo: member2Id, status: 'TODO', priority: 'HIGH', dueDate: overdue, createdBy: adminId, tags: ['bug', 'mobile'], createdAt: new Date(Date.now() - 5 * 86400000), updatedAt: new Date() },

    // Analytics Dashboard tasks
    { title: 'Set up data pipeline', description: 'ETL pipeline from MongoDB to analytics DB', projectId: p3Id, assignedTo: member2Id, status: 'TODO', priority: 'HIGH', dueDate: nextWeek, createdBy: adminId, tags: ['backend', 'data'], createdAt: new Date(Date.now() - 8 * 86400000), updatedAt: new Date() },
    { title: 'Build chart components', description: 'Recharts integration with real-time updates', projectId: p3Id, assignedTo: member1Id, status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: nextWeek, createdBy: adminId, tags: ['frontend', 'charts'], createdAt: new Date(Date.now() - 6 * 86400000), updatedAt: new Date() },
    { title: 'Export to CSV feature', description: 'Allow users to export reports', projectId: p3Id, assignedTo: member2Id, status: 'TODO', priority: 'LOW', dueDate: nextWeek, createdBy: adminId, tags: ['feature'], createdAt: new Date(Date.now() - 3 * 86400000), updatedAt: new Date() },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('Demo Accounts:');
  console.log('  Admin:  admin@taskflow.com  /  Admin@123');
  console.log('  Member: sarah@taskflow.com  /  Member@123');
  console.log('  Member: marcus@taskflow.com /  Member@123');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
