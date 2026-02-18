using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using backend.Config;
using backend.DTO.Common;
using Microsoft.Extensions.Options;

namespace backend.Services.Common;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;
    private readonly CloudinarySettings _settings;

    public CloudinaryService(IOptions<CloudinarySettings> options)
    {
        _settings = options.Value;
        if (string.IsNullOrWhiteSpace(_settings.CloudName) ||
            string.IsNullOrWhiteSpace(_settings.ApiKey) ||
            string.IsNullOrWhiteSpace(_settings.ApiSecret))
        {
            throw new ArgumentException("Cloudinary settings are not configured.");
        }

        var account = new Account(_settings.CloudName, _settings.ApiKey, _settings.ApiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<CloudinaryUploadResult> UploadAsync(IFormFile file, string? folder = null)
    {
        if (file.Length == 0)
        {
            throw new ArgumentException("File is empty.");
        }

        var targetFolder = string.IsNullOrWhiteSpace(folder) ? _settings.Folder : folder;

        await using var stream = file.OpenReadStream();
        var uploadParams = new RawUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = targetFolder
        };

        var result = await _cloudinary.UploadAsync(uploadParams);
        if (result.StatusCode is not (System.Net.HttpStatusCode.OK or System.Net.HttpStatusCode.Created))
        {
            throw new InvalidOperationException("File upload failed.");
        }

        return new CloudinaryUploadResult(
            result.PublicId,
            result.SecureUrl?.ToString() ?? result.Url?.ToString() ?? string.Empty,
            file.FileName);
    }
}

