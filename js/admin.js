document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================
     AUTH ELEMENTS
     ========================================================== */

  const loginPanel = document.querySelector(
    "[data-admin-login]"
  );

  const dashboard = document.querySelector(
    "[data-admin-dashboard]"
  );

  const loginForm = document.querySelector(
    "[data-admin-login-form]"
  );

  const loginButton = document.querySelector(
    "[data-admin-login-button]"
  );

  const authStatusElement = document.querySelector(
    "[data-admin-auth-status]"
  );

  const logoutButton = document.querySelector(
    "[data-admin-logout]"
  );


  /* ==========================================================
     ADD BOT ELEMENTS
     ========================================================== */

  const botForm = document.querySelector(
    "[data-admin-bot-form]"
  );

  const botSubmitButton = document.querySelector(
    "[data-admin-bot-submit]"
  );

  const botStatusElement = document.querySelector(
    "[data-admin-bot-status]"
  );

  const botNameInput = document.querySelector(
    "#admin-bot-name"
  );

  const botSlugInput = document.querySelector(
    "#admin-bot-slug"
  );


  console.log("admin.js loaded.");

  /* ==========================================================
   MANAGE BOT ELEMENTS
   ========================================================== */

const botManagerList = document.querySelector(
  "[data-admin-bot-manager-list]"
);

const botManagerStatus = document.querySelector(
  "[data-admin-bots-status]"
);

const botRefreshButton = document.querySelector(
  "[data-admin-bots-refresh]"
);

/* ==========================================================
   EDIT BOT ELEMENTS
   ========================================================== */

const editBotPanel = document.querySelector(
  "[data-admin-edit-bot-panel]"
);

const editBotForm = document.querySelector(
  "[data-admin-edit-bot-form]"
);

const editBotHeading = document.querySelector(
  "[data-admin-edit-bot-heading]"
);

const editBotStatus = document.querySelector(
  "[data-admin-edit-bot-status]"
);

const editBotCancelButton = document.querySelector(
  "[data-admin-edit-bot-cancel]"
);
  
  /* ==========================================================
     STATE
     ========================================================== */

 let adminAuthorized = false;
let lastGeneratedSlug = "";
let editingBotId = null;


  /* ==========================================================
     REQUIRED ELEMENTS
     ========================================================== */

  if (
    !loginPanel ||
    !dashboard ||
    !loginForm ||
    !authStatusElement
  ) {
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

    authStatusElement.classList.toggle(
      "admin-auth-error",
      isError
    );
  }


  function setLoginLoading(isLoading) {
    if (!loginButton) {
      return;
    }

    loginButton.disabled = isLoading;

    loginButton.textContent =
      isLoading
        ? "Signing In..."
        : "Sign In";
  }


  /* ==========================================================
     BOT FORM UI HELPERS
     ========================================================== */

  function setBotStatus(message, isError = false) {
    if (!botStatusElement) {
      return;
    }

    botStatusElement.textContent = message;

    botStatusElement.classList.toggle(
      "admin-form-error",
      isError
    );

    botStatusElement.classList.toggle(
      "admin-form-success",
      !isError && Boolean(message)
    );
  }


  function setBotFormLoading(isLoading) {
  if (!botSubmitButton) {
    return;
  }

  botSubmitButton.disabled = isLoading;

  botSubmitButton.textContent =
    isLoading
      ? "Saving..."
      : "Save Bot";
}

/* ==========================================================
   BOT MANAGER LABEL HELPERS
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

/* ==========================================================
   CREATE ADMIN BOT CARD
   ========================================================== */

