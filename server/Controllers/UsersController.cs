using Microsoft.AspNetCore.Mvc;
using SymptomixAPI.Models;
using SymptomixAPI.Services;

namespace SymptomixAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new user
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser([FromBody] User user)
        {
            try
            {
                if (user == null)
                {
                    return BadRequest("User data is required.");
                }

                if (string.IsNullOrEmpty(user.Name))
                {
                    return BadRequest("User name is required.");
                }

                var createdUser = await _userService.CreateUserAsync(user);
                return CreatedAtAction(nameof(GetUser), new { userId = createdUser.Id }, createdUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, "An error occurred while creating the user.");
            }
        }

        /// <summary>
        /// Get user by ID
        /// </summary>
        [HttpGet("{userId}")]
        public async Task<ActionResult<User>> GetUser(string userId)
        {
            try
            {
                var user = await _userService.GetUserAsync(userId);
                
                if (user == null)
                {
                    return NotFound($"User with ID {userId} not found.");
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user {UserId}", userId);
                return StatusCode(500, "An error occurred while retrieving the user.");
            }
        }

        /// <summary>
        /// Update user information
        /// </summary>
        [HttpPut("{userId}")]
        public async Task<ActionResult<User>> UpdateUser(string userId, [FromBody] User user)
        {
            try
            {
                if (user == null)
                {
                    return BadRequest("User data is required.");
                }

                var updatedUser = await _userService.UpdateUserAsync(userId, user);
                return Ok(updatedUser);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", userId);
                return StatusCode(500, "An error occurred while updating the user.");
            }
        }

        /// <summary>
        /// Delete user
        /// </summary>
        [HttpDelete("{userId}")]
        public async Task<ActionResult> DeleteUser(string userId)
        {
            try
            {
                var success = await _userService.DeleteUserAsync(userId);
                
                if (!success)
                {
                    return NotFound($"User with ID {userId} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", userId);
                return StatusCode(500, "An error occurred while deleting the user.");
            }
        }
    }
}
