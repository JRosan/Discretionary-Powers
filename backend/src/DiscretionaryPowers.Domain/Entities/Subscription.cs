namespace DiscretionaryPowers.Domain.Entities;

public class Subscription
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string Plan { get; set; } = null!;           // "starter", "professional", "enterprise"
    public string Status { get; set; } = "active";      // active, past_due, cancelled, trialing
    public decimal MonthlyPrice { get; set; }
    public string Currency { get; set; } = "USD";
    public string? PaymentToken { get; set; }            // PlaceToPay tokenized payment method
    public DateTime CurrentPeriodStart { get; set; }
    public DateTime CurrentPeriodEnd { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Organization Organization { get; set; } = null!;
    public ICollection<PaymentRecord> PaymentRecords { get; set; } = [];
}