function createAdminBotCard(bot) {
  const article = document.createElement("article");

  article.className = "admin-bot-manager-card";


  /* HEADER */

  const header = document.createElement("div");

  header.className = "admin-bot-manager-header";


  const title = document.createElement("h3");

  title.className = "admin-bot-manager-name";
  title.textContent = bot.name;


  const status = document.createElement("span");

  status.className =
    bot.published
      ? "admin-bot-publication-status is-published"
      : "admin-bot-publication-status is-draft";

  status.textContent =
    bot.published
      ? "Published"
      : "Draft";


  header.append(
    title,
    status
  );


  /* SLUG */

  const slug = document.createElement("p");

  slug.className = "admin-bot-manager-slug";
  slug.textContent = bot.slug;


  /* META */

  const meta = document.createElement("div");

  meta.className = "admin-bot-manager-meta";


  const pov = document.createElement("span");

  pov.textContent =
    getAdminPovLabel(bot.pov);


  const type = document.createElement("span");

  type.textContent =
    getAdminBotTypeLabel(bot.bot_type);


  meta.append(
    pov,
    type
  );


  /* DESCRIPTION */

  const description = document.createElement("p");

  description.className =
    "admin-bot-manager-description";

  description.textContent =
    bot.description ||
    "No masterlist description provided.";


  /* JANITORAI URL STATUS */

  const janitorStatus = document.createElement("p");

  janitorStatus.className =
    "admin-bot-manager-link-status";

  janitorStatus.textContent =
    bot.janitor_url
      ? "JanitorAI link added"
      : "No JanitorAI link";

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
    openEditBot(bot);
  }
);

const publicationButton = document.createElement("button");

publicationButton.type = "button";
publicationButton.className = "secondary-button";

publicationButton.textContent =
  bot.published
    ? "Unpublish"
    : "Publish";


publicationButton.addEventListener(
  "click",
  async () => {
    await toggleBotPublication(
      bot,
      publicationButton
    );
  }
);


actions.append(
  editButton,
  publicationButton
);

  /* BUILD CARD */

 article.append(
  header,
  slug,
  meta,
  description,
  janitorStatus,
  actions
);


  return article;
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
     SLUG GENERATION
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
      const generatedSlug =
        createSlug(botNameInput.value);

      /*
       * Auto-update the slug if:
       * - the slug is empty, or
       * - it still contains the previously auto-generated value.
       *
       * Once you manually change the slug, typing in the bot name
       * will no longer overwrite your custom slug.
       */
      if (
        !botSlugInput.value ||
        botSlugInput.value === lastGeneratedSlug
      ) {
        botSlugInput.value = generatedSlug;
        lastGeneratedSlug = generatedSlug;
      }
    });


    botSlugInput.addEventListener("input", () => {
      botSlugInput.value =
        createSlug(botSlugInput.value);
    });
  }


  /* ==========================================================
     CHECK ADMIN ROLE
     ========================================================== */

  async function userIsAdmin(user) {
    if (!user?.id) {
      return false;
    }

    const { data, error } = await window.supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error(
        "Unable to check admin profile:",
        error
      );

      throw error;
    }

    return data?.role === "admin";
  }


  /* ==========================================================
     AUTHORIZE SIGNED-IN USER
     ========================================================== */

  async function authorizeUser(user) {
    adminAuthorized = false;

    try {
      const isAdmin =
        await userIsAdmin(user);

      if (!isAdmin) {
        console.warn(
          "Signed-in account is not an administrator."
        );

        await window.supabaseClient.auth.signOut();

        showLogin();

        setAuthStatus(
          "This account is not authorized to access the admin dashboard.",
          true
        );

        return false;
      }

      adminAuthorized = true;

      console.log(
        "Administrator authorized:",
        user.email
      );

     setAuthStatus("");
showDashboard();

await loadAdminBots();

return true;

    } catch (error) {
      console.error(
        "Admin authorization failed:",
        error
      );

      adminAuthorized = false;

      showLogin();

      setAuthStatus(
        "Unable to verify administrator access.",
        true
      );

      return false;
    }
  }


  /* ==========================================================
     LOGIN
     ========================================================== */

  loginForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      if (!window.supabaseClient) {
        setAuthStatus(
          "Supabase connection is unavailable.",
          true
        );

        return;
      }


      const formData =
        new FormData(loginForm);

      const email =
        String(
          formData.get("email") || ""
        ).trim();

      const password =
        String(
          formData.get("password") || ""
        );


      if (!email || !password) {
        setAuthStatus(
          "Enter your email and password.",
          true
        );

        return;
      }


      setLoginLoading(true);

      setAuthStatus(
        "Checking credentials..."
      );


      try {
        const {
          data,
          error
        } = await window.supabaseClient.auth
          .signInWithPassword({
            email,
            password
          });


        if (error) {
          console.error(
            "Admin sign-in error:",
            error
          );

          setAuthStatus(
            "Email or password is incorrect.",
            true
          );

          return;
        }


        if (!data?.user) {
          setAuthStatus(
            "Unable to sign in.",
            true
          );

          return;
        }


        await authorizeUser(
          data.user
        );


      } catch (error) {
        console.error(
          "Unexpected admin login error:",
          error
        );

        setAuthStatus(
          "Unable to sign in right now.",
          true
        );

      } finally {
        setLoginLoading(false);
      }
    }
  );


  /* ==========================================================
     LOGOUT
     ========================================================== */

  if (logoutButton) {
    logoutButton.addEventListener(
      "click",
      async () => {
        try {
          await window.supabaseClient.auth.signOut();

          adminAuthorized = false;

          loginForm.reset();

          if (botForm) {
            botForm.reset();
          }

          showLogin();

          setAuthStatus(
            "Signed out."
          );

        } catch (error) {
          console.error(
            "Admin sign-out error:",
            error
          );
        }
      }
    );
  }

