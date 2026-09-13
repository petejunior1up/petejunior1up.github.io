/* =========================================================
   PETE JUNIOR — FIREBASE WEB INTEGRATION
   Analytics-first foundation for the portfolio.
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAnalytics, isSupported, logEvent } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";

const config = window.FIREBASE_CONFIG;

function hasRealConfig(value) {
    return value &&
        value.apiKey && !value.apiKey.includes("PASTE_") &&
        value.projectId && !value.projectId.includes("PASTE_") &&
        value.appId && !value.appId.includes("PASTE_");
}

async function initFirebase() {
    if (!hasRealConfig(config)) {
        console.info("Firebase is ready to configure. Add your Firebase Web App config in firebase-config.js.");
        return;
    }

    try {
        const app = initializeApp(config);
        const analyticsSupported = await isSupported();

        if (analyticsSupported) {
            const analytics = getAnalytics(app);
            window.PJ_FIREBASE = { app, analytics };

            logEvent(analytics, "portfolio_loaded", {
                portfolio_version: "v3",
                page: window.location.pathname
            });

            document.addEventListener("click", (event) => {
                const link = event.target.closest("a");
                if (!link) return;

                const href = link.getAttribute("href") || "";
                const text = (link.textContent || "").trim().slice(0, 80);

                if (href.startsWith("http") || href.startsWith("mailto:")) {
                    logEvent(analytics, "portfolio_link_click", {
                        link_text: text,
                        link_url: href.slice(0, 200)
                    });
                }
            });

            console.info("Firebase Analytics initialized.");
        } else {
            window.PJ_FIREBASE = { app };
            console.info("Firebase initialized; Analytics is not supported in this browser.");
        }
    } catch (error) {
        console.warn("Firebase initialization skipped:", error);
    }
}

initFirebase();
