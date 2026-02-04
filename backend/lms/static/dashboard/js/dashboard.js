// Simple JS for premium dashboard UX

document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("ts-sidebar");
  const toggleBtn = document.getElementById("ts-sidebar-toggle");
  const darkToggle = document.getElementById("ts-dark-toggle");
  const body = document.body;

  // Sidebar toggle (mobile)
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", function () {
      sidebar.classList.toggle("open");
    });
  }

  // Dark mode persistence
  const stored = localStorage.getItem("ts-dashboard-dark");
  if (stored === "1") {
    body.classList.add("dashboard-dark");
    if (darkToggle) darkToggle.checked = true;
  }

  if (darkToggle) {
    darkToggle.addEventListener("change", function (e) {
      if (e.target.checked) {
        body.classList.add("dashboard-dark");
        localStorage.setItem("ts-dashboard-dark", "1");
      } else {
        body.classList.remove("dashboard-dark");
        localStorage.setItem("ts-dashboard-dark", "0");
      }
    });
  }
});