/* ==========================================================
   EDIT BOT FORM
   ========================================================== */

function closeEditBot() {
  if (!editBotPanel || !editBotForm) {
    return;
  }

  editingBotId = null;

  editBotForm.reset();

  if (editBotStatus) {
    editBotStatus.textContent = "";
  }

  editBotPanel.hidden = true;
}


function openEditBot(bot) {
  if (!editBotPanel || !editBotForm) {
    console.error(
      "Edit Bot form elements are unavailable."
    );

    return;
  }


  editingBotId = bot.id;


  /* NAME */

  const nameField =
    editBotForm.elements.namedItem("name");

  if (nameField) {
    nameField.value =
      bot.name || "";
  }


  /* SLUG */

  const slugField =
    editBotForm.elements.namedItem("slug");

  if (slugField) {
    slugField.value =
      bot.slug || "";
  }


  /* POV */

  const povField =
    editBotForm.elements.namedItem("pov");

  if (povField) {
    povField.value =
      bot.pov || "";
  }


  /* BOT TYPE */

  const typeField =
    editBotForm.elements.namedItem("bot_type");

  if (typeField) {
    typeField.value =
      bot.bot_type || "";
  }


  /* DESCRIPTION */

  const descriptionField =
    editBotForm.elements.namedItem("description");

  if (descriptionField) {
    descriptionField.value =
      bot.description || "";
  }


  /* IMAGE URL */

  const imageField =
    editBotForm.elements.namedItem("image_url");

  if (imageField) {
    imageField.value =
      bot.image_url || "";
  }


  /* JANITORAI URL */

  const janitorField =
    editBotForm.elements.namedItem("janitor_url");

  if (janitorField) {
    janitorField.value =
      bot.janitor_url || "";
  }


  /* HEADING */

  if (editBotHeading) {
    editBotHeading.textContent =
      `Editing "${bot.name}".`;
  }


  /* STATUS */

  if (editBotStatus) {
    editBotStatus.textContent = "";
  }


  /* SHOW PANEL */

  editBotPanel.hidden = false;


  editBotPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}
  
/* ==========================================================
   PUBLISH / UNPUBLISH BOT
   ========================================================== */

