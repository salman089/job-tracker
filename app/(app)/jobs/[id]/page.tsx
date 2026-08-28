import { notFound } from "next/navigation";
import { getJob } from "@/lib/jobs/queries";
import { JobDetail } from "@/components/jobs/job-detail";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getJob(id);

  if (!result) notFound();

  return (
    <JobDetail
      job={result.job}
      interviews={result.interviews}
      contacts={result.contacts}
      notes={result.notes}
    />
  );
}
