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
  let editingUpcomingId = null;
  let editingAnnouncementId = null;
  let editingAnnouncementPublished = false;

let adminFreeRequests = [];
let editingFreeRequestId = null;
let convertingGraveyardRequestId = null;

let adminGraveyardEntries = [];
let editingGraveyardId = null;
let adminCommissionRequests = [];
let reviewingCommissionId = null;
  
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
   UPCOMING BOT FORM LOADING
   ========================================================== */

function setUpcomingFormLoading(isLoading) {
  if (!upcomingSubmitButton) {
    return;
  }

  upcomingSubmitButton.disabled =
    isLoading || !adminAuthorized;

  upcomingSubmitButton.textContent =
    isLoading
      ? "Saving..."
      : "Save Upcoming Bot";
}

  /* ==========================================================
   ANNOUNCEMENT FORM LOADING
   ========================================================== */

function setAnnouncementFormLoading(isLoading) {
  if (!announcementSubmitButton) {
    return;
  }

  announcementSubmitButton.disabled =
    isLoading || !adminAuthorized;

  announcementSubmitButton.textContent =
    isLoading
      ? "Saving..."
      : "Save Announcement";
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
   UPCOMING STATUS LABEL
   ========================================================== */

function getAdminUpcomingStatusLabel(value) {
  const labels = {
    planned: "Planned",
    writing: "Writing",
    in_progress: "In Progress",
    ready: "Ready",
    scheduled: "Scheduled",
    delayed: "Delayed",
    posted: "Posted",
    cancelled: "Cancelled"
  };

  return labels[value] || value || "Not specified";
}

  /* ==========================================================
   ANNOUNCEMENT CATEGORY LABEL
   ========================================================== */

function getAdminAnnouncementCategoryLabel(value) {
  const labels = {
    general: "General",
    website: "Website",
    commissions: "Commissions",
    membership: "Membership",
    requests: "Requests",
    masterlist: "Masterlist",
    schedule: "Schedule"
  };

  return labels[value] || value || "General";
}

/* ==========================================================
   COMMISSION LABELS
   ========================================================== */

function getAdminCommissionTypeLabel(value) {
  const labels = {
    new_bot: "New Bot",
    alt_bot: "Alt Bot",
    graveyard_resurrection: "Graveyard Resurrection",
    bot_remaster: "Bot Remaster",
    media_inspired: "Media Inspired Bot",
    oc_creation: "Have Your OC Created"
  };

  return (
    labels[value] ||
    value ||
    "Unknown Commission Type"
  );
}


function getAdminCommissionStatusLabel(value) {
  const labels = {
  submitted: "Submitted",
  reviewing: "Reviewing",
  accepted: "Accepted",
  declined: "Declined",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled"
};

  if (labels[value]) {
    return labels[value];
  }

  if (!value) {
    return "Unknown Status";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}


function getAdminCommissionPaymentLabel(value) {
  const labels = {
    unpaid: "Unpaid",
    pending: "Pending",
    paid: "Paid",
    refunded: "Refunded"
  };

  return (
    labels[value] ||
    value ||
    "Unknown Payment Status"
  );
}


function formatAdminCommissionPrice(value) {
  const amount =
    Number(value);

  if (!Number.isFinite(amount)) {
    return "$0 CAD";
  }

  return `$${amount.toFixed(2)} CAD`;
}


function formatAdminCommissionDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Date unavailable";
  }

  return date.toLocaleString();
}
  
  /* ==========================================================
   FREE REQUEST LABELS
   ========================================================== */

function getAdminFreeRequestTypeLabel(value) {
  const labels = {
    jon_bernthal: "Jon Bernthal Suggestion",
    graveyard: "Graveyard Request"
  };

  return labels[value] || value || "Unknown Request Type";
}


function getAdminFreeRequestStatusLabel(value) {
  const labels = {
    submitted: "Submitted",
    reviewing: "Reviewing",
    accepted: "Accepted",
    denied: "Denied",
    created: "Created",
    archived: "Archived"
  };

  return labels[value] || value || "Unknown Status";
}

  /* ==========================================================
   GRAVEYARD STATUS LABELS
   ========================================================== */

