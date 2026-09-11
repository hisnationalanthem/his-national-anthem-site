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


    /* COMMISSION FORM */

    const commissionForm =
      document.querySelector(
        "[data-commission-form]"
      );

    const commissionTypeSelect =
      document.querySelector(
        "[data-commission-type]"
      );

    const graveyardField =
      document.querySelector(
        "[data-commission-graveyard-field]"
      );

    const graveyardSelection =
      document.querySelector(
        "[data-commission-graveyard-selection]"
      );

    const graveyardCodeInput =
      document.querySelector(
        "[data-commission-graveyard-code]"
      );

    const graveyardTitleInput =
      document.querySelector(
        "[data-commission-graveyard-title]"
      );

    const extraImagesSelect =
      document.querySelector(
        "[data-commission-extra-images]"
      );

    const commissionTotal =
      document.querySelector(
        "[data-commission-total]"
      );

    const commissionStatus =
      document.querySelector(
        "[data-commission-status]"
      );


    /* ========================================
       URL PARAMETERS
       ======================================== */

    const params =
      new URLSearchParams(
        window.location.search
      );


    const commissionTypeParam =
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
       COMMISSION PRICES
       ======================================== */

    const commissionPrices = {
      new_bot: 15,
      alt_bot: 10,
      graveyard_resurrection: 15,
      bot_remaster: 10,
      media_inspired: 20,
      oc_creation: 15
    };


    /* ========================================
       GRAVEYARD VALIDATION
       ======================================== */

    const validGraveyardCode =
      /^RG-\d{3,}$/.test(
        graveyardCode
      );


    const hasValidGraveyardSelection =
      validGraveyardCode &&
      Boolean(graveyardTitle);


    const openedFromGraveyard =
      commissionTypeParam ===
      "Graveyard Resurrection";


    /* ========================================
       SHOW SELECTED GRAVEYARD PANEL
       ======================================== */

    if (openedFromGraveyard) {

      if (selectedGraveyardPanel) {
        selectedGraveyardPanel.hidden =
          false;
      }


      if (hasValidGraveyardSelection) {

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


      } else {

        if (selectedGraveyardStatus) {
          selectedGraveyardStatus.textContent =
            "The selected Graveyard request could not be identified. Please choose it again from the Request Graveyard.";
        }
      }


      if (graveyardCommissionCard) {
        graveyardCommissionCard.setAttribute(
          "aria-current",
          "true"
        );
      }
    }


    /* ========================================
       UPDATE GRAVEYARD FORM FIELD
       ======================================== */

    function updateGraveyardField() {
      if (
        !commissionTypeSelect ||
        !graveyardField
      ) {
        return;
      }


      const isGraveyard =
        commissionTypeSelect.value ===
        "graveyard_resurrection";


      graveyardField.hidden =
        !isGraveyard;


      if (!isGraveyard) {

        if (graveyardSelection) {
          graveyardSelection.value =
            "";
        }


        if (graveyardCodeInput) {
          graveyardCodeInput.value =
            "";
        }


        if (graveyardTitleInput) {
          graveyardTitleInput.value =
            "";
        }


        return;
      }


      if (hasValidGraveyardSelection) {

        if (graveyardSelection) {
          graveyardSelection.value =
            `${graveyardCode} — ${graveyardTitle}`;
        }


        if (graveyardCodeInput) {
          graveyardCodeInput.value =
            graveyardCode;
        }


        if (graveyardTitleInput) {
          graveyardTitleInput.value =
            graveyardTitle;
        }


      } else {

        if (graveyardSelection) {
          graveyardSelection.value =
            "No Graveyard request selected";
        }


        if (graveyardCodeInput) {
          graveyardCodeInput.value =
            "";
        }


        if (graveyardTitleInput) {
          graveyardTitleInput.value =
            "";
        }
      }
    }


    /* ========================================
       CALCULATE COMMISSION TOTAL
       ======================================== */

    function updateCommissionTotal() {
      if (!commissionTotal) {
        return;
      }


      const commissionType =
        commissionTypeSelect?.value ||
        "";


      if (
        !commissionType ||
        !Object.prototype.hasOwnProperty.call(
          commissionPrices,
          commissionType
        )
      ) {
        commissionTotal.textContent =
          "Select a commission type";

        return;
      }


      const basePrice =
        commissionPrices[
          commissionType
        ];


      const extraImagesRaw =
        Number(
          extraImagesSelect?.value ||
          0
        );


      const extraImages =
        Number.isInteger(
          extraImagesRaw
        )
          ? Math.min(
              Math.max(
                extraImagesRaw,
                0
              ),
              5
            )
          : 0;


      const total =
        basePrice +
        extraImages;


      commissionTotal.textContent =
        `$${total} CAD`;
    }


    /* ========================================
       PREFILL GRAVEYARD COMMISSION
       ======================================== */

    if (
      openedFromGraveyard &&
      commissionTypeSelect
    ) {
      commissionTypeSelect.value =
        "graveyard_resurrection";
    }


    updateGraveyardField();
    updateCommissionTotal();


    /* ========================================
       COMMISSION TYPE CHANGE
       ======================================== */

    if (commissionTypeSelect) {
      commissionTypeSelect.addEventListener(
        "change",
        () => {
          updateGraveyardField();
          updateCommissionTotal();
        }
      );
    }


    /* ========================================
       EXTRA IMAGE CHANGE
       ======================================== */

    if (extraImagesSelect) {
      extraImagesSelect.addEventListener(
        "change",
        () => {
          updateCommissionTotal();
        }
      );
    }


    /* ========================================
       TEMPORARY SUBMIT HANDLER
       ======================================== */

    if (commissionForm) {
      commissionForm.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();


          if (commissionStatus) {
            commissionStatus.textContent =
              "Commission submission is not connected yet. Your request has not been sent.";
          }
        }
      );
    }


    /* ========================================
       DEBUG
       ======================================== */

    if (openedFromGraveyard) {
      console.log(
        "Graveyard Resurrection selected:",
        {
          graveyardCode,
          graveyardTitle
        }
      );
    }

  }
);
