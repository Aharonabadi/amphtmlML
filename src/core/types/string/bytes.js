import {devAssert} from '#core/assert';
import * as mode from '#core/mode';

/**
 * Interpret a byte array as a UTF-8 string.
 * See https://developer.mozilla.org/en-US/docs/Web/API/BufferSource for more
 * details on this data-type.
 * @param {BufferSource} bytes
 * @return {string}
 */
export function utf8Decode(bytes) {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes);
  }
  const asciiString = bytesToString(
    new Uint8Array(
      /** @type {{buffer: ArrayBuffer}} */ (bytes).buffer ||
        /** @type {ArrayBuffer} */ (bytes)
    )
  );
  return decodeURIComponent(escape(asciiString));
}

/**
 * Turn a string into UTF-8 bytes.
 * @param {string} string
 * @return {Uint8Array}
 */
export function utf8Encode(string) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(string);
  }
  return stringToBytes(unescape(encodeURIComponent(string)));
}

/**
 * Converts a string which holds 8-bit code points, such as the result of atob,
 * into a Uint8Array with the corresponding bytes.
 * If you have a string of characters, you probably want to be using utf8Encode.
 * @param {string} str
 * @return {Uint8Array}
 */
export function stringToBytes(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    devAssert(charCode <= 255, 'Characters must be in range [0,255]');
    bytes[i] = charCode;
  }
  return bytes;
}

/**
 * Converts a 8-bit bytes array into a string
 * @param {Uint8Array} bytes
 * @return {string}
 */
export function bytesToString(bytes) {
  // Intentionally avoids String.fromCharCode.apply so we don't suffer a
  // stack overflow. #10495, https://jsperf.com/bytesToString-2
  const array = new Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    array[i] = String.fromCharCode(bytes[i]);
  }
  return array.join('');
}

/**
 * Converts a 4-item byte array to an unsigned integer.
 * Assumes bytes are big endian.
 * @param {Uint8Array} bytes
 * @return {number}
 */
export function bytesToUInt32(bytes) {
  if (bytes.length != 4) {
    throw new Error('Received byte array with length != 4');
  }
  const val =
    ((bytes[0] & 0xff) << 24) |
    ((bytes[1] & 0xff) << 16) |
    ((bytes[2] & 0xff) << 8) |
    (bytes[3] & 0xff);
  // Convert to unsigned.
  return val >>> 0;
}

/**
 * Generate a random bytes array with specific length using
 * win.crypto.getRandomValues. Return null if it is not available.
 * @param {Window} win
 * @param {number} length
 * @return {?Uint8Array}
 */
export function getCryptoRandomBytesArray(win, length) {
  let {crypto} = win;

  // Support IE 11
  if (!mode.isEsm()) {
    crypto = crypto || win.msCrypto;
    if (!crypto || !crypto.getRandomValues) {
      return null;
    }
  }

  // Widely available in browsers we support:
  // http://caniuse.com/#search=getRandomValues
  const uint8array = new Uint8Array(length);
  crypto.getRandomValues(uint8array);
  return uint8array;
}
