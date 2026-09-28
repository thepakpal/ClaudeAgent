export type JobStatus = "new" | "saved" | "applied";

export type JobRow = {
  id: string;
  source: string;
  external_id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  tags: string[] | null;
  job_type: string | null;
  published: string | null;
  score: number;
  matched_terms: string[] | null;
  status: JobStatus;
  is_new: boolean;
  updated_at: string;
};

export type SyncStatusRow = {
  id: number;
  last_synced: string | null;
  total_candidates: number | null;
  total_shown: number | null;
};
