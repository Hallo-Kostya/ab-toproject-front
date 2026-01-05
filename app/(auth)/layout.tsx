// app/(auth)/layout.tsx
import Header from "@/components/layout/header/header";
import Footer from "@/components/layout/footer/footer";
import Container from "@/components/layout/container/container";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    //<ProtectedRoute requireAuth={true}>
    <>
      <Header />
      <Container className="mt-14 mb-28">
        <main>{children}</main>
      </Container>
      <Footer />
    </>
    //</ProtectedRoute>
  );
}