function getAdminGraveyardStatusLabel(value) {
  const labels = {
    available: "Available",
    "message-first": "Message First",
    claimed: "Claimed",
    reserved: "Reserved",
    resurrected: "Resurrected"
  };

  return (
    labels[value] ||
    value ||
    "Unknown Status"
  );
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

  adminFreeRequests = [];
  editingFreeRequestId = null;

  adminGraveyardEntries = [];
  editingGraveyardId = null;

  adminCommissionRequests = [];
  reviewingCommissionId = null;

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
      setUpcomingFormLoading(false);
      setAnnouncementFormLoading(false);

     // Content-loading errors should never make a valid admin look unauthorized.
void loadAdminBots();
void loadAdminSeries();
void loadAdminAssignments();
void loadAdminUpcomingBots();
void loadAdminAnnouncements();
void loadAdminCommissions();
void loadAdminFreeRequests();
void loadAdminGraveyardEntries();

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
        adminGraveyardEntries = [];
editingGraveyardId = null;
        adminCommissionRequests = [];
reviewingCommissionId = null;

if (commissionList) {
  commissionList.replaceChildren();
}

if (graveyardList) {
  graveyardList.replaceChildren();
}
        setUpcomingFormLoading(false);
        setAnnouncementFormLoading(false);
        seriesForm?.reset();
        upcomingForm?.reset();
        loginForm.reset();
        botForm?.reset();
        seriesForm?.reset();
        announcementForm?.reset();
        closeEditBot();
        closeEditAnnouncement();
        closeEditFreeRequest();
        showLogin();
        closeEditUpcoming();
        closeGraveyardConversion();
        closeEditGraveyard();
        closeReviewCommission();
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
     BOT / SERIES ASSIGNMENT ELEMENTS
     ========================================================== */

  const assignmentForm = document.querySelector(
    "[data-admin-assignment-form]"
  );

  const assignmentBotSelect = document.querySelector(
    "[data-admin-assignment-bot]"
  );

  const assignmentSeriesSelect = document.querySelector(
    "[data-admin-assignment-series]"
  );

  const assignmentSubmitButton = document.querySelector(
    "[data-admin-assignment-submit]"
  );

  const assignmentStatus = document.querySelector(
    "[data-admin-assignment-status]"
  );

  const assignmentManagerStatus = document.querySelector(
    "[data-admin-assignment-manager-status]"
  );

  const assignmentList = document.querySelector(
    "[data-admin-assignment-list]"
  );

  const assignmentRefreshButton = document.querySelector(
    "[data-admin-assignments-refresh]"
  );

  /* ==========================================================
   UPCOMING BOT ELEMENTS
   ========================================================== */

const upcomingForm = document.querySelector(
  "[data-admin-upcoming-form]"
);

const upcomingSubmitButton = document.querySelector(
  "[data-admin-upcoming-submit]"
);

const upcomingStatusMessage = document.querySelector(
  "[data-admin-upcoming-status-message]"
);

const upcomingRefreshButton = document.querySelector(
  "[data-admin-upcoming-refresh]"
);

const upcomingManagerStatus = document.querySelector(
  "[data-admin-upcoming-manager-status]"
);

const upcomingList = document.querySelector(
  "[data-admin-upcoming-list]"
);

const editUpcomingPanel = document.querySelector(
  "[data-admin-edit-upcoming-panel]"
);

const editUpcomingForm = document.querySelector(
  "[data-admin-edit-upcoming-form]"
);

const editUpcomingHeading = document.querySelector(
  "[data-admin-edit-upcoming-heading]"
);

const editUpcomingSubmitButton = document.querySelector(
  "[data-admin-edit-upcoming-submit]"
);

const editUpcomingCancelButton = document.querySelector(
  "[data-admin-edit-upcoming-cancel]"
);

const editUpcomingStatusMessage = document.querySelector(
  "[data-admin-edit-upcoming-status-message]"
);

/* ==========================================================
   ANNOUNCEMENT ELEMENTS
   ========================================================== */

const announcementForm = document.querySelector(
  "[data-admin-announcement-form]"
);

const announcementSubmitButton = document.querySelector(
  "[data-admin-announcement-submit]"
);

const announcementStatus = document.querySelector(
  "[data-admin-announcement-status]"
);

const announcementRefreshButton = document.querySelector(
  "[data-admin-announcements-refresh]"
);

const announcementManagerStatus = document.querySelector(
  "[data-admin-announcement-manager-status]"
);

const announcementList = document.querySelector(
  "[data-admin-announcement-list]"
);

const editAnnouncementPanel = document.querySelector(
  "[data-admin-edit-announcement-panel]"
);

const editAnnouncementForm = document.querySelector(
  "[data-admin-edit-announcement-form]"
);

const editAnnouncementHeading = document.querySelector(
  "[data-admin-edit-announcement-heading]"
);

const editAnnouncementSubmitButton = document.querySelector(
  "[data-admin-edit-announcement-submit]"
);

const editAnnouncementCancelButton = document.querySelector(
  "[data-admin-edit-announcement-cancel]"
);

const editAnnouncementStatus = document.querySelector(
  "[data-admin-edit-announcement-status]"
);

  /* ==========================================================
   COMMISSION MANAGER ELEMENTS
   ========================================================== */

const commissionRefreshButton = document.querySelector(
  "[data-admin-commissions-refresh]"
);

const commissionSearch = document.querySelector(
  "[data-admin-commission-search]"
);

const commissionTypeFilter = document.querySelector(
  "[data-admin-commission-type-filter]"
);

const commissionStatusFilter = document.querySelector(
  "[data-admin-commission-status-filter]"
);

const commissionPaymentFilter = document.querySelector(
  "[data-admin-commission-payment-filter]"
);

const commissionManagerStatus = document.querySelector(
  "[data-admin-commission-manager-status]"
);

const commissionList = document.querySelector(
  "[data-admin-commission-list]"
);


/* ==========================================================
   REVIEW COMMISSION ELEMENTS
   ========================================================== */

const reviewCommissionPanel = document.querySelector(
  "[data-admin-review-commission-panel]"
);

const reviewCommissionHeading = document.querySelector(
  "[data-admin-review-commission-heading]"
);

const reviewCommissionType = document.querySelector(
  "[data-admin-review-commission-type]"
);

const reviewCommissionSubmitter = document.querySelector(
  "[data-admin-review-commission-submitter]"
);

const reviewCommissionContact = document.querySelector(
  "[data-admin-review-commission-contact]"
);

const reviewCommissionDetails = document.querySelector(
  "[data-admin-review-commission-details]"
);

const reviewCommissionReference = document.querySelector(
  "[data-admin-review-commission-reference]"
);

const reviewCommissionGraveyard = document.querySelector(
  "[data-admin-review-commission-graveyard]"
);

const reviewCommissionPrivate = document.querySelector(
  "[data-admin-review-commission-private]"
);

const reviewCommissionImages = document.querySelector(
  "[data-admin-review-commission-images]"
);

const reviewCommissionBasePrice = document.querySelector(
  "[data-admin-review-commission-base-price]"
);

const reviewCommissionAddonPrice = document.querySelector(
  "[data-admin-review-commission-addon-price]"
);

const reviewCommissionTotal = document.querySelector(
  "[data-admin-review-commission-total]"
);

const reviewCommissionStatus = document.querySelector(
  "[data-admin-review-commission-status]"
);

const reviewCommissionPayment = document.querySelector(
  "[data-admin-review-commission-payment]"
);

const reviewCommissionCreated = document.querySelector(
  "[data-admin-review-commission-created]"
);

const reviewCommissionSaveButton = document.querySelector(
  "[data-admin-review-commission-save]"
);
  
const reviewCommissionCloseButton = document.querySelector(
  "[data-admin-review-commission-close]"
);

const reviewCommissionStatusMessage = document.querySelector(
  "[data-admin-review-commission-status-message]"
);

/* ==========================================================
   FREE REQUEST ELEMENTS
   ========================================================== */

const freeRequestRefreshButton = document.querySelector(
  "[data-admin-free-requests-refresh]"
);

const freeRequestTypeFilter = document.querySelector(
  "[data-admin-free-request-type-filter]"
);

const freeRequestStatusFilter = document.querySelector(
  "[data-admin-free-request-status-filter]"
);

const freeRequestManagerStatus = document.querySelector(
  "[data-admin-free-request-manager-status]"
);

const freeRequestList = document.querySelector(
  "[data-admin-free-request-list]"
);

const editFreeRequestPanel = document.querySelector(
  "[data-admin-edit-free-request-panel]"
);

const editFreeRequestForm = document.querySelector(
  "[data-admin-edit-free-request-form]"
);

const editFreeRequestHeading = document.querySelector(
  "[data-admin-edit-free-request-heading]"
);

const editFreeRequestType = document.querySelector(
  "[data-admin-edit-free-request-type]"
);

const editFreeRequestSubmitter = document.querySelector(
  "[data-admin-edit-free-request-submitter]"
);

const editFreeRequestDetails = document.querySelector(
  "[data-admin-edit-free-request-details]"
);

const editFreeRequestSubmitButton = document.querySelector(
  "[data-admin-edit-free-request-submit]"
);

const editFreeRequestCancelButton = document.querySelector(
  "[data-admin-edit-free-request-cancel]"
);

const editFreeRequestStatusMessage = document.querySelector(
  "[data-admin-edit-free-request-status-message]"
);

/* ==========================================================
   GRAVEYARD CONVERSION ELEMENTS
   ========================================================== */

const graveyardConvertPanel = document.querySelector(
  "[data-admin-graveyard-convert-panel]"
);

const graveyardConvertForm = document.querySelector(
  "[data-admin-graveyard-convert-form]"
);

const graveyardConvertHeading = document.querySelector(
  "[data-admin-graveyard-convert-heading]"
);

const graveyardSourceSubmitter = document.querySelector(
  "[data-admin-graveyard-source-submitter]"
);

const graveyardSourceDetails = document.querySelector(
  "[data-admin-graveyard-source-details]"
);

const graveyardConvertSubmitButton = document.querySelector(
  "[data-admin-graveyard-convert-submit]"
);

const graveyardConvertCancelButton = document.querySelector(
  "[data-admin-graveyard-convert-cancel]"
);

const graveyardConvertStatus = document.querySelector(
  "[data-admin-graveyard-convert-status]"
);

  /* ==========================================================
   GRAVEYARD MANAGER ELEMENTS
   ========================================================== */

const graveyardRefreshButton = document.querySelector(
  "[data-admin-graveyard-refresh]"
);

const graveyardSearch = document.querySelector(
  "[data-admin-graveyard-search]"
);

const graveyardStatusFilter = document.querySelector(
  "[data-admin-graveyard-status-filter]"
);

const graveyardManagerStatus = document.querySelector(
  "[data-admin-graveyard-manager-status]"
);

const graveyardList = document.querySelector(
  "[data-admin-graveyard-list]"
);


/* ==========================================================
   EDIT GRAVEYARD ELEMENTS
   ========================================================== */

const editGraveyardPanel = document.querySelector(
  "[data-admin-edit-graveyard-panel]"
);

const editGraveyardForm = document.querySelector(
  "[data-admin-edit-graveyard-form]"
);

const editGraveyardHeading = document.querySelector(
  "[data-admin-edit-graveyard-heading]"
);

const editGraveyardCode = document.querySelector(
  "[data-admin-edit-graveyard-code]"
);

const editGraveyardSubmitButton = document.querySelector(
  "[data-admin-edit-graveyard-submit]"
);

const editGraveyardCancelButton = document.querySelector(
  "[data-admin-edit-graveyard-cancel]"
);

const editGraveyardStatusMessage = document.querySelector(
  "[data-admin-edit-graveyard-status-message]"
);
  
  /* ==========================================================
     ASSIGNMENT FORM STATE
     ========================================================== */

  function updateAssignmentSubmitState() {
    if (!assignmentSubmitButton) {
      return;
    }

    const hasBot = Boolean(assignmentBotSelect?.value);
    const hasSeries = Boolean(assignmentSeriesSelect?.value);

    assignmentSubmitButton.disabled = !hasBot || !hasSeries;
  }


  /* ==========================================================
     ASSIGNMENT DROPDOWNS
     ========================================================== */

  function populateAssignmentDropdowns(bots, seriesList) {
    if (!assignmentBotSelect || !assignmentSeriesSelect) {
      return;
    }

    assignmentBotSelect.replaceChildren();

    const botPlaceholder = document.createElement("option");
    botPlaceholder.value = "";
    botPlaceholder.textContent = bots.length > 0
      ? "Choose a bot..."
      : "No bots available";
    assignmentBotSelect.append(botPlaceholder);

    bots.forEach((bot) => {
      const option = document.createElement("option");
      option.value = bot.id;
      option.textContent = bot.published
        ? `${bot.name} — Published`
        : `${bot.name} — Draft`;
      assignmentBotSelect.append(option);
    });

    assignmentBotSelect.disabled = bots.length === 0;

    assignmentSeriesSelect.replaceChildren();

    const seriesPlaceholder = document.createElement("option");
    seriesPlaceholder.value = "";
    seriesPlaceholder.textContent = seriesList.length > 0
      ? "Choose a series..."
      : "No series available";
    assignmentSeriesSelect.append(seriesPlaceholder);

    seriesList.forEach((series) => {
      const option = document.createElement("option");
      option.value = series.id;
      option.textContent = series.published
        ? `${series.name} — Published`
        : `${series.name} — Draft`;
      assignmentSeriesSelect.append(option);
    });

    assignmentSeriesSelect.disabled = seriesList.length === 0;

    updateAssignmentSubmitState();
  }


  /* ==========================================================
     CREATE ASSIGNMENT CARD
     ========================================================== */

 function createAdminAssignmentCard(relationship) {
  const article = document.createElement("article");
  article.className =
    "admin-bot-manager-card admin-assignment-card";


  const seriesName =
    relationship.series?.name ||
    "Unknown Series";

  const botName =
    relationship.bots?.name ||
    "Unknown Bot";


  /* HEADER */

  const header =
    document.createElement("div");

  header.className =
    "admin-bot-manager-header";


  const title =
    document.createElement("h3");

  title.className =
    "admin-bot-manager-name";

  title.textContent =
    seriesName;


  const position =
    document.createElement("span");

  position.className =
    "admin-bot-publication-status is-draft";

  position.textContent =
    `Position ${relationship.sort_order ?? 0}`;


  header.append(
    title,
    position
  );


  /* BOT */

  const botLabel =
    document.createElement("p");

  botLabel.className =
    "admin-bot-manager-description";

  botLabel.textContent =
    botName;


  /* META */

  const meta =
    document.createElement("div");

  meta.className =
    "admin-bot-manager-meta";


  const botStatus =
    document.createElement("span");

  botStatus.textContent =
    relationship.bots?.published
      ? "Bot Published"
      : "Bot Draft";


  const seriesStatus =
    document.createElement("span");

  seriesStatus.textContent =
    relationship.series?.published
      ? "Series Published"
      : "Series Draft";


  meta.append(
    botStatus,
    seriesStatus
  );


  /* ACTIONS */

  const actions =
    document.createElement("div");

  actions.className =
    "admin-bot-manager-actions";


  const removeButton =
    document.createElement("button");

  removeButton.type =
    "button";

  removeButton.className =
    "secondary-button danger-button";

  removeButton.textContent =
    "Remove From Series";


  removeButton.addEventListener(
    "click",
    async () => {
      await removeBotSeriesAssignment(
        relationship,
        removeButton
      );
    }
  );


  actions.append(
    removeButton
  );


  article.append(
    header,
    botLabel,
    meta,
    actions
  );


  return article;
}

  /* ==========================================================
   REMOVE BOT / SERIES ASSIGNMENT
   ========================================================== */

async function removeBotSeriesAssignment(
  relationship,
  button
) {
  if (
    !window.supabaseClient ||
    !adminAuthorized
  ) {
    if (assignmentManagerStatus) {
      assignmentManagerStatus.textContent =
        "Administrator authorization is required.";
    }

    return;
  }


  const botName =
    relationship.bots?.name ||
    "this bot";

  const seriesName =
    relationship.series?.name ||
    "this series";


  const confirmed =
    window.confirm(
      `Remove "${botName}" from "${seriesName}"?\n\nThe bot and series themselves will not be deleted.`
    );


  if (!confirmed) {
    return;
  }


  if (button) {
    button.disabled = true;
    button.textContent = "Removing...";
  }


  if (assignmentManagerStatus) {
    assignmentManagerStatus.textContent =
      `Removing "${botName}" from "${seriesName}"...`;
  }


  try {
    const {
      error
    } = await window.supabaseClient
      .from("bot_series")
      .delete()
      .eq(
        "id",
        relationship.id
      );


    if (error) {
      throw error;
    }


    console.log(
      "Bot-series assignment removed:",
      relationship.id
    );


    await loadAdminAssignments();


    if (assignmentManagerStatus) {
      assignmentManagerStatus.textContent =
        `"${botName}" was removed from "${seriesName}".`;
    }


  } catch (error) {
    console.error(
      "Unable to remove bot-series assignment:",
      error
    );


    if (assignmentManagerStatus) {
      assignmentManagerStatus.textContent =
        "Unable to remove the bot from this series.";
    }


    if (button) {
      button.disabled = false;
      button.textContent =
        "Remove From Series";
    }
  }
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
   EDIT UPCOMING BOT HELPERS
   ========================================================== */

function closeEditUpcoming() {
  editingUpcomingId = null;

  if (editUpcomingForm) {
    editUpcomingForm.reset();
  }

  if (editUpcomingStatusMessage) {
    editUpcomingStatusMessage.textContent = "";
  }

  if (editUpcomingPanel) {
    editUpcomingPanel.hidden = true;
  }
}


function openEditUpcoming(entry) {
  if (
    !editUpcomingPanel ||
    !editUpcomingForm
  ) {
    console.error(
      "Edit Upcoming Bot form elements are unavailable."
    );

    return;
  }


  editingUpcomingId = entry.id;


  const botNameField =
    editUpcomingForm.elements.namedItem(
      "bot_name"
    );

  const botTypeField =
    editUpcomingForm.elements.namedItem(
      "bot_type"
    );

  const dateField =
    editUpcomingForm.elements.namedItem(
      "expected_post_date"
    );

  const statusField =
    editUpcomingForm.elements.namedItem(
      "status"
    );

  const seriesField =
    editUpcomingForm.elements.namedItem(
      "series_name"
    );

  const notesField =
    editUpcomingForm.elements.namedItem(
      "notes"
    );

  const sortOrderField =
    editUpcomingForm.elements.namedItem(
      "sort_order"
    );

  const visibleField =
    editUpcomingForm.elements.namedItem(
      "public_visible"
    );


  if (botNameField) {
    botNameField.value =
      entry.bot_name || "";
  }

  if (botTypeField) {
    botTypeField.value =
      entry.bot_type || "";
  }

  if (dateField) {
    dateField.value =
      entry.expected_post_date || "";
  }

  if (statusField) {
    statusField.value =
      entry.status || "planned";
  }

  if (seriesField) {
    seriesField.value =
      entry.series_name || "";
  }

  if (notesField) {
    notesField.value =
      entry.notes || "";
  }

  if (sortOrderField) {
    sortOrderField.value =
      String(
        entry.sort_order ?? 0
      );
  }

  if (visibleField) {
    visibleField.checked =
      Boolean(entry.public_visible);
  }


  if (editUpcomingHeading) {
    editUpcomingHeading.textContent =
      `Editing "${entry.bot_name}".`;
  }

  if (editUpcomingStatusMessage) {
    editUpcomingStatusMessage.textContent =
      "";
  }


  editUpcomingPanel.hidden = false;

  editUpcomingPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}
  
/* ==========================================================
   ADMIN UPCOMING BOT CARD
   ========================================================== */

function createAdminUpcomingCard(entry) {
  const article =
    document.createElement("article");

  article.className =
    "admin-bot-manager-card admin-upcoming-manager-card";


  /* HEADER */

  const header =
    document.createElement("div");

  header.className =
    "admin-bot-manager-header";


  const title =
    document.createElement("h3");

  title.className =
    "admin-bot-manager-name";

  title.textContent =
    entry.bot_name;


  const visibility =
    document.createElement("span");

  visibility.className =
    entry.public_visible
      ? "admin-bot-publication-status is-published"
      : "admin-bot-publication-status is-draft";

  visibility.textContent =
    entry.public_visible
      ? "Public"
      : "Private";


  header.append(
    title,
    visibility
  );


  /* DATE */

  const date =
    document.createElement("p");

  date.className =
    "admin-bot-manager-slug";

  date.textContent =
    entry.expected_post_date
      ? `Expected: ${entry.expected_post_date}`
      : "Expected date not set";


  /* META */

  const meta =
    document.createElement("div");

  meta.className =
    "admin-bot-manager-meta";


  const type =
    document.createElement("span");

  type.textContent =
    entry.bot_type
      ? getAdminBotTypeLabel(
          entry.bot_type
        )
      : "Type not specified";


  const status =
    document.createElement("span");

  status.textContent =
    getAdminUpcomingStatusLabel(
      entry.status
    );


  const sortOrder =
    document.createElement("span");

  sortOrder.textContent =
    `Sort Order: ${entry.sort_order ?? 0}`;


  meta.append(
    type,
    status,
    sortOrder
  );


  /* SERIES */

  const series =
    document.createElement("p");

  series.className =
    "admin-bot-manager-link-status";

  series.textContent =
    entry.series_name
      ? `Series: ${entry.series_name}`
      : "No series";


  /* NOTES */

  const notes =
    document.createElement("p");

  notes.className =
    "admin-bot-manager-description";

  notes.textContent =
    entry.notes ||
    "No notes provided.";


  /* ACTIONS */

const actions =
  document.createElement("div");

actions.className =
  "admin-bot-manager-actions";


/* EDIT */

const editButton =
  document.createElement("button");

editButton.type =
  "button";

editButton.className =
  "secondary-button";

editButton.textContent =
  "Edit";


editButton.addEventListener(
  "click",
  () => {
    openEditUpcoming(entry);
  }
);


/* DELETE */

const deleteButton =
  document.createElement("button");

deleteButton.type =
  "button";

deleteButton.className =
  "secondary-button danger-button";

deleteButton.textContent =
  "Delete";


deleteButton.addEventListener(
  "click",
  async () => {
    await deleteUpcomingBot(
      entry,
      deleteButton
    );
  }
);

  

actions.append(
  editButton,
  deleteButton
);


article.append(
  header,
  date,
  meta,
  series,
  notes,
  actions
);


return article;
}
/* ==========================================================
   EDIT ANNOUNCEMENT HELPERS
   ========================================================== */

function closeEditAnnouncement() {
  editingAnnouncementId = null;
  editingAnnouncementPublished = false;

  if (editAnnouncementForm) {
    editAnnouncementForm.reset();
  }

  if (editAnnouncementStatus) {
    editAnnouncementStatus.textContent = "";
  }

  if (editAnnouncementPanel) {
    editAnnouncementPanel.hidden = true;
  }
}


function openEditAnnouncement(announcement) {
  if (
    !editAnnouncementPanel ||
    !editAnnouncementForm
  ) {
    console.error(
      "Edit Announcement form elements are unavailable."
    );

    return;
  }


  editingAnnouncementId =
    announcement.id;

  editingAnnouncementPublished =
    Boolean(announcement.published);


  const titleField =
    editAnnouncementForm.elements.namedItem(
      "title"
    );

  const categoryField =
    editAnnouncementForm.elements.namedItem(
      "category"
    );

  const contentField =
    editAnnouncementForm.elements.namedItem(
      "content"
    );

  const importantField =
    editAnnouncementForm.elements.namedItem(
      "important"
    );

  const publishedField =
    editAnnouncementForm.elements.namedItem(
      "published"
    );


  if (titleField) {
    titleField.value =
      announcement.title || "";
  }

  if (categoryField) {
    categoryField.value =
      announcement.category || "general";
  }

  if (contentField) {
    contentField.value =
      announcement.content || "";
  }

  if (importantField) {
    importantField.checked =
      Boolean(announcement.important);
  }

  if (publishedField) {
    publishedField.checked =
      Boolean(announcement.published);
  }


  if (editAnnouncementHeading) {
    editAnnouncementHeading.textContent =
      `Editing "${announcement.title}".`;
  }


  if (editAnnouncementStatus) {
    editAnnouncementStatus.textContent =
      "";
  }


  editAnnouncementPanel.hidden = false;

  editAnnouncementPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

    /* ==========================================================
   ADMIN ANNOUNCEMENT CARD
   ========================================================== */

function createAdminAnnouncementCard(announcement) {
  const article =
    document.createElement("article");

  article.className =
    "admin-bot-manager-card admin-announcement-manager-card";


  /* HEADER */

  const header =
    document.createElement("div");

  header.className =
    "admin-bot-manager-header";


  const title =
    document.createElement("h3");

  title.className =
    "admin-bot-manager-name";

  title.textContent =
    announcement.title;


  const publicationStatus =
    document.createElement("span");

  publicationStatus.className =
    announcement.published
      ? "admin-bot-publication-status is-published"
      : "admin-bot-publication-status is-draft";

  publicationStatus.textContent =
    announcement.published
      ? "Published"
      : "Draft";


  header.append(
    title,
    publicationStatus
  );


  /* META */

  const meta =
    document.createElement("div");

  meta.className =
    "admin-bot-manager-meta";


  const category =
    document.createElement("span");

  category.textContent =
    getAdminAnnouncementCategoryLabel(
      announcement.category
    );


  const importance =
    document.createElement("span");

  importance.textContent =
    announcement.important
      ? "Important"
      : "Standard";


  meta.append(
    category,
    importance
  );


  /* CONTENT */

  const content =
    document.createElement("p");

  content.className =
    "admin-bot-manager-description";

  content.textContent =
    announcement.content;


  /* PUBLICATION DATE */

  const date =
    document.createElement("p");

  date.className =
    "admin-bot-manager-link-status";

  if (
    announcement.published &&
    announcement.published_at
  ) {
    date.textContent =
      `Published: ${new Date(
        announcement.published_at
      ).toLocaleString()}`;
  } else {
    date.textContent =
      "Not published";
  }


 /* ACTIONS */

const actions =
  document.createElement("div");

actions.className =
  "admin-bot-manager-actions";


const editButton =
  document.createElement("button");

editButton.type =
  "button";

editButton.className =
  "secondary-button";

editButton.textContent =
  "Edit";


editButton.addEventListener(
  "click",
  () => {
    openEditAnnouncement(
      announcement
    );
  }
);


/* DELETE */

const deleteButton =
  document.createElement("button");

deleteButton.type =
  "button";

deleteButton.className =
  "secondary-button danger-button";

deleteButton.textContent =
  "Delete";


deleteButton.addEventListener(
  "click",
  async () => {
    await deleteAnnouncement(
      announcement,
      deleteButton
    );
  }
);
  
actions.append(
  editButton,
  deleteButton
);


article.append(
  header,
  meta,
  content,
  date,
  actions
);


return article;
}

  /* ==========================================================
   DELETE ANNOUNCEMENT
   ========================================================== */

async function deleteAnnouncement(
  announcement,
  button
) {
  if (
    !window.supabaseClient ||
    !adminAuthorized
  ) {
    if (announcementManagerStatus) {
      announcementManagerStatus.textContent =
        "Administrator authorization is required.";
    }

    return;
  }


  const confirmed =
    window.confirm(
      `Permanently delete "${announcement.title}"?\n\nThis announcement will be removed completely. This cannot be undone.`
    );


  if (!confirmed) {
    return;
  }


  if (button) {
    button.disabled = true;
    button.textContent =
      "Deleting...";
  }


  if (announcementManagerStatus) {
    announcementManagerStatus.textContent =
      `Deleting "${announcement.title}"...`;
  }


  try {
    const {
      error
    } = await window.supabaseClient
      .from("announcements")
      .delete()
      .eq(
        "id",
        announcement.id
      );


    if (error) {
      throw error;
    }


    console.log(
      "Announcement deleted:",
      announcement.id
    );


    /*
     * If this announcement happened to be
     * open in the Edit panel, close it.
     */
    if (
      editingAnnouncementId ===
      announcement.id
    ) {
      closeEditAnnouncement();
    }


    await loadAdminAnnouncements();


    if (announcementManagerStatus) {
      announcementManagerStatus.textContent =
        `"${announcement.title}" was deleted permanently.`;
    }


  } catch (error) {
    console.error(
      "Unable to delete announcement:",
      error
    );


    if (announcementManagerStatus) {
      announcementManagerStatus.textContent =
        `"${announcement.title}" could not be deleted.`;
    }


    if (button) {
      button.disabled = false;
      button.textContent =
        "Delete";
    }
  }
}

  /* ==========================================================
   DELETE UPCOMING BOT
   ========================================================== */

async function deleteUpcomingBot(
  entry,
  button
) {
  if (
    !window.supabaseClient ||
    !adminAuthorized
  ) {
    if (upcomingManagerStatus) {
      upcomingManagerStatus.textContent =
        "Administrator authorization is required.";
    }

    return;
  }


  const confirmed =
    window.confirm(
      `Permanently delete "${entry.bot_name}" from the upcoming queue?\n\nThis cannot be undone.`
    );


  if (!confirmed) {
    return;
  }


  if (button) {
    button.disabled = true;
    button.textContent =
      "Deleting...";
  }


  if (upcomingManagerStatus) {
    upcomingManagerStatus.textContent =
      `Deleting "${entry.bot_name}"...`;
  }


  try {
    const {
      error
    } = await window.supabaseClient
      .from("upcoming_bots")
      .delete()
      .eq(
        "id",
        entry.id
      );


    if (error) {
      throw error;
    }


    console.log(
      "Upcoming bot deleted:",
      entry.id
    );


    if (
      editingUpcomingId === entry.id
    ) {
      closeEditUpcoming();
    }


    await loadAdminUpcomingBots();


    if (upcomingManagerStatus) {
      upcomingManagerStatus.textContent =
        `"${entry.bot_name}" was deleted permanently.`;
    }


  } catch (error) {
    console.error(
      "Unable to delete upcoming bot:",
      error
    );


    if (upcomingManagerStatus) {
      upcomingManagerStatus.textContent =
        `"${entry.bot_name}" could not be deleted.`;
    }


    if (button) {
      button.disabled = false;
      button.textContent =
        "Delete";
    }
  }
}

  /* ==========================================================
   FREE REQUEST REVIEW HELPERS
   ========================================================== */

function closeEditFreeRequest() {
  editingFreeRequestId = null;

  if (editFreeRequestForm) {
    editFreeRequestForm.reset();
  }

  if (editFreeRequestStatusMessage) {
    editFreeRequestStatusMessage.textContent = "";
  }

  if (editFreeRequestPanel) {
    editFreeRequestPanel.hidden = true;
  }
}


function openEditFreeRequest(request) {
  if (
    !editFreeRequestPanel ||
    !editFreeRequestForm
  ) {
    console.error(
      "Free Request review form elements are unavailable."
    );

    return;
  }


  editingFreeRequestId =
    request.id;


  if (editFreeRequestType) {
    editFreeRequestType.value =
      getAdminFreeRequestTypeLabel(
        request.request_type
      );
  }


  if (editFreeRequestSubmitter) {
    editFreeRequestSubmitter.value =
      request.submitter_name ||
      "Anonymous";
  }


  if (editFreeRequestDetails) {
    editFreeRequestDetails.value =
      request.request_details || "";
  }


  const statusField =
    editFreeRequestForm.elements.namedItem(
      "status"
    );


  if (statusField) {
    statusField.value =
      request.status || "submitted";
  }


  if (editFreeRequestHeading) {
    editFreeRequestHeading.textContent =
      `Reviewing ${getAdminFreeRequestTypeLabel(
        request.request_type
      )}.`;
  }


  if (editFreeRequestStatusMessage) {
    editFreeRequestStatusMessage.textContent =
      "";
  }


  editFreeRequestPanel.hidden =
    false;


  editFreeRequestPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

  /* ==========================================================
   GRAVEYARD CONVERSION HELPERS
   ========================================================== */

function closeGraveyardConversion() {
  convertingGraveyardRequestId = null;

  if (graveyardConvertForm) {
    graveyardConvertForm.reset();
  }

  if (graveyardConvertStatus) {
    graveyardConvertStatus.textContent = "";
  }

  if (graveyardSourceSubmitter) {
    graveyardSourceSubmitter.value = "";
  }

  if (graveyardSourceDetails) {
    graveyardSourceDetails.value = "";
  }

  if (graveyardConvertPanel) {
    graveyardConvertPanel.hidden = true;
  }
}


function openGraveyardConversion(request) {
  if (
    !graveyardConvertPanel ||
    !graveyardConvertForm
  ) {
    console.error(
      "Graveyard conversion form elements are unavailable."
    );

    return;
  }


  if (
    request.request_type !== "graveyard" ||
    request.status !== "accepted"
  ) {
    console.error(
      "Only accepted Graveyard requests can be converted."
    );

    return;
  }


  convertingGraveyardRequestId =
    request.id;


  graveyardConvertForm.reset();


  if (graveyardSourceSubmitter) {
    graveyardSourceSubmitter.value =
      request.submitter_name ||
      "Anonymous";
  }


  if (graveyardSourceDetails) {
    graveyardSourceDetails.value =
      request.request_details || "";
  }


  if (graveyardConvertHeading) {
    graveyardConvertHeading.textContent =
      request.submitter_name
        ? `Creating a Graveyard entry from ${request.submitter_name}'s accepted request.`
        : "Creating a Graveyard entry from an accepted anonymous request.";
  }


  if (graveyardConvertStatus) {
    graveyardConvertStatus.textContent =
      "";
  }


  graveyardConvertPanel.hidden =
    false;


  graveyardConvertPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* ==========================================================
   REVIEW COMMISSION HELPERS
   ========================================================== */

function closeReviewCommission() {
  reviewingCommissionId = null;

  if (reviewCommissionHeading) {
    reviewCommissionHeading.textContent =
      "Review the selected commission request.";
  }

  if (reviewCommissionType) {
    reviewCommissionType.value =
      "";
  }

  if (reviewCommissionSubmitter) {
    reviewCommissionSubmitter.value =
      "";
  }

  if (reviewCommissionContact) {
    reviewCommissionContact.value =
      "";
  }

  if (reviewCommissionDetails) {
    reviewCommissionDetails.value =
      "";
  }

  if (reviewCommissionReference) {
    reviewCommissionReference.value =
      "";
  }

  if (reviewCommissionGraveyard) {
    reviewCommissionGraveyard.value =
      "";
  }

  if (reviewCommissionPrivate) {
    reviewCommissionPrivate.value =
      "";
  }

  if (reviewCommissionImages) {
    reviewCommissionImages.value =
      "";
  }

  if (reviewCommissionBasePrice) {
    reviewCommissionBasePrice.value =
      "";
  }

  if (reviewCommissionAddonPrice) {
    reviewCommissionAddonPrice.value =
      "";
  }

  if (reviewCommissionTotal) {
    reviewCommissionTotal.value =
      "";
  }

  if (reviewCommissionStatus) {
    reviewCommissionStatus.value =
      "";
  }

  if (reviewCommissionPayment) {
    reviewCommissionPayment.value =
      "";
  }

  if (reviewCommissionCreated) {
    reviewCommissionCreated.value =
      "";
  }

  if (reviewCommissionStatusMessage) {
    reviewCommissionStatusMessage.textContent =
      "";
  }

  if (reviewCommissionPanel) {
    reviewCommissionPanel.hidden =
      true;
  }
}


function openReviewCommission(commission) {
  if (!reviewCommissionPanel) {
    console.error(
      "Review Commission panel is unavailable."
    );

    return;
  }


  reviewingCommissionId =
    commission.id;


  /* HEADING */

  if (reviewCommissionHeading) {
    reviewCommissionHeading.textContent =
      commission.submitter_name
        ? `Reviewing commission from ${commission.submitter_name}.`
        : "Reviewing commission request.";
  }


  /* TYPE */

  if (reviewCommissionType) {
    reviewCommissionType.value =
      getAdminCommissionTypeLabel(
        commission.commission_type
      );
  }


  /* SUBMITTER */

  if (reviewCommissionSubmitter) {
    reviewCommissionSubmitter.value =
      commission.submitter_name ||
      "Not provided";
  }


  /* CONTACT */

  if (reviewCommissionContact) {
    reviewCommissionContact.value =
      commission.contact ||
      "Not provided";
  }


  /* DETAILS */

  if (reviewCommissionDetails) {
    reviewCommissionDetails.value =
      commission.request_details ||
      "";
  }


  /* REFERENCE */

  if (reviewCommissionReference) {
    reviewCommissionReference.value =
      commission.reference_details ||
      "None provided";
  }


  /* GRAVEYARD */

  if (reviewCommissionGraveyard) {
    if (
      commission.graveyard_code ||
      commission.graveyard_title
    ) {
      reviewCommissionGraveyard.value =
        [
          commission.graveyard_code,
          commission.graveyard_title
        ]
          .filter(Boolean)
          .join(" — ");
    } else {
      reviewCommissionGraveyard.value =
        "Not a Graveyard Resurrection";
    }
  }


  /* PRIVATE USE */

  if (reviewCommissionPrivate) {
    reviewCommissionPrivate.value =
      commission.private_use
        ? "Yes"
        : "No";
  }


  /* EXTRA IMAGES */

  if (reviewCommissionImages) {
    reviewCommissionImages.value =
      String(
        commission.extra_images ?? 0
      );
  }


  /* PRICES */

  if (reviewCommissionBasePrice) {
    reviewCommissionBasePrice.value =
      formatAdminCommissionPrice(
        commission.base_price_cad
      );
  }

  if (reviewCommissionAddonPrice) {
    reviewCommissionAddonPrice.value =
      formatAdminCommissionPrice(
        commission.addon_price_cad
      );
  }

  if (reviewCommissionTotal) {
    reviewCommissionTotal.value =
      formatAdminCommissionPrice(
        commission.total_price_cad
      );
  }


  /* STATUS */

  if (reviewCommissionStatus) {
  reviewCommissionStatus.value =
    commission.status ||
    "submitted";
}


  /* PAYMENT */

 if (reviewCommissionPayment) {
  reviewCommissionPayment.value =
    commission.payment_status ||
    "unpaid";
}


  /* DATE */

  if (reviewCommissionCreated) {
    reviewCommissionCreated.value =
      formatAdminCommissionDate(
        commission.created_at
      );
  }


  /* STATUS MESSAGE */

  if (reviewCommissionStatusMessage) {
    reviewCommissionStatusMessage.textContent =
      "";
  }


  /* SHOW */

  reviewCommissionPanel.hidden =
    false;

  reviewCommissionPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}
  
  /* ==========================================================
   EDIT GRAVEYARD HELPERS
   ========================================================== */

function closeEditGraveyard() {
  editingGraveyardId = null;

  if (editGraveyardForm) {
    editGraveyardForm.reset();
  }

  if (editGraveyardCode) {
    editGraveyardCode.value = "";
  }

  if (editGraveyardStatusMessage) {
    editGraveyardStatusMessage.textContent = "";
  }

  if (editGraveyardPanel) {
    editGraveyardPanel.hidden = true;
  }
}

  function openEditGraveyard(entry) {
  if (
    !editGraveyardPanel ||
    !editGraveyardForm
  ) {
    console.error(
      "Edit Graveyard form elements are unavailable."
    );

    return;
  }


  editingGraveyardId =
    entry.id;


  editGraveyardForm.reset();


  /* REQUEST CODE */

  if (editGraveyardCode) {
    editGraveyardCode.value =
      entry.request_code || "";
  }


  /* TITLE */

  const titleField =
    editGraveyardForm.elements.namedItem(
      "title"
    );

  if (titleField) {
    titleField.value =
      entry.title || "";
  }


  /* GENDER */

  const genderField =
    editGraveyardForm.elements.namedItem(
      "gender"
    );

  if (genderField) {
    genderField.value =
      entry.gender || "";
  }


  /* STATUS */

  const statusField =
    editGraveyardForm.elements.namedItem(
      "status"
    );

  if (statusField) {
    statusField.value =
      entry.status ||
      "available";
  }


  /* NOTE */

  const noteField =
    editGraveyardForm.elements.namedItem(
      "note"
    );

  if (noteField) {
    noteField.value =
      entry.note || "";
  }


  /* HEADING */

  if (editGraveyardHeading) {
    editGraveyardHeading.textContent =
      entry.request_code
        ? `Editing ${entry.request_code} — ${entry.title || "Untitled Request"}.`
        : "Editing Request Graveyard entry.";
  }


  /* STATUS MESSAGE */

  if (editGraveyardStatusMessage) {
    editGraveyardStatusMessage.textContent =
      "";
  }


  /* SHOW */

  editGraveyardPanel.hidden =
    false;


  editGraveyardPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

  /* ==========================================================
   ADMIN GRAVEYARD CARD
   ========================================================== */

function createAdminGraveyardCard(entry) {
  const article =
    document.createElement("article");

  article.className =
    "admin-bot-manager-card admin-graveyard-card";


  /* HEADER */

  const header =
    document.createElement("div");

  header.className =
    "admin-bot-manager-header";


  const code =
    document.createElement("h3");

  code.className =
    "admin-bot-manager-name";

  code.textContent =
    entry.request_code ||
    "Unknown RG Number";


  const status =
    document.createElement("span");

  status.className =
    entry.status === "available"
      ? "admin-bot-publication-status is-published"
      : "admin-bot-publication-status is-draft";

  status.textContent =
    getAdminGraveyardStatusLabel(
      entry.status
    );


  header.append(
    code,
    status
  );


  /* TITLE */

  const title =
    document.createElement("p");

  title.className =
    "admin-bot-manager-description";

  title.textContent =
    entry.title ||
    "Untitled Graveyard Request";


  /* META */

  const meta =
    document.createElement("div");

  meta.className =
    "admin-bot-manager-meta";


  const gender =
    document.createElement("span");

  gender.textContent =
    entry.gender ||
    "Gender not specified";


  meta.append(
    gender
  );


  /* NOTE */

  const note =
    document.createElement("p");

  note.className =
    "admin-bot-manager-link-status";

  note.textContent =
    entry.note
      ? `Note: ${entry.note}`
      : "No special note";


  /* ACTIONS */

  const actions =
    document.createElement("div");

  actions.className =
    "admin-bot-manager-actions";


  const editButton =
    document.createElement("button");

  editButton.type =
    "button";

  editButton.className =
    "secondary-button";

  editButton.textContent =
    "Edit";


  editButton.addEventListener(
    "click",
    () => {
      openEditGraveyard(
        entry
      );
    }
  );


  actions.append(
    editButton
  );


  article.append(
    header,
    title,
    meta,
    note,
    actions
  );


  return article;
}

  /* ==========================================================
   RENDER ADMIN GRAVEYARD
   ========================================================== */

function renderAdminGraveyardEntries() {
  if (
    !graveyardList ||
    !graveyardManagerStatus
  ) {
    return;
  }


  const searchTerm =
    String(
      graveyardSearch?.value || ""
    )
      .trim()
      .toLowerCase();


  const selectedStatus =
    graveyardStatusFilter?.value ||
    "all";


  const filteredEntries =
    adminGraveyardEntries.filter(
      (entry) => {

        const searchableText = [
          entry.request_code,
          entry.title,
          entry.gender,
          entry.note,
          getAdminGraveyardStatusLabel(
            entry.status
          )
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();


        const matchesSearch =
          !searchTerm ||
          searchableText.includes(
            searchTerm
          );


        const matchesStatus =
          selectedStatus === "all" ||
          entry.status ===
            selectedStatus;


        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );


  graveyardList.replaceChildren();


  if (
    adminGraveyardEntries.length === 0
  ) {
    graveyardManagerStatus.textContent =
      "There are no Request Graveyard entries.";

    return;
  }


  if (filteredEntries.length === 0) {
    graveyardManagerStatus.textContent =
      "No Graveyard entries match those filters.";

    return;
  }


  filteredEntries.forEach(
    (entry) => {
      graveyardList.append(
        createAdminGraveyardCard(
          entry
        )
      );
    }
  );


  const filtersActive =
    Boolean(searchTerm) ||
    selectedStatus !== "all";


  if (filtersActive) {
    graveyardManagerStatus.textContent =
      `${filteredEntries.length} of ${adminGraveyardEntries.length} Graveyard entries shown.`;
  } else {
    graveyardManagerStatus.textContent =
      adminGraveyardEntries.length === 1
        ? "1 Graveyard entry."
        : `${adminGraveyardEntries.length} Graveyard entries.`;
  }
}

  /* ==========================================================
   ADMIN FREE REQUEST CARD
   ========================================================== */

function createAdminFreeRequestCard(request) {
  const article =
    document.createElement("article");

  article.className =
    "admin-bot-manager-card admin-free-request-card";


  /* HEADER */

  const header =
    document.createElement("div");

  header.className =
    "admin-bot-manager-header";


  const title =
    document.createElement("h3");

  title.className =
    "admin-bot-manager-name";

  title.textContent =
    getAdminFreeRequestTypeLabel(
      request.request_type
    );


  const status =
    document.createElement("span");

  status.className =
    request.status === "accepted" ||
    request.status === "created"
      ? "admin-bot-publication-status is-published"
      : "admin-bot-publication-status is-draft";

  status.textContent =
    getAdminFreeRequestStatusLabel(
      request.status
    );


  header.append(
    title,
    status
  );


  /* SUBMITTER */

  const submitter =
    document.createElement("p");

  submitter.className =
    "admin-bot-manager-link-status";

  submitter.textContent =
    request.submitter_name
      ? `Submitted by: ${request.submitter_name}`
      : "Submitted anonymously";


  /* DETAILS */

  const details =
    document.createElement("p");

  details.className =
    "admin-bot-manager-description";

  details.textContent =
    request.request_details;


  /* DATE */

  const date =
    document.createElement("p");

  date.className =
    "admin-bot-manager-slug";


  if (request.created_at) {
    date.textContent =
      `Submitted: ${new Date(
        request.created_at
      ).toLocaleString()}`;
  } else {
    date.textContent =
      "Submission date unavailable";
  }


 const actions =
  document.createElement("div");

actions.className =
  "admin-bot-manager-actions";


/* REVIEW */

const reviewButton =
  document.createElement("button");

reviewButton.type =
  "button";

reviewButton.className =
  "secondary-button";

reviewButton.textContent =
  "Review";


reviewButton.addEventListener(
  "click",
  () => {
    openEditFreeRequest(
      request
    );
  }
);


/* DELETE */

const deleteButton =
  document.createElement("button");

deleteButton.type =
  "button";

deleteButton.className =
  "secondary-button danger-button";

deleteButton.textContent =
  "Delete";


deleteButton.addEventListener(
  "click",
  async () => {
    await deleteFreeRequest(
      request,
      deleteButton
    );
  }
);


/* ADD TO REQUEST GRAVEYARD */

if (
  request.request_type === "graveyard" &&
  request.status === "accepted"
) {
  const graveyardButton =
    document.createElement("button");

  graveyardButton.type =
    "button";

  graveyardButton.className =
    "primary-button";

  graveyardButton.textContent =
    "Add to Request Graveyard";

  graveyardButton.addEventListener(
    "click",
    () => {
      openGraveyardConversion(
        request
      );
    }
  );


  actions.append(
    graveyardButton
  );
}


actions.append(
  reviewButton,
  deleteButton
);


article.append(
  header,
  submitter,
  details,
  date,
  actions
);


return article;
}

  /* ==========================================================
   DELETE FREE REQUEST
   ========================================================== */

async function deleteFreeRequest(
  request,
  button
) {
  if (
    !window.supabaseClient ||
    !adminAuthorized
  ) {
    if (freeRequestManagerStatus) {
      freeRequestManagerStatus.textContent =
        "Administrator authorization is required.";
    }

    return;
  }


  const requestLabel =
    getAdminFreeRequestTypeLabel(
      request.request_type
    );


  const submitterLabel =
    request.submitter_name ||
    "Anonymous";


  const confirmed =
    window.confirm(
      `Permanently delete this ${requestLabel} from ${submitterLabel}?\n\nThis cannot be undone.`
    );


  if (!confirmed) {
    return;
  }


  if (button) {
    button.disabled = true;

    button.textContent =
      "Deleting...";
  }


  if (freeRequestManagerStatus) {
    freeRequestManagerStatus.textContent =
      `Deleting ${requestLabel}...`;
  }


  try {
    const {
      error
    } = await window.supabaseClient
      .from("free_requests")
      .delete()
      .eq(
        "id",
        request.id
      );


    if (error) {
      throw error;
    }


    console.log(
      "Free request deleted:",
      request.id
    );


    if (
      editingFreeRequestId ===
      request.id
    ) {
      closeEditFreeRequest();
    }


    await loadAdminFreeRequests();


    if (freeRequestManagerStatus) {
      freeRequestManagerStatus.textContent =
        `${requestLabel} from ${submitterLabel} was deleted permanently.`;
    }


  } catch (error) {
    console.error(
      "Unable to delete free request:",
      error
    );


    if (freeRequestManagerStatus) {
      freeRequestManagerStatus.textContent =
        "The free request could not be deleted.";
    }


    if (button) {
      button.disabled = false;

      button.textContent =
        "Delete";
    }
  }
}

  /* ==========================================================
   RENDER FREE REQUESTS
   ========================================================== */

function renderAdminFreeRequests() {
  if (
    !freeRequestList ||
    !freeRequestManagerStatus
  ) {
    return;
  }


  const selectedType =
    freeRequestTypeFilter?.value || "all";

  const selectedStatus =
    freeRequestStatusFilter?.value || "all";


  const filteredRequests =
    adminFreeRequests.filter(
      (request) => {
        const matchesType =
          selectedType === "all" ||
          request.request_type ===
            selectedType;

        const matchesStatus =
          selectedStatus === "all" ||
          request.status ===
            selectedStatus;

        return (
          matchesType &&
          matchesStatus
        );
      }
    );


  freeRequestList.replaceChildren();


  if (adminFreeRequests.length === 0) {
    freeRequestManagerStatus.textContent =
      "There are no free request entries yet.";

    return;
  }


  if (filteredRequests.length === 0) {
    freeRequestManagerStatus.textContent =
      "No free requests match the selected filters.";

    return;
  }


  filteredRequests.forEach(
    (request) => {
      freeRequestList.append(
        createAdminFreeRequestCard(
          request
        )
      );
    }
  );


  freeRequestManagerStatus.textContent =
    filteredRequests.length === 1
      ? "1 free request entry."
      : `${filteredRequests.length} free request entries.`;
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
   LOAD BOT / SERIES ASSIGNMENTS
   ========================================================== */

async function loadAdminAssignments() {
  if (
    !assignmentBotSelect ||
    !assignmentSeriesSelect ||
    !assignmentList ||
    !assignmentManagerStatus
  ) {
    return;
  }


  if (
    !window.supabaseClient ||
    !adminAuthorized
  ) {
    assignmentList.replaceChildren();

    assignmentManagerStatus.textContent =
      "Administrator authorization is required.";

    return;
  }


  assignmentManagerStatus.textContent =
    "Loading assignments...";


  if (assignmentStatus) {
    assignmentStatus.textContent = "";
  }


  try {
    /*
     * Load every bot, including drafts.
     */
    const {
      data: botData,
      error: botError
    } = await window.supabaseClient
      .from("bots")
      .select(
        "id, name, slug, published"
      )
      .order("name", {
        ascending: true
      });


    if (botError) {
      throw botError;
    }


    /*
     * Load every series, including drafts.
     */
    const {
      data: seriesData,
      error: seriesError
    } = await window.supabaseClient
      .from("series")
      .select(
        "id, name, slug, published, sort_order"
      )
      .order("sort_order", {
        ascending: true
      })
      .order("name", {
        ascending: true
      });


    if (seriesError) {
      throw seriesError;
    }


    /*
     * Load current bot_series relationships.
     */
    const {
      data: relationshipData,
      error: relationshipError
    } = await window.supabaseClient
      .from("bot_series")
      .select(`
        id,
        bot_id,
        series_id,
        sort_order,
        bots (
          id,
          name,
          slug,
          published
        ),
        series (
          id,
          name,
          slug,
          published
        )
      `)
      .order("sort_order", {
        ascending: true
      });


    if (relationshipError) {
      throw relationshipError;
    }


    const bots =
      Array.isArray(botData)
        ? botData
        : [];

    const seriesList =
      Array.isArray(seriesData)
        ? seriesData
        : [];

    const relationships =
      Array.isArray(relationshipData)
        ? relationshipData
        : [];


    console.log(
      "Assignment bots received:",
      bots
    );

    console.log(
      "Assignment series received:",
      seriesList
    );

    console.log(
      "Bot-series assignments received:",
      relationships
    );


    /* DROPDOWNS */

    populateAssignmentDropdowns(
      bots,
      seriesList
    );


    /* CURRENT ASSIGNMENTS */

    assignmentList.replaceChildren();


    if (relationships.length === 0) {
      assignmentManagerStatus.textContent =
        "There are no bot-to-series assignments yet.";

      return;
    }


    relationships.forEach(
      (relationship) => {
        assignmentList.append(
          createAdminAssignmentCard(
            relationship
          )
        );
      }
    );


    assignmentManagerStatus.textContent =
      relationships.length === 1
        ? "1 bot-to-series assignment."
        : `${relationships.length} bot-to-series assignments.`;


  } catch (error) {
    console.error(
      "Unable to load bot-series assignments:",
      error
    );

    assignmentList.replaceChildren();

    assignmentManagerStatus.textContent =
      "Unable to load bot-to-series assignments.";


    if (assignmentBotSelect) {
      assignmentBotSelect.disabled = true;
    }

    if (assignmentSeriesSelect) {
      assignmentSeriesSelect.disabled = true;
    }

    if (assignmentSubmitButton) {
      assignmentSubmitButton.disabled = true;
    }
  }
}

  /* ==========================================================
   LOAD UPCOMING BOTS
   ========================================================== */

async function loadAdminUpcomingBots() {
  if (
    !upcomingList ||
    !upcomingManagerStatus
  ) {
    return;
  }


  if (
    !window.supabaseClient ||
    !adminAuthorized
  ) {
    upcomingList.replaceChildren();

    upcomingManagerStatus.textContent =
      "Administrator authorization is required.";

    if (upcomingRefreshButton) {
      upcomingRefreshButton.disabled = true;
    }

    return;
  }


  upcomingManagerStatus.textContent =
    "Loading upcoming bots...";


  upcomingList.replaceChildren();


  if (upcomingRefreshButton) {
    upcomingRefreshButton.disabled = true;
  }


  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("upcoming_bots")
      .select(`
        id,
        bot_name,
        bot_type,
        expected_post_date,
        status,
        series_name,
        notes,
        sort_order,
        public_visible,
        created_at,
        updated_at
      `)
      .order(
        "sort_order",
        {
          ascending: true
        }
      )
      .order(
        "created_at",
        {
          ascending: true
        }
      );


    if (error) {
      throw error;
    }


    const upcomingBots =
      Array.isArray(data)
        ? data
        : [];


    console.log(
      "Admin upcoming bots received:",
      upcomingBots
    );


    upcomingList.replaceChildren();


    if (upcomingBots.length === 0) {
      upcomingManagerStatus.textContent =
        "There are no upcoming bot entries yet.";

      return;
    }


    upcomingBots.forEach(
      (entry) => {
        upcomingList.append(
          createAdminUpcomingCard(
            entry
          )
        );
      }
    );


    upcomingManagerStatus.textContent =
      upcomingBots.length === 1
        ? "1 upcoming bot entry."
        : `${upcomingBots.length} upcoming bot entries.`;


  } catch (error) {
    console.error(
      "Unable to load admin upcoming bots:",
      error
    );

    upcomingList.replaceChildren();

    upcomingManagerStatus.textContent =
      "Unable to load upcoming bot entries.";

  } finally {
    if (upcomingRefreshButton) {
      upcomingRefreshButton.disabled = false;
    }
  }
}

  
  /* ==========================================================
   LOAD ANNOUNCEMENTS
   ========================================================== */

async function loadAdminAnnouncements() {
  if (
    !announcementList ||
    !announcementManagerStatus
  ) {
    return;
  }


  if (
    !window.supabaseClient ||
    !adminAuthorized
  ) {
    announcementList.replaceChildren();

    announcementManagerStatus.textContent =
      "Administrator authorization is required.";

    if (announcementRefreshButton) {
      announcementRefreshButton.disabled = true;
    }

    return;
  }


  announcementManagerStatus.textContent =
    "Loading announcements...";

  announcementList.replaceChildren();


  if (announcementRefreshButton) {
    announcementRefreshButton.disabled = true;
  }


  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("announcements")
      .select(`
        id,
        title,
        content,
        category,
        important,
        published,
        published_at,
        created_at,
        updated_at
      `)
      .order(
        "created_at",
        {
          ascending: false
        }
      );


    if (error) {
      throw error;
    }


    const announcements =
      Array.isArray(data)
        ? data
        : [];


    console.log(
      "Admin announcements received:",
      announcements
    );


    announcementList.replaceChildren();


    if (announcements.length === 0) {
      announcementManagerStatus.textContent =
        "There are no announcement entries yet.";

      return;
    }


    announcements.forEach(
      (announcement) => {
        announcementList.append(
          createAdminAnnouncementCard(
            announcement
          )
        );
      }
    );


    announcementManagerStatus.textContent =
      announcements.length === 1
        ? "1 announcement entry."
        : `${announcements.length} announcement entries.`;


  } catch (error) {
    console.error(
      "Unable to load admin announcements:",
      error
    );

    announcementList.replaceChildren();

    announcementManagerStatus.textContent =
      "Unable to load announcement entries.";

  } finally {
    if (announcementRefreshButton) {
      announcementRefreshButton.disabled = false;
    }
  }
}

/* ==========================================================
   ADMIN COMMISSION CARD
   ========================================================== */

function createAdminCommissionCard(commission) {
  const article =
    document.createElement("article");

  article.className =
    "admin-bot-manager-card admin-commission-card";


  /* HEADER */

  const header =
    document.createElement("div");

  header.className =
    "admin-bot-manager-header";


  const title =
    document.createElement("h3");

  title.className =
    "admin-bot-manager-name";

  title.textContent =
    commission.submitter_name ||
    "Commission Request";


  const status =
    document.createElement("span");

  status.className =
    commission.status === "accepted" ||
    commission.status === "in_progress" ||
    commission.status === "completed"
      ? "admin-bot-publication-status is-published"
      : "admin-bot-publication-status is-draft";

  status.textContent =
    getAdminCommissionStatusLabel(
      commission.status
    );


  header.append(
    title,
    status
  );


  /* META */

  const meta =
    document.createElement("div");

  meta.className =
    "admin-bot-manager-meta";


  const type =
    document.createElement("span");

  type.textContent =
    getAdminCommissionTypeLabel(
      commission.commission_type
    );


  const payment =
    document.createElement("span");

  payment.textContent =
    getAdminCommissionPaymentLabel(
      commission.payment_status
    );


  const total =
    document.createElement("span");

  total.textContent =
    formatAdminCommissionPrice(
      commission.total_price_cad
    );


  meta.append(
    type,
    payment,
    total
  );


  /* GRAVEYARD */

  const graveyard =
    document.createElement("p");

  graveyard.className =
    "admin-bot-manager-link-status";

  if (
    commission.graveyard_code ||
    commission.graveyard_title
  ) {
    graveyard.textContent =
      [
        commission.graveyard_code,
        commission.graveyard_title
      ]
        .filter(Boolean)
        .join(" — ");
  } else {
    graveyard.textContent =
      "Not linked to the Request Graveyard";
  }


  /* CONTACT */

  const contact =
    document.createElement("p");

  contact.className =
    "admin-bot-manager-link-status";

  contact.textContent =
    commission.contact
      ? `Contact: ${commission.contact}`
      : "No contact information";


  /* DETAILS */

  const details =
    document.createElement("p");

  details.className =
    "admin-bot-manager-description";

  details.textContent =
    commission.request_details ||
    "No commission details provided.";


  /* DATE */

  const date =
    document.createElement("p");

  date.className =
    "admin-bot-manager-slug";

  date.textContent =
    `Submitted: ${formatAdminCommissionDate(
      commission.created_at
    )}`;


  /* ACTIONS */

  const actions =
    document.createElement("div");

  actions.className =
    "admin-bot-manager-actions";


  const reviewButton =
    document.createElement("button");

  reviewButton.type =
    "button";

  reviewButton.className =
    "secondary-button";

  reviewButton.textContent =
    "Review";


  reviewButton.addEventListener(
    "click",
    () => {
      openReviewCommission(
        commission
      );
    }
  );


  actions.append(
    reviewButton
  );


  article.append(
    header,
    meta,
    graveyard,
    contact,
    details,
    date,
    actions
  );


  return article;
}

  /* ==========================================================
   COMMISSION STATUS FILTER OPTIONS
   ========================================================== */

function populateAdminCommissionStatusFilter() {
  if (!commissionStatusFilter) {
    return;
  }


  const currentValue =
    commissionStatusFilter.value ||
    "all";


  const statuses =
    [
      ...new Set(
        adminCommissionRequests
          .map(
            (commission) =>
              commission.status
          )
          .filter(Boolean)
      )
    ];


  commissionStatusFilter.replaceChildren();


  const allOption =
    document.createElement("option");

  allOption.value =
    "all";

  allOption.textContent =
    "All Statuses";

  commissionStatusFilter.append(
    allOption
  );


  statuses.forEach(
    (statusValue) => {
      const option =
        document.createElement("option");

      option.value =
        statusValue;

      option.textContent =
        getAdminCommissionStatusLabel(
          statusValue
        );

      commissionStatusFilter.append(
        option
      );
    }
  );


  const stillExists =
    Array.from(
      commissionStatusFilter.options
    ).some(
      (option) =>
        option.value === currentValue
    );


  commissionStatusFilter.value =
    stillExists
      ? currentValue
      : "all";
}

  /* ==========================================================
   RENDER ADMIN COMMISSIONS
   ========================================================== */

function renderAdminCommissions() {
  if (
    !commissionList ||
    !commissionManagerStatus
  ) {
    return;
  }


  const searchTerm =
    String(
      commissionSearch?.value || ""
    )
      .trim()
      .toLowerCase();


  const selectedType =
    commissionTypeFilter?.value ||
    "all";


  const selectedStatus =
    commissionStatusFilter?.value ||
    "all";


  const selectedPayment =
    commissionPaymentFilter?.value ||
    "all";


  const filteredCommissions =
    adminCommissionRequests.filter(
      (commission) => {

        const searchableText = [
          commission.submitter_name,
          commission.contact,
          commission.request_title,
          commission.request_details,
          commission.reference_details,
          commission.graveyard_code,
          commission.graveyard_title,
          getAdminCommissionTypeLabel(
            commission.commission_type
          ),
          getAdminCommissionStatusLabel(
            commission.status
          ),
          getAdminCommissionPaymentLabel(
            commission.payment_status
          )
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();


        const matchesSearch =
          !searchTerm ||
          searchableText.includes(
            searchTerm
          );


        const matchesType =
          selectedType === "all" ||
          commission.commission_type ===
            selectedType;


        const matchesStatus =
          selectedStatus === "all" ||
          commission.status ===
            selectedStatus;


        const matchesPayment =
          selectedPayment === "all" ||
          commission.payment_status ===
            selectedPayment;


        return (
          matchesSearch &&
          matchesType &&
          matchesStatus &&
          matchesPayment
        );
      }
    );


  commissionList.replaceChildren();


  if (
    adminCommissionRequests.length === 0
  ) {
    commissionManagerStatus.textContent =
      "There are no commission requests yet.";

    return;
  }


  if (
    filteredCommissions.length === 0
  ) {
    commissionManagerStatus.textContent =
      "No commission requests match those filters.";

    return;
  }


  filteredCommissions.forEach(
    (commission) => {
      commissionList.append(
        createAdminCommissionCard(
          commission
        )
      );
    }
  );


  if (
    filteredCommissions.length ===
    adminCommissionRequests.length
  ) {
    commissionManagerStatus.textContent =
      adminCommissionRequests.length === 1
        ? "1 commission request."
        : `${adminCommissionRequests.length} commission requests.`;
  } else {
    commissionManagerStatus.textContent =
      `Showing ${filteredCommissions.length} of ${adminCommissionRequests.length} commission requests.`;
  }
}

  /* ==========================================================
   LOAD ADMIN COMMISSIONS
   ========================================================== */

async function loadAdminCommissions() {
  if (
    !commissionList ||
    !commissionManagerStatus
  ) {
    return;
  }


  /* AUTHORIZATION */

  if (
    !window.supabaseClient ||
    !adminAuthorized
  ) {
    adminCommissionRequests = [];

    commissionList.replaceChildren();

    commissionManagerStatus.textContent =
      "Administrator authorization is required.";


    if (commissionRefreshButton) {
      commissionRefreshButton.disabled =
        true;
    }

    if (commissionSearch) {
      commissionSearch.disabled =
        true;
    }

    if (commissionTypeFilter) {
      commissionTypeFilter.disabled =
        true;
    }

    if (commissionStatusFilter) {
      commissionStatusFilter.disabled =
        true;
    }

    if (commissionPaymentFilter) {
      commissionPaymentFilter.disabled =
        true;
    }

    return;
  }


  /* LOADING */

  commissionManagerStatus.textContent =
    "Loading commission requests...";

  commissionList.replaceChildren();


  if (commissionRefreshButton) {
    commissionRefreshButton.disabled =
      true;
  }


  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("commission_requests")
      .select(`
        id,
        user_id,
        commission_type,
        request_title,
        request_details,
        submitter_name,
        contact,
        reference_details,
        graveyard_entry_id,
        graveyard_code,
        graveyard_title,
        private_use,
        extra_images,
        base_price_cad,
        addon_price_cad,
        total_price_cad,
        status,
        payment_status,
        created_at,
        updated_at
      `)
      .order(
        "created_at",
        {
          ascending: false
        }
      );


    if (error) {
      throw error;
    }


    adminCommissionRequests =
      Array.isArray(data)
        ? data
        : [];


    console.log(
      "Admin commissions received:",
      adminCommissionRequests
    );


    /* ENABLE CONTROLS */

    if (commissionSearch) {
      commissionSearch.disabled =
        false;
    }

    if (commissionTypeFilter) {
      commissionTypeFilter.disabled =
        false;
    }

    if (commissionStatusFilter) {
      commissionStatusFilter.disabled =
        false;
    }

    if (commissionPaymentFilter) {
      commissionPaymentFilter.disabled =
        false;
    }


    populateAdminCommissionStatusFilter();

    renderAdminCommissions();


  } catch (error) {
    console.error(
      "Unable to load admin commissions:",
      error
    );


    adminCommissionRequests = [];

    commissionList.replaceChildren();

    commissionManagerStatus.textContent =
      "Unable to load commission requests.";


    if (commissionSearch) {
      commissionSearch.disabled =
        true;
    }

    if (commissionTypeFilter) {
      commissionTypeFilter.disabled =
        true;
    }

    if (commissionStatusFilter) {
      commissionStatusFilter.disabled =
        true;
    }

    if (commissionPaymentFilter) {
      commissionPaymentFilter.disabled =
        true;
    }


  } finally {
    if (commissionRefreshButton) {
      commissionRefreshButton.disabled =
        false;
    }
  }
}
  
/* ==========================================================
   LOAD ADMIN GRAVEYARD
   ========================================================== */

async function loadAdminGraveyardEntries() {
  if (
    !graveyardList ||
    !graveyardManagerStatus
  ) {
    return;
  }


  if (
    !window.supabaseClient ||
    !adminAuthorized
  ) {
    adminGraveyardEntries = [];

    graveyardList.replaceChildren();

    graveyardManagerStatus.textContent =
      "Administrator authorization is required.";


    if (graveyardRefreshButton) {
      graveyardRefreshButton.disabled =
        true;
    }


    if (graveyardSearch) {
      graveyardSearch.disabled =
        true;
    }


    if (graveyardStatusFilter) {
      graveyardStatusFilter.disabled =
        true;
    }


    return;
  }


  graveyardManagerStatus.textContent =
    "Loading Request Graveyard...";

  graveyardList.replaceChildren();


  if (graveyardRefreshButton) {
    graveyardRefreshButton.disabled =
      true;
  }


  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("graveyard_entries")
      .select(`
        id,
        request_number,
        request_code,
        gender,
        title,
        status,
        note,
        created_at,
        updated_at
      `)
      .order(
        "request_number",
        {
          ascending: true
        }
      );


    if (error) {
      throw error;
    }


    adminGraveyardEntries =
      Array.isArray(data)
        ? data
        : [];


    console.log(
      "Admin Graveyard entries received:",
      adminGraveyardEntries
    );


    if (graveyardSearch) {
      graveyardSearch.disabled =
        false;
    }


    if (graveyardStatusFilter) {
      graveyardStatusFilter.disabled =
        false;
    }


    renderAdminGraveyardEntries();


  } catch (error) {
    console.error(
      "Unable to load admin Graveyard entries:",
      error
    );


    adminGraveyardEntries = [];

    graveyardList.replaceChildren();

    graveyardManagerStatus.textContent =
      "Unable to load Request Graveyard entries.";


    if (graveyardSearch) {
      graveyardSearch.disabled =
        true;
    }


    if (graveyardStatusFilter) {
      graveyardStatusFilter.disabled =
        true;
    }


  } finally {
    if (graveyardRefreshButton) {
      graveyardRefreshButton.disabled =
        false;
    }
  }
}
  
  /* ==========================================================
   LOAD FREE REQUESTS
   ========================================================== */

async function loadAdminFreeRequests() {
  if (
    !freeRequestList ||
    !freeRequestManagerStatus
  ) {
    return;
  }


  if (
    !window.supabaseClient ||
    !adminAuthorized
  ) {
    adminFreeRequests = [];

    freeRequestList.replaceChildren();

    freeRequestManagerStatus.textContent =
      "Administrator authorization is required.";

    if (freeRequestRefreshButton) {
      freeRequestRefreshButton.disabled = true;
    }

    if (freeRequestTypeFilter) {
      freeRequestTypeFilter.disabled = true;
    }

    if (freeRequestStatusFilter) {
      freeRequestStatusFilter.disabled = true;
    }

    return;
  }


  freeRequestManagerStatus.textContent =
    "Loading free requests...";

  freeRequestList.replaceChildren();


  if (freeRequestRefreshButton) {
    freeRequestRefreshButton.disabled = true;
  }


  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("free_requests")
      .select(`
        id,
        user_id,
        request_type,
        submitter_name,
        request_details,
        status,
        created_at,
        updated_at
      `)
      .order(
        "created_at",
        {
          ascending: false
        }
      );


    if (error) {
      throw error;
    }


    adminFreeRequests =
      Array.isArray(data)
        ? data
        : [];


    console.log(
      "Admin free requests received:",
      adminFreeRequests
    );


    if (freeRequestTypeFilter) {
      freeRequestTypeFilter.disabled =
        false;
    }

    if (freeRequestStatusFilter) {
      freeRequestStatusFilter.disabled =
        false;
    }


    renderAdminFreeRequests();


  } catch (error) {
    console.error(
      "Unable to load admin free requests:",
      error
    );


    adminFreeRequests = [];

    freeRequestList.replaceChildren();

    freeRequestManagerStatus.textContent =
      "Unable to load free request entries.";


    if (freeRequestTypeFilter) {
      freeRequestTypeFilter.disabled =
        true;
    }

    if (freeRequestStatusFilter) {
      freeRequestStatusFilter.disabled =
        true;
    }


  } finally {
    if (freeRequestRefreshButton) {
      freeRequestRefreshButton.disabled =
        false;
    }
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
   CREATE ANNOUNCEMENT
   ========================================================== */

if (announcementForm) {
  announcementForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();


      /* AUTH */

      if (
        !window.supabaseClient ||
        !adminAuthorized
      ) {
        if (announcementStatus) {
          announcementStatus.textContent =
            "Administrator authorization is required.";
        }

        return;
      }


      /* READ FORM */

      const formData =
        new FormData(announcementForm);


      const title =
        String(
          formData.get("title") || ""
        ).trim();


      const content =
        String(
          formData.get("content") || ""
        ).trim();


      const category =
        String(
          formData.get("category") || "general"
        ).trim();


      const important =
        formData.get("important") === "on";


      const published =
        formData.get("published") === "on";


      /* VALIDATE TITLE */

      if (!title) {
        if (announcementStatus) {
          announcementStatus.textContent =
            "Announcement title is required.";
        }

        return;
      }


      /* VALIDATE CONTENT */

      if (!content) {
        if (announcementStatus) {
          announcementStatus.textContent =
            "Announcement content is required.";
        }

        return;
      }


      /* VALIDATE CATEGORY */

      const allowedCategories = [
        "general",
        "website",
        "commissions",
        "membership",
        "requests",
        "masterlist",
        "schedule"
      ];


      if (
        !allowedCategories.includes(category)
      ) {
        if (announcementStatus) {
          announcementStatus.textContent =
            "Choose a valid announcement category.";
        }

        return;
      }


      /* BUILD RECORD */

      const newAnnouncement = {
        title,
        content,
        category,
        important,
        published,

        published_at:
          published
            ? new Date().toISOString()
            : null
      };


      /* SAVE */

      setAnnouncementFormLoading(true);


      if (announcementStatus) {
        announcementStatus.textContent =
          published
            ? "Publishing announcement..."
            : "Saving announcement draft...";
      }


      try {
        const {
          data,
          error
        } = await window.supabaseClient
          .from("announcements")
          .insert(newAnnouncement)
          .select(`
            id,
            title,
            content,
            category,
            important,
            published,
            published_at
          `)
          .single();


        if (error) {
          console.error(
            "Unable to save announcement:",
            error
          );


          if (
            error.code === "23514" ||
            error.code === "23502"
          ) {
            if (announcementStatus) {
              announcementStatus.textContent =
                "One of the announcement values does not meet the database rules.";
            }

            return;
          }


          if (announcementStatus) {
            announcementStatus.textContent =
              "The announcement could not be saved.";
          }

          return;
        }


        console.log(
          "Announcement saved successfully:",
          data
        );


        announcementForm.reset();


        if (announcementStatus) {
          announcementStatus.textContent =
            data.published
              ? `"${data.title}" was published successfully.`
              : `"${data.title}" was saved as a private draft.`;
        }


        await loadAdminAnnouncements();


      } catch (error) {
        console.error(
          "Unexpected error while saving announcement:",
          error
        );


        if (announcementStatus) {
          announcementStatus.textContent =
            "The announcement could not be saved right now.";
        }


      } finally {
        setAnnouncementFormLoading(false);
      }
    }
  );
}

  /* ==========================================================
   CREATE UPCOMING BOT
   ========================================================== */

if (upcomingForm) {
  upcomingForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();


      /* AUTH */

      if (
        !window.supabaseClient ||
        !adminAuthorized
      ) {
        if (upcomingStatusMessage) {
          upcomingStatusMessage.textContent =
            "Administrator authorization is required.";
        }

        return;
      }


      /* READ FORM */

      const formData =
        new FormData(upcomingForm);


      const botName =
        String(
          formData.get("bot_name") || ""
        ).trim();


      const botType =
        String(
          formData.get("bot_type") || ""
        ).trim();


      const expectedPostDate =
        String(
          formData.get("expected_post_date") || ""
        ).trim();


      const status =
        String(
          formData.get("status") || "planned"
        ).trim();


      const seriesName =
        String(
          formData.get("series_name") || ""
        ).trim();


      const notes =
        String(
          formData.get("notes") || ""
        ).trim();


      const sortOrderRaw =
        Number(
          formData.get("sort_order")
        );


      const publicVisible =
        formData.get("public_visible") === "on";


      /* VALIDATE NAME */

      if (!botName) {
        if (upcomingStatusMessage) {
          upcomingStatusMessage.textContent =
            "Bot name is required.";
        }

        return;
      }


      /* VALIDATE TYPE */

      const allowedTypes = [
        "",
        "original",
        "alt",
        "commission",
        "media_inspired",
        "remaster"
      ];


      if (!allowedTypes.includes(botType)) {
        if (upcomingStatusMessage) {
          upcomingStatusMessage.textContent =
            "Choose a valid bot type.";
        }

        return;
      }


      /* VALIDATE STATUS */

      const allowedStatuses = [
        "planned",
        "writing",
        "in_progress",
        "ready",
        "scheduled",
        "delayed",
        "posted",
        "cancelled"
      ];


      if (!allowedStatuses.includes(status)) {
        if (upcomingStatusMessage) {
          upcomingStatusMessage.textContent =
            "Choose a valid upcoming-bot status.";
        }

        return;
      }


      /* VALIDATE SORT ORDER */

      if (
        !Number.isInteger(sortOrderRaw) ||
        sortOrderRaw < 0
      ) {
        if (upcomingStatusMessage) {
          upcomingStatusMessage.textContent =
            "Sort order must be 0 or greater.";
        }

        return;
      }


      /* BUILD RECORD */

      const newUpcomingBot = {
        bot_name: botName,

        bot_type:
          botType || null,

        expected_post_date:
          expectedPostDate || null,

        status,

        series_name:
          seriesName || null,

        notes:
          notes || null,

        sort_order:
          sortOrderRaw,

        public_visible:
          publicVisible
      };


      /* SAVE */

      setUpcomingFormLoading(true);


      if (upcomingStatusMessage) {
        upcomingStatusMessage.textContent =
          publicVisible
            ? "Saving public upcoming bot..."
            : "Saving private upcoming bot...";
      }


      try {
        const {
          data,
          error
        } = await window.supabaseClient
          .from("upcoming_bots")
          .insert(newUpcomingBot)
          .select(`
            id,
            bot_name,
            bot_type,
            expected_post_date,
            status,
            series_name,
            notes,
            sort_order,
            public_visible
          `)
          .single();


        if (error) {
          console.error(
            "Unable to save upcoming bot:",
            error
          );


          if (
            error.code === "23514" ||
            error.code === "23502"
          ) {
            if (upcomingStatusMessage) {
              upcomingStatusMessage.textContent =
                "One of the upcoming-bot values does not meet the database rules.";
            }

            return;
          }


          if (upcomingStatusMessage) {
            upcomingStatusMessage.textContent =
              "The upcoming bot could not be saved.";
          }

          return;
        }


        console.log(
          "Upcoming bot saved successfully:",
          data
        );


        upcomingForm.reset();


        if (upcomingStatusMessage) {
          upcomingStatusMessage.textContent =
            data.public_visible
              ? `"${data.bot_name}" was added to the public upcoming queue.`
              : `"${data.bot_name}" was saved as a private upcoming entry.`;
        }


        await loadAdminUpcomingBots();


      } catch (error) {
        console.error(
          "Unexpected error while saving upcoming bot:",
          error
        );


        if (upcomingStatusMessage) {
          upcomingStatusMessage.textContent =
            "The upcoming bot could not be saved right now.";
        }


      } finally {
        setUpcomingFormLoading(false);
      }
    }
  );
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

  /* ==========================================================
   ASSIGNMENT MANAGER REFRESH
   ========================================================== */

if (assignmentRefreshButton) {
  assignmentRefreshButton.addEventListener(
    "click",
    async () => {
      await loadAdminAssignments();
    }
  );
}

  /* ==========================================================
   UPCOMING BOT MANAGER REFRESH
   ========================================================== */

if (upcomingRefreshButton) {
  upcomingRefreshButton.addEventListener(
    "click",
    async () => {
      await loadAdminUpcomingBots();
    }
  );
}

  /* ==========================================================
   ANNOUNCEMENT MANAGER REFRESH
   ========================================================== */

if (announcementRefreshButton) {
  announcementRefreshButton.addEventListener(
    "click",
    async () => {
      await loadAdminAnnouncements();
    }
  );
}

  if (editBotCancelButton) {
    editBotCancelButton.addEventListener("click", () => {
      closeEditBot();
    });
  }

  /* ==========================================================
   COMMISSION MANAGER REFRESH
   ========================================================== */

if (commissionRefreshButton) {
  commissionRefreshButton.addEventListener(
    "click",
    async () => {
      await loadAdminCommissions();
    }
  );
}


/* ==========================================================
   COMMISSION SEARCH
   ========================================================== */

if (commissionSearch) {
  commissionSearch.addEventListener(
    "input",
    () => {
      renderAdminCommissions();
    }
  );
}


/* ==========================================================
   COMMISSION TYPE FILTER
   ========================================================== */

if (commissionTypeFilter) {
  commissionTypeFilter.addEventListener(
    "change",
    () => {
      renderAdminCommissions();
    }
  );
}


/* ==========================================================
   COMMISSION STATUS FILTER
   ========================================================== */

if (commissionStatusFilter) {
  commissionStatusFilter.addEventListener(
    "change",
    () => {
      renderAdminCommissions();
    }
  );
}


/* ==========================================================
   COMMISSION PAYMENT FILTER
   ========================================================== */

if (commissionPaymentFilter) {
  commissionPaymentFilter.addEventListener(
    "change",
    () => {
      renderAdminCommissions();
    }
  );
}

/* ==========================================================
   GRAVEYARD MANAGER REFRESH
   ========================================================== */

if (graveyardRefreshButton) {
  graveyardRefreshButton.addEventListener(
    "click",
    async () => {
      await loadAdminGraveyardEntries();
    }
  );
}

  /* ==========================================================
   GRAVEYARD SEARCH
   ========================================================== */

if (graveyardSearch) {
  graveyardSearch.addEventListener(
    "input",
    () => {
      renderAdminGraveyardEntries();
    }
  );
}

  /* ==========================================================
   GRAVEYARD STATUS FILTER
   ========================================================== */

if (graveyardStatusFilter) {
  graveyardStatusFilter.addEventListener(
    "change",
    () => {
      renderAdminGraveyardEntries();
    }
  );
}
  
  /* ==========================================================
   FREE REQUEST MANAGER REFRESH
   ========================================================== */

if (freeRequestRefreshButton) {
  freeRequestRefreshButton.addEventListener(
    "click",
    async () => {
      await loadAdminFreeRequests();
    }
  );
}

  /* ==========================================================
   FREE REQUEST FILTERS
   ========================================================== */

if (freeRequestTypeFilter) {
  freeRequestTypeFilter.addEventListener(
    "change",
    () => {
      renderAdminFreeRequests();
    }
  );
}


if (freeRequestStatusFilter) {
  freeRequestStatusFilter.addEventListener(
    "change",
    () => {
      renderAdminFreeRequests();
    }
  );
}

  /* ==========================================================
   SAVE REVIEWED COMMISSION
   ========================================================== */

if (reviewCommissionSaveButton) {
  reviewCommissionSaveButton.addEventListener(
    "click",
    async () => {

      /* AUTHORIZATION */

      if (
        !window.supabaseClient ||
        !adminAuthorized
      ) {
        if (reviewCommissionStatusMessage) {
          reviewCommissionStatusMessage.textContent =
            "Administrator authorization is required.";
        }

        return;
      }


      /* SELECTED COMMISSION */

      if (!reviewingCommissionId) {
        if (reviewCommissionStatusMessage) {
          reviewCommissionStatusMessage.textContent =
            "No commission request is currently selected.";
        }

        return;
      }


      /* VALUES */

      const status =
        String(
          reviewCommissionStatus?.value ||
          ""
        ).trim();


      const paymentStatus =
        String(
          reviewCommissionPayment?.value ||
          ""
        ).trim();


      /* VALIDATE STATUS */

      const allowedStatuses = [
        "submitted",
        "reviewing",
        "accepted",
        "declined",
        "in_progress",
        "completed",
        "cancelled"
      ];


      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        if (reviewCommissionStatusMessage) {
          reviewCommissionStatusMessage.textContent =
            "Choose a valid commission status.";
        }

        return;
      }


      /* VALIDATE PAYMENT */

      const allowedPaymentStatuses = [
        "unpaid",
        "pending",
        "paid",
        "refunded"
      ];


      if (
        !allowedPaymentStatuses.includes(
          paymentStatus
        )
      ) {
        if (reviewCommissionStatusMessage) {
          reviewCommissionStatusMessage.textContent =
            "Choose a valid payment status.";
        }

        return;
      }


      /* LOADING */

      setReviewCommissionLoading(
        true
      );


      if (reviewCommissionStatusMessage) {
        reviewCommissionStatusMessage.textContent =
          "Saving commission changes...";
      }


      try {
        const {
          data,
          error
        } = await window.supabaseClient
          .from("commission_requests")
          .update({
            status,
            payment_status:
              paymentStatus
          })
          .eq(
            "id",
            reviewingCommissionId
          )
          .select(`
            id,
            user_id,
            commission_type,
            request_title,
            request_details,
            submitter_name,
            contact,
            reference_details,
            graveyard_entry_id,
            graveyard_code,
            graveyard_title,
            private_use,
            extra_images,
            base_price_cad,
            addon_price_cad,
            total_price_cad,
            status,
            payment_status,
            created_at,
            updated_at
          `)
          .single();


        if (error) {
          throw error;
        }


        if (!data) {
          throw new Error(
            "The updated commission could not be returned."
          );
        }


        adminCommissionRequests =
          adminCommissionRequests.map(
            (commission) =>
              commission.id === data.id
                ? data
                : commission
          );


        populateAdminCommissionStatusFilter();

        renderAdminCommissions();


        openReviewCommission(
          data
        );


        if (reviewCommissionStatusMessage) {
          reviewCommissionStatusMessage.textContent =
            "Commission updated successfully.";
        }


      } catch (error) {
        console.error(
          "Unable to update commission:",
          error
        );


        if (reviewCommissionStatusMessage) {
          reviewCommissionStatusMessage.textContent =
            error?.message ||
            "Unable to update the commission request.";
        }


      } finally {
        setReviewCommissionLoading(
          false
        );
      }
    }
  );
}


/* ==========================================================
   CLOSE REVIEW COMMISSION
   ========================================================== */

if (reviewCommissionCloseButton) {
  reviewCommissionCloseButton.addEventListener(
    "click",
    () => {
      closeReviewCommission();
    }
  );
}

  /* ==========================================================
   CLOSE REVIEW COMMISSION
   ========================================================== */

if (reviewCommissionCloseButton) {
  reviewCommissionCloseButton.addEventListener(
    "click",
    () => {
      closeReviewCommission();
    }
  );
}

  /* ==========================================================
   CANCEL EDIT GRAVEYARD
   ========================================================== */

if (editGraveyardCancelButton) {
  editGraveyardCancelButton.addEventListener(
    "click",
    () => {
      closeEditGraveyard();
    }
  );
}

  /* ==========================================================
   SAVE EDITED GRAVEYARD ENTRY
   ========================================================== */

if (editGraveyardForm) {
  editGraveyardForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();


      /* AUTHORIZATION */

      if (
        !window.supabaseClient ||
        !adminAuthorized
      ) {
        if (editGraveyardStatusMessage) {
          editGraveyardStatusMessage.textContent =
            "Administrator authorization is required.";
        }

        return;
      }


      /* ENTRY SELECTED */

      if (!editingGraveyardId) {
        if (editGraveyardStatusMessage) {
          editGraveyardStatusMessage.textContent =
            "No Graveyard entry is currently selected.";
        }

        return;
      }


      /* READ FORM */

      const formData =
        new FormData(
          editGraveyardForm
        );


      const title =
        String(
          formData.get("title") || ""
        ).trim();


      const gender =
        String(
          formData.get("gender") || ""
        ).trim();


      const status =
        String(
          formData.get("status") || ""
        ).trim();


      const note =
        String(
          formData.get("note") || ""
        ).trim();


      /* VALIDATE TITLE */

      if (!title) {
        if (editGraveyardStatusMessage) {
          editGraveyardStatusMessage.textContent =
            "Enter a Graveyard title.";
        }

        return;
      }


      /* VALIDATE GENDER */

      if (!gender) {
        if (editGraveyardStatusMessage) {
          editGraveyardStatusMessage.textContent =
            "Enter the character gender.";
        }

        return;
      }


      /* VALIDATE STATUS */

      const allowedStatuses = [
        "available",
        "message-first",
        "claimed",
        "reserved",
        "resurrected"
      ];


      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        if (editGraveyardStatusMessage) {
          editGraveyardStatusMessage.textContent =
            "Choose a valid Graveyard status.";
        }

        return;
      }


      /* LOADING */

      if (editGraveyardSubmitButton) {
        editGraveyardSubmitButton.disabled =
          true;

        editGraveyardSubmitButton.textContent =
          "Saving...";
      }


      if (editGraveyardStatusMessage) {
        editGraveyardStatusMessage.textContent =
          "Saving Graveyard entry...";
      }


      try {
        const {
          data,
          error
        } = await window.supabaseClient
          .from("graveyard_entries")
          .update({
            title,
            gender,
            status,
            note:
              note || null
          })
          .eq(
            "id",
            editingGraveyardId
          )
          .select(`
            id,
            request_number,
            request_code,
            gender,
            title,
            status,
            note,
            created_at,
            updated_at
          `)
          .single();


        if (error) {
          throw error;
        }


        console.log(
          "Graveyard entry updated:",
          data
        );


        const requestCode =
          data?.request_code ||
          "Graveyard entry";


        closeEditGraveyard();


        await loadAdminGraveyardEntries();


        if (graveyardManagerStatus) {
          graveyardManagerStatus.textContent =
            `${requestCode} was updated successfully.`;
        }


      } catch (error) {
        console.error(
          "Unable to update Graveyard entry:",
          error
        );


        if (editGraveyardStatusMessage) {
          editGraveyardStatusMessage.textContent =
            error?.message ||
            "The Graveyard entry could not be updated.";
        }


      } finally {
        if (editGraveyardSubmitButton) {
          editGraveyardSubmitButton.disabled =
            false;

          editGraveyardSubmitButton.textContent =
            "Save Changes";
        }
      }
    }
  );
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
   ASSIGNMENT SELECT CHANGES
   ========================================================== */

if (assignmentBotSelect) {
  assignmentBotSelect.addEventListener(
    "change",
    updateAssignmentSubmitState
  );
}


if (assignmentSeriesSelect) {
  assignmentSeriesSelect.addEventListener(
    "change",
    updateAssignmentSubmitState
  );
}

  /* ==========================================================
   CREATE BOT / SERIES ASSIGNMENT
   ========================================================== */

if (assignmentForm) {
  assignmentForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();


      /* AUTH */

      if (
        !window.supabaseClient ||
        !adminAuthorized
      ) {
        if (assignmentStatus) {
          assignmentStatus.textContent =
            "Administrator authorization is required.";
        }

        return;
      }


      /* READ FORM */

      const formData =
        new FormData(assignmentForm);

      const botId =
        String(
          formData.get("bot_id") || ""
        );

      const seriesId =
        String(
          formData.get("series_id") || ""
        );

      const sortOrderRaw =
        Number(
          formData.get("sort_order")
        );

      const sortOrder =
        Number.isInteger(sortOrderRaw) &&
        sortOrderRaw >= 0
          ? sortOrderRaw
          : 0;


      /* VALIDATION */

      if (!botId || !seriesId) {
        if (assignmentStatus) {
          assignmentStatus.textContent =
            "Choose both a bot and a series.";
        }

        return;
      }


      /* LOADING */

      if (assignmentSubmitButton) {
        assignmentSubmitButton.disabled = true;
        assignmentSubmitButton.textContent =
          "Adding...";
      }


      if (assignmentStatus) {
        assignmentStatus.textContent =
          "Adding bot to series...";
      }


      try {
        const {
          data,
          error
        } = await window.supabaseClient
          .from("bot_series")
          .insert({
            bot_id: botId,
            series_id: seriesId,
            sort_order: sortOrder
          })
          .select(
            "id, bot_id, series_id, sort_order"
          )
          .single();


        if (error) {
          console.error(
            "Unable to create bot-series assignment:",
            error
          );


          if (error.code === "23505") {
            if (assignmentStatus) {
              assignmentStatus.textContent =
                "That bot is already assigned to this series.";
            }

            return;
          }


          if (
            error.code === "23514" ||
            error.code === "23502"
          ) {
            if (assignmentStatus) {
              assignmentStatus.textContent =
                "The assignment does not meet the database rules.";
            }

            return;
          }


          if (assignmentStatus) {
            assignmentStatus.textContent =
              "The assignment could not be created.";
          }

          return;
        }


        console.log(
          "Bot-series assignment created:",
          data
        );


        if (assignmentStatus) {
          assignmentStatus.textContent =
            "Bot added to series successfully.";
        }


        assignmentForm.reset();


        const sortOrderField =
          assignmentForm.elements.namedItem(
            "sort_order"
          );

        if (sortOrderField) {
          sortOrderField.value = "0";
        }


        await loadAdminAssignments();


      } catch (error) {
        console.error(
          "Unexpected assignment error:",
          error
        );

        if (assignmentStatus) {
          assignmentStatus.textContent =
            "The assignment could not be created right now.";
        }

      } finally {
        if (assignmentSubmitButton) {
          assignmentSubmitButton.textContent =
            "Add to Series";
        }

        updateAssignmentSubmitState();
      }
    }
  );
}

  /* ==========================================================
   CANCEL EDIT UPCOMING BOT
   ========================================================== */

