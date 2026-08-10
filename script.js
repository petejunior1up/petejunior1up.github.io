/* ==========================================
   PETE JUNIOR PORTFOLIO
   script.js
========================================== */

const terminalCommands = {
  help: "Available commands: help, whoami, mission, motto, interests, status, clear",
  whoami: "Pete Junior — Tech enthusiast, creator, future software engineer.",
  mission: "Build technology that solves real problems and changes lives.",
  motto: "Explore. Dream. Discover.",
  interests: "Tech • Coding • Gaming • Music • Gadgets • Poetry",
  status: "Currently learning HTML & CSS and building amazing projects."
};

document.addEventListener("DOMContentLoaded", () => {

  // ---------- Terminal setup ----------
  const terminalForm = document.getElementById("terminalForm");
  const terminalInput = document.getElementById("terminalInput");
  const terminalOutput = document.getElementById("terminalOutput");

  if (!terminalForm || !terminalInput || !terminalOutput) {
    console.warn("Terminal elements not found — skipping terminal setup.");
  } else {
    // accessibility: announce new content to screen readers
    terminalOutput.setAttribute('aria-live', 'polite');

    // preserve initial welcome lines so we can reprint after clear
    const initialLines = Array.from(terminalOutput.querySelectorAll('p')).map(p => p.innerHTML);

    function printLine(text, asHtml = false) {
      const p = document.createElement("p");
      if (asHtml) p.innerHTML = text;
      else p.textContent = text;
      terminalOutput.appendChild(p);
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function renderInitialLines() {
      terminalOutput.innerHTML = '';
      initialLines.forEach(html => printLine(html, true));
    }

    // focus input on load
    terminalInput.focus();

    // simple command history (most recent first)
    const history = [];
    let historyIndex = -1;

    terminalForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const raw = terminalInput.value.trim();
      const command = raw.toLowerCase();

      if (command === "") return;

      printLine("pete@portfolio:~$ " + raw);

      // add to history
      if (raw) {
        history.unshift(raw);
        // keep history size reasonable
        if (history.length > 50) history.pop();
      }
      historyIndex = -1;

      if (command === "clear") {
        renderInitialLines();
      } else if (terminalCommands[command]) {
        printLine(terminalCommands[command]);
      } else {
        printLine("Command not found.");
        printLine("Type 'help' for available commands.");
      }

      terminalInput.value = "";
      terminalInput.focus();
    });

    // navigate history with ArrowUp/ArrowDown and support Escape to clear input
    terminalInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') {
        if (history.length && historyIndex < history.length - 1) {
          historyIndex++;
          terminalInput.value = history[historyIndex];
          // move caret to end
          setTimeout(() => terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length), 0);
          e.preventDefault();
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIndex > 0) {
          historyIndex--;
          terminalInput.value = history[historyIndex];
        } else {
          historyIndex = -1;
          terminalInput.value = '';
        }
        e.preventDefault();
      } else if (e.key === 'Escape') {
        terminalInput.value = '';
      }
    });
  }

  // ---------- Secret developer mode (Konami-like) ----------
  const secret = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight"
  ];

  let entered = [];

  document.addEventListener("keydown", function (e) {
    entered.push(e.key);

    if (entered.length > secret.length) entered.shift();

    if (JSON.stringify(entered) === JSON.stringify(secret)) {
      document.body.classList.toggle("secret-mode");
      alert("🛠 Developer Mode Activated!");
    }
  });

  console.log("Pete Junior Portfolio Loaded Successfully.");

  // =========================
  // TYPEWRITER EFFECT
  // =========================
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
    if (!typingText) return; // safety: nothing to type into

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

  // start the typewriter only if the element exists
  if (typingText) typeEffect();

  // ==========================
  // SCROLL PROGRESS BAR
  // ==========================
  const progressBar = document.getElementById("scroll-progress");
  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY || window.pageYOffset;
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = pageHeight > 0 ? (scrollTop / pageHeight) * 100 : 0;
      progressBar.style.width = progress + "%";
    };

    // init and listen
    updateProgress();
    window.addEventListener("scroll", updateProgress);
    window.addEventListener("resize", updateProgress);
  }

  // Optional: safe glow mouseleave handler (no error if element doesn't exist)
  const glow = document.getElementById('glow');
  document.addEventListener('mouseleave', () => {
    if (glow) glow.style.opacity = '0';
  });

});
