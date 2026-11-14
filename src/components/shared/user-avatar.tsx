import { initials } from "@/lib/format";
import { ImageAvatar } from "./image-avatar";

export function UserAvatar({
  firstName,
  lastName,
  avatarUrl,
  className,
}: {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  return (
    <ImageAvatar
      src={avatarUrl}
      alt=""
      fallback={initials(firstName, lastName)}
      className={className}
    />
  );
}
