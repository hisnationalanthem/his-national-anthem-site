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

    const manageMembershipButton =
      document.querySelector(
        "[data-membership-manage]"
      );

    const manageMembershipStatus =
      document.querySelector(
        "[data-membership-manage-status]"
      );

    const stripeSubscribeButton =
      document.querySelector(
        "[data-membership-stripe-subscribe]"
      );

    const paypalSubscribeButton =
      document.querySelector(
        "[data-membership-paypal-subscribe]"
      );

    const checkoutStatus =
      document.querySelector(
        "[data-membership-checkout-status]"
      );

     const donationForm =
  document.querySelector(
    "[data-member-donation-form]"
  );

const donationAmountInput =
  document.querySelector(
    "[data-member-donation-amount]"
  );

const donationSubmitButton =
  document.querySelector(
    "[data-member-donation-submit]"
  );

const donationStatus =
  document.querySelector(
    "[data-member-donation-status]"
  );

const memberCommissionForm =
  document.querySelector(
    "[data-member-commission-form]"
  );

const memberCommissionType =
  document.querySelector(
    "[data-member-commission-type]"
  );

const memberGraveyardField =
  document.querySelector(
    "[data-member-graveyard-field]"
  );

const memberGraveyardCode =
  document.querySelector(
    "[data-member-graveyard-code]"
  );

const memberCommissionSubmit =
  document.querySelector(
    "[data-member-commission-submit]"
  );

