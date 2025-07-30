using SymptomixAPI.Models;

namespace SymptomixAPI.Services
{
    public interface IDiagnosticService
    {
        Task<DiagnosticResult> AssessSymptomsAsync(SymptomAssessmentRequest request);
        Task<DiagnosticResult?> GetAssessmentAsync(string assessmentId);
        Task<List<Assessment>> GetUserHistoryAsync(string userId);
    }

    public interface IUserService
    {
        Task<User> CreateUserAsync(User user);
        Task<User?> GetUserAsync(string userId);
        Task<User> UpdateUserAsync(string userId, User user);
        Task<bool> DeleteUserAsync(string userId);
    }

    public interface IDataService
    {
        Task<List<T>> LoadDataAsync<T>(string fileName) where T : class;
        Task SaveDataAsync<T>(string fileName, List<T> data) where T : class;
        Task<T?> GetByIdAsync<T>(string fileName, string id) where T : class;
        Task<string> AddAsync<T>(string fileName, T item) where T : class;
        Task<bool> UpdateAsync<T>(string fileName, string id, T item) where T : class;
        Task<bool> DeleteAsync<T>(string fileName, string id) where T : class;
    }
}
