// 개발용 예시 데이터 (pnpm db:seed). 기존 데이터를 모두 지우고 다시 넣는다.
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const TEACHERS = ['김지원', '박서준', '이하늘'];

const CLASSES = [
  {
    name: '중1 기본 A반',
    grade: '중1',
    teacher: 1,
    days: [1, 3, 5],
    start: '16:00',
    end: '17:30',
    description: '중1 2학기 도형 단원 기본 개념 완성',
  },
  {
    name: '중2 심화 A반',
    grade: '중2',
    teacher: 0,
    days: [1, 3, 5],
    start: '17:00',
    end: '18:30',
    description: '일차함수 응용과 도형 증명 심화 학습',
  },
  {
    name: '중2 기본 B반',
    grade: '중2',
    teacher: 0,
    days: [2, 4],
    start: '17:00',
    end: '18:50',
    description: '중2 핵심 개념 다지기와 내신 기본 문제',
  },
  {
    name: '중3 내신 대비반',
    grade: '중3',
    teacher: 0,
    days: [2, 4],
    start: '19:00',
    end: '21:00',
    description: '2학기 내신 삼각비와 원의 성질 집중 대비',
  },
  {
    name: '고1 공통수학 A반',
    grade: '고1',
    teacher: 0,
    days: [1, 3],
    start: '19:00',
    end: '21:30',
    description: '공통수학2 도형의 방정식과 집합과 명제',
  },
  {
    name: '고2 수학Ⅰ 심화반',
    grade: '고2',
    teacher: 2,
    days: [2, 4],
    start: '19:30',
    end: '22:00',
    description: '삼각함수와 수열 심화 및 모의고사 대비',
  },
];

const STUDENTS: string[][] = [
  ['오지민', '송예린', '임준서', '장서윤', '조현우', '배수아', '신동현'],
  ['김민수', '이서연', '박지훈', '최유진', '정하은', '강도윤', '윤지호', '한서아'],
  ['권나연', '황시우', '안채원', '류건우', '전다인', '홍승민', '문가은'],
  ['서지안', '남궁민재', '노하린', '고은호', '양소율', '백승현', '손예나', '허준혁'],
  ['유다현', '심재원', '구민서', '탁서진', '표하윤', '진우진'],
  ['차은서', '마준영', '염지우', '방서현', '석도현', '우채린'],
];

const EXAMS = [
  { name: '10월 4주차 정기 테스트', date: '2026-10-24' },
  { name: '11월 1주차 정기 테스트', date: '2026-11-07' },
];

function phone(i: number) {
  return `010-${2000 + ((i * 731) % 7999)}-${1000 + ((i * 457) % 8999)}`;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL이 필요해요');
  const db = new PrismaClient({ adapter: new PrismaPg(url) });
  try {
    await db.setting.deleteMany();
    await db.studentNote.deleteMany();
    await db.attendance.deleteMany();
    await db.examResult.deleteMany();
    await db.exam.deleteMany();
    await db.student.deleteMany();
    await db.classRoom.deleteMany();
    await db.teacher.deleteMany();

    const teachers = [];
    for (const name of TEACHERS) teachers.push(await db.teacher.create({ data: { name } }));

    let n = 0;
    for (const [ci, c] of CLASSES.entries()) {
      const room = await db.classRoom.create({
        data: {
          name: c.name,
          grade: c.grade,
          teacherId: teachers[c.teacher].id,
          days: c.days,
          startTime: c.start,
          endTime: c.end,
          description: c.description,
          createdAt: new Date('2026-03-02'),
        },
      });
      const students = [];
      for (const name of STUDENTS[ci]) {
        n += 1;
        students.push(
          await db.student.create({
            data: { name, grade: c.grade, classId: room.id, phone: phone(n), enrolledAt: new Date('2026-03-02') },
          }),
        );
      }
      for (const [ei, e] of EXAMS.entries()) {
        const exam = await db.exam.create({
          data: {
            name: e.name,
            type: 'ACADEMY',
            classId: room.id,
            date: new Date(e.date),
            total: 100,
            questionCount: 20,
          },
        });
        // 첫 시험만 결과를 채워 "분석 완료/입력 중" 상태가 보이게 한다.
        if (ei === 0) {
          for (const [si, s] of students.entries()) {
            const wrong = [3, 7, 12, 18].filter((q) => (q + si) % 3 !== 0);
            await db.examResult.create({
              data: {
                examId: exam.id,
                studentId: s.id,
                status: 'DONE',
                score: 100 - wrong.length * 5 - (si % 4) * 3,
                wrongNumbers: wrong,
              },
            });
          }
        }
      }
    }

    await db.setting.create({ data: { id: 1, academyName: '학원 프로그램 수학학원', teacherId: teachers[0].id } });
    console.log(`선생님 ${teachers.length}명, 정규반 ${CLASSES.length}개, 학생 ${n}명 시드 완료`);
  } finally {
    await db.$disconnect();
  }
}

void main();