if (editUpcomingCancelButton) {
  editUpcomingCancelButton.addEventListener(
    "click",
    () => {
      closeEditUpcoming();
    }
  );
}

  /* ==========================================================
   SAVE EDITED UPCOMING BOT
   ========================================================== */

if (editUpcomingForm) {
  editUpcomingForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();


      /* AUTH */

      if (
        !window.supabaseClient ||
        !adminAuthorized
      ) {
        if (editUpcomingStatusMessage) {
          editUpcomingStatusMessage.textContent =
            "Administrator authorization is required.";
        }

        return;
      }


      /* ENTRY SELECTED */

      if (!editingUpcomingId) {
        if (editUpcomingStatusMessage) {
          editUpcomingStatusMessage.textContent =
            "No upcoming bot is currently selected.";
        }

        return;
      }


      /* READ FORM */

      const formData =
        new FormData(editUpcomingForm);


      const botName =
        String(
          formData.get("bot_name") || ""
        ).trim();


      const botType =
        String(
          formData.get("bot_type") || ""
        ).trim();


      const expectedPostDate =
        String(
          formData.get("expected_post_date") || ""
        ).trim();


      const status =
        String(
          formData.get("status") || "planned"
        ).trim();


      const seriesName =
        String(
          formData.get("series_name") || ""
        ).trim();


      const notes =
        String(
          formData.get("notes") || ""
        ).trim();


      const sortOrderRaw =
        Number(
          formData.get("sort_order")
        );


      const publicVisible =
        formData.get("public_visible") === "on";


      /* VALIDATE NAME */

      if (!botName) {
        if (editUpcomingStatusMessage) {
          editUpcomingStatusMessage.textContent =
            "Bot name is required.";
        }

        return;
      }


      /* VALIDATE TYPE */

      const allowedTypes = [
        "",
        "original",
        "alt",
        "commission",
        "media_inspired",
        "remaster"
      ];


      if (!allowedTypes.includes(botType)) {
        if (editUpcomingStatusMessage) {
          editUpcomingStatusMessage.textContent =
            "Choose a valid bot type.";
        }

        return;
      }


      /* VALIDATE STATUS */

      const allowedStatuses = [
        "planned",
        "writing",
        "in_progress",
        "ready",
        "scheduled",
        "delayed",
        "posted",
        "cancelled"
      ];


      if (!allowedStatuses.includes(status)) {
        if (editUpcomingStatusMessage) {
          editUpcomingStatusMessage.textContent =
            "Choose a valid upcoming-bot status.";
        }

        return;
      }


      /* VALIDATE SORT ORDER */

      if (
        !Number.isInteger(sortOrderRaw) ||
        sortOrderRaw < 0
      ) {
        if (editUpcomingStatusMessage) {
          editUpcomingStatusMessage.textContent =
            "Sort order must be 0 or greater.";
        }

        return;
      }


      /* BUILD UPDATE */

      const updates = {
        bot_name: botName,

        bot_type:
          botType || null,

        expected_post_date:
          expectedPostDate || null,

        status,

        series_name:
          seriesName || null,

        notes:
          notes || null,

        sort_order:
          sortOrderRaw,

        public_visible:
          publicVisible
      };


      /* LOADING */

      if (editUpcomingSubmitButton) {
        editUpcomingSubmitButton.disabled =
          true;

        editUpcomingSubmitButton.textContent =
          "Saving...";
      }


      if (editUpcomingStatusMessage) {
        editUpcomingStatusMessage.textContent =
          "Saving changes...";
      }


      try {
        const {
          data,
          error
        } = await window.supabaseClient
          .from("upcoming_bots")
          .update(updates)
          .eq(
            "id",
            editingUpcomingId
          )
          .select(`
            id,
            bot_name,
            bot_type,
            expected_post_date,
            status,
            series_name,
            notes,
            sort_order,
            public_visible
          `)
          .single();


        if (error) {
          console.error(
            "Unable to update upcoming bot:",
            error
          );


          if (
            error.code === "23514" ||
            error.code === "23502"
          ) {
            if (editUpcomingStatusMessage) {
              editUpcomingStatusMessage.textContent =
                "One of the edited values does not meet the database rules.";
            }

            return;
          }


          if (editUpcomingStatusMessage) {
            editUpcomingStatusMessage.textContent =
              "The upcoming bot could not be updated.";
          }

          return;
        }


        console.log(
          "Upcoming bot updated successfully:",
          data
        );


        const updatedName =
          data.bot_name;


        closeEditUpcoming();

        await loadAdminUpcomingBots();


        if (upcomingManagerStatus) {
          upcomingManagerStatus.textContent =
            `"${updatedName}" was updated successfully.`;
        }


      } catch (error) {
        console.error(
          "Unexpected error while updating upcoming bot:",
          error
        );


        if (editUpcomingStatusMessage) {
          editUpcomingStatusMessage.textContent =
            "The upcoming bot could not be updated right now.";
        }


      } finally {
        if (editUpcomingSubmitButton) {
          editUpcomingSubmitButton.disabled =
            false;

          editUpcomingSubmitButton.textContent =
            "Save Changes";
        }
      }
    }
  );
}

  /* ==========================================================
   CANCEL EDIT ANNOUNCEMENT
   ========================================================== */

