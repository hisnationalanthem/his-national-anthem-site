document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================
     ELEMENTS
     ========================================================== */

  const loginPanel = document.querySelector("[data-admin-login]");
  const dashboard = document.querySelector("[data-admin-dashboard]");
  const loginForm = document.querySelector("[data-admin-login-form]");
  const loginButton = document.querySelector("[data-admin-login-button]");
  const authStatusElement = document.querySelector("[data-admin-auth-status]");
  const logoutButton = document.querySelector("[data-admin-logout]");

  const botForm = document.querySelector("[data-admin-bot-form]");
  const botSubmitButton = document.querySelector("[data-admin-bot-submit]");
  const botStatusElement = document.querySelector("[data-admin-bot-status]");
  const botNameInput = document.querySelector("#admin-bot-name");
  const botSlugInput = document.querySelector("#admin-bot-slug");

  const botManagerList = document.querySelector("[data-admin-bot-manager-list]");
  const botManagerStatus = document.querySelector("[data-admin-bots-status]");
  const botRefreshButton = document.querySelector("[data-admin-bots-refresh]");

  const editBotPanel = document.querySelector("[data-admin-edit-bot-panel]");
  const editBotForm = document.querySelector("[data-admin-edit-bot-form]");
  const editBotHeading = document.querySelector("[data-admin-edit-bot-heading]");
  const editBotStatus = document.querySelector("[data-admin-edit-bot-status]");
  const editBotCancelButton = document.querySelector("[data-admin-edit-bot-cancel]");
  const editBotSubmitButton = document.querySelector("[data-admin-edit-bot-submit]");

  const seriesForm = document.querySelector("[data-admin-series-form]");
  const seriesSubmitButton = document.querySelector("[data-admin-series-submit]");
  const seriesStatusElement = document.querySelector("[data-admin-series-status]");
  const seriesNameInput = document.querySelector("#admin-series-name");
  const seriesSlugInput = document.querySelector("#admin-series-slug");

  const seriesManagerList = document.querySelector("[data-admin-series-manager-list]");
  const seriesManagerStatus = document.querySelector("[data-admin-series-manager-status]");
  const seriesRefreshButton = document.querySelector("[data-admin-series-refresh]");

  /* ==========================================================
   EDIT SERIES ELEMENTS
   ========================================================== */

const editSeriesPanel = document.querySelector(
  "[data-admin-edit-series-panel]"
);

const editSeriesForm = document.querySelector(
  "[data-admin-edit-series-form]"
);

const editSeriesHeading = document.querySelector(
  "[data-admin-edit-series-heading]"
);

const editSeriesStatus = document.querySelector(
  "[data-admin-edit-series-status]"
);

const editSeriesSubmitButton = document.querySelector(
  "[data-admin-edit-series-submit]"
);

