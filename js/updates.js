document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.querySelector("[data-updates-status]");
  const featuredContainer = document.querySelector(
    "[data-updates-featured]"
  );
  const listElement = document.querySelector("[data-updates-list]");

  console.log("updates.js loaded.");

  if (!statusElement || !featuredContainer || !listElement) {
    console.error(
      "Updates page elements are missing.",
      {
        statusElement,
        featuredContainer,
        listElement
      }
    );

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
      return "Published update";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "Published update";
    }

    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
  }

  function createHeader(update) {
    const header = document.createElement("div");
    header.className = "update-live-header";

    const badge = document.createElement("span");
    badge.className = "update-category-badge";
    badge.textContent = getCategoryLabel(update.category);

    const date = document.createElement("time");
    date.className = "update-live-date";

    if (update.published_at) {
      date.dateTime = update.published_at;
    }

    date.textContent = formatDate(update.published_at);

    header.append(badge, date);

    return header;
  }

  function createRegularUpdate(update) {
    const article = document.createElement("article");
    article.className = "journal-panel update-live-card";

    const header = createHeader(update);

    const title = document.createElement("h3");
    title.className = "update-live-title";
    title.textContent = update.title;

    const content = document.createElement("p");
    content.className = "update-live-content";
    content.textContent = update.content;

    article.append(header, title, content);

    return article;
  }

  function createFeaturedUpdate(update) {
    const article = document.createElement("article");
    article.className = "journal-panel update-featured-live";

    const label = document.createElement("p");
    label.className = "panel-label";
    label.textContent = "Featured Notice";

    const header = createHeader(update);

    const title = document.createElement("h2");
    title.className = "update-featured-title";
    title.textContent = update.title;

    const content = document.createElement("p");
    content.className = "update-live-content";
    content.textContent = update.content;

    article.append(label, header, title, content);

    return article;
  }

  async function loadUpdates() {
    if (!window.supabaseClient) {
      console.error("Supabase client is unavailable.");

      statusElement.textContent =
        "Updates are temporarily unavailable.";

      return;
    }

    try {
      console.log("Loading announcements from Supabase...");

      const { data, error } = await window.supabaseClient
        .from("announcements")
        .select(
          "id, title, content, category, important, published, published_at"
        )
        .eq("published", true)
        .order("published_at", {
          ascending: false
        });

      if (error) {
        console.error("Supabase announcements error:", error);

        statusElement.textContent =
          "Updates are temporarily unavailable.";

        return;
      }

      console.log("Announcements received:", data);

      const updates = Array.isArray(data) ? data : [];

      featuredContainer.replaceChildren();
      listElement.replaceChildren();

      featuredContainer.hidden = true;

      if (updates.length === 0) {
        statusElement.textContent =
          "There are no published updates yet.";

        return;
      }

      const featuredUpdate = updates.find(
        (update) => update.important === true
      );

      if (featuredUpdate) {
        featuredContainer.append(
          createFeaturedUpdate(featuredUpdate)
        );

        featuredContainer.hidden = false;
      }

      updates.forEach((update) => {
        if (
          featuredUpdate &&
          update.id === featuredUpdate.id
        ) {
          return;
        }

        listElement.append(
          createRegularUpdate(update)
        );
      });

      if (updates.length === 1) {
        statusElement.textContent =
          "1 published update.";
      } else {
        statusElement.textContent =
          `${updates.length} published updates.`;
      }
    } catch (error) {
      console.error(
        "Unexpected error while loading updates:",
        error
      );

      statusElement.textContent =
        "Updates are temporarily unavailable.";
    }
  }

  loadUpdates();
});
