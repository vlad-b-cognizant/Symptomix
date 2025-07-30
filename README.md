# Symptomix

**From Symptoms to Solutions—Instantly with Symptomix**

A comprehensive healthcare diagnostic web application built with React Native frontend and .NET 8 API backend, designed to help users receive quick diagnostic suggestions and treatment options based on symptoms and medical test inputs.

## 🏗️ Architecture

- **Client**: React Native with Expo (Cross-platform mobile app)
- **Server**: .NET 8 Web API (RESTful backend)
- **Database**: JSON file system (for local development)
- **Data Storage**: Local storage for user preferences, server-side JSON for assessments

## 📁 Project Structure

```
Symptomix/
├── client/                 # React Native frontend
│   ├── src/
│   │   ├── screens/       # App screens
│   │   ├── services/      # API services
│   │   └── theme/         # UI theme
│   ├── App.js
│   └── package.json
├── server/                # .NET 8 API backend
│   ├── Controllers/       # API controllers
│   ├── Models/           # Data models
│   ├── Services/         # Business logic
│   └── Program.cs
├── data/                 # JSON data files
│   ├── assessments.json  # User assessments
│   └── users.json        # User profiles
└── README.md
```

## 🚀 Features

### Core Features (MVP)

✅ **Symptom & Test Input Wizard**
- Guided, step-by-step form for symptom input
- Dynamic question flow based on previous answers
- Multiple choice, single choice, and text input support
- Conditional questions (e.g., fever → ask about temperature)

✅ **Diagnostic Suggestions**
- AI-powered diagnostic results using mock data
- Confidence levels for each diagnosis
- Alternative possible conditions
- Detailed descriptions and explanations

✅ **Treatment Recommendations**
- Personalized treatment suggestions
- Urgency indicators (immediate care vs. monitor at home)
- Self-care recommendations
- When to seek professional help

✅ **User History & Trends**
- Assessment history tracking
- Pattern recognition over time
- Search and filter capabilities
- Export functionality

✅ **Mock AI Data Integration**
- Pre-generated diagnostic rules
- Fast, controlled responses
- Comprehensive symptom database
- Medical condition matching

### Additional Features

✅ **User Profile Management**
- Personal information storage
- Medical history tracking
- Emergency contact information
- Medication and allergy tracking

✅ **Responsive Design**
- Modern, intuitive UI
- Accessibility features
- Cross-platform compatibility
- Offline capability for stored data

## 🛠️ Technology Stack

### Frontend (React Native)
- **Expo**: Development framework
- **React Navigation**: Screen navigation
- **React Native Paper**: Material Design components
- **Axios**: HTTP client for API calls
- **AsyncStorage**: Local data persistence

### Backend (.NET 8)
- **ASP.NET Core Web API**: RESTful API framework
- **Minimal APIs**: Lightweight endpoint definitions
- **Swagger/OpenAPI**: API documentation
- **JSON File System**: Local development data storage

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- .NET 8 SDK
- Expo CLI (`npm install -g @expo/cli`)

### Backend Setup

1. Navigate to the server directory:
   ```powershell
   cd server
   ```

2. Restore NuGet packages:
   ```powershell
   dotnet restore
   ```

3. Run the API:
   ```powershell
   dotnet run
   ```

The API will be available at `https://localhost:5001` and `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
   ```powershell
   cd client
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start the development server:
   ```powershell
   npm start
   ```

4. Use Expo Go app on your mobile device or run in simulator

## 📱 Usage

1. **Start Assessment**: Tap "Begin Assessment" on the home screen
2. **Answer Questions**: Complete the guided symptom wizard
3. **Review Results**: Get instant diagnostic suggestions and recommendations
4. **View History**: Track your health assessments over time
5. **Manage Profile**: Update personal and medical information

## 🔧 API Endpoints

### Symptoms API
- `POST /api/symptoms/assess` - Submit symptoms for assessment
- `GET /api/symptoms/assessment/{id}` - Get specific assessment
- `GET /api/symptoms/history/{userId}` - Get user's assessment history

### Users API
- `POST /api/users` - Create new user
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile
- `DELETE /api/users/{id}` - Delete user

### Health Check
- `GET /api/health` - API health status

## 📊 Data Models

### Assessment Request
```json
{
  "answers": {
    "primary_symptoms": ["Fever", "Headache"],
    "duration": "1-3 days",
    "severity": "Moderate"
  },
  "timestamp": "2025-01-30T10:30:00Z",
  "userId": "user123"
}
```

### Diagnostic Result
```json
{
  "id": "assessment-id",
  "primaryDiagnosis": "Influenza (Flu)",
  "confidence": 0.85,
  "urgency": "medium",
  "description": "A viral infection...",
  "alternativeDiagnoses": [...],
  "recommendations": [...]
}
```

## 🔒 Security & Privacy

- No real medical AI integration (uses mock data)
- Local data storage for development
- User data encryption ready for production
- HIPAA compliance considerations documented
- Privacy-first design principles

## 🧪 Testing

### Backend Tests
```powershell
cd server
dotnet test
```

### Frontend Tests
```powershell
cd client
npm test
```

## 🚀 Deployment

### Production Considerations
- Replace JSON file storage with SQL Server
- Implement authentication and authorization
- Add real AI/ML diagnostic capabilities
- Set up proper logging and monitoring
- Configure HTTPS and security headers

## 📈 Future Enhancements

- [ ] Integration with real medical AI services
- [ ] Telemedicine video consultations
- [ ] Medication reminders and tracking
- [ ] Health metrics integration (wearables)
- [ ] Multi-language support
- [ ] Healthcare provider network integration

## ⚠️ Medical Disclaimer

This application is for educational and demonstration purposes only. It should not be used for actual medical diagnosis or treatment decisions. Always consult with qualified healthcare professionals for medical advice.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Symptomix** - Empowering users with instant health insights while maintaining the highest standards of medical ethics and user privacy.
