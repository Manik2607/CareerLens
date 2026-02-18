import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "CareerLens — AI-Powered Internship Recommendations",
  description:
    "Upload your resume and get personalized internship recommendations powered by AI. Match your skills to the perfect opportunity.",
  keywords: [
    "internship",
    "AI",
    "resume",
    "career",
    "job matching",
    "recommendations",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
