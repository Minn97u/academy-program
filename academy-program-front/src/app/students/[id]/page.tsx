import { Suspense } from "react";
import { StudentDetailPage } from "@/features/students/StudentDetailPage";
import { Loading } from "@/shared/ui/controls";

type Params = Promise<{ id: string }>;

async function Detail({ params }: { params: Params }) {
  const { id } = await params;
  return <StudentDetailPage id={Number(id)} />;
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<Loading />}>
      <Detail params={params} />
    </Suspense>
  );
}
