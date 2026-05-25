def validate_cpf(cpf: str) -> bool:
    """Validate a Brazilian CPF. Accepts formatted (111.444.777-35) or raw digits."""
    digits = "".join(c for c in cpf if c.isdigit())
    if len(digits) != 11:
        return False
    # Reject sequences of all identical digits (e.g. 00000000000)
    if len(set(digits)) == 1:
        return False
    # First check digit
    total = sum(int(digits[i]) * (10 - i) for i in range(9))
    remainder = total % 11
    check1 = 0 if remainder < 2 else 11 - remainder
    if int(digits[9]) != check1:
        return False
    # Second check digit
    total = sum(int(digits[i]) * (11 - i) for i in range(10))
    remainder = total % 11
    check2 = 0 if remainder < 2 else 11 - remainder
    return int(digits[10]) == check2
