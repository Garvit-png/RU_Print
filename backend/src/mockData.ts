import { parseStudentCSV, CSVStudent } from './csvParser';

export type StudentData = CSVStudent;

export const INITIAL_STUDENTS: StudentData[] = parseStudentCSV();
