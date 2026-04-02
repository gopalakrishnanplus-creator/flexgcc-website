# FlexGCC Website

Static multi-page marketing site for FlexGCC, with a separate Node form API for Render deployment.

## Preview locally

For the static site only, run:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

For the contact form API, run:

```bash
cd server
npm install
SMTP_HOST=your-smtp-host \
SMTP_PORT=587 \
SMTP_USER=your-smtp-user \
SMTP_PASS=your-smtp-password \
SMTP_FROM=website@flexgcc.com \
ALLOWED_ORIGINS=http://localhost:4173 \
node server.mjs
```

## Structure

- `index.html` homepage
- `pilot.html` 45-Day Workflow Pilot page
- `who-we-help.html` audience overview
- `operators.html` PE-backed and operator-led companies page
- `finance-teams.html` investment firms and lean finance teams page
- `regulated-operators.html` small banks and regulated operators page
- `team.html` team page
- `farhana.html` Farhana Currimbhoy landing page
- `kandarp.html` Kandarp Soni landing page
- `sunit.html` Sunit Gala landing page
- `contact.html` contact page
- `scripts/build-static.mjs` build script for Render static hosting
- `assets/css/styles.css` shared design system and responsive styling
- `assets/js/site.js` shared navigation and contact form behavior
- `assets/img/*.svg` local illustrations
- `assets/img/founders/*.png` founder portraits
- `server/server.mjs` Render form API
- `server/package.json` form API dependencies
