import Header from "@/components/layout/header/header";
import Footer from "@/components/layout/footer/footer";
import Container from "@/components/layout/container/container";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <Header />
    <Container className="mt-14 mb-28">
        <main>{children}</main>
    </Container>
    <Footer />
    </>
  );
}
