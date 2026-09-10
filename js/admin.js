document.addEventListener("DOMContentLoaded", () => {
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

  const statusElement = document.querySelector(
    "[data-admin-auth-status]"
  );

  const logoutButton = document.querySelector(
    "[data-admin-logout]"
  );

  console.log("admin.js loaded.");


  /* ==========================================================
     REQUIRED ELEMENTS
     ========================================================== */

  if (
    !loginPanel ||
    !dashboard ||
    !loginForm ||
    !statusElement
  ) {
    console.error("Admin page elements are missing.", {
      loginPanel,
      dashboard,
      loginForm,
      statusElement
    });

    return;
  }


  /* ==========================================================
     UI HELPERS
     ========================================================== */

  function showLogin() {
    loginPanel.hidden = false;
    dashboard.hidden = true;
  }


  function showDashboard() {
    loginPanel.hidden = true;
    dashboard.hidden = false;
  }


  function setStatus(message, isError = false) {
    statusElement.textContent = message;

    statusElement.classList.toggle(
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
    try {
      const isAdmin = await userIsAdmin(user);

      if (!isAdmin) {
        console.warn(
          "Signed-in account is not an administrator."
        );

        await window.supabaseClient.auth.signOut();

        showLogin();

        setStatus(
          "This account is not authorized to access the admin dashboard.",
          true
        );

        return false;
      }

      console.log(
        "Administrator authorized:",
        user.email
      );

      setStatus("");
      showDashboard();

      return true;

    } catch (error) {
      console.error(
        "Admin authorization failed:",
        error
      );

      showLogin();

      setStatus(
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
        setStatus(
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
        setStatus(
          "Enter your email and password.",
          true
        );

        return;
      }


      setLoginLoading(true);

      setStatus(
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

          setStatus(
            "Email or password is incorrect.",
            true
          );

          return;
        }


        if (!data?.user) {
          setStatus(
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

        setStatus(
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
          await window.supabaseClient.auth
            .signOut();

          loginForm.reset();

          showLogin();

          setStatus(
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
     RESTORE EXISTING SESSION
     ========================================================== */

  async function restoreSession() {
    if (!window.supabaseClient) {
      console.error(
        "Admin page could not initialize: Supabase client unavailable."
      );

      showLogin();

      setStatus(
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

      showLogin();

      setStatus(
        "Please sign in.",
        false
      );
    }
  }


  /* ==========================================================
     START
     ========================================================== */

  showLogin();
  restoreSession();
});
