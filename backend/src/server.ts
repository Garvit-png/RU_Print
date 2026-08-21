import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { meHandler, googleLoginHandler, googleCallbackHandler, getStaffHandler, deleteStaffHandler, authenticateToken, AuthenticatedRequest } from './auth';
import { inject } from '@vercel/analytics';

dotenv.config();

// Initialize Vercel Web Analytics
inject();

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  'https://ru-orientation-ajyf.vercel.app',
  'https://ru-orientation.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
}));

app.options('*', cors());
app.use(express.json());

// Initialize Prisma Client connected to Neon Cloud PostgreSQL
const prisma = new PrismaClient();

// Helper to map Prisma Student to API response object
function formatStudent(s: any) {
  return {
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
    bandColor: s.bandColor || 'Red',
    hostelAllocated: s.hostelAllocated,
    hostelBlock: s.hostelBlock || undefined,
    roomNumber: s.roomNumber || undefined,
    feesPaid: s.feesPaid,
    pendingFees: s.pendingFees,
    checkpointGate2: s.checkpointGate2,
    checkpointHostel: s.checkpointHostel,
    checkpointMainAudiDoc: s.checkpointMainAudiDoc,
    checkpointVipLoungeIdCard: s.checkpointVipLoungeIdCard,
    checkpointCBlockKit: s.checkpointCBlockKit,
    status: s.status as 'PENDING' | 'CHECKED_IN' | 'FLAGGED',
    checkInTime: s.checkInTime ? s.checkInTime.toISOString() : undefined,
    checkedInBy: s.checkedInBy || undefined,
    emergencyContact: s.emergencyContact || undefined,
    createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: s.updatedAt ? s.updatedAt.toISOString() : new Date().toISOString(),
  };
}

// Health Check
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const totalCount = await prisma.student.count();
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      totalStudents: totalCount,
      database: 'Neon Cloud PostgreSQL (Prisma Direct)',
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// AUTHENTICATION ROUTES
app.get('/api/auth/me', authenticateToken, meHandler);
app.get('/api/auth/staff', authenticateToken, getStaffHandler);
app.delete('/api/auth/staff/:id', authenticateToken, deleteStaffHandler);

// Google OAuth v2 Routes
app.post('/api/auth/google', googleLoginHandler);
app.get('/api/auth/google/callback', googleCallbackHandler);

