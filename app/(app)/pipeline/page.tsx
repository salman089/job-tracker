import { getJobs } from "@/lib/jobs/queries";
import { KanbanBoard } from "@/components/dashboard/kanban-board";

export default async function PipelinePage() {
  const jobs = await getJobs();
  return <KanbanBoard jobs={jobs} />;
}
