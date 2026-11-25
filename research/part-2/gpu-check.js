// Check that the driver can present a pixel without blocking the article's UI.
self.postMessage('probing');
try {
  if (typeof OffscreenCanvas !== 'function') {
    self.postMessage(true);
  } else {
    const gl = new OffscreenCanvas(1, 1).getContext('webgl2', { powerPreference: 'high-performance' });
    if (!gl) self.postMessage(true); // Some browsers expose WebGL only on DOM canvases.
    else {
      gl.clearColor(0, 1, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const pixel = new Uint8Array(4);
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      const debug = gl.getExtension('WEBGL_debug_renderer_info');
      const name = gl.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : gl.RENDERER);
      const software = /swiftshader|llvmpipe|softpipe|software rasterizer|microsoft basic render|gdi generic/i.test(name || '');
      self.postMessage(pixel[1] !== 255 ? false : (software ? 'software' : true));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  }
} catch { self.postMessage(false); }