// GET /api/logs - Fetches live logs directly from Neon Cloud PostgreSQL (Super Admin Only)
app.get('/api/logs', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!(req as any).user || (req as any).user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Super Admin access required' });
    }

    const logs = await prisma.checkInLog.findMany({
      include: {
        student: {
          select: {
            fullName: true,
            rollNumber: true,
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch logs', details: err.message });
  }
});

// GET /api/stats - Fetches live analytics directly from Neon Cloud PostgreSQL
app.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const dbStudents = await prisma.student.findMany();
    const studentsList = dbStudents.map(formatStudent);

    const totalStudents = studentsList.length;
    const checkedInCount = studentsList.filter(s => s.status === 'CHECKED_IN').length;
    const pendingCount = studentsList.filter(s => s.status === 'PENDING').length;
    const flaggedCount = studentsList.filter(s => s.status === 'FLAGGED').length;

    const checkInRatePercent = totalStudents > 0 
      ? Math.round((checkedInCount / totalStudents) * 100) 
      : 0;

    // Aggregate Step Checkpoint Stats
    const gate2Count = studentsList.filter(s => s.checkpointGate2).length;
    const hostelCount = studentsList.filter(s => s.checkpointHostel).length;
    const mainAudiDocCount = studentsList.filter(s => s.checkpointMainAudiDoc).length;
    const vipLoungeIdCardCount = studentsList.filter(s => s.checkpointVipLoungeIdCard).length;
    const cBlockKitCount = studentsList.filter(s => s.checkpointCBlockKit).length;

    const checkpointStats = [
      {
        step: 1,
        id: 'checkpointGate2',
        name: 'Gate Number 2',
        completedCount: gate2Count,
        pendingCount: totalStudents - gate2Count,
        percentage: totalStudents > 0 ? Math.round((gate2Count / totalStudents) * 100) : 0,
      },
      {
        step: 2,
        id: 'checkpointHostel',
        name: 'Hostel Desk',
        completedCount: hostelCount,
        pendingCount: totalStudents - hostelCount,
        percentage: totalStudents > 0 ? Math.round((hostelCount / totalStudents) * 100) : 0,
      },
      {
        step: 3,
        id: 'checkpointMainAudiDoc',
        name: 'Main Audi / Doc Verification',
        completedCount: mainAudiDocCount,
        pendingCount: totalStudents - mainAudiDocCount,
        percentage: totalStudents > 0 ? Math.round((mainAudiDocCount / totalStudents) * 100) : 0,
      },
      {
        step: 4,
        id: 'checkpointVipLoungeIdCard',
        name: 'VIP Lounge / ID Card Issue',
        completedCount: vipLoungeIdCardCount,
        pendingCount: totalStudents - vipLoungeIdCardCount,
        percentage: totalStudents > 0 ? Math.round((vipLoungeIdCardCount / totalStudents) * 100) : 0,
      },
      {
        step: 5,
        id: 'checkpointCBlockKit',
        name: 'C Block / Orientation Kit',
        completedCount: cBlockKitCount,
        pendingCount: totalStudents - cBlockKitCount,
        percentage: totalStudents > 0 ? Math.round((cBlockKitCount / totalStudents) * 100) : 0,
      },
    ];

    const departmentMap: Record<string, { total: number; checkedIn: number }> = {};
    studentsList.forEach(s => {
      const dept = s.department || 'General';
      if (!departmentMap[dept]) {
        departmentMap[dept] = { total: 0, checkedIn: 0 };
      }
      departmentMap[dept].total += 1;
      if (s.status === 'CHECKED_IN') {
        departmentMap[dept].checkedIn += 1;
      }
    });

    const departmentStats = Object.entries(departmentMap)
      .slice(0, 7)
      .map(([department, data]) => ({
        department,
        total: data.total,
        checkedIn: data.checkedIn,
        pending: data.total - data.checkedIn,
        rate: Math.round((data.checkedIn / data.total) * 100)
      }));

    // Calculate real hourly check-in velocity directly from database checkInTime timestamps
    const hoursList = [
      { label: '08:00 AM', hour: 8 },
      { label: '09:00 AM', hour: 9 },
      { label: '10:00 AM', hour: 10 },
      { label: '11:00 AM', hour: 11 },
      { label: '12:00 PM', hour: 12 },
      { label: '01:00 PM', hour: 13 },
      { label: '02:00 PM', hour: 14 },
      { label: '03:00 PM', hour: 15 },
      { label: '04:00 PM', hour: 16 },
      { label: '05:00 PM', hour: 17 },
    ];

    let runningCumulative = 0;
    const hourlyVelocity = hoursList.map(h => {
      const countThisHour = studentsList.filter(s => {
        if (s.status !== 'CHECKED_IN' || !s.checkInTime) return false;
        const date = new Date(s.checkInTime);
        return date.getHours() === h.hour;
      }).length;

      runningCumulative += countThisHour;
      return {
        time: h.label,
        checkedIn: countThisHour,
        cumulative: runningCumulative,
      };
    });

    res.json({
      summary: {
        totalStudents,
        checkedInCount,
        pendingCount,
        flaggedCount,
        checkInRatePercent,
        hostelAllocatedCount: studentsList.filter(s => s.hostelAllocated).length,
      },
      checkpointStats,
      departmentStats,
      hourlyVelocity,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats', details: error.message });
  }
});

// GET /api/students - Fetches students directly from Neon Cloud PostgreSQL with pagination
app.get('/api/students', async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string || '').trim();
    const department = req.query.department as string || 'ALL';
    const status = req.query.status as string || 'ALL';
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '50', 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { parentName: { contains: search, mode: 'insensitive' } },
        { roomNumber: { contains: search, mode: 'insensitive' } },
        { hostelBlock: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department !== 'ALL') {
      whereClause.department = department;
    }

    if (status !== 'ALL') {
      whereClause.status = status;
    }

    const total = await prisma.student.count({
      where: whereClause
    });

    const dbStudents = await prisma.student.findMany({
      where: whereClause,
      orderBy: { rollNumber: 'asc' },
      skip: skip,
      take: limit
    });

    const formattedList = dbStudents.map(formatStudent);

    res.json({
      total,
      page,
      limit,
      students: formattedList
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch students from Neon DB', details: error.message });
  }
});

// GET /api/students/:id - Fetches single student record directly from Neon Cloud PostgreSQL
app.get('/api/students/:id', async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found in Neon DB' });
    }

    res.json(formatStudent(student));
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch student', details: error.message });
  }
});

