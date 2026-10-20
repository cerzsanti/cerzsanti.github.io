
// ==========================================
// CERZ — VISOR PDF OPTIMIZADO
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

if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

function setStatus(message) {
    loading.textContent = message;
    loading.style.display = "block";
}

function hideStatus() {
    loading.style.display = "none";
}

// DIMENSIONES

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
        height: Math.max(
            100,
            Math.floor(width * pageRatio)
        )
    };
}

// HOJAS

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

// RENDERIZADO

async function renderPage(number) {

    const pdfPage = await pdfDocument.getPage(number);
    const base = pdfPage.getViewport({ scale: 1 });

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

    const blob = await new Promise(
        (resolve, reject) => {

            canvas.toBlob(
                result => result
                    ? resolve(result)
                    : reject(
                        new Error(
                            "No se pudo generar la lámina"
                        )
                    ),
                "image/jpeg",
                0.85
            );
        }
    );

    const url = URL.createObjectURL(blob);
    imageUrls.push(url);

    const image = pageElements[number - 1]
        .querySelector("img");

    image.src = url;

    if (image.decode) {
        await image.decode().catch(() => {});
    }

    canvas.width = 0;
    canvas.height = 0;

    pdfPage.cleanup();
}

// LIBRO

function createBook(startPage = 0) {

    if (flipBook) {
        flipBook.destroy();
        flipBook = null;
    }

    book.innerHTML = "";

    const size = getBookSize();

    book.style.width = `${size.width}px`;
    book.style.height = `${size.height}px`;
    book.style.display = "block";

    pageElements.forEach(page => {
        book.appendChild(page);
    });

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
        startPage

    });

    flipBook.loadFromHTML(pageElements);

    flipBook.on("flip", updateCounter);

    updateCounter();
}

// CONTROLES

function updateCounter() {

    if (!flipBook) return;

    const current =
        flipBook.getCurrentPageIndex() + 1;

    counter.textContent =
        `${String(current).padStart(2, "0")} / ` +
        `${String(totalPages).padStart(2, "0")}`;

    previous.disabled = current <= 1;
    next.disabled = current >= totalPages;
}

function nextFrame() {

    return new Promise(resolve => {

        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });

    });
}

// CARGA

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

        const viewport = firstPage.getViewport({
            scale: 1
        });

        pageRatio =
            viewport.height / viewport.width;

        createPageElements();

        // Mostrar primero la portada.
        await renderPage(1);

        createBook(0);
        hideStatus();

        await nextFrame();

        // Preparar las restantes progresivamente.
        for (
            let number = 2;
            number <= totalPages;
            number++
        ) {

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

        console.error(
            "CERZ — Error del visor:",
            error
        );

        setStatus(
            "NO SE PUDO ABRIR LA PUBLICACIÓN: " +
            error.message
        );
    }
}

// BOTONES

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

// RESPONSIVE

window.addEventListener("resize", () => {

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {

        if (!flipBook) return;

        const currentPage =
            flipBook.getCurrentPageIndex();

        createBook(currentPage);

    }, 250);
});

// LIMPIEZA

window.addEventListener("pagehide", () => {

    imageUrls.forEach(url => {
        URL.revokeObjectURL(url);
    });
});

// INICIO

loadPublication();
