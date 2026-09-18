/* =========================================================
   PETE JUNIOR — PORTFOLIO JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MAIN TERMINAL
       ===================================================== */

    const terminalCommands = {
        help: "Available commands: help, whoami, mission, motto, interests, status, projects, skills, contact, clear",
        whoami: "Pete Junior — Tech enthusiast, creator, future software engineer.",
        mission: "Build technology that solves real problems and changes lives.",
        motto: "Explore. Dream. Discover.",
        interests: "Tech • Coding • Gaming • Music • Gadgets • Poetry",
        status: "Currently learning, building, experimenting, and improving.",
        projects: "Portfolio • Scientific Calculator • More projects loading...",
        skills: "HTML • CSS • JavaScript • Problem Solving • Creative Thinking",
        contact: "GitHub: github.com/petejunior1up • Email: personal archive only"
    };

    const terminalForm = document.getElementById("terminalForm");
    const terminalInput = document.getElementById("terminalInput");
    const terminalOutput = document.getElementById("terminalOutput");

    if (terminalForm && terminalInput && terminalOutput) {
        function printLine(text, className = "") {
            const p = document.createElement("p");
            p.textContent = text;
            if (className) p.className = className;
            terminalOutput.appendChild(p);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }

        terminalForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const command = terminalInput.value.trim().toLowerCase();
            if (!command) return;

            printLine(`pete@portfolio:~$ ${command}`, "terminal-command");

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
        const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = pageHeight > 0
            ? `${(window.scrollY / pageHeight) * 100}%`
            : "0%";
    }

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    updateScrollProgress();

    /* =====================================================
       DEVELOPER MODE v2
       DESKTOP: KONAMI SEQUENCE
       MOBILE: HIDDEN PJ LOGO GESTURE
       ===================================================== */

    const secret = [
        "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
        "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight"
    ];

    let entered = [];
    let developerModeOpen = false;
    let developerUIReady = false;

    /* Stored as a SHA-256 digest so the access key is not exposed as plaintext. */
    const ARCHIVE_PASSWORD_HASH = "f7bf9bba06d80a89e533b185a6284d00060d5899db63573341cf90489651ae67";

    async function verifyArchiveKey(value) {
        const bytes = new TextEncoder().encode(value);
        const digest = await crypto.subtle.digest("SHA-256", bytes);
        const hash = Array.from(new Uint8Array(digest))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
        return hash === ARCHIVE_PASSWORD_HASH;
    }

    function injectDeveloperStyles() {
        if (document.getElementById("developer-mode-v2-styles")) return;

        const style = document.createElement("style");
        style.id = "developer-mode-v2-styles";
        style.textContent = `
            .dev-v2-trigger {
                position: fixed;
                right: 22px;
                bottom: 22px;
                z-index: 9997;
                border: 1px solid rgba(255,30,30,.55);
                background: rgba(4,4,4,.94);
                color: #ff1e1e;
                padding: 11px 15px;
                font: 700 10px/1 'Space Mono',monospace;
                letter-spacing: 1.4px;
                cursor: pointer;
                opacity: 0;
                pointer-events: none;
                transform: translateY(10px);
                transition: .25s ease;
                box-shadow: 0 0 25px rgba(255,30,30,.1);
                backdrop-filter: blur(8px);
            }

            body.secret-mode .dev-v2-trigger {
                opacity: 1;
                pointer-events: auto;
                transform: translateY(0);
            }

            .dev-v2-trigger:hover {
                background: #ff1e1e;
                color: #050505;
                box-shadow: 0 0 35px rgba(255,30,30,.28);
            }

            .dev-v2-overlay {
                position: fixed;
                inset: 0;
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 18px;
                background: rgba(0,0,0,.9);
                backdrop-filter: blur(14px);
            }

            .dev-v2-overlay.visible { display: flex; }

            .dev-v2-window {
                width: min(980px, 100%);
                max-height: min(780px, 94vh);
                overflow: hidden;
                border: 1px solid #292929;
                background: #050505;
                box-shadow: 0 35px 120px rgba(0,0,0,.85), 0 0 50px rgba(255,30,30,.08);
                font-family: 'Space Mono',monospace;
                animation: devWindowIn .22s ease-out;
            }

            @keyframes devWindowIn {
                from { opacity: 0; transform: scale(.97) translateY(8px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }

            .dev-v2-titlebar {
                height: 48px;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 0 16px;
                border-bottom: 1px solid #202020;
                background: #0c0c0c;
            }

            .dev-v2-dots { display:flex; gap:6px; }
            .dev-v2-dots i {
                width: 9px;
                height: 9px;
                border-radius: 50%;
                background: #333;
            }

            .dev-v2-title {
                flex: 1;
                color: #777;
                font-size: 9px;
                letter-spacing: 1px;
            }

            .dev-v2-close {
                border: 0;
                background: transparent;
                color: #555;
                cursor: pointer;
                font: 700 17px/1 'Space Mono',monospace;
            }

            .dev-v2-close:hover { color: #ff1e1e; }

            .dev-v2-body {
                height: calc(min(780px, 94vh) - 48px);
                min-height: 420px;
                overflow: auto;
                padding: clamp(22px, 5vw, 55px);
            }

            .dev-v2-terminal-head {
                display:flex;
                justify-content:space-between;
                gap:20px;
                align-items:flex-end;
                margin-bottom:28px;
            }

            .dev-v2-kicker {
                color:#ff1e1e;
                font-size:9px;
                letter-spacing:2px;
            }

            .dev-v2-heading {
                margin:10px 0 0;
                color:#f0f0f0;
                font:800 clamp(32px,6vw,64px)/.9 'Inter',sans-serif;
                letter-spacing:-3px;
            }

            .dev-v2-heading span { color:#ff1e1e; }

            .dev-v2-status {
                flex-shrink:0;
                color:#555;
                font-size:9px;
                letter-spacing:1px;
            }

            .dev-v2-status b { color:#ff1e1e; }

            .dev-v2-screen {
                border:1px solid #222;
                background:#030303;
                padding:20px;
                min-height:205px;
                max-height:300px;
                overflow:auto;
                box-shadow: inset 0 0 45px rgba(255,30,30,.025);
            }

            .dev-v2-line {
                margin:0 0 9px;
                color:#777;
                font:11px/1.65 'Space Mono',monospace;
            }

            .dev-v2-line .accent { color:#ff1e1e; }
            .dev-v2-line .bright { color:#ddd; }

            .dev-v2-input-row {
                display:flex;
                gap:8px;
                margin-top:10px;
                border:1px solid #222;
                background:#050505;
                padding:8px 10px;
            }

            .dev-v2-prompt { color:#ff1e1e; font:11px 'Space Mono',monospace; }

            .dev-v2-input {
                flex:1;
                min-width:0;
                border:0;
                outline:0;
                background:transparent;
                color:#eee;
                font:11px 'Space Mono',monospace;
            }

            .dev-v2-hint {
                margin-top:15px;
                color:#444;
                font-size:9px;
            }

            .dev-v2-archive {
                margin-top:30px;
                display:grid;
                grid-template-columns:repeat(2,1fr);
                gap:10px;
            }

            .dev-v2-card {
                border:1px solid #1d1d1d;
                padding:18px;
                background:rgba(255,255,255,.012);
                transition:.22s ease;
            }

            .dev-v2-card:hover {
                border-color:rgba(255,30,30,.55);
                transform:translateY(-2px);
            }

            .dev-v2-card small { color:#444; font-size:9px; }
            .dev-v2-card h3 {
                margin:18px 0 6px;
                color:#ddd;
                font:700 16px/1.2 'Inter',sans-serif;
            }
            .dev-v2-card p { margin:0; color:#666; font:10px/1.6 'Inter',sans-serif; }

            .dev-v2-auth {
                width:min(470px,100%);
                margin:auto;
                border:1px solid #222;
                padding:28px;
                background:#080808;
            }

            .dev-v2-auth-icon { color:#ff1e1e; font-size:25px; margin-bottom:14px; }
            .dev-v2-auth h2 {
                margin:0;
                color:#eee;
                font:800 27px/1 'Inter',sans-serif;
                letter-spacing:-1px;
            }
            .dev-v2-auth h2 span { color:#ff1e1e; }
            .dev-v2-auth p { color:#666; font:11px/1.7 'Inter',sans-serif; margin:12px 0 22px; }
            .dev-v2-auth form { display:flex; gap:8px; }
            .dev-v2-auth input {
                flex:1;
                min-width:0;
                border:1px solid #292929;
                outline:0;
                background:#040404;
                color:#eee;
                padding:13px;
                font:11px 'Space Mono',monospace;
            }
            .dev-v2-auth input:focus { border-color:#ff1e1e; }
            .dev-v2-auth button {
                border:1px solid #ff1e1e;
                background:#ff1e1e;
                color:#050505;
                padding:0 17px;
                cursor:pointer;
                font:700 10px 'Space Mono',monospace;
            }
            .dev-v2-error { min-height:17px; margin-top:10px; color:#ff1e1e; font-size:9px; }

            .dev-v2-archive-view .archive-meta {
                color:#ff1e1e;
                font-size:9px;
                letter-spacing:2px;
            }
            .dev-v2-archive-view h2 {
                margin:10px 0;
                color:#eee;
                font:800 clamp(35px,7vw,70px)/.9 'Inter',sans-serif;
                letter-spacing:-3px;
            }
            .dev-v2-archive-view h2 span { color:#ff1e1e; }
            .dev-v2-archive-view .archive-copy {
                max-width:680px;
                color:#666;
                font:12px/1.8 'Inter',sans-serif;
                margin-bottom:28px;
            }
            .dev-v2-note {
                margin-top:20px;
                color:#3f3f3f;
                font-size:8px;
                letter-spacing:1px;
            }

            @media(max-width:650px){
                .dev-v2-window { max-height:96vh; }
                .dev-v2-body { height:calc(96vh - 48px); padding:20px; }
                .dev-v2-terminal-head { display:block; }
                .dev-v2-status { margin-top:12px; }
                .dev-v2-archive { grid-template-columns:1fr; }
                .dev-v2-auth form { flex-direction:column; }
                .dev-v2-auth button { min-height:44px; }
                .dev-v2-trigger { right:12px; bottom:12px; }
            }
        `;
        document.head.appendChild(style);
    }

    function createDeveloperUI() {
        if (developerUIReady) return;
        developerUIReady = true;
        injectDeveloperStyles();

        const trigger = document.createElement("button");
        trigger.className = "dev-v2-trigger";
        trigger.textContent = "[ DEVELOPER MODE ]";
        trigger.setAttribute("aria-label", "Open Developer Mode");
        document.body.appendChild(trigger);

        const overlay = document.createElement("div");
        overlay.className = "dev-v2-overlay";
        overlay.id = "developerModeOverlay";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");

        overlay.innerHTML = `
            <div class="dev-v2-window">
                <div class="dev-v2-titlebar">
                    <div class="dev-v2-dots"><i></i><i></i><i></i></div>
                    <div class="dev-v2-title">PETE@SYSTEM:~ / DEVELOPER MODE v2.0</div>
                    <button class="dev-v2-close" id="devV2Close" aria-label="Close">×</button>
                </div>
                <div class="dev-v2-body" id="devV2Body"></div>
            </div>
        `;

        document.body.appendChild(overlay);

        const body = document.getElementById("devV2Body");
        const close = document.getElementById("devV2Close");

        function closeDeveloperMode() {
            overlay.classList.remove("visible");
            document.body.style.overflow = "";
        }

        function openDeveloperMode() {
            overlay.classList.add("visible");
            document.body.style.overflow = "hidden";
            showDeveloperTerminal();
        }

        function showDeveloperTerminal() {
            body.innerHTML = `
                <div class="dev-v2-terminal-head">
                    <div>
                        <div class="dev-v2-kicker">SYSTEM // DEVELOPER ACCESS</div>
                        <h1 class="dev-v2-heading">DEV<span>MODE.</span></h1>
                    </div>
                    <div class="dev-v2-status">STATUS: <b>ONLINE</b></div>
                </div>
                <div class="dev-v2-screen" id="devV2Screen">
                    <p class="dev-v2-line"><span class="accent">[ OK ]</span> Developer interface initialized.</p>
                    <p class="dev-v2-line"><span class="accent">[ OK ]</span> Portfolio systems detected.</p>
                    <p class="dev-v2-line">Welcome, explorer.</p>
                    <p class="dev-v2-line">Type <span class="bright">help</span> to see available commands.</p>
                </div>
                <form class="dev-v2-input-row" id="devV2Form">
                    <span class="dev-v2-prompt">pete@dev:~$</span>
                    <input class="dev-v2-input" id="devV2Input" autocomplete="off" spellcheck="false" aria-label="Developer command">
                </form>
                <div class="dev-v2-hint">TIP // Try: help, about, projects, skills, archive, clear, exit</div>
            `;

            const form = document.getElementById("devV2Form");
            const input = document.getElementById("devV2Input");
            const screen = document.getElementById("devV2Screen");

            const commands = {
                help: [
                    "COMMANDS:",
                    "about       — system identity",
                    "projects    — current builds",
                    "skills      — active modules",
                    "archive     — open personal archive",
                    "clear       — clear terminal",
                    "exit        — close developer mode"
                ],
                about: [
                    "PETE JUNIOR // PERSONAL PORTFOLIO",
                    "Builder. Learner. Creator.",
                    "Mission: build technology that solves real problems."
                ],
                projects: [
                    "PROJECT INDEX:",
                    "01 // PERSONAL PORTFOLIO     [ONLINE]",
                    "02 // SCIENTIFIC CALCULATOR  [ONLINE]",
                    "03 // NEXT PROJECT            [LOADING]"
                ],
                skills: [
                    "ACTIVE MODULES:",
                    "HTML        [████████░░]",
                    "CSS         [████████░░]",
                    "JAVASCRIPT  [██████░░░░]",
                    "PROBLEM SOLVING [ACTIVE]"
                ],
                archive: ["__ARCHIVE__"],
                clear: ["__CLEAR__"],
                exit: ["__EXIT__"]
            };

            function write(text, commandLine = false) {
                if (text === "__CLEAR__") {
                    screen.innerHTML = "";
                    return;
                }
                if (text === "__EXIT__") {
                    closeDeveloperMode();
                    return;
                }
                if (text === "__ARCHIVE__") {
                    showArchiveAuth();
                    return;
                }

                const p = document.createElement("p");
                p.className = "dev-v2-line";
                if (commandLine) p.classList.add("bright");
                p.textContent = text;
                screen.appendChild(p);
                screen.scrollTop = screen.scrollHeight;
            }

            form.addEventListener("submit", (event) => {
                event.preventDefault();
                const command = input.value.trim().toLowerCase();
                if (!command) return;

                write(`pete@dev:~$ ${command}`, true);
                if (commands[command]) {
                    commands[command].forEach(line => write(line));
                } else {
                    write(`Unknown command: ${command}`);
                    write("Type 'help' for available commands.");
                }
                input.value = "";
            });

            setTimeout(() => input.focus(), 80);
        }

        function showArchiveAuth() {
            body.innerHTML = `
                <div class="dev-v2-auth">
                    <div class="dev-v2-auth-icon">⌁</div>
                    <h2>ACCESS <span>RESTRICTED.</span></h2>
                    <p>The personal archive is intentionally separated from the public portfolio. Enter the access key to continue.</p>
                    <form id="devV2AuthForm">
                        <input id="devV2Password" type="password" placeholder="ACCESS KEY" autocomplete="off" spellcheck="false" aria-label="Archive access key">
                        <button type="submit">UNLOCK</button>
                    </form>
                    <div class="dev-v2-error" id="devV2Error"></div>
                </div>
            `;

            const form = document.getElementById("devV2AuthForm");
            const input = document.getElementById("devV2Password");
            const error = document.getElementById("devV2Error");

            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                const valid = await verifyArchiveKey(input.value);

                if (valid) {
                    showArchive();
                } else {
                    error.textContent = "ACCESS DENIED // INVALID KEY";
                    input.value = "";
                    input.focus();
                }
            });

            setTimeout(() => input.focus(), 80);
        }

        function showArchive() {
            body.innerHTML = `
                <div class="dev-v2-archive-view">
                    <div class="archive-meta">04.5 // PERSONAL ARCHIVE // ACCESS GRANTED</div>
                    <h2>THE <span>ARCHIVE.</span></h2>
                    <p class="archive-copy">A quieter side of Pete Junior's digital space — words, ideas, dreams, experiments, and unfinished pieces that don't belong on the public portfolio.</p>
                    <div class="dev-v2-archive">
                        <article class="dev-v2-card"><small>01</small><h3>Poems</h3><p>Words, verses, and pieces written along the way.</p></article>
                        <article class="dev-v2-card"><small>02</small><h3>Thoughts</h3><p>Personal reflections and ideas worth keeping.</p></article>
                        <article class="dev-v2-card"><small>03</small><h3>Dreams</h3><p>Ambitions, future plans, and things still becoming.</p></article>
                        <article class="dev-v2-card"><small>04</small><h3>Ideas</h3><p>Projects, concepts, experiments, and things to build.</p></article>
                        <article class="dev-v2-card"><small>05</small><h3>Unfinished</h3><p>Pieces that aren't finished yet — and don't need to be.</p></article>
                        <article class="dev-v2-card"><small>06</small><h3>Private Contact</h3><p>Personal contact details can live here instead of the public page.</p></article>
                    </div>
                    <div class="dev-v2-note">ARCHIVE // PRIVATE BY DESIGN // FRONT-END EASTER EGG ONLY</div>
                </div>
            `;
        }

        trigger.addEventListener("click", openDeveloperMode);
        close.addEventListener("click", closeDeveloperMode);

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) closeDeveloperMode();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && overlay.classList.contains("visible")) {
                closeDeveloperMode();
            }
        });

        /* =================================================
           MOBILE DEVELOPER MODE ACTIVATION
           5 TAPS ON THE PJ LOGO OR A LONG PRESS
           ================================================= */

        const mobileLogo = document.querySelector(".logo-mark");
        let mobileTapCount = 0;
        let mobileTapTimer = null;
        let mobileHoldTimer = null;
        let mobileHoldActivated = false;

        function activateDeveloperModeFromMobile() {
            developerModeOpen = true;
            document.body.classList.add("secret-mode");
            trigger.textContent = "[ DEVELOPER MODE ONLINE ]";
            openDeveloperMode();

            setTimeout(() => {
                trigger.textContent = "[ DEVELOPER MODE ]";
            }, 1800);
        }

        if (mobileLogo) {
            mobileLogo.setAttribute("aria-label", "Pete Junior home — hidden developer access");

            mobileLogo.addEventListener("pointerdown", () => {
                mobileHoldActivated = false;

                mobileHoldTimer = setTimeout(() => {
                    mobileHoldActivated = true;
                    activateDeveloperModeFromMobile();
                }, 1400);
            });

            mobileLogo.addEventListener("pointerup", (event) => {
                clearTimeout(mobileHoldTimer);

                if (mobileHoldActivated) {
                    event.preventDefault();
                    mobileHoldActivated = false;
                    return;
                }

                mobileTapCount++;

                clearTimeout(mobileTapTimer);
                mobileTapTimer = setTimeout(() => {
                    mobileTapCount = 0;
                }, 1800);

                if (mobileTapCount >= 5) {
                    event.preventDefault();
                    mobileTapCount = 0;
                    clearTimeout(mobileTapTimer);
                    activateDeveloperModeFromMobile();
                }
            });

            mobileLogo.addEventListener("pointercancel", () => {
                clearTimeout(mobileHoldTimer);
                mobileHoldActivated = false;
            });
        }

        /* =================================================
           DESKTOP DEVELOPER MODE — KONAMI SEQUENCE
           ================================================= */

        window.addEventListener("keydown", (event) => {
            if (event.repeat) return;
            entered.push(event.key);
            if (entered.length > secret.length) entered.shift();

            if (secret.every((key, index) => entered[index] === key)) {
                entered = [];
                developerModeOpen = !developerModeOpen;
                document.body.classList.toggle("secret-mode", developerModeOpen);

                if (developerModeOpen) {
                    createDeveloperUI();
                    trigger.focus();
                    trigger.textContent = "[ DEVELOPER MODE ONLINE ]";
                    setTimeout(() => {
                        trigger.textContent = "[ DEVELOPER MODE ]";
                    }, 1800);
                } else {
                    closeDeveloperMode();
                    trigger.textContent = "[ DEVELOPER MODE ]";
                }
            }
        });
    }

    createDeveloperUI();
});