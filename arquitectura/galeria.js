
const projects = [
  {
    title: "CASA MARGEN",
    image: "./imagenes/CASA%20MARGEN%20_FRENTE_FOTO.png",
    alt: "Casa Margen — vista exterior"
  },
  {
    title: "LA RESERVA",
    image: "./imagenes/Propuesta%20casa%20La%20Reserva.png",
    alt: "Propuesta residencial La Reserva"
  },
  {
    title: "VIVIENDA COLECTIVA / YERBA BUENA",
    image: "./imagenes/Propuesta%20Viv%20Colectiva%20Yerba%20Buena.png",
    alt: "Vivienda colectiva Yerba Buena"
  }
];

const lightbox = document.getElementById("lightbox");
const viewerImage = document.getElementById("viewerImage");
const viewerTitle = document.getElementById("viewerTitle");
const viewerCounter = document.getElementById("viewerCounter");

let currentIndex = 0;
let previousFocus = null;

function showImage(index) {
  currentIndex = (index + projects.length) % projects.length;
  const project = projects[currentIndex];

  viewerImage.src = project.image;
  viewerImage.alt = project.alt;
  viewerTitle.textContent = project.title;
  viewerCounter.textContent =
    `${String(currentIndex + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
}

function openViewer(index) {
  previousFocus = document.activeElement;
  showImage(index);
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.getElementById("closeViewer").focus();
}

function closeViewer() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  viewerImage.removeAttribute("src");
  if (previousFocus) previousFocus.focus();
}

document.querySelectorAll(".project").forEach(button => {
  button.addEventListener("click", () => {
    openViewer(Number(button.dataset.index));
  });
});

document.getElementById("closeViewer")
  .addEventListener("click", closeViewer);

document.getElementById("prevImage")
  .addEventListener("click", () => showImage(currentIndex - 1));

document.getElementById("nextImage")
  .addEventListener("click", () => showImage(currentIndex + 1));

lightbox.addEventListener("click", event => {
  if (event.target === lightbox) closeViewer();
});

document.addEventListener("keydown", event => {
  if (!lightbox.classList.contains("open")) return;

  if (event.key === "Escape") closeViewer();
  if (event.key === "ArrowLeft") showImage(currentIndex - 1);
  if (event.key === "ArrowRight") showImage(currentIndex + 1);
});

// Gestos táctiles en el visor

let touchStartX = 0;

lightbox.addEventListener("touchstart", event => {
  touchStartX = event.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener("touchend", event => {
  const distance =
    event.changedTouches[0].screenX - touchStartX;

  if (Math.abs(distance) > 60) {
    showImage(currentIndex + (distance < 0 ? 1 : -1));
  }
}, { passive: true });

// Cursor CERZ

const cursor = document.getElementById("customCursor");

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.addEventListener("pointermove", event => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.style.opacity = "1";
  });

  document.addEventListener("pointerleave", () => {
    cursor.style.opacity = "0";
  });

  document.querySelectorAll("a, button").forEach(element => {
    element.addEventListener("pointerenter", () => {
      cursor.classList.add("active");
    });

    element.addEventListener("pointerleave", () => {
      cursor.classList.remove("active");
    });
  });
}
