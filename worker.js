importScripts('lattice.js');

const crypto = new LatticeCrypto(64);

// Convert text to binary and encrypt each bit
function encryptText(publicKey, text) {
    const bits = [];
    for (let i = 0; i < text.length; i++) {
        const byte = text.charCodeAt(i);
        for (let j = 0; j < 8; j++) {
            bits.push((byte >> (7 - j)) & 1);
        }
    }
    return bits.map(bit => crypto.encryptBit(publicKey, bit));
}

// Decrypt bits and convert back to text
function decryptText(secretKey, ciphertexts) {
    const bits = ciphertexts.map(ct => crypto.decryptBit(secretKey, ct));
    let text = '';
    for (let i = 0; i < bits.length; i += 8) {
        const byte = bits.slice(i, i + 8).reduce((acc, bit, j) => acc | (bit << (7 - j)), 0);
        text += String.fromCharCode(byte);
    }
    return text;
}

self.onmessage = function(e) {
    const { action, message, ciphertext, publicKey, secretKey } = e.data;
    
    try {
        switch (action) {
            case 'generateKeys':
                const keys = crypto.generateKeys();
                self.postMessage({ action, result: keys });
                break;

            case 'encrypt':
                const encrypted = encryptText(publicKey, message);
                self.postMessage({ action, result: encrypted });
                break;

            case 'decrypt':
                const decrypted = decryptText(secretKey, JSON.parse(ciphertext));
                self.postMessage({ action, result: decrypted });
                break;
        }
    } catch (error) {
        self.postMessage({ action, error: error.message });
    }
};
