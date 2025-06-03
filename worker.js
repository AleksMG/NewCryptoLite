// Background worker for heavy crypto operations
const crypto = new LatticeCrypto();

self.onmessage = function(e) {
    const { action, data, key } = e.data;
    
    switch (action) {
        case 'encrypt':
            const encResult = crypto.encrypt(data, key);
            self.postMessage({ 
                ciphertext: encResult.ciphertext,
                grid: encResult.grid 
            });
            break;
            
        case 'decrypt':
            const decResult = crypto.decrypt(data, key);
            self.postMessage({
                plaintext: decResult.plaintext,
                grid: decResult.grid
            });
            break;
    }
};
