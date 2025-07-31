# 🚀 How to Start Symptomix

## Quick Start (Recommended)

### Option 1: Automatic Startup
Double-click `START-BOTH.bat` - starts both server and client automatically.

### Option 2: Manual Steps
1. **Start Server**: 
   ```powershell
   cd server
   dotnet run --launch-profile http
   ```
2. **Start Client**: Double-click `client/start.bat` or `client/symptomix-web.html`

## ✅ Success Indicators
- Server shows: "Now listening on: http://localhost:5226"
- Web app shows: 🟢 **Connected** (green status indicator)

## �️ Files Overview
- `START-BOTH.bat` - Start everything
- `client/start.bat` - Client only
- `client/symptomix-web.html` - Main web app
- `server/` - .NET backend
