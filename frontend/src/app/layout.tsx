import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "KulkasKu",
  description: "Web Management dan Perencanaan Isi Kulkas",
  icons: {
    icon: "/kulkasku-logo-1.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Toaster position="top-right" richColors closeButton />
        {children}
      </body>
    </html>
  );
}
