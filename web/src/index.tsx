/* @refresh reload */
import { render } from "solid-js/web";
import { routes } from "./routes/routes";
import "@fontsource/jetbrains-mono";
import "overlayscrollbars/overlayscrollbars.css";
import "@widgets/styles/base.css";
import { Router } from "@solidjs/router";
import { fullTheme, initTheme, t } from "@storage/theme";
import { addToast } from "@storage/toast";
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { onMount } from "solid-js";

function checkEdition() {
  const compact_edition: string = import.meta.env.VITE_COMPAT_EDITION as string;
  const edition = localStorage.getItem("edition");
  const needReload =
    edition !== compact_edition &&
    (localStorage.getItem("theme") !== null ||
      localStorage.getItem("account") !== null ||
      localStorage.getItem("platform") !== null);
  if (compact_edition && needReload) {
    localStorage.clear();
    localStorage.removeItem("theme");
    localStorage.setItem("edition", compact_edition);
    localStorage.setItem("updated", "true");
    location.reload();
  } else if (compact_edition) {
    localStorage.setItem("edition", compact_edition);
  }
}

function postUpdated() {
  const updated = localStorage.getItem("updated");
  if (updated === "true") {
    localStorage.removeItem("updated");
    setTimeout(() => {
      addToast({
        level: "warning",
        description: t("platform.updated")!,
        duration: 10000,
      });
    }, 1000);
  }
}

render(() => {
  checkEdition();
  initTheme();
  postUpdated();
  onMount(() => {
    setTimeout(() => {
      document.documentElement.classList.add("transition-colors", "duration-700");
      document.body.classList.add("transition-colors", "duration-700");
    }, 1000);
  });
  return (
    <OverlayScrollbarsComponent
      options={{
        scrollbars: {
          theme: `os-theme-${fullTheme()}`,
          autoHide: "scroll",
        },
      }}
      class="relative w-screen h-screen print:h-auto print:overflow-auto"
      defer
    >
      <div class="flex flex-col min-h-full min-w-fit">
        <Router explicitLinks>{routes}</Router>
      </div>
    </OverlayScrollbarsComponent>
  );
}, document.getElementById("root") || document.body);
