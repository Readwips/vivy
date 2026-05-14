const navLinks = document.querySelectorAll(".top-menu a");
const sections = document.querySelectorAll("#home, #vivy-ost, #story");

function setActiveLink(id) {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
}

function updateActiveMenuOnScroll() {
  const scrollPosition = window.scrollY + 120;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      setActiveLink(sectionId);
    }
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const navbarHeight = document.querySelector(".top-navbar").offsetHeight;
    const targetPosition = target.offsetTop - navbarHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });

    setActiveLink(href.replace("#", ""));

    if (window.innerWidth <= 768) {
      topMenu.classList.remove("show");
    }
  });
});

window.addEventListener("scroll", updateActiveMenuOnScroll);
window.addEventListener("load", updateActiveMenuOnScroll);

/* animasi section */
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

/* video popup */
const openVideoBtn = document.getElementById("openVideoBtn");
const videoModal = document.getElementById("videoModal");
const closeVideoBtn = document.getElementById("closeVideoBtn");
const closeVideoBackdrop = document.getElementById("closeVideoBackdrop");
const youtubeFrame = document.getElementById("youtubeFrame");
const pvThumbs = document.querySelectorAll(".pv-thumb");

const defaultYoutubeEmbedUrl =
  "https://www.youtube.com/embed/2p8ig-TrYPY?autoplay=1&rel=0";

function openVideo(videoUrl = defaultYoutubeEmbedUrl) {
  videoModal.classList.add("show");
  youtubeFrame.src = videoUrl;
  document.body.style.overflow = "hidden";
}

function closeVideo() {
  videoModal.classList.remove("show");
  youtubeFrame.src = "";
  document.body.style.overflow = "";
}

if (openVideoBtn) {
  openVideoBtn.addEventListener("click", () => {
    openVideo(defaultYoutubeEmbedUrl);
  });
}

pvThumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const videoUrl = thumb.getAttribute("data-video") || defaultYoutubeEmbedUrl;

    pvThumbs.forEach((item) => item.classList.remove("active"));
    thumb.classList.add("active");
    openVideo(videoUrl);
  });
});

if (closeVideoBtn) {
  closeVideoBtn.addEventListener("click", closeVideo);
}

if (closeVideoBackdrop) {
  closeVideoBackdrop.addEventListener("click", closeVideo);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeVideo();
  }
});