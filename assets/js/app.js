const pages = Array.from(document.querySelectorAll(".page"));
const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
const tabGroups = Array.from(document.querySelectorAll("[data-tabs]"));
const modal = document.querySelector("#image-modal");
const modalImage = document.querySelector("#modal-image");
const modalTitle = document.querySelector("#modal-title");
const modalZoomButton = document.querySelector("[data-toggle-zoom]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const narrowViewport = window.matchMedia("(max-width: 860px)");
const sidebarStorageKey = "portfolio-sidebar-collapsed-v3";

function getStoredSidebarState() {
  try {
    return localStorage.getItem(sidebarStorageKey);
  } catch {
    return null;
  }
}

function storeSidebarState(isCollapsed) {
  try {
    localStorage.setItem(sidebarStorageKey, String(isCollapsed));
  } catch {
    // The portfolio still works if storage is blocked on local files.
  }
}

function setSidebarCollapsed(isCollapsed, persist = true) {
  document.body.classList.toggle("sidebar-collapsed", isCollapsed);
  menuToggle?.setAttribute("aria-expanded", String(!isCollapsed));
  if (persist) {
    storeSidebarState(isCollapsed);
  }
}

const savedSidebarState = getStoredSidebarState();
setSidebarCollapsed(
  savedSidebarState === null ? true : savedSidebarState === "true",
  false
);

requestAnimationFrame(() => {
  document.body.classList.add("sidebar-ready");
});

narrowViewport.addEventListener("change", (event) => {
  if (event.matches) {
    setSidebarCollapsed(true, false);
  } else {
    const storedState = getStoredSidebarState();
    setSidebarCollapsed(storedState === null ? true : storedState === "true", false);
  }
});

function normalizePage(value) {
  const wanted = value?.replace("#", "") || "accueil";
  return pages.some((page) => page.id === wanted) ? wanted : "accueil";
}

function activatePage(pageId) {
  pages.forEach((page) => {
    page.classList.toggle("is-active", page.id === pageId);
  });

  navLinks.forEach((link) => {
    const isActive = link.dataset.nav === pageId;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  document.title = pageId === "accueil"
    ? "Portfolio BUT2 - Gabin Morel"
    : `${document.querySelector(`#${pageId} h1`)?.textContent.trim()} - Portfolio Gabin Morel`;

  window.scrollTo({ top: 0, behavior: "auto" });
}

function handleRoute() {
  activatePage(normalizePage(window.location.hash));
}

function activateTab(group, tabId) {
  const buttons = Array.from(group.querySelectorAll("[data-tab-target]"));
  const panels = Array.from(group.querySelectorAll("[data-tab-panel]"));

  buttons.forEach((button) => {
    const isActive = button.dataset.tabTarget === tabId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.tabPanel === tabId);
  });
}

function setModalZoom(isZoomed) {
  if (!modal) return;
  modal.classList.toggle("is-zoomed", isZoomed);
  modalZoomButton?.setAttribute("aria-pressed", String(isZoomed));
  if (modalZoomButton) {
    modalZoomButton.textContent = isZoomed ? "Ajuster" : "Zoomer";
  }
}

function toggleModalZoom() {
  setModalZoom(!modal?.classList.contains("is-zoomed"));
}

window.addEventListener("hashchange", handleRoute);
handleRoute();

menuToggle?.addEventListener("click", () => {
  setSidebarCollapsed(!document.body.classList.contains("sidebar-collapsed"));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setSidebarCollapsed(true);
  });
});

tabGroups.forEach((group) => {
  const firstTab = group.querySelector("[data-tab-target]")?.dataset.tabTarget;
  activateTab(group, firstTab);

  group.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab-target]");
    if (!button) return;
    activateTab(group, button.dataset.tabTarget);
  });
});

document.querySelectorAll("[data-open-image]").forEach((button) => {
  button.addEventListener("click", () => {
    const img = button.querySelector("img");
    if (!img || !modal || !modalImage) return;
    setModalZoom(false);
    modalImage.src = img.currentSrc || img.src;
    modalImage.alt = img.alt;
    if (modalTitle) {
      modalTitle.textContent = button.dataset.imageTitle || img.alt;
    }
    modal.showModal();
  });
});

modalZoomButton?.addEventListener("click", toggleModalZoom);
modalImage?.addEventListener("click", toggleModalZoom);

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => modal?.close());
});

modal?.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

modal?.addEventListener("close", () => {
  setModalZoom(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal?.open) modal.close();
  if ((event.key === "z" || event.key === "Z") && modal?.open) toggleModalZoom();
});