async function toggleBotPublication(
  bot,
  button
) {
  if (
    !window.supabaseClient ||
    !adminAuthorized
  ) {
    if (botManagerStatus) {
      botManagerStatus.textContent =
        "Administrator authorization is required.";
    }

    return;
  }


  const nextPublished =
    !bot.published;


  /*
   * A published bot must have a JanitorAI URL.
   */
  if (
    nextPublished &&
    !bot.janitor_url
  ) {
    if (botManagerStatus) {
      botManagerStatus.textContent =
        `"${bot.name}" cannot be published until a JanitorAI URL is added.`;
    }

    return;
  }


  if (button) {
    button.disabled = true;

    button.textContent =
      nextPublished
        ? "Publishing..."
        : "Unpublishing...";
  }


  if (botManagerStatus) {
    botManagerStatus.textContent =
      nextPublished
        ? `Publishing "${bot.name}"...`
        : `Unpublishing "${bot.name}"...`;
  }


  const updates =
    nextPublished
      ? {
          published: true,
          published_at:
            new Date().toISOString()
        }
      : {
          published: false,
          published_at: null
        };


  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("bots")
      .update(updates)
      .eq("id", bot.id)
      .select(
        "id, name, published, published_at"
      )
      .single();


    if (error) {
      throw error;
    }


    console.log(
      "Bot publication status updated:",
      data
    );


    if (botManagerStatus) {
      botManagerStatus.textContent =
        data.published
          ? `"${data.name}" was published successfully.`
          : `"${data.name}" was unpublished successfully.`;
    }


    await loadAdminBots();


  } catch (error) {
    console.error(
      "Unable to update bot publication status:",
      error
    );


    if (botManagerStatus) {
      botManagerStatus.textContent =
        "Unable to update the bot's publication status.";
    }


    if (button) {
      button.disabled = false;

      button.textContent =
        bot.published
          ? "Unpublish"
          : "Publish";
    }
  }
}
  
  /* ==========================================================
   LOAD ADMIN BOT MANAGER
   ========================================================== */

