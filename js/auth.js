/* ========================================
   HIS_NATIONAL_ANTHEM
   Authentication
   ======================================== */

(() => {

  const MEMBERSHIP_URL =
    "https://hisnationalanthem.github.io/his-national-anthem-site/membership.html";


  /* ========================================
     CLIENT CHECK
     ======================================== */

  function getClient() {

    if (!window.supabaseClient) {
      throw new Error(
        "Supabase is not available."
      );
    }


    return window.supabaseClient;
  }


  /* ========================================
     GET CURRENT SESSION
     ======================================== */

  async function getSession() {

    const supabase =
      getClient();


    const {
      data,
      error
    } =
      await supabase
        .auth
        .getSession();


    if (error) {
      throw error;
    }


    return (
      data?.session ||
      null
    );
  }


  /* ========================================
     GET CURRENT USER
     ======================================== */

  async function getUser() {

    const supabase =
      getClient();


    const {
      data,
      error
    } =
      await supabase
        .auth
        .getUser();


    if (error) {
      throw error;
    }


    return (
      data?.user ||
      null
    );
  }


  /* ========================================
     CREATE ACCOUNT
     ======================================== */

  async function signUp({
    email,
    password,
    displayName
  }) {

    const supabase =
      getClient();


    const cleanEmail =
      String(
        email || ""
      )
        .trim()
        .toLowerCase();


    const cleanDisplayName =
      String(
        displayName || ""
      )
        .trim();


    if (!cleanEmail) {
      throw new Error(
        "Email is required."
      );
    }


    if (!password) {
      throw new Error(
        "Password is required."
      );
    }


    if (!cleanDisplayName) {
      throw new Error(
        "Display name is required."
      );
    }


    const {
      data,
      error
    } =
      await supabase
        .auth
        .signUp({
          email:
            cleanEmail,

          password,

          options: {
            emailRedirectTo:
              MEMBERSHIP_URL,

            data: {
              display_name:
                cleanDisplayName
            }
          }
        });


    if (error) {
      throw error;
    }


    return data;
  }


  /* ========================================
     SIGN IN
     ======================================== */

  async function signIn({
    email,
    password
  }) {

    const supabase =
      getClient();


    const cleanEmail =
      String(
        email || ""
      )
        .trim()
        .toLowerCase();


    if (!cleanEmail) {
      throw new Error(
        "Email is required."
      );
    }


    if (!password) {
      throw new Error(
        "Password is required."
      );
    }


    const {
      data,
      error
    } =
      await supabase
        .auth
        .signInWithPassword({
          email:
            cleanEmail,

          password
        });


    if (error) {
      throw error;
    }


    return data;
  }


  /* ========================================
     SIGN OUT
     ======================================== */

  async function signOut() {

    const supabase =
      getClient();


    const {
      error
    } =
      await supabase
        .auth
        .signOut();


    if (error) {
      throw error;
    }
  }


  /* ========================================
     AUTH STATE LISTENER
     ======================================== */

  function onAuthStateChange(
    callback
  ) {

    const supabase =
      getClient();


    const {
      data
    } =
      supabase
        .auth
        .onAuthStateChange(
          (
            event,
            session
          ) => {

            if (
              typeof callback ===
                "function"
            ) {
              callback(
                event,
                session
              );
            }
          }
        );


    return (
      data?.subscription ||
      null
    );
  }


  /* ========================================
     PUBLIC AUTH API
     ======================================== */

  window.anthemAuth = {
    getSession,
    getUser,
    signUp,
    signIn,
    signOut,
    onAuthStateChange
  };

})();
