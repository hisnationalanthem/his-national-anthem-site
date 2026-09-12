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

     const commissionSubmitButton =
  document.querySelector(
    "[data-commission-submit]"
  );

     const commissionPaymentPanel =
  document.querySelector(
    "[data-commission-payment-panel]"
  );

const commissionPaymentId =
  document.querySelector(
    "[data-commission-payment-id]"
  );

const commissionPaymentTotal =
  document.querySelector(
    "[data-commission-payment-total]"
  );

const commissionPaymentStatus =
  document.querySelector(
    "[data-commission-payment-status]"
  );

const commissionStripeButton =
  document.querySelector(
    "[data-commission-pay-stripe]"
  );

     let submittedCommissionId = null;


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

     
function showCommissionPaymentPanel(
  receipt
) {
  if (
    !commissionPaymentPanel ||
    !receipt?.commission_id
  ) {
    return;
  }

  submittedCommissionId =
    receipt.commission_id;

  if (commissionPaymentId) {
    commissionPaymentId.textContent =
      receipt.commission_id;
  }

  if (commissionPaymentTotal) {
    const total =
      Number(
        receipt.total_price_cad
      );

    commissionPaymentTotal.textContent =
      Number.isFinite(total)
        ? `$${total.toFixed(2)} CAD`
        : "CAD total unavailable";
  }

  if (commissionPaymentStatus) {
    commissionPaymentStatus.textContent =
      "Payment has not been started.";
  }

  if (commissionStripeButton) {
    commissionStripeButton.disabled =
      false;

    commissionStripeButton.textContent =
      "Pay with Stripe";
  }

  commissionPaymentPanel.hidden =
    false;

  commissionPaymentPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
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
   SUBMIT COMMISSION REQUEST
   ======================================== */

if (commissionForm) {
  commissionForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();


      /* SUPABASE CHECK */

      if (!window.supabaseClient) {
        if (commissionStatus) {
          commissionStatus.textContent =
            "The commission system is unavailable right now.";
        }

        return;
      }


      /* READ FORM */

      const formData =
        new FormData(
          commissionForm
        );


      const commissionType =
        String(
          formData.get(
            "commission_type"
          ) || ""
        ).trim();


      const submitterName =
        String(
          formData.get(
            "submitter_name"
          ) || ""
        ).trim();


      const contact =
        String(
          formData.get(
            "contact"
          ) || ""
        ).trim();


      const requestDetails =
        String(
          formData.get(
            "request_details"
          ) || ""
        ).trim();


      const referenceDetails =
        String(
          formData.get(
            "reference_details"
          ) || ""
        ).trim();


      const privateUse =
        formData.get(
          "private_use"
        ) === "on";


      const extraImagesRaw =
        Number(
          formData.get(
            "extra_images"
          ) || 0
        );


      const extraImages =
        Number.isInteger(
          extraImagesRaw
        )
          ? extraImagesRaw
          : 0;


      const selectedGraveyardCode =
        String(
          formData.get(
            "graveyard_code"
          ) || ""
        ).trim();


      /* VALIDATE COMMISSION TYPE */

      const allowedCommissionTypes = [
        "new_bot",
        "alt_bot",
        "graveyard_resurrection",
        "bot_remaster",
        "media_inspired",
        "oc_creation"
      ];


      if (
        !allowedCommissionTypes.includes(
          commissionType
        )
      ) {
        if (commissionStatus) {
          commissionStatus.textContent =
            "Choose a valid commission type.";
        }

        return;
      }


      /* REQUIRED TEXT */

      if (!submitterName) {
        if (commissionStatus) {
          commissionStatus.textContent =
            "Enter your name or handle.";
        }

        return;
      }


      if (!contact) {
        if (commissionStatus) {
          commissionStatus.textContent =
            "Enter contact information.";
        }

        return;
      }


      if (!requestDetails) {
        if (commissionStatus) {
          commissionStatus.textContent =
            "Enter your commission details.";
        }

        return;
      }


      /* EXTRA IMAGES */

      if (
        extraImages < 0 ||
        extraImages > 5
      ) {
        if (commissionStatus) {
          commissionStatus.textContent =
            "Extra images must be between 0 and 5.";
        }

        return;
      }


      /* GRAVEYARD VALIDATION */

      if (
        commissionType ===
          "graveyard_resurrection" &&
        !selectedGraveyardCode
      ) {
        if (commissionStatus) {
          commissionStatus.textContent =
            "Choose a Request Graveyard entry before submitting.";
        }

        return;
      }


      /* LOADING */

      if (commissionSubmitButton) {
        commissionSubmitButton.disabled =
          true;

        commissionSubmitButton.textContent =
          "Submitting...";
      }


      if (commissionStatus) {
        commissionStatus.textContent =
          "Submitting your commission request...";
      }


      try {
        const {
          data,
          error
        } = await window.supabaseClient
          .rpc(
            "submit_commission_request",
            {
              p_commission_type:
                commissionType,

              p_submitter_name:
                submitterName,

              p_contact:
                contact,

              p_request_details:
                requestDetails,

              p_reference_details:
                referenceDetails ||
                null,

              p_private_use:
                privateUse,

              p_extra_images:
                extraImages,

              p_graveyard_code:
                commissionType ===
                  "graveyard_resurrection"
                  ? selectedGraveyardCode
                  : null
            }
          );


        if (error) {
          throw error;
        }


        const receipt =
          Array.isArray(data)
            ? data[0]
            : data;

         showCommissionPaymentPanel(
  receipt
);

        console.log(
          "Commission request submitted:",
          receipt
        );


        if (commissionStatus) {
          commissionStatus.textContent =
            receipt?.total_price_cad != null
              ? `Commission request submitted successfully. Estimated total: $${receipt.total_price_cad} CAD. Payment has not been collected yet.`
              : "Commission request submitted successfully. Payment has not been collected yet.";
        }


        /*
         * Leave the form populated for now.
         * Payment checkout will use the newly
         * created commission record in a later step.
         */
        if (commissionSubmitButton) {
          commissionSubmitButton.textContent =
            "Commission Submitted";
        }


      } catch (error) {
        console.error(
          "Unable to submit commission request:",
          error
        );


        if (commissionStatus) {
          commissionStatus.textContent =
            error?.message ||
            "Your commission request could not be submitted right now.";
        }


        if (commissionSubmitButton) {
          commissionSubmitButton.disabled =
            false;

          commissionSubmitButton.textContent =
            "Submit Commission Request";
        }
      }
    }
  );
}

     /* ==========================================================
   STRIPE CHECKOUT
   ========================================================== */

