export const CANVAS_ORIGINS = ["https://studio.massmore.org", "https://canvas.linkfoai.com"];

export function normalizeCanvasAccess(access) {
    const loggedIn = access?.loggedIn === true && typeof access.userId === "string" && Boolean(access.userId.trim());
    return { loggedIn, userId: loggedIn ? access.userId.trim() : "" };
}

export function isAllowedCanvasOrigin(origin) {
    return CANVAS_ORIGINS.includes(origin);
}

export function isAllowedCanvasUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:"
            && !url.username
            && !url.password
            && isAllowedCanvasOrigin(url.origin)
            && /^\/canvas\/[^/]+\/?$/.test(url.pathname);
    } catch {
        return false;
    }
}

export function externalMcpLoginRequired(source, access) {
    return source === "external" && !access?.loggedIn;
}

export function canvasToolsForSource(tools, source, access) {
    if (externalMcpLoginRequired(source, access)) return [];
    if (source === "external") return tools.filter(({ name }) => name !== "set_agent_state" && name !== "read_skill_file");
    return tools;
}
