(() => {
  const listElement = document.querySelector("[data-upcoming-list]");
  const statusElement = document.querySelector("[data-upcoming-status]");

  if (!listElement) {
    return;
  }

  function cleanLabel(value) {
    if (!value) {
      return "";
    }

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  function formatPostDate(dateString) {
    if (!dateString) {
      return "Date TBD";
    }

    const parts = dateString.split("-").map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
      return "Date TBD";
    }

    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat("en-CA", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date);
  }

  function createMetaItem(label, value) {
    const item = document.createElement("span");
    item.className = "upcoming-meta-item";

    const labelElement = document.createElement("strong");
    labelElement.textContent = `${label}: `;

    const valueElement = document.createElement("span");
    valueElement.textContent = value;

    item.append(labelElement, valueElement);

    return item;
  }

  function createUpcomingCard(bot) {
    const article = document.createElement("article");
    article.className = "upcoming-live-card";

    const top = document.createElement("div");
    top.className = "upcoming-live-card-top";

    const name = document.createElement("h3");
    name.className = "upcoming-live-name";
    name.textContent = bot.bot_name;

    const status = document.createElement("span");
    status.className = "upcoming-status-badge";
    status.textContent = cleanLabel(bot.status);

    top.append(name, status);

    const date = document.createElement("p");
    date.className = "upcoming-live-date";
    date.textContent = formatPostDate(bot.expected_post_date);

    const meta = document.createElement("div");
    meta.className = "upcoming-live-meta";

    if (bot.bot_type) {
      meta.append(
        createMetaItem("Type", cleanLabel(bot.bot_type))
      );
    }

    if (bot.series_name) {
      meta.append(
        createMetaItem("Series", bot.series_name)
      );
    }

    article.append(top, date);

    if (meta.children.length > 0) {
      article.append(meta);
    }

    return article;
  }

  async function loadUpcomingBots() {
    if (!window.supabaseClient) {
      if (statusElement) {
        statusElement.textContent =
          "Upcoming bots are temporarily unavailable.";
      }

      console.error(
        "Upcoming bots could not load: Supabase client unavailable."
      );

      return;
    }

    try {
      const { data, error } = await window.supabaseClient.rpc(
        "get_public_upcoming_bots"
      );

      if (error) {
        throw error;
      }

      listElement.replaceChildren();

      if (!Array.isArray(data) || data.length === 0) {
        if (statusElement) {
          statusElement.textContent =
            "There are no public upcoming bots listed right now.";
        }

        return;
      }

      data.forEach((bot) => {
        listElement.append(createUpcomingCard(bot));
      });

      if (statusElement) {
        statusElement.textContent =
          data.length === 1
            ? "1 upcoming bot currently listed."
            : `${data.length} upcoming bots currently listed.`;
      }
    } catch (error) {
      console.error("Unable to load upcoming bots:", error);

      if (statusElement) {
        statusElement.textContent =
          "Upcoming bots are temporarily unavailable.";
      }
    }
  }

  loadUpcomingBots();
})();
