# Red-Black Tree Visualizer

A standalone web app to visualize how **insert** and **delete** work in a Red-Black Tree, including rotations and recoloring fix-up cases.

## Run

No build step is required.

1. Open `index.html` in a browser.
2. Enter a number and click **Insert** or **Delete**.
3. Use **Play / Previous / Next** to step through balancing operations.

Optional local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Features

- Interactive insert and delete controls
- Step-by-step timeline with operation explanations
- SVG tree rendering with node colors (RED/BLACK)
- Side-by-side Python logic panel with line highlighting for each step
- Demo sequence that runs a classic RB-tree example
- Clickable step log to jump to any rebalance stage

## Notes

- Duplicate inserts are ignored and explained in the log.
- Deleting a missing value is handled safely and logged.
- Root is highlighted with a gold border.
