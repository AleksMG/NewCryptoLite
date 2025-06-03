class LatticeCrypto {
    constructor() {
        this.gridSize = 5; // Fixed size for demo
    }

    // Generate a numeric key stream
    generateKeyStream(key, length) {
        let keyStream = [];
        for (let i = 0; i < length; i++) {
            keyStream.push(key.charCodeAt(i % key.length));
        }
        return keyStream;
    }

    // Build a grid from text
    buildGrid(text, key) {
        let grid = [];
        let paddedText = text.padEnd(this.gridSize * this.gridSize, ' ');
        let keyStream = this.generateKeyStream(key, paddedText.length);

        for (let i = 0; i < this.gridSize; i++) {
            let row = [];
            for (let j = 0; j < this.gridSize; j++) {
                const idx = i * this.gridSize + j;
                const charCode = paddedText.charCodeAt(idx) ^ keyStream[idx];
                row.push(String.fromCharCode(charCode));
            }
            grid.push(row);
        }
        return grid;
    }

    // Spiral traversal for encryption
    spiralEncrypt(grid) {
        let result = '';
        let [x, y, dx, dy] = [0, 0, 0, 1];
        
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            result += grid[x][y];
            grid[x][y] = null; // Mark as visited
            
            // Change direction if next cell is invalid
            if (x + dx >= this.gridSize || y + dy >= this.gridSize || 
                x + dx < 0 || y + dy < 0 || grid[x + dx][y + dy] === null) {
                [dx, dy] = [dy, -dx]; // 90° turn
            }
            
            x += dx;
            y += dy;
        }
        return result;
    }

    // Encrypt function
    encrypt(plaintext, key) {
        try {
            const grid = this.buildGrid(plaintext, key);
            const ciphertext = this.spiralEncrypt(grid);
            return {
                ciphertext: ciphertext,
                grid: grid
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    // Decrypt function (reverse process)
    decrypt(ciphertext, key) {
        try {
            // Reverse the spiral traversal
            let grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
            let [x, y, dx, dy] = [0, 0, 0, 1];
            
            for (let i = 0; i < ciphertext.length; i++) {
                grid[x][y] = ciphertext[i];
                
                if (x + dx >= this.gridSize || y + dy >= this.gridSize || 
                    x + dx < 0 || y + dy < 0 || grid[x + dx][y + dy] !== null) {
                    [dx, dy] = [dy, -dx];
                }
                
                x += dx;
                y += dy;
            }
            
            // Rebuild original text
            let plaintext = '';
            let keyStream = this.generateKeyStream(key, this.gridSize * this.gridSize);
            
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    const charCode = grid[i][j].charCodeAt(0) ^ keyStream[i * this.gridSize + j];
                    plaintext += String.fromCharCode(charCode);
                }
            }
            
            return {
                plaintext: plaintext.trim(),
                grid: grid
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// UI Integration
document.addEventListener('DOMContentLoaded', () => {
    const crypto = new LatticeCrypto();
    
    document.getElementById('encryptBtn').addEventListener('click', () => {
        const plaintext = document.getElementById('plaintext').value;
        const key = document.getElementById('key').value;
        
        if (!plaintext || !key) {
            document.getElementById('encryptStatus').textContent = "Error: Enter text and key!";
            document.getElementById('encryptStatus').className = "status error";
            return;
        }
        
        const result = crypto.encrypt(plaintext, key);
        
        if (result.error) {
            document.getElementById('encryptStatus').textContent = "Error: " + result.error;
            document.getElementById('encryptStatus').className = "status error";
        } else {
            document.getElementById('ciphertext').value = result.ciphertext;
            document.getElementById('encryptStatus').textContent = "Encryption successful!";
            document.getElementById('encryptStatus').className = "status success";
            document.getElementById('encryptGrid').textContent = result.grid.map(row => row.join(' ')).join('\n');
        }
    });
    
    document.getElementById('decryptBtn').addEventListener('click', () => {
        const ciphertext = document.getElementById('ciphertext').value;
        const key = document.getElementById('decryptKey').value;
        
        if (!ciphertext || !key) {
            document.getElementById('decryptStatus').textContent = "Error: Enter text and key!";
            document.getElementById('decryptStatus').className = "status error";
            return;
        }
        
        const result = crypto.decrypt(ciphertext, key);
        
        if (result.error) {
            document.getElementById('decryptStatus').textContent = "Error: " + result.error;
            document.getElementById('decryptStatus').className = "status error";
        } else {
            document.getElementById('plaintext').value = result.plaintext;
            document.getElementById('decryptStatus').textContent = "Decryption successful!";
            document.getElementById('decryptStatus').className = "status success";
            document.getElementById('decryptGrid').textContent = result.grid.map(row => row.join(' ')).join('\n');
        }
    });
});
