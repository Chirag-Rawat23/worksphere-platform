# Troubleshooting Guide

## Port Configuration

### Backend Port
- **Default**: `http://localhost:5000` (HTTP) and `https://localhost:5001` (HTTPS)
- **Configuration**: `Properties/launchSettings.json`

### Frontend API URL
- **Development**: `http://localhost:5000/api`
- **Configuration**: `src/environments/environment.ts`

## Common Issues

### 1. Backend Returns 500 Internal Server Error

**Cause**: Circular reference in JSON serialization when including navigation properties.

**Solution**: 
- JSON serialization is configured to ignore cycles in `Program.cs`
- Controllers use projection to avoid circular references

**If still occurring**:
1. Check backend logs for specific error
2. Ensure database is seeded properly
3. Restart the backend

### 2. CORS Errors in Browser Console

**Symptoms**: 
- `Access-Control-Allow-Origin` errors
- Requests blocked by CORS policy

**Solution**:
- CORS is configured for `http://localhost:4200`
- Ensure backend is running before frontend
- Check that CORS middleware is before other middleware in `Program.cs`

### 3. Backend Not Starting

**Check**:
1. .NET 8.0 SDK installed: `dotnet --version`
2. Port 5000 not in use: `netstat -ano | findstr :5000`
3. Dependencies restored: `dotnet restore`

**Fix**:
- Kill process using port 5000 if needed
- Change port in `launchSettings.json` if necessary

### 4. Frontend Can't Connect to Backend

**Check**:
1. Backend is running: Visit `http://localhost:5000/swagger`
2. API URL in `environment.ts` matches backend port
3. No firewall blocking localhost connections

**Fix**:
- Ensure backend starts before frontend
- Verify `apiUrl` in `src/environments/environment.ts` is `http://localhost:5000/api`

### 5. Data Not Persisting

**Cause**: Using In-Memory database (data resets on restart)

**Solution**:
- This is expected behavior for development
- For production, switch to SQL Server (see `README.md`)

## Testing the Connection

1. **Test Backend**:
   ```bash
   # In PowerShell
   Invoke-WebRequest -Uri "http://localhost:5000/api/employees" -Method GET
   ```

2. **Test Swagger UI**:
   - Open `http://localhost:5000/swagger`
   - Try the GET endpoints

3. **Test from Frontend**:
   - Open browser console (F12)
   - Check Network tab for API calls
   - Verify requests go to `http://localhost:5000/api/...`

## Restart Instructions

If issues persist:

1. **Stop both servers** (Ctrl+C in terminals)
2. **Restart Backend**:
   ```bash
   cd backend/HRManagementSystem.API
   dotnet run
   ```
3. **Restart Frontend** (new terminal):
   ```bash
   npm start
   ```

## Port Conflicts

If port 5000 is already in use:

1. **Find process**:
   ```powershell
   netstat -ano | findstr :5000
   ```

2. **Kill process** (replace PID):
   ```powershell
   taskkill /PID <process_id> /F
   ```

3. **Or change port** in `launchSettings.json`:
   ```json
   "applicationUrl": "http://localhost:5001"
   ```
   And update `environment.ts` accordingly.
