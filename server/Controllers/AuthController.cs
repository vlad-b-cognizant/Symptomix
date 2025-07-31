using Microsoft.AspNetCore.Mvc;
using SymptomixAPI.Models;
using SymptomixAPI.Services;

namespace SymptomixAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IUserService userService, ILogger<AuthController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        /// <summary>
        /// Simple login - finds user by email or creates new user
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<User>> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email))
                {
                    return BadRequest("Email is required.");
                }

                // Try to find existing user
                var existingUser = await _userService.GetUserByEmailAsync(request.Email);
                
                if (existingUser != null)
                {
                    _logger.LogInformation($"User logged in: {request.Email}");
                    return Ok(existingUser);
                }

                // Create new user if doesn't exist
                var newUser = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Email = request.Email,
                    Name = request.Name ?? "New User",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createdUser = await _userService.CreateUserAsync(newUser);
                _logger.LogInformation($"New user created and logged in: {request.Email}");
                
                return Ok(createdUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login process");
                return StatusCode(500, "An error occurred during login.");
            }
        }

        /// <summary>
        /// Get current user info
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<User>> GetCurrentUser(string userId)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found.");
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user");
                return StatusCode(500, "An error occurred while retrieving user.");
            }
        }
    }

    public class LoginRequest
    {
        public string? Email { get; set; }
        public string? Name { get; set; }
    }
}
