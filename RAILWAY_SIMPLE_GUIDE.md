# Railway Deployment - Simple Step-by-Step Guide

Follow these steps exactly. Don't skip any step!

---

## 🎯 What You're Doing

You're deploying **2 separate services** on Railway:
1. **Backend** (Python/FastAPI) - Your API server
2. **Frontend** (Next.js) - Your website

They need to be deployed separately because they're in different folders.

---

## 📋 Step 1: Create Railway Account & Project

1. Go to [railway.app](https://railway.app)
2. Sign up or log in (you can use GitHub)
3. Click **"New Project"**
4. Click **"Empty Project"** (don't use "Deploy from GitHub" yet)

---

## 🖥️ Step 2: Deploy Backend (First Service)

### 2.1 Add Backend Service

1. In your Railway project, click **"+ New"** button
2. Select **"GitHub Repo"**
3. Find and select your repository: `techleadershub/dynamic-forms`
4. Click **"Deploy"**

### 2.2 Configure Backend (IMPORTANT!)

1. Click on the service you just created (it will have a random name)
2. Click the **"Settings"** tab (gear icon on the right)
3. Scroll down to **"Root Directory"**
4. **Type exactly**: `backend`
5. Click **"Save"**

### 2.3 Set Environment Variables

1. Still in Settings, click **"Variables"** tab
2. Click **"+ New Variable"**
3. Add these one by one:

   **Variable 1:**
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-actual-openai-key-here` (replace with your real key)
   - Click **"Add"**

   **Variable 2:**
   - Name: `USE_FAKE_AI`
   - Value: `0`
   - Click **"Add"**

4. Click **"Save"** when done

### 2.4 Get Backend URL

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy the URL (something like `https://your-backend.up.railway.app`)
4. **Save this URL somewhere** - you'll need it for the frontend!

### 2.5 Verify Backend Works

1. Go to **"Deployments"** tab
2. Wait for deployment to finish (green checkmark)
3. Click on the deployment
4. Check **"Logs"** tab - should see "Uvicorn running on..."
5. Test: Open your backend URL + `/healthz` in browser
   - Example: `https://your-backend.up.railway.app/healthz`
   - Should see: `{"status":"ok"}`

✅ **Backend is done!**

---

## 🌐 Step 3: Deploy Frontend (Second Service)

### 3.1 Add Frontend Service

1. In the same Railway project, click **"+ New"** again
2. Select **"GitHub Repo"**
3. Select the **same repository**: `techleadershub/dynamic-forms`
4. Click **"Deploy"**

### 3.2 Configure Frontend (IMPORTANT!)

1. Click on the new frontend service
2. Click **"Settings"** tab
3. Scroll to **"Root Directory"**
4. **Type exactly**: `frontend`
5. Click **"Save"**

### 3.3 Set Environment Variable

1. In Settings, click **"Variables"** tab
2. Click **"+ New Variable"**
3. Add:

   **Variable:**
   - Name: `NEXT_PUBLIC_API_BASE_URL`
   - Value: `https://your-backend.up.railway.app` (use the backend URL from Step 2.4)
   - Click **"Add"**

4. Click **"Save"**

### 3.4 Get Frontend URL

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy the URL (something like `https://your-frontend.up.railway.app`)

### 3.5 Verify Frontend Works

1. Go to **"Deployments"** tab
2. Wait for deployment to finish
3. Open the frontend URL in your browser
4. You should see the SmartForms interface!

✅ **Frontend is done!**

---

## ✅ Final Checklist

- [ ] Backend service deployed and running
- [ ] Backend URL works (test `/healthz`)
- [ ] Frontend service deployed and running
- [ ] Frontend URL works and shows the form
- [ ] Frontend can connect to backend (try starting a survey)

---

## 🐛 Common Issues & Fixes

### Backend won't start
- **Check**: Root Directory is set to `backend` (not `backend/` or empty)
- **Check**: `OPENAI_API_KEY` is set correctly (no quotes, no spaces)
- **Check**: Look at "Logs" tab for error messages

### Frontend can't connect to backend
- **Check**: `NEXT_PUBLIC_API_BASE_URL` matches your backend URL exactly
- **Check**: Backend URL ends with no slash (e.g., `https://...app` not `https://...app/`)
- **Check**: Backend is actually running (test `/healthz`)

### "Module not found" errors
- **Check**: Root Directory is correct (`backend` for backend, `frontend` for frontend)
- **Check**: Files are committed to GitHub

### Port errors
- Railway sets `PORT` automatically - don't add it as a variable
- The Dockerfile/commands already use `$PORT`

---

## 📞 Need Help?

1. Check the **"Logs"** tab in Railway for error messages
2. Make sure all environment variables are set correctly
3. Verify Root Directories are set correctly
4. Check that your code is pushed to GitHub

---

## 🎉 You're Done!

Once both services are deployed:
- Your backend API is live at: `https://your-backend.up.railway.app`
- Your frontend website is live at: `https://your-frontend.up.railway.app`

Share the frontend URL with anyone who needs to use SmartForms!

