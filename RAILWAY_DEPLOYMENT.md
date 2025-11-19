# Railway Deployment Guide

This guide walks you through deploying the Dynamic Discovery Chatbot to Railway as two separate services (backend and frontend).

## Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- GitHub repository (or Railway CLI)
- OpenAI API key

## Deployment Strategy

Deploy as **two separate services**:
1. **Backend Service**: FastAPI application
2. **Frontend Service**: Next.js application

## Step 1: Deploy Backend

### Option A: Deploy from GitHub (Recommended)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will detect the `backend/` directory
5. Configure the service:
   - **Root Directory**: `backend` (important: this makes the backend directory the working directory)
   - **Build Command**: `pip install uv && uv sync` (or Railway will auto-detect from `railway.json`)
   - **Start Command**: `uv run uvicorn app:app --host 0.0.0.0 --port $PORT` (note: `app:app` not `backend.app:app` when root is `backend`)

### Option B: Deploy with Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to backend directory
cd backend
railway link

# Deploy
railway up
```

### Backend Environment Variables

Add these in Railway dashboard → Service → Variables:

```
OPENAI_API_KEY=sk-your-key-here
USE_FAKE_AI=0
PORT=8000  # Railway sets this automatically, but you can override
```

**Note**: Railway automatically sets `PORT`, but you can add it explicitly if needed.

### Backend Configuration

The backend automatically finds `config.json` and `data/sessions/` using these paths (in order):
1. Environment variables: `CONFIG_PATH` and `SESSIONS_DIR`
2. Parent directory (repo root): `../config.json` and `../data/sessions/`
3. Current directory: `./config.json` and `./data/sessions/`

**Important**: When setting root directory to `backend/`, the code will look for `config.json` in the parent directory (repo root). Ensure `config.json` is committed to your repository.

**Optional**: You can override paths using environment variables:
- `CONFIG_PATH=/path/to/config.json`
- `SESSIONS_DIR=/path/to/sessions`

## Step 2: Deploy Frontend

### Deploy from GitHub

1. In Railway Dashboard, click **"New Service"** → **"Deploy from GitHub repo"**
2. Select the same repository
3. Configure the service:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Frontend Environment Variables

Add these in Railway dashboard → Service → Variables:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-service.railway.app
PORT=3000  # Railway sets this automatically
```

**Important**: Replace `your-backend-service.railway.app` with your actual backend service URL from Railway.

## Step 3: Get Backend URL

1. Go to your **Backend Service** in Railway
2. Click on **"Settings"** → **"Networking"**
3. Generate a **Public Domain** (or use the default Railway domain)
4. Copy the URL (e.g., `https://your-backend.up.railway.app`)

## Step 4: Update Frontend API URL

1. Go to your **Frontend Service** in Railway
2. Click on **"Variables"**
3. Update `NEXT_PUBLIC_API_BASE_URL` to your backend URL:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.up.railway.app
   ```
4. Railway will automatically rebuild and redeploy

## Step 5: Configure CORS (If Needed)

The backend already has CORS configured to allow all origins (`allow_origins=["*"]`). If you want to restrict it:

1. Go to **Backend Service** → **Variables**
2. Add:
   ```
   CORS_ORIGINS=https://your-frontend.up.railway.app
   ```
3. Update `backend/app.py` to read from environment:
   ```python
   import os
   origins = os.getenv("CORS_ORIGINS", "*").split(",")
   app.add_middleware(CORSMiddleware, allow_origins=origins, ...)
   ```

## Step 6: Access Your Application

1. Go to **Frontend Service** → **Settings** → **Networking**
2. Generate a **Public Domain** (or use the default)
3. Visit the URL in your browser

## File Structure for Railway

Railway will automatically detect:
- **Backend**: Python project with `pyproject.toml` and `Procfile` or `railway.json`
- **Frontend**: Node.js project with `package.json`

The configuration files (`railway.json`, `Procfile`) are optional but recommended for explicit control.

## Environment Variables Summary

### Backend
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | OpenAI API key |
| `USE_FAKE_AI` | No | `0` | Set to `1` for testing without OpenAI |
| `PORT` | Auto | - | Railway sets this automatically |

### Frontend
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | `http://localhost:8000` | Backend API URL |
| `PORT` | Auto | - | Railway sets this automatically |

## Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError` or import errors
- **Solution**: Ensure `backend/` is set as the root directory in Railway service settings

**Issue**: Port binding errors
- **Solution**: Ensure the start command uses `$PORT` (Railway sets this automatically)

**Issue**: OpenAI API errors
- **Solution**: Verify `OPENAI_API_KEY` is set correctly in Railway variables

### Frontend Issues

**Issue**: API calls failing (CORS or connection errors)
- **Solution**: 
  1. Verify `NEXT_PUBLIC_API_BASE_URL` points to your backend URL
  2. Check backend CORS settings
  3. Ensure backend is running and accessible

**Issue**: Build fails
- **Solution**: Check build logs in Railway. Common issues:
  - Missing environment variables
  - Node.js version mismatch (Railway auto-detects, but you can specify in `package.json`)

### General Issues

**Issue**: Services not connecting
- **Solution**: 
  1. Verify both services are deployed and running
  2. Check service URLs in Railway dashboard
  3. Test backend health endpoint: `https://your-backend.up.railway.app/healthz`

## Monitoring

- **Logs**: View real-time logs in Railway dashboard → Service → **Deployments** → Click on deployment → **View Logs**
- **Metrics**: Railway provides basic metrics (CPU, memory, network) in the dashboard
- **Health Checks**: Backend has `/healthz` endpoint for health monitoring

## Custom Domains

1. Go to Service → **Settings** → **Networking**
2. Click **"Generate Domain"** for Railway domain, or
3. Click **"Custom Domain"** to add your own domain
4. Follow Railway's DNS configuration instructions

## Cost Optimization

- Railway offers a free tier with usage limits
- Consider using Railway's **Sleep on Idle** feature for development
- Monitor usage in Railway dashboard → **Usage**

## Next Steps

- Set up monitoring and alerts
- Configure custom domains
- Set up CI/CD for automatic deployments
- Add database (if needed) for production session storage

