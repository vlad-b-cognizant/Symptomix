using SymptomixAPI.Models;

namespace SymptomixAPI.Services
{
    public class UserService : IUserService
    {
        private readonly IDataService _dataService;

        public UserService(IDataService dataService)
        {
            _dataService = dataService;
        }

        public async Task<User> CreateUserAsync(User user)
        {
            user.Id = await _dataService.AddAsync("users", user);
            return user;
        }

        public async Task<User?> GetUserAsync(string userId)
        {
            return await _dataService.GetByIdAsync<User>("users", userId);
        }

        public async Task<User?> GetUserByIdAsync(string userId)
        {
            return await _dataService.GetByIdAsync<User>("users", userId);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            var users = await _dataService.LoadDataAsync<User>("users");
            return users.FirstOrDefault(u => u.Email?.Equals(email, StringComparison.OrdinalIgnoreCase) == true);
        }

        public async Task<User> UpdateUserAsync(string userId, User user)
        {
            var success = await _dataService.UpdateAsync("users", userId, user);
            if (!success)
            {
                throw new ArgumentException($"User with ID {userId} not found.");
            }
            
            user.Id = userId;
            return user;
        }

        public async Task<bool> DeleteUserAsync(string userId)
        {
            return await _dataService.DeleteAsync<User>("users", userId);
        }
    }
}
