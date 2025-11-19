# Railway Deployment Guide - 2025 Updated

This guide is updated for Railway's current system (Railpack) as of 2025.

## ⚠️ Important: Monorepo Setup

Your project is a **monorepo** (backend + frontend). You need to deploy them as **separate services** with **root directories** set.

---

## 🚀 Step-by-Step Deployment (2025)

### PART 1: Deploy Backend Service

#### Step 1: Create Project and Add Backend Service

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Empty Project"** (don't use "Deploy from GitHub" for monorepos)
4. Click **"New Service"** → **"GitHub Repo"**
5. Select your repository: `techleadershub/dynamic-forms`
6. Click **"Deploy"**

#### Step 2: Configure Backend Root Directory (CRITICAL)

**This is the most important step for monorepos:**

1. Click on the service (it will be named something like "dynamic-forms")
2. Go to **Settings** tab
3. Scroll down to **"Root Directory"**
4. **Set it to**: `backend`
   - This tells Railway to treat `backend/` as the project root
5. Click **"Save"**

#### Step 3: Verify Build Configuration

Railway should auto-detect from `backend/railway.json`:
- **Build Command**: `pip install uv && uv sync`
- **Start Command**: `uv run uvicorn app:app --host 0.0.0 --port $PORT`

If not auto-detected:
1. Go to **Settings** → **"Build & Deploy"**
2. Set **Build Command**: `pip install uv && uv sync`
3. Set **Start Command**: `uv run uvicorn app:app --host 0.0.0.0 --port $PORT`

#### Step 4: Add Environment Variables

1. Go to **Variables** tab
2. Click **"New Variable"** or use **"Raw Editor"**
3. Add:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   USE_FAKE_AI=0
   ```
4. Click **"Save"**

**Important**: 
- Replace with your real OpenAI API key
- No quotes around values
- Railway sets `PORT` automatically (don't add it)

#### Step 5: Generate Public Domain

1. Go to **Settings** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://dynamic-forms-production.up.railway.app`)

#### Step 6: Wait for Deployment

1. Go to **Deployments** tab
2. Watch the build process
3. Wait for status to show **"Active"** (green)
4. Test: Visit `https://your-backend-url/healthz` → Should return `{"status":"ok"}`

---

### PART 2: Deploy Frontend Service

#### Step 1: Add Frontend Service

1. In the **same Railway project**, click **"New Service"**
2. Select **"GitHub Repo"**
3. Select the **same repository**: `techleadershub/dynamic-forms`
4. Click **"Deploy"**

#### Step 2: Configure Frontend Root Directory (CRITICAL)

1. Click on the new service
2. Go to **Settings** tab
3. Set **Root Directory**: `frontend`
4. Click **"Save"**

#### Step 3: Verify Build Configuration

Railway should auto-detect from `frontend/railway.json`:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

If not auto-detected, set manually in **Settings** → **"Build & Deploy"**

#### Step 4: Add Environment Variable

1. Go to **Variables** tab
2. Add:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.up.railway.app
   ```
   (Replace with your actual backend URL from Part 1, Step 5)
3. Click **"Save"**

Railway will automatically rebuild after saving variables.

#### Step 5: Generate Frontend Domain

1. Go to **Settings** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy the URL

#### Step 6: Verify Frontend

1. Visit your frontend URL
2. Test the chat interface
3. Verify it connects to the backend

---

## 🔧 Troubleshooting "Railpack Build Plan Error"

If you see **"Error creating build plan with Railpack"**:

### Solution 1: Set Root Directory
- **Most common cause**: Root directory not set
- Go to **Settings** → Set **Root Directory** to `backend` or `frontend`
- Save and redeploy

### Solution 2: Check File Structure
Ensure these files exist in the root directory:
- **Backend**: `backend/pyproject.toml`, `backend/railway.json`
- **Frontend**: `frontend/package.json`, `frontend/railway.json`

### Solution 3: Manual Build Command
If auto-detection fails:
1. Go to **Settings** → **"Build & Deploy"**
2. Manually set:
   - **Build Command**: `pip install uv && uv sync` (backend) or `npm install && npm run build` (frontend)
   - **Start Command**: `uv run uvicorn app:app --host 0.0.0.0 --port $PORT` (backend) or `npm start` (frontend)

### Solution 4: Use Procfile
Railway also reads `Procfile`:
- **Backend**: `web: uv run uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Frontend**: `web: npm start`

### Solution 5: Check Logs
1. Go to **Deployments** tab
2. Click on failed deployment
3. Check **Logs** tab for specific error messages
4. Common issues:
   - Missing dependencies
   - Wrong Python/Node version
   - Path issues

---

## 📋 Quick Checklist

### Backend Service
- [ ] Root Directory set to `backend`
- [ ] `OPENAI_API_KEY` environment variable set
- [ ] Build command: `pip install uv && uv sync`
- [ ] Start command: `uv run uvicorn app:app --host 0.0.0.0 --port $PORT`
- [ ] Public domain generated
- [ ] Health check works: `/healthz` returns `{"status":"ok"}`

### Frontend Service
- [ ] Root Directory set to `frontend`
- [ ] `NEXT_PUBLIC_API_BASE_URL` set to backend URL
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Public domain generated
- [ ] Frontend loads and connects to backend

---

## 🎯 Key Differences for 2025

1. **Railpack** (not Nixpacks) - Railway's updated build system
2. **Root Directory is critical** - Must be set in Settings for monorepos
3. **Empty Project first** - Then add services individually
4. **Auto-detection improved** - But manual override available

---

## 📞 Still Having Issues?

1. **Check Railway Logs**: Service → Deployments → Click deployment → Logs
2. **Verify Root Directory**: Settings → Root Directory must match your service folder
3. **Test Locally First**: Ensure code works locally before deploying
4. **Railway Status**: Check [status.railway.app](https://status.railway.app) for platform issues

---

## ✅ Success Indicators

- Backend: `/healthz` endpoint returns `{"status":"ok"}`
- Frontend: Loads without errors, can start a survey
- Connection: Frontend successfully calls backend API
- Logs: No errors in Railway deployment logs

Your app should now be live! 🎉

