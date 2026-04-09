import axios from "axios";

import { getMobileAuthBaseURL } from "./base-url";

/** `/v1/auth/mobile/*` 전용. `withCredentials: false` — Bearer·body refresh. 보호 API는 공통 `api`. */
export const mobileAuthClient = axios.create({
  baseURL: getMobileAuthBaseURL(),
  timeout: 15_000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});
