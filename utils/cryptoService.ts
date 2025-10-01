// Encodes an ArrayBuffer into a base64url string.
export function bufferToBase64Url(buffer: ArrayBuffer): string {
    const str = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Decodes a base64url string into an ArrayBuffer.
export function base64UrlToBuffer(base64Url: string): ArrayBuffer {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const binaryStr = atob(base64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes.buffer;
}
