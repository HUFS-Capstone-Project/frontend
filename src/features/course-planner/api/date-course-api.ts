import { API_PATHS } from "@/shared/api/api-paths";
import { api } from "@/shared/api/axios";
import { getXsrfHeader, withCsrfRetry } from "@/shared/api/csrf";
import type { CommonResponse } from "@/shared/types/api-types";

export type DateCourseMode = "GENERAL" | "TRENDY" | "POPULAR";

export type DateCourseRegionFilterOption = {
  code: string;
  name: string;
  displayOrder: number;
  all: false;
};

/** @deprecated Use `DateCourseRegionFilterOption` */
export type DateCourseSigunguOption = DateCourseRegionFilterOption;

export type GenerateDateCourseCategorySlot = {
  categoryCode: string;
  tagCode?: string;
};

export type GenerateDateCourseRequest = {
  categorySequence: GenerateDateCourseCategorySlot[];
  startDateTime: string;
  endDateTime: string;
  sigunguCode: string;
};

export type DateCourseCoordinateResponse = {
  sequenceOrder: number;
  latitude: string | number | null;
  longitude: string | number | null;
};

export type DateCoursePlaceResponse = {
  roomPlaceId: number;
  sequenceOrder: number;
  name: string;
  address: string;
  latitude: string | number | null;
  longitude: string | number | null;
  categoryCode: string;
  tagCode: string;
  placeId?: string | number | null;
  kakaoPlaceId?: string | null;
  roadAddress?: string | null;
  categoryName?: string | null;
  tagName?: string | null;
};

export type DateCourseCandidateResponse = {
  dateCourseId: string;
  /** 저장 전까지 `null` — UI 기본값은 `mode` 기반 이름 */
  courseName: string | null;
  mode: DateCourseMode;
  startDateTime: string;
  endDateTime: string;
  places: DateCoursePlaceResponse[];
  orderedCoordinates: DateCourseCoordinateResponse[];
  skippedSlotIndices?: number[];
};

export type SaveDateCourseRequest = {
  courseName: string;
};

export type GenerateDateCoursesResponse = {
  generationBatchId: string;
  courses: DateCourseCandidateResponse[];
};

export type SavedRoomDateCourseItemResponse = {
  dateCourseId: string;
  courseName: string | null;
  mode?: DateCourseMode | null;
  startDateTime?: string | null;
  endDateTime?: string | null;
  savedByUserId: number | string | null;
  savedByNickname: string | null;
  savedByProfileImageUrl: string | null;
  savedAt: string | null;
  roomPublicId?: string | null;
  places?: DateCoursePlaceResponse[];
  orderedCoordinates?: DateCourseCoordinateResponse[];
};

export type DateCourseListResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
};

export type DateCourseDetailResponse = {
  dateCourseId: string;
  courseName: string;
  mode: DateCourseMode;
  startDateTime: string;
  endDateTime: string;
  savedByUserId?: number | string | null;
  savedByNickname?: string | null;
  savedByProfileImageUrl?: string | null;
  savedAt?: string | null;
  roomPublicId?: string | null;
  places: DateCoursePlaceResponse[];
  orderedCoordinates: DateCourseCoordinateResponse[];
};

export type MySavedDateCourseItemResponse = {
  dateCourseId: string;
  courseName: string;
  roomPublicId: string;
  roomName: string;
  startDateTime: string;
  endDateTime: string;
  savedAt: string;
  places: DateCoursePlaceResponse[];
  orderedCoordinates: DateCourseCoordinateResponse[];
};

export type DateCourseListParams = {
  page?: number;
  limit?: number;
};

function toListQueryParams(params?: DateCourseListParams) {
  return {
    page: params?.page ?? 0,
    limit: params?.limit ?? 20,
  };
}

function sortRegionFilterOptions(options: DateCourseRegionFilterOption[]) {
  return options.slice().sort((left, right) => left.displayOrder - right.displayOrder);
}

export const dateCourseApi = {
  listDateCourseSidos: async (roomId: string): Promise<DateCourseRegionFilterOption[]> => {
    const response = await api.get<CommonResponse<DateCourseRegionFilterOption[]>>(
      API_PATHS.rooms.dateCourseSidos(roomId),
    );
    return sortRegionFilterOptions(response.data.data ?? []);
  },

  listDateCourseSigungus: async (
    roomId: string,
    sidoCode: string,
  ): Promise<DateCourseRegionFilterOption[]> => {
    const response = await api.get<CommonResponse<DateCourseRegionFilterOption[]>>(
      API_PATHS.rooms.dateCourseSigungus(roomId, sidoCode),
    );
    return sortRegionFilterOptions(response.data.data ?? []);
  },

  generateDateCourses: async (
    roomId: string,
    payload: GenerateDateCourseRequest,
  ): Promise<GenerateDateCoursesResponse> => {
    return withCsrfRetry(async () => {
      const response = await api.post<CommonResponse<GenerateDateCoursesResponse>>(
        API_PATHS.rooms.dateCourses(roomId),
        payload,
        {
          withCredentials: true,
          headers: getXsrfHeader(),
        },
      );
      return response.data.data;
    });
  },

  saveDateCourse: async (
    roomId: string,
    dateCourseId: string,
    payload: SaveDateCourseRequest,
  ): Promise<void> => {
    await withCsrfRetry(async () => {
      await api.post<CommonResponse<null>>(
        API_PATHS.rooms.saveDateCourse(roomId, dateCourseId),
        payload,
        {
          withCredentials: true,
          headers: getXsrfHeader(),
        },
      );
    });
  },

  listRoomDateCourses: async (
    roomId: string,
    params?: DateCourseListParams,
  ): Promise<DateCourseListResponse<SavedRoomDateCourseItemResponse>> => {
    const response = await api.get<
      CommonResponse<DateCourseListResponse<SavedRoomDateCourseItemResponse>>
    >(API_PATHS.rooms.dateCourses(roomId), {
      params: toListQueryParams(params),
    });
    return response.data.data;
  },

  getDateCourseDetail: async (
    roomId: string,
    dateCourseId: string,
  ): Promise<DateCourseDetailResponse> => {
    const response = await api.get<CommonResponse<DateCourseDetailResponse>>(
      API_PATHS.rooms.dateCourse(roomId, dateCourseId),
    );
    return response.data.data;
  },

  listMyDateCourses: async (
    params?: DateCourseListParams,
  ): Promise<DateCourseListResponse<MySavedDateCourseItemResponse>> => {
    const response = await api.get<
      CommonResponse<DateCourseListResponse<MySavedDateCourseItemResponse>>
    >(API_PATHS.users.dateCourses, {
      params: toListQueryParams(params),
    });
    return response.data.data;
  },
};
