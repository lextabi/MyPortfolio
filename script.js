const GITHUB_USER = "lextabi";
// Repos already shown as hand-written featured cards in index.html.
const FEATURED_REPOS = ["Runners_Diary", "PayEngine", "prj_powshl", "prj_python"];
const CACHE_KEY = "gh-cache-v1";
const CACHE_TTL_MS = 30 * 60 * 1000;

const LANGUAGE_COLORS = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  PowerShell: "#012456",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "C#": "#178600",
  "C++": "#f34b7d",
  Dart: "#00b4ab",
  Shell: "#89e051",
};

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const year = document.querySelector("[data-year]");
const repoCount = document.querySelector("[data-github-repos]");
const languageCount = document.querySelector("[data-github-languages]");
const liveCount = document.querySelector("[data-github-live]");
const repoList = document.querySelector("[data-github-repo-list]");

if (year) {
  year.textContent = new Date().getFullYear();
}

const syncHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

if (nav && navToggle) {
  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  };

  navToggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

// Fade sections in as they scroll into view.
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealItems.forEach((item) => revealObserver.observe(item));

  // Highlight the nav link for the section currently on screen.
  const navLinks = nav ? [...nav.querySelectorAll('a[href^="#"]')] : [];
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean)
    .forEach((section) => sectionObserver.observe(section));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

// Only allow http(s) links from the API into href attributes.
const safeUrl = (value) => (/^https?:\/\//i.test(value || "") ? escapeHtml(value) : "");

const readCache = () => {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached.repos;
  } catch {
    // Storage unavailable or corrupted; fall through to a fresh fetch.
  }
  return null;
};

const writeCache = (repos) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repos }));
  } catch {
    // Ignore quota or privacy-mode errors.
  }
};

// Unauthenticated GitHub API calls are limited to 60/hour, so cache them per session.
const fetchRepos = async () => {
  const cached = readCache();
  if (cached) return cached;

  const repos = [];
  const perPage = 100;
  let page = 1;

  while (true) {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=${perPage}&page=${page}`
    );
    if (!response.ok) throw new Error("GitHub repositories unavailable");

    const pageRepos = await response.json();
    repos.push(
      ...pageRepos.map((repo) => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        homepage: repo.homepage,
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count,
        updated_at: repo.updated_at,
        fork: repo.fork,
      }))
    );
    if (pageRepos.length < perPage) break;
    page += 1;
  }

  writeCache(repos);
  return repos;
};

const renderRepoCard = (repo) => {
  const updated = new Date(repo.updated_at).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
  const language = repo.language || "Code";
  const color = LANGUAGE_COLORS[language] || "#88a4bd";
  const homepage = safeUrl(repo.homepage);
  const stars = repo.stargazers_count ? `<span>★ ${repo.stargazers_count}</span>` : "";

  return `
    <article class="repo-card glass">
      <div class="repo-meta">
        <span class="lang"><i style="--dot: ${color}"></i>${escapeHtml(language)}</span>
        ${homepage ? '<span class="live-badge">Live</span>' : ""}
      </div>
      <h4>${escapeHtml(repo.name.replaceAll("_", " "))}</h4>
      <p>${escapeHtml(repo.description || "Public repository on GitHub.")}</p>
      <div class="repo-meta">
        <span>Updated ${updated}</span>
        ${stars}
      </div>
      <div class="card-links">
        ${homepage ? `<a href="${homepage}" target="_blank" rel="noreferrer">Live demo ↗</a>` : ""}
        <a href="${safeUrl(repo.html_url)}" target="_blank" rel="noreferrer">Source ↗</a>
      </div>
    </article>
  `;
};

const loadGithub = async () => {
  if (!repoList) return;

  try {
    const repos = (await fetchRepos()).filter((repo) => !repo.fork);
    const languages = new Set(repos.map((repo) => repo.language).filter(Boolean));
    const liveDemos = repos.filter((repo) => safeUrl(repo.homepage));

    if (repoCount) repoCount.textContent = repos.length;
    if (languageCount) languageCount.textContent = languages.size;
    if (liveCount) liveCount.textContent = liveDemos.length;

    const others = repos.filter((repo) => !FEATURED_REPOS.includes(repo.name));
    repoList.innerHTML = others.length
      ? others.map(renderRepoCard).join("")
      : `<article class="repo-card glass"><h4>That's everything for now</h4><p>All public repositories are featured above.</p></article>`;
  } catch {
    repoList.innerHTML = `
      <article class="repo-card glass">
        <h4>GitHub repositories</h4>
        <p>Couldn't load live data right now. Visit the GitHub profile to browse every public repository.</p>
        <div class="card-links">
          <a href="https://github.com/${GITHUB_USER}?tab=repositories" target="_blank" rel="noreferrer">Open GitHub ↗</a>
        </div>
      </article>
    `;
  }
};

loadGithub();
