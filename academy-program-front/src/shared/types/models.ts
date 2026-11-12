// 백엔드 응답 모델. 날짜는 모두 'YYYY-MM-DD' 문자열.

export interface Teacher {
  id: number;
  name: string;
}

export interface Settings {
  academyName: string;
  teacher: Teacher;
}

export interface ClassRoom {
  id: number;
  name: string;
  grade: string;
  teacherId: number;
  teacher: Teacher;
  days: number[];
  startTime: string;
  endTime: string;
  description: string;
  createdAt: string;
  studentCount: number;
  examCount: number;
}

export interface ClassInput {
  name: string;
  grade: string;
  teacherId: number;
  days: number[];
  startTime: string;
  endTime: string;
  description?: string;
}

export interface AttendanceSummary {
  present: number;
  late: number;
  absent: number;
  rate: number | null;
}

export interface Student {
  id: number;
  name: string;
  grade: string;
  classId: number | null;
  className: string | null;
  teacherName: string | null;
  phone: string;
  memo: string;
  enrolledAt: string;
  recentScore: number | null;
  avgScore: number | null;
  scores: number[];
  attendance: AttendanceSummary;
}

export interface StudentInput {
  name: string;
  grade: string;
  classId?: number | null;
  phone?: string;
  memo?: string;
}

export type ExamType = "ACADEMY" | "SCHOOL" | "MOCK" | "ETC";
export type ResultStatus = "DONE" | "ABSENT";
export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT";

export interface StudentRecord {
  examId: number;
  name: string;
  type: ExamType;
  date: string;
  total: number;
  status: ResultStatus;
  score: number | null;
  wrongNumbers: number[];
  classAvg: number | null;
}

export interface StudentNote {
  id: number;
  date: string;
  kind: string;
  text: string;
}

export interface StudentDetail extends Student {
  records: StudentRecord[];
  attendanceRecords: { date: string; status: AttendanceStatus; memo: string }[];
  notes: StudentNote[];
}

export interface Exam {
  id: number;
  name: string;
  type: ExamType;
  classId: number;
  className: string;
  date: string;
  total: number;
  questionCount: number;
  createdAt: string;
  participantCount: number;
  enteredCount: number;
  absentCount: number;
  avgScore: number | null;
  maxScore: number | null;
  minScore: number | null;
}

export interface ExamInput {
  name: string;
  type: ExamType;
  classId: number;
  date: string;
  total: number;
  questionCount: number;
}

export interface ExamResult {
  status: ResultStatus;
  score: number | null;
  wrongNumbers: number[];
  updatedAt: string;
}

export interface ExamDetail extends Exam {
  students: { id: number; name: string; result: ExamResult | null }[];
}

export interface AttendanceSheet {
  classId: number;
  className: string;
  startTime: string;
  endTime: string;
  meetsToday: boolean;
  students: { id: number; name: string; status: AttendanceStatus | null; memo: string }[];
}
