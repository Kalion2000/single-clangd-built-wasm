// File: nzoi_worker.js

const CLANGD_BASE = 'https://kalion2000.github.io/single-clangd-built-wasm/';

importScripts(`${CLANGD_BASE}clangd.js`);

self.onmessage = async (e) => {
  const Clangd = await ClangdModule({
    locateFile: (f) => CLANGD_BASE + f,
  });

  const clangd = await Clangd();

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let stdinQueue = [];
  clangd.stdin = () => (stdinQueue.length ? stdinQueue.shift() : null);

  self.onmessage = (e) => {
    const msg = JSON.stringify(e.data);
    const header = `Content-Length: ${msg.length}\r\n\r\n`;
    stdinQueue.push(...encoder.encode(header), ...encoder.encode(msg));
  };

  let buffer = '';
  clangd.stdout = (c) => {
    buffer += decoder.decode(new Uint8Array([c]));
    let idx;
    while ((idx = buffer.indexOf('\r\n\r\n')) !== -1) {
      const len = parseInt(buffer.substring(16, idx), 10);
      const body = buffer.substring(idx + 4, idx + 4 + len);
      if (body.length < len) return;
      postMessage(JSON.parse(body));
      buffer = buffer.substring(idx + 4 + len);
    }
  };

  clangd.callMain([]);
  postMessage({ type: 'ready' });
};
