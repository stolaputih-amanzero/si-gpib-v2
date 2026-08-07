export function MobileHeader({ title }: { title: string; showBack?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
  );
}
