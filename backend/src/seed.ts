/**
 * Seed Script - Creates initial Super Admin user
 * Run: npx ts-node src/seed.ts
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hireflow';

// Inline schema to avoid circular imports
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if Super Admin already exists
    const existing = await User.findOne({ email: 'admin@hireflow.ai' });
    if (existing) {
      console.log('⚠️  Super Admin already exists: admin@hireflow.ai');
      console.log('   Password: Admin@12345');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@12345', salt);
      await User.create({
        name: 'System Admin',
        email: 'admin@hireflow.ai',
        password: hashedPassword,
        role: 'Super Admin',
        isActive: true,
      });
      console.log('🎉 Super Admin created successfully!');
    }

    console.log('\n📋 Demo Accounts:');
    console.log('   Super Admin  → admin@hireflow.ai   / Admin@12345');

    // Create demo HR Manager
    const hrExists = await User.findOne({ email: 'hr@hireflow.ai' });
    if (!hrExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Hr@12345', salt);
      await User.create({
        name: 'Sarah Mitchell',
        email: 'hr@hireflow.ai',
        password: hashedPassword,
        role: 'HR Manager',
        isActive: true,
      });
      console.log('   HR Manager   → hr@hireflow.ai     / Hr@12345');
    }

    // Create demo Interviewer
    const interviewerExists = await User.findOne({ email: 'interviewer@hireflow.ai' });
    if (!interviewerExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Int@12345', salt);
      await User.create({
        name: 'David Kim',
        email: 'interviewer@hireflow.ai',
        password: hashedPassword,
        role: 'Interviewer',
        isActive: true,
      });
      console.log('   Interviewer  → interviewer@hireflow.ai / Int@12345');
    }

    // Create demo Candidate
    const candidateExists = await User.findOne({ email: 'candidate@example.com' });
    if (!candidateExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Cand@12345', salt);
      await User.create({
        name: 'Alex Johnson',
        email: 'candidate@example.com',
        password: hashedPassword,
        role: 'Candidate',
        isActive: true,
      });
      console.log('   Candidate    → candidate@example.com / Cand@12345');
    }

    console.log('\n✅ Seed complete! You can now log in to the application.');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
