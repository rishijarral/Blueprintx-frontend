// API client and helpers
export {
  apiGet,
  apiGetPaginated,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiUpload,
  ApiError,
} from "./client";

// Domain-specific API modules
export { profileApi } from "./profile";
export { projectsApi } from "./projects";
export { documentsApi } from "./documents";
export { tendersApi } from "./tenders";
export { bidsApi } from "./bids";
export { tasksApi } from "./tasks";
export { rfisApi } from "./rfis";
export { subcontractorsApi } from "./subcontractors";
export { aiApi } from "./ai";

// New feature API modules
export { jobsApi } from "./jobs";
export { extractionApi } from "./extraction";
export { hiringApi } from "./hiring";

// Marketplace feature API modules
export { notificationsApi } from "./notifications";
export { marketplaceApi } from "./marketplace";
export { adminApi } from "./admin";
