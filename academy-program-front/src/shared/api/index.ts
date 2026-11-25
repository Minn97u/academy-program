import type {
  AttendanceSheet,
  AttendanceStatus,
  ClassInput,
  ClassRoom,
  Exam,
  ExamDetail,
  ExamInput,
  ExamResult,
  ResultStatus,
  Settings,
  Student,
  StudentDetail,
  StudentInput,
  StudentNote,
  Teacher,
} from "@/shared/types/models";
import { qs, request } from "./client";

export { ApiError, errorMessage } from "./client";

export const api = {
  settings: {
    get: () => request<Settings>("GET", "/settings"),
    update: (patch: { academyName?: string; teacherName?: string }) => request<Settings>("PATCH", "/settings", patch),
  },
  teachers: { list: () => request<Teacher[]>("GET", "/teachers") },
  classes: {
    list: () => request<ClassRoom[]>("GET", "/classes"),
    get: (id: number) => request<ClassRoom>("GET", `/classes/${id}`),
    create: (input: ClassInput) => request<ClassRoom>("POST", "/classes", input),
    update: (id: number, input: Partial<ClassInput>) => request<ClassRoom>("PATCH", `/classes/${id}`, input),
    remove: (id: number) => request<{ deleted: true }>("DELETE", `/classes/${id}`),
  },
  students: {
    list: (f: { classId?: number } = {}) => request<Student[]>("GET", `/students${qs(f)}`),
    get: (id: number) => request<StudentDetail>("GET", `/students/${id}`),
    create: (input: StudentInput) => request<Student>("POST", "/students", input),
    update: (id: number, input: Partial<StudentInput>) => request<Student>("PATCH", `/students/${id}`, input),
    remove: (id: number) => request<{ deleted: true }>("DELETE", `/students/${id}`),
    addNote: (id: number, input: { kind: string; text: string }) => request<StudentNote>("POST", `/students/${id}/notes`, input),
    removeNote: (id: number, noteId: number) => request<{ deleted: true }>("DELETE", `/students/${id}/notes/${noteId}`),
  },
  exams: {
    list: (f: { classId?: number } = {}) => request<Exam[]>("GET", `/exams${qs(f)}`),
    get: (id: number) => request<ExamDetail>("GET", `/exams/${id}`),
    create: (input: ExamInput) => request<Exam>("POST", "/exams", input),
    remove: (id: number) => request<{ deleted: true }>("DELETE", `/exams/${id}`),
    saveResult: (examId: number, studentId: number, input: { status: ResultStatus; score?: number; wrongNumbers?: number[] }) =>
      request<ExamResult>("PUT", `/exams/${examId}/results/${studentId}`, input),
    removeResult: (examId: number, studentId: number) => request<{ deleted: true }>("DELETE", `/exams/${examId}/results/${studentId}`),
  },
  attendance: {
    byDate: (date: string, classId?: number) => request<AttendanceSheet[]>("GET", `/attendance${qs({ date, classId })}`),
    calendar: (month: string, classId?: number) =>
      request<{ date: string; count: number }[]>("GET", `/attendance/calendar${qs({ month, classId })}`),
    save: (input: { classId: number; studentId: number; date: string; status: AttendanceStatus; memo?: string }) =>
      request<{ studentId: number; date: string; status: AttendanceStatus; memo: string }>("PUT", "/attendance", input),
    remove: (studentId: number, date: string) => request<{ deleted: true }>("DELETE", `/attendance/${studentId}/${date}`),
  },
};