// PATCH /api/students/:id/checkpoints - Directly updates checkpoint states in Neon Cloud PostgreSQL
app.patch('/api/students/:id/checkpoints', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { checkpointKey, value, checkpoints } = req.body;

    const existingStudent = await prisma.student.findUnique({
      where: { id }
    });

    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found in Neon DB' });
    }

    const updateData: any = {};

    if (checkpoints) {
      Object.assign(updateData, checkpoints);
    } else if (checkpointKey) {
      updateData[checkpointKey] = !!value;
    }

    // AUTOMATIC CHECK-IN STATUS RULE:
    // If Gate Number 2 (checkpointGate2) is ticked -> status becomes CHECKED_IN
    // If Gate Number 2 (checkpointGate2) is unticked -> status reverts to PENDING
    if (checkpointKey === 'checkpointGate2' || (checkpoints && 'checkpointGate2' in checkpoints)) {
      const isGate2Done = 'checkpointGate2' in updateData 
        ? updateData.checkpointGate2 
        : existingStudent.checkpointGate2;

      if (isGate2Done) {
        updateData.status = 'CHECKED_IN';
        updateData.checkInTime = new Date();
        updateData.checkedInBy = 'Gate Number 2 Desk';
      } else {
        updateData.status = 'PENDING';
        updateData.checkInTime = null;
        updateData.checkedInBy = null;
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: updateData,
    });

    // AUDIT LOG CREATION
    try {
      const staffUser = (req as any).user;
      const performedBy = staffUser ? `${staffUser.name} (${staffUser.email})` : 'Team Orientation Staff';
      let actionLabel = 'Updated Checkpoints';

      if (checkpointKey) {
        const raw = checkpointKey.replace('checkpoint', '');
        const friendlyName = raw.replace(/([A-Z])/g, ' $1').trim();
        actionLabel = value 
          ? `Verified Checkpoint: ${friendlyName}`
          : `Reverted Checkpoint: ${friendlyName}`;
      } else if (checkpoints) {
        const activeKeys = Object.keys(checkpoints).filter(k => checkpoints[k]);
        if (activeKeys.length > 0) {
          const friendlyNames = activeKeys.map(k => k.replace('checkpoint', '').replace(/([A-Z])/g, ' $1').trim());
          actionLabel = `Verified Checkpoints: ${friendlyNames.join(', ')}`;
        } else {
          const inactiveKeys = Object.keys(checkpoints).filter(k => !checkpoints[k]);
          if (inactiveKeys.length > 0) {
            const friendlyNames = inactiveKeys.map(k => k.replace('checkpoint', '').replace(/([A-Z])/g, ' $1').trim());
            actionLabel = `Reverted Checkpoints: ${friendlyNames.join(', ')}`;
          }
        }
      }

      await prisma.checkInLog.create({
        data: {
          studentId: id,
          action: actionLabel,
          performedBy,
        }
      });
    } catch (logErr: any) {
      console.error('Failed to create audit log entry:', logErr.message);
    }

    return res.json({
      message: 'Checkpoint updated successfully in Neon DB',
      student: formatStudent(updatedStudent)
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update checkpoints in Neon DB', details: error.message });
  }
});

// PATCH /api/students/:id/flag - Toggle student FLAGGED status
app.patch('/api/students/:id/flag', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { flagged, reason } = req.body; // flagged: boolean, reason: optional string

    const existingStudent = await prisma.student.findUnique({ where: { id } });
    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Determine target status: flagging sets FLAGGED, unflagging restores based on gate2 state
    const newStatus = flagged
      ? 'FLAGGED'
      : existingStudent.checkpointGate2 ? 'CHECKED_IN' : 'PENDING';

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: { status: newStatus },
    });

    // Audit log
    try {
      const staffUser = (req as any).user;
      const performedBy = staffUser ? `${staffUser.name} (${staffUser.email})` : 'Team Orientation Staff';
      const actionLabel = flagged
        ? `Flagged Student${reason ? `: ${reason}` : ''}`
        : 'Removed Flag from Student';

      await prisma.checkInLog.create({
        data: { studentId: id, action: actionLabel, performedBy }
      });
    } catch (logErr: any) {
      console.error('Failed to create flag audit log:', logErr.message);
    }

    return res.json({
      message: `Student ${flagged ? 'flagged' : 'unflagged'} successfully`,
      student: formatStudent(updatedStudent)
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update student flag status', details: error.message });
  }
});


