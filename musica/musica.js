
/* =========================================
   CERZ — MÚSICA
   Reproductores múltiples + DJ sets
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const players = document.querySelectorAll(".audio-player");

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

    // CONFIGURAR CADA REPRODUCTOR

    players.forEach(player => {

        const audio = player.querySelector("audio");

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

        function updatePlayButton() {

            const playing = !audio.paused;

            playIcon.innerHTML = playing
                ? pauseSVG
                : playSVG;

            playButton.setAttribute(
                "aria-label",
                playing ? "Pausar" : "Reproducir"
            );
        }

        playButton.addEventListener("click", async () => {

            if (audio.paused) {

                // PAUSAR CUALQUIER OTRA CANCIÓN

                players.forEach(otherPlayer => {

                    const otherAudio =
                        otherPlayer.querySelector("audio");

                    if (otherAudio !== audio) {
                        otherAudio.pause();
                    }

                });

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

            players.forEach(otherPlayer => {

                const otherAudio =
                    otherPlayer.querySelector("audio");

                if (otherAudio !== audio) {
                    otherAudio.pause();
                }

            });

            updatePlayButton();
        });

        audio.addEventListener("pause", updatePlayButton);

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

        volume.addEventListener("input", () => {

            audio.volume = Number(volume.value);

            if (audio.muted && audio.volume > 0) {
                audio.muted = false;
            }

            updateMuteButton();
        });

        function updateMuteButton() {

            const muted =
                audio.muted || audio.volume === 0;

            muteButton.setAttribute(
                "aria-label",
                muted ? "Activar sonido" : "Silenciar"
            );

            muteButton.style.opacity =
                muted ? "0.4" : "1";
        }

        muteButton.addEventListener("click", () => {

            audio.muted = !audio.muted;

            updateMuteButton();
        });

        // FINALIZACIÓN

        audio.addEventListener("ended", () => {

            updatePlayButton();

            progress.value = 0;
        });

        // ERRORES

        audio.addEventListener("error", () => {

            status.textContent =
                "NO SE PUDO CARGAR EL ARCHIVO DE AUDIO";
        });

        updatePlayButton();
        updateMuteButton();

    });

    // =====================================
    // DJ SETS — SIN MODIFICACIONES
    // =====================================

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

});
