import { registerSW } from "virtual:pwa-register";
import { show } from "./utilities";

export const initPwa = () => {
  const notification = document.getElementById("notification");
  const reloadButton = document.getElementById("reload");

  const updateSW = registerSW({
    onNeedRefresh() {
      show(notification);
    },
  });

  reloadButton.addEventListener("click", () => {
    updateSW(true);
  });
};
