document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.querySelector(
    "[data-masterlist-status]"
  );

  const gridElement = document.querySelector(
    "[data-masterlist-grid]"
  );

  console.log("masterlist.js loaded.");

  if (!statusElement || !gridElement) {
    console.error("Masterlist page elements are missing.", {
      statusElement,
      gridElement
    });

    return;
  }

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

  function createMetaBadge(text) {
    const badge = document.createElement("span");

    badge.className = "masterlist-meta-badge";
    badge.textContent = text;

    return badge;
  }

  function createBotCard(bot) {
    const article = document.createElement("article");

    article.className = "masterlist-live-card";

    /*
     * IMAGE
     */
    if (bot.image_url) {
      const image = document.createElement("img");

      image.className = "masterlist-live-image";
      image.src = bot.image_url;
      image.alt = `${bot.name} bot artwork`;
      image.loading = "lazy";

      article.append(image);
    }

    /*
     * CARD BODY
     */
    const body = document.createElement("div");

    body.className = "masterlist-live-body";

    /*
     * BOT NAME
     */
    const title = document.createElement("h3");

    title.className = "masterlist-live-name";
    title.textContent = bot.name;

    body.append(title);

    /*
     * POV + TYPE
     */
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

    /*
     * DESCRIPTION
     */
    if (bot.description) {
      const description = document.createElement("p");

      description.className =
        "masterlist-live-description";

      description.textContent =
        bot.description;

      body.append(description);
    }

    /*
     * JANITORAI LINK
     */
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

  async function loadMasterlist() {
    /*
     * MAKE SURE SUPABASE EXISTS
     */
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

      /*
       * GET PUBLISHED BOTS
       */
      const { data, error } = await window.supabaseClient
        .from("bots")
        .select(
          "id, name, slug, description, pov, bot_type, image_url, janitor_url, published_at"
        )
        .eq("published", true)
        .order("published_at", {
          ascending: false
        });

      /*
       * DATABASE ERROR
       */
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

      const bots = Array.isArray(data)
        ? data
        : [];

      /*
       * REMOVE ANY PREVIOUS CARDS
       */
      gridElement.replaceChildren();

      /*
       * EMPTY MASTERLIST
       */
      if (bots.length === 0) {
        statusElement.textContent =
          "There are no published bots in the masterlist yet.";

        return;
      }

      /*
       * CREATE BOT CARDS
       */
      bots.forEach((bot) => {
        gridElement.append(
          createBotCard(bot)
        );
      });

      /*
       * RESULT COUNT
       */
      statusElement.textContent =
        bots.length === 1
          ? "1 bot in the masterlist."
          : `${bots.length} bots in the masterlist.`;

    } catch (error) {
      console.error(
        "Unexpected error while loading masterlist:",
        error
      );

      statusElement.textContent =
        "Bot masterlist is temporarily unavailable.";
    }
  }

  loadMasterlist();
});
