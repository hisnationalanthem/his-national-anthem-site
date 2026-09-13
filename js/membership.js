/* ========================================
   HIS_NATIONAL_ANTHEM
   Membership System
   ======================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* ========================================
       ELEMENTS
       ======================================== */

    const signedOutView =
      document.querySelector(
        "[data-member-signed-out]"
      );

    const signedInView =
      document.querySelector(
        "[data-member-signed-in]"
      );

    const signupForm =
      document.querySelector(
        "[data-member-signup-form]"
      );

    const loginForm =
      document.querySelector(
        "[data-member-login-form]"
      );

    const signupButton =
      document.querySelector(
        "[data-member-signup-submit]"
      );

    const loginButton =
      document.querySelector(
        "[data-member-login-submit]"
      );

    const logoutButton =
      document.querySelector(
        "[data-member-logout]"
      );

    const memberEmail =
      document.querySelector(
        "[data-member-email]"
      );

    const memberDisplayName =
      document.querySelector(
        "[data-member-display-name]"
      );

    const authStatus =
      document.querySelector(
        "[data-member-auth-status]"
      );

    const accountStatus =
      document.querySelector(
        "[data-member-account-status]"
      );

    const creditBalance =
      document.querySelector(
        "[data-member-credit-balance]"
      );

    const creditNote =
      document.querySelector(
        "[data-member-credit-note]"
      );

    const membershipStatus =
      document.querySelector(
        "[data-membership-status]"
      );

    const membershipPeriodWrap =
      document.querySelector(
        "[data-membership-period-wrap]"
      );

    const membershipPeriod =
      document.querySelector(
        "[data-membership-period]"
      );

    const membershipRenewalWrap =
      document.querySelector(
        "[data-membership-renewal-wrap]"
      );

    const membershipRenewal =
      document.querySelector(
        "[data-membership-renewal]"
      );

    const membershipStatusMessage =
      document.querySelector(
        "[data-membership-status-message]"
      );

    const stripeSubscribeButton =
      document.querySelector(
        "[data-membership-stripe-subscribe]"
      );

    const checkoutStatus =
      document.querySelector(
        "[data-membership-checkout-status]"
      );


    /* ========================================
       STATE
       ======================================== */

    let currentSession =
      null;

    let currentMembership =
      null;


    /* ========================================
       BASIC HELPERS
       ======================================== */

    function setText(
      element,
      value
    ) {

      if (!element) {
        return;
      }

      element.textContent =
        value;
    }


    function setButtonLoading(
      button,
      loading,
      normalText,
      loadingText
    ) {

      if (!button) {
        return;
      }

      button.disabled =
        loading;

      button.textContent =
        loading
          ? loadingText
          : normalText;
    }


    function formatDate(
      value
    ) {

      if (!value) {
        return "—";
      }


      const date =
        new Date(
          value
        );


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "—";
      }


      return new Intl.DateTimeFormat(
        undefined,
        {
          dateStyle:
            "medium"
        }
      ).format(
        date
      );
    }


    function membershipStatusLabel(
      value
    ) {

      const labels = {
        inactive:
          "Inactive",

        pending:
          "Checkout Pending",

        active:
          "Active",

        past_due:
          "Payment Past Due",

        suspended:
          "Suspended",

        cancelled:
          "Cancelled",

        expired:
          "Expired"
      };


      return (
        labels[value] ||
        "Inactive"
      );
    }


    async function getFunctionErrorMessage(
      error,
      fallback
    ) {

      let message =
        String(
          error?.message ||
          fallback
        );


      const response =
        error?.context;


      if (
        response &&
        typeof response.clone ===
          "function"
      ) {

        try {

          const payload =
            await response
              .clone()
              .json();


          if (
            payload?.error
          ) {
            message =
              String(
                payload.error
              );
          }

        } catch {
          // Use the fallback error message.
        }
      }


      return message;
    }


    /* ========================================
       SIGNED-OUT VIEW
       ======================================== */

    function renderSignedOut() {

      currentSession =
        null;

      currentMembership =
        null;


      if (signedOutView) {
        signedOutView.hidden =
          false;
      }


      if (signedInView) {
        signedInView.hidden =
          true;
      }


      setText(
        memberEmail,
        "—"
      );

      setText(
        memberDisplayName,
        "—"
      );


      setText(
        creditBalance,
        "—"
      );

      setText(
        creditNote,
        "Sign in to view your balance"
      );


      setText(
        membershipStatus,
        "Sign in required"
      );


      if (membershipPeriodWrap) {
        membershipPeriodWrap.hidden =
          true;
      }


      if (membershipRenewalWrap) {
        membershipRenewalWrap.hidden =
          true;
      }


      setText(
        membershipStatusMessage,
        ""
      );


      if (stripeSubscribeButton) {
        stripeSubscribeButton.disabled =
          true;
      }


      setText(
        checkoutStatus,
        "Sign in before starting a membership."
      );
    }


    /* ========================================
       LOAD PROFILE
       ======================================== */

    async function loadProfile(
      user
    ) {

      const {
        data,
        error
      } =
        await window
          .supabaseClient
          .from(
            "profiles"
          )
          .select(`
            id,
            display_name,
            role
          `)
          .eq(
            "id",
            user.id
          )
          .maybeSingle();


      if (error) {

        console.warn(
          "Unable to load member profile:",
          error
        );


        return null;
      }


      return data;
    }


    /* ========================================
       LOAD MEMBERSHIP
       ======================================== */

    async function loadMembership(
      userId
    ) {

      const {
        data,
        error
      } =
        await window
          .supabaseClient
          .from(
            "memberships"
          )
          .select(`
            id,
            user_id,
            tier,
            provider,
            provider_subscription_id,
            provider_checkout_id,
            status,
            current_period_start,
            current_period_end,
            cancel_at_period_end,
            created_at,
            updated_at
          `)
          .eq(
            "user_id",
            userId
          )
          .order(
            "created_at",
            {
              ascending:
                false
            }
          )
          .limit(1)
          .maybeSingle();


      if (error) {
        console.error(
          "Unable to load membership:",
          error
        );

        throw error;
      }


      return data;
    }


    /* ========================================
       LOAD CREDIT BALANCE
       ======================================== */

    async function loadCreditBalance() {

      const {
        data,
        error
      } =
        await window
          .supabaseClient
          .rpc(
            "get_my_member_credit_balance"
          );


      if (error) {
        console.error(
          "Unable to load member credit balance:",
          error
        );

        throw error;
      }


      const balance =
        Number(
          data ?? 0
        );


      return Number.isFinite(
        balance
      )
        ? balance
        : 0;
    }


    /* ========================================
       RENDER MEMBERSHIP
       ======================================== */

    function renderMembership(
      membership
    ) {

      currentMembership =
        membership ||
        null;


      /*
        NO MEMBERSHIP
      */

      if (!membership) {

        setText(
          membershipStatus,
          "Not Subscribed"
        );


        if (membershipPeriodWrap) {
          membershipPeriodWrap.hidden =
            true;
        }


        if (membershipRenewalWrap) {
          membershipRenewalWrap.hidden =
            true;
        }


        setText(
          membershipStatusMessage,
          "You do not currently have a Mama's Baby membership."
        );


        if (stripeSubscribeButton) {
          stripeSubscribeButton.disabled =
            false;
        }


        setText(
          checkoutStatus,
          "You can start a $10 CAD monthly membership through Stripe."
        );


        return;
      }


      const status =
        String(
          membership.status ||
          "inactive"
        );


      setText(
        membershipStatus,
        membershipStatusLabel(
          status
        )
      );


      /*
        PERIOD
      */

      if (
        membership
          .current_period_start ||
        membership
          .current_period_end
      ) {

        if (membershipPeriodWrap) {
          membershipPeriodWrap.hidden =
            false;
        }


        setText(
          membershipPeriod,
          `${formatDate(
            membership.current_period_start
          )} – ${formatDate(
            membership.current_period_end
          )}`
        );

      } else {

        if (membershipPeriodWrap) {
          membershipPeriodWrap.hidden =
            true;
        }
      }


      /*
        RENEWAL
      */

      if (
        status ===
          "active" ||
        status ===
          "past_due" ||
        status ===
          "suspended"
      ) {

        if (membershipRenewalWrap) {
          membershipRenewalWrap.hidden =
            false;
        }


        setText(
          membershipRenewal,
          membership
            .cancel_at_period_end
            ? "Cancels at the end of the current billing period"
            : "Monthly"
        );

      } else {

        if (membershipRenewalWrap) {
          membershipRenewalWrap.hidden =
            true;
        }
      }


      /*
        SUBSCRIBE BUTTON RULES
      */

      const canSubscribe =
        [
          "inactive",
          "cancelled",
          "expired"
        ].includes(
          status
        );


      if (stripeSubscribeButton) {
        stripeSubscribeButton.disabled =
          !canSubscribe;
      }


      /*
        MESSAGES
      */

      switch (status) {

        case "pending":

          setText(
            membershipStatusMessage,
            "Your membership checkout has been started but has not been activated yet."
          );

          setText(
            checkoutStatus,
            "A Stripe membership checkout is already in progress."
          );

          break;


        case "active":

          setText(
            membershipStatusMessage,
            "Your Mama's Baby membership is active."
          );

          setText(
            checkoutStatus,
            "Your membership is already active."
          );

          break;


        case "past_due":

          setText(
            membershipStatusMessage,
            "Stripe reported that your membership payment is past due."
          );

          setText(
            checkoutStatus,
            "Your existing membership needs payment attention before another membership can be started."
          );

          break;


        case "suspended":

          setText(
            membershipStatusMessage,
            "Your membership is currently suspended."
          );

          setText(
            checkoutStatus,
            "Your existing membership must be resolved before another membership can be started."
          );

          break;


        case "cancelled":

          setText(
            membershipStatusMessage,
            "Your previous membership has been cancelled."
          );

          setText(
            checkoutStatus,
            "You may start a new membership."
          );

          break;


        case "expired":

          setText(
            membershipStatusMessage,
            "Your previous membership checkout expired."
          );

          setText(
            checkoutStatus,
            "You may start a new Stripe checkout."
          );

          break;


        default:

          setText(
            membershipStatusMessage,
            "You do not currently have an active membership."
          );

          setText(
            checkoutStatus,
            "You may start a $10 CAD monthly membership through Stripe."
          );
      }
    }


    /* ========================================
       REFRESH MEMBER DASHBOARD
       ======================================== */

    async function refreshMemberState(
      suppliedSession
    ) {

      try {

        const session =
          suppliedSession ===
            undefined
            ? await window
                .anthemAuth
                .getSession()
            : suppliedSession;


        currentSession =
          session ||
          null;


        if (
          !session?.user
        ) {
          renderSignedOut();
          return;
        }


        const user =
          session.user;


        if (signedOutView) {
          signedOutView.hidden =
            true;
        }


        if (signedInView) {
          signedInView.hidden =
            false;
        }


        setText(
          memberEmail,
          user.email ||
          "Signed-in member"
        );


        setText(
          accountStatus,
          "Loading your member account..."
        );


        setText(
          creditNote,
          "Loading balance..."
        );


        setText(
          membershipStatus,
          "Loading..."
        );


        if (stripeSubscribeButton) {
          stripeSubscribeButton.disabled =
            true;
        }


        const [
          profileResult,
          membershipResult,
          balanceResult
        ] =
          await Promise.allSettled([
            loadProfile(
              user
            ),

            loadMembership(
              user.id
            ),

            loadCreditBalance()
          ]);


        /*
          PROFILE
        */

        let displayName =
          String(
            user
              ?.user_metadata
              ?.display_name ||
            ""
          ).trim();


        if (
          profileResult.status ===
            "fulfilled" &&
          profileResult.value
            ?.display_name
        ) {
          displayName =
            String(
              profileResult
                .value
                .display_name
            );
        }


        setText(
          memberDisplayName,
          displayName ||
          "Member"
        );


        /*
          MEMBERSHIP
        */

        if (
          membershipResult.status ===
            "fulfilled"
        ) {

          renderMembership(
            membershipResult.value
          );

        } else {

          console.error(
            "Membership dashboard load failed:",
            membershipResult.reason
          );


          setText(
            membershipStatus,
            "Unavailable"
          );


          setText(
            membershipStatusMessage,
            "Your membership information could not be loaded."
          );


          setText(
            checkoutStatus,
            "Membership checkout is temporarily unavailable."
          );
        }


        /*
          CREDITS
        */

        if (
          balanceResult.status ===
            "fulfilled"
        ) {

          setText(
            creditBalance,
            String(
              balanceResult.value
            )
          );


          setText(
            creditNote,
            `${balanceResult.value} of 20 credits currently available`
          );

        } else {

          console.error(
            "Credit balance load failed:",
            balanceResult.reason
          );


          setText(
            creditBalance,
            "—"
          );


          setText(
            creditNote,
            "Your credit balance could not be loaded."
          );
        }


        setText(
          accountStatus,
          ""
        );


      } catch (error) {

        console.error(
          "Unable to refresh member state:",
          error
        );


        setText(
          accountStatus,
          "Your member account could not be loaded."
        );
      }
    }


    /* ========================================
       SIGN UP
       ======================================== */

    if (signupForm) {

      signupForm.addEventListener(
        "submit",
        async (
          event
        ) => {

          event.preventDefault();


          const formData =
            new FormData(
              signupForm
            );


          const displayName =
            String(
              formData.get(
                "display_name"
              ) || ""
            ).trim();


          const email =
            String(
              formData.get(
                "email"
              ) || ""
            ).trim();


          const password =
            String(
              formData.get(
                "password"
              ) || ""
            );


          if (
            password.length <
              8
          ) {
            setText(
              authStatus,
              "Password must be at least 8 characters."
            );

            return;
          }


          setButtonLoading(
            signupButton,
            true,
            "Create Account",
            "Creating Account..."
          );


          setText(
            authStatus,
            "Creating your account..."
          );


          try {

            const result =
              await window
                .anthemAuth
                .signUp({
                  email,
                  password,
                  displayName
                });


            signupForm.reset();


            if (
              result?.session
            ) {

              setText(
                authStatus,
                "Account created. You are signed in."
              );


              await refreshMemberState(
                result.session
              );

            } else {

              setText(
                authStatus,
                "Account created. Check your email and confirm your address, then return here to sign in."
              );
            }


          } catch (error) {

            console.error(
              "Membership signup error:",
              error
            );


            setText(
              authStatus,
              error?.message ||
              "Your account could not be created."
            );

          } finally {

            setButtonLoading(
              signupButton,
              false,
              "Create Account",
              "Creating Account..."
            );
          }
        }
      );
    }


    /* ========================================
       SIGN IN
       ======================================== */

    if (loginForm) {

      loginForm.addEventListener(
        "submit",
        async (
          event
        ) => {

          event.preventDefault();


          const formData =
            new FormData(
              loginForm
            );


          const email =
            String(
              formData.get(
                "email"
              ) || ""
            ).trim();


          const password =
            String(
              formData.get(
                "password"
              ) || ""
            );


          setButtonLoading(
            loginButton,
            true,
            "Sign In",
            "Signing In..."
          );


          setText(
            authStatus,
            "Signing in..."
          );


          try {

            const result =
              await window
                .anthemAuth
                .signIn({
                  email,
                  password
                });


            loginForm.reset();


            setText(
              authStatus,
              ""
            );


            await refreshMemberState(
              result?.session ||
              null
            );


          } catch (error) {

            console.error(
              "Membership login error:",
              error
            );


            setText(
              authStatus,
              error?.message ||
              "Unable to sign in."
            );

          } finally {

            setButtonLoading(
              loginButton,
              false,
              "Sign In",
              "Signing In..."
            );
          }
        }
      );
    }


    /* ========================================
       SIGN OUT
       ======================================== */

    if (logoutButton) {

      logoutButton.addEventListener(
        "click",
        async () => {

          logoutButton.disabled =
            true;


          setText(
            accountStatus,
            "Signing out..."
          );


          try {

            await window
              .anthemAuth
              .signOut();


            renderSignedOut();


            setText(
              authStatus,
              "You have been signed out."
            );


          } catch (error) {

            console.error(
              "Membership logout error:",
              error
            );


            setText(
              accountStatus,
              error?.message ||
              "Unable to sign out."
            );

          } finally {

            logoutButton.disabled =
              false;
          }
        }
      );
    }


    /* ========================================
       STRIPE MEMBERSHIP CHECKOUT
       ======================================== */

    if (
      stripeSubscribeButton
    ) {

      stripeSubscribeButton.addEventListener(
        "click",
        async () => {

          if (
            !currentSession?.user
          ) {

            setText(
              checkoutStatus,
              "Sign in before starting a membership."
            );

            return;
          }


          setButtonLoading(
            stripeSubscribeButton,
            true,
            "Subscribe with Stripe",
            "Opening Stripe..."
          );


          setText(
            checkoutStatus,
            "Creating your secure Stripe membership checkout..."
          );


          try {

            const {
              data,
              error
            } =
              await window
                .supabaseClient
                .functions
                .invoke(
                  "create-stripe-membership-checkout",
                  {
                    body: {}
                  }
                );


            if (error) {

              const message =
                await getFunctionErrorMessage(
                  error,
                  "Unable to create membership checkout."
                );


              throw new Error(
                message
              );
            }


            const checkoutUrl =
              String(
                data
                  ?.checkout_url ||
                ""
              ).trim();


            if (!checkoutUrl) {
              throw new Error(
                "Stripe did not return a checkout URL."
              );
            }


            setText(
              checkoutStatus,
              data?.reused
                ? "Reopening your existing Stripe checkout..."
                : "Opening secure Stripe checkout..."
            );


            window.location.assign(
              checkoutUrl
            );


          } catch (error) {

            console.error(
              "Stripe membership checkout error:",
              error
            );


            setText(
              checkoutStatus,
              error?.message ||
              "Unable to start Stripe checkout."
            );


            /*
              Reload state in case the
              server created or changed
              a membership row.
            */

            await refreshMemberState();


          } finally {

            /*
              If navigation succeeds this
              page disappears. If it fails,
              refreshMemberState controls
              whether the button is enabled.
            */

            if (
              !currentMembership ||
              [
                "inactive",
                "cancelled",
                "expired"
              ].includes(
                currentMembership
                  ?.status
              )
            ) {

              setButtonLoading(
                stripeSubscribeButton,
                false,
                "Subscribe with Stripe",
                "Opening Stripe..."
              );
            }
          }
        }
      );
    }


    /* ========================================
       STRIPE RETURN MESSAGE
       ======================================== */

    function showMembershipReturnMessage() {

      const params =
        new URLSearchParams(
          window.location.search
        );


      const result =
        params.get(
          "membership"
        );


      if (
        result ===
          "stripe-success"
      ) {

        setText(
          checkoutStatus,
          "Stripe checkout completed. Confirming your membership..."
        );

      }


      else if (
        result ===
          "stripe-cancelled"
      ) {

        setText(
          checkoutStatus,
          "Stripe checkout was cancelled. You were not subscribed from this cancelled checkout."
        );
      }
    }


    /* ========================================
       AUTH STATE CHANGES
       ======================================== */

    function startAuthListener() {

      try {

        window
          .anthemAuth
          .onAuthStateChange(
            (
              event,
              session
            ) => {

              /*
                Supabase recommends avoiding
                additional awaited auth work
                directly inside this callback.
              */

              window.setTimeout(
                () => {

                  refreshMemberState(
                    session
                  );

                },
                0
              );
            }
          );

      } catch (error) {

        console.error(
          "Unable to start auth listener:",
          error
        );
      }
    }


    /* ========================================
       START
       ======================================== */

    async function start() {

      if (
        !window.supabaseClient ||
        !window.anthemAuth
      ) {

        console.error(
          "Membership page could not initialize."
        );


        setText(
          authStatus,
          "The member account system is unavailable right now."
        );


        setText(
          checkoutStatus,
          "Membership checkout is unavailable right now."
        );


        if (
          stripeSubscribeButton
        ) {
          stripeSubscribeButton.disabled =
            true;
        }


        return;
      }


      showMembershipReturnMessage();

      startAuthListener();

      await refreshMemberState();


      /*
        Stripe's webhook may finish a moment
        after the browser returns from Checkout.

        Refresh a few times on successful return.
        This NEVER activates the membership
        itself; it only rereads server state.
      */

      const params =
        new URLSearchParams(
          window.location.search
        );


      if (
        params.get(
          "membership"
        ) ===
          "stripe-success"
      ) {

        window.setTimeout(
          () => {
            refreshMemberState();
          },
          2000
        );


        window.setTimeout(
          () => {
            refreshMemberState();
          },
          5000
        );
      }
    }


    start();

  }
);
