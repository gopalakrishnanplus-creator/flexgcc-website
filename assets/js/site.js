const navTemplate = `
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="brand" href="index.html" aria-label="FlexGCC home">
        <span class="brand__mark" aria-hidden="true"></span>
        <span class="brand__text">
          <span class="brand__name">FlexGCC</span>
          <span class="brand__tag">Founder-led workflow improvement</span>
        </span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        <ul class="site-nav__list">
          <li class="site-nav__item" data-nav="home"><a class="site-nav__link" href="index.html">Home</a></li>
          <li class="site-nav__item" data-nav="pilot"><a class="site-nav__link" href="pilot.html">45-Day Workflow Pilot</a></li>
          <li class="site-nav__item" data-nav="audiences">
            <button class="site-nav__trigger" type="button" aria-expanded="false">
              Who We Help
              <span aria-hidden="true">+</span>
            </button>
            <div class="site-nav__dropdown">
              <a href="who-we-help.html">Overview</a>
              <a href="operators.html">PE-Backed &amp; Operator-Led Companies</a>
              <a href="finance-teams.html">Investment Firms &amp; Lean Finance Teams</a>
              <a href="regulated-operators.html">Small Banks &amp; Regulated Operators</a>
            </div>
          </li>
          <li class="site-nav__item" data-nav="team"><a class="site-nav__link" href="team.html">Team</a></li>
          <li class="site-nav__item" data-nav="contact"><a class="site-nav__link" href="contact.html">Contact</a></li>
        </ul>
      </nav>
      <div class="site-header__actions">
        <a class="button button--primary desktop-only" href="contact.html">Book a 20-Minute Workflow Review</a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-label="Toggle navigation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M4 7h16M4 12h16M4 17h16"></path>
          </svg>
        </button>
      </div>
    </div>
  </header>
`;

const footerTemplate = `
  <footer class="site-footer">
    <div class="container">
      <div class="site-footer__panel">
        <div class="stack">
          <p class="eyebrow">FlexGCC</p>
          <h2 class="footer-title">Founder-led workflow improvement for companies that need real operational wins, fast.</h2>
          <p>Book a 20-Minute Workflow Review or email <a href="mailto:contact@flexgcc.com">contact@flexgcc.com</a>.</p>
        </div>
        <div class="footer-links">
          <a href="index.html">Home</a>
          <a href="pilot.html">45-Day Workflow Pilot</a>
          <a href="who-we-help.html">Who We Help</a>
          <a href="team.html">Team</a>
          <a href="contact.html">Contact</a>
        </div>
      </div>
    </div>
  </footer>
`;

const audienceMap = {
  ops: "Ops Workflow Review",
  finance: "Finance Workflow Review",
  governed: "Governed Workflow Review",
};

const formApiUrlPlaceholder = "__FORM_API_URL__";
const configuredFormApiUrl = __FORM_API_URL_JSON__;

function resolveFormApiBaseUrl() {
  if (configuredFormApiUrl && configuredFormApiUrl !== formApiUrlPlaceholder) {
    return configuredFormApiUrl.replace(/\/$/, "");
  }

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:8787";
  }

  return "";
}

function injectSharedChrome() {
  const headerHost = document.querySelector("#site-header");
  const footerHost = document.querySelector("#site-footer");

  if (headerHost) {
    headerHost.innerHTML = navTemplate;
  }

  if (footerHost) {
    footerHost.innerHTML = footerTemplate;
  }
}

function setActiveNav() {
  const page = document.body.dataset.page;
  if (!page) return;

  const navGroups = {
    home: ["home"],
    pilot: ["pilot"],
    audiences: ["audiences", "who-we-help", "operators", "finance", "regulated"],
    team: ["team"],
    contact: ["contact"],
  };

  Object.entries(navGroups).forEach(([navKey, pages]) => {
    if (!pages.includes(page)) return;
    const item = document.querySelector(`[data-nav="${navKey}"]`);
    if (item) {
      item.classList.add("is-active");
      const link = item.querySelector(".site-nav__link");
      if (link) link.classList.add("is-active");
    }
  });

  document.querySelectorAll(".site-nav__dropdown a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && window.location.pathname.endsWith(href)) {
      link.classList.add("is-active");
    }
  });
}

function bindNavigation() {
  const nav = document.querySelector(".site-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const dropdownTrigger = document.querySelector(".site-nav__trigger");
  const dropdownItem = dropdownTrigger?.closest(".site-nav__item");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
  }

  if (dropdownTrigger && dropdownItem) {
    dropdownTrigger.addEventListener("click", () => {
      const open = dropdownItem.classList.toggle("is-open");
      dropdownTrigger.setAttribute("aria-expanded", String(open));
    });
  }
}

function bindContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const audience = params.get("audience");
  const submitLabel = document.querySelector("[data-submit-label]");
  const contextLine = document.querySelector("[data-contact-context]");
  const workflowField = document.querySelector("#workflow");
  const success = document.querySelector(".success-message");
  const error = document.querySelector(".error-message");
  const apiBaseUrl = resolveFormApiBaseUrl();

  if (audience && audienceMap[audience]) {
    if (submitLabel) {
      submitLabel.textContent = `Request ${audienceMap[audience]}`;
    }
    if (contextLine) {
      contextLine.textContent = `This page is ready for a ${audienceMap[audience]}. Share the workflow and current friction, and we will route your note for review.`;
    }
    if (workflowField && !workflowField.value) {
      workflowField.value = `${audienceMap[audience]}: `;
    }
  }

  if (!apiBaseUrl && contextLine) {
    contextLine.textContent = "Form delivery is not configured yet. Please use email if you need to test the form before deployment.";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (success) success.classList.remove("is-visible");
    if (error) error.classList.remove("is-visible");

    if (!apiBaseUrl) {
      if (error) {
        error.textContent = "Form delivery is not configured yet. Please email sunit.gala@flexgcc.com directly.";
        error.classList.add("is-visible");
      }
      return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const button = form.querySelector("[data-submit-label]");
    const originalLabel = button?.textContent || "Request Review";

    if (button) {
      button.disabled = true;
      button.textContent = "Sending...";
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => ({ ok: false }));
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Unable to send the form right now.");
      }

      if (success) success.classList.add("is-visible");
      form.reset();
    } catch (submissionError) {
      if (error) {
        error.textContent = submissionError.message || "Unable to send the form right now.";
        error.classList.add("is-visible");
      }
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = originalLabel;
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  injectSharedChrome();
  setActiveNav();
  bindNavigation();
  bindContactForm();
});
