using SymptomixAPI.Models;
using System.Text.Json;

namespace SymptomixAPI.Services
{
    public class DiagnosticService : IDiagnosticService
    {
        private readonly IDataService _dataService;
        private readonly List<DiagnosticRule> _diagnosticRules;

        public DiagnosticService(IDataService dataService)
        {
            _dataService = dataService;
            _diagnosticRules = InitializeDiagnosticRules();
        }

        public async Task<DiagnosticResult> AssessSymptomsAsync(SymptomAssessmentRequest request)
        {
            var result = new DiagnosticResult
            {
                Id = Guid.NewGuid().ToString(),
                UserId = request.UserId,
                CreatedAt = DateTime.UtcNow,
                UserAnswers = request.Answers
            };

            // Extract symptoms from answers
            var symptoms = ExtractSymptoms(request.Answers);
            
            // Get primary diagnosis
            var primaryDiagnosis = GetPrimaryDiagnosis(symptoms, request.Answers);
            result.PrimaryDiagnosis = primaryDiagnosis.Condition;
            result.Description = primaryDiagnosis.Description;
            result.Confidence = primaryDiagnosis.Confidence;

            // Determine urgency
            var urgency = DetermineUrgency(symptoms, request.Answers);
            result.Urgency = urgency.Level;
            result.UrgencyMessage = urgency.Message;

            // Get alternative diagnoses
            result.AlternativeDiagnoses = GetAlternativeDiagnoses(symptoms, request.Answers, primaryDiagnosis.Condition);

            // Get recommendations
            result.Recommendations = GetRecommendations(primaryDiagnosis.Condition, urgency.Level, symptoms);

            // Save the assessment
            var assessment = new Assessment
            {
                Id = result.Id,
                UserId = result.UserId,
                Symptoms = symptoms,
                Diagnosis = result.PrimaryDiagnosis,
                Confidence = result.Confidence,
                Urgency = result.Urgency,
                Date = result.CreatedAt,
                Answers = request.Answers
            };

            await _dataService.AddAsync("assessments", assessment);

            return result;
        }

        public async Task<DiagnosticResult?> GetAssessmentAsync(string assessmentId)
        {
            var assessment = await _dataService.GetByIdAsync<Assessment>("assessments", assessmentId);
            
            if (assessment == null)
                return null;

            return new DiagnosticResult
            {
                Id = assessment.Id,
                UserId = assessment.UserId,
                PrimaryDiagnosis = assessment.Diagnosis,
                Confidence = assessment.Confidence,
                Urgency = assessment.Urgency,
                CreatedAt = assessment.Date,
                UserAnswers = assessment.Answers
            };
        }

        public async Task<List<Assessment>> GetUserHistoryAsync(string userId)
        {
            var allAssessments = await _dataService.LoadDataAsync<Assessment>("assessments");
            return allAssessments
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Date)
                .ToList();
        }

