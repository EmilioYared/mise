import type { Metadata } from "next";
import { Big_Shoulders, Public_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const display = Big_Shoulders({
  subsets: ["latin"],
  variable: "--font-big-shoulders",
  axes: ["opsz"],
});

const text = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  title: "Mise",
  description: "Tasks and approvals for restaurant teams across locations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${text.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="bottom-center"
          closeButton
          toastOptions={{ className: "font-text" }}
        />
      </body>
    </html>
  );
}
