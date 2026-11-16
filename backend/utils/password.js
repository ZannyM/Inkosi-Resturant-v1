// Used to keep missing-user and wrong-password login checks comparable.
export const DUMMY_PASSWORD_HASH = "$2b$10$xaVFDKaAPMxaY5fzhfeJrOZroR/csJbjoRxaVSr2lPqqhMTiOQbCq";

export const validAdminPassword = password => typeof password === "string" &&
    Buffer.byteLength(password, "utf8") >= 12 && Buffer.byteLength(password, "utf8") <= 72;
