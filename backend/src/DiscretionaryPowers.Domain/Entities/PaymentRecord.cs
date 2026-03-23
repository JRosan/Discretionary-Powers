namespace DiscretionaryPowers.Domain.Entities;

public class PaymentRecord
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Guid? SubscriptionId { get; set; }
    public string RequestId { get; set; } = null!;       // PlaceToPay requestId
    public string Status { get; set; } = "pending";      // pending, approved, rejected, expired
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string? Reference { get; set; }               // Our internal reference
    public string? PlaceToPayStatus { get; set; }        // Raw status from PlaceToPay
    public string? ReceiptNumber { get; set; }
    public string? PaymentMethod { get; set; }           // "visa", "mastercard", etc.
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }

    // Navigation
    public Subscription? Subscription { get; set; }
}