const memberCommissionStatus =
  document.querySelector(
    "[data-member-commission-status]"
  );


    /* ========================================
       STATE
       ======================================== */

    let currentSession =
      null;

    let currentMembership =
      null;

     let currentCreditBalance =
  0;


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


    function hasFuturePaidPeriod(
      membership
    ) {

      if (
        !membership ||
        membership.status !==
          "cancelled" ||
        !membership.current_period_end
      ) {
        return false;
      }


      const periodEnd =
        new Date(
          membership.current_period_end
        );


      if (
        Number.isNaN(
          periodEnd.getTime()
        )
      ) {
        return false;
      }


      return (
        periodEnd.getTime() >
        Date.now()
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

function updateDonationControls() {

  const signedIn =
    Boolean(
      currentSession?.user
    );

  const hasCredits =
    currentCreditBalance > 0;


  if (donationAmountInput) {

    donationAmountInput.disabled =
      !signedIn ||
      !hasCredits;

    donationAmountInput.max =
      String(
        Math.max(
          currentCreditBalance,
          1
        )
      );


    const currentValue =
      Number(
        donationAmountInput.value
      );


    if (
      currentValue >
      currentCreditBalance
    ) {
      donationAmountInput.value =
        "";
    }
  }


  if (donationSubmitButton) {

    donationSubmitButton.disabled =
      !signedIn ||
      !hasCredits;
  }


  if (!signedIn) {

    setText(
      donationStatus,
      "Sign in to donate membership credits."
    );

    return;
  }


  if (!hasCredits) {

    setText(
      donationStatus,
      "You do not currently have any credits available to donate."
    );

    return;
  }


  setText(
    donationStatus,
    `You can donate between 1 and ${currentCreditBalance} credit${currentCreditBalance === 1 ? "" : "s"}.`
  );
}


function updateMemberCommissionControls(
  options = {}
) {

  const preserveMessage =
    options.preserveMessage === true;

  const signedIn =
    Boolean(
      currentSession?.user
    );

  const hasCredits =
    currentCreditBalance > 0;


  if (memberCommissionSubmit) {
    memberCommissionSubmit.disabled =
      !signedIn ||
      !hasCredits;
  }


  if (!preserveMessage) {

    if (!signedIn) {
      setText(
        memberCommissionStatus,
        "Sign in with an available membership credit to submit."
      );

      return;
    }


    if (!hasCredits) {
      setText(
        memberCommissionStatus,
        "You do not currently have an available membership credit."
      );

      return;
    }


    setText(
      memberCommissionStatus,
      `You have ${currentCreditBalance} credit${currentCreditBalance === 1 ? "" : "s"} available. Submitting this request will use 1 credit.`
    );
  }
}


function updateMemberGraveyardField() {

  const isGraveyard =
    memberCommissionType?.value ===
      "graveyard_resurrection";


  if (memberGraveyardField) {
    memberGraveyardField.hidden =
      !isGraveyard;
  }


  if (memberGraveyardCode) {
    memberGraveyardCode.required =
      isGraveyard;

    if (!isGraveyard) {
      memberGraveyardCode.value =
        "";
    }
  }
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

currentCreditBalance =
  0;


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


      if (manageMembershipButton) {
        manageMembershipButton.disabled =
          true;
      }


      setText(
        manageMembershipStatus,
        "Sign in to manage your membership."
      );


      if (stripeSubscribeButton) {
        stripeSubscribeButton.disabled =
          true;
      }


      if (paypalSubscribeButton) {
        paypalSubscribeButton.disabled =
          true;
      }


      setText(
  checkoutStatus,
  "Sign in before starting a membership."
);


updateDonationControls();
updateMemberCommissionControls();
updateMemberGraveyardField();
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
            cancel_at,
            canceled_at,
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

          stripeSubscribeButton.textContent =
            "Subscribe with Stripe";
        }


        if (paypalSubscribeButton) {
          paypalSubscribeButton.disabled =
            false;

          paypalSubscribeButton.textContent =
            "Subscribe with PayPal";
        }


        setText(
          checkoutStatus,
          "You can start a $10 CAD monthly membership through Stripe or PayPal."
        );


        if (manageMembershipButton) {
          manageMembershipButton.disabled =
            true;
        }


        setText(
          manageMembershipStatus,
          "Membership management becomes available after a subscription is activated."
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


        const scheduledCancelAt =
          membership.cancel_at ||
          (membership.cancel_at_period_end
            ? membership.current_period_end
            : null);


        setText(
          membershipRenewal,
          scheduledCancelAt
            ? `Cancels ${formatDate(
                scheduledCancelAt
              )}`
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

      const paidPeriodStillActive =
        hasFuturePaidPeriod(
          membership
        );


      const canStartFreshMembership =
        [
          "inactive",
          "expired"
        ].includes(
          status
        ) ||
        (
          status ===
            "cancelled" &&
          !paidPeriodStillActive
        );


      const canUseStripeButton =
        canStartFreshMembership ||
        (
          status ===
            "pending" &&
          membership.provider ===
            "stripe"
        );


      const canUsePayPalButton =
        canStartFreshMembership ||
        (
          status ===
            "pending" &&
          membership.provider ===
            "paypal"
        );


      if (stripeSubscribeButton) {
        stripeSubscribeButton.disabled =
          !canUseStripeButton;

        stripeSubscribeButton.textContent =
          status ===
            "pending" &&
          membership.provider ===
            "stripe"
            ? "Resume Stripe Checkout"
            : "Subscribe with Stripe";
      }


      if (paypalSubscribeButton) {
        paypalSubscribeButton.disabled =
          !canUsePayPalButton;

        paypalSubscribeButton.textContent =
          status ===
            "pending" &&
          membership.provider ===
            "paypal"
            ? "Resume PayPal Approval"
            : "Subscribe with PayPal";
      }


      /*
        MEMBERSHIP MANAGEMENT RULES
      */

      const hasProviderSubscription =
        Boolean(
          membership
            .provider_subscription_id
        );


      const canManageStripeMembership =
        membership.provider ===
          "stripe" &&
        hasProviderSubscription &&
        [
          "active",
          "past_due",
          "suspended"
        ].includes(
          status
        );


      const canCancelPayPalMembership =
        membership.provider ===
          "paypal" &&
        hasProviderSubscription &&
        [
          "active",
          "past_due",
          "suspended"
        ].includes(
          status
        );


      if (manageMembershipButton) {

        manageMembershipButton.disabled =
          !(
            canManageStripeMembership ||
            canCancelPayPalMembership
          );


        manageMembershipButton.textContent =
          canCancelPayPalMembership
            ? "Cancel PayPal Membership"
            : "Manage Membership";
      }


      if (canManageStripeMembership) {

        const scheduledCancelAt =
          membership.cancel_at ||
          (membership.cancel_at_period_end
            ? membership.current_period_end
            : null);


        setText(
          manageMembershipStatus,
          scheduledCancelAt
            ? `Your Stripe membership is scheduled to cancel on ${formatDate(
                scheduledCancelAt
              )}. You can open Stripe to manage or resume it.`
            : "Open Stripe to manage billing, payment methods, or cancellation."
        );

      } else if (
        canCancelPayPalMembership
      ) {

        setText(
          manageMembershipStatus,
          membership.current_period_end
            ? `Cancel future PayPal billing from this site. Your existing credits stay available, and your current paid period runs through ${formatDate(
                membership.current_period_end
              )}.`
            : "Cancel future PayPal billing from this site. Your existing membership credits will remain available."
        );

      } else if (
        membership.provider ===
          "paypal" &&
        status ===
          "cancelled"
      ) {

        setText(
          manageMembershipStatus,
          paidPeriodStillActive
            ? `Your PayPal membership is cancelled. Your paid period continues through ${formatDate(
                membership.current_period_end
              )}.`
            : "Your PayPal membership is cancelled."
        );

      } else if (
        membership.provider ===
          "paypal" &&
        status ===
          "pending"
      ) {

        setText(
          manageMembershipStatus,
          "Complete PayPal approval before membership management becomes available."
        );

      } else {

        setText(
          manageMembershipStatus,
          "Membership management is not available for the current membership state."
        );
      }

      /*
        MESSAGES
      */


      switch (status) {

        case "pending":

          if (
            membership.provider ===
              "paypal"
          ) {

            setText(
              membershipStatusMessage,
              "Your PayPal membership approval has been started but has not been completed yet."
            );

            setText(
              checkoutStatus,
              "Your existing PayPal approval can be resumed."
            );

          } else {

            setText(
              membershipStatusMessage,
              "Your Stripe membership checkout has been started but has not been completed yet."
            );

            setText(
              checkoutStatus,
              "Your existing Stripe checkout can be resumed."
            );
          }

          break;


        case "active":

          {
            const scheduledCancelAt =
              membership.cancel_at ||
              (membership.cancel_at_period_end
                ? membership.current_period_end
                : null);


            setText(
              membershipStatusMessage,
              scheduledCancelAt
                ? `Your Mama's Baby membership is active until ${formatDate(
                    scheduledCancelAt
                  )}.`
                : "Your Mama's Baby membership is active."
            );
          }

          setText(
            checkoutStatus,
            "Your membership is already active."
          );

          break;


        case "past_due":

          setText(
            membershipStatusMessage,
            `${membership.provider === "paypal" ? "PayPal" : "Stripe"} reported that your membership payment is past due.`
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

          if (paidPeriodStillActive) {

            setText(
              membershipStatusMessage,
              `Your membership is cancelled, but your paid period continues through ${formatDate(
                membership.current_period_end
              )}.`
            );

            setText(
              checkoutStatus,
              `You can start a new membership after ${formatDate(
                membership.current_period_end
              )}.`
            );

          } else {

            setText(
              membershipStatusMessage,
              "Your previous membership has been cancelled."
            );

            setText(
              checkoutStatus,
              "You may start a new membership through Stripe or PayPal."
            );
          }

          break;


        case "expired":

          setText(
            membershipStatusMessage,
            "Your previous membership checkout expired."
          );

          setText(
            checkoutStatus,
            "You may start a new membership through Stripe or PayPal."
          );

          break;


        default:

          setText(
            membershipStatusMessage,
            "You do not currently have an active membership."
          );

          setText(
            checkoutStatus,
            "You may start a $10 CAD monthly membership through Stripe or PayPal."
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


        if (paypalSubscribeButton) {
          paypalSubscribeButton.disabled =
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

           currentCreditBalance =
  balanceResult.value;

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

           updateDonationControls();
           updateMemberCommissionControls();

        } else {

  console.error(
    "Credit balance load failed:",
    balanceResult.reason
  );

  currentCreditBalance =
    0;


  setText(
    creditBalance,
    "—"
  );


  setText(
    creditNote,
    "Your credit balance could not be loaded."
  );


  updateDonationControls();
  updateMemberCommissionControls();


  setText(
    donationStatus,
    "Credit donation is unavailable because your balance could not be loaded."
  );


  setText(
    memberCommissionStatus,
    "Member commission submission is unavailable because your credit balance could not be loaded."
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
   DONATE MEMBER CREDITS
   ======================================== */

if (donationForm) {

  donationForm.addEventListener(
    "submit",
    async (
      event
    ) => {

      event.preventDefault();


      if (
        !currentSession?.user
      ) {

        setText(
          donationStatus,
          "Sign in before donating credits."
        );

        return;
      }


      const formData =
        new FormData(
          donationForm
        );


      const amount =
        Number(
          formData.get(
            "amount"
          )
        );


      if (
        !Number.isInteger(
          amount
        ) ||
        amount < 1
      ) {

        setText(
          donationStatus,
          "Enter a whole number of at least 1 credit."
        );

        return;
      }


      if (
        amount >
        currentCreditBalance
      ) {

        setText(
          donationStatus,
          "You cannot donate more credits than you currently have."
        );

        return;
      }


      if (donationSubmitButton) {

        donationSubmitButton.disabled =
          true;

        donationSubmitButton.textContent =
          "Donating...";
      }


      setText(
        donationStatus,
        "Adding your credits to the Donation Bank..."
      );


      try {

        const {
          data,
          error
        } =
          await window
            .supabaseClient
            .rpc(
              "donate_my_member_credits",
              {
                p_amount:
                  amount
              }
            );


        if (error) {
          throw error;
        }


        const receipt =
          Array.isArray(
            data
          )
            ? data[0]
            : data;


        donationForm.reset();


        await refreshMemberState();


        const donated =
          Number(
            receipt
              ?.donated_credits ??
            amount
          );


        const newBalance =
          Number(
            receipt
              ?.new_balance ??
            currentCreditBalance
          );


        setText(
          donationStatus,
          `Successfully donated ${donated} credit${donated === 1 ? "" : "s"} to the Donation Bank. Your new balance is ${newBalance}.`
        );


      } catch (error) {

        console.error(
          "Member credit donation error:",
          error
        );


        setText(
          donationStatus,
          error?.message ||
          "Your credits could not be donated."
        );

      } finally {

  if (
    donationSubmitButton
  ) {

    donationSubmitButton.textContent =
      "Donate Credits";

    donationSubmitButton.disabled =
      !currentSession?.user ||
      currentCreditBalance <= 0;
  }


  if (
    donationAmountInput
  ) {

    donationAmountInput.disabled =
      !currentSession?.user ||
      currentCreditBalance <= 0;

    donationAmountInput.max =
      String(
        Math.max(
          currentCreditBalance,
          1
        )
      );
  }
}

      }
    );
  }


    /* ========================================
       MEMBER COMMISSION REQUEST
       ======================================== */

    if (memberCommissionType) {

      memberCommissionType.addEventListener(
        "change",
        () => {
          updateMemberGraveyardField();
        }
      );
    }


    if (memberCommissionForm) {

      memberCommissionForm.addEventListener(
        "submit",
        async (
          event
        ) => {

          event.preventDefault();


          if (
            !currentSession?.user
          ) {

            setText(
              memberCommissionStatus,
              "Sign in before submitting a member commission."
            );

            return;
          }


          if (
            currentCreditBalance < 1
          ) {

            setText(
              memberCommissionStatus,
              "You do not have an available membership credit."
            );

            return;
          }


          const formData =
            new FormData(
              memberCommissionForm
            );


          const commissionType =
            String(
              formData.get(
                "commission_type"
              ) || ""
            ).trim();


          const requestTitle =
            String(
              formData.get(
                "request_title"
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
            ) === "true";


          const graveyardCode =
            String(
              formData.get(
                "graveyard_code"
              ) || ""
            )
              .trim()
              .toUpperCase();


          if (!commissionType) {

            setText(
              memberCommissionStatus,
              "Select a commission type."
            );

            return;
          }


          if (!requestDetails) {

            setText(
              memberCommissionStatus,
              "Commission details are required."
            );

            return;
          }


          if (
            commissionType ===
              "graveyard_resurrection" &&
            !/^RG-[0-9]{3}$/.test(
              graveyardCode
            )
          ) {

            setText(
              memberCommissionStatus,
              "Enter a valid Graveyard request code such as RG-001."
            );

            return;
          }


          if (memberCommissionSubmit) {

            memberCommissionSubmit.disabled =
              true;

            memberCommissionSubmit.textContent =
              "Submitting...";
          }


          setText(
            memberCommissionStatus,
            "Submitting your member commission and applying 1 credit..."
          );


          try {

            const {
              data,
              error
            } =
              await window
                .supabaseClient
                .rpc(
                  "submit_member_commission_request",
                  {
                    p_commission_type:
                      commissionType,

                    p_request_title:
                      requestTitle ||
                      null,

                    p_request_details:
                      requestDetails,

                    p_reference_details:
                      referenceDetails ||
                      null,

                    p_private_use:
                      privateUse,

                    p_graveyard_code:
                      commissionType ===
                        "graveyard_resurrection"
                        ? graveyardCode
                        : null
                  }
                );


            if (error) {
              throw error;
            }


            const receipt =
              Array.isArray(
                data
              )
                ? data[0]
                : data;


            const commissionId =
              String(
                receipt
                  ?.commission_id ||
                ""
              );


            const newBalance =
              Number(
                receipt
                  ?.new_balance ??
                Math.max(
                  currentCreditBalance - 1,
                  0
                )
              );


            memberCommissionForm.reset();

            updateMemberGraveyardField();

            await refreshMemberState();


            setText(
              memberCommissionStatus,
              commissionId
                ? `Member commission submitted successfully. 1 credit was used. Your new balance is ${newBalance}. Request ID: ${commissionId}`
                : `Member commission submitted successfully. 1 credit was used. Your new balance is ${newBalance}.`
            );


          } catch (error) {

            console.error(
              "Member commission submission error:",
              error
            );


            setText(
              memberCommissionStatus,
              error?.message ||
              "Your member commission could not be submitted."
            );

          } finally {

            if (memberCommissionSubmit) {

              memberCommissionSubmit.textContent =
                "Submit Member Commission";
            }


            updateMemberCommissionControls({
              preserveMessage:
                true
            });
          }
        }
      );
    }


    /* ========================================
       MEMBERSHIP MANAGEMENT
       ======================================== */

    if (
      manageMembershipButton
    ) {

      manageMembershipButton.addEventListener(
        "click",
        async () => {

          if (
            !currentSession?.user
          ) {

            setText(
              manageMembershipStatus,
              "Sign in before managing your membership."
            );

            return;
          }


          if (
            !currentMembership ||
            !currentMembership
              .provider_subscription_id
          ) {

            setText(
              manageMembershipStatus,
              "No active membership is available to manage."
            );

            return;
          }


          /* =================================
             STRIPE CUSTOMER PORTAL
             ================================= */

          if (
            currentMembership.provider ===
              "stripe"
          ) {

            setButtonLoading(
              manageMembershipButton,
              true,
              "Manage Membership",
              "Opening Stripe..."
            );


            setText(
              manageMembershipStatus,
              "Opening secure Stripe membership management..."
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
                    "create-stripe-customer-portal",
                    {
                      body: {}
                    }
                  );


              if (error) {

                const message =
                  await getFunctionErrorMessage(
                    error,
                    "Unable to open membership management."
                  );


                throw new Error(
                  message
                );
              }


              const portalUrl =
                String(
                  data
                    ?.portal_url ||
                  ""
                ).trim();


              if (!portalUrl) {
                throw new Error(
                  "Stripe did not return a Customer Portal URL."
                );
              }


              setText(
                manageMembershipStatus,
                "Opening Stripe..."
              );


              window.location.assign(
                portalUrl
              );


            } catch (error) {

              console.error(
                "Stripe Customer Portal error:",
                error
              );


              setText(
                manageMembershipStatus,
                error?.message ||
                "Unable to open membership management."
              );


              manageMembershipButton.disabled =
                false;

              manageMembershipButton.textContent =
                "Manage Membership";
            }


            return;
          }


          /* =================================
             PAYPAL CANCELLATION
             ================================= */

          if (
            currentMembership.provider ===
              "paypal"
          ) {

            if (
              ![
                "active",
                "past_due",
                "suspended"
              ].includes(
                currentMembership.status
              )
            ) {

              setText(
                manageMembershipStatus,
                "This PayPal membership cannot be cancelled from its current state."
              );

              return;
            }


            const confirmed =
              window.confirm(
                "Cancel your PayPal membership? Future PayPal billing will stop. Your existing credits will remain, and you cannot start a new membership until the current paid period ends."
              );


            if (!confirmed) {

              setText(
                manageMembershipStatus,
                "Your PayPal membership was not changed."
              );

              return;
            }


            setButtonLoading(
              manageMembershipButton,
              true,
              "Cancel PayPal Membership",
              "Cancelling PayPal..."
            );


            setText(
              manageMembershipStatus,
              "Cancelling future PayPal billing..."
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
                    "cancel-paypal-membership",
                    {
                      body: {}
                    }
                  );


              if (error) {

                const message =
                  await getFunctionErrorMessage(
                    error,
                    "Unable to cancel PayPal membership."
                  );


                throw new Error(
                  message
                );
              }


              await refreshMemberState();


              const paidThrough =
                data?.paid_through
                  ? formatDate(
                      data.paid_through
                    )
                  : null;


              setText(
                manageMembershipStatus,
                paidThrough
                  ? `PayPal billing is cancelled. Your paid period continues through ${paidThrough}, and your existing credits remain available.`
                  : "PayPal billing is cancelled. Your existing credits remain available."
              );


            } catch (error) {

              console.error(
                "PayPal membership cancellation error:",
                error
              );


              setText(
                manageMembershipStatus,
                error?.message ||
                "Unable to cancel PayPal membership."
              );


              manageMembershipButton.disabled =
                false;

              manageMembershipButton.textContent =
                "Cancel PayPal Membership";
            }


            return;
          }


          setText(
            manageMembershipStatus,
            "This membership provider cannot be managed here."
          );
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
       PAYPAL MEMBERSHIP APPROVAL
       ======================================== */

    if (
      paypalSubscribeButton
    ) {

      paypalSubscribeButton.addEventListener(
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
            paypalSubscribeButton,
            true,
            "Subscribe with PayPal",
            "Opening PayPal..."
          );


          setText(
            checkoutStatus,
            "Creating your secure PayPal membership subscription..."
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
                  "create-paypal-membership-subscription",
                  {
                    body: {}
                  }
                );


            if (error) {

              const message =
                await getFunctionErrorMessage(
                  error,
                  "Unable to create PayPal membership approval."
                );


              throw new Error(
                message
              );
            }


            const approvalUrl =
              String(
                data
                  ?.approval_url ||
                ""
              ).trim();


            if (!approvalUrl) {
              throw new Error(
                "PayPal did not return an approval URL."
              );
            }


            setText(
              checkoutStatus,
              data?.reused
                ? "Reopening your existing PayPal approval..."
                : "Opening secure PayPal approval..."
            );


            window.location.assign(
              approvalUrl
            );


          } catch (error) {

            console.error(
              "PayPal membership approval error:",
              error
            );


            setText(
              checkoutStatus,
              error?.message ||
              "Unable to start PayPal membership approval."
            );


            /*
              Reload state because the server
              may have created or changed a
              pending membership row.
            */

            await refreshMemberState();


          } finally {

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
                paypalSubscribeButton,
                false,
                "Subscribe with PayPal",
                "Opening PayPal..."
              );
            }
          }
        }
      );
    }


    /* ========================================
       PAYMENT RETURN MESSAGE
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


      else if (
        result ===
          "paypal-approved"
      ) {

        setText(
          checkoutStatus,
          "PayPal approval completed. Confirming your membership..."
        );
      }


      else if (
        result ===
          "paypal-cancelled"
      ) {

        setText(
          checkoutStatus,
          "PayPal approval was cancelled. You were not subscribed from this cancelled approval."
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


        if (
          paypalSubscribeButton
        ) {
          paypalSubscribeButton.disabled =
            true;
        }


        if (
          manageMembershipButton
        ) {
          manageMembershipButton.disabled =
            true;
        }


        setText(
          manageMembershipStatus,
          "Membership management is unavailable right now."
        );


        return;
      }


      showMembershipReturnMessage();

      updateMemberGraveyardField();

      startAuthListener();

      await refreshMemberState();


      /*
        A payment-provider webhook may finish
        a moment after the browser returns.

        Refresh a few times on successful return.
        This NEVER activates the membership
        itself; it only rereads server state.
      */

      const params =
        new URLSearchParams(
          window.location.search
        );


      if (
        [
          "stripe-success",
          "paypal-approved"
        ].includes(
          params.get(
            "membership"
          )
        )
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
