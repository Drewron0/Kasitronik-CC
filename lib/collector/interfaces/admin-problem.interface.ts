export interface AdminProblem {
  id: string;
  submissionId: string;
  ownerId: string;
  message: string;
  createdAt: string;
  resolvedAt: string | null;
}
