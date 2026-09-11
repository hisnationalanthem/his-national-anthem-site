/* ========================================
   HIS_NATIONAL_ANTHEM
   Commission System
   ======================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* ========================================
       ELEMENTS
       ======================================== */

    const selectedGraveyardPanel =
      document.querySelector(
        "[data-selected-graveyard-panel]"
      );

    const selectedGraveyardCode =
      document.querySelector(
        "[data-selected-graveyard-code]"
      );

    const selectedGraveyardTitle =
      document.querySelector(
        "[data-selected-graveyard-title]"
      );

    const selectedGraveyardStatus =
      document.querySelector(
        "[data-selected-graveyard-status]"
      );

    const graveyardCommissionCard =
      document.querySelector(
        '[data-commission-option="graveyard_resurrection"]'
      );


    /* ========================================
       URL PARAMETERS
       ======================================== */

    const params =
      new URLSearchParams(
        window.location.search
      );


    const commissionType =
      String(
        params.get(
          "commission_type"
        ) || ""
      ).trim();


    const graveyardCode =
      String(
        params.get(
          "graveyard_id"
        ) || ""
      ).trim();


    const graveyardTitle =
      String(
        params.get(
          "graveyard_title"
        ) || ""
      ).trim();


    /* ========================================
       GRAVEYARD RESURRECTION HANDOFF
       ======================================== */

    const isGraveyardResurrection =
      commissionType ===
      "Graveyard Resurrection";


    if (!isGraveyardResurrection) {
      return;
    }


    /* VALIDATE RG NUMBER */

    const validGraveyardCode =
      /^RG-\d{3,}$/.test(
        graveyardCode
      );


    if (
      !validGraveyardCode ||
      !graveyardTitle
    ) {
      console.warn(
        "Incomplete Graveyard Resurrection parameters.",
        {
          graveyardCode,
          graveyardTitle
        }
      );


      if (selectedGraveyardPanel) {
        selectedGraveyardPanel.hidden =
          false;
      }


      if (selectedGraveyardStatus) {
        selectedGraveyardStatus.textContent =
          "The selected Graveyard request could not be identified. Please choose it again from the Request Graveyard.";
      }


      return;
    }


    /* SHOW SELECTED REQUEST */

    if (selectedGraveyardCode) {
      selectedGraveyardCode.value =
        graveyardCode;
    }


    if (selectedGraveyardTitle) {
      selectedGraveyardTitle.value =
        graveyardTitle;
    }


    if (selectedGraveyardStatus) {
      selectedGraveyardStatus.textContent =
        `${graveyardCode} is selected for this Graveyard Resurrection commission.`;
    }


    if (selectedGraveyardPanel) {
      selectedGraveyardPanel.hidden =
        false;
    }


    /* MARK GRAVEYARD COMMISSION OPTION */

    if (graveyardCommissionCard) {
      graveyardCommissionCard.setAttribute(
        "aria-current",
        "true"
      );
    }


    console.log(
      "Graveyard Resurrection selected:",
      {
        graveyardCode,
        graveyardTitle
      }
    );

  }
);
