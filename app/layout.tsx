import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "UnitMate - Action Unit, Zone B",
  description: "Dues management and transparency portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://sdk.monnify.com/plugin/monnify.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
