import type { CommonResponse as SharedCommonResponse } from "@/shared/types/api-types";

export type CommonResponse<T> = SharedCommonResponse<T>;

export type LinkAnalysisStatus =
  | "REQUESTED"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "DISPATCH_FAILED";

export type LinkSource = "WEB" | "APP" | null;

export type RoomSummaryResponse = {
  roomId: string;
  roomName: string;
  avatarSeed: string;
  inviteCode: string;
  pinned: boolean;
  createdAt: string;
  linkCount: number;
  placeCount: number;
  memberCount: number;
};

export type RoomDetailResponse = {
  roomId: string;
  roomName: string;
  avatarSeed: string;
  inviteCode: string;
  pinned: boolean;
  memberCount: number;
  linkCount: number;
  placeCount: number;
  createdAt: string;
};

export type RoomMemberResponse = {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  joinedAt: string;
  me: boolean;
};

export type CreateRoomResponse = {
  roomId: string;
  roomName: string;
  avatarSeed: string;
  inviteCode: string;
  pinned: boolean;
  createdAt: string;
};

export type JoinRoomResponse = {
  roomId: string;
  roomName: string;
  avatarSeed: string;
  pinned: boolean;
  createdAt: string;
};

export type RegisterLinkResponse = {
  linkId: number;
  jobId: string | null;
  status: LinkAnalysisStatus;
};

export type CreateRoomRequest = {
  name: string;
};

export type JoinRoomRequest = {
  inviteCode: string;
};

export type UpdateRoomNameRequest = {
  name: string;
};

export type UpdateRoomPinRequest = {
  pinned: boolean;
};

export type RegisterLinkRequest = {
  url: string;
  roomId: string;
  source?: LinkSource;
};
