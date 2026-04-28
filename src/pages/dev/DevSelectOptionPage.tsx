import { lazy, Suspense, useLayoutEffect } from "react";

import type { PlaceFilterData } from "@/features/map/api/place-taxonomy-types";
import { useRoomSelectionStore } from "@/store/room-selection-store";

const MapHomePage = lazy(() => import("@/pages/MapHomePage"));

const DEV_ROOM = {
  id: "dev-room-select-option",
  name: "심심한 두쫀쿠 지도",
  memberCount: 4,
};

const DEV_FILTER_DATA: PlaceFilterData = {
  categories: [
    {
      code: "\uB9DB\uC9D1",
      name: "\uB9DB\uC9D1",
      sortOrder: 1,
      tagGroups: [
        {
          code: "\uB9DB\uC9D1-default",
          name: null,
          sortOrder: 1,
          tags: [
            { code: "\uB9DB\uC9D1-\uD55C\uC2DD", name: "\uD55C\uC2DD", sortOrder: 1 },
            { code: "\uB9DB\uC9D1-\uC911\uC2DD", name: "\uC911\uC2DD", sortOrder: 2 },
            { code: "\uB9DB\uC9D1-\uC77C\uC2DD", name: "\uC77C\uC2DD", sortOrder: 3 },
            { code: "\uB9DB\uC9D1-\uC591\uC2DD", name: "\uC591\uC2DD", sortOrder: 4 },
            { code: "\uB9DB\uC9D1-\uBD84\uC2DD", name: "\uBD84\uC2DD", sortOrder: 5 },
            {
              code: "\uB9DB\uC9D1-\uC544\uC2DC\uC544\uC2DD",
              name: "\uC544\uC2DC\uC544\uC2DD",
              sortOrder: 6,
            },
            { code: "\uB9DB\uC9D1-\uC220\uC9D1", name: "\uC220\uC9D1", sortOrder: 7 },
            { code: "\uB9DB\uC9D1-\uAE30\uD0C0", name: "\uAE30\uD0C0", sortOrder: 8 },
          ],
        },
      ],
    },
    {
      code: "\uCE74\uD398",
      name: "\uCE74\uD398",
      sortOrder: 2,
      tagGroups: [
        {
          code: "\uCE74\uD398-default",
          name: null,
          sortOrder: 1,
          tags: [
            {
              code: "\uCE74\uD398-\uC81C\uACFC/\uBCA0\uC774\uCEE4\uB9AC",
              name: "\uC81C\uACFC/\uBCA0\uC774\uCEE4\uB9AC",
              sortOrder: 1,
            },
          ],
        },
      ],
    },
    {
      code: "\uB180\uAC70\uB9AC",
      name: "\uB180\uAC70\uB9AC",
      sortOrder: 3,
      tagGroups: [
        {
          code: "\uB180\uAC70\uB9AC-default",
          name: null,
          sortOrder: 1,
          tags: [
            {
              code: "\uB180\uAC70\uB9AC-\uD14C\uB9C8\uD30C\uD06C",
              name: "\uD14C\uB9C8\uD30C\uD06C",
              sortOrder: 1,
            },
            {
              code: "\uB180\uAC70\uB9AC-\uBCF4\uB4DC\uCE74\uD398",
              name: "\uBCF4\uB4DC\uCE74\uD398",
              sortOrder: 2,
            },
            {
              code: "\uB180\uAC70\uB9AC-\uB9CC\uD654\uCE74\uD398",
              name: "\uB9CC\uD654\uCE74\uD398",
              sortOrder: 3,
            },
            {
              code: "\uB180\uAC70\uB9AC-\uBB38\uD654/\uC608\uC220",
              name: "\uBB38\uD654/\uC608\uC220",
              sortOrder: 4,
            },
            {
              code: "\uB180\uAC70\uB9AC-\uBC29\uD0C8\uCD9C\uCE74\uD398",
              name: "\uBC29\uD0C8\uCD9C\uCE74\uD398",
              sortOrder: 5,
            },
            {
              code: "\uB180\uAC70\uB9AC-\uC2A4\uD3EC\uCE20",
              name: "\uC2A4\uD3EC\uCE20",
              sortOrder: 6,
            },
            {
              code: "\uB180\uAC70\uB9AC-\uCC1C\uC9C8\uBC29",
              name: "\uCC1C\uC9C8\uBC29",
              sortOrder: 7,
            },
            { code: "\uB180\uAC70\uB9AC-\uACF5\uC6D0", name: "\uACF5\uC6D0", sortOrder: 8 },
            {
              code: "\uB180\uAC70\uB9AC-\uC0DD\uD65C\uC6A9\uD488\uC810",
              name: "\uC0DD\uD65C\uC6A9\uD488\uC810",
              sortOrder: 9,
            },
            {
              code: "\uB180\uAC70\uB9AC-\uC544\uCFE0\uC544\uB9AC\uC6C0",
              name: "\uC544\uCFE0\uC544\uB9AC\uC6C0",
              sortOrder: 10,
            },
            { code: "\uB180\uAC70\uB9AC-\uAE30\uD0C0", name: "\uAE30\uD0C0", sortOrder: 11 },
          ],
        },
      ],
    },
  ],
};

export default function DevSelectOptionPage() {
  const selectRoom = useRoomSelectionStore((state) => state.selectRoom);
  const selectedRoom = useRoomSelectionStore((state) => state.selectedRoom);
  const isDevRoomReady = selectedRoom?.id === DEV_ROOM.id;

  useLayoutEffect(() => {
    if (!isDevRoomReady) {
      selectRoom(DEV_ROOM);
    }
  }, [isDevRoomReady, selectRoom]);

  if (!isDevRoomReady) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <MapHomePage defaultFilterPanelOpen filterDataOverride={DEV_FILTER_DATA} />
    </Suspense>
  );
}
