document.addEventListener(
  "DOMContentLoaded",
  () => {
    const publishedList =
      document.querySelector(
        "[data-ama-published-list]"
      );

    const publishedStatus =
      document.querySelector(
        "[data-ama-published-status]"
      );


    async function loadPublishedAmaQuestions() {
      if (!publishedList) {
        return;
      }

      if (!window.supabaseClient) {
        if (publishedStatus) {
          publishedStatus.textContent =
            "Published questions could not be loaded.";
        }

        return;
      }


      if (publishedStatus) {
        publishedStatus.textContent =
          "Loading published questions...";
      }


      try {
        const {
          data,
          error
        } =
          await window.supabaseClient
            .from("ama_questions")
            .select(`
              id,
              submitter_name,
              question,
              anonymous,
              answer,
              answered_at
            `)
            .eq(
              "published",
              true
            )
            .eq(
              "status",
              "answered"
            )
            .not(
              "answer",
              "is",
              null
            )
            .not(
              "answered_at",
              "is",
              null
            )
            .order(
              "answered_at",
              {
                ascending: false
              }
            );


        if (error) {
          throw error;
        }


        publishedList.replaceChildren();


        if (!data || data.length === 0) {
          if (publishedStatus) {
            publishedStatus.textContent =
              "No published AMA answers yet.";
          }

          return;
        }


        data.forEach((entry) => {
          const card =
            document.createElement(
              "article"
            );

          card.className =
            "ama-answer-card";


          const header =
            document.createElement(
              "div"
            );

          header.className =
            "ama-answer-card-header";


          const name =
            document.createElement(
              "p"
            );

          name.className =
            "ama-answer-name";

          name.textContent =
            entry.anonymous
              ? "Anonymous"
              : String(
                  entry.submitter_name ||
                  "Anonymous"
                );


          const date =
            document.createElement(
              "p"
            );

          date.className =
            "ama-answer-date";

          if (entry.answered_at) {
            const parsedDate =
              new Date(
                entry.answered_at
              );

            if (
              !Number.isNaN(
                parsedDate.getTime()
              )
            ) {
              date.textContent =
                parsedDate.toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  }
                );
            }
          }


          header.append(
            name,
            date
          );


          const questionLabel =
            document.createElement(
              "p"
            );

          questionLabel.className =
            "panel-label";

          questionLabel.textContent =
            "Question";


          const question =
            document.createElement(
              "p"
            );

          question.className =
            "ama-answer-question";

          question.textContent =
            String(
              entry.question || ""
            );


          const answerLabel =
            document.createElement(
              "p"
            );

          answerLabel.className =
            "panel-label";

          answerLabel.textContent =
            "Answer";


          const answer =
            document.createElement(
              "p"
            );

          answer.className =
            "ama-answer-text";

          answer.textContent =
            String(
              entry.answer || ""
            );


          card.append(
            header,
            questionLabel,
            question,
            answerLabel,
            answer
          );


          publishedList.appendChild(
            card
          );
        });


        if (publishedStatus) {
          publishedStatus.textContent =
            "";
        }

      } catch (error) {
        console.error(
          "Unable to load published AMA questions:",
          error
        );

        if (publishedStatus) {
          publishedStatus.textContent =
            "Published questions could not be loaded right now.";
        }
      }
    }


    void loadPublishedAmaQuestions();


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
