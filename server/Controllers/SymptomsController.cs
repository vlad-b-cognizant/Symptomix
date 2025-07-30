using Microsoft.AspNetCore.Mvc;
using SymptomixAPI.Models;
using SymptomixAPI.Services;

namespace SymptomixAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SymptomsController : ControllerBase
    {
        private readonly IDiagnosticService _diagnosticService;
        private readonly ILogger<SymptomsController> _logger;

        public SymptomsController(IDiagnosticService diagnosticService, ILogger<SymptomsController> logger)
        {
            _diagnosticService = diagnosticService;
            _logger = logger;
        }

        /// <summary>
        /// Submit symptoms for AI assessment
        /// </summary>
        [HttpPost("assess")]
        public async Task<ActionResult<DiagnosticResult>> AssessSymptoms([FromBody] SymptomAssessmentRequest request)
        {
            try
            {
                if (request?.Answers == null)
                {
                    return BadRequest("Assessment data is required.");
                }

                var result = await _diagnosticService.AssessSymptomsAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing symptom assessment");
                return StatusCode(500, "An error occurred while processing your assessment.");
            }
        }

        /// <summary>
        /// Get a specific assessment by ID
        /// </summary>
        [HttpGet("assessment/{assessmentId}")]
        public async Task<ActionResult<DiagnosticResult>> GetAssessment(string assessmentId)
        {
            try
            {
                var result = await _diagnosticService.GetAssessmentAsync(assessmentId);
                
                if (result == null)
                {
                    return NotFound($"Assessment with ID {assessmentId} not found.");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving assessment {AssessmentId}", assessmentId);
                return StatusCode(500, "An error occurred while retrieving the assessment.");
            }
        }

        /// <summary>
        /// Get user's assessment history
        /// </summary>
        [HttpGet("history/{userId}")]
        public async Task<ActionResult<List<Assessment>>> GetUserHistory(string userId)
        {
            try
            {
                var history = await _diagnosticService.GetUserHistoryAsync(userId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving history for user {UserId}", userId);
                return StatusCode(500, "An error occurred while retrieving user history.");
            }
        }
    }
}
