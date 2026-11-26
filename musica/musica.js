
/* =========================================
   CERZ — MÚSICA
   ========================================= */


/* =========================================
   01 — REPRODUCTORES
   ========================================= */

function iniciarReproductores() {

    const players =
        document.querySelectorAll(".audio-player");

    const playSVG =
        '<path d="M8 5 L19 12 L8 19 Z"/>';

    const pauseSVG =
        '<rect x="6" y="5" width="4" height="14"/>' +
        '<rect x="14" y="5" width="4" height="14"/>';

    function formatTime(seconds) {

        if (!Number.isFinite(seconds)) {
            return "00:00";
        }

        const minutes = Math.floor(seconds / 60);
        const remainder = Math.floor(seconds % 60);

        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(remainder).padStart(2, "0")
        );
    }

    players.forEach(player => {

        const audio =
            player.querySelector("audio");

        const playButton =
            player.querySelector(".play-button");

        const playIcon =
            player.querySelector(".play-icon");

        const progress =
            player.querySelector(".progress");

        const currentTime =
            player.querySelector(".current-time");

        const duration =
            player.querySelector(".duration");

        const volume =
            player.querySelector(".volume");

        const muteButton =
            player.querySelector(".mute-button");

        const status =
            player.querySelector(".audio-status");

        if (
            !audio ||
            !playButton ||
            !playIcon ||
            !progress ||
            !currentTime ||
            !duration ||
            !volume ||
            !muteButton ||
            !status
        ) {
            return;
        }

        // PLAY / PAUSA

        function updatePlayButton() {

            const playing = !audio.paused;

            playIcon.innerHTML =
                playing ? pauseSVG : playSVG;

            playButton.setAttribute(
                "aria-label",
                playing ? "Pausar" : "Reproducir"
            );
        }

        function pauseOtherPlayers() {

            players.forEach(otherPlayer => {

                const otherAudio =
                    otherPlayer.querySelector("audio");

                if (otherAudio && otherAudio !== audio) {
                    otherAudio.pause();
                }

            });
        }

        playButton.addEventListener("click", async () => {

            if (audio.paused) {

                pauseOtherPlayers();

                try {

                    await audio.play();

                    status.textContent = "";

                } catch (error) {

                    status.textContent =
                        "NO SE PUDO REPRODUCIR EL AUDIO";

                    console.error(error);

                }

            } else {

                audio.pause();

            }

        });

        audio.addEventListener("play", () => {

            pauseOtherPlayers();
            updatePlayButton();

        });

        audio.addEventListener(
            "pause",
            updatePlayButton
        );

        // DURACIÓN

        function updateDuration() {

            duration.textContent =
                formatTime(audio.duration);

        }

        audio.addEventListener(
            "loadedmetadata",
            updateDuration
        );

        audio.addEventListener(
            "durationchange",
            updateDuration
        );

        // PROGRESO

        audio.addEventListener("timeupdate", () => {

            currentTime.textContent =
                formatTime(audio.currentTime);

            if (
                Number.isFinite(audio.duration) &&
                audio.duration > 0
            ) {

                progress.value = Math.round(
                    (audio.currentTime / audio.duration) * 1000
                );

            }

        });

        progress.addEventListener("input", () => {

            if (
                Number.isFinite(audio.duration) &&
                audio.duration > 0
            ) {

                audio.currentTime =
                    (Number(progress.value) / 1000) *
                    audio.duration;

            }

        });

        // VOLUMEN

        audio.volume = Number(volume.value);

        function updateMuteButton() {

            const muted =
                audio.muted || audio.volume === 0;

            muteButton.setAttribute(
                "aria-label",
                muted
                    ? "Activar sonido"
                    : "Silenciar"
            );

            muteButton.style.opacity =
                muted ? "0.4" : "1";

        }

        volume.addEventListener("input", () => {

            audio.volume = Number(volume.value);

            if (audio.muted && audio.volume > 0) {
                audio.muted = false;
            }

            updateMuteButton();

        });

        muteButton.addEventListener("click", () => {

            audio.muted = !audio.muted;

            updateMuteButton();

        });

        // FINALIZACIÓN

        audio.addEventListener("ended", () => {

            audio.currentTime = 0;

            progress.value = 0;

            currentTime.textContent = "00:00";

            updatePlayButton();

        });

        // ERRORES

        audio.addEventListener("error", () => {

            status.textContent =
                "NO SE PUDO CARGAR EL ARCHIVO DE AUDIO";

        });

        updateDuration();
        updatePlayButton();
        updateMuteButton();

    });

}


