# Agent Team Calculator

A small calculator web app built by an **agent squad** on the Team Agents platform
(agents.pnd-aird.com): a Scrum Master, a Product Manager, an Engineer and QA, working
tickets from the Linear **Factory Playground** board.

- **Live app:** GitHub Pages, deployed from `main` on every merge (see the repo's Pages link).
- **Tests:** `npm test` (Node 20's built-in test runner, no dependencies). CI runs them on every pull request.

## Layout

```text
index.html          the app page (served by GitHub Pages)
src/                app code: keep the calculator logic in plain functions you can test
test/               node --test tests (*.test.js)
AGENTS.md           how the squad works in this repo
```
