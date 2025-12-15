import { md5 } from 'js-md5';

class MD5Hash {
  /**
   * MD5哈希计算
   * @param {string} message - 要计算哈希的字符串
   * @returns {string} MD5哈希值（32位小写）
   */
  hash(message) {
    return md5(message);
  }

  /**
   * 计算文件的MD5哈希
   * @param {File|Blob} file - 要计算哈希的文件或Blob对象
   * @returns {Promise<string>} MD5哈希值（32位小写）
   */
  async hashFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const hash = md5(content);
        resolve(hash);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * 计算十六进制字符串的MD5哈希
   * @param {string} hex - 十六进制字符串
   * @returns {string} MD5哈希值（32位小写）
   */
  hashHex(hex) {
    // 将十六进制字符串转换为字节数组
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    
    // 将字节数组转换为字符串
    let message = '';
    for (let i = 0; i < bytes.length; ) {
      const b = bytes[i];
      if (b < 0x80) {
        message += String.fromCharCode(b);
        i++;
      } else if (b < 0xE0) {
        message += String.fromCharCode(((b & 0x1F) << 6) | (bytes[i + 1] & 0x3F));
        i += 2;
      } else if (b < 0xF0) {
        message += String.fromCharCode(((b & 0x0F) << 12) | ((bytes[i + 1] & 0x3F) << 6) | (bytes[i + 2] & 0x3F));
        i += 3;
      } else {
        message += String.fromCharCode(((b & 0x07) << 18) | ((bytes[i + 1] & 0x3F) << 12) | ((bytes[i + 2] & 0x3F) << 6) | (bytes[i + 3] & 0x3F));
        i += 4;
      }
    }
    
    return md5(message);
  }
}

export default MD5Hash;