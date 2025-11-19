# Railway Deployment Verification

This document verifies that the project is correctly configured for Railway deployment.

## ✅ Fixed Issues

### 1. Backend Uvicorn Command Path
**Issue**: When Railway sets root directory to `backend/`, the command `uv run uvicorn backend.app:app` would fail because it looks for `backend/backend/app.py`.

**Fix**: Changed to `uv run uvicorn app:app` in:
- `backend/railway.json`
- `backend/Procfile`

### 2. UV Package Manager Installation
**Issue**: Railway's Nixpacks might not automatically install `uv`.

**Fix**: 
- Added `pip install uv` to build command in `railway.json`
- Created `backend/nixpacks.toml` for explicit Nixpacks configuration

### 3. Config.json and Data Paths
**Issue**: When root directory is `backend/`, paths to `config.json` and `data/sessions/` need to go up one level.

**Fix**: 
- Updated `backend/config.py` with fallback path logic
- Updated `backend/session_manager.py` with fallback path logic
- Added environment variable support (`CONFIG_PATH`, `SESSIONS_DIR`)

## ✅ Verified Components

### Backend Service
- [x] `backend/railway.json` - Correct start command (`app:app`)
- [x] `backend/Procfile` - Correct start command (`app:app`)
- [x] `backend/nixpacks.toml` - UV installation and build steps
- [x] `backend/pyproject.toml` - Python dependencies defined
- [x] `backend/runtime.txt` - Python version specified (3.11)
- [x] Path resolution - Config and data paths work from `backend/` root
- [x] PORT environment variable - Uses `$PORT` from Railway

### Frontend Service
- [x] `frontend/railway.json` - Build and start commands correct
- [x] `frontend/package.json` - Has `build` and `start` scripts
- [x] Environment variable - Uses `NEXT_PUBLIC_API_BASE_URL`
- [x] Next.js production build - Configured correctly

### Path Resolution Logic

#### Config Path (backend/config.py)
```python
# Tries in order:
1. CONFIG_PATH env var
2. ../config.json (parent directory - repo root)
3. ./config.json (current directory)
```

#### Sessions Directory (backend/session_manager.py)
```python
# Tries in order:
1. SESSIONS_DIR env var
2. ../data/sessions/ (parent directory - repo root)
3. Creates directory if missing
```

## 🧪 Testing Checklist

Before deploying, verify locally:

1. **Backend from backend/ directory**:
   ```bash
   cd backend
   uv sync
   uv run uvicorn app:app --host 0.0.0.0 --port 8000
   ```
   - Should find `../config.json`
   - Should create `../data/sessions/` if needed
   - Should start successfully

2. **Frontend build**:
   ```bash
   cd frontend
   npm install
   npm run build
   npm start
   ```
   - Should build without errors
   - Should start on port 3000 (or PORT env var)

3. **Environment Variables**:
   - Backend: `OPENAI_API_KEY` set
   - Frontend: `NEXT_PUBLIC_API_BASE_URL` points to backend

## 🚀 Railway Deployment Steps

1. **Deploy Backend**:
   - Root Directory: `backend`
   - Railway will use `railway.json` or `nixpacks.toml`
   - Set `OPENAI_API_KEY` environment variable

2. **Deploy Frontend**:
   - Root Directory: `frontend`
   - Railway will use `railway.json`
   - Set `NEXT_PUBLIC_API_BASE_URL` to backend URL

3. **Verify**:
   - Backend health: `https://your-backend.up.railway.app/healthz`
   - Frontend loads and connects to backend

## ⚠️ Known Considerations

1. **File Paths**: When root is `backend/`, the code looks for `config.json` in parent directory. This works because Railway clones the entire repo.

2. **UV Installation**: The build command installs `uv` first. If Railway's Nixpacks already includes `uv`, this is harmless.

3. **Data Persistence**: Session data is stored in `data/sessions/`. On Railway, this is ephemeral unless you use a volume. Consider using a database for production.

4. **CORS**: Backend allows all origins (`allow_origins=["*"]`). For production, consider restricting to your frontend domain.

## 📝 Files Changed for Railway

- `backend/railway.json` - Fixed start command
- `backend/Procfile` - Fixed start command  
- `backend/nixpacks.toml` - Added explicit Nixpacks config
- `backend/config.py` - Added path fallback logic
- `backend/session_manager.py` - Added path fallback logic
- `RAILWAY_DEPLOYMENT.md` - Updated with correct commands
- `RAILWAY_VERIFICATION.md` - This file

## ✅ Conclusion

The project is now correctly configured for Railway deployment. All path issues have been resolved, and the configuration files are set up for Railway's build and deployment process.

