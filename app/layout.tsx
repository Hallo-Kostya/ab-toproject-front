import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Container from "@/components/layout/container";

export const metadata: Metadata = {
  title: "ToProject",
  description: "Начни работу с проектами вместе с ToProject",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`antialiased`}
      >
        <Header />
        <Container className="mt-14 mb-28">
          <main>
            {children}
          </main>
        </Container>
        <Footer />
      </body>
    </html>
  );
}
