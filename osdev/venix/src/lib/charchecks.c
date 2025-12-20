int is_space(char c) {
    return (c == ' ' || c == '\t' || c == '\n' || c == '\v' || c == '\f' || c == '\r');
}

int is_digit(char c) {
    return (c >= '0' && c <= '9');
}