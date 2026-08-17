const projectGrid = document.querySelector("#projectGrid");
const form = document.querySelector("#contactForm");
const statusEl = document.querySelector("#formStatus");
const menuButton = document.querySelector("#menuButton");
const navLinks = document.querySelector("#navLinks");

document.querySelector("#year").textContent = new Date().getFullYear();
menuButton.addEventListener("click", () => { const open = navLinks.classList.toggle("open"); menuButton.setAttribute("aria-expanded", String(open)); });
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

async function loadProjects() {
  try {
    const response = await fetch("/api/projects");
    if (!response.ok) throw new Error("Request failed");
    const projects = await response.json();
    projectGrid.innerHTML = projects.map(project => `
      <article class="project-card"><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description)}</p>
      <div class="tags">${(project.tech || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div></article>`).join("");
  } catch { projectGrid.innerHTML = "<p>Projects could not be loaded right now.</p>"; }
}

form.addEventListener("submit", async event => {
  event.preventDefault(); statusEl.textContent = "Sending…";
  const payload = Object.fromEntries(new FormData(form));
  try {
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Something went wrong.");
    statusEl.textContent = data.message; form.reset();
  } catch (error) { statusEl.textContent = error.message; }
});

function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char])); }
loadProjects();
