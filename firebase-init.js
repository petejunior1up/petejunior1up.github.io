/* =========================================================
   PETE JUNIOR — FIREBASE + GOOGLE ANALYTICS
   Analytics uses the site's GA4 measurement ID directly.
   Firebase App initialization remains available for future
   Firebase services without invoking the Firebase Analytics
   SDK's Management/Installations requests.
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

const config = window.FIREBASE_CONFIG;

function hasRealConfig(value) {
    return value &&
        value.apiKey && !value.apiKey.includes("PASTE_") &&
        value.projectId && !value.projectId.includes("PASTE_") &&
        value.appId && !value.appId.includes("PASTE_") &&
        value.measurementId && value.measurementId.startsWith("G-");
}

function loadGoogleAnalytics(measurementId) {
    return new Promise((resolve, reject) => {
        if (typeof window.gtag === "function") {
            resolve();
            return;
        }

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
            window.dataLayer.push(arguments);
        };

        window.gtag("js", new Date());
        window.gtag("config", measurementId, {
            send_page_view: true
        });

        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Google Analytics script failed to load."));
        document.head.appendChild(script);
    });
}

async function initFirebase() {
    if (!hasRealConfig(config)) {
        console.info("Firebase is ready to configure. Add your Firebase Web App config in firebase-config.js.");
        return;
    }

    try {
        // Firebase itself initializes locally. No Analytics SDK is loaded here.
        const app = initializeApp(config);

        await loadGoogleAnalytics(config.measurementId);

        window.PJ_FIREBASE = {
            app,
            gtag: window.gtag,
            measurementId: config.measurementId
        };

        window.gtag("event", "portfolio_loaded", {
            portfolio_version: "v3",
            page: window.location.pathname
        });

        document.addEventListener("click", (event) => {
            const link = event.target.closest("a");
            if (!link) return;

            const href = link.getAttribute("href") || "";
            const text = (link.textContent || "").trim().slice(0, 80);

            if (href.startsWith("http") || href.startsWith("mailto:")) {
                window.gtag("event", "portfolio_link_click", {
                    link_text: text,
                    link_url: href.slice(0, 200)
                });
            }
        });

        console.info("Firebase initialized. Google Analytics initialized via gtag.js.");
    } catch (error) {
        console.warn("Firebase/Analytics initialization skipped:", error);
    }
}

initFirebase();
