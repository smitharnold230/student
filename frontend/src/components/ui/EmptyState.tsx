interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  message = 'No items found',
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
