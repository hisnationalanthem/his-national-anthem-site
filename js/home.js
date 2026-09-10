document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.querySelector(
    "[data-home-updates-status]"
  );

  const listElement = document.querySelector(
    "[data-home-updates-list]"
  );

  if (!statusElement || !listElement) {
    return;
  }

  function getCategoryLabel(category) {
    const categories = {
      general: "General",
      website: "Website",
      commissions: "Commissions",
      membership: "Membership",
      schedule: "Schedule",
      masterlist: "Masterlist",
      requests: "Free Requests"
    };

    return categories[category] || "General";
  }

  function formatDate(timestamp) {
    if (!timestamp) {
      return "";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(date);
  }

  function createUpdateCard(update) {
    const article = document.createElement("article");
    article.className = "home-update-card";

    const meta = document.createElement("div");
    meta.className = "home-update-meta";

    const category = document.createElement("span");
    category.className = "update-category-badge";
    category.textContent = getCategoryLabel(update.category);

    const date = document.createElement("time");
    date.className = "home-update-date";

    if (update.published_at) {
      date.dateTime = update.published_at;
    }

    date.textContent = formatDate(update.published_at);

    meta.append(category);

    if (update.important === true) {
      const important = document.createElement("span");
      important.className = "home-update-important";
      important.textContent = "Important";

      meta.append(important);
    }

    if (date.textContent) {
      meta.append(date);
    }

    const title = document.createElement("h3");
    title.className = "home-update-title";
    title.textContent = update.title;

    const content = document.createElement("p");
    content.className = "home-update-content";
    content.textContent = update.content;

    article.append(meta, title, content);

    return article;
  }

  async function loadHomepageUpdates() {
    if (!window.supabaseClient) {
      console.error(
        "Homepage updates could not load: Supabase client unavailable."
      );

      statusElement.textContent =
        "Latest updates are temporarily unavailable.";

      return;
    }

    try {
      const { data, error } = await window.supabaseClient
        .from("announcements")
        .select(
          "id, title, content, category, important, published_at"
        )
        .eq("published", true)
        .order("published_at", {
          ascending: false
        })
        .limit(3);

      if (error) {
        throw error;
      }

      const updates = Array.isArray(data) ? data : [];

      listElement.replaceChildren();

      if (updates.length === 0) {
        statusElement.textContent =
          "There are no published updates yet.";

        return;
      }

      updates.forEach((update) => {
        listElement.append(
          createUpdateCard(update)
        );
      });

      statusElement.textContent = "";
    } catch (error) {
      console.error(
        "Unable to load homepage announcements:",
        error
      );

      statusElement.textContent =
        "Latest updates are temporarily unavailable.";
    }
  }

  loadHomepageUpdates();
});