if (commissionStripeButton) {
  commissionStripeButton.addEventListener(
    "click",
    async () => {

      if (
        !window.supabaseClient ||
        !submittedCommissionId
      ) {
        if (commissionPaymentStatus) {
          commissionPaymentStatus.textContent =
            "Unable to start payment. Please submit the commission first.";
        }

        return;
      }


      commissionStripeButton.disabled =
        true;

      commissionStripeButton.textContent =
        "Opening Stripe...";


      if (commissionPaymentStatus) {
        commissionPaymentStatus.textContent =
          "Creating secure Stripe checkout...";
      }


      try {
        const {
          data,
          error
        } =
          await window.supabaseClient
            .functions
            .invoke(
              "create-stripe-checkout",
              {
                body: {
                  commission_id:
                    submittedCommissionId
                }
              }
            );


        if (error) {
          throw error;
        }


        const checkoutUrl =
          String(
            data?.checkout_url ||
            ""
          ).trim();


        if (!checkoutUrl) {
          throw new Error(
            "Stripe did not return a checkout URL."
          );
        }


        if (commissionPaymentStatus) {
          commissionPaymentStatus.textContent =
            "Redirecting to secure Stripe checkout...";
        }


        window.location.assign(
          checkoutUrl
        );


      } catch (error) {
        console.error(
          "Stripe checkout error:",
          error
        );


        if (commissionPaymentStatus) {
          commissionPaymentStatus.textContent =
            "Unable to open Stripe checkout. Your commission was still submitted and has not been charged.";
        }


        commissionStripeButton.disabled =
          false;

        commissionStripeButton.textContent =
          "Pay with Stripe";
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
