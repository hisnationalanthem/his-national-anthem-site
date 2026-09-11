/* ========================================
   HIS_NATIONAL_ANTHEM
   Free Request System
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
  const requestForms = document.querySelectorAll(
    "[data-free-request-form]"
  );

  const graveyardList = document.querySelector(
    "[data-graveyard-list]"
  );

  const graveyardStatus = document.querySelector(
    "[data-graveyard-status]"
  );

   const graveyardSearch =
  document.querySelector(
    "[data-graveyard-search]"
  );


const graveyardStatusFilter =
  document.querySelector(
    "[data-graveyard-status-filter]"
  );


let allGraveyardEntries = [];


  /* ========================================
     PAGE CHECK
     ======================================== */

  if (
    requestForms.length === 0 &&
    !graveyardList
  ) {
    return;
  }


  /* ========================================
     SUPABASE CHECK
     ======================================== */

  if (!window.supabaseClient) {
    console.error(
      "Free request forms could not initialize: Supabase client unavailable."
    );

    requestForms.forEach((form) => {
      const status = form.querySelector(
        "[data-free-request-status]"
      );

      const submitButton = form.querySelector(
        "[data-free-request-submit]"
      );

      if (status) {
        status.textContent =
          "The request system is unavailable right now.";
      }

      if (submitButton) {
        submitButton.disabled = true;
      }
    });

    if (graveyardStatus) {
      graveyardStatus.textContent =
        "The Request Graveyard is unavailable right now.";
    }

    return;
  }


  /* ========================================
     GET CURRENT USER ID
     ======================================== */

  async function getCurrentUserId() {
    try {
      const {
        data,
        error
      } = await window.supabaseClient
        .auth
        .getSession();

      if (error) {
        console.warn(
          "Unable to read current session:",
          error
        );

        return null;
      }

      return (
        data?.session?.user?.id ||
        null
      );

    } catch (error) {
      console.warn(
        "Unexpected session lookup error:",
        error
      );

      return null;
    }
  }


  /* ========================================
     GRAVEYARD HELPERS
     ======================================== */

  function getGraveyardStatusLabel(value) {
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
      "Unknown"
    );
  }


  function createGraveyardCard(entry) {
    const article = document.createElement("article");

    article.className = "request-card";


    /* REQUEST CODE */

    const code = document.createElement("p");

    code.className = "panel-label";

    code.textContent =
      entry.request_code ||
      "Graveyard Request";


    /* TITLE */

    const title = document.createElement("h3");

    title.textContent =
      entry.title ||
      "Untitled Request";


    /* GENDER */

    const gender = document.createElement("p");

    gender.textContent =
      `Character: ${entry.gender || "Not specified"}`;


    /* STATUS */

    const status = document.createElement("div");

    status.className = "request-status";

    status.textContent =
      getGraveyardStatusLabel(
        entry.status
      );


    /* NOTE */

    const note = document.createElement("p");

    note.className = "small-note";

    note.textContent =
      entry.note || "";


    /* ACTIONS */

    const actions = document.createElement("div");

    actions.className =
      "admin-bot-manager-actions";


    if (entry.status === "available") {
      const resurrectLink =
        document.createElement("a");

      resurrectLink.className =
        "primary-button";

      resurrectLink.textContent =
        "Resurrect This Request";

      resurrectLink.href =
        `commissions.html?commission_type=${encodeURIComponent(
          "Graveyard Resurrection"
        )}&graveyard_id=${encodeURIComponent(
          entry.request_code || ""
        )}&graveyard_title=${encodeURIComponent(
          entry.title || ""
        )}`;

      actions.append(
        resurrectLink
      );
    }


    article.append(
      code,
      title,
      gender,
      status
    );


    if (entry.note) {
      article.append(
        note
      );
    }


    if (actions.childElementCount > 0) {
      article.append(
        actions
      );
    }


    return article;
  }

   /* ========================================
   RENDER GRAVEYARD ENTRIES
   ======================================== */

