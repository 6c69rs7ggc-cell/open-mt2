export default class Ip {
    static toInt(ip: string) {
        const parts = ip.split('.');

        if (parts.length !== 4 || parts.some((part) => !/^\d+$/.test(part) || Number(part) > 255)) {
            throw new Error(`Invalid IPv4 address: ${ip}`);
        }

        let res = 0;

        res += Number.parseInt(parts[3], 10) << 24;
        res += Number.parseInt(parts[2], 10) << 16;
        res += Number.parseInt(parts[1], 10) << 8;
        res += Number.parseInt(parts[0], 10);

        return res;
    }
}
