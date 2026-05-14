import { Outfit } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Morning Boost — Cold-Pressed Juice Delivery',
  description: 'Subscribe to daily cold-pressed juice delivery. Fresh, raw, and at your doorstep every morning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-44JBT0M5NM"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-44JBT0M5NM');
        `}} />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={outfit.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

