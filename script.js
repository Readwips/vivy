const navLinks = document.querySelectorAll(".top-menu a");
const sections = document.querySelectorAll("#home, #vivy-ost, #story");
const navbar = document.querySelector(".top-navbar");
const videoModal = document.getElementById("videoModal");
const openVideoBtn = document.getElementById("openVideoBtn");
const closeVideoBtn = document.getElementById("closeVideoBtn");
const closeVideoBackdrop = document.getElementById("closeVideoBackdrop");
const youtubeFrame = document.getElementById("youtubeFrame");
const youtubeLink = document.getElementById("youtubeLink");
const pvThumbs = document.querySelectorAll(".pv-thumb");
const sectionList = Array.from(sections);

const defaultYoutubeEmbedUrl = "https://www.youtube.com/embed/2p8ig-TrYPY?autoplay=1&rel=0";
const scrollLockDuration = 850;
const wheelThreshold = 10;
const touchThreshold = 42;
let selectedVideoUrl = defaultYoutubeEmbedUrl;
let currentSectionIndex = 0;
let isSectionScrolling = false;
let touchStartY = 0;

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
    const closestDistance = Math.abs(sectionList[closestIndex].offsetTop - viewportTop);
    return currentDistance < closestDistance ? index : closestIndex;
  }, 0);
}

function moveSection(direction) {
  if (videoModal.classList.contains("show") || isSectionScrolling) return;

  const activeIndex = getClosestSectionIndex();
  const nextIndex = Math.min(
    Math.max(activeIndex + direction, 0),
    sectionList.length - 1
  );

  if (nextIndex === activeIndex) return;

  scrollToSection(sectionList[nextIndex], nextIndex);
}

function youtubeEmbedToWatchUrl(embedUrl) {
  const videoId = embedUrl.match(/embed\/([^?]+)/)?.[1];
  return videoId ? `https://youtu.be/${videoId}` : "https://www.youtube.com";
}

function openVideo(videoUrl = selectedVideoUrl) {
  selectedVideoUrl = videoUrl;
  videoModal.classList.add("show");
  videoModal.setAttribute("aria-hidden", "false");
  youtubeFrame.src = videoUrl;
  youtubeLink.href = youtubeEmbedToWatchUrl(videoUrl);
  document.body.style.overflow = "hidden";
}

function closeVideo() {
  videoModal.classList.remove("show");
  videoModal.setAttribute("aria-hidden", "true");
  youtubeFrame.src = "";
  document.body.style.overflow = "";
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
  { passive: false }
);

window.addEventListener(
  "touchstart",
  (event) => {
    touchStartY = event.touches[0]?.clientY || 0;
  },
  { passive: true }
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
  { passive: false }
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
  { threshold: 0.2 }
);

animatedSections.forEach((section) => observer.observe(section));

openVideoBtn?.addEventListener("click", () => openVideo(selectedVideoUrl));
closeVideoBtn?.addEventListener("click", closeVideo);
closeVideoBackdrop?.addEventListener("click", closeVideo);

pvThumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    selectedVideoUrl = thumb.dataset.video || defaultYoutubeEmbedUrl;

    pvThumbs.forEach((item) => item.classList.remove("active"));
    thumb.classList.add("active");
    openVideo(selectedVideoUrl);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && videoModal.classList.contains("show")) {
    closeVideo();
  }
});

window.addEventListener("scroll", updateActiveMenuOnScroll, { passive: true });
window.addEventListener("load", updateActiveMenuOnScroll);
