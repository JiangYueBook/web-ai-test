/*!
 * ONNX Runtime Web v1.17.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// common/dist/esm/backend-impl.js
var backends, backendsSortedByPriority, registerBackend, resolveBackend;
var init_backend_impl = __esm({
  "common/dist/esm/backend-impl.js"() {
    "use strict";
    backends = /* @__PURE__ */ new Map();
    backendsSortedByPriority = [];
    registerBackend = (name, backend, priority) => {
      if (backend && typeof backend.init === "function" && typeof backend.createInferenceSessionHandler === "function") {
        const currentBackend = backends.get(name);
        if (currentBackend === void 0) {
          backends.set(name, { backend, priority });
        } else if (currentBackend.priority > priority) {
          return;
        } else if (currentBackend.priority === priority) {
          if (currentBackend.backend !== backend) {
            throw new Error(`cannot register backend "${name}" using priority ${priority}`);
          }
        }
        if (priority >= 0) {
          const i = backendsSortedByPriority.indexOf(name);
          if (i !== -1) {
            backendsSortedByPriority.splice(i, 1);
          }
          for (let i2 = 0; i2 < backendsSortedByPriority.length; i2++) {
            if (backends.get(backendsSortedByPriority[i2]).priority <= priority) {
              backendsSortedByPriority.splice(i2, 0, name);
              return;
            }
          }
          backendsSortedByPriority.push(name);
        }
        return;
      }
      throw new TypeError("not a valid backend");
    };
    resolveBackend = async (backendHints) => {
      const backendNames = backendHints.length === 0 ? backendsSortedByPriority : backendHints;
      const errors = [];
      for (const backendName of backendNames) {
        const backendInfo = backends.get(backendName);
        if (backendInfo) {
          if (backendInfo.initialized) {
            return backendInfo.backend;
          } else if (backendInfo.aborted) {
            continue;
          }
          const isInitializing = !!backendInfo.initPromise;
          try {
            if (!isInitializing) {
              backendInfo.initPromise = backendInfo.backend.init();
            }
            await backendInfo.initPromise;
            backendInfo.initialized = true;
            return backendInfo.backend;
          } catch (e) {
            if (!isInitializing) {
              errors.push({ name: backendName, err: e });
            }
            backendInfo.aborted = true;
          } finally {
            delete backendInfo.initPromise;
          }
        }
      }
      throw new Error(`no available backend found. ERR: ${errors.map((e) => `[${e.name}] ${e.err}`).join(", ")}`);
    };
  }
});

// common/dist/esm/backend.js
var init_backend = __esm({
  "common/dist/esm/backend.js"() {
    "use strict";
    init_backend_impl();
  }
});

// common/dist/esm/version.js
var version;
var init_version = __esm({
  "common/dist/esm/version.js"() {
    "use strict";
    version = "1.17.0";
  }
});

// common/dist/esm/env-impl.js
var logLevelValue, env;
var init_env_impl = __esm({
  "common/dist/esm/env-impl.js"() {
    "use strict";
    init_version();
    logLevelValue = "warning";
    env = {
      wasm: {},
      webgl: {},
      webgpu: {},
      versions: { common: version },
      set logLevel(value) {
        if (value === void 0) {
          return;
        }
        if (typeof value !== "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(value) === -1) {
          throw new Error(`Unsupported logging level: ${value}`);
        }
        logLevelValue = value;
      },
      get logLevel() {
        return logLevelValue;
      }
    };
    Object.defineProperty(env, "logLevel", { enumerable: true });
  }
});

// common/dist/esm/env.js
var env2;
var init_env = __esm({
  "common/dist/esm/env.js"() {
    "use strict";
    init_env_impl();
    env2 = env;
  }
});

// common/dist/esm/tensor-conversion-impl.js
var tensorToDataURL, tensorToImageData;
var init_tensor_conversion_impl = __esm({
  "common/dist/esm/tensor-conversion-impl.js"() {
    "use strict";
    tensorToDataURL = (tensor, options) => {
      const canvas = document.createElement("canvas");
      canvas.width = tensor.dims[3];
      canvas.height = tensor.dims[2];
      const pixels2DContext = canvas.getContext("2d");
      if (pixels2DContext != null) {
        let width;
        let height;
        if (options?.tensorLayout !== void 0 && options.tensorLayout === "NHWC") {
          width = tensor.dims[2];
          height = tensor.dims[3];
        } else {
          width = tensor.dims[3];
          height = tensor.dims[2];
        }
        const inputformat = options?.format !== void 0 ? options.format : "RGB";
        const norm = options?.norm;
        let normMean;
        let normBias;
        if (norm === void 0 || norm.mean === void 0) {
          normMean = [255, 255, 255, 255];
        } else {
          if (typeof norm.mean === "number") {
            normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
          } else {
            normMean = [norm.mean[0], norm.mean[1], norm.mean[2], 0];
            if (norm.mean[3] !== void 0) {
              normMean[3] = norm.mean[3];
            }
          }
        }
        if (norm === void 0 || norm.bias === void 0) {
          normBias = [0, 0, 0, 0];
        } else {
          if (typeof norm.bias === "number") {
            normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
          } else {
            normBias = [norm.bias[0], norm.bias[1], norm.bias[2], 0];
            if (norm.bias[3] !== void 0) {
              normBias[3] = norm.bias[3];
            }
          }
        }
        const stride = height * width;
        let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
        if (inputformat === "RGBA") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
          aTensorPointer = stride * 3;
        } else if (inputformat === "RGB") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
        } else if (inputformat === "RBG") {
          rTensorPointer = 0;
          bTensorPointer = stride;
          gTensorPointer = stride * 2;
        }
        for (let i = 0; i < height; i++) {
          for (let j = 0; j < width; j++) {
            const R = (tensor.data[rTensorPointer++] - normBias[0]) * normMean[0];
            const G = (tensor.data[gTensorPointer++] - normBias[1]) * normMean[1];
            const B = (tensor.data[bTensorPointer++] - normBias[2]) * normMean[2];
            const A = aTensorPointer === -1 ? 255 : (tensor.data[aTensorPointer++] - normBias[3]) * normMean[3];
            pixels2DContext.fillStyle = "rgba(" + R + "," + G + "," + B + "," + A + ")";
            pixels2DContext.fillRect(j, i, 1, 1);
          }
        }
        return canvas.toDataURL();
      } else {
        throw new Error("Can not access image data");
      }
    };
    tensorToImageData = (tensor, options) => {
      const pixels2DContext = document.createElement("canvas").getContext("2d");
      let image;
      if (pixels2DContext != null) {
        let width;
        let height;
        let channels;
        if (options?.tensorLayout !== void 0 && options.tensorLayout === "NHWC") {
          width = tensor.dims[2];
          height = tensor.dims[1];
          channels = tensor.dims[3];
        } else {
          width = tensor.dims[3];
          height = tensor.dims[2];
          channels = tensor.dims[1];
        }
        const inputformat = options !== void 0 ? options.format !== void 0 ? options.format : "RGB" : "RGB";
        const norm = options?.norm;
        let normMean;
        let normBias;
        if (norm === void 0 || norm.mean === void 0) {
          normMean = [255, 255, 255, 255];
        } else {
          if (typeof norm.mean === "number") {
            normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
          } else {
            normMean = [norm.mean[0], norm.mean[1], norm.mean[2], 255];
            if (norm.mean[3] !== void 0) {
              normMean[3] = norm.mean[3];
            }
          }
        }
        if (norm === void 0 || norm.bias === void 0) {
          normBias = [0, 0, 0, 0];
        } else {
          if (typeof norm.bias === "number") {
            normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
          } else {
            normBias = [norm.bias[0], norm.bias[1], norm.bias[2], 0];
            if (norm.bias[3] !== void 0) {
              normBias[3] = norm.bias[3];
            }
          }
        }
        const stride = height * width;
        if (options !== void 0) {
          if (options.format !== void 0 && (channels === 4 && options.format !== "RGBA") || channels === 3 && (options.format !== "RGB" && options.format !== "BGR")) {
            throw new Error("Tensor format doesn't match input tensor dims");
          }
        }
        const step = 4;
        let rImagePointer = 0, gImagePointer = 1, bImagePointer = 2, aImagePointer = 3;
        let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
        if (inputformat === "RGBA") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
          aTensorPointer = stride * 3;
        } else if (inputformat === "RGB") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
        } else if (inputformat === "RBG") {
          rTensorPointer = 0;
          bTensorPointer = stride;
          gTensorPointer = stride * 2;
        }
        image = pixels2DContext.createImageData(width, height);
        for (let i = 0; i < height * width; rImagePointer += step, gImagePointer += step, bImagePointer += step, aImagePointer += step, i++) {
          image.data[rImagePointer] = (tensor.data[rTensorPointer++] - normBias[0]) * normMean[0];
          image.data[gImagePointer] = (tensor.data[gTensorPointer++] - normBias[1]) * normMean[1];
          image.data[bImagePointer] = (tensor.data[bTensorPointer++] - normBias[2]) * normMean[2];
          image.data[aImagePointer] = aTensorPointer === -1 ? 255 : (tensor.data[aTensorPointer++] - normBias[3]) * normMean[3];
        }
      } else {
        throw new Error("Can not access image data");
      }
      return image;
    };
  }
});

// common/dist/esm/tensor-factory-impl.js
var bufferToTensor, tensorFromImage, tensorFromTexture, tensorFromGpuBuffer, tensorFromPinnedBuffer;
var init_tensor_factory_impl = __esm({
  "common/dist/esm/tensor-factory-impl.js"() {
    "use strict";
    init_tensor_impl();
    bufferToTensor = (buffer, options) => {
      if (buffer === void 0) {
        throw new Error("Image buffer must be defined");
      }
      if (options.height === void 0 || options.width === void 0) {
        throw new Error("Image height and width must be defined");
      }
      if (options.tensorLayout === "NHWC") {
        throw new Error("NHWC Tensor layout is not supported yet");
      }
      const { height, width } = options;
      const norm = options.norm ?? { mean: 255, bias: 0 };
      let normMean;
      let normBias;
      if (typeof norm.mean === "number") {
        normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
      } else {
        normMean = [norm.mean[0], norm.mean[1], norm.mean[2], norm.mean[3] ?? 255];
      }
      if (typeof norm.bias === "number") {
        normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
      } else {
        normBias = [norm.bias[0], norm.bias[1], norm.bias[2], norm.bias[3] ?? 0];
      }
      const inputformat = options.format !== void 0 ? options.format : "RGBA";
      const outputformat = options.tensorFormat !== void 0 ? options.tensorFormat !== void 0 ? options.tensorFormat : "RGB" : "RGB";
      const stride = height * width;
      const float32Data = outputformat === "RGBA" ? new Float32Array(stride * 4) : new Float32Array(stride * 3);
      let step = 4, rImagePointer = 0, gImagePointer = 1, bImagePointer = 2, aImagePointer = 3;
      let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
      if (inputformat === "RGB") {
        step = 3;
        rImagePointer = 0;
        gImagePointer = 1;
        bImagePointer = 2;
        aImagePointer = -1;
      }
      if (outputformat === "RGBA") {
        aTensorPointer = stride * 3;
      } else if (outputformat === "RBG") {
        rTensorPointer = 0;
        bTensorPointer = stride;
        gTensorPointer = stride * 2;
      } else if (outputformat === "BGR") {
        bTensorPointer = 0;
        gTensorPointer = stride;
        rTensorPointer = stride * 2;
      }
      for (let i = 0; i < stride; i++, rImagePointer += step, bImagePointer += step, gImagePointer += step, aImagePointer += step) {
        float32Data[rTensorPointer++] = (buffer[rImagePointer] + normBias[0]) / normMean[0];
        float32Data[gTensorPointer++] = (buffer[gImagePointer] + normBias[1]) / normMean[1];
        float32Data[bTensorPointer++] = (buffer[bImagePointer] + normBias[2]) / normMean[2];
        if (aTensorPointer !== -1 && aImagePointer !== -1) {
          float32Data[aTensorPointer++] = (buffer[aImagePointer] + normBias[3]) / normMean[3];
        }
      }
      const outputTensor = outputformat === "RGBA" ? new Tensor("float32", float32Data, [1, 4, height, width]) : new Tensor("float32", float32Data, [1, 3, height, width]);
      return outputTensor;
    };
    tensorFromImage = async (image, options) => {
      const isHTMLImageEle = typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement;
      const isImageDataEle = typeof ImageData !== "undefined" && image instanceof ImageData;
      const isImageBitmap = typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap;
      const isString = typeof image === "string";
      let data;
      let bufferToTensorOptions = options ?? {};
      if (isHTMLImageEle) {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = canvas.getContext("2d");
        if (pixels2DContext != null) {
          let height = image.height;
          let width = image.width;
          if (options !== void 0 && options.resizedHeight !== void 0 && options.resizedWidth !== void 0) {
            height = options.resizedHeight;
            width = options.resizedWidth;
          }
          if (options !== void 0) {
            bufferToTensorOptions = options;
            if (options.tensorFormat !== void 0) {
              throw new Error("Image input config format must be RGBA for HTMLImageElement");
            } else {
              bufferToTensorOptions.tensorFormat = "RGBA";
            }
            bufferToTensorOptions.height = height;
            bufferToTensorOptions.width = width;
          } else {
            bufferToTensorOptions.tensorFormat = "RGBA";
            bufferToTensorOptions.height = height;
            bufferToTensorOptions.width = width;
          }
          pixels2DContext.drawImage(image, 0, 0);
          data = pixels2DContext.getImageData(0, 0, width, height).data;
        } else {
          throw new Error("Can not access image data");
        }
      } else if (isImageDataEle) {
        let height;
        let width;
        if (options !== void 0 && options.resizedWidth !== void 0 && options.resizedHeight !== void 0) {
          height = options.resizedHeight;
          width = options.resizedWidth;
        } else {
          height = image.height;
          width = image.width;
        }
        if (options !== void 0) {
          bufferToTensorOptions = options;
        }
        bufferToTensorOptions.format = "RGBA";
        bufferToTensorOptions.height = height;
        bufferToTensorOptions.width = width;
        if (options !== void 0) {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = width;
          tempCanvas.height = height;
          const pixels2DContext = tempCanvas.getContext("2d");
          if (pixels2DContext != null) {
            pixels2DContext.putImageData(image, 0, 0);
            data = pixels2DContext.getImageData(0, 0, width, height).data;
          } else {
            throw new Error("Can not access image data");
          }
        } else {
          data = image.data;
        }
      } else if (isImageBitmap) {
        if (options === void 0) {
          throw new Error("Please provide image config with format for Imagebitmap");
        }
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = canvas.getContext("2d");
        if (pixels2DContext != null) {
          const height = image.height;
          const width = image.width;
          pixels2DContext.drawImage(image, 0, 0, width, height);
          data = pixels2DContext.getImageData(0, 0, width, height).data;
          bufferToTensorOptions.height = height;
          bufferToTensorOptions.width = width;
          return bufferToTensor(data, bufferToTensorOptions);
        } else {
          throw new Error("Can not access image data");
        }
      } else if (isString) {
        return new Promise((resolve, reject) => {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!image || !context) {
            return reject();
          }
          const newImage = new Image();
          newImage.crossOrigin = "Anonymous";
          newImage.src = image;
          newImage.onload = () => {
            canvas.width = newImage.width;
            canvas.height = newImage.height;
            context.drawImage(newImage, 0, 0, canvas.width, canvas.height);
            const img = context.getImageData(0, 0, canvas.width, canvas.height);
            bufferToTensorOptions.height = canvas.height;
            bufferToTensorOptions.width = canvas.width;
            resolve(bufferToTensor(img.data, bufferToTensorOptions));
          };
        });
      } else {
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }
      if (data !== void 0) {
        return bufferToTensor(data, bufferToTensorOptions);
      } else {
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }
    };
    tensorFromTexture = (texture, options) => {
      const { width, height, download, dispose } = options;
      const dims = [1, height, width, 4];
      return new Tensor({ location: "texture", type: "float32", texture, dims, download, dispose });
    };
    tensorFromGpuBuffer = (gpuBuffer, options) => {
      const { dataType, dims, download, dispose } = options;
      return new Tensor({ location: "gpu-buffer", type: dataType ?? "float32", gpuBuffer, dims, download, dispose });
    };
    tensorFromPinnedBuffer = (type, buffer, dims) => new Tensor({ location: "cpu-pinned", type, data: buffer, dims: dims ?? [buffer.length] });
  }
});

// common/dist/esm/tensor-impl-type-mapping.js
var NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP, NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP, isBigIntChecked, checkBigInt;
var init_tensor_impl_type_mapping = __esm({
  "common/dist/esm/tensor-impl-type-mapping.js"() {
    "use strict";
    NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP = /* @__PURE__ */ new Map([
      ["float32", Float32Array],
      ["uint8", Uint8Array],
      ["int8", Int8Array],
      ["uint16", Uint16Array],
      ["float16", Uint16Array],
      ["int16", Int16Array],
      ["int32", Int32Array],
      ["bool", Uint8Array],
      ["float64", Float64Array],
      ["uint32", Uint32Array]
    ]);
    NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP = /* @__PURE__ */ new Map([
      [Float32Array, "float32"],
      [Uint8Array, "uint8"],
      [Int8Array, "int8"],
      [Uint16Array, "uint16"],
      [Int16Array, "int16"],
      [Int32Array, "int32"],
      [Float64Array, "float64"],
      [Uint32Array, "uint32"]
    ]);
    isBigIntChecked = false;
    checkBigInt = () => {
      if (!isBigIntChecked) {
        isBigIntChecked = true;
        const isBigInt64ArrayAvailable = typeof BigInt64Array !== "undefined" && typeof BigInt64Array.from === "function";
        const isBigUint64ArrayAvailable = typeof BigUint64Array !== "undefined" && typeof BigUint64Array.from === "function";
        if (isBigInt64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("int64", BigInt64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigInt64Array, "int64");
        }
        if (isBigUint64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("uint64", BigUint64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigUint64Array, "uint64");
        }
      }
    };
  }
});

// common/dist/esm/tensor-utils-impl.js
var calculateSize, tensorReshape;
var init_tensor_utils_impl = __esm({
  "common/dist/esm/tensor-utils-impl.js"() {
    "use strict";
    init_tensor_impl();
    calculateSize = (dims) => {
      let size = 1;
      for (let i = 0; i < dims.length; i++) {
        const dim = dims[i];
        if (typeof dim !== "number" || !Number.isSafeInteger(dim)) {
          throw new TypeError(`dims[${i}] must be an integer, got: ${dim}`);
        }
        if (dim < 0) {
          throw new RangeError(`dims[${i}] must be a non-negative integer, got: ${dim}`);
        }
        size *= dim;
      }
      return size;
    };
    tensorReshape = (tensor, dims) => {
      switch (tensor.location) {
        case "cpu":
          return new Tensor(tensor.type, tensor.data, dims);
        case "cpu-pinned":
          return new Tensor({
            location: "cpu-pinned",
            data: tensor.data,
            type: tensor.type,
            dims
          });
        case "texture":
          return new Tensor({
            location: "texture",
            texture: tensor.texture,
            type: tensor.type,
            dims
          });
        case "gpu-buffer":
          return new Tensor({
            location: "gpu-buffer",
            gpuBuffer: tensor.gpuBuffer,
            type: tensor.type,
            dims
          });
        default:
          throw new Error(`tensorReshape: tensor location ${tensor.location} is not supported`);
      }
    };
  }
});

// common/dist/esm/tensor-impl.js
var Tensor;
var init_tensor_impl = __esm({
  "common/dist/esm/tensor-impl.js"() {
    "use strict";
    init_tensor_conversion_impl();
    init_tensor_factory_impl();
    init_tensor_impl_type_mapping();
    init_tensor_utils_impl();
    Tensor = class {
      /**
       * implementation.
       */
      constructor(arg0, arg1, arg2) {
        checkBigInt();
        let type;
        let dims;
        if (typeof arg0 === "object" && "location" in arg0) {
          this.dataLocation = arg0.location;
          type = arg0.type;
          dims = arg0.dims;
          switch (arg0.location) {
            case "cpu-pinned": {
              const expectedTypedArrayConstructor = NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(type);
              if (!expectedTypedArrayConstructor) {
                throw new TypeError(`unsupported type "${type}" to create tensor from pinned buffer`);
              }
              if (!(arg0.data instanceof expectedTypedArrayConstructor)) {
                throw new TypeError(`buffer should be of type ${expectedTypedArrayConstructor.name}`);
              }
              this.cpuData = arg0.data;
              break;
            }
            case "texture": {
              if (type !== "float32") {
                throw new TypeError(`unsupported type "${type}" to create tensor from texture`);
              }
              this.gpuTextureData = arg0.texture;
              this.downloader = arg0.download;
              this.disposer = arg0.dispose;
              break;
            }
            case "gpu-buffer": {
              if (type !== "float32" && type !== "float16" && type !== "int32" && type !== "int64" && type !== "uint32" && type !== "bool") {
                throw new TypeError(`unsupported type "${type}" to create tensor from gpu buffer`);
              }
              this.gpuBufferData = arg0.gpuBuffer;
              this.downloader = arg0.download;
              this.disposer = arg0.dispose;
              break;
            }
            default:
              throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
          }
        } else {
          let data;
          let maybeDims;
          if (typeof arg0 === "string") {
            type = arg0;
            maybeDims = arg2;
            if (arg0 === "string") {
              if (!Array.isArray(arg1)) {
                throw new TypeError("A string tensor's data must be a string array.");
              }
              data = arg1;
            } else {
              const typedArrayConstructor = NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(arg0);
              if (typedArrayConstructor === void 0) {
                throw new TypeError(`Unsupported tensor type: ${arg0}.`);
              }
              if (Array.isArray(arg1)) {
                if (arg0 === "float16") {
                  throw new TypeError("Creating a float16 tensor from number array is not supported. Please use Uint16Array as data.");
                } else if (arg0 === "uint64" || arg0 === "int64") {
                  data = typedArrayConstructor.from(arg1, BigInt);
                } else {
                  data = typedArrayConstructor.from(arg1);
                }
              } else if (arg1 instanceof typedArrayConstructor) {
                data = arg1;
              } else {
                throw new TypeError(`A ${type} tensor's data must be type of ${typedArrayConstructor}`);
              }
            }
          } else {
            maybeDims = arg1;
            if (Array.isArray(arg0)) {
              if (arg0.length === 0) {
                throw new TypeError("Tensor type cannot be inferred from an empty array.");
              }
              const firstElementType = typeof arg0[0];
              if (firstElementType === "string") {
                type = "string";
                data = arg0;
              } else if (firstElementType === "boolean") {
                type = "bool";
                data = Uint8Array.from(arg0);
              } else {
                throw new TypeError(`Invalid element type of data array: ${firstElementType}.`);
              }
            } else {
              const mappedType = NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.get(arg0.constructor);
              if (mappedType === void 0) {
                throw new TypeError(`Unsupported type for tensor data: ${arg0.constructor}.`);
              }
              type = mappedType;
              data = arg0;
            }
          }
          if (maybeDims === void 0) {
            maybeDims = [data.length];
          } else if (!Array.isArray(maybeDims)) {
            throw new TypeError("A tensor's dims must be a number array");
          }
          dims = maybeDims;
          this.cpuData = data;
          this.dataLocation = "cpu";
        }
        const size = calculateSize(dims);
        if (this.cpuData && size !== this.cpuData.length) {
          throw new Error(`Tensor's size(${size}) does not match data length(${this.cpuData.length}).`);
        }
        this.type = type;
        this.dims = dims;
        this.size = size;
      }
      // #endregion
      // #region factory
      static async fromImage(image, options) {
        return tensorFromImage(image, options);
      }
      static fromTexture(texture, options) {
        return tensorFromTexture(texture, options);
      }
      static fromGpuBuffer(gpuBuffer, options) {
        return tensorFromGpuBuffer(gpuBuffer, options);
      }
      static fromPinnedBuffer(type, buffer, dims) {
        return tensorFromPinnedBuffer(type, buffer, dims);
      }
      // #endregion
      // #region conversions
      toDataURL(options) {
        return tensorToDataURL(this, options);
      }
      toImageData(options) {
        return tensorToImageData(this, options);
      }
      // #endregion
      // #region properties
      get data() {
        this.ensureValid();
        if (!this.cpuData) {
          throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
        }
        return this.cpuData;
      }
      get location() {
        return this.dataLocation;
      }
      get texture() {
        this.ensureValid();
        if (!this.gpuTextureData) {
          throw new Error("The data is not stored as a WebGL texture.");
        }
        return this.gpuTextureData;
      }
      get gpuBuffer() {
        this.ensureValid();
        if (!this.gpuBufferData) {
          throw new Error("The data is not stored as a WebGPU buffer.");
        }
        return this.gpuBufferData;
      }
      // #endregion
      // #region methods
      async getData(releaseData) {
        this.ensureValid();
        switch (this.dataLocation) {
          case "cpu":
          case "cpu-pinned":
            return this.data;
          case "texture":
          case "gpu-buffer": {
            if (!this.downloader) {
              throw new Error("The current tensor is not created with a specified data downloader.");
            }
            if (this.isDownloading) {
              throw new Error("The current tensor is being downloaded.");
            }
            try {
              this.isDownloading = true;
              const data = await this.downloader();
              this.downloader = void 0;
              this.dataLocation = "cpu";
              this.cpuData = data;
              if (releaseData && this.disposer) {
                this.disposer();
                this.disposer = void 0;
              }
              return data;
            } finally {
              this.isDownloading = false;
            }
          }
          default:
            throw new Error(`cannot get data from location: ${this.dataLocation}`);
        }
      }
      dispose() {
        if (this.isDownloading) {
          throw new Error("The current tensor is being downloaded.");
        }
        if (this.disposer) {
          this.disposer();
          this.disposer = void 0;
        }
        this.cpuData = void 0;
        this.gpuTextureData = void 0;
        this.gpuBufferData = void 0;
        this.downloader = void 0;
        this.isDownloading = void 0;
        this.dataLocation = "none";
      }
      // #endregion
      // #region tensor utilities
      ensureValid() {
        if (this.dataLocation === "none") {
          throw new Error("The tensor is disposed.");
        }
      }
      reshape(dims) {
        this.ensureValid();
        if (this.downloader || this.disposer) {
          throw new Error("Cannot reshape a tensor that owns GPU resource.");
        }
        return tensorReshape(this, dims);
      }
    };
  }
});

// common/dist/esm/tensor.js
var Tensor2;
var init_tensor = __esm({
  "common/dist/esm/tensor.js"() {
    "use strict";
    init_tensor_impl();
    Tensor2 = Tensor;
  }
});

// common/dist/esm/inference-session-impl.js
var InferenceSession;
var init_inference_session_impl = __esm({
  "common/dist/esm/inference-session-impl.js"() {
    "use strict";
    init_backend_impl();
    init_tensor();
    InferenceSession = class _InferenceSession {
      constructor(handler) {
        this.handler = handler;
      }
      async run(feeds, arg1, arg2) {
        const fetches = {};
        let options = {};
        if (typeof feeds !== "object" || feeds === null || feeds instanceof Tensor2 || Array.isArray(feeds)) {
          throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
        }
        let isFetchesEmpty = true;
        if (typeof arg1 === "object") {
          if (arg1 === null) {
            throw new TypeError("Unexpected argument[1]: cannot be null.");
          }
          if (arg1 instanceof Tensor2) {
            throw new TypeError("'fetches' cannot be a Tensor");
          }
          if (Array.isArray(arg1)) {
            if (arg1.length === 0) {
              throw new TypeError("'fetches' cannot be an empty array.");
            }
            isFetchesEmpty = false;
            for (const name of arg1) {
              if (typeof name !== "string") {
                throw new TypeError("'fetches' must be a string array or an object.");
              }
              if (this.outputNames.indexOf(name) === -1) {
                throw new RangeError(`'fetches' contains invalid output name: ${name}.`);
              }
              fetches[name] = null;
            }
            if (typeof arg2 === "object" && arg2 !== null) {
              options = arg2;
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'options' must be an object.");
            }
          } else {
            let isFetches = false;
            const arg1Keys = Object.getOwnPropertyNames(arg1);
            for (const name of this.outputNames) {
              if (arg1Keys.indexOf(name) !== -1) {
                const v = arg1[name];
                if (v === null || v instanceof Tensor2) {
                  isFetches = true;
                  isFetchesEmpty = false;
                  fetches[name] = v;
                }
              }
            }
            if (isFetches) {
              if (typeof arg2 === "object" && arg2 !== null) {
                options = arg2;
              } else if (typeof arg2 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else {
              options = arg1;
            }
          }
        } else if (typeof arg1 !== "undefined") {
          throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
        }
        for (const name of this.inputNames) {
          if (typeof feeds[name] === "undefined") {
            throw new Error(`input '${name}' is missing in 'feeds'.`);
          }
        }
        if (isFetchesEmpty) {
          for (const name of this.outputNames) {
            fetches[name] = null;
          }
        }
        const results = await this.handler.run(feeds, fetches, options);
        const returnValue = {};
        for (const key in results) {
          if (Object.hasOwnProperty.call(results, key)) {
            const result = results[key];
            if (result instanceof Tensor2) {
              returnValue[key] = result;
            } else {
              returnValue[key] = new Tensor2(result.type, result.data, result.dims);
            }
          }
        }
        return returnValue;
      }
      async release() {
        return this.handler.dispose();
      }
      static async create(arg0, arg1, arg2, arg3) {
        let filePathOrUint8Array;
        let options = {};
        if (typeof arg0 === "string") {
          filePathOrUint8Array = arg0;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
        } else if (arg0 instanceof Uint8Array) {
          filePathOrUint8Array = arg0;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
        } else if (arg0 instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && arg0 instanceof SharedArrayBuffer) {
          const buffer = arg0;
          let byteOffset = 0;
          let byteLength = arg0.byteLength;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 === "number") {
            byteOffset = arg1;
            if (!Number.isSafeInteger(byteOffset)) {
              throw new RangeError("'byteOffset' must be an integer.");
            }
            if (byteOffset < 0 || byteOffset >= buffer.byteLength) {
              throw new RangeError(`'byteOffset' is out of range [0, ${buffer.byteLength}).`);
            }
            byteLength = arg0.byteLength - byteOffset;
            if (typeof arg2 === "number") {
              byteLength = arg2;
              if (!Number.isSafeInteger(byteLength)) {
                throw new RangeError("'byteLength' must be an integer.");
              }
              if (byteLength <= 0 || byteOffset + byteLength > buffer.byteLength) {
                throw new RangeError(`'byteLength' is out of range (0, ${buffer.byteLength - byteOffset}].`);
              }
              if (typeof arg3 === "object" && arg3 !== null) {
                options = arg3;
              } else if (typeof arg3 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'byteLength' must be a number.");
            }
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
          filePathOrUint8Array = new Uint8Array(buffer, byteOffset, byteLength);
        } else {
          throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
        }
        const eps = options.executionProviders || [];
        const backendHints = eps.map((i) => typeof i === "string" ? i : i.name);
        const backend = await resolveBackend(backendHints);
        const handler = await backend.createInferenceSessionHandler(filePathOrUint8Array, options);
        return new _InferenceSession(handler);
      }
      startProfiling() {
        this.handler.startProfiling();
      }
      endProfiling() {
        this.handler.endProfiling();
      }
      get inputNames() {
        return this.handler.inputNames;
      }
      get outputNames() {
        return this.handler.outputNames;
      }
    };
  }
});

// common/dist/esm/inference-session.js
var InferenceSession2;
var init_inference_session = __esm({
  "common/dist/esm/inference-session.js"() {
    "use strict";
    init_inference_session_impl();
    InferenceSession2 = InferenceSession;
  }
});

// common/dist/esm/onnx-value.js
var init_onnx_value = __esm({
  "common/dist/esm/onnx-value.js"() {
    "use strict";
  }
});

// common/dist/esm/training-session-impl.js
var noBackendErrMsg, TrainingSession;
var init_training_session_impl = __esm({
  "common/dist/esm/training-session-impl.js"() {
    "use strict";
    init_backend_impl();
    init_tensor();
    noBackendErrMsg = "Training backend could not be resolved. Make sure you're using the correct configuration & WebAssembly files.";
    TrainingSession = class _TrainingSession {
      constructor(handler) {
        this.handler = handler;
      }
      get inputNames() {
        return this.handler.inputNames;
      }
      get outputNames() {
        return this.handler.outputNames;
      }
      static async create(trainingOptions, sessionOptions) {
        const evalModel = trainingOptions.evalModel || "";
        const optimizerModel = trainingOptions.optimizerModel || "";
        const options = sessionOptions || {};
        const eps = options.executionProviders || [];
        const backendHints = eps.map((i) => typeof i === "string" ? i : i.name);
        const backend = await resolveBackend(backendHints);
        if (backend.createTrainingSessionHandler) {
          const handler = await backend.createTrainingSessionHandler(trainingOptions.checkpointState, trainingOptions.trainModel, evalModel, optimizerModel, options);
          return new _TrainingSession(handler);
        } else {
          throw new Error(noBackendErrMsg);
        }
      }
      /**
       * Helper function for runTrainStep and future runStep methods that handles the type-narrowing conversion from
       * the given parameters to SessionHandler.FetchesType and RunOptions.
       *
       * @param feeds the required input
       * @param arg1 narrowed & converted into the SessionHandler.FetchesType or RunOptions object
       * @param arg2 optional RunOptions object.
       * @returns
       */
      typeNarrowingForRunStep(feeds, arg1, arg2) {
        const fetches = {};
        let options = {};
        if (typeof feeds !== "object" || feeds === null || feeds instanceof Tensor2 || Array.isArray(feeds)) {
          throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
        }
        let isFetchesEmpty = true;
        if (typeof arg1 === "object") {
          if (arg1 === null) {
            throw new TypeError("Unexpected argument[1]: cannot be null.");
          }
          if (arg1 instanceof Tensor2) {
            throw new TypeError("'fetches' cannot be a Tensor");
          }
          if (Array.isArray(arg1)) {
            if (arg1.length === 0) {
              throw new TypeError("'fetches' cannot be an empty array.");
            }
            isFetchesEmpty = false;
            for (const name of arg1) {
              if (typeof name !== "string") {
                throw new TypeError("'fetches' must be a string array or an object.");
              }
              if (this.outputNames.indexOf(name) === -1) {
                throw new RangeError(`'fetches' contains invalid output name: ${name}.`);
              }
              fetches[name] = null;
            }
            if (typeof arg2 === "object" && arg2 !== null) {
              options = arg2;
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'options' must be an object.");
            }
          } else {
            let isFetches = false;
            const arg1Keys = Object.getOwnPropertyNames(arg1);
            for (const name of this.outputNames) {
              if (arg1Keys.indexOf(name) !== -1) {
                const v = arg1[name];
                if (v === null || v instanceof Tensor2) {
                  isFetches = true;
                  isFetchesEmpty = false;
                  fetches[name] = v;
                }
              }
            }
            if (isFetches) {
              if (typeof arg2 === "object" && arg2 !== null) {
                options = arg2;
              } else if (typeof arg2 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else {
              options = arg1;
            }
          }
        } else if (typeof arg1 !== "undefined") {
          throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
        }
        for (const name of this.inputNames) {
          if (typeof feeds[name] === "undefined") {
            throw new Error(`input '${name}' is missing in 'feeds'.`);
          }
        }
        if (isFetchesEmpty) {
          for (const name of this.outputNames) {
            fetches[name] = null;
          }
        }
        return [fetches, options];
      }
      /**
       * Helper method for runTrainStep and any other runStep methods. Takes the ReturnType result from the SessionHandler
       * and changes it into a map of Tensors.
       *
       * @param results
       * @returns
       */
      convertHandlerReturnTypeToMapOfTensors(results) {
        const returnValue = {};
        for (const key in results) {
          if (Object.hasOwnProperty.call(results, key)) {
            const result = results[key];
            if (result instanceof Tensor2) {
              returnValue[key] = result;
            } else {
              returnValue[key] = new Tensor2(result.type, result.data, result.dims);
            }
          }
        }
        return returnValue;
      }
      async runTrainStep(feeds, arg1, arg2) {
        const [fetches, options] = this.typeNarrowingForRunStep(feeds, arg1, arg2);
        const results = await this.handler.runTrainStep(feeds, fetches, options);
        return this.convertHandlerReturnTypeToMapOfTensors(results);
      }
      async loadParametersBuffer(_array, _trainableOnly) {
        throw new Error("Method not implemented.");
      }
      async getContiguousParameters(_trainableOnly) {
        throw new Error("Method not implemented.");
      }
      async release() {
        return this.handler.dispose();
      }
    };
  }
});

// common/dist/esm/training-session.js
var TrainingSession2;
var init_training_session = __esm({
  "common/dist/esm/training-session.js"() {
    "use strict";
    init_training_session_impl();
    TrainingSession2 = TrainingSession;
  }
});

// common/dist/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  InferenceSession: () => InferenceSession2,
  Tensor: () => Tensor2,
  TrainingSession: () => TrainingSession2,
  env: () => env2,
  registerBackend: () => registerBackend
});
var init_esm = __esm({
  "common/dist/esm/index.js"() {
    "use strict";
    init_backend();
    init_env();
    init_inference_session();
    init_tensor();
    init_onnx_value();
    init_training_session();
  }
});

// nodejs-ignore:node:os
var cpus;
var init_node_os = __esm({
  "nodejs-ignore:node:os"() {
    cpus = void 0;
  }
});

// nodejs-ignore:node:path
var join;
var init_node_path = __esm({
  "nodejs-ignore:node:path"() {
    join = void 0;
  }
});

// nodejs-ignore:fs
var fs_exports = {};
__export(fs_exports, {
  readFile: () => readFile
});
var readFile;
var init_fs = __esm({
  "nodejs-ignore:fs"() {
    readFile = void 0;
  }
});

// nodejs-ignore:path
var path_exports = {};
__export(path_exports, {
  join: () => join2
});
var join2;
var init_path = __esm({
  "nodejs-ignore:path"() {
    join2 = void 0;
  }
});

// web/lib/wasm/binding/ort-training-wasm-simd.js
var require_ort_training_wasm_simd = __commonJS({
  "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module2) {
    "use strict";
    var ortWasm = (() => {
      var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
      if (typeof __filename !== "undefined")
        _scriptDir = _scriptDir || __filename;
      return function(moduleArg = {}) {
        var d = moduleArg, aa, l;
        d.ready = new Promise((a, b) => {
          aa = a;
          l = b;
        });
        var ba = Object.assign({}, d), m = "./this.program", ca = "object" == typeof window, r = "function" == typeof importScripts, da = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, w = "", x, y, z;
        if (da) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), B = (init_path(), __toCommonJS(path_exports));
          w = r ? B.dirname(w) + "/" : __dirname + "/";
          x = (a, b) => {
            a = a.startsWith("file://") ? new URL(a) : B.normalize(a);
            return fs.readFileSync(a, b ? void 0 : "utf8");
          };
          z = (a) => {
            a = x(a, true);
            a.buffer || (a = new Uint8Array(a));
            return a;
          };
          y = (a, b, c, e = true) => {
            a = a.startsWith("file://") ? new URL(a) : B.normalize(a);
            fs.readFile(a, e ? void 0 : "utf8", (g, h) => {
              g ? c(g) : b(e ? h.buffer : h);
            });
          };
          !d.thisProgram && 1 < process.argv.length && (m = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          d.inspect = () => "[Emscripten Module object]";
        } else if (ca || r)
          r ? w = self.location.href : "undefined" != typeof document && document.currentScript && (w = document.currentScript.src), _scriptDir && (w = _scriptDir), 0 !== w.indexOf("blob:") ? w = w.substr(0, w.replace(/[?#].*/, "").lastIndexOf("/") + 1) : w = "", x = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.send(null);
            return b.responseText;
          }, r && (z = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), y = (a, b, c) => {
            var e = new XMLHttpRequest();
            e.open("GET", a, true);
            e.responseType = "arraybuffer";
            e.onload = () => {
              200 == e.status || 0 == e.status && e.response ? b(e.response) : c();
            };
            e.onerror = c;
            e.send(null);
          };
        var ea = d.print || console.log.bind(console), C = d.printErr || console.error.bind(console);
        Object.assign(d, ba);
        ba = null;
        d.thisProgram && (m = d.thisProgram);
        var D;
        d.wasmBinary && (D = d.wasmBinary);
        var noExitRuntime = d.noExitRuntime || true;
        "object" != typeof WebAssembly && E("no native wasm support detected");
        var F, G, fa = false, H, I, J, K;
        function ha() {
          var a = F.buffer;
          d.HEAP8 = H = new Int8Array(a);
          d.HEAP16 = new Int16Array(a);
          d.HEAP32 = J = new Int32Array(a);
          d.HEAPU8 = I = new Uint8Array(a);
          d.HEAPU16 = new Uint16Array(a);
          d.HEAPU32 = K = new Uint32Array(a);
          d.HEAPF32 = new Float32Array(a);
          d.HEAPF64 = new Float64Array(a);
        }
        var L, ia = [], ja = [], ka = [];
        function la() {
          var a = d.preRun.shift();
          ia.unshift(a);
        }
        var M = 0, N = null, O = null;
        function E(a) {
          if (d.onAbort)
            d.onAbort(a);
          a = "Aborted(" + a + ")";
          C(a);
          fa = true;
          a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          l(a);
          throw a;
        }
        function ma(a) {
          return a.startsWith("data:application/octet-stream;base64,");
        }
        var P;
        P = "ort-training-wasm-simd.wasm";
        if (!ma(P)) {
          var na = P;
          P = d.locateFile ? d.locateFile(na, w) : w + na;
        }
        function oa(a) {
          if (a == P && D)
            return new Uint8Array(D);
          if (z)
            return z(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function pa(a) {
          if (!D && (ca || r)) {
            if ("function" == typeof fetch && !a.startsWith("file://"))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw "failed to load wasm binary file at '" + a + "'";
                return b.arrayBuffer();
              }).catch(() => oa(a));
            if (y)
              return new Promise((b, c) => {
                y(a, (e) => b(new Uint8Array(e)), c);
              });
          }
          return Promise.resolve().then(() => oa(a));
        }
        function qa(a, b, c) {
          return pa(a).then((e) => WebAssembly.instantiate(e, b)).then((e) => e).then(c, (e) => {
            C("failed to asynchronously prepare wasm: " + e);
            E(e);
          });
        }
        function ra(a, b) {
          var c = P;
          return D || "function" != typeof WebAssembly.instantiateStreaming || ma(c) || c.startsWith("file://") || da || "function" != typeof fetch ? qa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((e) => WebAssembly.instantiateStreaming(e, a).then(b, function(g) {
            C("wasm streaming compile failed: " + g);
            C("falling back to ArrayBuffer instantiation");
            return qa(c, a, b);
          }));
        }
        var Q, R = (a) => {
          for (; 0 < a.length; )
            a.shift()(d);
        };
        function sa(a) {
          this.Ka = a - 24;
          this.Pa = function(b) {
            K[this.Ka + 4 >> 2 >>> 0] = b;
          };
          this.Oa = function(b) {
            K[this.Ka + 8 >> 2 >>> 0] = b;
          };
          this.Ma = function(b, c) {
            this.Na();
            this.Pa(b);
            this.Oa(c);
          };
          this.Na = function() {
            K[this.Ka + 16 >> 2 >>> 0] = 0;
          };
        }
        var ta = 0, ua = 0, va = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, wa = (a, b, c) => {
          b >>>= 0;
          var e = b + c;
          for (c = b; a[c] && !(c >= e); )
            ++c;
          if (16 < c - b && a.buffer && va)
            return va.decode(a.subarray(b, c));
          for (e = ""; b < c; ) {
            var g = a[b++];
            if (g & 128) {
              var h = a[b++] & 63;
              if (192 == (g & 224))
                e += String.fromCharCode((g & 31) << 6 | h);
              else {
                var k = a[b++] & 63;
                g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | k : (g & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;
                65536 > g ? e += String.fromCharCode(g) : (g -= 65536, e += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));
              }
            } else
              e += String.fromCharCode(g);
          }
          return e;
        }, S = (a, b) => (a >>>= 0) ? wa(I, a, b) : "", T = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var e = a.charCodeAt(c);
            127 >= e ? b++ : 2047 >= e ? b += 2 : 55296 <= e && 57343 >= e ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, U = (a, b, c, e) => {
          c >>>= 0;
          if (!(0 < e))
            return 0;
          var g = c;
          e = c + e - 1;
          for (var h = 0; h < a.length; ++h) {
            var k = a.charCodeAt(h);
            if (55296 <= k && 57343 >= k) {
              var p = a.charCodeAt(++h);
              k = 65536 + ((k & 1023) << 10) | p & 1023;
            }
            if (127 >= k) {
              if (c >= e)
                break;
              b[c++ >>> 0] = k;
            } else {
              if (2047 >= k) {
                if (c + 1 >= e)
                  break;
                b[c++ >>> 0] = 192 | k >> 6;
              } else {
                if (65535 >= k) {
                  if (c + 2 >= e)
                    break;
                  b[c++ >>> 0] = 224 | k >> 12;
                } else {
                  if (c + 3 >= e)
                    break;
                  b[c++ >>> 0] = 240 | k >> 18;
                  b[c++ >>> 0] = 128 | k >> 12 & 63;
                }
                b[c++ >>> 0] = 128 | k >> 6 & 63;
              }
              b[c++ >>> 0] = 128 | k & 63;
            }
          }
          b[c >>> 0] = 0;
          return c - g;
        }, V = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), xa = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], ya = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Da = (a) => {
          var b = T(a) + 1, c = za(b);
          c && U(a, I, c, b);
          return c;
        }, W = {}, Fa = () => {
          if (!Ea) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(
              "-",
              "_"
            ) + ".UTF-8", _: m || "./this.program" }, b;
            for (b in W)
              void 0 === W[b] ? delete a[b] : a[b] = W[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            Ea = c;
          }
          return Ea;
        }, Ea, Ga = [null, [], []], Ha = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Ia = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Ja(a) {
          var b = Array(T(a) + 1);
          U(a, b, 0, b.length);
          return b;
        }
        function Ka(a, b, c, e) {
          function g(f, n, q) {
            for (f = "number" == typeof f ? f.toString() : f || ""; f.length < n; )
              f = q[0] + f;
            return f;
          }
          function h(f, n) {
            return g(f, n, "0");
          }
          function k(f, n) {
            function q(Aa) {
              return 0 > Aa ? -1 : 0 < Aa ? 1 : 0;
            }
            var A;
            0 === (A = q(f.getFullYear() - n.getFullYear())) && 0 === (A = q(f.getMonth() - n.getMonth())) && (A = q(f.getDate() - n.getDate()));
            return A;
          }
          function p(f) {
            switch (f.getDay()) {
              case 0:
                return new Date(f.getFullYear() - 1, 11, 29);
              case 1:
                return f;
              case 2:
                return new Date(f.getFullYear(), 0, 3);
              case 3:
                return new Date(
                  f.getFullYear(),
                  0,
                  2
                );
              case 4:
                return new Date(f.getFullYear(), 0, 1);
              case 5:
                return new Date(f.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(f.getFullYear() - 1, 11, 30);
            }
          }
          function t(f) {
            var n = f.Ga;
            for (f = new Date(new Date(f.Ha + 1900, 0, 1).getTime()); 0 < n; ) {
              var q = f.getMonth(), A = (V(f.getFullYear()) ? Ha : Ia)[q];
              if (n > A - f.getDate())
                n -= A - f.getDate() + 1, f.setDate(1), 11 > q ? f.setMonth(q + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));
              else {
                f.setDate(f.getDate() + n);
                break;
              }
            }
            q = new Date(f.getFullYear() + 1, 0, 4);
            n = p(new Date(
              f.getFullYear(),
              0,
              4
            ));
            q = p(q);
            return 0 >= k(n, f) ? 0 >= k(q, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          e >>>= 0;
          var u = J[e + 40 >> 2 >>> 0];
          e = { Sa: J[e >> 2 >>> 0], Ra: J[e + 4 >> 2 >>> 0], Ia: J[e + 8 >> 2 >>> 0], La: J[e + 12 >> 2 >>> 0], Ja: J[e + 16 >> 2 >>> 0], Ha: J[e + 20 >> 2 >>> 0], Fa: J[e + 24 >> 2 >>> 0], Ga: J[e + 28 >> 2 >>> 0], Ua: J[e + 32 >> 2 >>> 0], Qa: J[e + 36 >> 2 >>> 0], Ta: u ? S(u) : "" };
          c = S(c);
          u = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y"
          };
          for (var v in u)
            c = c.replace(new RegExp(v, "g"), u[v]);
          var Ba = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Ca = "January February March April May June July August September October November December".split(" ");
          u = { "%a": (f) => Ba[f.Fa].substring(0, 3), "%A": (f) => Ba[f.Fa], "%b": (f) => Ca[f.Ja].substring(0, 3), "%B": (f) => Ca[f.Ja], "%C": (f) => h((f.Ha + 1900) / 100 | 0, 2), "%d": (f) => h(f.La, 2), "%e": (f) => g(f.La, 2, " "), "%g": (f) => t(f).toString().substring(2), "%G": (f) => t(f), "%H": (f) => h(f.Ia, 2), "%I": (f) => {
            f = f.Ia;
            0 == f ? f = 12 : 12 < f && (f -= 12);
            return h(f, 2);
          }, "%j": (f) => {
            for (var n = 0, q = 0; q <= f.Ja - 1; n += (V(f.Ha + 1900) ? Ha : Ia)[q++])
              ;
            return h(f.La + n, 3);
          }, "%m": (f) => h(f.Ja + 1, 2), "%M": (f) => h(f.Ra, 2), "%n": () => "\n", "%p": (f) => 0 <= f.Ia && 12 > f.Ia ? "AM" : "PM", "%S": (f) => h(f.Sa, 2), "%t": () => "	", "%u": (f) => f.Fa || 7, "%U": (f) => h(Math.floor((f.Ga + 7 - f.Fa) / 7), 2), "%V": (f) => {
            var n = Math.floor((f.Ga + 7 - (f.Fa + 6) % 7) / 7);
            2 >= (f.Fa + 371 - f.Ga - 2) % 7 && n++;
            if (n)
              53 == n && (q = (f.Fa + 371 - f.Ga) % 7, 4 == q || 3 == q && V(f.Ha) || (n = 1));
            else {
              n = 52;
              var q = (f.Fa + 7 - f.Ga - 1) % 7;
              (4 == q || 5 == q && V(f.Ha % 400 - 1)) && n++;
            }
            return h(n, 2);
          }, "%w": (f) => f.Fa, "%W": (f) => h(Math.floor((f.Ga + 7 - (f.Fa + 6) % 7) / 7), 2), "%y": (f) => (f.Ha + 1900).toString().substring(2), "%Y": (f) => f.Ha + 1900, "%z": (f) => {
            f = f.Qa;
            var n = 0 <= f;
            f = Math.abs(f) / 60;
            return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
          }, "%Z": (f) => f.Ta, "%%": () => "%" };
          c = c.replace(/%%/g, "\0\0");
          for (v in u)
            c.includes(v) && (c = c.replace(new RegExp(v, "g"), u[v](e)));
          c = c.replace(/\0\0/g, "%");
          v = Ja(c);
          if (v.length > b)
            return 0;
          H.set(v, a >>> 0);
          return v.length - 1;
        }
        var X = [], Y = void 0, La = [];
        function Ma(a, b) {
          if (!Y) {
            Y = /* @__PURE__ */ new WeakMap();
            var c = L.length;
            if (Y)
              for (var e = 0; e < 0 + c; e++) {
                var g = e;
                var h = X[g];
                h || (g >= X.length && (X.length = g + 1), X[g] = h = L.get(g));
                (g = h) && Y.set(g, e);
              }
          }
          if (c = Y.get(a) || 0)
            return c;
          if (La.length)
            c = La.pop();
          else {
            try {
              L.grow(1);
            } catch (p) {
              if (!(p instanceof RangeError))
                throw p;
              throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
            }
            c = L.length - 1;
          }
          try {
            e = c, L.set(e, a), X[e] = L.get(e);
          } catch (p) {
            if (!(p instanceof TypeError))
              throw p;
            if ("function" == typeof WebAssembly.Function) {
              e = WebAssembly.Function;
              g = { i: "i32", j: "i64", f: "f32", d: "f64", p: "i32" };
              h = { parameters: [], results: "v" == b[0] ? [] : [g[b[0]]] };
              for (var k = 1; k < b.length; ++k)
                h.parameters.push(g[b[k]]);
              b = new e(h, a);
            } else {
              e = [1];
              g = b.slice(0, 1);
              b = b.slice(1);
              h = { i: 127, p: 127, j: 126, f: 125, d: 124 };
              e.push(96);
              k = b.length;
              128 > k ? e.push(k) : e.push(k % 128 | 128, k >> 7);
              for (k = 0; k < b.length; ++k)
                e.push(h[b[k]]);
              "v" == g ? e.push(0) : e.push(1, h[g]);
              b = [0, 97, 115, 109, 1, 0, 0, 0, 1];
              g = e.length;
              128 > g ? b.push(g) : b.push(g % 128 | 128, g >> 7);
              b.push.apply(b, e);
              b.push(
                2,
                7,
                1,
                1,
                101,
                1,
                102,
                0,
                0,
                7,
                5,
                1,
                1,
                102,
                0,
                0
              );
              b = new WebAssembly.Module(new Uint8Array(b));
              b = new WebAssembly.Instance(b, { e: { f: a } }).exports.f;
            }
            e = c;
            L.set(e, b);
            X[e] = L.get(e);
          }
          Y.set(a, c);
          return c;
        }
        var Oa = {
          a: function(a, b, c) {
            a >>>= 0;
            new sa(a).Ma(b >>> 0, c >>> 0);
            ta = a;
            ua++;
            throw ta;
          },
          e: function() {
            return 0;
          },
          H: function() {
          },
          x: function() {
          },
          z: function() {
          },
          J: function() {
            return 0;
          },
          F: function() {
          },
          A: function() {
          },
          E: function() {
          },
          g: function() {
          },
          y: function() {
          },
          v: function() {
          },
          G: function() {
          },
          w: function() {
          },
          l: () => true,
          o: function(a, b, c) {
            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
            c >>>= 0;
            a = new Date(1e3 * a);
            J[c >> 2 >>> 0] = a.getUTCSeconds();
            J[c + 4 >> 2 >>> 0] = a.getUTCMinutes();
            J[c + 8 >> 2 >>> 0] = a.getUTCHours();
            J[c + 12 >> 2 >>> 0] = a.getUTCDate();
            J[c + 16 >> 2 >>> 0] = a.getUTCMonth();
            J[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;
            J[c + 24 >> 2 >>> 0] = a.getUTCDay();
            J[c + 28 >> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
          },
          p: function(a, b, c) {
            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
            c >>>= 0;
            a = new Date(1e3 * a);
            J[c >> 2 >>> 0] = a.getSeconds();
            J[c + 4 >> 2 >>> 0] = a.getMinutes();
            J[c + 8 >> 2 >>> 0] = a.getHours();
            J[c + 12 >> 2 >>> 0] = a.getDate();
            J[c + 16 >> 2 >>> 0] = a.getMonth();
            J[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;
            J[c + 24 >> 2 >>> 0] = a.getDay();
            J[c + 28 >> 2 >>> 0] = (V(a.getFullYear()) ? xa : ya)[a.getMonth()] + a.getDate() - 1 | 0;
            J[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());
            b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var e = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            J[c + 32 >> 2 >>> 0] = (b != e && a.getTimezoneOffset() == Math.min(e, b)) | 0;
          },
          q: function(a) {
            a >>>= 0;
            var b = new Date(J[a + 20 >> 2 >>> 0] + 1900, J[a + 16 >> 2 >>> 0], J[a + 12 >> 2 >>> 0], J[a + 8 >> 2 >>> 0], J[a + 4 >> 2 >>> 0], J[a >> 2 >>> 0], 0), c = J[a + 32 >> 2 >>> 0], e = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(h, g);
            0 > c ? J[a + 32 >> 2 >>> 0] = Number(g != h && k == e) : 0 < c != (k == e) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : g) - e)));
            J[a + 24 >> 2 >>> 0] = b.getDay();
            J[a + 28 >> 2 >>> 0] = (V(b.getFullYear()) ? xa : ya)[b.getMonth()] + b.getDate() - 1 | 0;
            J[a >> 2 >>> 0] = b.getSeconds();
            J[a + 4 >> 2 >>> 0] = b.getMinutes();
            J[a + 8 >> 2 >>> 0] = b.getHours();
            J[a + 12 >> 2 >>> 0] = b.getDate();
            J[a + 16 >> 2 >>> 0] = b.getMonth();
            J[a + 20 >> 2 >>> 0] = b.getYear();
            a = b.getTime() / 1e3;
            return Na((Q = a, 1 <= +Math.abs(Q) ? 0 < Q ? +Math.floor(Q / 4294967296) >>> 0 : ~~+Math.ceil((Q - +(~~Q >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;
          },
          m: function() {
            return -52;
          },
          n: function() {
          },
          t: function(a, b, c) {
            function e(t) {
              return (t = t.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? t[1] : "GMT";
            }
            c >>>= 0;
            var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), k = new Date(g, 6, 1);
            g = h.getTimezoneOffset();
            var p = k.getTimezoneOffset();
            K[a >>> 0 >> 2 >>> 0] = 60 * Math.max(g, p);
            J[b >>> 0 >> 2 >>> 0] = Number(g != p);
            a = e(h);
            b = e(k);
            a = Da(a);
            b = Da(b);
            p < g ? (K[c >> 2 >>> 0] = a, K[c + 4 >> 2 >>> 0] = b) : (K[c >> 2 >>> 0] = b, K[c + 4 >> 2 >>> 0] = a);
          },
          d: () => {
            E("");
          },
          h: function() {
            return Date.now();
          },
          u: function() {
            return 4294901760;
          },
          b: () => performance.now(),
          I: function(a, b, c) {
            b >>>= 0;
            return I.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);
          },
          s: function(a) {
            a >>>= 0;
            var b = I.length;
            if (4294901760 < a)
              return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var e = b * (1 + 0.2 / c);
              e = Math.min(e, a + 100663296);
              var g = Math;
              e = Math.max(a, e);
              a: {
                g = g.min.call(g, 4294901760, e + (65536 - e % 65536) % 65536) - F.buffer.byteLength + 65535 >>> 16;
                try {
                  F.grow(g);
                  ha();
                  var h = 1;
                  break a;
                } catch (k) {
                }
                h = void 0;
              }
              if (h)
                return true;
            }
            return false;
          },
          C: function(a, b) {
            a >>>= 0;
            b >>>= 0;
            var c = 0;
            Fa().forEach(function(e, g) {
              var h = b + c;
              g = K[a + 4 * g >> 2 >>> 0] = h;
              for (h = 0; h < e.length; ++h)
                H[g++ >> 0 >>> 0] = e.charCodeAt(h);
              H[g >> 0 >>> 0] = 0;
              c += e.length + 1;
            });
            return 0;
          },
          D: function(a, b) {
            a >>>= 0;
            b >>>= 0;
            var c = Fa();
            K[a >> 2 >>> 0] = c.length;
            var e = 0;
            c.forEach(function(g) {
              e += g.length + 1;
            });
            K[b >> 2 >>> 0] = e;
            return 0;
          },
          f: () => 52,
          k: function() {
            return 52;
          },
          r: function() {
            return 70;
          },
          j: function(a, b, c, e) {
            b >>>= 0;
            c >>>= 0;
            e >>>= 0;
            for (var g = 0, h = 0; h < c; h++) {
              var k = K[b >> 2 >>> 0], p = K[b + 4 >> 2 >>> 0];
              b += 8;
              for (var t = 0; t < p; t++) {
                var u = I[k + t >>> 0], v = Ga[a];
                0 === u || 10 === u ? ((1 === a ? ea : C)(wa(v, 0)), v.length = 0) : v.push(u);
              }
              g += p;
            }
            K[e >> 2 >>> 0] = g;
            return 0;
          },
          B: Ka,
          c: function(a, b, c, e) {
            return Ka(a >>> 0, b >>> 0, c >>> 0, e >>> 0);
          },
          i: function(a, b, c, e) {
            const g = L.length;
            a = new Uint8Array(I.slice(a + b, a + c));
            try {
              var h = new WebAssembly.Module(a), k = new WebAssembly.Instance(h, { env: { memory: F } }), p;
              for (p in k.exports)
                Ma(k.exports[p]);
              return g < L.length ? g : e;
            } catch (t) {
              return console.log(t), e;
            }
          }
        };
        (function() {
          function a(c) {
            c = c.exports;
            G = c = Pa(c);
            F = G.K;
            ha();
            L = G.Aa;
            ja.unshift(G.L);
            M--;
            d.monitorRunDependencies && d.monitorRunDependencies(M);
            if (0 == M && (null !== N && (clearInterval(N), N = null), O)) {
              var e = O;
              O = null;
              e();
            }
            return c;
          }
          var b = { a: Oa };
          M++;
          d.monitorRunDependencies && d.monitorRunDependencies(M);
          if (d.instantiateWasm)
            try {
              return d.instantiateWasm(b, a);
            } catch (c) {
              C("Module.instantiateWasm callback failed with error: " + c), l(c);
            }
          ra(b, function(c) {
            a(c.instance);
          }).catch(l);
          return {};
        })();
        d._OrtInit = (a, b) => (d._OrtInit = G.M)(a, b);
        d._OrtGetLastError = (a, b) => (d._OrtGetLastError = G.N)(a, b);
        d._OrtCreateSessionOptions = (a, b, c, e, g, h, k, p, t, u) => (d._OrtCreateSessionOptions = G.O)(a, b, c, e, g, h, k, p, t, u);
        d._OrtAppendExecutionProvider = (a, b) => (d._OrtAppendExecutionProvider = G.P)(a, b);
        d._OrtAddFreeDimensionOverride = (a, b, c) => (d._OrtAddFreeDimensionOverride = G.Q)(a, b, c);
        d._OrtAddSessionConfigEntry = (a, b, c) => (d._OrtAddSessionConfigEntry = G.R)(a, b, c);
        d._OrtReleaseSessionOptions = (a) => (d._OrtReleaseSessionOptions = G.S)(a);
        d._OrtCreateSession = (a, b, c) => (d._OrtCreateSession = G.T)(a, b, c);
        d._OrtReleaseSession = (a) => (d._OrtReleaseSession = G.U)(a);
        d._OrtGetInputOutputCount = (a, b, c) => (d._OrtGetInputOutputCount = G.V)(a, b, c);
        d._OrtGetInputName = (a, b) => (d._OrtGetInputName = G.W)(a, b);
        d._OrtGetOutputName = (a, b) => (d._OrtGetOutputName = G.X)(a, b);
        d._OrtFree = (a) => (d._OrtFree = G.Y)(a);
        d._OrtCreateTensor = (a, b, c, e, g, h) => (d._OrtCreateTensor = G.Z)(a, b, c, e, g, h);
        d._OrtGetTensorData = (a, b, c, e, g) => (d._OrtGetTensorData = G._)(a, b, c, e, g);
        d._OrtReleaseTensor = (a) => (d._OrtReleaseTensor = G.$)(a);
        d._OrtCreateRunOptions = (a, b, c, e) => (d._OrtCreateRunOptions = G.aa)(a, b, c, e);
        d._OrtAddRunConfigEntry = (a, b, c) => (d._OrtAddRunConfigEntry = G.ba)(a, b, c);
        d._OrtReleaseRunOptions = (a) => (d._OrtReleaseRunOptions = G.ca)(a);
        d._OrtCreateBinding = (a) => (d._OrtCreateBinding = G.da)(a);
        d._OrtBindInput = (a, b, c) => (d._OrtBindInput = G.ea)(a, b, c);
        d._OrtBindOutput = (a, b, c, e) => (d._OrtBindOutput = G.fa)(a, b, c, e);
        d._OrtClearBoundOutputs = (a) => (d._OrtClearBoundOutputs = G.ga)(a);
        d._OrtReleaseBinding = (a) => (d._OrtReleaseBinding = G.ha)(a);
        d._OrtRunWithBinding = (a, b, c, e, g) => (d._OrtRunWithBinding = G.ia)(a, b, c, e, g);
        d._OrtRun = (a, b, c, e, g, h, k, p) => (d._OrtRun = G.ja)(a, b, c, e, g, h, k, p);
        d._OrtEndProfiling = (a) => (d._OrtEndProfiling = G.ka)(a);
        d._OrtTrainingLoadCheckpoint = (a, b) => (d._OrtTrainingLoadCheckpoint = G.la)(a, b);
        d._OrtTrainingReleaseCheckpoint = (a) => (d._OrtTrainingReleaseCheckpoint = G.ma)(a);
        d._OrtTrainingCreateSession = (a, b, c, e, g, h, k, p) => (d._OrtTrainingCreateSession = G.na)(a, b, c, e, g, h, k, p);
        d._OrtTrainingLazyResetGrad = (a) => (d._OrtTrainingLazyResetGrad = G.oa)(a);
        d._OrtTrainingRunTrainStep = (a, b, c, e, g, h) => (d._OrtTrainingRunTrainStep = G.pa)(a, b, c, e, g, h);
        d._OrtTrainingOptimizerStep = (a, b) => (d._OrtTrainingOptimizerStep = G.qa)(a, b);
        d._OrtTrainingEvalStep = (a, b, c, e, g, h) => (d._OrtTrainingEvalStep = G.ra)(a, b, c, e, g, h);
        d._OrtTrainingGetParametersSize = (a, b, c) => (d._OrtTrainingGetParametersSize = G.sa)(a, b, c);
        d._OrtTrainingCopyParametersToBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersToBuffer = G.ta)(a, b, c, e);
        d._OrtTrainingCopyParametersFromBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersFromBuffer = G.ua)(a, b, c, e);
        d._OrtTrainingGetModelInputOutputCount = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputCount = G.va)(a, b, c, e);
        d._OrtTrainingGetModelInputOutputName = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputName = G.wa)(a, b, c, e);
        d._OrtTrainingReleaseSession = (a) => (d._OrtTrainingReleaseSession = G.xa)(a);
        var za = d._malloc = (a) => (za = d._malloc = G.ya)(a);
        d._free = (a) => (d._free = G.za)(a);
        var Na = (a) => (Na = G.Ba)(a), Qa = () => (Qa = G.Ca)(), Ra = (a) => (Ra = G.Da)(a), Sa = (a) => (Sa = G.Ea)(a);
        d.___start_em_js = 975904;
        d.___stop_em_js = 976516;
        function Pa(a) {
          a = Object.assign({}, a);
          var b = (e) => () => e() >>> 0, c = (e) => (g) => e(g) >>> 0;
          a.__errno_location = b(a.__errno_location);
          a.malloc = c(a.malloc);
          a.stackSave = b(a.stackSave);
          a.stackAlloc = c(a.stackAlloc);
          return a;
        }
        d.stackAlloc = Sa;
        d.stackSave = Qa;
        d.stackRestore = Ra;
        d.addFunction = Ma;
        d.UTF8ToString = S;
        d.stringToUTF8 = (a, b, c) => U(a, I, b, c);
        d.lengthBytesUTF8 = T;
        var Z;
        O = function Ta() {
          Z || Ua();
          Z || (O = Ta);
        };
        function Ua() {
          function a() {
            if (!Z && (Z = true, d.calledRun = true, !fa)) {
              R(ja);
              aa(d);
              if (d.onRuntimeInitialized)
                d.onRuntimeInitialized();
              if (d.postRun)
                for ("function" == typeof d.postRun && (d.postRun = [d.postRun]); d.postRun.length; ) {
                  var b = d.postRun.shift();
                  ka.unshift(b);
                }
              R(ka);
            }
          }
          if (!(0 < M)) {
            if (d.preRun)
              for ("function" == typeof d.preRun && (d.preRun = [d.preRun]); d.preRun.length; )
                la();
            R(ia);
            0 < M || (d.setStatus ? (d.setStatus("Running..."), setTimeout(function() {
              setTimeout(function() {
                d.setStatus("");
              }, 1);
              a();
            }, 1)) : a());
          }
        }
        if (d.preInit)
          for ("function" == typeof d.preInit && (d.preInit = [d.preInit]); 0 < d.preInit.length; )
            d.preInit.pop()();
        Ua();
        return moduleArg.ready;
      };
    })();
    if (typeof exports === "object" && typeof module2 === "object")
      module2.exports = ortWasm;
    else if (typeof define === "function" && define["amd"])
      define([], () => ortWasm);
  }
});

// nodejs-ignore:worker_threads
var require_worker_threads = __commonJS({
  "nodejs-ignore:worker_threads"() {
  }
});

// nodejs-ignore:perf_hooks
var require_perf_hooks = __commonJS({
  "nodejs-ignore:perf_hooks"() {
  }
});

// nodejs-ignore:os
var os_exports = {};
__export(os_exports, {
  cpus: () => cpus2
});
var cpus2;
var init_os = __esm({
  "nodejs-ignore:os"() {
    cpus2 = void 0;
  }
});

// web/lib/wasm/binding/ort-wasm-threaded.js
var require_ort_wasm_threaded = __commonJS({
  "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module2) {
    "use strict";
    var ortWasmThreaded = (() => {
      var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
      if (typeof __filename !== "undefined")
        _scriptDir = _scriptDir || __filename;
      return function(moduleArg = {}) {
        function p() {
          q.buffer != r.buffer && t();
          return r;
        }
        function x() {
          q.buffer != r.buffer && t();
          return ba;
        }
        function ca() {
          q.buffer != r.buffer && t();
          return da;
        }
        function ea() {
          q.buffer != r.buffer && t();
          return fa;
        }
        function A() {
          q.buffer != r.buffer && t();
          return ha;
        }
        function B() {
          q.buffer != r.buffer && t();
          return ia;
        }
        function ja() {
          q.buffer != r.buffer && t();
          return ka;
        }
        var C = moduleArg, la, ma;
        C.ready = new Promise((a, b) => {
          la = a;
          ma = b;
        });
        var na = Object.assign({}, C), oa = "./this.program", pa = (a, b) => {
          throw b;
        }, qa = "object" == typeof window, ra = "function" == typeof importScripts, F = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, G = C.ENVIRONMENT_IS_PTHREAD || false, H = "";
        function sa(a) {
          return C.locateFile ? C.locateFile(a, H) : H + a;
        }
        var ta, ua, va;
        if (F) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), wa = (init_path(), __toCommonJS(path_exports));
          H = ra ? wa.dirname(H) + "/" : __dirname + "/";
          ta = (b, c) => {
            b = b.startsWith("file://") ? new URL(b) : wa.normalize(b);
            return fs.readFileSync(b, c ? void 0 : "utf8");
          };
          va = (b) => {
            b = ta(b, true);
            b.buffer || (b = new Uint8Array(b));
            return b;
          };
          ua = (b, c, d, e = true) => {
            b = b.startsWith("file://") ? new URL(b) : wa.normalize(b);
            fs.readFile(b, e ? void 0 : "utf8", (f, g) => {
              f ? d(f) : c(e ? g.buffer : g);
            });
          };
          !C.thisProgram && 1 < process.argv.length && (oa = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          pa = (b, c) => {
            process.exitCode = b;
            throw c;
          };
          C.inspect = () => "[Emscripten Module object]";
          let a;
          try {
            a = require_worker_threads();
          } catch (b) {
            throw console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?'), b;
          }
          global.Worker = a.Worker;
        } else if (qa || ra)
          ra ? H = self.location.href : "undefined" != typeof document && document.currentScript && (H = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (H = _scriptDir), 0 !== H.indexOf("blob:") ? H = H.substr(0, H.replace(/[?#].*/, "").lastIndexOf("/") + 1) : H = "", F || (ta = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.send(null);
            return b.responseText;
          }, ra && (va = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), ua = (a, b, c) => {
            var d = new XMLHttpRequest();
            d.open("GET", a, true);
            d.responseType = "arraybuffer";
            d.onload = () => {
              200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
            };
            d.onerror = c;
            d.send(null);
          });
        F && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);
        var xa = console.log.bind(console), ya = console.error.bind(console);
        F && (xa = (...a) => fs.writeSync(1, a.join(" ") + "\n"), ya = (...a) => fs.writeSync(2, a.join(" ") + "\n"));
        var za = xa, L = ya;
        Object.assign(C, na);
        na = null;
        var noExitRuntime = true;
        "object" != typeof WebAssembly && Aa("no native wasm support detected");
        var q, Ba, Ca = false, Da, r, ba, da, fa, ha, ia, Ea, Fa, Ga, ka;
        function t() {
          var a = q.buffer;
          C.HEAP8 = r = new Int8Array(a);
          C.HEAP16 = da = new Int16Array(a);
          C.HEAPU8 = ba = new Uint8Array(a);
          C.HEAPU16 = fa = new Uint16Array(a);
          C.HEAP32 = ha = new Int32Array(a);
          C.HEAPU32 = ia = new Uint32Array(a);
          C.HEAPF32 = Ea = new Float32Array(a);
          C.HEAPF64 = ka = new Float64Array(a);
          C.HEAP64 = Fa = new BigInt64Array(a);
          C.HEAPU64 = Ga = new BigUint64Array(a);
        }
        var Ha = 16777216;
        5242880 <= Ha || Aa("INITIAL_MEMORY should be larger than STACK_SIZE, was " + Ha + "! (STACK_SIZE=5242880)");
        if (G)
          q = C.wasmMemory;
        else if (q = new WebAssembly.Memory({ initial: Ha / 65536, maximum: 65536, shared: true }), !(q.buffer instanceof SharedArrayBuffer))
          throw L("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), F && L("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");
        t();
        Ha = q.buffer.byteLength;
        var Ia = [], Ja = [], Ka = [], La = 0;
        function Ma() {
          return noExitRuntime || 0 < La;
        }
        var Na = 0, Oa = null, Pa = null;
        function Qa() {
          Na--;
          if (0 == Na && (null !== Oa && (clearInterval(Oa), Oa = null), Pa)) {
            var a = Pa;
            Pa = null;
            a();
          }
        }
        function Aa(a) {
          a = "Aborted(" + a + ")";
          L(a);
          Ca = true;
          Da = 1;
          a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          ma(a);
          throw a;
        }
        function Ra(a) {
          return a.startsWith("data:application/octet-stream;base64,");
        }
        var Sa;
        Sa = "ort-wasm-threaded.wasm";
        Ra(Sa) || (Sa = sa(Sa));
        function Ta(a) {
          if (va)
            return va(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function Ua(a) {
          if (qa || ra) {
            if ("function" == typeof fetch && !a.startsWith("file://"))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw "failed to load wasm binary file at '" + a + "'";
                return b.arrayBuffer();
              }).catch(() => Ta(a));
            if (ua)
              return new Promise((b, c) => {
                ua(a, (d) => b(new Uint8Array(d)), c);
              });
          }
          return Promise.resolve().then(() => Ta(a));
        }
        function Va(a, b, c) {
          return Ua(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {
            L(`failed to asynchronously prepare wasm: ${d}`);
            Aa(d);
          });
        }
        function Wa(a, b) {
          var c = Sa;
          return "function" != typeof WebAssembly.instantiateStreaming || Ra(c) || c.startsWith("file://") || F || "function" != typeof fetch ? Va(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {
            L(`wasm streaming compile failed: ${e}`);
            L("falling back to ArrayBuffer instantiation");
            return Va(c, a, b);
          }));
        }
        function Xa(a) {
          this.name = "ExitStatus";
          this.message = `Program terminated with exit(${a})`;
          this.status = a;
        }
        var Ya = (a) => {
          a.terminate();
          a.onmessage = () => {
          };
        }, Za = (a) => {
          if (0 == M.Pe.length) {
            var b = sa("ort-wasm-threaded.worker.js");
            b = new Worker(b);
            M.Pe.push(b);
            M.rf(M.Pe[0]);
          }
          b = M.Pe.pop();
          if (!b)
            return 6;
          M.Me.push(b);
          M.Ie[a.Le] = b;
          b.Le = a.Le;
          var c = { cmd: "run", start_routine: a.tf, arg: a.lf, pthread_ptr: a.Le };
          F && b.unref();
          b.postMessage(c, a.zf);
          return 0;
        }, $a = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, ab = (a, b, c) => {
          b >>>= 0;
          var d = b + c;
          for (c = b; a[c] && !(c >= d); )
            ++c;
          if (16 < c - b && a.buffer && $a)
            return $a.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));
          for (d = ""; b < c; ) {
            var e = a[b++];
            if (e & 128) {
              var f = a[b++] & 63;
              if (192 == (e & 224))
                d += String.fromCharCode((e & 31) << 6 | f);
              else {
                var g = a[b++] & 63;
                e = 224 == (e & 240) ? (e & 15) << 12 | f << 6 | g : (e & 7) << 18 | f << 12 | g << 6 | a[b++] & 63;
                65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
              }
            } else
              d += String.fromCharCode(e);
          }
          return d;
        }, bb = (a, b) => (a >>>= 0) ? ab(x(), a, b) : "";
        function cb(a) {
          if (G)
            return N(0, 1, a);
          Da = a;
          Ma() || (M.uf(), Ca = true);
          pa(a, new Xa(a));
        }
        var eb = (a) => {
          Da = a;
          if (G)
            throw db(a), "unwind";
          cb(a);
        };
        function gb() {
          Ia.unshift(() => {
            Na++;
            Qa();
          });
        }
        var M = { Pe: [], Me: [], ef: [], Ie: {}, We() {
          G ? (M.receiveObjectTransfer = M.sf, M.threadInitTLS = M.df, M.setExitStatus = M.af, noExitRuntime = false) : gb();
        }, af: (a) => {
          Da = a;
        }, Cf: ["$terminateWorker"], uf: () => {
          for (var a of M.Me)
            Ya(a);
          for (a of M.Pe)
            Ya(a);
          M.Pe = [];
          M.Me = [];
          M.Ie = [];
        }, $e: (a) => {
          var b = a.Le;
          delete M.Ie[b];
          M.Pe.push(a);
          M.Me.splice(M.Me.indexOf(a), 1);
          a.Le = 0;
          hb(b);
        }, sf() {
        }, df() {
          M.ef.forEach((a) => a());
        }, rf: (a) => new Promise((b) => {
          a.onmessage = (f) => {
            f = f.data;
            var g = f.cmd;
            if (f.targetThread && f.targetThread != ib()) {
              var h = M.Ie[f.targetThread];
              h ? h.postMessage(f, f.transferList) : L(`Internal error! Worker sent a message "${g}" to target pthread ${f.targetThread}, but that thread no longer exists!`);
            } else if ("checkMailbox" === g)
              jb();
            else if ("spawnThread" === g)
              Za(f);
            else if ("cleanupThread" === g)
              (f = M.Ie[f.thread]) || Aa(), M.$e(f);
            else if ("killThread" === g)
              f = f.thread, g = M.Ie[f], delete M.Ie[f], Ya(g), hb(f), M.Me.splice(M.Me.indexOf(g), 1), g.Le = 0;
            else if ("cancelThread" === g)
              M.Ie[f.thread].postMessage({ cmd: "cancel" });
            else if ("loaded" === g)
              a.loaded = true, b(a);
            else if ("alert" === g)
              alert(`Thread ${f.threadId}: ${f.text}`);
            else if ("setimmediate" === f.target)
              a.postMessage(f);
            else if ("callHandler" === g)
              C[f.handler](...f.args);
            else
              g && L(`worker sent an unknown command ${g}`);
          };
          a.onerror = (f) => {
            L(`${"worker sent an error!"} ${f.filename}:${f.lineno}: ${f.message}`);
            throw f;
          };
          F && (a.on("message", (f) => a.onmessage({ data: f })), a.on("error", (f) => a.onerror(f)));
          var c = [], d = [], e;
          for (e of d)
            C.hasOwnProperty(e) && c.push(e);
          a.postMessage({
            cmd: "load",
            handlers: c,
            urlOrBlob: C.mainScriptUrlOrBlob || _scriptDir,
            wasmMemory: q,
            wasmModule: Ba
          });
        }) };
        C.PThread = M;
        var kb = (a) => {
          for (; 0 < a.length; )
            a.shift()(C);
        };
        C.establishStackSpace = () => {
          var a = ib(), b = B()[a + 52 >>> 2 >>> 0];
          a = B()[a + 56 >>> 2 >>> 0];
          lb(b, b - a);
          O(b);
        };
        function db(a) {
          if (G)
            return N(1, 0, a);
          eb(a);
        }
        var mb = [], nb, P = (a) => {
          var b = mb[a];
          b || (a >= mb.length && (mb.length = a + 1), mb[a] = b = nb.get(a));
          return b;
        };
        C.invokeEntryPoint = (a, b) => {
          a = P(a)(b);
          Ma() ? M.af(a) : ob(a);
        };
        var pb = [], qb = 0, Q = 0;
        function rb(a) {
          this.Re = a;
          this.He = a - 24;
          this.kf = function(b) {
            B()[this.He + 4 >>> 2 >>> 0] = b;
          };
          this.Se = function() {
            return B()[this.He + 4 >>> 2 >>> 0];
          };
          this.jf = function(b) {
            B()[this.He + 8 >>> 2 >>> 0] = b;
          };
          this.bf = function(b) {
            b = b ? 1 : 0;
            p()[this.He + 12 >>> 0 >>> 0] = b;
          };
          this.gf = function() {
            return 0 != p()[this.He + 12 >>> 0 >>> 0];
          };
          this.cf = function(b) {
            b = b ? 1 : 0;
            p()[this.He + 13 >>> 0 >>> 0] = b;
          };
          this.nf = function() {
            return 0 != p()[this.He + 13 >>> 0 >>> 0];
          };
          this.We = function(b, c) {
            this.Te(0);
            this.kf(b);
            this.jf(c);
          };
          this.Te = function(b) {
            B()[this.He + 16 >>> 2 >>> 0] = b;
          };
          this.ff = function() {
            return B()[this.He + 16 >>> 2 >>> 0];
          };
          this.hf = function() {
            if (sb(this.Se()))
              return B()[this.Re >>> 2 >>> 0];
            var b = this.ff();
            return 0 !== b ? b : this.Re;
          };
        }
        var vb = (a) => {
          var b = Q;
          if (!b)
            return tb(0), 0;
          var c = new rb(b);
          c.Te(b);
          var d = c.Se();
          if (!d)
            return tb(0), b;
          for (var e in a) {
            var f = a[e];
            if (0 === f || f === d)
              break;
            if (ub(f, d, c.He + 16))
              return tb(f), b;
          }
          tb(d);
          return b;
        };
        function wb(a, b, c, d) {
          return G ? N(2, 1, a, b, c, d) : xb(a, b, c, d);
        }
        function xb(a, b, c, d) {
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          if ("undefined" == typeof SharedArrayBuffer)
            return L("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;
          var e = [];
          if (G && 0 === e.length)
            return wb(a, b, c, d);
          a = { tf: c, Le: a, lf: d, zf: e };
          return G ? (a.Bf = "spawnThread", postMessage(a, e), 0) : Za(a);
        }
        function yb(a, b, c) {
          return G ? N(3, 1, a, b, c) : 0;
        }
        function zb(a, b) {
          if (G)
            return N(4, 1, a, b);
        }
        var Ab = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, Bb = (a, b, c, d) => {
          c >>>= 0;
          if (!(0 < d))
            return 0;
          var e = c;
          d = c + d - 1;
          for (var f = 0; f < a.length; ++f) {
            var g = a.charCodeAt(f);
            if (55296 <= g && 57343 >= g) {
              var h = a.charCodeAt(++f);
              g = 65536 + ((g & 1023) << 10) | h & 1023;
            }
            if (127 >= g) {
              if (c >= d)
                break;
              b[c++ >>> 0] = g;
            } else {
              if (2047 >= g) {
                if (c + 1 >= d)
                  break;
                b[c++ >>> 0] = 192 | g >> 6;
              } else {
                if (65535 >= g) {
                  if (c + 2 >= d)
                    break;
                  b[c++ >>> 0] = 224 | g >> 12;
                } else {
                  if (c + 3 >= d)
                    break;
                  b[c++ >>> 0] = 240 | g >> 18;
                  b[c++ >>> 0] = 128 | g >> 12 & 63;
                }
                b[c++ >>> 0] = 128 | g >> 6 & 63;
              }
              b[c++ >>> 0] = 128 | g & 63;
            }
          }
          b[c >>> 0] = 0;
          return c - e;
        }, Cb = (a, b, c) => Bb(a, x(), b, c);
        function Db(a, b) {
          if (G)
            return N(5, 1, a, b);
        }
        function Eb(a, b, c) {
          if (G)
            return N(6, 1, a, b, c);
        }
        function Fb(a, b, c) {
          return G ? N(7, 1, a, b, c) : 0;
        }
        function Gb(a, b) {
          if (G)
            return N(8, 1, a, b);
        }
        function Hb(a, b, c) {
          if (G)
            return N(9, 1, a, b, c);
        }
        function Ib(a, b, c, d) {
          if (G)
            return N(10, 1, a, b, c, d);
        }
        function Jb(a, b, c, d) {
          if (G)
            return N(11, 1, a, b, c, d);
        }
        function Kb(a, b, c, d) {
          if (G)
            return N(12, 1, a, b, c, d);
        }
        function Lb(a) {
          if (G)
            return N(13, 1, a);
        }
        function Mb(a, b) {
          if (G)
            return N(14, 1, a, b);
        }
        function Nb(a, b, c) {
          if (G)
            return N(15, 1, a, b, c);
        }
        var Ob = (a) => {
          if (null === a)
            return "null";
          var b = typeof a;
          return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
        }, Pb, R = (a) => {
          for (var b = ""; x()[a >>> 0]; )
            b += Pb[x()[a++ >>> 0]];
          return b;
        }, Qb = {}, Rb = {}, Sb = {}, Tb;
        function Ub(a, b, c = {}) {
          var d = b.name;
          if (!a)
            throw new Tb(`type "${d}" must have a positive integer typeid pointer`);
          if (Rb.hasOwnProperty(a)) {
            if (c.pf)
              return;
            throw new Tb(`Cannot register type '${d}' twice`);
          }
          Rb[a] = b;
          delete Sb[a];
          Qb.hasOwnProperty(a) && (b = Qb[a], delete Qb[a], b.forEach((e) => e()));
        }
        function S(a, b, c = {}) {
          if (!("argPackAdvance" in b))
            throw new TypeError("registerType registeredInstance requires argPackAdvance");
          Ub(a, b, c);
        }
        var Vb = (a, b, c) => {
          switch (b) {
            case 1:
              return c ? (d) => p()[d >>> 0 >>> 0] : (d) => x()[d >>> 0 >>> 0];
            case 2:
              return c ? (d) => ca()[d >>> 1 >>> 0] : (d) => ea()[d >>> 1 >>> 0];
            case 4:
              return c ? (d) => A()[d >>> 2 >>> 0] : (d) => B()[d >>> 2 >>> 0];
            case 8:
              return c ? (d) => Fa[d >>> 3] : (d) => Ga[d >>> 3];
            default:
              throw new TypeError(`invalid integer width (${b}): ${a}`);
          }
        };
        function Wb() {
          this.Ke = [void 0];
          this.Ye = [];
        }
        var T = new Wb();
        function Xb(a) {
          a >>>= 0;
          a >= T.He && 0 === --T.get(a).Ze && T.Te(a);
        }
        var U = (a) => {
          if (!a)
            throw new Tb("Cannot use deleted val. handle = " + a);
          return T.get(a).value;
        }, V = (a) => {
          switch (a) {
            case void 0:
              return 1;
            case null:
              return 2;
            case true:
              return 3;
            case false:
              return 4;
            default:
              return T.Se({ Ze: 1, value: a });
          }
        };
        function Yb(a) {
          return this.fromWireType(A()[a >>> 2 >>> 0]);
        }
        var Zb = (a, b) => {
          switch (b) {
            case 4:
              return function(c) {
                var d = this.fromWireType;
                q.buffer != r.buffer && t();
                return d.call(this, Ea[c >>> 2 >>> 0]);
              };
            case 8:
              return function(c) {
                return this.fromWireType(ja()[c >>> 3 >>> 0]);
              };
            default:
              throw new TypeError(`invalid float width (${b}): ${a}`);
          }
        };
        function $b(a) {
          return this.fromWireType(B()[a >>> 2 >>> 0]);
        }
        var ac = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, bc = (a, b) => {
          var c = a >> 1;
          for (var d = c + b / 2; !(c >= d) && ea()[c >>> 0]; )
            ++c;
          c <<= 1;
          if (32 < c - a && ac)
            return ac.decode(x().slice(a, c));
          c = "";
          for (d = 0; !(d >= b / 2); ++d) {
            var e = ca()[a + 2 * d >>> 1 >>> 0];
            if (0 == e)
              break;
            c += String.fromCharCode(e);
          }
          return c;
        }, cc = (a, b, c) => {
          void 0 === c && (c = 2147483647);
          if (2 > c)
            return 0;
          c -= 2;
          var d = b;
          c = c < 2 * a.length ? c / 2 : a.length;
          for (var e = 0; e < c; ++e) {
            var f = a.charCodeAt(e);
            ca()[b >>> 1 >>> 0] = f;
            b += 2;
          }
          ca()[b >>> 1 >>> 0] = 0;
          return b - d;
        }, dc = (a) => 2 * a.length, ec = (a, b) => {
          for (var c = 0, d = ""; !(c >= b / 4); ) {
            var e = A()[a + 4 * c >>> 2 >>> 0];
            if (0 == e)
              break;
            ++c;
            65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);
          }
          return d;
        }, fc = (a, b, c) => {
          b >>>= 0;
          void 0 === c && (c = 2147483647);
          if (4 > c)
            return 0;
          var d = b;
          c = d + c - 4;
          for (var e = 0; e < a.length; ++e) {
            var f = a.charCodeAt(e);
            if (55296 <= f && 57343 >= f) {
              var g = a.charCodeAt(++e);
              f = 65536 + ((f & 1023) << 10) | g & 1023;
            }
            A()[b >>> 2 >>> 0] = f;
            b += 4;
            if (b + 4 > c)
              break;
          }
          A()[b >>> 2 >>> 0] = 0;
          return b - d;
        }, gc = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            55296 <= d && 57343 >= d && ++c;
            b += 4;
          }
          return b;
        }, hc = (a) => {
          if (!Ca)
            try {
              if (a(), !Ma())
                try {
                  G ? ob(Da) : eb(Da);
                } catch (b) {
                  b instanceof Xa || "unwind" == b || pa(1, b);
                }
            } catch (b) {
              b instanceof Xa || "unwind" == b || pa(1, b);
            }
        };
        function ic(a) {
          a >>>= 0;
          "function" === typeof Atomics.Af && (Atomics.Af(A(), a >>> 2, a).value.then(jb), a += 128, Atomics.store(A(), a >>> 2, 1));
        }
        C.__emscripten_thread_mailbox_await = ic;
        var jb = () => {
          var a = ib();
          a && (ic(a), hc(() => jc()));
        };
        C.checkMailbox = jb;
        var kc = (a) => {
          var b = W();
          a = a();
          O(b);
          return a;
        };
        function N(a, b) {
          var c = arguments.length - 2, d = arguments;
          return kc(() => {
            for (var e = 2 * c, f = lc(8 * e), g = f >>> 3, h = 0; h < c; h++) {
              var k = d[2 + h];
              "bigint" == typeof k ? (Fa[g + 2 * h] = 1n, Fa[g + 2 * h + 1] = k) : (Fa[g + 2 * h] = 0n, ja()[g + 2 * h + 1 >>> 0] = k);
            }
            return mc(a, e, f, b);
          });
        }
        var nc = [], pc = (a, b) => {
          var c = Rb[a];
          if (void 0 === c)
            throw a = oc(a), c = R(a), X(a), new Tb(b + " has unknown type " + c);
          return c;
        }, qc = {}, rc = (a) => {
          var b = qc[a];
          return void 0 === b ? R(a) : b;
        }, sc = [], tc = () => "object" == typeof globalThis ? globalThis : Function("return this")(), uc = (a) => {
          var b = sc.length;
          sc.push(a);
          return b;
        }, vc = (a, b) => {
          for (var c = Array(a), d = 0; d < a; ++d)
            c[d] = pc(B()[b + 4 * d >>> 2 >>> 0], "parameter " + d);
          return c;
        }, wc = (a) => {
          if (void 0 === a)
            return "_unknown";
          a = a.replace(/[^a-zA-Z0-9_]/g, "$");
          var b = a.charCodeAt(0);
          return 48 <= b && 57 >= b ? `_${a}` : a;
        }, xc = {};
        function yc(a, b) {
          a = wc(a);
          return { [a]: function() {
            return b.apply(this, arguments);
          } }[a];
        }
        function zc(a) {
          var b = Function;
          if (!(b instanceof Function))
            throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);
          var c = yc(b.name || "unknownFunctionName", function() {
          });
          c.prototype = b.prototype;
          c = new c();
          a = b.apply(c, a);
          return a instanceof Object ? a : c;
        }
        var Ac = (a) => {
          for (var b = "", c = 0; c < a; ++c)
            b += (0 !== c ? ", " : "") + "arg" + c;
          var d = "return function emval_allocator_" + a + "(constructor, argTypes, args) {\n  var HEAPU32 = getMemory();\n";
          for (c = 0; c < a; ++c)
            d += "var argType" + c + " = requireRegisteredType(HEAPU32[((argTypes)>>>2)], 'parameter " + c + "');\nvar arg" + c + " = argType" + c + ".readValueFromPointer(args);\nargs += argType" + c + "['argPackAdvance'];\nargTypes += 4;\n";
          return new Function("requireRegisteredType", "Module", "valueToHandle", "getMemory", d + ("var obj = new constructor(" + b + ");\nreturn valueToHandle(obj);\n}\n"))(pc, C, V, () => B());
        }, Bc = {}, Cc = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), Dc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Ec = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        function Fc(a, b, c, d, e, f, g) {
          return G ? N(16, 1, a, b, c, d, e, f, g) : -52;
        }
        function Gc(a, b, c, d, e, f) {
          if (G)
            return N(17, 1, a, b, c, d, e, f);
        }
        var Ic = (a) => {
          var b = Ab(a) + 1, c = Hc(b);
          c && Cb(a, c, b);
          return c;
        }, Jc = {}, Lc = () => {
          if (!Kc) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: oa || "./this.program" }, b;
            for (b in Jc)
              void 0 === Jc[b] ? delete a[b] : a[b] = Jc[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            Kc = c;
          }
          return Kc;
        }, Kc;
        function Mc(a, b) {
          if (G)
            return N(18, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = 0;
          Lc().forEach((d, e) => {
            var f = b + c;
            e = B()[a + 4 * e >>> 2 >>> 0] = f;
            for (f = 0; f < d.length; ++f)
              p()[e++ >>> 0 >>> 0] = d.charCodeAt(f);
            p()[e >>> 0 >>> 0] = 0;
            c += d.length + 1;
          });
          return 0;
        }
        function Nc(a, b) {
          if (G)
            return N(19, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = Lc();
          B()[a >>> 2 >>> 0] = c.length;
          var d = 0;
          c.forEach((e) => d += e.length + 1);
          B()[b >>> 2 >>> 0] = d;
          return 0;
        }
        function Oc(a) {
          return G ? N(20, 1, a) : 52;
        }
        function Pc(a, b, c, d) {
          return G ? N(21, 1, a, b, c, d) : 52;
        }
        function Qc(a, b, c, d) {
          return G ? N(22, 1, a, b, c, d) : 70;
        }
        var Rc = [null, [], []];
        function Sc(a, b, c, d) {
          if (G)
            return N(23, 1, a, b, c, d);
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          for (var e = 0, f = 0; f < c; f++) {
            var g = B()[b >>> 2 >>> 0], h = B()[b + 4 >>> 2 >>> 0];
            b += 8;
            for (var k = 0; k < h; k++) {
              var l = x()[g + k >>> 0], n = Rc[a];
              0 === l || 10 === l ? ((1 === a ? za : L)(ab(n, 0)), n.length = 0) : n.push(l);
            }
            e += h;
          }
          B()[d >>> 2 >>> 0] = e;
          return 0;
        }
        var Tc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Uc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Vc(a) {
          var b = Array(Ab(a) + 1);
          Bb(a, b, 0, b.length);
          return b;
        }
        var Wc = (a, b) => {
          p().set(a, b >>> 0);
        };
        function Xc(a, b, c, d) {
          function e(m, w, y) {
            for (m = "number" == typeof m ? m.toString() : m || ""; m.length < w; )
              m = y[0] + m;
            return m;
          }
          function f(m, w) {
            return e(m, w, "0");
          }
          function g(m, w) {
            function y(D) {
              return 0 > D ? -1 : 0 < D ? 1 : 0;
            }
            var z;
            0 === (z = y(m.getFullYear() - w.getFullYear())) && 0 === (z = y(m.getMonth() - w.getMonth())) && (z = y(m.getDate() - w.getDate()));
            return z;
          }
          function h(m) {
            switch (m.getDay()) {
              case 0:
                return new Date(m.getFullYear() - 1, 11, 29);
              case 1:
                return m;
              case 2:
                return new Date(m.getFullYear(), 0, 3);
              case 3:
                return new Date(
                  m.getFullYear(),
                  0,
                  2
                );
              case 4:
                return new Date(m.getFullYear(), 0, 1);
              case 5:
                return new Date(m.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(m.getFullYear() - 1, 11, 30);
            }
          }
          function k(m) {
            var w = m.Ne;
            for (m = new Date(new Date(m.Oe + 1900, 0, 1).getTime()); 0 < w; ) {
              var y = m.getMonth(), z = (Cc(m.getFullYear()) ? Tc : Uc)[y];
              if (w > z - m.getDate())
                w -= z - m.getDate() + 1, m.setDate(1), 11 > y ? m.setMonth(y + 1) : (m.setMonth(0), m.setFullYear(m.getFullYear() + 1));
              else {
                m.setDate(m.getDate() + w);
                break;
              }
            }
            y = new Date(m.getFullYear() + 1, 0, 4);
            w = h(new Date(
              m.getFullYear(),
              0,
              4
            ));
            y = h(y);
            return 0 >= g(w, m) ? 0 >= g(y, m) ? m.getFullYear() + 1 : m.getFullYear() : m.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          var l = B()[d + 40 >>> 2 >>> 0];
          d = { xf: A()[d >>> 2 >>> 0], wf: A()[d + 4 >>> 2 >>> 0], Ue: A()[d + 8 >>> 2 >>> 0], Xe: A()[d + 12 >>> 2 >>> 0], Ve: A()[d + 16 >>> 2 >>> 0], Oe: A()[d + 20 >>> 2 >>> 0], Je: A()[d + 24 >>> 2 >>> 0], Ne: A()[d + 28 >>> 2 >>> 0], Df: A()[d + 32 >>> 2 >>> 0], vf: A()[d + 36 >>> 2 >>> 0], yf: l ? bb(l) : "" };
          c = bb(c);
          l = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y"
          };
          for (var n in l)
            c = c.replace(new RegExp(n, "g"), l[n]);
          var u = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), v = "January February March April May June July August September October November December".split(" ");
          l = { "%a": (m) => u[m.Je].substring(0, 3), "%A": (m) => u[m.Je], "%b": (m) => v[m.Ve].substring(0, 3), "%B": (m) => v[m.Ve], "%C": (m) => f((m.Oe + 1900) / 100 | 0, 2), "%d": (m) => f(m.Xe, 2), "%e": (m) => e(m.Xe, 2, " "), "%g": (m) => k(m).toString().substring(2), "%G": (m) => k(m), "%H": (m) => f(m.Ue, 2), "%I": (m) => {
            m = m.Ue;
            0 == m ? m = 12 : 12 < m && (m -= 12);
            return f(m, 2);
          }, "%j": (m) => {
            for (var w = 0, y = 0; y <= m.Ve - 1; w += (Cc(m.Oe + 1900) ? Tc : Uc)[y++])
              ;
            return f(m.Xe + w, 3);
          }, "%m": (m) => f(m.Ve + 1, 2), "%M": (m) => f(m.wf, 2), "%n": () => "\n", "%p": (m) => 0 <= m.Ue && 12 > m.Ue ? "AM" : "PM", "%S": (m) => f(m.xf, 2), "%t": () => "	", "%u": (m) => m.Je || 7, "%U": (m) => f(Math.floor((m.Ne + 7 - m.Je) / 7), 2), "%V": (m) => {
            var w = Math.floor((m.Ne + 7 - (m.Je + 6) % 7) / 7);
            2 >= (m.Je + 371 - m.Ne - 2) % 7 && w++;
            if (w)
              53 == w && (y = (m.Je + 371 - m.Ne) % 7, 4 == y || 3 == y && Cc(m.Oe) || (w = 1));
            else {
              w = 52;
              var y = (m.Je + 7 - m.Ne - 1) % 7;
              (4 == y || 5 == y && Cc(m.Oe % 400 - 1)) && w++;
            }
            return f(w, 2);
          }, "%w": (m) => m.Je, "%W": (m) => f(Math.floor((m.Ne + 7 - (m.Je + 6) % 7) / 7), 2), "%y": (m) => (m.Oe + 1900).toString().substring(2), "%Y": (m) => m.Oe + 1900, "%z": (m) => {
            m = m.vf;
            var w = 0 <= m;
            m = Math.abs(m) / 60;
            return (w ? "+" : "-") + String("0000" + (m / 60 * 100 + m % 60)).slice(-4);
          }, "%Z": (m) => m.yf, "%%": () => "%" };
          c = c.replace(/%%/g, "\0\0");
          for (n in l)
            c.includes(n) && (c = c.replace(new RegExp(n, "g"), l[n](d)));
          c = c.replace(/\0\0/g, "%");
          n = Vc(c);
          if (n.length > b)
            return 0;
          Wc(n, a);
          return n.length - 1;
        }
        M.We();
        for (var Yc = Array(256), Zc = 0; 256 > Zc; ++Zc)
          Yc[Zc] = String.fromCharCode(Zc);
        Pb = Yc;
        Tb = C.BindingError = class extends Error {
          constructor(a) {
            super(a);
            this.name = "BindingError";
          }
        };
        C.InternalError = class extends Error {
          constructor(a) {
            super(a);
            this.name = "InternalError";
          }
        };
        Object.assign(Wb.prototype, { get(a) {
          return this.Ke[a];
        }, has(a) {
          return void 0 !== this.Ke[a];
        }, Se(a) {
          var b = this.Ye.pop() || this.Ke.length;
          this.Ke[b] = a;
          return b;
        }, Te(a) {
          this.Ke[a] = void 0;
          this.Ye.push(a);
        } });
        T.Ke.push({ value: void 0 }, { value: null }, { value: true }, { value: false });
        T.He = T.Ke.length;
        C.count_emval_handles = () => {
          for (var a = 0, b = T.He; b < T.Ke.length; ++b)
            void 0 !== T.Ke[b] && ++a;
          return a;
        };
        var $c = [cb, db, wb, yb, zb, Db, Eb, Fb, Gb, Hb, Ib, Jb, Kb, Lb, Mb, Nb, Fc, Gc, Mc, Nc, Oc, Pc, Qc, Sc], qg = {
          u: function(a) {
            a = new rb(a >>> 0);
            a.gf() || (a.bf(true), qb--);
            a.cf(false);
            pb.push(a);
            ad(a.Re);
            return a.hf();
          },
          N: () => {
            Y(0, 0);
            var a = pb.pop();
            bd(a.Re);
            Q = 0;
          },
          b: function() {
            return vb([]);
          },
          n: function(a) {
            return vb([a >>> 0]);
          },
          y: function(a, b) {
            return vb([a >>> 0, b >>> 0]);
          },
          q: function(a, b, c) {
            return vb([a >>> 0, b >>> 0, c >>> 0]);
          },
          zb: () => {
            var a = pb.pop();
            a || Aa("no exception to throw");
            var b = a.Re;
            a.nf() || (pb.push(a), a.cf(true), a.bf(false), qb++);
            Q = b;
            throw Q;
          },
          t: function(a, b, c) {
            a >>>= 0;
            new rb(a).We(b >>> 0, c >>> 0);
            Q = a;
            qb++;
            throw Q;
          },
          Ta: () => qb,
          Wc: function(a) {
            cd(a >>> 0, !ra, 1, !qa, 131072, false);
            M.df();
          },
          Ub: function(a) {
            a >>>= 0;
            G ? postMessage({ cmd: "cleanupThread", thread: a }) : ((a = M.Ie[a]) || Aa(), M.$e(a));
          },
          Mc: xb,
          h: function(a) {
            Q || (Q = a >>> 0);
            throw Q;
          },
          Ab: yb,
          ad: zb,
          Hc: Db,
          Jc: Eb,
          Ac: Fb,
          _c: Gb,
          Tc: Hb,
          Zc: Ib,
          Wb: Jb,
          Ic: Kb,
          Fc: Lb,
          $c: Mb,
          Gc: Nb,
          Zb: function(a, b, c, d, e) {
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            b = R(b);
            var f = -1 != b.indexOf("u");
            f && (e = (1n << 64n) - 1n);
            S(a, { name: b, fromWireType: (g) => g, toWireType: function(g, h) {
              if ("bigint" != typeof h && "number" != typeof h)
                throw new TypeError(`Cannot convert "${Ob(h)}" to ${this.name}`);
              if (h < d || h > e)
                throw new TypeError(`Passing a number "${Ob(h)}" from JS side to C/C++ side to an argument of type "${b}", which is outside the valid range [${d}, ${e}]!`);
              return h;
            }, argPackAdvance: 8, readValueFromPointer: Vb(b, c, !f), Qe: null });
          },
          gd: function(a, b, c, d) {
            a >>>= 0;
            b = R(b >>> 0);
            S(a, { name: b, fromWireType: function(e) {
              return !!e;
            }, toWireType: function(e, f) {
              return f ? c : d;
            }, argPackAdvance: 8, readValueFromPointer: function(e) {
              return this.fromWireType(x()[e >>> 0]);
            }, Qe: null });
          },
          ed: function(a, b) {
            a >>>= 0;
            b = R(b >>> 0);
            S(a, { name: b, fromWireType: (c) => {
              var d = U(c);
              Xb(c);
              return d;
            }, toWireType: (c, d) => V(d), argPackAdvance: 8, readValueFromPointer: Yb, Qe: null });
          },
          Yb: function(a, b, c) {
            a >>>= 0;
            c >>>= 0;
            b = R(b >>> 0);
            S(a, { name: b, fromWireType: (d) => d, toWireType: (d, e) => e, argPackAdvance: 8, readValueFromPointer: Zb(b, c), Qe: null });
          },
          wa: function(a, b, c, d, e) {
            a >>>= 0;
            c >>>= 0;
            b = R(b >>> 0);
            -1 === e && (e = 4294967295);
            e = (h) => h;
            if (0 === d) {
              var f = 32 - 8 * c;
              e = (h) => h << f >>> f;
            }
            var g = b.includes("unsigned") ? function(h, k) {
              return k >>> 0;
            } : function(h, k) {
              return k;
            };
            S(a, { name: b, fromWireType: e, toWireType: g, argPackAdvance: 8, readValueFromPointer: Vb(b, c, 0 !== d), Qe: null });
          },
          _: function(a, b, c) {
            function d(f) {
              var g = B()[f >>> 2 >>> 0];
              f = B()[f + 4 >>> 2 >>> 0];
              return new e(p().buffer, f, g);
            }
            a >>>= 0;
            var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];
            c = R(c >>> 0);
            S(a, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d }, { pf: true });
          },
          _b: function(a, b) {
            a >>>= 0;
            b = R(b >>> 0);
            var c = "std::string" === b;
            S(a, { name: b, fromWireType: function(d) {
              var e = B()[d >>> 2 >>> 0], f = d + 4;
              if (c)
                for (var g = f, h = 0; h <= e; ++h) {
                  var k = f + h;
                  if (h == e || 0 == x()[k >>> 0]) {
                    g = bb(g, k - g);
                    if (void 0 === l)
                      var l = g;
                    else
                      l += String.fromCharCode(0), l += g;
                    g = k + 1;
                  }
                }
              else {
                l = Array(e);
                for (h = 0; h < e; ++h)
                  l[h] = String.fromCharCode(x()[f + h >>> 0]);
                l = l.join("");
              }
              X(d);
              return l;
            }, toWireType: function(d, e) {
              e instanceof ArrayBuffer && (e = new Uint8Array(e));
              var f = "string" == typeof e;
              if (!(f || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array))
                throw new Tb("Cannot pass non-string to std::string");
              var g = c && f ? Ab(e) : e.length;
              var h = Hc(4 + g + 1), k = h + 4;
              B()[h >>> 2 >>> 0] = g;
              if (c && f)
                Cb(e, k, g + 1);
              else if (f)
                for (f = 0; f < g; ++f) {
                  var l = e.charCodeAt(f);
                  if (255 < l)
                    throw X(k), new Tb("String has UTF-16 code units that do not fit in 8 bits");
                  x()[k + f >>> 0] = l;
                }
              else
                for (f = 0; f < g; ++f)
                  x()[k + f >>> 0] = e[f];
              null !== d && d.push(X, h);
              return h;
            }, argPackAdvance: 8, readValueFromPointer: $b, Qe(d) {
              X(d);
            } });
          },
          Cb: function(a, b, c) {
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            c = R(c);
            if (2 === b) {
              var d = bc;
              var e = cc;
              var f = dc;
              var g = () => ea();
              var h = 1;
            } else
              4 === b && (d = ec, e = fc, f = gc, g = () => B(), h = 2);
            S(a, { name: c, fromWireType: (k) => {
              for (var l = B()[k >>> 2 >>> 0], n = g(), u, v = k + 4, m = 0; m <= l; ++m) {
                var w = k + 4 + m * b;
                if (m == l || 0 == n[w >>> h])
                  v = d(v, w - v), void 0 === u ? u = v : (u += String.fromCharCode(0), u += v), v = w + b;
              }
              X(k);
              return u;
            }, toWireType: (k, l) => {
              if ("string" != typeof l)
                throw new Tb(`Cannot pass non-string to C++ string type ${c}`);
              var n = f(l), u = Hc(4 + n + b);
              B()[u >>> 2] = n >> h;
              e(l, u + 4, n + b);
              null !== k && k.push(X, u);
              return u;
            }, argPackAdvance: 8, readValueFromPointer: Yb, Qe(k) {
              X(k);
            } });
          },
          kd: function(a, b) {
            a >>>= 0;
            b = R(b >>> 0);
            S(a, {
              qf: true,
              name: b,
              argPackAdvance: 0,
              fromWireType: () => {
              },
              toWireType: () => {
              }
            });
          },
          dd: () => true,
          Dc: function(a, b) {
            a >>>= 0;
            a == b >>> 0 ? setTimeout(() => jb()) : G ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = M.Ie[a]) && a.postMessage({ cmd: "checkMailbox" });
          },
          Nc: function(a, b, c, d) {
            b >>>= 0;
            c /= 2;
            nc.length = c;
            d = d >>> 0 >>> 3;
            for (var e = 0; e < c; e++)
              nc[e] = Fa[d + 2 * e] ? Fa[d + 2 * e + 1] : ja()[d + 2 * e + 1 >>> 0];
            a = $c[a];
            M.mf = b;
            b = a.apply(null, nc);
            M.mf = 0;
            return b;
          },
          Vc: ic,
          cd: function(a) {
            F && M.Ie[a >>> 0].ref();
          },
          wd: function(a, b, c) {
            b >>>= 0;
            c >>>= 0;
            a = U(a >>> 0);
            b = pc(b, "emval::as");
            var d = [], e = V(d);
            B()[c >>> 2 >>> 0] = e;
            return b.toWireType(d, a);
          },
          ka: function(a, b, c, d, e) {
            c >>>= 0;
            d >>>= 0;
            e >>>= 0;
            a = sc[a >>> 0];
            b = U(b >>> 0);
            c = rc(c);
            var f = [];
            B()[d >>> 2 >>> 0] = V(f);
            return a(b, c, f, e);
          },
          Ed: function(a, b, c, d) {
            c >>>= 0;
            d >>>= 0;
            a = sc[a >>> 0];
            b = U(b >>> 0);
            c = rc(c);
            a(b, c, null, d);
          },
          zc: Xb,
          xd: function(a, b) {
            b >>>= 0;
            a = U(a >>> 0);
            b = U(b);
            return a == b;
          },
          Id: function(a) {
            a >>>= 0;
            if (0 === a)
              return V(tc());
            a = rc(a);
            return V(tc()[a]);
          },
          la: function(a, b) {
            var c = vc(a, b >>> 0), d = c[0];
            b = d.name + "_$" + c.slice(1).map(function(n) {
              return n.name;
            }).join("_") + "$";
            var e = xc[b];
            if (void 0 !== e)
              return e;
            e = ["retType"];
            for (var f = [d], g = "", h = 0; h < a - 1; ++h)
              g += (0 !== h ? ", " : "") + "arg" + h, e.push("argType" + h), f.push(c[1 + h]);
            var k = "return function " + wc("methodCaller_" + b) + "(handle, name, destructors, args) {\n", l = 0;
            for (h = 0; h < a - 1; ++h)
              k += "    var arg" + h + " = argType" + h + ".readValueFromPointer(args" + (l ? "+" + l : "") + ");\n", l += c[h + 1].argPackAdvance;
            k += "    var rv = handle[name](" + g + ");\n";
            for (h = 0; h < a - 1; ++h)
              c[h + 1].deleteObject && (k += "    argType" + h + ".deleteObject(arg" + h + ");\n");
            d.qf || (k += "    return retType.toWireType(destructors, rv);\n");
            e.push(k + "};\n");
            a = zc(e).apply(null, f);
            e = uc(a);
            return xc[b] = e;
          },
          Gd: function(a, b) {
            b >>>= 0;
            a = U(a >>> 0);
            b = U(b);
            return V(a[b]);
          },
          Q: function(a) {
            a >>>= 0;
            4 < a && (T.get(a).Ze += 1);
          },
          Ad: function(a, b, c, d) {
            c >>>= 0;
            d >>>= 0;
            a = U(a >>> 0);
            var e = Bc[b];
            e || (e = Ac(b), Bc[b] = e);
            return e(a, c, d);
          },
          qd: function() {
            return V([]);
          },
          sd: function(a) {
            a = U(a >>> 0);
            for (var b = Array(a.length), c = 0; c < a.length; c++)
              b[c] = a[c];
            return V(b);
          },
          Y: function(a) {
            return V(rc(a >>> 0));
          },
          Sa: function() {
            return V({});
          },
          Bd: function(a) {
            a >>>= 0;
            for (var b = U(a); b.length; ) {
              var c = b.pop();
              b.pop()(c);
            }
            Xb(a);
          },
          zd: function(a, b, c) {
            b >>>= 0;
            c >>>= 0;
            a = U(a >>> 0);
            b = U(b);
            c = U(c);
            a[b] = c;
          },
          gb: function(a, b) {
            b >>>= 0;
            a = pc(a >>> 0, "_emval_take_value");
            a = a.readValueFromPointer(b);
            return V(a);
          },
          Qc: function(a, b) {
            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
            b >>>= 0;
            a = new Date(1e3 * a);
            A()[b >>> 2 >>> 0] = a.getUTCSeconds();
            A()[b + 4 >>> 2 >>> 0] = a.getUTCMinutes();
            A()[b + 8 >>> 2 >>> 0] = a.getUTCHours();
            A()[b + 12 >>> 2 >>> 0] = a.getUTCDate();
            A()[b + 16 >>> 2 >>> 0] = a.getUTCMonth();
            A()[b + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;
            A()[b + 24 >>> 2 >>> 0] = a.getUTCDay();
            a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
            A()[b + 28 >>> 2 >>> 0] = a;
          },
          Rc: function(a, b) {
            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
            b >>>= 0;
            a = new Date(1e3 * a);
            A()[b >>> 2 >>> 0] = a.getSeconds();
            A()[b + 4 >>> 2 >>> 0] = a.getMinutes();
            A()[b + 8 >>> 2 >>> 0] = a.getHours();
            A()[b + 12 >>> 2 >>> 0] = a.getDate();
            A()[b + 16 >>> 2 >>> 0] = a.getMonth();
            A()[b + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;
            A()[b + 24 >>> 2 >>> 0] = a.getDay();
            var c = (Cc(a.getFullYear()) ? Dc : Ec)[a.getMonth()] + a.getDate() - 1 | 0;
            A()[b + 28 >>> 2 >>> 0] = c;
            A()[b + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());
            c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            a = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
            A()[b + 32 >>> 2 >>> 0] = a;
          },
          Sc: function(a) {
            a >>>= 0;
            var b = new Date(A()[a + 20 >>> 2 >>> 0] + 1900, A()[a + 16 >>> 2 >>> 0], A()[a + 12 >>> 2 >>> 0], A()[a + 8 >>> 2 >>> 0], A()[a + 4 >>> 2 >>> 0], A()[a >>> 2 >>> 0], 0), c = A()[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), e = new Date(
              b.getFullYear(),
              6,
              1
            ).getTimezoneOffset(), f = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), g = Math.min(f, e);
            0 > c ? A()[a + 32 >>> 2 >>> 0] = Number(e != f && g == d) : 0 < c != (g == d) && (e = Math.max(f, e), b.setTime(b.getTime() + 6e4 * ((0 < c ? g : e) - d)));
            A()[a + 24 >>> 2 >>> 0] = b.getDay();
            c = (Cc(b.getFullYear()) ? Dc : Ec)[b.getMonth()] + b.getDate() - 1 | 0;
            A()[a + 28 >>> 2 >>> 0] = c;
            A()[a >>> 2 >>> 0] = b.getSeconds();
            A()[a + 4 >>> 2 >>> 0] = b.getMinutes();
            A()[a + 8 >>> 2 >>> 0] = b.getHours();
            A()[a + 12 >>> 2 >>> 0] = b.getDate();
            A()[a + 16 >>> 2 >>> 0] = b.getMonth();
            A()[a + 20 >>> 2 >>> 0] = b.getYear();
            return BigInt(b.getTime() / 1e3);
          },
          Oc: Fc,
          Pc: Gc,
          Cc: function(a, b, c) {
            function d(l) {
              return (l = l.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? l[1] : "GMT";
            }
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            var e = (/* @__PURE__ */ new Date()).getFullYear(), f = new Date(e, 0, 1), g = new Date(e, 6, 1);
            e = f.getTimezoneOffset();
            var h = g.getTimezoneOffset(), k = Math.max(e, h);
            B()[a >>> 2 >>> 0] = 60 * k;
            A()[b >>> 2 >>> 0] = Number(e != h);
            a = d(f);
            b = d(g);
            a = Ic(a);
            b = Ic(b);
            h < e ? (B()[c >>> 2 >>> 0] = a, B()[c + 4 >>> 2 >>> 0] = b) : (B()[c >>> 2 >>> 0] = b, B()[c + 4 >>> 2 >>> 0] = a);
          },
          aa: () => {
            Aa("");
          },
          Vb: () => {
          },
          Xb: () => Date.now(),
          bd: () => {
            La += 1;
            throw "unwind";
          },
          Ec: function() {
            return 4294901760;
          },
          va: () => performance.timeOrigin + performance.now(),
          ib: () => F ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency,
          Bc: function(a) {
            a >>>= 0;
            var b = x().length;
            if (a <= b || 4294901760 < a)
              return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var d = b * (1 + 0.2 / c);
              d = Math.min(d, a + 100663296);
              var e = Math;
              d = Math.max(a, d);
              a: {
                e = (e.min.call(e, 4294901760, d + (65536 - d % 65536) % 65536) - q.buffer.byteLength + 65535) / 65536;
                try {
                  q.grow(e);
                  t();
                  var f = 1;
                  break a;
                } catch (g) {
                }
                f = void 0;
              }
              if (f)
                return true;
            }
            return false;
          },
          Xc: Mc,
          Yc: Nc,
          Lc: eb,
          Bb: Oc,
          Tb: Pc,
          Uc: Qc,
          Sb: Sc,
          hb: dd,
          fd: ed,
          sa: fd,
          G: gd,
          pa: hd,
          fa: jd,
          hd: kd,
          md: ld,
          O: md,
          A: nd,
          c: od,
          dc: pd,
          ta: qd,
          f: rd,
          Eb: sd,
          i: td,
          X: ud,
          j: vd,
          id: wd,
          k: xd,
          r: yd,
          s: zd,
          p: Ad,
          Ra: Bd,
          Wa: Cd,
          ha: Dd,
          Pb: Ed,
          _a: Fd,
          Ib: Gd,
          mb: Hd,
          ic: Id,
          wc: Jd,
          fc: Kd,
          gc: Ld,
          $b: Md,
          ja: Nd,
          yb: Od,
          ya: Pd,
          Db: Qd,
          da: Rd,
          hc: Sd,
          Pa: Td,
          F: Ud,
          L: Vd,
          Gb: Wd,
          rd: Xd,
          oa: Yd,
          M: Zd,
          $: $d,
          V: ae,
          z: be,
          Fb: ce,
          ec: de,
          C: ee,
          Hb: fe,
          pd: ge,
          Qa: he,
          cb: ie,
          jc: je,
          ac: ke,
          Mb: le,
          P: me,
          H: ne,
          D: oe,
          kb: pe,
          S: qe,
          e: re,
          Ya: se,
          l: te,
          xa: ue,
          Xa: ve,
          vb: we,
          g: xe,
          xc: ye,
          ca: ze,
          db: Ae,
          za: Be,
          lb: Ce,
          eb: De,
          d: Ee,
          uc: Fe,
          td: Ge,
          o: He,
          sc: Ie,
          m: Je,
          vc: Ke,
          rc: Le,
          vd: Me,
          w: Ne,
          Na: Oe,
          sb: Pe,
          Ma: Qe,
          Kb: Re,
          B: Se,
          E: Te,
          W: Ue,
          Va: Ve,
          oc: We,
          Cd: Xe,
          tb: Ye,
          ua: Ze,
          ia: $e,
          R: af,
          $a: bf,
          Ha: cf,
          Fd: df,
          jb: ef,
          Da: ff,
          lc: gf,
          Ca: hf,
          Ea: jf,
          jd: kf,
          Dd: lf,
          na: mf,
          ud: nf,
          Ia: of,
          Ga: pf,
          qc: qf,
          Fa: rf,
          Ja: sf,
          ob: tf,
          ga: uf,
          Aa: vf,
          kc: wf,
          pc: xf,
          Jb: yf,
          Ba: zf,
          ma: Af,
          Rb: Bf,
          od: Cf,
          U: Df,
          wb: Ef,
          bb: Ff,
          Ua: Gf,
          fb: Hf,
          K: If,
          T: Jf,
          xb: Kf,
          nd: Lf,
          ba: Mf,
          nb: Nf,
          ra: Of,
          nc: Pf,
          bc: Qf,
          Hd: Rf,
          x: Sf,
          ab: Tf,
          yd: Uf,
          Nb: Vf,
          mc: Wf,
          Jd: Xf,
          Ob: Yf,
          Lb: Zf,
          Za: $f,
          yc: ag,
          Qb: bg,
          Ka: cg,
          cc: dg,
          Z: eg,
          tc: fg,
          J: gg,
          ld: hg,
          ub: ig,
          qa: jg,
          I: kg,
          qb: lg,
          La: mg,
          Oa: ng,
          pb: og,
          rb: pg,
          v: function(a) {
            return a >>> 0;
          },
          a: q || C.wasmMemory,
          Kc: Xc,
          ea: function(a, b, c, d) {
            return Xc(a >>> 0, b >>> 0, c >>> 0, d >>> 0);
          }
        }, Z = function() {
          var a = { a: qg };
          Na++;
          Wa(a, function(b) {
            var c = b.module;
            Z = b.instance.exports;
            Z = rg();
            M.ef.push(Z.ne);
            nb = Z.qe;
            Ja.unshift(Z.Kd);
            Ba = c;
            Qa();
          }).catch(ma);
          return {};
        }();
        C._OrtInit = (a, b) => (C._OrtInit = Z.Ld)(a, b);
        C._OrtGetLastError = (a, b) => (C._OrtGetLastError = Z.Md)(a, b);
        C._OrtCreateSessionOptions = (a, b, c, d, e, f, g, h, k, l) => (C._OrtCreateSessionOptions = Z.Nd)(a, b, c, d, e, f, g, h, k, l);
        C._OrtAppendExecutionProvider = (a, b) => (C._OrtAppendExecutionProvider = Z.Od)(a, b);
        C._OrtAddFreeDimensionOverride = (a, b, c) => (C._OrtAddFreeDimensionOverride = Z.Pd)(a, b, c);
        C._OrtAddSessionConfigEntry = (a, b, c) => (C._OrtAddSessionConfigEntry = Z.Qd)(a, b, c);
        C._OrtReleaseSessionOptions = (a) => (C._OrtReleaseSessionOptions = Z.Rd)(a);
        C._OrtCreateSession = (a, b, c) => (C._OrtCreateSession = Z.Sd)(a, b, c);
        C._OrtReleaseSession = (a) => (C._OrtReleaseSession = Z.Td)(a);
        C._OrtGetInputOutputCount = (a, b, c) => (C._OrtGetInputOutputCount = Z.Ud)(a, b, c);
        C._OrtGetInputName = (a, b) => (C._OrtGetInputName = Z.Vd)(a, b);
        C._OrtGetOutputName = (a, b) => (C._OrtGetOutputName = Z.Wd)(a, b);
        C._OrtFree = (a) => (C._OrtFree = Z.Xd)(a);
        C._OrtCreateTensor = (a, b, c, d, e, f) => (C._OrtCreateTensor = Z.Yd)(a, b, c, d, e, f);
        C._OrtGetTensorData = (a, b, c, d, e) => (C._OrtGetTensorData = Z.Zd)(a, b, c, d, e);
        C._OrtReleaseTensor = (a) => (C._OrtReleaseTensor = Z._d)(a);
        C._OrtCreateRunOptions = (a, b, c, d) => (C._OrtCreateRunOptions = Z.$d)(a, b, c, d);
        C._OrtAddRunConfigEntry = (a, b, c) => (C._OrtAddRunConfigEntry = Z.ae)(a, b, c);
        C._OrtReleaseRunOptions = (a) => (C._OrtReleaseRunOptions = Z.be)(a);
        C._OrtCreateBinding = (a) => (C._OrtCreateBinding = Z.ce)(a);
        C._OrtBindInput = (a, b, c) => (C._OrtBindInput = Z.de)(a, b, c);
        C._OrtBindOutput = (a, b, c, d) => (C._OrtBindOutput = Z.ee)(a, b, c, d);
        C._OrtClearBoundOutputs = (a) => (C._OrtClearBoundOutputs = Z.fe)(a);
        C._OrtReleaseBinding = (a) => (C._OrtReleaseBinding = Z.ge)(a);
        C._OrtRunWithBinding = (a, b, c, d, e) => (C._OrtRunWithBinding = Z.he)(a, b, c, d, e);
        C._OrtRun = (a, b, c, d, e, f, g, h) => (C._OrtRun = Z.ie)(a, b, c, d, e, f, g, h);
        C._OrtEndProfiling = (a) => (C._OrtEndProfiling = Z.je)(a);
        var ib = C._pthread_self = () => (ib = C._pthread_self = Z.ke)(), Hc = C._malloc = (a) => (Hc = C._malloc = Z.le)(a), X = C._free = (a) => (X = C._free = Z.me)(a);
        C.__emscripten_tls_init = () => (C.__emscripten_tls_init = Z.ne)();
        var oc = (a) => (oc = Z.oe)(a);
        C.__embind_initialize_bindings = () => (C.__embind_initialize_bindings = Z.pe)();
        var cd = C.__emscripten_thread_init = (a, b, c, d, e, f) => (cd = C.__emscripten_thread_init = Z.re)(a, b, c, d, e, f);
        C.__emscripten_thread_crashed = () => (C.__emscripten_thread_crashed = Z.se)();
        var mc = (a, b, c, d) => (mc = Z.te)(a, b, c, d), hb = (a) => (hb = Z.ue)(a), ob = C.__emscripten_thread_exit = (a) => (ob = C.__emscripten_thread_exit = Z.ve)(a), jc = C.__emscripten_check_mailbox = () => (jc = C.__emscripten_check_mailbox = Z.we)(), Y = (a, b) => (Y = Z.xe)(a, b), tb = (a) => (tb = Z.ye)(a), lb = (a, b) => (lb = Z.ze)(a, b), W = () => (W = Z.Ae)(), O = (a) => (O = Z.Be)(a), lc = (a) => (lc = Z.Ce)(a), bd = (a) => (bd = Z.De)(a), ad = (a) => (ad = Z.Ee)(a), ub = (a, b, c) => (ub = Z.Fe)(a, b, c), sb = (a) => (sb = Z.Ge)(a);
        function td(a, b, c, d) {
          var e = W();
          try {
            return P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
          }
        }
        function rd(a, b, c) {
          var d = W();
          try {
            return P(a)(b, c);
          } catch (e) {
            O(d);
            if (e !== e + 0)
              throw e;
            Y(1, 0);
          }
        }
        function xe(a, b, c) {
          var d = W();
          try {
            P(a)(b, c);
          } catch (e) {
            O(d);
            if (e !== e + 0)
              throw e;
            Y(1, 0);
          }
        }
        function od(a, b) {
          var c = W();
          try {
            return P(a)(b);
          } catch (d) {
            O(c);
            if (d !== d + 0)
              throw d;
            Y(1, 0);
          }
        }
        function te(a, b) {
          var c = W();
          try {
            P(a)(b);
          } catch (d) {
            O(c);
            if (d !== d + 0)
              throw d;
            Y(1, 0);
          }
        }
        function Ud(a, b, c, d) {
          var e = W();
          try {
            return P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
          }
        }
        function re(a) {
          var b = W();
          try {
            P(a)();
          } catch (c) {
            O(b);
            if (c !== c + 0)
              throw c;
            Y(1, 0);
          }
        }
        function yd(a, b, c, d, e, f, g) {
          var h = W();
          try {
            return P(a)(b, c, d, e, f, g);
          } catch (k) {
            O(h);
            if (k !== k + 0)
              throw k;
            Y(1, 0);
          }
        }
        function xd(a, b, c, d, e, f) {
          var g = W();
          try {
            return P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function vd(a, b, c, d, e) {
          var f = W();
          try {
            return P(a)(b, c, d, e);
          } catch (g) {
            O(f);
            if (g !== g + 0)
              throw g;
            Y(1, 0);
          }
        }
        function Ee(a, b, c, d) {
          var e = W();
          try {
            P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
          }
        }
        function He(a, b, c, d, e) {
          var f = W();
          try {
            P(a)(b, c, d, e);
          } catch (g) {
            O(f);
            if (g !== g + 0)
              throw g;
            Y(1, 0);
          }
        }
        function nd(a) {
          var b = W();
          try {
            return P(a)();
          } catch (c) {
            O(b);
            if (c !== c + 0)
              throw c;
            Y(1, 0);
          }
        }
        function be(a, b, c) {
          var d = W();
          try {
            return P(a)(b, c);
          } catch (e) {
            O(d);
            if (e !== e + 0)
              throw e;
            Y(1, 0);
          }
        }
        function Sf(a, b, c) {
          var d = W();
          try {
            P(a)(b, c);
          } catch (e) {
            O(d);
            if (e !== e + 0)
              throw e;
            Y(1, 0);
          }
        }
        function Je(a, b, c, d, e, f) {
          var g = W();
          try {
            P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function zd(a, b, c, d, e, f, g, h) {
          var k = W();
          try {
            return P(a)(b, c, d, e, f, g, h);
          } catch (l) {
            O(k);
            if (l !== l + 0)
              throw l;
            Y(1, 0);
          }
        }
        function jd(a, b) {
          var c = W();
          try {
            return P(a)(b);
          } catch (d) {
            O(c);
            if (d !== d + 0)
              throw d;
            Y(1, 0);
          }
        }
        function me(a, b) {
          var c = W();
          try {
            return P(a)(b);
          } catch (d) {
            O(c);
            if (d !== d + 0)
              throw d;
            Y(1, 0);
            return 0n;
          }
        }
        function dd(a, b) {
          var c = W();
          try {
            return P(a)(b);
          } catch (d) {
            O(c);
            if (d !== d + 0)
              throw d;
            Y(1, 0);
          }
        }
        function Ad(a, b, c, d, e, f, g, h, k) {
          var l = W();
          try {
            return P(a)(b, c, d, e, f, g, h, k);
          } catch (n) {
            O(l);
            if (n !== n + 0)
              throw n;
            Y(1, 0);
          }
        }
        function If(a, b, c, d) {
          var e = W();
          try {
            P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
          }
        }
        function Ne(a, b, c, d, e, f, g) {
          var h = W();
          try {
            P(a)(b, c, d, e, f, g);
          } catch (k) {
            O(h);
            if (k !== k + 0)
              throw k;
            Y(1, 0);
          }
        }
        function Xf(a, b, c, d) {
          var e = W();
          try {
            P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
          }
        }
        function Bf(a, b, c, d, e, f, g) {
          var h = W();
          try {
            P(a)(b, c, d, e, f, g);
          } catch (k) {
            O(h);
            if (k !== k + 0)
              throw k;
            Y(1, 0);
          }
        }
        function Se(a, b, c, d, e, f, g, h) {
          var k = W();
          try {
            P(a)(b, c, d, e, f, g, h);
          } catch (l) {
            O(k);
            if (l !== l + 0)
              throw l;
            Y(1, 0);
          }
        }
        function Mf(a, b, c, d, e) {
          var f = W();
          try {
            P(a)(b, c, d, e);
          } catch (g) {
            O(f);
            if (g !== g + 0)
              throw g;
            Y(1, 0);
          }
        }
        function Bd(a, b, c, d, e, f, g, h, k, l) {
          var n = W();
          try {
            return P(a)(b, c, d, e, f, g, h, k, l);
          } catch (u) {
            O(n);
            if (u !== u + 0)
              throw u;
            Y(1, 0);
          }
        }
        function Te(a, b, c, d, e, f, g, h, k) {
          var l = W();
          try {
            P(a)(b, c, d, e, f, g, h, k);
          } catch (n) {
            O(l);
            if (n !== n + 0)
              throw n;
            Y(1, 0);
          }
        }
        function Od(a, b, c, d, e, f, g, h, k, l, n) {
          var u = W();
          try {
            return P(a)(b, c, d, e, f, g, h, k, l, n);
          } catch (v) {
            O(u);
            if (v !== v + 0)
              throw v;
            Y(1, 0);
          }
        }
        function ag(a, b, c, d, e, f, g, h, k) {
          var l = W();
          try {
            P(a)(b, c, d, e, f, g, h, k);
          } catch (n) {
            O(l);
            if (n !== n + 0)
              throw n;
            Y(1, 0);
          }
        }
        function Kf(a, b, c, d, e, f, g) {
          var h = W();
          try {
            P(a)(b, c, d, e, f, g);
          } catch (k) {
            O(h);
            if (k !== k + 0)
              throw k;
            Y(1, 0);
          }
        }
        function Ue(a, b, c, d, e, f, g, h, k, l) {
          var n = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l);
          } catch (u) {
            O(n);
            if (u !== u + 0)
              throw u;
            Y(1, 0);
          }
        }
        function ne(a, b, c) {
          var d = W();
          try {
            return P(a)(b, c);
          } catch (e) {
            O(d);
            if (e !== e + 0)
              throw e;
            Y(1, 0);
            return 0n;
          }
        }
        function ye(a, b, c, d) {
          var e = W();
          try {
            P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
          }
        }
        function Jd(a, b, c, d, e, f, g, h, k) {
          var l = W();
          try {
            return P(a)(b, c, d, e, f, g, h, k);
          } catch (n) {
            O(l);
            if (n !== n + 0)
              throw n;
            Y(1, 0);
          }
        }
        function Dd(a, b, c, d, e, f, g, h, k, l, n, u) {
          var v = W();
          try {
            return P(a)(b, c, d, e, f, g, h, k, l, n, u);
          } catch (m) {
            O(v);
            if (m !== m + 0)
              throw m;
            Y(1, 0);
          }
        }
        function bf(a, b, c, d, e, f, g, h, k, l, n, u, v, m) {
          var w = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m);
          } catch (y) {
            O(w);
            if (y !== y + 0)
              throw y;
            Y(1, 0);
          }
        }
        function Rf(a, b, c, d, e, f, g, h, k, l, n, u) {
          var v = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u);
          } catch (m) {
            O(v);
            if (m !== m + 0)
              throw m;
            Y(1, 0);
          }
        }
        function Ef(a, b, c, d, e, f, g, h, k, l, n, u) {
          var v = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u);
          } catch (m) {
            O(v);
            if (m !== m + 0)
              throw m;
            Y(1, 0);
          }
        }
        function Jf(a, b, c, d, e) {
          var f = W();
          try {
            P(a)(b, c, d, e);
          } catch (g) {
            O(f);
            if (g !== g + 0)
              throw g;
            Y(1, 0);
          }
        }
        function we(a, b, c, d, e, f, g) {
          var h = W();
          try {
            P(a)(b, c, d, e, f, g);
          } catch (k) {
            O(h);
            if (k !== k + 0)
              throw k;
            Y(1, 0);
          }
        }
        function Hf(a, b, c, d, e, f, g, h, k) {
          var l = W();
          try {
            P(a)(b, c, d, e, f, g, h, k);
          } catch (n) {
            O(l);
            if (n !== n + 0)
              throw n;
            Y(1, 0);
          }
        }
        function De(a, b, c, d, e, f, g) {
          var h = W();
          try {
            P(a)(b, c, d, e, f, g);
          } catch (k) {
            O(h);
            if (k !== k + 0)
              throw k;
            Y(1, 0);
          }
        }
        function Ke(a, b, c, d, e, f, g, h, k, l, n) {
          var u = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n);
          } catch (v) {
            O(u);
            if (v !== v + 0)
              throw v;
            Y(1, 0);
          }
        }
        function ig(a, b, c, d, e, f, g, h) {
          var k = W();
          try {
            P(a)(b, c, d, e, f, g, h);
          } catch (l) {
            O(k);
            if (l !== l + 0)
              throw l;
            Y(1, 0);
          }
        }
        function oe(a, b, c, d) {
          var e = W();
          try {
            return P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
            return 0n;
          }
        }
        function Fe(a, b, c, d, e) {
          var f = W();
          try {
            P(a)(b, c, d, e);
          } catch (g) {
            O(f);
            if (g !== g + 0)
              throw g;
            Y(1, 0);
          }
        }
        function df(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z) {
          var D = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z);
          } catch (E) {
            O(D);
            if (E !== E + 0)
              throw E;
            Y(1, 0);
          }
        }
        function fg(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y) {
          var z = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y);
          } catch (D) {
            O(z);
            if (D !== D + 0)
              throw D;
            Y(1, 0);
          }
        }
        function Af(a, b, c, d, e, f) {
          var g = W();
          try {
            P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function bg(a, b, c, d, e, f, g, h, k) {
          var l = W();
          try {
            P(a)(b, c, d, e, f, g, h, k);
          } catch (n) {
            O(l);
            if (n !== n + 0)
              throw n;
            Y(1, 0);
          }
        }
        function Vd(a, b, c, d, e) {
          var f = W();
          try {
            return P(a)(b, c, d, e);
          } catch (g) {
            O(f);
            if (g !== g + 0)
              throw g;
            Y(1, 0);
          }
        }
        function $d(a, b, c, d, e, f, g, h, k, l, n, u, v, m) {
          var w = W();
          try {
            return P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m);
          } catch (y) {
            O(w);
            if (y !== y + 0)
              throw y;
            Y(1, 0);
          }
        }
        function gg(a, b) {
          var c = W();
          try {
            P(a)(b);
          } catch (d) {
            O(c);
            if (d !== d + 0)
              throw d;
            Y(1, 0);
          }
        }
        function qe(a, b, c) {
          var d = W();
          try {
            return P(a)(b, c);
          } catch (e) {
            O(d);
            if (e !== e + 0)
              throw e;
            Y(1, 0);
            return 0n;
          }
        }
        function Zd(a, b, c, d, e, f, g, h, k, l) {
          var n = W();
          try {
            return P(a)(b, c, d, e, f, g, h, k, l);
          } catch (u) {
            O(n);
            if (u !== u + 0)
              throw u;
            Y(1, 0);
          }
        }
        function md(a, b, c, d, e) {
          var f = W();
          try {
            return P(a)(b, c, d, e);
          } catch (g) {
            O(f);
            if (g !== g + 0)
              throw g;
            Y(1, 0);
          }
        }
        function Ye(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w) {
          var y = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w);
          } catch (z) {
            O(y);
            if (z !== z + 0)
              throw z;
            Y(1, 0);
          }
        }
        function se(a, b, c, d, e) {
          var f = W();
          try {
            P(a)(b, c, d, e);
          } catch (g) {
            O(f);
            if (g !== g + 0)
              throw g;
            Y(1, 0);
          }
        }
        function Ie(a, b, c, d, e, f, g) {
          var h = W();
          try {
            P(a)(b, c, d, e, f, g);
          } catch (k) {
            O(h);
            if (k !== k + 0)
              throw k;
            Y(1, 0);
          }
        }
        function Ae(a, b, c, d, e) {
          var f = W();
          try {
            P(a)(b, c, d, e);
          } catch (g) {
            O(f);
            if (g !== g + 0)
              throw g;
            Y(1, 0);
          }
        }
        function Le(a, b, c, d, e, f, g, h) {
          var k = W();
          try {
            P(a)(b, c, d, e, f, g, h);
          } catch (l) {
            O(k);
            if (l !== l + 0)
              throw l;
            Y(1, 0);
          }
        }
        function lf(a, b, c, d, e, f, g, h, k, l, n) {
          var u = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n);
          } catch (v) {
            O(u);
            if (v !== v + 0)
              throw v;
            Y(1, 0);
          }
        }
        function Ed(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z) {
          var D = W();
          try {
            return P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z);
          } catch (E) {
            O(D);
            if (E !== E + 0)
              throw E;
            Y(1, 0);
          }
        }
        function af(a, b, c, d, e, f, g, h, k, l, n, u, v) {
          var m = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v);
          } catch (w) {
            O(m);
            if (w !== w + 0)
              throw w;
            Y(1, 0);
          }
        }
        function he(a, b) {
          var c = W();
          try {
            return P(a)(b);
          } catch (d) {
            O(c);
            if (d !== d + 0)
              throw d;
            Y(1, 0);
          }
        }
        function Fd(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I) {
          var J = W();
          try {
            return P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I);
          } catch (K) {
            O(J);
            if (K !== K + 0)
              throw K;
            Y(1, 0);
          }
        }
        function $f(a, b, c, d, e, f, g, h, k, l) {
          var n = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l);
          } catch (u) {
            O(n);
            if (u !== u + 0)
              throw u;
            Y(1, 0);
          }
        }
        function Td(a, b, c, d, e, f, g) {
          var h = W();
          try {
            return P(a)(b, c, d, e, f, g);
          } catch (k) {
            O(h);
            if (k !== k + 0)
              throw k;
            Y(1, 0);
          }
        }
        function Ze(a, b, c, d, e, f, g, h, k, l, n) {
          var u = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n);
          } catch (v) {
            O(u);
            if (v !== v + 0)
              throw v;
            Y(1, 0);
          }
        }
        function ae(a, b, c, d, e, f) {
          var g = W();
          try {
            return P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function vf(a, b, c, d, e, f) {
          var g = W();
          try {
            P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function Xe(a, b, c, d, e, f, g, h, k, l, n, u, v, m) {
          var w = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m);
          } catch (y) {
            O(w);
            if (y !== y + 0)
              throw y;
            Y(1, 0);
          }
        }
        function ng(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D) {
          var E = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D);
          } catch (I) {
            O(E);
            if (I !== I + 0)
              throw I;
            Y(1, 0);
          }
        }
        function Pe(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z) {
          var D = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z);
          } catch (E) {
            O(D);
            if (E !== E + 0)
              throw E;
            Y(1, 0);
          }
        }
        function Oe(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y) {
          var z = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y);
          } catch (D) {
            O(z);
            if (D !== D + 0)
              throw D;
            Y(1, 0);
          }
        }
        function Qe(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w) {
          var y = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w);
          } catch (z) {
            O(y);
            if (z !== z + 0)
              throw z;
            Y(1, 0);
          }
        }
        function pg(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I, J) {
          var K = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I, J);
          } catch (aa) {
            O(K);
            if (aa !== aa + 0)
              throw aa;
            Y(1, 0);
          }
        }
        function mg(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E) {
          var I = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E);
          } catch (J) {
            O(I);
            if (J !== J + 0)
              throw J;
            Y(1, 0);
          }
        }
        function lg(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z) {
          var D = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z);
          } catch (E) {
            O(D);
            if (E !== E + 0)
              throw E;
            Y(1, 0);
          }
        }
        function og(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I) {
          var J = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I);
          } catch (K) {
            O(J);
            if (K !== K + 0)
              throw K;
            Y(1, 0);
          }
        }
        function Yf(a, b, c, d, e, f, g, h, k, l) {
          var n = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l);
          } catch (u) {
            O(n);
            if (u !== u + 0)
              throw u;
            Y(1, 0);
          }
        }
        function Vf(a, b, c, d, e, f, g, h, k, l, n) {
          var u = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n);
          } catch (v) {
            O(u);
            if (v !== v + 0)
              throw v;
            Y(1, 0);
          }
        }
        function eg(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w) {
          var y = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w);
          } catch (z) {
            O(y);
            if (z !== z + 0)
              throw z;
            Y(1, 0);
          }
        }
        function kg(a, b, c, d, e, f, g, h, k, l) {
          var n = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l);
          } catch (u) {
            O(n);
            if (u !== u + 0)
              throw u;
            Y(1, 0);
          }
        }
        function jg(a, b, c, d, e, f, g, h, k) {
          var l = W();
          try {
            P(a)(b, c, d, e, f, g, h, k);
          } catch (n) {
            O(l);
            if (n !== n + 0)
              throw n;
            Y(1, 0);
          }
        }
        function hd(a, b, c, d, e, f, g) {
          var h = W();
          try {
            return P(a)(b, c, d, e, f, g);
          } catch (k) {
            O(h);
            if (k !== k + 0)
              throw k;
            Y(1, 0);
          }
        }
        function Be(a, b, c, d, e) {
          var f = W();
          try {
            P(a)(b, c, d, e);
          } catch (g) {
            O(f);
            if (g !== g + 0)
              throw g;
            Y(1, 0);
          }
        }
        function le(a, b, c) {
          var d = W();
          try {
            return P(a)(b, c);
          } catch (e) {
            O(d);
            if (e !== e + 0)
              throw e;
            Y(1, 0);
            return 0n;
          }
        }
        function Nd(a, b, c, d, e, f, g) {
          var h = W();
          try {
            return P(a)(b, c, d, e, f, g);
          } catch (k) {
            O(h);
            if (k !== k + 0)
              throw k;
            Y(1, 0);
          }
        }
        function Zf(a, b, c, d, e, f) {
          var g = W();
          try {
            P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function Df(a, b, c, d, e, f, g, h, k, l, n) {
          var u = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n);
          } catch (v) {
            O(u);
            if (v !== v + 0)
              throw v;
            Y(1, 0);
          }
        }
        function tf(a, b, c, d, e, f, g, h, k, l, n, u, v) {
          var m = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v);
          } catch (w) {
            O(m);
            if (w !== w + 0)
              throw w;
            Y(1, 0);
          }
        }
        function Rd(a, b, c, d, e, f) {
          var g = W();
          try {
            return P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function qf(a, b, c, d, e, f, g, h, k, l, n, u, v) {
          var m = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v);
          } catch (w) {
            O(m);
            if (w !== w + 0)
              throw w;
            Y(1, 0);
          }
        }
        function xf(a, b, c, d, e, f, g, h) {
          var k = W();
          try {
            P(a)(b, c, d, e, f, g, h);
          } catch (l) {
            O(k);
            if (l !== l + 0)
              throw l;
            Y(1, 0);
          }
        }
        function Of(a, b, c, d, e, f, g, h) {
          var k = W();
          try {
            P(a)(b, c, d, e, f, g, h);
          } catch (l) {
            O(k);
            if (l !== l + 0)
              throw l;
            Y(1, 0);
          }
        }
        function ie(a, b, c, d) {
          var e = W();
          try {
            return P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
          }
        }
        function uf(a, b, c, d, e, f, g, h, k, l) {
          var n = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l);
          } catch (u) {
            O(n);
            if (u !== u + 0)
              throw u;
            Y(1, 0);
          }
        }
        function cg(a, b, c, d, e, f, g, h, k) {
          var l = W();
          try {
            P(a)(b, c, d, e, f, g, h, k);
          } catch (n) {
            O(l);
            if (n !== n + 0)
              throw n;
            Y(1, 0);
          }
        }
        function sf(a, b, c, d, e, f, g, h, k) {
          var l = W();
          try {
            P(a)(b, c, d, e, f, g, h, k);
          } catch (n) {
            O(l);
            if (n !== n + 0)
              throw n;
            Y(1, 0);
          }
        }
        function of(a, b, c, d, e, f, g, h, k, l) {
          var n = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l);
          } catch (u) {
            O(n);
            if (u !== u + 0)
              throw u;
            Y(1, 0);
          }
        }
        function Uf(a, b, c, d, e, f) {
          var g = W();
          try {
            P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function We(a, b, c, d, e, f, g, h, k, l, n, u) {
          var v = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u);
          } catch (m) {
            O(v);
            if (m !== m + 0)
              throw m;
            Y(1, 0);
          }
        }
        function Ff(a, b, c, d, e, f, g, h, k, l, n, u, v, m) {
          var w = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m);
          } catch (y) {
            O(w);
            if (y !== y + 0)
              throw y;
            Y(1, 0);
          }
        }
        function Yd(a, b, c, d, e, f, g, h) {
          var k = W();
          try {
            return P(a)(b, c, d, e, f, g, h);
          } catch (l) {
            O(k);
            if (l !== l + 0)
              throw l;
            Y(1, 0);
          }
        }
        function cf(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w) {
          var y = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w);
          } catch (z) {
            O(y);
            if (z !== z + 0)
              throw z;
            Y(1, 0);
          }
        }
        function pf(a, b, c, d, e, f, g, h, k, l, n, u, v, m) {
          var w = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m);
          } catch (y) {
            O(w);
            if (y !== y + 0)
              throw y;
            Y(1, 0);
          }
        }
        function mf(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w) {
          var y = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w);
          } catch (z) {
            O(y);
            if (z !== z + 0)
              throw z;
            Y(1, 0);
          }
        }
        function ve(a, b, c) {
          var d = W();
          try {
            P(a)(b, c);
          } catch (e) {
            O(d);
            if (e !== e + 0)
              throw e;
            Y(1, 0);
          }
        }
        function Pf(a, b, c, d, e, f, g, h, k) {
          var l = W();
          try {
            P(a)(b, c, d, e, f, g, h, k);
          } catch (n) {
            O(l);
            if (n !== n + 0)
              throw n;
            Y(1, 0);
          }
        }
        function Re(a, b, c, d, e, f, g, h, k, l, n) {
          var u = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n);
          } catch (v) {
            O(u);
            if (v !== v + 0)
              throw v;
            Y(1, 0);
          }
        }
        function rf(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I, J, K, aa, ug, vg, wg) {
          var xg = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I, J, K, aa, ug, vg, wg);
          } catch (fb) {
            O(xg);
            if (fb !== fb + 0)
              throw fb;
            Y(1, 0);
          }
        }
        function Nf(a, b, c, d, e, f) {
          var g = W();
          try {
            P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function Hd(a, b, c, d, e, f, g, h, k, l, n, u, v) {
          var m = W();
          try {
            return P(a)(b, c, d, e, f, g, h, k, l, n, u, v);
          } catch (w) {
            O(m);
            if (w !== w + 0)
              throw w;
            Y(1, 0);
          }
        }
        function $e(a, b, c, d, e, f, g, h, k, l, n, u) {
          var v = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u);
          } catch (m) {
            O(v);
            if (m !== m + 0)
              throw m;
            Y(1, 0);
          }
        }
        function Ce(a, b, c, d, e, f, g, h, k, l, n, u, v) {
          var m = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v);
          } catch (w) {
            O(m);
            if (w !== w + 0)
              throw w;
            Y(1, 0);
          }
        }
        function jf(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I, J) {
          var K = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I, J);
          } catch (aa) {
            O(K);
            if (aa !== aa + 0)
              throw aa;
            Y(1, 0);
          }
        }
        function qd(a, b, c) {
          var d = W();
          try {
            return P(a)(b, c);
          } catch (e) {
            O(d);
            if (e !== e + 0)
              throw e;
            Y(1, 0);
          }
        }
        function Me(a, b, c, d, e, f, g, h, k, l, n, u, v) {
          var m = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v);
          } catch (w) {
            O(m);
            if (w !== w + 0)
              throw w;
            Y(1, 0);
          }
        }
        function Wf(a, b, c, d, e, f, g, h, k, l, n, u, v, m) {
          var w = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m);
          } catch (y) {
            O(w);
            if (y !== y + 0)
              throw y;
            Y(1, 0);
          }
        }
        function yf(a, b, c, d, e, f, g, h) {
          var k = W();
          try {
            P(a)(b, c, d, e, f, g, h);
          } catch (l) {
            O(k);
            if (l !== l + 0)
              throw l;
            Y(1, 0);
          }
        }
        function ff(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z) {
          var D = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z);
          } catch (E) {
            O(D);
            if (E !== E + 0)
              throw E;
            Y(1, 0);
          }
        }
        function hf(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I) {
          var J = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I);
          } catch (K) {
            O(J);
            if (K !== K + 0)
              throw K;
            Y(1, 0);
          }
        }
        function gf(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E) {
          var I = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E);
          } catch (J) {
            O(I);
            if (J !== J + 0)
              throw J;
            Y(1, 0);
          }
        }
        function nf(a, b, c, d, e, f, g, h, k, l, n) {
          var u = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n);
          } catch (v) {
            O(u);
            if (v !== v + 0)
              throw v;
            Y(1, 0);
          }
        }
        function Cd(a, b, c, d, e, f, g, h, k, l, n) {
          var u = W();
          try {
            return P(a)(b, c, d, e, f, g, h, k, l, n);
          } catch (v) {
            O(u);
            if (v !== v + 0)
              throw v;
            Y(1, 0);
          }
        }
        function Gd(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I) {
          var J = W();
          try {
            return P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I);
          } catch (K) {
            O(J);
            if (K !== K + 0)
              throw K;
            Y(1, 0);
          }
        }
        function Ge(a, b, c, d, e) {
          var f = W();
          try {
            P(a)(b, c, d, e);
          } catch (g) {
            O(f);
            if (g !== g + 0)
              throw g;
            Y(1, 0);
          }
        }
        function Ve(a, b, c, d, e, f, g, h, k, l, n, u) {
          var v = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u);
          } catch (m) {
            O(v);
            if (m !== m + 0)
              throw m;
            Y(1, 0);
          }
        }
        function ee(a, b, c, d, e) {
          var f = W();
          try {
            return P(a)(b, c, d, e);
          } catch (g) {
            O(f);
            if (g !== g + 0)
              throw g;
            Y(1, 0);
          }
        }
        function pe(a, b, c, d) {
          var e = W();
          try {
            return P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
            return 0n;
          }
        }
        function wf(a, b, c, d, e, f, g) {
          var h = W();
          try {
            P(a)(b, c, d, e, f, g);
          } catch (k) {
            O(h);
            if (k !== k + 0)
              throw k;
            Y(1, 0);
          }
        }
        function fe(a, b, c, d, e, f) {
          var g = W();
          try {
            return P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function zf(a, b, c, d, e) {
          var f = W();
          try {
            P(a)(b, c, d, e);
          } catch (g) {
            O(f);
            if (g !== g + 0)
              throw g;
            Y(1, 0);
          }
        }
        function je(a, b, c, d, e, f) {
          var g = W();
          try {
            return P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function Gf(a, b, c, d, e, f, g, h, k) {
          var l = W();
          try {
            P(a)(b, c, d, e, f, g, h, k);
          } catch (n) {
            O(l);
            if (n !== n + 0)
              throw n;
            Y(1, 0);
          }
        }
        function ze(a, b, c, d) {
          var e = W();
          try {
            P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
          }
        }
        function Pd(a, b, c, d, e, f, g, h) {
          var k = W();
          try {
            return P(a)(b, c, d, e, f, g, h);
          } catch (l) {
            O(k);
            if (l !== l + 0)
              throw l;
            Y(1, 0);
          }
        }
        function Tf(a, b, c, d) {
          var e = W();
          try {
            P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
          }
        }
        function ud(a, b, c, d, e, f) {
          var g = W();
          try {
            return P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function Wd(a, b, c, d, e, f) {
          var g = W();
          try {
            return P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function Id(a, b, c, d, e, f, g, h, k, l, n, u) {
          var v = W();
          try {
            return P(a)(b, c, d, e, f, g, h, k, l, n, u);
          } catch (m) {
            O(v);
            if (m !== m + 0)
              throw m;
            Y(1, 0);
          }
        }
        function Sd(a, b, c, d, e, f, g, h) {
          var k = W();
          try {
            return P(a)(b, c, d, e, f, g, h);
          } catch (l) {
            O(k);
            if (l !== l + 0)
              throw l;
            Y(1, 0);
          }
        }
        function Ld(a, b, c, d, e, f, g, h, k, l, n) {
          var u = W();
          try {
            return P(a)(b, c, d, e, f, g, h, k, l, n);
          } catch (v) {
            O(u);
            if (v !== v + 0)
              throw v;
            Y(1, 0);
          }
        }
        function Xd(a, b, c, d, e, f, g) {
          var h = W();
          try {
            return P(a)(b, c, d, e, f, g);
          } catch (k) {
            O(h);
            if (k !== k + 0)
              throw k;
            Y(1, 0);
          }
        }
        function Kd(a, b, c, d, e, f, g, h, k, l, n, u, v) {
          var m = W();
          try {
            return P(a)(b, c, d, e, f, g, h, k, l, n, u, v);
          } catch (w) {
            O(m);
            if (w !== w + 0)
              throw w;
            Y(1, 0);
          }
        }
        function de(a, b, c, d, e, f, g) {
          var h = W();
          try {
            return P(a)(b, c, d, e, f, g);
          } catch (k) {
            O(h);
            if (k !== k + 0)
              throw k;
            Y(1, 0);
          }
        }
        function ge(a, b, c, d, e, f, g) {
          var h = W();
          try {
            return P(a)(b, c, d, e, f, g);
          } catch (k) {
            O(h);
            if (k !== k + 0)
              throw k;
            Y(1, 0);
          }
        }
        function ce(a, b, c, d) {
          var e = W();
          try {
            return P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
          }
        }
        function Cf(a, b, c, d, e, f, g, h, k, l) {
          var n = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l);
          } catch (u) {
            O(n);
            if (u !== u + 0)
              throw u;
            Y(1, 0);
          }
        }
        function Lf(a, b, c, d, e, f, g, h, k, l, n, u, v) {
          var m = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v);
          } catch (w) {
            O(m);
            if (w !== w + 0)
              throw w;
            Y(1, 0);
          }
        }
        function pd(a, b, c) {
          var d = W();
          try {
            return P(a)(b, c);
          } catch (e) {
            O(d);
            if (e !== e + 0)
              throw e;
            Y(1, 0);
          }
        }
        function sd(a, b, c, d) {
          var e = W();
          try {
            return P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
          }
        }
        function ue(a, b, c, d) {
          var e = W();
          try {
            P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
          }
        }
        function ld(a, b, c, d) {
          var e = W();
          try {
            return P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
          }
        }
        function hg(a, b, c, d, e) {
          var f = W();
          try {
            P(a)(b, c, d, e);
          } catch (g) {
            O(f);
            if (g !== g + 0)
              throw g;
            Y(1, 0);
          }
        }
        function gd(a, b, c, d, e, f) {
          var g = W();
          try {
            return P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function dg(a, b, c, d, e, f, g, h, k, l, n, u, v) {
          var m = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v);
          } catch (w) {
            O(m);
            if (w !== w + 0)
              throw w;
            Y(1, 0);
          }
        }
        function Qf(a, b, c, d, e, f, g, h, k, l) {
          var n = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l);
          } catch (u) {
            O(n);
            if (u !== u + 0)
              throw u;
            Y(1, 0);
          }
        }
        function fd(a, b, c, d) {
          var e = W();
          try {
            return P(a)(b, c, d);
          } catch (f) {
            O(e);
            if (f !== f + 0)
              throw f;
            Y(1, 0);
          }
        }
        function kf(a, b, c, d, e, f, g, h, k, l, n, u) {
          var v = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u);
          } catch (m) {
            O(v);
            if (m !== m + 0)
              throw m;
            Y(1, 0);
          }
        }
        function Qd(a, b, c, d, e) {
          var f = W();
          try {
            return P(a)(b, c, d, e);
          } catch (g) {
            O(f);
            if (g !== g + 0)
              throw g;
            Y(1, 0);
          }
        }
        function ke(a) {
          var b = W();
          try {
            return P(a)();
          } catch (c) {
            O(b);
            if (c !== c + 0)
              throw c;
            Y(1, 0);
            return 0n;
          }
        }
        function Md(a, b, c, d, e, f) {
          var g = W();
          try {
            return P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function wd(a, b, c, d, e, f) {
          var g = W();
          try {
            return P(a)(b, c, d, e, f);
          } catch (h) {
            O(g);
            if (h !== h + 0)
              throw h;
            Y(1, 0);
          }
        }
        function ef(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y) {
          var z = W();
          try {
            P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y);
          } catch (D) {
            O(z);
            if (D !== D + 0)
              throw D;
            Y(1, 0);
          }
        }
        function kd(a, b, c) {
          var d = W();
          try {
            return P(a)(b, c);
          } catch (e) {
            O(d);
            if (e !== e + 0)
              throw e;
            Y(1, 0);
          }
        }
        function ed(a, b, c) {
          var d = W();
          try {
            return P(a)(b, c);
          } catch (e) {
            O(d);
            if (e !== e + 0)
              throw e;
            Y(1, 0);
          }
        }
        function rg() {
          var a = Z;
          a = Object.assign({}, a);
          var b = (d) => () => d() >>> 0, c = (d) => (e) => d(e) >>> 0;
          a.__errno_location = b(a.__errno_location);
          a.ke = b(a.ke);
          a.le = c(a.le);
          a.oe = c(a.oe);
          a.Ae = b(a.Ae);
          a.Ce = c(a.Ce);
          return a;
        }
        C.keepRuntimeAlive = Ma;
        C.wasmMemory = q;
        C.stackAlloc = lc;
        C.stackSave = W;
        C.stackRestore = O;
        C.UTF8ToString = bb;
        C.stringToUTF8 = Cb;
        C.lengthBytesUTF8 = Ab;
        C.ExitStatus = Xa;
        C.PThread = M;
        var sg;
        Pa = function tg() {
          sg || yg();
          sg || (Pa = tg);
        };
        function yg() {
          0 < Na || (G ? (la(C), G || kb(Ja), startWorker(C)) : (kb(Ia), 0 < Na || sg || (sg = true, C.calledRun = true, Ca || (G || kb(Ja), la(C), G || kb(Ka)))));
        }
        yg();
        return moduleArg.ready;
      };
    })();
    if (typeof exports === "object" && typeof module2 === "object")
      module2.exports = ortWasmThreaded;
    else if (typeof define === "function" && define["amd"])
      define([], () => ortWasmThreaded);
  }
});

// web/lib/wasm/binding/ort-wasm-threaded.worker.js
var require_ort_wasm_threaded_worker = __commonJS({
  "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module2) {
    module2.exports = '"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>(0,eval)(fs.readFileSync(f,"utf8")+"//# sourceURL="+f),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*is_main=*/0,/*is_runtime=*/0,/*can_block=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){Module["__embind_initialize_bindings"]();initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err(`worker.js received unknown command ${e.data.cmd}`);err(e.data)}}catch(ex){if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}}self.onmessage=handleMessage;\n';
  }
});

// web/lib/wasm/wasm-factory.ts
var ortWasmFactory, ortWasmFactoryThreaded, wasm, initialized, initializing, aborted, isMultiThreadSupported, isSimdSupported, getWasmFileName, initializeWebAssembly, getInstance;
var init_wasm_factory = __esm({
  "web/lib/wasm/wasm-factory.ts"() {
    "use strict";
    init_node_path();
    if (true) {
      ortWasmFactory = require_ort_training_wasm_simd();
    } else {
      ortWasmFactory = true ? null : null;
    }
    ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;
    initialized = false;
    initializing = false;
    aborted = false;
    isMultiThreadSupported = () => {
      try {
        if (typeof SharedArrayBuffer === "undefined") {
          return false;
        }
        if (typeof MessageChannel !== "undefined") {
          new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));
        }
        return WebAssembly.validate(new Uint8Array([
          0,
          97,
          115,
          109,
          1,
          0,
          0,
          0,
          1,
          4,
          1,
          96,
          0,
          0,
          3,
          2,
          1,
          0,
          5,
          4,
          1,
          3,
          1,
          1,
          10,
          11,
          1,
          9,
          0,
          65,
          0,
          254,
          16,
          2,
          0,
          26,
          11
        ]));
      } catch (e) {
        return false;
      }
    };
    isSimdSupported = () => {
      try {
        return WebAssembly.validate(new Uint8Array([
          0,
          97,
          115,
          109,
          1,
          0,
          0,
          0,
          1,
          4,
          1,
          96,
          0,
          0,
          3,
          2,
          1,
          0,
          10,
          30,
          1,
          28,
          0,
          65,
          0,
          253,
          15,
          253,
          12,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          253,
          186,
          1,
          26,
          11
        ]));
      } catch (e) {
        return false;
      }
    };
    getWasmFileName = (useSimd, useThreads) => {
      if (useSimd) {
        if (true) {
          return "ort-training-wasm-simd.wasm";
        }
        return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";
      } else {
        return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";
      }
    };
    initializeWebAssembly = async (flags) => {
      if (initialized) {
        return Promise.resolve();
      }
      if (initializing) {
        throw new Error("multiple calls to 'initializeWebAssembly()' detected.");
      }
      if (aborted) {
        throw new Error("previous call to 'initializeWebAssembly()' failed.");
      }
      initializing = true;
      const timeout = flags.initTimeout;
      const numThreads = flags.numThreads;
      const simd = flags.simd;
      const useThreads = numThreads > 1 && isMultiThreadSupported();
      const useSimd = simd && isSimdSupported();
      const wasmPaths = flags.wasmPaths;
      const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;
      const wasmFileName = getWasmFileName(useSimd, useThreads);
      const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;
      let isTimeout = false;
      const tasks = [];
      if (timeout > 0) {
        tasks.push(new Promise((resolve) => {
          setTimeout(() => {
            isTimeout = true;
            resolve();
          }, timeout);
        }));
      }
      tasks.push(new Promise((resolve, reject) => {
        const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;
        const config = {
          locateFile: (fileName, scriptDirectory) => {
            if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {
              return URL.createObjectURL(new Blob(
                [
                  // This require() function is handled by esbuild plugin to load file content as string.
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  require_ort_wasm_threaded_worker()
                ],
                { type: "text/javascript" }
              ));
            }
            if (fileName.endsWith(".wasm")) {
              if (wasmPathOverride) {
                return wasmPathOverride;
              }
              const prefix = wasmPrefixOverride ?? scriptDirectory;
              if (false) {
                if (wasmFileName === "ort-wasm-simd.wasm") {
                  return prefix + "ort-wasm-simd.jsep.wasm";
                } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {
                  return prefix + "ort-wasm-simd-threaded.jsep.wasm";
                }
              }
              return prefix + wasmFileName;
            }
            return scriptDirectory + fileName;
          }
        };
        if (useThreads) {
          if (typeof Blob === "undefined") {
            config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");
          } else {
            const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;
            config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });
          }
        }
        factory(config).then(
          // wasm module initialized successfully
          (module2) => {
            initializing = false;
            initialized = true;
            wasm = module2;
            resolve();
          },
          // wasm module failed to initialize
          (what) => {
            initializing = false;
            aborted = true;
            reject(what);
          }
        );
      }));
      await Promise.race(tasks);
      if (isTimeout) {
        throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);
      }
    };
    getInstance = () => {
      if (initialized && wasm) {
        return wasm;
      }
      throw new Error("WebAssembly is not initialized yet.");
    };
  }
});

// web/lib/wasm/wasm-utils.ts
var allocWasmString, iterateExtraOptions, checkLastError;
var init_wasm_utils = __esm({
  "web/lib/wasm/wasm-utils.ts"() {
    "use strict";
    init_wasm_factory();
    allocWasmString = (data, allocs) => {
      const wasm2 = getInstance();
      const dataLength = wasm2.lengthBytesUTF8(data) + 1;
      const dataOffset = wasm2._malloc(dataLength);
      wasm2.stringToUTF8(data, dataOffset, dataLength);
      allocs.push(dataOffset);
      return dataOffset;
    };
    iterateExtraOptions = (options, prefix, seen, handler) => {
      if (typeof options == "object" && options !== null) {
        if (seen.has(options)) {
          throw new Error("Circular reference in options");
        } else {
          seen.add(options);
        }
      }
      Object.entries(options).forEach(([key, value]) => {
        const name = prefix ? prefix + key : key;
        if (typeof value === "object") {
          iterateExtraOptions(value, name + ".", seen, handler);
        } else if (typeof value === "string" || typeof value === "number") {
          handler(name, value.toString());
        } else if (typeof value === "boolean") {
          handler(name, value ? "1" : "0");
        } else {
          throw new Error(`Can't handle extra config type: ${typeof value}`);
        }
      });
    };
    checkLastError = (message) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const paramsOffset = wasm2.stackAlloc(8);
        wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);
        const errorCode = wasm2.HEAP32[paramsOffset / 4];
        const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];
        const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";
        throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);
      } finally {
        wasm2.stackRestore(stack);
      }
    };
  }
});

// web/lib/wasm/run-options.ts
var setRunOptions;
var init_run_options = __esm({
  "web/lib/wasm/run-options.ts"() {
    "use strict";
    init_wasm_factory();
    init_wasm_utils();
    setRunOptions = (options) => {
      const wasm2 = getInstance();
      let runOptionsHandle = 0;
      const allocs = [];
      const runOptions = options || {};
      try {
        if (options?.logSeverityLevel === void 0) {
          runOptions.logSeverityLevel = 2;
        } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {
          throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);
        }
        if (options?.logVerbosityLevel === void 0) {
          runOptions.logVerbosityLevel = 0;
        } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {
          throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);
        }
        if (options?.terminate === void 0) {
          runOptions.terminate = false;
        }
        let tagDataOffset = 0;
        if (options?.tag !== void 0) {
          tagDataOffset = allocWasmString(options.tag, allocs);
        }
        runOptionsHandle = wasm2._OrtCreateRunOptions(
          runOptions.logSeverityLevel,
          runOptions.logVerbosityLevel,
          !!runOptions.terminate,
          tagDataOffset
        );
        if (runOptionsHandle === 0) {
          checkLastError("Can't create run options.");
        }
        if (options?.extra !== void 0) {
          iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {
            const keyDataOffset = allocWasmString(key, allocs);
            const valueDataOffset = allocWasmString(value, allocs);
            if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
              checkLastError(`Can't set a run config entry: ${key} - ${value}.`);
            }
          });
        }
        return [runOptionsHandle, allocs];
      } catch (e) {
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e;
      }
    };
  }
});

// web/lib/wasm/session-options.ts
var getGraphOptimzationLevel, getExecutionMode, appendDefaultOptions, setExecutionProviders, setSessionOptions;
var init_session_options = __esm({
  "web/lib/wasm/session-options.ts"() {
    "use strict";
    init_wasm_factory();
    init_wasm_utils();
    getGraphOptimzationLevel = (graphOptimizationLevel) => {
      switch (graphOptimizationLevel) {
        case "disabled":
          return 0;
        case "basic":
          return 1;
        case "extended":
          return 2;
        case "all":
          return 99;
        default:
          throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);
      }
    };
    getExecutionMode = (executionMode) => {
      switch (executionMode) {
        case "sequential":
          return 0;
        case "parallel":
          return 1;
        default:
          throw new Error(`unsupported execution mode: ${executionMode}`);
      }
    };
    appendDefaultOptions = (options) => {
      if (!options.extra) {
        options.extra = {};
      }
      if (!options.extra.session) {
        options.extra.session = {};
      }
      const session = options.extra.session;
      if (!session.use_ort_model_bytes_directly) {
        session.use_ort_model_bytes_directly = "1";
      }
      if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {
        options.enableMemPattern = false;
      }
    };
    setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {
      for (const ep of executionProviders) {
        let epName = typeof ep === "string" ? ep : ep.name;
        switch (epName) {
          case "xnnpack":
            epName = "XNNPACK";
            break;
          case "webnn":
            epName = "WEBNN";
            if (typeof ep !== "string") {
              const webnnOptions = ep;
              if (webnnOptions?.deviceType) {
                const keyDataOffset = allocWasmString("deviceType", allocs);
                const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(`Can't set a session config entry: 'deviceType' - ${webnnOptions.deviceType}.`);
                }
              }
              if (webnnOptions?.numThreads) {
                let numThreads = webnnOptions.numThreads;
                if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {
                  numThreads = 0;
                }
                const keyDataOffset = allocWasmString("numThreads", allocs);
                const valueDataOffset = allocWasmString(numThreads.toString(), allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(`Can't set a session config entry: 'numThreads' - ${webnnOptions.numThreads}.`);
                }
              }
              if (webnnOptions?.powerPreference) {
                const keyDataOffset = allocWasmString("powerPreference", allocs);
                const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(
                    `Can't set a session config entry: 'powerPreference' - ${webnnOptions.powerPreference}.`
                  );
                }
              }
            }
            break;
          case "webgpu":
            epName = "JS";
            if (typeof ep !== "string") {
              const webgpuOptions = ep;
              if (webgpuOptions?.preferredLayout) {
                if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {
                  throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${webgpuOptions.preferredLayout}`);
                }
                const keyDataOffset = allocWasmString("preferredLayout", allocs);
                const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(
                    `Can't set a session config entry: 'preferredLayout' - ${webgpuOptions.preferredLayout}.`
                  );
                }
              }
            }
            break;
          case "wasm":
          case "cpu":
            continue;
          default:
            throw new Error(`not supported execution provider: ${epName}`);
        }
        const epNameDataOffset = allocWasmString(epName, allocs);
        if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {
          checkLastError(`Can't append execution provider: ${epName}.`);
        }
      }
    };
    setSessionOptions = (options) => {
      const wasm2 = getInstance();
      let sessionOptionsHandle = 0;
      const allocs = [];
      const sessionOptions = options || {};
      appendDefaultOptions(sessionOptions);
      try {
        const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");
        const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");
        const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;
        const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;
        if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {
          throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);
        }
        const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;
        if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {
          throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);
        }
        const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;
        sessionOptionsHandle = wasm2._OrtCreateSessionOptions(
          graphOptimizationLevel,
          !!sessionOptions.enableCpuMemArena,
          !!sessionOptions.enableMemPattern,
          executionMode,
          !!sessionOptions.enableProfiling,
          0,
          logIdDataOffset,
          logSeverityLevel,
          logVerbosityLevel,
          optimizedModelFilePathOffset
        );
        if (sessionOptionsHandle === 0) {
          checkLastError("Can't create session options.");
        }
        if (sessionOptions.executionProviders) {
          setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);
        }
        if (sessionOptions.freeDimensionOverrides) {
          for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {
            if (typeof name !== "string") {
              throw new Error(`free dimension override name must be a string: ${name}`);
            }
            if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
              throw new Error(`free dimension override value must be a non-negative integer: ${value}`);
            }
            const nameOffset = allocWasmString(name, allocs);
            if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {
              checkLastError(`Can't set a free dimension override: ${name} - ${value}.`);
            }
          }
        }
        if (sessionOptions.extra !== void 0) {
          iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {
            const keyDataOffset = allocWasmString(key, allocs);
            const valueDataOffset = allocWasmString(value, allocs);
            if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
              checkLastError(`Can't set a session config entry: ${key} - ${value}.`);
            }
          });
        }
        return [sessionOptionsHandle, allocs];
      } catch (e) {
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e;
      }
    };
  }
});

// web/lib/wasm/wasm-common.ts
var tensorDataTypeStringToEnum, tensorDataTypeEnumToString, getTensorElementSize, tensorTypeToTypedArrayConstructor, logLevelStringToEnum, isGpuBufferSupportedType, dataLocationStringToEnum;
var init_wasm_common = __esm({
  "web/lib/wasm/wasm-common.ts"() {
    "use strict";
    tensorDataTypeStringToEnum = (type) => {
      switch (type) {
        case "int8":
          return 3 /* int8 */;
        case "uint8":
          return 2 /* uint8 */;
        case "bool":
          return 9 /* bool */;
        case "int16":
          return 5 /* int16 */;
        case "uint16":
          return 4 /* uint16 */;
        case "int32":
          return 6 /* int32 */;
        case "uint32":
          return 12 /* uint32 */;
        case "float16":
          return 10 /* float16 */;
        case "float32":
          return 1 /* float */;
        case "float64":
          return 11 /* double */;
        case "string":
          return 8 /* string */;
        case "int64":
          return 7 /* int64 */;
        case "uint64":
          return 13 /* uint64 */;
        default:
          throw new Error(`unsupported data type: ${type}`);
      }
    };
    tensorDataTypeEnumToString = (typeProto) => {
      switch (typeProto) {
        case 3 /* int8 */:
          return "int8";
        case 2 /* uint8 */:
          return "uint8";
        case 9 /* bool */:
          return "bool";
        case 5 /* int16 */:
          return "int16";
        case 4 /* uint16 */:
          return "uint16";
        case 6 /* int32 */:
          return "int32";
        case 12 /* uint32 */:
          return "uint32";
        case 10 /* float16 */:
          return "float16";
        case 1 /* float */:
          return "float32";
        case 11 /* double */:
          return "float64";
        case 8 /* string */:
          return "string";
        case 7 /* int64 */:
          return "int64";
        case 13 /* uint64 */:
          return "uint64";
        default:
          throw new Error(`unsupported data type: ${typeProto}`);
      }
    };
    getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];
    tensorTypeToTypedArrayConstructor = (type) => {
      switch (type) {
        case "float16":
          return Uint16Array;
        case "float32":
          return Float32Array;
        case "uint8":
          return Uint8Array;
        case "int8":
          return Int8Array;
        case "uint16":
          return Uint16Array;
        case "int16":
          return Int16Array;
        case "int32":
          return Int32Array;
        case "bool":
          return Uint8Array;
        case "float64":
          return Float64Array;
        case "uint32":
          return Uint32Array;
        case "int64":
          return BigInt64Array;
        case "uint64":
          return BigUint64Array;
        default:
          throw new Error(`unsupported type: ${type}`);
      }
    };
    logLevelStringToEnum = (logLevel) => {
      switch (logLevel) {
        case "verbose":
          return 0;
        case "info":
          return 1;
        case "warning":
          return 2;
        case "error":
          return 3;
        case "fatal":
          return 4;
        default:
          throw new Error(`unsupported logging level: ${logLevel}`);
      }
    };
    isGpuBufferSupportedType = (type) => type === "float32" || type === "int32" || type === "int64" || type === "bool" || type === "float16" || type === "uint32";
    dataLocationStringToEnum = (location) => {
      switch (location) {
        case "none":
          return 0;
        case "cpu":
          return 1;
        case "cpu-pinned":
          return 2;
        case "texture":
          return 3;
        case "gpu-buffer":
          return 4;
        default:
          throw new Error(`unsupported data location: ${location}`);
      }
    };
  }
});

// web/lib/wasm/wasm-core-impl.ts
var ortEnvInitialized, getSessionInputOutputCount, initOrt, initRuntime, activeSessions, isOrtEnvInitialized, createSessionAllocate, createSessionFinalize, createSession, releaseSession, prepareInputOutputTensor, run, endProfiling, extractTransferableBuffers;
var init_wasm_core_impl = __esm({
  "web/lib/wasm/wasm-core-impl.ts"() {
    "use strict";
    init_run_options();
    init_session_options();
    init_wasm_common();
    init_wasm_factory();
    init_wasm_utils();
    ortEnvInitialized = false;
    getSessionInputOutputCount = (sessionHandle) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const dataOffset = wasm2.stackAlloc(8);
        const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);
        if (errorCode !== 0) {
          checkLastError("Can't get session input/output count.");
        }
        return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    initOrt = (numThreads, loggingLevel) => {
      const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);
      if (errorCode !== 0) {
        checkLastError("Can't initialize onnxruntime.");
      }
    };
    initRuntime = async (env3) => {
      initOrt(env3.wasm.numThreads, logLevelStringToEnum(env3.logLevel));
      if (false) {
        const initJsep = null.init;
        await initJsep(getInstance(), env3);
      }
      ortEnvInitialized = true;
    };
    activeSessions = /* @__PURE__ */ new Map();
    isOrtEnvInitialized = () => ortEnvInitialized;
    createSessionAllocate = (model) => {
      const wasm2 = getInstance();
      const modelDataOffset = wasm2._malloc(model.byteLength);
      if (modelDataOffset === 0) {
        throw new Error(`Can't create a session. failed to allocate a buffer of size ${model.byteLength}.`);
      }
      wasm2.HEAPU8.set(model, modelDataOffset);
      return [modelDataOffset, model.byteLength];
    };
    createSessionFinalize = (modelData, options) => {
      const wasm2 = getInstance();
      let sessionHandle = 0;
      let sessionOptionsHandle = 0;
      let ioBindingHandle = 0;
      let allocs = [];
      const inputNamesUTF8Encoded = [];
      const outputNamesUTF8Encoded = [];
      try {
        [sessionOptionsHandle, allocs] = setSessionOptions(options);
        sessionHandle = wasm2._OrtCreateSession(modelData[0], modelData[1], sessionOptionsHandle);
        if (sessionHandle === 0) {
          checkLastError("Can't create a session.");
        }
        const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);
        const inputNames = [];
        const outputNames = [];
        const outputPreferredLocations = [];
        for (let i = 0; i < inputCount; i++) {
          const name = wasm2._OrtGetInputName(sessionHandle, i);
          if (name === 0) {
            checkLastError("Can't get an input name.");
          }
          inputNamesUTF8Encoded.push(name);
          inputNames.push(wasm2.UTF8ToString(name));
        }
        for (let i = 0; i < outputCount; i++) {
          const name = wasm2._OrtGetOutputName(sessionHandle, i);
          if (name === 0) {
            checkLastError("Can't get an output name.");
          }
          outputNamesUTF8Encoded.push(name);
          const nameString = wasm2.UTF8ToString(name);
          outputNames.push(nameString);
          if (false) {
            const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";
            if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {
              throw new Error(`Not supported preferred output location: ${location}.`);
            }
            outputPreferredLocations.push(location);
          }
        }
        let bindingState = null;
        if (false) {
          ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);
          if (ioBindingHandle === 0) {
            checkLastError("Can't create IO binding.");
          }
          bindingState = {
            handle: ioBindingHandle,
            outputPreferredLocations,
            outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))
          };
        }
        activeSessions.set(sessionHandle, [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState]);
        return [sessionHandle, inputNames, outputNames];
      } catch (e) {
        inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        if (ioBindingHandle !== 0) {
          wasm2._OrtReleaseBinding(ioBindingHandle);
        }
        if (sessionHandle !== 0) {
          wasm2._OrtReleaseSession(sessionHandle);
        }
        throw e;
      } finally {
        wasm2._free(modelData[0]);
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
      }
    };
    createSession = (model, options) => {
      const modelData = createSessionAllocate(model);
      return createSessionFinalize(modelData, options);
    };
    releaseSession = (sessionId) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`cannot release session. invalid session id: ${sessionId}`);
      }
      const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;
      if (ioBindingState) {
        wasm2._OrtReleaseBinding(ioBindingState.handle);
      }
      wasm2.jsepUnregisterBuffers?.(sessionId);
      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      wasm2._OrtReleaseSession(sessionHandle);
      activeSessions.delete(sessionId);
    };
    prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index) => {
      if (!tensor) {
        tensorHandles.push(0);
        return;
      }
      const wasm2 = getInstance();
      const dataType = tensor[0];
      const dims = tensor[1];
      const location = tensor[3];
      let rawData;
      let dataByteLength;
      if (dataType === "string" && location === "gpu-buffer") {
        throw new Error("String tensor is not supported on GPU.");
      }
      if (location === "gpu-buffer") {
        const gpuBuffer = tensor[2].gpuBuffer;
        const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));
        dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;
        rawData = wasm2.jsepRegisterBuffer(sessionId, index, gpuBuffer, dataByteLength);
      } else {
        const data = tensor[2];
        if (Array.isArray(data)) {
          dataByteLength = 4 * data.length;
          rawData = wasm2._malloc(dataByteLength);
          allocs.push(rawData);
          let dataIndex = rawData / 4;
          for (let i = 0; i < data.length; i++) {
            if (typeof data[i] !== "string") {
              throw new TypeError(`tensor data at index ${i} is not a string`);
            }
            wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);
          }
        } else {
          dataByteLength = data.byteLength;
          rawData = wasm2._malloc(dataByteLength);
          allocs.push(rawData);
          wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);
        }
      }
      const stack = wasm2.stackSave();
      const dimsOffset = wasm2.stackAlloc(4 * dims.length);
      try {
        let dimIndex = dimsOffset / 4;
        dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);
        const tensor2 = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(dataType),
          rawData,
          dataByteLength,
          dimsOffset,
          dims.length,
          dataLocationStringToEnum(location)
        );
        if (tensor2 === 0) {
          checkLastError(`Can't create tensor for input/output. session=${sessionId}, index=${index}.`);
        }
        tensorHandles.push(tensor2);
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`cannot run inference. invalid session id: ${sessionId}`);
      }
      const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);
      const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);
      const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);
      const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        for (let i = 0; i < inputCount; i++) {
          prepareInputOutputTensor(inputTensors[i], inputTensorHandles, inputOutputAllocs, sessionId, inputIndices[i]);
        }
        for (let i = 0; i < outputCount; i++) {
          prepareInputOutputTensor(
            outputTensors[i],
            outputTensorHandles,
            inputOutputAllocs,
            sessionId,
            inputCount + outputIndices[i]
          );
        }
        let inputValuesIndex = inputValuesOffset / 4;
        let inputNamesIndex = inputNamesOffset / 4;
        let outputValuesIndex = outputValuesOffset / 4;
        let outputNamesIndex = outputNamesOffset / 4;
        for (let i = 0; i < inputCount; i++) {
          wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];
          wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];
        }
        for (let i = 0; i < outputCount; i++) {
          wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];
          wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];
        }
        if (false) {
          const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;
          if (inputNamesUTF8Encoded.length !== inputCount) {
            throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model's input count (${inputNamesUTF8Encoded.length}).`);
          }
          for (let i = 0; i < inputCount; i++) {
            const index = inputIndices[i];
            const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);
            if (errorCode2 !== 0) {
              checkLastError(`Can't bind input[${i}] for session=${sessionId}.`);
            }
          }
          for (let i = 0; i < outputCount; i++) {
            const index = outputIndices[i];
            const location = outputTensors[i]?.[3];
            if (location) {
              const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind pre-allocated output[${i}] for session=${sessionId}.`);
              }
            } else {
              const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);
              }
            }
          }
        }
        let errorCode;
        if (false) {
          errorCode = await wasm2._OrtRunWithBinding(
            sessionHandle,
            ioBindingState.handle,
            outputCount,
            outputValuesOffset,
            runOptionsHandle
          );
        } else {
          errorCode = await wasm2._OrtRun(
            sessionHandle,
            inputNamesOffset,
            inputValuesOffset,
            inputCount,
            outputNamesOffset,
            outputCount,
            outputValuesOffset,
            runOptionsHandle
          );
        }
        if (errorCode !== 0) {
          checkLastError("failed to call OrtRun().");
        }
        const output = [];
        for (let i = 0; i < outputCount; i++) {
          const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];
          if (tensor === outputTensorHandles[i]) {
            output.push(outputTensors[i]);
            continue;
          }
          const beforeGetTensorDataStack = wasm2.stackSave();
          const tensorDataOffset = wasm2.stackAlloc(4 * 4);
          let keepOutputTensor = false;
          let type, dataOffset = 0;
          try {
            const errorCode2 = wasm2._OrtGetTensorData(
              tensor,
              tensorDataOffset,
              tensorDataOffset + 4,
              tensorDataOffset + 8,
              tensorDataOffset + 12
            );
            if (errorCode2 !== 0) {
              checkLastError(`Can't access output tensor data on index ${i}.`);
            }
            let tensorDataIndex = tensorDataOffset / 4;
            const dataType = wasm2.HEAPU32[tensorDataIndex++];
            dataOffset = wasm2.HEAPU32[tensorDataIndex++];
            const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];
            const dimsLength = wasm2.HEAPU32[tensorDataIndex++];
            const dims = [];
            for (let i2 = 0; i2 < dimsLength; i2++) {
              dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);
            }
            wasm2._OrtFree(dimsOffset);
            const size = dims.reduce((a, b) => a * b, 1);
            type = tensorDataTypeEnumToString(dataType);
            const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];
            if (type === "string") {
              if (preferredLocation === "gpu-buffer") {
                throw new Error("String tensor is not supported on GPU.");
              }
              const stringData = [];
              let dataIndex = dataOffset / 4;
              for (let i2 = 0; i2 < size; i2++) {
                const offset = wasm2.HEAPU32[dataIndex++];
                const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;
                stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));
              }
              output.push([type, dims, stringData, "cpu"]);
            } else {
              if (preferredLocation === "gpu-buffer" && size > 0) {
                const gpuBuffer = wasm2.jsepGetBuffer(dataOffset);
                const elementSize = getTensorElementSize(dataType);
                if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {
                  throw new Error(`Unsupported data type: ${type}`);
                }
                keepOutputTensor = true;
                output.push([
                  type,
                  dims,
                  {
                    gpuBuffer,
                    download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),
                    dispose: () => {
                      wasm2._OrtReleaseTensor(tensor);
                    }
                  },
                  "gpu-buffer"
                ]);
              } else {
                const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);
                const data = new typedArrayConstructor(size);
                new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));
                output.push([type, dims, data, "cpu"]);
              }
            }
          } finally {
            wasm2.stackRestore(beforeGetTensorDataStack);
            if (type === "string" && dataOffset) {
              wasm2._free(dataOffset);
            }
            if (!keepOutputTensor) {
              wasm2._OrtReleaseTensor(tensor);
            }
          }
        }
        if (ioBindingState) {
          wasm2._OrtClearBoundOutputs(ioBindingState.handle);
        }
        return output;
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    endProfiling = (sessionId) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error("invalid session id");
      }
      const sessionHandle = session[0];
      const profileFileName = wasm2._OrtEndProfiling(sessionHandle);
      if (profileFileName === 0) {
        checkLastError("Can't get an profile file name.");
      }
      wasm2._OrtFree(profileFileName);
    };
    extractTransferableBuffers = (tensors) => {
      const buffers = [];
      for (const tensor of tensors) {
        const data = tensor[2];
        if (!Array.isArray(data) && "buffer" in data) {
          buffers.push(data.buffer);
        }
      }
      return buffers;
    };
  }
});

// proxy-worker:./proxy-worker/main
var require_main = __commonJS({
  "proxy-worker:./proxy-worker/main"(exports, module2) {
    module2.exports = '/*!\n * ONNX Runtime Web v1.17.0\n * Copyright (c) Microsoft Corporation. All rights reserved.\n * Licensed under the MIT License.\n */\n"use strict";\n(() => {\n  var __defProp = Object.defineProperty;\n  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n  var __getOwnPropNames = Object.getOwnPropertyNames;\n  var __hasOwnProp = Object.prototype.hasOwnProperty;\n  var __esm = (fn, res) => function __init() {\n    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;\n  };\n  var __commonJS = (cb, mod) => function __require() {\n    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;\n  };\n  var __export = (target, all) => {\n    for (var name in all)\n      __defProp(target, name, { get: all[name], enumerable: true });\n  };\n  var __copyProps = (to, from, except, desc) => {\n    if (from && typeof from === "object" || typeof from === "function") {\n      for (let key of __getOwnPropNames(from))\n        if (!__hasOwnProp.call(to, key) && key !== except)\n          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });\n    }\n    return to;\n  };\n  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);\n\n  // nodejs-ignore:fs\n  var fs_exports = {};\n  __export(fs_exports, {\n    readFile: () => readFile\n  });\n  var readFile;\n  var init_fs = __esm({\n    "nodejs-ignore:fs"() {\n      readFile = void 0;\n    }\n  });\n\n  // nodejs-ignore:path\n  var path_exports = {};\n  __export(path_exports, {\n    join: () => join2\n  });\n  var join2;\n  var init_path = __esm({\n    "nodejs-ignore:path"() {\n      join2 = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-training-wasm-simd.js\n  var require_ort_training_wasm_simd = __commonJS({\n    "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module) {\n      "use strict";\n      var ortWasm = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          var d = moduleArg, aa, l;\n          d.ready = new Promise((a, b) => {\n            aa = a;\n            l = b;\n          });\n          var ba = Object.assign({}, d), m = "./this.program", ca = "object" == typeof window, r = "function" == typeof importScripts, da = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, w = "", x, y, z;\n          if (da) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), B = (init_path(), __toCommonJS(path_exports));\n            w = r ? B.dirname(w) + "/" : __dirname + "/";\n            x = (a, b) => {\n              a = a.startsWith("file://") ? new URL(a) : B.normalize(a);\n              return fs.readFileSync(a, b ? void 0 : "utf8");\n            };\n            z = (a) => {\n              a = x(a, true);\n              a.buffer || (a = new Uint8Array(a));\n              return a;\n            };\n            y = (a, b, c, e = true) => {\n              a = a.startsWith("file://") ? new URL(a) : B.normalize(a);\n              fs.readFile(a, e ? void 0 : "utf8", (g, h) => {\n                g ? c(g) : b(e ? h.buffer : h);\n              });\n            };\n            !d.thisProgram && 1 < process.argv.length && (m = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            d.inspect = () => "[Emscripten Module object]";\n          } else if (ca || r)\n            r ? w = self.location.href : "undefined" != typeof document && document.currentScript && (w = document.currentScript.src), _scriptDir && (w = _scriptDir), 0 !== w.indexOf("blob:") ? w = w.substr(0, w.replace(/[?#].*/, "").lastIndexOf("/") + 1) : w = "", x = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, r && (z = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), y = (a, b, c) => {\n              var e = new XMLHttpRequest();\n              e.open("GET", a, true);\n              e.responseType = "arraybuffer";\n              e.onload = () => {\n                200 == e.status || 0 == e.status && e.response ? b(e.response) : c();\n              };\n              e.onerror = c;\n              e.send(null);\n            };\n          var ea = d.print || console.log.bind(console), C = d.printErr || console.error.bind(console);\n          Object.assign(d, ba);\n          ba = null;\n          d.thisProgram && (m = d.thisProgram);\n          var D;\n          d.wasmBinary && (D = d.wasmBinary);\n          var noExitRuntime = d.noExitRuntime || true;\n          "object" != typeof WebAssembly && E("no native wasm support detected");\n          var F, G, fa = false, H, I, J, K;\n          function ha() {\n            var a = F.buffer;\n            d.HEAP8 = H = new Int8Array(a);\n            d.HEAP16 = new Int16Array(a);\n            d.HEAP32 = J = new Int32Array(a);\n            d.HEAPU8 = I = new Uint8Array(a);\n            d.HEAPU16 = new Uint16Array(a);\n            d.HEAPU32 = K = new Uint32Array(a);\n            d.HEAPF32 = new Float32Array(a);\n            d.HEAPF64 = new Float64Array(a);\n          }\n          var L, ia = [], ja = [], ka = [];\n          function la() {\n            var a = d.preRun.shift();\n            ia.unshift(a);\n          }\n          var M = 0, N = null, O = null;\n          function E(a) {\n            if (d.onAbort)\n              d.onAbort(a);\n            a = "Aborted(" + a + ")";\n            C(a);\n            fa = true;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            l(a);\n            throw a;\n          }\n          function ma(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var P;\n          P = "ort-training-wasm-simd.wasm";\n          if (!ma(P)) {\n            var na = P;\n            P = d.locateFile ? d.locateFile(na, w) : w + na;\n          }\n          function oa(a) {\n            if (a == P && D)\n              return new Uint8Array(D);\n            if (z)\n              return z(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function pa(a) {\n            if (!D && (ca || r)) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => oa(a));\n              if (y)\n                return new Promise((b, c) => {\n                  y(a, (e) => b(new Uint8Array(e)), c);\n                });\n            }\n            return Promise.resolve().then(() => oa(a));\n          }\n          function qa(a, b, c) {\n            return pa(a).then((e) => WebAssembly.instantiate(e, b)).then((e) => e).then(c, (e) => {\n              C("failed to asynchronously prepare wasm: " + e);\n              E(e);\n            });\n          }\n          function ra(a, b) {\n            var c = P;\n            return D || "function" != typeof WebAssembly.instantiateStreaming || ma(c) || c.startsWith("file://") || da || "function" != typeof fetch ? qa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((e) => WebAssembly.instantiateStreaming(e, a).then(b, function(g) {\n              C("wasm streaming compile failed: " + g);\n              C("falling back to ArrayBuffer instantiation");\n              return qa(c, a, b);\n            }));\n          }\n          var Q, R = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(d);\n          };\n          function sa(a) {\n            this.Ka = a - 24;\n            this.Pa = function(b) {\n              K[this.Ka + 4 >> 2 >>> 0] = b;\n            };\n            this.Oa = function(b) {\n              K[this.Ka + 8 >> 2 >>> 0] = b;\n            };\n            this.Ma = function(b, c) {\n              this.Na();\n              this.Pa(b);\n              this.Oa(c);\n            };\n            this.Na = function() {\n              K[this.Ka + 16 >> 2 >>> 0] = 0;\n            };\n          }\n          var ta = 0, ua = 0, va = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, wa = (a, b, c) => {\n            b >>>= 0;\n            var e = b + c;\n            for (c = b; a[c] && !(c >= e); )\n              ++c;\n            if (16 < c - b && a.buffer && va)\n              return va.decode(a.subarray(b, c));\n            for (e = ""; b < c; ) {\n              var g = a[b++];\n              if (g & 128) {\n                var h = a[b++] & 63;\n                if (192 == (g & 224))\n                  e += String.fromCharCode((g & 31) << 6 | h);\n                else {\n                  var k = a[b++] & 63;\n                  g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | k : (g & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;\n                  65536 > g ? e += String.fromCharCode(g) : (g -= 65536, e += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));\n                }\n              } else\n                e += String.fromCharCode(g);\n            }\n            return e;\n          }, S = (a, b) => (a >>>= 0) ? wa(I, a, b) : "", T = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var e = a.charCodeAt(c);\n              127 >= e ? b++ : 2047 >= e ? b += 2 : 55296 <= e && 57343 >= e ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, U = (a, b, c, e) => {\n            c >>>= 0;\n            if (!(0 < e))\n              return 0;\n            var g = c;\n            e = c + e - 1;\n            for (var h = 0; h < a.length; ++h) {\n              var k = a.charCodeAt(h);\n              if (55296 <= k && 57343 >= k) {\n                var p = a.charCodeAt(++h);\n                k = 65536 + ((k & 1023) << 10) | p & 1023;\n              }\n              if (127 >= k) {\n                if (c >= e)\n                  break;\n                b[c++ >>> 0] = k;\n              } else {\n                if (2047 >= k) {\n                  if (c + 1 >= e)\n                    break;\n                  b[c++ >>> 0] = 192 | k >> 6;\n                } else {\n                  if (65535 >= k) {\n                    if (c + 2 >= e)\n                      break;\n                    b[c++ >>> 0] = 224 | k >> 12;\n                  } else {\n                    if (c + 3 >= e)\n                      break;\n                    b[c++ >>> 0] = 240 | k >> 18;\n                    b[c++ >>> 0] = 128 | k >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | k >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | k & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - g;\n          }, V = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), xa = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], ya = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Da = (a) => {\n            var b = T(a) + 1, c = za(b);\n            c && U(a, I, c, b);\n            return c;\n          }, W = {}, Fa = () => {\n            if (!Ea) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(\n                "-",\n                "_"\n              ) + ".UTF-8", _: m || "./this.program" }, b;\n              for (b in W)\n                void 0 === W[b] ? delete a[b] : a[b] = W[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              Ea = c;\n            }\n            return Ea;\n          }, Ea, Ga = [null, [], []], Ha = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Ia = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Ja(a) {\n            var b = Array(T(a) + 1);\n            U(a, b, 0, b.length);\n            return b;\n          }\n          function Ka(a, b, c, e) {\n            function g(f, n, q) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < n; )\n                f = q[0] + f;\n              return f;\n            }\n            function h(f, n) {\n              return g(f, n, "0");\n            }\n            function k(f, n) {\n              function q(Aa) {\n                return 0 > Aa ? -1 : 0 < Aa ? 1 : 0;\n              }\n              var A;\n              0 === (A = q(f.getFullYear() - n.getFullYear())) && 0 === (A = q(f.getMonth() - n.getMonth())) && (A = q(f.getDate() - n.getDate()));\n              return A;\n            }\n            function p(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function t(f) {\n              var n = f.Ga;\n              for (f = new Date(new Date(f.Ha + 1900, 0, 1).getTime()); 0 < n; ) {\n                var q = f.getMonth(), A = (V(f.getFullYear()) ? Ha : Ia)[q];\n                if (n > A - f.getDate())\n                  n -= A - f.getDate() + 1, f.setDate(1), 11 > q ? f.setMonth(q + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + n);\n                  break;\n                }\n              }\n              q = new Date(f.getFullYear() + 1, 0, 4);\n              n = p(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              q = p(q);\n              return 0 >= k(n, f) ? 0 >= k(q, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            e >>>= 0;\n            var u = J[e + 40 >> 2 >>> 0];\n            e = { Sa: J[e >> 2 >>> 0], Ra: J[e + 4 >> 2 >>> 0], Ia: J[e + 8 >> 2 >>> 0], La: J[e + 12 >> 2 >>> 0], Ja: J[e + 16 >> 2 >>> 0], Ha: J[e + 20 >> 2 >>> 0], Fa: J[e + 24 >> 2 >>> 0], Ga: J[e + 28 >> 2 >>> 0], Ua: J[e + 32 >> 2 >>> 0], Qa: J[e + 36 >> 2 >>> 0], Ta: u ? S(u) : "" };\n            c = S(c);\n            u = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var v in u)\n              c = c.replace(new RegExp(v, "g"), u[v]);\n            var Ba = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Ca = "January February March April May June July August September October November December".split(" ");\n            u = { "%a": (f) => Ba[f.Fa].substring(0, 3), "%A": (f) => Ba[f.Fa], "%b": (f) => Ca[f.Ja].substring(0, 3), "%B": (f) => Ca[f.Ja], "%C": (f) => h((f.Ha + 1900) / 100 | 0, 2), "%d": (f) => h(f.La, 2), "%e": (f) => g(f.La, 2, " "), "%g": (f) => t(f).toString().substring(2), "%G": (f) => t(f), "%H": (f) => h(f.Ia, 2), "%I": (f) => {\n              f = f.Ia;\n              0 == f ? f = 12 : 12 < f && (f -= 12);\n              return h(f, 2);\n            }, "%j": (f) => {\n              for (var n = 0, q = 0; q <= f.Ja - 1; n += (V(f.Ha + 1900) ? Ha : Ia)[q++])\n                ;\n              return h(f.La + n, 3);\n            }, "%m": (f) => h(f.Ja + 1, 2), "%M": (f) => h(f.Ra, 2), "%n": () => "\\n", "%p": (f) => 0 <= f.Ia && 12 > f.Ia ? "AM" : "PM", "%S": (f) => h(f.Sa, 2), "%t": () => "	", "%u": (f) => f.Fa || 7, "%U": (f) => h(Math.floor((f.Ga + 7 - f.Fa) / 7), 2), "%V": (f) => {\n              var n = Math.floor((f.Ga + 7 - (f.Fa + 6) % 7) / 7);\n              2 >= (f.Fa + 371 - f.Ga - 2) % 7 && n++;\n              if (n)\n                53 == n && (q = (f.Fa + 371 - f.Ga) % 7, 4 == q || 3 == q && V(f.Ha) || (n = 1));\n              else {\n                n = 52;\n                var q = (f.Fa + 7 - f.Ga - 1) % 7;\n                (4 == q || 5 == q && V(f.Ha % 400 - 1)) && n++;\n              }\n              return h(n, 2);\n            }, "%w": (f) => f.Fa, "%W": (f) => h(Math.floor((f.Ga + 7 - (f.Fa + 6) % 7) / 7), 2), "%y": (f) => (f.Ha + 1900).toString().substring(2), "%Y": (f) => f.Ha + 1900, "%z": (f) => {\n              f = f.Qa;\n              var n = 0 <= f;\n              f = Math.abs(f) / 60;\n              return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n            }, "%Z": (f) => f.Ta, "%%": () => "%" };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (v in u)\n              c.includes(v) && (c = c.replace(new RegExp(v, "g"), u[v](e)));\n            c = c.replace(/\\0\\0/g, "%");\n            v = Ja(c);\n            if (v.length > b)\n              return 0;\n            H.set(v, a >>> 0);\n            return v.length - 1;\n          }\n          var X = [], Y = void 0, La = [];\n          function Ma(a, b) {\n            if (!Y) {\n              Y = /* @__PURE__ */ new WeakMap();\n              var c = L.length;\n              if (Y)\n                for (var e = 0; e < 0 + c; e++) {\n                  var g = e;\n                  var h = X[g];\n                  h || (g >= X.length && (X.length = g + 1), X[g] = h = L.get(g));\n                  (g = h) && Y.set(g, e);\n                }\n            }\n            if (c = Y.get(a) || 0)\n              return c;\n            if (La.length)\n              c = La.pop();\n            else {\n              try {\n                L.grow(1);\n              } catch (p) {\n                if (!(p instanceof RangeError))\n                  throw p;\n                throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";\n              }\n              c = L.length - 1;\n            }\n            try {\n              e = c, L.set(e, a), X[e] = L.get(e);\n            } catch (p) {\n              if (!(p instanceof TypeError))\n                throw p;\n              if ("function" == typeof WebAssembly.Function) {\n                e = WebAssembly.Function;\n                g = { i: "i32", j: "i64", f: "f32", d: "f64", p: "i32" };\n                h = { parameters: [], results: "v" == b[0] ? [] : [g[b[0]]] };\n                for (var k = 1; k < b.length; ++k)\n                  h.parameters.push(g[b[k]]);\n                b = new e(h, a);\n              } else {\n                e = [1];\n                g = b.slice(0, 1);\n                b = b.slice(1);\n                h = { i: 127, p: 127, j: 126, f: 125, d: 124 };\n                e.push(96);\n                k = b.length;\n                128 > k ? e.push(k) : e.push(k % 128 | 128, k >> 7);\n                for (k = 0; k < b.length; ++k)\n                  e.push(h[b[k]]);\n                "v" == g ? e.push(0) : e.push(1, h[g]);\n                b = [0, 97, 115, 109, 1, 0, 0, 0, 1];\n                g = e.length;\n                128 > g ? b.push(g) : b.push(g % 128 | 128, g >> 7);\n                b.push.apply(b, e);\n                b.push(\n                  2,\n                  7,\n                  1,\n                  1,\n                  101,\n                  1,\n                  102,\n                  0,\n                  0,\n                  7,\n                  5,\n                  1,\n                  1,\n                  102,\n                  0,\n                  0\n                );\n                b = new WebAssembly.Module(new Uint8Array(b));\n                b = new WebAssembly.Instance(b, { e: { f: a } }).exports.f;\n              }\n              e = c;\n              L.set(e, b);\n              X[e] = L.get(e);\n            }\n            Y.set(a, c);\n            return c;\n          }\n          var Oa = {\n            a: function(a, b, c) {\n              a >>>= 0;\n              new sa(a).Ma(b >>> 0, c >>> 0);\n              ta = a;\n              ua++;\n              throw ta;\n            },\n            e: function() {\n              return 0;\n            },\n            H: function() {\n            },\n            x: function() {\n            },\n            z: function() {\n            },\n            J: function() {\n              return 0;\n            },\n            F: function() {\n            },\n            A: function() {\n            },\n            E: function() {\n            },\n            g: function() {\n            },\n            y: function() {\n            },\n            v: function() {\n            },\n            G: function() {\n            },\n            w: function() {\n            },\n            l: () => true,\n            o: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              J[c >> 2 >>> 0] = a.getUTCSeconds();\n              J[c + 4 >> 2 >>> 0] = a.getUTCMinutes();\n              J[c + 8 >> 2 >>> 0] = a.getUTCHours();\n              J[c + 12 >> 2 >>> 0] = a.getUTCDate();\n              J[c + 16 >> 2 >>> 0] = a.getUTCMonth();\n              J[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              J[c + 24 >> 2 >>> 0] = a.getUTCDay();\n              J[c + 28 >> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n            },\n            p: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              J[c >> 2 >>> 0] = a.getSeconds();\n              J[c + 4 >> 2 >>> 0] = a.getMinutes();\n              J[c + 8 >> 2 >>> 0] = a.getHours();\n              J[c + 12 >> 2 >>> 0] = a.getDate();\n              J[c + 16 >> 2 >>> 0] = a.getMonth();\n              J[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;\n              J[c + 24 >> 2 >>> 0] = a.getDay();\n              J[c + 28 >> 2 >>> 0] = (V(a.getFullYear()) ? xa : ya)[a.getMonth()] + a.getDate() - 1 | 0;\n              J[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var e = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              J[c + 32 >> 2 >>> 0] = (b != e && a.getTimezoneOffset() == Math.min(e, b)) | 0;\n            },\n            q: function(a) {\n              a >>>= 0;\n              var b = new Date(J[a + 20 >> 2 >>> 0] + 1900, J[a + 16 >> 2 >>> 0], J[a + 12 >> 2 >>> 0], J[a + 8 >> 2 >>> 0], J[a + 4 >> 2 >>> 0], J[a >> 2 >>> 0], 0), c = J[a + 32 >> 2 >>> 0], e = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(h, g);\n              0 > c ? J[a + 32 >> 2 >>> 0] = Number(g != h && k == e) : 0 < c != (k == e) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : g) - e)));\n              J[a + 24 >> 2 >>> 0] = b.getDay();\n              J[a + 28 >> 2 >>> 0] = (V(b.getFullYear()) ? xa : ya)[b.getMonth()] + b.getDate() - 1 | 0;\n              J[a >> 2 >>> 0] = b.getSeconds();\n              J[a + 4 >> 2 >>> 0] = b.getMinutes();\n              J[a + 8 >> 2 >>> 0] = b.getHours();\n              J[a + 12 >> 2 >>> 0] = b.getDate();\n              J[a + 16 >> 2 >>> 0] = b.getMonth();\n              J[a + 20 >> 2 >>> 0] = b.getYear();\n              a = b.getTime() / 1e3;\n              return Na((Q = a, 1 <= +Math.abs(Q) ? 0 < Q ? +Math.floor(Q / 4294967296) >>> 0 : ~~+Math.ceil((Q - +(~~Q >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;\n            },\n            m: function() {\n              return -52;\n            },\n            n: function() {\n            },\n            t: function(a, b, c) {\n              function e(t) {\n                return (t = t.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? t[1] : "GMT";\n              }\n              c >>>= 0;\n              var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), k = new Date(g, 6, 1);\n              g = h.getTimezoneOffset();\n              var p = k.getTimezoneOffset();\n              K[a >>> 0 >> 2 >>> 0] = 60 * Math.max(g, p);\n              J[b >>> 0 >> 2 >>> 0] = Number(g != p);\n              a = e(h);\n              b = e(k);\n              a = Da(a);\n              b = Da(b);\n              p < g ? (K[c >> 2 >>> 0] = a, K[c + 4 >> 2 >>> 0] = b) : (K[c >> 2 >>> 0] = b, K[c + 4 >> 2 >>> 0] = a);\n            },\n            d: () => {\n              E("");\n            },\n            h: function() {\n              return Date.now();\n            },\n            u: function() {\n              return 4294901760;\n            },\n            b: () => performance.now(),\n            I: function(a, b, c) {\n              b >>>= 0;\n              return I.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);\n            },\n            s: function(a) {\n              a >>>= 0;\n              var b = I.length;\n              if (4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var e = b * (1 + 0.2 / c);\n                e = Math.min(e, a + 100663296);\n                var g = Math;\n                e = Math.max(a, e);\n                a: {\n                  g = g.min.call(g, 4294901760, e + (65536 - e % 65536) % 65536) - F.buffer.byteLength + 65535 >>> 16;\n                  try {\n                    F.grow(g);\n                    ha();\n                    var h = 1;\n                    break a;\n                  } catch (k) {\n                  }\n                  h = void 0;\n                }\n                if (h)\n                  return true;\n              }\n              return false;\n            },\n            C: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = 0;\n              Fa().forEach(function(e, g) {\n                var h = b + c;\n                g = K[a + 4 * g >> 2 >>> 0] = h;\n                for (h = 0; h < e.length; ++h)\n                  H[g++ >> 0 >>> 0] = e.charCodeAt(h);\n                H[g >> 0 >>> 0] = 0;\n                c += e.length + 1;\n              });\n              return 0;\n            },\n            D: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = Fa();\n              K[a >> 2 >>> 0] = c.length;\n              var e = 0;\n              c.forEach(function(g) {\n                e += g.length + 1;\n              });\n              K[b >> 2 >>> 0] = e;\n              return 0;\n            },\n            f: () => 52,\n            k: function() {\n              return 52;\n            },\n            r: function() {\n              return 70;\n            },\n            j: function(a, b, c, e) {\n              b >>>= 0;\n              c >>>= 0;\n              e >>>= 0;\n              for (var g = 0, h = 0; h < c; h++) {\n                var k = K[b >> 2 >>> 0], p = K[b + 4 >> 2 >>> 0];\n                b += 8;\n                for (var t = 0; t < p; t++) {\n                  var u = I[k + t >>> 0], v = Ga[a];\n                  0 === u || 10 === u ? ((1 === a ? ea : C)(wa(v, 0)), v.length = 0) : v.push(u);\n                }\n                g += p;\n              }\n              K[e >> 2 >>> 0] = g;\n              return 0;\n            },\n            B: Ka,\n            c: function(a, b, c, e) {\n              return Ka(a >>> 0, b >>> 0, c >>> 0, e >>> 0);\n            },\n            i: function(a, b, c, e) {\n              const g = L.length;\n              a = new Uint8Array(I.slice(a + b, a + c));\n              try {\n                var h = new WebAssembly.Module(a), k = new WebAssembly.Instance(h, { env: { memory: F } }), p;\n                for (p in k.exports)\n                  Ma(k.exports[p]);\n                return g < L.length ? g : e;\n              } catch (t) {\n                return console.log(t), e;\n              }\n            }\n          };\n          (function() {\n            function a(c) {\n              c = c.exports;\n              G = c = Pa(c);\n              F = G.K;\n              ha();\n              L = G.Aa;\n              ja.unshift(G.L);\n              M--;\n              d.monitorRunDependencies && d.monitorRunDependencies(M);\n              if (0 == M && (null !== N && (clearInterval(N), N = null), O)) {\n                var e = O;\n                O = null;\n                e();\n              }\n              return c;\n            }\n            var b = { a: Oa };\n            M++;\n            d.monitorRunDependencies && d.monitorRunDependencies(M);\n            if (d.instantiateWasm)\n              try {\n                return d.instantiateWasm(b, a);\n              } catch (c) {\n                C("Module.instantiateWasm callback failed with error: " + c), l(c);\n              }\n            ra(b, function(c) {\n              a(c.instance);\n            }).catch(l);\n            return {};\n          })();\n          d._OrtInit = (a, b) => (d._OrtInit = G.M)(a, b);\n          d._OrtGetLastError = (a, b) => (d._OrtGetLastError = G.N)(a, b);\n          d._OrtCreateSessionOptions = (a, b, c, e, g, h, k, p, t, u) => (d._OrtCreateSessionOptions = G.O)(a, b, c, e, g, h, k, p, t, u);\n          d._OrtAppendExecutionProvider = (a, b) => (d._OrtAppendExecutionProvider = G.P)(a, b);\n          d._OrtAddFreeDimensionOverride = (a, b, c) => (d._OrtAddFreeDimensionOverride = G.Q)(a, b, c);\n          d._OrtAddSessionConfigEntry = (a, b, c) => (d._OrtAddSessionConfigEntry = G.R)(a, b, c);\n          d._OrtReleaseSessionOptions = (a) => (d._OrtReleaseSessionOptions = G.S)(a);\n          d._OrtCreateSession = (a, b, c) => (d._OrtCreateSession = G.T)(a, b, c);\n          d._OrtReleaseSession = (a) => (d._OrtReleaseSession = G.U)(a);\n          d._OrtGetInputOutputCount = (a, b, c) => (d._OrtGetInputOutputCount = G.V)(a, b, c);\n          d._OrtGetInputName = (a, b) => (d._OrtGetInputName = G.W)(a, b);\n          d._OrtGetOutputName = (a, b) => (d._OrtGetOutputName = G.X)(a, b);\n          d._OrtFree = (a) => (d._OrtFree = G.Y)(a);\n          d._OrtCreateTensor = (a, b, c, e, g, h) => (d._OrtCreateTensor = G.Z)(a, b, c, e, g, h);\n          d._OrtGetTensorData = (a, b, c, e, g) => (d._OrtGetTensorData = G._)(a, b, c, e, g);\n          d._OrtReleaseTensor = (a) => (d._OrtReleaseTensor = G.$)(a);\n          d._OrtCreateRunOptions = (a, b, c, e) => (d._OrtCreateRunOptions = G.aa)(a, b, c, e);\n          d._OrtAddRunConfigEntry = (a, b, c) => (d._OrtAddRunConfigEntry = G.ba)(a, b, c);\n          d._OrtReleaseRunOptions = (a) => (d._OrtReleaseRunOptions = G.ca)(a);\n          d._OrtCreateBinding = (a) => (d._OrtCreateBinding = G.da)(a);\n          d._OrtBindInput = (a, b, c) => (d._OrtBindInput = G.ea)(a, b, c);\n          d._OrtBindOutput = (a, b, c, e) => (d._OrtBindOutput = G.fa)(a, b, c, e);\n          d._OrtClearBoundOutputs = (a) => (d._OrtClearBoundOutputs = G.ga)(a);\n          d._OrtReleaseBinding = (a) => (d._OrtReleaseBinding = G.ha)(a);\n          d._OrtRunWithBinding = (a, b, c, e, g) => (d._OrtRunWithBinding = G.ia)(a, b, c, e, g);\n          d._OrtRun = (a, b, c, e, g, h, k, p) => (d._OrtRun = G.ja)(a, b, c, e, g, h, k, p);\n          d._OrtEndProfiling = (a) => (d._OrtEndProfiling = G.ka)(a);\n          d._OrtTrainingLoadCheckpoint = (a, b) => (d._OrtTrainingLoadCheckpoint = G.la)(a, b);\n          d._OrtTrainingReleaseCheckpoint = (a) => (d._OrtTrainingReleaseCheckpoint = G.ma)(a);\n          d._OrtTrainingCreateSession = (a, b, c, e, g, h, k, p) => (d._OrtTrainingCreateSession = G.na)(a, b, c, e, g, h, k, p);\n          d._OrtTrainingLazyResetGrad = (a) => (d._OrtTrainingLazyResetGrad = G.oa)(a);\n          d._OrtTrainingRunTrainStep = (a, b, c, e, g, h) => (d._OrtTrainingRunTrainStep = G.pa)(a, b, c, e, g, h);\n          d._OrtTrainingOptimizerStep = (a, b) => (d._OrtTrainingOptimizerStep = G.qa)(a, b);\n          d._OrtTrainingEvalStep = (a, b, c, e, g, h) => (d._OrtTrainingEvalStep = G.ra)(a, b, c, e, g, h);\n          d._OrtTrainingGetParametersSize = (a, b, c) => (d._OrtTrainingGetParametersSize = G.sa)(a, b, c);\n          d._OrtTrainingCopyParametersToBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersToBuffer = G.ta)(a, b, c, e);\n          d._OrtTrainingCopyParametersFromBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersFromBuffer = G.ua)(a, b, c, e);\n          d._OrtTrainingGetModelInputOutputCount = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputCount = G.va)(a, b, c, e);\n          d._OrtTrainingGetModelInputOutputName = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputName = G.wa)(a, b, c, e);\n          d._OrtTrainingReleaseSession = (a) => (d._OrtTrainingReleaseSession = G.xa)(a);\n          var za = d._malloc = (a) => (za = d._malloc = G.ya)(a);\n          d._free = (a) => (d._free = G.za)(a);\n          var Na = (a) => (Na = G.Ba)(a), Qa = () => (Qa = G.Ca)(), Ra = (a) => (Ra = G.Da)(a), Sa = (a) => (Sa = G.Ea)(a);\n          d.___start_em_js = 975904;\n          d.___stop_em_js = 976516;\n          function Pa(a) {\n            a = Object.assign({}, a);\n            var b = (e) => () => e() >>> 0, c = (e) => (g) => e(g) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.malloc = c(a.malloc);\n            a.stackSave = b(a.stackSave);\n            a.stackAlloc = c(a.stackAlloc);\n            return a;\n          }\n          d.stackAlloc = Sa;\n          d.stackSave = Qa;\n          d.stackRestore = Ra;\n          d.addFunction = Ma;\n          d.UTF8ToString = S;\n          d.stringToUTF8 = (a, b, c) => U(a, I, b, c);\n          d.lengthBytesUTF8 = T;\n          var Z;\n          O = function Ta() {\n            Z || Ua();\n            Z || (O = Ta);\n          };\n          function Ua() {\n            function a() {\n              if (!Z && (Z = true, d.calledRun = true, !fa)) {\n                R(ja);\n                aa(d);\n                if (d.onRuntimeInitialized)\n                  d.onRuntimeInitialized();\n                if (d.postRun)\n                  for ("function" == typeof d.postRun && (d.postRun = [d.postRun]); d.postRun.length; ) {\n                    var b = d.postRun.shift();\n                    ka.unshift(b);\n                  }\n                R(ka);\n              }\n            }\n            if (!(0 < M)) {\n              if (d.preRun)\n                for ("function" == typeof d.preRun && (d.preRun = [d.preRun]); d.preRun.length; )\n                  la();\n              R(ia);\n              0 < M || (d.setStatus ? (d.setStatus("Running..."), setTimeout(function() {\n                setTimeout(function() {\n                  d.setStatus("");\n                }, 1);\n                a();\n              }, 1)) : a());\n            }\n          }\n          if (d.preInit)\n            for ("function" == typeof d.preInit && (d.preInit = [d.preInit]); 0 < d.preInit.length; )\n              d.preInit.pop()();\n          Ua();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasm;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasm);\n    }\n  });\n\n  // nodejs-ignore:worker_threads\n  var require_worker_threads = __commonJS({\n    "nodejs-ignore:worker_threads"() {\n    }\n  });\n\n  // nodejs-ignore:perf_hooks\n  var require_perf_hooks = __commonJS({\n    "nodejs-ignore:perf_hooks"() {\n    }\n  });\n\n  // nodejs-ignore:os\n  var os_exports = {};\n  __export(os_exports, {\n    cpus: () => cpus\n  });\n  var cpus;\n  var init_os = __esm({\n    "nodejs-ignore:os"() {\n      cpus = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.js\n  var require_ort_wasm_threaded = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module) {\n      "use strict";\n      var ortWasmThreaded = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          function p() {\n            q.buffer != r.buffer && t();\n            return r;\n          }\n          function x() {\n            q.buffer != r.buffer && t();\n            return ba;\n          }\n          function ca() {\n            q.buffer != r.buffer && t();\n            return da;\n          }\n          function ea() {\n            q.buffer != r.buffer && t();\n            return fa;\n          }\n          function A() {\n            q.buffer != r.buffer && t();\n            return ha;\n          }\n          function B() {\n            q.buffer != r.buffer && t();\n            return ia;\n          }\n          function ja() {\n            q.buffer != r.buffer && t();\n            return ka;\n          }\n          var C = moduleArg, la, ma;\n          C.ready = new Promise((a, b) => {\n            la = a;\n            ma = b;\n          });\n          var na = Object.assign({}, C), oa = "./this.program", pa = (a, b) => {\n            throw b;\n          }, qa = "object" == typeof window, ra = "function" == typeof importScripts, F = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, G = C.ENVIRONMENT_IS_PTHREAD || false, H = "";\n          function sa(a) {\n            return C.locateFile ? C.locateFile(a, H) : H + a;\n          }\n          var ta, ua, va;\n          if (F) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), wa = (init_path(), __toCommonJS(path_exports));\n            H = ra ? wa.dirname(H) + "/" : __dirname + "/";\n            ta = (b, c) => {\n              b = b.startsWith("file://") ? new URL(b) : wa.normalize(b);\n              return fs.readFileSync(b, c ? void 0 : "utf8");\n            };\n            va = (b) => {\n              b = ta(b, true);\n              b.buffer || (b = new Uint8Array(b));\n              return b;\n            };\n            ua = (b, c, d, e = true) => {\n              b = b.startsWith("file://") ? new URL(b) : wa.normalize(b);\n              fs.readFile(b, e ? void 0 : "utf8", (f, g) => {\n                f ? d(f) : c(e ? g.buffer : g);\n              });\n            };\n            !C.thisProgram && 1 < process.argv.length && (oa = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            pa = (b, c) => {\n              process.exitCode = b;\n              throw c;\n            };\n            C.inspect = () => "[Emscripten Module object]";\n            let a;\n            try {\n              a = require_worker_threads();\n            } catch (b) {\n              throw console.error(\'The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?\'), b;\n            }\n            global.Worker = a.Worker;\n          } else if (qa || ra)\n            ra ? H = self.location.href : "undefined" != typeof document && document.currentScript && (H = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (H = _scriptDir), 0 !== H.indexOf("blob:") ? H = H.substr(0, H.replace(/[?#].*/, "").lastIndexOf("/") + 1) : H = "", F || (ta = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, ra && (va = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), ua = (a, b, c) => {\n              var d = new XMLHttpRequest();\n              d.open("GET", a, true);\n              d.responseType = "arraybuffer";\n              d.onload = () => {\n                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();\n              };\n              d.onerror = c;\n              d.send(null);\n            });\n          F && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);\n          var xa = console.log.bind(console), ya = console.error.bind(console);\n          F && (xa = (...a) => fs.writeSync(1, a.join(" ") + "\\n"), ya = (...a) => fs.writeSync(2, a.join(" ") + "\\n"));\n          var za = xa, L = ya;\n          Object.assign(C, na);\n          na = null;\n          var noExitRuntime = true;\n          "object" != typeof WebAssembly && Aa("no native wasm support detected");\n          var q, Ba, Ca = false, Da, r, ba, da, fa, ha, ia, Ea, Fa, Ga, ka;\n          function t() {\n            var a = q.buffer;\n            C.HEAP8 = r = new Int8Array(a);\n            C.HEAP16 = da = new Int16Array(a);\n            C.HEAPU8 = ba = new Uint8Array(a);\n            C.HEAPU16 = fa = new Uint16Array(a);\n            C.HEAP32 = ha = new Int32Array(a);\n            C.HEAPU32 = ia = new Uint32Array(a);\n            C.HEAPF32 = Ea = new Float32Array(a);\n            C.HEAPF64 = ka = new Float64Array(a);\n            C.HEAP64 = Fa = new BigInt64Array(a);\n            C.HEAPU64 = Ga = new BigUint64Array(a);\n          }\n          var Ha = 16777216;\n          5242880 <= Ha || Aa("INITIAL_MEMORY should be larger than STACK_SIZE, was " + Ha + "! (STACK_SIZE=5242880)");\n          if (G)\n            q = C.wasmMemory;\n          else if (q = new WebAssembly.Memory({ initial: Ha / 65536, maximum: 65536, shared: true }), !(q.buffer instanceof SharedArrayBuffer))\n            throw L("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), F && L("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");\n          t();\n          Ha = q.buffer.byteLength;\n          var Ia = [], Ja = [], Ka = [], La = 0;\n          function Ma() {\n            return noExitRuntime || 0 < La;\n          }\n          var Na = 0, Oa = null, Pa = null;\n          function Qa() {\n            Na--;\n            if (0 == Na && (null !== Oa && (clearInterval(Oa), Oa = null), Pa)) {\n              var a = Pa;\n              Pa = null;\n              a();\n            }\n          }\n          function Aa(a) {\n            a = "Aborted(" + a + ")";\n            L(a);\n            Ca = true;\n            Da = 1;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            ma(a);\n            throw a;\n          }\n          function Ra(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var Sa;\n          Sa = "ort-wasm-threaded.wasm";\n          Ra(Sa) || (Sa = sa(Sa));\n          function Ta(a) {\n            if (va)\n              return va(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function Ua(a) {\n            if (qa || ra) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => Ta(a));\n              if (ua)\n                return new Promise((b, c) => {\n                  ua(a, (d) => b(new Uint8Array(d)), c);\n                });\n            }\n            return Promise.resolve().then(() => Ta(a));\n          }\n          function Va(a, b, c) {\n            return Ua(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {\n              L(`failed to asynchronously prepare wasm: ${d}`);\n              Aa(d);\n            });\n          }\n          function Wa(a, b) {\n            var c = Sa;\n            return "function" != typeof WebAssembly.instantiateStreaming || Ra(c) || c.startsWith("file://") || F || "function" != typeof fetch ? Va(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {\n              L(`wasm streaming compile failed: ${e}`);\n              L("falling back to ArrayBuffer instantiation");\n              return Va(c, a, b);\n            }));\n          }\n          function Xa(a) {\n            this.name = "ExitStatus";\n            this.message = `Program terminated with exit(${a})`;\n            this.status = a;\n          }\n          var Ya = (a) => {\n            a.terminate();\n            a.onmessage = () => {\n            };\n          }, Za = (a) => {\n            if (0 == M.Pe.length) {\n              var b = sa("ort-wasm-threaded.worker.js");\n              b = new Worker(b);\n              M.Pe.push(b);\n              M.rf(M.Pe[0]);\n            }\n            b = M.Pe.pop();\n            if (!b)\n              return 6;\n            M.Me.push(b);\n            M.Ie[a.Le] = b;\n            b.Le = a.Le;\n            var c = { cmd: "run", start_routine: a.tf, arg: a.lf, pthread_ptr: a.Le };\n            F && b.unref();\n            b.postMessage(c, a.zf);\n            return 0;\n          }, $a = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, ab = (a, b, c) => {\n            b >>>= 0;\n            var d = b + c;\n            for (c = b; a[c] && !(c >= d); )\n              ++c;\n            if (16 < c - b && a.buffer && $a)\n              return $a.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));\n            for (d = ""; b < c; ) {\n              var e = a[b++];\n              if (e & 128) {\n                var f = a[b++] & 63;\n                if (192 == (e & 224))\n                  d += String.fromCharCode((e & 31) << 6 | f);\n                else {\n                  var g = a[b++] & 63;\n                  e = 224 == (e & 240) ? (e & 15) << 12 | f << 6 | g : (e & 7) << 18 | f << 12 | g << 6 | a[b++] & 63;\n                  65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));\n                }\n              } else\n                d += String.fromCharCode(e);\n            }\n            return d;\n          }, bb = (a, b) => (a >>>= 0) ? ab(x(), a, b) : "";\n          function cb(a) {\n            if (G)\n              return N(0, 1, a);\n            Da = a;\n            Ma() || (M.uf(), Ca = true);\n            pa(a, new Xa(a));\n          }\n          var eb = (a) => {\n            Da = a;\n            if (G)\n              throw db(a), "unwind";\n            cb(a);\n          };\n          function gb() {\n            Ia.unshift(() => {\n              Na++;\n              Qa();\n            });\n          }\n          var M = { Pe: [], Me: [], ef: [], Ie: {}, We() {\n            G ? (M.receiveObjectTransfer = M.sf, M.threadInitTLS = M.df, M.setExitStatus = M.af, noExitRuntime = false) : gb();\n          }, af: (a) => {\n            Da = a;\n          }, Cf: ["$terminateWorker"], uf: () => {\n            for (var a of M.Me)\n              Ya(a);\n            for (a of M.Pe)\n              Ya(a);\n            M.Pe = [];\n            M.Me = [];\n            M.Ie = [];\n          }, $e: (a) => {\n            var b = a.Le;\n            delete M.Ie[b];\n            M.Pe.push(a);\n            M.Me.splice(M.Me.indexOf(a), 1);\n            a.Le = 0;\n            hb(b);\n          }, sf() {\n          }, df() {\n            M.ef.forEach((a) => a());\n          }, rf: (a) => new Promise((b) => {\n            a.onmessage = (f) => {\n              f = f.data;\n              var g = f.cmd;\n              if (f.targetThread && f.targetThread != ib()) {\n                var h = M.Ie[f.targetThread];\n                h ? h.postMessage(f, f.transferList) : L(`Internal error! Worker sent a message "${g}" to target pthread ${f.targetThread}, but that thread no longer exists!`);\n              } else if ("checkMailbox" === g)\n                jb();\n              else if ("spawnThread" === g)\n                Za(f);\n              else if ("cleanupThread" === g)\n                (f = M.Ie[f.thread]) || Aa(), M.$e(f);\n              else if ("killThread" === g)\n                f = f.thread, g = M.Ie[f], delete M.Ie[f], Ya(g), hb(f), M.Me.splice(M.Me.indexOf(g), 1), g.Le = 0;\n              else if ("cancelThread" === g)\n                M.Ie[f.thread].postMessage({ cmd: "cancel" });\n              else if ("loaded" === g)\n                a.loaded = true, b(a);\n              else if ("alert" === g)\n                alert(`Thread ${f.threadId}: ${f.text}`);\n              else if ("setimmediate" === f.target)\n                a.postMessage(f);\n              else if ("callHandler" === g)\n                C[f.handler](...f.args);\n              else\n                g && L(`worker sent an unknown command ${g}`);\n            };\n            a.onerror = (f) => {\n              L(`${"worker sent an error!"} ${f.filename}:${f.lineno}: ${f.message}`);\n              throw f;\n            };\n            F && (a.on("message", (f) => a.onmessage({ data: f })), a.on("error", (f) => a.onerror(f)));\n            var c = [], d = [], e;\n            for (e of d)\n              C.hasOwnProperty(e) && c.push(e);\n            a.postMessage({\n              cmd: "load",\n              handlers: c,\n              urlOrBlob: C.mainScriptUrlOrBlob || _scriptDir,\n              wasmMemory: q,\n              wasmModule: Ba\n            });\n          }) };\n          C.PThread = M;\n          var kb = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(C);\n          };\n          C.establishStackSpace = () => {\n            var a = ib(), b = B()[a + 52 >>> 2 >>> 0];\n            a = B()[a + 56 >>> 2 >>> 0];\n            lb(b, b - a);\n            O(b);\n          };\n          function db(a) {\n            if (G)\n              return N(1, 0, a);\n            eb(a);\n          }\n          var mb = [], nb, P = (a) => {\n            var b = mb[a];\n            b || (a >= mb.length && (mb.length = a + 1), mb[a] = b = nb.get(a));\n            return b;\n          };\n          C.invokeEntryPoint = (a, b) => {\n            a = P(a)(b);\n            Ma() ? M.af(a) : ob(a);\n          };\n          var pb = [], qb = 0, Q = 0;\n          function rb(a) {\n            this.Re = a;\n            this.He = a - 24;\n            this.kf = function(b) {\n              B()[this.He + 4 >>> 2 >>> 0] = b;\n            };\n            this.Se = function() {\n              return B()[this.He + 4 >>> 2 >>> 0];\n            };\n            this.jf = function(b) {\n              B()[this.He + 8 >>> 2 >>> 0] = b;\n            };\n            this.bf = function(b) {\n              b = b ? 1 : 0;\n              p()[this.He + 12 >>> 0 >>> 0] = b;\n            };\n            this.gf = function() {\n              return 0 != p()[this.He + 12 >>> 0 >>> 0];\n            };\n            this.cf = function(b) {\n              b = b ? 1 : 0;\n              p()[this.He + 13 >>> 0 >>> 0] = b;\n            };\n            this.nf = function() {\n              return 0 != p()[this.He + 13 >>> 0 >>> 0];\n            };\n            this.We = function(b, c) {\n              this.Te(0);\n              this.kf(b);\n              this.jf(c);\n            };\n            this.Te = function(b) {\n              B()[this.He + 16 >>> 2 >>> 0] = b;\n            };\n            this.ff = function() {\n              return B()[this.He + 16 >>> 2 >>> 0];\n            };\n            this.hf = function() {\n              if (sb(this.Se()))\n                return B()[this.Re >>> 2 >>> 0];\n              var b = this.ff();\n              return 0 !== b ? b : this.Re;\n            };\n          }\n          var vb = (a) => {\n            var b = Q;\n            if (!b)\n              return tb(0), 0;\n            var c = new rb(b);\n            c.Te(b);\n            var d = c.Se();\n            if (!d)\n              return tb(0), b;\n            for (var e in a) {\n              var f = a[e];\n              if (0 === f || f === d)\n                break;\n              if (ub(f, d, c.He + 16))\n                return tb(f), b;\n            }\n            tb(d);\n            return b;\n          };\n          function wb(a, b, c, d) {\n            return G ? N(2, 1, a, b, c, d) : xb(a, b, c, d);\n          }\n          function xb(a, b, c, d) {\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            if ("undefined" == typeof SharedArrayBuffer)\n              return L("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;\n            var e = [];\n            if (G && 0 === e.length)\n              return wb(a, b, c, d);\n            a = { tf: c, Le: a, lf: d, zf: e };\n            return G ? (a.Bf = "spawnThread", postMessage(a, e), 0) : Za(a);\n          }\n          function yb(a, b, c) {\n            return G ? N(3, 1, a, b, c) : 0;\n          }\n          function zb(a, b) {\n            if (G)\n              return N(4, 1, a, b);\n          }\n          var Ab = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, Bb = (a, b, c, d) => {\n            c >>>= 0;\n            if (!(0 < d))\n              return 0;\n            var e = c;\n            d = c + d - 1;\n            for (var f = 0; f < a.length; ++f) {\n              var g = a.charCodeAt(f);\n              if (55296 <= g && 57343 >= g) {\n                var h = a.charCodeAt(++f);\n                g = 65536 + ((g & 1023) << 10) | h & 1023;\n              }\n              if (127 >= g) {\n                if (c >= d)\n                  break;\n                b[c++ >>> 0] = g;\n              } else {\n                if (2047 >= g) {\n                  if (c + 1 >= d)\n                    break;\n                  b[c++ >>> 0] = 192 | g >> 6;\n                } else {\n                  if (65535 >= g) {\n                    if (c + 2 >= d)\n                      break;\n                    b[c++ >>> 0] = 224 | g >> 12;\n                  } else {\n                    if (c + 3 >= d)\n                      break;\n                    b[c++ >>> 0] = 240 | g >> 18;\n                    b[c++ >>> 0] = 128 | g >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | g >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | g & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - e;\n          }, Cb = (a, b, c) => Bb(a, x(), b, c);\n          function Db(a, b) {\n            if (G)\n              return N(5, 1, a, b);\n          }\n          function Eb(a, b, c) {\n            if (G)\n              return N(6, 1, a, b, c);\n          }\n          function Fb(a, b, c) {\n            return G ? N(7, 1, a, b, c) : 0;\n          }\n          function Gb(a, b) {\n            if (G)\n              return N(8, 1, a, b);\n          }\n          function Hb(a, b, c) {\n            if (G)\n              return N(9, 1, a, b, c);\n          }\n          function Ib(a, b, c, d) {\n            if (G)\n              return N(10, 1, a, b, c, d);\n          }\n          function Jb(a, b, c, d) {\n            if (G)\n              return N(11, 1, a, b, c, d);\n          }\n          function Kb(a, b, c, d) {\n            if (G)\n              return N(12, 1, a, b, c, d);\n          }\n          function Lb(a) {\n            if (G)\n              return N(13, 1, a);\n          }\n          function Mb(a, b) {\n            if (G)\n              return N(14, 1, a, b);\n          }\n          function Nb(a, b, c) {\n            if (G)\n              return N(15, 1, a, b, c);\n          }\n          var Ob = (a) => {\n            if (null === a)\n              return "null";\n            var b = typeof a;\n            return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;\n          }, Pb, R = (a) => {\n            for (var b = ""; x()[a >>> 0]; )\n              b += Pb[x()[a++ >>> 0]];\n            return b;\n          }, Qb = {}, Rb = {}, Sb = {}, Tb;\n          function Ub(a, b, c = {}) {\n            var d = b.name;\n            if (!a)\n              throw new Tb(`type "${d}" must have a positive integer typeid pointer`);\n            if (Rb.hasOwnProperty(a)) {\n              if (c.pf)\n                return;\n              throw new Tb(`Cannot register type \'${d}\' twice`);\n            }\n            Rb[a] = b;\n            delete Sb[a];\n            Qb.hasOwnProperty(a) && (b = Qb[a], delete Qb[a], b.forEach((e) => e()));\n          }\n          function S(a, b, c = {}) {\n            if (!("argPackAdvance" in b))\n              throw new TypeError("registerType registeredInstance requires argPackAdvance");\n            Ub(a, b, c);\n          }\n          var Vb = (a, b, c) => {\n            switch (b) {\n              case 1:\n                return c ? (d) => p()[d >>> 0 >>> 0] : (d) => x()[d >>> 0 >>> 0];\n              case 2:\n                return c ? (d) => ca()[d >>> 1 >>> 0] : (d) => ea()[d >>> 1 >>> 0];\n              case 4:\n                return c ? (d) => A()[d >>> 2 >>> 0] : (d) => B()[d >>> 2 >>> 0];\n              case 8:\n                return c ? (d) => Fa[d >>> 3] : (d) => Ga[d >>> 3];\n              default:\n                throw new TypeError(`invalid integer width (${b}): ${a}`);\n            }\n          };\n          function Wb() {\n            this.Ke = [void 0];\n            this.Ye = [];\n          }\n          var T = new Wb();\n          function Xb(a) {\n            a >>>= 0;\n            a >= T.He && 0 === --T.get(a).Ze && T.Te(a);\n          }\n          var U = (a) => {\n            if (!a)\n              throw new Tb("Cannot use deleted val. handle = " + a);\n            return T.get(a).value;\n          }, V = (a) => {\n            switch (a) {\n              case void 0:\n                return 1;\n              case null:\n                return 2;\n              case true:\n                return 3;\n              case false:\n                return 4;\n              default:\n                return T.Se({ Ze: 1, value: a });\n            }\n          };\n          function Yb(a) {\n            return this.fromWireType(A()[a >>> 2 >>> 0]);\n          }\n          var Zb = (a, b) => {\n            switch (b) {\n              case 4:\n                return function(c) {\n                  var d = this.fromWireType;\n                  q.buffer != r.buffer && t();\n                  return d.call(this, Ea[c >>> 2 >>> 0]);\n                };\n              case 8:\n                return function(c) {\n                  return this.fromWireType(ja()[c >>> 3 >>> 0]);\n                };\n              default:\n                throw new TypeError(`invalid float width (${b}): ${a}`);\n            }\n          };\n          function $b(a) {\n            return this.fromWireType(B()[a >>> 2 >>> 0]);\n          }\n          var ac = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, bc = (a, b) => {\n            var c = a >> 1;\n            for (var d = c + b / 2; !(c >= d) && ea()[c >>> 0]; )\n              ++c;\n            c <<= 1;\n            if (32 < c - a && ac)\n              return ac.decode(x().slice(a, c));\n            c = "";\n            for (d = 0; !(d >= b / 2); ++d) {\n              var e = ca()[a + 2 * d >>> 1 >>> 0];\n              if (0 == e)\n                break;\n              c += String.fromCharCode(e);\n            }\n            return c;\n          }, cc = (a, b, c) => {\n            void 0 === c && (c = 2147483647);\n            if (2 > c)\n              return 0;\n            c -= 2;\n            var d = b;\n            c = c < 2 * a.length ? c / 2 : a.length;\n            for (var e = 0; e < c; ++e) {\n              var f = a.charCodeAt(e);\n              ca()[b >>> 1 >>> 0] = f;\n              b += 2;\n            }\n            ca()[b >>> 1 >>> 0] = 0;\n            return b - d;\n          }, dc = (a) => 2 * a.length, ec = (a, b) => {\n            for (var c = 0, d = ""; !(c >= b / 4); ) {\n              var e = A()[a + 4 * c >>> 2 >>> 0];\n              if (0 == e)\n                break;\n              ++c;\n              65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);\n            }\n            return d;\n          }, fc = (a, b, c) => {\n            b >>>= 0;\n            void 0 === c && (c = 2147483647);\n            if (4 > c)\n              return 0;\n            var d = b;\n            c = d + c - 4;\n            for (var e = 0; e < a.length; ++e) {\n              var f = a.charCodeAt(e);\n              if (55296 <= f && 57343 >= f) {\n                var g = a.charCodeAt(++e);\n                f = 65536 + ((f & 1023) << 10) | g & 1023;\n              }\n              A()[b >>> 2 >>> 0] = f;\n              b += 4;\n              if (b + 4 > c)\n                break;\n            }\n            A()[b >>> 2 >>> 0] = 0;\n            return b - d;\n          }, gc = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              55296 <= d && 57343 >= d && ++c;\n              b += 4;\n            }\n            return b;\n          }, hc = (a) => {\n            if (!Ca)\n              try {\n                if (a(), !Ma())\n                  try {\n                    G ? ob(Da) : eb(Da);\n                  } catch (b) {\n                    b instanceof Xa || "unwind" == b || pa(1, b);\n                  }\n              } catch (b) {\n                b instanceof Xa || "unwind" == b || pa(1, b);\n              }\n          };\n          function ic(a) {\n            a >>>= 0;\n            "function" === typeof Atomics.Af && (Atomics.Af(A(), a >>> 2, a).value.then(jb), a += 128, Atomics.store(A(), a >>> 2, 1));\n          }\n          C.__emscripten_thread_mailbox_await = ic;\n          var jb = () => {\n            var a = ib();\n            a && (ic(a), hc(() => jc()));\n          };\n          C.checkMailbox = jb;\n          var kc = (a) => {\n            var b = W();\n            a = a();\n            O(b);\n            return a;\n          };\n          function N(a, b) {\n            var c = arguments.length - 2, d = arguments;\n            return kc(() => {\n              for (var e = 2 * c, f = lc(8 * e), g = f >>> 3, h = 0; h < c; h++) {\n                var k = d[2 + h];\n                "bigint" == typeof k ? (Fa[g + 2 * h] = 1n, Fa[g + 2 * h + 1] = k) : (Fa[g + 2 * h] = 0n, ja()[g + 2 * h + 1 >>> 0] = k);\n              }\n              return mc(a, e, f, b);\n            });\n          }\n          var nc = [], pc = (a, b) => {\n            var c = Rb[a];\n            if (void 0 === c)\n              throw a = oc(a), c = R(a), X(a), new Tb(b + " has unknown type " + c);\n            return c;\n          }, qc = {}, rc = (a) => {\n            var b = qc[a];\n            return void 0 === b ? R(a) : b;\n          }, sc = [], tc = () => "object" == typeof globalThis ? globalThis : Function("return this")(), uc = (a) => {\n            var b = sc.length;\n            sc.push(a);\n            return b;\n          }, vc = (a, b) => {\n            for (var c = Array(a), d = 0; d < a; ++d)\n              c[d] = pc(B()[b + 4 * d >>> 2 >>> 0], "parameter " + d);\n            return c;\n          }, wc = (a) => {\n            if (void 0 === a)\n              return "_unknown";\n            a = a.replace(/[^a-zA-Z0-9_]/g, "$");\n            var b = a.charCodeAt(0);\n            return 48 <= b && 57 >= b ? `_${a}` : a;\n          }, xc = {};\n          function yc(a, b) {\n            a = wc(a);\n            return { [a]: function() {\n              return b.apply(this, arguments);\n            } }[a];\n          }\n          function zc(a) {\n            var b = Function;\n            if (!(b instanceof Function))\n              throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);\n            var c = yc(b.name || "unknownFunctionName", function() {\n            });\n            c.prototype = b.prototype;\n            c = new c();\n            a = b.apply(c, a);\n            return a instanceof Object ? a : c;\n          }\n          var Ac = (a) => {\n            for (var b = "", c = 0; c < a; ++c)\n              b += (0 !== c ? ", " : "") + "arg" + c;\n            var d = "return function emval_allocator_" + a + "(constructor, argTypes, args) {\\n  var HEAPU32 = getMemory();\\n";\n            for (c = 0; c < a; ++c)\n              d += "var argType" + c + " = requireRegisteredType(HEAPU32[((argTypes)>>>2)], \'parameter " + c + "\');\\nvar arg" + c + " = argType" + c + ".readValueFromPointer(args);\\nargs += argType" + c + "[\'argPackAdvance\'];\\nargTypes += 4;\\n";\n            return new Function("requireRegisteredType", "Module", "valueToHandle", "getMemory", d + ("var obj = new constructor(" + b + ");\\nreturn valueToHandle(obj);\\n}\\n"))(pc, C, V, () => B());\n          }, Bc = {}, Cc = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), Dc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Ec = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];\n          function Fc(a, b, c, d, e, f, g) {\n            return G ? N(16, 1, a, b, c, d, e, f, g) : -52;\n          }\n          function Gc(a, b, c, d, e, f) {\n            if (G)\n              return N(17, 1, a, b, c, d, e, f);\n          }\n          var Ic = (a) => {\n            var b = Ab(a) + 1, c = Hc(b);\n            c && Cb(a, c, b);\n            return c;\n          }, Jc = {}, Lc = () => {\n            if (!Kc) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: oa || "./this.program" }, b;\n              for (b in Jc)\n                void 0 === Jc[b] ? delete a[b] : a[b] = Jc[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              Kc = c;\n            }\n            return Kc;\n          }, Kc;\n          function Mc(a, b) {\n            if (G)\n              return N(18, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            Lc().forEach((d, e) => {\n              var f = b + c;\n              e = B()[a + 4 * e >>> 2 >>> 0] = f;\n              for (f = 0; f < d.length; ++f)\n                p()[e++ >>> 0 >>> 0] = d.charCodeAt(f);\n              p()[e >>> 0 >>> 0] = 0;\n              c += d.length + 1;\n            });\n            return 0;\n          }\n          function Nc(a, b) {\n            if (G)\n              return N(19, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = Lc();\n            B()[a >>> 2 >>> 0] = c.length;\n            var d = 0;\n            c.forEach((e) => d += e.length + 1);\n            B()[b >>> 2 >>> 0] = d;\n            return 0;\n          }\n          function Oc(a) {\n            return G ? N(20, 1, a) : 52;\n          }\n          function Pc(a, b, c, d) {\n            return G ? N(21, 1, a, b, c, d) : 52;\n          }\n          function Qc(a, b, c, d) {\n            return G ? N(22, 1, a, b, c, d) : 70;\n          }\n          var Rc = [null, [], []];\n          function Sc(a, b, c, d) {\n            if (G)\n              return N(23, 1, a, b, c, d);\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            for (var e = 0, f = 0; f < c; f++) {\n              var g = B()[b >>> 2 >>> 0], h = B()[b + 4 >>> 2 >>> 0];\n              b += 8;\n              for (var k = 0; k < h; k++) {\n                var l = x()[g + k >>> 0], n = Rc[a];\n                0 === l || 10 === l ? ((1 === a ? za : L)(ab(n, 0)), n.length = 0) : n.push(l);\n              }\n              e += h;\n            }\n            B()[d >>> 2 >>> 0] = e;\n            return 0;\n          }\n          var Tc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Uc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Vc(a) {\n            var b = Array(Ab(a) + 1);\n            Bb(a, b, 0, b.length);\n            return b;\n          }\n          var Wc = (a, b) => {\n            p().set(a, b >>> 0);\n          };\n          function Xc(a, b, c, d) {\n            function e(m, w, y) {\n              for (m = "number" == typeof m ? m.toString() : m || ""; m.length < w; )\n                m = y[0] + m;\n              return m;\n            }\n            function f(m, w) {\n              return e(m, w, "0");\n            }\n            function g(m, w) {\n              function y(D) {\n                return 0 > D ? -1 : 0 < D ? 1 : 0;\n              }\n              var z;\n              0 === (z = y(m.getFullYear() - w.getFullYear())) && 0 === (z = y(m.getMonth() - w.getMonth())) && (z = y(m.getDate() - w.getDate()));\n              return z;\n            }\n            function h(m) {\n              switch (m.getDay()) {\n                case 0:\n                  return new Date(m.getFullYear() - 1, 11, 29);\n                case 1:\n                  return m;\n                case 2:\n                  return new Date(m.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    m.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(m.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(m.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(m.getFullYear() - 1, 11, 30);\n              }\n            }\n            function k(m) {\n              var w = m.Ne;\n              for (m = new Date(new Date(m.Oe + 1900, 0, 1).getTime()); 0 < w; ) {\n                var y = m.getMonth(), z = (Cc(m.getFullYear()) ? Tc : Uc)[y];\n                if (w > z - m.getDate())\n                  w -= z - m.getDate() + 1, m.setDate(1), 11 > y ? m.setMonth(y + 1) : (m.setMonth(0), m.setFullYear(m.getFullYear() + 1));\n                else {\n                  m.setDate(m.getDate() + w);\n                  break;\n                }\n              }\n              y = new Date(m.getFullYear() + 1, 0, 4);\n              w = h(new Date(\n                m.getFullYear(),\n                0,\n                4\n              ));\n              y = h(y);\n              return 0 >= g(w, m) ? 0 >= g(y, m) ? m.getFullYear() + 1 : m.getFullYear() : m.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            var l = B()[d + 40 >>> 2 >>> 0];\n            d = { xf: A()[d >>> 2 >>> 0], wf: A()[d + 4 >>> 2 >>> 0], Ue: A()[d + 8 >>> 2 >>> 0], Xe: A()[d + 12 >>> 2 >>> 0], Ve: A()[d + 16 >>> 2 >>> 0], Oe: A()[d + 20 >>> 2 >>> 0], Je: A()[d + 24 >>> 2 >>> 0], Ne: A()[d + 28 >>> 2 >>> 0], Df: A()[d + 32 >>> 2 >>> 0], vf: A()[d + 36 >>> 2 >>> 0], yf: l ? bb(l) : "" };\n            c = bb(c);\n            l = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var n in l)\n              c = c.replace(new RegExp(n, "g"), l[n]);\n            var u = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), v = "January February March April May June July August September October November December".split(" ");\n            l = { "%a": (m) => u[m.Je].substring(0, 3), "%A": (m) => u[m.Je], "%b": (m) => v[m.Ve].substring(0, 3), "%B": (m) => v[m.Ve], "%C": (m) => f((m.Oe + 1900) / 100 | 0, 2), "%d": (m) => f(m.Xe, 2), "%e": (m) => e(m.Xe, 2, " "), "%g": (m) => k(m).toString().substring(2), "%G": (m) => k(m), "%H": (m) => f(m.Ue, 2), "%I": (m) => {\n              m = m.Ue;\n              0 == m ? m = 12 : 12 < m && (m -= 12);\n              return f(m, 2);\n            }, "%j": (m) => {\n              for (var w = 0, y = 0; y <= m.Ve - 1; w += (Cc(m.Oe + 1900) ? Tc : Uc)[y++])\n                ;\n              return f(m.Xe + w, 3);\n            }, "%m": (m) => f(m.Ve + 1, 2), "%M": (m) => f(m.wf, 2), "%n": () => "\\n", "%p": (m) => 0 <= m.Ue && 12 > m.Ue ? "AM" : "PM", "%S": (m) => f(m.xf, 2), "%t": () => "	", "%u": (m) => m.Je || 7, "%U": (m) => f(Math.floor((m.Ne + 7 - m.Je) / 7), 2), "%V": (m) => {\n              var w = Math.floor((m.Ne + 7 - (m.Je + 6) % 7) / 7);\n              2 >= (m.Je + 371 - m.Ne - 2) % 7 && w++;\n              if (w)\n                53 == w && (y = (m.Je + 371 - m.Ne) % 7, 4 == y || 3 == y && Cc(m.Oe) || (w = 1));\n              else {\n                w = 52;\n                var y = (m.Je + 7 - m.Ne - 1) % 7;\n                (4 == y || 5 == y && Cc(m.Oe % 400 - 1)) && w++;\n              }\n              return f(w, 2);\n            }, "%w": (m) => m.Je, "%W": (m) => f(Math.floor((m.Ne + 7 - (m.Je + 6) % 7) / 7), 2), "%y": (m) => (m.Oe + 1900).toString().substring(2), "%Y": (m) => m.Oe + 1900, "%z": (m) => {\n              m = m.vf;\n              var w = 0 <= m;\n              m = Math.abs(m) / 60;\n              return (w ? "+" : "-") + String("0000" + (m / 60 * 100 + m % 60)).slice(-4);\n            }, "%Z": (m) => m.yf, "%%": () => "%" };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (n in l)\n              c.includes(n) && (c = c.replace(new RegExp(n, "g"), l[n](d)));\n            c = c.replace(/\\0\\0/g, "%");\n            n = Vc(c);\n            if (n.length > b)\n              return 0;\n            Wc(n, a);\n            return n.length - 1;\n          }\n          M.We();\n          for (var Yc = Array(256), Zc = 0; 256 > Zc; ++Zc)\n            Yc[Zc] = String.fromCharCode(Zc);\n          Pb = Yc;\n          Tb = C.BindingError = class extends Error {\n            constructor(a) {\n              super(a);\n              this.name = "BindingError";\n            }\n          };\n          C.InternalError = class extends Error {\n            constructor(a) {\n              super(a);\n              this.name = "InternalError";\n            }\n          };\n          Object.assign(Wb.prototype, { get(a) {\n            return this.Ke[a];\n          }, has(a) {\n            return void 0 !== this.Ke[a];\n          }, Se(a) {\n            var b = this.Ye.pop() || this.Ke.length;\n            this.Ke[b] = a;\n            return b;\n          }, Te(a) {\n            this.Ke[a] = void 0;\n            this.Ye.push(a);\n          } });\n          T.Ke.push({ value: void 0 }, { value: null }, { value: true }, { value: false });\n          T.He = T.Ke.length;\n          C.count_emval_handles = () => {\n            for (var a = 0, b = T.He; b < T.Ke.length; ++b)\n              void 0 !== T.Ke[b] && ++a;\n            return a;\n          };\n          var $c = [cb, db, wb, yb, zb, Db, Eb, Fb, Gb, Hb, Ib, Jb, Kb, Lb, Mb, Nb, Fc, Gc, Mc, Nc, Oc, Pc, Qc, Sc], qg = {\n            u: function(a) {\n              a = new rb(a >>> 0);\n              a.gf() || (a.bf(true), qb--);\n              a.cf(false);\n              pb.push(a);\n              ad(a.Re);\n              return a.hf();\n            },\n            N: () => {\n              Y(0, 0);\n              var a = pb.pop();\n              bd(a.Re);\n              Q = 0;\n            },\n            b: function() {\n              return vb([]);\n            },\n            n: function(a) {\n              return vb([a >>> 0]);\n            },\n            y: function(a, b) {\n              return vb([a >>> 0, b >>> 0]);\n            },\n            q: function(a, b, c) {\n              return vb([a >>> 0, b >>> 0, c >>> 0]);\n            },\n            zb: () => {\n              var a = pb.pop();\n              a || Aa("no exception to throw");\n              var b = a.Re;\n              a.nf() || (pb.push(a), a.cf(true), a.bf(false), qb++);\n              Q = b;\n              throw Q;\n            },\n            t: function(a, b, c) {\n              a >>>= 0;\n              new rb(a).We(b >>> 0, c >>> 0);\n              Q = a;\n              qb++;\n              throw Q;\n            },\n            Ta: () => qb,\n            Wc: function(a) {\n              cd(a >>> 0, !ra, 1, !qa, 131072, false);\n              M.df();\n            },\n            Ub: function(a) {\n              a >>>= 0;\n              G ? postMessage({ cmd: "cleanupThread", thread: a }) : ((a = M.Ie[a]) || Aa(), M.$e(a));\n            },\n            Mc: xb,\n            h: function(a) {\n              Q || (Q = a >>> 0);\n              throw Q;\n            },\n            Ab: yb,\n            ad: zb,\n            Hc: Db,\n            Jc: Eb,\n            Ac: Fb,\n            _c: Gb,\n            Tc: Hb,\n            Zc: Ib,\n            Wb: Jb,\n            Ic: Kb,\n            Fc: Lb,\n            $c: Mb,\n            Gc: Nb,\n            Zb: function(a, b, c, d, e) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              b = R(b);\n              var f = -1 != b.indexOf("u");\n              f && (e = (1n << 64n) - 1n);\n              S(a, { name: b, fromWireType: (g) => g, toWireType: function(g, h) {\n                if ("bigint" != typeof h && "number" != typeof h)\n                  throw new TypeError(`Cannot convert "${Ob(h)}" to ${this.name}`);\n                if (h < d || h > e)\n                  throw new TypeError(`Passing a number "${Ob(h)}" from JS side to C/C++ side to an argument of type "${b}", which is outside the valid range [${d}, ${e}]!`);\n                return h;\n              }, argPackAdvance: 8, readValueFromPointer: Vb(b, c, !f), Qe: null });\n            },\n            gd: function(a, b, c, d) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              S(a, { name: b, fromWireType: function(e) {\n                return !!e;\n              }, toWireType: function(e, f) {\n                return f ? c : d;\n              }, argPackAdvance: 8, readValueFromPointer: function(e) {\n                return this.fromWireType(x()[e >>> 0]);\n              }, Qe: null });\n            },\n            ed: function(a, b) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              S(a, { name: b, fromWireType: (c) => {\n                var d = U(c);\n                Xb(c);\n                return d;\n              }, toWireType: (c, d) => V(d), argPackAdvance: 8, readValueFromPointer: Yb, Qe: null });\n            },\n            Yb: function(a, b, c) {\n              a >>>= 0;\n              c >>>= 0;\n              b = R(b >>> 0);\n              S(a, { name: b, fromWireType: (d) => d, toWireType: (d, e) => e, argPackAdvance: 8, readValueFromPointer: Zb(b, c), Qe: null });\n            },\n            wa: function(a, b, c, d, e) {\n              a >>>= 0;\n              c >>>= 0;\n              b = R(b >>> 0);\n              -1 === e && (e = 4294967295);\n              e = (h) => h;\n              if (0 === d) {\n                var f = 32 - 8 * c;\n                e = (h) => h << f >>> f;\n              }\n              var g = b.includes("unsigned") ? function(h, k) {\n                return k >>> 0;\n              } : function(h, k) {\n                return k;\n              };\n              S(a, { name: b, fromWireType: e, toWireType: g, argPackAdvance: 8, readValueFromPointer: Vb(b, c, 0 !== d), Qe: null });\n            },\n            _: function(a, b, c) {\n              function d(f) {\n                var g = B()[f >>> 2 >>> 0];\n                f = B()[f + 4 >>> 2 >>> 0];\n                return new e(p().buffer, f, g);\n              }\n              a >>>= 0;\n              var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];\n              c = R(c >>> 0);\n              S(a, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d }, { pf: true });\n            },\n            _b: function(a, b) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              var c = "std::string" === b;\n              S(a, { name: b, fromWireType: function(d) {\n                var e = B()[d >>> 2 >>> 0], f = d + 4;\n                if (c)\n                  for (var g = f, h = 0; h <= e; ++h) {\n                    var k = f + h;\n                    if (h == e || 0 == x()[k >>> 0]) {\n                      g = bb(g, k - g);\n                      if (void 0 === l)\n                        var l = g;\n                      else\n                        l += String.fromCharCode(0), l += g;\n                      g = k + 1;\n                    }\n                  }\n                else {\n                  l = Array(e);\n                  for (h = 0; h < e; ++h)\n                    l[h] = String.fromCharCode(x()[f + h >>> 0]);\n                  l = l.join("");\n                }\n                X(d);\n                return l;\n              }, toWireType: function(d, e) {\n                e instanceof ArrayBuffer && (e = new Uint8Array(e));\n                var f = "string" == typeof e;\n                if (!(f || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array))\n                  throw new Tb("Cannot pass non-string to std::string");\n                var g = c && f ? Ab(e) : e.length;\n                var h = Hc(4 + g + 1), k = h + 4;\n                B()[h >>> 2 >>> 0] = g;\n                if (c && f)\n                  Cb(e, k, g + 1);\n                else if (f)\n                  for (f = 0; f < g; ++f) {\n                    var l = e.charCodeAt(f);\n                    if (255 < l)\n                      throw X(k), new Tb("String has UTF-16 code units that do not fit in 8 bits");\n                    x()[k + f >>> 0] = l;\n                  }\n                else\n                  for (f = 0; f < g; ++f)\n                    x()[k + f >>> 0] = e[f];\n                null !== d && d.push(X, h);\n                return h;\n              }, argPackAdvance: 8, readValueFromPointer: $b, Qe(d) {\n                X(d);\n              } });\n            },\n            Cb: function(a, b, c) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              c = R(c);\n              if (2 === b) {\n                var d = bc;\n                var e = cc;\n                var f = dc;\n                var g = () => ea();\n                var h = 1;\n              } else\n                4 === b && (d = ec, e = fc, f = gc, g = () => B(), h = 2);\n              S(a, { name: c, fromWireType: (k) => {\n                for (var l = B()[k >>> 2 >>> 0], n = g(), u, v = k + 4, m = 0; m <= l; ++m) {\n                  var w = k + 4 + m * b;\n                  if (m == l || 0 == n[w >>> h])\n                    v = d(v, w - v), void 0 === u ? u = v : (u += String.fromCharCode(0), u += v), v = w + b;\n                }\n                X(k);\n                return u;\n              }, toWireType: (k, l) => {\n                if ("string" != typeof l)\n                  throw new Tb(`Cannot pass non-string to C++ string type ${c}`);\n                var n = f(l), u = Hc(4 + n + b);\n                B()[u >>> 2] = n >> h;\n                e(l, u + 4, n + b);\n                null !== k && k.push(X, u);\n                return u;\n              }, argPackAdvance: 8, readValueFromPointer: Yb, Qe(k) {\n                X(k);\n              } });\n            },\n            kd: function(a, b) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              S(a, {\n                qf: true,\n                name: b,\n                argPackAdvance: 0,\n                fromWireType: () => {\n                },\n                toWireType: () => {\n                }\n              });\n            },\n            dd: () => true,\n            Dc: function(a, b) {\n              a >>>= 0;\n              a == b >>> 0 ? setTimeout(() => jb()) : G ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = M.Ie[a]) && a.postMessage({ cmd: "checkMailbox" });\n            },\n            Nc: function(a, b, c, d) {\n              b >>>= 0;\n              c /= 2;\n              nc.length = c;\n              d = d >>> 0 >>> 3;\n              for (var e = 0; e < c; e++)\n                nc[e] = Fa[d + 2 * e] ? Fa[d + 2 * e + 1] : ja()[d + 2 * e + 1 >>> 0];\n              a = $c[a];\n              M.mf = b;\n              b = a.apply(null, nc);\n              M.mf = 0;\n              return b;\n            },\n            Vc: ic,\n            cd: function(a) {\n              F && M.Ie[a >>> 0].ref();\n            },\n            wd: function(a, b, c) {\n              b >>>= 0;\n              c >>>= 0;\n              a = U(a >>> 0);\n              b = pc(b, "emval::as");\n              var d = [], e = V(d);\n              B()[c >>> 2 >>> 0] = e;\n              return b.toWireType(d, a);\n            },\n            ka: function(a, b, c, d, e) {\n              c >>>= 0;\n              d >>>= 0;\n              e >>>= 0;\n              a = sc[a >>> 0];\n              b = U(b >>> 0);\n              c = rc(c);\n              var f = [];\n              B()[d >>> 2 >>> 0] = V(f);\n              return a(b, c, f, e);\n            },\n            Ed: function(a, b, c, d) {\n              c >>>= 0;\n              d >>>= 0;\n              a = sc[a >>> 0];\n              b = U(b >>> 0);\n              c = rc(c);\n              a(b, c, null, d);\n            },\n            zc: Xb,\n            xd: function(a, b) {\n              b >>>= 0;\n              a = U(a >>> 0);\n              b = U(b);\n              return a == b;\n            },\n            Id: function(a) {\n              a >>>= 0;\n              if (0 === a)\n                return V(tc());\n              a = rc(a);\n              return V(tc()[a]);\n            },\n            la: function(a, b) {\n              var c = vc(a, b >>> 0), d = c[0];\n              b = d.name + "_$" + c.slice(1).map(function(n) {\n                return n.name;\n              }).join("_") + "$";\n              var e = xc[b];\n              if (void 0 !== e)\n                return e;\n              e = ["retType"];\n              for (var f = [d], g = "", h = 0; h < a - 1; ++h)\n                g += (0 !== h ? ", " : "") + "arg" + h, e.push("argType" + h), f.push(c[1 + h]);\n              var k = "return function " + wc("methodCaller_" + b) + "(handle, name, destructors, args) {\\n", l = 0;\n              for (h = 0; h < a - 1; ++h)\n                k += "    var arg" + h + " = argType" + h + ".readValueFromPointer(args" + (l ? "+" + l : "") + ");\\n", l += c[h + 1].argPackAdvance;\n              k += "    var rv = handle[name](" + g + ");\\n";\n              for (h = 0; h < a - 1; ++h)\n                c[h + 1].deleteObject && (k += "    argType" + h + ".deleteObject(arg" + h + ");\\n");\n              d.qf || (k += "    return retType.toWireType(destructors, rv);\\n");\n              e.push(k + "};\\n");\n              a = zc(e).apply(null, f);\n              e = uc(a);\n              return xc[b] = e;\n            },\n            Gd: function(a, b) {\n              b >>>= 0;\n              a = U(a >>> 0);\n              b = U(b);\n              return V(a[b]);\n            },\n            Q: function(a) {\n              a >>>= 0;\n              4 < a && (T.get(a).Ze += 1);\n            },\n            Ad: function(a, b, c, d) {\n              c >>>= 0;\n              d >>>= 0;\n              a = U(a >>> 0);\n              var e = Bc[b];\n              e || (e = Ac(b), Bc[b] = e);\n              return e(a, c, d);\n            },\n            qd: function() {\n              return V([]);\n            },\n            sd: function(a) {\n              a = U(a >>> 0);\n              for (var b = Array(a.length), c = 0; c < a.length; c++)\n                b[c] = a[c];\n              return V(b);\n            },\n            Y: function(a) {\n              return V(rc(a >>> 0));\n            },\n            Sa: function() {\n              return V({});\n            },\n            Bd: function(a) {\n              a >>>= 0;\n              for (var b = U(a); b.length; ) {\n                var c = b.pop();\n                b.pop()(c);\n              }\n              Xb(a);\n            },\n            zd: function(a, b, c) {\n              b >>>= 0;\n              c >>>= 0;\n              a = U(a >>> 0);\n              b = U(b);\n              c = U(c);\n              a[b] = c;\n            },\n            gb: function(a, b) {\n              b >>>= 0;\n              a = pc(a >>> 0, "_emval_take_value");\n              a = a.readValueFromPointer(b);\n              return V(a);\n            },\n            Qc: function(a, b) {\n              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);\n              b >>>= 0;\n              a = new Date(1e3 * a);\n              A()[b >>> 2 >>> 0] = a.getUTCSeconds();\n              A()[b + 4 >>> 2 >>> 0] = a.getUTCMinutes();\n              A()[b + 8 >>> 2 >>> 0] = a.getUTCHours();\n              A()[b + 12 >>> 2 >>> 0] = a.getUTCDate();\n              A()[b + 16 >>> 2 >>> 0] = a.getUTCMonth();\n              A()[b + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              A()[b + 24 >>> 2 >>> 0] = a.getUTCDay();\n              a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n              A()[b + 28 >>> 2 >>> 0] = a;\n            },\n            Rc: function(a, b) {\n              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);\n              b >>>= 0;\n              a = new Date(1e3 * a);\n              A()[b >>> 2 >>> 0] = a.getSeconds();\n              A()[b + 4 >>> 2 >>> 0] = a.getMinutes();\n              A()[b + 8 >>> 2 >>> 0] = a.getHours();\n              A()[b + 12 >>> 2 >>> 0] = a.getDate();\n              A()[b + 16 >>> 2 >>> 0] = a.getMonth();\n              A()[b + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;\n              A()[b + 24 >>> 2 >>> 0] = a.getDay();\n              var c = (Cc(a.getFullYear()) ? Dc : Ec)[a.getMonth()] + a.getDate() - 1 | 0;\n              A()[b + 28 >>> 2 >>> 0] = c;\n              A()[b + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              a = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;\n              A()[b + 32 >>> 2 >>> 0] = a;\n            },\n            Sc: function(a) {\n              a >>>= 0;\n              var b = new Date(A()[a + 20 >>> 2 >>> 0] + 1900, A()[a + 16 >>> 2 >>> 0], A()[a + 12 >>> 2 >>> 0], A()[a + 8 >>> 2 >>> 0], A()[a + 4 >>> 2 >>> 0], A()[a >>> 2 >>> 0], 0), c = A()[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), e = new Date(\n                b.getFullYear(),\n                6,\n                1\n              ).getTimezoneOffset(), f = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), g = Math.min(f, e);\n              0 > c ? A()[a + 32 >>> 2 >>> 0] = Number(e != f && g == d) : 0 < c != (g == d) && (e = Math.max(f, e), b.setTime(b.getTime() + 6e4 * ((0 < c ? g : e) - d)));\n              A()[a + 24 >>> 2 >>> 0] = b.getDay();\n              c = (Cc(b.getFullYear()) ? Dc : Ec)[b.getMonth()] + b.getDate() - 1 | 0;\n              A()[a + 28 >>> 2 >>> 0] = c;\n              A()[a >>> 2 >>> 0] = b.getSeconds();\n              A()[a + 4 >>> 2 >>> 0] = b.getMinutes();\n              A()[a + 8 >>> 2 >>> 0] = b.getHours();\n              A()[a + 12 >>> 2 >>> 0] = b.getDate();\n              A()[a + 16 >>> 2 >>> 0] = b.getMonth();\n              A()[a + 20 >>> 2 >>> 0] = b.getYear();\n              return BigInt(b.getTime() / 1e3);\n            },\n            Oc: Fc,\n            Pc: Gc,\n            Cc: function(a, b, c) {\n              function d(l) {\n                return (l = l.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? l[1] : "GMT";\n              }\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              var e = (/* @__PURE__ */ new Date()).getFullYear(), f = new Date(e, 0, 1), g = new Date(e, 6, 1);\n              e = f.getTimezoneOffset();\n              var h = g.getTimezoneOffset(), k = Math.max(e, h);\n              B()[a >>> 2 >>> 0] = 60 * k;\n              A()[b >>> 2 >>> 0] = Number(e != h);\n              a = d(f);\n              b = d(g);\n              a = Ic(a);\n              b = Ic(b);\n              h < e ? (B()[c >>> 2 >>> 0] = a, B()[c + 4 >>> 2 >>> 0] = b) : (B()[c >>> 2 >>> 0] = b, B()[c + 4 >>> 2 >>> 0] = a);\n            },\n            aa: () => {\n              Aa("");\n            },\n            Vb: () => {\n            },\n            Xb: () => Date.now(),\n            bd: () => {\n              La += 1;\n              throw "unwind";\n            },\n            Ec: function() {\n              return 4294901760;\n            },\n            va: () => performance.timeOrigin + performance.now(),\n            ib: () => F ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency,\n            Bc: function(a) {\n              a >>>= 0;\n              var b = x().length;\n              if (a <= b || 4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var d = b * (1 + 0.2 / c);\n                d = Math.min(d, a + 100663296);\n                var e = Math;\n                d = Math.max(a, d);\n                a: {\n                  e = (e.min.call(e, 4294901760, d + (65536 - d % 65536) % 65536) - q.buffer.byteLength + 65535) / 65536;\n                  try {\n                    q.grow(e);\n                    t();\n                    var f = 1;\n                    break a;\n                  } catch (g) {\n                  }\n                  f = void 0;\n                }\n                if (f)\n                  return true;\n              }\n              return false;\n            },\n            Xc: Mc,\n            Yc: Nc,\n            Lc: eb,\n            Bb: Oc,\n            Tb: Pc,\n            Uc: Qc,\n            Sb: Sc,\n            hb: dd,\n            fd: ed,\n            sa: fd,\n            G: gd,\n            pa: hd,\n            fa: jd,\n            hd: kd,\n            md: ld,\n            O: md,\n            A: nd,\n            c: od,\n            dc: pd,\n            ta: qd,\n            f: rd,\n            Eb: sd,\n            i: td,\n            X: ud,\n            j: vd,\n            id: wd,\n            k: xd,\n            r: yd,\n            s: zd,\n            p: Ad,\n            Ra: Bd,\n            Wa: Cd,\n            ha: Dd,\n            Pb: Ed,\n            _a: Fd,\n            Ib: Gd,\n            mb: Hd,\n            ic: Id,\n            wc: Jd,\n            fc: Kd,\n            gc: Ld,\n            $b: Md,\n            ja: Nd,\n            yb: Od,\n            ya: Pd,\n            Db: Qd,\n            da: Rd,\n            hc: Sd,\n            Pa: Td,\n            F: Ud,\n            L: Vd,\n            Gb: Wd,\n            rd: Xd,\n            oa: Yd,\n            M: Zd,\n            $: $d,\n            V: ae,\n            z: be,\n            Fb: ce,\n            ec: de,\n            C: ee,\n            Hb: fe,\n            pd: ge,\n            Qa: he,\n            cb: ie,\n            jc: je,\n            ac: ke,\n            Mb: le,\n            P: me,\n            H: ne,\n            D: oe,\n            kb: pe,\n            S: qe,\n            e: re,\n            Ya: se,\n            l: te,\n            xa: ue,\n            Xa: ve,\n            vb: we,\n            g: xe,\n            xc: ye,\n            ca: ze,\n            db: Ae,\n            za: Be,\n            lb: Ce,\n            eb: De,\n            d: Ee,\n            uc: Fe,\n            td: Ge,\n            o: He,\n            sc: Ie,\n            m: Je,\n            vc: Ke,\n            rc: Le,\n            vd: Me,\n            w: Ne,\n            Na: Oe,\n            sb: Pe,\n            Ma: Qe,\n            Kb: Re,\n            B: Se,\n            E: Te,\n            W: Ue,\n            Va: Ve,\n            oc: We,\n            Cd: Xe,\n            tb: Ye,\n            ua: Ze,\n            ia: $e,\n            R: af,\n            $a: bf,\n            Ha: cf,\n            Fd: df,\n            jb: ef,\n            Da: ff,\n            lc: gf,\n            Ca: hf,\n            Ea: jf,\n            jd: kf,\n            Dd: lf,\n            na: mf,\n            ud: nf,\n            Ia: of,\n            Ga: pf,\n            qc: qf,\n            Fa: rf,\n            Ja: sf,\n            ob: tf,\n            ga: uf,\n            Aa: vf,\n            kc: wf,\n            pc: xf,\n            Jb: yf,\n            Ba: zf,\n            ma: Af,\n            Rb: Bf,\n            od: Cf,\n            U: Df,\n            wb: Ef,\n            bb: Ff,\n            Ua: Gf,\n            fb: Hf,\n            K: If,\n            T: Jf,\n            xb: Kf,\n            nd: Lf,\n            ba: Mf,\n            nb: Nf,\n            ra: Of,\n            nc: Pf,\n            bc: Qf,\n            Hd: Rf,\n            x: Sf,\n            ab: Tf,\n            yd: Uf,\n            Nb: Vf,\n            mc: Wf,\n            Jd: Xf,\n            Ob: Yf,\n            Lb: Zf,\n            Za: $f,\n            yc: ag,\n            Qb: bg,\n            Ka: cg,\n            cc: dg,\n            Z: eg,\n            tc: fg,\n            J: gg,\n            ld: hg,\n            ub: ig,\n            qa: jg,\n            I: kg,\n            qb: lg,\n            La: mg,\n            Oa: ng,\n            pb: og,\n            rb: pg,\n            v: function(a) {\n              return a >>> 0;\n            },\n            a: q || C.wasmMemory,\n            Kc: Xc,\n            ea: function(a, b, c, d) {\n              return Xc(a >>> 0, b >>> 0, c >>> 0, d >>> 0);\n            }\n          }, Z = function() {\n            var a = { a: qg };\n            Na++;\n            Wa(a, function(b) {\n              var c = b.module;\n              Z = b.instance.exports;\n              Z = rg();\n              M.ef.push(Z.ne);\n              nb = Z.qe;\n              Ja.unshift(Z.Kd);\n              Ba = c;\n              Qa();\n            }).catch(ma);\n            return {};\n          }();\n          C._OrtInit = (a, b) => (C._OrtInit = Z.Ld)(a, b);\n          C._OrtGetLastError = (a, b) => (C._OrtGetLastError = Z.Md)(a, b);\n          C._OrtCreateSessionOptions = (a, b, c, d, e, f, g, h, k, l) => (C._OrtCreateSessionOptions = Z.Nd)(a, b, c, d, e, f, g, h, k, l);\n          C._OrtAppendExecutionProvider = (a, b) => (C._OrtAppendExecutionProvider = Z.Od)(a, b);\n          C._OrtAddFreeDimensionOverride = (a, b, c) => (C._OrtAddFreeDimensionOverride = Z.Pd)(a, b, c);\n          C._OrtAddSessionConfigEntry = (a, b, c) => (C._OrtAddSessionConfigEntry = Z.Qd)(a, b, c);\n          C._OrtReleaseSessionOptions = (a) => (C._OrtReleaseSessionOptions = Z.Rd)(a);\n          C._OrtCreateSession = (a, b, c) => (C._OrtCreateSession = Z.Sd)(a, b, c);\n          C._OrtReleaseSession = (a) => (C._OrtReleaseSession = Z.Td)(a);\n          C._OrtGetInputOutputCount = (a, b, c) => (C._OrtGetInputOutputCount = Z.Ud)(a, b, c);\n          C._OrtGetInputName = (a, b) => (C._OrtGetInputName = Z.Vd)(a, b);\n          C._OrtGetOutputName = (a, b) => (C._OrtGetOutputName = Z.Wd)(a, b);\n          C._OrtFree = (a) => (C._OrtFree = Z.Xd)(a);\n          C._OrtCreateTensor = (a, b, c, d, e, f) => (C._OrtCreateTensor = Z.Yd)(a, b, c, d, e, f);\n          C._OrtGetTensorData = (a, b, c, d, e) => (C._OrtGetTensorData = Z.Zd)(a, b, c, d, e);\n          C._OrtReleaseTensor = (a) => (C._OrtReleaseTensor = Z._d)(a);\n          C._OrtCreateRunOptions = (a, b, c, d) => (C._OrtCreateRunOptions = Z.$d)(a, b, c, d);\n          C._OrtAddRunConfigEntry = (a, b, c) => (C._OrtAddRunConfigEntry = Z.ae)(a, b, c);\n          C._OrtReleaseRunOptions = (a) => (C._OrtReleaseRunOptions = Z.be)(a);\n          C._OrtCreateBinding = (a) => (C._OrtCreateBinding = Z.ce)(a);\n          C._OrtBindInput = (a, b, c) => (C._OrtBindInput = Z.de)(a, b, c);\n          C._OrtBindOutput = (a, b, c, d) => (C._OrtBindOutput = Z.ee)(a, b, c, d);\n          C._OrtClearBoundOutputs = (a) => (C._OrtClearBoundOutputs = Z.fe)(a);\n          C._OrtReleaseBinding = (a) => (C._OrtReleaseBinding = Z.ge)(a);\n          C._OrtRunWithBinding = (a, b, c, d, e) => (C._OrtRunWithBinding = Z.he)(a, b, c, d, e);\n          C._OrtRun = (a, b, c, d, e, f, g, h) => (C._OrtRun = Z.ie)(a, b, c, d, e, f, g, h);\n          C._OrtEndProfiling = (a) => (C._OrtEndProfiling = Z.je)(a);\n          var ib = C._pthread_self = () => (ib = C._pthread_self = Z.ke)(), Hc = C._malloc = (a) => (Hc = C._malloc = Z.le)(a), X = C._free = (a) => (X = C._free = Z.me)(a);\n          C.__emscripten_tls_init = () => (C.__emscripten_tls_init = Z.ne)();\n          var oc = (a) => (oc = Z.oe)(a);\n          C.__embind_initialize_bindings = () => (C.__embind_initialize_bindings = Z.pe)();\n          var cd = C.__emscripten_thread_init = (a, b, c, d, e, f) => (cd = C.__emscripten_thread_init = Z.re)(a, b, c, d, e, f);\n          C.__emscripten_thread_crashed = () => (C.__emscripten_thread_crashed = Z.se)();\n          var mc = (a, b, c, d) => (mc = Z.te)(a, b, c, d), hb = (a) => (hb = Z.ue)(a), ob = C.__emscripten_thread_exit = (a) => (ob = C.__emscripten_thread_exit = Z.ve)(a), jc = C.__emscripten_check_mailbox = () => (jc = C.__emscripten_check_mailbox = Z.we)(), Y = (a, b) => (Y = Z.xe)(a, b), tb = (a) => (tb = Z.ye)(a), lb = (a, b) => (lb = Z.ze)(a, b), W = () => (W = Z.Ae)(), O = (a) => (O = Z.Be)(a), lc = (a) => (lc = Z.Ce)(a), bd = (a) => (bd = Z.De)(a), ad = (a) => (ad = Z.Ee)(a), ub = (a, b, c) => (ub = Z.Fe)(a, b, c), sb = (a) => (sb = Z.Ge)(a);\n          function td(a, b, c, d) {\n            var e = W();\n            try {\n              return P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n            }\n          }\n          function rd(a, b, c) {\n            var d = W();\n            try {\n              return P(a)(b, c);\n            } catch (e) {\n              O(d);\n              if (e !== e + 0)\n                throw e;\n              Y(1, 0);\n            }\n          }\n          function xe(a, b, c) {\n            var d = W();\n            try {\n              P(a)(b, c);\n            } catch (e) {\n              O(d);\n              if (e !== e + 0)\n                throw e;\n              Y(1, 0);\n            }\n          }\n          function od(a, b) {\n            var c = W();\n            try {\n              return P(a)(b);\n            } catch (d) {\n              O(c);\n              if (d !== d + 0)\n                throw d;\n              Y(1, 0);\n            }\n          }\n          function te(a, b) {\n            var c = W();\n            try {\n              P(a)(b);\n            } catch (d) {\n              O(c);\n              if (d !== d + 0)\n                throw d;\n              Y(1, 0);\n            }\n          }\n          function Ud(a, b, c, d) {\n            var e = W();\n            try {\n              return P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n            }\n          }\n          function re(a) {\n            var b = W();\n            try {\n              P(a)();\n            } catch (c) {\n              O(b);\n              if (c !== c + 0)\n                throw c;\n              Y(1, 0);\n            }\n          }\n          function yd(a, b, c, d, e, f, g) {\n            var h = W();\n            try {\n              return P(a)(b, c, d, e, f, g);\n            } catch (k) {\n              O(h);\n              if (k !== k + 0)\n                throw k;\n              Y(1, 0);\n            }\n          }\n          function xd(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              return P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function vd(a, b, c, d, e) {\n            var f = W();\n            try {\n              return P(a)(b, c, d, e);\n            } catch (g) {\n              O(f);\n              if (g !== g + 0)\n                throw g;\n              Y(1, 0);\n            }\n          }\n          function Ee(a, b, c, d) {\n            var e = W();\n            try {\n              P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n            }\n          }\n          function He(a, b, c, d, e) {\n            var f = W();\n            try {\n              P(a)(b, c, d, e);\n            } catch (g) {\n              O(f);\n              if (g !== g + 0)\n                throw g;\n              Y(1, 0);\n            }\n          }\n          function nd(a) {\n            var b = W();\n            try {\n              return P(a)();\n            } catch (c) {\n              O(b);\n              if (c !== c + 0)\n                throw c;\n              Y(1, 0);\n            }\n          }\n          function be(a, b, c) {\n            var d = W();\n            try {\n              return P(a)(b, c);\n            } catch (e) {\n              O(d);\n              if (e !== e + 0)\n                throw e;\n              Y(1, 0);\n            }\n          }\n          function Sf(a, b, c) {\n            var d = W();\n            try {\n              P(a)(b, c);\n            } catch (e) {\n              O(d);\n              if (e !== e + 0)\n                throw e;\n              Y(1, 0);\n            }\n          }\n          function Je(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function zd(a, b, c, d, e, f, g, h) {\n            var k = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h);\n            } catch (l) {\n              O(k);\n              if (l !== l + 0)\n                throw l;\n              Y(1, 0);\n            }\n          }\n          function jd(a, b) {\n            var c = W();\n            try {\n              return P(a)(b);\n            } catch (d) {\n              O(c);\n              if (d !== d + 0)\n                throw d;\n              Y(1, 0);\n            }\n          }\n          function me(a, b) {\n            var c = W();\n            try {\n              return P(a)(b);\n            } catch (d) {\n              O(c);\n              if (d !== d + 0)\n                throw d;\n              Y(1, 0);\n              return 0n;\n            }\n          }\n          function dd(a, b) {\n            var c = W();\n            try {\n              return P(a)(b);\n            } catch (d) {\n              O(c);\n              if (d !== d + 0)\n                throw d;\n              Y(1, 0);\n            }\n          }\n          function Ad(a, b, c, d, e, f, g, h, k) {\n            var l = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h, k);\n            } catch (n) {\n              O(l);\n              if (n !== n + 0)\n                throw n;\n              Y(1, 0);\n            }\n          }\n          function If(a, b, c, d) {\n            var e = W();\n            try {\n              P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n            }\n          }\n          function Ne(a, b, c, d, e, f, g) {\n            var h = W();\n            try {\n              P(a)(b, c, d, e, f, g);\n            } catch (k) {\n              O(h);\n              if (k !== k + 0)\n                throw k;\n              Y(1, 0);\n            }\n          }\n          function Xf(a, b, c, d) {\n            var e = W();\n            try {\n              P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n            }\n          }\n          function Bf(a, b, c, d, e, f, g) {\n            var h = W();\n            try {\n              P(a)(b, c, d, e, f, g);\n            } catch (k) {\n              O(h);\n              if (k !== k + 0)\n                throw k;\n              Y(1, 0);\n            }\n          }\n          function Se(a, b, c, d, e, f, g, h) {\n            var k = W();\n            try {\n              P(a)(b, c, d, e, f, g, h);\n            } catch (l) {\n              O(k);\n              if (l !== l + 0)\n                throw l;\n              Y(1, 0);\n            }\n          }\n          function Mf(a, b, c, d, e) {\n            var f = W();\n            try {\n              P(a)(b, c, d, e);\n            } catch (g) {\n              O(f);\n              if (g !== g + 0)\n                throw g;\n              Y(1, 0);\n            }\n          }\n          function Bd(a, b, c, d, e, f, g, h, k, l) {\n            var n = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h, k, l);\n            } catch (u) {\n              O(n);\n              if (u !== u + 0)\n                throw u;\n              Y(1, 0);\n            }\n          }\n          function Te(a, b, c, d, e, f, g, h, k) {\n            var l = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k);\n            } catch (n) {\n              O(l);\n              if (n !== n + 0)\n                throw n;\n              Y(1, 0);\n            }\n          }\n          function Od(a, b, c, d, e, f, g, h, k, l, n) {\n            var u = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h, k, l, n);\n            } catch (v) {\n              O(u);\n              if (v !== v + 0)\n                throw v;\n              Y(1, 0);\n            }\n          }\n          function ag(a, b, c, d, e, f, g, h, k) {\n            var l = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k);\n            } catch (n) {\n              O(l);\n              if (n !== n + 0)\n                throw n;\n              Y(1, 0);\n            }\n          }\n          function Kf(a, b, c, d, e, f, g) {\n            var h = W();\n            try {\n              P(a)(b, c, d, e, f, g);\n            } catch (k) {\n              O(h);\n              if (k !== k + 0)\n                throw k;\n              Y(1, 0);\n            }\n          }\n          function Ue(a, b, c, d, e, f, g, h, k, l) {\n            var n = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l);\n            } catch (u) {\n              O(n);\n              if (u !== u + 0)\n                throw u;\n              Y(1, 0);\n            }\n          }\n          function ne(a, b, c) {\n            var d = W();\n            try {\n              return P(a)(b, c);\n            } catch (e) {\n              O(d);\n              if (e !== e + 0)\n                throw e;\n              Y(1, 0);\n              return 0n;\n            }\n          }\n          function ye(a, b, c, d) {\n            var e = W();\n            try {\n              P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n            }\n          }\n          function Jd(a, b, c, d, e, f, g, h, k) {\n            var l = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h, k);\n            } catch (n) {\n              O(l);\n              if (n !== n + 0)\n                throw n;\n              Y(1, 0);\n            }\n          }\n          function Dd(a, b, c, d, e, f, g, h, k, l, n, u) {\n            var v = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h, k, l, n, u);\n            } catch (m) {\n              O(v);\n              if (m !== m + 0)\n                throw m;\n              Y(1, 0);\n            }\n          }\n          function bf(a, b, c, d, e, f, g, h, k, l, n, u, v, m) {\n            var w = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m);\n            } catch (y) {\n              O(w);\n              if (y !== y + 0)\n                throw y;\n              Y(1, 0);\n            }\n          }\n          function Rf(a, b, c, d, e, f, g, h, k, l, n, u) {\n            var v = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u);\n            } catch (m) {\n              O(v);\n              if (m !== m + 0)\n                throw m;\n              Y(1, 0);\n            }\n          }\n          function Ef(a, b, c, d, e, f, g, h, k, l, n, u) {\n            var v = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u);\n            } catch (m) {\n              O(v);\n              if (m !== m + 0)\n                throw m;\n              Y(1, 0);\n            }\n          }\n          function Jf(a, b, c, d, e) {\n            var f = W();\n            try {\n              P(a)(b, c, d, e);\n            } catch (g) {\n              O(f);\n              if (g !== g + 0)\n                throw g;\n              Y(1, 0);\n            }\n          }\n          function we(a, b, c, d, e, f, g) {\n            var h = W();\n            try {\n              P(a)(b, c, d, e, f, g);\n            } catch (k) {\n              O(h);\n              if (k !== k + 0)\n                throw k;\n              Y(1, 0);\n            }\n          }\n          function Hf(a, b, c, d, e, f, g, h, k) {\n            var l = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k);\n            } catch (n) {\n              O(l);\n              if (n !== n + 0)\n                throw n;\n              Y(1, 0);\n            }\n          }\n          function De(a, b, c, d, e, f, g) {\n            var h = W();\n            try {\n              P(a)(b, c, d, e, f, g);\n            } catch (k) {\n              O(h);\n              if (k !== k + 0)\n                throw k;\n              Y(1, 0);\n            }\n          }\n          function Ke(a, b, c, d, e, f, g, h, k, l, n) {\n            var u = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n);\n            } catch (v) {\n              O(u);\n              if (v !== v + 0)\n                throw v;\n              Y(1, 0);\n            }\n          }\n          function ig(a, b, c, d, e, f, g, h) {\n            var k = W();\n            try {\n              P(a)(b, c, d, e, f, g, h);\n            } catch (l) {\n              O(k);\n              if (l !== l + 0)\n                throw l;\n              Y(1, 0);\n            }\n          }\n          function oe(a, b, c, d) {\n            var e = W();\n            try {\n              return P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n              return 0n;\n            }\n          }\n          function Fe(a, b, c, d, e) {\n            var f = W();\n            try {\n              P(a)(b, c, d, e);\n            } catch (g) {\n              O(f);\n              if (g !== g + 0)\n                throw g;\n              Y(1, 0);\n            }\n          }\n          function df(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z) {\n            var D = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z);\n            } catch (E) {\n              O(D);\n              if (E !== E + 0)\n                throw E;\n              Y(1, 0);\n            }\n          }\n          function fg(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y) {\n            var z = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y);\n            } catch (D) {\n              O(z);\n              if (D !== D + 0)\n                throw D;\n              Y(1, 0);\n            }\n          }\n          function Af(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function bg(a, b, c, d, e, f, g, h, k) {\n            var l = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k);\n            } catch (n) {\n              O(l);\n              if (n !== n + 0)\n                throw n;\n              Y(1, 0);\n            }\n          }\n          function Vd(a, b, c, d, e) {\n            var f = W();\n            try {\n              return P(a)(b, c, d, e);\n            } catch (g) {\n              O(f);\n              if (g !== g + 0)\n                throw g;\n              Y(1, 0);\n            }\n          }\n          function $d(a, b, c, d, e, f, g, h, k, l, n, u, v, m) {\n            var w = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m);\n            } catch (y) {\n              O(w);\n              if (y !== y + 0)\n                throw y;\n              Y(1, 0);\n            }\n          }\n          function gg(a, b) {\n            var c = W();\n            try {\n              P(a)(b);\n            } catch (d) {\n              O(c);\n              if (d !== d + 0)\n                throw d;\n              Y(1, 0);\n            }\n          }\n          function qe(a, b, c) {\n            var d = W();\n            try {\n              return P(a)(b, c);\n            } catch (e) {\n              O(d);\n              if (e !== e + 0)\n                throw e;\n              Y(1, 0);\n              return 0n;\n            }\n          }\n          function Zd(a, b, c, d, e, f, g, h, k, l) {\n            var n = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h, k, l);\n            } catch (u) {\n              O(n);\n              if (u !== u + 0)\n                throw u;\n              Y(1, 0);\n            }\n          }\n          function md(a, b, c, d, e) {\n            var f = W();\n            try {\n              return P(a)(b, c, d, e);\n            } catch (g) {\n              O(f);\n              if (g !== g + 0)\n                throw g;\n              Y(1, 0);\n            }\n          }\n          function Ye(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w) {\n            var y = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w);\n            } catch (z) {\n              O(y);\n              if (z !== z + 0)\n                throw z;\n              Y(1, 0);\n            }\n          }\n          function se(a, b, c, d, e) {\n            var f = W();\n            try {\n              P(a)(b, c, d, e);\n            } catch (g) {\n              O(f);\n              if (g !== g + 0)\n                throw g;\n              Y(1, 0);\n            }\n          }\n          function Ie(a, b, c, d, e, f, g) {\n            var h = W();\n            try {\n              P(a)(b, c, d, e, f, g);\n            } catch (k) {\n              O(h);\n              if (k !== k + 0)\n                throw k;\n              Y(1, 0);\n            }\n          }\n          function Ae(a, b, c, d, e) {\n            var f = W();\n            try {\n              P(a)(b, c, d, e);\n            } catch (g) {\n              O(f);\n              if (g !== g + 0)\n                throw g;\n              Y(1, 0);\n            }\n          }\n          function Le(a, b, c, d, e, f, g, h) {\n            var k = W();\n            try {\n              P(a)(b, c, d, e, f, g, h);\n            } catch (l) {\n              O(k);\n              if (l !== l + 0)\n                throw l;\n              Y(1, 0);\n            }\n          }\n          function lf(a, b, c, d, e, f, g, h, k, l, n) {\n            var u = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n);\n            } catch (v) {\n              O(u);\n              if (v !== v + 0)\n                throw v;\n              Y(1, 0);\n            }\n          }\n          function Ed(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z) {\n            var D = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z);\n            } catch (E) {\n              O(D);\n              if (E !== E + 0)\n                throw E;\n              Y(1, 0);\n            }\n          }\n          function af(a, b, c, d, e, f, g, h, k, l, n, u, v) {\n            var m = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v);\n            } catch (w) {\n              O(m);\n              if (w !== w + 0)\n                throw w;\n              Y(1, 0);\n            }\n          }\n          function he(a, b) {\n            var c = W();\n            try {\n              return P(a)(b);\n            } catch (d) {\n              O(c);\n              if (d !== d + 0)\n                throw d;\n              Y(1, 0);\n            }\n          }\n          function Fd(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I) {\n            var J = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I);\n            } catch (K) {\n              O(J);\n              if (K !== K + 0)\n                throw K;\n              Y(1, 0);\n            }\n          }\n          function $f(a, b, c, d, e, f, g, h, k, l) {\n            var n = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l);\n            } catch (u) {\n              O(n);\n              if (u !== u + 0)\n                throw u;\n              Y(1, 0);\n            }\n          }\n          function Td(a, b, c, d, e, f, g) {\n            var h = W();\n            try {\n              return P(a)(b, c, d, e, f, g);\n            } catch (k) {\n              O(h);\n              if (k !== k + 0)\n                throw k;\n              Y(1, 0);\n            }\n          }\n          function Ze(a, b, c, d, e, f, g, h, k, l, n) {\n            var u = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n);\n            } catch (v) {\n              O(u);\n              if (v !== v + 0)\n                throw v;\n              Y(1, 0);\n            }\n          }\n          function ae(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              return P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function vf(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function Xe(a, b, c, d, e, f, g, h, k, l, n, u, v, m) {\n            var w = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m);\n            } catch (y) {\n              O(w);\n              if (y !== y + 0)\n                throw y;\n              Y(1, 0);\n            }\n          }\n          function ng(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D) {\n            var E = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D);\n            } catch (I) {\n              O(E);\n              if (I !== I + 0)\n                throw I;\n              Y(1, 0);\n            }\n          }\n          function Pe(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z) {\n            var D = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z);\n            } catch (E) {\n              O(D);\n              if (E !== E + 0)\n                throw E;\n              Y(1, 0);\n            }\n          }\n          function Oe(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y) {\n            var z = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y);\n            } catch (D) {\n              O(z);\n              if (D !== D + 0)\n                throw D;\n              Y(1, 0);\n            }\n          }\n          function Qe(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w) {\n            var y = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w);\n            } catch (z) {\n              O(y);\n              if (z !== z + 0)\n                throw z;\n              Y(1, 0);\n            }\n          }\n          function pg(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I, J) {\n            var K = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I, J);\n            } catch (aa) {\n              O(K);\n              if (aa !== aa + 0)\n                throw aa;\n              Y(1, 0);\n            }\n          }\n          function mg(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E) {\n            var I = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E);\n            } catch (J) {\n              O(I);\n              if (J !== J + 0)\n                throw J;\n              Y(1, 0);\n            }\n          }\n          function lg(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z) {\n            var D = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z);\n            } catch (E) {\n              O(D);\n              if (E !== E + 0)\n                throw E;\n              Y(1, 0);\n            }\n          }\n          function og(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I) {\n            var J = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I);\n            } catch (K) {\n              O(J);\n              if (K !== K + 0)\n                throw K;\n              Y(1, 0);\n            }\n          }\n          function Yf(a, b, c, d, e, f, g, h, k, l) {\n            var n = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l);\n            } catch (u) {\n              O(n);\n              if (u !== u + 0)\n                throw u;\n              Y(1, 0);\n            }\n          }\n          function Vf(a, b, c, d, e, f, g, h, k, l, n) {\n            var u = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n);\n            } catch (v) {\n              O(u);\n              if (v !== v + 0)\n                throw v;\n              Y(1, 0);\n            }\n          }\n          function eg(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w) {\n            var y = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w);\n            } catch (z) {\n              O(y);\n              if (z !== z + 0)\n                throw z;\n              Y(1, 0);\n            }\n          }\n          function kg(a, b, c, d, e, f, g, h, k, l) {\n            var n = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l);\n            } catch (u) {\n              O(n);\n              if (u !== u + 0)\n                throw u;\n              Y(1, 0);\n            }\n          }\n          function jg(a, b, c, d, e, f, g, h, k) {\n            var l = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k);\n            } catch (n) {\n              O(l);\n              if (n !== n + 0)\n                throw n;\n              Y(1, 0);\n            }\n          }\n          function hd(a, b, c, d, e, f, g) {\n            var h = W();\n            try {\n              return P(a)(b, c, d, e, f, g);\n            } catch (k) {\n              O(h);\n              if (k !== k + 0)\n                throw k;\n              Y(1, 0);\n            }\n          }\n          function Be(a, b, c, d, e) {\n            var f = W();\n            try {\n              P(a)(b, c, d, e);\n            } catch (g) {\n              O(f);\n              if (g !== g + 0)\n                throw g;\n              Y(1, 0);\n            }\n          }\n          function le(a, b, c) {\n            var d = W();\n            try {\n              return P(a)(b, c);\n            } catch (e) {\n              O(d);\n              if (e !== e + 0)\n                throw e;\n              Y(1, 0);\n              return 0n;\n            }\n          }\n          function Nd(a, b, c, d, e, f, g) {\n            var h = W();\n            try {\n              return P(a)(b, c, d, e, f, g);\n            } catch (k) {\n              O(h);\n              if (k !== k + 0)\n                throw k;\n              Y(1, 0);\n            }\n          }\n          function Zf(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function Df(a, b, c, d, e, f, g, h, k, l, n) {\n            var u = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n);\n            } catch (v) {\n              O(u);\n              if (v !== v + 0)\n                throw v;\n              Y(1, 0);\n            }\n          }\n          function tf(a, b, c, d, e, f, g, h, k, l, n, u, v) {\n            var m = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v);\n            } catch (w) {\n              O(m);\n              if (w !== w + 0)\n                throw w;\n              Y(1, 0);\n            }\n          }\n          function Rd(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              return P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function qf(a, b, c, d, e, f, g, h, k, l, n, u, v) {\n            var m = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v);\n            } catch (w) {\n              O(m);\n              if (w !== w + 0)\n                throw w;\n              Y(1, 0);\n            }\n          }\n          function xf(a, b, c, d, e, f, g, h) {\n            var k = W();\n            try {\n              P(a)(b, c, d, e, f, g, h);\n            } catch (l) {\n              O(k);\n              if (l !== l + 0)\n                throw l;\n              Y(1, 0);\n            }\n          }\n          function Of(a, b, c, d, e, f, g, h) {\n            var k = W();\n            try {\n              P(a)(b, c, d, e, f, g, h);\n            } catch (l) {\n              O(k);\n              if (l !== l + 0)\n                throw l;\n              Y(1, 0);\n            }\n          }\n          function ie(a, b, c, d) {\n            var e = W();\n            try {\n              return P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n            }\n          }\n          function uf(a, b, c, d, e, f, g, h, k, l) {\n            var n = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l);\n            } catch (u) {\n              O(n);\n              if (u !== u + 0)\n                throw u;\n              Y(1, 0);\n            }\n          }\n          function cg(a, b, c, d, e, f, g, h, k) {\n            var l = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k);\n            } catch (n) {\n              O(l);\n              if (n !== n + 0)\n                throw n;\n              Y(1, 0);\n            }\n          }\n          function sf(a, b, c, d, e, f, g, h, k) {\n            var l = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k);\n            } catch (n) {\n              O(l);\n              if (n !== n + 0)\n                throw n;\n              Y(1, 0);\n            }\n          }\n          function of(a, b, c, d, e, f, g, h, k, l) {\n            var n = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l);\n            } catch (u) {\n              O(n);\n              if (u !== u + 0)\n                throw u;\n              Y(1, 0);\n            }\n          }\n          function Uf(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function We(a, b, c, d, e, f, g, h, k, l, n, u) {\n            var v = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u);\n            } catch (m) {\n              O(v);\n              if (m !== m + 0)\n                throw m;\n              Y(1, 0);\n            }\n          }\n          function Ff(a, b, c, d, e, f, g, h, k, l, n, u, v, m) {\n            var w = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m);\n            } catch (y) {\n              O(w);\n              if (y !== y + 0)\n                throw y;\n              Y(1, 0);\n            }\n          }\n          function Yd(a, b, c, d, e, f, g, h) {\n            var k = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h);\n            } catch (l) {\n              O(k);\n              if (l !== l + 0)\n                throw l;\n              Y(1, 0);\n            }\n          }\n          function cf(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w) {\n            var y = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w);\n            } catch (z) {\n              O(y);\n              if (z !== z + 0)\n                throw z;\n              Y(1, 0);\n            }\n          }\n          function pf(a, b, c, d, e, f, g, h, k, l, n, u, v, m) {\n            var w = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m);\n            } catch (y) {\n              O(w);\n              if (y !== y + 0)\n                throw y;\n              Y(1, 0);\n            }\n          }\n          function mf(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w) {\n            var y = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w);\n            } catch (z) {\n              O(y);\n              if (z !== z + 0)\n                throw z;\n              Y(1, 0);\n            }\n          }\n          function ve(a, b, c) {\n            var d = W();\n            try {\n              P(a)(b, c);\n            } catch (e) {\n              O(d);\n              if (e !== e + 0)\n                throw e;\n              Y(1, 0);\n            }\n          }\n          function Pf(a, b, c, d, e, f, g, h, k) {\n            var l = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k);\n            } catch (n) {\n              O(l);\n              if (n !== n + 0)\n                throw n;\n              Y(1, 0);\n            }\n          }\n          function Re(a, b, c, d, e, f, g, h, k, l, n) {\n            var u = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n);\n            } catch (v) {\n              O(u);\n              if (v !== v + 0)\n                throw v;\n              Y(1, 0);\n            }\n          }\n          function rf(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I, J, K, aa, ug, vg, wg) {\n            var xg = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I, J, K, aa, ug, vg, wg);\n            } catch (fb) {\n              O(xg);\n              if (fb !== fb + 0)\n                throw fb;\n              Y(1, 0);\n            }\n          }\n          function Nf(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function Hd(a, b, c, d, e, f, g, h, k, l, n, u, v) {\n            var m = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h, k, l, n, u, v);\n            } catch (w) {\n              O(m);\n              if (w !== w + 0)\n                throw w;\n              Y(1, 0);\n            }\n          }\n          function $e(a, b, c, d, e, f, g, h, k, l, n, u) {\n            var v = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u);\n            } catch (m) {\n              O(v);\n              if (m !== m + 0)\n                throw m;\n              Y(1, 0);\n            }\n          }\n          function Ce(a, b, c, d, e, f, g, h, k, l, n, u, v) {\n            var m = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v);\n            } catch (w) {\n              O(m);\n              if (w !== w + 0)\n                throw w;\n              Y(1, 0);\n            }\n          }\n          function jf(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I, J) {\n            var K = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I, J);\n            } catch (aa) {\n              O(K);\n              if (aa !== aa + 0)\n                throw aa;\n              Y(1, 0);\n            }\n          }\n          function qd(a, b, c) {\n            var d = W();\n            try {\n              return P(a)(b, c);\n            } catch (e) {\n              O(d);\n              if (e !== e + 0)\n                throw e;\n              Y(1, 0);\n            }\n          }\n          function Me(a, b, c, d, e, f, g, h, k, l, n, u, v) {\n            var m = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v);\n            } catch (w) {\n              O(m);\n              if (w !== w + 0)\n                throw w;\n              Y(1, 0);\n            }\n          }\n          function Wf(a, b, c, d, e, f, g, h, k, l, n, u, v, m) {\n            var w = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m);\n            } catch (y) {\n              O(w);\n              if (y !== y + 0)\n                throw y;\n              Y(1, 0);\n            }\n          }\n          function yf(a, b, c, d, e, f, g, h) {\n            var k = W();\n            try {\n              P(a)(b, c, d, e, f, g, h);\n            } catch (l) {\n              O(k);\n              if (l !== l + 0)\n                throw l;\n              Y(1, 0);\n            }\n          }\n          function ff(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z) {\n            var D = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z);\n            } catch (E) {\n              O(D);\n              if (E !== E + 0)\n                throw E;\n              Y(1, 0);\n            }\n          }\n          function hf(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I) {\n            var J = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I);\n            } catch (K) {\n              O(J);\n              if (K !== K + 0)\n                throw K;\n              Y(1, 0);\n            }\n          }\n          function gf(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E) {\n            var I = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E);\n            } catch (J) {\n              O(I);\n              if (J !== J + 0)\n                throw J;\n              Y(1, 0);\n            }\n          }\n          function nf(a, b, c, d, e, f, g, h, k, l, n) {\n            var u = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n);\n            } catch (v) {\n              O(u);\n              if (v !== v + 0)\n                throw v;\n              Y(1, 0);\n            }\n          }\n          function Cd(a, b, c, d, e, f, g, h, k, l, n) {\n            var u = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h, k, l, n);\n            } catch (v) {\n              O(u);\n              if (v !== v + 0)\n                throw v;\n              Y(1, 0);\n            }\n          }\n          function Gd(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I) {\n            var J = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y, z, D, E, I);\n            } catch (K) {\n              O(J);\n              if (K !== K + 0)\n                throw K;\n              Y(1, 0);\n            }\n          }\n          function Ge(a, b, c, d, e) {\n            var f = W();\n            try {\n              P(a)(b, c, d, e);\n            } catch (g) {\n              O(f);\n              if (g !== g + 0)\n                throw g;\n              Y(1, 0);\n            }\n          }\n          function Ve(a, b, c, d, e, f, g, h, k, l, n, u) {\n            var v = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u);\n            } catch (m) {\n              O(v);\n              if (m !== m + 0)\n                throw m;\n              Y(1, 0);\n            }\n          }\n          function ee(a, b, c, d, e) {\n            var f = W();\n            try {\n              return P(a)(b, c, d, e);\n            } catch (g) {\n              O(f);\n              if (g !== g + 0)\n                throw g;\n              Y(1, 0);\n            }\n          }\n          function pe(a, b, c, d) {\n            var e = W();\n            try {\n              return P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n              return 0n;\n            }\n          }\n          function wf(a, b, c, d, e, f, g) {\n            var h = W();\n            try {\n              P(a)(b, c, d, e, f, g);\n            } catch (k) {\n              O(h);\n              if (k !== k + 0)\n                throw k;\n              Y(1, 0);\n            }\n          }\n          function fe(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              return P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function zf(a, b, c, d, e) {\n            var f = W();\n            try {\n              P(a)(b, c, d, e);\n            } catch (g) {\n              O(f);\n              if (g !== g + 0)\n                throw g;\n              Y(1, 0);\n            }\n          }\n          function je(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              return P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function Gf(a, b, c, d, e, f, g, h, k) {\n            var l = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k);\n            } catch (n) {\n              O(l);\n              if (n !== n + 0)\n                throw n;\n              Y(1, 0);\n            }\n          }\n          function ze(a, b, c, d) {\n            var e = W();\n            try {\n              P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n            }\n          }\n          function Pd(a, b, c, d, e, f, g, h) {\n            var k = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h);\n            } catch (l) {\n              O(k);\n              if (l !== l + 0)\n                throw l;\n              Y(1, 0);\n            }\n          }\n          function Tf(a, b, c, d) {\n            var e = W();\n            try {\n              P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n            }\n          }\n          function ud(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              return P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function Wd(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              return P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function Id(a, b, c, d, e, f, g, h, k, l, n, u) {\n            var v = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h, k, l, n, u);\n            } catch (m) {\n              O(v);\n              if (m !== m + 0)\n                throw m;\n              Y(1, 0);\n            }\n          }\n          function Sd(a, b, c, d, e, f, g, h) {\n            var k = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h);\n            } catch (l) {\n              O(k);\n              if (l !== l + 0)\n                throw l;\n              Y(1, 0);\n            }\n          }\n          function Ld(a, b, c, d, e, f, g, h, k, l, n) {\n            var u = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h, k, l, n);\n            } catch (v) {\n              O(u);\n              if (v !== v + 0)\n                throw v;\n              Y(1, 0);\n            }\n          }\n          function Xd(a, b, c, d, e, f, g) {\n            var h = W();\n            try {\n              return P(a)(b, c, d, e, f, g);\n            } catch (k) {\n              O(h);\n              if (k !== k + 0)\n                throw k;\n              Y(1, 0);\n            }\n          }\n          function Kd(a, b, c, d, e, f, g, h, k, l, n, u, v) {\n            var m = W();\n            try {\n              return P(a)(b, c, d, e, f, g, h, k, l, n, u, v);\n            } catch (w) {\n              O(m);\n              if (w !== w + 0)\n                throw w;\n              Y(1, 0);\n            }\n          }\n          function de(a, b, c, d, e, f, g) {\n            var h = W();\n            try {\n              return P(a)(b, c, d, e, f, g);\n            } catch (k) {\n              O(h);\n              if (k !== k + 0)\n                throw k;\n              Y(1, 0);\n            }\n          }\n          function ge(a, b, c, d, e, f, g) {\n            var h = W();\n            try {\n              return P(a)(b, c, d, e, f, g);\n            } catch (k) {\n              O(h);\n              if (k !== k + 0)\n                throw k;\n              Y(1, 0);\n            }\n          }\n          function ce(a, b, c, d) {\n            var e = W();\n            try {\n              return P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n            }\n          }\n          function Cf(a, b, c, d, e, f, g, h, k, l) {\n            var n = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l);\n            } catch (u) {\n              O(n);\n              if (u !== u + 0)\n                throw u;\n              Y(1, 0);\n            }\n          }\n          function Lf(a, b, c, d, e, f, g, h, k, l, n, u, v) {\n            var m = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v);\n            } catch (w) {\n              O(m);\n              if (w !== w + 0)\n                throw w;\n              Y(1, 0);\n            }\n          }\n          function pd(a, b, c) {\n            var d = W();\n            try {\n              return P(a)(b, c);\n            } catch (e) {\n              O(d);\n              if (e !== e + 0)\n                throw e;\n              Y(1, 0);\n            }\n          }\n          function sd(a, b, c, d) {\n            var e = W();\n            try {\n              return P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n            }\n          }\n          function ue(a, b, c, d) {\n            var e = W();\n            try {\n              P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n            }\n          }\n          function ld(a, b, c, d) {\n            var e = W();\n            try {\n              return P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n            }\n          }\n          function hg(a, b, c, d, e) {\n            var f = W();\n            try {\n              P(a)(b, c, d, e);\n            } catch (g) {\n              O(f);\n              if (g !== g + 0)\n                throw g;\n              Y(1, 0);\n            }\n          }\n          function gd(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              return P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function dg(a, b, c, d, e, f, g, h, k, l, n, u, v) {\n            var m = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v);\n            } catch (w) {\n              O(m);\n              if (w !== w + 0)\n                throw w;\n              Y(1, 0);\n            }\n          }\n          function Qf(a, b, c, d, e, f, g, h, k, l) {\n            var n = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l);\n            } catch (u) {\n              O(n);\n              if (u !== u + 0)\n                throw u;\n              Y(1, 0);\n            }\n          }\n          function fd(a, b, c, d) {\n            var e = W();\n            try {\n              return P(a)(b, c, d);\n            } catch (f) {\n              O(e);\n              if (f !== f + 0)\n                throw f;\n              Y(1, 0);\n            }\n          }\n          function kf(a, b, c, d, e, f, g, h, k, l, n, u) {\n            var v = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u);\n            } catch (m) {\n              O(v);\n              if (m !== m + 0)\n                throw m;\n              Y(1, 0);\n            }\n          }\n          function Qd(a, b, c, d, e) {\n            var f = W();\n            try {\n              return P(a)(b, c, d, e);\n            } catch (g) {\n              O(f);\n              if (g !== g + 0)\n                throw g;\n              Y(1, 0);\n            }\n          }\n          function ke(a) {\n            var b = W();\n            try {\n              return P(a)();\n            } catch (c) {\n              O(b);\n              if (c !== c + 0)\n                throw c;\n              Y(1, 0);\n              return 0n;\n            }\n          }\n          function Md(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              return P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function wd(a, b, c, d, e, f) {\n            var g = W();\n            try {\n              return P(a)(b, c, d, e, f);\n            } catch (h) {\n              O(g);\n              if (h !== h + 0)\n                throw h;\n              Y(1, 0);\n            }\n          }\n          function ef(a, b, c, d, e, f, g, h, k, l, n, u, v, m, w, y) {\n            var z = W();\n            try {\n              P(a)(b, c, d, e, f, g, h, k, l, n, u, v, m, w, y);\n            } catch (D) {\n              O(z);\n              if (D !== D + 0)\n                throw D;\n              Y(1, 0);\n            }\n          }\n          function kd(a, b, c) {\n            var d = W();\n            try {\n              return P(a)(b, c);\n            } catch (e) {\n              O(d);\n              if (e !== e + 0)\n                throw e;\n              Y(1, 0);\n            }\n          }\n          function ed(a, b, c) {\n            var d = W();\n            try {\n              return P(a)(b, c);\n            } catch (e) {\n              O(d);\n              if (e !== e + 0)\n                throw e;\n              Y(1, 0);\n            }\n          }\n          function rg() {\n            var a = Z;\n            a = Object.assign({}, a);\n            var b = (d) => () => d() >>> 0, c = (d) => (e) => d(e) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.ke = b(a.ke);\n            a.le = c(a.le);\n            a.oe = c(a.oe);\n            a.Ae = b(a.Ae);\n            a.Ce = c(a.Ce);\n            return a;\n          }\n          C.keepRuntimeAlive = Ma;\n          C.wasmMemory = q;\n          C.stackAlloc = lc;\n          C.stackSave = W;\n          C.stackRestore = O;\n          C.UTF8ToString = bb;\n          C.stringToUTF8 = Cb;\n          C.lengthBytesUTF8 = Ab;\n          C.ExitStatus = Xa;\n          C.PThread = M;\n          var sg;\n          Pa = function tg() {\n            sg || yg();\n            sg || (Pa = tg);\n          };\n          function yg() {\n            0 < Na || (G ? (la(C), G || kb(Ja), startWorker(C)) : (kb(Ia), 0 < Na || sg || (sg = true, C.calledRun = true, Ca || (G || kb(Ja), la(C), G || kb(Ka)))));\n          }\n          yg();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasmThreaded;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasmThreaded);\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.worker.js\n  var require_ort_wasm_threaded_worker = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module) {\n      module.exports = \'"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>(0,eval)(fs.readFileSync(f,"utf8")+"//# sourceURL="+f),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*is_main=*/0,/*is_runtime=*/0,/*can_block=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){Module["__embind_initialize_bindings"]();initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err(`worker.js received unknown command ${e.data.cmd}`);err(e.data)}}catch(ex){if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}}self.onmessage=handleMessage;\\n\';\n    }\n  });\n\n  // nodejs-ignore:node:path\n  var join = void 0;\n\n  // web/lib/wasm/wasm-factory.ts\n  var ortWasmFactory;\n  if (true) {\n    ortWasmFactory = require_ort_training_wasm_simd();\n  } else {\n    ortWasmFactory = true ? null : null;\n  }\n  var ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;\n  var wasm;\n  var initialized = false;\n  var initializing = false;\n  var aborted = false;\n  var isMultiThreadSupported = () => {\n    try {\n      if (typeof SharedArrayBuffer === "undefined") {\n        return false;\n      }\n      if (typeof MessageChannel !== "undefined") {\n        new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));\n      }\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        5,\n        4,\n        1,\n        3,\n        1,\n        1,\n        10,\n        11,\n        1,\n        9,\n        0,\n        65,\n        0,\n        254,\n        16,\n        2,\n        0,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var isSimdSupported = () => {\n    try {\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        10,\n        30,\n        1,\n        28,\n        0,\n        65,\n        0,\n        253,\n        15,\n        253,\n        12,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        253,\n        186,\n        1,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var getWasmFileName = (useSimd, useThreads) => {\n    if (useSimd) {\n      if (true) {\n        return "ort-training-wasm-simd.wasm";\n      }\n      return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";\n    } else {\n      return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";\n    }\n  };\n  var initializeWebAssembly = async (flags) => {\n    if (initialized) {\n      return Promise.resolve();\n    }\n    if (initializing) {\n      throw new Error("multiple calls to \'initializeWebAssembly()\' detected.");\n    }\n    if (aborted) {\n      throw new Error("previous call to \'initializeWebAssembly()\' failed.");\n    }\n    initializing = true;\n    const timeout = flags.initTimeout;\n    const numThreads = flags.numThreads;\n    const simd = flags.simd;\n    const useThreads = numThreads > 1 && isMultiThreadSupported();\n    const useSimd = simd && isSimdSupported();\n    const wasmPaths = flags.wasmPaths;\n    const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;\n    const wasmFileName = getWasmFileName(useSimd, useThreads);\n    const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;\n    let isTimeout = false;\n    const tasks = [];\n    if (timeout > 0) {\n      tasks.push(new Promise((resolve) => {\n        setTimeout(() => {\n          isTimeout = true;\n          resolve();\n        }, timeout);\n      }));\n    }\n    tasks.push(new Promise((resolve, reject) => {\n      const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;\n      const config = {\n        locateFile: (fileName, scriptDirectory) => {\n          if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {\n            return URL.createObjectURL(new Blob(\n              [\n                // This require() function is handled by esbuild plugin to load file content as string.\n                // eslint-disable-next-line @typescript-eslint/no-require-imports\n                require_ort_wasm_threaded_worker()\n              ],\n              { type: "text/javascript" }\n            ));\n          }\n          if (fileName.endsWith(".wasm")) {\n            if (wasmPathOverride) {\n              return wasmPathOverride;\n            }\n            const prefix = wasmPrefixOverride ?? scriptDirectory;\n            if (false) {\n              if (wasmFileName === "ort-wasm-simd.wasm") {\n                return prefix + "ort-wasm-simd.jsep.wasm";\n              } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {\n                return prefix + "ort-wasm-simd-threaded.jsep.wasm";\n              }\n            }\n            return prefix + wasmFileName;\n          }\n          return scriptDirectory + fileName;\n        }\n      };\n      if (useThreads) {\n        if (typeof Blob === "undefined") {\n          config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");\n        } else {\n          const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;\n          config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });\n        }\n      }\n      factory(config).then(\n        // wasm module initialized successfully\n        (module) => {\n          initializing = false;\n          initialized = true;\n          wasm = module;\n          resolve();\n        },\n        // wasm module failed to initialize\n        (what) => {\n          initializing = false;\n          aborted = true;\n          reject(what);\n        }\n      );\n    }));\n    await Promise.race(tasks);\n    if (isTimeout) {\n      throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);\n    }\n  };\n  var getInstance = () => {\n    if (initialized && wasm) {\n      return wasm;\n    }\n    throw new Error("WebAssembly is not initialized yet.");\n  };\n\n  // web/lib/wasm/wasm-utils.ts\n  var allocWasmString = (data, allocs) => {\n    const wasm2 = getInstance();\n    const dataLength = wasm2.lengthBytesUTF8(data) + 1;\n    const dataOffset = wasm2._malloc(dataLength);\n    wasm2.stringToUTF8(data, dataOffset, dataLength);\n    allocs.push(dataOffset);\n    return dataOffset;\n  };\n  var iterateExtraOptions = (options, prefix, seen, handler) => {\n    if (typeof options == "object" && options !== null) {\n      if (seen.has(options)) {\n        throw new Error("Circular reference in options");\n      } else {\n        seen.add(options);\n      }\n    }\n    Object.entries(options).forEach(([key, value]) => {\n      const name = prefix ? prefix + key : key;\n      if (typeof value === "object") {\n        iterateExtraOptions(value, name + ".", seen, handler);\n      } else if (typeof value === "string" || typeof value === "number") {\n        handler(name, value.toString());\n      } else if (typeof value === "boolean") {\n        handler(name, value ? "1" : "0");\n      } else {\n        throw new Error(`Can\'t handle extra config type: ${typeof value}`);\n      }\n    });\n  };\n  var checkLastError = (message) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const paramsOffset = wasm2.stackAlloc(8);\n      wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);\n      const errorCode = wasm2.HEAP32[paramsOffset / 4];\n      const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];\n      const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";\n      throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n\n  // web/lib/wasm/run-options.ts\n  var setRunOptions = (options) => {\n    const wasm2 = getInstance();\n    let runOptionsHandle = 0;\n    const allocs = [];\n    const runOptions = options || {};\n    try {\n      if (options?.logSeverityLevel === void 0) {\n        runOptions.logSeverityLevel = 2;\n      } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);\n      }\n      if (options?.logVerbosityLevel === void 0) {\n        runOptions.logVerbosityLevel = 0;\n      } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {\n        throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);\n      }\n      if (options?.terminate === void 0) {\n        runOptions.terminate = false;\n      }\n      let tagDataOffset = 0;\n      if (options?.tag !== void 0) {\n        tagDataOffset = allocWasmString(options.tag, allocs);\n      }\n      runOptionsHandle = wasm2._OrtCreateRunOptions(\n        runOptions.logSeverityLevel,\n        runOptions.logVerbosityLevel,\n        !!runOptions.terminate,\n        tagDataOffset\n      );\n      if (runOptionsHandle === 0) {\n        checkLastError("Can\'t create run options.");\n      }\n      if (options?.extra !== void 0) {\n        iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a run config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [runOptionsHandle, allocs];\n    } catch (e) {\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/session-options.ts\n  var getGraphOptimzationLevel = (graphOptimizationLevel) => {\n    switch (graphOptimizationLevel) {\n      case "disabled":\n        return 0;\n      case "basic":\n        return 1;\n      case "extended":\n        return 2;\n      case "all":\n        return 99;\n      default:\n        throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);\n    }\n  };\n  var getExecutionMode = (executionMode) => {\n    switch (executionMode) {\n      case "sequential":\n        return 0;\n      case "parallel":\n        return 1;\n      default:\n        throw new Error(`unsupported execution mode: ${executionMode}`);\n    }\n  };\n  var appendDefaultOptions = (options) => {\n    if (!options.extra) {\n      options.extra = {};\n    }\n    if (!options.extra.session) {\n      options.extra.session = {};\n    }\n    const session = options.extra.session;\n    if (!session.use_ort_model_bytes_directly) {\n      session.use_ort_model_bytes_directly = "1";\n    }\n    if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {\n      options.enableMemPattern = false;\n    }\n  };\n  var setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {\n    for (const ep of executionProviders) {\n      let epName = typeof ep === "string" ? ep : ep.name;\n      switch (epName) {\n        case "xnnpack":\n          epName = "XNNPACK";\n          break;\n        case "webnn":\n          epName = "WEBNN";\n          if (typeof ep !== "string") {\n            const webnnOptions = ep;\n            if (webnnOptions?.deviceType) {\n              const keyDataOffset = allocWasmString("deviceType", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'deviceType\' - ${webnnOptions.deviceType}.`);\n              }\n            }\n            if (webnnOptions?.numThreads) {\n              let numThreads = webnnOptions.numThreads;\n              if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {\n                numThreads = 0;\n              }\n              const keyDataOffset = allocWasmString("numThreads", allocs);\n              const valueDataOffset = allocWasmString(numThreads.toString(), allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'numThreads\' - ${webnnOptions.numThreads}.`);\n              }\n            }\n            if (webnnOptions?.powerPreference) {\n              const keyDataOffset = allocWasmString("powerPreference", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'powerPreference\' - ${webnnOptions.powerPreference}.`\n                );\n              }\n            }\n          }\n          break;\n        case "webgpu":\n          epName = "JS";\n          if (typeof ep !== "string") {\n            const webgpuOptions = ep;\n            if (webgpuOptions?.preferredLayout) {\n              if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {\n                throw new Error(`preferredLayout must be either \'NCHW\' or \'NHWC\': ${webgpuOptions.preferredLayout}`);\n              }\n              const keyDataOffset = allocWasmString("preferredLayout", allocs);\n              const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'preferredLayout\' - ${webgpuOptions.preferredLayout}.`\n                );\n              }\n            }\n          }\n          break;\n        case "wasm":\n        case "cpu":\n          continue;\n        default:\n          throw new Error(`not supported execution provider: ${epName}`);\n      }\n      const epNameDataOffset = allocWasmString(epName, allocs);\n      if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {\n        checkLastError(`Can\'t append execution provider: ${epName}.`);\n      }\n    }\n  };\n  var setSessionOptions = (options) => {\n    const wasm2 = getInstance();\n    let sessionOptionsHandle = 0;\n    const allocs = [];\n    const sessionOptions = options || {};\n    appendDefaultOptions(sessionOptions);\n    try {\n      const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");\n      const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");\n      const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;\n      const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;\n      if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);\n      }\n      const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;\n      if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {\n        throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);\n      }\n      const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;\n      sessionOptionsHandle = wasm2._OrtCreateSessionOptions(\n        graphOptimizationLevel,\n        !!sessionOptions.enableCpuMemArena,\n        !!sessionOptions.enableMemPattern,\n        executionMode,\n        !!sessionOptions.enableProfiling,\n        0,\n        logIdDataOffset,\n        logSeverityLevel,\n        logVerbosityLevel,\n        optimizedModelFilePathOffset\n      );\n      if (sessionOptionsHandle === 0) {\n        checkLastError("Can\'t create session options.");\n      }\n      if (sessionOptions.executionProviders) {\n        setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);\n      }\n      if (sessionOptions.freeDimensionOverrides) {\n        for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {\n          if (typeof name !== "string") {\n            throw new Error(`free dimension override name must be a string: ${name}`);\n          }\n          if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {\n            throw new Error(`free dimension override value must be a non-negative integer: ${value}`);\n          }\n          const nameOffset = allocWasmString(name, allocs);\n          if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {\n            checkLastError(`Can\'t set a free dimension override: ${name} - ${value}.`);\n          }\n        }\n      }\n      if (sessionOptions.extra !== void 0) {\n        iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a session config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [sessionOptionsHandle, allocs];\n    } catch (e) {\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/wasm-common.ts\n  var tensorDataTypeStringToEnum = (type) => {\n    switch (type) {\n      case "int8":\n        return 3 /* int8 */;\n      case "uint8":\n        return 2 /* uint8 */;\n      case "bool":\n        return 9 /* bool */;\n      case "int16":\n        return 5 /* int16 */;\n      case "uint16":\n        return 4 /* uint16 */;\n      case "int32":\n        return 6 /* int32 */;\n      case "uint32":\n        return 12 /* uint32 */;\n      case "float16":\n        return 10 /* float16 */;\n      case "float32":\n        return 1 /* float */;\n      case "float64":\n        return 11 /* double */;\n      case "string":\n        return 8 /* string */;\n      case "int64":\n        return 7 /* int64 */;\n      case "uint64":\n        return 13 /* uint64 */;\n      default:\n        throw new Error(`unsupported data type: ${type}`);\n    }\n  };\n  var tensorDataTypeEnumToString = (typeProto) => {\n    switch (typeProto) {\n      case 3 /* int8 */:\n        return "int8";\n      case 2 /* uint8 */:\n        return "uint8";\n      case 9 /* bool */:\n        return "bool";\n      case 5 /* int16 */:\n        return "int16";\n      case 4 /* uint16 */:\n        return "uint16";\n      case 6 /* int32 */:\n        return "int32";\n      case 12 /* uint32 */:\n        return "uint32";\n      case 10 /* float16 */:\n        return "float16";\n      case 1 /* float */:\n        return "float32";\n      case 11 /* double */:\n        return "float64";\n      case 8 /* string */:\n        return "string";\n      case 7 /* int64 */:\n        return "int64";\n      case 13 /* uint64 */:\n        return "uint64";\n      default:\n        throw new Error(`unsupported data type: ${typeProto}`);\n    }\n  };\n  var getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];\n  var tensorTypeToTypedArrayConstructor = (type) => {\n    switch (type) {\n      case "float16":\n        return Uint16Array;\n      case "float32":\n        return Float32Array;\n      case "uint8":\n        return Uint8Array;\n      case "int8":\n        return Int8Array;\n      case "uint16":\n        return Uint16Array;\n      case "int16":\n        return Int16Array;\n      case "int32":\n        return Int32Array;\n      case "bool":\n        return Uint8Array;\n      case "float64":\n        return Float64Array;\n      case "uint32":\n        return Uint32Array;\n      case "int64":\n        return BigInt64Array;\n      case "uint64":\n        return BigUint64Array;\n      default:\n        throw new Error(`unsupported type: ${type}`);\n    }\n  };\n  var logLevelStringToEnum = (logLevel) => {\n    switch (logLevel) {\n      case "verbose":\n        return 0;\n      case "info":\n        return 1;\n      case "warning":\n        return 2;\n      case "error":\n        return 3;\n      case "fatal":\n        return 4;\n      default:\n        throw new Error(`unsupported logging level: ${logLevel}`);\n    }\n  };\n  var isGpuBufferSupportedType = (type) => type === "float32" || type === "int32" || type === "int64" || type === "bool" || type === "float16" || type === "uint32";\n  var dataLocationStringToEnum = (location) => {\n    switch (location) {\n      case "none":\n        return 0;\n      case "cpu":\n        return 1;\n      case "cpu-pinned":\n        return 2;\n      case "texture":\n        return 3;\n      case "gpu-buffer":\n        return 4;\n      default:\n        throw new Error(`unsupported data location: ${location}`);\n    }\n  };\n\n  // web/lib/wasm/wasm-core-impl.ts\n  var ortEnvInitialized = false;\n  var getSessionInputOutputCount = (sessionHandle) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const dataOffset = wasm2.stackAlloc(8);\n      const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);\n      if (errorCode !== 0) {\n        checkLastError("Can\'t get session input/output count.");\n      }\n      return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var initOrt = (numThreads, loggingLevel) => {\n    const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);\n    if (errorCode !== 0) {\n      checkLastError("Can\'t initialize onnxruntime.");\n    }\n  };\n  var initRuntime = async (env) => {\n    initOrt(env.wasm.numThreads, logLevelStringToEnum(env.logLevel));\n    if (false) {\n      const initJsep = null.init;\n      await initJsep(getInstance(), env);\n    }\n    ortEnvInitialized = true;\n  };\n  var activeSessions = /* @__PURE__ */ new Map();\n  var isOrtEnvInitialized = () => ortEnvInitialized;\n  var createSessionAllocate = (model) => {\n    const wasm2 = getInstance();\n    const modelDataOffset = wasm2._malloc(model.byteLength);\n    if (modelDataOffset === 0) {\n      throw new Error(`Can\'t create a session. failed to allocate a buffer of size ${model.byteLength}.`);\n    }\n    wasm2.HEAPU8.set(model, modelDataOffset);\n    return [modelDataOffset, model.byteLength];\n  };\n  var createSessionFinalize = (modelData, options) => {\n    const wasm2 = getInstance();\n    let sessionHandle = 0;\n    let sessionOptionsHandle = 0;\n    let ioBindingHandle = 0;\n    let allocs = [];\n    const inputNamesUTF8Encoded = [];\n    const outputNamesUTF8Encoded = [];\n    try {\n      [sessionOptionsHandle, allocs] = setSessionOptions(options);\n      sessionHandle = wasm2._OrtCreateSession(modelData[0], modelData[1], sessionOptionsHandle);\n      if (sessionHandle === 0) {\n        checkLastError("Can\'t create a session.");\n      }\n      const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);\n      const inputNames = [];\n      const outputNames = [];\n      const outputPreferredLocations = [];\n      for (let i = 0; i < inputCount; i++) {\n        const name = wasm2._OrtGetInputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an input name.");\n        }\n        inputNamesUTF8Encoded.push(name);\n        inputNames.push(wasm2.UTF8ToString(name));\n      }\n      for (let i = 0; i < outputCount; i++) {\n        const name = wasm2._OrtGetOutputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an output name.");\n        }\n        outputNamesUTF8Encoded.push(name);\n        const nameString = wasm2.UTF8ToString(name);\n        outputNames.push(nameString);\n        if (false) {\n          const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";\n          if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}.`);\n          }\n          outputPreferredLocations.push(location);\n        }\n      }\n      let bindingState = null;\n      if (false) {\n        ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);\n        if (ioBindingHandle === 0) {\n          checkLastError("Can\'t create IO binding.");\n        }\n        bindingState = {\n          handle: ioBindingHandle,\n          outputPreferredLocations,\n          outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))\n        };\n      }\n      activeSessions.set(sessionHandle, [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState]);\n      return [sessionHandle, inputNames, outputNames];\n    } catch (e) {\n      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      if (ioBindingHandle !== 0) {\n        wasm2._OrtReleaseBinding(ioBindingHandle);\n      }\n      if (sessionHandle !== 0) {\n        wasm2._OrtReleaseSession(sessionHandle);\n      }\n      throw e;\n    } finally {\n      wasm2._free(modelData[0]);\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n    }\n  };\n  var createSession = (model, options) => {\n    const modelData = createSessionAllocate(model);\n    return createSessionFinalize(modelData, options);\n  };\n  var releaseSession = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot release session. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    if (ioBindingState) {\n      wasm2._OrtReleaseBinding(ioBindingState.handle);\n    }\n    wasm2.jsepUnregisterBuffers?.(sessionId);\n    inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    wasm2._OrtReleaseSession(sessionHandle);\n    activeSessions.delete(sessionId);\n  };\n  var prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index) => {\n    if (!tensor) {\n      tensorHandles.push(0);\n      return;\n    }\n    const wasm2 = getInstance();\n    const dataType = tensor[0];\n    const dims = tensor[1];\n    const location = tensor[3];\n    let rawData;\n    let dataByteLength;\n    if (dataType === "string" && location === "gpu-buffer") {\n      throw new Error("String tensor is not supported on GPU.");\n    }\n    if (location === "gpu-buffer") {\n      const gpuBuffer = tensor[2].gpuBuffer;\n      const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));\n      dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;\n      rawData = wasm2.jsepRegisterBuffer(sessionId, index, gpuBuffer, dataByteLength);\n    } else {\n      const data = tensor[2];\n      if (Array.isArray(data)) {\n        dataByteLength = 4 * data.length;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        let dataIndex = rawData / 4;\n        for (let i = 0; i < data.length; i++) {\n          if (typeof data[i] !== "string") {\n            throw new TypeError(`tensor data at index ${i} is not a string`);\n          }\n          wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);\n        }\n      } else {\n        dataByteLength = data.byteLength;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);\n      }\n    }\n    const stack = wasm2.stackSave();\n    const dimsOffset = wasm2.stackAlloc(4 * dims.length);\n    try {\n      let dimIndex = dimsOffset / 4;\n      dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);\n      const tensor2 = wasm2._OrtCreateTensor(\n        tensorDataTypeStringToEnum(dataType),\n        rawData,\n        dataByteLength,\n        dimsOffset,\n        dims.length,\n        dataLocationStringToEnum(location)\n      );\n      if (tensor2 === 0) {\n        checkLastError(`Can\'t create tensor for input/output. session=${sessionId}, index=${index}.`);\n      }\n      tensorHandles.push(tensor2);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot run inference. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    const inputCount = inputIndices.length;\n    const outputCount = outputIndices.length;\n    let runOptionsHandle = 0;\n    let runOptionsAllocs = [];\n    const inputTensorHandles = [];\n    const outputTensorHandles = [];\n    const inputOutputAllocs = [];\n    const beforeRunStack = wasm2.stackSave();\n    const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);\n    const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);\n    const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);\n    const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);\n    try {\n      [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);\n      for (let i = 0; i < inputCount; i++) {\n        prepareInputOutputTensor(inputTensors[i], inputTensorHandles, inputOutputAllocs, sessionId, inputIndices[i]);\n      }\n      for (let i = 0; i < outputCount; i++) {\n        prepareInputOutputTensor(\n          outputTensors[i],\n          outputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputCount + outputIndices[i]\n        );\n      }\n      let inputValuesIndex = inputValuesOffset / 4;\n      let inputNamesIndex = inputNamesOffset / 4;\n      let outputValuesIndex = outputValuesOffset / 4;\n      let outputNamesIndex = outputNamesOffset / 4;\n      for (let i = 0; i < inputCount; i++) {\n        wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];\n        wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];\n      }\n      for (let i = 0; i < outputCount; i++) {\n        wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];\n        wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];\n      }\n      if (false) {\n        const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;\n        if (inputNamesUTF8Encoded.length !== inputCount) {\n          throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model\'s input count (${inputNamesUTF8Encoded.length}).`);\n        }\n        for (let i = 0; i < inputCount; i++) {\n          const index = inputIndices[i];\n          const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t bind input[${i}] for session=${sessionId}.`);\n          }\n        }\n        for (let i = 0; i < outputCount; i++) {\n          const index = outputIndices[i];\n          const location = outputTensors[i]?.[3];\n          if (location) {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind pre-allocated output[${i}] for session=${sessionId}.`);\n            }\n          } else {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);\n            }\n          }\n        }\n      }\n      let errorCode;\n      if (false) {\n        errorCode = await wasm2._OrtRunWithBinding(\n          sessionHandle,\n          ioBindingState.handle,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      } else {\n        errorCode = await wasm2._OrtRun(\n          sessionHandle,\n          inputNamesOffset,\n          inputValuesOffset,\n          inputCount,\n          outputNamesOffset,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      }\n      if (errorCode !== 0) {\n        checkLastError("failed to call OrtRun().");\n      }\n      const output = [];\n      for (let i = 0; i < outputCount; i++) {\n        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];\n        if (tensor === outputTensorHandles[i]) {\n          output.push(outputTensors[i]);\n          continue;\n        }\n        const beforeGetTensorDataStack = wasm2.stackSave();\n        const tensorDataOffset = wasm2.stackAlloc(4 * 4);\n        let keepOutputTensor = false;\n        let type, dataOffset = 0;\n        try {\n          const errorCode2 = wasm2._OrtGetTensorData(\n            tensor,\n            tensorDataOffset,\n            tensorDataOffset + 4,\n            tensorDataOffset + 8,\n            tensorDataOffset + 12\n          );\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t access output tensor data on index ${i}.`);\n          }\n          let tensorDataIndex = tensorDataOffset / 4;\n          const dataType = wasm2.HEAPU32[tensorDataIndex++];\n          dataOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];\n          const dims = [];\n          for (let i2 = 0; i2 < dimsLength; i2++) {\n            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);\n          }\n          wasm2._OrtFree(dimsOffset);\n          const size = dims.reduce((a, b) => a * b, 1);\n          type = tensorDataTypeEnumToString(dataType);\n          const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];\n          if (type === "string") {\n            if (preferredLocation === "gpu-buffer") {\n              throw new Error("String tensor is not supported on GPU.");\n            }\n            const stringData = [];\n            let dataIndex = dataOffset / 4;\n            for (let i2 = 0; i2 < size; i2++) {\n              const offset = wasm2.HEAPU32[dataIndex++];\n              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;\n              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));\n            }\n            output.push([type, dims, stringData, "cpu"]);\n          } else {\n            if (preferredLocation === "gpu-buffer" && size > 0) {\n              const gpuBuffer = wasm2.jsepGetBuffer(dataOffset);\n              const elementSize = getTensorElementSize(dataType);\n              if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {\n                throw new Error(`Unsupported data type: ${type}`);\n              }\n              keepOutputTensor = true;\n              output.push([\n                type,\n                dims,\n                {\n                  gpuBuffer,\n                  download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),\n                  dispose: () => {\n                    wasm2._OrtReleaseTensor(tensor);\n                  }\n                },\n                "gpu-buffer"\n              ]);\n            } else {\n              const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);\n              const data = new typedArrayConstructor(size);\n              new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));\n              output.push([type, dims, data, "cpu"]);\n            }\n          }\n        } finally {\n          wasm2.stackRestore(beforeGetTensorDataStack);\n          if (type === "string" && dataOffset) {\n            wasm2._free(dataOffset);\n          }\n          if (!keepOutputTensor) {\n            wasm2._OrtReleaseTensor(tensor);\n          }\n        }\n      }\n      if (ioBindingState) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n      }\n      return output;\n    } finally {\n      wasm2.stackRestore(beforeRunStack);\n      inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      inputOutputAllocs.forEach((p) => wasm2._free(p));\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      runOptionsAllocs.forEach((p) => wasm2._free(p));\n    }\n  };\n  var endProfiling = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error("invalid session id");\n    }\n    const sessionHandle = session[0];\n    const profileFileName = wasm2._OrtEndProfiling(sessionHandle);\n    if (profileFileName === 0) {\n      checkLastError("Can\'t get an profile file name.");\n    }\n    wasm2._OrtFree(profileFileName);\n  };\n  var extractTransferableBuffers = (tensors) => {\n    const buffers = [];\n    for (const tensor of tensors) {\n      const data = tensor[2];\n      if (!Array.isArray(data) && "buffer" in data) {\n        buffers.push(data.buffer);\n      }\n    }\n    return buffers;\n  };\n\n  // web/lib/wasm/proxy-worker/main.ts\n  self.onmessage = (ev) => {\n    switch (ev.data.type) {\n      case "init-wasm":\n        try {\n          initializeWebAssembly(ev.data.in).then(\n            () => postMessage({ type: "init-wasm" }),\n            (err) => postMessage({ type: "init-wasm", err })\n          );\n        } catch (err) {\n          postMessage({ type: "init-wasm", err });\n        }\n        break;\n      case "init-ort":\n        try {\n          initRuntime(ev.data.in).then(() => postMessage({ type: "init-ort" }), (err) => postMessage({\n            type: "init-ort",\n            err\n          }));\n        } catch (err) {\n          postMessage({ type: "init-ort", err });\n        }\n        break;\n      case "create_allocate":\n        try {\n          const { model } = ev.data.in;\n          const modeldata = createSessionAllocate(model);\n          postMessage({ type: "create_allocate", out: modeldata });\n        } catch (err) {\n          postMessage({ type: "create_allocate", err });\n        }\n        break;\n      case "create_finalize":\n        try {\n          const { modeldata, options } = ev.data.in;\n          const sessionMetadata = createSessionFinalize(modeldata, options);\n          postMessage({ type: "create_finalize", out: sessionMetadata });\n        } catch (err) {\n          postMessage({ type: "create_finalize", err });\n        }\n        break;\n      case "create":\n        try {\n          const { model, options } = ev.data.in;\n          const sessionMetadata = createSession(model, options);\n          postMessage({ type: "create", out: sessionMetadata });\n        } catch (err) {\n          postMessage({ type: "create", err });\n        }\n        break;\n      case "release":\n        try {\n          const handler = ev.data.in;\n          releaseSession(handler);\n          postMessage({ type: "release" });\n        } catch (err) {\n          postMessage({ type: "release", err });\n        }\n        break;\n      case "run":\n        try {\n          const { sessionId, inputIndices, inputs, outputIndices, options } = ev.data.in;\n          run(sessionId, inputIndices, inputs, outputIndices, options).then(\n            (outputs) => {\n              postMessage({ type: "run", out: outputs }, extractTransferableBuffers(outputs));\n            },\n            (err) => {\n              postMessage({ type: "run", err });\n            }\n          );\n        } catch (err) {\n          postMessage({ type: "run", err });\n        }\n        break;\n      case "end-profiling":\n        try {\n          const handler = ev.data.in;\n          endProfiling(handler);\n          postMessage({ type: "end-profiling" });\n        } catch (err) {\n          postMessage({ type: "end-profiling", err });\n        }\n        break;\n      case "is-ort-env-initialized":\n        try {\n          const ortEnvInitialized2 = isOrtEnvInitialized();\n          postMessage({ type: "is-ort-env-initialized", out: ortEnvInitialized2 });\n        } catch (err) {\n          postMessage({ type: "is-ort-env-initialized", err });\n        }\n        break;\n      default:\n    }\n  };\n})();\n//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZWpzLWlnbm9yZTpmcyIsICJub2RlanMtaWdub3JlOnBhdGgiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtdHJhaW5pbmctd2FzbS1zaW1kLmpzIiwgIm5vZGVqcy1pZ25vcmU6d29ya2VyX3RocmVhZHMiLCAibm9kZWpzLWlnbm9yZTpwZXJmX2hvb2tzIiwgIm5vZGVqcy1pZ25vcmU6b3MiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC5qcyIsICIuLi8uLi9saWIvd2FzbS9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLndvcmtlci5qcyIsICJub2RlanMtaWdub3JlOm5vZGU6cGF0aCIsICIuLi8uLi9saWIvd2FzbS93YXNtLWZhY3RvcnkudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS11dGlscy50cyIsICIuLi8uLi9saWIvd2FzbS9ydW4tb3B0aW9ucy50cyIsICIuLi8uLi9saWIvd2FzbS9zZXNzaW9uLW9wdGlvbnMudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS1jb21tb24udHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS1jb3JlLWltcGwudHMiLCAiLi4vLi4vbGliL3dhc20vcHJveHktd29ya2VyL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBjb25zdCByZWFkRmlsZSA9IHVuZGVmaW5lZDsiLCAiZXhwb3J0IGNvbnN0IGpvaW4gPSB1bmRlZmluZWQ7IiwgIlxudmFyIG9ydFdhc20gPSAoKCkgPT4ge1xuICB2YXIgX3NjcmlwdERpciA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuY3VycmVudFNjcmlwdCA/IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjIDogdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIF9fZmlsZW5hbWUgIT09ICd1bmRlZmluZWQnKSBfc2NyaXB0RGlyID0gX3NjcmlwdERpciB8fCBfX2ZpbGVuYW1lO1xuICByZXR1cm4gKFxuZnVuY3Rpb24obW9kdWxlQXJnID0ge30pIHtcblxudmFyIGQ9bW9kdWxlQXJnLGFhLGw7ZC5yZWFkeT1uZXcgUHJvbWlzZSgoYSxiKT0+e2FhPWE7bD1ifSk7dmFyIGJhPU9iamVjdC5hc3NpZ24oe30sZCksbT1cIi4vdGhpcy5wcm9ncmFtXCIsY2E9XCJvYmplY3RcIj09dHlwZW9mIHdpbmRvdyxyPVwiZnVuY3Rpb25cIj09dHlwZW9mIGltcG9ydFNjcmlwdHMsZGE9XCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MmJlwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zJiZcInN0cmluZ1wiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlLHc9XCJcIix4LHksejtcbmlmKGRhKXt2YXIgZnM9cmVxdWlyZShcImZzXCIpLEI9cmVxdWlyZShcInBhdGhcIik7dz1yP0IuZGlybmFtZSh3KStcIi9cIjpfX2Rpcm5hbWUrXCIvXCI7eD0oYSxiKT0+e2E9YS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGEpOkIubm9ybWFsaXplKGEpO3JldHVybiBmcy5yZWFkRmlsZVN5bmMoYSxiP3ZvaWQgMDpcInV0ZjhcIil9O3o9YT0+e2E9eChhLCEwKTthLmJ1ZmZlcnx8KGE9bmV3IFVpbnQ4QXJyYXkoYSkpO3JldHVybiBhfTt5PShhLGIsYyxlPSEwKT0+e2E9YS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGEpOkIubm9ybWFsaXplKGEpO2ZzLnJlYWRGaWxlKGEsZT92b2lkIDA6XCJ1dGY4XCIsKGcsaCk9PntnP2MoZyk6YihlP2guYnVmZmVyOmgpfSl9OyFkLnRoaXNQcm9ncmFtJiYxPHByb2Nlc3MuYXJndi5sZW5ndGgmJihtPXByb2Nlc3MuYXJndlsxXS5yZXBsYWNlKC9cXFxcL2csXCIvXCIpKTtwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7ZC5pbnNwZWN0PSgpPT5cIltFbXNjcmlwdGVuIE1vZHVsZSBvYmplY3RdXCJ9ZWxzZSBpZihjYXx8XG5yKXI/dz1zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYodz1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksX3NjcmlwdERpciYmKHc9X3NjcmlwdERpciksMCE9PXcuaW5kZXhPZihcImJsb2I6XCIpP3c9dy5zdWJzdHIoMCx3LnJlcGxhY2UoL1s/I10uKi8sXCJcIikubGFzdEluZGV4T2YoXCIvXCIpKzEpOnc9XCJcIix4PWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5zZW5kKG51bGwpO3JldHVybiBiLnJlc3BvbnNlVGV4dH0sciYmKHo9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7Yi5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheShiLnJlc3BvbnNlKX0pLHk9KGEsYixjKT0+e3ZhciBlPW5ldyBYTUxIdHRwUmVxdWVzdDtlLm9wZW4oXCJHRVRcIixhLCEwKTtlLnJlc3BvbnNlVHlwZT1cblwiYXJyYXlidWZmZXJcIjtlLm9ubG9hZD0oKT0+ezIwMD09ZS5zdGF0dXN8fDA9PWUuc3RhdHVzJiZlLnJlc3BvbnNlP2IoZS5yZXNwb25zZSk6YygpfTtlLm9uZXJyb3I9YztlLnNlbmQobnVsbCl9O3ZhciBlYT1kLnByaW50fHxjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLEM9ZC5wcmludEVycnx8Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpO09iamVjdC5hc3NpZ24oZCxiYSk7YmE9bnVsbDtkLnRoaXNQcm9ncmFtJiYobT1kLnRoaXNQcm9ncmFtKTt2YXIgRDtkLndhc21CaW5hcnkmJihEPWQud2FzbUJpbmFyeSk7dmFyIG5vRXhpdFJ1bnRpbWU9ZC5ub0V4aXRSdW50aW1lfHwhMDtcIm9iamVjdFwiIT10eXBlb2YgV2ViQXNzZW1ibHkmJkUoXCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkXCIpO3ZhciBGLEcsZmE9ITEsSCxJLEosSztcbmZ1bmN0aW9uIGhhKCl7dmFyIGE9Ri5idWZmZXI7ZC5IRUFQOD1IPW5ldyBJbnQ4QXJyYXkoYSk7ZC5IRUFQMTY9bmV3IEludDE2QXJyYXkoYSk7ZC5IRUFQMzI9Sj1uZXcgSW50MzJBcnJheShhKTtkLkhFQVBVOD1JPW5ldyBVaW50OEFycmF5KGEpO2QuSEVBUFUxNj1uZXcgVWludDE2QXJyYXkoYSk7ZC5IRUFQVTMyPUs9bmV3IFVpbnQzMkFycmF5KGEpO2QuSEVBUEYzMj1uZXcgRmxvYXQzMkFycmF5KGEpO2QuSEVBUEY2ND1uZXcgRmxvYXQ2NEFycmF5KGEpfXZhciBMLGlhPVtdLGphPVtdLGthPVtdO2Z1bmN0aW9uIGxhKCl7dmFyIGE9ZC5wcmVSdW4uc2hpZnQoKTtpYS51bnNoaWZ0KGEpfXZhciBNPTAsTj1udWxsLE89bnVsbDtcbmZ1bmN0aW9uIEUoYSl7aWYoZC5vbkFib3J0KWQub25BYm9ydChhKTthPVwiQWJvcnRlZChcIithK1wiKVwiO0MoYSk7ZmE9ITA7YT1uZXcgV2ViQXNzZW1ibHkuUnVudGltZUVycm9yKGErXCIuIEJ1aWxkIHdpdGggLXNBU1NFUlRJT05TIGZvciBtb3JlIGluZm8uXCIpO2woYSk7dGhyb3cgYTt9ZnVuY3Rpb24gbWEoYSl7cmV0dXJuIGEuc3RhcnRzV2l0aChcImRhdGE6YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtO2Jhc2U2NCxcIil9dmFyIFA7UD1cIm9ydC10cmFpbmluZy13YXNtLXNpbWQud2FzbVwiO2lmKCFtYShQKSl7dmFyIG5hPVA7UD1kLmxvY2F0ZUZpbGU/ZC5sb2NhdGVGaWxlKG5hLHcpOncrbmF9ZnVuY3Rpb24gb2EoYSl7aWYoYT09UCYmRClyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoRCk7aWYoeilyZXR1cm4geihhKTt0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjt9XG5mdW5jdGlvbiBwYShhKXtpZighRCYmKGNhfHxyKSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZmV0Y2gmJiFhLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpKXJldHVybiBmZXRjaChhLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGI9PntpZighYi5vayl0aHJvd1wiZmFpbGVkIHRvIGxvYWQgd2FzbSBiaW5hcnkgZmlsZSBhdCAnXCIrYStcIidcIjtyZXR1cm4gYi5hcnJheUJ1ZmZlcigpfSkuY2F0Y2goKCk9Pm9hKGEpKTtpZih5KXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e3koYSxlPT5iKG5ldyBVaW50OEFycmF5KGUpKSxjKX0pfXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT5vYShhKSl9ZnVuY3Rpb24gcWEoYSxiLGMpe3JldHVybiBwYShhKS50aGVuKGU9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGUsYikpLnRoZW4oZT0+ZSkudGhlbihjLGU9PntDKFwiZmFpbGVkIHRvIGFzeW5jaHJvbm91c2x5IHByZXBhcmUgd2FzbTogXCIrZSk7RShlKX0pfVxuZnVuY3Rpb24gcmEoYSxiKXt2YXIgYz1QO3JldHVybiBEfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZ3x8bWEoYyl8fGMuc3RhcnRzV2l0aChcImZpbGU6Ly9cIil8fGRhfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBmZXRjaD9xYShjLGEsYik6ZmV0Y2goYyx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSkudGhlbihlPT5XZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhlLGEpLnRoZW4oYixmdW5jdGlvbihnKXtDKFwid2FzbSBzdHJlYW1pbmcgY29tcGlsZSBmYWlsZWQ6IFwiK2cpO0MoXCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvblwiKTtyZXR1cm4gcWEoYyxhLGIpfSkpfXZhciBRLFI9YT0+e2Zvcig7MDxhLmxlbmd0aDspYS5zaGlmdCgpKGQpfTtcbmZ1bmN0aW9uIHNhKGEpe3RoaXMuS2E9YS0yNDt0aGlzLlBhPWZ1bmN0aW9uKGIpe0tbdGhpcy5LYSs0Pj4yPj4+MF09Yn07dGhpcy5PYT1mdW5jdGlvbihiKXtLW3RoaXMuS2ErOD4+Mj4+PjBdPWJ9O3RoaXMuTWE9ZnVuY3Rpb24oYixjKXt0aGlzLk5hKCk7dGhpcy5QYShiKTt0aGlzLk9hKGMpfTt0aGlzLk5hPWZ1bmN0aW9uKCl7S1t0aGlzLkthKzE2Pj4yPj4+MF09MH19XG52YXIgdGE9MCx1YT0wLHZhPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBUZXh0RGVjb2Rlcj9uZXcgVGV4dERlY29kZXIoXCJ1dGY4XCIpOnZvaWQgMCx3YT0oYSxiLGMpPT57Yj4+Pj0wO3ZhciBlPWIrYztmb3IoYz1iO2FbY10mJiEoYz49ZSk7KSsrYztpZigxNjxjLWImJmEuYnVmZmVyJiZ2YSlyZXR1cm4gdmEuZGVjb2RlKGEuc3ViYXJyYXkoYixjKSk7Zm9yKGU9XCJcIjtiPGM7KXt2YXIgZz1hW2IrK107aWYoZyYxMjgpe3ZhciBoPWFbYisrXSY2MztpZigxOTI9PShnJjIyNCkpZSs9U3RyaW5nLmZyb21DaGFyQ29kZSgoZyYzMSk8PDZ8aCk7ZWxzZXt2YXIgaz1hW2IrK10mNjM7Zz0yMjQ9PShnJjI0MCk/KGcmMTUpPDwxMnxoPDw2fGs6KGcmNyk8PDE4fGg8PDEyfGs8PDZ8YVtiKytdJjYzOzY1NTM2Pmc/ZSs9U3RyaW5nLmZyb21DaGFyQ29kZShnKTooZy09NjU1MzYsZSs9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxnPj4xMCw1NjMyMHxnJjEwMjMpKX19ZWxzZSBlKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGcpfXJldHVybiBlfSxcblM9KGEsYik9PihhPj4+PTApP3dhKEksYSxiKTpcIlwiLFQ9YT0+e2Zvcih2YXIgYj0wLGM9MDtjPGEubGVuZ3RoOysrYyl7dmFyIGU9YS5jaGFyQ29kZUF0KGMpOzEyNz49ZT9iKys6MjA0Nz49ZT9iKz0yOjU1Mjk2PD1lJiY1NzM0Mz49ZT8oYis9NCwrK2MpOmIrPTN9cmV0dXJuIGJ9LFU9KGEsYixjLGUpPT57Yz4+Pj0wO2lmKCEoMDxlKSlyZXR1cm4gMDt2YXIgZz1jO2U9YytlLTE7Zm9yKHZhciBoPTA7aDxhLmxlbmd0aDsrK2gpe3ZhciBrPWEuY2hhckNvZGVBdChoKTtpZig1NTI5Njw9ayYmNTczNDM+PWspe3ZhciBwPWEuY2hhckNvZGVBdCgrK2gpO2s9NjU1MzYrKChrJjEwMjMpPDwxMCl8cCYxMDIzfWlmKDEyNz49ayl7aWYoYz49ZSlicmVhaztiW2MrKz4+PjBdPWt9ZWxzZXtpZigyMDQ3Pj1rKXtpZihjKzE+PWUpYnJlYWs7YltjKys+Pj4wXT0xOTJ8az4+Nn1lbHNle2lmKDY1NTM1Pj1rKXtpZihjKzI+PWUpYnJlYWs7YltjKys+Pj4wXT0yMjR8az4+MTJ9ZWxzZXtpZihjKzM+PVxuZSlicmVhaztiW2MrKz4+PjBdPTI0MHxrPj4xODtiW2MrKz4+PjBdPTEyOHxrPj4xMiY2M31iW2MrKz4+PjBdPTEyOHxrPj42JjYzfWJbYysrPj4+MF09MTI4fGsmNjN9fWJbYz4+PjBdPTA7cmV0dXJuIGMtZ30sVj1hPT4wPT09YSU0JiYoMCE9PWElMTAwfHwwPT09YSU0MDApLHhhPVswLDMxLDYwLDkxLDEyMSwxNTIsMTgyLDIxMywyNDQsMjc0LDMwNSwzMzVdLHlhPVswLDMxLDU5LDkwLDEyMCwxNTEsMTgxLDIxMiwyNDMsMjczLDMwNCwzMzRdLERhPWE9Pnt2YXIgYj1UKGEpKzEsYz16YShiKTtjJiZVKGEsSSxjLGIpO3JldHVybiBjfSxXPXt9LEZhPSgpPT57aWYoIUVhKXt2YXIgYT17VVNFUjpcIndlYl91c2VyXCIsTE9HTkFNRTpcIndlYl91c2VyXCIsUEFUSDpcIi9cIixQV0Q6XCIvXCIsSE9NRTpcIi9ob21lL3dlYl91c2VyXCIsTEFORzooXCJvYmplY3RcIj09dHlwZW9mIG5hdmlnYXRvciYmbmF2aWdhdG9yLmxhbmd1YWdlcyYmbmF2aWdhdG9yLmxhbmd1YWdlc1swXXx8XCJDXCIpLnJlcGxhY2UoXCItXCIsXG5cIl9cIikrXCIuVVRGLThcIixfOm18fFwiLi90aGlzLnByb2dyYW1cIn0sYjtmb3IoYiBpbiBXKXZvaWQgMD09PVdbYl0/ZGVsZXRlIGFbYl06YVtiXT1XW2JdO3ZhciBjPVtdO2ZvcihiIGluIGEpYy5wdXNoKGAke2J9PSR7YVtiXX1gKTtFYT1jfXJldHVybiBFYX0sRWEsR2E9W251bGwsW10sW11dLEhhPVszMSwyOSwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV0sSWE9WzMxLDI4LDMxLDMwLDMxLDMwLDMxLDMxLDMwLDMxLDMwLDMxXTtmdW5jdGlvbiBKYShhKXt2YXIgYj1BcnJheShUKGEpKzEpO1UoYSxiLDAsYi5sZW5ndGgpO3JldHVybiBifVxuZnVuY3Rpb24gS2EoYSxiLGMsZSl7ZnVuY3Rpb24gZyhmLG4scSl7Zm9yKGY9XCJudW1iZXJcIj09dHlwZW9mIGY/Zi50b1N0cmluZygpOmZ8fFwiXCI7Zi5sZW5ndGg8bjspZj1xWzBdK2Y7cmV0dXJuIGZ9ZnVuY3Rpb24gaChmLG4pe3JldHVybiBnKGYsbixcIjBcIil9ZnVuY3Rpb24gayhmLG4pe2Z1bmN0aW9uIHEoQWEpe3JldHVybiAwPkFhPy0xOjA8QWE/MTowfXZhciBBOzA9PT0oQT1xKGYuZ2V0RnVsbFllYXIoKS1uLmdldEZ1bGxZZWFyKCkpKSYmMD09PShBPXEoZi5nZXRNb250aCgpLW4uZ2V0TW9udGgoKSkpJiYoQT1xKGYuZ2V0RGF0ZSgpLW4uZ2V0RGF0ZSgpKSk7cmV0dXJuIEF9ZnVuY3Rpb24gcChmKXtzd2l0Y2goZi5nZXREYXkoKSl7Y2FzZSAwOnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCktMSwxMSwyOSk7Y2FzZSAxOnJldHVybiBmO2Nhc2UgMjpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLDAsMyk7Y2FzZSAzOnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksXG4wLDIpO2Nhc2UgNDpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLDAsMSk7Y2FzZSA1OnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCktMSwxMSwzMSk7Y2FzZSA2OnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCktMSwxMSwzMCl9fWZ1bmN0aW9uIHQoZil7dmFyIG49Zi5HYTtmb3IoZj1uZXcgRGF0ZSgobmV3IERhdGUoZi5IYSsxOTAwLDAsMSkpLmdldFRpbWUoKSk7MDxuOyl7dmFyIHE9Zi5nZXRNb250aCgpLEE9KFYoZi5nZXRGdWxsWWVhcigpKT9IYTpJYSlbcV07aWYobj5BLWYuZ2V0RGF0ZSgpKW4tPUEtZi5nZXREYXRlKCkrMSxmLnNldERhdGUoMSksMTE+cT9mLnNldE1vbnRoKHErMSk6KGYuc2V0TW9udGgoMCksZi5zZXRGdWxsWWVhcihmLmdldEZ1bGxZZWFyKCkrMSkpO2Vsc2V7Zi5zZXREYXRlKGYuZ2V0RGF0ZSgpK24pO2JyZWFrfX1xPW5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSsxLDAsNCk7bj1wKG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSxcbjAsNCkpO3E9cChxKTtyZXR1cm4gMD49ayhuLGYpPzA+PWsocSxmKT9mLmdldEZ1bGxZZWFyKCkrMTpmLmdldEZ1bGxZZWFyKCk6Zi5nZXRGdWxsWWVhcigpLTF9YT4+Pj0wO2I+Pj49MDtjPj4+PTA7ZT4+Pj0wO3ZhciB1PUpbZSs0MD4+Mj4+PjBdO2U9e1NhOkpbZT4+Mj4+PjBdLFJhOkpbZSs0Pj4yPj4+MF0sSWE6SltlKzg+PjI+Pj4wXSxMYTpKW2UrMTI+PjI+Pj4wXSxKYTpKW2UrMTY+PjI+Pj4wXSxIYTpKW2UrMjA+PjI+Pj4wXSxGYTpKW2UrMjQ+PjI+Pj4wXSxHYTpKW2UrMjg+PjI+Pj4wXSxVYTpKW2UrMzI+PjI+Pj4wXSxRYTpKW2UrMzY+PjI+Pj4wXSxUYTp1P1ModSk6XCJcIn07Yz1TKGMpO3U9e1wiJWNcIjpcIiVhICViICVkICVIOiVNOiVTICVZXCIsXCIlRFwiOlwiJW0vJWQvJXlcIixcIiVGXCI6XCIlWS0lbS0lZFwiLFwiJWhcIjpcIiViXCIsXCIlclwiOlwiJUk6JU06JVMgJXBcIixcIiVSXCI6XCIlSDolTVwiLFwiJVRcIjpcIiVIOiVNOiVTXCIsXCIleFwiOlwiJW0vJWQvJXlcIixcIiVYXCI6XCIlSDolTTolU1wiLFwiJUVjXCI6XCIlY1wiLFxuXCIlRUNcIjpcIiVDXCIsXCIlRXhcIjpcIiVtLyVkLyV5XCIsXCIlRVhcIjpcIiVIOiVNOiVTXCIsXCIlRXlcIjpcIiV5XCIsXCIlRVlcIjpcIiVZXCIsXCIlT2RcIjpcIiVkXCIsXCIlT2VcIjpcIiVlXCIsXCIlT0hcIjpcIiVIXCIsXCIlT0lcIjpcIiVJXCIsXCIlT21cIjpcIiVtXCIsXCIlT01cIjpcIiVNXCIsXCIlT1NcIjpcIiVTXCIsXCIlT3VcIjpcIiV1XCIsXCIlT1VcIjpcIiVVXCIsXCIlT1ZcIjpcIiVWXCIsXCIlT3dcIjpcIiV3XCIsXCIlT1dcIjpcIiVXXCIsXCIlT3lcIjpcIiV5XCJ9O2Zvcih2YXIgdiBpbiB1KWM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAodixcImdcIiksdVt2XSk7dmFyIEJhPVwiU3VuZGF5IE1vbmRheSBUdWVzZGF5IFdlZG5lc2RheSBUaHVyc2RheSBGcmlkYXkgU2F0dXJkYXlcIi5zcGxpdChcIiBcIiksQ2E9XCJKYW51YXJ5IEZlYnJ1YXJ5IE1hcmNoIEFwcmlsIE1heSBKdW5lIEp1bHkgQXVndXN0IFNlcHRlbWJlciBPY3RvYmVyIE5vdmVtYmVyIERlY2VtYmVyXCIuc3BsaXQoXCIgXCIpO3U9e1wiJWFcIjpmPT5CYVtmLkZhXS5zdWJzdHJpbmcoMCwzKSxcIiVBXCI6Zj0+QmFbZi5GYV0sXCIlYlwiOmY9PlxuQ2FbZi5KYV0uc3Vic3RyaW5nKDAsMyksXCIlQlwiOmY9PkNhW2YuSmFdLFwiJUNcIjpmPT5oKChmLkhhKzE5MDApLzEwMHwwLDIpLFwiJWRcIjpmPT5oKGYuTGEsMiksXCIlZVwiOmY9PmcoZi5MYSwyLFwiIFwiKSxcIiVnXCI6Zj0+dChmKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcIiVHXCI6Zj0+dChmKSxcIiVIXCI6Zj0+aChmLklhLDIpLFwiJUlcIjpmPT57Zj1mLklhOzA9PWY/Zj0xMjoxMjxmJiYoZi09MTIpO3JldHVybiBoKGYsMil9LFwiJWpcIjpmPT57Zm9yKHZhciBuPTAscT0wO3E8PWYuSmEtMTtuKz0oVihmLkhhKzE5MDApP0hhOklhKVtxKytdKTtyZXR1cm4gaChmLkxhK24sMyl9LFwiJW1cIjpmPT5oKGYuSmErMSwyKSxcIiVNXCI6Zj0+aChmLlJhLDIpLFwiJW5cIjooKT0+XCJcXG5cIixcIiVwXCI6Zj0+MDw9Zi5JYSYmMTI+Zi5JYT9cIkFNXCI6XCJQTVwiLFwiJVNcIjpmPT5oKGYuU2EsMiksXCIldFwiOigpPT5cIlxcdFwiLFwiJXVcIjpmPT5mLkZhfHw3LFwiJVVcIjpmPT5oKE1hdGguZmxvb3IoKGYuR2ErNy1mLkZhKS83KSwyKSxcIiVWXCI6Zj0+XG57dmFyIG49TWF0aC5mbG9vcigoZi5HYSs3LShmLkZhKzYpJTcpLzcpOzI+PShmLkZhKzM3MS1mLkdhLTIpJTcmJm4rKztpZihuKTUzPT1uJiYocT0oZi5GYSszNzEtZi5HYSklNyw0PT1xfHwzPT1xJiZWKGYuSGEpfHwobj0xKSk7ZWxzZXtuPTUyO3ZhciBxPShmLkZhKzctZi5HYS0xKSU3Oyg0PT1xfHw1PT1xJiZWKGYuSGElNDAwLTEpKSYmbisrfXJldHVybiBoKG4sMil9LFwiJXdcIjpmPT5mLkZhLFwiJVdcIjpmPT5oKE1hdGguZmxvb3IoKGYuR2ErNy0oZi5GYSs2KSU3KS83KSwyKSxcIiV5XCI6Zj0+KGYuSGErMTkwMCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlWVwiOmY9PmYuSGErMTkwMCxcIiV6XCI6Zj0+e2Y9Zi5RYTt2YXIgbj0wPD1mO2Y9TWF0aC5hYnMoZikvNjA7cmV0dXJuKG4/XCIrXCI6XCItXCIpK1N0cmluZyhcIjAwMDBcIisoZi82MCoxMDArZiU2MCkpLnNsaWNlKC00KX0sXCIlWlwiOmY9PmYuVGEsXCIlJVwiOigpPT5cIiVcIn07Yz1jLnJlcGxhY2UoLyUlL2csXCJcXHgwMFxceDAwXCIpO2Zvcih2IGluIHUpYy5pbmNsdWRlcyh2KSYmXG4oYz1jLnJlcGxhY2UobmV3IFJlZ0V4cCh2LFwiZ1wiKSx1W3ZdKGUpKSk7Yz1jLnJlcGxhY2UoL1xcMFxcMC9nLFwiJVwiKTt2PUphKGMpO2lmKHYubGVuZ3RoPmIpcmV0dXJuIDA7SC5zZXQodixhPj4+MCk7cmV0dXJuIHYubGVuZ3RoLTF9dmFyIFg9W10sWT12b2lkIDAsTGE9W107XG5mdW5jdGlvbiBNYShhLGIpe2lmKCFZKXtZPW5ldyBXZWFrTWFwO3ZhciBjPUwubGVuZ3RoO2lmKFkpZm9yKHZhciBlPTA7ZTwwK2M7ZSsrKXt2YXIgZz1lO3ZhciBoPVhbZ107aHx8KGc+PVgubGVuZ3RoJiYoWC5sZW5ndGg9ZysxKSxYW2ddPWg9TC5nZXQoZykpOyhnPWgpJiZZLnNldChnLGUpfX1pZihjPVkuZ2V0KGEpfHwwKXJldHVybiBjO2lmKExhLmxlbmd0aCljPUxhLnBvcCgpO2Vsc2V7dHJ5e0wuZ3JvdygxKX1jYXRjaChwKXtpZighKHAgaW5zdGFuY2VvZiBSYW5nZUVycm9yKSl0aHJvdyBwO3Rocm93XCJVbmFibGUgdG8gZ3JvdyB3YXNtIHRhYmxlLiBTZXQgQUxMT1dfVEFCTEVfR1JPV1RILlwiO31jPUwubGVuZ3RoLTF9dHJ5e2U9YyxMLnNldChlLGEpLFhbZV09TC5nZXQoZSl9Y2F0Y2gocCl7aWYoIShwIGluc3RhbmNlb2YgVHlwZUVycm9yKSl0aHJvdyBwO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIFdlYkFzc2VtYmx5LkZ1bmN0aW9uKXtlPVdlYkFzc2VtYmx5LkZ1bmN0aW9uO1xuZz17aTpcImkzMlwiLGo6XCJpNjRcIixmOlwiZjMyXCIsZDpcImY2NFwiLHA6XCJpMzJcIn07aD17cGFyYW1ldGVyczpbXSxyZXN1bHRzOlwidlwiPT1iWzBdP1tdOltnW2JbMF1dXX07Zm9yKHZhciBrPTE7azxiLmxlbmd0aDsrK2spaC5wYXJhbWV0ZXJzLnB1c2goZ1tiW2tdXSk7Yj1uZXcgZShoLGEpfWVsc2V7ZT1bMV07Zz1iLnNsaWNlKDAsMSk7Yj1iLnNsaWNlKDEpO2g9e2k6MTI3LHA6MTI3LGo6MTI2LGY6MTI1LGQ6MTI0fTtlLnB1c2goOTYpO2s9Yi5sZW5ndGg7MTI4Pms/ZS5wdXNoKGspOmUucHVzaChrJTEyOHwxMjgsaz4+Nyk7Zm9yKGs9MDtrPGIubGVuZ3RoOysrayllLnB1c2goaFtiW2tdXSk7XCJ2XCI9PWc/ZS5wdXNoKDApOmUucHVzaCgxLGhbZ10pO2I9WzAsOTcsMTE1LDEwOSwxLDAsMCwwLDFdO2c9ZS5sZW5ndGg7MTI4Pmc/Yi5wdXNoKGcpOmIucHVzaChnJTEyOHwxMjgsZz4+Nyk7Yi5wdXNoLmFwcGx5KGIsZSk7Yi5wdXNoKDIsNywxLDEsMTAxLDEsMTAyLDAsMCw3LDUsMSwxLDEwMixcbjAsMCk7Yj1uZXcgV2ViQXNzZW1ibHkuTW9kdWxlKG5ldyBVaW50OEFycmF5KGIpKTtiPShuZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UoYix7ZTp7ZjphfX0pKS5leHBvcnRzLmZ9ZT1jO0wuc2V0KGUsYik7WFtlXT1MLmdldChlKX1ZLnNldChhLGMpO3JldHVybiBjfVxudmFyIE9hPXthOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7KG5ldyBzYShhKSkuTWEoYj4+PjAsYz4+PjApO3RhPWE7dWErKzt0aHJvdyB0YTt9LGU6ZnVuY3Rpb24oKXtyZXR1cm4gMH0sSDpmdW5jdGlvbigpe30seDpmdW5jdGlvbigpe30sejpmdW5jdGlvbigpe30sSjpmdW5jdGlvbigpe3JldHVybiAwfSxGOmZ1bmN0aW9uKCl7fSxBOmZ1bmN0aW9uKCl7fSxFOmZ1bmN0aW9uKCl7fSxnOmZ1bmN0aW9uKCl7fSx5OmZ1bmN0aW9uKCl7fSx2OmZ1bmN0aW9uKCl7fSxHOmZ1bmN0aW9uKCl7fSx3OmZ1bmN0aW9uKCl7fSxsOigpPT4hMCxvOmZ1bmN0aW9uKGEsYixjKXthPWIrMjA5NzE1Mj4+PjA8NDE5NDMwNS0hIWE/KGE+Pj4wKSs0Mjk0OTY3Mjk2KmI6TmFOO2M+Pj49MDthPW5ldyBEYXRlKDFFMyphKTtKW2M+PjI+Pj4wXT1hLmdldFVUQ1NlY29uZHMoKTtKW2MrND4+Mj4+PjBdPWEuZ2V0VVRDTWludXRlcygpO0pbYys4Pj4yPj4+MF09YS5nZXRVVENIb3VycygpO0pbYysxMj4+Mj4+PlxuMF09YS5nZXRVVENEYXRlKCk7SltjKzE2Pj4yPj4+MF09YS5nZXRVVENNb250aCgpO0pbYysyMD4+Mj4+PjBdPWEuZ2V0VVRDRnVsbFllYXIoKS0xOTAwO0pbYysyND4+Mj4+PjBdPWEuZ2V0VVRDRGF5KCk7SltjKzI4Pj4yPj4+MF09KGEuZ2V0VGltZSgpLURhdGUuVVRDKGEuZ2V0VVRDRnVsbFllYXIoKSwwLDEsMCwwLDAsMCkpLzg2NEU1fDB9LHA6ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO0pbYz4+Mj4+PjBdPWEuZ2V0U2Vjb25kcygpO0pbYys0Pj4yPj4+MF09YS5nZXRNaW51dGVzKCk7SltjKzg+PjI+Pj4wXT1hLmdldEhvdXJzKCk7SltjKzEyPj4yPj4+MF09YS5nZXREYXRlKCk7SltjKzE2Pj4yPj4+MF09YS5nZXRNb250aCgpO0pbYysyMD4+Mj4+PjBdPWEuZ2V0RnVsbFllYXIoKS0xOTAwO0pbYysyND4+Mj4+PjBdPWEuZ2V0RGF5KCk7SltjKzI4Pj4yPj4+XG4wXT0oVihhLmdldEZ1bGxZZWFyKCkpP3hhOnlhKVthLmdldE1vbnRoKCldK2EuZ2V0RGF0ZSgpLTF8MDtKW2MrMzY+PjI+Pj4wXT0tKDYwKmEuZ2V0VGltZXpvbmVPZmZzZXQoKSk7Yj0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGU9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO0pbYyszMj4+Mj4+PjBdPShiIT1lJiZhLmdldFRpbWV6b25lT2Zmc2V0KCk9PU1hdGgubWluKGUsYikpfDB9LHE6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW5ldyBEYXRlKEpbYSsyMD4+Mj4+PjBdKzE5MDAsSlthKzE2Pj4yPj4+MF0sSlthKzEyPj4yPj4+MF0sSlthKzg+PjI+Pj4wXSxKW2ErND4+Mj4+PjBdLEpbYT4+Mj4+PjBdLDApLGM9SlthKzMyPj4yPj4+MF0sZT1iLmdldFRpbWV6b25lT2Zmc2V0KCksZz0obmV3IERhdGUoYi5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCksXG5oPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksMCwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxrPU1hdGgubWluKGgsZyk7MD5jP0pbYSszMj4+Mj4+PjBdPU51bWJlcihnIT1oJiZrPT1lKTowPGMhPShrPT1lKSYmKGc9TWF0aC5tYXgoaCxnKSxiLnNldFRpbWUoYi5nZXRUaW1lKCkrNkU0KigoMDxjP2s6ZyktZSkpKTtKW2ErMjQ+PjI+Pj4wXT1iLmdldERheSgpO0pbYSsyOD4+Mj4+PjBdPShWKGIuZ2V0RnVsbFllYXIoKSk/eGE6eWEpW2IuZ2V0TW9udGgoKV0rYi5nZXREYXRlKCktMXwwO0pbYT4+Mj4+PjBdPWIuZ2V0U2Vjb25kcygpO0pbYSs0Pj4yPj4+MF09Yi5nZXRNaW51dGVzKCk7SlthKzg+PjI+Pj4wXT1iLmdldEhvdXJzKCk7SlthKzEyPj4yPj4+MF09Yi5nZXREYXRlKCk7SlthKzE2Pj4yPj4+MF09Yi5nZXRNb250aCgpO0pbYSsyMD4+Mj4+PjBdPWIuZ2V0WWVhcigpO2E9Yi5nZXRUaW1lKCkvMUUzO3JldHVybiBOYSgoUT1hLDE8PStNYXRoLmFicyhRKT8wPFE/K01hdGguZmxvb3IoUS9cbjQyOTQ5NjcyOTYpPj4+MDp+fitNYXRoLmNlaWwoKFEtKyh+flE+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApKSxhPj4+MH0sbTpmdW5jdGlvbigpe3JldHVybi01Mn0sbjpmdW5jdGlvbigpe30sdDpmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZSh0KXtyZXR1cm4odD10LnRvVGltZVN0cmluZygpLm1hdGNoKC9cXCgoW0EtWmEteiBdKylcXCkkLykpP3RbMV06XCJHTVRcIn1jPj4+PTA7dmFyIGc9KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpLGg9bmV3IERhdGUoZywwLDEpLGs9bmV3IERhdGUoZyw2LDEpO2c9aC5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBwPWsuZ2V0VGltZXpvbmVPZmZzZXQoKTtLW2E+Pj4wPj4yPj4+MF09NjAqTWF0aC5tYXgoZyxwKTtKW2I+Pj4wPj4yPj4+MF09TnVtYmVyKGchPXApO2E9ZShoKTtiPWUoayk7YT1EYShhKTtiPURhKGIpO3A8Zz8oS1tjPj4yPj4+MF09YSxLW2MrND4+Mj4+PjBdPWIpOihLW2M+PjI+Pj4wXT1iLEtbYys0Pj4yPj4+MF09YSl9LGQ6KCk9PntFKFwiXCIpfSxcbmg6ZnVuY3Rpb24oKXtyZXR1cm4gRGF0ZS5ub3coKX0sdTpmdW5jdGlvbigpe3JldHVybiA0Mjk0OTAxNzYwfSxiOigpPT5wZXJmb3JtYW5jZS5ub3coKSxJOmZ1bmN0aW9uKGEsYixjKXtiPj4+PTA7cmV0dXJuIEkuY29weVdpdGhpbihhPj4+MD4+PjAsYj4+PjAsYisoYz4+PjApPj4+MCl9LHM6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPUkubGVuZ3RoO2lmKDQyOTQ5MDE3NjA8YSlyZXR1cm4hMTtmb3IodmFyIGM9MTs0Pj1jO2MqPTIpe3ZhciBlPWIqKDErLjIvYyk7ZT1NYXRoLm1pbihlLGErMTAwNjYzMjk2KTt2YXIgZz1NYXRoO2U9TWF0aC5tYXgoYSxlKTthOntnPWcubWluLmNhbGwoZyw0Mjk0OTAxNzYwLGUrKDY1NTM2LWUlNjU1MzYpJTY1NTM2KS1GLmJ1ZmZlci5ieXRlTGVuZ3RoKzY1NTM1Pj4+MTY7dHJ5e0YuZ3JvdyhnKTtoYSgpO3ZhciBoPTE7YnJlYWsgYX1jYXRjaChrKXt9aD12b2lkIDB9aWYoaClyZXR1cm4hMH1yZXR1cm4hMX0sQzpmdW5jdGlvbihhLGIpe2E+Pj49XG4wO2I+Pj49MDt2YXIgYz0wO0ZhKCkuZm9yRWFjaChmdW5jdGlvbihlLGcpe3ZhciBoPWIrYztnPUtbYSs0Kmc+PjI+Pj4wXT1oO2ZvcihoPTA7aDxlLmxlbmd0aDsrK2gpSFtnKys+PjA+Pj4wXT1lLmNoYXJDb2RlQXQoaCk7SFtnPj4wPj4+MF09MDtjKz1lLmxlbmd0aCsxfSk7cmV0dXJuIDB9LEQ6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj4+Pj0wO3ZhciBjPUZhKCk7S1thPj4yPj4+MF09Yy5sZW5ndGg7dmFyIGU9MDtjLmZvckVhY2goZnVuY3Rpb24oZyl7ZSs9Zy5sZW5ndGgrMX0pO0tbYj4+Mj4+PjBdPWU7cmV0dXJuIDB9LGY6KCk9PjUyLGs6ZnVuY3Rpb24oKXtyZXR1cm4gNTJ9LHI6ZnVuY3Rpb24oKXtyZXR1cm4gNzB9LGo6ZnVuY3Rpb24oYSxiLGMsZSl7Yj4+Pj0wO2M+Pj49MDtlPj4+PTA7Zm9yKHZhciBnPTAsaD0wO2g8YztoKyspe3ZhciBrPUtbYj4+Mj4+PjBdLHA9S1tiKzQ+PjI+Pj4wXTtiKz04O2Zvcih2YXIgdD0wO3Q8cDt0Kyspe3ZhciB1PUlbayt0Pj4+MF0sdj1cbkdhW2FdOzA9PT11fHwxMD09PXU/KCgxPT09YT9lYTpDKSh3YSh2LDApKSx2Lmxlbmd0aD0wKTp2LnB1c2godSl9Zys9cH1LW2U+PjI+Pj4wXT1nO3JldHVybiAwfSxCOkthLGM6ZnVuY3Rpb24oYSxiLGMsZSl7cmV0dXJuIEthKGE+Pj4wLGI+Pj4wLGM+Pj4wLGU+Pj4wKX0saTpmdW5jdGlvbihhLGIsYyxlKXtjb25zdCBnPUwubGVuZ3RoO2E9bmV3IFVpbnQ4QXJyYXkoSS5zbGljZShhK2IsYStjKSk7dHJ5e3ZhciBoPW5ldyBXZWJBc3NlbWJseS5Nb2R1bGUoYSksaz1uZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UoaCx7ZW52OnttZW1vcnk6Rn19KSxwO2ZvcihwIGluIGsuZXhwb3J0cylNYShrLmV4cG9ydHNbcF0pO3JldHVybiBnPEwubGVuZ3RoP2c6ZX1jYXRjaCh0KXtyZXR1cm4gY29uc29sZS5sb2codCksZX19fTtcbihmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYyl7Yz1jLmV4cG9ydHM7Rz1jPVBhKGMpO0Y9Ry5LO2hhKCk7TD1HLkFhO2phLnVuc2hpZnQoRy5MKTtNLS07ZC5tb25pdG9yUnVuRGVwZW5kZW5jaWVzJiZkLm1vbml0b3JSdW5EZXBlbmRlbmNpZXMoTSk7aWYoMD09TSYmKG51bGwhPT1OJiYoY2xlYXJJbnRlcnZhbChOKSxOPW51bGwpLE8pKXt2YXIgZT1PO089bnVsbDtlKCl9cmV0dXJuIGN9dmFyIGI9e2E6T2F9O00rKztkLm1vbml0b3JSdW5EZXBlbmRlbmNpZXMmJmQubW9uaXRvclJ1bkRlcGVuZGVuY2llcyhNKTtpZihkLmluc3RhbnRpYXRlV2FzbSl0cnl7cmV0dXJuIGQuaW5zdGFudGlhdGVXYXNtKGIsYSl9Y2F0Y2goYyl7QyhcIk1vZHVsZS5pbnN0YW50aWF0ZVdhc20gY2FsbGJhY2sgZmFpbGVkIHdpdGggZXJyb3I6IFwiK2MpLGwoYyl9cmEoYixmdW5jdGlvbihjKXthKGMuaW5zdGFuY2UpfSkuY2F0Y2gobCk7cmV0dXJue319KSgpO1xuZC5fT3J0SW5pdD0oYSxiKT0+KGQuX09ydEluaXQ9Ry5NKShhLGIpO2QuX09ydEdldExhc3RFcnJvcj0oYSxiKT0+KGQuX09ydEdldExhc3RFcnJvcj1HLk4pKGEsYik7ZC5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9KGEsYixjLGUsZyxoLGsscCx0LHUpPT4oZC5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9Ry5PKShhLGIsYyxlLGcsaCxrLHAsdCx1KTtkLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj0oYSxiKT0+KGQuX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyPUcuUCkoYSxiKTtkLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9KGEsYixjKT0+KGQuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT1HLlEpKGEsYixjKTtkLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9KGEsYixjKT0+KGQuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT1HLlIpKGEsYixjKTtkLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9YT0+KGQuX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucz1HLlMpKGEpO1xuZC5fT3J0Q3JlYXRlU2Vzc2lvbj0oYSxiLGMpPT4oZC5fT3J0Q3JlYXRlU2Vzc2lvbj1HLlQpKGEsYixjKTtkLl9PcnRSZWxlYXNlU2Vzc2lvbj1hPT4oZC5fT3J0UmVsZWFzZVNlc3Npb249Ry5VKShhKTtkLl9PcnRHZXRJbnB1dE91dHB1dENvdW50PShhLGIsYyk9PihkLl9PcnRHZXRJbnB1dE91dHB1dENvdW50PUcuVikoYSxiLGMpO2QuX09ydEdldElucHV0TmFtZT0oYSxiKT0+KGQuX09ydEdldElucHV0TmFtZT1HLlcpKGEsYik7ZC5fT3J0R2V0T3V0cHV0TmFtZT0oYSxiKT0+KGQuX09ydEdldE91dHB1dE5hbWU9Ry5YKShhLGIpO2QuX09ydEZyZWU9YT0+KGQuX09ydEZyZWU9Ry5ZKShhKTtkLl9PcnRDcmVhdGVUZW5zb3I9KGEsYixjLGUsZyxoKT0+KGQuX09ydENyZWF0ZVRlbnNvcj1HLlopKGEsYixjLGUsZyxoKTtkLl9PcnRHZXRUZW5zb3JEYXRhPShhLGIsYyxlLGcpPT4oZC5fT3J0R2V0VGVuc29yRGF0YT1HLl8pKGEsYixjLGUsZyk7XG5kLl9PcnRSZWxlYXNlVGVuc29yPWE9PihkLl9PcnRSZWxlYXNlVGVuc29yPUcuJCkoYSk7ZC5fT3J0Q3JlYXRlUnVuT3B0aW9ucz0oYSxiLGMsZSk9PihkLl9PcnRDcmVhdGVSdW5PcHRpb25zPUcuYWEpKGEsYixjLGUpO2QuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PShhLGIsYyk9PihkLl9PcnRBZGRSdW5Db25maWdFbnRyeT1HLmJhKShhLGIsYyk7ZC5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9YT0+KGQuX09ydFJlbGVhc2VSdW5PcHRpb25zPUcuY2EpKGEpO2QuX09ydENyZWF0ZUJpbmRpbmc9YT0+KGQuX09ydENyZWF0ZUJpbmRpbmc9Ry5kYSkoYSk7ZC5fT3J0QmluZElucHV0PShhLGIsYyk9PihkLl9PcnRCaW5kSW5wdXQ9Ry5lYSkoYSxiLGMpO2QuX09ydEJpbmRPdXRwdXQ9KGEsYixjLGUpPT4oZC5fT3J0QmluZE91dHB1dD1HLmZhKShhLGIsYyxlKTtkLl9PcnRDbGVhckJvdW5kT3V0cHV0cz1hPT4oZC5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9Ry5nYSkoYSk7XG5kLl9PcnRSZWxlYXNlQmluZGluZz1hPT4oZC5fT3J0UmVsZWFzZUJpbmRpbmc9Ry5oYSkoYSk7ZC5fT3J0UnVuV2l0aEJpbmRpbmc9KGEsYixjLGUsZyk9PihkLl9PcnRSdW5XaXRoQmluZGluZz1HLmlhKShhLGIsYyxlLGcpO2QuX09ydFJ1bj0oYSxiLGMsZSxnLGgsayxwKT0+KGQuX09ydFJ1bj1HLmphKShhLGIsYyxlLGcsaCxrLHApO2QuX09ydEVuZFByb2ZpbGluZz1hPT4oZC5fT3J0RW5kUHJvZmlsaW5nPUcua2EpKGEpO2QuX09ydFRyYWluaW5nTG9hZENoZWNrcG9pbnQ9KGEsYik9PihkLl9PcnRUcmFpbmluZ0xvYWRDaGVja3BvaW50PUcubGEpKGEsYik7ZC5fT3J0VHJhaW5pbmdSZWxlYXNlQ2hlY2twb2ludD1hPT4oZC5fT3J0VHJhaW5pbmdSZWxlYXNlQ2hlY2twb2ludD1HLm1hKShhKTtkLl9PcnRUcmFpbmluZ0NyZWF0ZVNlc3Npb249KGEsYixjLGUsZyxoLGsscCk9PihkLl9PcnRUcmFpbmluZ0NyZWF0ZVNlc3Npb249Ry5uYSkoYSxiLGMsZSxnLGgsayxwKTtcbmQuX09ydFRyYWluaW5nTGF6eVJlc2V0R3JhZD1hPT4oZC5fT3J0VHJhaW5pbmdMYXp5UmVzZXRHcmFkPUcub2EpKGEpO2QuX09ydFRyYWluaW5nUnVuVHJhaW5TdGVwPShhLGIsYyxlLGcsaCk9PihkLl9PcnRUcmFpbmluZ1J1blRyYWluU3RlcD1HLnBhKShhLGIsYyxlLGcsaCk7ZC5fT3J0VHJhaW5pbmdPcHRpbWl6ZXJTdGVwPShhLGIpPT4oZC5fT3J0VHJhaW5pbmdPcHRpbWl6ZXJTdGVwPUcucWEpKGEsYik7ZC5fT3J0VHJhaW5pbmdFdmFsU3RlcD0oYSxiLGMsZSxnLGgpPT4oZC5fT3J0VHJhaW5pbmdFdmFsU3RlcD1HLnJhKShhLGIsYyxlLGcsaCk7ZC5fT3J0VHJhaW5pbmdHZXRQYXJhbWV0ZXJzU2l6ZT0oYSxiLGMpPT4oZC5fT3J0VHJhaW5pbmdHZXRQYXJhbWV0ZXJzU2l6ZT1HLnNhKShhLGIsYyk7ZC5fT3J0VHJhaW5pbmdDb3B5UGFyYW1ldGVyc1RvQnVmZmVyPShhLGIsYyxlKT0+KGQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNUb0J1ZmZlcj1HLnRhKShhLGIsYyxlKTtcbmQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNGcm9tQnVmZmVyPShhLGIsYyxlKT0+KGQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNGcm9tQnVmZmVyPUcudWEpKGEsYixjLGUpO2QuX09ydFRyYWluaW5nR2V0TW9kZWxJbnB1dE91dHB1dENvdW50PShhLGIsYyxlKT0+KGQuX09ydFRyYWluaW5nR2V0TW9kZWxJbnB1dE91dHB1dENvdW50PUcudmEpKGEsYixjLGUpO2QuX09ydFRyYWluaW5nR2V0TW9kZWxJbnB1dE91dHB1dE5hbWU9KGEsYixjLGUpPT4oZC5fT3J0VHJhaW5pbmdHZXRNb2RlbElucHV0T3V0cHV0TmFtZT1HLndhKShhLGIsYyxlKTtkLl9PcnRUcmFpbmluZ1JlbGVhc2VTZXNzaW9uPWE9PihkLl9PcnRUcmFpbmluZ1JlbGVhc2VTZXNzaW9uPUcueGEpKGEpO3ZhciB6YT1kLl9tYWxsb2M9YT0+KHphPWQuX21hbGxvYz1HLnlhKShhKTtkLl9mcmVlPWE9PihkLl9mcmVlPUcuemEpKGEpO1xudmFyIE5hPWE9PihOYT1HLkJhKShhKSxRYT0oKT0+KFFhPUcuQ2EpKCksUmE9YT0+KFJhPUcuRGEpKGEpLFNhPWE9PihTYT1HLkVhKShhKTtkLl9fX3N0YXJ0X2VtX2pzPTk3NTkwNDtkLl9fX3N0b3BfZW1fanM9OTc2NTE2O2Z1bmN0aW9uIFBhKGEpe2E9T2JqZWN0LmFzc2lnbih7fSxhKTt2YXIgYj1lPT4oKT0+ZSgpPj4+MCxjPWU9Pmc9PmUoZyk+Pj4wO2EuX19lcnJub19sb2NhdGlvbj1iKGEuX19lcnJub19sb2NhdGlvbik7YS5tYWxsb2M9YyhhLm1hbGxvYyk7YS5zdGFja1NhdmU9YihhLnN0YWNrU2F2ZSk7YS5zdGFja0FsbG9jPWMoYS5zdGFja0FsbG9jKTtyZXR1cm4gYX1kLnN0YWNrQWxsb2M9U2E7ZC5zdGFja1NhdmU9UWE7ZC5zdGFja1Jlc3RvcmU9UmE7ZC5hZGRGdW5jdGlvbj1NYTtkLlVURjhUb1N0cmluZz1TO2Quc3RyaW5nVG9VVEY4PShhLGIsYyk9PlUoYSxJLGIsYyk7ZC5sZW5ndGhCeXRlc1VURjg9VDt2YXIgWjtcbk89ZnVuY3Rpb24gVGEoKXtafHxVYSgpO1p8fChPPVRhKX07XG5mdW5jdGlvbiBVYSgpe2Z1bmN0aW9uIGEoKXtpZighWiYmKFo9ITAsZC5jYWxsZWRSdW49ITAsIWZhKSl7UihqYSk7YWEoZCk7aWYoZC5vblJ1bnRpbWVJbml0aWFsaXplZClkLm9uUnVudGltZUluaXRpYWxpemVkKCk7aWYoZC5wb3N0UnVuKWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiBkLnBvc3RSdW4mJihkLnBvc3RSdW49W2QucG9zdFJ1bl0pO2QucG9zdFJ1bi5sZW5ndGg7KXt2YXIgYj1kLnBvc3RSdW4uc2hpZnQoKTtrYS51bnNoaWZ0KGIpfVIoa2EpfX1pZighKDA8TSkpe2lmKGQucHJlUnVuKWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiBkLnByZVJ1biYmKGQucHJlUnVuPVtkLnByZVJ1bl0pO2QucHJlUnVuLmxlbmd0aDspbGEoKTtSKGlhKTswPE18fChkLnNldFN0YXR1cz8oZC5zZXRTdGF0dXMoXCJSdW5uaW5nLi4uXCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZC5zZXRTdGF0dXMoXCJcIil9LDEpO2EoKX0sMSkpOmEoKSl9fVxuaWYoZC5wcmVJbml0KWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiBkLnByZUluaXQmJihkLnByZUluaXQ9W2QucHJlSW5pdF0pOzA8ZC5wcmVJbml0Lmxlbmd0aDspZC5wcmVJbml0LnBvcCgpKCk7VWEoKTtcblxuXG4gIHJldHVybiBtb2R1bGVBcmcucmVhZHlcbn1cblxuKTtcbn0pKCk7XG5pZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuICBtb2R1bGUuZXhwb3J0cyA9IG9ydFdhc207XG5lbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZVsnYW1kJ10pXG4gIGRlZmluZShbXSwgKCkgPT4gb3J0V2FzbSk7XG4iLCAiIiwgIiIsICJleHBvcnQgY29uc3QgY3B1cyA9IHVuZGVmaW5lZDsiLCAiXG52YXIgb3J0V2FzbVRocmVhZGVkID0gKCgpID0+IHtcbiAgdmFyIF9zY3JpcHREaXIgPSB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LmN1cnJlbnRTY3JpcHQgPyBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyA6IHVuZGVmaW5lZDtcbiAgaWYgKHR5cGVvZiBfX2ZpbGVuYW1lICE9PSAndW5kZWZpbmVkJykgX3NjcmlwdERpciA9IF9zY3JpcHREaXIgfHwgX19maWxlbmFtZTtcbiAgcmV0dXJuIChcbmZ1bmN0aW9uKG1vZHVsZUFyZyA9IHt9KSB7XG5cbmZ1bmN0aW9uIHAoKXtxLmJ1ZmZlciE9ci5idWZmZXImJnQoKTtyZXR1cm4gcn1mdW5jdGlvbiB4KCl7cS5idWZmZXIhPXIuYnVmZmVyJiZ0KCk7cmV0dXJuIGJhfWZ1bmN0aW9uIGNhKCl7cS5idWZmZXIhPXIuYnVmZmVyJiZ0KCk7cmV0dXJuIGRhfWZ1bmN0aW9uIGVhKCl7cS5idWZmZXIhPXIuYnVmZmVyJiZ0KCk7cmV0dXJuIGZhfWZ1bmN0aW9uIEEoKXtxLmJ1ZmZlciE9ci5idWZmZXImJnQoKTtyZXR1cm4gaGF9ZnVuY3Rpb24gQigpe3EuYnVmZmVyIT1yLmJ1ZmZlciYmdCgpO3JldHVybiBpYX1mdW5jdGlvbiBqYSgpe3EuYnVmZmVyIT1yLmJ1ZmZlciYmdCgpO3JldHVybiBrYX12YXIgQz1tb2R1bGVBcmcsbGEsbWE7Qy5yZWFkeT1uZXcgUHJvbWlzZSgoYSxiKT0+e2xhPWE7bWE9Yn0pO1xudmFyIG5hPU9iamVjdC5hc3NpZ24oe30sQyksb2E9XCIuL3RoaXMucHJvZ3JhbVwiLHBhPShhLGIpPT57dGhyb3cgYjt9LHFhPVwib2JqZWN0XCI9PXR5cGVvZiB3aW5kb3cscmE9XCJmdW5jdGlvblwiPT10eXBlb2YgaW1wb3J0U2NyaXB0cyxGPVwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzJiZcIm9iamVjdFwiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucyYmXCJzdHJpbmdcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZSxHPUMuRU5WSVJPTk1FTlRfSVNfUFRIUkVBRHx8ITEsSD1cIlwiO2Z1bmN0aW9uIHNhKGEpe3JldHVybiBDLmxvY2F0ZUZpbGU/Qy5sb2NhdGVGaWxlKGEsSCk6SCthfXZhciB0YSx1YSx2YTtcbmlmKEYpe3ZhciBmcz1yZXF1aXJlKFwiZnNcIiksd2E9cmVxdWlyZShcInBhdGhcIik7SD1yYT93YS5kaXJuYW1lKEgpK1wiL1wiOl9fZGlybmFtZStcIi9cIjt0YT0oYixjKT0+e2I9Yi5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGIpOndhLm5vcm1hbGl6ZShiKTtyZXR1cm4gZnMucmVhZEZpbGVTeW5jKGIsYz92b2lkIDA6XCJ1dGY4XCIpfTt2YT1iPT57Yj10YShiLCEwKTtiLmJ1ZmZlcnx8KGI9bmV3IFVpbnQ4QXJyYXkoYikpO3JldHVybiBifTt1YT0oYixjLGQsZT0hMCk9PntiPWIuc3RhcnRzV2l0aChcImZpbGU6Ly9cIik/bmV3IFVSTChiKTp3YS5ub3JtYWxpemUoYik7ZnMucmVhZEZpbGUoYixlP3ZvaWQgMDpcInV0ZjhcIiwoZixnKT0+e2Y/ZChmKTpjKGU/Zy5idWZmZXI6Zyl9KX07IUMudGhpc1Byb2dyYW0mJjE8cHJvY2Vzcy5hcmd2Lmxlbmd0aCYmKG9hPXByb2Nlc3MuYXJndlsxXS5yZXBsYWNlKC9cXFxcL2csXCIvXCIpKTtwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7cGE9KGIsYyk9Pntwcm9jZXNzLmV4aXRDb2RlPVxuYjt0aHJvdyBjO307Qy5pbnNwZWN0PSgpPT5cIltFbXNjcmlwdGVuIE1vZHVsZSBvYmplY3RdXCI7bGV0IGE7dHJ5e2E9cmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpfWNhdGNoKGIpe3Rocm93IGNvbnNvbGUuZXJyb3IoJ1RoZSBcIndvcmtlcl90aHJlYWRzXCIgbW9kdWxlIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBub2RlLmpzIGJ1aWxkIC0gcGVyaGFwcyBhIG5ld2VyIHZlcnNpb24gaXMgbmVlZGVkPycpLGI7fWdsb2JhbC5Xb3JrZXI9YS5Xb3JrZXJ9ZWxzZSBpZihxYXx8cmEpcmE/SD1zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYoSD1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksKHR5cGVvZiBfc2NyaXB0RGlyICE9PSBcInVuZGVmaW5lZFwiICYmIF9zY3JpcHREaXIpJiYoSD1fc2NyaXB0RGlyKSwwIT09SC5pbmRleE9mKFwiYmxvYjpcIik/SD1ILnN1YnN0cigwLEgucmVwbGFjZSgvWz8jXS4qLyxcIlwiKS5sYXN0SW5kZXhPZihcIi9cIikrMSk6SD1cIlwiLEZ8fCh0YT1hPT57dmFyIGI9XG5uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5zZW5kKG51bGwpO3JldHVybiBiLnJlc3BvbnNlVGV4dH0scmEmJih2YT1hPT57dmFyIGI9bmV3IFhNTEh0dHBSZXF1ZXN0O2Iub3BlbihcIkdFVFwiLGEsITEpO2IucmVzcG9uc2VUeXBlPVwiYXJyYXlidWZmZXJcIjtiLnNlbmQobnVsbCk7cmV0dXJuIG5ldyBVaW50OEFycmF5KGIucmVzcG9uc2UpfSksdWE9KGEsYixjKT0+e3ZhciBkPW5ldyBYTUxIdHRwUmVxdWVzdDtkLm9wZW4oXCJHRVRcIixhLCEwKTtkLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7ZC5vbmxvYWQ9KCk9PnsyMDA9PWQuc3RhdHVzfHwwPT1kLnN0YXR1cyYmZC5yZXNwb25zZT9iKGQucmVzcG9uc2UpOmMoKX07ZC5vbmVycm9yPWM7ZC5zZW5kKG51bGwpfSk7RiYmXCJ1bmRlZmluZWRcIj09dHlwZW9mIHBlcmZvcm1hbmNlJiYoZ2xvYmFsLnBlcmZvcm1hbmNlPXJlcXVpcmUoXCJwZXJmX2hvb2tzXCIpLnBlcmZvcm1hbmNlKTtcbnZhciB4YT1jb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLHlhPWNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKTtGJiYoeGE9KC4uLmEpPT5mcy53cml0ZVN5bmMoMSxhLmpvaW4oXCIgXCIpK1wiXFxuXCIpLHlhPSguLi5hKT0+ZnMud3JpdGVTeW5jKDIsYS5qb2luKFwiIFwiKStcIlxcblwiKSk7dmFyIHphPXhhLEw9eWE7T2JqZWN0LmFzc2lnbihDLG5hKTtuYT1udWxsO3ZhciBub0V4aXRSdW50aW1lPSEwO1wib2JqZWN0XCIhPXR5cGVvZiBXZWJBc3NlbWJseSYmQWEoXCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkXCIpO3ZhciBxLEJhLENhPSExLERhLHIsYmEsZGEsZmEsaGEsaWEsRWEsRmEsR2Esa2E7XG5mdW5jdGlvbiB0KCl7dmFyIGE9cS5idWZmZXI7Qy5IRUFQOD1yPW5ldyBJbnQ4QXJyYXkoYSk7Qy5IRUFQMTY9ZGE9bmV3IEludDE2QXJyYXkoYSk7Qy5IRUFQVTg9YmE9bmV3IFVpbnQ4QXJyYXkoYSk7Qy5IRUFQVTE2PWZhPW5ldyBVaW50MTZBcnJheShhKTtDLkhFQVAzMj1oYT1uZXcgSW50MzJBcnJheShhKTtDLkhFQVBVMzI9aWE9bmV3IFVpbnQzMkFycmF5KGEpO0MuSEVBUEYzMj1FYT1uZXcgRmxvYXQzMkFycmF5KGEpO0MuSEVBUEY2ND1rYT1uZXcgRmxvYXQ2NEFycmF5KGEpO0MuSEVBUDY0PUZhPW5ldyBCaWdJbnQ2NEFycmF5KGEpO0MuSEVBUFU2ND1HYT1uZXcgQmlnVWludDY0QXJyYXkoYSl9dmFyIEhhPTE2Nzc3MjE2OzUyNDI4ODA8PUhhfHxBYShcIklOSVRJQUxfTUVNT1JZIHNob3VsZCBiZSBsYXJnZXIgdGhhbiBTVEFDS19TSVpFLCB3YXMgXCIrSGErXCIhIChTVEFDS19TSVpFPTUyNDI4ODApXCIpO1xuaWYoRylxPUMud2FzbU1lbW9yeTtlbHNlIGlmKHE9bmV3IFdlYkFzc2VtYmx5Lk1lbW9yeSh7aW5pdGlhbDpIYS82NTUzNixtYXhpbXVtOjY1NTM2LHNoYXJlZDohMH0pLCEocS5idWZmZXIgaW5zdGFuY2VvZiBTaGFyZWRBcnJheUJ1ZmZlcikpdGhyb3cgTChcInJlcXVlc3RlZCBhIHNoYXJlZCBXZWJBc3NlbWJseS5NZW1vcnkgYnV0IHRoZSByZXR1cm5lZCBidWZmZXIgaXMgbm90IGEgU2hhcmVkQXJyYXlCdWZmZXIsIGluZGljYXRpbmcgdGhhdCB3aGlsZSB0aGUgYnJvd3NlciBoYXMgU2hhcmVkQXJyYXlCdWZmZXIgaXQgZG9lcyBub3QgaGF2ZSBXZWJBc3NlbWJseSB0aHJlYWRzIHN1cHBvcnQgLSB5b3UgbWF5IG5lZWQgdG8gc2V0IGEgZmxhZ1wiKSxGJiZMKFwiKG9uIG5vZGUgeW91IG1heSBuZWVkOiAtLWV4cGVyaW1lbnRhbC13YXNtLXRocmVhZHMgLS1leHBlcmltZW50YWwtd2FzbS1idWxrLW1lbW9yeSBhbmQvb3IgcmVjZW50IHZlcnNpb24pXCIpLEVycm9yKFwiYmFkIG1lbW9yeVwiKTtcbnQoKTtIYT1xLmJ1ZmZlci5ieXRlTGVuZ3RoO3ZhciBJYT1bXSxKYT1bXSxLYT1bXSxMYT0wO2Z1bmN0aW9uIE1hKCl7cmV0dXJuIG5vRXhpdFJ1bnRpbWV8fDA8TGF9dmFyIE5hPTAsT2E9bnVsbCxQYT1udWxsO2Z1bmN0aW9uIFFhKCl7TmEtLTtpZigwPT1OYSYmKG51bGwhPT1PYSYmKGNsZWFySW50ZXJ2YWwoT2EpLE9hPW51bGwpLFBhKSl7dmFyIGE9UGE7UGE9bnVsbDthKCl9fWZ1bmN0aW9uIEFhKGEpe2E9XCJBYm9ydGVkKFwiK2ErXCIpXCI7TChhKTtDYT0hMDtEYT0xO2E9bmV3IFdlYkFzc2VtYmx5LlJ1bnRpbWVFcnJvcihhK1wiLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLlwiKTttYShhKTt0aHJvdyBhO31mdW5jdGlvbiBSYShhKXtyZXR1cm4gYS5zdGFydHNXaXRoKFwiZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LFwiKX12YXIgU2E7U2E9XCJvcnQtd2FzbS10aHJlYWRlZC53YXNtXCI7UmEoU2EpfHwoU2E9c2EoU2EpKTtcbmZ1bmN0aW9uIFRhKGEpe2lmKHZhKXJldHVybiB2YShhKTt0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjt9ZnVuY3Rpb24gVWEoYSl7aWYocWF8fHJhKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBmZXRjaCYmIWEuc3RhcnRzV2l0aChcImZpbGU6Ly9cIikpcmV0dXJuIGZldGNoKGEse2NyZWRlbnRpYWxzOlwic2FtZS1vcmlnaW5cIn0pLnRoZW4oYj0+e2lmKCFiLm9rKXRocm93XCJmYWlsZWQgdG8gbG9hZCB3YXNtIGJpbmFyeSBmaWxlIGF0ICdcIithK1wiJ1wiO3JldHVybiBiLmFycmF5QnVmZmVyKCl9KS5jYXRjaCgoKT0+VGEoYSkpO2lmKHVhKXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e3VhKGEsZD0+YihuZXcgVWludDhBcnJheShkKSksYyl9KX1yZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKT0+VGEoYSkpfVxuZnVuY3Rpb24gVmEoYSxiLGMpe3JldHVybiBVYShhKS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGQsYikpLnRoZW4oZD0+ZCkudGhlbihjLGQ9PntMKGBmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAke2R9YCk7QWEoZCl9KX1cbmZ1bmN0aW9uIFdhKGEsYil7dmFyIGM9U2E7cmV0dXJuXCJmdW5jdGlvblwiIT10eXBlb2YgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmd8fFJhKGMpfHxjLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpfHxGfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBmZXRjaD9WYShjLGEsYik6ZmV0Y2goYyx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSkudGhlbihkPT5XZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhkLGEpLnRoZW4oYixmdW5jdGlvbihlKXtMKGB3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogJHtlfWApO0woXCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvblwiKTtyZXR1cm4gVmEoYyxhLGIpfSkpfWZ1bmN0aW9uIFhhKGEpe3RoaXMubmFtZT1cIkV4aXRTdGF0dXNcIjt0aGlzLm1lc3NhZ2U9YFByb2dyYW0gdGVybWluYXRlZCB3aXRoIGV4aXQoJHthfSlgO3RoaXMuc3RhdHVzPWF9XG52YXIgWWE9YT0+e2EudGVybWluYXRlKCk7YS5vbm1lc3NhZ2U9KCk9Pnt9fSxaYT1hPT57aWYoMD09TS5QZS5sZW5ndGgpe3ZhciBiPXNhKFwib3J0LXdhc20tdGhyZWFkZWQud29ya2VyLmpzXCIpO2I9bmV3IFdvcmtlcihiKTtNLlBlLnB1c2goYik7TS5yZihNLlBlWzBdKX1iPU0uUGUucG9wKCk7aWYoIWIpcmV0dXJuIDY7TS5NZS5wdXNoKGIpO00uSWVbYS5MZV09YjtiLkxlPWEuTGU7dmFyIGM9e2NtZDpcInJ1blwiLHN0YXJ0X3JvdXRpbmU6YS50Zixhcmc6YS5sZixwdGhyZWFkX3B0cjphLkxlfTtGJiZiLnVucmVmKCk7Yi5wb3N0TWVzc2FnZShjLGEuemYpO3JldHVybiAwfSwkYT1cInVuZGVmaW5lZFwiIT10eXBlb2YgVGV4dERlY29kZXI/bmV3IFRleHREZWNvZGVyKFwidXRmOFwiKTp2b2lkIDAsYWI9KGEsYixjKT0+e2I+Pj49MDt2YXIgZD1iK2M7Zm9yKGM9YjthW2NdJiYhKGM+PWQpOykrK2M7aWYoMTY8Yy1iJiZhLmJ1ZmZlciYmJGEpcmV0dXJuICRhLmRlY29kZShhLmJ1ZmZlciBpbnN0YW5jZW9mXG5TaGFyZWRBcnJheUJ1ZmZlcj9hLnNsaWNlKGIsYyk6YS5zdWJhcnJheShiLGMpKTtmb3IoZD1cIlwiO2I8Yzspe3ZhciBlPWFbYisrXTtpZihlJjEyOCl7dmFyIGY9YVtiKytdJjYzO2lmKDE5Mj09KGUmMjI0KSlkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKChlJjMxKTw8NnxmKTtlbHNle3ZhciBnPWFbYisrXSY2MztlPTIyND09KGUmMjQwKT8oZSYxNSk8PDEyfGY8PDZ8ZzooZSY3KTw8MTh8Zjw8MTJ8Zzw8NnxhW2IrK10mNjM7NjU1MzY+ZT9kKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGUpOihlLT02NTUzNixkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGU+PjEwLDU2MzIwfGUmMTAyMykpfX1lbHNlIGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoZSl9cmV0dXJuIGR9LGJiPShhLGIpPT4oYT4+Pj0wKT9hYih4KCksYSxiKTpcIlwiO2Z1bmN0aW9uIGNiKGEpe2lmKEcpcmV0dXJuIE4oMCwxLGEpO0RhPWE7TWEoKXx8KE0udWYoKSxDYT0hMCk7cGEoYSxuZXcgWGEoYSkpfVxudmFyIGViPWE9PntEYT1hO2lmKEcpdGhyb3cgZGIoYSksXCJ1bndpbmRcIjtjYihhKX07ZnVuY3Rpb24gZ2IoKXtJYS51bnNoaWZ0KCgpPT57TmErKztRYSgpfSl9XG52YXIgTT17UGU6W10sTWU6W10sZWY6W10sSWU6e30sV2UoKXtHPyhNLnJlY2VpdmVPYmplY3RUcmFuc2Zlcj1NLnNmLE0udGhyZWFkSW5pdFRMUz1NLmRmLE0uc2V0RXhpdFN0YXR1cz1NLmFmLG5vRXhpdFJ1bnRpbWU9ITEpOmdiKCl9LGFmOmE9PntEYT1hfSxDZjpbXCIkdGVybWluYXRlV29ya2VyXCJdLHVmOigpPT57Zm9yKHZhciBhIG9mIE0uTWUpWWEoYSk7Zm9yKGEgb2YgTS5QZSlZYShhKTtNLlBlPVtdO00uTWU9W107TS5JZT1bXX0sJGU6YT0+e3ZhciBiPWEuTGU7ZGVsZXRlIE0uSWVbYl07TS5QZS5wdXNoKGEpO00uTWUuc3BsaWNlKE0uTWUuaW5kZXhPZihhKSwxKTthLkxlPTA7aGIoYil9LHNmKCl7fSxkZigpe00uZWYuZm9yRWFjaChhPT5hKCkpfSxyZjphPT5uZXcgUHJvbWlzZShiPT57YS5vbm1lc3NhZ2U9Zj0+e2Y9Zi5kYXRhO3ZhciBnPWYuY21kO2lmKGYudGFyZ2V0VGhyZWFkJiZmLnRhcmdldFRocmVhZCE9aWIoKSl7dmFyIGg9TS5JZVtmLnRhcmdldFRocmVhZF07aD9cbmgucG9zdE1lc3NhZ2UoZixmLnRyYW5zZmVyTGlzdCk6TChgSW50ZXJuYWwgZXJyb3IhIFdvcmtlciBzZW50IGEgbWVzc2FnZSBcIiR7Z31cIiB0byB0YXJnZXQgcHRocmVhZCAke2YudGFyZ2V0VGhyZWFkfSwgYnV0IHRoYXQgdGhyZWFkIG5vIGxvbmdlciBleGlzdHMhYCl9ZWxzZSBpZihcImNoZWNrTWFpbGJveFwiPT09ZylqYigpO2Vsc2UgaWYoXCJzcGF3blRocmVhZFwiPT09ZylaYShmKTtlbHNlIGlmKFwiY2xlYW51cFRocmVhZFwiPT09ZykoZj1NLkllW2YudGhyZWFkXSl8fEFhKCksTS4kZShmKTtlbHNlIGlmKFwia2lsbFRocmVhZFwiPT09ZylmPWYudGhyZWFkLGc9TS5JZVtmXSxkZWxldGUgTS5JZVtmXSxZYShnKSxoYihmKSxNLk1lLnNwbGljZShNLk1lLmluZGV4T2YoZyksMSksZy5MZT0wO2Vsc2UgaWYoXCJjYW5jZWxUaHJlYWRcIj09PWcpTS5JZVtmLnRocmVhZF0ucG9zdE1lc3NhZ2Uoe2NtZDpcImNhbmNlbFwifSk7ZWxzZSBpZihcImxvYWRlZFwiPT09ZylhLmxvYWRlZD0hMCxiKGEpO2Vsc2UgaWYoXCJhbGVydFwiPT09XG5nKWFsZXJ0KGBUaHJlYWQgJHtmLnRocmVhZElkfTogJHtmLnRleHR9YCk7ZWxzZSBpZihcInNldGltbWVkaWF0ZVwiPT09Zi50YXJnZXQpYS5wb3N0TWVzc2FnZShmKTtlbHNlIGlmKFwiY2FsbEhhbmRsZXJcIj09PWcpQ1tmLmhhbmRsZXJdKC4uLmYuYXJncyk7ZWxzZSBnJiZMKGB3b3JrZXIgc2VudCBhbiB1bmtub3duIGNvbW1hbmQgJHtnfWApfTthLm9uZXJyb3I9Zj0+e0woYCR7XCJ3b3JrZXIgc2VudCBhbiBlcnJvciFcIn0gJHtmLmZpbGVuYW1lfToke2YubGluZW5vfTogJHtmLm1lc3NhZ2V9YCk7dGhyb3cgZjt9O0YmJihhLm9uKFwibWVzc2FnZVwiLGY9PmEub25tZXNzYWdlKHtkYXRhOmZ9KSksYS5vbihcImVycm9yXCIsZj0+YS5vbmVycm9yKGYpKSk7dmFyIGM9W10sZD1bXSxlO2ZvcihlIG9mIGQpQy5oYXNPd25Qcm9wZXJ0eShlKSYmYy5wdXNoKGUpO2EucG9zdE1lc3NhZ2Uoe2NtZDpcImxvYWRcIixoYW5kbGVyczpjLHVybE9yQmxvYjpDLm1haW5TY3JpcHRVcmxPckJsb2J8fF9zY3JpcHREaXIsXG53YXNtTWVtb3J5OnEsd2FzbU1vZHVsZTpCYX0pfSl9O0MuUFRocmVhZD1NO3ZhciBrYj1hPT57Zm9yKDswPGEubGVuZ3RoOylhLnNoaWZ0KCkoQyl9O0MuZXN0YWJsaXNoU3RhY2tTcGFjZT0oKT0+e3ZhciBhPWliKCksYj1CKClbYSs1Mj4+PjI+Pj4wXTthPUIoKVthKzU2Pj4+Mj4+PjBdO2xiKGIsYi1hKTtPKGIpfTtmdW5jdGlvbiBkYihhKXtpZihHKXJldHVybiBOKDEsMCxhKTtlYihhKX12YXIgbWI9W10sbmIsUD1hPT57dmFyIGI9bWJbYV07Ynx8KGE+PW1iLmxlbmd0aCYmKG1iLmxlbmd0aD1hKzEpLG1iW2FdPWI9bmIuZ2V0KGEpKTtyZXR1cm4gYn07Qy5pbnZva2VFbnRyeVBvaW50PShhLGIpPT57YT1QKGEpKGIpO01hKCk/TS5hZihhKTpvYihhKX07dmFyIHBiPVtdLHFiPTAsUT0wO1xuZnVuY3Rpb24gcmIoYSl7dGhpcy5SZT1hO3RoaXMuSGU9YS0yNDt0aGlzLmtmPWZ1bmN0aW9uKGIpe0IoKVt0aGlzLkhlKzQ+Pj4yPj4+MF09Yn07dGhpcy5TZT1mdW5jdGlvbigpe3JldHVybiBCKClbdGhpcy5IZSs0Pj4+Mj4+PjBdfTt0aGlzLmpmPWZ1bmN0aW9uKGIpe0IoKVt0aGlzLkhlKzg+Pj4yPj4+MF09Yn07dGhpcy5iZj1mdW5jdGlvbihiKXtiPWI/MTowO3AoKVt0aGlzLkhlKzEyPj4+MD4+PjBdPWJ9O3RoaXMuZ2Y9ZnVuY3Rpb24oKXtyZXR1cm4gMCE9cCgpW3RoaXMuSGUrMTI+Pj4wPj4+MF19O3RoaXMuY2Y9ZnVuY3Rpb24oYil7Yj1iPzE6MDtwKClbdGhpcy5IZSsxMz4+PjA+Pj4wXT1ifTt0aGlzLm5mPWZ1bmN0aW9uKCl7cmV0dXJuIDAhPXAoKVt0aGlzLkhlKzEzPj4+MD4+PjBdfTt0aGlzLldlPWZ1bmN0aW9uKGIsYyl7dGhpcy5UZSgwKTt0aGlzLmtmKGIpO3RoaXMuamYoYyl9O3RoaXMuVGU9ZnVuY3Rpb24oYil7QigpW3RoaXMuSGUrMTY+Pj4yPj4+MF09Yn07XG50aGlzLmZmPWZ1bmN0aW9uKCl7cmV0dXJuIEIoKVt0aGlzLkhlKzE2Pj4+Mj4+PjBdfTt0aGlzLmhmPWZ1bmN0aW9uKCl7aWYoc2IodGhpcy5TZSgpKSlyZXR1cm4gQigpW3RoaXMuUmU+Pj4yPj4+MF07dmFyIGI9dGhpcy5mZigpO3JldHVybiAwIT09Yj9iOnRoaXMuUmV9fXZhciB2Yj1hPT57dmFyIGI9UTtpZighYilyZXR1cm4gdGIoMCksMDt2YXIgYz1uZXcgcmIoYik7Yy5UZShiKTt2YXIgZD1jLlNlKCk7aWYoIWQpcmV0dXJuIHRiKDApLGI7Zm9yKHZhciBlIGluIGEpe3ZhciBmPWFbZV07aWYoMD09PWZ8fGY9PT1kKWJyZWFrO2lmKHViKGYsZCxjLkhlKzE2KSlyZXR1cm4gdGIoZiksYn10YihkKTtyZXR1cm4gYn07ZnVuY3Rpb24gd2IoYSxiLGMsZCl7cmV0dXJuIEc/TigyLDEsYSxiLGMsZCk6eGIoYSxiLGMsZCl9XG5mdW5jdGlvbiB4YihhLGIsYyxkKXthPj4+PTA7Yj4+Pj0wO2M+Pj49MDtkPj4+PTA7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyKXJldHVybiBMKFwiQ3VycmVudCBlbnZpcm9ubWVudCBkb2VzIG5vdCBzdXBwb3J0IFNoYXJlZEFycmF5QnVmZmVyLCBwdGhyZWFkcyBhcmUgbm90IGF2YWlsYWJsZSFcIiksNjt2YXIgZT1bXTtpZihHJiYwPT09ZS5sZW5ndGgpcmV0dXJuIHdiKGEsYixjLGQpO2E9e3RmOmMsTGU6YSxsZjpkLHpmOmV9O3JldHVybiBHPyhhLkJmPVwic3Bhd25UaHJlYWRcIixwb3N0TWVzc2FnZShhLGUpLDApOlphKGEpfWZ1bmN0aW9uIHliKGEsYixjKXtyZXR1cm4gRz9OKDMsMSxhLGIsYyk6MH1mdW5jdGlvbiB6YihhLGIpe2lmKEcpcmV0dXJuIE4oNCwxLGEsYil9XG52YXIgQWI9YT0+e2Zvcih2YXIgYj0wLGM9MDtjPGEubGVuZ3RoOysrYyl7dmFyIGQ9YS5jaGFyQ29kZUF0KGMpOzEyNz49ZD9iKys6MjA0Nz49ZD9iKz0yOjU1Mjk2PD1kJiY1NzM0Mz49ZD8oYis9NCwrK2MpOmIrPTN9cmV0dXJuIGJ9LEJiPShhLGIsYyxkKT0+e2M+Pj49MDtpZighKDA8ZCkpcmV0dXJuIDA7dmFyIGU9YztkPWMrZC0xO2Zvcih2YXIgZj0wO2Y8YS5sZW5ndGg7KytmKXt2YXIgZz1hLmNoYXJDb2RlQXQoZik7aWYoNTUyOTY8PWcmJjU3MzQzPj1nKXt2YXIgaD1hLmNoYXJDb2RlQXQoKytmKTtnPTY1NTM2KygoZyYxMDIzKTw8MTApfGgmMTAyM31pZigxMjc+PWcpe2lmKGM+PWQpYnJlYWs7YltjKys+Pj4wXT1nfWVsc2V7aWYoMjA0Nz49Zyl7aWYoYysxPj1kKWJyZWFrO2JbYysrPj4+MF09MTkyfGc+PjZ9ZWxzZXtpZig2NTUzNT49Zyl7aWYoYysyPj1kKWJyZWFrO2JbYysrPj4+MF09MjI0fGc+PjEyfWVsc2V7aWYoYyszPj1kKWJyZWFrO2JbYysrPj4+MF09MjQwfGc+PlxuMTg7YltjKys+Pj4wXT0xMjh8Zz4+MTImNjN9YltjKys+Pj4wXT0xMjh8Zz4+NiY2M31iW2MrKz4+PjBdPTEyOHxnJjYzfX1iW2M+Pj4wXT0wO3JldHVybiBjLWV9LENiPShhLGIsYyk9PkJiKGEseCgpLGIsYyk7ZnVuY3Rpb24gRGIoYSxiKXtpZihHKXJldHVybiBOKDUsMSxhLGIpfWZ1bmN0aW9uIEViKGEsYixjKXtpZihHKXJldHVybiBOKDYsMSxhLGIsYyl9ZnVuY3Rpb24gRmIoYSxiLGMpe3JldHVybiBHP04oNywxLGEsYixjKTowfWZ1bmN0aW9uIEdiKGEsYil7aWYoRylyZXR1cm4gTig4LDEsYSxiKX1mdW5jdGlvbiBIYihhLGIsYyl7aWYoRylyZXR1cm4gTig5LDEsYSxiLGMpfWZ1bmN0aW9uIEliKGEsYixjLGQpe2lmKEcpcmV0dXJuIE4oMTAsMSxhLGIsYyxkKX1mdW5jdGlvbiBKYihhLGIsYyxkKXtpZihHKXJldHVybiBOKDExLDEsYSxiLGMsZCl9ZnVuY3Rpb24gS2IoYSxiLGMsZCl7aWYoRylyZXR1cm4gTigxMiwxLGEsYixjLGQpfVxuZnVuY3Rpb24gTGIoYSl7aWYoRylyZXR1cm4gTigxMywxLGEpfWZ1bmN0aW9uIE1iKGEsYil7aWYoRylyZXR1cm4gTigxNCwxLGEsYil9ZnVuY3Rpb24gTmIoYSxiLGMpe2lmKEcpcmV0dXJuIE4oMTUsMSxhLGIsYyl9dmFyIE9iPWE9PntpZihudWxsPT09YSlyZXR1cm5cIm51bGxcIjt2YXIgYj10eXBlb2YgYTtyZXR1cm5cIm9iamVjdFwiPT09Ynx8XCJhcnJheVwiPT09Ynx8XCJmdW5jdGlvblwiPT09Yj9hLnRvU3RyaW5nKCk6XCJcIithfSxQYixSPWE9Pntmb3IodmFyIGI9XCJcIjt4KClbYT4+PjBdOyliKz1QYlt4KClbYSsrPj4+MF1dO3JldHVybiBifSxRYj17fSxSYj17fSxTYj17fSxUYjtcbmZ1bmN0aW9uIFViKGEsYixjPXt9KXt2YXIgZD1iLm5hbWU7aWYoIWEpdGhyb3cgbmV3IFRiKGB0eXBlIFwiJHtkfVwiIG11c3QgaGF2ZSBhIHBvc2l0aXZlIGludGVnZXIgdHlwZWlkIHBvaW50ZXJgKTtpZihSYi5oYXNPd25Qcm9wZXJ0eShhKSl7aWYoYy5wZilyZXR1cm47dGhyb3cgbmV3IFRiKGBDYW5ub3QgcmVnaXN0ZXIgdHlwZSAnJHtkfScgdHdpY2VgKTt9UmJbYV09YjtkZWxldGUgU2JbYV07UWIuaGFzT3duUHJvcGVydHkoYSkmJihiPVFiW2FdLGRlbGV0ZSBRYlthXSxiLmZvckVhY2goZT0+ZSgpKSl9ZnVuY3Rpb24gUyhhLGIsYz17fSl7aWYoIShcImFyZ1BhY2tBZHZhbmNlXCJpbiBiKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwicmVnaXN0ZXJUeXBlIHJlZ2lzdGVyZWRJbnN0YW5jZSByZXF1aXJlcyBhcmdQYWNrQWR2YW5jZVwiKTtVYihhLGIsYyl9XG52YXIgVmI9KGEsYixjKT0+e3N3aXRjaChiKXtjYXNlIDE6cmV0dXJuIGM/ZD0+cCgpW2Q+Pj4wPj4+MF06ZD0+eCgpW2Q+Pj4wPj4+MF07Y2FzZSAyOnJldHVybiBjP2Q9PmNhKClbZD4+PjE+Pj4wXTpkPT5lYSgpW2Q+Pj4xPj4+MF07Y2FzZSA0OnJldHVybiBjP2Q9PkEoKVtkPj4+Mj4+PjBdOmQ9PkIoKVtkPj4+Mj4+PjBdO2Nhc2UgODpyZXR1cm4gYz9kPT5GYVtkPj4+M106ZD0+R2FbZD4+PjNdO2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcihgaW52YWxpZCBpbnRlZ2VyIHdpZHRoICgke2J9KTogJHthfWApO319O2Z1bmN0aW9uIFdiKCl7dGhpcy5LZT1bdm9pZCAwXTt0aGlzLlllPVtdfXZhciBUPW5ldyBXYjtmdW5jdGlvbiBYYihhKXthPj4+PTA7YT49VC5IZSYmMD09PS0tVC5nZXQoYSkuWmUmJlQuVGUoYSl9XG52YXIgVT1hPT57aWYoIWEpdGhyb3cgbmV3IFRiKFwiQ2Fubm90IHVzZSBkZWxldGVkIHZhbC4gaGFuZGxlID0gXCIrYSk7cmV0dXJuIFQuZ2V0KGEpLnZhbHVlfSxWPWE9Pntzd2l0Y2goYSl7Y2FzZSB2b2lkIDA6cmV0dXJuIDE7Y2FzZSBudWxsOnJldHVybiAyO2Nhc2UgITA6cmV0dXJuIDM7Y2FzZSAhMTpyZXR1cm4gNDtkZWZhdWx0OnJldHVybiBULlNlKHtaZToxLHZhbHVlOmF9KX19O2Z1bmN0aW9uIFliKGEpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZShBKClbYT4+PjI+Pj4wXSl9XG52YXIgWmI9KGEsYik9Pntzd2l0Y2goYil7Y2FzZSA0OnJldHVybiBmdW5jdGlvbihjKXt2YXIgZD10aGlzLmZyb21XaXJlVHlwZTtxLmJ1ZmZlciE9ci5idWZmZXImJnQoKTtyZXR1cm4gZC5jYWxsKHRoaXMsRWFbYz4+PjI+Pj4wXSl9O2Nhc2UgODpyZXR1cm4gZnVuY3Rpb24oYyl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKGphKClbYz4+PjM+Pj4wXSl9O2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcihgaW52YWxpZCBmbG9hdCB3aWR0aCAoJHtifSk6ICR7YX1gKTt9fTtmdW5jdGlvbiAkYihhKXtyZXR1cm4gdGhpcy5mcm9tV2lyZVR5cGUoQigpW2E+Pj4yPj4+MF0pfVxudmFyIGFjPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBUZXh0RGVjb2Rlcj9uZXcgVGV4dERlY29kZXIoXCJ1dGYtMTZsZVwiKTp2b2lkIDAsYmM9KGEsYik9Pnt2YXIgYz1hPj4xO2Zvcih2YXIgZD1jK2IvMjshKGM+PWQpJiZlYSgpW2M+Pj4wXTspKytjO2M8PD0xO2lmKDMyPGMtYSYmYWMpcmV0dXJuIGFjLmRlY29kZSh4KCkuc2xpY2UoYSxjKSk7Yz1cIlwiO2ZvcihkPTA7IShkPj1iLzIpOysrZCl7dmFyIGU9Y2EoKVthKzIqZD4+PjE+Pj4wXTtpZigwPT1lKWJyZWFrO2MrPVN0cmluZy5mcm9tQ2hhckNvZGUoZSl9cmV0dXJuIGN9LGNjPShhLGIsYyk9Pnt2b2lkIDA9PT1jJiYoYz0yMTQ3NDgzNjQ3KTtpZigyPmMpcmV0dXJuIDA7Yy09Mjt2YXIgZD1iO2M9YzwyKmEubGVuZ3RoP2MvMjphLmxlbmd0aDtmb3IodmFyIGU9MDtlPGM7KytlKXt2YXIgZj1hLmNoYXJDb2RlQXQoZSk7Y2EoKVtiPj4+MT4+PjBdPWY7Yis9Mn1jYSgpW2I+Pj4xPj4+MF09MDtyZXR1cm4gYi1kfSxkYz1hPT4yKmEubGVuZ3RoLFxuZWM9KGEsYik9Pntmb3IodmFyIGM9MCxkPVwiXCI7IShjPj1iLzQpOyl7dmFyIGU9QSgpW2ErNCpjPj4+Mj4+PjBdO2lmKDA9PWUpYnJlYWs7KytjOzY1NTM2PD1lPyhlLT02NTUzNixkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGU+PjEwLDU2MzIwfGUmMTAyMykpOmQrPVN0cmluZy5mcm9tQ2hhckNvZGUoZSl9cmV0dXJuIGR9LGZjPShhLGIsYyk9PntiPj4+PTA7dm9pZCAwPT09YyYmKGM9MjE0NzQ4MzY0Nyk7aWYoND5jKXJldHVybiAwO3ZhciBkPWI7Yz1kK2MtNDtmb3IodmFyIGU9MDtlPGEubGVuZ3RoOysrZSl7dmFyIGY9YS5jaGFyQ29kZUF0KGUpO2lmKDU1Mjk2PD1mJiY1NzM0Mz49Zil7dmFyIGc9YS5jaGFyQ29kZUF0KCsrZSk7Zj02NTUzNisoKGYmMTAyMyk8PDEwKXxnJjEwMjN9QSgpW2I+Pj4yPj4+MF09ZjtiKz00O2lmKGIrND5jKWJyZWFrfUEoKVtiPj4+Mj4+PjBdPTA7cmV0dXJuIGItZH0sZ2M9YT0+e2Zvcih2YXIgYj0wLGM9MDtjPGEubGVuZ3RoOysrYyl7dmFyIGQ9XG5hLmNoYXJDb2RlQXQoYyk7NTUyOTY8PWQmJjU3MzQzPj1kJiYrK2M7Yis9NH1yZXR1cm4gYn0saGM9YT0+e2lmKCFDYSl0cnl7aWYoYSgpLCFNYSgpKXRyeXtHP29iKERhKTplYihEYSl9Y2F0Y2goYil7YiBpbnN0YW5jZW9mIFhhfHxcInVud2luZFwiPT1ifHxwYSgxLGIpfX1jYXRjaChiKXtiIGluc3RhbmNlb2YgWGF8fFwidW53aW5kXCI9PWJ8fHBhKDEsYil9fTtmdW5jdGlvbiBpYyhhKXthPj4+PTA7XCJmdW5jdGlvblwiPT09dHlwZW9mIEF0b21pY3MuQWYmJihBdG9taWNzLkFmKEEoKSxhPj4+MixhKS52YWx1ZS50aGVuKGpiKSxhKz0xMjgsQXRvbWljcy5zdG9yZShBKCksYT4+PjIsMSkpfUMuX19lbXNjcmlwdGVuX3RocmVhZF9tYWlsYm94X2F3YWl0PWljO3ZhciBqYj0oKT0+e3ZhciBhPWliKCk7YSYmKGljKGEpLGhjKCgpPT5qYygpKSl9O0MuY2hlY2tNYWlsYm94PWpiO3ZhciBrYz1hPT57dmFyIGI9VygpO2E9YSgpO08oYik7cmV0dXJuIGF9O1xuZnVuY3Rpb24gTihhLGIpe3ZhciBjPWFyZ3VtZW50cy5sZW5ndGgtMixkPWFyZ3VtZW50cztyZXR1cm4ga2MoKCk9Pntmb3IodmFyIGU9MipjLGY9bGMoOCplKSxnPWY+Pj4zLGg9MDtoPGM7aCsrKXt2YXIgaz1kWzIraF07XCJiaWdpbnRcIj09dHlwZW9mIGs/KEZhW2crMipoXT0xbixGYVtnKzIqaCsxXT1rKTooRmFbZysyKmhdPTBuLGphKClbZysyKmgrMT4+PjBdPWspfXJldHVybiBtYyhhLGUsZixiKX0pfVxudmFyIG5jPVtdLHBjPShhLGIpPT57dmFyIGM9UmJbYV07aWYodm9pZCAwPT09Yyl0aHJvdyBhPW9jKGEpLGM9UihhKSxYKGEpLG5ldyBUYihiK1wiIGhhcyB1bmtub3duIHR5cGUgXCIrYyk7cmV0dXJuIGN9LHFjPXt9LHJjPWE9Pnt2YXIgYj1xY1thXTtyZXR1cm4gdm9pZCAwPT09Yj9SKGEpOmJ9LHNjPVtdLHRjPSgpPT5cIm9iamVjdFwiPT10eXBlb2YgZ2xvYmFsVGhpcz9nbG9iYWxUaGlzOkZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSx1Yz1hPT57dmFyIGI9c2MubGVuZ3RoO3NjLnB1c2goYSk7cmV0dXJuIGJ9LHZjPShhLGIpPT57Zm9yKHZhciBjPUFycmF5KGEpLGQ9MDtkPGE7KytkKWNbZF09cGMoQigpW2IrNCpkPj4+Mj4+PjBdLFwicGFyYW1ldGVyIFwiK2QpO3JldHVybiBjfSx3Yz1hPT57aWYodm9pZCAwPT09YSlyZXR1cm5cIl91bmtub3duXCI7YT1hLnJlcGxhY2UoL1teYS16QS1aMC05X10vZyxcIiRcIik7dmFyIGI9YS5jaGFyQ29kZUF0KDApO3JldHVybiA0ODw9YiYmNTc+PWI/YF8ke2F9YDpcbmF9LHhjPXt9O2Z1bmN0aW9uIHljKGEsYil7YT13YyhhKTtyZXR1cm57W2FdOmZ1bmN0aW9uKCl7cmV0dXJuIGIuYXBwbHkodGhpcyxhcmd1bWVudHMpfX1bYV19ZnVuY3Rpb24gemMoYSl7dmFyIGI9RnVuY3Rpb247aWYoIShiIGluc3RhbmNlb2YgRnVuY3Rpb24pKXRocm93IG5ldyBUeXBlRXJyb3IoYG5ld18gY2FsbGVkIHdpdGggY29uc3RydWN0b3IgdHlwZSAke3R5cGVvZiBifSB3aGljaCBpcyBub3QgYSBmdW5jdGlvbmApO3ZhciBjPXljKGIubmFtZXx8XCJ1bmtub3duRnVuY3Rpb25OYW1lXCIsZnVuY3Rpb24oKXt9KTtjLnByb3RvdHlwZT1iLnByb3RvdHlwZTtjPW5ldyBjO2E9Yi5hcHBseShjLGEpO3JldHVybiBhIGluc3RhbmNlb2YgT2JqZWN0P2E6Y31cbnZhciBBYz1hPT57Zm9yKHZhciBiPVwiXCIsYz0wO2M8YTsrK2MpYis9KDAhPT1jP1wiLCBcIjpcIlwiKStcImFyZ1wiK2M7dmFyIGQ9XCJyZXR1cm4gZnVuY3Rpb24gZW12YWxfYWxsb2NhdG9yX1wiK2ErXCIoY29uc3RydWN0b3IsIGFyZ1R5cGVzLCBhcmdzKSB7XFxuICB2YXIgSEVBUFUzMiA9IGdldE1lbW9yeSgpO1xcblwiO2ZvcihjPTA7YzxhOysrYylkKz1cInZhciBhcmdUeXBlXCIrYytcIiA9IHJlcXVpcmVSZWdpc3RlcmVkVHlwZShIRUFQVTMyWygoYXJnVHlwZXMpPj4+MildLCAncGFyYW1ldGVyIFwiK2MrXCInKTtcXG52YXIgYXJnXCIrYytcIiA9IGFyZ1R5cGVcIitjK1wiLnJlYWRWYWx1ZUZyb21Qb2ludGVyKGFyZ3MpO1xcbmFyZ3MgKz0gYXJnVHlwZVwiK2MrXCJbJ2FyZ1BhY2tBZHZhbmNlJ107XFxuYXJnVHlwZXMgKz0gNDtcXG5cIjtyZXR1cm4obmV3IEZ1bmN0aW9uKFwicmVxdWlyZVJlZ2lzdGVyZWRUeXBlXCIsXCJNb2R1bGVcIixcInZhbHVlVG9IYW5kbGVcIixcImdldE1lbW9yeVwiLGQrKFwidmFyIG9iaiA9IG5ldyBjb25zdHJ1Y3RvcihcIitcbmIrXCIpO1xcbnJldHVybiB2YWx1ZVRvSGFuZGxlKG9iaik7XFxufVxcblwiKSkpKHBjLEMsViwoKT0+QigpKX0sQmM9e30sQ2M9YT0+MD09PWElNCYmKDAhPT1hJTEwMHx8MD09PWElNDAwKSxEYz1bMCwzMSw2MCw5MSwxMjEsMTUyLDE4MiwyMTMsMjQ0LDI3NCwzMDUsMzM1XSxFYz1bMCwzMSw1OSw5MCwxMjAsMTUxLDE4MSwyMTIsMjQzLDI3MywzMDQsMzM0XTtmdW5jdGlvbiBGYyhhLGIsYyxkLGUsZixnKXtyZXR1cm4gRz9OKDE2LDEsYSxiLGMsZCxlLGYsZyk6LTUyfWZ1bmN0aW9uIEdjKGEsYixjLGQsZSxmKXtpZihHKXJldHVybiBOKDE3LDEsYSxiLGMsZCxlLGYpfVxudmFyIEljPWE9Pnt2YXIgYj1BYihhKSsxLGM9SGMoYik7YyYmQ2IoYSxjLGIpO3JldHVybiBjfSxKYz17fSxMYz0oKT0+e2lmKCFLYyl7dmFyIGE9e1VTRVI6XCJ3ZWJfdXNlclwiLExPR05BTUU6XCJ3ZWJfdXNlclwiLFBBVEg6XCIvXCIsUFdEOlwiL1wiLEhPTUU6XCIvaG9tZS93ZWJfdXNlclwiLExBTkc6KFwib2JqZWN0XCI9PXR5cGVvZiBuYXZpZ2F0b3ImJm5hdmlnYXRvci5sYW5ndWFnZXMmJm5hdmlnYXRvci5sYW5ndWFnZXNbMF18fFwiQ1wiKS5yZXBsYWNlKFwiLVwiLFwiX1wiKStcIi5VVEYtOFwiLF86b2F8fFwiLi90aGlzLnByb2dyYW1cIn0sYjtmb3IoYiBpbiBKYyl2b2lkIDA9PT1KY1tiXT9kZWxldGUgYVtiXTphW2JdPUpjW2JdO3ZhciBjPVtdO2ZvcihiIGluIGEpYy5wdXNoKGAke2J9PSR7YVtiXX1gKTtLYz1jfXJldHVybiBLY30sS2M7XG5mdW5jdGlvbiBNYyhhLGIpe2lmKEcpcmV0dXJuIE4oMTgsMSxhLGIpO2E+Pj49MDtiPj4+PTA7dmFyIGM9MDtMYygpLmZvckVhY2goKGQsZSk9Pnt2YXIgZj1iK2M7ZT1CKClbYSs0KmU+Pj4yPj4+MF09Zjtmb3IoZj0wO2Y8ZC5sZW5ndGg7KytmKXAoKVtlKys+Pj4wPj4+MF09ZC5jaGFyQ29kZUF0KGYpO3AoKVtlPj4+MD4+PjBdPTA7Yys9ZC5sZW5ndGgrMX0pO3JldHVybiAwfWZ1bmN0aW9uIE5jKGEsYil7aWYoRylyZXR1cm4gTigxOSwxLGEsYik7YT4+Pj0wO2I+Pj49MDt2YXIgYz1MYygpO0IoKVthPj4+Mj4+PjBdPWMubGVuZ3RoO3ZhciBkPTA7Yy5mb3JFYWNoKGU9PmQrPWUubGVuZ3RoKzEpO0IoKVtiPj4+Mj4+PjBdPWQ7cmV0dXJuIDB9ZnVuY3Rpb24gT2MoYSl7cmV0dXJuIEc/TigyMCwxLGEpOjUyfWZ1bmN0aW9uIFBjKGEsYixjLGQpe3JldHVybiBHP04oMjEsMSxhLGIsYyxkKTo1Mn1cbmZ1bmN0aW9uIFFjKGEsYixjLGQpe3JldHVybiBHP04oMjIsMSxhLGIsYyxkKTo3MH12YXIgUmM9W251bGwsW10sW11dO2Z1bmN0aW9uIFNjKGEsYixjLGQpe2lmKEcpcmV0dXJuIE4oMjMsMSxhLGIsYyxkKTtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDtmb3IodmFyIGU9MCxmPTA7ZjxjO2YrKyl7dmFyIGc9QigpW2I+Pj4yPj4+MF0saD1CKClbYis0Pj4+Mj4+PjBdO2IrPTg7Zm9yKHZhciBrPTA7azxoO2srKyl7dmFyIGw9eCgpW2craz4+PjBdLG49UmNbYV07MD09PWx8fDEwPT09bD8oKDE9PT1hP3phOkwpKGFiKG4sMCkpLG4ubGVuZ3RoPTApOm4ucHVzaChsKX1lKz1ofUIoKVtkPj4+Mj4+PjBdPWU7cmV0dXJuIDB9dmFyIFRjPVszMSwyOSwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV0sVWM9WzMxLDI4LDMxLDMwLDMxLDMwLDMxLDMxLDMwLDMxLDMwLDMxXTtmdW5jdGlvbiBWYyhhKXt2YXIgYj1BcnJheShBYihhKSsxKTtCYihhLGIsMCxiLmxlbmd0aCk7cmV0dXJuIGJ9XG52YXIgV2M9KGEsYik9PntwKCkuc2V0KGEsYj4+PjApfTtcbmZ1bmN0aW9uIFhjKGEsYixjLGQpe2Z1bmN0aW9uIGUobSx3LHkpe2ZvcihtPVwibnVtYmVyXCI9PXR5cGVvZiBtP20udG9TdHJpbmcoKTptfHxcIlwiO20ubGVuZ3RoPHc7KW09eVswXSttO3JldHVybiBtfWZ1bmN0aW9uIGYobSx3KXtyZXR1cm4gZShtLHcsXCIwXCIpfWZ1bmN0aW9uIGcobSx3KXtmdW5jdGlvbiB5KEQpe3JldHVybiAwPkQ/LTE6MDxEPzE6MH12YXIgejswPT09KHo9eShtLmdldEZ1bGxZZWFyKCktdy5nZXRGdWxsWWVhcigpKSkmJjA9PT0oej15KG0uZ2V0TW9udGgoKS13LmdldE1vbnRoKCkpKSYmKHo9eShtLmdldERhdGUoKS13LmdldERhdGUoKSkpO3JldHVybiB6fWZ1bmN0aW9uIGgobSl7c3dpdGNoKG0uZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUobS5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gbTtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKG0uZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUobS5nZXRGdWxsWWVhcigpLFxuMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKG0uZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUobS5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUobS5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiBrKG0pe3ZhciB3PW0uTmU7Zm9yKG09bmV3IERhdGUoKG5ldyBEYXRlKG0uT2UrMTkwMCwwLDEpKS5nZXRUaW1lKCkpOzA8dzspe3ZhciB5PW0uZ2V0TW9udGgoKSx6PShDYyhtLmdldEZ1bGxZZWFyKCkpP1RjOlVjKVt5XTtpZih3PnotbS5nZXREYXRlKCkpdy09ei1tLmdldERhdGUoKSsxLG0uc2V0RGF0ZSgxKSwxMT55P20uc2V0TW9udGgoeSsxKToobS5zZXRNb250aCgwKSxtLnNldEZ1bGxZZWFyKG0uZ2V0RnVsbFllYXIoKSsxKSk7ZWxzZXttLnNldERhdGUobS5nZXREYXRlKCkrdyk7YnJlYWt9fXk9bmV3IERhdGUobS5nZXRGdWxsWWVhcigpKzEsMCw0KTt3PWgobmV3IERhdGUobS5nZXRGdWxsWWVhcigpLFxuMCw0KSk7eT1oKHkpO3JldHVybiAwPj1nKHcsbSk/MD49Zyh5LG0pP20uZ2V0RnVsbFllYXIoKSsxOm0uZ2V0RnVsbFllYXIoKTptLmdldEZ1bGxZZWFyKCktMX1hPj4+PTA7Yj4+Pj0wO2M+Pj49MDtkPj4+PTA7dmFyIGw9QigpW2QrNDA+Pj4yPj4+MF07ZD17eGY6QSgpW2Q+Pj4yPj4+MF0sd2Y6QSgpW2QrND4+PjI+Pj4wXSxVZTpBKClbZCs4Pj4+Mj4+PjBdLFhlOkEoKVtkKzEyPj4+Mj4+PjBdLFZlOkEoKVtkKzE2Pj4+Mj4+PjBdLE9lOkEoKVtkKzIwPj4+Mj4+PjBdLEplOkEoKVtkKzI0Pj4+Mj4+PjBdLE5lOkEoKVtkKzI4Pj4+Mj4+PjBdLERmOkEoKVtkKzMyPj4+Mj4+PjBdLHZmOkEoKVtkKzM2Pj4+Mj4+PjBdLHlmOmw/YmIobCk6XCJcIn07Yz1iYihjKTtsPXtcIiVjXCI6XCIlYSAlYiAlZCAlSDolTTolUyAlWVwiLFwiJURcIjpcIiVtLyVkLyV5XCIsXCIlRlwiOlwiJVktJW0tJWRcIixcIiVoXCI6XCIlYlwiLFwiJXJcIjpcIiVJOiVNOiVTICVwXCIsXCIlUlwiOlwiJUg6JU1cIixcIiVUXCI6XCIlSDolTTolU1wiLFwiJXhcIjpcIiVtLyVkLyV5XCIsXG5cIiVYXCI6XCIlSDolTTolU1wiLFwiJUVjXCI6XCIlY1wiLFwiJUVDXCI6XCIlQ1wiLFwiJUV4XCI6XCIlbS8lZC8leVwiLFwiJUVYXCI6XCIlSDolTTolU1wiLFwiJUV5XCI6XCIleVwiLFwiJUVZXCI6XCIlWVwiLFwiJU9kXCI6XCIlZFwiLFwiJU9lXCI6XCIlZVwiLFwiJU9IXCI6XCIlSFwiLFwiJU9JXCI6XCIlSVwiLFwiJU9tXCI6XCIlbVwiLFwiJU9NXCI6XCIlTVwiLFwiJU9TXCI6XCIlU1wiLFwiJU91XCI6XCIldVwiLFwiJU9VXCI6XCIlVVwiLFwiJU9WXCI6XCIlVlwiLFwiJU93XCI6XCIld1wiLFwiJU9XXCI6XCIlV1wiLFwiJU95XCI6XCIleVwifTtmb3IodmFyIG4gaW4gbCljPWMucmVwbGFjZShuZXcgUmVnRXhwKG4sXCJnXCIpLGxbbl0pO3ZhciB1PVwiU3VuZGF5IE1vbmRheSBUdWVzZGF5IFdlZG5lc2RheSBUaHVyc2RheSBGcmlkYXkgU2F0dXJkYXlcIi5zcGxpdChcIiBcIiksdj1cIkphbnVhcnkgRmVicnVhcnkgTWFyY2ggQXByaWwgTWF5IEp1bmUgSnVseSBBdWd1c3QgU2VwdGVtYmVyIE9jdG9iZXIgTm92ZW1iZXIgRGVjZW1iZXJcIi5zcGxpdChcIiBcIik7bD17XCIlYVwiOm09PnVbbS5KZV0uc3Vic3RyaW5nKDAsMyksXCIlQVwiOm09PlxudVttLkplXSxcIiViXCI6bT0+dlttLlZlXS5zdWJzdHJpbmcoMCwzKSxcIiVCXCI6bT0+dlttLlZlXSxcIiVDXCI6bT0+ZigobS5PZSsxOTAwKS8xMDB8MCwyKSxcIiVkXCI6bT0+ZihtLlhlLDIpLFwiJWVcIjptPT5lKG0uWGUsMixcIiBcIiksXCIlZ1wiOm09PmsobSkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlR1wiOm09PmsobSksXCIlSFwiOm09PmYobS5VZSwyKSxcIiVJXCI6bT0+e209bS5VZTswPT1tP209MTI6MTI8bSYmKG0tPTEyKTtyZXR1cm4gZihtLDIpfSxcIiVqXCI6bT0+e2Zvcih2YXIgdz0wLHk9MDt5PD1tLlZlLTE7dys9KENjKG0uT2UrMTkwMCk/VGM6VWMpW3krK10pO3JldHVybiBmKG0uWGUrdywzKX0sXCIlbVwiOm09PmYobS5WZSsxLDIpLFwiJU1cIjptPT5mKG0ud2YsMiksXCIlblwiOigpPT5cIlxcblwiLFwiJXBcIjptPT4wPD1tLlVlJiYxMj5tLlVlP1wiQU1cIjpcIlBNXCIsXCIlU1wiOm09PmYobS54ZiwyKSxcIiV0XCI6KCk9PlwiXFx0XCIsXCIldVwiOm09Pm0uSmV8fDcsXCIlVVwiOm09PmYoTWF0aC5mbG9vcigobS5OZSs3LW0uSmUpL1xuNyksMiksXCIlVlwiOm09Pnt2YXIgdz1NYXRoLmZsb29yKChtLk5lKzctKG0uSmUrNiklNykvNyk7Mj49KG0uSmUrMzcxLW0uTmUtMiklNyYmdysrO2lmKHcpNTM9PXcmJih5PShtLkplKzM3MS1tLk5lKSU3LDQ9PXl8fDM9PXkmJkNjKG0uT2UpfHwodz0xKSk7ZWxzZXt3PTUyO3ZhciB5PShtLkplKzctbS5OZS0xKSU3Oyg0PT15fHw1PT15JiZDYyhtLk9lJTQwMC0xKSkmJncrK31yZXR1cm4gZih3LDIpfSxcIiV3XCI6bT0+bS5KZSxcIiVXXCI6bT0+ZihNYXRoLmZsb29yKChtLk5lKzctKG0uSmUrNiklNykvNyksMiksXCIleVwiOm09PihtLk9lKzE5MDApLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLFwiJVlcIjptPT5tLk9lKzE5MDAsXCIlelwiOm09PnttPW0udmY7dmFyIHc9MDw9bTttPU1hdGguYWJzKG0pLzYwO3JldHVybih3P1wiK1wiOlwiLVwiKStTdHJpbmcoXCIwMDAwXCIrKG0vNjAqMTAwK20lNjApKS5zbGljZSgtNCl9LFwiJVpcIjptPT5tLnlmLFwiJSVcIjooKT0+XCIlXCJ9O2M9Yy5yZXBsYWNlKC8lJS9nLFwiXFx4MDBcXHgwMFwiKTtcbmZvcihuIGluIGwpYy5pbmNsdWRlcyhuKSYmKGM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAobixcImdcIiksbFtuXShkKSkpO2M9Yy5yZXBsYWNlKC9cXDBcXDAvZyxcIiVcIik7bj1WYyhjKTtpZihuLmxlbmd0aD5iKXJldHVybiAwO1djKG4sYSk7cmV0dXJuIG4ubGVuZ3RoLTF9TS5XZSgpO2Zvcih2YXIgWWM9QXJyYXkoMjU2KSxaYz0wOzI1Nj5aYzsrK1pjKVljW1pjXT1TdHJpbmcuZnJvbUNoYXJDb2RlKFpjKTtQYj1ZYztUYj1DLkJpbmRpbmdFcnJvcj1jbGFzcyBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKGEpe3N1cGVyKGEpO3RoaXMubmFtZT1cIkJpbmRpbmdFcnJvclwifX07Qy5JbnRlcm5hbEVycm9yPWNsYXNzIGV4dGVuZHMgRXJyb3J7Y29uc3RydWN0b3IoYSl7c3VwZXIoYSk7dGhpcy5uYW1lPVwiSW50ZXJuYWxFcnJvclwifX07XG5PYmplY3QuYXNzaWduKFdiLnByb3RvdHlwZSx7Z2V0KGEpe3JldHVybiB0aGlzLktlW2FdfSxoYXMoYSl7cmV0dXJuIHZvaWQgMCE9PXRoaXMuS2VbYV19LFNlKGEpe3ZhciBiPXRoaXMuWWUucG9wKCl8fHRoaXMuS2UubGVuZ3RoO3RoaXMuS2VbYl09YTtyZXR1cm4gYn0sVGUoYSl7dGhpcy5LZVthXT12b2lkIDA7dGhpcy5ZZS5wdXNoKGEpfX0pO1QuS2UucHVzaCh7dmFsdWU6dm9pZCAwfSx7dmFsdWU6bnVsbH0se3ZhbHVlOiEwfSx7dmFsdWU6ITF9KTtULkhlPVQuS2UubGVuZ3RoO0MuY291bnRfZW12YWxfaGFuZGxlcz0oKT0+e2Zvcih2YXIgYT0wLGI9VC5IZTtiPFQuS2UubGVuZ3RoOysrYil2b2lkIDAhPT1ULktlW2JdJiYrK2E7cmV0dXJuIGF9O1xudmFyICRjPVtjYixkYix3Yix5Yix6YixEYixFYixGYixHYixIYixJYixKYixLYixMYixNYixOYixGYyxHYyxNYyxOYyxPYyxQYyxRYyxTY10scWc9e3U6ZnVuY3Rpb24oYSl7YT1uZXcgcmIoYT4+PjApO2EuZ2YoKXx8KGEuYmYoITApLHFiLS0pO2EuY2YoITEpO3BiLnB1c2goYSk7YWQoYS5SZSk7cmV0dXJuIGEuaGYoKX0sTjooKT0+e1koMCwwKTt2YXIgYT1wYi5wb3AoKTtiZChhLlJlKTtRPTB9LGI6ZnVuY3Rpb24oKXtyZXR1cm4gdmIoW10pfSxuOmZ1bmN0aW9uKGEpe3JldHVybiB2YihbYT4+PjBdKX0seTpmdW5jdGlvbihhLGIpe3JldHVybiB2YihbYT4+PjAsYj4+PjBdKX0scTpmdW5jdGlvbihhLGIsYyl7cmV0dXJuIHZiKFthPj4+MCxiPj4+MCxjPj4+MF0pfSx6YjooKT0+e3ZhciBhPXBiLnBvcCgpO2F8fEFhKFwibm8gZXhjZXB0aW9uIHRvIHRocm93XCIpO3ZhciBiPWEuUmU7YS5uZigpfHwocGIucHVzaChhKSxhLmNmKCEwKSxhLmJmKCExKSxxYisrKTtRPWI7dGhyb3cgUTtcbn0sdDpmdW5jdGlvbihhLGIsYyl7YT4+Pj0wOyhuZXcgcmIoYSkpLldlKGI+Pj4wLGM+Pj4wKTtRPWE7cWIrKzt0aHJvdyBRO30sVGE6KCk9PnFiLFdjOmZ1bmN0aW9uKGEpe2NkKGE+Pj4wLCFyYSwxLCFxYSwxMzEwNzIsITEpO00uZGYoKX0sVWI6ZnVuY3Rpb24oYSl7YT4+Pj0wO0c/cG9zdE1lc3NhZ2Uoe2NtZDpcImNsZWFudXBUaHJlYWRcIix0aHJlYWQ6YX0pOigoYT1NLkllW2FdKXx8QWEoKSxNLiRlKGEpKX0sTWM6eGIsaDpmdW5jdGlvbihhKXtRfHwoUT1hPj4+MCk7dGhyb3cgUTt9LEFiOnliLGFkOnpiLEhjOkRiLEpjOkViLEFjOkZiLF9jOkdiLFRjOkhiLFpjOkliLFdiOkpiLEljOktiLEZjOkxiLCRjOk1iLEdjOk5iLFpiOmZ1bmN0aW9uKGEsYixjLGQsZSl7YT4+Pj0wO2I+Pj49MDtjPj4+PTA7Yj1SKGIpO3ZhciBmPS0xIT1iLmluZGV4T2YoXCJ1XCIpO2YmJihlPSgxbjw8NjRuKS0xbik7UyhhLHtuYW1lOmIsZnJvbVdpcmVUeXBlOmc9PmcsdG9XaXJlVHlwZTpmdW5jdGlvbihnLFxuaCl7aWYoXCJiaWdpbnRcIiE9dHlwZW9mIGgmJlwibnVtYmVyXCIhPXR5cGVvZiBoKXRocm93IG5ldyBUeXBlRXJyb3IoYENhbm5vdCBjb252ZXJ0IFwiJHtPYihoKX1cIiB0byAke3RoaXMubmFtZX1gKTtpZihoPGR8fGg+ZSl0aHJvdyBuZXcgVHlwZUVycm9yKGBQYXNzaW5nIGEgbnVtYmVyIFwiJHtPYihoKX1cIiBmcm9tIEpTIHNpZGUgdG8gQy9DKysgc2lkZSB0byBhbiBhcmd1bWVudCBvZiB0eXBlIFwiJHtifVwiLCB3aGljaCBpcyBvdXRzaWRlIHRoZSB2YWxpZCByYW5nZSBbJHtkfSwgJHtlfV0hYCk7cmV0dXJuIGh9LGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6VmIoYixjLCFmKSxRZTpudWxsfSl9LGdkOmZ1bmN0aW9uKGEsYixjLGQpe2E+Pj49MDtiPVIoYj4+PjApO1MoYSx7bmFtZTpiLGZyb21XaXJlVHlwZTpmdW5jdGlvbihlKXtyZXR1cm4hIWV9LHRvV2lyZVR5cGU6ZnVuY3Rpb24oZSxmKXtyZXR1cm4gZj9jOmR9LGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKHgoKVtlPj4+XG4wXSl9LFFlOm51bGx9KX0sZWQ6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj1SKGI+Pj4wKTtTKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6Yz0+e3ZhciBkPVUoYyk7WGIoYyk7cmV0dXJuIGR9LHRvV2lyZVR5cGU6KGMsZCk9PlYoZCksYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpZYixRZTpudWxsfSl9LFliOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7Yz4+Pj0wO2I9UihiPj4+MCk7UyhhLHtuYW1lOmIsZnJvbVdpcmVUeXBlOmQ9PmQsdG9XaXJlVHlwZTooZCxlKT0+ZSxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOlpiKGIsYyksUWU6bnVsbH0pfSx3YTpmdW5jdGlvbihhLGIsYyxkLGUpe2E+Pj49MDtjPj4+PTA7Yj1SKGI+Pj4wKTstMT09PWUmJihlPTQyOTQ5NjcyOTUpO2U9aD0+aDtpZigwPT09ZCl7dmFyIGY9MzItOCpjO2U9aD0+aDw8Zj4+PmZ9dmFyIGc9Yi5pbmNsdWRlcyhcInVuc2lnbmVkXCIpP2Z1bmN0aW9uKGgsayl7cmV0dXJuIGs+Pj5cbjB9OmZ1bmN0aW9uKGgsayl7cmV0dXJuIGt9O1MoYSx7bmFtZTpiLGZyb21XaXJlVHlwZTplLHRvV2lyZVR5cGU6ZyxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOlZiKGIsYywwIT09ZCksUWU6bnVsbH0pfSxfOmZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGYpe3ZhciBnPUIoKVtmPj4+Mj4+PjBdO2Y9QigpW2YrND4+PjI+Pj4wXTtyZXR1cm4gbmV3IGUocCgpLmJ1ZmZlcixmLGcpfWE+Pj49MDt2YXIgZT1bSW50OEFycmF5LFVpbnQ4QXJyYXksSW50MTZBcnJheSxVaW50MTZBcnJheSxJbnQzMkFycmF5LFVpbnQzMkFycmF5LEZsb2F0MzJBcnJheSxGbG9hdDY0QXJyYXksQmlnSW50NjRBcnJheSxCaWdVaW50NjRBcnJheV1bYl07Yz1SKGM+Pj4wKTtTKGEse25hbWU6Yyxmcm9tV2lyZVR5cGU6ZCxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOmR9LHtwZjohMH0pfSxfYjpmdW5jdGlvbihhLGIpe2E+Pj49MDtiPVIoYj4+PjApO3ZhciBjPVxuXCJzdGQ6OnN0cmluZ1wiPT09YjtTKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6ZnVuY3Rpb24oZCl7dmFyIGU9QigpW2Q+Pj4yPj4+MF0sZj1kKzQ7aWYoYylmb3IodmFyIGc9ZixoPTA7aDw9ZTsrK2gpe3ZhciBrPWYraDtpZihoPT1lfHwwPT14KClbaz4+PjBdKXtnPWJiKGcsay1nKTtpZih2b2lkIDA9PT1sKXZhciBsPWc7ZWxzZSBsKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApLGwrPWc7Zz1rKzF9fWVsc2V7bD1BcnJheShlKTtmb3IoaD0wO2g8ZTsrK2gpbFtoXT1TdHJpbmcuZnJvbUNoYXJDb2RlKHgoKVtmK2g+Pj4wXSk7bD1sLmpvaW4oXCJcIil9WChkKTtyZXR1cm4gbH0sdG9XaXJlVHlwZTpmdW5jdGlvbihkLGUpe2UgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciYmKGU9bmV3IFVpbnQ4QXJyYXkoZSkpO3ZhciBmPVwic3RyaW5nXCI9PXR5cGVvZiBlO2lmKCEoZnx8ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXl8fGUgaW5zdGFuY2VvZiBVaW50OENsYW1wZWRBcnJheXx8ZSBpbnN0YW5jZW9mIEludDhBcnJheSkpdGhyb3cgbmV3IFRiKFwiQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBzdGQ6OnN0cmluZ1wiKTtcbnZhciBnPWMmJmY/QWIoZSk6ZS5sZW5ndGg7dmFyIGg9SGMoNCtnKzEpLGs9aCs0O0IoKVtoPj4+Mj4+PjBdPWc7aWYoYyYmZilDYihlLGssZysxKTtlbHNlIGlmKGYpZm9yKGY9MDtmPGc7KytmKXt2YXIgbD1lLmNoYXJDb2RlQXQoZik7aWYoMjU1PGwpdGhyb3cgWChrKSxuZXcgVGIoXCJTdHJpbmcgaGFzIFVURi0xNiBjb2RlIHVuaXRzIHRoYXQgZG8gbm90IGZpdCBpbiA4IGJpdHNcIik7eCgpW2srZj4+PjBdPWx9ZWxzZSBmb3IoZj0wO2Y8ZzsrK2YpeCgpW2srZj4+PjBdPWVbZl07bnVsbCE9PWQmJmQucHVzaChYLGgpO3JldHVybiBofSxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOiRiLFFlKGQpe1goZCl9fSl9LENiOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7Yj4+Pj0wO2M+Pj49MDtjPVIoYyk7aWYoMj09PWIpe3ZhciBkPWJjO3ZhciBlPWNjO3ZhciBmPWRjO3ZhciBnPSgpPT5lYSgpO3ZhciBoPTF9ZWxzZSA0PT09YiYmKGQ9ZWMsZT1mYyxmPWdjLGc9KCk9PlxuQigpLGg9Mik7UyhhLHtuYW1lOmMsZnJvbVdpcmVUeXBlOms9Pntmb3IodmFyIGw9QigpW2s+Pj4yPj4+MF0sbj1nKCksdSx2PWsrNCxtPTA7bTw9bDsrK20pe3ZhciB3PWsrNCttKmI7aWYobT09bHx8MD09blt3Pj4+aF0pdj1kKHYsdy12KSx2b2lkIDA9PT11P3U9djoodSs9U3RyaW5nLmZyb21DaGFyQ29kZSgwKSx1Kz12KSx2PXcrYn1YKGspO3JldHVybiB1fSx0b1dpcmVUeXBlOihrLGwpPT57aWYoXCJzdHJpbmdcIiE9dHlwZW9mIGwpdGhyb3cgbmV3IFRiKGBDYW5ub3QgcGFzcyBub24tc3RyaW5nIHRvIEMrKyBzdHJpbmcgdHlwZSAke2N9YCk7dmFyIG49ZihsKSx1PUhjKDQrbitiKTtCKClbdT4+PjJdPW4+Pmg7ZShsLHUrNCxuK2IpO251bGwhPT1rJiZrLnB1c2goWCx1KTtyZXR1cm4gdX0sYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpZYixRZShrKXtYKGspfX0pfSxrZDpmdW5jdGlvbihhLGIpe2E+Pj49MDtiPVIoYj4+PjApO1MoYSx7cWY6ITAsbmFtZTpiLFxuYXJnUGFja0FkdmFuY2U6MCxmcm9tV2lyZVR5cGU6KCk9Pnt9LHRvV2lyZVR5cGU6KCk9Pnt9fSl9LGRkOigpPT4hMCxEYzpmdW5jdGlvbihhLGIpe2E+Pj49MDthPT1iPj4+MD9zZXRUaW1lb3V0KCgpPT5qYigpKTpHP3Bvc3RNZXNzYWdlKHt0YXJnZXRUaHJlYWQ6YSxjbWQ6XCJjaGVja01haWxib3hcIn0pOihhPU0uSWVbYV0pJiZhLnBvc3RNZXNzYWdlKHtjbWQ6XCJjaGVja01haWxib3hcIn0pfSxOYzpmdW5jdGlvbihhLGIsYyxkKXtiPj4+PTA7Yy89MjtuYy5sZW5ndGg9YztkPWQ+Pj4wPj4+Mztmb3IodmFyIGU9MDtlPGM7ZSsrKW5jW2VdPUZhW2QrMiplXT9GYVtkKzIqZSsxXTpqYSgpW2QrMiplKzE+Pj4wXTthPSRjW2FdO00ubWY9YjtiPWEuYXBwbHkobnVsbCxuYyk7TS5tZj0wO3JldHVybiBifSxWYzppYyxjZDpmdW5jdGlvbihhKXtGJiZNLkllW2E+Pj4wXS5yZWYoKX0sd2Q6ZnVuY3Rpb24oYSxiLGMpe2I+Pj49MDtjPj4+PTA7YT1VKGE+Pj4wKTtiPXBjKGIsXCJlbXZhbDo6YXNcIik7XG52YXIgZD1bXSxlPVYoZCk7QigpW2M+Pj4yPj4+MF09ZTtyZXR1cm4gYi50b1dpcmVUeXBlKGQsYSl9LGthOmZ1bmN0aW9uKGEsYixjLGQsZSl7Yz4+Pj0wO2Q+Pj49MDtlPj4+PTA7YT1zY1thPj4+MF07Yj1VKGI+Pj4wKTtjPXJjKGMpO3ZhciBmPVtdO0IoKVtkPj4+Mj4+PjBdPVYoZik7cmV0dXJuIGEoYixjLGYsZSl9LEVkOmZ1bmN0aW9uKGEsYixjLGQpe2M+Pj49MDtkPj4+PTA7YT1zY1thPj4+MF07Yj1VKGI+Pj4wKTtjPXJjKGMpO2EoYixjLG51bGwsZCl9LHpjOlhiLHhkOmZ1bmN0aW9uKGEsYil7Yj4+Pj0wO2E9VShhPj4+MCk7Yj1VKGIpO3JldHVybiBhPT1ifSxJZDpmdW5jdGlvbihhKXthPj4+PTA7aWYoMD09PWEpcmV0dXJuIFYodGMoKSk7YT1yYyhhKTtyZXR1cm4gVih0YygpW2FdKX0sbGE6ZnVuY3Rpb24oYSxiKXt2YXIgYz12YyhhLGI+Pj4wKSxkPWNbMF07Yj1kLm5hbWUrXCJfJFwiK2Muc2xpY2UoMSkubWFwKGZ1bmN0aW9uKG4pe3JldHVybiBuLm5hbWV9KS5qb2luKFwiX1wiKStcblwiJFwiO3ZhciBlPXhjW2JdO2lmKHZvaWQgMCE9PWUpcmV0dXJuIGU7ZT1bXCJyZXRUeXBlXCJdO2Zvcih2YXIgZj1bZF0sZz1cIlwiLGg9MDtoPGEtMTsrK2gpZys9KDAhPT1oP1wiLCBcIjpcIlwiKStcImFyZ1wiK2gsZS5wdXNoKFwiYXJnVHlwZVwiK2gpLGYucHVzaChjWzEraF0pO3ZhciBrPVwicmV0dXJuIGZ1bmN0aW9uIFwiK3djKFwibWV0aG9kQ2FsbGVyX1wiK2IpK1wiKGhhbmRsZSwgbmFtZSwgZGVzdHJ1Y3RvcnMsIGFyZ3MpIHtcXG5cIixsPTA7Zm9yKGg9MDtoPGEtMTsrK2gpays9XCIgICAgdmFyIGFyZ1wiK2grXCIgPSBhcmdUeXBlXCIraCtcIi5yZWFkVmFsdWVGcm9tUG9pbnRlcihhcmdzXCIrKGw/XCIrXCIrbDpcIlwiKStcIik7XFxuXCIsbCs9Y1toKzFdLmFyZ1BhY2tBZHZhbmNlO2srPVwiICAgIHZhciBydiA9IGhhbmRsZVtuYW1lXShcIitnK1wiKTtcXG5cIjtmb3IoaD0wO2g8YS0xOysraCljW2grMV0uZGVsZXRlT2JqZWN0JiYoays9XCIgICAgYXJnVHlwZVwiK2grXCIuZGVsZXRlT2JqZWN0KGFyZ1wiK2grXCIpO1xcblwiKTtkLnFmfHxcbihrKz1cIiAgICByZXR1cm4gcmV0VHlwZS50b1dpcmVUeXBlKGRlc3RydWN0b3JzLCBydik7XFxuXCIpO2UucHVzaChrK1wifTtcXG5cIik7YT16YyhlKS5hcHBseShudWxsLGYpO2U9dWMoYSk7cmV0dXJuIHhjW2JdPWV9LEdkOmZ1bmN0aW9uKGEsYil7Yj4+Pj0wO2E9VShhPj4+MCk7Yj1VKGIpO3JldHVybiBWKGFbYl0pfSxROmZ1bmN0aW9uKGEpe2E+Pj49MDs0PGEmJihULmdldChhKS5aZSs9MSl9LEFkOmZ1bmN0aW9uKGEsYixjLGQpe2M+Pj49MDtkPj4+PTA7YT1VKGE+Pj4wKTt2YXIgZT1CY1tiXTtlfHwoZT1BYyhiKSxCY1tiXT1lKTtyZXR1cm4gZShhLGMsZCl9LHFkOmZ1bmN0aW9uKCl7cmV0dXJuIFYoW10pfSxzZDpmdW5jdGlvbihhKXthPVUoYT4+PjApO2Zvcih2YXIgYj1BcnJheShhLmxlbmd0aCksYz0wO2M8YS5sZW5ndGg7YysrKWJbY109YVtjXTtyZXR1cm4gVihiKX0sWTpmdW5jdGlvbihhKXtyZXR1cm4gVihyYyhhPj4+MCkpfSxTYTpmdW5jdGlvbigpe3JldHVybiBWKHt9KX0sXG5CZDpmdW5jdGlvbihhKXthPj4+PTA7Zm9yKHZhciBiPVUoYSk7Yi5sZW5ndGg7KXt2YXIgYz1iLnBvcCgpO2IucG9wKCkoYyl9WGIoYSl9LHpkOmZ1bmN0aW9uKGEsYixjKXtiPj4+PTA7Yz4+Pj0wO2E9VShhPj4+MCk7Yj1VKGIpO2M9VShjKTthW2JdPWN9LGdiOmZ1bmN0aW9uKGEsYil7Yj4+Pj0wO2E9cGMoYT4+PjAsXCJfZW12YWxfdGFrZV92YWx1ZVwiKTthPWEucmVhZFZhbHVlRnJvbVBvaW50ZXIoYik7cmV0dXJuIFYoYSl9LFFjOmZ1bmN0aW9uKGEsYil7YT0tOTAwNzE5OTI1NDc0MDk5Mj5hfHw5MDA3MTk5MjU0NzQwOTkyPGE/TmFOOk51bWJlcihhKTtiPj4+PTA7YT1uZXcgRGF0ZSgxRTMqYSk7QSgpW2I+Pj4yPj4+MF09YS5nZXRVVENTZWNvbmRzKCk7QSgpW2IrND4+PjI+Pj4wXT1hLmdldFVUQ01pbnV0ZXMoKTtBKClbYis4Pj4+Mj4+PjBdPWEuZ2V0VVRDSG91cnMoKTtBKClbYisxMj4+PjI+Pj4wXT1hLmdldFVUQ0RhdGUoKTtBKClbYisxNj4+PjI+Pj4wXT1hLmdldFVUQ01vbnRoKCk7XG5BKClbYisyMD4+PjI+Pj4wXT1hLmdldFVUQ0Z1bGxZZWFyKCktMTkwMDtBKClbYisyND4+PjI+Pj4wXT1hLmdldFVUQ0RheSgpO2E9KGEuZ2V0VGltZSgpLURhdGUuVVRDKGEuZ2V0VVRDRnVsbFllYXIoKSwwLDEsMCwwLDAsMCkpLzg2NEU1fDA7QSgpW2IrMjg+Pj4yPj4+MF09YX0sUmM6ZnVuY3Rpb24oYSxiKXthPS05MDA3MTk5MjU0NzQwOTkyPmF8fDkwMDcxOTkyNTQ3NDA5OTI8YT9OYU46TnVtYmVyKGEpO2I+Pj49MDthPW5ldyBEYXRlKDFFMyphKTtBKClbYj4+PjI+Pj4wXT1hLmdldFNlY29uZHMoKTtBKClbYis0Pj4+Mj4+PjBdPWEuZ2V0TWludXRlcygpO0EoKVtiKzg+Pj4yPj4+MF09YS5nZXRIb3VycygpO0EoKVtiKzEyPj4+Mj4+PjBdPWEuZ2V0RGF0ZSgpO0EoKVtiKzE2Pj4+Mj4+PjBdPWEuZ2V0TW9udGgoKTtBKClbYisyMD4+PjI+Pj4wXT1hLmdldEZ1bGxZZWFyKCktMTkwMDtBKClbYisyND4+PjI+Pj4wXT1hLmdldERheSgpO3ZhciBjPShDYyhhLmdldEZ1bGxZZWFyKCkpP1xuRGM6RWMpW2EuZ2V0TW9udGgoKV0rYS5nZXREYXRlKCktMXwwO0EoKVtiKzI4Pj4+Mj4+PjBdPWM7QSgpW2IrMzY+Pj4yPj4+MF09LSg2MCphLmdldFRpbWV6b25lT2Zmc2V0KCkpO2M9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBkPShuZXcgRGF0ZShhLmdldEZ1bGxZZWFyKCksMCwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKTthPShjIT1kJiZhLmdldFRpbWV6b25lT2Zmc2V0KCk9PU1hdGgubWluKGQsYykpfDA7QSgpW2IrMzI+Pj4yPj4+MF09YX0sU2M6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW5ldyBEYXRlKEEoKVthKzIwPj4+Mj4+PjBdKzE5MDAsQSgpW2ErMTY+Pj4yPj4+MF0sQSgpW2ErMTI+Pj4yPj4+MF0sQSgpW2ErOD4+PjI+Pj4wXSxBKClbYSs0Pj4+Mj4+PjBdLEEoKVthPj4+Mj4+PjBdLDApLGM9QSgpW2ErMzI+Pj4yPj4+MF0sZD1iLmdldFRpbWV6b25lT2Zmc2V0KCksZT0obmV3IERhdGUoYi5nZXRGdWxsWWVhcigpLFxuNiwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxmPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksMCwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxnPU1hdGgubWluKGYsZSk7MD5jP0EoKVthKzMyPj4+Mj4+PjBdPU51bWJlcihlIT1mJiZnPT1kKTowPGMhPShnPT1kKSYmKGU9TWF0aC5tYXgoZixlKSxiLnNldFRpbWUoYi5nZXRUaW1lKCkrNkU0KigoMDxjP2c6ZSktZCkpKTtBKClbYSsyND4+PjI+Pj4wXT1iLmdldERheSgpO2M9KENjKGIuZ2V0RnVsbFllYXIoKSk/RGM6RWMpW2IuZ2V0TW9udGgoKV0rYi5nZXREYXRlKCktMXwwO0EoKVthKzI4Pj4+Mj4+PjBdPWM7QSgpW2E+Pj4yPj4+MF09Yi5nZXRTZWNvbmRzKCk7QSgpW2ErND4+PjI+Pj4wXT1iLmdldE1pbnV0ZXMoKTtBKClbYSs4Pj4+Mj4+PjBdPWIuZ2V0SG91cnMoKTtBKClbYSsxMj4+PjI+Pj4wXT1iLmdldERhdGUoKTtBKClbYSsxNj4+PjI+Pj4wXT1iLmdldE1vbnRoKCk7QSgpW2ErMjA+Pj4yPj4+MF09Yi5nZXRZZWFyKCk7XG5yZXR1cm4gQmlnSW50KGIuZ2V0VGltZSgpLzFFMyl9LE9jOkZjLFBjOkdjLENjOmZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGwpe3JldHVybihsPWwudG9UaW1lU3RyaW5nKCkubWF0Y2goL1xcKChbQS1aYS16IF0rKVxcKSQvKSk/bFsxXTpcIkdNVFwifWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO3ZhciBlPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSxmPW5ldyBEYXRlKGUsMCwxKSxnPW5ldyBEYXRlKGUsNiwxKTtlPWYuZ2V0VGltZXpvbmVPZmZzZXQoKTt2YXIgaD1nLmdldFRpbWV6b25lT2Zmc2V0KCksaz1NYXRoLm1heChlLGgpO0IoKVthPj4+Mj4+PjBdPTYwKms7QSgpW2I+Pj4yPj4+MF09TnVtYmVyKGUhPWgpO2E9ZChmKTtiPWQoZyk7YT1JYyhhKTtiPUljKGIpO2g8ZT8oQigpW2M+Pj4yPj4+MF09YSxCKClbYys0Pj4+Mj4+PjBdPWIpOihCKClbYz4+PjI+Pj4wXT1iLEIoKVtjKzQ+Pj4yPj4+MF09YSl9LGFhOigpPT57QWEoXCJcIil9LFZiOigpPT57fSxYYjooKT0+RGF0ZS5ub3coKSxcbmJkOigpPT57TGErPTE7dGhyb3dcInVud2luZFwiO30sRWM6ZnVuY3Rpb24oKXtyZXR1cm4gNDI5NDkwMTc2MH0sdmE6KCk9PnBlcmZvcm1hbmNlLnRpbWVPcmlnaW4rcGVyZm9ybWFuY2Uubm93KCksaWI6KCk9PkY/cmVxdWlyZShcIm9zXCIpLmNwdXMoKS5sZW5ndGg6bmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3ksQmM6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPXgoKS5sZW5ndGg7aWYoYTw9Ynx8NDI5NDkwMTc2MDxhKXJldHVybiExO2Zvcih2YXIgYz0xOzQ+PWM7Yyo9Mil7dmFyIGQ9YiooMSsuMi9jKTtkPU1hdGgubWluKGQsYSsxMDA2NjMyOTYpO3ZhciBlPU1hdGg7ZD1NYXRoLm1heChhLGQpO2E6e2U9KGUubWluLmNhbGwoZSw0Mjk0OTAxNzYwLGQrKDY1NTM2LWQlNjU1MzYpJTY1NTM2KS1xLmJ1ZmZlci5ieXRlTGVuZ3RoKzY1NTM1KS82NTUzNjt0cnl7cS5ncm93KGUpO3QoKTt2YXIgZj0xO2JyZWFrIGF9Y2F0Y2goZyl7fWY9dm9pZCAwfWlmKGYpcmV0dXJuITB9cmV0dXJuITF9LFxuWGM6TWMsWWM6TmMsTGM6ZWIsQmI6T2MsVGI6UGMsVWM6UWMsU2I6U2MsaGI6ZGQsZmQ6ZWQsc2E6ZmQsRzpnZCxwYTpoZCxmYTpqZCxoZDprZCxtZDpsZCxPOm1kLEE6bmQsYzpvZCxkYzpwZCx0YTpxZCxmOnJkLEViOnNkLGk6dGQsWDp1ZCxqOnZkLGlkOndkLGs6eGQscjp5ZCxzOnpkLHA6QWQsUmE6QmQsV2E6Q2QsaGE6RGQsUGI6RWQsX2E6RmQsSWI6R2QsbWI6SGQsaWM6SWQsd2M6SmQsZmM6S2QsZ2M6TGQsJGI6TWQsamE6TmQseWI6T2QseWE6UGQsRGI6UWQsZGE6UmQsaGM6U2QsUGE6VGQsRjpVZCxMOlZkLEdiOldkLHJkOlhkLG9hOllkLE06WmQsJDokZCxWOmFlLHo6YmUsRmI6Y2UsZWM6ZGUsQzplZSxIYjpmZSxwZDpnZSxRYTpoZSxjYjppZSxqYzpqZSxhYzprZSxNYjpsZSxQOm1lLEg6bmUsRDpvZSxrYjpwZSxTOnFlLGU6cmUsWWE6c2UsbDp0ZSx4YTp1ZSxYYTp2ZSx2Yjp3ZSxnOnhlLHhjOnllLGNhOnplLGRiOkFlLHphOkJlLGxiOkNlLGViOkRlLGQ6RWUsdWM6RmUsXG50ZDpHZSxvOkhlLHNjOkllLG06SmUsdmM6S2UscmM6TGUsdmQ6TWUsdzpOZSxOYTpPZSxzYjpQZSxNYTpRZSxLYjpSZSxCOlNlLEU6VGUsVzpVZSxWYTpWZSxvYzpXZSxDZDpYZSx0YjpZZSx1YTpaZSxpYTokZSxSOmFmLCRhOmJmLEhhOmNmLEZkOmRmLGpiOmVmLERhOmZmLGxjOmdmLENhOmhmLEVhOmpmLGpkOmtmLERkOmxmLG5hOm1mLHVkOm5mLElhOm9mLEdhOnBmLHFjOnFmLEZhOnJmLEphOnNmLG9iOnRmLGdhOnVmLEFhOnZmLGtjOndmLHBjOnhmLEpiOnlmLEJhOnpmLG1hOkFmLFJiOkJmLG9kOkNmLFU6RGYsd2I6RWYsYmI6RmYsVWE6R2YsZmI6SGYsSzpJZixUOkpmLHhiOktmLG5kOkxmLGJhOk1mLG5iOk5mLHJhOk9mLG5jOlBmLGJjOlFmLEhkOlJmLHg6U2YsYWI6VGYseWQ6VWYsTmI6VmYsbWM6V2YsSmQ6WGYsT2I6WWYsTGI6WmYsWmE6JGYseWM6YWcsUWI6YmcsS2E6Y2csY2M6ZGcsWjplZyx0YzpmZyxKOmdnLGxkOmhnLHViOmlnLHFhOmpnLEk6a2cscWI6bGcsTGE6bWcsXG5PYTpuZyxwYjpvZyxyYjpwZyx2OmZ1bmN0aW9uKGEpe3JldHVybiBhPj4+MH0sYTpxfHxDLndhc21NZW1vcnksS2M6WGMsZWE6ZnVuY3Rpb24oYSxiLGMsZCl7cmV0dXJuIFhjKGE+Pj4wLGI+Pj4wLGM+Pj4wLGQ+Pj4wKX19LFo9ZnVuY3Rpb24oKXt2YXIgYT17YTpxZ307TmErKztXYShhLGZ1bmN0aW9uKGIpe3ZhciBjPWIubW9kdWxlO1o9Yi5pbnN0YW5jZS5leHBvcnRzO1o9cmcoKTtNLmVmLnB1c2goWi5uZSk7bmI9Wi5xZTtKYS51bnNoaWZ0KFouS2QpO0JhPWM7UWEoKX0pLmNhdGNoKG1hKTtyZXR1cm57fX0oKTtDLl9PcnRJbml0PShhLGIpPT4oQy5fT3J0SW5pdD1aLkxkKShhLGIpO0MuX09ydEdldExhc3RFcnJvcj0oYSxiKT0+KEMuX09ydEdldExhc3RFcnJvcj1aLk1kKShhLGIpO0MuX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPShhLGIsYyxkLGUsZixnLGgsayxsKT0+KEMuX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPVouTmQpKGEsYixjLGQsZSxmLGcsaCxrLGwpO1xuQy5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9KGEsYik9PihDLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj1aLk9kKShhLGIpO0MuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT0oYSxiLGMpPT4oQy5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPVouUGQpKGEsYixjKTtDLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9KGEsYixjKT0+KEMuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT1aLlFkKShhLGIsYyk7Qy5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPWE9PihDLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9Wi5SZCkoYSk7Qy5fT3J0Q3JlYXRlU2Vzc2lvbj0oYSxiLGMpPT4oQy5fT3J0Q3JlYXRlU2Vzc2lvbj1aLlNkKShhLGIsYyk7Qy5fT3J0UmVsZWFzZVNlc3Npb249YT0+KEMuX09ydFJlbGVhc2VTZXNzaW9uPVouVGQpKGEpO1xuQy5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD0oYSxiLGMpPT4oQy5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD1aLlVkKShhLGIsYyk7Qy5fT3J0R2V0SW5wdXROYW1lPShhLGIpPT4oQy5fT3J0R2V0SW5wdXROYW1lPVouVmQpKGEsYik7Qy5fT3J0R2V0T3V0cHV0TmFtZT0oYSxiKT0+KEMuX09ydEdldE91dHB1dE5hbWU9Wi5XZCkoYSxiKTtDLl9PcnRGcmVlPWE9PihDLl9PcnRGcmVlPVouWGQpKGEpO0MuX09ydENyZWF0ZVRlbnNvcj0oYSxiLGMsZCxlLGYpPT4oQy5fT3J0Q3JlYXRlVGVuc29yPVouWWQpKGEsYixjLGQsZSxmKTtDLl9PcnRHZXRUZW5zb3JEYXRhPShhLGIsYyxkLGUpPT4oQy5fT3J0R2V0VGVuc29yRGF0YT1aLlpkKShhLGIsYyxkLGUpO0MuX09ydFJlbGVhc2VUZW5zb3I9YT0+KEMuX09ydFJlbGVhc2VUZW5zb3I9Wi5fZCkoYSk7Qy5fT3J0Q3JlYXRlUnVuT3B0aW9ucz0oYSxiLGMsZCk9PihDLl9PcnRDcmVhdGVSdW5PcHRpb25zPVouJGQpKGEsYixjLGQpO1xuQy5fT3J0QWRkUnVuQ29uZmlnRW50cnk9KGEsYixjKT0+KEMuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PVouYWUpKGEsYixjKTtDLl9PcnRSZWxlYXNlUnVuT3B0aW9ucz1hPT4oQy5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9Wi5iZSkoYSk7Qy5fT3J0Q3JlYXRlQmluZGluZz1hPT4oQy5fT3J0Q3JlYXRlQmluZGluZz1aLmNlKShhKTtDLl9PcnRCaW5kSW5wdXQ9KGEsYixjKT0+KEMuX09ydEJpbmRJbnB1dD1aLmRlKShhLGIsYyk7Qy5fT3J0QmluZE91dHB1dD0oYSxiLGMsZCk9PihDLl9PcnRCaW5kT3V0cHV0PVouZWUpKGEsYixjLGQpO0MuX09ydENsZWFyQm91bmRPdXRwdXRzPWE9PihDLl9PcnRDbGVhckJvdW5kT3V0cHV0cz1aLmZlKShhKTtDLl9PcnRSZWxlYXNlQmluZGluZz1hPT4oQy5fT3J0UmVsZWFzZUJpbmRpbmc9Wi5nZSkoYSk7Qy5fT3J0UnVuV2l0aEJpbmRpbmc9KGEsYixjLGQsZSk9PihDLl9PcnRSdW5XaXRoQmluZGluZz1aLmhlKShhLGIsYyxkLGUpO1xuQy5fT3J0UnVuPShhLGIsYyxkLGUsZixnLGgpPT4oQy5fT3J0UnVuPVouaWUpKGEsYixjLGQsZSxmLGcsaCk7Qy5fT3J0RW5kUHJvZmlsaW5nPWE9PihDLl9PcnRFbmRQcm9maWxpbmc9Wi5qZSkoYSk7dmFyIGliPUMuX3B0aHJlYWRfc2VsZj0oKT0+KGliPUMuX3B0aHJlYWRfc2VsZj1aLmtlKSgpLEhjPUMuX21hbGxvYz1hPT4oSGM9Qy5fbWFsbG9jPVoubGUpKGEpLFg9Qy5fZnJlZT1hPT4oWD1DLl9mcmVlPVoubWUpKGEpO0MuX19lbXNjcmlwdGVuX3Rsc19pbml0PSgpPT4oQy5fX2Vtc2NyaXB0ZW5fdGxzX2luaXQ9Wi5uZSkoKTt2YXIgb2M9YT0+KG9jPVoub2UpKGEpO0MuX19lbWJpbmRfaW5pdGlhbGl6ZV9iaW5kaW5ncz0oKT0+KEMuX19lbWJpbmRfaW5pdGlhbGl6ZV9iaW5kaW5ncz1aLnBlKSgpO3ZhciBjZD1DLl9fZW1zY3JpcHRlbl90aHJlYWRfaW5pdD0oYSxiLGMsZCxlLGYpPT4oY2Q9Qy5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXQ9Wi5yZSkoYSxiLGMsZCxlLGYpO1xuQy5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWQ9KCk9PihDLl9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZD1aLnNlKSgpO3ZhciBtYz0oYSxiLGMsZCk9PihtYz1aLnRlKShhLGIsYyxkKSxoYj1hPT4oaGI9Wi51ZSkoYSksb2I9Qy5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXQ9YT0+KG9iPUMuX19lbXNjcmlwdGVuX3RocmVhZF9leGl0PVoudmUpKGEpLGpjPUMuX19lbXNjcmlwdGVuX2NoZWNrX21haWxib3g9KCk9PihqYz1DLl9fZW1zY3JpcHRlbl9jaGVja19tYWlsYm94PVoud2UpKCksWT0oYSxiKT0+KFk9Wi54ZSkoYSxiKSx0Yj1hPT4odGI9Wi55ZSkoYSksbGI9KGEsYik9PihsYj1aLnplKShhLGIpLFc9KCk9PihXPVouQWUpKCksTz1hPT4oTz1aLkJlKShhKSxsYz1hPT4obGM9Wi5DZSkoYSksYmQ9YT0+KGJkPVouRGUpKGEpLGFkPWE9PihhZD1aLkVlKShhKSx1Yj0oYSxiLGMpPT4odWI9Wi5GZSkoYSxiLGMpLHNiPWE9PihzYj1aLkdlKShhKTtcbmZ1bmN0aW9uIHRkKGEsYixjLGQpe3ZhciBlPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQpfWNhdGNoKGYpe08oZSk7aWYoZiE9PWYrMCl0aHJvdyBmO1koMSwwKX19ZnVuY3Rpb24gcmQoYSxiLGMpe3ZhciBkPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjKX1jYXRjaChlKXtPKGQpO2lmKGUhPT1lKzApdGhyb3cgZTtZKDEsMCl9fWZ1bmN0aW9uIHhlKGEsYixjKXt2YXIgZD1XKCk7dHJ5e1AoYSkoYixjKX1jYXRjaChlKXtPKGQpO2lmKGUhPT1lKzApdGhyb3cgZTtZKDEsMCl9fWZ1bmN0aW9uIG9kKGEsYil7dmFyIGM9VygpO3RyeXtyZXR1cm4gUChhKShiKX1jYXRjaChkKXtPKGMpO2lmKGQhPT1kKzApdGhyb3cgZDtZKDEsMCl9fWZ1bmN0aW9uIHRlKGEsYil7dmFyIGM9VygpO3RyeXtQKGEpKGIpfWNhdGNoKGQpe08oYyk7aWYoZCE9PWQrMCl0aHJvdyBkO1koMSwwKX19XG5mdW5jdGlvbiBVZChhLGIsYyxkKXt2YXIgZT1XKCk7dHJ5e3JldHVybiBQKGEpKGIsYyxkKX1jYXRjaChmKXtPKGUpO2lmKGYhPT1mKzApdGhyb3cgZjtZKDEsMCl9fWZ1bmN0aW9uIHJlKGEpe3ZhciBiPVcoKTt0cnl7UChhKSgpfWNhdGNoKGMpe08oYik7aWYoYyE9PWMrMCl0aHJvdyBjO1koMSwwKX19ZnVuY3Rpb24geWQoYSxiLGMsZCxlLGYsZyl7dmFyIGg9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlLGYsZyl9Y2F0Y2goayl7TyhoKTtpZihrIT09ayswKXRocm93IGs7WSgxLDApfX1mdW5jdGlvbiB4ZChhLGIsYyxkLGUsZil7dmFyIGc9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlLGYpfWNhdGNoKGgpe08oZyk7aWYoaCE9PWgrMCl0aHJvdyBoO1koMSwwKX19ZnVuY3Rpb24gdmQoYSxiLGMsZCxlKXt2YXIgZj1XKCk7dHJ5e3JldHVybiBQKGEpKGIsYyxkLGUpfWNhdGNoKGcpe08oZik7aWYoZyE9PWcrMCl0aHJvdyBnO1koMSwwKX19XG5mdW5jdGlvbiBFZShhLGIsYyxkKXt2YXIgZT1XKCk7dHJ5e1AoYSkoYixjLGQpfWNhdGNoKGYpe08oZSk7aWYoZiE9PWYrMCl0aHJvdyBmO1koMSwwKX19ZnVuY3Rpb24gSGUoYSxiLGMsZCxlKXt2YXIgZj1XKCk7dHJ5e1AoYSkoYixjLGQsZSl9Y2F0Y2goZyl7TyhmKTtpZihnIT09ZyswKXRocm93IGc7WSgxLDApfX1mdW5jdGlvbiBuZChhKXt2YXIgYj1XKCk7dHJ5e3JldHVybiBQKGEpKCl9Y2F0Y2goYyl7TyhiKTtpZihjIT09YyswKXRocm93IGM7WSgxLDApfX1mdW5jdGlvbiBiZShhLGIsYyl7dmFyIGQ9VygpO3RyeXtyZXR1cm4gUChhKShiLGMpfWNhdGNoKGUpe08oZCk7aWYoZSE9PWUrMCl0aHJvdyBlO1koMSwwKX19ZnVuY3Rpb24gU2YoYSxiLGMpe3ZhciBkPVcoKTt0cnl7UChhKShiLGMpfWNhdGNoKGUpe08oZCk7aWYoZSE9PWUrMCl0aHJvdyBlO1koMSwwKX19XG5mdW5jdGlvbiBKZShhLGIsYyxkLGUsZil7dmFyIGc9VygpO3RyeXtQKGEpKGIsYyxkLGUsZil9Y2F0Y2goaCl7TyhnKTtpZihoIT09aCswKXRocm93IGg7WSgxLDApfX1mdW5jdGlvbiB6ZChhLGIsYyxkLGUsZixnLGgpe3ZhciBrPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmLGcsaCl9Y2F0Y2gobCl7TyhrKTtpZihsIT09bCswKXRocm93IGw7WSgxLDApfX1mdW5jdGlvbiBqZChhLGIpe3ZhciBjPVcoKTt0cnl7cmV0dXJuIFAoYSkoYil9Y2F0Y2goZCl7TyhjKTtpZihkIT09ZCswKXRocm93IGQ7WSgxLDApfX1mdW5jdGlvbiBtZShhLGIpe3ZhciBjPVcoKTt0cnl7cmV0dXJuIFAoYSkoYil9Y2F0Y2goZCl7TyhjKTtpZihkIT09ZCswKXRocm93IGQ7WSgxLDApO3JldHVybiAwbn19ZnVuY3Rpb24gZGQoYSxiKXt2YXIgYz1XKCk7dHJ5e3JldHVybiBQKGEpKGIpfWNhdGNoKGQpe08oYyk7aWYoZCE9PWQrMCl0aHJvdyBkO1koMSwwKX19XG5mdW5jdGlvbiBBZChhLGIsYyxkLGUsZixnLGgsayl7dmFyIGw9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlLGYsZyxoLGspfWNhdGNoKG4pe08obCk7aWYobiE9PW4rMCl0aHJvdyBuO1koMSwwKX19ZnVuY3Rpb24gSWYoYSxiLGMsZCl7dmFyIGU9VygpO3RyeXtQKGEpKGIsYyxkKX1jYXRjaChmKXtPKGUpO2lmKGYhPT1mKzApdGhyb3cgZjtZKDEsMCl9fWZ1bmN0aW9uIE5lKGEsYixjLGQsZSxmLGcpe3ZhciBoPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyl9Y2F0Y2goayl7TyhoKTtpZihrIT09ayswKXRocm93IGs7WSgxLDApfX1mdW5jdGlvbiBYZihhLGIsYyxkKXt2YXIgZT1XKCk7dHJ5e1AoYSkoYixjLGQpfWNhdGNoKGYpe08oZSk7aWYoZiE9PWYrMCl0aHJvdyBmO1koMSwwKX19ZnVuY3Rpb24gQmYoYSxiLGMsZCxlLGYsZyl7dmFyIGg9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnKX1jYXRjaChrKXtPKGgpO2lmKGshPT1rKzApdGhyb3cgaztZKDEsMCl9fVxuZnVuY3Rpb24gU2UoYSxiLGMsZCxlLGYsZyxoKXt2YXIgaz1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCl9Y2F0Y2gobCl7TyhrKTtpZihsIT09bCswKXRocm93IGw7WSgxLDApfX1mdW5jdGlvbiBNZihhLGIsYyxkLGUpe3ZhciBmPVcoKTt0cnl7UChhKShiLGMsZCxlKX1jYXRjaChnKXtPKGYpO2lmKGchPT1nKzApdGhyb3cgZztZKDEsMCl9fWZ1bmN0aW9uIEJkKGEsYixjLGQsZSxmLGcsaCxrLGwpe3ZhciBuPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmLGcsaCxrLGwpfWNhdGNoKHUpe08obik7aWYodSE9PXUrMCl0aHJvdyB1O1koMSwwKX19ZnVuY3Rpb24gVGUoYSxiLGMsZCxlLGYsZyxoLGspe3ZhciBsPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGspfWNhdGNoKG4pe08obCk7aWYobiE9PW4rMCl0aHJvdyBuO1koMSwwKX19XG5mdW5jdGlvbiBPZChhLGIsYyxkLGUsZixnLGgsayxsLG4pe3ZhciB1PVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmLGcsaCxrLGwsbil9Y2F0Y2godil7Tyh1KTtpZih2IT09diswKXRocm93IHY7WSgxLDApfX1mdW5jdGlvbiBhZyhhLGIsYyxkLGUsZixnLGgsayl7dmFyIGw9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayl9Y2F0Y2gobil7TyhsKTtpZihuIT09biswKXRocm93IG47WSgxLDApfX1mdW5jdGlvbiBLZihhLGIsYyxkLGUsZixnKXt2YXIgaD1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcpfWNhdGNoKGspe08oaCk7aWYoayE9PWsrMCl0aHJvdyBrO1koMSwwKX19ZnVuY3Rpb24gVWUoYSxiLGMsZCxlLGYsZyxoLGssbCl7dmFyIG49VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayxsKX1jYXRjaCh1KXtPKG4pO2lmKHUhPT11KzApdGhyb3cgdTtZKDEsMCl9fVxuZnVuY3Rpb24gbmUoYSxiLGMpe3ZhciBkPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjKX1jYXRjaChlKXtPKGQpO2lmKGUhPT1lKzApdGhyb3cgZTtZKDEsMCk7cmV0dXJuIDBufX1mdW5jdGlvbiB5ZShhLGIsYyxkKXt2YXIgZT1XKCk7dHJ5e1AoYSkoYixjLGQpfWNhdGNoKGYpe08oZSk7aWYoZiE9PWYrMCl0aHJvdyBmO1koMSwwKX19ZnVuY3Rpb24gSmQoYSxiLGMsZCxlLGYsZyxoLGspe3ZhciBsPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmLGcsaCxrKX1jYXRjaChuKXtPKGwpO2lmKG4hPT1uKzApdGhyb3cgbjtZKDEsMCl9fWZ1bmN0aW9uIERkKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1KXt2YXIgdj1XKCk7dHJ5e3JldHVybiBQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSl9Y2F0Y2gobSl7Tyh2KTtpZihtIT09bSswKXRocm93IG07WSgxLDApfX1cbmZ1bmN0aW9uIGJmKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSl7dmFyIHc9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0pfWNhdGNoKHkpe08odyk7aWYoeSE9PXkrMCl0aHJvdyB5O1koMSwwKX19ZnVuY3Rpb24gUmYoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUpe3ZhciB2PVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUpfWNhdGNoKG0pe08odik7aWYobSE9PW0rMCl0aHJvdyBtO1koMSwwKX19ZnVuY3Rpb24gRWYoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUpe3ZhciB2PVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUpfWNhdGNoKG0pe08odik7aWYobSE9PW0rMCl0aHJvdyBtO1koMSwwKX19ZnVuY3Rpb24gSmYoYSxiLGMsZCxlKXt2YXIgZj1XKCk7dHJ5e1AoYSkoYixjLGQsZSl9Y2F0Y2goZyl7TyhmKTtpZihnIT09ZyswKXRocm93IGc7WSgxLDApfX1cbmZ1bmN0aW9uIHdlKGEsYixjLGQsZSxmLGcpe3ZhciBoPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyl9Y2F0Y2goayl7TyhoKTtpZihrIT09ayswKXRocm93IGs7WSgxLDApfX1mdW5jdGlvbiBIZihhLGIsYyxkLGUsZixnLGgsayl7dmFyIGw9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayl9Y2F0Y2gobil7TyhsKTtpZihuIT09biswKXRocm93IG47WSgxLDApfX1mdW5jdGlvbiBEZShhLGIsYyxkLGUsZixnKXt2YXIgaD1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcpfWNhdGNoKGspe08oaCk7aWYoayE9PWsrMCl0aHJvdyBrO1koMSwwKX19ZnVuY3Rpb24gS2UoYSxiLGMsZCxlLGYsZyxoLGssbCxuKXt2YXIgdT1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwsbil9Y2F0Y2godil7Tyh1KTtpZih2IT09diswKXRocm93IHY7WSgxLDApfX1cbmZ1bmN0aW9uIGlnKGEsYixjLGQsZSxmLGcsaCl7dmFyIGs9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgpfWNhdGNoKGwpe08oayk7aWYobCE9PWwrMCl0aHJvdyBsO1koMSwwKX19ZnVuY3Rpb24gb2UoYSxiLGMsZCl7dmFyIGU9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCl9Y2F0Y2goZil7TyhlKTtpZihmIT09ZiswKXRocm93IGY7WSgxLDApO3JldHVybiAwbn19ZnVuY3Rpb24gRmUoYSxiLGMsZCxlKXt2YXIgZj1XKCk7dHJ5e1AoYSkoYixjLGQsZSl9Y2F0Y2goZyl7TyhmKTtpZihnIT09ZyswKXRocm93IGc7WSgxLDApfX1mdW5jdGlvbiBkZihhLGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0sdyx5LHope3ZhciBEPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcseSx6KX1jYXRjaChFKXtPKEQpO2lmKEUhPT1FKzApdGhyb3cgRTtZKDEsMCl9fVxuZnVuY3Rpb24gZmcoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcseSl7dmFyIHo9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0sdyx5KX1jYXRjaChEKXtPKHopO2lmKEQhPT1EKzApdGhyb3cgRDtZKDEsMCl9fWZ1bmN0aW9uIEFmKGEsYixjLGQsZSxmKXt2YXIgZz1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmKX1jYXRjaChoKXtPKGcpO2lmKGghPT1oKzApdGhyb3cgaDtZKDEsMCl9fWZ1bmN0aW9uIGJnKGEsYixjLGQsZSxmLGcsaCxrKXt2YXIgbD1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrKX1jYXRjaChuKXtPKGwpO2lmKG4hPT1uKzApdGhyb3cgbjtZKDEsMCl9fWZ1bmN0aW9uIFZkKGEsYixjLGQsZSl7dmFyIGY9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlKX1jYXRjaChnKXtPKGYpO2lmKGchPT1nKzApdGhyb3cgZztZKDEsMCl9fVxuZnVuY3Rpb24gJGQoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtKXt2YXIgdz1XKCk7dHJ5e3JldHVybiBQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0pfWNhdGNoKHkpe08odyk7aWYoeSE9PXkrMCl0aHJvdyB5O1koMSwwKX19ZnVuY3Rpb24gZ2coYSxiKXt2YXIgYz1XKCk7dHJ5e1AoYSkoYil9Y2F0Y2goZCl7TyhjKTtpZihkIT09ZCswKXRocm93IGQ7WSgxLDApfX1mdW5jdGlvbiBxZShhLGIsYyl7dmFyIGQ9VygpO3RyeXtyZXR1cm4gUChhKShiLGMpfWNhdGNoKGUpe08oZCk7aWYoZSE9PWUrMCl0aHJvdyBlO1koMSwwKTtyZXR1cm4gMG59fWZ1bmN0aW9uIFpkKGEsYixjLGQsZSxmLGcsaCxrLGwpe3ZhciBuPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmLGcsaCxrLGwpfWNhdGNoKHUpe08obik7aWYodSE9PXUrMCl0aHJvdyB1O1koMSwwKX19XG5mdW5jdGlvbiBtZChhLGIsYyxkLGUpe3ZhciBmPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSl9Y2F0Y2goZyl7TyhmKTtpZihnIT09ZyswKXRocm93IGc7WSgxLDApfX1mdW5jdGlvbiBZZShhLGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0sdyl7dmFyIHk9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0sdyl9Y2F0Y2goeil7Tyh5KTtpZih6IT09eiswKXRocm93IHo7WSgxLDApfX1mdW5jdGlvbiBzZShhLGIsYyxkLGUpe3ZhciBmPVcoKTt0cnl7UChhKShiLGMsZCxlKX1jYXRjaChnKXtPKGYpO2lmKGchPT1nKzApdGhyb3cgZztZKDEsMCl9fWZ1bmN0aW9uIEllKGEsYixjLGQsZSxmLGcpe3ZhciBoPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyl9Y2F0Y2goayl7TyhoKTtpZihrIT09ayswKXRocm93IGs7WSgxLDApfX1cbmZ1bmN0aW9uIEFlKGEsYixjLGQsZSl7dmFyIGY9VygpO3RyeXtQKGEpKGIsYyxkLGUpfWNhdGNoKGcpe08oZik7aWYoZyE9PWcrMCl0aHJvdyBnO1koMSwwKX19ZnVuY3Rpb24gTGUoYSxiLGMsZCxlLGYsZyxoKXt2YXIgaz1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCl9Y2F0Y2gobCl7TyhrKTtpZihsIT09bCswKXRocm93IGw7WSgxLDApfX1mdW5jdGlvbiBsZihhLGIsYyxkLGUsZixnLGgsayxsLG4pe3ZhciB1PVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuKX1jYXRjaCh2KXtPKHUpO2lmKHYhPT12KzApdGhyb3cgdjtZKDEsMCl9fWZ1bmN0aW9uIEVkKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSx3LHkseil7dmFyIEQ9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcseSx6KX1jYXRjaChFKXtPKEQpO2lmKEUhPT1FKzApdGhyb3cgRTtZKDEsMCl9fVxuZnVuY3Rpb24gYWYoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUsdil7dmFyIG09VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSx2KX1jYXRjaCh3KXtPKG0pO2lmKHchPT13KzApdGhyb3cgdztZKDEsMCl9fWZ1bmN0aW9uIGhlKGEsYil7dmFyIGM9VygpO3RyeXtyZXR1cm4gUChhKShiKX1jYXRjaChkKXtPKGMpO2lmKGQhPT1kKzApdGhyb3cgZDtZKDEsMCl9fWZ1bmN0aW9uIEZkKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSx3LHkseixELEUsSSl7dmFyIEo9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcseSx6LEQsRSxJKX1jYXRjaChLKXtPKEopO2lmKEshPT1LKzApdGhyb3cgSztZKDEsMCl9fWZ1bmN0aW9uICRmKGEsYixjLGQsZSxmLGcsaCxrLGwpe3ZhciBuPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCl9Y2F0Y2godSl7TyhuKTtpZih1IT09dSswKXRocm93IHU7WSgxLDApfX1cbmZ1bmN0aW9uIFRkKGEsYixjLGQsZSxmLGcpe3ZhciBoPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmLGcpfWNhdGNoKGspe08oaCk7aWYoayE9PWsrMCl0aHJvdyBrO1koMSwwKX19ZnVuY3Rpb24gWmUoYSxiLGMsZCxlLGYsZyxoLGssbCxuKXt2YXIgdT1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwsbil9Y2F0Y2godil7Tyh1KTtpZih2IT09diswKXRocm93IHY7WSgxLDApfX1mdW5jdGlvbiBhZShhLGIsYyxkLGUsZil7dmFyIGc9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlLGYpfWNhdGNoKGgpe08oZyk7aWYoaCE9PWgrMCl0aHJvdyBoO1koMSwwKX19ZnVuY3Rpb24gdmYoYSxiLGMsZCxlLGYpe3ZhciBnPVcoKTt0cnl7UChhKShiLGMsZCxlLGYpfWNhdGNoKGgpe08oZyk7aWYoaCE9PWgrMCl0aHJvdyBoO1koMSwwKX19XG5mdW5jdGlvbiBYZShhLGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0pe3ZhciB3PVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtKX1jYXRjaCh5KXtPKHcpO2lmKHkhPT15KzApdGhyb3cgeTtZKDEsMCl9fWZ1bmN0aW9uIG5nKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSx3LHkseixEKXt2YXIgRT1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSx3LHkseixEKX1jYXRjaChJKXtPKEUpO2lmKEkhPT1JKzApdGhyb3cgSTtZKDEsMCl9fWZ1bmN0aW9uIFBlKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSx3LHkseil7dmFyIEQ9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0sdyx5LHopfWNhdGNoKEUpe08oRCk7aWYoRSE9PUUrMCl0aHJvdyBFO1koMSwwKX19XG5mdW5jdGlvbiBPZShhLGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0sdyx5KXt2YXIgej1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSx3LHkpfWNhdGNoKEQpe08oeik7aWYoRCE9PUQrMCl0aHJvdyBEO1koMSwwKX19ZnVuY3Rpb24gUWUoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcpe3ZhciB5PVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcpfWNhdGNoKHope08oeSk7aWYoeiE9PXorMCl0aHJvdyB6O1koMSwwKX19ZnVuY3Rpb24gcGcoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcseSx6LEQsRSxJLEope3ZhciBLPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcseSx6LEQsRSxJLEopfWNhdGNoKGFhKXtPKEspO2lmKGFhIT09YWErMCl0aHJvdyBhYTtZKDEsMCl9fVxuZnVuY3Rpb24gbWcoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcseSx6LEQsRSl7dmFyIEk9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0sdyx5LHosRCxFKX1jYXRjaChKKXtPKEkpO2lmKEohPT1KKzApdGhyb3cgSjtZKDEsMCl9fWZ1bmN0aW9uIGxnKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSx3LHkseil7dmFyIEQ9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0sdyx5LHopfWNhdGNoKEUpe08oRCk7aWYoRSE9PUUrMCl0aHJvdyBFO1koMSwwKX19ZnVuY3Rpb24gb2coYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcseSx6LEQsRSxJKXt2YXIgSj1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSx3LHkseixELEUsSSl9Y2F0Y2goSyl7TyhKKTtpZihLIT09SyswKXRocm93IEs7WSgxLDApfX1cbmZ1bmN0aW9uIFlmKGEsYixjLGQsZSxmLGcsaCxrLGwpe3ZhciBuPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCl9Y2F0Y2godSl7TyhuKTtpZih1IT09dSswKXRocm93IHU7WSgxLDApfX1mdW5jdGlvbiBWZihhLGIsYyxkLGUsZixnLGgsayxsLG4pe3ZhciB1PVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuKX1jYXRjaCh2KXtPKHUpO2lmKHYhPT12KzApdGhyb3cgdjtZKDEsMCl9fWZ1bmN0aW9uIGVnKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSx3KXt2YXIgeT1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSx3KX1jYXRjaCh6KXtPKHkpO2lmKHohPT16KzApdGhyb3cgejtZKDEsMCl9fWZ1bmN0aW9uIGtnKGEsYixjLGQsZSxmLGcsaCxrLGwpe3ZhciBuPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCl9Y2F0Y2godSl7TyhuKTtpZih1IT09dSswKXRocm93IHU7WSgxLDApfX1cbmZ1bmN0aW9uIGpnKGEsYixjLGQsZSxmLGcsaCxrKXt2YXIgbD1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrKX1jYXRjaChuKXtPKGwpO2lmKG4hPT1uKzApdGhyb3cgbjtZKDEsMCl9fWZ1bmN0aW9uIGhkKGEsYixjLGQsZSxmLGcpe3ZhciBoPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmLGcpfWNhdGNoKGspe08oaCk7aWYoayE9PWsrMCl0aHJvdyBrO1koMSwwKX19ZnVuY3Rpb24gQmUoYSxiLGMsZCxlKXt2YXIgZj1XKCk7dHJ5e1AoYSkoYixjLGQsZSl9Y2F0Y2goZyl7TyhmKTtpZihnIT09ZyswKXRocm93IGc7WSgxLDApfX1mdW5jdGlvbiBsZShhLGIsYyl7dmFyIGQ9VygpO3RyeXtyZXR1cm4gUChhKShiLGMpfWNhdGNoKGUpe08oZCk7aWYoZSE9PWUrMCl0aHJvdyBlO1koMSwwKTtyZXR1cm4gMG59fVxuZnVuY3Rpb24gTmQoYSxiLGMsZCxlLGYsZyl7dmFyIGg9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlLGYsZyl9Y2F0Y2goayl7TyhoKTtpZihrIT09ayswKXRocm93IGs7WSgxLDApfX1mdW5jdGlvbiBaZihhLGIsYyxkLGUsZil7dmFyIGc9VygpO3RyeXtQKGEpKGIsYyxkLGUsZil9Y2F0Y2goaCl7TyhnKTtpZihoIT09aCswKXRocm93IGg7WSgxLDApfX1mdW5jdGlvbiBEZihhLGIsYyxkLGUsZixnLGgsayxsLG4pe3ZhciB1PVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuKX1jYXRjaCh2KXtPKHUpO2lmKHYhPT12KzApdGhyb3cgdjtZKDEsMCl9fWZ1bmN0aW9uIHRmKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1LHYpe3ZhciBtPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUsdil9Y2F0Y2godyl7TyhtKTtpZih3IT09dyswKXRocm93IHc7WSgxLDApfX1cbmZ1bmN0aW9uIFJkKGEsYixjLGQsZSxmKXt2YXIgZz1XKCk7dHJ5e3JldHVybiBQKGEpKGIsYyxkLGUsZil9Y2F0Y2goaCl7TyhnKTtpZihoIT09aCswKXRocm93IGg7WSgxLDApfX1mdW5jdGlvbiBxZihhLGIsYyxkLGUsZixnLGgsayxsLG4sdSx2KXt2YXIgbT1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwsbix1LHYpfWNhdGNoKHcpe08obSk7aWYodyE9PXcrMCl0aHJvdyB3O1koMSwwKX19ZnVuY3Rpb24geGYoYSxiLGMsZCxlLGYsZyxoKXt2YXIgaz1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCl9Y2F0Y2gobCl7TyhrKTtpZihsIT09bCswKXRocm93IGw7WSgxLDApfX1mdW5jdGlvbiBPZihhLGIsYyxkLGUsZixnLGgpe3ZhciBrPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoKX1jYXRjaChsKXtPKGspO2lmKGwhPT1sKzApdGhyb3cgbDtZKDEsMCl9fVxuZnVuY3Rpb24gaWUoYSxiLGMsZCl7dmFyIGU9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCl9Y2F0Y2goZil7TyhlKTtpZihmIT09ZiswKXRocm93IGY7WSgxLDApfX1mdW5jdGlvbiB1ZihhLGIsYyxkLGUsZixnLGgsayxsKXt2YXIgbj1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwpfWNhdGNoKHUpe08obik7aWYodSE9PXUrMCl0aHJvdyB1O1koMSwwKX19ZnVuY3Rpb24gY2coYSxiLGMsZCxlLGYsZyxoLGspe3ZhciBsPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGspfWNhdGNoKG4pe08obCk7aWYobiE9PW4rMCl0aHJvdyBuO1koMSwwKX19ZnVuY3Rpb24gc2YoYSxiLGMsZCxlLGYsZyxoLGspe3ZhciBsPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGspfWNhdGNoKG4pe08obCk7aWYobiE9PW4rMCl0aHJvdyBuO1koMSwwKX19XG5mdW5jdGlvbiBvZihhLGIsYyxkLGUsZixnLGgsayxsKXt2YXIgbj1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwpfWNhdGNoKHUpe08obik7aWYodSE9PXUrMCl0aHJvdyB1O1koMSwwKX19ZnVuY3Rpb24gVWYoYSxiLGMsZCxlLGYpe3ZhciBnPVcoKTt0cnl7UChhKShiLGMsZCxlLGYpfWNhdGNoKGgpe08oZyk7aWYoaCE9PWgrMCl0aHJvdyBoO1koMSwwKX19ZnVuY3Rpb24gV2UoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUpe3ZhciB2PVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUpfWNhdGNoKG0pe08odik7aWYobSE9PW0rMCl0aHJvdyBtO1koMSwwKX19ZnVuY3Rpb24gRmYoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtKXt2YXIgdz1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSl9Y2F0Y2goeSl7Tyh3KTtpZih5IT09eSswKXRocm93IHk7WSgxLDApfX1cbmZ1bmN0aW9uIFlkKGEsYixjLGQsZSxmLGcsaCl7dmFyIGs9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlLGYsZyxoKX1jYXRjaChsKXtPKGspO2lmKGwhPT1sKzApdGhyb3cgbDtZKDEsMCl9fWZ1bmN0aW9uIGNmKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSx3KXt2YXIgeT1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSx3KX1jYXRjaCh6KXtPKHkpO2lmKHohPT16KzApdGhyb3cgejtZKDEsMCl9fWZ1bmN0aW9uIHBmKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSl7dmFyIHc9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0pfWNhdGNoKHkpe08odyk7aWYoeSE9PXkrMCl0aHJvdyB5O1koMSwwKX19XG5mdW5jdGlvbiBtZihhLGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0sdyl7dmFyIHk9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0sdyl9Y2F0Y2goeil7Tyh5KTtpZih6IT09eiswKXRocm93IHo7WSgxLDApfX1mdW5jdGlvbiB2ZShhLGIsYyl7dmFyIGQ9VygpO3RyeXtQKGEpKGIsYyl9Y2F0Y2goZSl7TyhkKTtpZihlIT09ZSswKXRocm93IGU7WSgxLDApfX1mdW5jdGlvbiBQZihhLGIsYyxkLGUsZixnLGgsayl7dmFyIGw9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayl9Y2F0Y2gobil7TyhsKTtpZihuIT09biswKXRocm93IG47WSgxLDApfX1mdW5jdGlvbiBSZShhLGIsYyxkLGUsZixnLGgsayxsLG4pe3ZhciB1PVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuKX1jYXRjaCh2KXtPKHUpO2lmKHYhPT12KzApdGhyb3cgdjtZKDEsMCl9fVxuZnVuY3Rpb24gcmYoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcseSx6LEQsRSxJLEosSyxhYSx1Zyx2Zyx3Zyl7dmFyIHhnPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcseSx6LEQsRSxJLEosSyxhYSx1Zyx2Zyx3Zyl9Y2F0Y2goZmIpe08oeGcpO2lmKGZiIT09ZmIrMCl0aHJvdyBmYjtZKDEsMCl9fWZ1bmN0aW9uIE5mKGEsYixjLGQsZSxmKXt2YXIgZz1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmKX1jYXRjaChoKXtPKGcpO2lmKGghPT1oKzApdGhyb3cgaDtZKDEsMCl9fWZ1bmN0aW9uIEhkKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1LHYpe3ZhciBtPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmLGcsaCxrLGwsbix1LHYpfWNhdGNoKHcpe08obSk7aWYodyE9PXcrMCl0aHJvdyB3O1koMSwwKX19XG5mdW5jdGlvbiAkZShhLGIsYyxkLGUsZixnLGgsayxsLG4sdSl7dmFyIHY9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSl9Y2F0Y2gobSl7Tyh2KTtpZihtIT09bSswKXRocm93IG07WSgxLDApfX1mdW5jdGlvbiBDZShhLGIsYyxkLGUsZixnLGgsayxsLG4sdSx2KXt2YXIgbT1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwsbix1LHYpfWNhdGNoKHcpe08obSk7aWYodyE9PXcrMCl0aHJvdyB3O1koMSwwKX19ZnVuY3Rpb24gamYoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcseSx6LEQsRSxJLEope3ZhciBLPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcseSx6LEQsRSxJLEopfWNhdGNoKGFhKXtPKEspO2lmKGFhIT09YWErMCl0aHJvdyBhYTtZKDEsMCl9fWZ1bmN0aW9uIHFkKGEsYixjKXt2YXIgZD1XKCk7dHJ5e3JldHVybiBQKGEpKGIsYyl9Y2F0Y2goZSl7TyhkKTtpZihlIT09ZSswKXRocm93IGU7WSgxLDApfX1cbmZ1bmN0aW9uIE1lKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1LHYpe3ZhciBtPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUsdil9Y2F0Y2godyl7TyhtKTtpZih3IT09dyswKXRocm93IHc7WSgxLDApfX1mdW5jdGlvbiBXZihhLGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0pe3ZhciB3PVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtKX1jYXRjaCh5KXtPKHcpO2lmKHkhPT15KzApdGhyb3cgeTtZKDEsMCl9fWZ1bmN0aW9uIHlmKGEsYixjLGQsZSxmLGcsaCl7dmFyIGs9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgpfWNhdGNoKGwpe08oayk7aWYobCE9PWwrMCl0aHJvdyBsO1koMSwwKX19ZnVuY3Rpb24gZmYoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcseSx6KXt2YXIgRD1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSx3LHkseil9Y2F0Y2goRSl7TyhEKTtpZihFIT09RSswKXRocm93IEU7WSgxLDApfX1cbmZ1bmN0aW9uIGhmKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSx3LHkseixELEUsSSl7dmFyIEo9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0sdyx5LHosRCxFLEkpfWNhdGNoKEspe08oSik7aWYoSyE9PUsrMCl0aHJvdyBLO1koMSwwKX19ZnVuY3Rpb24gZ2YoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcseSx6LEQsRSl7dmFyIEk9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0sdyx5LHosRCxFKX1jYXRjaChKKXtPKEkpO2lmKEohPT1KKzApdGhyb3cgSjtZKDEsMCl9fWZ1bmN0aW9uIG5mKGEsYixjLGQsZSxmLGcsaCxrLGwsbil7dmFyIHU9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4pfWNhdGNoKHYpe08odSk7aWYodiE9PXYrMCl0aHJvdyB2O1koMSwwKX19XG5mdW5jdGlvbiBDZChhLGIsYyxkLGUsZixnLGgsayxsLG4pe3ZhciB1PVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmLGcsaCxrLGwsbil9Y2F0Y2godil7Tyh1KTtpZih2IT09diswKXRocm93IHY7WSgxLDApfX1mdW5jdGlvbiBHZChhLGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0sdyx5LHosRCxFLEkpe3ZhciBKPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmLGcsaCxrLGwsbix1LHYsbSx3LHkseixELEUsSSl9Y2F0Y2goSyl7TyhKKTtpZihLIT09SyswKXRocm93IEs7WSgxLDApfX1mdW5jdGlvbiBHZShhLGIsYyxkLGUpe3ZhciBmPVcoKTt0cnl7UChhKShiLGMsZCxlKX1jYXRjaChnKXtPKGYpO2lmKGchPT1nKzApdGhyb3cgZztZKDEsMCl9fWZ1bmN0aW9uIFZlKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1KXt2YXIgdj1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwsbix1KX1jYXRjaChtKXtPKHYpO2lmKG0hPT1tKzApdGhyb3cgbTtZKDEsMCl9fVxuZnVuY3Rpb24gZWUoYSxiLGMsZCxlKXt2YXIgZj1XKCk7dHJ5e3JldHVybiBQKGEpKGIsYyxkLGUpfWNhdGNoKGcpe08oZik7aWYoZyE9PWcrMCl0aHJvdyBnO1koMSwwKX19ZnVuY3Rpb24gcGUoYSxiLGMsZCl7dmFyIGU9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCl9Y2F0Y2goZil7TyhlKTtpZihmIT09ZiswKXRocm93IGY7WSgxLDApO3JldHVybiAwbn19ZnVuY3Rpb24gd2YoYSxiLGMsZCxlLGYsZyl7dmFyIGg9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnKX1jYXRjaChrKXtPKGgpO2lmKGshPT1rKzApdGhyb3cgaztZKDEsMCl9fWZ1bmN0aW9uIGZlKGEsYixjLGQsZSxmKXt2YXIgZz1XKCk7dHJ5e3JldHVybiBQKGEpKGIsYyxkLGUsZil9Y2F0Y2goaCl7TyhnKTtpZihoIT09aCswKXRocm93IGg7WSgxLDApfX1mdW5jdGlvbiB6ZihhLGIsYyxkLGUpe3ZhciBmPVcoKTt0cnl7UChhKShiLGMsZCxlKX1jYXRjaChnKXtPKGYpO2lmKGchPT1nKzApdGhyb3cgZztZKDEsMCl9fVxuZnVuY3Rpb24gamUoYSxiLGMsZCxlLGYpe3ZhciBnPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmKX1jYXRjaChoKXtPKGcpO2lmKGghPT1oKzApdGhyb3cgaDtZKDEsMCl9fWZ1bmN0aW9uIEdmKGEsYixjLGQsZSxmLGcsaCxrKXt2YXIgbD1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrKX1jYXRjaChuKXtPKGwpO2lmKG4hPT1uKzApdGhyb3cgbjtZKDEsMCl9fWZ1bmN0aW9uIHplKGEsYixjLGQpe3ZhciBlPVcoKTt0cnl7UChhKShiLGMsZCl9Y2F0Y2goZil7TyhlKTtpZihmIT09ZiswKXRocm93IGY7WSgxLDApfX1mdW5jdGlvbiBQZChhLGIsYyxkLGUsZixnLGgpe3ZhciBrPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmLGcsaCl9Y2F0Y2gobCl7TyhrKTtpZihsIT09bCswKXRocm93IGw7WSgxLDApfX1mdW5jdGlvbiBUZihhLGIsYyxkKXt2YXIgZT1XKCk7dHJ5e1AoYSkoYixjLGQpfWNhdGNoKGYpe08oZSk7aWYoZiE9PWYrMCl0aHJvdyBmO1koMSwwKX19XG5mdW5jdGlvbiB1ZChhLGIsYyxkLGUsZil7dmFyIGc9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlLGYpfWNhdGNoKGgpe08oZyk7aWYoaCE9PWgrMCl0aHJvdyBoO1koMSwwKX19ZnVuY3Rpb24gV2QoYSxiLGMsZCxlLGYpe3ZhciBnPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmKX1jYXRjaChoKXtPKGcpO2lmKGghPT1oKzApdGhyb3cgaDtZKDEsMCl9fWZ1bmN0aW9uIElkKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1KXt2YXIgdj1XKCk7dHJ5e3JldHVybiBQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSl9Y2F0Y2gobSl7Tyh2KTtpZihtIT09bSswKXRocm93IG07WSgxLDApfX1mdW5jdGlvbiBTZChhLGIsYyxkLGUsZixnLGgpe3ZhciBrPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmLGcsaCl9Y2F0Y2gobCl7TyhrKTtpZihsIT09bCswKXRocm93IGw7WSgxLDApfX1cbmZ1bmN0aW9uIExkKGEsYixjLGQsZSxmLGcsaCxrLGwsbil7dmFyIHU9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlLGYsZyxoLGssbCxuKX1jYXRjaCh2KXtPKHUpO2lmKHYhPT12KzApdGhyb3cgdjtZKDEsMCl9fWZ1bmN0aW9uIFhkKGEsYixjLGQsZSxmLGcpe3ZhciBoPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmLGcpfWNhdGNoKGspe08oaCk7aWYoayE9PWsrMCl0aHJvdyBrO1koMSwwKX19ZnVuY3Rpb24gS2QoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUsdil7dmFyIG09VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUsdil9Y2F0Y2godyl7TyhtKTtpZih3IT09dyswKXRocm93IHc7WSgxLDApfX1mdW5jdGlvbiBkZShhLGIsYyxkLGUsZixnKXt2YXIgaD1XKCk7dHJ5e3JldHVybiBQKGEpKGIsYyxkLGUsZixnKX1jYXRjaChrKXtPKGgpO2lmKGshPT1rKzApdGhyb3cgaztZKDEsMCl9fVxuZnVuY3Rpb24gZ2UoYSxiLGMsZCxlLGYsZyl7dmFyIGg9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlLGYsZyl9Y2F0Y2goayl7TyhoKTtpZihrIT09ayswKXRocm93IGs7WSgxLDApfX1mdW5jdGlvbiBjZShhLGIsYyxkKXt2YXIgZT1XKCk7dHJ5e3JldHVybiBQKGEpKGIsYyxkKX1jYXRjaChmKXtPKGUpO2lmKGYhPT1mKzApdGhyb3cgZjtZKDEsMCl9fWZ1bmN0aW9uIENmKGEsYixjLGQsZSxmLGcsaCxrLGwpe3ZhciBuPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCl9Y2F0Y2godSl7TyhuKTtpZih1IT09dSswKXRocm93IHU7WSgxLDApfX1mdW5jdGlvbiBMZihhLGIsYyxkLGUsZixnLGgsayxsLG4sdSx2KXt2YXIgbT1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwsbix1LHYpfWNhdGNoKHcpe08obSk7aWYodyE9PXcrMCl0aHJvdyB3O1koMSwwKX19XG5mdW5jdGlvbiBwZChhLGIsYyl7dmFyIGQ9VygpO3RyeXtyZXR1cm4gUChhKShiLGMpfWNhdGNoKGUpe08oZCk7aWYoZSE9PWUrMCl0aHJvdyBlO1koMSwwKX19ZnVuY3Rpb24gc2QoYSxiLGMsZCl7dmFyIGU9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCl9Y2F0Y2goZil7TyhlKTtpZihmIT09ZiswKXRocm93IGY7WSgxLDApfX1mdW5jdGlvbiB1ZShhLGIsYyxkKXt2YXIgZT1XKCk7dHJ5e1AoYSkoYixjLGQpfWNhdGNoKGYpe08oZSk7aWYoZiE9PWYrMCl0aHJvdyBmO1koMSwwKX19ZnVuY3Rpb24gbGQoYSxiLGMsZCl7dmFyIGU9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCl9Y2F0Y2goZil7TyhlKTtpZihmIT09ZiswKXRocm93IGY7WSgxLDApfX1mdW5jdGlvbiBoZyhhLGIsYyxkLGUpe3ZhciBmPVcoKTt0cnl7UChhKShiLGMsZCxlKX1jYXRjaChnKXtPKGYpO2lmKGchPT1nKzApdGhyb3cgZztZKDEsMCl9fVxuZnVuY3Rpb24gZ2QoYSxiLGMsZCxlLGYpe3ZhciBnPVcoKTt0cnl7cmV0dXJuIFAoYSkoYixjLGQsZSxmKX1jYXRjaChoKXtPKGcpO2lmKGghPT1oKzApdGhyb3cgaDtZKDEsMCl9fWZ1bmN0aW9uIGRnKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1LHYpe3ZhciBtPVcoKTt0cnl7UChhKShiLGMsZCxlLGYsZyxoLGssbCxuLHUsdil9Y2F0Y2godyl7TyhtKTtpZih3IT09dyswKXRocm93IHc7WSgxLDApfX1mdW5jdGlvbiBRZihhLGIsYyxkLGUsZixnLGgsayxsKXt2YXIgbj1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwpfWNhdGNoKHUpe08obik7aWYodSE9PXUrMCl0aHJvdyB1O1koMSwwKX19ZnVuY3Rpb24gZmQoYSxiLGMsZCl7dmFyIGU9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCl9Y2F0Y2goZil7TyhlKTtpZihmIT09ZiswKXRocm93IGY7WSgxLDApfX1cbmZ1bmN0aW9uIGtmKGEsYixjLGQsZSxmLGcsaCxrLGwsbix1KXt2YXIgdj1XKCk7dHJ5e1AoYSkoYixjLGQsZSxmLGcsaCxrLGwsbix1KX1jYXRjaChtKXtPKHYpO2lmKG0hPT1tKzApdGhyb3cgbTtZKDEsMCl9fWZ1bmN0aW9uIFFkKGEsYixjLGQsZSl7dmFyIGY9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlKX1jYXRjaChnKXtPKGYpO2lmKGchPT1nKzApdGhyb3cgZztZKDEsMCl9fWZ1bmN0aW9uIGtlKGEpe3ZhciBiPVcoKTt0cnl7cmV0dXJuIFAoYSkoKX1jYXRjaChjKXtPKGIpO2lmKGMhPT1jKzApdGhyb3cgYztZKDEsMCk7cmV0dXJuIDBufX1mdW5jdGlvbiBNZChhLGIsYyxkLGUsZil7dmFyIGc9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlLGYpfWNhdGNoKGgpe08oZyk7aWYoaCE9PWgrMCl0aHJvdyBoO1koMSwwKX19XG5mdW5jdGlvbiB3ZChhLGIsYyxkLGUsZil7dmFyIGc9VygpO3RyeXtyZXR1cm4gUChhKShiLGMsZCxlLGYpfWNhdGNoKGgpe08oZyk7aWYoaCE9PWgrMCl0aHJvdyBoO1koMSwwKX19ZnVuY3Rpb24gZWYoYSxiLGMsZCxlLGYsZyxoLGssbCxuLHUsdixtLHcseSl7dmFyIHo9VygpO3RyeXtQKGEpKGIsYyxkLGUsZixnLGgsayxsLG4sdSx2LG0sdyx5KX1jYXRjaChEKXtPKHopO2lmKEQhPT1EKzApdGhyb3cgRDtZKDEsMCl9fWZ1bmN0aW9uIGtkKGEsYixjKXt2YXIgZD1XKCk7dHJ5e3JldHVybiBQKGEpKGIsYyl9Y2F0Y2goZSl7TyhkKTtpZihlIT09ZSswKXRocm93IGU7WSgxLDApfX1mdW5jdGlvbiBlZChhLGIsYyl7dmFyIGQ9VygpO3RyeXtyZXR1cm4gUChhKShiLGMpfWNhdGNoKGUpe08oZCk7aWYoZSE9PWUrMCl0aHJvdyBlO1koMSwwKX19XG5mdW5jdGlvbiByZygpe3ZhciBhPVo7YT1PYmplY3QuYXNzaWduKHt9LGEpO3ZhciBiPWQ9PigpPT5kKCk+Pj4wLGM9ZD0+ZT0+ZChlKT4+PjA7YS5fX2Vycm5vX2xvY2F0aW9uPWIoYS5fX2Vycm5vX2xvY2F0aW9uKTthLmtlPWIoYS5rZSk7YS5sZT1jKGEubGUpO2Eub2U9YyhhLm9lKTthLkFlPWIoYS5BZSk7YS5DZT1jKGEuQ2UpO3JldHVybiBhfUMua2VlcFJ1bnRpbWVBbGl2ZT1NYTtDLndhc21NZW1vcnk9cTtDLnN0YWNrQWxsb2M9bGM7Qy5zdGFja1NhdmU9VztDLnN0YWNrUmVzdG9yZT1PO0MuVVRGOFRvU3RyaW5nPWJiO0Muc3RyaW5nVG9VVEY4PUNiO0MubGVuZ3RoQnl0ZXNVVEY4PUFiO0MuRXhpdFN0YXR1cz1YYTtDLlBUaHJlYWQ9TTt2YXIgc2c7UGE9ZnVuY3Rpb24gdGcoKXtzZ3x8eWcoKTtzZ3x8KFBhPXRnKX07XG5mdW5jdGlvbiB5ZygpezA8TmF8fChHPyhsYShDKSxHfHxrYihKYSksc3RhcnRXb3JrZXIoQykpOihrYihJYSksMDxOYXx8c2d8fChzZz0hMCxDLmNhbGxlZFJ1bj0hMCxDYXx8KEd8fGtiKEphKSxsYShDKSxHfHxrYihLYSkpKSkpfXlnKCk7XG5cblxuICByZXR1cm4gbW9kdWxlQXJnLnJlYWR5XG59XG5cbik7XG59KSgpO1xuaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JylcbiAgbW9kdWxlLmV4cG9ydHMgPSBvcnRXYXNtVGhyZWFkZWQ7XG5lbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZVsnYW1kJ10pXG4gIGRlZmluZShbXSwgKCkgPT4gb3J0V2FzbVRocmVhZGVkKTtcbiIsICJcInVzZSBzdHJpY3RcIjt2YXIgTW9kdWxlPXt9O3ZhciBFTlZJUk9OTUVOVF9JU19OT0RFPXR5cGVvZiBwcm9jZXNzPT1cIm9iamVjdFwiJiZ0eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucz09XCJvYmplY3RcIiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZT09XCJzdHJpbmdcIjtpZihFTlZJUk9OTUVOVF9JU19OT0RFKXt2YXIgbm9kZVdvcmtlclRocmVhZHM9cmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpO3ZhciBwYXJlbnRQb3J0PW5vZGVXb3JrZXJUaHJlYWRzLnBhcmVudFBvcnQ7cGFyZW50UG9ydC5vbihcIm1lc3NhZ2VcIixkYXRhPT5vbm1lc3NhZ2Uoe2RhdGE6ZGF0YX0pKTt2YXIgZnM9cmVxdWlyZShcImZzXCIpO09iamVjdC5hc3NpZ24oZ2xvYmFsLHtzZWxmOmdsb2JhbCxyZXF1aXJlOnJlcXVpcmUsTW9kdWxlOk1vZHVsZSxsb2NhdGlvbjp7aHJlZjpfX2ZpbGVuYW1lfSxXb3JrZXI6bm9kZVdvcmtlclRocmVhZHMuV29ya2VyLGltcG9ydFNjcmlwdHM6Zj0+KDAsZXZhbCkoZnMucmVhZEZpbGVTeW5jKGYsXCJ1dGY4XCIpK1wiLy8jIHNvdXJjZVVSTD1cIitmKSxwb3N0TWVzc2FnZTptc2c9PnBhcmVudFBvcnQucG9zdE1lc3NhZ2UobXNnKSxwZXJmb3JtYW5jZTpnbG9iYWwucGVyZm9ybWFuY2V8fHtub3c6RGF0ZS5ub3d9fSl9dmFyIGluaXRpYWxpemVkSlM9ZmFsc2U7ZnVuY3Rpb24gdGhyZWFkUHJpbnRFcnIoKXt2YXIgdGV4dD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oXCIgXCIpO2lmKEVOVklST05NRU5UX0lTX05PREUpe2ZzLndyaXRlU3luYygyLHRleHQrXCJcXG5cIik7cmV0dXJufWNvbnNvbGUuZXJyb3IodGV4dCl9ZnVuY3Rpb24gdGhyZWFkQWxlcnQoKXt2YXIgdGV4dD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oXCIgXCIpO3Bvc3RNZXNzYWdlKHtjbWQ6XCJhbGVydFwiLHRleHQ6dGV4dCx0aHJlYWRJZDpNb2R1bGVbXCJfcHRocmVhZF9zZWxmXCJdKCl9KX12YXIgZXJyPXRocmVhZFByaW50RXJyO3NlbGYuYWxlcnQ9dGhyZWFkQWxlcnQ7TW9kdWxlW1wiaW5zdGFudGlhdGVXYXNtXCJdPShpbmZvLHJlY2VpdmVJbnN0YW5jZSk9Pnt2YXIgbW9kdWxlPU1vZHVsZVtcIndhc21Nb2R1bGVcIl07TW9kdWxlW1wid2FzbU1vZHVsZVwiXT1udWxsO3ZhciBpbnN0YW5jZT1uZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UobW9kdWxlLGluZm8pO3JldHVybiByZWNlaXZlSW5zdGFuY2UoaW5zdGFuY2UpfTtzZWxmLm9udW5oYW5kbGVkcmVqZWN0aW9uPWU9Pnt0aHJvdyBlLnJlYXNvbnx8ZX07ZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShlKXt0cnl7aWYoZS5kYXRhLmNtZD09PVwibG9hZFwiKXtsZXQgbWVzc2FnZVF1ZXVlPVtdO3NlbGYub25tZXNzYWdlPWU9Pm1lc3NhZ2VRdWV1ZS5wdXNoKGUpO3NlbGYuc3RhcnRXb3JrZXI9aW5zdGFuY2U9PntNb2R1bGU9aW5zdGFuY2U7cG9zdE1lc3NhZ2Uoe1wiY21kXCI6XCJsb2FkZWRcIn0pO2ZvcihsZXQgbXNnIG9mIG1lc3NhZ2VRdWV1ZSl7aGFuZGxlTWVzc2FnZShtc2cpfXNlbGYub25tZXNzYWdlPWhhbmRsZU1lc3NhZ2V9O01vZHVsZVtcIndhc21Nb2R1bGVcIl09ZS5kYXRhLndhc21Nb2R1bGU7Zm9yKGNvbnN0IGhhbmRsZXIgb2YgZS5kYXRhLmhhbmRsZXJzKXtNb2R1bGVbaGFuZGxlcl09KC4uLmFyZ3MpPT57cG9zdE1lc3NhZ2Uoe2NtZDpcImNhbGxIYW5kbGVyXCIsaGFuZGxlcjpoYW5kbGVyLGFyZ3M6YXJnc30pfX1Nb2R1bGVbXCJ3YXNtTWVtb3J5XCJdPWUuZGF0YS53YXNtTWVtb3J5O01vZHVsZVtcImJ1ZmZlclwiXT1Nb2R1bGVbXCJ3YXNtTWVtb3J5XCJdLmJ1ZmZlcjtNb2R1bGVbXCJFTlZJUk9OTUVOVF9JU19QVEhSRUFEXCJdPXRydWU7aWYodHlwZW9mIGUuZGF0YS51cmxPckJsb2I9PVwic3RyaW5nXCIpe2ltcG9ydFNjcmlwdHMoZS5kYXRhLnVybE9yQmxvYil9ZWxzZXt2YXIgb2JqZWN0VXJsPVVSTC5jcmVhdGVPYmplY3RVUkwoZS5kYXRhLnVybE9yQmxvYik7aW1wb3J0U2NyaXB0cyhvYmplY3RVcmwpO1VSTC5yZXZva2VPYmplY3RVUkwob2JqZWN0VXJsKX1vcnRXYXNtVGhyZWFkZWQoTW9kdWxlKX1lbHNlIGlmKGUuZGF0YS5jbWQ9PT1cInJ1blwiKXtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXRcIl0oZS5kYXRhLnB0aHJlYWRfcHRyLC8qaXNfbWFpbj0qLzAsLyppc19ydW50aW1lPSovMCwvKmNhbl9ibG9jaz0qLzEpO01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfbWFpbGJveF9hd2FpdFwiXShlLmRhdGEucHRocmVhZF9wdHIpO01vZHVsZVtcImVzdGFibGlzaFN0YWNrU3BhY2VcIl0oKTtNb2R1bGVbXCJQVGhyZWFkXCJdLnJlY2VpdmVPYmplY3RUcmFuc2ZlcihlLmRhdGEpO01vZHVsZVtcIlBUaHJlYWRcIl0udGhyZWFkSW5pdFRMUygpO2lmKCFpbml0aWFsaXplZEpTKXtNb2R1bGVbXCJfX2VtYmluZF9pbml0aWFsaXplX2JpbmRpbmdzXCJdKCk7aW5pdGlhbGl6ZWRKUz10cnVlfXRyeXtNb2R1bGVbXCJpbnZva2VFbnRyeVBvaW50XCJdKGUuZGF0YS5zdGFydF9yb3V0aW5lLGUuZGF0YS5hcmcpfWNhdGNoKGV4KXtpZihleCE9XCJ1bndpbmRcIil7dGhyb3cgZXh9fX1lbHNlIGlmKGUuZGF0YS5jbWQ9PT1cImNhbmNlbFwiKXtpZihNb2R1bGVbXCJfcHRocmVhZF9zZWxmXCJdKCkpe01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdFwiXSgtMSl9fWVsc2UgaWYoZS5kYXRhLnRhcmdldD09PVwic2V0aW1tZWRpYXRlXCIpe31lbHNlIGlmKGUuZGF0YS5jbWQ9PT1cImNoZWNrTWFpbGJveFwiKXtpZihpbml0aWFsaXplZEpTKXtNb2R1bGVbXCJjaGVja01haWxib3hcIl0oKX19ZWxzZSBpZihlLmRhdGEuY21kKXtlcnIoYHdvcmtlci5qcyByZWNlaXZlZCB1bmtub3duIGNvbW1hbmQgJHtlLmRhdGEuY21kfWApO2VycihlLmRhdGEpfX1jYXRjaChleCl7aWYoTW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkXCJdKXtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWRcIl0oKX10aHJvdyBleH19c2VsZi5vbm1lc3NhZ2U9aGFuZGxlTWVzc2FnZTtcbiIsICJleHBvcnQgY29uc3Qgam9pbiA9IHVuZGVmaW5lZDsiLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7RW52fSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge09ydFdhc21Nb2R1bGV9IGZyb20gJy4vYmluZGluZy9vcnQtd2FzbSc7XG5pbXBvcnQge09ydFdhc21UaHJlYWRlZE1vZHVsZX0gZnJvbSAnLi9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkJztcblxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cyAqL1xubGV0IG9ydFdhc21GYWN0b3J5OiBFbXNjcmlwdGVuTW9kdWxlRmFjdG9yeTxPcnRXYXNtTW9kdWxlPjtcblxuaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfVFJBSU5JTkcpIHtcbiAgb3J0V2FzbUZhY3RvcnkgPSByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXRyYWluaW5nLXdhc20tc2ltZC5qcycpO1xufSBlbHNlIHtcbiAgb3J0V2FzbUZhY3RvcnkgPVxuICAgICAgQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSA/IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS5qcycpIDogcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXNpbWQuanNlcC5qcycpO1xufVxuXG5jb25zdCBvcnRXYXNtRmFjdG9yeVRocmVhZGVkOiBFbXNjcmlwdGVuTW9kdWxlRmFjdG9yeTxPcnRXYXNtTW9kdWxlPiA9ICFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9USFJFQUQgP1xuICAgIChCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVID8gcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLmpzJykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC5qcycpKSA6XG4gICAgb3J0V2FzbUZhY3Rvcnk7XG4vKiBlc2xpbnQtZW5hYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMgKi9cblxubGV0IHdhc206IE9ydFdhc21Nb2R1bGV8dW5kZWZpbmVkO1xubGV0IGluaXRpYWxpemVkID0gZmFsc2U7XG5sZXQgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG5sZXQgYWJvcnRlZCA9IGZhbHNlO1xuXG5jb25zdCBpc011bHRpVGhyZWFkU3VwcG9ydGVkID0gKCk6IGJvb2xlYW4gPT4ge1xuICB0cnkge1xuICAgIC8vIElmICdTaGFyZWRBcnJheUJ1ZmZlcicgaXMgbm90IGF2YWlsYWJsZSwgV2ViQXNzZW1ibHkgdGhyZWFkcyB3aWxsIG5vdCB3b3JrLlxuICAgIGlmICh0eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gVGVzdCBmb3IgdHJhbnNmZXJhYmlsaXR5IG9mIFNBQnMgKGZvciBicm93c2Vycy4gbmVlZGVkIGZvciBGaXJlZm94KVxuICAgIC8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyFtc2cvbW96aWxsYS5kZXYucGxhdGZvcm0vSUhrQlpsSEVUcEEvZHdzTU5jaFdFUUFKXG4gICAgaWYgKHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG5ldyBNZXNzYWdlQ2hhbm5lbCgpLnBvcnQxLnBvc3RNZXNzYWdlKG5ldyBTaGFyZWRBcnJheUJ1ZmZlcigxKSk7XG4gICAgfVxuXG4gICAgLy8gVGVzdCBmb3IgV2ViQXNzZW1ibHkgdGhyZWFkcyBjYXBhYmlsaXR5IChmb3IgYm90aCBicm93c2VycyBhbmQgTm9kZS5qcylcbiAgICAvLyBUaGlzIHR5cGVkIGFycmF5IGlzIGEgV2ViQXNzZW1ibHkgcHJvZ3JhbSBjb250YWluaW5nIHRocmVhZGVkIGluc3RydWN0aW9ucy5cbiAgICByZXR1cm4gV2ViQXNzZW1ibHkudmFsaWRhdGUobmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgMCwgOTcsIDExNSwgMTA5LCAxLCAwLCAgMCwgIDAsIDEsIDQsIDEsICA5NiwgMCwgICAwLCAgMywgMiwgMSwgIDAsIDUsXG4gICAgICA0LCAxLCAgMywgICAxLCAgIDEsIDEwLCAxMSwgMSwgOSwgMCwgNjUsIDAsICAyNTQsIDE2LCAyLCAwLCAyNiwgMTFcbiAgICBdKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IGlzU2ltZFN1cHBvcnRlZCA9ICgpOiBib29sZWFuID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBUZXN0IGZvciBXZWJBc3NlbWJseSBTSU1EIGNhcGFiaWxpdHkgKGZvciBib3RoIGJyb3dzZXJzIGFuZCBOb2RlLmpzKVxuICAgIC8vIFRoaXMgdHlwZWQgYXJyYXkgaXMgYSBXZWJBc3NlbWJseSBwcm9ncmFtIGNvbnRhaW5pbmcgU0lNRCBpbnN0cnVjdGlvbnMuXG5cbiAgICAvLyBUaGUgYmluYXJ5IGRhdGEgaXMgZ2VuZXJhdGVkIGZyb20gdGhlIGZvbGxvd2luZyBjb2RlIGJ5IHdhdDJ3YXNtOlxuICAgIC8vXG4gICAgLy8gKG1vZHVsZVxuICAgIC8vICAgKHR5cGUgJHQwIChmdW5jKSlcbiAgICAvLyAgIChmdW5jICRmMCAodHlwZSAkdDApXG4gICAgLy8gICAgIChkcm9wXG4gICAgLy8gICAgICAgKGkzMng0LmRvdF9pMTZ4OF9zXG4gICAgLy8gICAgICAgICAoaTh4MTYuc3BsYXRcbiAgICAvLyAgICAgICAgICAgKGkzMi5jb25zdCAwKSlcbiAgICAvLyAgICAgICAgICh2MTI4LmNvbnN0IGkzMng0IDB4MDAwMDAwMDAgMHgwMDAwMDAwMCAweDAwMDAwMDAwIDB4MDAwMDAwMDApKSkpKVxuXG4gICAgcmV0dXJuIFdlYkFzc2VtYmx5LnZhbGlkYXRlKG5ldyBVaW50OEFycmF5KFtcbiAgICAgIDAsICAgOTcsIDExNSwgMTA5LCAxLCAwLCAwLCAwLCAxLCA0LCAxLCA5NiwgMCwgMCwgMywgMiwgMSwgMCwgMTAsIDMwLCAxLCAgIDI4LCAgMCwgNjUsIDAsXG4gICAgICAyNTMsIDE1LCAyNTMsIDEyLCAgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgIDAsIDAsIDAsIDAsIDAsIDAsIDAsICAwLCAgMjUzLCAxODYsIDEsIDI2LCAxMVxuICAgIF0pKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuY29uc3QgZ2V0V2FzbUZpbGVOYW1lID0gKHVzZVNpbWQ6IGJvb2xlYW4sIHVzZVRocmVhZHM6IGJvb2xlYW4pID0+IHtcbiAgaWYgKHVzZVNpbWQpIHtcbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9UUkFJTklORykge1xuICAgICAgcmV0dXJuICdvcnQtdHJhaW5pbmctd2FzbS1zaW1kLndhc20nO1xuICAgIH1cbiAgICByZXR1cm4gdXNlVGhyZWFkcyA/ICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLndhc20nIDogJ29ydC13YXNtLXNpbWQud2FzbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHVzZVRocmVhZHMgPyAnb3J0LXdhc20tdGhyZWFkZWQud2FzbScgOiAnb3J0LXdhc20ud2FzbSc7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBpbml0aWFsaXplV2ViQXNzZW1ibHkgPSBhc3luYyhmbGFnczogRW52LldlYkFzc2VtYmx5RmxhZ3MpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgaWYgKGluaXRpYWxpemVkKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG4gIGlmIChpbml0aWFsaXppbmcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ211bHRpcGxlIGNhbGxzIHRvIFxcJ2luaXRpYWxpemVXZWJBc3NlbWJseSgpXFwnIGRldGVjdGVkLicpO1xuICB9XG4gIGlmIChhYm9ydGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcmV2aW91cyBjYWxsIHRvIFxcJ2luaXRpYWxpemVXZWJBc3NlbWJseSgpXFwnIGZhaWxlZC4nKTtcbiAgfVxuXG4gIGluaXRpYWxpemluZyA9IHRydWU7XG5cbiAgLy8gd2FzbSBmbGFncyBhcmUgYWxyZWFkeSBpbml0aWFsaXplZFxuICBjb25zdCB0aW1lb3V0ID0gZmxhZ3MuaW5pdFRpbWVvdXQhO1xuICBjb25zdCBudW1UaHJlYWRzID0gZmxhZ3MubnVtVGhyZWFkcyE7XG4gIGNvbnN0IHNpbWQgPSBmbGFncy5zaW1kITtcblxuICBjb25zdCB1c2VUaHJlYWRzID0gbnVtVGhyZWFkcyA+IDEgJiYgaXNNdWx0aVRocmVhZFN1cHBvcnRlZCgpO1xuICBjb25zdCB1c2VTaW1kID0gc2ltZCAmJiBpc1NpbWRTdXBwb3J0ZWQoKTtcblxuICBjb25zdCB3YXNtUGF0aHMgPSBmbGFncy53YXNtUGF0aHM7XG4gIGNvbnN0IHdhc21QcmVmaXhPdmVycmlkZSA9IHR5cGVvZiB3YXNtUGF0aHMgPT09ICdzdHJpbmcnID8gd2FzbVBhdGhzIDogdW5kZWZpbmVkO1xuICBjb25zdCB3YXNtRmlsZU5hbWUgPSBnZXRXYXNtRmlsZU5hbWUodXNlU2ltZCwgdXNlVGhyZWFkcyk7XG4gIGNvbnN0IHdhc21QYXRoT3ZlcnJpZGUgPSB0eXBlb2Ygd2FzbVBhdGhzID09PSAnb2JqZWN0JyA/IHdhc21QYXRoc1t3YXNtRmlsZU5hbWVdIDogdW5kZWZpbmVkO1xuXG4gIGxldCBpc1RpbWVvdXQgPSBmYWxzZTtcblxuICBjb25zdCB0YXNrczogQXJyYXk8UHJvbWlzZTx2b2lkPj4gPSBbXTtcblxuICAvLyBwcm9taXNlIGZvciB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ID4gMCkge1xuICAgIHRhc2tzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpc1RpbWVvdXQgPSB0cnVlO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9LCB0aW1lb3V0KTtcbiAgICB9KSk7XG4gIH1cblxuICAvLyBwcm9taXNlIGZvciBtb2R1bGUgaW5pdGlhbGl6YXRpb25cbiAgdGFza3MucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgZmFjdG9yeSA9IHVzZVRocmVhZHMgPyBvcnRXYXNtRmFjdG9yeVRocmVhZGVkIDogb3J0V2FzbUZhY3Rvcnk7XG4gICAgY29uc3QgY29uZmlnOiBQYXJ0aWFsPE9ydFdhc21Nb2R1bGU+ID0ge1xuICAgICAgbG9jYXRlRmlsZTogKGZpbGVOYW1lOiBzdHJpbmcsIHNjcmlwdERpcmVjdG9yeTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fVEhSRUFEICYmIHVzZVRocmVhZHMgJiYgZmlsZU5hbWUuZW5kc1dpdGgoJy53b3JrZXIuanMnKSAmJlxuICAgICAgICAgICAgdHlwZW9mIEJsb2IgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmV0dXJuIFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoXG4gICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIHJlcXVpcmUoKSBmdW5jdGlvbiBpcyBoYW5kbGVkIGJ5IGVzYnVpbGQgcGx1Z2luIHRvIGxvYWQgZmlsZSBjb250ZW50IGFzIHN0cmluZy5cbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0c1xuICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC53b3JrZXIuanMnKVxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB7dHlwZTogJ3RleHQvamF2YXNjcmlwdCd9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmlsZU5hbWUuZW5kc1dpdGgoJy53YXNtJykpIHtcbiAgICAgICAgICBpZiAod2FzbVBhdGhPdmVycmlkZSkge1xuICAgICAgICAgICAgcmV0dXJuIHdhc21QYXRoT3ZlcnJpZGU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgcHJlZml4ID0gd2FzbVByZWZpeE92ZXJyaWRlID8/IHNjcmlwdERpcmVjdG9yeTtcblxuICAgICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xuICAgICAgICAgICAgaWYgKHdhc21GaWxlTmFtZSA9PT0gJ29ydC13YXNtLXNpbWQud2FzbScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArICdvcnQtd2FzbS1zaW1kLmpzZXAud2FzbSc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHdhc21GaWxlTmFtZSA9PT0gJ29ydC13YXNtLXNpbWQtdGhyZWFkZWQud2FzbScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAud2FzbSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHByZWZpeCArIHdhc21GaWxlTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzY3JpcHREaXJlY3RvcnkgKyBmaWxlTmFtZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9USFJFQUQgJiYgdXNlVGhyZWFkcykge1xuICAgICAgaWYgKHR5cGVvZiBCbG9iID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25maWcubWFpblNjcmlwdFVybE9yQmxvYiA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdvcnQtd2FzbS10aHJlYWRlZC5qcycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc2NyaXB0U291cmNlQ29kZSA9IGB2YXIgb3J0V2FzbVRocmVhZGVkPSR7ZmFjdG9yeS50b1N0cmluZygpfTtgO1xuICAgICAgICBjb25maWcubWFpblNjcmlwdFVybE9yQmxvYiA9IG5ldyBCbG9iKFtzY3JpcHRTb3VyY2VDb2RlXSwge3R5cGU6ICd0ZXh0L2phdmFzY3JpcHQnfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZmFjdG9yeShjb25maWcpLnRoZW4oXG4gICAgICAgIC8vIHdhc20gbW9kdWxlIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICBtb2R1bGUgPT4ge1xuICAgICAgICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICB3YXNtID0gbW9kdWxlO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gd2FzbSBtb2R1bGUgZmFpbGVkIHRvIGluaXRpYWxpemVcbiAgICAgICAgKHdoYXQpID0+IHtcbiAgICAgICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgICAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICByZWplY3Qod2hhdCk7XG4gICAgICAgIH0pO1xuICB9KSk7XG5cbiAgYXdhaXQgUHJvbWlzZS5yYWNlKHRhc2tzKTtcblxuICBpZiAoaXNUaW1lb3V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBXZWJBc3NlbWJseSBiYWNrZW5kIGluaXRpYWxpemluZyBmYWlsZWQgZHVlIHRvIHRpbWVvdXQ6ICR7dGltZW91dH1tc2ApO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0SW5zdGFuY2UgPSAoKTogT3J0V2FzbU1vZHVsZSA9PiB7XG4gIGlmIChpbml0aWFsaXplZCAmJiB3YXNtKSB7XG4gICAgcmV0dXJuIHdhc207XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkFzc2VtYmx5IGlzIG5vdCBpbml0aWFsaXplZCB5ZXQuJyk7XG59O1xuXG5leHBvcnQgY29uc3QgZGlzcG9zZSA9ICgpOiB2b2lkID0+IHtcbiAgaWYgKGluaXRpYWxpemVkICYmICFpbml0aWFsaXppbmcgJiYgIWFib3J0ZWQpIHtcbiAgICBpbml0aWFsaXppbmcgPSB0cnVlO1xuXG4gICAgKHdhc20gYXMgT3J0V2FzbVRocmVhZGVkTW9kdWxlKS5QVGhyZWFkPy50ZXJtaW5hdGVBbGxUaHJlYWRzKCk7XG4gICAgd2FzbSA9IHVuZGVmaW5lZDtcblxuICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgIGluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgYWJvcnRlZCA9IHRydWU7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcblxuZXhwb3J0IGNvbnN0IGFsbG9jV2FzbVN0cmluZyA9IChkYXRhOiBzdHJpbmcsIGFsbG9jczogbnVtYmVyW10pOiBudW1iZXIgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBjb25zdCBkYXRhTGVuZ3RoID0gd2FzbS5sZW5ndGhCeXRlc1VURjgoZGF0YSkgKyAxO1xuICBjb25zdCBkYXRhT2Zmc2V0ID0gd2FzbS5fbWFsbG9jKGRhdGFMZW5ndGgpO1xuICB3YXNtLnN0cmluZ1RvVVRGOChkYXRhLCBkYXRhT2Zmc2V0LCBkYXRhTGVuZ3RoKTtcbiAgYWxsb2NzLnB1c2goZGF0YU9mZnNldCk7XG5cbiAgcmV0dXJuIGRhdGFPZmZzZXQ7XG59O1xuXG5pbnRlcmZhY2UgRXh0cmFPcHRpb25zSGFuZGxlciB7XG4gIChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgaXRlcmF0ZUV4dHJhT3B0aW9ucyA9XG4gICAgKG9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBwcmVmaXg6IHN0cmluZywgc2VlbjogV2Vha1NldDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4sXG4gICAgIGhhbmRsZXI6IEV4dHJhT3B0aW9uc0hhbmRsZXIpOiB2b2lkID0+IHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAnb2JqZWN0JyAmJiBvcHRpb25zICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChzZWVuLmhhcyhvcHRpb25zKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2lyY3VsYXIgcmVmZXJlbmNlIGluIG9wdGlvbnMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWVuLmFkZChvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBPYmplY3QuZW50cmllcyhvcHRpb25zKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IChwcmVmaXgpID8gcHJlZml4ICsga2V5IDoga2V5O1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIGl0ZXJhdGVFeHRyYU9wdGlvbnModmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIG5hbWUgKyAnLicsIHNlZW4sIGhhbmRsZXIpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGhhbmRsZXIobmFtZSwgdmFsdWUudG9TdHJpbmcoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBoYW5kbGVyKG5hbWUsICh2YWx1ZSkgPyAnMScgOiAnMCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgaGFuZGxlIGV4dHJhIGNvbmZpZyB0eXBlOiAke3R5cGVvZiB2YWx1ZX1gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuLyoqXG4gKiBjaGVjayB3ZWIgYXNzZW1ibHkgQVBJJ3MgbGFzdCBlcnJvciBhbmQgdGhyb3cgZXJyb3IgaWYgYW55IGVycm9yIG9jY3VycmVkLlxuICogQHBhcmFtIG1lc3NhZ2UgYSBtZXNzYWdlIHVzZWQgd2hlbiBhbiBlcnJvciBvY2N1cnJlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGNoZWNrTGFzdEVycm9yID0gKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBjb25zdCBzdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyYW1zT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDgpO1xuICAgIHdhc20uX09ydEdldExhc3RFcnJvcihwYXJhbXNPZmZzZXQsIHBhcmFtc09mZnNldCArIDQpO1xuICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uSEVBUDMyW3BhcmFtc09mZnNldCAvIDRdO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZVBvaW50ZXIgPSB3YXNtLkhFQVBVMzJbcGFyYW1zT2Zmc2V0IC8gNCArIDFdO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZVBvaW50ZXIgPyB3YXNtLlVURjhUb1N0cmluZyhlcnJvck1lc3NhZ2VQb2ludGVyKSA6ICcnO1xuICAgIHRocm93IG5ldyBFcnJvcihgJHttZXNzYWdlfSBFUlJPUl9DT0RFOiAke2Vycm9yQ29kZX0sIEVSUk9SX01FU1NBR0U6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9ufSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQge2FsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3IsIGl0ZXJhdGVFeHRyYU9wdGlvbnN9IGZyb20gJy4vd2FzbS11dGlscyc7XG5cbmV4cG9ydCBjb25zdCBzZXRSdW5PcHRpb25zID0gKG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFtudW1iZXIsIG51bWJlcltdXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBsZXQgcnVuT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGNvbnN0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBydW5PcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHRyeSB7XG4gICAgaWYgKG9wdGlvbnM/LmxvZ1NldmVyaXR5TGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID0gMjsgIC8vIERlZmF1bHQgdG8gd2FybmluZ1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHR5cGVvZiBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCkgfHxcbiAgICAgICAgb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsIDwgMCB8fCBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyBzZXJ2ZXJpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke29wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8ubG9nVmVyYm9zaXR5TGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCA9IDA7ICAvLyBEZWZhdWx0IHRvIDBcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgdmVyYm9zaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy50ZXJtaW5hdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy50ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgdGFnRGF0YU9mZnNldCA9IDA7XG4gICAgaWYgKG9wdGlvbnM/LnRhZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0YWdEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKG9wdGlvbnMudGFnLCBhbGxvY3MpO1xuICAgIH1cblxuICAgIHJ1bk9wdGlvbnNIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVSdW5PcHRpb25zKFxuICAgICAgICBydW5PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwhLCBydW5PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsISwgISFydW5PcHRpb25zLnRlcm1pbmF0ZSEsIHRhZ0RhdGFPZmZzZXQpO1xuICAgIGlmIChydW5PcHRpb25zSGFuZGxlID09PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgcnVuIG9wdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LmV4dHJhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGl0ZXJhdGVFeHRyYU9wdGlvbnMob3B0aW9ucy5leHRyYSwgJycsIG5ldyBXZWFrU2V0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PigpLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKGtleSwgYWxsb2NzKTtcbiAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHZhbHVlLCBhbGxvY3MpO1xuXG4gICAgICAgIGlmICh3YXNtLl9PcnRBZGRSdW5Db25maWdFbnRyeShydW5PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHJ1biBjb25maWcgZW50cnk6ICR7a2V5fSAtICR7dmFsdWV9LmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3J1bk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnMocnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb259IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvciwgaXRlcmF0ZUV4dHJhT3B0aW9uc30gZnJvbSAnLi93YXNtLXV0aWxzJztcblxuY29uc3QgZ2V0R3JhcGhPcHRpbXphdGlvbkxldmVsID0gKGdyYXBoT3B0aW1pemF0aW9uTGV2ZWw6IHN0cmluZ3x1bmtub3duKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChncmFwaE9wdGltaXphdGlvbkxldmVsKSB7XG4gICAgY2FzZSAnZGlzYWJsZWQnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnYmFzaWMnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnZXh0ZW5kZWQnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAnYWxsJzpcbiAgICAgIHJldHVybiA5OTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBncmFwaCBvcHRpbWl6YXRpb24gbGV2ZWw6ICR7Z3JhcGhPcHRpbWl6YXRpb25MZXZlbH1gKTtcbiAgfVxufTtcblxuY29uc3QgZ2V0RXhlY3V0aW9uTW9kZSA9IChleGVjdXRpb25Nb2RlOiAnc2VxdWVudGlhbCd8J3BhcmFsbGVsJyk6IG51bWJlciA9PiB7XG4gIHN3aXRjaCAoZXhlY3V0aW9uTW9kZSkge1xuICAgIGNhc2UgJ3NlcXVlbnRpYWwnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAncGFyYWxsZWwnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZXhlY3V0aW9uIG1vZGU6ICR7ZXhlY3V0aW9uTW9kZX1gKTtcbiAgfVxufTtcblxuY29uc3QgYXBwZW5kRGVmYXVsdE9wdGlvbnMgPSAob3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IHZvaWQgPT4ge1xuICBpZiAoIW9wdGlvbnMuZXh0cmEpIHtcbiAgICBvcHRpb25zLmV4dHJhID0ge307XG4gIH1cbiAgaWYgKCFvcHRpb25zLmV4dHJhLnNlc3Npb24pIHtcbiAgICBvcHRpb25zLmV4dHJhLnNlc3Npb24gPSB7fTtcbiAgfVxuICBjb25zdCBzZXNzaW9uID0gb3B0aW9ucy5leHRyYS5zZXNzaW9uIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIGlmICghc2Vzc2lvbi51c2Vfb3J0X21vZGVsX2J5dGVzX2RpcmVjdGx5KSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIHNlc3Npb24udXNlX29ydF9tb2RlbF9ieXRlc19kaXJlY3RseSA9ICcxJztcbiAgfVxuXG4gIC8vIGlmIHVzaW5nIEpTRVAgd2l0aCBXZWJHUFUsIGFsd2F5cyBkaXNhYmxlIG1lbW9yeSBwYXR0ZXJuXG4gIGlmIChvcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycyAmJlxuICAgICAgb3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMuc29tZShlcCA9PiAodHlwZW9mIGVwID09PSAnc3RyaW5nJyA/IGVwIDogZXAubmFtZSkgPT09ICd3ZWJncHUnKSkge1xuICAgIG9wdGlvbnMuZW5hYmxlTWVtUGF0dGVybiA9IGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBzZXRFeGVjdXRpb25Qcm92aWRlcnMgPVxuICAgIChzZXNzaW9uT3B0aW9uc0hhbmRsZTogbnVtYmVyLCBleGVjdXRpb25Qcm92aWRlcnM6IHJlYWRvbmx5IEluZmVyZW5jZVNlc3Npb24uRXhlY3V0aW9uUHJvdmlkZXJDb25maWdbXSxcbiAgICAgYWxsb2NzOiBudW1iZXJbXSk6IHZvaWQgPT4ge1xuICAgICAgZm9yIChjb25zdCBlcCBvZiBleGVjdXRpb25Qcm92aWRlcnMpIHtcbiAgICAgICAgbGV0IGVwTmFtZSA9IHR5cGVvZiBlcCA9PT0gJ3N0cmluZycgPyBlcCA6IGVwLm5hbWU7XG5cbiAgICAgICAgLy8gY2hlY2sgRVAgbmFtZVxuICAgICAgICBzd2l0Y2ggKGVwTmFtZSkge1xuICAgICAgICAgIGNhc2UgJ3hubnBhY2snOlxuICAgICAgICAgICAgZXBOYW1lID0gJ1hOTlBBQ0snO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnd2Vibm4nOlxuICAgICAgICAgICAgZXBOYW1lID0gJ1dFQk5OJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXAgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHdlYm5uT3B0aW9ucyA9IGVwIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViTk5FeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8uZGV2aWNlVHlwZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ2RldmljZVR5cGUnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh3ZWJubk9wdGlvbnMuZGV2aWNlVHlwZSwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdkZXZpY2VUeXBlJyAtICR7d2Vibm5PcHRpb25zLmRldmljZVR5cGV9LmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAod2Vibm5PcHRpb25zPy5udW1UaHJlYWRzKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bVRocmVhZHMgPSB3ZWJubk9wdGlvbnMubnVtVGhyZWFkcztcbiAgICAgICAgICAgICAgICAvLyBKdXN0IGlnbm9yZSBpbnZhbGlkIHdlYm5uT3B0aW9ucy5udW1UaHJlYWRzLlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbnVtVGhyZWFkcyAhPSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihudW1UaHJlYWRzKSB8fCBudW1UaHJlYWRzIDwgMCkge1xuICAgICAgICAgICAgICAgICAgbnVtVGhyZWFkcyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ251bVRocmVhZHMnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhudW1UaHJlYWRzLnRvU3RyaW5nKCksIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAnbnVtVGhyZWFkcycgLSAke3dlYm5uT3B0aW9ucy5udW1UaHJlYWRzfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8ucG93ZXJQcmVmZXJlbmNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygncG93ZXJQcmVmZXJlbmNlJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2Vibm5PcHRpb25zLnBvd2VyUHJlZmVyZW5jZSwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdwb3dlclByZWZlcmVuY2UnIC0gJHt3ZWJubk9wdGlvbnMucG93ZXJQcmVmZXJlbmNlfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3dlYmdwdSc6XG4gICAgICAgICAgICBlcE5hbWUgPSAnSlMnO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgY29uc3Qgd2ViZ3B1T3B0aW9ucyA9IGVwIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViR3B1RXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgICAgICAgICAgIGlmICh3ZWJncHVPcHRpb25zPy5wcmVmZXJyZWRMYXlvdXQpIHtcbiAgICAgICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQgIT09ICdOQ0hXJyAmJiB3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCAhPT0gJ05IV0MnKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHByZWZlcnJlZExheW91dCBtdXN0IGJlIGVpdGhlciAnTkNIVycgb3IgJ05IV0MnOiAke3dlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0fWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdwcmVmZXJyZWRMYXlvdXQnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdwcmVmZXJyZWRMYXlvdXQnIC0gJHt3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dH0uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd3YXNtJzpcbiAgICAgICAgICBjYXNlICdjcHUnOlxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgbm90IHN1cHBvcnRlZCBleGVjdXRpb24gcHJvdmlkZXI6ICR7ZXBOYW1lfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXBOYW1lRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhlcE5hbWUsIGFsbG9jcyk7XG4gICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcihzZXNzaW9uT3B0aW9uc0hhbmRsZSwgZXBOYW1lRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYXBwZW5kIGV4ZWN1dGlvbiBwcm92aWRlcjogJHtlcE5hbWV9LmApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuZXhwb3J0IGNvbnN0IHNldFNlc3Npb25PcHRpb25zID0gKG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogW251bWJlciwgbnVtYmVyW11dID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGxldCBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGNvbnN0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBzZXNzaW9uT3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGFwcGVuZERlZmF1bHRPcHRpb25zKHNlc3Npb25PcHRpb25zKTtcblxuICB0cnkge1xuICAgIGNvbnN0IGdyYXBoT3B0aW1pemF0aW9uTGV2ZWwgPSBnZXRHcmFwaE9wdGltemF0aW9uTGV2ZWwoc2Vzc2lvbk9wdGlvbnMuZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCA/PyAnYWxsJyk7XG4gICAgY29uc3QgZXhlY3V0aW9uTW9kZSA9IGdldEV4ZWN1dGlvbk1vZGUoc2Vzc2lvbk9wdGlvbnMuZXhlY3V0aW9uTW9kZSA/PyAnc2VxdWVudGlhbCcpO1xuICAgIGNvbnN0IGxvZ0lkRGF0YU9mZnNldCA9XG4gICAgICAgIHR5cGVvZiBzZXNzaW9uT3B0aW9ucy5sb2dJZCA9PT0gJ3N0cmluZycgPyBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMubG9nSWQsIGFsbG9jcykgOiAwO1xuXG4gICAgY29uc3QgbG9nU2V2ZXJpdHlMZXZlbCA9IHNlc3Npb25PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPz8gMjsgIC8vIERlZmF1bHQgdG8gMiAtIHdhcm5pbmdcbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIobG9nU2V2ZXJpdHlMZXZlbCkgfHwgbG9nU2V2ZXJpdHlMZXZlbCA8IDAgfHwgbG9nU2V2ZXJpdHlMZXZlbCA+IDQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHNlcnZlcml0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7bG9nU2V2ZXJpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dWZXJib3NpdHlMZXZlbCA9IHNlc3Npb25PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsID8/IDA7ICAvLyBEZWZhdWx0IHRvIDAgLSB2ZXJib3NlXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGxvZ1ZlcmJvc2l0eUxldmVsKSB8fCBsb2dWZXJib3NpdHlMZXZlbCA8IDAgfHwgbG9nVmVyYm9zaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyB2ZXJib3NpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke2xvZ1ZlcmJvc2l0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGltaXplZE1vZGVsRmlsZVBhdGhPZmZzZXQgPSB0eXBlb2Ygc2Vzc2lvbk9wdGlvbnMub3B0aW1pemVkTW9kZWxGaWxlUGF0aCA9PT0gJ3N0cmluZycgP1xuICAgICAgICBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMub3B0aW1pemVkTW9kZWxGaWxlUGF0aCwgYWxsb2NzKSA6XG4gICAgICAgIDA7XG5cbiAgICBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZVNlc3Npb25PcHRpb25zKFxuICAgICAgICBncmFwaE9wdGltaXphdGlvbkxldmVsLCAhIXNlc3Npb25PcHRpb25zLmVuYWJsZUNwdU1lbUFyZW5hLCAhIXNlc3Npb25PcHRpb25zLmVuYWJsZU1lbVBhdHRlcm4sIGV4ZWN1dGlvbk1vZGUsXG4gICAgICAgICEhc2Vzc2lvbk9wdGlvbnMuZW5hYmxlUHJvZmlsaW5nLCAwLCBsb2dJZERhdGFPZmZzZXQsIGxvZ1NldmVyaXR5TGV2ZWwsIGxvZ1ZlcmJvc2l0eUxldmVsLFxuICAgICAgICBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoT2Zmc2V0KTtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBzZXNzaW9uIG9wdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycykge1xuICAgICAgc2V0RXhlY3V0aW9uUHJvdmlkZXJzKHNlc3Npb25PcHRpb25zSGFuZGxlLCBzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMsIGFsbG9jcyk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmZyZWVEaW1lbnNpb25PdmVycmlkZXMpIHtcbiAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSkge1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSBuYW1lIG11c3QgYmUgYSBzdHJpbmc6ICR7bmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSB2YWx1ZSBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXI6ICR7dmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmFtZU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhuYW1lLCBhbGxvY3MpO1xuICAgICAgICBpZiAod2FzbS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlKHNlc3Npb25PcHRpb25zSGFuZGxlLCBuYW1lT2Zmc2V0LCB2YWx1ZSkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGU6ICR7bmFtZX0gLSAke3ZhbHVlfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5leHRyYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKHNlc3Npb25PcHRpb25zLmV4dHJhLCAnJywgbmV3IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KCksIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoa2V5LCBhbGxvY3MpO1xuICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcodmFsdWUsIGFsbG9jcyk7XG5cbiAgICAgICAgaWYgKHdhc20uX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJHtrZXl9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBbc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucyhzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge1RlbnNvcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuLy8gVGhpcyBmaWxlIGluY2x1ZGVzIGNvbW1vbiBkZWZpbml0aW9ucy4gVGhleSBkbyBOT1QgaGF2ZSBkZXBlbmRlbmN5IG9uIHRoZSBXZWJBc3NlbWJseSBpbnN0YW5jZS5cblxuLyoqXG4gKiBDb3BpZWQgZnJvbSBPTk5YIGRlZmluaXRpb24uIFVzZSB0aGlzIHRvIGRyb3AgZGVwZW5kZW5jeSAnb25ueF9wcm90bycgdG8gZGVjcmVhc2UgY29tcGlsZWQgLmpzIGZpbGUgc2l6ZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gRGF0YVR5cGUge1xuICB1bmRlZmluZWQgPSAwLFxuICBmbG9hdCA9IDEsXG4gIHVpbnQ4ID0gMixcbiAgaW50OCA9IDMsXG4gIHVpbnQxNiA9IDQsXG4gIGludDE2ID0gNSxcbiAgaW50MzIgPSA2LFxuICBpbnQ2NCA9IDcsXG4gIHN0cmluZyA9IDgsXG4gIGJvb2wgPSA5LFxuICBmbG9hdDE2ID0gMTAsXG4gIGRvdWJsZSA9IDExLFxuICB1aW50MzIgPSAxMixcbiAgdWludDY0ID0gMTMsXG4gIGNvbXBsZXg2NCA9IDE0LFxuICBjb21wbGV4MTI4ID0gMTUsXG4gIGJmbG9hdDE2ID0gMTZcbn1cblxuLyoqXG4gKiBNYXAgc3RyaW5nIHRlbnNvciBkYXRhIHRvIGVudW0gdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtID0gKHR5cGU6IHN0cmluZyk6IERhdGFUeXBlID0+IHtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnaW50OCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50ODtcbiAgICBjYXNlICd1aW50OCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDg7XG4gICAgY2FzZSAnYm9vbCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuYm9vbDtcbiAgICBjYXNlICdpbnQxNic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50MTY7XG4gICAgY2FzZSAndWludDE2JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50MTY7XG4gICAgY2FzZSAnaW50MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDMyO1xuICAgIGNhc2UgJ3VpbnQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDMyO1xuICAgIGNhc2UgJ2Zsb2F0MTYnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmZsb2F0MTY7XG4gICAgY2FzZSAnZmxvYXQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZmxvYXQ7XG4gICAgY2FzZSAnZmxvYXQ2NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZG91YmxlO1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuc3RyaW5nO1xuICAgIGNhc2UgJ2ludDY0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQ2NDtcbiAgICBjYXNlICd1aW50NjQnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQ2NDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlfWApO1xuICB9XG59O1xuXG4vKipcbiAqIE1hcCBlbnVtIHZhbHVlIHRvIHN0cmluZyB0ZW5zb3IgZGF0YVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcgPSAodHlwZVByb3RvOiBEYXRhVHlwZSk6IFRlbnNvci5UeXBlID0+IHtcbiAgc3dpdGNoICh0eXBlUHJvdG8pIHtcbiAgICBjYXNlIERhdGFUeXBlLmludDg6XG4gICAgICByZXR1cm4gJ2ludDgnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDg6XG4gICAgICByZXR1cm4gJ3VpbnQ4JztcbiAgICBjYXNlIERhdGFUeXBlLmJvb2w6XG4gICAgICByZXR1cm4gJ2Jvb2wnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50MTY6XG4gICAgICByZXR1cm4gJ2ludDE2JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQxNjpcbiAgICAgIHJldHVybiAndWludDE2JztcbiAgICBjYXNlIERhdGFUeXBlLmludDMyOlxuICAgICAgcmV0dXJuICdpbnQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50MzI6XG4gICAgICByZXR1cm4gJ3VpbnQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS5mbG9hdDE2OlxuICAgICAgcmV0dXJuICdmbG9hdDE2JztcbiAgICBjYXNlIERhdGFUeXBlLmZsb2F0OlxuICAgICAgcmV0dXJuICdmbG9hdDMyJztcbiAgICBjYXNlIERhdGFUeXBlLmRvdWJsZTpcbiAgICAgIHJldHVybiAnZmxvYXQ2NCc7XG4gICAgY2FzZSBEYXRhVHlwZS5zdHJpbmc6XG4gICAgICByZXR1cm4gJ3N0cmluZyc7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQ2NDpcbiAgICAgIHJldHVybiAnaW50NjQnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDY0OlxuICAgICAgcmV0dXJuICd1aW50NjQnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGVQcm90b31gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBnZXQgdGVuc29yIGVsZW1lbnQgc2l6ZSBpbiBieXRlcyBieSB0aGUgZ2l2ZW4gZGF0YSB0eXBlXG4gKiBAcmV0dXJucyBzaXplIGluIGludGVnZXIgb3IgdW5kZWZpbmVkIGlmIHRoZSBkYXRhIHR5cGUgaXMgbm90IHN1cHBvcnRlZFxuICovXG5leHBvcnQgY29uc3QgZ2V0VGVuc29yRWxlbWVudFNpemUgPSAoZGF0ZVR5cGU6IG51bWJlcik6IG51bWJlcnxcbiAgICB1bmRlZmluZWQgPT4gW3VuZGVmaW5lZCwgNCwgMSwgMSwgMiwgMiwgNCwgOCwgdW5kZWZpbmVkLCAxLCAyLCA4LCA0LCA4LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkXVtkYXRlVHlwZV07XG5cbi8qKlxuICogZ2V0IHR5cGVkIGFycmF5IGNvbnN0cnVjdG9yIGJ5IHRoZSBnaXZlbiB0ZW5zb3IgdHlwZVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yID0gKHR5cGU6IFRlbnNvci5UeXBlKTogRmxvYXQzMkFycmF5Q29uc3RydWN0b3J8VWludDhBcnJheUNvbnN0cnVjdG9yfFxuICAgIEludDhBcnJheUNvbnN0cnVjdG9yfFVpbnQxNkFycmF5Q29uc3RydWN0b3J8SW50MTZBcnJheUNvbnN0cnVjdG9yfEludDMyQXJyYXlDb25zdHJ1Y3RvcnxCaWdJbnQ2NEFycmF5Q29uc3RydWN0b3J8XG4gICAgVWludDhBcnJheUNvbnN0cnVjdG9yfEZsb2F0NjRBcnJheUNvbnN0cnVjdG9yfFVpbnQzMkFycmF5Q29uc3RydWN0b3J8QmlnVWludDY0QXJyYXlDb25zdHJ1Y3RvciA9PiB7XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnZmxvYXQxNic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdmbG9hdDMyJzpcbiAgICAgICAgICByZXR1cm4gRmxvYXQzMkFycmF5O1xuICAgICAgICBjYXNlICd1aW50OCc6XG4gICAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDgnOlxuICAgICAgICAgIHJldHVybiBJbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQxNic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdpbnQxNic6XG4gICAgICAgICAgcmV0dXJuIEludDE2QXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDMyJzpcbiAgICAgICAgICByZXR1cm4gSW50MzJBcnJheTtcbiAgICAgICAgY2FzZSAnYm9vbCc6XG4gICAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ2Zsb2F0NjQnOlxuICAgICAgICAgIHJldHVybiBGbG9hdDY0QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQzMic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQzMkFycmF5O1xuICAgICAgICBjYXNlICdpbnQ2NCc6XG4gICAgICAgICAgcmV0dXJuIEJpZ0ludDY0QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQ2NCc6XG4gICAgICAgICAgcmV0dXJuIEJpZ1VpbnQ2NEFycmF5O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgdHlwZTogJHt0eXBlfWApO1xuICAgICAgfVxuICAgIH07XG5cbi8qKlxuICogTWFwIHN0cmluZyBsb2cgbGV2ZWwgdG8gaW50ZWdlciB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgbG9nTGV2ZWxTdHJpbmdUb0VudW0gPSAobG9nTGV2ZWw/OiAndmVyYm9zZSd8J2luZm8nfCd3YXJuaW5nJ3wnZXJyb3InfCdmYXRhbCcpOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGxvZ0xldmVsKSB7XG4gICAgY2FzZSAndmVyYm9zZSc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdpbmZvJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAnZXJyb3InOlxuICAgICAgcmV0dXJuIDM7XG4gICAgY2FzZSAnZmF0YWwnOlxuICAgICAgcmV0dXJuIDQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgbG9nZ2luZyBsZXZlbDogJHtsb2dMZXZlbH1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiB0ZW5zb3IgdHlwZSBpcyBzdXBwb3J0ZWQgYnkgR1BVIGJ1ZmZlclxuICovXG5leHBvcnQgY29uc3QgaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlID0gKHR5cGU6IFRlbnNvci5UeXBlKTogdHlwZSBpcyBUZW5zb3IuR3B1QnVmZmVyRGF0YVR5cGVzID0+IHR5cGUgPT09ICdmbG9hdDMyJyB8fFxuICAgIHR5cGUgPT09ICdpbnQzMicgfHwgdHlwZSA9PT0gJ2ludDY0JyB8fCB0eXBlID09PSAnYm9vbCcgfHwgdHlwZSA9PT0gJ2Zsb2F0MTYnIHx8IHR5cGUgPT09ICd1aW50MzInO1xuXG4vKipcbiAqIE1hcCBzdHJpbmcgZGF0YSBsb2NhdGlvbiB0byBpbnRlZ2VyIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0gPSAobG9jYXRpb246IFRlbnNvci5EYXRhTG9jYXRpb24pOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGxvY2F0aW9uKSB7XG4gICAgY2FzZSAnbm9uZSc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdjcHUnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnY3B1LXBpbm5lZCc6XG4gICAgICByZXR1cm4gMjtcbiAgICBjYXNlICd0ZXh0dXJlJzpcbiAgICAgIHJldHVybiAzO1xuICAgIGNhc2UgJ2dwdS1idWZmZXInOlxuICAgICAgcmV0dXJuIDQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSBsb2NhdGlvbjogJHtsb2NhdGlvbn1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXAgaW50ZWdlciBkYXRhIGxvY2F0aW9uIHRvIHN0cmluZyB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZGF0YUxvY2F0aW9uRW51bVRvU3RyaW5nID0gKGxvY2F0aW9uOiBudW1iZXIpOiBUZW5zb3IuRGF0YUxvY2F0aW9ufHVuZGVmaW5lZCA9PlxuICAgIChbJ25vbmUnLCAnY3B1JywgJ2NwdS1waW5uZWQnLCAndGV4dHVyZScsICdncHUtYnVmZmVyJ10gYXMgY29uc3QpW2xvY2F0aW9uXTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtFbnYsIEluZmVyZW5jZVNlc3Npb24sIFRlbnNvcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtTZXJpYWxpemFibGVNb2RlbGRhdGEsIFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YSwgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGEsIFRlbnNvck1ldGFkYXRhfSBmcm9tICcuL3Byb3h5LW1lc3NhZ2VzJztcbmltcG9ydCB7c2V0UnVuT3B0aW9uc30gZnJvbSAnLi9ydW4tb3B0aW9ucyc7XG5pbXBvcnQge3NldFNlc3Npb25PcHRpb25zfSBmcm9tICcuL3Nlc3Npb24tb3B0aW9ucyc7XG5pbXBvcnQge2RhdGFMb2NhdGlvblN0cmluZ1RvRW51bSwgZ2V0VGVuc29yRWxlbWVudFNpemUsIGlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSwgbG9nTGV2ZWxTdHJpbmdUb0VudW0sIHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nLCB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bSwgdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yfSBmcm9tICcuL3dhc20tY29tbW9uJztcbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvcn0gZnJvbSAnLi93YXNtLXV0aWxzJztcblxubGV0IG9ydEVudkluaXRpYWxpemVkID0gZmFsc2U7XG5cbi8qKlxuICogZ2V0IHRoZSBpbnB1dC9vdXRwdXQgY291bnQgb2YgdGhlIHNlc3Npb24uXG4gKiBAcGFyYW0gc2Vzc2lvbkhhbmRsZSB0aGUgaGFuZGxlIHJlcHJlc2VudGluZyB0aGUgc2Vzc2lvbi4gc2hvdWxkIGJlIG5vbi16ZXJvLlxuICogQHJldHVybnMgYSB0dXBsZSBpbmNsdWRpbmcgMiBudW1iZXJzLCByZXByZXNlbnRpbmcgdGhlIGlucHV0IGNvdW50IGFuZCBvdXRwdXQgY291bnQuXG4gKi9cbmNvbnN0IGdldFNlc3Npb25JbnB1dE91dHB1dENvdW50ID0gKHNlc3Npb25IYW5kbGU6IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICB0cnkge1xuICAgIGNvbnN0IGRhdGFPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoOCk7XG4gICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudChzZXNzaW9uSGFuZGxlLCBkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgNCk7XG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IHNlc3Npb24gaW5wdXQvb3V0cHV0IGNvdW50LicpO1xuICAgIH1cbiAgICByZXR1cm4gW3dhc20uSEVBUDMyW2RhdGFPZmZzZXQgLyA0XSwgd2FzbS5IRUFQMzJbZGF0YU9mZnNldCAvIDQgKyAxXV07XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xuICB9XG59O1xuXG4vKipcbiAqIGluaXRpYWxpemUgT1JUIGVudmlyb25tZW50LlxuICogQHBhcmFtIG51bVRocmVhZHMgU2V0R2xvYmFsSW50cmFPcE51bVRocmVhZHMobnVtVGhyZWFkcylcbiAqIEBwYXJhbSBsb2dnaW5nTGV2ZWwgQ3JlYXRlRW52KHN0YXRpY19jYXN0PE9ydExvZ2dpbmdMZXZlbD4obG9nZ2luZ19sZXZlbCkpXG4gKi9cbmNvbnN0IGluaXRPcnQgPSAobnVtVGhyZWFkczogbnVtYmVyLCBsb2dnaW5nTGV2ZWw6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCBlcnJvckNvZGUgPSBnZXRJbnN0YW5jZSgpLl9PcnRJbml0KG51bVRocmVhZHMsIGxvZ2dpbmdMZXZlbCk7XG4gIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBpbml0aWFsaXplIG9ubnhydW50aW1lLicpO1xuICB9XG59O1xuXG4vKipcbiAqIGludGlhbGl6ZSBydW50aW1lIGVudmlyb25tZW50LlxuICogQHBhcmFtIGVudiBwYXNzZWQgaW4gdGhlIGVudmlyb25tZW50IGNvbmZpZyBvYmplY3QuXG4gKi9cbmV4cG9ydCBjb25zdCBpbml0UnVudGltZSA9IGFzeW5jKGVudjogRW52KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIC8vIGluaXQgT1JUXG4gIGluaXRPcnQoZW52Lndhc20ubnVtVGhyZWFkcyEsIGxvZ0xldmVsU3RyaW5nVG9FbnVtKGVudi5sb2dMZXZlbCkpO1xuXG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xuICAgIC8vIGluaXQgSlNFUCBpZiBhdmFpbGFibGVcblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG4gICAgY29uc3QgaW5pdEpzZXAgPSByZXF1aXJlKCcuL2pzZXAvaW5pdCcpLmluaXQ7XG4gICAgYXdhaXQgaW5pdEpzZXAoZ2V0SW5zdGFuY2UoKSwgZW52KTtcbiAgfVxuXG4gIG9ydEVudkluaXRpYWxpemVkID0gdHJ1ZTtcbn07XG5cbi8qKlxuICogdmFsaWQgZGF0YSBsb2NhdGlvbnMgZm9yIGlucHV0L291dHB1dCB0ZW5zb3JzLlxuICovXG50eXBlIFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0ID0gJ2NwdSd8J2NwdS1waW5uZWQnfCdncHUtYnVmZmVyJztcblxudHlwZSBJT0JpbmRpbmdTdGF0ZSA9IHtcbiAgLyoqXG4gICAqIHRoZSBoYW5kbGUgb2YgSU8gYmluZGluZy5cbiAgICovXG4gIHJlYWRvbmx5IGhhbmRsZTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiB0aGUgcHJlZmVycmVkIGxvY2F0aW9uIGZvciBlYWNoIG91dHB1dCB0ZW5zb3IuXG4gICAqXG4gICAqIHZhbHVlIGlzIG9uZSBvZiAnY3B1JywgJ2NwdS1waW5uZWQnLCAnZ3B1LWJ1ZmZlcicuXG4gICAqL1xuICByZWFkb25seSBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnM6IHJlYWRvbmx5IFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0W107XG5cbiAgLyoqXG4gICAqIGVudW0gdmFsdWUgb2YgdGhlIHByZWZlcnJlZCBsb2NhdGlvbiBmb3IgZWFjaCBvdXRwdXQgdGVuc29yLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZDogcmVhZG9ubHkgbnVtYmVyW107XG59O1xuXG4vKipcbiAqICB0dXBsZSBlbGVtZW50cyBhcmU6IEluZmVyZW5jZVNlc3Npb24gSUQ7IGlucHV0TmFtZXNVVEY4RW5jb2RlZDsgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDsgYmluZGluZ1N0YXRlXG4gKi9cbnR5cGUgU2Vzc2lvbk1ldGFkYXRhID0gW1xuICBpbmZlcmVuY2VTZXNzaW9uSWQ6IG51bWJlciwgaW5wdXROYW1lc1VURjhFbmNvZGVkOiBudW1iZXJbXSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDogbnVtYmVyW10sXG4gIGJpbmRpbmdTdGF0ZTogSU9CaW5kaW5nU3RhdGV8bnVsbFxuXTtcblxuY29uc3QgYWN0aXZlU2Vzc2lvbnMgPSBuZXcgTWFwPG51bWJlciwgU2Vzc2lvbk1ldGFkYXRhPigpO1xuXG5leHBvcnQgY29uc3QgaXNPcnRFbnZJbml0aWFsaXplZCA9ICgpOiBib29sZWFuID0+IG9ydEVudkluaXRpYWxpemVkO1xuXG4vKipcbiAqIGFsbG9jYXRlIHRoZSBtZW1vcnkgYW5kIG1lbWNweSB0aGUgbW9kZWwgYnl0ZXMsIHByZXBhcmluZyBmb3IgY3JlYXRpbmcgYW4gaW5zdGFuY2Ugb2YgSW5mZXJlbmNlU2Vzc2lvbi5cbiAqIEByZXR1cm5zIGEgMi1lbGVtZW50cyB0dXBsZSAtIHRoZSBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBhbGxvY2F0ZWQgYnVmZmVyXG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uQWxsb2NhdGUgPSAobW9kZWw6IFVpbnQ4QXJyYXkpOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IG1vZGVsRGF0YU9mZnNldCA9IHdhc20uX21hbGxvYyhtb2RlbC5ieXRlTGVuZ3RoKTtcbiAgaWYgKG1vZGVsRGF0YU9mZnNldCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgY3JlYXRlIGEgc2Vzc2lvbi4gZmFpbGVkIHRvIGFsbG9jYXRlIGEgYnVmZmVyIG9mIHNpemUgJHttb2RlbC5ieXRlTGVuZ3RofS5gKTtcbiAgfVxuICB3YXNtLkhFQVBVOC5zZXQobW9kZWwsIG1vZGVsRGF0YU9mZnNldCk7XG4gIHJldHVybiBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbC5ieXRlTGVuZ3RoXTtcbn07XG5cbi8qKlxuICogY3JlYXRlIGFuIGluZmVyZW5jZSBzZXNzaW9uIHVzaW5nIHRoZSBwcmVwYXJlZCBidWZmZXIgY29udGFpbmluZyB0aGUgbW9kZWwgZGF0YS5cbiAqIEBwYXJhbSBtb2RlbERhdGEgYSAyLWVsZW1lbnRzIHR1cGxlIGNvbnRhaW5pbmcgdGhlIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIG1vZGVsIGRhdGEgYnVmZmVyLlxuICogQHBhcmFtIG9wdGlvbnMgYW4gb3B0aW9uYWwgc2Vzc2lvbiBvcHRpb25zIG9iamVjdC5cbiAqIEByZXR1cm5zIGEgMy1lbGVtZW50cyB0dXBsZSBjb250YWluaW5nIFtzZXNzaW9uIGhhbmRsZSwgaW5wdXQgbmFtZXMsIG91dHB1dCBuYW1lc11cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVNlc3Npb25GaW5hbGl6ZSA9XG4gICAgKG1vZGVsRGF0YTogU2VyaWFsaXphYmxlTW9kZWxkYXRhLCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YSA9PiB7XG4gICAgICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgbGV0IHNlc3Npb25IYW5kbGUgPSAwO1xuICAgICAgbGV0IHNlc3Npb25PcHRpb25zSGFuZGxlID0gMDtcbiAgICAgIGxldCBpb0JpbmRpbmdIYW5kbGUgPSAwO1xuICAgICAgbGV0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcbiAgICAgIGNvbnN0IGlucHV0TmFtZXNVVEY4RW5jb2RlZCA9IFtdO1xuICAgICAgY29uc3Qgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCA9IFtdO1xuXG4gICAgICB0cnkge1xuICAgICAgICBbc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGFsbG9jc10gPSBzZXRTZXNzaW9uT3B0aW9ucyhvcHRpb25zKTtcblxuICAgICAgICBzZXNzaW9uSGFuZGxlID0gd2FzbS5fT3J0Q3JlYXRlU2Vzc2lvbihtb2RlbERhdGFbMF0sIG1vZGVsRGF0YVsxXSwgc2Vzc2lvbk9wdGlvbnNIYW5kbGUpO1xuICAgICAgICBpZiAoc2Vzc2lvbkhhbmRsZSA9PT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBhIHNlc3Npb24uJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBbaW5wdXRDb3VudCwgb3V0cHV0Q291bnRdID0gZ2V0U2Vzc2lvbklucHV0T3V0cHV0Q291bnQoc2Vzc2lvbkhhbmRsZSk7XG5cbiAgICAgICAgY29uc3QgaW5wdXROYW1lcyA9IFtdO1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lcyA9IFtdO1xuICAgICAgICBjb25zdCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnM6IFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0W10gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgICAgICBjb25zdCBuYW1lID0gd2FzbS5fT3J0R2V0SW5wdXROYW1lKHNlc3Npb25IYW5kbGUsIGkpO1xuICAgICAgICAgIGlmIChuYW1lID09PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBnZXQgYW4gaW5wdXQgbmFtZS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaW5wdXROYW1lc1VURjhFbmNvZGVkLnB1c2gobmFtZSk7XG4gICAgICAgICAgaW5wdXROYW1lcy5wdXNoKHdhc20uVVRGOFRvU3RyaW5nKG5hbWUpKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgICAgICBjb25zdCBuYW1lID0gd2FzbS5fT3J0R2V0T3V0cHV0TmFtZShzZXNzaW9uSGFuZGxlLCBpKTtcbiAgICAgICAgICBpZiAobmFtZSA9PT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIG91dHB1dCBuYW1lLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLnB1c2gobmFtZSk7XG4gICAgICAgICAgY29uc3QgbmFtZVN0cmluZyA9IHdhc20uVVRGOFRvU3RyaW5nKG5hbWUpO1xuICAgICAgICAgIG91dHB1dE5hbWVzLnB1c2gobmFtZVN0cmluZyk7XG5cbiAgICAgICAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUpIHtcbiAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdHlwZW9mIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uID09PSAnc3RyaW5nJyA/XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA6XG4gICAgICAgICAgICAgICAgb3B0aW9ucz8ucHJlZmVycmVkT3V0cHV0TG9jYXRpb24/LltuYW1lU3RyaW5nXSA/PyAnY3B1JztcbiAgICAgICAgICAgIGlmIChsb2NhdGlvbiAhPT0gJ2NwdScgJiYgbG9jYXRpb24gIT09ICdjcHUtcGlubmVkJyAmJiBsb2NhdGlvbiAhPT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IHN1cHBvcnRlZCBwcmVmZXJyZWQgb3V0cHV0IGxvY2F0aW9uOiAke2xvY2F0aW9ufS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5wdXNoKGxvY2F0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1c2UgSU8gYmluZGluZyBvbmx5IHdoZW4gYXQgbGVhc3Qgb25lIG91dHB1dCBpcyBwcmVmZmVyZWQgdG8gYmUgb24gR1BVLlxuICAgICAgICBsZXQgYmluZGluZ1N0YXRlOiBJT0JpbmRpbmdTdGF0ZXxudWxsID0gbnVsbDtcbiAgICAgICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVICYmIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5zb21lKGwgPT4gbCA9PT0gJ2dwdS1idWZmZXInKSkge1xuICAgICAgICAgIGlvQmluZGluZ0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZUJpbmRpbmcoc2Vzc2lvbkhhbmRsZSk7XG4gICAgICAgICAgaWYgKGlvQmluZGluZ0hhbmRsZSA9PT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgY3JlYXRlIElPIGJpbmRpbmcuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYmluZGluZ1N0YXRlID0ge1xuICAgICAgICAgICAgaGFuZGxlOiBpb0JpbmRpbmdIYW5kbGUsXG4gICAgICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMsXG4gICAgICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkOiBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMubWFwKGwgPT4gZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtKGwpKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgYWN0aXZlU2Vzc2lvbnMuc2V0KHNlc3Npb25IYW5kbGUsIFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGJpbmRpbmdTdGF0ZV0pO1xuICAgICAgICByZXR1cm4gW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXMsIG91dHB1dE5hbWVzXTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaW5wdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gICAgICAgIG91dHB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcblxuICAgICAgICBpZiAoaW9CaW5kaW5nSGFuZGxlICE9PSAwKSB7XG4gICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZUJpbmRpbmcoaW9CaW5kaW5nSGFuZGxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXNzaW9uSGFuZGxlICE9PSAwKSB7XG4gICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb24oc2Vzc2lvbkhhbmRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHdhc20uX2ZyZWUobW9kZWxEYXRhWzBdKTtcbiAgICAgICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zKHNlc3Npb25PcHRpb25zSGFuZGxlKTtcbiAgICAgICAgfVxuICAgICAgICBhbGxvY3MuZm9yRWFjaChhbGxvYyA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XG4gICAgICB9XG4gICAgfTtcblxuXG4vKipcbiAqIGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiBJbmZlcmVuY2VTZXNzaW9uLlxuICogQHJldHVybnMgdGhlIG1ldGFkYXRhIG9mIEluZmVyZW5jZVNlc3Npb24uIDAtdmFsdWUgaGFuZGxlIGZvciBmYWlsdXJlLlxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlU2Vzc2lvbiA9XG4gICAgKG1vZGVsOiBVaW50OEFycmF5LCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YSA9PiB7XG4gICAgICBjb25zdCBtb2RlbERhdGE6IFNlcmlhbGl6YWJsZU1vZGVsZGF0YSA9IGNyZWF0ZVNlc3Npb25BbGxvY2F0ZShtb2RlbCk7XG4gICAgICByZXR1cm4gY3JlYXRlU2Vzc2lvbkZpbmFsaXplKG1vZGVsRGF0YSwgb3B0aW9ucyk7XG4gICAgfTtcblxuZXhwb3J0IGNvbnN0IHJlbGVhc2VTZXNzaW9uID0gKHNlc3Npb25JZDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJlbGVhc2Ugc2Vzc2lvbi4gaW52YWxpZCBzZXNzaW9uIGlkOiAke3Nlc3Npb25JZH1gKTtcbiAgfVxuICBjb25zdCBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkLCBpb0JpbmRpbmdTdGF0ZV0gPSBzZXNzaW9uO1xuXG4gIGlmIChpb0JpbmRpbmdTdGF0ZSkge1xuICAgIHdhc20uX09ydFJlbGVhc2VCaW5kaW5nKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gIH1cblxuICB3YXNtLmpzZXBVbnJlZ2lzdGVyQnVmZmVycz8uKHNlc3Npb25JZCk7XG5cbiAgaW5wdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gIG91dHB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcbiAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb24oc2Vzc2lvbkhhbmRsZSk7XG4gIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uSWQpO1xufTtcblxuZXhwb3J0IGNvbnN0IHByZXBhcmVJbnB1dE91dHB1dFRlbnNvciA9XG4gICAgKHRlbnNvcjogVGVuc29yTWV0YWRhdGF8bnVsbCwgdGVuc29ySGFuZGxlczogbnVtYmVyW10sIGFsbG9jczogbnVtYmVyW10sIHNlc3Npb25JZDogbnVtYmVyLCBpbmRleDogbnVtYmVyKTpcbiAgICAgICAgdm9pZCA9PiB7XG4gICAgICAgICAgaWYgKCF0ZW5zb3IpIHtcbiAgICAgICAgICAgIHRlbnNvckhhbmRsZXMucHVzaCgwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICAgIGNvbnN0IGRhdGFUeXBlID0gdGVuc29yWzBdO1xuICAgICAgICAgIGNvbnN0IGRpbXMgPSB0ZW5zb3JbMV07XG4gICAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0ZW5zb3JbM107XG5cbiAgICAgICAgICBsZXQgcmF3RGF0YTogbnVtYmVyO1xuICAgICAgICAgIGxldCBkYXRhQnl0ZUxlbmd0aDogbnVtYmVyO1xuXG4gICAgICAgICAgaWYgKGRhdGFUeXBlID09PSAnc3RyaW5nJyAmJiBsb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmluZyB0ZW5zb3IgaXMgbm90IHN1cHBvcnRlZCBvbiBHUFUuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGxvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgIGNvbnN0IGdwdUJ1ZmZlciA9IHRlbnNvclsyXS5ncHVCdWZmZXIgYXMgR1BVQnVmZmVyO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNpemVJbkJ5dGVzID0gZ2V0VGVuc29yRWxlbWVudFNpemUodGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0oZGF0YVR5cGUpKSE7XG4gICAgICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IGRpbXMucmVkdWNlKChhLCBiKSA9PiBhICogYiwgMSkgKiBlbGVtZW50U2l6ZUluQnl0ZXM7XG4gICAgICAgICAgICByYXdEYXRhID0gd2FzbS5qc2VwUmVnaXN0ZXJCdWZmZXIoc2Vzc2lvbklkLCBpbmRleCwgZ3B1QnVmZmVyLCBkYXRhQnl0ZUxlbmd0aCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB0ZW5zb3JbMl07XG5cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgIC8vIHN0cmluZyB0ZW5zb3JcbiAgICAgICAgICAgICAgZGF0YUJ5dGVMZW5ndGggPSA0ICogZGF0YS5sZW5ndGg7XG4gICAgICAgICAgICAgIHJhd0RhdGEgPSB3YXNtLl9tYWxsb2MoZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgICAgICAgICBhbGxvY3MucHVzaChyYXdEYXRhKTtcbiAgICAgICAgICAgICAgbGV0IGRhdGFJbmRleCA9IHJhd0RhdGEgLyA0O1xuICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGB0ZW5zb3IgZGF0YSBhdCBpbmRleCAke2l9IGlzIG5vdCBhIHN0cmluZ2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB3YXNtLkhFQVBVMzJbZGF0YUluZGV4KytdID0gYWxsb2NXYXNtU3RyaW5nKGRhdGFbaV0sIGFsbG9jcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gZGF0YS5ieXRlTGVuZ3RoO1xuICAgICAgICAgICAgICByYXdEYXRhID0gd2FzbS5fbWFsbG9jKGRhdGFCeXRlTGVuZ3RoKTtcbiAgICAgICAgICAgICAgYWxsb2NzLnB1c2gocmF3RGF0YSk7XG4gICAgICAgICAgICAgIHdhc20uSEVBUFU4LnNldChuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhQnl0ZUxlbmd0aCksIHJhd0RhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgICAgICAgICBjb25zdCBkaW1zT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiBkaW1zLmxlbmd0aCk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBkaW1JbmRleCA9IGRpbXNPZmZzZXQgLyA0O1xuICAgICAgICAgICAgZGltcy5mb3JFYWNoKGQgPT4gd2FzbS5IRUFQMzJbZGltSW5kZXgrK10gPSBkKTtcbiAgICAgICAgICAgIGNvbnN0IHRlbnNvciA9IHdhc20uX09ydENyZWF0ZVRlbnNvcihcbiAgICAgICAgICAgICAgICB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bShkYXRhVHlwZSksIHJhd0RhdGEsIGRhdGFCeXRlTGVuZ3RoLCBkaW1zT2Zmc2V0LCBkaW1zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0obG9jYXRpb24pKTtcbiAgICAgICAgICAgIGlmICh0ZW5zb3IgPT09IDApIHtcbiAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGNyZWF0ZSB0ZW5zb3IgZm9yIGlucHV0L291dHB1dC4gc2Vzc2lvbj0ke3Nlc3Npb25JZH0sIGluZGV4PSR7aW5kZXh9LmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGVuc29ySGFuZGxlcy5wdXNoKHRlbnNvcik7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbi8qKlxuICogcGVyZm9ybSBpbmZlcmVuY2UgcnVuXG4gKi9cbmV4cG9ydCBjb25zdCBydW4gPSBhc3luYyhcbiAgICBzZXNzaW9uSWQ6IG51bWJlciwgaW5wdXRJbmRpY2VzOiBudW1iZXJbXSwgaW5wdXRUZW5zb3JzOiBUZW5zb3JNZXRhZGF0YVtdLCBvdXRwdXRJbmRpY2VzOiBudW1iZXJbXSxcbiAgICBvdXRwdXRUZW5zb3JzOiBBcnJheTxUZW5zb3JNZXRhZGF0YXxudWxsPiwgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogUHJvbWlzZTxUZW5zb3JNZXRhZGF0YVtdPiA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJ1biBpbmZlcmVuY2UuIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3QgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgaW9CaW5kaW5nU3RhdGVdID0gc2Vzc2lvbjtcblxuICBjb25zdCBpbnB1dENvdW50ID0gaW5wdXRJbmRpY2VzLmxlbmd0aDtcbiAgY29uc3Qgb3V0cHV0Q291bnQgPSBvdXRwdXRJbmRpY2VzLmxlbmd0aDtcblxuICBsZXQgcnVuT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGxldCBydW5PcHRpb25zQWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IGlucHV0VGVuc29ySGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3Qgb3V0cHV0VGVuc29ySGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgaW5wdXRPdXRwdXRBbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgYmVmb3JlUnVuU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICBjb25zdCBpbnB1dFZhbHVlc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhpbnB1dENvdW50ICogNCk7XG4gIGNvbnN0IGlucHV0TmFtZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoaW5wdXRDb3VudCAqIDQpO1xuICBjb25zdCBvdXRwdXRWYWx1ZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2Mob3V0cHV0Q291bnQgKiA0KTtcbiAgY29uc3Qgb3V0cHV0TmFtZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2Mob3V0cHV0Q291bnQgKiA0KTtcblxuICB0cnkge1xuICAgIFtydW5PcHRpb25zSGFuZGxlLCBydW5PcHRpb25zQWxsb2NzXSA9IHNldFJ1bk9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAvLyBjcmVhdGUgaW5wdXQgdGVuc29yc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IoaW5wdXRUZW5zb3JzW2ldLCBpbnB1dFRlbnNvckhhbmRsZXMsIGlucHV0T3V0cHV0QWxsb2NzLCBzZXNzaW9uSWQsIGlucHV0SW5kaWNlc1tpXSk7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIG91dHB1dCB0ZW5zb3JzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IoXG4gICAgICAgICAgb3V0cHV0VGVuc29yc1tpXSwgb3V0cHV0VGVuc29ySGFuZGxlcywgaW5wdXRPdXRwdXRBbGxvY3MsIHNlc3Npb25JZCwgaW5wdXRDb3VudCArIG91dHB1dEluZGljZXNbaV0pO1xuICAgIH1cblxuICAgIGxldCBpbnB1dFZhbHVlc0luZGV4ID0gaW5wdXRWYWx1ZXNPZmZzZXQgLyA0O1xuICAgIGxldCBpbnB1dE5hbWVzSW5kZXggPSBpbnB1dE5hbWVzT2Zmc2V0IC8gNDtcbiAgICBsZXQgb3V0cHV0VmFsdWVzSW5kZXggPSBvdXRwdXRWYWx1ZXNPZmZzZXQgLyA0O1xuICAgIGxldCBvdXRwdXROYW1lc0luZGV4ID0gb3V0cHV0TmFtZXNPZmZzZXQgLyA0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICB3YXNtLkhFQVBVMzJbaW5wdXRWYWx1ZXNJbmRleCsrXSA9IGlucHV0VGVuc29ySGFuZGxlc1tpXTtcbiAgICAgIHdhc20uSEVBUFUzMltpbnB1dE5hbWVzSW5kZXgrK10gPSBpbnB1dE5hbWVzVVRGOEVuY29kZWRbaW5wdXRJbmRpY2VzW2ldXTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzSW5kZXgrK10gPSBvdXRwdXRUZW5zb3JIYW5kbGVzW2ldO1xuICAgICAgd2FzbS5IRUFQVTMyW291dHB1dE5hbWVzSW5kZXgrK10gPSBvdXRwdXROYW1lc1VURjhFbmNvZGVkW291dHB1dEluZGljZXNbaV1dO1xuICAgIH1cblxuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiBpb0JpbmRpbmdTdGF0ZSkge1xuICAgICAgY29uc3Qge2hhbmRsZSwgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkfSA9IGlvQmluZGluZ1N0YXRlO1xuXG4gICAgICBpZiAoaW5wdXROYW1lc1VURjhFbmNvZGVkLmxlbmd0aCAhPT0gaW5wdXRDb3VudCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGlucHV0IGNvdW50IGZyb20gZmVlZHMgKCR7XG4gICAgICAgICAgICBpbnB1dENvdW50fSkgaXMgZXhwZWN0ZWQgdG8gYmUgYWx3YXlzIGVxdWFsIHRvIG1vZGVsJ3MgaW5wdXQgY291bnQgKCR7aW5wdXROYW1lc1VURjhFbmNvZGVkLmxlbmd0aH0pLmApO1xuICAgICAgfVxuXG4gICAgICAvLyBwcm9jZXNzIGlucHV0c1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBpbnB1dEluZGljZXNbaV07XG4gICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydEJpbmRJbnB1dChoYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIGlucHV0VGVuc29ySGFuZGxlc1tpXSk7XG4gICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBpbnB1dFske2l9XSBmb3Igc2Vzc2lvbj0ke3Nlc3Npb25JZH0uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcHJvY2VzcyBwcmUtYWxsb2NhdGVkIG91dHB1dHNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgICBjb25zdCBpbmRleCA9IG91dHB1dEluZGljZXNbaV07XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gb3V0cHV0VGVuc29yc1tpXT8uWzNdOyAgLy8gdW5kZWZpbmVkIG1lYW5zIG91dHB1dCBpcyBub3QgcHJlLWFsbG9jYXRlZC5cblxuICAgICAgICBpZiAobG9jYXRpb24pIHtcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgcHJlLWFsbG9jYXRlZC4gYmluZCB0aGUgdGVuc29yLlxuICAgICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEJpbmRPdXRwdXQoaGFuZGxlLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkW2luZGV4XSwgb3V0cHV0VGVuc29ySGFuZGxlc1tpXSwgMCk7XG4gICAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgcHJlLWFsbG9jYXRlZCBvdXRwdXRbJHtpfV0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgbm90IHByZS1hbGxvY2F0ZWQuIHJlc2V0IHByZWZlcnJlZCBsb2NhdGlvbi5cbiAgICAgICAgICBjb25zdCBlcnJvckNvZGUgPVxuICAgICAgICAgICAgICB3YXNtLl9PcnRCaW5kT3V0cHV0KGhhbmRsZSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIDAsIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWRbaW5kZXhdKTtcbiAgICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBvdXRwdXRbJHtpfV0gdG8gJHtvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbaV19IGZvciBzZXNzaW9uPSR7c2Vzc2lvbklkfS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZXJyb3JDb2RlOiBudW1iZXI7XG5cbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bldpdGhCaW5kaW5nKFxuICAgICAgICAgIHNlc3Npb25IYW5kbGUsIGlvQmluZGluZ1N0YXRlLmhhbmRsZSwgb3V0cHV0Q291bnQsIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bihcbiAgICAgICAgICBzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzT2Zmc2V0LCBpbnB1dFZhbHVlc09mZnNldCwgaW5wdXRDb3VudCwgb3V0cHV0TmFtZXNPZmZzZXQsIG91dHB1dENvdW50LFxuICAgICAgICAgIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ2ZhaWxlZCB0byBjYWxsIE9ydFJ1bigpLicpO1xuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dDogVGVuc29yTWV0YWRhdGFbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzT2Zmc2V0IC8gNCArIGldO1xuICAgICAgaWYgKHRlbnNvciA9PT0gb3V0cHV0VGVuc29ySGFuZGxlc1tpXSkge1xuICAgICAgICAvLyBvdXRwdXQgdGVuc29yIGlzIHByZS1hbGxvY2F0ZWQuIG5vIG5lZWQgdG8gY29weSBkYXRhLlxuICAgICAgICBvdXRwdXQucHVzaChvdXRwdXRUZW5zb3JzW2ldISk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICAgICAgLy8gc3RhY2sgYWxsb2NhdGUgNCBwb2ludGVyIHZhbHVlXG4gICAgICBjb25zdCB0ZW5zb3JEYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiA0KTtcblxuICAgICAgbGV0IGtlZXBPdXRwdXRUZW5zb3IgPSBmYWxzZTtcbiAgICAgIGxldCB0eXBlOiBUZW5zb3IuVHlwZXx1bmRlZmluZWQsIGRhdGFPZmZzZXQgPSAwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0VGVuc29yRGF0YShcbiAgICAgICAgICAgIHRlbnNvciwgdGVuc29yRGF0YU9mZnNldCwgdGVuc29yRGF0YU9mZnNldCArIDQsIHRlbnNvckRhdGFPZmZzZXQgKyA4LCB0ZW5zb3JEYXRhT2Zmc2V0ICsgMTIpO1xuICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGFjY2VzcyBvdXRwdXQgdGVuc29yIGRhdGEgb24gaW5kZXggJHtpfS5gKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGVuc29yRGF0YUluZGV4ID0gdGVuc29yRGF0YU9mZnNldCAvIDQ7XG4gICAgICAgIGNvbnN0IGRhdGFUeXBlID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgZGF0YU9mZnNldCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGNvbnN0IGRpbXNPZmZzZXQgPSB3YXNtLkhFQVBVMzJbdGVuc29yRGF0YUluZGV4KytdO1xuICAgICAgICBjb25zdCBkaW1zTGVuZ3RoID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgY29uc3QgZGltcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgIGRpbXMucHVzaCh3YXNtLkhFQVBVMzJbZGltc09mZnNldCAvIDQgKyBpXSk7XG4gICAgICAgIH1cbiAgICAgICAgd2FzbS5fT3J0RnJlZShkaW1zT2Zmc2V0KTtcblxuICAgICAgICBjb25zdCBzaXplID0gZGltcy5yZWR1Y2UoKGEsIGIpID0+IGEgKiBiLCAxKTtcbiAgICAgICAgdHlwZSA9IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nKGRhdGFUeXBlKTtcblxuICAgICAgICBjb25zdCBwcmVmZXJyZWRMb2NhdGlvbiA9IGlvQmluZGluZ1N0YXRlPy5vdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbb3V0cHV0SW5kaWNlc1tpXV07XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3RyaW5nIHRlbnNvciBpcyBub3Qgc3VwcG9ydGVkIG9uIEdQVS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgc3RyaW5nRGF0YTogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBsZXQgZGF0YUluZGV4ID0gZGF0YU9mZnNldCAvIDQ7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHdhc20uSEVBUFUzMltkYXRhSW5kZXgrK107XG4gICAgICAgICAgICBjb25zdCBtYXhCeXRlc1RvUmVhZCA9IGkgPT09IHNpemUgLSAxID8gdW5kZWZpbmVkIDogd2FzbS5IRUFQVTMyW2RhdGFJbmRleF0gLSBvZmZzZXQ7XG4gICAgICAgICAgICBzdHJpbmdEYXRhLnB1c2god2FzbS5VVEY4VG9TdHJpbmcob2Zmc2V0LCBtYXhCeXRlc1RvUmVhZCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgc3RyaW5nRGF0YSwgJ2NwdSddKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBhIGNlcnRhaW4gb3V0cHV0J3MgcHJlZmVycmVkIGxvY2F0aW9uIGlzIEdQVSBidXQgdGhlIHRlbnNvciBpcyBlbXB0eSwgd2Ugc3RpbGwgbmVlZCB0byBjcmVhdGUgYSBDUFVcbiAgICAgICAgICAvLyB0ZW5zb3IgZm9yIGl0LiBUaGVyZSBpcyBubyBtYXBwaW5nIEdQVSBidWZmZXIgZm9yIGFuIGVtcHR5IHRlbnNvci5cbiAgICAgICAgICBpZiAocHJlZmVycmVkTG9jYXRpb24gPT09ICdncHUtYnVmZmVyJyAmJiBzaXplID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZ3B1QnVmZmVyID0gd2FzbS5qc2VwR2V0QnVmZmVyKGRhdGFPZmZzZXQpO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNpemUgPSBnZXRUZW5zb3JFbGVtZW50U2l6ZShkYXRhVHlwZSk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudFNpemUgPT09IHVuZGVmaW5lZCB8fCAhaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGV9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRvIG5vdCByZWxlYXNlIHRoZSB0ZW5zb3IgcmlnaHQgbm93LiBpdCB3aWxsIGJlIHJlbGVhc2VkIHdoZW4gdXNlciBjYWxscyB0ZW5zb3IuZGlzcG9zZSgpLlxuICAgICAgICAgICAga2VlcE91dHB1dFRlbnNvciA9IHRydWU7XG5cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFtcbiAgICAgICAgICAgICAgdHlwZSwgZGltcywge1xuICAgICAgICAgICAgICAgIGdwdUJ1ZmZlcixcbiAgICAgICAgICAgICAgICBkb3dubG9hZDogd2FzbS5qc2VwQ3JlYXRlRG93bmxvYWRlcihncHVCdWZmZXIsIHNpemUgKiBlbGVtZW50U2l6ZSwgdHlwZSksXG4gICAgICAgICAgICAgICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ2dwdS1idWZmZXInXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZWRBcnJheUNvbnN0cnVjdG9yID0gdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yKHR5cGUpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyB0eXBlZEFycmF5Q29uc3RydWN0b3Ioc2l6ZSk7XG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpXG4gICAgICAgICAgICAgICAgLnNldCh3YXNtLkhFQVBVOC5zdWJhcnJheShkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgZGF0YS5ieXRlTGVuZ3RoKSk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgZGF0YSwgJ2NwdSddKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKGJlZm9yZUdldFRlbnNvckRhdGFTdGFjayk7XG4gICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiBkYXRhT2Zmc2V0KSB7XG4gICAgICAgICAgd2FzbS5fZnJlZShkYXRhT2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWtlZXBPdXRwdXRUZW5zb3IpIHtcbiAgICAgICAgICB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHRlbnNvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIHdhc20uX09ydENsZWFyQm91bmRPdXRwdXRzKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShiZWZvcmVSdW5TdGFjayk7XG5cbiAgICBpbnB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIG91dHB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIGlucHV0T3V0cHV0QWxsb2NzLmZvckVhY2gocCA9PiB3YXNtLl9mcmVlKHApKTtcblxuICAgIGlmIChydW5PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlUnVuT3B0aW9ucyhydW5PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgcnVuT3B0aW9uc0FsbG9jcy5mb3JFYWNoKHAgPT4gd2FzbS5fZnJlZShwKSk7XG4gIH1cbn07XG5cbi8qKlxuICogZW5kIHByb2ZpbGluZ1xuICovXG5leHBvcnQgY29uc3QgZW5kUHJvZmlsaW5nID0gKHNlc3Npb25JZDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzZXNzaW9uIGlkJyk7XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbkhhbmRsZSA9IHNlc3Npb25bMF07XG5cbiAgLy8gcHJvZmlsZSBmaWxlIG5hbWUgaXMgbm90IHVzZWQgeWV0LCBidXQgaXQgbXVzdCBiZSBmcmVlZC5cbiAgY29uc3QgcHJvZmlsZUZpbGVOYW1lID0gd2FzbS5fT3J0RW5kUHJvZmlsaW5nKHNlc3Npb25IYW5kbGUpO1xuICBpZiAocHJvZmlsZUZpbGVOYW1lID09PSAwKSB7XG4gICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIHByb2ZpbGUgZmlsZSBuYW1lLicpO1xuICB9XG4gIHdhc20uX09ydEZyZWUocHJvZmlsZUZpbGVOYW1lKTtcbn07XG5cbmV4cG9ydCBjb25zdCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycyA9ICh0ZW5zb3JzOiByZWFkb25seSBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YVtdKTogQXJyYXlCdWZmZXJMaWtlW10gPT4ge1xuICBjb25zdCBidWZmZXJzOiBBcnJheUJ1ZmZlckxpa2VbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHRlbnNvciBvZiB0ZW5zb3JzKSB7XG4gICAgY29uc3QgZGF0YSA9IHRlbnNvclsyXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkgJiYgJ2J1ZmZlcicgaW4gZGF0YSkge1xuICAgICAgYnVmZmVycy5wdXNoKGRhdGEuYnVmZmVyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ1ZmZlcnM7XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBsaWI9XCJ3ZWJ3b3JrZXJcIiAvPlxuXG5pbXBvcnQge09ydFdhc21NZXNzYWdlfSBmcm9tICcuLi9wcm94eS1tZXNzYWdlcyc7XG5pbXBvcnQge2NyZWF0ZVNlc3Npb24sIGNyZWF0ZVNlc3Npb25BbGxvY2F0ZSwgY3JlYXRlU2Vzc2lvbkZpbmFsaXplLCBlbmRQcm9maWxpbmcsIGV4dHJhY3RUcmFuc2ZlcmFibGVCdWZmZXJzLCBpbml0UnVudGltZSwgaXNPcnRFbnZJbml0aWFsaXplZCwgcmVsZWFzZVNlc3Npb24sIHJ1bn0gZnJvbSAnLi4vd2FzbS1jb3JlLWltcGwnO1xuaW1wb3J0IHtpbml0aWFsaXplV2ViQXNzZW1ibHl9IGZyb20gJy4uL3dhc20tZmFjdG9yeSc7XG5cbnNlbGYub25tZXNzYWdlID0gKGV2OiBNZXNzYWdlRXZlbnQ8T3J0V2FzbU1lc3NhZ2U+KTogdm9pZCA9PiB7XG4gIHN3aXRjaCAoZXYuZGF0YS50eXBlKSB7XG4gICAgY2FzZSAnaW5pdC13YXNtJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIGluaXRpYWxpemVXZWJBc3NlbWJseShldi5kYXRhLmluKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgKCkgPT4gcG9zdE1lc3NhZ2Uoe3R5cGU6ICdpbml0LXdhc20nfSBhcyBPcnRXYXNtTWVzc2FnZSksXG4gICAgICAgICAgICAgICAgZXJyID0+IHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC13YXNtJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSkpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC13YXNtJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdpbml0LW9ydCc6XG4gICAgICB0cnkge1xuICAgICAgICBpbml0UnVudGltZShldi5kYXRhLmluKS50aGVuKCgpID0+IHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC1vcnQnfSBhcyBPcnRXYXNtTWVzc2FnZSksIGVyciA9PiBwb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5pdC1vcnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBhcyBPcnRXYXNtTWVzc2FnZSkpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC1vcnQnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NyZWF0ZV9hbGxvY2F0ZSc6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7bW9kZWx9ID0gZXYuZGF0YS5pbiE7XG4gICAgICAgIGNvbnN0IG1vZGVsZGF0YSA9IGNyZWF0ZVNlc3Npb25BbGxvY2F0ZShtb2RlbCk7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnY3JlYXRlX2FsbG9jYXRlJywgb3V0OiBtb2RlbGRhdGF9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2NyZWF0ZV9hbGxvY2F0ZScsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY3JlYXRlX2ZpbmFsaXplJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHttb2RlbGRhdGEsIG9wdGlvbnN9ID0gZXYuZGF0YS5pbiE7XG4gICAgICAgIGNvbnN0IHNlc3Npb25NZXRhZGF0YSA9IGNyZWF0ZVNlc3Npb25GaW5hbGl6ZShtb2RlbGRhdGEsIG9wdGlvbnMpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2NyZWF0ZV9maW5hbGl6ZScsIG91dDogc2Vzc2lvbk1ldGFkYXRhfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdjcmVhdGVfZmluYWxpemUnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NyZWF0ZSc6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7bW9kZWwsIG9wdGlvbnN9ID0gZXYuZGF0YS5pbiE7XG4gICAgICAgIGNvbnN0IHNlc3Npb25NZXRhZGF0YSA9IGNyZWF0ZVNlc3Npb24obW9kZWwsIG9wdGlvbnMpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2NyZWF0ZScsIG91dDogc2Vzc2lvbk1ldGFkYXRhfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdjcmVhdGUnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JlbGVhc2UnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IGV2LmRhdGEuaW4hO1xuICAgICAgICByZWxlYXNlU2Vzc2lvbihoYW5kbGVyKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdyZWxlYXNlJ30gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAncmVsZWFzZScsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncnVuJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHtzZXNzaW9uSWQsIGlucHV0SW5kaWNlcywgaW5wdXRzLCBvdXRwdXRJbmRpY2VzLCBvcHRpb25zfSA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBydW4oc2Vzc2lvbklkLCBpbnB1dEluZGljZXMsIGlucHV0cywgb3V0cHV0SW5kaWNlcywgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgIG91dHB1dHMgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdydW4nLCBvdXQ6IG91dHB1dHN9IGFzIE9ydFdhc21NZXNzYWdlLCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycyhvdXRwdXRzKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdydW4nLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ3J1bicsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZW5kLXByb2ZpbGluZyc6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gZXYuZGF0YS5pbiE7XG4gICAgICAgIGVuZFByb2ZpbGluZyhoYW5kbGVyKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdlbmQtcHJvZmlsaW5nJ30gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnZW5kLXByb2ZpbGluZycsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaXMtb3J0LWVudi1pbml0aWFsaXplZCc6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBvcnRFbnZJbml0aWFsaXplZCA9IGlzT3J0RW52SW5pdGlhbGl6ZWQoKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdpcy1vcnQtZW52LWluaXRpYWxpemVkJywgb3V0OiBvcnRFbnZJbml0aWFsaXplZH0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnaXMtb3J0LWVudi1pbml0aWFsaXplZCcsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgfVxufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFhO0FBQWI7QUFBQTtBQUFPLE1BQU0sV0FBVztBQUFBO0FBQUE7OztBQ0F4QjtBQUFBO0FBQUEsZ0JBQUFBO0FBQUE7QUFBQSxNQUFhQTtBQUFiO0FBQUE7QUFBTyxNQUFNQSxRQUFPO0FBQUE7QUFBQTs7O0FDQXBCO0FBQUE7QUFBQTtBQUNBLFVBQUksV0FBVyxNQUFNO0FBQ25CLFlBQUksYUFBYSxPQUFPLGFBQWEsZUFBZSxTQUFTLGdCQUFnQixTQUFTLGNBQWMsTUFBTTtBQUMxRyxZQUFJLE9BQU8sZUFBZTtBQUFhLHVCQUFhLGNBQWM7QUFDbEUsZUFDRixTQUFTLFlBQVksQ0FBQyxHQUFHO0FBRXpCLGNB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QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxZQUFJO0FBQUUscUJBQVEsS0FBSztBQUFFLGtCQUFFLEVBQUUsUUFBUSxJQUFJLE9BQU8sR0FBRSxHQUFHLEdBQUUsRUFBRSxDQUFDLENBQUM7QUFBRSxnQkFBSSxLQUFHLDJEQUEyRCxNQUFNLEdBQUcsR0FBRSxLQUFHLHdGQUF3RixNQUFNLEdBQUc7QUFBRSxnQkFBRSxFQUFDLE1BQUssT0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLFVBQVUsR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFLEdBQUUsTUFBSyxPQUNsZixHQUFHLEVBQUUsRUFBRSxFQUFFLFVBQVUsR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFLEdBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxLQUFHLFFBQU0sTUFBSSxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxHQUFFLEdBQUcsR0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQyxHQUFFLE1BQUssT0FBRztBQUFDLGtCQUFFLEVBQUU7QUFBRyxtQkFBRyxJQUFFLElBQUUsS0FBRyxLQUFHLE1BQUksS0FBRztBQUFJLHFCQUFPLEVBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxHQUFFLE1BQUssT0FBRztBQUFDLHVCQUFRLElB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SSxNQUNsZixDQUFDLElBQUUsRUFBRSxXQUFXO0FBQUUsZ0JBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsWUFBWTtBQUFFLGdCQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLGVBQWUsSUFBRTtBQUFLLGdCQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFVBQVU7QUFBRSxnQkFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEtBQUcsRUFBRSxRQUFRLElBQUUsS0FBSyxJQUFJLEVBQUUsZUFBZSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLEtBQUcsUUFBTTtBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRTtBQUFDLGtCQUFFLElBQUUsWUFBVSxJQUFFLFVBQVEsQ0FBQyxDQUFDLEtBQUcsTUFBSSxLQUFHLGFBQVcsSUFBRTtBQUFJLHFCQUFLO0FBQUUsa0JBQUUsSUFBSSxLQUFLLE1BQUksQ0FBQztBQUFFLGdCQUFFLEtBQUcsTUFBSSxDQUFDLElBQUUsRUFBRSxXQUFXO0FBQUUsZ0JBQUUsSUFBRSxLQUFHLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVztBQUFFLGdCQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLFNBQVM7QUFBRSxnQkFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxRQUFRO0FBQUUsZ0JBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsU0FBUztBQUFFLGdCQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVksSUFBRTtBQUFLLGdCQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLE9BQU87QUFBRSxnQkFBRSxJQUFFLE1BQUksTUFDcGYsQ0FBQyxLQUFHLEVBQUUsRUFBRSxZQUFZLENBQUMsSUFBRSxLQUFHLElBQUksRUFBRSxTQUFTLENBQUMsSUFBRSxFQUFFLFFBQVEsSUFBRSxJQUFFO0FBQUUsZ0JBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsS0FBRyxFQUFFLGtCQUFrQjtBQUFHLGtCQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0I7QUFBRSxrQkFBSSxJQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0I7QUFBRSxnQkFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEtBQUcsS0FBRyxLQUFHLEVBQUUsa0JBQWtCLEtBQUcsS0FBSyxJQUFJLEdBQUUsQ0FBQyxLQUFHO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUU7QUFBQyxxQkFBSztBQUFFLGtCQUFJLElBQUUsSUFBSSxLQUFLLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLE1BQUssRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsRUFBRSxLQUFHLE1BQUksQ0FBQyxHQUFFLENBQUMsR0FBRSxJQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUUsRUFBRSxrQkFBa0IsR0FBRSxJQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0IsR0FDcGYsSUFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCLEdBQUUsSUFBRSxLQUFLLElBQUksR0FBRSxDQUFDO0FBQUUsa0JBQUUsSUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxPQUFPLEtBQUcsS0FBRyxLQUFHLENBQUMsSUFBRSxJQUFFLE1BQUksS0FBRyxPQUFLLElBQUUsS0FBSyxJQUFJLEdBQUUsQ0FBQyxHQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsSUFBRSxRQUFNLElBQUUsSUFBRSxJQUFFLEtBQUcsRUFBRTtBQUFHLGdCQUFFLElBQUUsTUFB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QUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsSUFBRTtBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUM3ZCxtQkFBUyxHQUFHLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JB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USxJQUFFLEdBQUUsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFJO0FBQUMsa0JBQUksSUFBRSxFQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFFLEVBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDO0FBQUUsbUJBQUc7QUFBRSx1QkFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLEtBQUk7QUFBQyxvQkFBSSxJQUFFLEVBQUUsRUFBRSxJQUFFLE1BQUksQ0FBQyxHQUFFLElBQUUsR0FBRyxDQUFDO0FBQUUsc0JBQUksS0FBRyxPQUFLLE1BQUksTUFBSSxJQUFFLEtBQUcsR0FBRyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEdBQUUsRUFBRSxTQUFPLEtBQUcsRUFBRSxLQUFLLENBQUM7QUFBQSxjQUFDO0FBQUMsbUJBQUc7QUFBQSxZQUFDO0FBQUMsY0FBRSxFQUFFLE1BQUksTUFBSSxDQUFDLElBQUU7QUFBRSxtQkFBTztBQUFBLFVBQUM7QUFBQyxjQUFJLEtBQUcsQ0FBQyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsRUFBRSxHQUFFLEtBQUcsQ0FBQyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsRUFBRTtBQUFFLG1CQUFTLEdBQUcsR0FBRTtBQUFDLGdCQUFJLElBQUUsTUFBTSxHQUFHLENBQUMsSUFBRSxDQUFDO0FBQUUsZUFBRyxHQUFFLEdBQUUsR0FBRSxFQUFFLE1BQU07QUFBRSxtQkFBTztBQUFBLFVBQUM7QUFDaGYsY0FBSSxLQUFHLENBQUMsR0FBRSxNQUFJO0FBQUMsY0FBRSxFQUFFLElBQUksR0FBRSxNQUFJLENBQUM7QUFBQSxVQUFDO0FBQy9CLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLHFCQUFTLEVBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxtQkFBSSxJQUFFLFlBQVUsT0FBTyxJQUFFLEVBQUUsU0FBUyxJQUFFLEtBQUcsSUFBRyxFQUFFLFNBQU87QUFBRyxvQkFBRSxFQUFFLENBQUMsSUFBRTtBQUFFLHFCQUFPO0FBQUEsWUFBQztBQUFDLHFCQUFTLEVBQUUsR0FBRSxHQUFFO0FBQUMscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRztBQUFBLFlBQUM7QUFBQyxxQkFBUyxFQUFFLEdBQUUsR0FBRTtBQUFDLHVCQUFTLEVBQUUsR0FBRTtBQUFDLHVCQUFPLElBQUUsSUFBRSxLQUFHLElBQUUsSUFBRSxJQUFFO0FBQUEsY0FBQztBQUFDLGtCQUFJO0FBQUUscUJBQUssSUFBRSxFQUFFLEVBQUUsWUFBWSxJQUFFLEVBQUUsWUFBWSxDQUFDLE1BQUksT0FBSyxJQUFFLEVBQUUsRUFBRSxTQUFTLElBQUUsRUFBRSxTQUFTLENBQUMsT0FBSyxJQUFFLEVBQUUsRUFBRSxRQUFRLElBQUUsRUFBRSxRQUFRLENBQUM7QUFBRyxxQkFBTztBQUFBLFlBQUM7QUFBQyxxQkFBUyxFQUFFLEdBQUU7QUFBQyxzQkFBTyxFQUFFLE9BQU8sR0FBRTtBQUFBLGdCQUFDLEtBQUs7QUFBRSx5QkFBTyxJQUFJLEtBQUssRUFBRSxZQUFZLElBQUUsR0FBRSxJQUFHLEVBQUU7QUFBQSxnQkFBRSxLQUFLO0FBQUUseUJBQU87QUFBQSxnQkFBRSxLQUFLO0FBQUUseUJBQU8sSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQztBQUFBLGdCQUFFLEtBQUs7QUFBRSx5QkFBTyxJQUFJO0FBQUEsb0JBQUssRUFBRSxZQUFZO0FBQUEsb0JBQ3pmO0FBQUEsb0JBQUU7QUFBQSxrQkFBQztBQUFBLGdCQUFFLEtBQUs7QUFBRSx5QkFBTyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDO0FBQUEsZ0JBQUUsS0FBSztBQUFFLHlCQUFPLElBQUksS0FBSyxFQUFFLFlBQVksSUFBRSxHQUFFLElBQUcsRUFBRTtBQUFBLGdCQUFFLEtBQUs7QUFBRSx5QkFBTyxJQUFJLEtBQUssRUFBRSxZQUFZLElBQUUsR0FBRSxJQUFHLEVBQUU7QUFBQSxjQUFDO0FBQUEsWUFBQztBQUFDLHFCQUFTLEVBQUUsR0FBRTtBQUFDLGtCQUFJLElBQUUsRUFBRTtBQUFHLG1CQUFJLElBQUUsSUFBSSxLQUFNLElBQUksS0FBSyxFQUFFLEtBQUcsTUFBSyxHQUFFLENBQUMsRUFBRyxRQUFRLENBQUMsR0FBRSxJQUFFLEtBQUc7QUFBQyxvQkFBSSxJQUFFLEVBQUUsU0FBUyxHQUFFLEtBQUcsR0FBRyxFQUFFLFlBQVksQ0FBQyxJQUFFLEtBQUcsSUFBSSxDQUFDO0FBQUUsb0JBQUcsSUFBRSxJQUFFLEVBQUUsUUFBUTtBQUFFLHVCQUFHLElBQUUsRUFBRSxRQUFRLElBQUUsR0FBRSxFQUFFLFFBQVEsQ0FBQyxHQUFFLEtBQUcsSUFBRSxFQUFFLFNBQVMsSUFBRSxDQUFDLEtBQUcsRUFBRSxTQUFTLENBQUMsR0FBRSxFQUFFLFlBQVksRUFBRSxZQUFZLElBQUUsQ0FBQztBQUFBLHFCQUFPO0FBQUMsb0JBQUUsUUFBUSxFQUFFLFFBQVEsSUFBRSxDQUFDO0FBQUU7QUFBQSxnQkFBSztBQUFBLGNBQUM7QUFBQyxrQkFBRSxJQUFJLEtBQUssRUFBRSxZQUFZLElBQUUsR0FBRSxHQUFFLENBQUM7QUFBRSxrQkFBRSxFQUFFLElBQUk7QUFBQSxnQkFBSyxFQUFFLFlBQVk7QUFBQSxnQkFDcGY7QUFBQSxnQkFBRTtBQUFBLGNBQUMsQ0FBQztBQUFFLGtCQUFFLEVBQUUsQ0FBQztBQUFFLHFCQUFPLEtBQUcsRUFBRSxHQUFFLENBQUMsSUFBRSxLQUFHLEVBQUUsR0FBRSxDQUFDLElBQUUsRUFBRSxZQUFZLElBQUUsSUFBRSxFQUFFLFlBQVksSUFBRSxFQUFFLFlBQVksSUFBRTtBQUFBLFlBQUM7QUFBQyxtQkFBSztBQUFFLG1CQUFLO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLGdCQUFJLElBQUUsRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUM7QUFBRSxnQkFBRSxFQUFDLElBQUcsRUFBRSxFQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxJQUFFLEdBQUcsQ0FBQyxJQUFFLEdBQUU7QUFBRSxnQkFBRSxHQUFHLENBQUM7QUFBRSxnQkFBRTtBQUFBLGNBQUMsTUFBSztBQUFBLGNBQXVCLE1BQUs7QUFBQSxjQUFXLE1BQUs7QUFBQSxjQUFXLE1BQUs7QUFBQSxjQUFLLE1BQUs7QUFBQSxjQUFjLE1BQUs7QUFBQSxjQUFRLE1BQUs7QUFBQSxjQUFXLE1BQUs7QUFBQSxjQUNyZixNQUFLO0FBQUEsY0FBVyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBVyxPQUFNO0FBQUEsY0FBVyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsWUFBSTtBQUFFLHFCQUFRLEtBQUs7QUFBRSxrQkFBRSxFQUFFLFFBQVEsSUFBSSxPQUFPLEdBQUUsR0FBRyxHQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQUUsZ0JBQUksSUFBRSwyREFBMkQsTUFBTSxHQUFHLEdBQUUsSUFBRSx3RkFBd0YsTUFBTSxHQUFHO0FBQUUsZ0JBQUUsRUFBQyxNQUFLLE9BQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FDemYsRUFBRSxFQUFFLEVBQUUsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFFLE1BQUssT0FBRyxHQUFHLEVBQUUsS0FBRyxRQUFNLE1BQUksR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsR0FBRSxHQUFHLEdBQUUsTUFBSyxPQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE9BQUc7QUFBQyxrQkFBRSxFQUFFO0FBQUcsbUJBQUcsSUFBRSxJQUFFLEtBQUcsS0FBRyxNQUFJLEtBQUc7QUFBSSxxQkFBTyxFQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsR0FBRSxNQUFLLE9BQUc7QUFBQyx1QkFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLEtBQUcsRUFBRSxLQUFHLEdBQUUsTUFBSSxHQUFHLEVBQUUsS0FBRyxJQUFJLElBQUUsS0FBRyxJQUFJLEdBQUc7QUFBRTtBQUFDLHFCQUFPLEVBQUUsRUFBRSxLQUFHLEdBQUUsQ0FBQztBQUFBLFlBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLEtBQUcsR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE1BQUksTUFBSyxNQUFLLE9BQUcsS0FBRyxFQUFFLE1BQUksS0FBRyxFQUFFLEtBQUcsT0FBSyxNQUFLLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxD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QUUsSUFBRSxDQUFDLElBQUUsR0FBRyxJQUFFLElBQUUsSUFBRSxDQUFDLElBQUUsR0FBRyxFQUFFLElBQUUsSUFBRSxJQUFFLE1BQUksQ0FBQztBQUFFLGtCQUFFLEdBQUcsQ0FBQztBQUFFLGdCQUFFLEtBQUc7QUFBRSxrQkFBRSxFQUFFLE1BQU0sTUFBSyxFQUFFO0FBQUUsZ0JBQUUsS0FBRztBQUFFLHFCQUFPO0FBQUEsWUFBQztBQUFBLFlBQUUsSUFBRztBQUFBLFlBQUcsSUFBRyxTQUFTLEdBQUU7QUFBQyxtQkFBRyxFQUFFLEdBQUcsTUFBSSxDQUFDLEVBQUUsSUFBSTtBQUFBLFlBQUM7QUFBQSxZQUFFLElBQUcsU0FBUyxHQUFFLEdBQUUsR0FBRTtBQUFDLHFCQUFLO0FBQUUscUJBQUs7QUFBRSxrQkFBRSxFQUFFLE1BQUksQ0FBQztBQUFFLGtCQUFFLEdBQUcsR0FBRSxXQUFXO0FBQ3RmLGtCQUFJLElBQUUsQ0FBQyxHQUFFLElBQUUsRUFBRSxDQUFDO0FBQUUsZ0JBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFO0FBQUUscUJBQU8sRUFBRSxXQUFXLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxZQUFFLElBQUcsU0FBUyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxxQkFBSztBQUFFLHFCQUFLO0FBQUUscUJBQUs7QUFBRSxrQkFBRSxHQUFHLE1BQUksQ0FBQztBQUFFLGtCQUFFLEVBQUUsTUFBSSxDQUFDO0FBQUUsa0JBQUUsR0FBRyxDQUFDO0FBQUUsa0JBQUksSUFBRSxDQUFDO0FBQUUsZ0JBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsQ0FBQztBQUFFLHFCQUFPLEVBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxZQUFFLElBQUcsU0FBUyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMscUJBQUs7QUFBRSxxQkFBSztBQUFFLGtCQUFFLEdBQUcsTUFBSSxDQUFDO0FBQUUsa0JBQUUsRUFBRSxNQUFJLENBQUM7QUFBRSxrQkFBRSxHQUFH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RyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxJQUFHO0FBQUEsWUFDbGYsSUFBRztBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlB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QUFFLE9BQUssS0FBRyxFQUFFLElBQUksR0FBRSxDQUFDLEdBQUUsSUFBRSxPQUFLLElBQUUsRUFBRSxJQUFJLEdBQUUsSUFBRSxRQUFJLElBQUUsRUFBRSxJQUFJLENBQUMsR0FBRSxLQUFHLFFBQUksS0FBRyxFQUFFLElBQUksQ0FBQyxHQUFFLEtBQUcsUUFBSSxLQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUUsS0FBRyxRQUFJLEtBQUcsRUFBRSxJQUFJLENBQUMsR0FBRSxLQUFHLENBQUMsR0FBRSxHQUFFLE9BQUssS0FBRyxFQUFFLElBQUksR0FBRSxHQUFFLENBQUMsR0FBRSxLQUFHLFFBQUksS0FBRyxFQUFFLElBQUksQ0FBQztBQUNuZSxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxxQkFBTyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDcGIsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxxQkFBTyxFQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRTtBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDaGUsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUU7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQ3RiLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFFLHFCQUFPO0FBQUEsWUFBRTtBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDN2QsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUMxZSxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDdGEsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDMWIsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBRSxxQkFBTztBQUFBLFlBQUU7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDOWEsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQzNjLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7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QSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDdGIsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUUscUJBQU87QUFBQSxZQUFFO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQ2xiLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxxQkFBTyxFQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUN0YSxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDMWMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQ2plLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUNyYSxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQzNaLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxJQUFHO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE9BQUssS0FBRztBQUFFLHNCQUFNO0FBQUcsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDM2EsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDdmIsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQ3ZkLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxxQkFBTyxFQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBRSxxQkFBTztBQUFBLFlBQUU7QUFBQSxVQUFDO0FBQ3ZaLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQzFiLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUNsYixtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDdGEsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDdmMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQ2xYLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDdmIsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLElBQUcsSUFBRyxJQUFHLElBQUc7QUFBQyxnQkFBSSxLQUFHLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxJQUFHLElBQUcsSUFBRyxFQUFFO0FBQUEsWUFBQyxTQUFPLElBQUc7QUFBQyxnQkFBRSxFQUFFO0FBQUUsa0JBQUcsT0FBSyxLQUFHO0FBQUUsc0JBQU07QUFBRyxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxxQkFBTyxFQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDaGEsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLElBQUc7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsT0FBSyxLQUFHO0FBQUUsc0JBQU07QUFBRyxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDOWUsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQy9lLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQy9aLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxxQkFBTyxFQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxxQkFBTyxFQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUM3ZSxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBRSxxQkFBTztBQUFBLFlBQUU7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDbGYsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQ2pmLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxxQkFBTyxFQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxxQkFBTyxFQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUMzYixtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxxQkFBTyxFQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDbmQsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxxQkFBTyxFQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUNyYixtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxxQkFBTyxFQUFFLENBQUMsRUFBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxxQkFBTyxFQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxnQkFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDNWMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQ2piLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLGdCQUFFLENBQUMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxxQkFBTyxFQUFFLENBQUMsRUFBRTtBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUUscUJBQU87QUFBQSxZQUFFO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDL1osbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMscUJBQU8sRUFBRSxDQUFDLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFFLGdCQUFHO0FBQUMsZ0JBQUUsQ0FBQyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxTQUFPLEdBQUU7QUFBQyxnQkFBRSxDQUFDO0FBQUUsa0JBQUcsTUFBSSxJQUFFO0FBQUUsc0JBQU07QUFBRSxnQkFBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsU0FBTyxHQUFFO0FBQUMsZ0JBQUUsQ0FBQztBQUFFLGtCQUFHLE1BQUksSUFBRTtBQUFFLHNCQUFNO0FBQUUsZ0JBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQUUsZ0JBQUc7QUFBQyxxQkFBTyxFQUFFLENBQUMsRUFBRSxHQUFFLENBQUM7QUFBQSxZQUFDLFNBQU8sR0FBRTtBQUFDLGdCQUFFLENBQUM7QUFBRSxrQkFBRyxNQUFJLElBQUU7QUFBRSxzQkFBTTtBQUFFLGdCQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxVQUFDO0FB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QUcsQ0FBbUI7QUFBQSxRQUM5RDtBQUNBO0FBQUEsTUFDRixLQUFLO0FBQ0gsWUFBSTtBQUNGLGdCQUFNLEVBQUMsT0FBTyxRQUFPLElBQUksR0FBRyxLQUFLO0FBQ2pDLGdCQUFNLGtCQUFrQixjQUFjLE9BQU8sT0FBTztBQUNwRCxzQkFBWSxFQUFDLE1BQU0sVUFBVSxLQUFLLGdCQUFlLENBQW1CO0FBQUEsUUFDdEUsU0FBUyxLQUFLO0FBQ1osc0JBQVksRUFBQyxNQUFNLFVBQVUsSUFBRyxDQUFtQjtBQUFBLFFBQ3JEO0FBQ0E7QUFBQSxNQUNGLEtBQUs7QUFDSCxZQUFJO0FBQ0YsZ0JBQU0sVUFBVSxHQUFHLEtBQUs7QUFDeEIseUJBQWUsT0FBTztBQUN0QixzQkFBWSxFQUFDLE1BQU0sVUFBUyxDQUFtQjtBQUFBLFFBQ2pELFNBQVMsS0FBSztBQUNaLHNCQUFZLEVBQUMsTUFBTSxXQUFXLElBQUcsQ0FBbUI7QUFBQSxRQUN0RDtBQUNBO0FBQUEsTUFDRixLQUFLO0FBQ0gsWUFBSTtBQUNGLGdCQUFNLEVBQUMsV0FBVyxjQUFjLFFBQVEsZUFBZSxRQUFPLElBQUksR0FBRyxLQUFLO0FBQzFFLGNBQUksV0FBVyxjQUFjLFFBQVEsZUFBZSxPQUFPLEVBQ3REO0FBQUEsWUFDRyxhQUFXO0FBQ1QsMEJBQVksRUFBQyxNQUFNLE9BQU8sS0FBSyxRQUFPLEdBQXFCLDJCQUEyQixPQUFPLENBQUM7QUFBQSxZQUNoRztBQUFBLFlBQ0EsU0FBTztBQUNMLDBCQUFZLEVBQUMsTUFBTSxPQUFPLElBQUcsQ0FBbUI7QUFBQSxZQUNsRDtBQUFBLFVBQUM7QUFBQSxRQUNYLFNBQVMsS0FBSztBQUNaLHNCQUFZLEVBQUMsTUFBTSxPQUFPLElBQUcsQ0FBbUI7QUFBQSxRQUNsRDtBQUNBO0FBQUEsTUFDRixLQUFLO0FBQ0gsWUFBSTtBQUNGLGdCQUFNLFVBQVUsR0FBRyxLQUFLO0FBQ3hCLHVCQUFhLE9BQU87QUFDcEIsc0JBQVksRUFBQyxNQUFNLGdCQUFlLENBQW1CO0FBQUEsUUFDdkQsU0FBUyxLQUFLO0FBQ1osc0JBQVksRUFBQyxNQUFNLGlCQUFpQixJQUFHLENBQW1CO0FBQUEsUUFDNUQ7QUFDQTtBQUFBLE1BQ0YsS0FBSztBQUNILFlBQUk7QUFDRixnQkFBTUkscUJBQW9CLG9CQUFvQjtBQUM5QyxzQkFBWSxFQUFDLE1BQU0sMEJBQTBCLEtBQUtBLG1CQUFpQixDQUFtQjtBQUFBLFFBQ3hGLFNBQVMsS0FBSztBQUNaLHNCQUFZLEVBQUMsTUFBTSwwQkFBMEIsSUFBRyxDQUFtQjtBQUFBLFFBQ3JFO0FBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7IiwKICAibmFtZXMiOiBbImpvaW4iLCAid2FzbSIsICJ3YXNtIiwgIndhc20iLCAid2FzbSIsICJ0ZW5zb3IiLCAiZXJyb3JDb2RlIiwgImkiLCAib3J0RW52SW5pdGlhbGl6ZWQiXQp9Cg==\n';
  }
});

// web/lib/wasm/proxy-wrapper.ts
var isProxy, proxyWorker, initializing2, initialized2, aborted2, initWasmCallbacks, initOrtCallbacks, createSessionAllocateCallbacks, createSessionFinalizeCallbacks, createSessionCallbacks, releaseSessionCallbacks, runCallbacks, endProfilingCallbacks, isOrtEnvInitializedCallbacks, ensureWorker, onProxyWorkerMessage, scriptSrc, initializeWebAssemblyInstance, initializeRuntime, createSessionAllocate2, createSessionFinalize2, createSession2, releaseSession2, run2, endProfiling2, isOrtEnvInitialized2;
var init_proxy_wrapper = __esm({
  "web/lib/wasm/proxy-wrapper.ts"() {
    "use strict";
    init_esm();
    init_wasm_core_impl();
    init_wasm_factory();
    isProxy = () => !!env2.wasm.proxy && typeof document !== "undefined";
    initializing2 = false;
    initialized2 = false;
    aborted2 = false;
    createSessionAllocateCallbacks = [];
    createSessionFinalizeCallbacks = [];
    createSessionCallbacks = [];
    releaseSessionCallbacks = [];
    runCallbacks = [];
    endProfilingCallbacks = [];
    isOrtEnvInitializedCallbacks = [];
    ensureWorker = () => {
      if (initializing2 || !initialized2 || aborted2 || !proxyWorker) {
        throw new Error("worker not ready");
      }
    };
    onProxyWorkerMessage = (ev) => {
      switch (ev.data.type) {
        case "init-wasm":
          initializing2 = false;
          if (ev.data.err) {
            aborted2 = true;
            initWasmCallbacks[1](ev.data.err);
          } else {
            initialized2 = true;
            initWasmCallbacks[0]();
          }
          break;
        case "init-ort":
          if (ev.data.err) {
            initOrtCallbacks[1](ev.data.err);
          } else {
            initOrtCallbacks[0]();
          }
          break;
        case "create_allocate":
          if (ev.data.err) {
            createSessionAllocateCallbacks.shift()[1](ev.data.err);
          } else {
            createSessionAllocateCallbacks.shift()[0](ev.data.out);
          }
          break;
        case "create_finalize":
          if (ev.data.err) {
            createSessionFinalizeCallbacks.shift()[1](ev.data.err);
          } else {
            createSessionFinalizeCallbacks.shift()[0](ev.data.out);
          }
          break;
        case "create":
          if (ev.data.err) {
            createSessionCallbacks.shift()[1](ev.data.err);
          } else {
            createSessionCallbacks.shift()[0](ev.data.out);
          }
          break;
        case "release":
          if (ev.data.err) {
            releaseSessionCallbacks.shift()[1](ev.data.err);
          } else {
            releaseSessionCallbacks.shift()[0]();
          }
          break;
        case "run":
          if (ev.data.err) {
            runCallbacks.shift()[1](ev.data.err);
          } else {
            runCallbacks.shift()[0](ev.data.out);
          }
          break;
        case "end-profiling":
          if (ev.data.err) {
            endProfilingCallbacks.shift()[1](ev.data.err);
          } else {
            endProfilingCallbacks.shift()[0]();
          }
          break;
        case "is-ort-env-initialized":
          if (ev.data.err) {
            isOrtEnvInitializedCallbacks.shift()[1](ev.data.err);
          } else {
            isOrtEnvInitializedCallbacks.shift()[0](ev.data.out);
          }
          break;
        default:
      }
    };
    scriptSrc = typeof document !== "undefined" ? document?.currentScript?.src : void 0;
    initializeWebAssemblyInstance = async () => {
      if (isProxy()) {
        if (initialized2) {
          return;
        }
        if (initializing2) {
          throw new Error("multiple calls to 'initWasm()' detected.");
        }
        if (aborted2) {
          throw new Error("previous call to 'initWasm()' failed.");
        }
        initializing2 = true;
        if (env2.wasm.wasmPaths === void 0) {
          if (scriptSrc && scriptSrc.indexOf("blob:") !== 0) {
            env2.wasm.wasmPaths = scriptSrc.substr(0, +scriptSrc.lastIndexOf("/") + 1);
          }
        }
        return new Promise((resolve, reject) => {
          proxyWorker?.terminate();
          const workerUrl = URL.createObjectURL(new Blob(
            [
              // This require() function is handled by esbuild plugin to load file content as string.
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              require_main()
            ],
            { type: "text/javascript" }
          ));
          proxyWorker = new Worker(workerUrl, { name: "ort-wasm-proxy-worker" });
          proxyWorker.onerror = (ev) => reject(ev);
          proxyWorker.onmessage = onProxyWorkerMessage;
          URL.revokeObjectURL(workerUrl);
          initWasmCallbacks = [resolve, reject];
          const message = { type: "init-wasm", in: env2.wasm };
          proxyWorker.postMessage(message);
        });
      } else {
        return initializeWebAssembly(env2.wasm);
      }
    };
    initializeRuntime = async (env3) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          initOrtCallbacks = [resolve, reject];
          const message = { type: "init-ort", in: env3 };
          proxyWorker.postMessage(message);
        });
      } else {
        await initRuntime(env3);
      }
    };
    createSessionAllocate2 = async (model) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          createSessionAllocateCallbacks.push([resolve, reject]);
          const message = { type: "create_allocate", in: { model } };
          proxyWorker.postMessage(message, [model.buffer]);
        });
      } else {
        return createSessionAllocate(model);
      }
    };
    createSessionFinalize2 = async (modeldata, options) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          createSessionFinalizeCallbacks.push([resolve, reject]);
          const message = { type: "create_finalize", in: { modeldata, options } };
          proxyWorker.postMessage(message);
        });
      } else {
        return createSessionFinalize(modeldata, options);
      }
    };
    createSession2 = async (model, options) => {
      if (isProxy()) {
        if (options?.preferredOutputLocation) {
          throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          createSessionCallbacks.push([resolve, reject]);
          const message = { type: "create", in: { model, options } };
          proxyWorker.postMessage(message, [model.buffer]);
        });
      } else {
        return createSession(model, options);
      }
    };
    releaseSession2 = async (sessionId) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          releaseSessionCallbacks.push([resolve, reject]);
          const message = { type: "release", in: sessionId };
          proxyWorker.postMessage(message);
        });
      } else {
        releaseSession(sessionId);
      }
    };
    run2 = async (sessionId, inputIndices, inputs, outputIndices, outputs, options) => {
      if (isProxy()) {
        if (inputs.some((t) => t[3] !== "cpu")) {
          throw new Error("input tensor on GPU is not supported for proxy.");
        }
        if (outputs.some((t) => t)) {
          throw new Error("pre-allocated output tensor is not supported for proxy.");
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          runCallbacks.push([resolve, reject]);
          const serializableInputs = inputs;
          const message = { type: "run", in: { sessionId, inputIndices, inputs: serializableInputs, outputIndices, options } };
          proxyWorker.postMessage(message, extractTransferableBuffers(serializableInputs));
        });
      } else {
        return run(sessionId, inputIndices, inputs, outputIndices, outputs, options);
      }
    };
    endProfiling2 = async (sessionId) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          endProfilingCallbacks.push([resolve, reject]);
          const message = { type: "end-profiling", in: sessionId };
          proxyWorker.postMessage(message);
        });
      } else {
        endProfiling(sessionId);
      }
    };
    isOrtEnvInitialized2 = async () => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          isOrtEnvInitializedCallbacks.push([resolve, reject]);
          const message = { type: "is-ort-env-initialized" };
          proxyWorker.postMessage(message);
        });
      } else {
        return isOrtEnvInitialized();
      }
    };
  }
});

// nodejs-ignore:node:fs/promises
var readFile2;
var init_promises = __esm({
  "nodejs-ignore:node:fs/promises"() {
    readFile2 = void 0;
  }
});

// web/lib/wasm/session-handler-inference.ts
var runtimeInitializationPromise, encodeTensorMetadata, decodeTensorMetadata, OnnxruntimeWebAssemblySessionHandler;
var init_session_handler_inference = __esm({
  "web/lib/wasm/session-handler-inference.ts"() {
    "use strict";
    init_promises();
    init_esm();
    init_proxy_wrapper();
    init_wasm_common();
    encodeTensorMetadata = (tensor, getName) => {
      switch (tensor.location) {
        case "cpu":
          return [tensor.type, tensor.dims, tensor.data, "cpu"];
        case "gpu-buffer":
          return [tensor.type, tensor.dims, { gpuBuffer: tensor.gpuBuffer }, "gpu-buffer"];
        default:
          throw new Error(`invalid data location: ${tensor.location} for ${getName()}`);
      }
    };
    decodeTensorMetadata = (tensor) => {
      switch (tensor[3]) {
        case "cpu":
          return new Tensor2(tensor[0], tensor[2], tensor[1]);
        case "gpu-buffer": {
          const dataType = tensor[0];
          if (!isGpuBufferSupportedType(dataType)) {
            throw new Error(`not supported data type: ${dataType} for deserializing GPU tensor`);
          }
          const { gpuBuffer, download, dispose } = tensor[2];
          return Tensor2.fromGpuBuffer(gpuBuffer, { dataType, dims: tensor[1], download, dispose });
        }
        default:
          throw new Error(`invalid data location: ${tensor[3]}`);
      }
    };
    OnnxruntimeWebAssemblySessionHandler = class {
      async createSessionAllocate(path) {
        const response = await fetch(path);
        if (response.status !== 200) {
          throw new Error(`failed to load model: ${path}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return createSessionAllocate2(new Uint8Array(arrayBuffer));
      }
      async loadModel(pathOrBuffer, options) {
        if (!await isOrtEnvInitialized2()) {
          if (!runtimeInitializationPromise) {
            runtimeInitializationPromise = initializeRuntime(env2);
          }
          await runtimeInitializationPromise;
          runtimeInitializationPromise = void 0;
        }
        if (typeof pathOrBuffer === "string") {
          if (typeof process !== "undefined" && process.versions && process.versions.node) {
            const model = await readFile2(pathOrBuffer);
            [this.sessionId, this.inputNames, this.outputNames] = await createSession2(model, options);
          } else {
            const modelData = await this.createSessionAllocate(pathOrBuffer);
            [this.sessionId, this.inputNames, this.outputNames] = await createSessionFinalize2(modelData, options);
          }
        } else {
          [this.sessionId, this.inputNames, this.outputNames] = await createSession2(pathOrBuffer, options);
        }
      }
      async dispose() {
        return releaseSession2(this.sessionId);
      }
      async run(feeds, fetches, options) {
        const inputArray = [];
        const inputIndices = [];
        Object.entries(feeds).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = this.inputNames.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid input '${name}'`);
          }
          inputArray.push(tensor);
          inputIndices.push(index);
        });
        const outputArray = [];
        const outputIndices = [];
        Object.entries(fetches).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = this.outputNames.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid output '${name}'`);
          }
          outputArray.push(tensor);
          outputIndices.push(index);
        });
        const inputs = inputArray.map((t, i) => encodeTensorMetadata(t, () => `input "${this.inputNames[inputIndices[i]]}"`));
        const outputs = outputArray.map(
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.outputNames[outputIndices[i]]}"`) : null
        );
        const results = await run2(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        const resultMap = {};
        for (let i = 0; i < results.length; i++) {
          resultMap[this.outputNames[outputIndices[i]]] = outputArray[i] ?? decodeTensorMetadata(results[i]);
        }
        return resultMap;
      }
      startProfiling() {
      }
      endProfiling() {
        void endProfiling2(this.sessionId);
      }
    };
  }
});

// web/lib/backend-wasm.ts
var initializeFlags, OnnxruntimeWebAssemblyBackend;
var init_backend_wasm = __esm({
  "web/lib/backend-wasm.ts"() {
    "use strict";
    init_node_os();
    init_esm();
    init_proxy_wrapper();
    init_session_handler_inference();
    initializeFlags = () => {
      if (typeof env2.wasm.initTimeout !== "number" || env2.wasm.initTimeout < 0) {
        env2.wasm.initTimeout = 0;
      }
      if (typeof env2.wasm.simd !== "boolean") {
        env2.wasm.simd = true;
      }
      if (typeof env2.wasm.proxy !== "boolean") {
        env2.wasm.proxy = false;
      }
      if (typeof env2.wasm.numThreads !== "number" || !Number.isInteger(env2.wasm.numThreads) || env2.wasm.numThreads <= 0) {
        const numCpuLogicalCores = typeof navigator === "undefined" ? cpus().length : navigator.hardwareConcurrency;
        env2.wasm.numThreads = Math.min(4, Math.ceil((numCpuLogicalCores || 1) / 2));
      }
    };
    OnnxruntimeWebAssemblyBackend = class {
      async init() {
        initializeFlags();
        await initializeWebAssemblyInstance();
      }
      async createInferenceSessionHandler(pathOrBuffer, options) {
        const handler = new OnnxruntimeWebAssemblySessionHandler();
        await handler.loadModel(pathOrBuffer, options);
        return Promise.resolve(handler);
      }
    };
  }
});

// web/lib/wasm/wasm-training-core-impl.ts
var NO_TRAIN_FUNCS_MSG, createCheckpointHandle, getModelInputOutputCount, getModelInputOutputNamesLoop, getTrainingModelInputOutputNames, createTrainingSessionHandle, createAndAllocateTensors, moveOutputToTensorMetadataArr, runTrainStep, releaseTrainingSessionAndCheckpoint;
var init_wasm_training_core_impl = __esm({
  "web/lib/wasm/wasm-training-core-impl.ts"() {
    "use strict";
    init_run_options();
    init_session_options();
    init_wasm_common();
    init_wasm_core_impl();
    init_wasm_factory();
    init_wasm_utils();
    NO_TRAIN_FUNCS_MSG = "Built without training API's enabled. Use the onnxruntime-web/training import for training functionality, and make sure that all the correct artifacts are built & moved to the correct folder if using a custom build. Check https://onnxruntime.ai/docs/build/web.html for more information.";
    createCheckpointHandle = (checkpointData) => {
      const wasm2 = getInstance();
      const [checkpointDataOffset, checkpointDataLength] = checkpointData;
      let checkpointHandle = 0;
      try {
        if (wasm2._OrtTrainingLoadCheckpoint) {
          checkpointHandle = wasm2._OrtTrainingLoadCheckpoint(checkpointDataOffset, checkpointDataLength);
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        if (checkpointHandle === 0) {
          checkLastError("Error occurred when trying to create a CheckpointState.");
        }
        return checkpointHandle;
      } catch (e) {
        if (wasm2._OrtTrainingReleaseCheckpoint && checkpointHandle !== 0) {
          wasm2._OrtTrainingReleaseCheckpoint(checkpointHandle);
        }
        throw e;
      } finally {
        wasm2._OrtFree(checkpointData[0]);
      }
    };
    getModelInputOutputCount = (trainingSessionId, isEvalModel) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const dataOffset = wasm2.stackAlloc(8);
        if (wasm2._OrtTrainingGetModelInputOutputCount) {
          const errorCode = wasm2._OrtTrainingGetModelInputOutputCount(trainingSessionId, dataOffset, dataOffset + 4, isEvalModel);
          if (errorCode !== 0) {
            checkLastError("Can't get session input/output count.");
          }
          return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    getModelInputOutputNamesLoop = (trainingSessionId, count, isInput, isEvalModel) => {
      const names = [];
      const wasm2 = getInstance();
      const namesUTF8Encoded = [];
      for (let i = 0; i < count; i++) {
        if (wasm2._OrtTrainingGetModelInputOutputName) {
          const name = wasm2._OrtTrainingGetModelInputOutputName(trainingSessionId, i, isInput, isEvalModel);
          if (name === 0) {
            checkLastError("Can't get input or output name");
          }
          namesUTF8Encoded.push(name);
          names.push(wasm2.UTF8ToString(name));
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      }
      return [names, namesUTF8Encoded];
    };
    getTrainingModelInputOutputNames = (trainingSessionId) => {
      const [inputCount, outputCount] = getModelInputOutputCount(trainingSessionId, false);
      const [inputNames, inputNamesUTF8Encoded] = getModelInputOutputNamesLoop(trainingSessionId, inputCount, true, false);
      const [outputNames, outputNamesUTF8Encoded] = getModelInputOutputNamesLoop(trainingSessionId, outputCount, false, false);
      return [inputNames, inputNamesUTF8Encoded, outputNames, outputNamesUTF8Encoded];
    };
    createTrainingSessionHandle = (checkpointHandle, trainModelData, evalModelData, optimizerModelData, options) => {
      const wasm2 = getInstance();
      let trainingSessionHandle = 0;
      let sessionOptionsHandle = 0;
      let allocs = [];
      let inputNamesUTF8Encoded = [];
      let outputNamesUTF8Encoded = [];
      let inputNames = [];
      let outputNames = [];
      try {
        [sessionOptionsHandle, allocs] = setSessionOptions(options);
        if (wasm2._OrtTrainingCreateSession) {
          trainingSessionHandle = wasm2._OrtTrainingCreateSession(
            sessionOptionsHandle,
            checkpointHandle,
            trainModelData[0],
            trainModelData[1],
            evalModelData[0],
            evalModelData[1],
            optimizerModelData[0],
            optimizerModelData[1]
          );
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        if (trainingSessionHandle === 0) {
          checkLastError("Error occurred when trying to create a TrainingSession.");
        }
        [inputNames, inputNamesUTF8Encoded, outputNames, outputNamesUTF8Encoded] = getTrainingModelInputOutputNames(trainingSessionHandle);
        return [[trainingSessionHandle, inputNames, outputNames], inputNamesUTF8Encoded, outputNamesUTF8Encoded];
      } catch (e) {
        if (wasm2._OrtTrainingReleaseSession && trainingSessionHandle !== 0) {
          wasm2._OrtTrainingReleaseSession(trainingSessionHandle);
        }
        throw e;
      } finally {
        wasm2._free(trainModelData[0]);
        wasm2._free(evalModelData[0]);
        wasm2._free(optimizerModelData[0]);
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      }
    };
    createAndAllocateTensors = (trainingSessionId, indices, tensors, tensorHandles, inputOutputAllocs, indexAdd) => {
      const count = indices.length;
      for (let i = 0; i < count; i++) {
        prepareInputOutputTensor(
          tensors[i],
          tensorHandles,
          inputOutputAllocs,
          trainingSessionId,
          indexAdd + indices[i]
        );
      }
      const wasm2 = getInstance();
      const valuesOffset = wasm2.stackAlloc(count * 4);
      let valuesIndex = valuesOffset / 4;
      for (let i = 0; i < count; i++) {
        wasm2.HEAPU32[valuesIndex++] = tensorHandles[i];
      }
      return valuesOffset;
    };
    moveOutputToTensorMetadataArr = (outputValuesOffset, outputCount, outputTensorHandles, outputTensors) => {
      const wasm2 = getInstance();
      const output = [];
      for (let i = 0; i < outputCount; i++) {
        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];
        if (tensor === outputTensorHandles[i]) {
          output.push(outputTensors[i]);
          continue;
        }
        const beforeGetTensorDataStack = wasm2.stackSave();
        const tensorDataOffset = wasm2.stackAlloc(4 * 4);
        let type, dataOffset = 0;
        try {
          const errorCode = wasm2._OrtGetTensorData(
            tensor,
            tensorDataOffset,
            tensorDataOffset + 4,
            tensorDataOffset + 8,
            tensorDataOffset + 12
          );
          if (errorCode !== 0) {
            checkLastError(`Can't access output tensor data on index ${i}.`);
          }
          let tensorDataIndex = tensorDataOffset / 4;
          const dataType = wasm2.HEAPU32[tensorDataIndex++];
          dataOffset = wasm2.HEAPU32[tensorDataIndex++];
          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];
          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];
          const dims = [];
          for (let i2 = 0; i2 < dimsLength; i2++) {
            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);
          }
          wasm2._OrtFree(dimsOffset);
          const size = dims.reduce((a, b) => a * b, 1);
          type = tensorDataTypeEnumToString(dataType);
          if (type === "string") {
            const stringData = [];
            let dataIndex = dataOffset / 4;
            for (let i2 = 0; i2 < size; i2++) {
              const offset = wasm2.HEAPU32[dataIndex++];
              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;
              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));
            }
            output.push([type, dims, stringData, "cpu"]);
          } else {
            const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);
            const data = new typedArrayConstructor(size);
            new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));
            output.push([type, dims, data, "cpu"]);
          }
        } finally {
          wasm2.stackRestore(beforeGetTensorDataStack);
          if (type === "string" && dataOffset) {
            wasm2._free(dataOffset);
          }
          wasm2._OrtReleaseTensor(tensor);
        }
      }
      return output;
    };
    runTrainStep = async (trainingSessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        const inputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          inputIndices,
          inputTensors,
          inputTensorHandles,
          inputOutputAllocs,
          0
        );
        const outputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          outputIndices,
          outputTensors,
          outputTensorHandles,
          inputOutputAllocs,
          inputCount
        );
        if (wasm2._OrtTrainingRunTrainStep) {
          const errorCode = wasm2._OrtTrainingRunTrainStep(
            trainingSessionId,
            inputValuesOffset,
            inputCount,
            outputValuesOffset,
            outputCount,
            runOptionsHandle
          );
          if (errorCode !== 0) {
            checkLastError("failed to call OrtTrainingRunTrainStep in the WebAssembly layer");
          }
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        return moveOutputToTensorMetadataArr(outputValuesOffset, outputCount, outputTensorHandles, outputTensors);
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    releaseTrainingSessionAndCheckpoint = (checkpointId, sessionId, inputNamesUTF8Encoded, outputNamesUTF8Encoded) => {
      const wasm2 = getInstance();
      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      if (wasm2._OrtTrainingReleaseSession) {
        wasm2._OrtTrainingReleaseSession(sessionId);
      }
      if (wasm2._OrtTrainingReleaseCheckpoint) {
        wasm2._OrtTrainingReleaseCheckpoint(checkpointId);
      }
    };
  }
});

// web/lib/wasm/session-handler-training.ts
var OnnxruntimeWebAssemblyTrainingSessionHandler;
var init_session_handler_training = __esm({
  "web/lib/wasm/session-handler-training.ts"() {
    "use strict";
    init_esm();
    init_session_handler_inference();
    init_wasm_core_impl();
    init_wasm_training_core_impl();
    OnnxruntimeWebAssemblyTrainingSessionHandler = class {
      async loadParametersBuffer(_array, _trainableOnly) {
        throw new Error("Method not implemented.");
      }
      async getContiguousParameters(_trainableOnly) {
        throw new Error("Method not implemented.");
      }
      async uriOrBufferToHeap(uriOrBuffer) {
        let buffer;
        if (typeof uriOrBuffer === "string") {
          const response = await fetch(uriOrBuffer);
          const arrayBuffer = await response.arrayBuffer();
          buffer = new Uint8Array(arrayBuffer);
        } else {
          buffer = uriOrBuffer;
        }
        return createSessionAllocate(buffer);
      }
      async createTrainingSession(checkpointStateUriOrBuffer, trainModelUriOrBuffer, evalModelUriOrBuffer, optimizerModelUriOrBuffer, options) {
        if (!isOrtEnvInitialized()) {
          await initRuntime(env2);
        }
        const checkpointData = await this.uriOrBufferToHeap(checkpointStateUriOrBuffer);
        const trainModelData = await this.uriOrBufferToHeap(trainModelUriOrBuffer);
        let evalModelData = [0, 0];
        let optimizerModelData = [0, 0];
        if (evalModelUriOrBuffer !== "") {
          evalModelData = await this.uriOrBufferToHeap(evalModelUriOrBuffer);
        }
        if (optimizerModelUriOrBuffer !== "") {
          optimizerModelData = await this.uriOrBufferToHeap(optimizerModelUriOrBuffer);
        }
        this.checkpointId = createCheckpointHandle(checkpointData);
        [[this.sessionId, this.inputNames, this.outputNames], this.inputEncodedNames, this.outputEncodedNames] = createTrainingSessionHandle(this.checkpointId, trainModelData, evalModelData, optimizerModelData, options);
      }
      /**
       * Helper method that converts a feeds or fetches datatype to two arrays, one of values and one that stores the
       * corresponding name as a number referring to the index in the list of names provided.
       *
       * @param feeds meant to match either SessionHandler.FeedsType or SessionHandler.FetchesType
       * @param names either inputNames or outputNames
       * @returns a tuple of a list of values and a list of indices.
       */
      convertMapIntoValuesArrayAndIndicesArray(feeds, names, mapFunc) {
        const values = [];
        const indices = [];
        Object.entries(feeds).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = names.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid input '${name}`);
          }
          values.push(tensor);
          indices.push(index);
        });
        const uList = values.map(mapFunc);
        return [values, indices, uList];
      }
      /**
       * Helper method that converts the TensorMetadata that the wasm-core functions return to the
       * SessionHandler.ReturnType. Any outputs in the provided outputArray that are falsy will be populated with the
       * corresponding result.
       *
       * @param results used to populate the resultMap if there is no value for that outputName already
       * @param outputArray used to populate the resultMap. If null or undefined, use the corresponding result from results
       * @param outputIndices specifies which outputName the corresponding value for outputArray refers to.
       * @returns a map of output names and OnnxValues.
       */
      convertTensorMetadataToReturnType(results, outputArray, outputIndices) {
        const resultMap = {};
        for (let i = 0; i < results.length; i++) {
          resultMap[this.outputNames[outputIndices[i]]] = outputArray[i] ?? decodeTensorMetadata(results[i]);
        }
        return resultMap;
      }
      async runTrainStep(feeds, fetches, options) {
        const [, inputIndices, inputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          feeds,
          this.inputNames,
          (t, i) => encodeTensorMetadata(t, () => `input "${this.inputNames[inputIndices[i]]}"`)
        );
        const [outputArray, outputIndices, outputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          fetches,
          this.outputNames,
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.outputNames[outputIndices[i]]}"`) : null
        );
        const results = await runTrainStep(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        return this.convertTensorMetadataToReturnType(results, outputArray, outputIndices);
      }
      async dispose() {
        return releaseTrainingSessionAndCheckpoint(
          this.checkpointId,
          this.sessionId,
          this.inputEncodedNames,
          this.outputEncodedNames
        );
      }
    };
  }
});

// web/lib/backend-wasm-training.ts
var backend_wasm_training_exports = {};
__export(backend_wasm_training_exports, {
  wasmBackend: () => wasmBackend
});
var OnnxruntimeTrainingWebAssemblyBackend, wasmBackend;
var init_backend_wasm_training = __esm({
  "web/lib/backend-wasm-training.ts"() {
    "use strict";
    init_backend_wasm();
    init_session_handler_training();
    OnnxruntimeTrainingWebAssemblyBackend = class extends OnnxruntimeWebAssemblyBackend {
      async createTrainingSessionHandler(checkpointStateUriOrBuffer, trainModelUriOrBuffer, evalModelUriOrBuffer, optimizerModelUriOrBuffer, options) {
        const handler = new OnnxruntimeWebAssemblyTrainingSessionHandler();
        await handler.createTrainingSession(
          checkpointStateUriOrBuffer,
          trainModelUriOrBuffer,
          evalModelUriOrBuffer,
          optimizerModelUriOrBuffer,
          options
        );
        return Promise.resolve(handler);
      }
    };
    wasmBackend = new OnnxruntimeTrainingWebAssemblyBackend();
  }
});

// web/lib/index.ts
var lib_exports = {};
__export(lib_exports, {
  InferenceSession: () => InferenceSession2,
  Tensor: () => Tensor2,
  TrainingSession: () => TrainingSession2,
  default: () => lib_default,
  env: () => env2,
  registerBackend: () => registerBackend
});
module.exports = __toCommonJS(lib_exports);
init_esm();
init_esm();
init_esm();

// web/lib/version.ts
var version2 = "1.17.0";

// web/lib/index.ts
var lib_default = esm_exports;
if (false) {
  const onnxjsBackend = null.onnxjsBackend;
  registerBackend("webgl", onnxjsBackend, -10);
}
if (true) {
  const wasmBackend2 = false ? null.wasmBackend : (init_backend_wasm_training(), __toCommonJS(backend_wasm_training_exports)).wasmBackend;
  if (false) {
    registerBackend("webgpu", wasmBackend2, 5);
  }
  registerBackend("cpu", wasmBackend2, 10);
  registerBackend("wasm", wasmBackend2, 10);
  if (false) {
    registerBackend("xnnpack", wasmBackend2, 9);
    registerBackend("webnn", wasmBackend2, 9);
  }
}
Object.defineProperty(env2.versions, "web", { value: version2, enumerable: true });