const editSeriesCancelButton = document.querySelector(
  "[data-admin-edit-series-cancel]"
);
  
  console.log("admin.js loaded.");


  /* ==========================================================
     STATE
     ========================================================== */

  let adminAuthorized = false;
  let lastGeneratedSlug = "";
  let lastGeneratedSeriesSlug = "";
  let editingBotId = null;
  let editingBotPublished = false;
  let editingSeriesId = null;


  /* ==========================================================
     REQUIRED ELEMENTS
     ========================================================== */

  if (!loginPanel || !dashboard || !loginForm || !authStatusElement) {
    console.error("Admin page elements are missing.", {
      loginPanel,
      dashboard,
      loginForm,
      authStatusElement
    });
    return;
  }


  /* ==========================================================
     GENERAL UI HELPERS
     ========================================================== */

  function showLogin() {
    loginPanel.hidden = false;
    dashboard.hidden = true;
  }

  function showDashboard() {
    loginPanel.hidden = true;
    dashboard.hidden = false;
  }

  function setAuthStatus(message, isError = false) {
    authStatusElement.textContent = message;
    authStatusElement.classList.toggle("admin-auth-error", isError);
  }

  function setLoginLoading(isLoading) {
    if (!loginButton) return;
    loginButton.disabled = isLoading;
    loginButton.textContent = isLoading ? "Signing In..." : "Sign In";
  }

  function setBotStatus(message, isError = false) {
    if (!botStatusElement) return;
    botStatusElement.textContent = message;
    botStatusElement.classList.toggle("admin-form-error", isError);
    botStatusElement.classList.toggle(
      "admin-form-success",
      !isError && Boolean(message)
    );
  }

  function setBotFormLoading(isLoading) {
    if (!botSubmitButton) return;
    botSubmitButton.disabled = isLoading;
    botSubmitButton.textContent = isLoading ? "Saving..." : "Save Bot";
  }

  function setEditBotLoading(isLoading) {
    if (!editBotSubmitButton) return;
    editBotSubmitButton.disabled = isLoading;
    editBotSubmitButton.textContent = isLoading ? "Saving..." : "Save Changes";
  }

  function setSeriesStatus(message, isError = false) {
    if (!seriesStatusElement) return;
    seriesStatusElement.textContent = message;
    seriesStatusElement.classList.toggle("admin-form-error", isError);
    seriesStatusElement.classList.toggle(
      "admin-form-success",
      !isError && Boolean(message)
    );
  }

  function setSeriesFormLoading(isLoading) {
    if (!seriesSubmitButton) return;
    seriesSubmitButton.disabled = isLoading;
    seriesSubmitButton.textContent = isLoading ? "Saving..." : "Save Series";
  }


  /* ==========================================================
     LABEL HELPERS
     ========================================================== */

  function getAdminPovLabel(value) {
    const labels = {
      anypov: "AnyPOV",
      fempov: "FemPOV",
      malepov: "MalePOV",
      mlm: "MLM",
      wlw: "WLW"
    };
    return labels[value] || value || "Not specified";
  }

  function getAdminBotTypeLabel(value) {
    const labels = {
      original: "Original",
      alt: "Alt",
      commission: "Commission",
      media_inspired: "Media Inspired",
      remaster: "Remaster"
    };
    return labels[value] || value || "Not specified";
  }


  /* ==========================================================
     SLUG HELPERS
     ========================================================== */

  function createSlug(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-");
  }

  if (botNameInput && botSlugInput) {
    botNameInput.addEventListener("input", () => {
      const generatedSlug = createSlug(botNameInput.value);
      if (!botSlugInput.value || botSlugInput.value === lastGeneratedSlug) {
        botSlugInput.value = generatedSlug;
        lastGeneratedSlug = generatedSlug;
      }
    });

    botSlugInput.addEventListener("input", () => {
      botSlugInput.value = createSlug(botSlugInput.value);
    });
  }

  if (seriesNameInput && seriesSlugInput) {
    seriesNameInput.addEventListener("input", () => {
      const generatedSlug = createSlug(seriesNameInput.value);
      if (
        !seriesSlugInput.value ||
        seriesSlugInput.value === lastGeneratedSeriesSlug
      ) {
        seriesSlugInput.value = generatedSlug;
        lastGeneratedSeriesSlug = generatedSlug;
      }
    });

    seriesSlugInput.addEventListener("input", () => {
      seriesSlugInput.value = createSlug(seriesSlugInput.value);
    });
  }


  /* ==========================================================
     AUTHORIZATION
     ========================================================== */

  async function userIsAdmin(user) {
    if (!user?.id) return false;

    const { data, error } = await window.supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Unable to check admin profile:", error);
      throw error;
    }

    return data?.role === "admin";
  }

  async function authorizeUser(user) {
    adminAuthorized = false;

    try {
      const isAdmin = await userIsAdmin(user);

      if (!isAdmin) {
        console.warn("Signed-in account is not an administrator.");
        await window.supabaseClient.auth.signOut();
        showLogin();
        setAuthStatus(
          "This account is not authorized to access the admin dashboard.",
          true
        );
        return false;
      }

      adminAuthorized = true;
      console.log("Administrator authorized:", user.email);
      setAuthStatus("");
      showDashboard();

      // Content-loading errors should never make a valid admin look unauthorized.
      void loadAdminBots();
      void loadAdminSeries();

      return true;
    } catch (error) {
      console.error("Admin authorization failed:", error);
      adminAuthorized = false;
      showLogin();
      setAuthStatus("Unable to verify administrator access.", true);
      return false;
    }
  }


  /* ==========================================================
     LOGIN / LOGOUT
     ========================================================== */

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!window.supabaseClient) {
      setAuthStatus("Supabase connection is unavailable.", true);
      return;
    }

    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setAuthStatus("Enter your email and password.", true);
      return;
    }

    setLoginLoading(true);
    setAuthStatus("Checking credentials...");

    try {
      const { data, error } = await window.supabaseClient.auth
        .signInWithPassword({ email, password });

      if (error) {
        console.error("Admin sign-in error:", error);
        setAuthStatus("Email or password is incorrect.", true);
        return;
      }

      if (!data?.user) {
        setAuthStatus("Unable to sign in.", true);
        return;
      }

      await authorizeUser(data.user);
    } catch (error) {
      console.error("Unexpected admin login error:", error);
      setAuthStatus("Unable to sign in right now.", true);
    } finally {
      setLoginLoading(false);
    }
  });

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        await window.supabaseClient.auth.signOut();
        adminAuthorized = false;
        loginForm.reset();
        botForm?.reset();
        seriesForm?.reset();
        closeEditBot();
        showLogin();
        setAuthStatus("Signed out.");
      } catch (error) {
        console.error("Admin sign-out error:", error);
      }
    });
  }


  /* ==========================================================
     EDIT BOT HELPERS
     ========================================================== */

  function closeEditBot() {
    editingBotId = null;
    editingBotPublished = false;

    if (editBotForm) editBotForm.reset();
    if (editBotStatus) editBotStatus.textContent = "";
    if (editBotPanel) editBotPanel.hidden = true;
  }

  function openEditBot(bot) {
    if (!editBotPanel || !editBotForm) {
      console.error("Edit Bot form elements are unavailable.");
      return;
    }

    editingBotId = bot.id;
    editingBotPublished = Boolean(bot.published);

    const values = {
      name: bot.name || "",
      slug: bot.slug || "",
      pov: bot.pov || "",
      bot_type: bot.bot_type || "",
      description: bot.description || "",
      image_url: bot.image_url || "",
      janitor_url: bot.janitor_url || ""
    };

    Object.entries(values).forEach(([fieldName, value]) => {
      const field = editBotForm.elements.namedItem(fieldName);
      if (field) field.value = value;
    });

    if (editBotHeading) {
      editBotHeading.textContent = `Editing "${bot.name}".`;
    }

    if (editBotStatus) editBotStatus.textContent = "";
    editBotPanel.hidden = false;
    editBotPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }


  /* ==========================================================
     ADMIN BOT CARD
     ========================================================== */

  function createAdminBotCard(bot) {
    const article = document.createElement("article");
    article.className = "admin-bot-manager-card";

    const header = document.createElement("div");
    header.className = "admin-bot-manager-header";

    const title = document.createElement("h3");
    title.className = "admin-bot-manager-name";
    title.textContent = bot.name;

    const status = document.createElement("span");
    status.className = bot.published
      ? "admin-bot-publication-status is-published"
      : "admin-bot-publication-status is-draft";
    status.textContent = bot.published ? "Published" : "Draft";

    header.append(title, status);

    const slug = document.createElement("p");
    slug.className = "admin-bot-manager-slug";
    slug.textContent = bot.slug;

    const meta = document.createElement("div");
    meta.className = "admin-bot-manager-meta";

    const pov = document.createElement("span");
    pov.textContent = getAdminPovLabel(bot.pov);

    const type = document.createElement("span");
    type.textContent = getAdminBotTypeLabel(bot.bot_type);

    meta.append(pov, type);

    const description = document.createElement("p");
    description.className = "admin-bot-manager-description";
    description.textContent = bot.description || "No masterlist description provided.";

    const janitorStatus = document.createElement("p");
    janitorStatus.className = "admin-bot-manager-link-status";
    janitorStatus.textContent = bot.janitor_url
      ? "JanitorAI link added"
      : "No JanitorAI link";

    const actions = document.createElement("div");
    actions.className = "admin-bot-manager-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "secondary-button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => openEditBot(bot));

    const publicationButton = document.createElement("button");
    publicationButton.type = "button";
    publicationButton.className = "secondary-button";
    publicationButton.textContent = bot.published ? "Unpublish" : "Publish";
    publicationButton.addEventListener("click", async () => {
      await toggleBotPublication(bot, publicationButton);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "secondary-button danger-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", async () => {
      await deleteBot(bot, deleteButton);
    });

    actions.append(editButton, publicationButton, deleteButton);
    article.append(header, slug, meta, description, janitorStatus, actions);

    return article;
  }

