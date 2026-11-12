import { Suspense } from "react";
import { ExamNewPage } from "@/features/exams/ExamNewPage";
import { Loading } from "@/shared/ui/controls";

type SearchParams = Promise<{ classId?: string | string[] }>;

async function New({ searchParams }: { searchParams: SearchParams }) {
  const { classId } = await searchParams;
  const parsed = Number(Array.isArray(classId) ? classId[0] : classId);
  return <ExamNewPage classId={Number.isInteger(parsed) && parsed > 0 ? parsed : undefined} />;
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<Loading />}>
      <New searchParams={searchParams} />
    </Suspense>
  );
}
