import Header from "@/components/layout/header/header";
import Footer from "@/components/layout/footer/footer";
import Container from "@/components/layout/container/container";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
        <main className=" flex-grow w-full">
          <Container className="mt-14 mb-28">
          {children}
          </Container>
        </main>
      
      <Footer />
    </div>
  );
}