if (editAnnouncementCancelButton) {
  editAnnouncementCancelButton.addEventListener(
    "click",
    () => {
      closeEditAnnouncement();
    }
  );
}

  /* ==========================================================
   SAVE EDITED ANNOUNCEMENT
   ========================================================== */

if (editAnnouncementForm) {
  editAnnouncementForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();


      if (
        !window.supabaseClient ||
        !adminAuthorized
      ) {
        if (editAnnouncementStatus) {
          editAnnouncementStatus.textContent =
            "Administrator authorization is required.";
        }

        return;
      }


      if (!editingAnnouncementId) {
        if (editAnnouncementStatus) {
          editAnnouncementStatus.textContent =
            "No announcement is currently selected.";
        }

        return;
      }


      const formData =
        new FormData(
          editAnnouncementForm
        );


      const title =
        String(
          formData.get("title") || ""
        ).trim();


      const content =
        String(
          formData.get("content") || ""
        ).trim();


      const category =
        String(
          formData.get("category") || "general"
        ).trim();


      const important =
        formData.get("important") === "on";


      const published =
        formData.get("published") === "on";


      if (!title) {
        if (editAnnouncementStatus) {
          editAnnouncementStatus.textContent =
            "Announcement title is required.";
        }

        return;
      }


      if (!content) {
        if (editAnnouncementStatus) {
          editAnnouncementStatus.textContent =
            "Announcement content is required.";
        }

        return;
      }


      const allowedCategories = [
        "general",
        "website",
        "commissions",
        "membership",
        "requests",
        "masterlist",
        "schedule"
      ];


      if (
        !allowedCategories.includes(category)
      ) {
        if (editAnnouncementStatus) {
          editAnnouncementStatus.textContent =
            "Choose a valid announcement category.";
        }

        return;
      }


      const updates = {
        title,
        content,
        category,
        important,
        published
      };


      if (
        published &&
        !editingAnnouncementPublished
      ) {
        updates.published_at =
          new Date().toISOString();
      }


      if (!published) {
        updates.published_at = null;
      }


      if (editAnnouncementSubmitButton) {
        editAnnouncementSubmitButton.disabled =
          true;

        editAnnouncementSubmitButton.textContent =
          "Saving...";
      }


      if (editAnnouncementStatus) {
        editAnnouncementStatus.textContent =
          "Saving changes...";
      }


      try {
        const {
          data,
          error
        } = await window.supabaseClient
          .from("announcements")
          .update(updates)
          .eq(
            "id",
            editingAnnouncementId
          )
          .select(`
            id,
            title,
            content,
            category,
            important,
            published,
            published_at
          `)
          .single();


        if (error) {
          console.error(
            "Unable to update announcement:",
            error
          );

          if (
            error.code === "23514" ||
            error.code === "23502"
          ) {
            if (editAnnouncementStatus) {
              editAnnouncementStatus.textContent =
                "One of the edited values does not meet the database rules.";
            }

            return;
          }


          if (editAnnouncementStatus) {
            editAnnouncementStatus.textContent =
              "The announcement could not be updated.";
          }

          return;
        }


        console.log(
          "Announcement updated successfully:",
          data
        );


        const updatedTitle =
          data.title;


        closeEditAnnouncement();

        await loadAdminAnnouncements();


        if (announcementManagerStatus) {
          announcementManagerStatus.textContent =
            `"${updatedTitle}" was updated successfully.`;
        }


      } catch (error) {
        console.error(
          "Unexpected error while updating announcement:",
          error
        );


        if (editAnnouncementStatus) {
          editAnnouncementStatus.textContent =
            "The announcement could not be updated right now.";
        }


      } finally {
        if (editAnnouncementSubmitButton) {
          editAnnouncementSubmitButton.disabled =
            false;

          editAnnouncementSubmitButton.textContent =
            "Save Changes";
        }
      }
    }
  );
}

  /* ==========================================================
   CANCEL FREE REQUEST REVIEW
   ========================================================== */

