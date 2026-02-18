namespace backend.DTO.Common;

public record CloudinaryUploadResult(
    string PublicId,
    string Url,
    string FileName
);