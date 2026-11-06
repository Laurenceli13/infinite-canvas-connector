import assert from "node:assert/strict";
import test from "node:test";

import { canvasToolsForSource, externalMcpLoginRequired, isAllowedCanvasOrigin, isAllowedCanvasUrl, normalizeCanvasAccess } from "./access.mjs";

const tools = [
    { name: "get_canvas_summary" },
    { name: "generate_image" },
    { name: "set_agent_state" },
    { name: "read_skill_file" },
];

test("external MCP is blocked before canvas login", () => {
    const access = normalizeCanvasAccess({ loggedIn: false });
    assert.equal(externalMcpLoginRequired("external", access), true);
    assert.deepEqual(canvasToolsForSource(tools, "external", access), []);
});

test("external MCP receives user-safe tools after login", () => {
    const access = normalizeCanvasAccess({ loggedIn: true, userId: "user-1" });
    assert.equal(externalMcpLoginRequired("external", access), false);
    assert.deepEqual(canvasToolsForSource(tools, "external", access).map(({ name }) => name), ["get_canvas_summary", "generate_image"]);
});

test("internal Codex is not blocked by the external login gate", () => {
    const access = normalizeCanvasAccess(null);
    assert.equal(externalMcpLoginRequired("codex", access), false);
    assert.equal(canvasToolsForSource(tools, "codex", access).length, tools.length);
});

test("incomplete access claims are normalized to logged out", () => {
    assert.deepEqual(normalizeCanvasAccess({ loggedIn: true, userId: " " }), { loggedIn: false, userId: "" });
});

test("only the two production canvas origins are accepted", () => {
    assert.equal(isAllowedCanvasOrigin("https://studio.massmore.org"), true);
    assert.equal(isAllowedCanvasOrigin("https://canvas.linkfoai.com"), true);
    assert.equal(isAllowedCanvasOrigin("https://example.com"), false);
    assert.equal(isAllowedCanvasOrigin("http://studio.massmore.org"), false);
});

test("canvas URLs require HTTPS and an existing canvas route", () => {
    assert.equal(isAllowedCanvasUrl("https://studio.massmore.org/canvas/canvas-1"), true);
    assert.equal(isAllowedCanvasUrl("https://canvas.linkfoai.com/canvas/canvas-1?view=grid#agentUrl=x"), true);
    assert.equal(isAllowedCanvasUrl("https://studio.massmore.org/canvas"), false);
    assert.equal(isAllowedCanvasUrl("https://studio.massmore.org/admin/settings"), false);
    assert.equal(isAllowedCanvasUrl("https://studio.massmore.org@evil.example/canvas/canvas-1"), false);
});
