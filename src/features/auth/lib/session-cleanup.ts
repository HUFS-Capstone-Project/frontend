import type { QueryClient } from "@tanstack/react-query";

import { useLinkAddDraftStore } from "@/store/link-add-draft-store";
import { useLinkPlaceSelectStore } from "@/store/link-place-select-store";
import { useRoomSelectionStore } from "@/store/room-selection-store";

export async function clearAuthenticatedSessionData(queryClient: QueryClient): Promise<void> {
  await queryClient.cancelQueries();
  queryClient.clear();
  useRoomSelectionStore.getState().clearSelectedRoom();
  useLinkAddDraftStore.getState().clear();
  useLinkPlaceSelectStore.getState().clearSelection();
}
