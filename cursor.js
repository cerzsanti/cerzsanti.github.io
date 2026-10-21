
/* CERZ — Cursor global */

(() => {
    const finePointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    );

    if (!finePointer.matches) return;

    // Evita crear dos cursores si el script se carga dos veces.
    if (document.getElementById("cerz-cursor")) return;

    const cursor = document.createElement("div");
    cursor.id = "cerz-cursor";
    cursor.setAttribute("aria-hidden", "true");

    document.body.appendChild(cursor);

    const style = document.createElement("style");

    style.textContent = `
        @media (hover: hover) and (pointer: fine) {

            html, body,
            body * {
                cursor: none !important;
            }

            #cerz-cursor {
                position: fixed;
                top: 0;
                left: 0;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #f4f1eb;
                border: 1px solid transparent;
                pointer-events: none;
                z-index: 2147483647;

                opacity: 0;
                transform: translate(-50%, -50%);
                transition:
                    width 180ms ease,
                    height 180ms ease,
                    background 180ms ease,
                    border-color 180ms ease,
                    opacity 120ms ease;
            }

            #cerz-cursor.is-visible {
                opacity: 1;
            }

            #cerz-cursor.is-interactive {
                width: 32px;
                height: 32px;
                background: transparent;
                border-color: #f4f1eb;
            }
        }
    `;

    document.head.appendChild(style);

    const interactiveSelector = [
        "a",
        "button",
        "input",
        "select",
        "textarea",
        "[role='button']",
        ".nav-item"
    ].join(", ");

    document.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;

        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
        cursor.classList.add("is-visible");

        const target = event.target;

        const interactive =
            target instanceof Element &&
            Boolean(target.closest(interactiveSelector));

        cursor.classList.toggle("is-interactive", interactive);
    });

    document.addEventListener("pointerout", (event) => {
        if (!event.relatedTarget) {
            cursor.classList.remove("is-visible");
        }
    });

    window.addEventListener("blur", () => {
        cursor.classList.remove("is-visible");
    });
})();
