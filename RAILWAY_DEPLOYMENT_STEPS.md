# Detailed Railway Deployment Steps

This is a comprehensive, step-by-step guide to deploy your Dynamic Discovery Chatbot to Railway.

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] A Railway account (sign up at [railway.app](https://railway.app) - free tier available)
- [ ] Your code pushed to GitHub (repository: `techleadershub/dynamic-forms`)
- [ ] An OpenAI API key (get one from [platform.openai.com](https://platform.openai.com/api-keys))
- [ ] Access to your GitHub repository

---

## 🚀 Step-by-Step Deployment

### PART 1: Deploy Backend Service

#### Step 1.1: Create New Project on Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click the **"New Project"** button (top right or center of dashboard)
3. Select **"Deploy from GitHub repo"**
4. If this is your first time, authorize Railway to access your GitHub account
5. Select your repository: `techleadershub/dynamic-forms` (or your repo name)
6. Click **"Deploy Now"**

#### Step 1.2: Configure Backend Service

After Railway detects your repository:

1. Railway will show a service being created
2. Click on the service name (or the service card)
3. Go to **Settings** tab
4. Find **"Root Directory"** setting
5. Set it to: `backend`
   - This tells Railway to use the `backend/` folder as the working directory
6. Railway will automatically detect:
   - Build command from `backend/railway.json`: `pip install uv && uv sync`
   - Start command from `backend/railway.json`: `uv run uvicorn app:app --host 0.0.0.0 --port $PORT`

**Note**: If Railway doesn't auto-detect, manually set:
- **Build Command**: `pip install uv && uv sync`
- **Start Command**: `uv run uvicorn app:app --host 0.0.0.0 --port $PORT`

#### Step 1.3: Add Backend Environment Variables

1. In the backend service, go to the **Variables** tab
2. Click **"New Variable"** or **"Raw Editor"**
3. Add the following variables:

```
OPENAI_API_KEY=sk-your-actual-openai-key-here
USE_FAKE_AI=0
```

**Important**: 
- Replace `sk-your-actual-openai-key-here` with your real OpenAI API key
- Do NOT include quotes around the value
- The `PORT` variable is automatically set by Railway (don't add it manually)

4. Click **"Save"** or **"Update"**

#### Step 1.4: Generate Backend Public URL

1. Go to **Settings** tab in your backend service
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"** button
4. Railway will create a URL like: `your-backend-name.up.railway.app`
5. **Copy this URL** - you'll need it for the frontend configuration
6. The URL should be something like: `https://dynamic-forms-backend-production.up.railway.app`

#### Step 1.5: Verify Backend is Running

1. Go to the **Deployments** tab
2. Wait for the deployment to complete (status should show "Active")
3. Click on the latest deployment to see logs
4. Look for: `Application startup complete` or `Uvicorn running on`
5. Test the health endpoint:
   - Open a new browser tab
   - Visit: `https://your-backend-url.up.railway.app/healthz`
   - You should see: `{"status":"ok"}`

**Troubleshooting Backend**:
- If deployment fails, check the **Logs** tab for errors
- Common issues:
  - Missing `OPENAI_API_KEY` → Add it in Variables
  - Build fails → Check logs for Python/uv installation errors
  - Port errors → Ensure start command uses `$PORT`

---

### PART 2: Deploy Frontend Service

#### Step 2.1: Add Frontend Service to Same Project

1. In your Railway project dashboard, click **"New Service"** (or **"+"** button)
2. Select **"GitHub Repo"**
3. Select the **same repository**: `techleadershub/dynamic-forms`
4. Click **"Deploy Now"**

#### Step 2.2: Configure Frontend Service

1. Click on the new frontend service
2. Go to **Settings** tab
3. Set **Root Directory** to: `frontend`
4. Railway will auto-detect from `frontend/railway.json`:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

**Note**: If not auto-detected, manually set:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

#### Step 2.3: Add Frontend Environment Variables

1. Go to the **Variables** tab in your frontend service
2. Click **"New Variable"** or **"Raw Editor"**
3. Add this variable:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.up.railway.app
```

**Important**: 
- Replace `your-backend-url.up.railway.app` with the **actual backend URL** you copied in Step 1.4
- Include `https://` in the URL
- Example: `NEXT_PUBLIC_API_BASE_URL=https://dynamic-forms-backend-production.up.railway.app`

4. Click **"Save"**

**Note**: After saving, Railway will automatically trigger a rebuild and redeploy of the frontend.

#### Step 2.4: Generate Frontend Public URL

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the frontend URL (e.g., `https://dynamic-forms-frontend-production.up.railway.app`)

#### Step 2.5: Verify Frontend is Running

1. Go to **Deployments** tab
2. Wait for deployment to show "Active" status
3. Check logs for: `Ready on http://0.0.0.0:PORT`
4. Visit your frontend URL in a browser
5. You should see the chat interface

---

### PART 3: Test the Deployment

#### Step 3.1: Test Backend Health

1. Open: `https://your-backend-url.up.railway.app/healthz`
2. Expected response: `{"status":"ok"}`

#### Step 3.2: Test Frontend Connection

1. Open your frontend URL
2. Click "Start Survey" or similar button
3. You should see the first question appear
4. Try answering a question
5. Verify the chat flow works

#### Step 3.3: Test Admin Dashboard

1. Visit: `https://your-frontend-url.up.railway.app/admin`
2. You should see a list of survey sessions
3. Click on a session to see details

---

## 🔧 Configuration Details

### Backend Service Configuration

**Root Directory**: `backend`
**Build Command**: `pip install uv && uv sync`
**Start Command**: `uv run uvicorn app:app --host 0.0.0.0 --port $PORT`

**Environment Variables**:
- `OPENAI_API_KEY` (required) - Your OpenAI API key
- `USE_FAKE_AI` (optional) - Set to `1` for testing without OpenAI
- `PORT` (automatic) - Set by Railway

**File Paths**:
- The backend automatically finds `config.json` in the parent directory (repo root)
- Session data is stored in `../data/sessions/` (relative to backend directory)

### Frontend Service Configuration

**Root Directory**: `frontend`
**Build Command**: `npm install && npm run build`
**Start Command**: `npm start`

**Environment Variables**:
- `NEXT_PUBLIC_API_BASE_URL` (required) - Your backend service URL
- `PORT` (automatic) - Set by Railway

---

## 📊 Monitoring Your Deployment

### View Logs

1. Go to any service in Railway dashboard
2. Click **"Deployments"** tab
3. Click on a deployment
4. View **Logs** tab for real-time logs

### View Metrics

1. Go to service → **Metrics** tab
2. See CPU, Memory, and Network usage
3. Monitor request rates and response times

### Health Checks

- Backend health endpoint: `/healthz`
- Check in Railway dashboard → Service → **Health** tab

---

## 🐛 Troubleshooting Common Issues

### Backend Issues

**Problem**: Deployment fails with "Module not found"
- **Solution**: Verify Root Directory is set to `backend`

**Problem**: "Config file not found"
- **Solution**: Ensure `config.json` is committed to your repository at the root level

**Problem**: OpenAI API errors
- **Solution**: 
  1. Verify `OPENAI_API_KEY` is set correctly (no quotes, no spaces)
  2. Check your OpenAI account has credits/quota
  3. Verify the API key is valid

**Problem**: Port binding error
- **Solution**: Ensure start command uses `$PORT` (Railway sets this automatically)

### Frontend Issues

**Problem**: "Failed to fetch" or CORS errors
- **Solution**:
  1. Verify `NEXT_PUBLIC_API_BASE_URL` matches your backend URL exactly
  2. Check backend is running (visit `/healthz`)
  3. Ensure backend URL includes `https://`

**Problem**: Build fails
- **Solution**:
  1. Check build logs for specific errors
  2. Verify `package.json` is in `frontend/` directory
  3. Check Node.js version compatibility

**Problem**: Frontend shows "Cannot connect to API"
- **Solution**:
  1. Verify backend URL in environment variables
  2. Test backend health endpoint directly
  3. Check Railway logs for backend errors

### General Issues

**Problem**: Services not connecting
- **Solution**:
  1. Verify both services show "Active" status
  2. Check service URLs are correct
  3. Test backend health: `https://your-backend.up.railway.app/healthz`
  4. Check Railway logs for both services

**Problem**: Changes not reflecting
- **Solution**:
  1. Push changes to GitHub
  2. Railway auto-deploys on push (if enabled)
  3. Or manually trigger redeploy: Service → Deployments → Redeploy

---

## 🔄 Updating Your Deployment

### Update Code

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin master
   ```
3. Railway will automatically detect the push and redeploy (if auto-deploy is enabled)
4. Or manually trigger: Service → Deployments → Redeploy

### Update Environment Variables

1. Go to Service → Variables
2. Edit or add variables
3. Click "Save"
4. Railway will automatically redeploy the service

### Update Config.json

1. Edit `config.json` in your repository
2. Commit and push to GitHub
3. Backend will automatically reload config (no restart needed)

---

## 📝 Quick Reference

### Backend Service
- **Root**: `backend`
- **Build**: `pip install uv && uv sync`
- **Start**: `uv run uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Health**: `https://your-backend.up.railway.app/healthz`

### Frontend Service
- **Root**: `frontend`
- **Build**: `npm install && npm run build`
- **Start**: `npm start`
- **URL**: `https://your-frontend.up.railway.app`

### Environment Variables

**Backend**:
```
OPENAI_API_KEY=sk-...
USE_FAKE_AI=0
```

**Frontend**:
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.up.railway.app
```

---

## ✅ Deployment Checklist

After deployment, verify:

- [ ] Backend service shows "Active" status
- [ ] Backend health endpoint returns `{"status":"ok"}`
- [ ] Frontend service shows "Active" status
- [ ] Frontend loads in browser
- [ ] Can start a survey session
- [ ] Questions appear and can be answered
- [ ] Admin dashboard shows sessions
- [ ] No errors in Railway logs

---

## 🎉 You're Done!

Your Dynamic Discovery Chatbot is now live on Railway! 

**Next Steps**:
- Share your frontend URL with users
- Monitor usage in Railway dashboard
- Set up custom domains (optional)
- Configure alerts and monitoring (optional)

For issues or questions, check the logs in Railway dashboard or refer to `RAILWAY_DEPLOYMENT.md` for more details.

