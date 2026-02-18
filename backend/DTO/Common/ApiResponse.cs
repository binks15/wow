namespace backend.DTO.Common;

public record ApiResponse<T>
{
    public bool Success { get; set; }
    public int Code {get;set;}
    public T? Data { get; set; }
    public string? Error { get; set; } 
}
