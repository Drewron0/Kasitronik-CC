/** How a collector page names a job: by the offer token in a notification link, or by id from the home page (cookie). */
export type JobRef = { token: string } | { submissionId: string };
