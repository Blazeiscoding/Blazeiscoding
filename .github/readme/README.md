# README art

Every image on the profile README is drawn by a script in this folder. Run them from the repository root with Node 20 or later.

| Image | Script | Command |
| --- | --- | --- |
| Header | `header.mjs` | `node .github/readme/header.mjs .github/readme assets` |
| Fig 1, Better-learn | `fig1.mjs` | `node .github/readme/fig1.mjs .github/readme assets` |
| Tech stack | `stack.mjs` | `node .github/readme/stack.mjs .github/readme/icons assets` |
| Screenshot frames | `frames.mjs` | `node .github/readme/frames.mjs assets` |
| Fig 2 and stats | `live.mjs` | runs daily in `.github/workflows/readme-art.yml` |

`fig1.mjs` also writes `fig-dark.html` and `fig-light.html` next to the SVGs, for checking the drawing in a browser; don't commit those.

`live.mjs` needs a `GITHUB_TOKEN`. Locally, `GITHUB_TOKEN=$(gh auth token) node .github/readme/live.mjs out` draws into `out/`. The workflow publishes its output to the `readme-assets` branch, which it overwrites on every run.

Colours live in `theme.mjs`. The isometric figures use the [Anatomy](https://skills.wheresryan.sh/anatomy) kit in `kit/` (MIT, see `kit/LICENSE`). The logos in `icons/` are from [Simple Icons](https://simpleicons.org) (CC0).
