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
                    class="site-nav-link
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


    menuButton.addEventListener("click", () => {
        const menuIsOpen =
            navigation.classList.toggle("menu-open");

        menuButton.setAttribute(
            "aria-expanded",
            menuIsOpen.toString()
        );

        menuButton.textContent =
            menuIsOpen ? "Close" : "Menu";
    });
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

            <p class="site-footer-name">
                his_national_anthem
            </p>

            <p class="site-footer-copyright">
                &copy; ${currentYear} his_national_anthem
            </p>

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
