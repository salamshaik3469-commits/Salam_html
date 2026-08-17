# Shaik Ataar Baba Salam — Full-Stack Personal Portfolio

A responsive full-stack portfolio created for the **Personal Portfolio Website** assignment.

## Assignment requirements covered

- Frontend: HTML, CSS and JavaScript
- Backend: Node.js + Express.js
- Database: PostgreSQL schema for projects and contact messages
- Responsive design for mobile, tablet and desktop
- REST endpoints for project data and contact form submissions
- Deployment configuration for a Node hosting service
- Accessible navigation, form labels and status feedback

## Project structure

```text
personal-portfolio/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── package.json
├── server.js
├── schema.sql
├── render.yaml
└── README.md
```

## Run locally

1. Install Node.js 20+.
2. Run `npm install`.
3. For the UI demo without a database, run `npm start`. The projects endpoint uses safe fallback project data.
4. For PostgreSQL persistence, create a PostgreSQL database, set `DATABASE_URL`, run `schema.sql`, then start the server.

Example environment variable:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

## API

- `GET /api/health` — server/database health
- `GET /api/projects` — project records
- `POST /api/contact` — saves a contact message

## Deployment

`render.yaml` contains a Node web-service configuration. A PostgreSQL connection string should be supplied as the `DATABASE_URL` environment variable on the hosting provider.

Never commit passwords, API keys or database credentials.
