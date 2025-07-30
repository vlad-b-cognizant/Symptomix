# Symptomix Quick Start Guide

## Prerequisites
- ✅ Node.js (v16+)
- ✅ .NET 8 SDK  
- ✅ Expo CLI (`npm install -g @expo/cli`)

## 🚀 Quick Start (5 minutes)

### 1. Start the Backend API
```powershell
cd server
dotnet run
```
API will run on: http://localhost:5000

### 2. Start the Frontend App
```powershell
cd client
npm install
npm start
```

### 3. Test the App
- Scan QR code with Expo Go app
- Or press 'w' to run in web browser
- Or press 'i' for iOS simulator

## 🧪 Test the Application

1. **Home Screen**: See welcome message and stats
2. **Start Assessment**: Tap "Begin Assessment"
3. **Answer Questions**: Complete the symptom wizard
4. **View Results**: Get diagnostic suggestions
5. **Check History**: View past assessments

## 📱 Features to Test

### Core Functionality
- [x] Symptom wizard with dynamic questions
- [x] Multiple choice and text inputs
- [x] Conditional questions (fever → temperature)
- [x] Diagnostic results with confidence levels
- [x] Treatment recommendations
- [x] Urgency indicators
- [x] Assessment history
- [x] User profile management

### API Endpoints
- `GET http://localhost:5000/api/health` - Health check
- `POST http://localhost:5000/api/symptoms/assess` - Submit assessment
- `GET http://localhost:5000/api/symptoms/history/user123` - Get history

## 🔧 Troubleshooting

### Backend Issues
- **Port conflict**: Change port in `Properties/launchSettings.json`
- **Build errors**: Run `dotnet restore` then `dotnet build`
- **Data folder**: Ensure `../data` folder exists with JSON files

### Frontend Issues
- **Metro bundler**: Clear cache with `npx expo start -c`
- **Dependencies**: Delete `node_modules` and run `npm install`
- **API connection**: Update IP address in `src/services/api.js`

## 📊 Sample Data

The app includes sample data:
- **User**: John Doe (user123)
- **Assessments**: 2 sample assessments
- **Symptoms**: Fever, headache, cough, etc.

## 🎯 Next Steps

1. Customize diagnostic rules in `DiagnosticService.cs`
2. Add more symptoms and conditions
3. Enhance UI/UX components
4. Integrate real medical AI services
5. Add authentication and security

## ⚠️ Important Notes

- This is a **demo application** for educational purposes
- **Not for real medical use** - always consult healthcare professionals
- Uses mock AI data, not real diagnostic AI
- Local JSON storage for development only

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Review API documentation at http://localhost:5000/swagger
- Check console logs for error messages

---

**Enjoy exploring Symptomix!** 🏥📱