function renderGraveyardEntries() {
  if (
    !graveyardList ||
    !graveyardStatus
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
    allGraveyardEntries.filter(
      (entry) => {

        const searchableText = [
          entry.request_code,
          entry.title,
          entry.gender,
          entry.note,
          getGraveyardStatusLabel(
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
    allGraveyardEntries.length === 0
  ) {
    graveyardStatus.textContent =
      "There are no Request Graveyard entries right now.";

    return;
  }


  if (filteredEntries.length === 0) {
    graveyardStatus.textContent =
      "No Graveyard requests match those filters.";

    return;
  }


  filteredEntries.forEach(
    (entry) => {
      graveyardList.append(
        createGraveyardCard(
          entry
        )
      );
    }
  );


  const filtersActive =
    Boolean(searchTerm) ||
    selectedStatus !== "all";


  if (filtersActive) {
    graveyardStatus.textContent =
      `${filteredEntries.length} of ${allGraveyardEntries.length} Graveyard requests shown.`;
  } else {
    graveyardStatus.textContent =
      `${allGraveyardEntries.length} Graveyard ${
        allGraveyardEntries.length === 1
          ? "request"
          : "requests"
      } loaded.`;
  }
}

  /* ========================================
   LOAD PUBLIC REQUEST GRAVEYARD
   ======================================== */

async function loadGraveyardEntries() {
  if (
    !graveyardList ||
    !graveyardStatus
  ) {
    return;
  }


  graveyardStatus.textContent =
    "Loading Request Graveyard...";


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
        note
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


    allGraveyardEntries =
      Array.isArray(data)
        ? data
        : [];


    console.log(
      "Public Graveyard entries received:",
      allGraveyardEntries
    );


    renderGraveyardEntries();


  } catch (error) {
    console.error(
      "Unable to load Request Graveyard:",
      error
    );


    allGraveyardEntries = [];

    graveyardList.replaceChildren();


    graveyardStatus.textContent =
      "The Request Graveyard could not be loaded right now.";
  }
}

/* ========================================
   GRAVEYARD FILTER EVENTS
   ======================================== */

if (graveyardSearch) {
  graveyardSearch.addEventListener(
    "input",
    () => {
      renderGraveyardEntries();
    }
  );
}


if (graveyardStatusFilter) {
  graveyardStatusFilter.addEventListener(
    "change",
    () => {
      renderGraveyardEntries();
    }
  );
}
   
  /* ========================================
     CONNECT EACH REQUEST FORM
     ======================================== */

  requestForms.forEach((form) => {
    const requestType =
      form.dataset.freeRequestForm;

    const submitButton =
      form.querySelector(
        "[data-free-request-submit]"
      );

    const statusElement =
      form.querySelector(
        "[data-free-request-status]"
      );

    form.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        const formData =
          new FormData(form);

        const submitterName =
          String(
            formData.get(
              "submitter_name"
            ) || ""
          ).trim();

        const requestDetails =
          String(
            formData.get(
              "request_details"
            ) || ""
          ).trim();


        /* VALIDATE REQUEST TYPE */

        const allowedRequestTypes = [
          "jon_bernthal",
          "graveyard"
        ];

        if (
          !allowedRequestTypes.includes(
            requestType
          )
        ) {
          console.error(
            "Invalid free request type:",
            requestType
          );

          if (statusElement) {
            statusElement.textContent =
              "This request form is not configured correctly.";
          }

          return;
        }


        /* VALIDATE DETAILS */

        if (!requestDetails) {
          if (statusElement) {
            statusElement.textContent =
              "Please enter your request before submitting.";
          }

          return;
        }


        /* LOADING */

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent =
            "Submitting...";
        }

        if (statusElement) {
          statusElement.textContent =
            "Submitting your request...";
        }


        try {
          const userId =
            await getCurrentUserId();

          const requestRecord = {
            request_type:
              requestType,

            submitter_name:
              submitterName || null,

            request_details:
              requestDetails,

            status:
              "submitted",

            user_id:
              userId
          };

          /*
           * Do not use .select() here.
           *
           * Anonymous visitors may INSERT
           * requests but are not allowed to
           * SELECT them afterward.
           */
          const {
            error
          } = await window.supabaseClient
            .from("free_requests")
            .insert(requestRecord);

          if (error) {
            throw error;
          }

          console.log(
            "Free request submitted:",
            requestType
          );

          form.reset();

          if (statusElement) {
            statusElement.textContent =
              requestType ===
                "jon_bernthal"
                ? "Your Jon Bernthal suggestion was submitted successfully."
                : "Your Graveyard request was submitted successfully.";
          }

        } catch (error) {
          console.error(
            "Unable to submit free request:",
            error
          );

          if (statusElement) {
            statusElement.textContent =
              "Your request could not be submitted right now. Please try again.";
          }

        } finally {
          if (submitButton) {
            submitButton.disabled = false;

            submitButton.textContent =
              requestType ===
                "jon_bernthal"
                ? "Submit Suggestion"
                : "Submit Graveyard Request";
          }
        }
      }
    );
  });


  /* ========================================
     LOAD PUBLIC REQUEST GRAVEYARD
     ======================================== */

  void loadGraveyardEntries();
});
