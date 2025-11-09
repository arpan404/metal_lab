// physics-engine/utils/serialization.ts
/**
 * Serialize experiment state to JSON
 */
export function serializeState(state) {
    return JSON.stringify(state, null, 2);
}
/**
 * Deserialize experiment state from JSON
 */
export function deserializeState(json) {
    return JSON.parse(json);
}
/**
 * Serialize snapshot to compressed format
 */
export function serializeSnapshot(snapshot) {
    return JSON.stringify(snapshot);
}
/**
 * Deserialize snapshot
 */
export function deserializeSnapshot(json) {
    return JSON.parse(json);
}
/**
 * Export to file
 */
export function exportToFile(data, filename, mimeType = 'application/json') {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
/**
 * Import from file
 */
export function importFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                resolve(e.target.result);
            }
            else {
                reject(new Error('Failed to read file'));
            }
        };
        reader.onerror = () => {
            reject(new Error('File reading error'));
        };
        reader.readAsText(file);
    });
}
/**
 * Compress data using simple RLE
 */
export function compressData(data) {
    const compressed = [];
    let count = 1;
    let current = data[0];
    for (let i = 1; i < data.length; i++) {
        if (data[i] === current && count < 255) {
            count++;
        }
        else {
            compressed.push(`${count}:${current}`);
            current = data[i];
            count = 1;
        }
    }
    compressed.push(`${count}:${current}`);
    return compressed.join(',');
}
/**
 * Decompress RLE data
 */
export function decompressData(compressed) {
    const data = [];
    const parts = compressed.split(',');
    for (const part of parts) {
        const [countStr, valueStr] = part.split(':');
        const count = parseInt(countStr, 10);
        const value = parseFloat(valueStr);
        for (let i = 0; i < count; i++) {
            data.push(value);
        }
    }
    return data;
}
/**
 * Convert typed array to base64
 */
export function typedArrayToBase64(array) {
    const bytes = new Uint8Array(array.buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
/**
 * Convert base64 to typed array
 */
export function base64ToTypedArray(base64, ArrayType = Float32Array) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new ArrayType(bytes.buffer);
}
/**
 * Deep clone object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Validate JSON structure
 */
export function validateJSON(json, schema) {
    try {
        const parsed = JSON.parse(json);
        if (schema) {
            // Simple schema validation
            return validateAgainstSchema(parsed, schema);
        }
        return true;
    }
    catch (e) {
        return false;
    }
}
function validateAgainstSchema(obj, schema) {
    // Simple schema validation - can be expanded
    for (const key in schema) {
        if (schema.hasOwnProperty(key)) {
            if (typeof obj[key] !== schema[key]) {
                return false;
            }
        }
    }
    return true;
}
