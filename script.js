const navLinks = document.querySelectorAll(".top-menu a");
const sections = document.querySelectorAll("#home, #vivy-ost, #story");
const navbar = document.querySelector(".top-navbar");
const videoModal = document.getElementById("videoModal");
const closeVideoBtn = document.getElementById("closeVideoBtn");
const closeVideoBackdrop = document.getElementById("closeVideoBackdrop");
const prevVideoBtn = document.getElementById("prevVideoBtn");
const nextVideoBtn = document.getElementById("nextVideoBtn");
const youtubeFrame = document.getElementById("youtubeFrame");
const youtubeLink = document.getElementById("youtubeLink");
const videoLabel = document.getElementById("videoLabel");
const videoTitle = document.getElementById("videoTitle");
const musicToggle = document.getElementById("musicToggle");
const backgroundMusic = document.getElementById("bgMusic");
const ostCarousel = document.getElementById("ostCarousel");
const prevOstBtn = document.getElementById("prevOstBtn");
const nextOstBtn = document.getElementById("nextOstBtn");
const pvThumbs = document.querySelectorAll(".pv-thumb");
const videoCards = Array.from(pvThumbs);
const sectionList = Array.from(sections);
const storyCharacter = document.querySelector(".story-character");
const storyFrame = document.querySelector(".story-frame");
const storyImage = document.querySelector(".story-frame img");
const storyNameBg = document.querySelector(".story-name-bg");
const storyProfileName = document.getElementById("storyCharacterName");
const storyProfileDesc = document.getElementById("storyCharacterDesc");
const storyButtons = Array.from(
  document.querySelectorAll(".story-slider-ui button"),
);

const defaultYoutubeEmbedUrl =
  "https://www.youtube.com/embed/2p8ig-TrYPY?autoplay=1&rel=0";
const backgroundMusicVolume = 0.07;
const scrollLockDuration = 850;
const wheelThreshold = 10;
const touchThreshold = 42;
const sectionScrollBreakpoint = 768;
let selectedVideoUrl = defaultYoutubeEmbedUrl;
let selectedVideoIndex = 0;
let selectedStoryIndex = 0;
let currentSectionIndex = 0;
let isSectionScrolling = false;
let ostScrollAnimation = 0;
let storyLeaveTimer = 0;
let storyEnterTimer = 0;
let isBackgroundMusicEnabled =
  localStorage.getItem("vivyBackgroundMusic") !== "off";
let wasBackgroundMusicPausedForVideo = false;
let backgroundMusicAutoplayTimer = 0;
let touchStartY = 0;

const backgroundMusicUnlockEvents = [
  "pointerdown",
  "touchstart",
  "keydown",
  "wheel",
];

const storyCharacters = [
  {
    name: "Vivy / Diva",
    shortName: "VIVY",
    image: "gambar/vivy-character.jpg",
    desc: "AI singer with one mission: make people happy through song.",
  },
  {
    name: "Grace",
    shortName: "GRACE",
    image: "gambar/grace-character.jpg",
    desc: "A caretaker AI whose gentle song carries warmth and sacrifice.",
  },
  {
    name: "Estella",
    shortName: "ESTELLA",
    image: "gambar/estella-character.jpg",
    desc: "A hotel AI with a calm smile and a tragic place in the Singularity Project.",
  },
  {
    name: "Ophelia",
    shortName: "OPHELIA",
    image: "gambar/ophelia-character.jpg",
    desc: "A songstress AI whose stage hides one of Vivy's most painful echoes.",
  },
  {
    name: "Elizabeth",
    shortName: "ELIZABETH",
    image: "gambar/elizabeth-character.jpg",
    desc: "A combat-model AI with a sharp presence inside the future's conflict.",
    layout: "wide",
  },
];

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

if (!window.location.hash) {
  window.scrollTo(0, 0);
}

