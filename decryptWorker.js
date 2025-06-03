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

// Generate the same path used during encryption
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

// Decrypt the ciphertext using the grid method
function decrypt(ciphertext, key, gridSize) {
    try {
        // Step 1: Reverse the XOR operation using the key stream
        const keyStream = generateKeyStream(key, ciphertext.length);
        let reversedCipher = '';
        
        for (let i = 0; i < ciphertext.length; i++) {
            const charCode = ciphertext.charCodeAt(i) ^ keyStream[i];
            reversedCipher += String.fromCharCode(charCode);
        }
        
        // Step 2: Generate the same path used during encryption
        const path = generatePath(key, gridSize);
        
        // Step 3: Reconstruct the grid
        const grid = [];
        for (let i = 0; i < gridSize; i++) {
            grid.push(new Array(gridSize).fill(''));
        }
        
        // Fill the grid with ciphertext characters following the path
        for (let i = 0; i < Math.min(reversedCipher.length, path.length); i++) {
            const [row, col] = path[i];
            grid[row][col] = reversedCipher.charAt(i);
        }
        
        // Step 4: Read the grid row by row to get the plaintext
        let plaintext = '';
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                plaintext += grid[i][j];
            }
        }
        
        return {
            plaintext: plaintext.trim(), // Trim to remove padding spaces
            grid: grid,
            path: path.slice(0, reversedCipher.length) // Only show path used
        };
    } catch (error) {
        return { error: error.message };
    }
}

// Handle messages from the main thread
self.onmessage = function(e) {
    const { ciphertext, key, gridSize } = e.data;
    const result = decrypt(ciphertext, key, gridSize);
    self.postMessage(result);
};
