import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "CareerLens — Smart Internship Matching",
  description:
    "Upload your resume and get personalized internship recommendations. Match your skills to the perfect opportunity with AI-powered analysis.",
  keywords: [
    "internship",
    "career",
    "resume",
    "job matching",
    "skill gap",
    "ATS score",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} antialiased`} style={{ fontFamily: "var(--font-sans), system-ui, -apple-system, sans-serif" }}>
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