function updateMusicToggle() {
  if (!musicToggle) return;

  musicToggle.classList.toggle("is-muted", !isBackgroundMusicEnabled);
  musicToggle.classList.toggle(
    "is-playing",
    Boolean(
      isBackgroundMusicEnabled && backgroundMusic && !backgroundMusic.paused,
    ),
  );
  musicToggle.setAttribute("aria-pressed", String(isBackgroundMusicEnabled));
  musicToggle.setAttribute(
    "aria-label",
    isBackgroundMusicEnabled ? "Matikan musik" : "Nyalakan musik",
  );
}

function playBackgroundMusic() {
  if (!backgroundMusic || !isBackgroundMusicEnabled) return;

  backgroundMusic.volume = backgroundMusicVolume;
  backgroundMusic.muted = false;

  const playRequest = backgroundMusic.play();

  if (playRequest?.catch) {
    playRequest.catch(() => {
      addBackgroundMusicUnlockHandlers();
      updateMusicToggle();
    });
  }
}

function pauseBackgroundMusic() {
  if (!backgroundMusic) return;

  backgroundMusic.pause();
}

function setBackgroundMusicEnabled(enabled) {
  isBackgroundMusicEnabled = enabled;
  localStorage.setItem("vivyBackgroundMusic", enabled ? "on" : "off");
  updateMusicToggle();

  if (enabled) {
    playBackgroundMusic();
    return;
  }

  pauseBackgroundMusic();
}

function setupBackgroundMusic() {
  updateMusicToggle();

  if (!backgroundMusic) return;

  backgroundMusic.autoplay = true;
  backgroundMusic.volume = backgroundMusicVolume;

  if (isBackgroundMusicEnabled) {
    playBackgroundMusic();
  }
}

function scheduleBackgroundMusicAutoplay() {
  if (!backgroundMusic || !isBackgroundMusicEnabled || !backgroundMusic.paused)
    return;

  window.clearTimeout(backgroundMusicAutoplayTimer);
  backgroundMusicAutoplayTimer = window.setTimeout(() => {
    playBackgroundMusic();
  }, 180);
}

function unlockBackgroundMusicFromGesture(event) {
  if (event?.target?.closest?.("#musicToggle")) return;
  if (!isBackgroundMusicEnabled || !backgroundMusic?.paused) return;
  if (videoModal.classList.contains("show")) return;

  playBackgroundMusic();
}

function removeBackgroundMusicUnlockHandlers() {
  backgroundMusicUnlockEvents.forEach((eventName) => {
    document.removeEventListener(
      eventName,
      unlockBackgroundMusicFromGesture,
      true,
    );
  });
}

function addBackgroundMusicUnlockHandlers() {
  backgroundMusicUnlockEvents.forEach((eventName) => {
    document.addEventListener(eventName, unlockBackgroundMusicFromGesture, {
      capture: true,
      passive: true,
    });
  });
}

function getNavbarHeight() {
  return navbar ? navbar.offsetHeight : 0;
}

function setActiveLink(id) {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
}

function updateActiveMenuOnScroll() {
  const scrollPosition = window.scrollY + getNavbarHeight() + 24;

  sectionList.forEach((section, index) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      currentSectionIndex = index;
      setActiveLink(section.id);
    }
  });
}

function scrollToSection(target, index = sectionList.indexOf(target)) {
  if (!target) return;

  if (index >= 0) {
    currentSectionIndex = index;
  }

  const targetPosition = target.offsetTop - getNavbarHeight();

  isSectionScrolling = true;
  setActiveLink(target.id);

  window.scrollTo({
    top: targetPosition,
    behavior: "smooth",
  });

  window.setTimeout(() => {
    isSectionScrolling = false;
    updateActiveMenuOnScroll();
  }, scrollLockDuration);
}

function getClosestSectionIndex() {
  const viewportTop = window.scrollY + getNavbarHeight();

  return sectionList.reduce((closestIndex, section, index) => {
    const currentDistance = Math.abs(section.offsetTop - viewportTop);
    const closestDistance = Math.abs(
      sectionList[closestIndex].offsetTop - viewportTop,
    );
    return currentDistance < closestDistance ? index : closestIndex;
  }, 0);
}

