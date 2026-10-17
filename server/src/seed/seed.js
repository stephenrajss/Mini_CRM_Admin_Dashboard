import { getEnv } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { Lead } from '../models/Lead.js';
import { Task } from '../models/Task.js';
import { hashPassword } from '../services/userService.js';
import { normalizeName } from '../utils/names.js';
import { getZonedDayBounds } from '../utils/date.js';
import { passwordSchema } from '../validators/common.js';

const env = getEnv();

function requireSeedValue(name, value) {
  if (!value || !String(value).trim()) {
    throw new Error(`${name} is required to run the seed script`);
  }
  return String(value).trim();
}

async function upsertUser({ name, email, password, role }) {
  const passwordCheck = passwordSchema.safeParse(password);

  if (!passwordCheck.success) {
    throw new Error(`${email}: ${passwordCheck.error.issues[0].message}`);
  }

  const passwordHash = await hashPassword(password);
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  if (existing) {
    existing.name = name;
    existing.role = role;
    existing.isActive = true;
    existing.passwordHash = passwordHash;
    await existing.save();
    return existing;
  }
  return User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role,
    isActive: true,
  });
}

async function upsertCompany(data, createdBy) {
  const nameNormalized = normalizeName(data.name);
  
  return Company.updateOne(
    { nameNormalized },
    {
      $set: {
        name: data.name,
        nameNormalized,
        industry: data.industry,
        location: data.location,
        website: data.website || '',
        phone: data.phone || '',
        description: data.description || '',
        createdBy,
      },
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
}

async function upsertLead(data) {
  return Lead.updateOne(
    { email: data.email.toLowerCase() },
    {
      $set: {
        ...data,
        email: data.email.toLowerCase(),
        isDeleted: false,
        deletedAt: null,
      },
    },
    { upsert: true },
  );
}

async function upsertTask(data) {
  return Task.updateOne(
    { title: data.title },
    { $set: data },
    { upsert: true },
  );
}

async function seed() {
  const adminName = requireSeedValue('ADMIN_NAME', env.ADMIN_NAME);
  const adminEmail = requireSeedValue('ADMIN_EMAIL', env.ADMIN_EMAIL);
  const adminPassword = requireSeedValue('ADMIN_PASSWORD', env.ADMIN_PASSWORD);
  const userPassword = requireSeedValue('SEED_USER_PASSWORD', env.SEED_USER_PASSWORD);

  await connectDB(env.MONGODB_URI);

  const admin = await upsertUser({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
  });
  const priya = await upsertUser({
    name: 'Priya Shah',
    email: 'priya.shah@minicrm.local',
    password: userPassword,
    role: 'user',
  });
  const james = await upsertUser({
    name: 'James Okonkwo',
    email: 'james.okonkwo@minicrm.local',
    password: userPassword,
    role: 'user',
  });

  const northwind = await upsertCompany({
    name: 'Northwind Analytics',
    industry: 'Software',
    location: 'Austin, TX',
    website: 'https://northwind.example',
    phone: '+1-512-555-0140',
    description: 'Product analytics platform for mid-market teams.',
  }, admin._id);
  const harbor = await upsertCompany({
    name: 'Harbor & Co.',
    industry: 'Logistics',
    location: 'Seattle, WA',
    website: 'https://harbor.example',
    phone: '+1-206-555-0172',
    description: 'Regional freight coordination.',
  }, admin._id);
  const lumen = await upsertCompany({
    name: 'Lumen Health',
    industry: 'Healthcare',
    location: 'Boston, MA',
    website: 'https://lumen.example',
    phone: '+1-617-555-0194',
    description: 'Outpatient clinic network.',
  }, admin._id);
  const brightpath = await upsertCompany({
    name: 'Brightpath Retail',
    industry: 'Retail',
    location: 'Chicago, IL',
    website: 'https://brightpath.example',
    phone: '+1-312-555-0118',
    description: 'Specialty retail group.',
  }, admin._id);

  const leadDefs = [
    ['Ava Thompson', 'ava.thompson@example.com', '+1-512-555-0101', 'new', priya, northwind, 'Asked for a product overview.'],
    ['Liam Patel', 'liam.patel@example.com', '+1-206-555-0102', 'contacted', james, harbor, 'Spoke with operations lead.'],
    ['Sofia Alvarez', 'sofia.alvarez@example.com', '+1-617-555-0103', 'qualified', priya, lumen, 'Budget confirmed for Q4.'],
    ['Noah Kim', 'noah.kim@example.com', '+1-312-555-0104', 'lost', james, brightpath, 'Chose another vendor.'],
    ['Mia Chen', 'mia.chen@example.com', '+1-512-555-0105', 'new', admin, northwind, 'Inbound from the website.'],
    ['Ethan Brooks', 'ethan.brooks@example.com', '+1-206-555-0106', 'contacted', priya, harbor, 'Requested a security review.'],
    ['Olivia Rossi', 'olivia.rossi@example.com', '+1-617-555-0107', 'qualified', james, lumen, 'Ready for a proposal.'],
    ['Mason Wright', 'mason.wright@example.com', '+1-312-555-0108', 'new', priya, brightpath, 'Met at a retail conference.'],
    ['Isabella Nguyen', 'isabella.nguyen@example.com', '+1-512-555-0109', 'contacted', admin, northwind, 'Waiting on stakeholder intro.'],
    ['Lucas Ferreira', 'lucas.ferreira@example.com', '+1-206-555-0110', 'qualified', james, harbor, 'Pilot approved.'],
    ['Amelia Clark', 'amelia.clark@example.com', '+1-617-555-0111', 'lost', priya, lumen, 'Timing slipped to next year.'],
    ['Benjamin Scott', 'benjamin.scott@example.com', '+1-312-555-0112', 'new', james, brightpath, 'Needs pricing options.'],
  ];

  const leads = {};
  for (const [name, email, phone, status, assignee, company, notes] of leadDefs) {
    const lead = await upsertLead({
      name,
      email,
      phone,
      status,
      assignedTo: assignee._id,
      company: company._id,
      notes,
      createdBy: admin._id,
    });
    leads[email] = lead;
  }

  const { start, end } = getZonedDayBounds(env.APP_TIMEZONE);
  const today = new Date(start.getTime() + 12 * 60 * 60 * 1000);
  const yesterday = new Date(start.getTime() - 12 * 60 * 60 * 1000);
  const inThreeDays = new Date(end.getTime() + 2 * 24 * 60 * 60 * 1000);
  const inFiveDays = new Date(end.getTime() + 4 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(end.getTime() + 6 * 24 * 60 * 60 * 1000);

  const taskDefs = [
    ['Intro call with Ava Thompson', 'Confirm goals and timeline.', 'ava.thompson@example.com', priya, yesterday, 'pending', null],
    ['Send proposal to Sofia Alvarez', 'Include the clinic rollout plan.', 'sofia.alvarez@example.com', priya, today, 'in_progress', null],
    ['Qualify Harbor logistics needs', 'Review freight volume.', 'liam.patel@example.com', james, inThreeDays, 'pending', null],
    ['Contract review for Olivia Rossi', 'Legal has the draft.', 'olivia.rossi@example.com', james, today, 'pending', null],
    ['Close the loop with Noah Kim', 'Capture why the deal was lost.', 'noah.kim@example.com', james, nextWeek, 'pending', null],
    ['Onboarding checklist for Lucas Ferreira', 'Pilot workspace is ready.', 'lucas.ferreira@example.com', james, yesterday, 'completed', yesterday],
    ['Demo recap for Ethan Brooks', 'Send the recording and notes.', 'ethan.brooks@example.com', priya, inThreeDays, 'in_progress', null],
    ['Renewal outreach to Mia Chen', 'Share the analytics case study.', 'mia.chen@example.com', admin, inFiveDays, 'pending', null],
  ];

  for (const [title, description, leadEmail, assignee, dueDate, status, completedAt] of taskDefs) {
    await upsertTask({
      title,
      description,
      lead: leads[leadEmail]._id,
      assignedTo: assignee._id,
      dueDate,
      status,
      createdBy: admin._id,
      completedAt,
    });
  }

  console.log('Seed completed.');
  console.log(`Admin: ${admin.email}`);
  console.log('Users: priya.shah@minicrm.local, james.okonkwo@minicrm.local');
  console.log('Passwords were read from ADMIN_PASSWORD and SEED_USER_PASSWORD.');
}

seed()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
