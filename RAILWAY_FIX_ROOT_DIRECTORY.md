# Fix Railway Root Directory Issue

If Railway is looking for `start.sh` in the root instead of using the `backend/` directory, follow these steps:

## 🔧 Solution: Force Railway to Use Docker

### Step 1: In Railway Dashboard

1. Go to your **Backend Service** in Railway
2. Click **"Settings"** tab
3. Scroll to **"Build & Deploy"** section
4. Find **"Build Command"** - **DELETE IT** (leave it empty)
5. Find **"Start Command"** - **DELETE IT** (leave it empty)
6. Find **"Dockerfile Path"** - Set it to: `backend/Dockerfile`
   - OR if Root Directory is set to `backend`, use: `Dockerfile`
7. Make sure **"Root Directory"** is set to: `backend`
8. Click **"Save"**

### Step 2: Force Docker Builder

1. Still in Settings → **"Build & Deploy"**
2. Look for **"Builder"** or **"Build Type"**
3. Select **"Dockerfile"** or **"Docker"** (not "Nixpacks" or "Auto-detect")
4. Click **"Save"**

### Step 3: Redeploy

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** or **"Deploy"**
3. Railway should now use the Dockerfile

## 🎯 Alternative: Manual Configuration

If the above doesn't work, manually set everything:

### In Railway Dashboard → Backend Service → Settings:

**Build & Deploy Section:**
- **Builder**: `DOCKERFILE`
- **Dockerfile Path**: `backend/Dockerfile` (if root is repo root) OR `Dockerfile` (if root is backend/)
- **Root Directory**: `backend`
- **Build Command**: (leave empty - Docker handles it)
- **Start Command**: (leave empty - Dockerfile CMD handles it)

**Variables Section:**
- `OPENAI_API_KEY` = your key
- `USE_FAKE_AI` = `0`

## ✅ Verify It's Working

1. Go to **"Deployments"** tab
2. Click on the latest deployment
3. Check **"Logs"** tab
4. You should see Docker build logs, not Nixpacks logs
5. Look for: `Step 1/7 : FROM python:3.12-slim` (Docker) instead of Nixpacks messages

## 🐛 If Still Not Working

1. **Delete the service** and recreate it:
   - Settings → Danger Zone → Delete Service
   - Create new service from GitHub repo
   - **Immediately** set Root Directory to `backend` before first deploy
   - Set Builder to `DOCKERFILE`

2. **Check for conflicting files:**
   - Make sure there's no `Procfile` or `start.sh` in the root directory
   - Railway might be auto-detecting these

3. **Use Railway CLI** (if dashboard doesn't work):
   ```bash
   railway link
   railway service
   railway variables set OPENAI_API_KEY=your-key
   railway up
   ```

## 📝 Quick Checklist

- [ ] Root Directory = `backend`
- [ ] Builder = `DOCKERFILE` (not Auto-detect)
- [ ] Dockerfile Path = `backend/Dockerfile` or `Dockerfile`
- [ ] Build Command = (empty)
- [ ] Start Command = (empty)
- [ ] Environment variables set
- [ ] Redeployed after changes

