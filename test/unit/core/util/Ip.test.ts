import Ip from '@/core/util/Ip';
import { expect } from 'chai';

describe('Ip', () => {
    describe('toInt', () => {
        it('should convert IP address "0.0.0.0" to integer 0', () => {
            const result = Ip.toInt('0.0.0.0');
            expect(result).to.equal(0);
        });

        it('should convert IP address "127.0.0.1" to integer 16777343', () => {
            const result = Ip.toInt('127.0.0.1');
            expect(result).to.equal(16777343);
        });

        it('should convert IP address "192.168.0.1" to integer 16820416', () => {
            const result = Ip.toInt('192.168.0.1');
            expect(result).to.equal(16820416);
        });

        it('should convert IP address "255.255.255.255" to unsigned integer 4294967295', () => {
            const result = Ip.toInt('255.255.255.255');
            expect(result).to.equal(4294967295);
        });

        it('should return an unsigned integer for public IPv4 addresses', () => {
            const result = Ip.toInt('203.0.113.10');
            expect(result).to.equal(175177931);
            expect(result).to.be.at.least(0);
            expect(result).to.be.at.most(0xffffffff);
        });

        it('should handle single-digit IP parts correctly', () => {
            const result = Ip.toInt('1.1.1.1');
            expect(result).to.equal(16843009);
        });

        it('should reject DNS names because the character-list packet requires IPv4', () => {
            expect(() => Ip.toInt('game.example.com')).to.throw('Invalid IPv4 address');
        });

        it('should reject IPv4 octets above 255', () => {
            expect(() => Ip.toInt('192.168.1.256')).to.throw('Invalid IPv4 address');
        });

        it('should reject incomplete IPv4 addresses', () => {
            expect(() => Ip.toInt('192.168.1')).to.throw('Invalid IPv4 address');
        });
    });
});
