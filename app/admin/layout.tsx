export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-[64px] flex h-[calc(100vh-64px)] flex-1 flex-col overflow-hidden md:mt-[88px] md:h-[calc(100vh-88px)]">
      {children}
    </div>
  );
}
