import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Job Match Board",
  description: "Daily ranked job/internship matches from public job boards.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
