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
