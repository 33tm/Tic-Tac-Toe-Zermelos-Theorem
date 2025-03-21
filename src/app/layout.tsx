import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "@/app/globals.css"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"]
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"]
})

export const metadata: Metadata = {
    title: "Zermelo's Theorem",
    description: "Zermelo's Theorem Through Tic-Tac-Toe",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}>
                {children}
            </body>
        </html>
    )
}