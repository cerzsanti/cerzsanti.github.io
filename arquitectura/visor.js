
// ==========================================
// CERZ — VISOR EDITORIAL OPTIMIZADO
// CASA MARGEN 02
// ==========================================

const PDF_PATH = "./publicacion.pdf";

const stage = document.getElementById("stage");
const book = document.getElementById("book");
const loading = document.getElementById("loading");

const previous = document.getElementById("previous");
const next = document.getElementById("next");
const counter = document.getElementById("counter");

let pdfDocument = null;
let flipBook = null;
let pageElements = [];
let imageUrls = [];

let totalPages = 0;
let pageRatio = 765.24 / 1190.52;
let resizeTimer = null;

// PDF.JS

if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

// ESTADO DE CARGA

function setStatus(message) {
    loading.textContent = message;
    loading.style.display = "block";
}

function hideStatus() {
    loading.style.display = "none";
}

// CALCULAR TAMAÑO DE LÁMINA

function getBookSize() {
    const availableWidth = Math.max(
        100,
        stage.clientWidth - 24
    );

    const availableHeight = Math.max(
        100,
        stage.clientHeight - 24
    );

    const width = Math.floor(
        Math.min(
            availableWidth,
            availableHeight / pageRatio
        )
    );

    return {
        width: Math.max(100, width),
        height: Math.max(100, Math.floor(width * pageRatio))
    };
}

// CREAR HOJAS VACÍAS

function createPageElements() {
    pageElements = [];

    for (let i = 0; i < totalPages; i++) {
        const page = document.createElement("div");
        page.className = "book-page";

        const image = document.createElement("img");
        image.alt = `Lámina ${i + 1} de ${totalPages}`;
        image.draggable = false;

        page.appendChild(image);
        pageElements.push(page);
    }
}

// RENDERIZAR UNA LÁMINA

async function renderPage(number) {
    const pdfPage = await pdfDocument.getPage(number);

    const base = pdfPage.getViewport({ scale: 1 });

    // Máximo 1500 px de ancho:
    // suficiente para una lectura inicial rápida.
    const targetWidth = Math.min(
        1500,
        Math.max(900, base.width * 1.15)
    );

    const viewport = pdfPage.getViewport({
        scale: targetWidth / base.width
    });

    const canvas = document.createElement("canvas");

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    const context = canvas.getContext("2d", {
        alpha: false
    });

    await pdfPage.render({
        canvasContext: context,
        viewport
    }).promise;

    const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
            result => result
                ? resolve(result)
                : reject(new Error("No se pudo generar la lámina")),
            "image/jpeg",
            0.85
        );
    });

    const url = URL.createObjectURL(blob);
    imageUrls.push(url);

    const image = pageElements[number - 1].querySelector("img");

    image.src = url;

    // Esperar a que la imagen esté lista.
    if (image.decode) {
        await image.decode().catch(() => {});
    }

    canvas.width = 0;
    canvas.height = 0;

    pdfPage.cleanup();
}

// CREAR LIBRO

function createBook(startPage = 0) {
    if (flipBook) {
        flipBook.destroy();
        flipBook = null;
    }

    book.innerHTML = "";

    const size = getBookSize();

    book.style.width = `${size.width}px`;
    book.style.height = `${size.height}px`;

    pageElements.forEach(page => {
        book.appendChild(page);
    });

    book.style.display = "block";

    flipBook = new St.PageFlip(book, {
        width: size.width,
        height: size.height,
        size: "fixed",

        usePortrait: true,
        showCover: false,

        flippingTime: 650,
        drawShadow: true,
        maxShadowOpacity: 0.25,

        mobileScrollSupport: false,
        startPage: startPage
    });

    flipBook.loadFromHTML(pageElements);

    flipBook.on("flip", updateCounter);

    updateCounter();
}

// CONTADOR

function updateCounter() {
    if (!flipBook) return;

    const current = flipBook.getCurrentPageIndex() + 1;

    counter.textContent =
        `${String(current).padStart(2, "0")} / ` +
        `${String(totalPages).padStart(2, "0")}`;

    previous.disabled = current <= 1;
    next.disabled = current >= totalPages;
}

// PERMITIR QUE EL NAVEGADOR ACTUALICE LA PANTALLA

function nextFrame() {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });
}

// CARGAR PUBLICACIÓN

async function loadPublication() {
    try {
        if (!window.pdfjsLib || !window.St?.PageFlip) {
            throw new Error(
                "No se cargaron las bibliotecas del visor."
            );
        }

        setStatus("ABRIENDO CASA MARGEN 02...");

        pdfDocument = await pdfjsLib.getDocument({
            url: PDF_PATH
        }).promise;

        totalPages = pdfDocument.numPages;

        const firstPage = await pdfDocument.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1 });

        pageRatio = viewport.height / viewport.width;

        createPageElements();

        // Primero renderizamos únicamente la portada.
        await renderPage(1);

        // El libro aparece inmediatamente.
        createBook(0);
        hideStatus();

        await nextFrame();

        // Las demás láminas se preparan progresivamente.
        for (let number = 2; number <= totalPages; number++) {
            try {
                await renderPage(number);
            } catch (pageError) {
                console.error(
                    `Error en lámina ${number}:`,
                    pageError
                );
            }

            await nextFrame();
        }

    } catch (error) {
        console.error("CERZ — Error del visor:", error);

        setStatus(
            "NO SE PUDO ABRIR LA PUBLICACIÓN: " +
            error.message
        );
    }
}

// FLECHAS

previous.addEventListener("click", () => {
    flipBook?.flipPrev();
});

next.addEventListener("click", () => {
    flipBook?.flipNext();
});

// TECLADO

document.addEventListener("keydown", event => {
    if (!flipBook) return;

    if (event.key === "ArrowRight") {
        flipBook.flipNext();
    }

    if (event.key === "ArrowLeft") {
        flipBook.flipPrev();
    }
});

// ADAPTAR A CAMBIOS DE PANTALLA

window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
        if (!flipBook) return;

        const currentPage = flipBook.getCurrentPageIndex();

        createBook(currentPage);
    }, 250);
});

// LIBERAR MEMORIA AL SALIR

window.addEventListener("pagehide", () => {
    imageUrls.forEach(url => URL.revokeObjectURL(url));
});

// INICIAR

loadPublication();
