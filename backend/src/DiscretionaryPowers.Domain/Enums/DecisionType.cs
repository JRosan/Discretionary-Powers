namespace DiscretionaryPowers.Domain.Enums;

/// <summary>
/// Maps to PostgreSQL enum "decision_type"
/// </summary>
public enum DecisionType
{
    // regulatory
    Regulatory,
    // licensing
    Licensing,
    // planning
    Planning,
    // financial
    Financial,
    // appointment
    Appointment,
    // policy
    Policy,
    // enforcement
    Enforcement,
    // other
    Other
}
