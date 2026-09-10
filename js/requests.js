/* ========================================
   HIS_NATIONAL_ANTHEM
   Free Request System
   ======================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const requestForms =
      document.querySelectorAll(
        "[data-free-request-form]"
      );


    if (requestForms.length === 0) {
      return;
    }


    /* ========================================
       SUPABASE CHECK
       ======================================== */

    if (!window.supabaseClient) {
      console.error(
        "Free request forms could not initialize: Supabase client unavailable."
      );

      requestForms.forEach(
        (form) => {
          const status =
            form.querySelector(
              "[data-free-request-status]"
            );

          const submitButton =
            form.querySelector(
              "[data-free-request-submit]"
            );

          if (status) {
            status.textContent =
              "The request system is unavailable right now.";
          }

          if (submitButton) {
            submitButton.disabled = true;
          }
        }
      );

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
       CONNECT EACH REQUEST FORM
       ======================================== */

    requestForms.forEach(
      (form) => {

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
      }
    );

  }
);
