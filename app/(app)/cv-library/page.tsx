import { getJobsWithCv } from "@/lib/jobs/queries";
import { CvLibraryRow } from "@/components/cv-library/cv-library-row";

export default async function CvLibraryPage() {
  const jobs = await getJobsWithCv();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">CV Library</h1>
        <p className="text-sm text-muted-foreground">
          Every CV you have uploaded, linked back to the job it was sent for.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="glass-surface rounded-xl p-8 text-center text-sm text-muted-foreground">
          No CVs uploaded yet. Upload one from any job&apos;s detail page.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {jobs.map((job) => (
            <CvLibraryRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
