document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.querySelector(
    "[data-masterlist-status]"
  );

  const gridElement = document.querySelector(
    "[data-masterlist-grid]"
  );

  const searchInput = document.querySelector(
    "#masterlist-search-input"
  );

  const filterButtons = document.querySelectorAll(
    "[data-masterlist-filter]"
  );

  console.log("masterlist.js loaded.");

  if (!statusElement || !gridElement) {
    console.error("Masterlist page elements are missing.", {
      statusElement,
      gridElement
    });

    return;
  }

  let allBots = [];
  let activeFilter = "all";


  /* ==========================================================
     LABEL HELPERS
     ========================================================== */

  function getPovLabel(value) {
    const labels = {
      anypov: "AnyPOV",
      fempov: "FemPOV",
      malepov: "MalePOV",
      mlm: "MLM",
      wlw: "WLW"
    };

    return labels[value] || value || "";
  }


  function getTypeLabel(value) {
    const labels = {
      original: "Original",
      alt: "Alt",
      commission: "Commission",
      media_inspired: "Media Inspired",
      remaster: "Remaster"
    };

    return labels[value] || value || "";
  }


  function getFilterLabel(value) {
    const labels = {
      all: "All",
      original: "Original",
      media_inspired: "Media Inspired"
    };

    return labels[value] || value;
  }


  /* ==========================================================
     CARD ELEMENTS
     ========================================================== */

  function createMetaBadge(text) {
    const badge = document.createElement("span");

    badge.className = "masterlist-meta-badge";
    badge.textContent = text;

    return badge;
  }


  function createBotCard(bot) {
    const article = document.createElement("article");

    article.className = "masterlist-live-card";


    /* IMAGE */

    if (bot.image_url) {
      const image = document.createElement("img");

      image.className = "masterlist-live-image";
      image.src = bot.image_url;
      image.alt = `${bot.name} bot artwork`;
      image.loading = "lazy";

      article.append(image);
    }


    /* CARD BODY */

    const body = document.createElement("div");

    body.className = "masterlist-live-body";


    /* BOT NAME */

    const title = document.createElement("h3");

    title.className = "masterlist-live-name";
    title.textContent = bot.name;

    body.append(title);


    /* POV + TYPE */

    const meta = document.createElement("div");

    meta.className = "masterlist-live-meta";

    if (bot.pov) {
      meta.append(
        createMetaBadge(
          getPovLabel(bot.pov)
        )
      );
    }

    if (bot.bot_type) {
      meta.append(
        createMetaBadge(
          getTypeLabel(bot.bot_type)
        )
      );
    }

    if (meta.children.length > 0) {
      body.append(meta);
    }


    /* DESCRIPTION */

    if (bot.description) {
      const description = document.createElement("p");

      description.className =
        "masterlist-live-description";

      description.textContent =
        bot.description;

      body.append(description);
    }


    /* JANITORAI LINK */

    if (bot.janitor_url) {
      const link = document.createElement("a");

      link.className = "masterlist-live-link";
      link.href = bot.janitor_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View on JanitorAI";

      body.append(link);
    }


    article.append(body);

    return article;
  }


  /* ==========================================================
     FILTERING
     ========================================================== */

  function getVisibleBots() {
    const searchTerm =
      searchInput?.value.trim().toLowerCase() || "";

    return allBots.filter((bot) => {
      /*
       * SEARCH MATCH
       */
      const botName =
        String(bot.name || "").toLowerCase();

      const matchesSearch =
        !searchTerm ||
        botName.includes(searchTerm);


      /*
       * TYPE FILTER MATCH
       */
      const matchesFilter =
        activeFilter === "all" ||
        bot.bot_type === activeFilter;


      return matchesSearch && matchesFilter;
    });
  }


  /* ==========================================================
     STATUS MESSAGE
     ========================================================== */

  function getStatusMessage(bots) {
    const searchTerm =
      searchInput?.value.trim() || "";

    /*
     * No published bots exist at all.
     */
    if (allBots.length === 0) {
      return "There are no published bots in the masterlist yet.";
    }


    /*
     * Search/filter combination found nothing.
     */
    if (bots.length === 0) {
      if (searchTerm && activeFilter !== "all") {
        return `No ${getFilterLabel(activeFilter)} bots match "${searchTerm}".`;
      }

      if (searchTerm) {
        return `No bots match "${searchTerm}".`;
      }

      if (activeFilter !== "all") {
        return `There are no ${getFilterLabel(activeFilter)} bots currently listed.`;
      }

      return "No bots match the current filters.";
    }


    /*
     * Search active.
     */
    if (searchTerm) {
      return bots.length === 1
        ? `1 bot matches "${searchTerm}".`
        : `${bots.length} bots match "${searchTerm}".`;
    }


    /*
     * Type filter active.
     */
    if (activeFilter !== "all") {
      return bots.length === 1
        ? `1 ${getFilterLabel(activeFilter)} bot.`
        : `${bots.length} ${getFilterLabel(activeFilter)} bots.`;
    }


    /*
     * Normal masterlist.
     */
    return bots.length === 1
      ? "1 bot in the masterlist."
      : `${bots.length} bots in the masterlist.`;
  }


  /* ==========================================================
     RENDER
     ========================================================== */

  function renderMasterlist() {
    const visibleBots =
      getVisibleBots();

    gridElement.replaceChildren();

    visibleBots.forEach((bot) => {
      gridElement.append(
        createBotCard(bot)
      );
    });

    statusElement.textContent =
      getStatusMessage(visibleBots);
  }


  /* ==========================================================
     ACTIVE FILTER BUTTON
     ========================================================== */

  function setActiveFilter(newFilter) {
    activeFilter = newFilter;

    filterButtons.forEach((button) => {
      const isActive =
        button.dataset.masterlistFilter === activeFilter;

      button.classList.toggle(
        "active",
        isActive
      );

      button.setAttribute(
        "aria-pressed",
        String(isActive)
      );
    });

    renderMasterlist();
  }


  /* ==========================================================
     LOAD FROM SUPABASE
     ========================================================== */

  async function loadMasterlist() {
    if (!window.supabaseClient) {
      console.error(
        "Masterlist could not load: Supabase client unavailable."
      );

      statusElement.textContent =
        "Bot masterlist is temporarily unavailable.";

      return;
    }

    try {
      console.log(
        "Loading published bots from Supabase..."
      );

      const { data, error } = await window.supabaseClient
        .from("bots")
        .select(
          "id, name, slug, description, pov, bot_type, image_url, janitor_url, published_at"
        )
        .eq("published", true)
        .order("published_at", {
          ascending: false
        });

      if (error) {
        console.error(
          "Supabase masterlist error:",
          error
        );

        statusElement.textContent =
          "Bot masterlist is temporarily unavailable.";

        return;
      }

      console.log(
        "Published bots received:",
        data
      );

      allBots = Array.isArray(data)
        ? data
        : [];

      renderMasterlist();

    } catch (error) {
      console.error(
        "Unexpected error while loading masterlist:",
        error
      );

      statusElement.textContent =
        "Bot masterlist is temporarily unavailable.";
    }
  }


  /* ==========================================================
     EVENTS
     ========================================================== */

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      renderMasterlist
    );
  }


  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveFilter(
        button.dataset.masterlistFilter
      );
    });
  });


  loadMasterlist();
});
