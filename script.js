/* =========================================================
   PETE JUNIOR — PORTFOLIO JAVASCRIPT
   ========================================================= */


/* =========================================================
   WAIT FOR PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       TERMINAL
       ===================================================== */

    const terminalCommands = {

        help:
            "Available commands: help, whoami, mission, motto, interests, status, clear",

        whoami:
            "Pete Junior — Tech enthusiast, creator, future software engineer.",

        mission:
            "Build technology that solves real problems and changes lives.",

        motto:
            "Explore. Dream. Discover.",

        interests:
            "Tech • Coding • Gaming • Music • Gadgets • Poetry",

        status:
            "Currently learning HTML & CSS and building amazing projects."

    };


    const terminalForm =
        document.getElementById("terminalForm");

    const terminalInput =
        document.getElementById("terminalInput");

    const terminalOutput =
        document.getElementById("terminalOutput");


    if (
        terminalForm &&
        terminalInput &&
        terminalOutput
    ) {

        function printLine(text) {

            const p =
                document.createElement("p");

            p.textContent = text;

            terminalOutput.appendChild(p);

            terminalOutput.scrollTop =
                terminalOutput.scrollHeight;
        }


        terminalForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const command =
                    terminalInput.value
                        .trim()
                        .toLowerCase();


                if (command === "") {
                    return;
                }


                printLine(
                    "pete@portfolio:~$ " + command
                );


                if (command === "clear") {

                    terminalOutput.innerHTML = "";

                }

                else if (
                    terminalCommands[command]
                ) {

                    printLine(
                        terminalCommands[command]
                    );

                }

                else {

                    printLine(
                        "Command not found."
                    );

                    printLine(
                        "Type 'help' for available commands."
                    );
                }


                terminalInput.value = "";

            }
        );

    }


    /* =====================================================
       TYPEWRITER
       ===================================================== */

    const typingText =
        document.getElementById("typing-text");


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

        if (!typingText) {
            return;
        }


        const currentWord =
            words[wordIndex];


        if (!deleting) {

            typingText.textContent =
                currentWord.substring(
                    0,
                    charIndex + 1
                );

            charIndex++;


            if (
                charIndex ===
                currentWord.length
            ) {

                deleting = true;

                setTimeout(
                    typeEffect,
                    1500
                );

                return;
            }

        }

        else {

            typingText.textContent =
                currentWord.substring(
                    0,
                    charIndex - 1
                );

            charIndex--;


            if (charIndex === 0) {

                deleting = false;

                wordIndex =
                    (wordIndex + 1) %
                    words.length;
            }
        }


        setTimeout(
            typeEffect,
            deleting ? 60 : 100
        );
    }


    typeEffect();


    /* =====================================================
       SCROLL PROGRESS
       ===================================================== */

    const progressBar =
        document.getElementById(
            "scroll-progress"
        );


    function updateScrollProgress() {

        if (!progressBar) {
            return;
        }


        const scrollTop =
            window.scrollY;


        const pageHeight =
            document.documentElement
                .scrollHeight -
            window.innerHeight;


        if (pageHeight <= 0) {

            progressBar.style.width = "0%";

            return;
        }


        const progress =
            (scrollTop / pageHeight) *
            100;


        progressBar.style.width =
            progress + "%";
    }


    window.addEventListener(
        "scroll",
        updateScrollProgress
    );


    updateScrollProgress();


    /* =====================================================
       SECRET DEVELOPER MODE
       ===================================================== */

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


    document.addEventListener(
        "keydown",
        function (event) {

            entered.push(event.key);


            if (
                entered.length >
                secret.length
            ) {

                entered.shift();
            }


            if (
                JSON.stringify(entered) ===
                JSON.stringify(secret)
            ) {

                document.body.classList.toggle(
                    "secret-mode"
                );


                alert(
                    "🛠 Developer Mode Activated!"
                );


                entered = [];
            }

        }
    );


    /* =====================================================
       CONSOLE MESSAGE
       ===================================================== */

    console.log(
        "Pete Junior Portfolio Loaded Successfully."
    );

});
