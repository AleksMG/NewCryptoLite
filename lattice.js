class LatticeCrypto {
    constructor(dimension = 128) {
        this.dim = dimension;
        this.q = 2053; // Prime modulus
    }

    // Key generation (publicKey = { A, b }, secretKey = s)
    generateKeys() {
        const secretKey = this._generateBinaryVector(this.dim);
        const A = this._generateRandomMatrix(this.dim, this.q);
        const error = this._generateSmallError();

        const b = A.map(row => 
            (row.reduce((sum, val, j) => sum + val * secretKey[j], 0) + error) % this.q
        );

        return { publicKey: { A, b }, secretKey };
    }

    // Encrypt single bit (0 or 1)
    encryptBit(publicKey, bit) {
        const { A, b } = publicKey;
        const r = this._generateBinaryVector(this.dim);

        const u = A[0].map((_, j) =>
            A.reduce((sum, row, i) => sum + row[j] * r[i], 0) % this.q
        );

        const v = (b.reduce((sum, val, i) => sum + val * r[i], 0) + 
                  Math.floor(this.q / 2) * bit) % this.q;

        return { u, v };
    }

    // Decrypt single bit
    decryptBit(secretKey, ciphertext) {
        const { u, v } = ciphertext;
        const inner = u.reduce((sum, val, i) => sum + val * secretKey[i], 0) % this.q;
        return Math.abs(v - inner) < this.q / 4 ? 0 : 1;
    }

    // Helpers
    _generateBinaryVector(size) {
        return Array(size).fill(0).map(() => Math.floor(Math.random() * 2));
    }

    _generateRandomMatrix(rows, cols) {
        return Array(rows).fill(0).map(() => 
            Array(cols).fill(0).map(() => Math.floor(Math.random() * this.q))
        );
    }

    _generateSmallError() {
        return Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    }
}
