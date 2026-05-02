import { API_PATHS } from "@/shared/api/api-paths";
import { api } from "@/shared/api/axios";
import { getXsrfHeader, withCsrfRetry } from "@/shared/api/csrf";
import { ensureCsrfCookie } from "@/shared/api/web-auth-client";

import type {
  CommonResponse,
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  RegisterLinkRequest,
  RegisterLinkResponse,
  RoomActionResult,
  RoomDetailResponse,
  RoomSummaryResponse,
  UpdateRoomNameRequest,
  UpdateRoomPinRequest,
} from "./types";

export const roomService = {
  /** GET /api/v1/auth/csrf */
  ensureCsrf: async (options?: { forceRefresh?: boolean }): Promise<void> => {
    await ensureCsrfCookie({ forceRefresh: options?.forceRefresh });
  },

  getRooms: async (): Promise<RoomSummaryResponse[]> => {
    const res = await api.get<CommonResponse<RoomSummaryResponse[]>>(API_PATHS.rooms.root);
    return res.data.data;
  },

  getRoomDetail: async (roomId: string): Promise<RoomDetailResponse> => {
    const res = await api.get<CommonResponse<RoomDetailResponse>>(API_PATHS.rooms.detail(roomId));
    return res.data.data;
  },

  updateRoomName: async (
    roomId: string,
    payload: UpdateRoomNameRequest,
  ): Promise<RoomActionResult> => {
    return withCsrfRetry(async () => {
      const res = await api.patch<CommonResponse<null>>(API_PATHS.rooms.detail(roomId), payload, {
        withCredentials: true,
        headers: getXsrfHeader(),
      });
      return toRoomActionResult(res.data.message);
    });
  },

  updateRoomPin: async (
    roomId: string,
    payload: UpdateRoomPinRequest,
  ): Promise<RoomActionResult> => {
    return withCsrfRetry(async () => {
      const res = await api.patch<CommonResponse<null>>(
        API_PATHS.rooms.pin(roomId),
        payload,
        {
          withCredentials: true,
          headers: getXsrfHeader(),
        },
      );
      return toRoomActionResult(res.data.message);
    });
  },

  leaveRoom: async (roomId: string): Promise<RoomActionResult> => {
    return withCsrfRetry(async () => {
      const res = await api.delete<CommonResponse<null>>(API_PATHS.rooms.leave(roomId), {
        withCredentials: true,
        headers: getXsrfHeader(),
      });
      return toRoomActionResult(res.data.message);
    });
  },

  createRoom: async (payload: CreateRoomRequest): Promise<CreateRoomResponse> => {
    return withCsrfRetry(async () => {
      const res = await api.post<CommonResponse<CreateRoomResponse>>(API_PATHS.rooms.root, payload, {
        withCredentials: true,
        headers: getXsrfHeader(),
      });
      return res.data.data;
    });
  },

  joinRoom: async (payload: JoinRoomRequest): Promise<JoinRoomResponse> => {
    return withCsrfRetry(async () => {
      const res = await api.post<CommonResponse<JoinRoomResponse>>(API_PATHS.rooms.join, payload, {
        withCredentials: true,
        headers: getXsrfHeader(),
      });
      return res.data.data;
    });
  },

  registerLink: async (payload: RegisterLinkRequest): Promise<RegisterLinkResponse> => {
    return withCsrfRetry(async () => {
      const res = await api.post<CommonResponse<RegisterLinkResponse>>(API_PATHS.links.root, payload, {
        withCredentials: true,
        headers: getXsrfHeader(),
      });
      return res.data.data;
    });
  },
};

function toRoomActionResult(message: string | null | undefined): RoomActionResult {
  return {
    message: message ?? null,
  };
}
