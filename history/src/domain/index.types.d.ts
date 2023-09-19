type ServiceStatus =
  (typeof import("./index").ServiceStatus)[keyof typeof import("./index").ServiceStatus]
