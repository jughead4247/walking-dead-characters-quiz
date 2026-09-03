(() => {

    "use strict";

    /* ============================================================
       ELEMENTS
    ============================================================ */

    const startScreen = document.getElementById("start-screen");
    const quizScreen = document.getElementById("quiz-screen");
    const resultScreen = document.getElementById("result-screen");

    const startBtn = document.getElementById("start-btn");
    const backBtn = document.getElementById("back-btn");
    const nextBtn = document.getElementById("next-btn");
    const submitBtn = document.getElementById("submit-btn");
    const restartBtn = document.getElementById("restart-btn");
    const shareBtn = document.getElementById("share-btn");
    const challengeBtn = document.getElementById("challenge-btn");

    const questionNumber = document.getElementById("question-number");
    const progressText = document.getElementById("progress-text");
    const progressBar = document.getElementById("progress-bar");
    const questionElement = document.getElementById("question");
    const answersElement = document.getElementById("answers");

    const resultTitle = document.getElementById("result-title");
    const winnerImage = document.getElementById("winner-image");
    const matchScore = document.getElementById("match-score");
    const resultDescription = document.getElementById("result-description");

    const topMatches = document.getElementById("top-matches");
    const strongestTraits = document.getElementById("strongest-traits");
    const lowestTraits = document.getElementById("lowest-traits");
    const traitProfile = document.getElementById("trait-profile");


    /* ============================================================
       ENGINE CHECK
    ============================================================ */

    const questions = window.TWD_PERSONALITY_QUESTIONS || [];

    if (
        !questions.length ||
        typeof window.calculateFinalPersonality !== "function"
    ) {
        console.error(
            "TWD personality engine was not loaded correctly."
        );

        if (startBtn) {
            startBtn.disabled = true;
            startBtn.textContent = "QUIZ DATA ERROR";
        }

        return;
    }


    /* ============================================================
       STATE
    ============================================================ */

    let currentQuestion = 0;
    let answerIndexes = {};
    let lastResult = null;


    /* ============================================================
       SCREEN CONTROL
    ============================================================ */

    function showScreen(screen) {

        startScreen.classList.add("hidden");
        quizScreen.classList.add("hidden");
        resultScreen.classList.add("hidden");

        screen.classList.remove("hidden");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    /* ============================================================
       CURRENT ANSWER
    ============================================================ */

    function getSelectedIndex() {

        const question = questions[currentQuestion];

        if (!question) {
            return null;
        }

        const index = answerIndexes[question.id];

        if (
            Number.isInteger(index) &&
            index >= 0 &&
            index < question.answers.length
        ) {
            return index;
        }

        return null;
    }


    /* ============================================================
       RENDER QUESTION
    ============================================================ */

    function renderQuestion() {

        const question = questions[currentQuestion];
        const total = questions.length;

        if (!question) {
            return;
        }

        questionNumber.textContent =
            `Question ${currentQuestion + 1} of ${total}`;

        const percent = Math.round(
            ((currentQuestion + 1) / total) * 100
        );

        progressText.textContent = `${percent}%`;
        progressBar.style.width = `${percent}%`;

        questionElement.textContent = question.question;

        answersElement.innerHTML = "";

        const selectedIndex = getSelectedIndex();

        question.answers.forEach((answer, index) => {

            const button = document.createElement("button");

            button.type = "button";
            button.className = "answer";
            button.textContent = answer.text;

            if (selectedIndex === index) {
                button.classList.add("selected");
            }

            button.addEventListener("click", () => {

                answerIndexes[question.id] = index;

                Array.from(
                    answersElement.children
                ).forEach(element => {
                    element.classList.remove("selected");
                });

                button.classList.add("selected");

                updateNavigation();


                /*
                   AUTO-FORWARD

                   Questions 1-29 automatically move
                   to the next question.

                   Question 30 stays on screen so the
                   user can press SEE MY RESULT.
                */

                if (
                    currentQuestion <
                    questions.length - 1
                ) {

                    setTimeout(() => {

                        currentQuestion++;

                        renderQuestion();

                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                    }, 150);

                }

            });

            answersElement.appendChild(button);

        });

        updateNavigation();
    }


    /* ============================================================
       NAVIGATION
    ============================================================ */

    function updateNavigation() {

        const selected = getSelectedIndex();

        const last =
            currentQuestion === questions.length - 1;


        backBtn.classList.toggle(
            "hidden",
            currentQuestion === 0
        );


        nextBtn.classList.toggle(
            "hidden",
            last
        );


        submitBtn.classList.toggle(
            "hidden",
            !last
        );


        /*
           Because normal questions auto-forward,
           NEXT is still available as a fallback.
        */

        nextBtn.disabled =
            selected === null;


        submitBtn.disabled =
            selected === null;
    }


    /* ============================================================
       START
    ============================================================ */

    function startQuiz() {

        currentQuestion = 0;

        answerIndexes = {};

        lastResult = null;

        showScreen(quizScreen);

        renderQuestion();
    }


    /* ============================================================
       NEXT
    ============================================================ */

    function goNext() {

        if (getSelectedIndex() === null) {
            return;
        }

        if (
            currentQuestion <
            questions.length - 1
        ) {

            currentQuestion++;

            renderQuestion();
        }
    }


    /* ============================================================
       BACK
    ============================================================ */

    function goBack() {

        if (currentQuestion > 0) {

            currentQuestion--;

            renderQuestion();
        }
    }


    /* ============================================================
       SUBMIT
    ============================================================ */

    function submitQuiz() {

        if (
            typeof window.isQuizComplete ===
            "function"
        ) {

            if (
                !window.isQuizComplete(
                    answerIndexes
                )
            ) {

                console.error(
                    "Quiz is incomplete."
                );

                return;
            }
        }


        try {

            const result =
                window.calculateFinalPersonality(
                    answerIndexes
                );


            if (
                !result ||
                !result.winner
            ) {

                throw new Error(
                    "No personality result returned."
                );
            }


            lastResult = result;

            renderResult(result);

            showScreen(resultScreen);

        } catch (error) {

            console.error(
                "Unable to calculate TWD result:",
                error
            );

            alert(
                "There was a problem calculating your result. Please refresh the page and try again."
            );
        }
    }


    /* ============================================================
       RESULT
    ============================================================ */

    function renderResult(result) {

        const winner = result.winner;

        resultTitle.textContent =
            `You are most like ${winner.name}`;

        matchScore.textContent =
            winner.similarity;

        if (winner.image) {

            winnerImage.src =
                winner.image;

            winnerImage.alt =
                winner.name;

        } else {

            winnerImage.removeAttribute("src");

            winnerImage.alt = "";
        }


        resultDescription.textContent =
            `${winner.name} is your closest personality match based on your 16-trait profile. ` +
            `Your decisions produced a ${winner.similarity}% similarity with this character.`;


        if (Array.isArray(result.results)) {

            renderTopMatches(
                result.results.slice(0, 3)
            );
        }


        if (Array.isArray(result.strongestTraits)) {

            renderTraitList(
                strongestTraits,
                result.strongestTraits
            );
        }


        if (Array.isArray(result.lowestTraits)) {

            renderTraitList(
                lowestTraits,
                result.lowestTraits
            );
        }


        if (result.profile) {

            renderFullProfile(
                result.profile
            );
        }
    }


    /* ============================================================
       TOP 3 MATCHES
    ============================================================ */

    function renderTopMatches(matches) {

        topMatches.innerHTML = "";

        matches.forEach((match, index) => {

            const row =
                document.createElement("div");

            row.className = "match-item";


            const rank =
                document.createElement("div");

            rank.className = "match-rank";

            rank.textContent =
                `#${index + 1}`;


            const image =
                document.createElement("img");

            image.className = "match-thumb";

            if (match.image) {
                image.src = match.image;
            }

            image.alt = match.name;

            image.loading = "lazy";


            const name =
                document.createElement("div");

            name.className = "match-name";

            name.textContent = match.name;


            const percent =
                document.createElement("div");

            percent.className =
                "match-percent";

            percent.textContent =
                `${match.similarity}%`;


            row.append(
                rank,
                image,
                name,
                percent
            );


            topMatches.appendChild(row);

        });
    }


    /* ============================================================
       TRAIT LIST
    ============================================================ */

    function renderTraitList(container, traits) {

        container.innerHTML = "";

        traits.forEach(trait => {

            const row =
                document.createElement("div");

            row.className = "trait-row";


            const top =
                document.createElement("div");

            top.className = "trait-top";


            const name =
                document.createElement("span");

            name.className = "trait-name";

            name.textContent =
                trait.label ||
                trait.name ||
                trait.trait;


            const value =
                document.createElement("span");

            value.className = "trait-value";

            value.textContent =
                `${trait.score}%`;


            top.append(
                name,
                value
            );


            const bar =
                document.createElement("div");

            bar.className = "trait-bar";


            const fill =
                document.createElement("div");

            fill.className = "trait-fill";

            fill.style.width =
                `${Math.max(
                    0,
                    Math.min(
                        100,
                        trait.score
                    )
                )}%`;


            bar.appendChild(fill);

            row.append(
                top,
                bar
            );

            container.appendChild(row);

        });
    }


    /* ============================================================
       FULL PROFILE
    ============================================================ */

    function renderFullProfile(profile) {

        traitProfile.innerHTML = "";

        const keys =
            window.TRAIT_KEYS || [];

        const labels =
            window.TWD_TRAITS || [];


        keys.forEach((key, index) => {

            const score =
                Number(
                    profile[key] ?? 65
                );


            const row =
                document.createElement("div");

            row.className =
                "profile-row";


            const label =
                document.createElement("div");

            label.className =
                "profile-label";


            const name =
                document.createElement("span");

            name.textContent =
                labels[index] || key;


            const value =
                document.createElement("span");

            value.textContent =
                score;


            label.append(
                name,
                value
            );


            const track =
                document.createElement("div");

            track.className =
                "profile-track";


            const fill =
                document.createElement("div");

            fill.className =
                "profile-fill";

            fill.style.width =
                `${Math.max(
                    0,
                    Math.min(
                        100,
                        score
                    )
                )}%`;


            track.appendChild(fill);


            row.append(
                label,
                track
            );


            traitProfile.appendChild(row);

        });
    }


    /* ============================================================
       RESTART
    ============================================================ */

    function restartQuiz() {

        startQuiz();
    }


    /* ============================================================
       SHARE RESULT
    ============================================================ */

    async function shareResult() {

        if (
            !lastResult ||
            !lastResult.winner
        ) {
            return;
        }


        const winner =
            lastResult.winner;


        const text =
            `I got ${winner.name} in the Walking Dead Personality Quiz — ` +
            `${winner.similarity}% match!`;


        const url =
            window.location.href;


        /*
           Use native sharing when available.
        */

        if (
            navigator.share
        ) {

            try {

                await navigator.share({

                    title:
                        "My Walking Dead Personality Result",

                    text:
                        text,

                    url:
                        url
                });

                return;

            } catch (error) {

                if (
                    error.name ===
                    "AbortError"
                ) {
                    return;
                }

                console.log(
                    "Native sharing unavailable."
                );
            }
        }


        /*
           Clipboard fallback.
        */

        const shareText =
            `${text}\n${url}`;


        try {

            await copyText(shareText);

            alert(
                "Your result and quiz link have been copied!"
            );

        } catch (error) {

            prompt(
                "Copy your result:",
                shareText
            );
        }
    }


    /* ============================================================
       CHALLENGE FRIENDS
    ============================================================ */

    async function challengeFriends() {

        let text =
            "I just took the Walking Dead Personality Quiz.";


        if (
            lastResult &&
            lastResult.winner
        ) {

            text +=
                ` I got ${lastResult.winner.name} ` +
                `with a ${lastResult.winner.similarity}% match.`;
        }


        text +=
            " Which Walking Dead character will you get?";


        const url =
            window.location.href;


        if (
            navigator.share
        ) {

            try {

                await navigator.share({

                    title:
                        "Walking Dead Personality Quiz",

                    text:
                        text,

                    url:
                        url
                });

                return;

            } catch (error) {

                if (
                    error.name ===
                    "AbortError"
                ) {
                    return;
                }

                console.log(
                    "Native sharing unavailable."
                );
            }
        }


        const challengeText =
            `${text}\n${url}`;


        try {

            await copyText(
                challengeText
            );

            alert(
                "Challenge message and quiz link copied!"
            );

        } catch (error) {

            prompt(
                "Copy this challenge:",
                challengeText
            );
        }
    }


    /* ============================================================
       COPY FUNCTION
    ============================================================ */

    async function copyText(text) {

        /*
           Modern clipboard.
        */

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(
                text
            );

            return;
        }


        /*
           Fallback for file:// and older browsers.
        */

        const textarea =
            document.createElement("textarea");

        textarea.value =
            text;

        textarea.style.position =
            "fixed";

        textarea.style.left =
            "-9999px";

        textarea.style.top =
            "0";

        textarea.style.opacity =
            "0";


        document.body.appendChild(
            textarea
        );


        textarea.focus();

        textarea.select();


        const successful =
            document.execCommand("copy");


        textarea.remove();


        if (!successful) {

            throw new Error(
                "Copy operation failed."
            );
        }
    }


    /* ============================================================
       EVENT LISTENERS
    ============================================================ */

    startBtn.addEventListener(
        "click",
        startQuiz
    );


    backBtn.addEventListener(
        "click",
        goBack
    );


    nextBtn.addEventListener(
        "click",
        goNext
    );


    submitBtn.addEventListener(
        "click",
        submitQuiz
    );


    restartBtn.addEventListener(
        "click",
        restartQuiz
    );


    shareBtn.addEventListener(
        "click",
        shareResult
    );


    challengeBtn.addEventListener(
        "click",
        challengeFriends
    );


    /* ============================================================
       DEBUG
    ============================================================ */

    window.TWD_QUIZ_UI = {

        startQuiz,

        renderQuestion,

        submitQuiz,

        getAnswers: () => ({
            ...answerIndexes
        })

    };
})
    ();

// ===============================
// GLOBAL SITE MENU
// ===============================

const menuToggle = document.getElementById("menu-toggle");
const siteMenu = document.getElementById("site-menu");

if (menuToggle && siteMenu) {

    // OPEN / CLOSE WITH HAMBURGER
    menuToggle.addEventListener("click", function (event) {

        event.stopPropagation();

        const isOpen =
            menuToggle.getAttribute("aria-expanded") === "true";

        siteMenu.hidden = isOpen;

        menuToggle.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );

        menuToggle.setAttribute(
            "aria-label",
            isOpen
                ? "Open navigation"
                : "Close navigation"
        );

    });


    // CLOSE WHEN CLICKING OUTSIDE
    document.addEventListener("click", function (event) {

        if (
            !siteMenu.hidden &&
            !siteMenu.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {

            siteMenu.hidden = true;

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.setAttribute(
                "aria-label",
                "Open navigation"
            );

        }

    });


    // CLOSE AFTER CLICKING A MENU LINK
    siteMenu.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {

            siteMenu.hidden = true;

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.setAttribute(
                "aria-label",
                "Open navigation"
            );

        });

    });

}

