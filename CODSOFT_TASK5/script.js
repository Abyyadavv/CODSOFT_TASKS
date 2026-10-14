// ============================================
// THE DAILY EDIT — BLOG WEBSITE
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------
    // SELECT HTML ELEMENTS
    // ----------------------------------------

    const select = (...selectors) => {
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) return element;
        }
        return null;
    };

    const selectAll = (selector) =>
        Array.from(document.querySelectorAll(selector));

    const menuToggle = select("#menuToggle", ".menu-toggle");
    const navLinks = select("#navLinks", ".nav-links");
    const themeToggle = select("#themeToggle", ".theme-toggle");

    const searchInput = select(
        "#searchInput",
        "#search",
        ".search-box input"
    );

    const filterButtons = selectAll(
        ".filter-btn, .category-filter"
    );

    const blogGrid = select(
        "#blogGrid",
        ".blog-grid",
        "#articlesGrid"
    );

    const loadMoreButton = select(
        "#loadMoreBtn",
        "#loadMore",
        ".load-more-btn"
    );

    const resultsMessage = select("#resultsMessage");

    const articleDialog = select("#articleDialog");

    const featuredCard = select("#featuredCard");

    // ----------------------------------------
    // MOBILE NAVIGATION
    // ----------------------------------------

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("active");

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuToggle.textContent = isOpen ? "✕" : "☰";
        });

        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.textContent = "☰";
            });
        });

        document.addEventListener("click", event => {
            if (
                navLinks.classList.contains("active") &&
                !navLinks.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                navLinks.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.textContent = "☰";
            }
        });
    }

    // ----------------------------------------
    // DARK MODE
    // ----------------------------------------

    const savedTheme = localStorage.getItem("dailyEditTheme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    function updateThemeButton() {
        if (!themeToggle) return;

        const isDark = document.body.classList.contains("dark-mode");

        themeToggle.textContent = isDark ? "☀" : "☾";

        themeToggle.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );

        themeToggle.title = isDark ? "Light mode" : "Dark mode";
    }

    updateThemeButton();

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");

            const theme = document.body.classList.contains("dark-mode")
                ? "dark"
                : "light";

            localStorage.setItem("dailyEditTheme", theme);

            updateThemeButton();
        });
    }

    // ----------------------------------------
    // BLOG ARTICLE DATA
    // ----------------------------------------

    const articles = [
        {
            id: 1,
            title: "The Art of Slow Living in a Fast-Paced World",
            category: "Lifestyle",
            date: "October 08, 2026",
            author: "Abhishek Yadav",
            readTime: "5 min read",
            excerpt: "Discover how slowing down, simplifying routines, and being more intentional can improve your everyday life.",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80",
            tags: ["Lifestyle", "Wellness"],
            paragraphs: [
                "Modern life often feels like a race against the clock. Notifications, deadlines, and endless to-do lists can make even ordinary days feel overwhelming.",
                "Slow living is about making conscious choices. It means giving your attention to what matters instead of trying to do everything at once.",
                "Start small. Enjoy a meal without distractions, take a short walk, spend time with people you care about, and create space in your day to rest.",
                "A slower routine does not mean giving up your ambitions. It means approaching them with greater clarity, balance, and intention."
            ]
        },
        {
            id: 2,
            title: "Building a Morning Routine That Actually Works",
            category: "Lifestyle",
            date: "October 06, 2026",
            author: "Abhishek Yadav",
            readTime: "4 min read",
            excerpt: "A practical approach to creating a morning routine that fits your schedule without adding unnecessary pressure.",
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
            tags: ["Habits", "Productivity"],
            paragraphs: [
                "A useful morning routine does not need to be complicated. The best routine is one you can realistically maintain.",
                "Choose two or three simple activities, such as drinking water, stretching, reading, or reviewing your priorities for the day.",
                "Prepare a few things the night before. Organizing your workspace and deciding what to do first can make mornings less stressful.",
                "Consistency matters more than perfection. Adjust your routine when your schedule changes and focus on habits that genuinely help you."
            ]
        },
        {
            id: 3,
            title: "Minimalism: Making Space for What Matters",
            category: "Lifestyle",
            date: "October 04, 2026",
            author: "Abhishek Yadav",
            readTime: "6 min read",
            excerpt: "Explore how reducing clutter and unnecessary commitments can make your home and daily life feel more intentional.",
            image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=80",
            tags: ["Minimalism", "Lifestyle"],
            paragraphs: [
                "Minimalism is not simply about owning fewer things. It is about understanding what adds value to your life.",
                "Begin with one small area, such as your desk, wardrobe, or digital workspace. Keep what you use and appreciate, and reconsider what no longer serves a purpose.",
                "You can also apply the same principle to your time. Review your commitments and make room for activities that align with your priorities.",
                "The goal is not an empty home or an empty calendar. The goal is a more intentional way of living."
            ]
        },
        {
            id: 4,
            title: "Simple Ways to Make Your Workspace More Productive",
            category: "Productivity",
            date: "October 02, 2026",
            author: "Abhishek Yadav",
            readTime: "5 min read",
            excerpt: "Create a workspace that supports concentration with practical changes to organization, lighting, and daily planning.",
            image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
            tags: ["Workspace", "Focus"],
            paragraphs: [
                "Your workspace can influence how easily you begin and complete tasks. A few thoughtful changes can make it easier to focus.",
                "Keep frequently used items within reach and remove objects that distract you. A clean desk does not need to be perfectly empty.",
                "Lighting, comfortable seating, and an appropriate screen height can make long work sessions more comfortable.",
                "Before starting work, write down your most important task. Work on it in a focused session before moving to less important activities."
            ]
        },
        {
            id: 5,
            title: "A Beginner's Guide to Personal Finance",
            category: "Finance",
            date: "September 29, 2026",
            author: "Abhishek Yadav",
            readTime: "7 min read",
            excerpt: "Learn the basics of tracking expenses, setting savings goals, and making more informed financial decisions.",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
            tags: ["Money", "Planning"],
            paragraphs: [
                "Managing money begins with understanding where it goes. Tracking income and expenses gives you a clearer picture of your financial habits.",
                "Separate essential expenses, optional spending, savings, and financial goals. The exact amounts depend on your income and responsibilities.",
                "An emergency fund can help cover unexpected costs. Build it gradually according to your circumstances.",
                "Before making an investment, understand its risks, fees, time horizon, and whether it fits your financial goals."
            ]
        },
        {
            id: 6,
            title: "How Technology Is Changing the Way We Learn",
            category: "Technology",
            date: "September 26, 2026",
            author: "Abhishek Yadav",
            readTime: "5 min read",
            excerpt: "Explore digital learning tools, online communities, and practical ways to build skills in a changing world.",
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
            tags: ["Technology", "Learning"],
            paragraphs: [
                "Digital tools have made educational resources available to more people. Online courses, tutorials, and communities can help learners explore new subjects.",
                "However, access to information is only the beginning. Learning requires practice, feedback, and the ability to evaluate information carefully.",
                "Choose a specific skill, follow a structured learning path, and build small projects to apply what you learn.",
                "Technology works best when it supports active learning instead of replacing curiosity, critical thinking, and consistent effort."
            ]
        },
        {
            id: 7,
            title: "The Everyday Benefits of Spending Time Outdoors",
            category: "Wellness",
            date: "September 23, 2026",
            author: "Abhishek Yadav",
            readTime: "4 min read",
            excerpt: "Small outdoor activities can add variety to your routine and give you a break from screens and indoor environments.",
            image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80",
            tags: ["Nature", "Wellness"],
            paragraphs: [
                "Spending time outdoors offers a simple change of pace from work, study, and screen-based activities.",
                "You do not need an elaborate trip. A walk around your neighborhood, a visit to a local park, or time in a garden can be a good starting point.",
                "Choose activities that fit your schedule and physical comfort. Even a short outdoor break can provide a welcome change in your day.",
                "Make outdoor time a regular option rather than another demanding task on your to-do list."
            ]
        },
        {
            id: 8,
            title: "Creative Thinking: Turning Small Ideas Into Projects",
            category: "Creativity",
            date: "September 20, 2026",
            author: "Abhishek Yadav",
            readTime: "6 min read",
            excerpt: "Learn how to capture ideas, experiment with possibilities, and turn a simple concept into something useful.",
            image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
            tags: ["Ideas", "Creativity"],
            paragraphs: [
                "Creative projects often begin with an ordinary observation, a problem, or a question that keeps returning to mind.",
                "Write ideas down without immediately judging them. Later, choose one that interests you and can be explored with the resources you have.",
                "Break the idea into a small first version. A simple prototype or rough draft is easier to improve than an idea that never leaves your notebook.",
                "Ask for feedback, learn from mistakes, and refine the result. Creativity grows through experimentation and practice."
            ]
        },
        {
            id: 9,
            title: "Digital Wellbeing: Finding a Better Screen Balance",
            category: "Wellness",
            date: "September 17, 2026",
            author: "Abhishek Yadav",
            readTime: "5 min read",
            excerpt: "Create healthier technology habits with practical boundaries around notifications, work sessions, and downtime.",
            image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
            tags: ["Digital Life", "Balance"],
            paragraphs: [
                "Screens help us work, learn, communicate, and relax. Problems can arise when digital activity crowds out rest or other important parts of daily life.",
                "Review which notifications you really need. Turn off unnecessary alerts and decide when you want to check messages.",
                "Create screen-free moments around meals, bedtime, or other activities that matter to you.",
                "The goal is not to avoid technology. It is to use it deliberately and make room for the rest of your life."
            ]
        }
    ];

    // ----------------------------------------
    // ARTICLE STATE
    // ----------------------------------------

    let activeCategory = "All";
    let searchQuery = "";
    let visibleCount = 6;
    const ARTICLES_PER_PAGE = 3;

    // ----------------------------------------
    // UTILITIES
    // ----------------------------------------

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }

    function slugify(value) {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function getImageFallback(title) {
        const safeTitle = escapeHTML(title);

        return "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg"
                     width="900" height="600">
                    <rect width="100%" height="100%" fill="#29232a"/>
                    <circle cx="450" cy="250" r="110"
                            fill="#f06b35" opacity=".18"/>
                    <text x="50%" y="48%" text-anchor="middle"
                          fill="#ffab80" font-size="76">✦</text>
                    <text x="50%" y="65%" text-anchor="middle"
                          fill="#ffffff" font-size="26">${safeTitle}</text>
                </svg>
            `);
    }

    function getSafeImage(image, title) {
        return escapeHTML(image || getImageFallback(title));
    }

    // ----------------------------------------
    // RENDER FEATURED ARTICLE
    // ----------------------------------------

    function renderFeaturedArticle() {
        if (!featuredCard) return;

        const article = articles[0];

        featuredCard.innerHTML = `
            <div class="featured-image">
                <img
                    src="${getSafeImage(article.image, article.title)}"
                    alt="${escapeHTML(article.title)}"
                    loading="lazy"
                >
                <span class="image-tag">EDITOR'S PICK</span>
            </div>

            <div class="featured-content">
                <span class="article-date">
                    ${escapeHTML(article.category)} &nbsp;·&nbsp;
                    ${escapeHTML(article.date)}
                </span>

                <h3>${escapeHTML(article.title)}</h3>

                <p>${escapeHTML(article.excerpt)}</p>

                <button class="read-link"
                        type="button"
                        data-article-id="${article.id}">
                    Read Full Story →
                </button>
            </div>
        `;

        attachImageFallbacks(featuredCard);
    }

    // ----------------------------------------
    // FILTER ARTICLES
    // ----------------------------------------

    function getFilteredArticles() {
        return articles.filter(article => {
            const matchesCategory =
                activeCategory === "All" ||
                article.category.toLowerCase() ===
                    activeCategory.toLowerCase();

            const searchableText = [
                article.title,
                article.category,
                article.excerpt,
                article.author,
                ...article.tags
            ].join(" ").toLowerCase();

            const matchesSearch =
                searchableText.includes(searchQuery.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }

    // ----------------------------------------
    // RENDER ARTICLE CARDS
    // ----------------------------------------

    function renderArticles() {
        if (!blogGrid) {
            console.warn(
                "Blog grid not found. Check your HTML element ID or class."
            );
            return;
        }

        const filteredArticles = getFilteredArticles();
        const visibleArticles = filteredArticles.slice(0, visibleCount);

        blogGrid.innerHTML = "";

        if (visibleArticles.length === 0) {
            blogGrid.innerHTML = `
                <div class="no-results">
                    <h3>No articles found</h3>
                    <p>Try another keyword or select a different category.</p>
                </div>
            `;
        } else {
            visibleArticles.forEach(article => {
                const card = document.createElement("article");
                card.className = "blog-card";
                card.dataset.category = article.category;
                card.dataset.articleId = article.id;

                card.innerHTML = `
                    <div class="blog-image">
                        <img
                            src="${getSafeImage(article.image, article.title)}"
                            alt="${escapeHTML(article.title)}"
                            loading="lazy"
                        >

                        <span class="blog-category">
                            ${escapeHTML(article.category)}
                        </span>
                    </div>

                    <div class="blog-content">
                        <div class="blog-meta">
                            <span>${escapeHTML(article.date)}</span>
                            <span>·</span>
                            <span>${escapeHTML(article.readTime)}</span>
                        </div>

                        <h3>${escapeHTML(article.title)}</h3>

                        <p>${escapeHTML(article.excerpt)}</p>

                        <div class="blog-footer">
                            <div class="blog-tags">
                                ${article.tags.map(tag => `
                                    <span class="blog-tag">
                                        ${escapeHTML(tag)}
                                    </span>
                                `).join("")}
                            </div>

                            <button
                                class="read-more"
                                type="button"
                                data-article-id="${article.id}">
                                Read →
                            </button>
                        </div>
                    </div>
                `;

                blogGrid.appendChild(card);
            });
        }

        if (loadMoreButton) {
            const hasMore = visibleCount < filteredArticles.length;

            loadMoreButton.hidden = !hasMore;
            loadMoreButton.style.display = hasMore ? "" : "none";
        }

        if (resultsMessage) {
            resultsMessage.textContent =
                `Showing ${visibleArticles.length} of ${filteredArticles.length} articles`;
        }

        attachImageFallbacks(blogGrid);
    }

    function attachImageFallbacks(container) {
        container.querySelectorAll("img").forEach(image => {
            image.addEventListener("error", () => {
                if (image.dataset.fallbackApplied) return;

                image.dataset.fallbackApplied = "true";

                image.src = getImageFallback(
                    image.alt || "The Daily Edit"
                );
            }, { once: true });
        });
    }

    // ----------------------------------------
    // CATEGORY FILTERS
    // ----------------------------------------

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(item => {
                item.classList.remove("active");
                item.setAttribute("aria-pressed", "false");
            });

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");

            activeCategory =
                button.dataset.category ||
                button.dataset.filter ||
                button.textContent.trim();

            if (activeCategory.toLowerCase() === "all articles") {
                activeCategory = "All";
            }

            visibleCount = ARTICLES_PER_PAGE * 2;

            renderArticles();
        });
    });

    // ----------------------------------------
    // SEARCH
    // ----------------------------------------

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            searchQuery = searchInput.value.trim();
            visibleCount = ARTICLES_PER_PAGE * 2;
            renderArticles();
        });
    }

    // ----------------------------------------
    // LOAD MORE
    // ----------------------------------------

    if (loadMoreButton) {
        loadMoreButton.addEventListener("click", () => {
            visibleCount += ARTICLES_PER_PAGE;
            renderArticles();
        });
    }

    // ----------------------------------------
    // ARTICLE DETAIL POPUP
    // ----------------------------------------

    function openArticle(articleId) {
        const article = articles.find(
            item => item.id === Number(articleId)
        );

        if (!article) return;

        if (articleDialog) {
            articleDialog.innerHTML = `
                <button
                    type="button"
                    class="dialog-close"
                    aria-label="Close article">
                    ×
                </button>

                <span class="dialog-category">
                    ${escapeHTML(article.category)}
                </span>

                <h2 class="dialog-title">
                    ${escapeHTML(article.title)}
                </h2>

                <div class="dialog-meta">
                    By ${escapeHTML(article.author)}
                    &nbsp;·&nbsp;
                    ${escapeHTML(article.date)}
                    &nbsp;·&nbsp;
                    ${escapeHTML(article.readTime)}
                </div>

                <img
                    class="dialog-image"
                    src="${getSafeImage(article.image, article.title)}"
                    alt="${escapeHTML(article.title)}"
                >

                <div class="dialog-body">
                    <p><strong>${escapeHTML(article.excerpt)}</strong></p>

                    ${article.paragraphs.map(paragraph => `
                        <p>${escapeHTML(paragraph)}</p>
                    `).join("")}
                </div>

                <div class="dialog-tags">
                    ${article.tags.map(tag => `
                        <span>#${escapeHTML(tag)}</span>
                    `).join("")}
                </div>

                <div style="margin-top:25px;display:flex;gap:10px;flex-wrap:wrap;">
                    <button
                        type="button"
                        class="btn"
                        id="shareArticleBtn">
                        Share Article ↗
                    </button>

                    <button
                        type="button"
                        class="btn btn-outline"
                        id="copyArticleBtn">
                        Copy Title
                    </button>
                </div>
            `;

            if (typeof articleDialog.showModal === "function") {
                articleDialog.showModal();
            } else {
                articleDialog.setAttribute("open", "");
            }

            const closeButton = articleDialog.querySelector(
                ".dialog-close"
            );

            closeButton.addEventListener("click", closeArticle);

            const shareButton = articleDialog.querySelector(
                "#shareArticleBtn"
            );

            shareButton.addEventListener("click", () => {
                shareArticle(article);
            });

            const copyButton = articleDialog.querySelector(
                "#copyArticleBtn"
            );

            copyButton.addEventListener("click", async () => {
                try {
                    await navigator.clipboard.writeText(article.title);
                    copyButton.textContent = "Copied ✓";
                } catch {
                    window.prompt("Copy this article title:", article.title);
                }
            });

            attachImageFallbacks(articleDialog);
        } else {
            // Fallback when the HTML has no dialog element.
            window.alert(
                `${article.title}\n\n${article.excerpt}\n\n` +
                article.paragraphs.join("\n\n")
            );
        }
    }

    function closeArticle() {
        if (!articleDialog) return;

        if (typeof articleDialog.close === "function") {
            articleDialog.close();
        } else {
            articleDialog.removeAttribute("open");
        }
    }

    if (articleDialog) {
        articleDialog.addEventListener("click", event => {
            if (event.target === articleDialog) {
                closeArticle();
            }
        });
    }

    document.addEventListener("click", event => {
        const articleButton = event.target.closest("[data-article-id]");

        if (articleButton) {
            openArticle(articleButton.dataset.articleId);
        }
    });

    // ----------------------------------------
    // SHARE ARTICLE
    // ----------------------------------------

    async function shareArticle(article) {
        const shareData = {
            title: article.title,
            text: article.excerpt,
            url: window.location.href.split("#")[0] +
                "#article-" + article.id
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Sharing failed:", error);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(
                    `${article.title}\n${article.excerpt}\n${shareData.url}`
                );

                alert("Article details copied. You can now share them.");
            } catch {
                window.prompt(
                    "Copy these article details to share:",
                    `${article.title}\n${shareData.url}`
                );
            }
        }
    }

    // ----------------------------------------
    // NEWSLETTER DEMO
    // ----------------------------------------

    const newsletterForm = select(
        "#newsletterForm",
        ".newsletter-form"
    );

    if (newsletterForm) {
        newsletterForm.addEventListener("submit", event => {
            event.preventDefault();

            const emailInput = newsletterForm.querySelector(
                'input[type="email"]'
            );

            if (!emailInput) return;

            const email = emailInput.value.trim();

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            alert(
                "Thanks for your interest! This demo does not send or store subscriptions."
            );

            newsletterForm.reset();
        });
    }

    // ----------------------------------------
    // FOOTER YEAR
    // ----------------------------------------

    const yearElement = select("#currentYear", ".current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // ----------------------------------------
    // INITIALIZE
    // ----------------------------------------

    renderFeaturedArticle();
    renderArticles();

    console.log("The Daily Edit blog initialized successfully.");
});