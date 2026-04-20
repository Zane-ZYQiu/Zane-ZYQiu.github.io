# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This is Zongyang (Zane) Qiu's personal academic portfolio site, built on top of the [Academic Pages](https://github.com/academicpages/academicpages.github.io) Jekyll template (a detached fork of Minimal Mistakes). It is deployed at https://zane-zyqiu.github.io via GitHub Pages (built from `master`).

Most day-to-day edits are content updates in Markdown/YAML. Structural changes touch Liquid templates, SCSS, and the asset build.

## Common commands

### Local development (native Ruby)

```bash
bundle install                          # first time, or after Gemfile changes
bundle exec jekyll serve -l -H localhost  # live-reload server on localhost:4000
```

Editing `_config.yml` requires restarting `jekyll serve` (Jekyll does not auto-reload config). Markdown/HTML edits are picked up automatically.

### Local development (Docker)

```bash
docker compose up                       # serves at localhost:4000, auto-rebuilds
```

Uses `_config.yml` merged with `_config_docker.yml`. VS Code Dev Container is also configured (`.devcontainer/devcontainer.json`).

### JS asset build

`assets/js/main.min.js` is the uglified bundle of jQuery + fitvids + smooth-scroll + greedy-nav + `_main.js`. Rebuild after editing any source JS:

```bash
npm install
npm run build:js      # one-shot uglify
npm run watch:js      # rebuild on change
```

### CV pipeline

The CV has two rendering paths that must stay in sync:

- `_pages/cv.md` — Markdown source of truth, rendered at `/cv/`.
- `_data/cv.json` — JSON Resume schema, rendered by `_includes/cv-template.html` at `/cv-json/` (currently disabled in `_data/navigation.yml`).

After editing `_pages/cv.md`, regenerate the JSON:

```bash
./scripts/update_cv_json.sh
# or directly:
python3 scripts/cv_markdown_to_json.py --input _pages/cv.md --output _data/cv.json --config _config.yml
```

### Publications / talks generators (optional)

`markdown_generator/` contains Jupyter notebooks and `.py` equivalents that turn `publications.tsv` / `talks.tsv` into individual files under `_publications/` and `_talks/`. Only needed when bulk-importing; single entries are usually authored as Markdown directly.

### Talk map

`talkmap.ipynb` / `talkmap.py` geocode talk locations into `talkmap.html`. A GitHub Actions workflow (`.github/workflows/scrape_talks.yml`) re-runs the notebook and commits back whenever `talks/**`, `_talks/**`, or `talkmap.ipynb` change on push.

## Architecture

### Jekyll collections (content lives here)

Defined in `_config.yml` under `collections`. Each item is a Markdown file whose front matter determines rendering:

- `_publications/` → `/publication/:path/` — papers. `category` in front matter must match a key in `publication_category` in `_config.yml` (`books`, `manuscripts`, `conferences`) to appear under the right heading on `/publications/`. Rich fields supported by `_includes/archive-single.html`: `authors`, `venue`, `arxiv`, `project_page`, `bibtex`, `header.teaser`.
- `_talks/` → `/talks/:path/` — uses `layout: talk` (`_layouts/talk.html`) by default.
- `_portfolio/`, `_teaching/` — analogous.
- `_posts/` → blog posts, surfaced via `/year-archive/`.
- `_pages/` — standalone pages. The landing page is `_pages/about.md` (permalink `/`), which also inlines the publication list via a Liquid loop over `site.publications`.

Site-wide `defaults:` in `_config.yml` set the default `layout` and sidebar (`author_profile: true`) per collection; individual files can override via front matter.

### Navigation

Top-nav items are controlled by `_data/navigation.yml`. Commenting out an entry removes it from the header without deleting the underlying page — this is how Talks / Teaching / Portfolio / JSON-CV are currently hidden. The page files still exist and render at their permalinks.

### Layouts, includes, styling

- `_layouts/` — top-level page shells (`single.html`, `archive.html`, `talk.html`, `cv-layout.html`, `splash.html`, `default.html`, `compress.html`). `compress.html` is a minifier wrapper applied via `layout:` chaining.
- `_includes/` — partials. Key ones when changing site chrome: `masthead.html`, `author-profile.html` (sidebar, driven by `author:` block in `_config.yml`), `archive-single.html` (publication/talk entry rendering), `cv-template.html` (JSON-CV renderer), `head/custom.html` (extra `<head>` injection point).
- `_sass/` — partials imported by `assets/css/main.scss`. Theme palettes in `_sass/theme/` (`_default_light.scss`, `_default_dark.scss`, `_air_light.scss`, `_air_dark.scss`) are selected via `site_theme` in `_config.yml`. Layout-level SCSS in `_sass/layout/`.
- `_data/authors.yml` — alternate author profiles referenced by `author:` in a post's front matter (multi-author sites).
- `_data/ui-text.yml` — i18n strings; selected via `locale` in `_config.yml`.

### Author profile / personal data

The sidebar shown on most pages is driven entirely by the `author:` block in `_config.yml` (avatar, bio, links to GitHub/Scholar/ORCID/LinkedIn/etc.). An empty field hides the corresponding icon — do not delete the key, just leave it blank.

Avatar image lives in `images/`; filename is referenced by `author.avatar` in `_config.yml`.

### Static files

- `files/` — PDFs and downloads. Served verbatim; link as `/files/foo.pdf`.
- `images/` — site imagery including publication teasers (referenced by `header.teaser` in publication front matter).
- `assets/` — compiled CSS/JS/fonts. `assets/js/_main.js` is the source; `assets/js/main.min.js` is the build output (see JS asset build above).

### GitHub Pages build constraint

The site is built by GitHub Pages' safe-mode Jekyll. Plugins must be listed in the `whitelist:` block in `_config.yml` in addition to `plugins:` — adding a plugin that isn't GitHub-Pages-supported will break the deployed build even if it works locally.
