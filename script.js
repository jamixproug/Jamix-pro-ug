const nav = document.getElementById("mainNav");
const menuToggle = document.getElementById("menuToggle");

const audio = document.getElementById("audio");
const player = document.getElementById("player");
const playerBtn = document.getElementById("playerBtn");
const progress = document.getElementById("progress");
const songTitle = document.getElementById("songTitle");
const featuredPlay = document.getElementById("featuredPlay");
const featuredTitle = document.getElementById("featuredTitle");
const playlist = document.getElementById("playlist");
const trackCount = document.getElementById("trackCount");
const musicStatus = document.getElementById("musicStatus");

let tracks = [];
let currentTrack = 0;

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[char]));
}

function prettyName(filename) {
  return filename
    .replace(/\.mp3$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function renderTracks(items) {
  tracks = [];
  playlist.innerHTML = "";

  items.forEach((item, index) => {
    const article = document.createElement("article");
    article.className = `track${index === 0 ? " active" : ""}`;
    article.dataset.src = item.url;
    article.dataset.title = item.title;
    article.dataset.artist = item.artist;
    article.innerHTML = `
      <span class="track-no">${String(index + 1).padStart(2, "0")}</span>
      <div class="track-art">🎵</div>
      <div class="track-info">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.artist)}</p>
      </div>
      <button class="track-play" aria-label="Play ${escapeHtml(item.title)}">▶</button>
      <a class="track-download" href="${encodeURI(item.url)}" download aria-label="Download track">↓</a>
    `;
    playlist.appendChild(article);
    tracks.push(article);
  });

  trackCount.textContent = `${items.length} TRACK${items.length === 1 ? "" : "S"} • AUTO-DETECTED • STREAMING • MUSIC`;

  if (!items.length) {
    musicStatus.className = "music-loading";
    musicStatus.textContent = "No MP3 files found in the music folder.";
    trackCount.textContent = "0 TRACKS • ADD MP3s TO /music";
    return;
  }

  tracks.forEach((track, index) => {
    track.querySelector(".track-play").addEventListener("click", () => {
      if (currentTrack === index && !audio.paused) {
        audio.pause();
      } else {
        setTrack(index, true);
      }
    });
  });

  musicStatus.remove();

  // If nothing is playing yet, show the first detected track.
  if (!audio.src) {
    const first = tracks[0];
    featuredTitle.textContent = first.dataset.title;
    featuredArtist.textContent = first.dataset.artist + " • JAMIX PRO UG";
  }
}

async function loadMusic() {
  try {
    const response = await fetch("/api/music", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const items = await response.json();
    renderTracks(items);
  } catch (error) {
    console.error("Music scan failed:", error);
    trackCount.textContent = "MUSIC SCAN ERROR";
    musicStatus.textContent = "Could not scan the music folder. Make sure you started the site with server.py.";
  }
}

function setTrack(index, autoplay = true) {
  currentTrack = index;
  const track = tracks[index];
  if (!track) return;

  const src = track.dataset.src;
  const title = track.dataset.title;
  const artist = track.dataset.artist;

  audio.src = src;
  songTitle.textContent = title;
  featuredTitle.textContent = title;
  featuredArtist.textContent = artist + " • JAMIX PRO UG";
  player.style.display = "flex";

  tracks.forEach(t => t.classList.remove("active"));
  track.classList.add("active");

  if (autoplay) {
    audio.play().then(() => {
      playerBtn.textContent = "❚❚";
      featuredPlay.textContent = "❚❚";
    }).catch(() => {
      playerBtn.textContent = "▶";
      featuredPlay.textContent = "▶";
    });
  }
}

featuredPlay.addEventListener("click", () => {
  if (!audio.src && tracks.length) setTrack(0, true);
  else if (audio.paused) audio.play();
  else audio.pause();
});

playerBtn.addEventListener("click", () => {
  if (!audio.src && tracks.length) setTrack(0, true);
  else if (audio.paused) audio.play();
  else audio.pause();
});

audio.addEventListener("play", () => {
  playerBtn.textContent = "❚❚";
  featuredPlay.textContent = "❚❚";
});
audio.addEventListener("pause", () => {
  playerBtn.textContent = "▶";
  featuredPlay.textContent = "▶";
});
audio.addEventListener("timeupdate", () => {
  if (audio.duration) progress.value = (audio.currentTime / audio.duration) * 100;
});
progress.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (progress.value / 100) * audio.duration;
});
audio.addEventListener("ended", () => {
  if (!tracks.length) return;
  const next = (currentTrack + 1) % tracks.length;
  setTrack(next, true);
});

loadMusic();
