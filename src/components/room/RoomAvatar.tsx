import Avatar from "boring-avatars";

import { ROOM_AVATAR_COLORS } from "./room-avatar-constants";

export type RoomAvatarProps = {
  avatarSeed: string;
  size?: number | string;
};

export function RoomAvatar({ avatarSeed, size = 48 }: RoomAvatarProps) {
  return (
    <Avatar
      aria-hidden
      colors={ROOM_AVATAR_COLORS}
      focusable="false"
      name={avatarSeed}
      size={size}
      variant="beam"
    />
  );
}
