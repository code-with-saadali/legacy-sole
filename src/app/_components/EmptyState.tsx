import type { IconType } from "react-icons";

export default function EmptyState({
  icon: Icon,
  text,
}: {
  icon: IconType;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Icon className="text-black/25" size={25} />
      <p className="mt-4 text-xs text-black/45">{text}</p>
    </div>
  );
}
