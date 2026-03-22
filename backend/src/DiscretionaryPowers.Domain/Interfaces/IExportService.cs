using DiscretionaryPowers.Domain.Entities;

namespace DiscretionaryPowers.Domain.Interfaces;

public interface IExportService
{
    Task<Decision> GetDecisionExportData(Guid decisionId);
    Task<byte[]> ExportAsJson(Guid decisionId);
    Task<byte[]> ExportAsCsv(Guid decisionId);
    Task<byte[]> ExportAsHtml(Guid decisionId);
}
