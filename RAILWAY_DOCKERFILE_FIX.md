# Fix "Dockerfile does not exist" Error in Railway

If Railway says `Dockerfile 'Dockerfile' does not exist`, here's how to fix it:

## 🔧 Solution: Set Dockerfile Path in Railway Dashboard

The issue is that Railway might not be reading the `railway.json` files correctly, or the root directory isn't being applied. Fix it manually in the dashboard:

### For Backend Service:

1. Go to your **Backend Service** in Railway
2. Click **"Settings"** tab
3. Scroll to **"Build & Deploy"** section
4. Check these settings:

   **Root Directory:**
   - Should be: `backend`
   - If it's empty or wrong, set it to: `backend`
   - Click **"Save"**

   **Dockerfile Path:**
   - If Root Directory is `backend`, use: `Dockerfile`
   - If Root Directory is empty/root, use: `backend/Dockerfile`
   - Type it exactly (case-sensitive)

   **Builder:**
   - Must be: `DOCKERFILE` (not "Auto-detect" or "Nixpacks")

5. Click **"Save"** at the bottom

### For Frontend Service:

1. Go to your **Frontend Service** in Railway
2. Click **"Settings"** tab
3. Scroll to **"Build & Deploy"** section
4. Check these settings:

   **Root Directory:**
   - Should be: `frontend`
   - If it's empty or wrong, set it to: `frontend`
   - Click **"Save"**

   **Dockerfile Path:**
   - If Root Directory is `frontend`, use: `Dockerfile`
   - If Root Directory is empty/root, use: `frontend/Dockerfile`
   - Type it exactly (case-sensitive)

   **Builder:**
   - Must be: `DOCKERFILE` (not "Auto-detect" or "Nixpacks")

5. Click **"Save"** at the bottom

## 🎯 Quick Fix Formula

**If Root Directory = `backend`:**
- Dockerfile Path = `Dockerfile`

**If Root Directory = (empty/root):**
- Dockerfile Path = `backend/Dockerfile`

**Same for frontend:**
- If Root Directory = `frontend`: Dockerfile Path = `Dockerfile`
- If Root Directory = (empty): Dockerfile Path = `frontend/Dockerfile`

## ✅ After Fixing

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** or trigger a new deployment
3. Check the **"Logs"** tab
4. You should see Docker build steps, not the error

## 🐛 If Still Not Working

1. **Delete and recreate the service:**
   - Delete the service
   - Create new service from GitHub repo
   - **Before first deploy**, set Root Directory
   - Set Dockerfile Path
   - Set Builder to DOCKERFILE
   - Then deploy

2. **Check file exists in GitHub:**
   - Go to your GitHub repo
   - Verify `backend/Dockerfile` exists
   - Verify `frontend/Dockerfile` exists
   - Make sure they're committed and pushed

3. **Use absolute path (last resort):**
   - Try Dockerfile Path: `./backend/Dockerfile` or `./frontend/Dockerfile`

