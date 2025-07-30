using SymptomixAPI.Models;
using System.Text.Json;
using System.Reflection;

namespace SymptomixAPI.Services
{
    public class JsonDataService : IDataService
    {
        private readonly string _dataPath;
        private readonly JsonSerializerOptions _jsonOptions;

        public JsonDataService()
        {
            _dataPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "data");
            if (!Directory.Exists(_dataPath))
            {
                Directory.CreateDirectory(_dataPath);
            }

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            };
        }

        public async Task<List<T>> LoadDataAsync<T>(string fileName) where T : class
        {
            var filePath = Path.Combine(_dataPath, $"{fileName}.json");
            
            if (!File.Exists(filePath))
            {
                return new List<T>();
            }

            try
            {
                var json = await File.ReadAllTextAsync(filePath);
                var data = JsonSerializer.Deserialize<List<T>>(json, _jsonOptions);
                return data ?? new List<T>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading {fileName}: {ex.Message}");
                return new List<T>();
            }
        }

        public async Task SaveDataAsync<T>(string fileName, List<T> data) where T : class
        {
            var filePath = Path.Combine(_dataPath, $"{fileName}.json");
            
            try
            {
                var json = JsonSerializer.Serialize(data, _jsonOptions);
                await File.WriteAllTextAsync(filePath, json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving {fileName}: {ex.Message}");
                throw;
            }
        }

        public async Task<T?> GetByIdAsync<T>(string fileName, string id) where T : class
        {
            var data = await LoadDataAsync<T>(fileName);
            var idProperty = typeof(T).GetProperty("Id");
            
            if (idProperty == null)
                return null;

            return data.FirstOrDefault(item => 
                idProperty.GetValue(item)?.ToString() == id);
        }

        public async Task<string> AddAsync<T>(string fileName, T item) where T : class
        {
            var data = await LoadDataAsync<T>(fileName);
            var id = Guid.NewGuid().ToString();
            
            // Set the Id property if it exists
            var idProperty = typeof(T).GetProperty("Id");
            idProperty?.SetValue(item, id);

            // Set CreatedAt if it exists
            var createdAtProperty = typeof(T).GetProperty("CreatedAt");
            if (createdAtProperty?.PropertyType == typeof(DateTime))
            {
                createdAtProperty.SetValue(item, DateTime.UtcNow);
            }

            data.Add(item);
            await SaveDataAsync(fileName, data);
            
            return id;
        }

        public async Task<bool> UpdateAsync<T>(string fileName, string id, T item) where T : class
        {
            var data = await LoadDataAsync<T>(fileName);
            var idProperty = typeof(T).GetProperty("Id");
            
            if (idProperty == null)
                return false;

            var index = data.FindIndex(x => 
                idProperty.GetValue(x)?.ToString() == id);
            
            if (index == -1)
                return false;

            // Ensure the Id is preserved
            idProperty.SetValue(item, id);

            // Set UpdatedAt if it exists
            var updatedAtProperty = typeof(T).GetProperty("UpdatedAt");
            if (updatedAtProperty?.PropertyType == typeof(DateTime))
            {
                updatedAtProperty.SetValue(item, DateTime.UtcNow);
            }

            data[index] = item;
            await SaveDataAsync(fileName, data);
            
            return true;
        }

        public async Task<bool> DeleteAsync<T>(string fileName, string id) where T : class
        {
            var data = await LoadDataAsync<T>(fileName);
            var idProperty = typeof(T).GetProperty("Id");
            
            if (idProperty == null)
                return false;

            var itemToRemove = data.FirstOrDefault(x => 
                idProperty.GetValue(x)?.ToString() == id);
            
            if (itemToRemove == null)
                return false;

            data.Remove(itemToRemove);
            await SaveDataAsync(fileName, data);
            
            return true;
        }
    }
}
