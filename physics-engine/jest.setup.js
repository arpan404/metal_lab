// Mock WebGL context
class WebGLRenderingContextMock {
  constructor() {
    this.VERTEX_SHADER = 35633;
    this.FRAGMENT_SHADER = 35632;
    this.COMPILE_STATUS = 35713;
    this.LINK_STATUS = 35714;
    this.TEXTURE_2D = 3553;
    this.RGBA = 6408;
    this.UNSIGNED_BYTE = 5121;
    this.COLOR_BUFFER_BIT = 16384;
    this.DEPTH_BUFFER_BIT = 256;
  }

  createShader() { return {}; }
  shaderSource() {}
  compileShader() {}
  getShaderParameter() { return true; }
  createProgram() { return {}; }
  attachShader() {}
  linkProgram() {}
  getProgramParameter() { return true; }
  useProgram() {}
  createBuffer() { return {}; }
  bindBuffer() {}
  bufferData() {}
  createTexture() { return {}; }
  bindTexture() {}
  texImage2D() {}
  texParameteri() {}
  clear() {}
  drawArrays() {}
  drawElements() {}
  enable() {}
  disable() {}
  viewport() {}
  getExtension() { return null; }
  getParameter() { return ''; }
  getContextAttributes() { return { antialias: true }; }
  clearColor() {}
  clearDepth() {}
}

global.WebGLRenderingContext = WebGLRenderingContextMock;
global.WebGL2RenderingContext = WebGLRenderingContextMock;

// Mock WebGPU
global.navigator = global.navigator || {};
global.navigator.gpu = {
  requestAdapter: jest.fn().mockResolvedValue({
    requestDevice: jest.fn().mockResolvedValue({
      createBuffer: jest.fn().mockReturnValue({}),
      createBindGroup: jest.fn().mockReturnValue({}),
      createBindGroupLayout: jest.fn().mockReturnValue({}),
      createPipelineLayout: jest.fn().mockReturnValue({}),
      createComputePipeline: jest.fn().mockReturnValue({}),
      createCommandEncoder: jest.fn().mockReturnValue({
        beginComputePass: jest.fn().mockReturnValue({
          setPipeline: jest.fn(),
          setBindGroup: jest.fn(),
          dispatchWorkgroups: jest.fn(),
          end: jest.fn(),
        }),
        copyBufferToBuffer: jest.fn(),
        finish: jest.fn().mockReturnValue({}),
      }),
      queue: {
        submit: jest.fn(),
        writeBuffer: jest.fn(),
      },
    }),
  }),
};

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return new WebGLRenderingContextMock();
  }
  if (contextType === 'webgpu') {
    return {};
  }
  return null;
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 16);
  return 1;
});

global.cancelAnimationFrame = jest.fn();

// Mock performance.now
global.performance = {
  now: jest.fn(() => Date.now()),
};

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
