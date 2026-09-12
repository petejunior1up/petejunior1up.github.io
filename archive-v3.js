(function () {
  "use strict";

  /*
   * XYPHER ARCHIVE v3
   * Personal archive for writing, thoughts, dreams, ideas,
   * projects and unfinished work.
   *
   * NOTE:
   * This is a frontend-only archive. Anything stored here is
   * publicly accessible through the site's source code.
   */

  const categories = [
    {
      id: "poems",
      number: "01",
      name: "POEMS",
      description: "Writing, fragments & verses",
      type: "WRITING"
    },
    {
      id: "thoughts",
      number: "02",
      name: "THOUGHTS",
      description: "Notes, questions & observations",
      type: "JOURNAL"
    },
    {
      id: "dreams",
      number: "03",
      name: "DREAMS",
      description: "Goals, visions & future plans",
      type: "VISION"
    },
    {
      id: "ideas",
      number: "04",
      name: "IDEAS",
      description: "Tech concepts & experiments",
      type: "TECH"
    },
    {
      id: "projects",
      number: "05",
      name: "PROJECTS",
      description: "Build logs & project concepts",
      type: "BUILD"
    },
    {
      id: "unfinished",
      number: "06",
      name: "UNFINISHED",
      description: "Things still becoming",
      type: "WIP"
    }
  ];

  /*
   * ARCHIVE CONTENT
   */
  const entries = {
    poems: [
      {
        title: "Empty Page",
        date: "—",
        type: "POEM",
        content:
          "No poems have been archived here yet.\n\nSome things need to be written before they can be preserved."
      }
    ],

    thoughts: [
      {
        title: "When Letting Go Becomes Revenge",
        date: "2026-09-13",
        type: "THOUGHT",
        content: `There's having a girlfriend, and then all of a sudden her ex comes back claiming that she's still his.

You try to tell the guy to forget about her. She moved on. She made her choice. But instead of accepting that, he starts causing trouble for her—almost like hurting her is supposed to be revenge for losing her.

And honestly, that makes me think:

Someone leaving you doesn't give you ownership over them.

You can miss someone.
You can be hurt.
You can wish things had gone differently.

But none of that gives you the right to punish someone for choosing a different path.

Sometimes people confuse love with possession. They think, "If I can't have you, nobody should." But that's not love. That's refusing to accept that another person has a life and a choice of their own.

And maybe the hardest part about letting go isn't losing the person.

It's accepting that you no longer have a say in where they go next.`
      }
    ],

    dreams: [
      {
        title: "The Road Ahead",
        date: "—",
        type: "VISION",
        content:
          "Goals, dreams and future plans will be archived here."
      }
    ],

    ideas: [
      {
        title: "Ideas Loading...",
        date: "—",
        type: "IDEA",
        content:
          "Tech concepts, experiments and things worth building will appear here."
      }
    ],

    projects: [
      {
        title: "Future Builds",
        date: "—",
        type: "PROJECT",
        content:
          "Project concepts and build logs will be archived here."
      }
    ],

    unfinished: [
      {
        title: "Still Becoming",
        date: "—",
        type: "WIP",
        content:
          "Not everything needs to be finished before it deserves a place here."
      }
    ]
  };

  /*
   * Helpers
   */
  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getCategory(id) {
    return categories.find(function (category) {
      return category.id === id;
    });
  }

  function getEntries(categoryId) {
    return entries[categoryId] || [];
  }

  function formatContent(content) {
    return escapeHTML(content).replace(/\n/g, "<br>");
  }

  /*
   * BEFORE UNLOCK
   * Show category names only.
   */
  function renderLockedCategories() {
    const auth = document.querySelector(".dev-v2-auth");

    if (!auth) return;

    if (auth.querySelector(".archive-v3-auth-categories")) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "archive-v3-auth-categories";

    categories.forEach(function (category) {
      const item = document.createElement("div");
      item.className = "archive-v3-auth-category";

      item.innerHTML = `
        <span>${escapeHTML(category.number)}</span>
        <strong>${escapeHTML(category.name)}</strong>
      `;

      wrapper.appendChild(item);
    });

    auth.appendChild(wrapper);
  }

  /*
   * ARCHIVE DASHBOARD
   */
  function renderArchive() {
    const body = document.querySelector("#devV2Body");

    if (!body) return;

    body.innerHTML = `
      <section class="archive-v3">
        <header class="archive-v3-header">
          <div class="archive-v3-kicker">
            ARCHIVE // ACCESS GRANTED
          </div>

          <h1>THE ARCHIVE.</h1>

          <p>
            A collection of thoughts, writing, dreams, ideas,
            projects and unfinished things.
          </p>
        </header>

        <div class="archive-v3-controls">
          <label class="archive-v3-search-wrap">
            <span>SEARCH</span>
            <input
              id="archiveV3Search"
              type="search"
              placeholder="Search archive..."
              autocomplete="off"
            />
          </label>

          <div class="archive-v3-filter" id="archiveV3Filter">
            <button
              class="archive-v3-filter-btn active"
              data-filter="all"
              type="button"
            >
              ALL
            </button>
          </div>
        </div>

        <div
          class="archive-v3-grid"
          id="archiveV3Grid"
        ></div>

        <div
          class="archive-v3-placeholder"
          id="archiveV3Placeholder"
        >
          <span>ARCHIVE NOTE</span>
          <p>
            Not everything here needs to be finished.
            Some things are simply here because they mattered.
          </p>
        </div>
      </section>
    `;

    buildFilters();
    renderCards();
    bindSearch();
  }

  /*
   * CATEGORY FILTERS
   */
  function buildFilters() {
    const filter = document.querySelector("#archiveV3Filter");

    if (!filter) return;

    categories.forEach(function (category) {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "archive-v3-filter-btn";
      button.dataset.filter = category.id;
      button.textContent = category.name;

      filter.appendChild(button);
    });

    filter.addEventListener("click", function (event) {
      const button = event.target.closest(
        ".archive-v3-filter-btn"
      );

      if (!button) return;

      document
        .querySelectorAll(".archive-v3-filter-btn")
        .forEach(function (item) {
          item.classList.remove("active");
        });

      button.classList.add("active");

      renderCards(button.dataset.filter);
    });
  }

  /*
   * ARCHIVE CARDS
   */
  function renderCards(filterId, searchTerm) {
    const grid = document.querySelector("#archiveV3Grid");

    if (!grid) return;

    const filter = filterId || "all";
    const search = (searchTerm || "").trim().toLowerCase();

    let visible = [];

    categories.forEach(function (category) {
      if (filter !== "all" && category.id !== filter) {
        return;
      }

      getEntries(category.id).forEach(function (entry, index) {
        const searchable = [
          category.name,
          category.description,
          entry.title,
          entry.type,
          entry.content
        ]
          .join(" ")
          .toLowerCase();

        if (search && !searchable.includes(search)) {
          return;
        }

        visible.push({
          category: category,
          entry: entry,
          index: index
        });
      });
    });

    if (!visible.length) {
      grid.innerHTML = `
        <div class="archive-v3-empty">
          <span>NO MATCH</span>
          <p>No archived entry matches your search.</p>
        </div>
      `;

      return;
    }

    grid.innerHTML = visible
      .map(function (item) {
        return `
          <article
            class="archive-v3-card"
            data-category="${escapeHTML(item.category.id)}"
            data-index="${item.index}"
          >
            <div class="archive-v3-card-top">
              <span>
                ${escapeHTML(item.category.number)}
                //
                ${escapeHTML(item.entry.type)}
              </span>

              <span>
                ${escapeHTML(item.entry.date)}
              </span>
            </div>

            <h2>${escapeHTML(item.entry.title)}</h2>

            <p>
              ${escapeHTML(item.category.description)}
            </p>

            <button
              class="archive-v3-open"
              type="button"
            >
              OPEN ENTRY →
            </button>
          </article>
        `;
      })
      .join("");

    grid.querySelectorAll(".archive-v3-card").forEach(function (card) {
      card.addEventListener("click", function () {
        openEntry(
          card.dataset.category,
          Number(card.dataset.index)
        );
      });
    });
  }

  /*
   * ENTRY VIEW
   */
  function openEntry(categoryId, index) {
    const body = document.querySelector("#devV2Body");

    if (!body) return;

    const category = getCategory(categoryId);
    const categoryEntries = getEntries(categoryId);
    const entry = categoryEntries[index];

    if (!category || !entry) return;

    body.innerHTML = `
      <section class="archive-v3 archive-v3-entry">
        <button
          class="archive-v3-back"
          id="archiveV3Back"
          type="button"
        >
          ← BACK TO ARCHIVE
        </button>

        <header class="archive-v3-entry-header">
          <div class="archive-v3-kicker">
            ${escapeHTML(category.number)}
            //
            ${escapeHTML(category.name)}
            //
            ${escapeHTML(entry.type)}
          </div>

          <h1>${escapeHTML(entry.title)}</h1>

          <div class="archive-v3-entry-meta">
            ${escapeHTML(entry.date)}
          </div>
        </header>

        <article class="archive-v3-entry-content">
          ${formatContent(entry.content)}
        </article>

        <footer class="archive-v3-entry-footer">
          <span>${escapeHTML(category.description)}</span>
          <span>XYPHER ARCHIVE</span>
        </footer>
      </section>
    `;

    const back = document.querySelector("#archiveV3Back");

    if (back) {
      back.addEventListener("click", renderArchive);
    }
  }

  /*
   * SEARCH
   */
  function bindSearch() {
    const search = document.querySelector("#archiveV3Search");

    if (!search) return;

    search.addEventListener("input", function () {
      const activeFilter =
        document.querySelector(
          ".archive-v3-filter-btn.active"
        );

      renderCards(
        activeFilter
          ? activeFilter.dataset.filter
          : "all",
        search.value
      );
    });
  }

  /*
   * Detect the Developer Mode archive view.
   *
   * This is important because archive-v3.js is dynamically loaded
   * by v3.js after Developer Mode has been unlocked.
   */
  function checkForArchive() {
    const archiveView = document.querySelector(
      ".dev-v2-archive-view"
    );

    if (archiveView) {
      renderArchive();
      return true;
    }

    return false;
  }

  /*
   * Initial load
   */
  renderLockedCategories();

  /*
   * If the archive already exists, render immediately.
   */
  checkForArchive();

  /*
   * Watch Developer Mode for dynamically-created archive elements.
   */
  const observer = new MutationObserver(function () {
    renderLockedCategories();
    checkForArchive();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
