import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UnitMate - Action Unit, Zone B",
  description: "Dues management and transparency platform by Ascotom Global Services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
