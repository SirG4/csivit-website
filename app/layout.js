import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbiton = Orbitron({
  variable: "--font-orbiton",
  subsets: ["latin"],
});

const tungsten = localFont({
  src: [
    {
      path: "./WOFF2/Tungsten-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "./WOFF2/Tungsten-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "./WOFF2/Tungsten-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./WOFF2/Tungsten-Book.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./WOFF2/Tungsten-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./WOFF2/Tungsten-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./WOFF2/Tungsten-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./WOFF2/Tungsten-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-tungsten",
  display: "swap",
});

const minercraft = localFont({
  src: [
    {
      path: "./WOFF2/Minecrafter.Reg.ttf",
      style: "normal",
    },
  ],
  variable: "--font-minercraft",
  display: "swap",
});

export const metadata = {
  title: "Computer Society of India - VIT Chapter",
  description: "Computer Society of India - VIT Chapter",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${orbiton.variable} ${geistMono.variable} ${minercraft.variable}  ${tungsten.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
