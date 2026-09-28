// Candidate profile used to score/rank incoming job listings.
// Edit this file any time your resume, target roles, or preferences change.

export const profile = {
  name: "Deepak Kumar Pal",
  email: "deepak.pal.des23@nsut.ac.in",
  portfolio: "https://www.thepakpal.dev",
  headline: "B.Design student (NSUT Delhi) — Product/UX Designer, design-engineering hybrid",

  resumeSummary:
    "Deepak Kumar Pal is a B.Design student at NSUT Delhi (CGPA 8.84/10, class of 2027) focused on UX and " +
    "product design. He led PriceWise, a price-comparison app MVP, running 10-25 user interviews and a 55+ " +
    "respondent survey, then designing a 21-screen accessibility-first Figma system. He conceived and shipped " +
    "Nest, a live private-journaling PWA (Next.js, TypeScript, Supabase, Groq API, Vercel) built with Claude " +
    "Code as an AI engineering partner. He also ran a KPMG Lean Six Sigma Green Belt project at Shahi Exports " +
    "as project manager.",

  skills: [
    { term: "UX Design", weight: 3 },
    { term: "UX Research", weight: 3 },
    { term: "Product Design", weight: 3 },
    { term: "Product Designer", weight: 3 },
    { term: "UI/UX", weight: 3 },
    { term: "User Research", weight: 2 },
    { term: "Usability Testing", weight: 2 },
    { term: "Information Architecture", weight: 2 },
    { term: "Product Thinking", weight: 2 },
    { term: "Product Management", weight: 2 },
    { term: "Figma", weight: 2 },
    { term: "Prototyping", weight: 2 },
    { term: "Design System", weight: 2 },
    { term: "Accessibility", weight: 2 },
    { term: "Photoshop", weight: 1 },
    { term: "Excel", weight: 1 },
    { term: "SQL", weight: 1 },
    { term: "HTML", weight: 1 },
    { term: "CSS", weight: 1 },
    { term: "Frontend", weight: 1 },
    { term: "Design Engineering", weight: 2 },
    { term: "Lean Six Sigma", weight: 1 },
    { term: "Intern", weight: 1 },
  ],

  targetTitles: [
    "UX Designer",
    "Product Designer",
    "UI/UX Designer",
    "UX Research",
    "Design Intern",
    "UX Intern",
    "Product Design Intern",
    "Product Management Intern",
    "Design Engineer",
    "Junior Product Designer",
  ],

  locations: ["India", "Remote"],
};

export type Profile = typeof profile;
