/* =========================================================
   PETE JUNIOR — PORTFOLIO JAVASCRIPT
   ========================================================= */


document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       TERMINAL
       ===================================================== */

    const terminalCommands = {
        help: "Available commands: help, whoami, mission, motto, interests, status, clear",
        whoami: "Pete Junior — Tech enthusiast, creator, future software engineer.",
        mission: "Build technology that solves real problems and changes lives.",
        motto: "Explore. Dream. Discover.",
        interests: "Tech • Coding • Gaming • Music • Gadgets • Poetry",
        status: "Currently learning HTML & CSS and building amazing projects."
    };

    const terminalForm = document.getElementById("terminalForm");
    const terminalInput = document.getElementById("terminalInput");
    const terminalOutput = document.getElementById("terminalOutput");

    if (terminalForm && terminalInput && terminalOutput) {
        function printLine(text) {
            const p = document.createElement("p");
            p.textContent = text;
            terminalOutput.appendChild(p);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }

        terminalForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const command = terminalInput.value.trim().toLowerCase();
            if (command === "") return;

            printLine("pete@portfolio:~$ " + command);

            if (command === "clear") {
                terminalOutput.innerHTML = "";
            } else if (terminalCommands[command]) {
                printLine(terminalCommands[command]);
            } else {
                printLine("Command not found.");
                printLine("Type 'help' for available commands.");
            }

            terminalInput.value = "";
        });
    }

    /* =====================================================
       TYPEWRITER
       ===================================================== */

    const typingText = document.getElementById("typing-text");

    const words = [
        "Software Engineer",
        "App Developer",
        "Game Creator",
        "Problem Solver",
        "Technology Explorer"
    ];

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function typeEffect() {
        if (!typingText) return;

        const currentWord = words[wordIndex];

        if (!deleting) {
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex === currentWord.length) {
                deleting = true;
                setTimeout(typeEffect, 1500);
                return;
            }
        } else {
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;

            if (charIndex === 0) {
                deleting = false;
                wordIndex = (wordIndex + 1) % words.length;
            }
        }

        setTimeout(typeEffect, deleting ? 60 : 100);
    }

    typeEffect();

    /* =====================================================
       SCROLL PROGRESS
       ===================================================== */

    const progressBar = document.getElementById("scroll-progress");

    function updateScrollProgress() {
        if (!progressBar) return;

        const scrollTop = window.scrollY;
        const pageHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (pageHeight <= 0) {
            progressBar.style.width = "0%";
            return;
        }

        progressBar.style.width = ((scrollTop / pageHeight) * 100) + "%";
    }

    window.addEventListener("scroll", updateScrollProgress);
    updateScrollProgress();

    /* =====================================================
       SECRET DEVELOPER MODE + PERSONAL ARCHIVE
       ===================================================== */

    const secret = [
        "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
        "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight"
    ];

    let entered = [];
    let developerModeOpen = false;

    /*
       IMPORTANT:
       This is a front-end Easter egg, not real security.
       Anyone who can inspect the public JavaScript can find the password.
       For genuinely private writing, move authentication to a server.
    */
    const ARCHIVE_PASSWORD = "PJ-ARCHIVE-2026";

    function injectArchiveStyles() {
        if (document.getElementById("developer-archive-styles")) return;

        const style = document.createElement("style");
        style.id = "developer-archive-styles";
        style.textContent = `
            body.secret-mode .developer-archive-trigger {
                opacity: 1;
                pointer-events: auto;
            }

            .developer-archive-trigger {
                position: fixed;
                right: 24px;
                bottom: 24px;
                z-index: 9998;
                border: 1px solid rgba(255,30,30,.55);
                background: rgba(5,5,5,.92);
                color: #ff1e1e;
                padding: 10px 14px;
                font: 700 11px/1 'Space Mono', monospace;
                letter-spacing: 1px;
                cursor: pointer;
                opacity: 0;
                pointer-events: none;
                box-shadow: 0 0 25px rgba(255,30,30,.12);
                backdrop-filter: blur(8px);
                transition: .25s ease;
            }

            .developer-archive-trigger:hover {
                background: #ff1e1e;
                color: #050505;
                box-shadow: 0 0 30px rgba(255,30,30,.3);
            }

            .developer-archive-overlay {
                position: fixed;
                inset: 0;
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 24px;
                background: rgba(0,0,0,.88);
                backdrop-filter: blur(12px);
            }

            .developer-archive-overlay.visible { display: flex; }

            .developer-archive-panel {
                width: min(960px, 100%);
                max-height: min(760px, 92vh);
                overflow: auto;
                border: 1px solid #262626;
                background: #080808;
                box-shadow: 0 30px 120px rgba(0,0,0,.8), 0 0 45px rgba(255,30,30,.08);
                font-family: 'Space Mono', monospace;
                position: relative;
            }

            .developer-archive-bar {
                min-height: 52px;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 0 18px;
                border-bottom: 1px solid #222;
                background: #0d0d0d;
            }

            .developer-archive-bar .dots { display: flex; gap: 6px; }
            .developer-archive-bar .dots span {
                width: 9px;
                height: 9px;
                border-radius: 50%;
                background: #333;
            }

            .developer-archive-bar strong {
                flex: 1;
                color: #777;
                font-size: 10px;
                font-weight: 400;
            }

            .developer-archive-close {
                border: 0;
                background: transparent;
                color: #666;
                cursor: pointer;
                font: 700 16px/1 'Space Mono', monospace;
            }

            .developer-archive-close:hover { color: #ff1e1e; }

            .developer-archive-content { padding: clamp(28px, 5vw, 60px); }

            .archive-kicker {
                color: #ff1e1e;
                font-size: 10px;
                letter-spacing: 2px;
            }

            .archive-title {
                margin: 12px 0 10px;
                font: 800 clamp(34px, 7vw, 76px)/.9 'Inter', sans-serif;
                letter-spacing: -3px;
                color: #f2f2f2;
            }

            .archive-title span { color: #ff1e1e; }

            .archive-intro {
                max-width: 650px;
                color: #777;
                font: 13px/1.8 'Inter', sans-serif;
                margin-bottom: 35px;
            }

            .archive-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
            }

            .archive-card {
                min-height: 170px;
                border: 1px solid #222;
                padding: 22px;
                background: rgba(255,255,255,.015);
                transition: .25s ease;
            }

            .archive-card:hover {
                border-color: rgba(255,30,30,.55);
                transform: translateY(-3px);
                background: rgba(255,30,30,.025);
            }

            .archive-card .number {
                color: #444;
                font-size: 10px;
            }

            .archive-card h3 {
                margin-top: 35px;
                color: #ddd;
                font: 700 17px/1.2 'Inter', sans-serif;
            }

            .archive-card p {
                margin-top: 8px;
                color: #666;
                font: 11px/1.6 'Inter', sans-serif;
            }

            .archive-lock-note {
                margin-top: 28px;
                color: #444;
                font-size: 9px;
                letter-spacing: 1px;
            }

            .archive-auth {
                width: min(480px, 100%);
                padding: 32px;
                border: 1px solid #222;
                background: #080808;
                box-shadow: 0 30px 100px rgba(0,0,0,.8), 0 0 35px rgba(255,30,30,.08);
            }

            .archive-auth .lock {
                color: #ff1e1e;
                font-size: 24px;
                margin-bottom: 18px;
            }

            .archive-auth h2 {
                margin: 0;
                color: #f2f2f2;
                font: 800 28px/1 'Inter', sans-serif;
                letter-spacing: -1px;
            }

            .archive-auth p {
                color: #666;
                font: 11px/1.7 'Inter', sans-serif;
                margin: 12px 0 22px;
            }

            .archive-auth form { display: flex; gap: 8px; }

            .archive-auth input {
                flex: 1;
                min-width: 0;
                border: 1px solid #292929;
                outline: none;
                background: #050505;
                color: #f2f2f2;
                padding: 13px 14px;
                font: 12px 'Space Mono', monospace;
            }

            .archive-auth input:focus { border-color: #ff1e1e; }

            .archive-auth button {
                border: 1px solid #ff1e1e;
                background: #ff1e1e;
                color: #050505;
                padding: 0 18px;
                cursor: pointer;
                font: 700 11px 'Space Mono', monospace;
            }

            .archive-error {
                min-height: 18px;
                margin-top: 12px;
                color: #ff1e1e;
                font: 10px 'Space Mono', monospace;
            }

            @media (max-width: 700px) {
                .developer-archive-trigger { right: 14px; bottom: 14px; }
                .archive-grid { grid-template-columns: 1fr; }
                .archive-auth { padding: 24px; }
                .archive-auth form { flex-direction: column; }
                .archive-auth button { min-height: 44px; }
            }
        `;
        document.head.appendChild(style);
    }

    function createArchiveUI() {
        if (document.getElementById("developerArchiveOverlay")) return;

        injectArchiveStyles();

        const trigger = document.createElement("button");
        trigger.className = "developer-archive-trigger";
        trigger.textContent = "[ OPEN PERSONAL ARCHIVE ]";
        trigger.setAttribute("aria-label", "Open personal archive");
        document.body.appendChild(trigger);

        const overlay = document.createElement("div");
        overlay.className = "developer-archive-overlay";
        overlay.id = "developerArchiveOverlay";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");

        overlay.innerHTML = `
            <div class="developer-archive-panel" id="developerArchivePanel">
                <div class="developer-archive-bar">
                    <div class="dots"><span></span><span></span><span></span></div>
                    <strong>PETE@ARCHIVE:~ / DEVELOPER MODE</strong>
                    <button class="developer-archive-close" id="archiveClose" aria-label="Close">×</button>
                </div>
                <div class="developer-archive-content" id="archiveContent"></div>
            </div>
        `;

        document.body.appendChild(overlay);

        const content = document.getElementById("archiveContent");
        const close = document.getElementById("archiveClose");

        function closeArchive() {
            overlay.classList.remove("visible");
            document.body.style.overflow = "";
        }

        function showPassword() {
            content.innerHTML = `
                <div class="archive-auth">
                    <div class="lock">⌁</div>
                    <h2>ACCESS <span style="color:#ff1e1e">RESTRICTED.</span></h2>
                    <p>This area is part of Pete Junior's personal archive. Enter the access key to continue.</p>
                    <form id="archivePasswordForm">
                        <input id="archivePassword" type="password" placeholder="ACCESS KEY" autocomplete="off" spellcheck="false" aria-label="Archive password">
                        <button type="submit">UNLOCK</button>
                    </form>
                    <div class="archive-error" id="archiveError"></div>
                </div>
            `;

            const form = document.getElementById("archivePasswordForm");
            const input = document.getElementById("archivePassword");
            const error = document.getElementById("archiveError");

            form.addEventListener("submit", function (event) {
                event.preventDefault();

                if (input.value === ARCHIVE_PASSWORD) {
                    showArchive();
                } else {
                    error.textContent = "ACCESS DENIED // INVALID KEY";
                    input.value = "";
                    input.focus();
                }
            });

            setTimeout(() => input.focus(), 50);
        }

        function showArchive() {
            content.innerHTML = `
                <div class="archive-kicker">04.5 // PERSONAL ARCHIVE // ACCESS GRANTED</div>
                <h1 class="archive-title">THE <span>ARCHIVE.</span></h1>
                <p class="archive-intro">
                    A quieter side of Pete Junior's digital space — words, ideas,
                    unfinished thoughts, dreams, and pieces that don't belong on the public portfolio.
                </p>

                <div class="archive-grid">
                    <article class="archive-card">
                        <span class="number">01</span>
                        <h3>Poems</h3>
                        <p>Words, verses, and pieces written along the way.</p>
                    </article>
                    <article class="archive-card">
                        <span class="number">02</span>
                        <h3>Thoughts</h3>
                        <p>Personal reflections and ideas worth keeping.</p>
                    </article>
                    <article class="archive-card">
                        <span class="number">03</span>
                        <h3>Dreams</h3>
                        <p>Big ambitions, future plans, and things still becoming.</p>
                    </article>
                    <article class="archive-card">
                        <span class="number">04</span>
                        <h3>Ideas</h3>
                        <p>Projects, concepts, experiments, and things to build.</p>
                    </article>
                    <article class="archive-card">
                        <span class="number">05</span>
                        <h3>Unfinished</h3>
                        <p>Pieces that aren't finished yet — and don't need to be.</p>
                    </article>
                    <article class="archive-card">
                        <span class="number">06</span>
                        <h3>More Soon</h3>
                        <p>The archive grows as Pete's journey continues.</p>
                    </article>
                </div>

                <div class="archive-lock-note">PERSONAL SPACE // NOT PART OF THE PUBLIC PORTFOLIO</div>
            `;
        }

        trigger.addEventListener("click", () => {
            overlay.classList.add("visible");
            document.body.style.overflow = "hidden";
            showPassword();
        });

        close.addEventListener("click", closeArchive);

        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) closeArchive();
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && overlay.classList.contains("visible")) {
                closeArchive();
            }
        });
    }

    function toggleDeveloperMode() {
        developerModeOpen = !developerModeOpen;
        document.body.classList.toggle("secret-mode", developerModeOpen);

        if (developerModeOpen) {
            createArchiveUI();
            alert("🛠 Developer Mode Activated!\n\nPersonal Archive detected.");
        } else {
            const overlay = document.getElementById("developerArchiveOverlay");
            if (overlay) {
                overlay.classList.remove("visible");
                document.body.style.overflow = "";
            }
            alert("Developer Mode Deactivated.");
        }
    }

    document.addEventListener("keydown", function (event) {
        entered.push(event.key);

        if (entered.length > secret.length) entered.shift();

        if (JSON.stringify(entered) === JSON.stringify(secret)) {
            toggleDeveloperMode();
            entered = [];
        }
    });

    console.log("Pete Junior Portfolio Loaded Successfully.");
});
