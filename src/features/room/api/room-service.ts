import { api, isApiError } from "@/shared/api/axios";
import { ensureCsrfCookie } from "@/shared/api/web-auth-client";
import { getCookie, XSRF_COOKIE_NAME, XSRF_HEADER_NAME } from "@/shared/lib/cookie";

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

const API_PATHS = {
  rooms: "/v1/rooms",
  joinRoom: "/v1/rooms/join",
  links: "/v1/links",
} as const;

export const roomService = {
  /** GET /api/v1/auth/csrf */
  ensureCsrf: async (options?: { forceRefresh?: boolean }): Promise<void> => {
    await ensureCsrfCookie({ forceRefresh: options?.forceRefresh });
  },

  getRooms: async (): Promise<RoomSummaryResponse[]> => {
    const res = await api.get<CommonResponse<RoomSummaryResponse[]>>(API_PATHS.rooms);
    return res.data.data;
  },

  getRoomDetail: async (roomId: string): Promise<RoomDetailResponse> => {
    const res = await api.get<CommonResponse<RoomDetailResponse>>(`${API_PATHS.rooms}/${roomId}`);
    return res.data.data;
  },

  updateRoomName: async (
    roomId: string,
    payload: UpdateRoomNameRequest,
  ): Promise<RoomActionResult> => {
    return withCsrf(async () => {
      const res = await api.patch<CommonResponse<null>>(`${API_PATHS.rooms}/${roomId}`, payload, {
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
    return withCsrf(async () => {
      const res = await api.patch<CommonResponse<null>>(
        `${API_PATHS.rooms}/${roomId}/pin`,
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
    return withCsrf(async () => {
      const res = await api.delete<CommonResponse<null>>(`${API_PATHS.rooms}/${roomId}/leave`, {
        withCredentials: true,
        headers: getXsrfHeader(),
      });
      return toRoomActionResult(res.data.message);
    });
  },

  createRoom: async (payload: CreateRoomRequest): Promise<CreateRoomResponse> => {
    return withCsrf(async () => {
      const res = await api.post<CommonResponse<CreateRoomResponse>>(API_PATHS.rooms, payload, {
        withCredentials: true,
        headers: getXsrfHeader(),
      });
      return res.data.data;
    });
  },

  joinRoom: async (payload: JoinRoomRequest): Promise<JoinRoomResponse> => {
    return withCsrf(async () => {
      const res = await api.post<CommonResponse<JoinRoomResponse>>(API_PATHS.joinRoom, payload, {
        withCredentials: true,
        headers: getXsrfHeader(),
      });
      return res.data.data;
    });
  },

  registerLink: async (payload: RegisterLinkRequest): Promise<RegisterLinkResponse> => {
    return withCsrf(async () => {
      const res = await api.post<CommonResponse<RegisterLinkResponse>>(API_PATHS.links, payload, {
        withCredentials: true,
        headers: getXsrfHeader(),
      });
      return res.data.data;
    });
  },
};

async function withCsrf<T>(request: () => Promise<T>): Promise<T> {
  await ensureCsrfCookie();

  try {
    return await request();
  } catch (error) {
    if (isCsrfForbidden(error)) {
      await ensureCsrfCookie({ forceRefresh: true });
      return request();
    }
    throw error;
  }
}

function getXsrfHeader(): Record<string, string> | undefined {
  const token = getCookie(XSRF_COOKIE_NAME);
  if (!token) {
    return undefined;
  }

  return {
    [XSRF_HEADER_NAME]: token,
  };
}

function isCsrfForbidden(error: unknown): boolean {
  if (!isApiError(error)) {
    return false;
  }

  return error.status === 403 || error.code === "E403_FORBIDDEN";
}

function toRoomActionResult(message: string | null | undefined): RoomActionResult {
  return {
    message: message ?? null,
  };
}
