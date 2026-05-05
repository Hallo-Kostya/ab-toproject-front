export default function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-360 px-10  w-full ${className}`}>
      {children}
    </div>
  );
}