function moveSection(direction) {
  if (videoModal.classList.contains("show") || isSectionScrolling) return;
  if (window.innerWidth <= sectionScrollBreakpoint) return;

  const activeIndex = getClosestSectionIndex();
  const nextIndex = Math.min(
    Math.max(activeIndex + direction, 0),
    sectionList.length - 1,
  );

  if (nextIndex === activeIndex) return;

  scrollToSection(sectionList[nextIndex], nextIndex);
}

function getOstCarouselStep() {
  const firstCard = videoCards[0];

  if (!ostCarousel || !firstCard) return 280;

  const styles = window.getComputedStyle(ostCarousel);
  const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
  return firstCard.getBoundingClientRect().width + gap;
}

function updateOstCarouselButtons() {
  if (!ostCarousel || !prevOstBtn || !nextOstBtn) return;

  const maxScroll = ostCarousel.scrollWidth - ostCarousel.clientWidth;
  const atStart = ostCarousel.scrollLeft <= 2;
  const atEnd = ostCarousel.scrollLeft >= maxScroll - 2;

  prevOstBtn.classList.toggle("is-disabled", atStart);
  nextOstBtn.classList.toggle("is-disabled", atEnd || maxScroll <= 0);
}

function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3);
}

function animateOstCarouselTo(targetLeft) {
  if (!ostCarousel) return;

  const maxScroll = ostCarousel.scrollWidth - ostCarousel.clientWidth;
  const startLeft = ostCarousel.scrollLeft;
  const destination = Math.min(Math.max(targetLeft, 0), maxScroll);
  const distance = destination - startLeft;
  const carouselShell = ostCarousel.closest(".pv-carousel");

  if (Math.abs(distance) < 2) {
    updateOstCarouselButtons();
    return;
  }

  if (ostScrollAnimation) {
    window.cancelAnimationFrame(ostScrollAnimation);
  }

  const duration = Math.min(760, Math.max(420, Math.abs(distance) * 1.6));
  const startTime = window.performance.now();

  carouselShell?.classList.add("is-gliding");

  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    ostCarousel.scrollLeft = startLeft + distance * easeOutCubic(progress);

    if (progress < 1) {
      ostScrollAnimation = window.requestAnimationFrame(step);
      return;
    }

    ostScrollAnimation = 0;
    carouselShell?.classList.remove("is-gliding");
    updateOstCarouselButtons();
  };

  ostScrollAnimation = window.requestAnimationFrame(step);
}

function scrollOstCarousel(direction) {
  if (!ostCarousel) return;

  animateOstCarouselTo(
    ostCarousel.scrollLeft + direction * getOstCarouselStep(),
  );
}

function ensureVideoCardVisible(index) {
  if (!ostCarousel) return;

  const card = videoCards[index];
  if (!card) return;

  const cardLeft = card.offsetLeft;
  const cardRight = cardLeft + card.offsetWidth;
  const visibleLeft = ostCarousel.scrollLeft;
  const visibleRight = visibleLeft + ostCarousel.clientWidth;

  if (cardLeft < visibleLeft) {
    animateOstCarouselTo(cardLeft - 4);
  }

  if (cardRight > visibleRight) {
    animateOstCarouselTo(cardRight - ostCarousel.clientWidth + 4);
  }
}

function applyStoryCharacter(index) {
  const character = storyCharacters[index] || storyCharacters[0];

  if (!character || !storyImage) return;

  storyImage.src = character.image;
  storyFrame?.classList.toggle("is-wide", character.layout === "wide");

  if (storyNameBg) storyNameBg.textContent = character.shortName;
  if (storyProfileName) storyProfileName.textContent = character.name;
  if (storyProfileDesc) storyProfileDesc.textContent = character.desc;

  storyButtons.forEach((button, buttonIndex) => {
    button.classList.toggle("active", buttonIndex === index);
  });
}

function clearStoryTransitionClasses() {
  storyCharacter?.classList.remove(
    "is-leaving",
    "is-entering",
    "story-forward",
    "story-backward",
  );
}

