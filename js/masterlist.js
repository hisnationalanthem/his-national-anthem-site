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

  const seriesSelect = document.querySelector(
    "[data-masterlist-series-filter]"
  );

  console.log("masterlist.js loaded.");

  if (!statusElement || !gridElement) {
    console.error("Masterlist page elements are missing.", {
      statusElement,
      gridElement
    });

    return;
  }


  /* ==========================================================
     STATE
     ========================================================== */

  let allBots = [];
  let allSeries = [];
  let botSeriesRelationships = [];

  let activeFilter = "all";
  let activeSeries = "all";


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


  function getActiveSeriesName() {
    if (activeSeries === "all") {
      return "All Series";
    }

    const series = allSeries.find(
      (item) => item.id === activeSeries
    );

    return series?.name || "Selected Series";
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


    /* BODY */

    const body = document.createElement("div");

    body.className = "masterlist-live-body";


    /* NAME */

    const title = document.createElement("h3");

    title.className = "masterlist-live-name";
    title.textContent = bot.name;

    body.append(title);


    /* META */

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
     SERIES DROPDOWN
     ========================================================== */

  function populateSeriesSelect() {
    if (!seriesSelect) {
      return;
    }

    seriesSelect.replaceChildren();


    /* ALL SERIES OPTION */

    const allOption = document.createElement("option");

    allOption.value = "all";
    allOption.textContent = "All Series";

    seriesSelect.append(allOption);


    /* PUBLISHED SERIES */

    allSeries.forEach((series) => {
      const option = document.createElement("option");

      option.value = series.id;
      option.textContent = series.name;

      seriesSelect.append(option);
    });


    /*
     * Disable only when there are no published series.
     */
    seriesSelect.disabled =
      allSeries.length === 0;

    seriesSelect.value = "all";
    activeSeries = "all";
  }


  /* ==========================================================
     SERIES RELATIONSHIP CHECK
     ========================================================== */

  function botBelongsToActiveSeries(botId) {
    if (activeSeries === "all") {
      return true;
    }

    return botSeriesRelationships.some(
      (relationship) =>
        relationship.bot_id === botId &&
        relationship.series_id === activeSeries
    );
  }


  /* ==========================================================
     FILTERING
     ========================================================== */

  function getVisibleBots() {
    const searchTerm =
      searchInput?.value.trim().toLowerCase() || "";

    return allBots.filter((bot) => {
      const botName =
        String(bot.name || "").toLowerCase();


      /* SEARCH */

      const matchesSearch =
        !searchTerm ||
        botName.includes(searchTerm);


      /* BOT TYPE */

      const matchesType =
        activeFilter === "all" ||
        bot.bot_type === activeFilter;


      /* SERIES */

      const matchesSeries =
        botBelongsToActiveSeries(bot.id);


      return (
        matchesSearch &&
        matchesType &&
        matchesSeries
      );
    });
  }


  /* ==========================================================
     STATUS MESSAGE
     ========================================================== */

  function getStatusMessage(bots) {
    const searchTerm =
      searchInput?.value.trim() || "";

    const seriesName =
      getActiveSeriesName();


    /*
     * No bots exist.
     */
    if (allBots.length === 0) {
      return "There are no published bots in the masterlist yet.";
    }


    /*
     * No matches.
     */
    if (bots.length === 0) {
      if (
        searchTerm &&
        activeFilter !== "all" &&
        activeSeries !== "all"
      ) {
        return `No ${getFilterLabel(activeFilter)} bots in ${seriesName} match "${searchTerm}".`;
      }


      if (
        searchTerm &&
        activeSeries !== "all"
      ) {
        return `No bots in ${seriesName} match "${searchTerm}".`;
      }


      if (
        activeFilter !== "all" &&
        activeSeries !== "all"
      ) {
        return `There are no ${getFilterLabel(activeFilter)} bots in ${seriesName}.`;
      }


      if (searchTerm && activeFilter !== "all") {
        return `No ${getFilterLabel(activeFilter)} bots match "${searchTerm}".`;
      }


      if (searchTerm) {
        return `No bots match "${searchTerm}".`;
      }


      if (activeSeries !== "all") {
        return `There are no published bots in ${seriesName}.`;
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
     * Series active.
     */
    if (activeSeries !== "all") {
      return bots.length === 1
        ? `1 bot in ${seriesName}.`
        : `${bots.length} bots in ${seriesName}.`;
    }


    /*
     * Bot type active.
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
     BOT TYPE FILTER
     ========================================================== */

  function setActiveFilter(newFilter) {
    activeFilter = newFilter;

    filterButtons.forEach((button) => {
      const isActive =
        button.dataset.masterlistFilter ===
        activeFilter;

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
     LOAD DATA
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
        "Loading masterlist data from Supabase..."
      );


      /* ------------------------------------------------------
         1. PUBLISHED BOTS
         ------------------------------------------------------ */

      const {
        data: botData,
        error: botError
      } = await window.supabaseClient
        .from("bots")
        .select(
          "id, name, slug, description, pov, bot_type, image_url, janitor_url, published_at"
        )
        .eq("published", true)
        .order("published_at", {
          ascending: false
        });


      if (botError) {
        throw botError;
      }


      /* ------------------------------------------------------
         2. PUBLISHED SERIES
         ------------------------------------------------------ */

      const {
        data: seriesData,
        error: seriesError
      } = await window.supabaseClient
        .from("series")
        .select(
          "id, name, slug, sort_order"
        )
        .eq("published", true)
        .order("sort_order", {
          ascending: true
        })
        .order("name", {
          ascending: true
        });


      if (seriesError) {
        throw seriesError;
      }


      /* ------------------------------------------------------
         3. PUBLIC BOT/SERIES RELATIONSHIPS
         ------------------------------------------------------ */

      const {
        data: relationshipData,
        error: relationshipError
      } = await window.supabaseClient
        .from("bot_series")
        .select(
          "bot_id, series_id, sort_order"
        )
        .order("sort_order", {
          ascending: true
        });


      if (relationshipError) {
        throw relationshipError;
      }


      /* ------------------------------------------------------
         SAVE DATA
         ------------------------------------------------------ */

      allBots =
        Array.isArray(botData)
          ? botData
          : [];

      allSeries =
        Array.isArray(seriesData)
          ? seriesData
          : [];

      botSeriesRelationships =
        Array.isArray(relationshipData)
          ? relationshipData
          : [];


      console.log(
        "Published bots:",
        allBots
      );

      console.log(
        "Published series:",
        allSeries
      );

      console.log(
        "Public bot-series relationships:",
        botSeriesRelationships
      );


      /* ------------------------------------------------------
         BUILD SERIES DROPDOWN
         ------------------------------------------------------ */

      populateSeriesSelect();


      /* ------------------------------------------------------
         RENDER BOTS
         ------------------------------------------------------ */

      renderMasterlist();

    } catch (error) {
      console.error(
        "Unable to load masterlist data:",
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


  if (seriesSelect) {
    seriesSelect.addEventListener(
      "change",
      () => {
        activeSeries =
          seriesSelect.value;

        renderMasterlist();
      }
    );
  }


  /* ==========================================================
     START
     ========================================================== */

  loadMasterlist();
});
