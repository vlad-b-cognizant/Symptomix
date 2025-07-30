namespace SymptomixAPI.Models
{
    public class SymptomAssessmentRequest
    {
        public Dictionary<string, object>? Answers { get; set; }
        public string? Timestamp { get; set; }
        public string? UserId { get; set; }
    }

    public class DiagnosticResult
    {
        public string? Id { get; set; }
        public string? UserId { get; set; }
        public string? PrimaryDiagnosis { get; set; }
        public string? Description { get; set; }
        public double Confidence { get; set; }
        public string? Urgency { get; set; }
        public string? UrgencyMessage { get; set; }
        public List<AlternativeDiagnosis>? AlternativeDiagnoses { get; set; }
        public List<Recommendation>? Recommendations { get; set; }
        public DateTime CreatedAt { get; set; }
        public Dictionary<string, object>? UserAnswers { get; set; }
    }

    public class AlternativeDiagnosis
    {
        public string? Condition { get; set; }
        public string? Description { get; set; }
        public double Confidence { get; set; }
    }

    public class Recommendation
    {
        public string? Type { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
    }

    public class User
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public int? Age { get; set; }
        public string? Gender { get; set; }
        public string? Phone { get; set; }
        public string? EmergencyContact { get; set; }
        public string? MedicalConditions { get; set; }
        public string? Allergies { get; set; }
        public string? Medications { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class Assessment
    {
        public string? Id { get; set; }
        public string? UserId { get; set; }
        public List<string>? Symptoms { get; set; }
        public string? Diagnosis { get; set; }
        public double Confidence { get; set; }
        public string? Urgency { get; set; }
        public DateTime Date { get; set; }
        public Dictionary<string, object>? Answers { get; set; }
    }
}
