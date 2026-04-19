export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  message: string | null;
  timestamp: string;
};

export type PlaceFilterData = {
  categories: Category[];
};

export type Category = {
  code: string;
  name: string;
  sortOrder: number;
  tagGroups: TagGroup[];
};

export type TagGroup = {
  code: string;
  name: string | null;
  sortOrder: number;
  tags: Tag[];
};

export type Tag = {
  code: string;
  name: string;
  sortOrder: number;
};
