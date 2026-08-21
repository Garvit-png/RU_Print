import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { INITIAL_STUDENTS } from './mockData';

const prisma = new PrismaClient();

async function main() {
  console.log(` Starting database seed to Neon PostgreSQL...`);
  console.log(` Found ${INITIAL_STUDENTS.length} student records from updated dataset.`);

  // Clear existing table data
  await prisma.checkInLog.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  // Seed default Super Admin
  await prisma.user.create({
    data: {
      email: 'kapish.rohilla2024@nst.rishihood.edu.in',
      name: 'Kapish Rohilla (Super Admin)',
      role: 'SUPER_ADMIN',
    }
  });

  const formattedData = INITIAL_STUDENTS.map((s) => ({
    id: s.id,
    rollNumber: s.rollNumber,
    firstName: s.firstName,
    lastName: s.lastName,
    fullName: s.fullName || `${s.firstName} ${s.lastName}`,
    email: s.email,
    parentName: s.parentName || "N/A",
    department: s.department,
    degree: s.degree || "Undergraduate",
    phone: s.phone,
    bandColor: s.bandColor || "Red",
    hostelAllocated: s.hostelAllocated || false,
    hostelBlock: s.hostelBlock || null,
    roomNumber: s.roomNumber || null,
    feesPaid: s.feesPaid ?? true,
    pendingFees: s.pendingFees ?? false,
    // ALL RESET TO FALSE (0/5)
    checkpointGate2: false,
    checkpointHostel: false,
    checkpointMainAudiDoc: false,
    checkpointVipLoungeIdCard: false,
    checkpointCBlockKit: false,
    // ALL RESET TO PENDING
    status: "PENDING" as const,
    checkInTime: null,
    checkedInBy: null,
    emergencyContact: s.emergencyContact || null,
  }));

  const res = await prisma.student.createMany({
    data: formattedData,
    skipDuplicates: true,
  });

  console.log(` Successfully seeded ${res.count} student records into Neon PostgreSQL database!`);
}

main()
  .catch((e) => {
    console.error(' Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