async function loadAdminBots() {
  if (
    !botManagerList ||
    !botManagerStatus
  ) {
    return;
  }


  if (
    !window.supabaseClient ||
    !adminAuthorized
  ) {
    botManagerList.replaceChildren();

    botManagerStatus.textContent =
      "Administrator authorization is required.";

    return;
  }


  botManagerStatus.textContent =
    "Loading bots...";


  try {
    const {
      data,
      error
    } = await window.supabaseClient
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
      .order("created_at", {
        ascending: false
      });


    if (error) {
      throw error;
    }


    const bots =
      Array.isArray(data)
        ? data
        : [];


    console.log(
      "Admin bots received:",
      bots
    );


    botManagerList.replaceChildren();


    if (bots.length === 0) {
      botManagerStatus.textContent =
        "There are no bot entries yet.";

      return;
    }


    bots.forEach((bot) => {
      botManagerList.append(
        createAdminBotCard(bot)
      );
    });


    botManagerStatus.textContent =
      bots.length === 1
        ? "1 bot entry."
        : `${bots.length} bot entries.`;


  } catch (error) {
    console.error(
      "Unable to load admin bots:",
      error
    );

    botManagerList.replaceChildren();

    botManagerStatus.textContent =
      "Unable to load bot entries.";
  }
}

  /* ==========================================================
     ADD BOT
     ========================================================== */

  if (botForm) {
    botForm.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();


        /* ------------------------------------------------------
           AUTHORIZATION
           ------------------------------------------------------ */

        if (
          !window.supabaseClient ||
          !adminAuthorized
        ) {
          setBotStatus(
            "Administrator authorization is required.",
            true
          );

          return;
        }


        /* ------------------------------------------------------
           READ FORM VALUES
           ------------------------------------------------------ */

        const formData =
          new FormData(botForm);

        const name =
          String(
            formData.get("name") || ""
          ).trim();

        const slug =
          createSlug(
            formData.get("slug")
          );

        const pov =
          String(
            formData.get("pov") || ""
          ).trim();

        const botType =
          String(
            formData.get("bot_type") || ""
          ).trim();

        const description =
          String(
            formData.get("description") || ""
          ).trim();

        const imageUrl =
          String(
            formData.get("image_url") || ""
          ).trim();

        const janitorUrl =
          String(
            formData.get("janitor_url") || ""
          ).trim();

        const published =
          formData.get("published") === "on";


        /* ------------------------------------------------------
           VALIDATION
           ------------------------------------------------------ */

        if (!name) {
          setBotStatus(
            "Bot name is required.",
            true
          );

          return;
        }


        if (!slug) {
          setBotStatus(
            "A valid slug is required.",
            true
          );

          return;
        }


        const validSlug =
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

        if (!validSlug.test(slug)) {
          setBotStatus(
            "Slug can contain only lowercase letters, numbers, and single hyphens.",
            true
          );

          return;
        }


        /*
         * Published bots must have a JanitorAI URL.
         */
        if (published && !janitorUrl) {
          setBotStatus(
            "Add the JanitorAI URL before publishing this bot.",
            true
          );

          return;
        }


        /* ------------------------------------------------------
           BUILD DATABASE ROW
           ------------------------------------------------------ */

        const newBot = {
          name,
          slug,

          description:
            description || null,

          pov:
            pov || null,

          bot_type:
            botType || null,

          image_url:
            imageUrl || null,

          janitor_url:
            janitorUrl || null,

          published,

          published_at:
            published
              ? new Date().toISOString()
              : null
        };


        /* ------------------------------------------------------
           SAVE
           ------------------------------------------------------ */

        setBotFormLoading(true);

        setBotStatus(
          published
            ? "Publishing bot..."
            : "Saving draft..."
        );


        try {
          const {
            data,
            error
          } = await window.supabaseClient
            .from("bots")
            .insert(newBot)
            .select(
              "id, name, slug, published"
            )
            .single();


          if (error) {
            console.error(
              "Unable to save bot:",
              error
            );


            /*
             * PostgreSQL unique violation.
             */
            if (error.code === "23505") {
              setBotStatus(
                "That slug is already being used. Choose a different slug.",
                true
              );

              return;
            }


            /*
             * PostgreSQL constraint violation.
             */
            if (
              error.code === "23514" ||
              error.code === "23502"
            ) {
              setBotStatus(
                "The bot could not be saved because one of the values does not meet the database rules.",
                true
              );

              return;
            }


            setBotStatus(
              "The bot could not be saved.",
              true
            );

            return;
          }


          console.log(
            "Bot saved successfully:",
            data
          );


          /* ----------------------------------------------------
             SUCCESS
             ---------------------------------------------------- */

          setBotStatus(
            published
              ? `"${data.name}" was published successfully.`
              : `"${data.name}" was saved as a private draft.`
          );


          botForm.reset();

          lastGeneratedSlug = "";


        } catch (error) {
          console.error(
            "Unexpected error while saving bot:",
            error
          );

          setBotStatus(
            "The bot could not be saved right now.",
            true
          );

        } finally {
          setBotFormLoading(false);
        }
      }
    );
  }


  /* ==========================================================
     RESTORE EXISTING SESSION
     ========================================================== */

  async function restoreSession() {
    if (!window.supabaseClient) {
      console.error(
        "Admin page could not initialize: Supabase client unavailable."
      );

      showLogin();

      setAuthStatus(
        "Supabase connection is unavailable.",
        true
      );

      return;
    }


    try {
      const {
        data,
        error
      } = await window.supabaseClient.auth
        .getSession();


      if (error) {
        throw error;
      }


      const session =
        data?.session;


      if (!session?.user) {
        adminAuthorized = false;
        showLogin();

        return;
      }


      console.log(
        "Existing Supabase session found."
      );


      await authorizeUser(
        session.user
      );


    } catch (error) {
      console.error(
        "Unable to restore admin session:",
        error
      );

      adminAuthorized = false;

      showLogin();

      setAuthStatus(
        "Please sign in."
      );
    }
  }

  /* ==========================================================
   BOT MANAGER REFRESH
   ========================================================== */

if (botRefreshButton) {
  botRefreshButton.addEventListener(
    "click",
    async () => {
      await loadAdminBots();
    }
  );
}

  /* ==========================================================
   EDIT BOT CANCEL
   ========================================================== */

if (editBotCancelButton) {
  editBotCancelButton.addEventListener(
    "click",
    () => {
      closeEditBot();
    }
  );
}

  /* ==========================================================
     START
     ========================================================== */

  showLogin();
  restoreSession();
});
