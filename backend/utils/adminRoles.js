export const ADMIN_ROLES = [
    { name: "Manager", permissions: ["orders:read", "orders:write", "catalog:write", "store:write", "staff:manage"] },
    { name: "Kitchen Staff", permissions: ["orders:read", "orders:write"] }
];