if (editFreeRequestCancelButton) {
  editFreeRequestCancelButton.addEventListener(
    "click",
    () => {
      closeEditFreeRequest();
    }
  );
}

/* ==========================================================
   CANCEL GRAVEYARD CONVERSION
   ========================================================== */

if (graveyardConvertCancelButton) {
  graveyardConvertCancelButton.addEventListener(
    "click",
    () => {
      closeGraveyardConversion();
    }
  );
}
  
  /* ==========================================================
   SAVE FREE REQUEST STATUS
   ========================================================== */

if (editFreeRequestForm) {
  editFreeRequestForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();


      /* AUTH */

      if (
        !window.supabaseClient ||
        !adminAuthorized
      ) {
        if (editFreeRequestStatusMessage) {
          editFreeRequestStatusMessage.textContent =
            "Administrator authorization is required.";
        }

        return;
      }


      /* REQUEST SELECTED */

      if (!editingFreeRequestId) {
        if (editFreeRequestStatusMessage) {
          editFreeRequestStatusMessage.textContent =
            "No free request is currently selected.";
        }

        return;
      }


      /* READ STATUS */

      const formData =
        new FormData(
          editFreeRequestForm
        );


      const status =
        String(
          formData.get("status") || ""
        ).trim();


      const allowedStatuses = [
        "submitted",
        "reviewing",
        "accepted",
        "denied",
        "created",
        "archived"
      ];


      if (
        !allowedStatuses.includes(status)
      ) {
        if (editFreeRequestStatusMessage) {
          editFreeRequestStatusMessage.textContent =
            "Choose a valid request status.";
        }

        return;
      }


      /* LOADING */

      if (editFreeRequestSubmitButton) {
        editFreeRequestSubmitButton.disabled =
          true;

        editFreeRequestSubmitButton.textContent =
          "Saving...";
      }


      if (editFreeRequestStatusMessage) {
        editFreeRequestStatusMessage.textContent =
          "Saving request status...";
      }


      try {
        const {
          data,
          error
        } = await window.supabaseClient
          .from("free_requests")
          .update({
            status
          })
          .eq(
            "id",
            editingFreeRequestId
          )
          .select(`
            id,
            request_type,
            submitter_name,
            request_details,
            status,
            created_at,
            updated_at
          `)
          .single();


        if (error) {
          throw error;
        }


        console.log(
          "Free request status updated:",
          data
        );


        const requestTypeLabel =
          getAdminFreeRequestTypeLabel(
            data.request_type
          );


        closeEditFreeRequest();


        await loadAdminFreeRequests();


        if (freeRequestManagerStatus) {
          freeRequestManagerStatus.textContent =
            `${requestTypeLabel} status changed to ${getAdminFreeRequestStatusLabel(
              data.status
            )}.`;
        }


      } catch (error) {
        console.error(
          "Unable to update free request:",
          error
        );


        if (editFreeRequestStatusMessage) {
          editFreeRequestStatusMessage.textContent =
            "The request status could not be updated.";
        }


      } finally {
        if (editFreeRequestSubmitButton) {
          editFreeRequestSubmitButton.disabled =
            false;

          editFreeRequestSubmitButton.textContent =
            "Save Status";
        }
      }
    }
  );
}

