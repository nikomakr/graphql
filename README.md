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
- Additional data points, chosen to complement the statistics below

### Statistics (SVG)
At least two graphs are required by the brief; this project includes five, combining interactive and animated SVG:

| Graph | Type |
|---|---|
| XP earned over time | Animated line graph |
| XP earned by project | Bar graph |
| Audit ratio | Interactive graph |
| Project PASS/FAIL ratio | Ratio graph |
| Piscine (JS/Go) PASS/FAIL and attempts per exercise | Combined stats |

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
│   ├── auth.js         # signin request, JWT storage, logout, JWT decode
│   ├── api.js           # GraphQL query functions
│   ├── app.js            # view switching, wires everything together
│   └── charts/
│       ├── xpOverTime.js
│       ├── xpByProject.js
│       ├── auditRatio.js
│       ├── passFailRatio.js
│       └── piscineStats.js
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

This project is hosted on [platform name — GitHub Pages / Netlify / Vercel].