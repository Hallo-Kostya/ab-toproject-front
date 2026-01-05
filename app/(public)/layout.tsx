// app/(public)/layout.tsx
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  );
}