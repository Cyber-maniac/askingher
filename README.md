# AskingHer - Local receiver (Twilio)

This small Node/Express server receives phone submissions from the static page and does two things:

- Appends submissions to `submissions.txt` (local file)
- If Twilio environment variables are set, sends an SMS to `ADMIN_PHONE` containing the submitted phone

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set environment variables (recommended via `.env` or your shell):

```
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM=+1XXXXXXXXXX   # your Twilio number
ADMIN_PHONE=+1YYYYYYYYYY   # number that will receive the notification
PORT=3000
```

3. Run the server:

```bash
npm start
```

4. Update the static page `phonenumber.html` to point `endpoint` to your server (default used in this repo is `http://localhost:3000/submit`). When deploying, host the server somewhere accessible (Heroku, Render, Railway, your VPS, etc.).

Security note: Do not publish your Twilio credentials publicly. Store secrets in environment variables or a secrets manager.

## Deploying

Two simple options are Render.com and Railway.app — both can deploy the repository from GitHub.

Render (recommended):

1. Push this repo to GitHub.
2. Create a new Web Service on Render and connect your GitHub repo.
3. Set the build command to `npm install` and the start command to `node server.js` (or select Docker and the Dockerfile).
4. Add environment variables (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, ADMIN_PHONE) in the Render service settings.
5. Deploy — Render will provide a public URL like `https://your-app.onrender.com`.

Railway:

1. Push this repo to GitHub.
2. Create a new project on Railway and connect the GitHub repo.
3. Railway will detect Node and build automatically; set environment variables in Railway project settings.
4. After deploy, Railway provides a public URL like `https://your-railway-app.up.railway.app`.

After you have the deployed URL, edit `phonenumber.html` and set `endpoint` to `https://<your-deploy-url>/submit`.

If you want, I can generate a GitHub Actions workflow to build and push a Docker image or automatically deploy — tell me which host you choose and whether you want automatic deploys.

## GitHub Actions: Build & Publish Docker image to GHCR

I've included a workflow that builds a Docker image and pushes it to GitHub Container Registry (GHCR) on pushes to `main`.

After your first push to `main`, the image will be available at:

```
ghcr.io/<your-github-username>/<repo-name>:latest
```

You can then use that image to deploy on Render, Railway, or any Docker-capable host.

Notes:
- The workflow uses the repository's `GITHUB_TOKEN` for authentication — no extra secrets are required to publish to GHCR within the same repo.
- If you prefer pushing to Docker Hub instead, I can provide that workflow (requires Docker Hub credentials stored as GitHub Secrets).

### Auto-deploy to Render from GitHub Actions

The repository now includes a workflow `deploy-render.yml` which will:

- Build and push the image to GHCR
- Trigger a Render deploy by calling the Render API

Before this workflow can trigger a Render deploy, add two GitHub Secrets to your repository settings:

- `RENDER_API_KEY` — create an API key in your Render dashboard (Account -> API Keys)
- `RENDER_SERVICE_ID` — the Render service ID (visible in the Render service URL or dashboard)

If those secrets are present the workflow will call `POST https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys` after pushing the image.

If you'd rather I configure auto-deploy for Railway or add deploy steps for Heroku, tell me which one and I will add the workflow.