        private List<string> ExtractSymptoms(Dictionary<string, object>? answers)
        {
            if (answers == null || !answers.ContainsKey("primary_symptoms"))
                return new List<string>();

            try
            {
                if (answers["primary_symptoms"] is JsonElement element && element.ValueKind == JsonValueKind.Array)
                {
                    return element.EnumerateArray()
                        .Select(item => item.GetString())
                        .Where(s => !string.IsNullOrEmpty(s))
                        .Cast<string>()
                        .ToList();
                }

                if (answers["primary_symptoms"] is List<object> list)
                {
                    return list.Select(item => item.ToString())
                        .Where(s => !string.IsNullOrEmpty(s))
                        .Cast<string>()
                        .ToList();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error extracting symptoms: {ex.Message}");
            }

            return new List<string>();
        }

        private (string Condition, string Description, double Confidence) GetPrimaryDiagnosis(
            List<string> symptoms, Dictionary<string, object>? answers)
        {
            foreach (var rule in _diagnosticRules.OrderByDescending(r => r.Priority))
            {
                var matchScore = CalculateMatchScore(symptoms, answers, rule);
                if (matchScore >= rule.MinConfidence)
                {
                    return (rule.Condition, rule.Description, matchScore);
                }
            }

            // Default diagnosis
            return ("General Symptoms", "Based on your symptoms, you may be experiencing a common condition. Please monitor your symptoms and consider consulting a healthcare professional.", 0.6);
        }

        private (string Level, string Message) DetermineUrgency(List<string> symptoms, Dictionary<string, object>? answers)
        {
            // High urgency conditions
            var highUrgencySymptoms = new[] { "Chest pain", "Shortness of breath", "Severe abdominal pain" };
            if (symptoms.Any(s => highUrgencySymptoms.Contains(s, StringComparer.OrdinalIgnoreCase)))
            {
                return ("high", "Seek immediate medical attention. Consider visiting an emergency room or calling emergency services.");
            }

            // Check for high fever
            if (answers?.ContainsKey("fever_temp") == true)
            {
                try
                {
                    var tempStr = answers["fever_temp"]?.ToString();
                    if (double.TryParse(tempStr, out double temp) && temp >= 103.0)
                    {
                        return ("high", "High fever detected. Seek immediate medical care.");
                    }
                }
                catch { }
            }

            // Medium urgency
            var mediumUrgencySymptoms = new[] { "Fever", "Persistent headache", "Severe fatigue" };
            if (symptoms.Any(s => mediumUrgencySymptoms.Contains(s, StringComparer.OrdinalIgnoreCase)))
            {
                return ("medium", "Consider scheduling an appointment with your healthcare provider within 24-48 hours.");
            }

            // Low urgency
            return ("low", "Monitor your symptoms and consider rest, hydration, and over-the-counter remedies as appropriate.");
        }

        private List<AlternativeDiagnosis> GetAlternativeDiagnoses(List<string> symptoms, Dictionary<string, object>? answers, string primaryCondition)
        {
            var alternatives = new List<AlternativeDiagnosis>();

            foreach (var rule in _diagnosticRules.Where(r => r.Condition != primaryCondition))
            {
                var matchScore = CalculateMatchScore(symptoms, answers, rule);
                if (matchScore >= 0.3) // Lower threshold for alternatives
                {
                    alternatives.Add(new AlternativeDiagnosis
                    {
                        Condition = rule.Condition,
                        Description = rule.Description,
                        Confidence = matchScore
                    });
                }
            }

            return alternatives.OrderByDescending(a => a.Confidence).Take(3).ToList();
        }

        private List<Recommendation> GetRecommendations(string condition, string urgency, List<string> symptoms)
        {
            var recommendations = new List<Recommendation>();

            // Urgency-based recommendations
            switch (urgency.ToLower())
            {
                case "high":
                    recommendations.Add(new Recommendation
                    {
                        Type = "urgent",
                        Title = "Seek Immediate Care",
                        Description = "Visit the nearest emergency room or call emergency services immediately."
                    });
                    break;
                case "medium":
                    recommendations.Add(new Recommendation
                    {
                        Type = "medical",
                        Title = "Consult Healthcare Provider",
                        Description = "Schedule an appointment with your doctor within 24-48 hours."
                    });
                    break;
                case "low":
                    recommendations.Add(new Recommendation
                    {
                        Type = "self-care",
                        Title = "Self-Care and Monitoring",
                        Description = "Rest, stay hydrated, and monitor your symptoms."
                    });
                    break;
            }

            // Symptom-specific recommendations
            if (symptoms.Any(s => s.Contains("Fever", StringComparison.OrdinalIgnoreCase)))
            {
                recommendations.Add(new Recommendation
                {
                    Type = "self-care",
                    Title = "Fever Management",
                    Description = "Take fever reducers as directed, stay hydrated, and rest."
                });
            }

            if (symptoms.Any(s => s.Contains("Cough", StringComparison.OrdinalIgnoreCase)))
            {
                recommendations.Add(new Recommendation
                {
                    Type = "self-care",
                    Title = "Cough Relief",
                    Description = "Use a humidifier, drink warm liquids, and consider over-the-counter cough suppressants."
                });
            }

            // General recommendations
            recommendations.Add(new Recommendation
            {
                Type = "general",
                Title = "Follow Up",
                Description = "If symptoms worsen or persist, consult with a healthcare professional."
            });

            return recommendations;
        }

        private double CalculateMatchScore(List<string> symptoms, Dictionary<string, object>? answers, DiagnosticRule rule)
        {
            double score = 0.0;
            int totalCriteria = 0;

            // Check symptom matches
            foreach (var requiredSymptom in rule.RequiredSymptoms)
            {
                totalCriteria++;
                if (symptoms.Any(s => s.Contains(requiredSymptom, StringComparison.OrdinalIgnoreCase)))
                {
                    score += 1.0;
                }
            }

            // Check additional criteria based on answers
            if (answers != null)
            {
                // Duration scoring
                if (answers.ContainsKey("duration"))
                {
                    totalCriteria++;
                    var duration = answers["duration"]?.ToString();
                    if (rule.DurationFactors.ContainsKey(duration ?? ""))
                    {
                        score += rule.DurationFactors[duration ?? ""];
                    }
                }

                // Severity scoring
                if (answers.ContainsKey("severity"))
                {
                    totalCriteria++;
                    var severity = answers["severity"]?.ToString();
                    if (rule.SeverityFactors.ContainsKey(severity ?? ""))
                    {
                        score += rule.SeverityFactors[severity ?? ""];
                    }
                }
            }

            return totalCriteria > 0 ? score / totalCriteria : 0.0;
        }

        private List<DiagnosticRule> InitializeDiagnosticRules()
        {
            return new List<DiagnosticRule>
            {
                new DiagnosticRule
                {
                    Condition = "Common Cold",
                    Description = "A viral infection affecting the nose and throat, typically lasting 7-10 days.",
                    RequiredSymptoms = new[] { "Cough", "Sore throat", "Fatigue" },
                    MinConfidence = 0.6,
                    Priority = 5,
                    DurationFactors = new Dictionary<string, double>
                    {
                        ["1-3 days"] = 0.8,
                        ["4-7 days"] = 1.0,
                        ["More than a week"] = 0.6
                    },
                    SeverityFactors = new Dictionary<string, double>
                    {
                        ["Mild - Does not interfere with daily activities"] = 1.0,
                        ["Moderate - Some interference with daily activities"] = 0.8
                    }
                },
                new DiagnosticRule
                {
                    Condition = "Influenza (Flu)",
                    Description = "A viral infection that attacks your respiratory system with sudden onset of symptoms.",
                    RequiredSymptoms = new[] { "Fever", "Fatigue", "Headache" },
                    MinConfidence = 0.7,
                    Priority = 7,
                    DurationFactors = new Dictionary<string, double>
                    {
                        ["Less than 24 hours"] = 1.0,
                        ["1-3 days"] = 1.0,
                        ["4-7 days"] = 0.8
                    },
                    SeverityFactors = new Dictionary<string, double>
                    {
                        ["Moderate - Some interference with daily activities"] = 0.8,
                        ["Severe - Significantly impacts daily activities"] = 1.0
                    }
                },
                new DiagnosticRule
                {
                    Condition = "Gastroenteritis",
                    Description = "Inflammation of the stomach and intestines, often called stomach flu.",
                    RequiredSymptoms = new[] { "Nausea", "Vomiting", "Diarrhea" },
                    MinConfidence = 0.7,
                    Priority = 6,
                    DurationFactors = new Dictionary<string, double>
                    {
                        ["Less than 24 hours"] = 0.8,
                        ["1-3 days"] = 1.0,
                        ["4-7 days"] = 0.6
                    }
                },
                new DiagnosticRule
                {
                    Condition = "Migraine",
                    Description = "A type of headache characterized by severe pain, often accompanied by nausea and sensitivity to light.",
                    RequiredSymptoms = new[] { "Headache" },
                    MinConfidence = 0.6,
                    Priority = 4,
                    SeverityFactors = new Dictionary<string, double>
                    {
                        ["Severe - Significantly impacts daily activities"] = 1.0,
                        ["Very severe - Unable to perform normal activities"] = 1.0
                    }
                }
            };
        }

        private class DiagnosticRule
        {
            public string Condition { get; set; } = "";
            public string Description { get; set; } = "";
            public string[] RequiredSymptoms { get; set; } = Array.Empty<string>();
            public double MinConfidence { get; set; }
            public int Priority { get; set; }
            public Dictionary<string, double> DurationFactors { get; set; } = new();
            public Dictionary<string, double> SeverityFactors { get; set; } = new();
        }
    }
}
