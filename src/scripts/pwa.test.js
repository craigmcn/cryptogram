import { vi, describe, it, expect, beforeEach } from "vitest";

const registerSW = vi.fn();

vi.mock("virtual:pwa-register", () => ({
  registerSW: (options) => registerSW(options),
}));

describe("pwa", () => {
  let notification;
  let reloadButton;
  let updateSW;

  beforeEach(async () => {
    vi.resetModules();
    registerSW.mockReset();

    notification = document.getElementById("notification");
    reloadButton = document.getElementById("reload");
    notification.setAttribute("hidden", true);

    updateSW = vi.fn();
    registerSW.mockReturnValue(updateSW);

    const { initPwa } = await import("./pwa");
    initPwa();
  });

  it("registers the service worker", () => {
    expect(registerSW).toHaveBeenCalledOnce();
  });

  it("shows the notification banner when onNeedRefresh fires", () => {
    const { onNeedRefresh } = registerSW.mock.calls[0][0];

    expect(notification.hasAttribute("hidden")).toBe(true);
    onNeedRefresh();
    expect(notification.hasAttribute("hidden")).toBe(false);
  });

  it("activates the new service worker and reloads on button click", () => {
    reloadButton.dispatchEvent(new Event("click"));
    expect(updateSW).toHaveBeenCalledWith(true);
  });
});
