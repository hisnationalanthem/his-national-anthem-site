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
     CREATE SERIES CARD
     ========================================================== */

  function createSeriesCard(series) {
    const article = document.createElement("article");

    article.className = "series-card series-card-live";


    /* IMAGE */

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

      description.className = "series-card-description";
      description.textContent = series.description;

      body.append(description);
    }


    article.append(body);

    return article;
  }


  /* ==========================================================
     LOAD SERIES FROM SUPABASE
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

      const { data, error } = await window.supabaseClient
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

      if (error) {
        console.error(
          "Supabase series error:",
          error
        );

        statusElement.textContent =
          "Series are temporarily unavailable.";

        return;
      }

      console.log(
        "Published series received:",
        data
      );

      const seriesList = Array.isArray(data)
        ? data
        : [];

      gridElement.replaceChildren();


      /* ======================================================
         EMPTY SERIES LIST
         ====================================================== */

      if (seriesList.length === 0) {
        statusElement.textContent =
          "There are no published series yet.";

        return;
      }


      /* ======================================================
         CREATE SERIES CARDS
         ====================================================== */

      seriesList.forEach((series) => {
        gridElement.append(
          createSeriesCard(series)
        );
      });


      /* ======================================================
         RESULT COUNT
         ====================================================== */

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
