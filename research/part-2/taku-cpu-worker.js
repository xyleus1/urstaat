import { createRaster } from './taku-raster.js?v=studio-3';

let raster;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      const kernel = data.payload.kernel
        ? await WebAssembly.instantiate(data.payload.kernel).catch(() => null)
        : null;
      raster = createRaster(data.payload, kernel);
      self.postMessage({ type: 'ready', meta: raster.meta });
    } else if (data.type === 'pick' || data.type === 'hover') {
      self.postMessage({ type: data.type, tag: raster.pick(data.x, data.y), request: data.request });
    } else if (data.type === 'render') {
      const started = performance.now();
      const { pixels, width, height, submitted, projection } = raster.render(data.pose);
      const output = {
        type: 'frame',
        revision: data.revision,
        width,
        height,
        projection,
        submitted,
        cost: performance.now() - started,
      };
      // Ship the raster directly to the display canvas. Returning this buffer
      // with the next camera request avoids allocating or converting a bitmap.
      const buffer =
        data.buffer?.byteLength === pixels.byteLength ? data.buffer : new ArrayBuffer(pixels.byteLength);
      new Uint32Array(buffer).set(pixels);
      self.postMessage({ ...output, buffer }, [buffer]);
    }
  } catch (error) {
    self.postMessage({ type: 'error', message: error.message });
  }
};