/* ==========================================================
   ADD ACCEPTED REQUEST TO GRAVEYARD
   ========================================================== */

if (graveyardConvertForm) {
  graveyardConvertForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();


      if (
        !window.supabaseClient ||
        !adminAuthorized
      ) {
        if (graveyardConvertStatus) {
          graveyardConvertStatus.textContent =
            "Administrator authorization is required.";
        }

        return;
      }


      if (!convertingGraveyardRequestId) {
        if (graveyardConvertStatus) {
          graveyardConvertStatus.textContent =
            "No accepted Graveyard request is selected.";
        }

        return;
      }


      const formData =
        new FormData(
          graveyardConvertForm
        );


      const title =
        String(
          formData.get("title") || ""
        ).trim();


      const gender =
        String(
          formData.get("gender") || ""
        ).trim();


      const status =
        String(
          formData.get("status") ||
          "available"
        ).trim();


      const note =
        String(
          formData.get("note") || ""
        ).trim();


      if (!title) {
        if (graveyardConvertStatus) {
          graveyardConvertStatus.textContent =
            "Enter the Graveyard title.";
        }

        return;
      }


      if (!gender) {
        if (graveyardConvertStatus) {
          graveyardConvertStatus.textContent =
            "Enter the character gender.";
        }

        return;
      }


      const allowedStatuses = [
        "available",
        "message-first",
        "claimed",
        "reserved",
        "resurrected"
      ];


      if (!allowedStatuses.includes(status)) {
        if (graveyardConvertStatus) {
          graveyardConvertStatus.textContent =
            "Choose a valid Graveyard status.";
        }

        return;
      }


      if (graveyardConvertSubmitButton) {
        graveyardConvertSubmitButton.disabled =
          true;

        graveyardConvertSubmitButton.textContent =
          "Adding...";
      }


      if (graveyardConvertStatus) {
        graveyardConvertStatus.textContent =
          "Adding request to the Request Graveyard...";
      }


      try {
        const {
          data,
          error
        } = await window.supabaseClient
          .rpc(
            "admin_add_graveyard_entry",
            {
              p_source_request_id:
                convertingGraveyardRequestId,

              p_gender:
                gender,

              p_title:
                title,

              p_status:
                status,

              p_note:
                note || null
            }
          );


        if (error) {
          throw error;
        }


        const requestCode =
          data || "new Graveyard entry";


        console.log(
          "Graveyard entry created:",
          requestCode
        );


        closeGraveyardConversion();


        await loadAdminFreeRequests();


        if (freeRequestManagerStatus) {
          freeRequestManagerStatus.textContent =
            `${requestCode} was added to the Request Graveyard.`;
        }


      } catch (error) {
        console.error(
          "Unable to add request to Graveyard:",
          error
        );


        if (graveyardConvertStatus) {
          graveyardConvertStatus.textContent =
            error?.message ||
            "The Graveyard entry could not be created.";
        }


      } finally {
        if (graveyardConvertSubmitButton) {
          graveyardConvertSubmitButton.disabled =
            false;

          graveyardConvertSubmitButton.textContent =
            "Add to Request Graveyard";
        }
      }
    }
  );
}
  
  /* ==========================================================
     START
     ========================================================== */

  showLogin();
  restoreSession();
});