/* ==========================================================
   EDIT SERIES FORM
   ========================================================== */

function closeEditSeries() {
  if (
    !editSeriesPanel ||
    !editSeriesForm
  ) {
    return;
  }

  editingSeriesId = null;

  editSeriesForm.reset();

  if (editSeriesStatus) {
    editSeriesStatus.textContent = "";
  }

  editSeriesPanel.hidden = true;
}

function setEditSeriesLoading(isLoading) {
  if (!editSeriesSubmitButton) {
    return;
  }

  editSeriesSubmitButton.disabled =
    isLoading;

  editSeriesSubmitButton.textContent =
    isLoading
      ? "Saving..."
      : "Save Changes";
}
  
function openEditSeries(series) {
  if (
    !editSeriesPanel ||
    !editSeriesForm
  ) {
    console.error(
      "Edit Series form elements are unavailable."
    );

    return;
  }


  editingSeriesId = series.id;


  /* NAME */

  const nameField =
    editSeriesForm.elements.namedItem("name");

  if (nameField) {
    nameField.value =
      series.name || "";
  }


  /* SLUG */

  const slugField =
    editSeriesForm.elements.namedItem("slug");

  if (slugField) {
    slugField.value =
      series.slug || "";
  }


  /* DESCRIPTION */

  const descriptionField =
    editSeriesForm.elements.namedItem(
      "description"
    );

  if (descriptionField) {
    descriptionField.value =
      series.description || "";
  }


  /* IMAGE URL */

  const imageField =
    editSeriesForm.elements.namedItem(
      "image_url"
    );

  if (imageField) {
    imageField.value =
      series.image_url || "";
  }


  /* SORT ORDER */

  const sortOrderField =
    editSeriesForm.elements.namedItem(
      "sort_order"
    );

  if (sortOrderField) {
    sortOrderField.value =
      String(series.sort_order ?? 0);
  }


  /* HEADING */

  if (editSeriesHeading) {
    editSeriesHeading.textContent =
      `Editing "${series.name}".`;
  }


  /* STATUS */

  if (editSeriesStatus) {
    editSeriesStatus.textContent = "";
  }


  /* SHOW */

  editSeriesPanel.hidden = false;

  editSeriesPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}
  
  /* ==========================================================
     ADMIN SERIES CARD
     ========================================================== */

  function createAdminSeriesCard(series) {
    const article = document.createElement("article");
    article.className = "admin-bot-manager-card admin-series-manager-card";

    const header = document.createElement("div");
    header.className = "admin-bot-manager-header";

    const title = document.createElement("h3");
    title.className = "admin-bot-manager-name";
    title.textContent = series.name;

    const status = document.createElement("span");
    status.className = series.published
      ? "admin-bot-publication-status is-published"
      : "admin-bot-publication-status is-draft";
    status.textContent = series.published ? "Published" : "Draft";

    header.append(title, status);

    const slug = document.createElement("p");
    slug.className = "admin-bot-manager-slug";
    slug.textContent = series.slug;

    const meta = document.createElement("div");
    meta.className = "admin-bot-manager-meta";

    const sortOrder = document.createElement("span");
    sortOrder.textContent = `Sort Order: ${series.sort_order ?? 0}`;
    meta.append(sortOrder);

    const description = document.createElement("p");
    description.className = "admin-bot-manager-description";
    description.textContent = series.description || "No series description provided.";

    const imageStatus = document.createElement("p");
imageStatus.className = "admin-bot-manager-link-status";
imageStatus.textContent = series.image_url
  ? "Series image added"
  : "No series image";


/* ACTIONS */

const actions = document.createElement("div");
actions.className = "admin-bot-manager-actions";

const editButton =
  document.createElement("button");

editButton.type = "button";
editButton.className = "secondary-button";
editButton.textContent = "Edit";


editButton.addEventListener(
  "click",
  () => {
    openEditSeries(series);
  }
);
    
const publicationButton = document.createElement("button");

publicationButton.type = "button";
publicationButton.className = "secondary-button";

publicationButton.textContent = series.published
  ? "Unpublish"
  : "Publish";


publicationButton.addEventListener("click", async () => {
  await toggleSeriesPublication(
    series,
    publicationButton
  );
});

    const deleteButton =
  document.createElement("button");

deleteButton.type = "button";

deleteButton.className =
  "secondary-button danger-button";

deleteButton.textContent =
  "Delete";


deleteButton.addEventListener(
  "click",
  async () => {
    await deleteSeries(
      series,
      deleteButton
    );
  }
);

actions.append(
  editButton,
  publicationButton,
  deleteButton
);


article.append(
  header,
  slug,
  meta,
  description,
  imageStatus,
  actions
);

return article;
  }


  /* ==========================================================
     LOAD BOT MANAGER
     ========================================================== */

  async function loadAdminBots() {
    if (!botManagerList || !botManagerStatus) return;

    if (!window.supabaseClient || !adminAuthorized) {
      botManagerList.replaceChildren();
      botManagerStatus.textContent = "Administrator authorization is required.";
      return;
    }

    botManagerStatus.textContent = "Loading bots...";

    try {
      const { data, error } = await window.supabaseClient
        .from("bots")
        .select(`
          id,
          name,
          slug,
          description,
          pov,
          bot_type,
          image_url,
          janitor_url,
          published,
          published_at,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const bots = Array.isArray(data) ? data : [];
      console.log("Admin bots received:", bots);
      botManagerList.replaceChildren();

      if (bots.length === 0) {
        botManagerStatus.textContent = "There are no bot entries yet.";
        return;
      }

      bots.forEach((bot) => botManagerList.append(createAdminBotCard(bot)));
      botManagerStatus.textContent = bots.length === 1
        ? "1 bot entry."
        : `${bots.length} bot entries.`;
    } catch (error) {
      console.error("Unable to load admin bots:", error);
      botManagerList.replaceChildren();
      botManagerStatus.textContent = "Unable to load bot entries.";
    }
  }

/* ==========================================================
   DELETE SERIES
   ========================================================== */

async function deleteSeries(
  series,
  button
) {
  if (
    !window.supabaseClient ||
    !adminAuthorized
  ) {
    if (seriesManagerStatus) {
      seriesManagerStatus.textContent =
        "Administrator authorization is required.";
    }

    return;
  }


  const confirmed = window.confirm(
    `Permanently delete "${series.name}"?\n\nAny bot-to-series assignments for this collection will also be removed.\n\nThis cannot be undone.`
  );


  if (!confirmed) {
    return;
  }


  if (button) {
    button.disabled = true;
    button.textContent = "Deleting...";
  }


  if (seriesManagerStatus) {
    seriesManagerStatus.textContent =
      `Deleting "${series.name}"...`;
  }


  try {
    const {
      error
    } = await window.supabaseClient
      .from("series")
      .delete()
      .eq("id", series.id);


    if (error) {
      throw error;
    }


    console.log(
      "Series deleted:",
      series.id
    );


    /*
     * Close Edit Series if the deleted
     * collection was currently being edited.
     */
    if (editingSeriesId === series.id) {
      closeEditSeries();
    }


    await loadAdminSeries();


    if (seriesManagerStatus) {
      seriesManagerStatus.textContent =
        `"${series.name}" was deleted permanently.`;
    }


  } catch (error) {
    console.error(
      "Unable to delete series:",
      error
    );


    if (seriesManagerStatus) {
      seriesManagerStatus.textContent =
        `"${series.name}" could not be deleted.`;
    }


    if (button) {
      button.disabled = false;
      button.textContent = "Delete";
    }
  }
}
  
/* ==========================================================
   PUBLISH / UNPUBLISH SERIES
   ========================================================== */

async function toggleSeriesPublication(
  series,
  button
) {
  if (
    !window.supabaseClient ||
    !adminAuthorized
  ) {
    if (seriesManagerStatus) {
      seriesManagerStatus.textContent =
        "Administrator authorization is required.";
    }

    return;
  }


  const nextPublished =
    !series.published;


  if (button) {
    button.disabled = true;

    button.textContent =
      nextPublished
        ? "Publishing..."
        : "Unpublishing...";
  }


  if (seriesManagerStatus) {
    seriesManagerStatus.textContent =
      nextPublished
        ? `Publishing "${series.name}"...`
        : `Unpublishing "${series.name}"...`;
  }


  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("series")
      .update({
        published: nextPublished
      })
      .eq("id", series.id)
      .select(
        "id, name, published"
      )
      .single();


    if (error) {
      throw error;
    }


    console.log(
      "Series publication status updated:",
      data
    );


    await loadAdminSeries();


    if (seriesManagerStatus) {
      seriesManagerStatus.textContent =
        data.published
          ? `"${data.name}" was published successfully.`
          : `"${data.name}" was unpublished successfully.`;
    }


  } catch (error) {
    console.error(
      "Unable to update series publication status:",
      error
    );


    if (seriesManagerStatus) {
      seriesManagerStatus.textContent =
        "Unable to update the series publication status.";
    }


    if (button) {
      button.disabled = false;

      button.textContent =
        series.published
          ? "Unpublish"
          : "Publish";
    }
  }
}
  
  /* ==========================================================
     LOAD SERIES MANAGER
     ========================================================== */

  async function loadAdminSeries() {
    if (!seriesManagerList || !seriesManagerStatus) return;

    if (!window.supabaseClient || !adminAuthorized) {
      seriesManagerList.replaceChildren();
      seriesManagerStatus.textContent = "Administrator authorization is required.";
      return;
    }

    seriesManagerStatus.textContent = "Loading series...";

    try {
      const { data, error } = await window.supabaseClient
        .from("series")
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          published,
          sort_order,
          created_at,
          updated_at
        `)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;

      const seriesList = Array.isArray(data) ? data : [];
      console.log("Admin series received:", seriesList);
      seriesManagerList.replaceChildren();

      if (seriesList.length === 0) {
        seriesManagerStatus.textContent = "There are no series entries yet.";
        return;
      }

      seriesList.forEach((series) => {
        seriesManagerList.append(createAdminSeriesCard(series));
      });

      seriesManagerStatus.textContent = seriesList.length === 1
        ? "1 series entry."
        : `${seriesList.length} series entries.`;
    } catch (error) {
      console.error("Unable to load admin series:", error);
      seriesManagerList.replaceChildren();
      seriesManagerStatus.textContent = "Unable to load series entries.";
    }
  }


  /* ==========================================================
     ADD BOT
     ========================================================== */

  if (botForm) {
    botForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!window.supabaseClient || !adminAuthorized) {
        setBotStatus("Administrator authorization is required.", true);
        return;
      }

      const formData = new FormData(botForm);
      const name = String(formData.get("name") || "").trim();
      const slug = createSlug(formData.get("slug"));
      const pov = String(formData.get("pov") || "").trim();
      const botType = String(formData.get("bot_type") || "").trim();
      const description = String(formData.get("description") || "").trim();
      const imageUrl = String(formData.get("image_url") || "").trim();
      const janitorUrl = String(formData.get("janitor_url") || "").trim();
      const published = formData.get("published") === "on";

      if (!name) {
        setBotStatus("Bot name is required.", true);
        return;
      }

      const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slug || !validSlug.test(slug)) {
        setBotStatus(
          "Slug can contain only lowercase letters, numbers, and single hyphens.",
          true
        );
        return;
      }

      if (published && !janitorUrl) {
        setBotStatus("Add the JanitorAI URL before publishing this bot.", true);
        return;
      }

      const newBot = {
        name,
        slug,
        description: description || null,
        pov: pov || null,
        bot_type: botType || null,
        image_url: imageUrl || null,
        janitor_url: janitorUrl || null,
        published,
        published_at: published ? new Date().toISOString() : null
      };

      setBotFormLoading(true);
      setBotStatus(published ? "Publishing bot..." : "Saving draft...");

      try {
        const { data, error } = await window.supabaseClient
          .from("bots")
          .insert(newBot)
          .select("id, name, slug, published")
          .single();

        if (error) {
          console.error("Unable to save bot:", error);

          if (error.code === "23505") {
            setBotStatus(
              "That slug is already being used. Choose a different slug.",
              true
            );
            return;
          }

          if (error.code === "23514" || error.code === "23502") {
            setBotStatus(
              "The bot could not be saved because one of the values does not meet the database rules.",
              true
            );
            return;
          }

          setBotStatus("The bot could not be saved.", true);
          return;
        }

        console.log("Bot saved successfully:", data);
        setBotStatus(
          published
            ? `"${data.name}" was published successfully.`
            : `"${data.name}" was saved as a private draft.`
        );

        botForm.reset();
        lastGeneratedSlug = "";
        await loadAdminBots();
      } catch (error) {
        console.error("Unexpected error while saving bot:", error);
        setBotStatus("The bot could not be saved right now.", true);
      } finally {
        setBotFormLoading(false);
      }
    });
  }


  /* ==========================================================
     EDIT BOT
     ========================================================== */

  if (editBotForm) {
    editBotForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!window.supabaseClient || !adminAuthorized) {
        if (editBotStatus) {
          editBotStatus.textContent = "Administrator authorization is required.";
        }
        return;
      }

      if (!editingBotId) {
        if (editBotStatus) {
          editBotStatus.textContent = "No bot is currently selected for editing.";
        }
        return;
      }

      const formData = new FormData(editBotForm);
      const name = String(formData.get("name") || "").trim();
      const slug = createSlug(formData.get("slug"));
      const pov = String(formData.get("pov") || "").trim();
      const botType = String(formData.get("bot_type") || "").trim();
      const description = String(formData.get("description") || "").trim();
      const imageUrl = String(formData.get("image_url") || "").trim();
      const janitorUrl = String(formData.get("janitor_url") || "").trim();

      if (!name) {
        if (editBotStatus) editBotStatus.textContent = "Bot name is required.";
        return;
      }

      const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slug || !validSlug.test(slug)) {
        if (editBotStatus) {
          editBotStatus.textContent =
            "Slug can contain only lowercase letters, numbers, and single hyphens.";
        }
        return;
      }

      if (editingBotPublished && !janitorUrl) {
        if (editBotStatus) {
          editBotStatus.textContent = "A published bot must have a JanitorAI URL.";
        }
        return;
      }

      const updates = {
        name,
        slug,
        description: description || null,
        pov: pov || null,
        bot_type: botType || null,
        image_url: imageUrl || null,
        janitor_url: janitorUrl || null
      };

      setEditBotLoading(true);
      if (editBotStatus) editBotStatus.textContent = "Saving changes...";

      try {
        const { data, error } = await window.supabaseClient
          .from("bots")
          .update(updates)
          .eq("id", editingBotId)
          .select(`
            id,
            name,
            slug,
            description,
            pov,
            bot_type,
            image_url,
            janitor_url,
            published,
            published_at
          `)
          .single();

        if (error) {
          console.error("Unable to update bot:", error);

          if (error.code === "23505") {
            if (editBotStatus) {
              editBotStatus.textContent =
                "That slug is already being used by another bot.";
            }
            return;
          }

          if (error.code === "23514" || error.code === "23502") {
            if (editBotStatus) {
              editBotStatus.textContent =
                "One of the edited values does not meet the database rules.";
            }
            return;
          }

          if (editBotStatus) editBotStatus.textContent = "The bot could not be updated.";
          return;
        }

        console.log("Bot updated successfully:", data);
        const updatedName = data.name;
        closeEditBot();
        await loadAdminBots();

        if (botManagerStatus) {
          botManagerStatus.textContent = `"${updatedName}" was updated successfully.`;
        }
      } catch (error) {
        console.error("Unexpected error while updating bot:", error);
        if (editBotStatus) {
          editBotStatus.textContent = "The bot could not be updated right now.";
        }
      } finally {
        setEditBotLoading(false);
      }
    });
  }


  /* ==========================================================
     PUBLISH / UNPUBLISH BOT
     ========================================================== */

  async function toggleBotPublication(bot, button) {
    if (!window.supabaseClient || !adminAuthorized) {
      if (botManagerStatus) {
        botManagerStatus.textContent = "Administrator authorization is required.";
      }
      return;
    }

    const nextPublished = !bot.published;

    if (nextPublished && !bot.janitor_url) {
      if (botManagerStatus) {
        botManagerStatus.textContent =
          `"${bot.name}" cannot be published until a JanitorAI URL is added.`;
      }
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = nextPublished ? "Publishing..." : "Unpublishing...";
    }

    if (botManagerStatus) {
      botManagerStatus.textContent = nextPublished
        ? `Publishing "${bot.name}"...`
        : `Unpublishing "${bot.name}"...`;
    }

    const updates = nextPublished
      ? { published: true, published_at: new Date().toISOString() }
      : { published: false, published_at: null };

    try {
      const { data, error } = await window.supabaseClient
        .from("bots")
        .update(updates)
        .eq("id", bot.id)
        .select("id, name, published, published_at")
        .single();

      if (error) throw error;

      console.log("Bot publication status updated:", data);
      await loadAdminBots();

      if (botManagerStatus) {
        botManagerStatus.textContent = data.published
          ? `"${data.name}" was published successfully.`
          : `"${data.name}" was unpublished successfully.`;
      }
    } catch (error) {
      console.error("Unable to update bot publication status:", error);
      if (botManagerStatus) {
        botManagerStatus.textContent = "Unable to update the bot's publication status.";
      }
      if (button) {
        button.disabled = false;
        button.textContent = bot.published ? "Unpublish" : "Publish";
      }
    }
  }


  /* ==========================================================
     DELETE BOT
     ========================================================== */

  async function deleteBot(bot, button) {
    if (!window.supabaseClient || !adminAuthorized) {
      if (botManagerStatus) {
        botManagerStatus.textContent = "Administrator authorization is required.";
      }
      return;
    }

    const confirmed = window.confirm(
      `Permanently delete "${bot.name}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    if (button) {
      button.disabled = true;
      button.textContent = "Deleting...";
    }

    if (botManagerStatus) {
      botManagerStatus.textContent = `Deleting "${bot.name}"...`;
    }

    try {
      const { error } = await window.supabaseClient
        .from("bots")
        .delete()
        .eq("id", bot.id);

      if (error) throw error;

      console.log("Bot deleted:", bot.id);

      if (editingBotId === bot.id) closeEditBot();
      await loadAdminBots();

      if (botManagerStatus) {
        botManagerStatus.textContent = `"${bot.name}" was deleted permanently.`;
      }
    } catch (error) {
      console.error("Unable to delete bot:", error);
      if (botManagerStatus) {
        botManagerStatus.textContent = `"${bot.name}" could not be deleted.`;
      }
      if (button) {
        button.disabled = false;
        button.textContent = "Delete";
      }
    }
  }


  /* ==========================================================
     CREATE SERIES
     ========================================================== */

  if (seriesForm) {
    seriesForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!window.supabaseClient || !adminAuthorized) {
        setSeriesStatus("Administrator authorization is required.", true);
        return;
      }

      const formData = new FormData(seriesForm);
      const name = String(formData.get("name") || "").trim();
      const slug = createSlug(formData.get("slug"));
      const description = String(formData.get("description") || "").trim();
      const imageUrl = String(formData.get("image_url") || "").trim();
      const published = formData.get("published") === "on";
      const sortOrderRaw = Number(formData.get("sort_order"));
      const sortOrder = Number.isInteger(sortOrderRaw) && sortOrderRaw >= 0
        ? sortOrderRaw
        : 0;

      if (!name) {
        setSeriesStatus("Series name is required.", true);
        return;
      }

      const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slug || !validSlug.test(slug)) {
        setSeriesStatus(
          "Slug can contain only lowercase letters, numbers, and single hyphens.",
          true
        );
        return;
      }

      const newSeries = {
        name,
        slug,
        description: description || null,
        image_url: imageUrl || null,
        published,
        sort_order: sortOrder
      };

      setSeriesFormLoading(true);
      setSeriesStatus(published ? "Publishing series..." : "Saving series draft...");

      try {
        const { data, error } = await window.supabaseClient
          .from("series")
          .insert(newSeries)
          .select("id, name, slug, published, sort_order")
          .single();

        if (error) {
          console.error("Unable to save series:", error);

          if (error.code === "23505") {
            setSeriesStatus("That series slug is already being used.", true);
            return;
          }

          if (error.code === "23514" || error.code === "23502") {
            setSeriesStatus(
              "One of the series values does not meet the database rules.",
              true
            );
            return;
          }

          setSeriesStatus("The series could not be saved.", true);
          return;
        }

        console.log("Series saved successfully:", data);
        setSeriesStatus(
          data.published
            ? `"${data.name}" was published successfully.`
            : `"${data.name}" was saved as a private draft.`
        );

        seriesForm.reset();
        lastGeneratedSeriesSlug = "";

        const sortOrderField = seriesForm.elements.namedItem("sort_order");
        if (sortOrderField) sortOrderField.value = "0";

        await loadAdminSeries();
      } catch (error) {
        console.error("Unexpected error while saving series:", error);
        setSeriesStatus("The series could not be saved right now.", true);
      } finally {
        setSeriesFormLoading(false);
      }
    });
  }


  /* ==========================================================
     REFRESH / CANCEL BUTTONS
     ========================================================== */

  if (botRefreshButton) {
    botRefreshButton.addEventListener("click", async () => {
      await loadAdminBots();
    });
  }

  if (seriesRefreshButton) {
    seriesRefreshButton.addEventListener("click", async () => {
      await loadAdminSeries();
    });
  }

  if (editBotCancelButton) {
    editBotCancelButton.addEventListener("click", () => {
      closeEditBot();
    });
  }

/* ==========================================================
   SAVE EDITED SERIES
   ========================================================== */

if (editSeriesForm) {
  editSeriesForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();


      /* AUTH */

      if (
        !window.supabaseClient ||
        !adminAuthorized
      ) {
        if (editSeriesStatus) {
          editSeriesStatus.textContent =
            "Administrator authorization is required.";
        }

        return;
      }


      /* SERIES SELECTED */

      if (!editingSeriesId) {
        if (editSeriesStatus) {
          editSeriesStatus.textContent =
            "No series is currently selected for editing.";
        }

        return;
      }


      /* READ FORM */

      const formData =
        new FormData(editSeriesForm);

      const name =
        String(
          formData.get("name") || ""
        ).trim();

      const slug =
        createSlug(
          formData.get("slug")
        );

      const description =
        String(
          formData.get("description") || ""
        ).trim();

      const imageUrl =
        String(
          formData.get("image_url") || ""
        ).trim();

      const sortOrderRaw =
        Number(
          formData.get("sort_order")
        );

      const sortOrder =
        Number.isInteger(sortOrderRaw) &&
        sortOrderRaw >= 0
          ? sortOrderRaw
          : 0;


      /* VALIDATE NAME */

      if (!name) {
        if (editSeriesStatus) {
          editSeriesStatus.textContent =
            "Series name is required.";
        }

        return;
      }


      /* VALIDATE SLUG */

      const validSlug =
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

      if (
        !slug ||
        !validSlug.test(slug)
      ) {
        if (editSeriesStatus) {
          editSeriesStatus.textContent =
            "Slug can contain only lowercase letters, numbers, and single hyphens.";
        }

        return;
      }


      /* BUILD UPDATE */

      const updates = {
        name,
        slug,

        description:
          description || null,

        image_url:
          imageUrl || null,

        sort_order:
          sortOrder
      };


      setEditSeriesLoading(true);

      if (editSeriesStatus) {
        editSeriesStatus.textContent =
          "Saving changes...";
      }


      try {
        const {
          data,
          error
        } = await window.supabaseClient
          .from("series")
          .update(updates)
          .eq("id", editingSeriesId)
          .select(`
            id,
            name,
            slug,
            description,
            image_url,
            published,
            sort_order
          `)
          .single();


        if (error) {
          console.error(
            "Unable to update series:",
            error
          );


          if (error.code === "23505") {
            if (editSeriesStatus) {
              editSeriesStatus.textContent =
                "That series slug is already being used.";
            }

            return;
          }


          if (
            error.code === "23514" ||
            error.code === "23502"
          ) {
            if (editSeriesStatus) {
              editSeriesStatus.textContent =
                "One of the edited values does not meet the database rules.";
            }

            return;
          }


          if (editSeriesStatus) {
            editSeriesStatus.textContent =
              "The series could not be updated.";
          }

          return;
        }


        console.log(
          "Series updated successfully:",
          data
        );


        const updatedName =
          data.name;


        closeEditSeries();

        await loadAdminSeries();


        if (seriesManagerStatus) {
          seriesManagerStatus.textContent =
            `"${updatedName}" was updated successfully.`;
        }


      } catch (error) {
        console.error(
          "Unexpected error while updating series:",
          error
        );

        if (editSeriesStatus) {
          editSeriesStatus.textContent =
            "The series could not be updated right now.";
        }

      } finally {
        setEditSeriesLoading(false);
      }
    }
  );
}
  
  /* ==========================================================
   EDIT SERIES CANCEL
   ========================================================== */

if (editSeriesCancelButton) {
  editSeriesCancelButton.addEventListener(
    "click",
    () => {
      closeEditSeries();
    }
  );
}


  /* ==========================================================
     RESTORE EXISTING SESSION
     ========================================================== */

  async function restoreSession() {
    if (!window.supabaseClient) {
      console.error("Admin page could not initialize: Supabase client unavailable.");
      showLogin();
      setAuthStatus("Supabase connection is unavailable.", true);
      return;
    }

    try {
      const { data, error } = await window.supabaseClient.auth.getSession();
      if (error) throw error;

      const session = data?.session;
      if (!session?.user) {
        adminAuthorized = false;
        showLogin();
        return;
      }

      console.log("Existing Supabase session found.");
      await authorizeUser(session.user);
    } catch (error) {
      console.error("Unable to restore admin session:", error);
      adminAuthorized = false;
      showLogin();
      setAuthStatus("Please sign in.");
    }
  }


  /* ==========================================================
     START
     ========================================================== */

  showLogin();
  restoreSession();
});
