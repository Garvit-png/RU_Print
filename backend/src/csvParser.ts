import fs from 'fs';
import path from 'path';

export interface CSVStudent {
  id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  department: string;
  degree: string;
  parentName: string;
  phone: string;
  email: string;
  bandColor: string; // Red or Blue strictly
  hostelAllocated: boolean;
  hostelBlock?: string; // Residency 1 or Residency 2
  roomNumber?: string;  // R1-XXX or R2-XXX
  feesPaid: boolean;
  pendingFees: boolean;
  
  // 5 Orientation Checkpoints (ALL Reset to 0/5 false)
  checkpointGate2: boolean;
  checkpointHostel: boolean;
  checkpointMainAudiDoc: boolean;
  checkpointVipLoungeIdCard: boolean;
  checkpointCBlockKit: boolean;

  status: 'PENDING' | 'CHECKED_IN' | 'FLAGGED';
  checkInTime?: string;
  checkedInBy?: string;
  emergencyContact?: string;
  createdAt: string;
  updatedAt: string;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

// Helper to determine gender based on name
function isStudentFemale(firstName: string): boolean {
  const nameLower = firstName.toLowerCase().trim();
  const femaleEndings = ['a', 'i', 'ee', 'ya', 'ha', 'ka'];
  const femaleNames = [
    'kumari', 'bhumika', 'shreya', 'sneha', 'tanishka', 'oshi', 'ananya', 
    'nandika', 'adhishtha', 'vanshika', 'mehnashi', 'yashaswi', 'oshin',
    'saisha', 'simran', 'tanya', 'zoya', 'rhea', 'avani', 'anika', 'anaya', 'dia'
  ];
  
  if (femaleNames.includes(nameLower)) return true;
  return femaleEndings.some(ending => nameLower.endsWith(ending));
}

// Helper to calculate room number sequentially
function calculateSequentialRoom(index: number, isFemale: boolean): { roomNumber: string; hostelBlock: string } {
  const floor = Math.floor(index / 50) + 1; // 1 to 9
  const roomInFloor = (index % 50) + 1; // 1 to 50
  const roomNum3Digit = String(floor * 100 + roomInFloor).padStart(3, '0');
  
  if (isFemale) {
    return {
      roomNumber: `R2-${roomNum3Digit}`,
      hostelBlock: 'Residency 2'
    };
  } else {
    return {
      roomNumber: `R1-${roomNum3Digit}`,
      hostelBlock: 'Residency 1'
    };
  }
}

// Fallback student generator if CSV file is absent
function generateFallbackStudents(): CSVStudent[] {
  console.log(' Using fallback student dataset generator (651 records: 100% Hostel Rooms, 50/50 Red & Blue Bands)...');
  const firstNames = ['Aagam', 'Aanya', 'Aarav', 'Aarohi', 'Abhay', 'Aditi', 'Aditya', 'Advait', 'Agastya', 'Ahana', 'Akash', 'Ananya', 'Anaya', 'Anika', 'Anirudh', 'Anushka', 'Arjun', 'Arnav', 'Atharv', 'Avani', 'Ayush', 'Bhavya', 'Chetan', 'Dev', 'Dia', 'Dhruv', 'Divya', 'Esha', 'Gaurav', 'Ishaan', 'Isha', 'Kabir', 'Kavya', 'Khushi', 'Krishna', 'Manan', 'Meera', 'Mihir', 'Myra', 'Nakul', 'Navya', 'Neel', 'Nisha', 'Nitin', 'Parth', 'Pranav', 'Priya', 'Rahul', 'Rhea', 'Rohan', 'Saisha', 'Samarth', 'Siddharth', 'Simran', 'Tanya', 'Utkarsh', 'Varun', 'Vedant', 'Vihaan', 'Yash', 'Zoya'];
  const lastNames = ['Jain', 'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Mehta', 'Patel', 'Shah', 'Agarwal', 'Chopra', 'Rao', 'Reddy', 'Nair', 'Deshmukh', 'Joshi', 'Bhat', 'Saxena', 'Kapoor', 'Malhotra', 'Sinha', 'Trivedi', 'Pandey', 'Mishra'];
  const departments = ['B.Tech - CS & AI', 'B.Tech - CS, DS and Business', 'B.Design', 'B.Sc (Hons) Psychology', 'BBA - Finance & Analytics', 'Biotechnology', 'BA (Hons) Economics'];

  const list: CSVStudent[] = [];
  const now = new Date().toISOString();

  let boyIndex = 0;
  let girlIndex = 0;

  for (let i = 1; i <= 651; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const parent = `${firstNames[(i + 5) % firstNames.length]} ${ln}`;
    const roll = `250321${String(1000 + i).padStart(4, '0')}`;
    const dept = departments[i % departments.length];
    
    // EVENLY DISTRIBUTED: 50% Red, 50% Blue
    const bandColor = i % 2 === 0 ? 'Red' : 'Blue';
    const isFemale = isStudentFemale(fn);

    let roomDetails: { roomNumber: string; hostelBlock: string };
    if (isFemale) {
      roomDetails = calculateSequentialRoom(girlIndex, true);
      girlIndex++;
    } else {
      roomDetails = calculateSequentialRoom(boyIndex, false);
      boyIndex++;
    }

    list.push({
      id: `std-${roll}`,
      rollNumber: roll,
      firstName: fn,
      lastName: ln,
      fullName: `${fn} ${ln}`.toUpperCase(),
      department: dept,
      degree: dept.startsWith('B.Tech') ? 'Undergraduate B.Tech' : 'Undergraduate',
      parentName: parent,
      phone: `+91${9800000000 + i}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@ru.edu.in`,
      bandColor,
      hostelAllocated: true,
      hostelBlock: roomDetails.hostelBlock,
      roomNumber: roomDetails.roomNumber,
      feesPaid: true,
      pendingFees: false,
      checkpointGate2: false,
      checkpointHostel: false,
      checkpointMainAudiDoc: false,
      checkpointVipLoungeIdCard: false,
      checkpointCBlockKit: false,
      status: 'PENDING',
      checkInTime: undefined,
      checkedInBy: undefined,
      emergencyContact: `+91${9800000000 + i} (${parent})`,
      createdAt: now,
      updatedAt: now,
    });
  }

  return list;
}

export function parseStudentCSV(): CSVStudent[] {
  const csvPath = path.resolve(__dirname, '../../Final Clans with Dummy Data.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`[CSV ERROR] File not found at ${csvPath}`);
    return generateFallbackStudents();
  }

  try {
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length <= 1) return generateFallbackStudents();

    const students: CSVStudent[] = [];
    const now = new Date().toISOString();

    let boyIndex = 0;
    let girlIndex = 0;

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      const cols = splitCSVLine(row);

      if (cols.length < 3) continue;

      // STRICT MANDATORY FIELDS FROM CSV
      const firstName = cols[0]?.trim() || 'Student';
      const lastName = cols[1]?.trim() || '';
      const enrollmentNo = cols[2]?.trim() || `250321${String(1000 + i).padStart(4, '0')}`;
      const fullName = cols[3]?.trim() || `${firstName} ${lastName}`.toUpperCase();
      
      // OTHER DETAILS FROM CSV OR RANDOMLY MAPPED
      const course = cols[5]?.trim() || 'Undergraduate';
      const parentName = cols[6]?.trim() || 'Parent/Guardian';
      const phone = cols[7]?.trim() || `+91${9800000000 + i}`;
      const email = cols[8]?.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@ru.edu.in`;
      
      // EVENLY DISTRIBUTED: 50/50 Red and Blue bands
      const bandColor = i % 2 === 0 ? 'Red' : 'Blue';
      const isFemale = isStudentFemale(firstName);

      // Allocate rooms to every single student sequentially based on floor constraints (101-150, 201-250, ... 901-950)
      let roomDetails: { roomNumber: string; hostelBlock: string };
      if (isFemale) {
        roomDetails = calculateSequentialRoom(girlIndex, true);
        girlIndex++;
      } else {
        roomDetails = calculateSequentialRoom(boyIndex, false);
        boyIndex++;
      }

      students.push({
        id: `std-${enrollmentNo}`,
        rollNumber: enrollmentNo,
        firstName,
        lastName,
        fullName,
        department: course,
        degree: course.startsWith('B.Tech') ? 'Undergraduate B.Tech' : 'Undergraduate',
        parentName,
        phone,
        email,
        bandColor,
        hostelAllocated: true,
        hostelBlock: roomDetails.hostelBlock,
        roomNumber: roomDetails.roomNumber,
        feesPaid: true,
        pendingFees: false,
        checkpointGate2: false,
        checkpointHostel: false,
        checkpointMainAudiDoc: false,
        checkpointVipLoungeIdCard: false,
        checkpointCBlockKit: false,
        status: 'PENDING',
        checkInTime: undefined,
        checkedInBy: undefined,
        emergencyContact: `${phone} (${parentName})`,
        createdAt: now,
        updatedAt: now,
      });
    }

    console.log(`[CSV PARSER] Successfully parsed ${students.length} student records and sequentially allocated rooms.`);
    return students.length > 0 ? students : generateFallbackStudents();
  } catch (err: any) {
    console.error(`[CSV PARSE ERROR]`, err.message);
    return generateFallbackStudents();
  }
}
