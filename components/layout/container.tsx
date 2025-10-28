export default function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-[1440px] px-[92px] ${className}`}>
      {children}
    </div>
  );
}