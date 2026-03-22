using System.ComponentModel.DataAnnotations;

namespace DiscretionaryPowers.Application.DTOs.Documents;

public class ConfirmUploadRequest
{
    [Required, Range(1, int.MaxValue)]
    public int SizeBytes { get; set; }
}