function selectStoryCharacter(index, animate = true) {
  const nextIndex = Math.min(Math.max(index, 0), storyCharacters.length - 1);
  const character = storyCharacters[nextIndex] || storyCharacters[0];

  if (!character || !storyImage) return;

  window.clearTimeout(storyLeaveTimer);
  window.clearTimeout(storyEnterTimer);

  const imageChanged = storyImage.getAttribute("src") !== character.image;
  const directionClass =
    nextIndex >= selectedStoryIndex ? "story-forward" : "story-backward";
  selectedStoryIndex = nextIndex;

  if (!animate || !imageChanged || !storyCharacter) {
    clearStoryTransitionClasses();
    applyStoryCharacter(nextIndex);
    return;
  }

  const preload = new Image();
  preload.src = character.image;

  storyButtons.forEach((button, buttonIndex) => {
    button.classList.toggle("active", buttonIndex === nextIndex);
  });

  clearStoryTransitionClasses();
  storyCharacter.classList.add(directionClass, "is-leaving");

  storyLeaveTimer = window.setTimeout(() => {
    applyStoryCharacter(nextIndex);
    storyCharacter.classList.remove("is-leaving");
    storyCharacter.classList.add("is-entering");

    storyEnterTimer = window.setTimeout(() => {
      clearStoryTransitionClasses();
    }, 680);
  }, 210);
}

function youtubeEmbedToWatchUrl(embedUrl) {
  const videoId = embedUrl.match(/embed\/([^?]+)/)?.[1];
  return videoId ? `https://youtu.be/${videoId}` : "https://www.youtube.com";
}

function getVideoData(index) {
  const thumb = videoCards[index] || videoCards[0];

  return {
    thumb,
    title:
      thumb?.dataset.title ||
      thumb?.querySelector(".pv-thumb-title")?.textContent?.trim() ||
      "Vivy OST",
    label: thumb?.dataset.label || `OST ${String(index + 1).padStart(2, "0")}`,
    videoUrl: thumb?.dataset.video || defaultYoutubeEmbedUrl,
  };
}

function updateVideoSheet(index = selectedVideoIndex) {
  const videoData = getVideoData(index);

  selectedVideoUrl = videoData.videoUrl;
  youtubeLink.href = youtubeEmbedToWatchUrl(selectedVideoUrl);

  if (videoLabel) {
    videoLabel.textContent = videoData.label;
  }

  if (videoTitle) {
    videoTitle.textContent = videoData.title;
  }
}

function selectVideo(index) {
  selectedVideoIndex = Math.min(Math.max(index, 0), videoCards.length - 1);
  const videoData = getVideoData(selectedVideoIndex);

  selectedVideoUrl = videoData.videoUrl;
  youtubeLink.href = youtubeEmbedToWatchUrl(selectedVideoUrl);

  videoCards.forEach((item) => item.classList.remove("active"));
  videoData.thumb?.classList.add("active");

  updateVideoSheet(selectedVideoIndex);
  ensureVideoCardVisible(selectedVideoIndex);
}

function openVideo(videoUrl = selectedVideoUrl) {
  updateVideoSheet(selectedVideoIndex);
  if (isBackgroundMusicEnabled) {
    wasBackgroundMusicPausedForVideo = true;
    pauseBackgroundMusic();
  }

  videoModal.classList.add("show");
  videoModal.setAttribute("aria-hidden", "false");
  youtubeFrame.src = selectedVideoUrl;
  youtubeLink.href = youtubeEmbedToWatchUrl(selectedVideoUrl);
  document.body.style.overflow = "hidden";
}

function closeVideo() {
  videoModal.classList.remove("show");
  videoModal.setAttribute("aria-hidden", "true");
  youtubeFrame.src = "";
  document.body.style.overflow = "";

  if (wasBackgroundMusicPausedForVideo && isBackgroundMusicEnabled) {
    playBackgroundMusic();
  }

  wasBackgroundMusicPausedForVideo = false;
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    const target = document.querySelector(href);

    if (!target) return;

    event.preventDefault();
    scrollToSection(target);
    setActiveLink(target.id);
  });
});

