namespace DiscretionaryPowers.Domain.Enums;

/// <summary>
/// Maps to PostgreSQL enum "document_classification"
/// </summary>
public enum DocumentClassification
{
    // evidence
    Evidence,
    // legal_opinion
    LegalOpinion,
    // correspondence
    Correspondence,
    // public_notice
    PublicNotice,
    // internal_memo
    InternalMemo
}
