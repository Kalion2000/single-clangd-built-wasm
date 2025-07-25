// nzoi_worker.js
// A self-contained Clangd WASM worker that works without importScripts or CORS issues

(async () => {
  const ClangdModule = await import('https://kalion2000.github.io/single-clangd-built-wasm/clangd.js');
  const Clangd = await ClangdModule.default({
    locateFile: f => 'https://kalion2000.github.io/single-clangd-built-wasm/' + f
  });

  const clangd = await Clangd();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let stdinQueue = [];

  clangd.stdin = () => (stdinQueue.length ? stdinQueue.shift() : null);

  self.onmessage = e => {
    if (e.data?.type === 'init') return;
    const msg = JSON.stringify(e.data);
    const header = `Content-Length: ${msg.length}\r\n\r\n`;
    stdinQueue.push(...encoder.encode(header), ...encoder.encode(msg));
  };

  let buffer = '';
  clangd.stdout = c => {
    buffer += decoder.decode(new Uint8Array([c]));
    let sep = '\r\n\r\n';
    while (buffer.includes(sep)) {
      const headerEnd = buffer.indexOf(sep);
      const header = buffer.slice(0, headerEnd);
      const match = header.match(/Content-Length: (\d+)/);
      if (!match) return;
      const length = parseInt(match[1]);
      const bodyStart = headerEnd + sep.length;
      if (buffer.length < bodyStart + length) return;
      const json = buffer.slice(bodyStart, bodyStart + length);
      self.postMessage(JSON.parse(json));
      buffer = buffer.slice(bodyStart + length);
    }
  };

  clangd.callMain([]);
  self.postMessage({ type: 'ready' });
})();
