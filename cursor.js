
// =======================================
// CERZ — CURSOR PERSONALIZADO
// =======================================

const cursor = document.querySelector(".custom-cursor");

const interactiveElements = document.querySelectorAll(
    ".nav-item, .header-brand"
);

const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
);

if (cursor && finePointer.matches) {

    // Seguir el movimiento del mouse

    document.addEventListener("pointermove", (event) => {

        if (event.pointerType !== "mouse") return;

        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
        cursor.style.opacity = "1";

    });

    // Ocultar cuando el puntero sale de la página

    document.addEventListener("mouseout", (event) => {

        if (!event.relatedTarget) {
            cursor.style.opacity = "0";
        }

    });

    // Transformación sobre enlaces

    interactiveElements.forEach((element) => {

        element.addEventListener("mouseenter", () => {
            cursor.classList.add("is-hovering");
        });

        element.addEventListener("mouseleave", () => {
            cursor.classList.remove("is-hovering");
        });

    });
}
