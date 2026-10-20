
// ==========================================
// CERZ — DJ SETS
// ==========================================

const videos = [

    {
        id: "cdaPJ3ApcDE",
        titulo: "DJ SET 01"
    },

    {
        id: "7eljrhr_SO4",
        titulo: "DJ SET 02"
    }

];

const gallery = document.getElementById(
    "music-gallery"
);

videos.forEach((video, index) => {

    // TARJETA

    const card = document.createElement("a");

    card.className = "video-card";

    card.href =
        `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`;

    card.target = "_blank";
    card.rel = "noopener noreferrer";

    card.setAttribute(
        "aria-label",
        `Ver ${video.titulo} en YouTube`
    );

    // MINIATURA

    const image = document.createElement("div");
    image.className = "video-image";

    const thumbnail = document.createElement("img");

    thumbnail.src =
        `https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg`;

    thumbnail.alt = video.titulo;
    thumbnail.loading = "lazy";

    // PLAY

    const play = document.createElement("span");

    play.className = "video-play";
    play.setAttribute("aria-hidden", "true");

    image.appendChild(thumbnail);
    image.appendChild(play);

    // TEXTO

    const info = document.createElement("div");
    info.className = "video-info";

    const title = document.createElement("span");

    title.className = "video-title";
    title.textContent = video.titulo;

    const number = document.createElement("span");

    number.className = "video-number";

    number.textContent =
        String(index + 1).padStart(2, "0");

    info.appendChild(title);
    info.appendChild(number);

    // ENSAMBLADO

    card.appendChild(image);
    card.appendChild(info);

    gallery.appendChild(card);
});
