// Helper function to generate a key stream from the key
function generateKeyStream(key, length) {
    const keyStream = [];
    const keyLength = key.length;
    
    for (let i = 0; i < length; i++) {
        const keyChar = key.charCodeAt(i % keyLength);
        keyStream.push(keyChar);
    }
    
    return keyStream;
}

// Helper function to create a grid from the text
function createGrid(text, size) {
    const grid = [];
    const paddedText = text.padEnd(size * size, ' ');
    
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            const index = i * size + j;
            row.push(paddedText.charAt(index));
        }
        grid.push(row);
    }
    
    return grid;
}

// Generate a path through the grid based on the key
function generatePath(key, size) {
    const path = [];
    const keyLength = key.length;
    
    // Use the key to seed a pseudo-random number generator
    let seed = 0;
    for (let i = 0; i < keyLength; i++) {
        seed += key.charCodeAt(i);
    }
    
    // Simple pseudo-random number generator
    function random() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }
    
    // Start at a position determined by the key
    let x = Math.floor(random() * size);
    let y = Math.floor(random() * size);
    
    // Generate path by moving in key-determined directions
    for (let i = 0; i < size * size; i++) {
        path.push([x, y]);
        
        // Determine next move based on key character
        const keyChar = key.charCodeAt(i % keyLength) % 4;
        
        switch (keyChar) {
            case 0: x = (x + 1) % size; break; // Right
            case 1: x = (x - 1 + size) % size; break; // Left
            case 2: y = (y + 1) % size; break; // Down
            case 3: y = (y - 1 + size) % size; break; // Up
        }
    }
    
    // Remove duplicates while preserving order
    const uniquePath = [];
    const seen = new Set();
    
    for (const coord of path) {
        const key = `${coord[0]},${coord[1]}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniquePath.push(coord);
        }
    }
    
    return uniquePath.slice(0, size * size); // Ensure we don't exceed grid size
}

// Encrypt the text using the grid method
function encrypt(plaintext, key, gridSize) {
    try {
        // Step 1: Create the grid
        const grid = createGrid(plaintext, gridSize);
        
        // Step 2: Generate the path through the grid
        const path = generatePath(key, gridSize);
        
        // Step 3: Extract characters along the path
        let ciphertext = '';
        for (const [row, col] of path) {
            ciphertext += grid[row][col];
        }
        
        // Step 4: Apply key stream XOR (additional layer of security)
        const keyStream = generateKeyStream(key, ciphertext.length);
        let finalCipher = '';
        
        for (let i = 0; i < ciphertext.length; i++) {
            const charCode = ciphertext.charCodeAt(i) ^ keyStream[i];
            finalCipher += String.fromCharCode(charCode);
        }
        
        return {
            ciphertext: finalCipher,
            grid: grid,
            path: path
        };
    } catch (error) {
        return { error: error.message };
    }
}

// Handle messages from the main thread
self.onmessage = function(e) {
    const { plaintext, key, gridSize } = e.data;
    const result = encrypt(plaintext, key, gridSize);
    self.postMessage(result);
};
