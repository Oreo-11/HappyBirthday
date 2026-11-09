document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startBtn");
    const coverScreen = document.getElementById("coverScreen");
    const nextBtn = document.getElementById("nextBtn");
    const pages = Array.from(document.querySelectorAll(".page"));

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const coverFallback = reduceMotion ? 40 : 1850;
    const pageFallback = reduceMotion ? 40 : 1650;

    let currentPageIndex = 0;
    let opening = false;
    let bookOpened = false;
    let isFlipping = false;

    pages.forEach((page, index) => {
        page.style.zIndex = String(pages.length - index);
    });

    nextBtn.disabled = true;

    function waitForTransition(element, propertyName, fallbackMs, callback) {
        let finished = false;
        let timer;

        const finish = () => {
            if (finished) return;

            finished = true;
            clearTimeout(timer);
            element.removeEventListener("transitionend", onTransitionEnd);
            callback();
        };

        const onTransitionEnd = (event) => {
            if (
                event.target === element &&
                event.propertyName === propertyName
            ) {
                finish();
            }
        };

        element.addEventListener("transitionend", onTransitionEnd);
        timer = window.setTimeout(finish, fallbackMs);
    }

    function updateNextButton() {
        const hasNextPage = currentPageIndex < pages.length - 1;

        nextBtn.textContent = hasNextPage ? "Перелистнуть" : "Конец";
        nextBtn.disabled = !hasNextPage || isFlipping;
    }

    startBtn.addEventListener("click", () => {
        if (opening) return;

        opening = true;
        startBtn.disabled = true;

        waitForTransition(
            coverScreen,
            "transform",
            coverFallback,
            () => {
                bookOpened = true;
                updateNextButton();
                nextBtn.classList.remove("hidden");

                const firstFrame = pages[0]?.querySelector(".magic-svg");
                firstFrame?.classList.add("draw");
            }
        );

        coverScreen.classList.add("turned-cover");
    });

    nextBtn.addEventListener("click", () => {
        if (!bookOpened || isFlipping) return;

        const currentPage = pages[currentPageIndex];
        const nextPage = pages[currentPageIndex + 1];

        if (!currentPage || !nextPage) return;

        isFlipping = true;
        nextBtn.disabled = true;

        nextPage.classList.add("under-shadow");
        currentPage.classList.add("is-turning");

        waitForTransition(
            currentPage,
            "transform",
            pageFallback,
            () => {
                currentPage.style.zIndex = "0";
                currentPage.style.pointerEvents = "none";
                currentPage.classList.remove("is-turning");
                nextPage.classList.remove("under-shadow");

                currentPageIndex++;
                isFlipping = false;
                updateNextButton();
            }
        );

        currentPage.classList.add("turned");
    });
});