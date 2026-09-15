/* ========================================
   HIS_NATIONAL_ANTHEM
   Main Website JavaScript
   ======================================== */


/* ========================================
   SHARED SITE NAVIGATION
   ======================================== */

const SITE_PAGES = [
    {
        name: "Home",
        url: "index.html"
    },
    {
        name: "Commissions",
        url: "commissions.html"
    },
    {
        name: "Membership",
        url: "membership.html"
    },
    {
        name: "Free Requests",
        url: "requests.html"
    },
    {
        name: "Upcoming Bots",
        url: "upcoming.html"
    },
    {
        name: "Bot Masterlist",
        url: "masterlist.html"
    },
    {
        name: "FAQ",
        url: "faq.html"
    },
    {
        name: "Terms",
        url: "terms.html"
    },
    {
        name: "About",
        url: "about.html"
    },
    {
        name: "Updates",
        url: "updates.html"
    },
    {
        name: "Currency",
        url: "currency.html"
    }
];


/* ========================================
   CREATE HEADER
   ======================================== */

function createSiteHeader() {
    const headerContainer = document.getElementById("site-header");

    if (!headerContainer) {
        return;
    }

    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    const navigationLinks = SITE_PAGES.map((page) => {
        const isCurrentPage = currentPage === page.url;

        return `
            <li class="site-nav-item">
                <a
                    href="${page.url}"
                    class="site-nav-link${isCurrentPage ? " active" : ""}"
                    ${isCurrentPage ? 'aria-current="page"' : ""}
                >
                    ${page.name}
                </a>
            </li>
        `;
    }).join("");


    headerContainer.innerHTML = `
        <header class="site-header">

            <div class="site-branding">
                <a href="index.html" class="site-logo">
                    his_national_anthem
                </a>
            </div>


            <button
                class="mobile-menu-button"
                id="mobile-menu-button"
                type="button"
                aria-label="Open navigation menu"
                aria-expanded="false"
                aria-controls="site-navigation"
            >
                Menu
            </button>


           <nav
    class="site-navigation"
    id="site-navigation"
    aria-label="Main navigation"
>
    <ul class="site-nav-list">
        ${navigationLinks}
    </ul>
</nav>

        </header>
    `;


    setupMobileMenu();
}


/* ========================================
   MOBILE MENU
   ======================================== */

function setupMobileMenu() {
    const menuButton =
        document.getElementById("mobile-menu-button");

    const navigation =
        document.getElementById("site-navigation");


    if (!menuButton || !navigation) {
        return;
    }


    function closeMenu() {
        navigation.classList.remove("menu-open");

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        menuButton.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

        menuButton.textContent =
            "Menu";
    }


    menuButton.addEventListener("click", () => {
        const menuIsOpen =
            !navigation.classList.contains(
                "menu-open"
            );


        navigation.classList.toggle(
            "menu-open",
            menuIsOpen
        );


        menuButton.setAttribute(
            "aria-expanded",
            menuIsOpen.toString()
        );


        menuButton.setAttribute(
            "aria-label",
            menuIsOpen
                ? "Close navigation menu"
                : "Open navigation menu"
        );


        menuButton.textContent =
            menuIsOpen
                ? "Close"
                : "Menu";
    });


    navigation
        .querySelectorAll("a")
        .forEach((link) => {
            link.addEventListener(
                "click",
                closeMenu
            );
        });


    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Escape" &&
                navigation.classList.contains(
                    "menu-open"
                )
            ) {
                closeMenu();

                menuButton.focus();
            }
        }
    );


    window.addEventListener(
        "resize",
        () => {
            if (
                window.innerWidth > 1120
            ) {
                closeMenu();
            }
        }
    );
}


/* ========================================
   CREATE FOOTER
   ======================================== */

function createSiteFooter() {
    const footerContainer =
        document.getElementById("site-footer");

    if (!footerContainer) {
        return;
    }


    const currentYear =
        new Date().getFullYear();


    footerContainer.innerHTML = `
        <footer class="site-footer">

            <div class="site-footer-main">

                <div class="site-footer-brand">

                    <a
                        href="index.html"
                        class="site-footer-logo"
                    >
                        his_national_anthem
                    </a>

                    <p class="site-footer-description">
                        Bot commissions, requests,
                        memberships, releases,
                        and creator updates.
                    </p>

                </div>


                <nav
                    class="site-footer-links"
                    aria-label="Footer navigation"
                >

                    <a href="commissions.html">
                        Commissions
                    </a>

                    <a href="membership.html">
                        Membership
                    </a>

                    <a href="requests.html">
                        Free Requests
                    </a>

                    <a href="faq.html">
                        FAQ
                    </a>

                    <a href="terms.html">
                        Terms
                    </a>

                    <a href="about.html">
                        About
                    </a>

                </nav>

            </div>


            <div class="site-footer-bottom">

                <p class="site-footer-copyright">
                    &copy; ${currentYear}
                    his_national_anthem
                </p>

                <p class="site-footer-note">
                    Please do not repost or redistribute
                    site content without permission.
                </p>

            </div>

        </footer>
    `;
}


/* ========================================
   START WEBSITE
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
    createSiteHeader();
    createSiteFooter();
});
async function loadDonationBankBalance() {
  const balanceElement = document.querySelector(
    "[data-donation-bank-balance]"
  );

  const statusElement = document.querySelector(
    "[data-donation-bank-status]"
  );

  // This page does not contain the Donation Bank component.
  if (!balanceElement) {
    return;
  }

  if (!window.supabaseClient) {
    console.error("Donation Bank could not load: Supabase client unavailable.");

    balanceElement.textContent = "—";

    if (statusElement) {
      statusElement.textContent =
        "Donation Bank balance is temporarily unavailable.";
    }

    return;
  }

  try {
    const { data, error } = await window.supabaseClient.rpc(
      "get_public_donation_bank_balance"
    );

    if (error) {
      throw error;
    }

    const balance = Number(data ?? 0);

    if (!Number.isFinite(balance)) {
      throw new Error("Donation Bank returned an invalid balance.");
    }

    balanceElement.textContent = String(balance);

    if (statusElement) {
      statusElement.textContent =
        balance === 1
          ? "donated commission available"
          : "donated commissions available";
    }
  } catch (error) {
    console.error("Unable to load Donation Bank balance:", error);

    balanceElement.textContent = "—";

    if (statusElement) {
      statusElement.textContent =
        "Donation Bank balance is temporarily unavailable.";
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadDonationBankBalance);
} else {
  loadDonationBankBalance();
}
