
const projects = [
  {
    title: "CASA MARGEN / LA RESERVA",
    image: "./imagenes/CASA%20MARGEN%20_FRENTE_FOTO.png",
    alt: "Casa Margen — vista exterior"
  },
  {
    title: "LA RESERVA / VIVIENDA",
    image: "./imagenes/Propuesta%20casa%20La%20Reserva.png",
    alt: "Propuesta residencial La Reserva"
  },
  {
    title: "VIVIENDA COLECTIVA / YERBA BUENA",
    image: "./imagenes/Propuesta%20Viv%20Colectiva%20Yerba%20Buena.png",
    alt: "Vivienda colectiva Yerba Buena"
  },
  {
    title: "ESPACIO PARA EVENTOS",
    image: "./imagenes/Fiesta%20al%20anochecer%20junto%20a%20la%20piscina.png",
    alt: "Espacio para eventos junto a la piscina"
  },
  {
    title: "DETALLE CONSTRUCTIVO / FACHADA Y CUBIERTA",
    image: "./imagenes/Conexi%C3%B3n%20moderna%20de%20fachada%20y%20cubierta.png",
    alt: "Conexión constructiva entre fachada y cubierta"
  }
];

/* ELEMENTOS DEL VISOR */

const lightbox = document.getElementById("lightbox");
const viewerImage = document.getElementById("viewerImage");
const viewerTitle = document.getElementById("viewerTitle");
const viewerCounter = document.getElementById("viewerCounter");

const closeButton = document.getElementById("closeViewer");
const prevButton = document.getElementById("prevImage");
const nextButton = document.getElementById("nextImage");

let currentIndex = 0;
let previousFocus = null;

/* MOSTRAR IMAGEN */

function showImage(index) {
  currentIndex = (index + projects.length) % projects.length;

  const project = projects[currentIndex];

  viewerImage.src = project.image;
  viewerImage.alt = project.alt;
  viewerTitle.textContent = project.title;

  viewerCounter.textContent =
    `${String(currentIndex + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
}

/* ABRIR VISOR */

function openViewer(index) {
  previousFocus = document.activeElement;

  showImage(index);

  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

  closeButton.focus();
}

/* CERRAR VISOR */

function closeViewer() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

  viewerImage.removeAttribute("src");

  if (previousFocus) {
    previousFocus.focus();
  }
}

/* CLIC EN PROYECTOS */

document.querySelectorAll(".project").forEach(button => {
  button.addEventListener("click", () => {
    openViewer(Number(button.dataset.index));
  });
});

/* BOTONES DEL VISOR */

closeButton.addEventListener("click", closeViewer);

prevButton.addEventListener("click", () => {
  showImage(currentIndex - 1);
});

nextButton.addEventListener("click", () => {
  showImage(currentIndex + 1);
});

/* CERRAR AL HACER CLIC EN EL FONDO */

lightbox.addEventListener("click", event => {
  if (event.target === lightbox) {
    closeViewer();
  }
});

/* NAVEGACIÓN CON TECLADO */

document.addEventListener("keydown", event => {
  if (!lightbox.classList.contains("open")) return;

  if (event.key === "Escape") {
    closeViewer();
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showImage(currentIndex - 1);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    showImage(currentIndex + 1);
  }

  if (event.key === "Tab") {
    const controls = [closeButton, prevButton, nextButton];
    const index = controls.indexOf(document.activeElement);

    if (event.shiftKey && index === 0) {
      event.preventDefault();
      nextButton.focus();
    } else if (!event.shiftKey && index === controls.length - 1) {
      event.preventDefault();
      closeButton.focus();
    }
  }
});

/* GESTOS TÁCTILES */

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

/* CURSOR CERZ */

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