// Helper to extract student checkpoint key from log action
function getCheckpointKeyFromAction(action: string): string | null {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('gate 2') || actionLower.includes('gate2')) return 'checkpointGate2';
  if (actionLower.includes('hostel')) return 'checkpointHostel';
  if (actionLower.includes('audi') || actionLower.includes('doc')) return 'checkpointMainAudiDoc';
  if (actionLower.includes('vip') || actionLower.includes('lounge') || actionLower.includes('id')) return 'checkpointVipLoungeIdCard';
  if (actionLower.includes('kit') || actionLower.includes('c block')) return 'checkpointCBlockKit';
  return null;
}

// POST /api/logs/:logId/revert - Reverts a single checkpoint verification log (Super Admin Only)
app.post('/api/logs/:logId/revert', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!(req as any).user || (req as any).user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Super Admin access required' });
    }

    const { logId } = req.params;
    const log = await prisma.checkInLog.findUnique({
      where: { id: logId }
    });

    if (!log) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    const checkpointKey = getCheckpointKeyFromAction(log.action);
    if (!checkpointKey) {
      return res.status(400).json({ error: 'Log action cannot be dynamically mapped to a checkpoint key' });
    }

    // Revert checkpoint on the student record
    const updateData: any = {
      [checkpointKey]: false
    };

    if (checkpointKey === 'checkpointGate2') {
      updateData.status = 'PENDING';
      updateData.checkInTime = null;
      updateData.checkedInBy = null;
    }

    await prisma.student.update({
      where: { id: log.studentId },
      data: updateData
    });

    // Delete the log to cleanly revert the state
    await prisma.checkInLog.delete({
      where: { id: logId }
    });

    // Also log the reversion action itself
    const staffUser = (req as any).user;
    const performedBy = staffUser ? `${staffUser.name} (${staffUser.email})` : 'Super Admin';
    await prisma.checkInLog.create({
      data: {
        studentId: log.studentId,
        action: `Undone action: ${log.action}`,
        performedBy,
      }
    });

    return res.json({ message: 'Checkpoint action undone successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to revert checkpoint action', details: error.message });
  }
});

// POST /api/staff/:staffId/revert - Reverts all actions performed by a specific staff member (Super Admin Only)
app.post('/api/staff/:staffId/revert', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!(req as any).user || (req as any).user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Super Admin access required' });
    }

    const { staffId } = req.params;
    const staff = await prisma.user.findUnique({
      where: { id: staffId }
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff account not found' });
    }

    // Find all logs performed by this staff member (checking if performedBy contains their email)
    const staffLogs = await prisma.checkInLog.findMany({
      where: {
        performedBy: {
          contains: staff.email
        }
      }
    });

    // Process each log and revert the corresponding checkpoint on the student
    for (const log of staffLogs) {
      const checkpointKey = getCheckpointKeyFromAction(log.action);
      if (checkpointKey) {
        const updateData: any = {
          [checkpointKey]: false
        };
        if (checkpointKey === 'checkpointGate2') {
          updateData.status = 'PENDING';
          updateData.checkInTime = null;
          updateData.checkedInBy = null;
        }

        await prisma.student.update({
          where: { id: log.studentId },
          data: updateData
        });
      }
    }

    // Delete all logs performed by this staff member
    await prisma.checkInLog.deleteMany({
      where: {
        performedBy: {
          contains: staff.email
        }
      }
    });

    // Log the bulk reversion action itself
    const superAdmin = (req as any).user;
    const performedBy = superAdmin ? `${superAdmin.name} (${superAdmin.email})` : 'Super Admin';
    
    if (staffLogs.length > 0) {
      await prisma.checkInLog.create({
        data: {
          studentId: staffLogs[0].studentId,
          action: `Undone all ${staffLogs.length} actions for staff: ${staff.name}`,
          performedBy,
        }
      });
    }

    return res.json({ message: `Successfully reverted all ${staffLogs.length} actions for staff: ${staff.name}` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to revert staff actions', details: error.message });
  }
});


if (process.env.NODE_ENV !== 'production' || process.env.LISTEN_PORT) {
  app.listen(PORT, () => {
    console.log(` Orientation Backend API running on http://localhost:${PORT}`);
    console.log(` Connected live to Neon Cloud PostgreSQL via Prisma Client`);
  });
}

export default app;
