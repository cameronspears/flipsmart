// app/layout.tsx

import '@/styles/globals.css';
import {ThemeProvider} from "@/components/ThemeProvider";
import React from "react";

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head><title></title></head>
        <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}