window.addEventListener(
  "wheel",
  (event) => {
    if (Math.abs(event.deltaY) < wheelThreshold) return;

    event.preventDefault();
    moveSection(event.deltaY > 0 ? 1 : -1);
  },
  { passive: false },
);

window.addEventListener(
  "touchstart",
  (event) => {
    touchStartY = event.touches[0]?.clientY || 0;
  },
  { passive: true },
);

window.addEventListener(
  "touchmove",
  (event) => {
    const touchCurrentY = event.touches[0]?.clientY || 0;
    const touchDelta = touchStartY - touchCurrentY;

    if (Math.abs(touchDelta) < touchThreshold) return;

    event.preventDefault();
    moveSection(touchDelta > 0 ? 1 : -1);
    touchStartY = touchCurrentY;
  },
  { passive: false },
);

document.addEventListener("keydown", (event) => {
  const nextKeys = ["ArrowDown", "PageDown", " "];
  const previousKeys = ["ArrowUp", "PageUp"];

  if (nextKeys.includes(event.key)) {
    event.preventDefault();
    moveSection(1);
  }

  if (previousKeys.includes(event.key)) {
    event.preventDefault();
    moveSection(-1);
  }
});

const animatedSections = document.querySelectorAll(".section-animate");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("show", entry.isIntersecting);
    });
  },
  { threshold: 0.2 },
);

animatedSections.forEach((section) => observer.observe(section));

closeVideoBtn?.addEventListener("click", closeVideo);
closeVideoBackdrop?.addEventListener("click", closeVideo);
musicToggle?.addEventListener("click", () => {
  if (isBackgroundMusicEnabled && backgroundMusic?.paused) {
    playBackgroundMusic();
    return;
  }

  setBackgroundMusicEnabled(!isBackgroundMusicEnabled);
});
prevOstBtn?.addEventListener("click", () => scrollOstCarousel(-1));
nextOstBtn?.addEventListener("click", () => scrollOstCarousel(1));
ostCarousel?.addEventListener("scroll", updateOstCarouselButtons, {
  passive: true,
});
prevVideoBtn?.addEventListener("click", () => {
  const previousIndex =
    (selectedVideoIndex - 1 + videoCards.length) % videoCards.length;
  selectVideo(previousIndex);

  if (videoModal.classList.contains("show")) {
    youtubeFrame.src = selectedVideoUrl;
  }
});
nextVideoBtn?.addEventListener("click", () => {
  const nextIndex = (selectedVideoIndex + 1) % videoCards.length;
  selectVideo(nextIndex);

  if (videoModal.classList.contains("show")) {
    youtubeFrame.src = selectedVideoUrl;
  }
});

videoCards.forEach((thumb, index) => {
  thumb.addEventListener("click", () => {
    selectVideo(index);
    openVideo();
  });
});

storyButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    selectStoryCharacter(index);
  });
});

selectVideo(0);
selectStoryCharacter(0, false);
updateOstCarouselButtons();
setupBackgroundMusic();
scheduleBackgroundMusicAutoplay();
addBackgroundMusicUnlockHandlers();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && videoModal.classList.contains("show")) {
    closeVideo();
  }
});

backgroundMusic?.addEventListener("play", () => {
  removeBackgroundMusicUnlockHandlers();
  updateMusicToggle();
});
backgroundMusic?.addEventListener("pause", () => {
  if (isBackgroundMusicEnabled && !videoModal.classList.contains("show")) {
    addBackgroundMusicUnlockHandlers();
  }

  updateMusicToggle();
});
backgroundMusic?.addEventListener("ended", updateMusicToggle);

document.addEventListener("DOMContentLoaded", scheduleBackgroundMusicAutoplay);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    scheduleBackgroundMusicAutoplay();
  }
});
window.addEventListener("scroll", updateActiveMenuOnScroll, { passive: true });
window.addEventListener("resize", updateOstCarouselButtons);
window.addEventListener("load", updateActiveMenuOnScroll);
window.addEventListener("load", updateOstCarouselButtons);
window.addEventListener("load", scheduleBackgroundMusicAutoplay);
