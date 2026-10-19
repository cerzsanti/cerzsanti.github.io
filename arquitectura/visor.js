
// ==========================================
// CERZ — VISOR PDF CON EFECTO DE HOJAS
// ==========================================

const PDF_PATH = "publicacion.pdf";

const stage = document.getElementById("stage");
const book = document.getElementById("book");
const loading = document.getElementById("loading");

const previous = document.getElementById("previous");
const next = document.getElementById("next");
const counter = document.getElementById("counter");
const fullscreen = document.getElementById("fullscreen");
const viewer = document.getElementById("viewer");

let flipBook = null;
let pageElements = [];
let pageRatio = 1.414;
let totalPages = 0;
let resizeTimer = null;

// CONFIGURACIÓN DEL LECTOR PDF

if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

// MOSTRAR ESTADO

function setStatus(message) {
    loading.textContent = message;
    loading.style.display = "block";
}

// RENDERIZAR UNA PÁGINA DEL PDF

async function renderPdfPage(pdf, number) {

    const page = await pdf.getPage(number);

    const baseViewport = page.getViewport({
        scale: 1
    });

    if (number === 1) {
        pageRatio = baseViewport.height / baseViewport.width;
    }

    // Resolución de renderizado para buena lectura
    const targetWidth = Math.min(
        2000,
        Math.max(1000, baseViewport.width * 1.6)
    );

    const scale = targetWidth / baseViewport.width;

    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    const context = canvas.getContext("2d", {
        alpha: false
    });

    await page.render({
        canvasContext: context,
        viewport
    }).promise;

    const element = document.createElement("div");
    element.className = "book-page";

    const image = document.createElement("img");

    image.src = canvas.toDataURL("image/jpeg", 0.92);
    image.alt = `Página ${number} de ${totalPages}`;
    image.draggable = false;

    element.appendChild(image);

    // Liberar memoria del canvas temporal
    canvas.width = 0;
    canvas.height = 0;

    return element;
}

// CALCULAR DIMENSIONES SEGÚN LA PANTALLA

function getBookSize() {

    const availableWidth = Math.max(
        100,
        stage.clientWidth - 20
    );

    const availableHeight = Math.max(
        100,
        stage.clientHeight - 20
    );

    // Una página por vez, respetando proporciones
    const width = Math.floor(
        Math.min(
            availableWidth,
            availableHeight / pageRatio
        )
    );

    const height = Math.floor(width * pageRatio);

    return {
        width: Math.max(100, width),
        height: Math.max(100, height)
    };
}

// CREAR EL LIBRO

function createBook(startPage = 0) {

    if (flipBook) {
        flipBook.destroy();
        flipBook = null;
    }

    book.innerHTML = "";

    const size = getBookSize();

    book.style.width = `${size.width}px`;
    book.style.height = `${size.height}px`;

    pageElements.forEach((page) => {
        book.appendChild(page);
    });

    book.style.display = "block";

    flipBook = new St.PageFlip(book, {
        width: size.width,
        height: size.height,

        size: "fixed",

        // Mantener una sola lámina visible
        usePortrait: true,

        showCover: false,

        flippingTime: 650,

        drawShadow: true,
        maxShadowOpacity: 0.3,

        mobileScrollSupport: false,

        clickEventForward: true,

        startPage: Math.min(
            startPage,
            totalPages - 1
        )
    });

    flipBook.loadFromHTML(pageElements);

    flipBook.on("flip", updateCounter);

    updateCounter();
}

// ACTUALIZAR CONTADOR Y FLECHAS

function updateCounter() {

    if (!flipBook) return;

    const current = flipBook.getCurrentPageIndex() + 1;

    counter.textContent =
        `${String(current).padStart(2, "0")} / ` +
        `${String(totalPages).padStart(2, "0")}`;

    previous.disabled = current <= 1;
    next.disabled = current >= totalPages;
}

// CARGAR EL DOCUMENTO

async function loadPublication() {

    try {

        if (!window.pdfjsLib || !window.St?.PageFlip) {
            throw new Error(
                "No se pudieron cargar las bibliotecas del visor."
            );
        }

        setStatus("ABRIENDO PUBLICACIÓN...");

        const pdf = await pdfjsLib.getDocument(
            PDF_PATH
        ).promise;

        totalPages = pdf.numPages;

        pageElements = [];

        for (let number = 1; number <= totalPages; number++) {

            setStatus(
                `PREPARANDO PÁGINA ${number} / ${totalPages}`
            );

            const element = await renderPdfPage(
                pdf,
                number
            );

            pageElements.push(element);
        }

        loading.style.display = "none";

        createBook(0);

    } catch (error) {

        console.error("Error del visor CERZ:", error);

        setStatus(
            "NO SE PUDO ABRIR EL PDF. " +
            "VERIFICÁ QUE EXISTA arquitectura/publicacion.pdf"
        );
    }
}

// CONTROLES DE NAVEGACIÓN

previous.addEventListener("click", () => {
    if (flipBook) flipBook.flipPrev();
});

next.addEventListener("click", () => {
    if (flipBook) flipBook.flipNext();
});

// FLECHAS DEL TECLADO

document.addEventListener("keydown", (event) => {

    if (!flipBook) return;

    if (event.key === "ArrowRight") {
        flipBook.flipNext();
    }

    if (event.key === "ArrowLeft") {
        flipBook.flipPrev();
    }
});

// PANTALLA COMPLETA

fullscreen.addEventListener("click", async () => {

    try {

        if (!document.fullscreenElement) {
            await viewer.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }

    } catch (error) {
        console.error("Pantalla completa:", error);
    }
});

// RECONSTRUIR EL LIBRO AL CAMBIAR TAMAÑO

function resizeBook() {

    if (!flipBook) return;

    const currentPage = flipBook.getCurrentPageIndex();

    createBook(currentPage);
}

window.addEventListener("resize", () => {

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(resizeBook, 200);
});

document.addEventListener("fullscreenchange", () => {

    fullscreen.textContent = document.fullscreenElement
        ? "SALIR DE PANTALLA COMPLETA"
        : "PANTALLA COMPLETA";

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeBook, 200);
});

// INICIAR

loadPublication();
