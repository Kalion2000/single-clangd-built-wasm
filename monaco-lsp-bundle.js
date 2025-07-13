// monaco-lsp-bundle.js
// This file is a browser-safe IIFE bundle that exposes MonacoLanguageClient tools as globals

(async function(global) {
  const [{ MonacoLanguageClient, CloseAction, ErrorAction, createConnection }, jsonrpc] = await Promise.all([
    import('https://unpkg.com/monaco-languageclient@0.13.0/lib/monaco-languageclient.js'),
    import('https://unpkg.com/vscode-jsonrpc@6.0.0/browser.js')
  ]);

  global.MonacoLanguageClient = MonacoLanguageClient;
  global.CloseAction = CloseAction;
  global.ErrorAction = ErrorAction;
  global.createConnection = createConnection;
  global.BrowserMessageReader = jsonrpc.BrowserMessageReader;
  global.BrowserMessageWriter = jsonrpc.BrowserMessageWriter;

})(window);
