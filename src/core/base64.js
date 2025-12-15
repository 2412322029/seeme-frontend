class Base64EncoderDecoder {
  constructor() {
    this.base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    this.base64UrlChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  }

  /**
   * Base64编码
   * @param {string} str - 要编码的字符串
   * @param {boolean} urlSafe - 是否使用URL安全的Base64编码
   * @param {string} encoding - 字符编码，默认为utf-8
   * @returns {Promise<string>} Base64编码后的字符串
   */
  async encode(str, urlSafe = false, encoding = 'utf-8') {
    const chars = urlSafe ? this.base64UrlChars : this.base64Chars;
    let result = '';
    let i = 0;
    let pad = 0;

    // 先将字符串转换为指定编码的字节数组
    let bytes;
    if (encoding === 'utf-8') {
      bytes = new TextEncoder().encode(str);
    } else {
      // 对于其他编码，使用异步FileReader API
      bytes = await new Promise((resolve) => {
        const blob = new Blob([str], { type: `text/plain;charset=${encoding}` });
        const reader = new FileReader();
        reader.onload = (e) => {
          const arrayBuffer = e.target.result;
          resolve(new Uint8Array(arrayBuffer));
        };
        reader.readAsArrayBuffer(blob);
      });
    }

    while (i < bytes.length) {
      const a = bytes[i++] || 0;
      const b = bytes[i++] || 0;
      const c = bytes[i++] || 0;

      const b1 = (a >> 2) & 0x3F;
      const b2 = ((a & 0x3) << 4) | ((b >> 4) & 0xF);
      const b3 = ((b & 0xF) << 2) | ((c >> 6) & 0x3);
      const b4 = c & 0x3F;

      pad = bytes.length - i + 1;
      if (pad > 0) {
        result += chars.charAt(b1);
        result += chars.charAt(b2);
        result += pad > 1 ? chars.charAt(b3) : (urlSafe ? '' : '=');
        result += pad > 2 ? chars.charAt(b4) : (urlSafe ? '' : '=');
      } else {
        result += chars.charAt(b1) + chars.charAt(b2) + chars.charAt(b3) + chars.charAt(b4);
      }
    }

    return result;
  }

  /**
   * Base64解码
   * @param {string} str - 要解码的Base64字符串
   * @param {boolean} urlSafe - 是否使用URL安全的Base64解码
   * @param {string} encoding - 字符编码，默认为utf-8
   * @returns {string} 解码后的字符串
   */
  decode(str, urlSafe = false, encoding = 'utf-8') {
    const chars = urlSafe ? this.base64UrlChars : this.base64Chars;
    str = str.replace(/[^A-Za-z0-9+/]/g, '');
    const bytes = new Uint8Array(Math.ceil((str.length * 3) / 4));
    let i = 0;
    let byteIndex = 0;

    while (i < str.length) {
      const b1 = chars.indexOf(str.charAt(i++));
      const b2 = chars.indexOf(str.charAt(i++));
      const b3 = chars.indexOf(str.charAt(i++));
      const b4 = chars.indexOf(str.charAt(i++));

      const a = (b1 << 2) | (b2 >> 4);
      const b = ((b2 & 0xF) << 4) | (b3 >> 2);
      const c = ((b3 & 0x3) << 6) | b4;

      bytes[byteIndex++] = a;
      if (b3 !== -1) bytes[byteIndex++] = b;
      if (b4 !== -1) bytes[byteIndex++] = c;
    }

    // 使用指定编码解码字节数组
    const decoder = new TextDecoder(encoding);
    return decoder.decode(bytes.slice(0, byteIndex));
  }

  /**
   * Base64编码URL
   * @param {string} url - 要编码的URL
   * @param {string} encoding - 字符编码，默认为utf-8
   * @returns {Promise<string>} URL安全的Base64编码字符串
   */
  async encodeUrl(url, encoding = 'utf-8') {
    return await this.encode(url, true, encoding);
  }

  /**
   * Base64解码URL
   * @param {string} str - 要解码的URL安全Base64字符串
   * @param {string} encoding - 字符编码，默认为utf-8
   * @returns {string} 解码后的URL
   */
  decodeUrl(str, encoding = 'utf-8') {
    return this.decode(str, true, encoding);
  }

  /**
   * 编码文件为Base64
   * @param {File|Blob} file - 要编码的文件或Blob对象
   * @returns {Promise<string>} Base64编码后的字符串
   */
  async encodeFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export default Base64EncoderDecoder;