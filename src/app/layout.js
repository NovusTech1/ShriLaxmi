import "./globals.css";
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: "Shri Laxmi",
  description: "Catalogue website for Shri laxmi the ethnic wear brand for women",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
