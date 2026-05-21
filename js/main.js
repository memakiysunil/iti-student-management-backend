// ============================================================
// Mahila ITI Surendranagar - Main JS
// ============================================================


// ============================================================
// NAVBAR TOGGLE
// ============================================================

function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("open");
}


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  // Close mobile menu when link clicked
  document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {
      document.getElementById("navLinks")?.classList.remove("open");
    });

  });


  // Highlight active page link
  const page =
    window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links a").forEach(link => {

    if (link.getAttribute("href") === page) {
      link.classList.add("active");
    }

  });


  // ============================================================
  // USER LOGIN CHECK
  // ============================================================

  const user = JSON.parse(localStorage.getItem("iti_user"));
  const authBtn = document.getElementById("navAuthBtn");

  if (authBtn && user) {
    authBtn.textContent = "My Dashboard";
    authBtn.href = "dashboard.html";
  }


  // ============================================================
  // ADMIN PANEL
  // ============================================================

  if(user && user.role === "admin"){

    const adminMenu =
      document.getElementById("adminMenu");

    if(adminMenu){
      adminMenu.style.display = "block";
    }

    // Load admin users table
    if(typeof loadAdminUsers === "function"){
      loadAdminUsers();
    }

    // Hide trade & enrollment in profile
    const tradeBox   = document.getElementById("tradeBox");
    const enrollBox  = document.getElementById("enrollBox");
    const tradeBox2  = document.getElementById("tradeBox2");
    const enrollBox2 = document.getElementById("enrollBox2");

    if(tradeBox) tradeBox.style.display = "none";
    if(enrollBox) enrollBox.style.display = "none";
    if(tradeBox2) tradeBox2.style.display = "none";
    if(enrollBox2) enrollBox2.style.display = "none";
  }


  // Start scroll animation
  initScrollAnim();

});


// ============================================================
// LIGHTBOX
// ============================================================

function openLightbox(src, caption) {

  const lb  = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  const cap = document.getElementById("lightboxCaption");

  if (!lb) return;

  if (img) img.src = src;

  if (cap) {
    cap.textContent = caption || "";
  }

  lb.classList.add("open");

  document.body.style.overflow = "hidden";
}


// Close lightbox
function closeLightbox(event) {

  const lb = document.getElementById("lightbox");

  if (!lb) return;

  if (
    event &&
    event.target !== lb &&
    !event.target.classList.contains("lightbox-close")
  ) {
    return;
  }

  lb.classList.remove("open");

  document.body.style.overflow = "";
}


// ESC key close
document.addEventListener("keydown", e => {

  if (e.key === "Escape") {

    const lb = document.getElementById("lightbox");

    if (lb) {
      lb.classList.remove("open");
      document.body.style.overflow = "";
    }

  }

});


// ============================================================
// CONTACT FORM
// ============================================================

function sendMessage() {

  const name =
    document.getElementById("cName")?.value.trim();

  const email =
    document.getElementById("cEmail")?.value.trim();

  const message =
    document.getElementById("cMessage")?.value.trim();

  const errEl =
    document.getElementById("contactAlert");

  const sucEl =
    document.getElementById("contactSuccess");


  // Validation
  if (!name || !email || !message) {

    if (errEl) {

      errEl.textContent =
        "⚠️ Please fill Name, Email and Message.";

      errEl.className =
        "alert alert-error show";

      setTimeout(() => {
        errEl.classList.remove("show");
      }, 4000);

    }

    return;
  }


  // Success
  if (sucEl) {

    sucEl.textContent =
      `✅ Thank you, ${name}! Your message has been sent. We'll get back to you soon.`;

    sucEl.className =
      "alert alert-success show";

    setTimeout(() => {
      sucEl.classList.remove("show");
    }, 5000);

  }


  // Clear fields
  [
    "cName",
    "cEmail",
    "cPhone",
    "cSubject",
    "cMessage"
  ].forEach(id => {

    const el = document.getElementById(id);

    if (el) {
      el.value = "";
    }

  });

}


// ============================================================
// LOGOUT
// ============================================================

function logoutUser() {

  if (
    window.confirm(
      "Are you sure you want to logout?"
    )
  ) {

    localStorage.removeItem("iti_token");
    localStorage.removeItem("iti_user");

    window.location.href = "login.html";

  }

}


// ============================================================
// SCROLL ANIMATION
// ============================================================

function initScrollAnim() {

  const obs = new IntersectionObserver(entries => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        entry.target.style.opacity = "1";

        entry.target.style.transform =
          "translateY(0)";

        obs.unobserve(entry.target);

      }

    });

  }, {
    threshold: 0.1
  });


  document.querySelectorAll(
    ".trade-card, .stat-card, .feature-item, .gallery-item, .notice-item, .co-item"
  ).forEach(el => {

    el.style.opacity = "0";

    el.style.transform =
      "translateY(20px)";

    el.style.transition =
      "opacity 0.5s ease, transform 0.5s ease";

    obs.observe(el);

  });

}


// ============================================================
// GALLERY FILTER
// ============================================================

function filterGallery(cat, btn) {

  // Remove active class
  document.querySelectorAll(".gallery-tab")
    .forEach(tab => {
      tab.classList.remove("active");
    });


  // Add active class
  if (btn) {
    btn.classList.add("active");
  }


  // Show / Hide items
  document.querySelectorAll(".gallery-item")
    .forEach(item => {

      if (
        cat === "all" ||
        item.dataset.cat === cat
      ) {

        item.classList.remove("hidden");

      } else {

        item.classList.add("hidden");

      }

    });

}