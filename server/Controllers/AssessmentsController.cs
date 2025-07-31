using Microsoft.AspNetCore.Mvc;
using SymptomixAPI.Models;
using SymptomixAPI.Services;

namespace SymptomixAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssessmentsController : ControllerBase
    {
        private readonly IDiagnosticService _diagnosticService;
        private readonly IDataService _dataService;
        private readonly ILogger<AssessmentsController> _logger;

        public AssessmentsController(IDiagnosticService diagnosticService, IDataService dataService, ILogger<AssessmentsController> logger)
        {
            _diagnosticService = diagnosticService;
            _dataService = dataService;
            _logger = logger;
        }

        /// <summary>
        /// Analyze symptoms and save assessment for user
        /// </summary>
        [HttpPost("analyze")]
        public async Task<ActionResult<DiagnosticResult>> AnalyzeAndSave([FromBody] SymptomAnalysisRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.UserId))
                {
                    return BadRequest("User ID is required.");
                }

                if (string.IsNullOrEmpty(request.Symptoms))
                {
                    return BadRequest("Symptoms are required.");
                }

                // Create assessment request
                var assessmentRequest = new SymptomAssessmentRequest
                {
                    UserId = request.UserId,
                    Answers = new Dictionary<string, object>
                    {
                        { "symptoms", request.Symptoms },
                        { "timestamp", DateTime.UtcNow.ToString() }
                    },
                    Timestamp = DateTime.UtcNow.ToString()
                };

                // Get diagnostic result
                var diagnosticResult = await _diagnosticService.AssessSymptomsAsync(assessmentRequest);
                
                // Save assessment to history
                var assessment = new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = request.UserId,
                    Symptoms = new List<string> { request.Symptoms },
                    Diagnosis = diagnosticResult.PrimaryDiagnosis,
                    Confidence = diagnosticResult.Confidence,
                    Urgency = diagnosticResult.Urgency,
                    Date = DateTime.UtcNow,
                    Answers = assessmentRequest.Answers
                };

                await _dataService.AddAsync("assessments", assessment);
                
                _logger.LogInformation($"Assessment saved for user {request.UserId}");
                
                return Ok(diagnosticResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing symptoms and saving assessment");
                return StatusCode(500, "An error occurred while analyzing symptoms.");
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
                _logger.LogError(ex, $"Error retrieving history for user {userId}");
                return StatusCode(500, "An error occurred while retrieving assessment history.");
            }
        }

        /// <summary>
        /// Get specific assessment
        /// </summary>
        [HttpGet("{assessmentId}")]
        public async Task<ActionResult<DiagnosticResult>> GetAssessment(string assessmentId)
        {
            try
            {
                var assessment = await _diagnosticService.GetAssessmentAsync(assessmentId);
                if (assessment == null)
                {
                    return NotFound("Assessment not found.");
                }

                return Ok(assessment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving assessment {assessmentId}");
                return StatusCode(500, "An error occurred while retrieving the assessment.");
            }
        }
    }

    public class SymptomAnalysisRequest
    {
        public string? UserId { get; set; }
        public string? Symptoms { get; set; }
    }
}
