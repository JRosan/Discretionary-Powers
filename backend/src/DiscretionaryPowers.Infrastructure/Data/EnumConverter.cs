using System.Text.RegularExpressions;

namespace DiscretionaryPowers.Infrastructure.Data;

public static partial class EnumConverter
{
    public static string ToSnakeCase(string value)
    {
        return SnakeCaseRegex().Replace(value, "$1_$2").ToLowerInvariant();
    }

    public static string ToPascalCase(string snakeCase)
    {
        return string.Concat(snakeCase.Split('_').Select(s =>
            char.ToUpperInvariant(s[0]) + s[1..]));
    }

    [GeneratedRegex("([a-z])([A-Z])")]
    private static partial Regex SnakeCaseRegex();
}
