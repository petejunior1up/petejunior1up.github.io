/* =========================================================
   PETE JUNIOR — PORTFOLIO V3 JS EXPERIENCE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Lazy-load visual assets where possible.
    document.querySelectorAll("img").forEach(img => {
        if (!img.hasAttribute("loading")) img.loading = "lazy";
        img.decoding = "async";
    });

    // Reveal sections as they enter the viewport.
    const revealItems = document.querySelectorAll(".reveal-v3");
    if (prefersReduced || !("IntersectionObserver" in window)) {
        revealItems.forEach(el => el.classList.add("v3-visible"));
    } else {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("v3-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealItems.forEach(el => revealObserver.observe(el));
    }

    // Animate skill bars once the skills are visible.
    const skillItems = document.querySelectorAll(".skill");
    if (prefersReduced || !("IntersectionObserver" in window)) {
        skillItems.forEach(el => el.classList.add("v3-visible"));
    } else {
        const skillObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("v3-visible");
                    skillObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 });
        skillItems.forEach(el => skillObserver.observe(el));
    }

    // Keep navigation state synchronized with the section on screen.
    const navLinks = [...document.querySelectorAll('.navbar nav a[href^="#"]')];
    const sections = navLinks.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    if ("IntersectionObserver" in window) {
        const navObserver = new IntersectionObserver(entries => {
            const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (!visible) return;
            navLinks.forEach(link => link.classList.toggle("v3-current", link.getAttribute("href") === `#${visible.target.id}`));
        }, { rootMargin: "-35% 0px -55% 0px", threshold: [0, .2, .5] });
        sections.forEach(section => navObserver.observe(section));
    }

    // Navbar state + back-to-top control.
    const topButton = document.createElement("button");
    topButton.className = "v3-top";
    topButton.type = "button";
    topButton.textContent = "↑";
    topButton.setAttribute("aria-label", "Back to top");
    document.body.appendChild(topButton);

    function updateV3ScrollState() {
        const scrolled = window.scrollY > 35;
        document.body.classList.toggle("v3-scrolled", scrolled);
        topButton.classList.toggle("v3-show", window.scrollY > 500);
    }
    window.addEventListener("scroll", updateV3ScrollState, { passive: true });
    updateV3ScrollState();

    topButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });

    // Lightweight pointer tilt on desktop project cards.
    if (!prefersReduced && window.matchMedia("(pointer:fine)").matches) {
        document.querySelectorAll(".project-card").forEach(card => {
            card.addEventListener("pointermove", event => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - .5;
                const y = (event.clientY - rect.top) / rect.height - .5;
                card.style.transform = `perspective(900px) rotateX(${(-y * 2.2).toFixed(2)}deg) rotateY(${(x * 2.2).toFixed(2)}deg) translateY(-5px)`;
            });
            card.addEventListener("pointerleave", () => {
                card.style.transform = "";
            });
        });
    }

    // Make the project heading's VIEW ALL control useful without inventing projects.
    const viewAll = document.querySelector('.view-all[href="#projects"]');
    if (viewAll) {
        viewAll.addEventListener("click", event => {
            event.preventDefault();
            const firstCard = document.querySelector(".project-card");
            if (firstCard) firstCard.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
        });
    }

    // Small keyboard shortcut: / focuses the main terminal when not typing elsewhere.
    document.addEventListener("keydown", event => {
        const tag = document.activeElement?.tagName;
        if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(tag)) {
            const terminal = document.getElementById("terminalInput");
            if (terminal) {
                event.preventDefault();
                terminal.focus();
            }
        }
    });
});
