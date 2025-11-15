import DragHandle from "@tiptap/extension-drag-handle";

export const OfficialDragHandle = DragHandle.configure({
  render: () => {
    const element = document.createElement("div");
    element.className = "drag-handle-container";

    element.style.cssText = `
      z-index: 50;
      cursor: grab;
      border-radius: 6px;
      padding: 6px;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      backdrop-filter: blur(8px);
    `;

    element.innerHTML = `
      <div class="drag-handle" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="2" cy="2" r="1" fill="currentColor"/>
          <circle cx="6" cy="2" r="1" fill="currentColor"/>
          <circle cx="2" cy="6" r="1" fill="currentColor"/>
          <circle cx="6" cy="6" r="1" fill="currentColor"/>
          <circle cx="2" cy="10" r="1" fill="currentColor"/>
          <circle cx="6" cy="10" r="1" fill="currentColor"/>
        </svg>
      </div>
    `;

    const updateTheme = (isDark?: boolean) => {
      const darkMode =
        isDark ??
        (window.matchMedia("(prefers-color-scheme: dark)").matches ||
          document.documentElement.classList.contains("dark"));

      if (darkMode) {
        element.style.background = "rgba(39, 39, 42, 0.8)";
        element.style.border = "1px solid rgba(255, 255, 255, 0.1)";
        element.style.color = "rgba(161, 161, 170, 0.8)";
        element.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.3)";
      } else {
        element.style.background = "rgba(255, 255, 255, 0.8)";
        element.style.border = "1px solid rgba(0, 0, 0, 0.1)";
        element.style.color = "rgba(107, 114, 128, 0.7)";
        element.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
      }
    };

    updateTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", (e) => updateTheme(e.matches));

    const observer = new MutationObserver(() => {
      updateTheme();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    element.addEventListener("mouseenter", () => {
      element.style.transform = "scale(1.05)";
      element.style.cursor = "grab";

      const darkMode =
        window.matchMedia("(prefers-color-scheme: dark)").matches ||
        document.documentElement.classList.contains("dark");

      if (darkMode) {
        element.style.background = "rgba(63, 63, 70, 0.9)";
        element.style.color = "rgba(212, 212, 216, 0.9)";
        element.style.borderColor = "rgba(255, 255, 255, 0.2)";
      } else {
        element.style.background = "rgba(249, 250, 251, 0.9)";
        element.style.color = "rgba(75, 85, 99, 0.9)";
        element.style.borderColor = "rgba(0, 0, 0, 0.15)";
      }
    });

    element.addEventListener("mouseleave", () => {
      element.style.transform = "scale(1)";
      updateTheme();
    });

    element.addEventListener("mousedown", () => {
      element.style.cursor = "grabbing";
      element.style.transform = "scale(0.95)";
    });

    element.addEventListener("mouseup", () => {
      element.style.cursor = "grab";
      element.style.transform = "scale(1.05)";
    });

    return element;
  },

  computePositionConfig: {
    placement: "left-start",
  },
});
