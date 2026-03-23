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
    // crown_land
    CrownLand,
    // belongership
    Belongership,
    // immigration
    Immigration,
    // trade_license
    TradeLicense,
    // work_permit
    WorkPermit,
    // customs_exemption
    CustomsExemption,
    // environmental
    Environmental,
    // maritime
    Maritime,
    // other
    Other
}
