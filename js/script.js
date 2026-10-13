
/* =========================================
   1. SÉLECTION DES ÉLÉMENTS
========================================= */

const html = document.documentElement;

const themeToggle = document.getElementById("theme-toggle");
const moonIcon = document.getElementById("moon-icon");
const sunIcon = document.getElementById("sun-icon");

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

const navItems = document.querySelectorAll(".nav-link");

const siteHeader = document.querySelector(".site-header");
const currentYear = document.getElementById("current-year");

const themeColor = document.querySelector(
    'meta[name="theme-color"]'
);

const sections = document.querySelectorAll(
    "main section[id]"
);

const mobileBreakpoint = window.matchMedia("(max-width: 900px)");

const prefersDarkScheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
);


/* =========================================
   2. APPLIQUER LE THÈME
========================================= */

function applyTheme(theme) {
    const isDark = theme === "dark";

    html.setAttribute(
        "data-theme",
        isDark ? "dark" : "light"
    );

    // Synchroniser les icônes.
    if (moonIcon) {
        moonIcon.hidden = isDark;
    }

    if (sunIcon) {
        sunIcon.hidden = !isDark;
    }

    // Mettre à jour le bouton.
    if (themeToggle) {
        themeToggle.setAttribute(
            "aria-label",
            isDark
                ? "Activer le mode clair"
                : "Activer le mode sombre"
        );

        themeToggle.setAttribute(
            "aria-pressed",
            String(isDark)
        );

        themeToggle.setAttribute(
            "title",
            isDark
                ? "Passer au mode clair"
                : "Passer au mode sombre"
        );
    }

    // Adapter la couleur de la barre du navigateur.
    if (themeColor) {
        themeColor.setAttribute(
            "content",
            isDark ? "#0B0F14" : "#F6F8F5"
        );
    }
}


/* =========================================
   3. INITIALISER LE THÈME
========================================= */

function getSavedTheme() {
    try {
        const savedTheme = localStorage.getItem(
            "portfolio-theme"
        );

        if (savedTheme === "dark" || savedTheme === "light") {
            return savedTheme;
        }
    } catch (error) {
        console.warn(
            "Le stockage local n'est pas disponible."
        );
    }

    return null;
}

let savedTheme = getSavedTheme();

function initializeTheme() {
    const initialTheme = savedTheme
        || (prefersDarkScheme.matches ? "dark" : "light");

    applyTheme(initialTheme);
}

initializeTheme();


/* =========================================
   4. CHANGER DE THÈME
========================================= */

if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        const currentTheme =
            html.getAttribute("data-theme") || "light";

        const newTheme =
            currentTheme === "dark" ? "light" : "dark";

        applyTheme(newTheme);

        // Le choix manuel devient la préférence enregistrée.
        savedTheme = newTheme;

        try {
            localStorage.setItem(
                "portfolio-theme",
                newTheme
            );
        } catch (error) {
            console.warn(
                "Impossible de mémoriser le thème choisi."
            );
        }
    });
}

// Suivre les changements du système uniquement si
// le visiteur n'a pas choisi lui-même un thème.
function handleSystemThemeChange(event) {
    if (savedTheme === null) {
        applyTheme(event.matches ? "dark" : "light");
    }
}

if (typeof prefersDarkScheme.addEventListener === "function") {
    prefersDarkScheme.addEventListener(
        "change",
        handleSystemThemeChange
    );
} else if (typeof prefersDarkScheme.addListener === "function") {
    // Compatibilité avec certains anciens navigateurs.
    prefersDarkScheme.addListener(
        handleSystemThemeChange
    );
}


/* =========================================
   5. MENU MOBILE
========================================= */

function closeMobileMenu() {
    if (!menuToggle || !navLinks) {
        return;
    }

    navLinks.classList.remove("open");
    menuToggle.classList.remove("open");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Ouvrir le menu");
}

function openMobileMenu() {
    if (!menuToggle || !navLinks) {
        return;
    }

    navLinks.classList.add("open");
    menuToggle.classList.add("open");

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Fermer le menu");
}

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
        const isOpen =
            navLinks.classList.contains("open");

        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Fermer le menu après sélection d'un lien.
    navItems.forEach(function (link) {
        link.addEventListener("click", closeMobileMenu);
    });

    // Fermer le menu en cliquant à l'extérieur.
    document.addEventListener("click", function (event) {
        const clickedInsideMenu =
            navLinks.contains(event.target);

        const clickedToggle =
            menuToggle.contains(event.target);

        if (!clickedInsideMenu && !clickedToggle) {
            closeMobileMenu();
        }
    });

    // Fermer le menu avec Échap.
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMobileMenu();
        }
    });

    // Fermer le menu lorsque l'écran redevient large.
    mobileBreakpoint.addEventListener(
        "change",
        function (event) {
            if (!event.matches) {
                closeMobileMenu();
            }
        }
    );
}


/* =========================================
   6. BARRE DE NAVIGATION AU DÉFILEMENT
========================================= */

function updateHeader() {
    if (!siteHeader) {
        return;
    }

    siteHeader.classList.toggle(
        "scrolled",
        window.scrollY > 20
    );
}

window.addEventListener("scroll", updateHeader, {
    passive: true
});

updateHeader();


/* =========================================
   7. DÉTECTER LA SECTION ACTIVE
========================================= */

function updateActiveNavigation(sectionId) {
    navItems.forEach(function (link) {
        const href = link.getAttribute("href");

        if (!href || !href.startsWith("#")) {
            return;
        }

        const isActive = href.slice(1) === sectionId;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        function (entries) {
            const visibleEntries = entries
                .filter(function (entry) {
                    return entry.isIntersecting;
                })
                .sort(function (a, b) {
                    return b.intersectionRatio
                        - a.intersectionRatio;
                });

            if (visibleEntries.length > 0) {
                updateActiveNavigation(
                    visibleEntries[0].target.id
                );
            }
        },
        {
            root: null,
            rootMargin: "-20% 0px -60% 0px",
            threshold: [0, 0.1, 0.25, 0.5]
        }
    );

    sections.forEach(function (section) {
        observer.observe(section);
    });
}


/* =========================================
   8. ANNÉE AUTOMATIQUE
========================================= */

if (currentYear) {
    currentYear.textContent =
        new Date().getFullYear();
}


/* =========================================
   9. LIENS INTERNES
========================================= */

// Fermer le menu lorsqu'un lien d'ancrage est utilisé.
// Les liens de navigation sont déjà gérés plus haut.
document.querySelectorAll('a[href^="#"]').forEach(
    function (link) {
        link.addEventListener("click", function () {
            if (
                menuToggle
                && navLinks
                && !menuToggle.contains(link)
            ) {
                closeMobileMenu();
            }
        });
    }
);

