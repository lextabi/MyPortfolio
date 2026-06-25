const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const year = document.querySelector("[data-year]");
const repoCount = document.querySelector("[data-github-repos]");
const followerCount = document.querySelector("[data-github-followers]");
const profileStatus = document.querySelector("[data-github-updated]");
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
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
    });
  });
}

const loadGithubStats = async () => {
  if (!repoCount || !followerCount || !profileStatus) return;

  try {
    const response = await fetch("https://api.github.com/users/lextabi");
    if (!response.ok) throw new Error("GitHub profile unavailable");
    const profile = await response.json();

    const repos = [];
    const perPage = 100;
    let page = 1;

    while (true) {
      const reposResponse = await fetch(
        `https://api.github.com/users/lextabi/repos?sort=updated&per_page=${perPage}&page=${page}`
      );
      if (!reposResponse.ok) throw new Error("GitHub repositories unavailable");

      const pageRepos = await reposResponse.json();
      repos.push(...pageRepos);
      if (pageRepos.length < perPage) break;
      page += 1;
    }

    repoCount.textContent = profile.public_repos ?? "--";
    followerCount.textContent = profile.followers ?? "--";
    profileStatus.textContent = "Live";

    if (repoList && repos.length) {
      repoList.innerHTML = repos
        .map((repo) => {
          const updated = new Date(repo.updated_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const language = escapeHtml(repo.language || "Code");
          const description = escapeHtml(repo.description || "Public repository on GitHub.");
          const name = escapeHtml(repo.name);
          const htmlUrl = escapeHtml(repo.html_url);

          return `
            <article>
              <h3><a href="${htmlUrl}" target="_blank" rel="noreferrer">${name}</a></h3>
              <p>${description}</p>
              <div class="repo-meta">
                <span>${language}</span>
                <span>Updated ${updated}</span>
              </div>
            </article>
          `;
        })
        .join("");
    }
  } catch {
    profileStatus.textContent = "Link";
    if (repoList) {
      repoList.innerHTML = `
        <article>
          <h3>GitHub repositories</h3>
          <p>Visit the GitHub profile to view public repositories, languages, commits, and contribution activity.</p>
          <div class="repo-meta">
            <span>github.com/lextabi</span>
          </div>
        </article>
      `;
    }
  }
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

loadGithubStats();