/* =========================================
   02 — DISCOGRAFÍA
   ========================================= */

function iniciarDiscografia() {

    const gallery =
        document.getElementById("discography-gallery");

    const status =
        document.getElementById("discography-status");

    if (!gallery) {

        if (status) {
            status.textContent =
                "NO SE ENCONTRÓ EL CONTENEDOR DE DISCOGRAFÍA";
        }

        return;

    }

    // VERIFICACIÓN DEL CATÁLOGO

    if (!Array.isArray(window.discografia)) {

        if (status) {

            status.textContent =
                "NO SE PUDO CARGAR EL ARCHIVO discografia.js";

        }

        return;

    }

    if (window.discografia.length === 0) {

        if (status) {
            status.textContent =
                "EL CATÁLOGO NO CONTIENE PUBLICACIONES";
        }

        return;

    }

    // ORDEN CRONOLÓGICO

    const publicaciones =
        [...window.discografia].sort(
            (a, b) => b.anio - a.anio
        );

    gallery.replaceChildren();

    // GENERACIÓN DE FICHAS

    publicaciones.forEach(disco => {

        const plataforma =
            disco.enlace.includes("spotify.com")
                ? "SPOTIFY"
                : "YOUTUBE";

        // ENLACE

        const card = document.createElement("a");

        card.className = "discography-card";

        card.href = disco.enlace;
        card.target = "_blank";
        card.rel = "noopener noreferrer";

        card.setAttribute(
            "aria-label",
            `Escuchar ${disco.titulo} de ${disco.artista} en ${plataforma}`
        );

        // PORTADA

        const cover = document.createElement("div");

        cover.className = "discography-cover";

        const image = document.createElement("img");

        image.src = "./" + disco.portada
            .split("/")
            .map(encodeURIComponent)
            .join("/");

        image.alt =
            `${disco.artista} — ${disco.titulo}`;

        image.loading = "lazy";

        cover.appendChild(image);

        // INFORMACIÓN

        const info = document.createElement("div");

        info.className = "discography-info";

        // ARTISTA

        const artist = document.createElement("span");

        artist.className = "discography-artist";
        artist.textContent = disco.artista;

        // TÍTULO

        const title = document.createElement("h3");

        title.className = "discography-title";
        title.textContent = disco.titulo;

        // METADATOS

        const meta = document.createElement("div");

        meta.className = "discography-meta";

        const year = document.createElement("span");

        year.textContent = disco.anio;

        const platform = document.createElement("span");

        platform.className = "discography-platform";

        platform.textContent = plataforma + " ↗";

        meta.appendChild(year);
        meta.appendChild(platform);

        // ENSAMBLAJE

        info.appendChild(artist);
        info.appendChild(title);
        info.appendChild(meta);

        card.appendChild(cover);
        card.appendChild(info);

        gallery.appendChild(card);

    });

    // OCULTAR MENSAJE DE CARGA

    if (status) {

        status.textContent = "";
        status.hidden = true;

    }

}


/* =========================================
   03 — DJ SETS
   ========================================= */

function iniciarDJSets() {

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

    const gallery =
        document.getElementById("music-gallery");

    if (!gallery) {
        return;
    }

    gallery.replaceChildren();

    videos.forEach((video, index) => {

        const card = document.createElement("a");

        card.className = "video-card";

        card.href =
            "https://www.youtube.com/watch?v=" +
            encodeURIComponent(video.id);

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
            `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;

        thumbnail.alt = video.titulo;
        thumbnail.loading = "lazy";

        const play = document.createElement("span");

        play.className = "video-play";
        play.setAttribute("aria-hidden", "true");

        image.appendChild(thumbnail);
        image.appendChild(play);

        // INFORMACIÓN

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

        card.appendChild(image);
        card.appendChild(info);

        gallery.appendChild(card);

    });

}


/* =========================================
   INICIALIZACIÓN GENERAL
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    // REPRODUCTORES

    try {

        iniciarReproductores();

    } catch (error) {

        console.error(
            "Error en reproductores:",
            error
        );

    }

    // DISCOGRAFÍA

    try {

        iniciarDiscografia();

    } catch (error) {

        const status =
            document.getElementById("discography-status");

        if (status) {

            status.hidden = false;

            status.textContent =
                "ERROR AL GENERAR LA DISCOGRAFÍA: " +
                error.message;

        }

        console.error(
            "Error en discografía:",
            error
        );

    }

    // DJ SETS

    try {

        iniciarDJSets();

    } catch (error) {

        console.error(
            "Error en DJ sets:",
            error
        );

    }

});
