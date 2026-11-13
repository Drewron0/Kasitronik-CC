export interface RateCollectorPayload {
  submissionId: string;
  rating: number;
  review?: string;
}

export interface RateCollectorResult {
  success: boolean;
  error?: string;
  data?: {
    collector_rating: number;
    collector_review: string;
    rated_at: string;
  };
}
