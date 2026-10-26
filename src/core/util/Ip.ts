export default class Ip {
    static toInt(ip: string) {
        const parts = ip.split('.');

        if (parts.length !== 4 || parts.some((part) => !/^\d+$/.test(part) || Number(part) > 255)) {
            throw new Error(`Invalid IPv4 address: ${ip}`);
        }

        // Keep the 32-bit value unsigned. Bitwise shifts coerce to signed int32,
        // which can produce a negative value for addresses whose last octet is >= 128.
        // Character-list packets write this as uint32 little-endian.
        return (
            Number.parseInt(parts[3], 10) * 2 ** 24 +
            Number.parseInt(parts[2], 10) * 2 ** 16 +
            Number.parseInt(parts[1], 10) * 2 ** 8 +
            Number.parseInt(parts[0], 10)
        );
    }
}
