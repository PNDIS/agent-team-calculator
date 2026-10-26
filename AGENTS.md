# Working in this repo (agent squad)

- **No dependencies.** Plain HTML, CSS and JavaScript in the browser; tests use `node --test`
  and `node:assert`. Don't add a `package-lock.json` or anything to `dependencies`.
- **Testable logic.** Put the calculator logic in `src/calculator.js` as plain functions and export
  them so both the page and the tests can use them: end the file with
  `if (typeof module !== 'undefined') module.exports = { ... };` and load it in `index.html` with
  `<script src="src/calculator.js"></script>`.
- **Branches and PRs.** One branch per ticket, named `<ticket-id>-<short-slug>` in lowercase
  (e.g. `fac-140-calculator`). The PR title starts with the ticket id (`FAC-140: …`), and the
  description lists the acceptance criteria with how each one is covered.
- **Tests are required.** Every acceptance criterion has at least one test. CI (`.github/workflows/ci.yml`)
  must be green before QA approves. CI reports its result as the commit status `ci/tests` on the
  PR's head commit (read it with `pull_request_read` method `get_status`): `success` is green;
  `pending` or no status means it hasn't finished; `failure` means it failed.
- **Merging.** Squash-merge after QA approves. Merging to `main` deploys the app to GitHub Pages.
