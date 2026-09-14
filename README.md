# 3v0l Interview Command Center

A fast, local-first live interview reference tool designed for rapid navigation, French-first support, teleprompter-style answers, and keyboard-driven control.

## Principles

- French is the primary interview language in the UI.
- Live interview use comes first.
- Long answers are displayed as readable teleprompter-style content.
- The Index is the central navigation hub.
- Every view has a clear **Back to Index** action.
- Search should require as little typing as possible.
- Keyboard-first interaction, with mouse support as a fallback.
- Local-first and fast, with minimal dependencies and no unnecessary loading.
- English material remains available as a secondary emergency reference.

## Planned structure

```text
3v0l-interview/
├── index.html
├── app.js
├── styles.css
├── data/
│   ├── answers.js
│   ├── stories.js
│   ├── french.js
│   ├── scenarios.js
│   └── questions.js
└── README.md
```

## V1 focus

1. Clear Index
2. French-first Live Mode
3. Teleprompter answers
4. Smart low-effort search
5. Question-to-answer matching
6. French call mode
7. Keyboard navigation and hotkeys
8. Panic mode
9. Back-to-Index navigation everywhere

PC-to-PC control remains outside the scope of V1 because Barrier already handles that part of the physical setup.
