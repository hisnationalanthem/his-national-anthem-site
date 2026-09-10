document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.querySelector(
    "[data-masterlist-series-status]"
  );

  const gridElement = document.querySelector(
    "[data-masterlist-series-grid]"
  );

  console.log("series.js loaded.");

  if (!statusElement || !gridElement) {
    console.error("Series page elements are missing.", {
      statusElement,
      gridElement
    });

    return;
  }


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


  /* ==========================================================
     CREATE BOT ENTRY INSIDE SERIES
     ========================================================== */

  function createSeriesBotItem(bot) {
    const item = document.createElement("div");

    item.className = "series-bot-item";


    /* BOT NAME */

    let nameElement;

    if (bot.janitor_url) {
      nameElement = document.createElement("a");

      nameElement.href = bot.janitor_url;
      nameElement.target = "_blank";
      nameElement.rel = "noopener noreferrer";
      nameElement.className = "series-bot-link";
    } else {
      nameElement = document.createElement("span");

      nameElement.className = "series-bot-name";
    }

    nameElement.textContent = bot.name;

    item.append(nameElement);


    /* BOT META */

    const metaParts = [];

    if (bot.pov) {
      metaParts.push(
        getPovLabel(bot.pov)
      );
    }

    if (bot.bot_type) {
      metaParts.push(
        getTypeLabel(bot.bot_type)
      );
    }

    if (metaParts.length > 0) {
      const meta = document.createElement("span");

      meta.className = "series-bot-meta";
      meta.textContent = metaParts.join(" · ");

      item.append(meta);
    }


    return item;
  }


  /* ==========================================================
     CREATE SERIES CARD
     ========================================================== */

  function createSeriesCard(series, linkedBots) {
    const article = document.createElement("article");

    article.className = "series-card series-card-live";


    /* SERIES IMAGE */

    if (series.image_url) {
      const image = document.createElement("img");

      image.className = "series-card-image";
      image.src = series.image_url;
      image.alt = `${series.name} series artwork`;
      image.loading = "lazy";

      article.append(image);
    }


    /* CARD BODY */

    const body = document.createElement("div");

    body.className = "series-card-body";


    /* LABEL */

    const label = document.createElement("p");

    label.className = "panel-label";
    label.textContent = "Series";

    body.append(label);


    /* SERIES NAME */

    const title = document.createElement("h3");

    title.className = "series-card-title";
    title.textContent = series.name;

    body.append(title);


    /* DESCRIPTION */

    if (series.description) {
      const description = document.createElement("p");

      description.className =
        "series-card-description";

      description.textContent =
        series.description;

      body.append(description);
    }


    /* BOT COUNT */

    const count = document.createElement("p");

    count.className = "series-bot-count";

    count.textContent =
      linkedBots.length === 1
        ? "1 bot"
        : `${linkedBots.length} bots`;

    body.append(count);


    /* BOT LIST */

    if (linkedBots.length > 0) {
      const botList = document.createElement("div");

      botList.className = "series-bot-list";

      linkedBots.forEach((bot) => {
        botList.append(
          createSeriesBotItem(bot)
        );
      });

      body.append(botList);
    } else {
      const emptyMessage = document.createElement("p");

      emptyMessage.className =
        "series-empty-message";

      emptyMessage.textContent =
        "No published bots are currently listed in this series.";

      body.append(emptyMessage);
    }


    article.append(body);

    return article;
  }


  /* ==========================================================
     LOAD SERIES + RELATIONSHIPS
     ========================================================== */

  async function loadSeries() {
    if (!window.supabaseClient) {
      console.error(
        "Series could not load: Supabase client unavailable."
      );

      statusElement.textContent =
        "Series are temporarily unavailable.";

      return;
    }

    try {
      console.log(
        "Loading published series from Supabase..."
      );


      /* ------------------------------------------------------
         1. LOAD PUBLIC SERIES
         ------------------------------------------------------ */

      const {
        data: seriesData,
        error: seriesError
      } = await window.supabaseClient
        .from("series")
        .select(
          "id, name, slug, description, image_url, sort_order"
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


      const seriesList =
        Array.isArray(seriesData)
          ? seriesData
          : [];


      console.log(
        "Published series received:",
        seriesList
      );


      gridElement.replaceChildren();


      if (seriesList.length === 0) {
        statusElement.textContent =
          "There are no published series yet.";

        return;
      }


      /* ------------------------------------------------------
         2. LOAD PUBLIC BOT/SERIES RELATIONSHIPS
         ------------------------------------------------------ */

      console.log(
        "Loading public series relationships..."
      );

      const {
        data: relationshipData,
        error: relationshipError
      } = await window.supabaseClient
        .from("bot_series")
        .select(`
          series_id,
          sort_order,
          bots (
            id,
            name,
            slug,
            pov,
            bot_type,
            janitor_url
          )
        `)
        .order("sort_order", {
          ascending: true
        });


      if (relationshipError) {
        throw relationshipError;
      }


      const relationships =
        Array.isArray(relationshipData)
          ? relationshipData
          : [];


      console.log(
        "Public series relationships received:",
        relationships
      );


      /* ------------------------------------------------------
         3. GROUP BOTS BY SERIES
         ------------------------------------------------------ */

      const botsBySeries = new Map();


      relationships.forEach((relationship) => {
        const bot = relationship.bots;

        if (!bot || !relationship.series_id) {
          return;
        }


        if (!botsBySeries.has(relationship.series_id)) {
          botsBySeries.set(
            relationship.series_id,
            []
          );
        }


        botsBySeries
          .get(relationship.series_id)
          .push(bot);
      });


      /* ------------------------------------------------------
         4. CREATE SERIES CARDS
         ------------------------------------------------------ */

      seriesList.forEach((series) => {
        const linkedBots =
          botsBySeries.get(series.id) || [];

        gridElement.append(
          createSeriesCard(
            series,
            linkedBots
          )
        );
      });


      /* ------------------------------------------------------
         5. STATUS
         ------------------------------------------------------ */

      statusElement.textContent =
        seriesList.length === 1
          ? "1 series currently listed."
          : `${seriesList.length} series currently listed.`;

    } catch (error) {
      console.error(
        "Unexpected error while loading series:",
        error
      );

      statusElement.textContent =
        "Series are temporarily unavailable.";
    }
  }


  loadSeries();
});
