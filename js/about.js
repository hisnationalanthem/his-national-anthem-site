document.addEventListener(
  "DOMContentLoaded",
  () => {
    const form =
      document.querySelector(
        "[data-ama-form]"
      );

    if (!form) {
      return;
    }


    const submitButton =
      form.querySelector(
        "[data-ama-submit]"
      );

    const statusElement =
      form.querySelector(
        "[data-ama-status]"
      );


    async function getCurrentUserId() {
      if (!window.supabaseClient) {
        return null;
      }

      try {
        const {
          data,
          error
        } =
          await window.supabaseClient
            .auth
            .getUser();

        if (error) {
          return null;
        }

        return data?.user?.id || null;
      } catch {
        return null;
      }
    }


    function setLoading(isLoading) {
      if (!submitButton) {
        return;
      }

      submitButton.disabled =
        isLoading;

      submitButton.textContent =
        isLoading
          ? "Submitting..."
          : "Submit Question";
    }


    form.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();


        if (!window.supabaseClient) {
          if (statusElement) {
            statusElement.textContent =
              "The submission system is unavailable right now.";
          }

          return;
        }


        const formData =
          new FormData(form);


        const submitterName =
          String(
            formData.get(
              "submitter_name"
            ) || ""
          ).trim();


        const question =
          String(
            formData.get(
              "question"
            ) || ""
          ).trim();


        const anonymous =
          formData.get(
            "anonymous"
          ) === "true";


        if (!question) {
          if (statusElement) {
            statusElement.textContent =
              "Please enter a question before submitting.";
          }

          return;
        }


        setLoading(true);

        if (statusElement) {
          statusElement.textContent =
            "Submitting your question...";
        }


        try {
          const userId =
            await getCurrentUserId();


          const questionRecord = {
            user_id:
              userId,

            submitter_name:
              anonymous
                ? null
                : submitterName || null,

            question:
              question,

            anonymous:
              anonymous,

            status:
              "submitted"
          };


          /*
           * Do not use .select() here.
           *
           * Anonymous visitors may INSERT AMA
           * questions but are not permitted to
           * read the inserted row afterward.
           */
          const {
            error
          } =
            await window.supabaseClient
              .from(
                "ama_questions"
              )
              .insert(
                questionRecord
              );


          if (error) {
            throw error;
          }


          form.reset();


          if (statusElement) {
            statusElement.textContent =
              "Your question was submitted successfully.";
          }

        } catch (error) {
          console.error(
            "Unable to submit AMA question:",
            error
          );


          if (statusElement) {
            statusElement.textContent =
              "Your question could not be submitted right now. Please try again.";
          }

        } finally {
          setLoading(false);
        }
      }
    );
  }
);
