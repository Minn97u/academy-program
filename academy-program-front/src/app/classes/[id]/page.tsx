import { Suspense } from "react";
import { ClassDetailPage } from "@/features/classes/ClassDetailPage";
import { Loading } from "@/shared/ui/controls";

type Params = Promise<{ id: string }>;

async function Detail({ params }: { params: Params }) {
  const { id } = await params;
  return <ClassDetailPage id={Number(id)} />;
}

// params는 URL별 데이터라 Suspense 안에서 읽어야 공통 셸이 프리페치된다.
export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<Loading />}>
      <Detail params={params} />
    </Suspense>
  );
}
