# GraphQL Profile

A personal profile page built by querying the school's GraphQL API. The project covers authentication with JWT, GraphQL querying (standard, nested and argument-based), a profile UI, and SVG-based statistics graphs — hosted as a static site.

## Overview

This profile pulls data directly from the platform's GraphQL endpoint and displays it across a login page and a profile dashboard. No framework is used — the entire app is built with vanilla HTML, CSS and JavaScript.

## Features

### Authentication
- Login page supporting both `username:password` and `email:password`
- Credentials sent via Basic authentication (base64-encoded) to the signin endpoint
- JWT stored and used for all subsequent GraphQL requests via Bearer authentication
- Clear error message on invalid credentials
- Logout functionality

### GraphQL data layer
Queries the platform's GraphQL endpoint using all three required query styles:
- **Standard queries** — e.g. fetching the authenticated user's basic details
- **Nested queries** — e.g. results joined with their related user or object data
- **Argument-based queries** — e.g. filtering transactions by type or ordering by date

### Profile UI
Displays user information including:
- Basic identification (id, login)
- XP amount
- Additional data points, chosen to complement the statistics below: developer level and title, level milestone timeline, project PASS/FAIL rate, and piscine (JS/Go) PASS/FAIL with attempts per exercise

### Statistics (SVG)
At least two graphs are required by the brief; this project includes five, combining interactive and animated SVG:

| Graph | Type |
|---|---|
| XP earned over time | Animated line/area chart |
| XP earned by project | Squarified treemap |
| Skill levels (technologies / technical skills) | Radar chart |
| Audits given vs received | Segmented bar chart |
| Given/received audits by outcome | Segmented bar charts (interactive tooltips) |

## Tech stack

- HTML, CSS, JavaScript (no framework)
- SVG for all graphs (hand-built, no charting library)
- Hosted as a static site

## Project structure

```
graphql-profile/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── auth.js              # signin, JWT storage/decode, view switching, section rendering
│   ├── api.js                # GraphQL query functions, response caching
│   ├── matrixBg.js             # animated canvas background
│   └── charts/
│       ├── xpOverTime.js        # XP-over-time line/area chart
│       ├── xpByProject.js        # XP-by-project treemap
│       ├── levelMilestones.js     # level milestone timeline
│       ├── skillMatrix.js          # skill radar charts
│       └── piscineStats.js          # piscine exercise breakdown
├── AUDIT.md
└── README.md
```

## Getting started

1. Clone the repository
2. Open `index.html` in a browser, or serve the folder with any static file server
3. Log in with your platform username/email and password
4. View your profile and statistics

## API reference

- GraphQL endpoint: `https://learn.01founders.co/api/graphql-engine/v1/graphql`
- Signin endpoint: `https://learn.01founders.co/api/auth/signin`

## What this project covers

- GraphQL and GraphiQL
- JWT-based authentication and authorisation
- Basics of human-computer interface and UI/UX
- Static site hosting

## Hosting

This project is hosted on GitHub Pages: [https://nikomakr.github.io/graphql/](https://nikomakr.github.io/graphql/)