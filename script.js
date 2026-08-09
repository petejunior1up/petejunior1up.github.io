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

  const terminalForm = document.getElementById("terminalForm");
  const terminalInput = document.getElementById("terminalInput");
  const terminalOutput = document.getElementById("terminalOutput");

  if (!terminalForm || !terminalInput || !terminalOutput) {
    console.error("Terminal elements not found.");
    return;
  }

  function printLine(text) {
    const p = document.createElement("p");
    p.textContent = text;
    terminalOutput.appendChild(p);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  terminalForm.addEventListener("submit", function (e) {
    e.preventDefault();

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

  // Secret developer mode
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

    if (entered.length > secret.length) {
      entered.shift();
    }

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

    const currentWord = words[wordIndex];

    if (!deleting) {

        typingText.textContent =
            currentWord.substring(0, charIndex + 1);

        charIndex++;

        if (charIndex === currentWord.length) {

            deleting = true;

            setTimeout(typeEffect, 1500);

            return;
        }

    } else {

        typingText.textContent =
            currentWord.substring(0, charIndex - 1);

        charIndex--;

        if (charIndex === 0) {

            deleting = false;

            wordIndex =
                (wordIndex + 1) % words.length;

        }

    }


    setTimeout(typeEffect, deleting ? 60 : 100);

}


typeEffect();
   /* ==========================
   SCROLL PROGRESS BAR
========================== */

const progressBar = document.getElementById("scroll-progress");

window.addEventListener("scroll", () => {

    const scrollTop = window.scrollY;

    const pageHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

    const progress =
        (scrollTop / pageHeight) * 100;

    progressBar.style.width = progress + "%";

});
});
/* ===== FLOATING PARTICLES ===== */

.particles {
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 1;
}

.particles::before,
.particles::after {
    content: "";
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #ff2020;

    box-shadow:
        5vw 15vh #ff2020,
        12vw 70vh #ffffff,
        19vw 35vh #ff2020,
        27vw 82vh #ffffff,
        34vw 20vh #ff2020,
        42vw 65vh #ffffff,
        50vw 12vh #ff2020,
        58vw 78vh #ffffff,
        66vw 30vh #ff2020,
        74vw 60vh #ffffff,
        82vw 18vh #ff2020,
        90vw 75vh #ffffff,
        96vw 42vh #ff2020;

    opacity: 0.45;
    animation: floatParticles 10s ease-in-out infinite;
}

.particles::after {
    width: 2px;
    height: 2px;

    box-shadow:
        8vw 45vh #ffffff,
        16vw 20vh #ff2020,
        25vw 60vh #ffffff,
        38vw 40vh #ff2020,
        47vw 90vh #ffffff,
        55vw 35vh #ff2020,
        63vw 15vh #ffffff,
        72vw 85vh #ff2020,
        81vw 50vh #ffffff,
        94vw 25vh #ff2020;

    opacity: 0.3;
    animation-duration: 16s;
    animation-delay: -5s;
}

@keyframes floatParticles {
    0% {
        transform: translateY(25px);
    }

    50% {
        transform: translateY(-25px);
    }

    100% {
        transform: translateY(25px);
    }
}
/* ===== MOUSE GLOW ===== */

.mouse-glow {
    position: fixed;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(
        circle,
        rgba(255, 30, 30, 0.12) 0%,
        rgba(255, 30, 30, 0.05) 35%,
        transparent 70%
    );
    transform: translate(-50%, -50%);
    z-index: 0;
}
