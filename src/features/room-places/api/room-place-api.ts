import { API_PATHS } from "@/shared/api/api-paths";
import { api } from "@/shared/api/axios";
import { getXsrfHeader, withCsrfRetry } from "@/shared/api/csrf";
import type { CommonResponse } from "@/shared/types/api-types";

import type {
  RoomPlaceListParams,
  RoomPlaceListResponse,
  UpdateRoomPlaceMemoRequest,
} from "../types/room-place.types";

export const roomPlaceApi = {
  getRoomPlaces: async (
    roomId: string,
    params: Required<RoomPlaceListParams>,
  ): Promise<RoomPlaceListResponse> => {
    const queryParams = toRoomPlaceListQueryParams(params);
    const response = await api.get<CommonResponse<RoomPlaceListResponse>>(
      API_PATHS.rooms.places(roomId),
      {
        params: queryParams,
      },
    );
    return response.data.data;
  },

  updateMemo: async (
    roomId: string,
    roomPlaceId: number,
    payload: UpdateRoomPlaceMemoRequest,
  ): Promise<void> => {
    await withCsrfRetry(async () => {
      await api.patch<CommonResponse<null>>(API_PATHS.rooms.place(roomId, roomPlaceId), payload, {
        withCredentials: true,
        headers: getXsrfHeader(),
      });
    });
  },

  deleteRoomPlace: async (roomId: string, roomPlaceId: number): Promise<void> => {
    await withCsrfRetry(async () => {
      await api.delete<CommonResponse<null>>(API_PATHS.rooms.place(roomId, roomPlaceId), {
        withCredentials: true,
        headers: getXsrfHeader(),
      });
    });
  },
};

function toRoomPlaceListQueryParams(params: Required<RoomPlaceListParams>) {
  const queryParams: Record<string, string | number> = {
    page: params.page,
    limit: params.limit,
  };

  if (params.keyword.trim().length > 0) {
    queryParams.keyword = params.keyword.trim();
  }
  if (params.categoryCode.trim().length > 0) {
    queryParams.categoryCode = params.categoryCode.trim();
  }
  if (params.tagCode.trim().length > 0) {
    queryParams.tagCode = params.tagCode.trim();
  }

  return queryParams;
}
