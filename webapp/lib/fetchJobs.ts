// Pulls listings from public, ToS-compliant job-board APIs. No LinkedIn
// scraping or automation happens anywhere in this project — LinkedIn's User
// Agreement prohibits automated scraping and automated job applications.

export type RawJob = {
  source: "remotive" | "remoteok";
  external_id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  tags: string[];
  job_type: string;
  published: string | null;
};

const HEADERS = { "User-Agent": "job-match-board/1.0 (personal use)" };

async function fetchRemotive(): Promise<RawJob[]> {
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?category=design", {
      headers: HEADERS,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Remotive ${res.status}`);
    const data = await res.json();
    return (data.jobs || []).map((j: any) => ({
      source: "remotive" as const,
      external_id: String(j.id),
      title: j.title || "",
      company: j.company_name || "",
      location: j.candidate_required_location || "",
      url: j.url || "",
      tags: j.tags || [],
      job_type: j.job_type || "",
      published: j.publication_date || null,
    }));
  } catch (err) {
    console.error("[fetchRemotive] failed:", err);
    return [];
  }
}

async function fetchRemoteOk(): Promise<RawJob[]> {
  try {
    const res = await fetch("https://remoteok.com/api", { headers: HEADERS, cache: "no-store" });
    if (!res.ok) throw new Error(`RemoteOK ${res.status}`);
    const data = await res.json();
    return (data as any[])
      .filter((j) => j && typeof j === "object" && "id" in j && "position" in j)
      .map((j) => ({
        source: "remoteok" as const,
        external_id: String(j.id),
        title: j.position || "",
        company: j.company || "",
        location: j.location || "Remote",
        url: j.url || `https://remoteok.com/remote-jobs/${j.id}`,
        tags: j.tags || [],
        job_type: "",
        published: j.date || null,
      }));
  } catch (err) {
    console.error("[fetchRemoteOk] failed:", err);
    return [];
  }
}

export async function fetchAllJobs(): Promise<RawJob[]> {
  const [remotive, remoteok] = await Promise.all([fetchRemotive(), fetchRemoteOk()]);
  return [...remotive, ...remoteok];
}
