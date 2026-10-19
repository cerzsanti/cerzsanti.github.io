
// CERZ — CURSOR PERSONALIZADO

const cursor = document.querySelector(".custom-cursor");

const links = document.querySelectorAll(".nav-item");

const mouseDisponible = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
);

if (cursor && mouseDisponible.matches) {

    document.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;

        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
        cursor.style.opacity = "1";
    });

    document.addEventListener("mouseout", (event) => {
        if (!event.relatedTarget) {
            cursor.style.opacity = "0";
        }
    });

    links.forEach((link) => {
        link.addEventListener("mouseenter", () => {
            cursor.classList.add("is-hovering");
        });

        link.addEventListener("mouseleave", () => {
            cursor.classList.remove("is-hovering");
        });
    });
}
