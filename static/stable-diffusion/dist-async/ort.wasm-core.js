/*!
 * ONNX Runtime Web v1.17.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
"use strict";
var ort = (() => {
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
                backendInfo.initPromise = backendInfo.backend.init(backendName);
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
        const canvas = typeof document !== "undefined" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
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
          if ("toDataURL" in canvas) {
            return canvas.toDataURL();
          } else {
            throw new Error("toDataURL is not supported");
          }
        } else {
          throw new Error("Can not access image data");
        }
      };
      tensorToImageData = (tensor, options) => {
        const pixels2DContext = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d");
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
        const createCanvas = () => {
          if (typeof document !== "undefined") {
            return document.createElement("canvas");
          } else if (typeof OffscreenCanvas !== "undefined") {
            return new OffscreenCanvas(1, 1);
          } else {
            throw new Error("Canvas is not supported");
          }
        };
        const createCanvasContext = (canvas) => {
          if (canvas instanceof HTMLCanvasElement) {
            return canvas.getContext("2d");
          } else if (canvas instanceof OffscreenCanvas) {
            return canvas.getContext("2d");
          } else {
            return null;
          }
        };
        if (isHTMLImageEle) {
          const canvas = createCanvas();
          canvas.width = image.width;
          canvas.height = image.height;
          const pixels2DContext = createCanvasContext(canvas);
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
            const tempCanvas = createCanvas();
            tempCanvas.width = width;
            tempCanvas.height = height;
            const pixels2DContext = createCanvasContext(tempCanvas);
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
          const canvas = createCanvas();
          canvas.width = image.width;
          canvas.height = image.height;
          const pixels2DContext = createCanvasContext(canvas);
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
            const canvas = createCanvas();
            const context = createCanvasContext(canvas);
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

  // common/dist/esm/trace.js
  var TRACE, TRACE_FUNC, TRACE_FUNC_BEGIN, TRACE_FUNC_END;
  var init_trace = __esm({
    "common/dist/esm/trace.js"() {
      "use strict";
      init_env_impl();
      TRACE = (deviceType, label) => {
        if (!env.wasm.trace) {
          return;
        }
        console.timeStamp(`${deviceType}::ORT::${label}`);
      };
      TRACE_FUNC = (msg, extraMsg) => {
        const stack = new Error().stack?.split(/\r\n|\r|\n/g) || [];
        let hasTraceFunc = false;
        for (let i = 0; i < stack.length; i++) {
          if (hasTraceFunc && !stack[i].includes("TRACE_FUNC")) {
            let label = `FUNC_${msg}::${stack[i].trim().split(" ")[1]}`;
            if (extraMsg) {
              label += `::${extraMsg}`;
            }
            TRACE("CPU", label);
            return;
          }
          if (stack[i].includes("TRACE_FUNC")) {
            hasTraceFunc = true;
          }
        }
      };
      TRACE_FUNC_BEGIN = (extraMsg) => {
        if (!env.wasm.trace) {
          return;
        }
        TRACE_FUNC("BEGIN", extraMsg);
      };
      TRACE_FUNC_END = (extraMsg) => {
        if (!env.wasm.trace) {
          return;
        }
        TRACE_FUNC("END", extraMsg);
      };
    }
  });

  // common/dist/esm/inference-session-impl.js
  var InferenceSession;
  var init_inference_session_impl = __esm({
    "common/dist/esm/inference-session-impl.js"() {
      "use strict";
      init_backend_impl();
      init_tensor();
      init_trace();
      InferenceSession = class _InferenceSession {
        constructor(handler) {
          this.handler = handler;
        }
        async run(feeds, arg1, arg2) {
          TRACE_FUNC_BEGIN();
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
          TRACE_FUNC_END();
          return returnValue;
        }
        async release() {
          return this.handler.dispose();
        }
        static async create(arg0, arg1, arg2, arg3) {
          TRACE_FUNC_BEGIN();
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
          TRACE_FUNC_END();
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
        constructor(handler, hasOptimizerModel, hasEvalModel) {
          this.handler = handler;
          this.hasOptimizerModel = hasOptimizerModel;
          this.hasEvalModel = hasEvalModel;
        }
        get trainingInputNames() {
          return this.handler.inputNames;
        }
        get trainingOutputNames() {
          return this.handler.outputNames;
        }
        get evalInputNames() {
          if (this.hasEvalModel) {
            return this.handler.evalInputNames;
          } else {
            throw new Error("This training session has no evalModel loaded.");
          }
        }
        get evalOutputNames() {
          if (this.hasEvalModel) {
            return this.handler.evalOutputNames;
          } else {
            throw new Error("This training session has no evalModel loaded.");
          }
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
            return new _TrainingSession(handler, !!trainingOptions.optimizerModel, !!trainingOptions.evalModel);
          } else {
            throw new Error(noBackendErrMsg);
          }
        }
        /**
         * Helper function for runTrainStep and future runStep methods that handles the type-narrowing conversion from
         * the given parameters to SessionHandler.FetchesType and RunOptions.
         *
         * @param inputNames the feeds object is checked that they contain all input names in the provided list of input
         * names.
         * @param outputNames the fetches object is checked that their keys match up with valid names in the list of output
         * names.
         * @param feeds the required input
         * @param arg1 narrowed & converted into the SessionHandler.FetchesType or RunOptions object
         * @param arg2 optional RunOptions object.
         * @returns
         */
        typeNarrowingForRunStep(inputNames, outputNames, feeds, arg1, arg2) {
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
                if (outputNames.indexOf(name) === -1) {
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
              for (const name of outputNames) {
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
          for (const name of inputNames) {
            if (typeof feeds[name] === "undefined") {
              throw new Error(`input '${name}' is missing in 'feeds'.`);
            }
          }
          if (isFetchesEmpty) {
            for (const name of outputNames) {
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
        async lazyResetGrad() {
          await this.handler.lazyResetGrad();
        }
        async runTrainStep(feeds, arg1, arg2) {
          const [fetches, options] = this.typeNarrowingForRunStep(this.trainingInputNames, this.trainingOutputNames, feeds, arg1, arg2);
          const results = await this.handler.runTrainStep(feeds, fetches, options);
          return this.convertHandlerReturnTypeToMapOfTensors(results);
        }
        async runOptimizerStep(options) {
          if (this.hasOptimizerModel) {
            await this.handler.runOptimizerStep(options || {});
          } else {
            throw new Error("This TrainingSession has no OptimizerModel loaded.");
          }
        }
        async runEvalStep(feeds, arg1, arg2) {
          if (this.hasEvalModel) {
            const [fetches, options] = this.typeNarrowingForRunStep(this.evalInputNames, this.evalOutputNames, feeds, arg1, arg2);
            const results = await this.handler.runEvalStep(feeds, fetches, options);
            return this.convertHandlerReturnTypeToMapOfTensors(results);
          } else {
            throw new Error("This TrainingSession has no EvalModel loaded.");
          }
        }
        async getParametersSize(trainableOnly = true) {
          return this.handler.getParametersSize(trainableOnly);
        }
        async loadParametersBuffer(array, trainableOnly = true) {
          const paramsSize = await this.getParametersSize(trainableOnly);
          if (array.length !== 4 * paramsSize) {
            throw new Error("Size of the buffer passed into loadParametersBuffer must match the number of parameters in the model. Please use getParametersSize method to check.");
          }
          return this.handler.loadParametersBuffer(array, trainableOnly);
        }
        async getContiguousParameters(trainableOnly = true) {
          return this.handler.getContiguousParameters(trainableOnly);
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
    TRACE: () => TRACE,
    TRACE_FUNC_BEGIN: () => TRACE_FUNC_BEGIN,
    TRACE_FUNC_END: () => TRACE_FUNC_END,
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
      init_trace();
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

  // nodejs-ignore:fs
  var fs_exports = {};
  __export(fs_exports, {
    createReadStream: () => createReadStream,
    readFile: () => readFile,
    readFileSync: () => readFileSync
  });
  var readFile, readFileSync, createReadStream;
  var init_fs = __esm({
    "nodejs-ignore:fs"() {
      readFile = void 0;
      readFileSync = void 0;
      createReadStream = void 0;
    }
  });

  // nodejs-ignore:path
  var path_exports = {};
  __export(path_exports, {
    join: () => join
  });
  var join;
  var init_path = __esm({
    "nodejs-ignore:path"() {
      join = void 0;
    }
  });

  // web/lib/wasm/binding/ort-wasm.js
  var require_ort_wasm = __commonJS({
    "web/lib/wasm/binding/ort-wasm.js"(exports, module) {
      "use strict";
      var ortWasm = (() => {
        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
        if (typeof __filename !== "undefined")
          _scriptDir = _scriptDir || __filename;
        return function(moduleArg = {}) {
          var g = moduleArg, aa, l;
          g.ready = new Promise((a, b) => {
            aa = a;
            l = b;
          });
          var ba = Object.assign({}, g), ca = "./this.program", da = "object" == typeof window, p = "function" == typeof importScripts, ea = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, t = "", fa, w, x;
          if (ea) {
            var fs = (init_fs(), __toCommonJS(fs_exports)), ha = (init_path(), __toCommonJS(path_exports));
            t = p ? ha.dirname(t) + "/" : __dirname + "/";
            fa = (a, b) => {
              a = z(a) ? new URL(a) : ha.normalize(a);
              return fs.readFileSync(a, b ? void 0 : "utf8");
            };
            x = (a) => {
              a = fa(a, true);
              a.buffer || (a = new Uint8Array(a));
              return a;
            };
            w = (a, b, c, d = true) => {
              a = z(a) ? new URL(a) : ha.normalize(a);
              fs.readFile(a, d ? void 0 : "utf8", (e, h) => {
                e ? c(e) : b(d ? h.buffer : h);
              });
            };
            !g.thisProgram && 1 < process.argv.length && (ca = process.argv[1].replace(/\\/g, "/"));
            process.argv.slice(2);
            g.inspect = () => "[Emscripten Module object]";
          } else if (da || p)
            p ? t = self.location.href : "undefined" != typeof document && document.currentScript && (t = document.currentScript.src), _scriptDir && (t = _scriptDir), 0 !== t.indexOf("blob:") ? t = t.substr(0, t.replace(/[?#].*/, "").lastIndexOf("/") + 1) : t = "", fa = (a) => {
              var b = new XMLHttpRequest();
              b.open("GET", a, false);
              b.send(null);
              return b.responseText;
            }, p && (x = (a) => {
              var b = new XMLHttpRequest();
              b.open("GET", a, false);
              b.responseType = "arraybuffer";
              b.send(null);
              return new Uint8Array(b.response);
            }), w = (a, b, c) => {
              var d = new XMLHttpRequest();
              d.open("GET", a, true);
              d.responseType = "arraybuffer";
              d.onload = () => {
                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
              };
              d.onerror = c;
              d.send(null);
            };
          var ia = console.log.bind(console), A = console.error.bind(console);
          Object.assign(g, ba);
          ba = null;
          "object" != typeof WebAssembly && ja("no native wasm support detected");
          var B, ka = false, C, D, E, G, I, J, la, ma, na, oa;
          function pa() {
            var a = B.buffer;
            g.HEAP8 = C = new Int8Array(a);
            g.HEAP16 = E = new Int16Array(a);
            g.HEAPU8 = D = new Uint8Array(a);
            g.HEAPU16 = G = new Uint16Array(a);
            g.HEAP32 = I = new Int32Array(a);
            g.HEAPU32 = J = new Uint32Array(a);
            g.HEAPF32 = la = new Float32Array(a);
            g.HEAPF64 = oa = new Float64Array(a);
            g.HEAP64 = ma = new BigInt64Array(a);
            g.HEAPU64 = na = new BigUint64Array(a);
          }
          var qa = [], ra = [], sa = [], K = 0, ta = null, L = null;
          function ja(a) {
            a = "Aborted(" + a + ")";
            A(a);
            ka = true;
            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
            l(a);
            throw a;
          }
          var ua = (a) => a.startsWith("data:application/octet-stream;base64,"), z = (a) => a.startsWith("file://"), M;
          M = "ort-wasm.wasm";
          if (!ua(M)) {
            var va = M;
            M = g.locateFile ? g.locateFile(va, t) : t + va;
          }
          function wa(a) {
            if (x)
              return x(a);
            throw "both async and sync fetching of the wasm failed";
          }
          function xa(a) {
            if (da || p) {
              if ("function" == typeof fetch && !z(a))
                return fetch(a, { credentials: "same-origin" }).then((b) => {
                  if (!b.ok)
                    throw "failed to load wasm binary file at '" + a + "'";
                  return b.arrayBuffer();
                }).catch(() => wa(a));
              if (w)
                return new Promise((b, c) => {
                  w(a, (d) => b(new Uint8Array(d)), c);
                });
            }
            return Promise.resolve().then(() => wa(a));
          }
          function ya(a, b, c) {
            return xa(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {
              A(`failed to asynchronously prepare wasm: ${d}`);
              ja(d);
            });
          }
          function za(a, b) {
            var c = M;
            return "function" != typeof WebAssembly.instantiateStreaming || ua(c) || z(c) || ea || "function" != typeof fetch ? ya(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {
              A(`wasm streaming compile failed: ${e}`);
              A("falling back to ArrayBuffer instantiation");
              return ya(c, a, b);
            }));
          }
          var Aa = { 890824: (a, b, c, d) => {
            if ("undefined" == typeof g || !g.cb)
              return 1;
            a = N(a >>> 0);
            a.startsWith("./") && (a = a.substring(2));
            a = g.cb.get(a);
            if (!a)
              return 2;
            b >>>= 0;
            c >>>= 0;
            if (b + c > a.byteLength)
              return 3;
            try {
              return D.set(a.subarray(b, b + c), d >>> 0 >>> 0), 0;
            } catch {
              return 4;
            }
          } };
          function Ba(a) {
            this.Ua = a - 24;
            this.fb = function(b) {
              J[this.Ua + 4 >>> 2 >>> 0] = b;
            };
            this.eb = function(b) {
              J[this.Ua + 8 >>> 2 >>> 0] = b;
            };
            this.Ya = function(b, c) {
              this.Za();
              this.fb(b);
              this.eb(c);
            };
            this.Za = function() {
              J[this.Ua + 16 >>> 2 >>> 0] = 0;
            };
          }
          var Ca = 0, Da = 0, Ea = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Fa = (a, b, c) => {
            b >>>= 0;
            var d = b + c;
            for (c = b; a[c] && !(c >= d); )
              ++c;
            if (16 < c - b && a.buffer && Ea)
              return Ea.decode(a.subarray(b, c));
            for (d = ""; b < c; ) {
              var e = a[b++];
              if (e & 128) {
                var h = a[b++] & 63;
                if (192 == (e & 224))
                  d += String.fromCharCode((e & 31) << 6 | h);
                else {
                  var k = a[b++] & 63;
                  e = 224 == (e & 240) ? (e & 15) << 12 | h << 6 | k : (e & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;
                  65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
                }
              } else
                d += String.fromCharCode(e);
            }
            return d;
          }, N = (a, b) => (a >>>= 0) ? Fa(D, a, b) : "", O = (a) => {
            for (var b = 0, c = 0; c < a.length; ++c) {
              var d = a.charCodeAt(c);
              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
            }
            return b;
          }, P = (a, b, c, d) => {
            c >>>= 0;
            if (!(0 < d))
              return 0;
            var e = c;
            d = c + d - 1;
            for (var h = 0; h < a.length; ++h) {
              var k = a.charCodeAt(h);
              if (55296 <= k && 57343 >= k) {
                var m = a.charCodeAt(++h);
                k = 65536 + ((k & 1023) << 10) | m & 1023;
              }
              if (127 >= k) {
                if (c >= d)
                  break;
                b[c++ >>> 0] = k;
              } else {
                if (2047 >= k) {
                  if (c + 1 >= d)
                    break;
                  b[c++ >>> 0] = 192 | k >> 6;
                } else {
                  if (65535 >= k) {
                    if (c + 2 >= d)
                      break;
                    b[c++ >>> 0] = 224 | k >> 12;
                  } else {
                    if (c + 3 >= d)
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
            return c - e;
          }, Ga = (a) => {
            if (null === a)
              return "null";
            var b = typeof a;
            return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
          }, Ha, Q = (a) => {
            for (var b = ""; D[a >>> 0]; )
              b += Ha[D[a++ >>> 0]];
            return b;
          }, Ia = {}, Ja = {}, Ka = {}, R;
          function La(a, b, c = {}) {
            var d = b.name;
            if (!a)
              throw new R(`type "${d}" must have a positive integer typeid pointer`);
            if (Ja.hasOwnProperty(a)) {
              if (c.gb)
                return;
              throw new R(`Cannot register type '${d}' twice`);
            }
            Ja[a] = b;
            delete Ka[a];
            Ia.hasOwnProperty(a) && (b = Ia[a], delete Ia[a], b.forEach((e) => e()));
          }
          function S(a, b, c = {}) {
            if (!("argPackAdvance" in b))
              throw new TypeError("registerType registeredInstance requires argPackAdvance");
            La(a, b, c);
          }
          var Ma = (a, b, c) => {
            switch (b) {
              case 1:
                return c ? (d) => C[d >>> 0 >>> 0] : (d) => D[d >>> 0 >>> 0];
              case 2:
                return c ? (d) => E[d >>> 1 >>> 0] : (d) => G[d >>> 1 >>> 0];
              case 4:
                return c ? (d) => I[d >>> 2 >>> 0] : (d) => J[d >>> 2 >>> 0];
              case 8:
                return c ? (d) => ma[d >>> 3] : (d) => na[d >>> 3];
              default:
                throw new TypeError(`invalid integer width (${b}): ${a}`);
            }
          };
          function Na() {
            this.Ra = [void 0];
            this.ab = [];
          }
          var T = new Na();
          function Oa(a) {
            a >>>= 0;
            a >= T.Ua && 0 === --T.get(a).bb && T.Za(a);
          }
          var U = (a) => {
            if (!a)
              throw new R("Cannot use deleted val. handle = " + a);
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
                return T.Ya({ bb: 1, value: a });
            }
          };
          function Pa(a) {
            return this.fromWireType(I[a >>> 2 >>> 0]);
          }
          var Qa = (a, b) => {
            switch (b) {
              case 4:
                return function(c) {
                  return this.fromWireType(la[c >>> 2 >>> 0]);
                };
              case 8:
                return function(c) {
                  return this.fromWireType(oa[c >>> 3 >>> 0]);
                };
              default:
                throw new TypeError(`invalid float width (${b}): ${a}`);
            }
          };
          function Ra(a) {
            return this.fromWireType(J[a >>> 2 >>> 0]);
          }
          var Sa = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, Ta = (a, b) => {
            var c = a >> 1;
            for (var d = c + b / 2; !(c >= d) && G[c >>> 0]; )
              ++c;
            c <<= 1;
            if (32 < c - a && Sa)
              return Sa.decode(D.subarray(a >>> 0, c >>> 0));
            c = "";
            for (d = 0; !(d >= b / 2); ++d) {
              var e = E[a + 2 * d >>> 1 >>> 0];
              if (0 == e)
                break;
              c += String.fromCharCode(e);
            }
            return c;
          }, Ua = (a, b, c) => {
            c ??= 2147483647;
            if (2 > c)
              return 0;
            c -= 2;
            var d = b;
            c = c < 2 * a.length ? c / 2 : a.length;
            for (var e = 0; e < c; ++e)
              E[b >>> 1 >>> 0] = a.charCodeAt(e), b += 2;
            E[b >>> 1 >>> 0] = 0;
            return b - d;
          }, Va = (a) => 2 * a.length, Wa = (a, b) => {
            for (var c = 0, d = ""; !(c >= b / 4); ) {
              var e = I[a + 4 * c >>> 2 >>> 0];
              if (0 == e)
                break;
              ++c;
              65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);
            }
            return d;
          }, Xa = (a, b, c) => {
            b >>>= 0;
            c ??= 2147483647;
            if (4 > c)
              return 0;
            var d = b;
            c = d + c - 4;
            for (var e = 0; e < a.length; ++e) {
              var h = a.charCodeAt(e);
              if (55296 <= h && 57343 >= h) {
                var k = a.charCodeAt(++e);
                h = 65536 + ((h & 1023) << 10) | k & 1023;
              }
              I[b >>> 2 >>> 0] = h;
              b += 4;
              if (b + 4 > c)
                break;
            }
            I[b >>> 2 >>> 0] = 0;
            return b - d;
          }, Ya = (a) => {
            for (var b = 0, c = 0; c < a.length; ++c) {
              var d = a.charCodeAt(c);
              55296 <= d && 57343 >= d && ++c;
              b += 4;
            }
            return b;
          }, $a = (a, b) => {
            var c = Ja[a];
            if (void 0 === c)
              throw a = Za(a), c = Q(a), W(a), new R(b + " has unknown type " + c);
            return c;
          }, ab = (a, b, c) => {
            var d = [];
            a = a.toWireType(d, c);
            d.length && (J[b >>> 2 >>> 0] = V(d));
            return a;
          }, X = [], cb = {}, db = (a) => {
            var b = cb[a];
            return void 0 === b ? Q(a) : b;
          }, eb = () => "object" == typeof globalThis ? globalThis : Function("return this")(), fb = (a) => {
            var b = X.length;
            X.push(a);
            return b;
          }, gb = (a, b) => {
            for (var c = Array(a), d = 0; d < a; ++d)
              c[d] = $a(J[b + 4 * d >>> 2 >>> 0], "parameter " + d);
            return c;
          }, hb = (a, b) => Object.defineProperty(
            b,
            "name",
            { value: a }
          );
          function ib(a) {
            var b = Function;
            if (!(b instanceof Function))
              throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);
            var c = hb(b.name || "unknownFunctionName", function() {
            });
            c.prototype = b.prototype;
            c = new c();
            a = b.apply(c, a);
            return a instanceof Object ? a : c;
          }
          var Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), jb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], kb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], mb = (a) => {
            var b = O(a) + 1, c = lb(b);
            c && P(a, D, c, b);
            return c;
          }, nb = [], ob = {}, qb = () => {
            if (!pb) {
              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ca || "./this.program" }, b;
              for (b in ob)
                void 0 === ob[b] ? delete a[b] : a[b] = ob[b];
              var c = [];
              for (b in a)
                c.push(`${b}=${a[b]}`);
              pb = c;
            }
            return pb;
          }, pb, rb = [null, [], []], sb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], tb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
          function ub(a) {
            var b = Array(O(a) + 1);
            P(a, b, 0, b.length);
            return b;
          }
          function vb(a, b, c, d) {
            function e(f, r, u) {
              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < r; )
                f = u[0] + f;
              return f;
            }
            function h(f, r) {
              return e(f, r, "0");
            }
            function k(f, r) {
              function u(bb) {
                return 0 > bb ? -1 : 0 < bb ? 1 : 0;
              }
              var H;
              0 === (H = u(f.getFullYear() - r.getFullYear())) && 0 === (H = u(f.getMonth() - r.getMonth())) && (H = u(f.getDate() - r.getDate()));
              return H;
            }
            function m(f) {
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
            function q(f) {
              var r = f.Sa;
              for (f = new Date(new Date(f.Ta + 1900, 0, 1).getTime()); 0 < r; ) {
                var u = f.getMonth(), H = (Y(f.getFullYear()) ? sb : tb)[u];
                if (r > H - f.getDate())
                  r -= H - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));
                else {
                  f.setDate(f.getDate() + r);
                  break;
                }
              }
              u = new Date(f.getFullYear() + 1, 0, 4);
              r = m(new Date(
                f.getFullYear(),
                0,
                4
              ));
              u = m(u);
              return 0 >= k(r, f) ? 0 >= k(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;
            }
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            d >>>= 0;
            var n = J[d + 40 >>> 2 >>> 0];
            d = { kb: I[d >>> 2 >>> 0], jb: I[d + 4 >>> 2 >>> 0], Wa: I[d + 8 >>> 2 >>> 0], $a: I[d + 12 >>> 2 >>> 0], Xa: I[d + 16 >>> 2 >>> 0], Ta: I[d + 20 >>> 2 >>> 0], Na: I[d + 24 >>> 2 >>> 0], Sa: I[d + 28 >>> 2 >>> 0], mb: I[d + 32 >>> 2 >>> 0], ib: I[d + 36 >>> 2 >>> 0], lb: n ? N(n) : "" };
            c = N(c);
            n = {
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
            for (var v in n)
              c = c.replace(new RegExp(v, "g"), n[v]);
            var y = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), F = "January February March April May June July August September October November December".split(" ");
            n = { "%a": (f) => y[f.Na].substring(0, 3), "%A": (f) => y[f.Na], "%b": (f) => F[f.Xa].substring(0, 3), "%B": (f) => F[f.Xa], "%C": (f) => h((f.Ta + 1900) / 100 | 0, 2), "%d": (f) => h(f.$a, 2), "%e": (f) => e(f.$a, 2, " "), "%g": (f) => q(f).toString().substring(2), "%G": (f) => q(f), "%H": (f) => h(f.Wa, 2), "%I": (f) => {
              f = f.Wa;
              0 == f ? f = 12 : 12 < f && (f -= 12);
              return h(f, 2);
            }, "%j": (f) => {
              for (var r = 0, u = 0; u <= f.Xa - 1; r += (Y(f.Ta + 1900) ? sb : tb)[u++])
                ;
              return h(f.$a + r, 3);
            }, "%m": (f) => h(f.Xa + 1, 2), "%M": (f) => h(f.jb, 2), "%n": () => "\n", "%p": (f) => 0 <= f.Wa && 12 > f.Wa ? "AM" : "PM", "%S": (f) => h(f.kb, 2), "%t": () => "	", "%u": (f) => f.Na || 7, "%U": (f) => h(Math.floor((f.Sa + 7 - f.Na) / 7), 2), "%V": (f) => {
              var r = Math.floor((f.Sa + 7 - (f.Na + 6) % 7) / 7);
              2 >= (f.Na + 371 - f.Sa - 2) % 7 && r++;
              if (r)
                53 == r && (u = (f.Na + 371 - f.Sa) % 7, 4 == u || 3 == u && Y(f.Ta) || (r = 1));
              else {
                r = 52;
                var u = (f.Na + 7 - f.Sa - 1) % 7;
                (4 == u || 5 == u && Y(f.Ta % 400 - 1)) && r++;
              }
              return h(r, 2);
            }, "%w": (f) => f.Na, "%W": (f) => h(Math.floor((f.Sa + 7 - (f.Na + 6) % 7) / 7), 2), "%y": (f) => (f.Ta + 1900).toString().substring(2), "%Y": (f) => f.Ta + 1900, "%z": (f) => {
              f = f.ib;
              var r = 0 <= f;
              f = Math.abs(f) / 60;
              return (r ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
            }, "%Z": (f) => f.lb, "%%": () => "%" };
            c = c.replace(/%%/g, "\0\0");
            for (v in n)
              c.includes(v) && (c = c.replace(new RegExp(v, "g"), n[v](d)));
            c = c.replace(/\0\0/g, "%");
            v = ub(c);
            if (v.length > b)
              return 0;
            C.set(v, a >>> 0);
            return v.length - 1;
          }
          for (var wb = Array(256), xb = 0; 256 > xb; ++xb)
            wb[xb] = String.fromCharCode(xb);
          Ha = wb;
          R = g.BindingError = class extends Error {
            constructor(a) {
              super(a);
              this.name = "BindingError";
            }
          };
          g.InternalError = class extends Error {
            constructor(a) {
              super(a);
              this.name = "InternalError";
            }
          };
          Object.assign(Na.prototype, { get(a) {
            return this.Ra[a];
          }, has(a) {
            return void 0 !== this.Ra[a];
          }, Ya(a) {
            var b = this.ab.pop() || this.Ra.length;
            this.Ra[b] = a;
            return b;
          }, Za(a) {
            this.Ra[a] = void 0;
            this.ab.push(a);
          } });
          T.Ra.push({ value: void 0 }, { value: null }, { value: true }, { value: false });
          T.Ua = T.Ra.length;
          g.count_emval_handles = () => {
            for (var a = 0, b = T.Ua; b < T.Ra.length; ++b)
              void 0 !== T.Ra[b] && ++a;
            return a;
          };
          var zb = {
            a: function(a, b, c) {
              a >>>= 0;
              new Ba(a).Ya(b >>> 0, c >>> 0);
              Ca = a;
              Da++;
              throw Ca;
            },
            t: function() {
              return 0;
            },
            $: function() {
            },
            M: function() {
            },
            O: function() {
            },
            G: function() {
              return 0;
            },
            Z: function() {
            },
            U: function() {
            },
            Y: function() {
            },
            B: function() {
            },
            N: function() {
            },
            K: function() {
            },
            _: function() {
            },
            L: function() {
            },
            E: function(a, b, c, d, e) {
              b >>>= 0;
              b = Q(b);
              var h = -1 != b.indexOf("u");
              h && (e = (1n << 64n) - 1n);
              S(a >>> 0, { name: b, fromWireType: (k) => k, toWireType: function(k, m) {
                if ("bigint" != typeof m && "number" != typeof m)
                  throw new TypeError(`Cannot convert "${Ga(m)}" to ${this.name}`);
                if (m < d || m > e)
                  throw new TypeError(`Passing a number "${Ga(m)}" from JS side to C/C++ side to an argument of type "${b}", which is outside the valid range [${d}, ${e}]!`);
                return m;
              }, argPackAdvance: 8, readValueFromPointer: Ma(b, c >>> 0, !h), Va: null });
            },
            da: function(a, b, c, d) {
              b = Q(b >>> 0);
              S(a >>> 0, { name: b, fromWireType: function(e) {
                return !!e;
              }, toWireType: function(e, h) {
                return h ? c : d;
              }, argPackAdvance: 8, readValueFromPointer: function(e) {
                return this.fromWireType(D[e >>> 0]);
              }, Va: null });
            },
            ca: function(a, b) {
              b = Q(b >>> 0);
              S(a >>> 0, {
                name: b,
                fromWireType: (c) => {
                  var d = U(c);
                  Oa(c);
                  return d;
                },
                toWireType: (c, d) => V(d),
                argPackAdvance: 8,
                readValueFromPointer: Pa,
                Va: null
              });
            },
            D: function(a, b, c) {
              b = Q(b >>> 0);
              S(a >>> 0, { name: b, fromWireType: (d) => d, toWireType: (d, e) => e, argPackAdvance: 8, readValueFromPointer: Qa(b, c >>> 0), Va: null });
            },
            q: function(a, b, c, d, e) {
              a >>>= 0;
              c >>>= 0;
              b = Q(b >>> 0);
              -1 === e && (e = 4294967295);
              e = (m) => m;
              if (0 === d) {
                var h = 32 - 8 * c;
                e = (m) => m << h >>> h;
              }
              var k = b.includes("unsigned") ? function(m, q) {
                return q >>> 0;
              } : function(m, q) {
                return q;
              };
              S(a, {
                name: b,
                fromWireType: e,
                toWireType: k,
                argPackAdvance: 8,
                readValueFromPointer: Ma(b, c, 0 !== d),
                Va: null
              });
            },
            l: function(a, b, c) {
              function d(h) {
                return new e(C.buffer, J[h + 4 >>> 2 >>> 0], J[h >>> 2 >>> 0]);
              }
              var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];
              c = Q(c >>> 0);
              S(a >>> 0, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d }, { gb: true });
            },
            F: function(a, b) {
              b = Q(b >>> 0);
              var c = "std::string" === b;
              S(a >>> 0, { name: b, fromWireType: function(d) {
                var e = J[d >>> 2 >>> 0], h = d + 4;
                if (c)
                  for (var k = h, m = 0; m <= e; ++m) {
                    var q = h + m;
                    if (m == e || 0 == D[q >>> 0]) {
                      k = N(k, q - k);
                      if (void 0 === n)
                        var n = k;
                      else
                        n += String.fromCharCode(0), n += k;
                      k = q + 1;
                    }
                  }
                else {
                  n = Array(e);
                  for (m = 0; m < e; ++m)
                    n[m] = String.fromCharCode(D[h + m >>> 0]);
                  n = n.join("");
                }
                W(d);
                return n;
              }, toWireType: function(d, e) {
                e instanceof ArrayBuffer && (e = new Uint8Array(e));
                var h = "string" == typeof e;
                if (!(h || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array))
                  throw new R("Cannot pass non-string to std::string");
                var k = c && h ? O(e) : e.length;
                var m = lb(4 + k + 1), q = m + 4;
                J[m >>> 2 >>> 0] = k;
                if (c && h)
                  P(e, D, q, k + 1);
                else if (h)
                  for (h = 0; h < k; ++h) {
                    var n = e.charCodeAt(h);
                    if (255 < n)
                      throw W(q), new R("String has UTF-16 code units that do not fit in 8 bits");
                    D[q + h >>> 0] = n;
                  }
                else
                  for (h = 0; h < k; ++h)
                    D[q + h >>> 0] = e[h];
                null !== d && d.push(W, m);
                return m;
              }, argPackAdvance: 8, readValueFromPointer: Ra, Va(d) {
                W(d);
              } });
            },
            v: function(a, b, c) {
              b >>>= 0;
              c >>>= 0;
              c = Q(c);
              if (2 === b) {
                var d = Ta;
                var e = Ua;
                var h = Va;
                var k = () => G;
                var m = 1;
              } else
                4 === b && (d = Wa, e = Xa, h = Ya, k = () => J, m = 2);
              S(a >>> 0, { name: c, fromWireType: (q) => {
                for (var n = J[q >>> 2 >>> 0], v = k(), y, F = q + 4, f = 0; f <= n; ++f) {
                  var r = q + 4 + f * b;
                  if (f == n || 0 == v[r >>> m])
                    F = d(F, r - F), void 0 === y ? y = F : (y += String.fromCharCode(0), y += F), F = r + b;
                }
                W(q);
                return y;
              }, toWireType: (q, n) => {
                if ("string" != typeof n)
                  throw new R(`Cannot pass non-string to C++ string type ${c}`);
                var v = h(n), y = lb(4 + v + b);
                J[y >>> 2] = v >> m;
                e(n, y + 4, v + b);
                null !== q && q.push(W, y);
                return y;
              }, argPackAdvance: 8, readValueFromPointer: Pa, Va(q) {
                W(q);
              } });
            },
            ea: function(a, b) {
              b = Q(b >>> 0);
              S(a >>> 0, { hb: true, name: b, argPackAdvance: 0, fromWireType: () => {
              }, toWireType: () => {
              } });
            },
            aa: () => 1,
            o: function(a, b, c) {
              b >>>= 0;
              c >>>= 0;
              a = U(a >>> 0);
              b = $a(b, "emval::as");
              return ab(b, c, a);
            },
            x: function(a, b, c, d) {
              c >>>= 0;
              d >>>= 0;
              a = X[a >>> 0];
              b = U(b >>> 0);
              return a(null, b, c, d);
            },
            j: function(a, b, c, d, e) {
              c >>>= 0;
              d >>>= 0;
              e >>>= 0;
              a = X[a >>> 0];
              b = U(b >>> 0);
              c = db(c);
              return a(b, b[c], d, e);
            },
            b: Oa,
            w: function(a, b) {
              b >>>= 0;
              a = U(a >>> 0);
              b = U(b);
              return a == b;
            },
            s: function(a) {
              a >>>= 0;
              if (0 === a)
                return V(eb());
              a = db(a);
              return V(eb()[a]);
            },
            i: function(a, b, c) {
              b = gb(a, b >>> 0);
              var d = b.shift();
              a--;
              var e = "return function (obj, func, destructorsRef, args) {\n", h = 0, k = [];
              0 === c && k.push("obj");
              for (var m = ["retType"], q = [d], n = 0; n < a; ++n)
                k.push("arg" + n), m.push("argType" + n), q.push(b[n]), e += `  var arg${n} = argType${n}.readValueFromPointer(args${h ? "+" + h : ""});
`, h += b[n].argPackAdvance;
              e += `  var rv = ${1 === c ? "new func" : "func.call"}(${k.join(", ")});
`;
              for (n = 0; n < a; ++n)
                b[n].deleteObject && (e += `  argType${n}.deleteObject(arg${n});
`);
              d.hb || (m.push("emval_returnValue"), q.push(ab), e += "  return emval_returnValue(retType, destructorsRef, rv);\n");
              m.push(e + "};\n");
              a = ib(m).apply(null, q);
              c = `methodCaller<(${b.map((v) => v.name).join(", ")}) => ${d.name}>`;
              return fb(hb(c, a));
            },
            p: function(a, b) {
              b >>>= 0;
              a = U(a >>> 0);
              b = U(b);
              return V(a[b]);
            },
            c: function(a) {
              a >>>= 0;
              4 < a && (T.get(a).bb += 1);
            },
            r: function() {
              return V([]);
            },
            k: function(a) {
              a = U(a >>> 0);
              for (var b = Array(a.length), c = 0; c < a.length; c++)
                b[c] = a[c];
              return V(b);
            },
            d: function(a) {
              return V(db(a >>> 0));
            },
            h: function() {
              return V({});
            },
            g: function(a) {
              a >>>= 0;
              for (var b = U(a); b.length; ) {
                var c = b.pop();
                b.pop()(c);
              }
              Oa(a);
            },
            f: function(a, b, c) {
              b >>>= 0;
              c >>>= 0;
              a = U(a >>> 0);
              b = U(b);
              c = U(c);
              a[b] = c;
            },
            e: function(a, b) {
              b >>>= 0;
              a = $a(a >>> 0, "_emval_take_value");
              a = a.readValueFromPointer(b);
              return V(a);
            },
            R: function(a, b) {
              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
              b >>>= 0;
              a = new Date(1e3 * a);
              I[b >>> 2 >>> 0] = a.getUTCSeconds();
              I[b + 4 >>> 2 >>> 0] = a.getUTCMinutes();
              I[b + 8 >>> 2 >>> 0] = a.getUTCHours();
              I[b + 12 >>> 2 >>> 0] = a.getUTCDate();
              I[b + 16 >>> 2 >>> 0] = a.getUTCMonth();
              I[b + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;
              I[b + 24 >>> 2 >>> 0] = a.getUTCDay();
              I[b + 28 >>> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
            },
            S: function(a, b) {
              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
              b >>>= 0;
              a = new Date(1e3 * a);
              I[b >>> 2 >>> 0] = a.getSeconds();
              I[b + 4 >>> 2 >>> 0] = a.getMinutes();
              I[b + 8 >>> 2 >>> 0] = a.getHours();
              I[b + 12 >>> 2 >>> 0] = a.getDate();
              I[b + 16 >>> 2 >>> 0] = a.getMonth();
              I[b + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;
              I[b + 24 >>> 2 >>> 0] = a.getDay();
              I[b + 28 >>> 2 >>> 0] = (Y(a.getFullYear()) ? jb : kb)[a.getMonth()] + a.getDate() - 1 | 0;
              I[b + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());
              var c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset(), d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
              I[b + 32 >>> 2 >>> 0] = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
            },
            T: function(a) {
              a >>>= 0;
              var b = new Date(I[a + 20 >>> 2 >>> 0] + 1900, I[a + 16 >>> 2 >>> 0], I[a + 12 >>> 2 >>> 0], I[a + 8 >>> 2 >>> 0], I[a + 4 >>> 2 >>> 0], I[a >>> 2 >>> 0], 0), c = I[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), e = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(h, e);
              0 > c ? I[a + 32 >>> 2 >>> 0] = Number(e != h && k == d) : 0 < c != (k == d) && (e = Math.max(h, e), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : e) - d)));
              I[a + 24 >>> 2 >>> 0] = b.getDay();
              I[a + 28 >>> 2 >>> 0] = (Y(b.getFullYear()) ? jb : kb)[b.getMonth()] + b.getDate() - 1 | 0;
              I[a >>> 2 >>> 0] = b.getSeconds();
              I[a + 4 >>> 2 >>> 0] = b.getMinutes();
              I[a + 8 >>> 2 >>> 0] = b.getHours();
              I[a + 12 >>> 2 >>> 0] = b.getDate();
              I[a + 16 >>> 2 >>> 0] = b.getMonth();
              I[a + 20 >>> 2 >>> 0] = b.getYear();
              a = b.getTime();
              isNaN(a) ? (I[yb() >>> 2 >>> 0] = 61, a = -1) : a /= 1e3;
              return BigInt(a);
            },
            P: function() {
              return -52;
            },
            Q: function() {
            },
            I: function(a, b, c) {
              function d(q) {
                return (q = q.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? q[1] : "GMT";
              }
              c >>>= 0;
              var e = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(
                e,
                0,
                1
              ), k = new Date(e, 6, 1);
              e = h.getTimezoneOffset();
              var m = k.getTimezoneOffset();
              J[a >>> 0 >>> 2 >>> 0] = 60 * Math.max(e, m);
              I[b >>> 0 >>> 2 >>> 0] = Number(e != m);
              a = d(h);
              b = d(k);
              a = mb(a);
              b = mb(b);
              m < e ? (J[c >>> 2 >>> 0] = a, J[c + 4 >>> 2 >>> 0] = b) : (J[c >>> 2 >>> 0] = b, J[c + 4 >>> 2 >>> 0] = a);
            },
            y: () => {
              ja("");
            },
            fa: function(a, b, c) {
              a >>>= 0;
              b >>>= 0;
              c >>>= 0;
              nb.length = 0;
              for (var d; d = D[b++ >>> 0]; ) {
                var e = 105 != d;
                e &= 112 != d;
                c += e && c % 8 ? 4 : 0;
                nb.push(112 == d ? J[c >>> 2 >>> 0] : 106 == d ? ma[c >>> 3] : 105 == d ? I[c >>> 2 >>> 0] : oa[c >>> 3 >>> 0]);
                c += e ? 8 : 4;
              }
              return Aa[a].apply(null, nb);
            },
            C: () => Date.now(),
            J: function() {
              return 4294901760;
            },
            n: () => performance.now(),
            H: function(a) {
              a >>>= 0;
              var b = D.length;
              if (4294901760 < a)
                return false;
              for (var c = 1; 4 >= c; c *= 2) {
                var d = b * (1 + 0.2 / c);
                d = Math.min(d, a + 100663296);
                var e = Math;
                d = Math.max(a, d);
                a: {
                  e = (e.min.call(e, 4294901760, d + (65536 - d % 65536) % 65536) - B.buffer.byteLength + 65535) / 65536;
                  try {
                    B.grow(e);
                    pa();
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
            W: function(a, b) {
              a >>>= 0;
              b >>>= 0;
              var c = 0;
              qb().forEach((d, e) => {
                var h = b + c;
                e = J[a + 4 * e >>> 2 >>> 0] = h;
                for (h = 0; h < d.length; ++h)
                  C[e++ >>> 0 >>> 0] = d.charCodeAt(h);
                C[e >>> 0 >>> 0] = 0;
                c += d.length + 1;
              });
              return 0;
            },
            X: function(a, b) {
              a >>>= 0;
              b >>>= 0;
              var c = qb();
              J[a >>> 2 >>> 0] = c.length;
              var d = 0;
              c.forEach((e) => d += e.length + 1);
              J[b >>> 2 >>> 0] = d;
              return 0;
            },
            u: () => 52,
            A: function() {
              return 52;
            },
            V: function() {
              return 70;
            },
            z: function(a, b, c, d) {
              b >>>= 0;
              c >>>= 0;
              d >>>= 0;
              for (var e = 0, h = 0; h < c; h++) {
                var k = J[b >>> 2 >>> 0], m = J[b + 4 >>> 2 >>> 0];
                b += 8;
                for (var q = 0; q < m; q++) {
                  var n = D[k + q >>> 0], v = rb[a];
                  0 === n || 10 === n ? ((1 === a ? ia : A)(Fa(v, 0)), v.length = 0) : v.push(n);
                }
                e += m;
              }
              J[d >>> 2 >>> 0] = e;
              return 0;
            },
            ba: vb,
            m: function(a, b, c, d) {
              return vb(a >>> 0, b >>> 0, c >>> 0, d >>> 0);
            }
          }, Z = function() {
            function a(c) {
              Z = c.exports;
              Z = Ab();
              B = Z.ga;
              pa();
              ra.unshift(Z.ha);
              K--;
              0 == K && (null !== ta && (clearInterval(ta), ta = null), L && (c = L, L = null, c()));
              return Z;
            }
            var b = { a: zb };
            K++;
            if (g.instantiateWasm)
              try {
                return g.instantiateWasm(b, a);
              } catch (c) {
                A(`Module.instantiateWasm callback failed with error: ${c}`), l(c);
              }
            za(b, function(c) {
              a(c.instance);
            }).catch(l);
            return {};
          }();
          g._OrtInit = (a, b) => (g._OrtInit = Z.ia)(a, b);
          g._OrtGetLastError = (a, b) => (g._OrtGetLastError = Z.ja)(a, b);
          g._OrtCreateSessionOptions = (a, b, c, d, e, h, k, m, q, n) => (g._OrtCreateSessionOptions = Z.ka)(a, b, c, d, e, h, k, m, q, n);
          g._OrtAppendExecutionProvider = (a, b) => (g._OrtAppendExecutionProvider = Z.la)(a, b);
          g._OrtAddFreeDimensionOverride = (a, b, c) => (g._OrtAddFreeDimensionOverride = Z.ma)(a, b, c);
          g._OrtAddSessionConfigEntry = (a, b, c) => (g._OrtAddSessionConfigEntry = Z.na)(a, b, c);
          g._OrtReleaseSessionOptions = (a) => (g._OrtReleaseSessionOptions = Z.oa)(a);
          g._OrtCreateSession = (a, b, c) => (g._OrtCreateSession = Z.pa)(a, b, c);
          g._OrtReleaseSession = (a) => (g._OrtReleaseSession = Z.qa)(a);
          g._OrtGetInputOutputCount = (a, b, c) => (g._OrtGetInputOutputCount = Z.ra)(a, b, c);
          g._OrtGetInputName = (a, b) => (g._OrtGetInputName = Z.sa)(a, b);
          g._OrtGetOutputName = (a, b) => (g._OrtGetOutputName = Z.ta)(a, b);
          g._OrtFree = (a) => (g._OrtFree = Z.ua)(a);
          g._OrtCreateTensor = (a, b, c, d, e, h) => (g._OrtCreateTensor = Z.va)(a, b, c, d, e, h);
          g._OrtGetTensorData = (a, b, c, d, e) => (g._OrtGetTensorData = Z.wa)(a, b, c, d, e);
          g._OrtReleaseTensor = (a) => (g._OrtReleaseTensor = Z.xa)(a);
          g._OrtCreateRunOptions = (a, b, c, d) => (g._OrtCreateRunOptions = Z.ya)(a, b, c, d);
          g._OrtAddRunConfigEntry = (a, b, c) => (g._OrtAddRunConfigEntry = Z.za)(a, b, c);
          g._OrtReleaseRunOptions = (a) => (g._OrtReleaseRunOptions = Z.Aa)(a);
          g._OrtCreateBinding = (a) => (g._OrtCreateBinding = Z.Ba)(a);
          g._OrtBindInput = (a, b, c) => (g._OrtBindInput = Z.Ca)(a, b, c);
          g._OrtBindOutput = (a, b, c, d) => (g._OrtBindOutput = Z.Da)(a, b, c, d);
          g._OrtClearBoundOutputs = (a) => (g._OrtClearBoundOutputs = Z.Ea)(a);
          g._OrtReleaseBinding = (a) => (g._OrtReleaseBinding = Z.Fa)(a);
          g._OrtRunWithBinding = (a, b, c, d, e) => (g._OrtRunWithBinding = Z.Ga)(a, b, c, d, e);
          g._OrtRun = (a, b, c, d, e, h, k, m) => (g._OrtRun = Z.Ha)(a, b, c, d, e, h, k, m);
          g._OrtEndProfiling = (a) => (g._OrtEndProfiling = Z.Ia)(a);
          var yb = () => (yb = Z.Ja)(), lb = g._malloc = (a) => (lb = g._malloc = Z.Ka)(a), W = g._free = (a) => (W = g._free = Z.La)(a), Za = (a) => (Za = Z.Ma)(a), Bb = () => (Bb = Z.Oa)(), Cb = (a) => (Cb = Z.Pa)(a), Db = (a) => (Db = Z.Qa)(a);
          function Ab() {
            var a = Z;
            a = Object.assign({}, a);
            var b = (d) => () => d() >>> 0, c = (d) => (e) => d(e) >>> 0;
            a.Ja = b(a.Ja);
            a.Ka = c(a.Ka);
            a.Ma = c(a.Ma);
            a.Oa = b(a.Oa);
            a.Qa = c(a.Qa);
            return a;
          }
          g.stackAlloc = Db;
          g.stackSave = Bb;
          g.stackRestore = Cb;
          g.UTF8ToString = N;
          g.stringToUTF8 = (a, b, c) => P(a, D, b, c);
          g.lengthBytesUTF8 = O;
          var Eb;
          L = function Fb() {
            Eb || Gb();
            Eb || (L = Fb);
          };
          function Gb() {
            if (!(0 < K)) {
              if (g.preRun)
                for ("function" == typeof g.preRun && (g.preRun = [g.preRun]); g.preRun.length; ) {
                  var a = g.preRun.shift();
                  qa.unshift(a);
                }
              for (; 0 < qa.length; )
                qa.shift()(g);
              if (!(0 < K || Eb || (Eb = true, g.calledRun = true, ka))) {
                for (; 0 < ra.length; )
                  ra.shift()(g);
                for (aa(g); 0 < sa.length; )
                  sa.shift()(g);
              }
            }
          }
          Gb();
          return moduleArg.ready;
        };
      })();
      if (typeof exports === "object" && typeof module === "object")
        module.exports = ortWasm;
      else if (typeof define === "function" && define["amd"])
        define([], () => ortWasm);
    }
  });

  // web/lib/wasm/wasm-factory.ts
  var ortWasmFactory, ortWasmFactoryThreaded, wasm, initialized, initializing, aborted, isMultiThreadSupported, isSimdSupported, getWasmFileName, initializeWebAssembly, getInstance;
  var init_wasm_factory = __esm({
    "web/lib/wasm/wasm-factory.ts"() {
      "use strict";
      if (false) {
        ortWasmFactory = null;
      } else {
        ortWasmFactory = true ? require_ort_wasm() : null;
      }
      ortWasmFactoryThreaded = false ? true ? null : null : ortWasmFactory;
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
          if (false) {
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
              if (false) {
                return URL.createObjectURL(new Blob(
                  [
                    // This require() function is handled by esbuild plugin to load file content as string.
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    null
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
          if (false) {
            config.numThreads = numThreads;
            if (typeof Blob === "undefined") {
              config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");
            } else {
              const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;
              config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });
            }
          }
          factory(config).then(
            // wasm module initialized successfully
            (module) => {
              initializing = false;
              initialized = true;
              wasm = module;
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

  // nodejs-ignore:node:fs/promises
  var readFile2;
  var init_promises = __esm({
    "nodejs-ignore:node:fs/promises"() {
      readFile2 = void 0;
    }
  });

  // web/lib/wasm/wasm-utils-load-file.ts
  var loadFile;
  var init_wasm_utils_load_file = __esm({
    "web/lib/wasm/wasm-utils-load-file.ts"() {
      "use strict";
      init_fs();
      init_promises();
      loadFile = async (file) => {
        if (typeof file === "string") {
          if (typeof process !== "undefined" && process.versions && process.versions.node) {
            try {
              return new Uint8Array(await readFile2(file));
            } catch (e) {
              if (e.code === "ERR_FS_FILE_TOO_LARGE") {
                const stream = createReadStream(file);
                const chunks = [];
                for await (const chunk of stream) {
                  chunks.push(chunk);
                }
                return new Uint8Array(Buffer.concat(chunks));
              }
              throw e;
            }
          } else {
            const response = await fetch(file);
            if (!response.ok) {
              throw new Error(`failed to load external data file: ${file}`);
            }
            const contentLengthHeader = response.headers.get("Content-Length");
            const fileSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
            if (fileSize < 1073741824) {
              return new Uint8Array(await response.arrayBuffer());
            } else {
              if (!response.body) {
                throw new Error(`failed to load external data file: ${file}, no response body.`);
              }
              const reader = response.body.getReader();
              const pages = Math.ceil(fileSize / 65536);
              const buffer = new WebAssembly.Memory({ initial: pages, maximum: pages }).buffer;
              let offset = 0;
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  break;
                }
                const chunkSize = value.byteLength;
                const chunk = new Uint8Array(buffer, offset, chunkSize);
                chunk.set(value);
                offset += chunkSize;
              }
              return new Uint8Array(buffer, 0, fileSize);
            }
          }
        } else if (file instanceof Blob) {
          return new Uint8Array(await file.arrayBuffer());
        } else if (file instanceof Uint8Array) {
          return file;
        } else {
          return new Uint8Array(file);
        }
      };
    }
  });

  // web/lib/wasm/wasm-core-impl.ts
  var initOrt, initRuntime, initEp, activeSessions, getSessionInputOutputCount, copyFromExternalBuffer, createSession, releaseSession, prepareInputOutputTensor, run, endProfiling;
  var init_wasm_core_impl = __esm({
    "web/lib/wasm/wasm-core-impl.ts"() {
      "use strict";
      init_run_options();
      init_session_options();
      init_wasm_common();
      init_wasm_factory();
      init_wasm_utils();
      init_wasm_utils_load_file();
      initOrt = (numThreads, loggingLevel) => {
        const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);
        if (errorCode !== 0) {
          checkLastError("Can't initialize onnxruntime.");
        }
      };
      initRuntime = async (env3) => {
        initOrt(env3.wasm.numThreads, logLevelStringToEnum(env3.logLevel));
      };
      initEp = async (env3, epName) => {
        if (false) {
          if (typeof navigator === "undefined" || !navigator.gpu) {
            throw new Error("WebGPU is not supported in current environment");
          }
          const adapter = await navigator.gpu.requestAdapter();
          if (!adapter) {
            throw new Error(
              'Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.'
            );
          }
          if (!env3.wasm.simd) {
            throw new Error(
              "Not supported for WebGPU=ON and SIMD=OFF. Please set `env.wasm.simd` to true when using `webgpu` EP"
            );
          }
          const initJsep = null.init;
          await initJsep(getInstance(), env3, adapter);
        }
      };
      activeSessions = /* @__PURE__ */ new Map();
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
      copyFromExternalBuffer = (model) => {
        const wasm2 = getInstance();
        const modelDataOffset = wasm2._malloc(model.byteLength);
        if (modelDataOffset === 0) {
          throw new Error(`Can't create a session. failed to allocate a buffer of size ${model.byteLength}.`);
        }
        wasm2.HEAPU8.set(model, modelDataOffset);
        return [modelDataOffset, model.byteLength];
      };
      createSession = async (modelData, options) => {
        let modelDataOffset, modelDataLength;
        const wasm2 = getInstance();
        if (Array.isArray(modelData)) {
          [modelDataOffset, modelDataLength] = modelData;
        } else if (modelData.buffer === wasm2.HEAPU8.buffer) {
          [modelDataOffset, modelDataLength] = [modelData.byteOffset, modelData.byteLength];
        } else {
          [modelDataOffset, modelDataLength] = copyFromExternalBuffer(modelData);
        }
        let sessionHandle = 0;
        let sessionOptionsHandle = 0;
        let ioBindingHandle = 0;
        let allocs = [];
        const inputNamesUTF8Encoded = [];
        const outputNamesUTF8Encoded = [];
        try {
          [sessionOptionsHandle, allocs] = setSessionOptions(options);
          if (options?.externalData && wasm2.mountExternalData) {
            const loadingPromises = [];
            for (const file of options.externalData) {
              const path = typeof file === "string" ? file : file.path;
              loadingPromises.push(loadFile(typeof file === "string" ? file : file.data).then((data) => {
                wasm2.mountExternalData(path, data);
              }));
            }
            await Promise.all(loadingPromises);
          }
          sessionHandle = await wasm2._OrtCreateSession(modelDataOffset, modelDataLength, sessionOptionsHandle);
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
          wasm2._free(modelDataOffset);
          if (sessionOptionsHandle !== 0) {
            wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
          }
          allocs.forEach((alloc) => wasm2._free(alloc));
          wasm2.unmountExternalData?.();
        }
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
    }
  });

  // web/lib/wasm/proxy-wrapper.ts
  var initializing2, initialized2, aborted2, scriptSrc, initializeWebAssemblyAndOrtRuntime, initializeOrtEp, copyFromExternalBuffer2, createSession2, releaseSession2, run2, endProfiling2;
  var init_proxy_wrapper = __esm({
    "web/lib/wasm/proxy-wrapper.ts"() {
      "use strict";
      init_esm();
      init_wasm_core_impl();
      init_wasm_factory();
      initializing2 = false;
      initialized2 = false;
      aborted2 = false;
      scriptSrc = typeof document !== "undefined" ? document?.currentScript?.src : void 0;
      initializeWebAssemblyAndOrtRuntime = async () => {
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
        if (false) {
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
                null
              ],
              { type: "text/javascript" }
            ));
            proxyWorker = new Worker(workerUrl, { name: "ort-wasm-proxy-worker" });
            proxyWorker.onerror = (ev) => reject(ev);
            proxyWorker.onmessage = onProxyWorkerMessage;
            URL.revokeObjectURL(workerUrl);
            initWasmCallbacks = [resolve, reject];
            const message = { type: "init-wasm", in: env2 };
            proxyWorker.postMessage(message);
          });
        } else {
          try {
            await initializeWebAssembly(env2.wasm);
            await initRuntime(env2);
            initialized2 = true;
          } catch (e) {
            aborted2 = true;
            throw e;
          } finally {
            initializing2 = false;
          }
        }
      };
      initializeOrtEp = async (epName) => {
        if (false) {
          ensureWorker();
          return new Promise((resolve, reject) => {
            enqueueCallbacks("init-ep", [resolve, reject]);
            const message = { type: "init-ep", in: { epName, env: env2 } };
            proxyWorker.postMessage(message);
          });
        } else {
          await initEp(env2, epName);
        }
      };
      copyFromExternalBuffer2 = async (buffer) => {
        if (false) {
          ensureWorker();
          return new Promise((resolve, reject) => {
            enqueueCallbacks("copy-from", [resolve, reject]);
            const message = { type: "copy-from", in: { buffer } };
            proxyWorker.postMessage(message, [buffer.buffer]);
          });
        } else {
          return copyFromExternalBuffer(buffer);
        }
      };
      createSession2 = async (model, options) => {
        if (false) {
          if (options?.preferredOutputLocation) {
            throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
          }
          ensureWorker();
          return new Promise((resolve, reject) => {
            enqueueCallbacks("create", [resolve, reject]);
            const message = { type: "create", in: { model, options } };
            const transferable = [];
            if (model instanceof Uint8Array) {
              transferable.push(model.buffer);
            }
            proxyWorker.postMessage(message, transferable);
          });
        } else {
          return createSession(model, options);
        }
      };
      releaseSession2 = async (sessionId) => {
        if (false) {
          ensureWorker();
          return new Promise((resolve, reject) => {
            enqueueCallbacks("release", [resolve, reject]);
            const message = { type: "release", in: sessionId };
            proxyWorker.postMessage(message);
          });
        } else {
          releaseSession(sessionId);
        }
      };
      run2 = async (sessionId, inputIndices, inputs, outputIndices, outputs, options) => {
        if (false) {
          if (inputs.some((t) => t[3] !== "cpu")) {
            throw new Error("input tensor on GPU is not supported for proxy.");
          }
          if (outputs.some((t) => t)) {
            throw new Error("pre-allocated output tensor is not supported for proxy.");
          }
          ensureWorker();
          return new Promise((resolve, reject) => {
            enqueueCallbacks("run", [resolve, reject]);
            const serializableInputs = inputs;
            const message = { type: "run", in: { sessionId, inputIndices, inputs: serializableInputs, outputIndices, options } };
            proxyWorker.postMessage(message, extractTransferableBuffers(serializableInputs));
          });
        } else {
          return run(sessionId, inputIndices, inputs, outputIndices, outputs, options);
        }
      };
      endProfiling2 = async (sessionId) => {
        if (false) {
          ensureWorker();
          return new Promise((resolve, reject) => {
            enqueueCallbacks("end-profiling", [resolve, reject]);
            const message = { type: "end-profiling", in: sessionId };
            proxyWorker.postMessage(message);
          });
        } else {
          endProfiling(sessionId);
        }
      };
    }
  });

  // web/lib/wasm/session-handler-inference.ts
  var encodeTensorMetadata, decodeTensorMetadata, OnnxruntimeWebAssemblySessionHandler;
  var init_session_handler_inference = __esm({
    "web/lib/wasm/session-handler-inference.ts"() {
      "use strict";
      init_esm();
      init_proxy_wrapper();
      init_wasm_common();
      init_wasm_utils_load_file();
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
        async fetchModelAndCopyToWasmMemory(path) {
          return copyFromExternalBuffer2(await loadFile(path));
        }
        async loadModel(pathOrBuffer, options) {
          TRACE_FUNC_BEGIN();
          let model;
          if (typeof pathOrBuffer === "string") {
            if (typeof process !== "undefined" && process.versions && process.versions.node) {
              model = await loadFile(pathOrBuffer);
            } else {
              model = await this.fetchModelAndCopyToWasmMemory(pathOrBuffer);
            }
          } else {
            model = pathOrBuffer;
          }
          [this.sessionId, this.inputNames, this.outputNames] = await createSession2(model, options);
          TRACE_FUNC_END();
        }
        async dispose() {
          return releaseSession2(this.sessionId);
        }
        async run(feeds, fetches, options) {
          TRACE_FUNC_BEGIN();
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
          TRACE_FUNC_END();
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
        if (typeof env2.wasm.trace !== "boolean") {
          env2.wasm.trace = false;
        }
        if (typeof env2.wasm.numThreads !== "number" || !Number.isInteger(env2.wasm.numThreads) || env2.wasm.numThreads <= 0) {
          const numCpuLogicalCores = typeof navigator === "undefined" ? cpus().length : navigator.hardwareConcurrency;
          env2.wasm.numThreads = Math.min(4, Math.ceil((numCpuLogicalCores || 1) / 2));
        }
      };
      OnnxruntimeWebAssemblyBackend = class {
        /**
         * This function initializes the WebAssembly backend.
         *
         * This function will be called only once for each backend name. It will be called the first time when
         * `ort.InferenceSession.create()` is called with a registered backend name.
         *
         * @param backendName - the registered backend name.
         */
        async init(backendName) {
          initializeFlags();
          await initializeWebAssemblyAndOrtRuntime();
          await initializeOrtEp(backendName);
        }
        async createInferenceSessionHandler(pathOrBuffer, options) {
          const handler = new OnnxruntimeWebAssemblySessionHandler();
          await handler.loadModel(pathOrBuffer, options);
          return Promise.resolve(handler);
        }
      };
    }
  });

  // web/lib/backend-wasm-inference.ts
  var backend_wasm_inference_exports = {};
  __export(backend_wasm_inference_exports, {
    wasmBackend: () => wasmBackend
  });
  var wasmBackend;
  var init_backend_wasm_inference = __esm({
    "web/lib/backend-wasm-inference.ts"() {
      "use strict";
      init_backend_wasm();
      wasmBackend = new OnnxruntimeWebAssemblyBackend();
    }
  });

  // web/lib/index.ts
  var lib_exports = {};
  __export(lib_exports, {
    InferenceSession: () => InferenceSession2,
    TRACE: () => TRACE,
    TRACE_FUNC_BEGIN: () => TRACE_FUNC_BEGIN,
    TRACE_FUNC_END: () => TRACE_FUNC_END,
    Tensor: () => Tensor2,
    TrainingSession: () => TrainingSession2,
    default: () => lib_default,
    env: () => env2,
    registerBackend: () => registerBackend
  });
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
    const wasmBackend2 = true ? (init_backend_wasm_inference(), __toCommonJS(backend_wasm_inference_exports)).wasmBackend : null.wasmBackend;
    if (false) {
      registerBackend("webgpu", wasmBackend2, 5);
      registerBackend("webnn", wasmBackend2, 5);
    }
    registerBackend("cpu", wasmBackend2, 10);
    registerBackend("wasm", wasmBackend2, 10);
  }
  Object.defineProperty(env2.versions, "web", { value: version2, enumerable: true });
  return __toCommonJS(lib_exports);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vY29tbW9uL2xpYi9iYWNrZW5kLWltcGwudHMiLCAiLi4vLi4vY29tbW9uL2xpYi9iYWNrZW5kLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvdmVyc2lvbi50cyIsICIuLi8uLi9jb21tb24vbGliL2Vudi1pbXBsLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvZW52LnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvdGVuc29yLWNvbnZlcnNpb24taW1wbC50cyIsICIuLi8uLi9jb21tb24vbGliL3RlbnNvci1mYWN0b3J5LWltcGwudHMiLCAiLi4vLi4vY29tbW9uL2xpYi90ZW5zb3ItaW1wbC10eXBlLW1hcHBpbmcudHMiLCAiLi4vLi4vY29tbW9uL2xpYi90ZW5zb3ItdXRpbHMtaW1wbC50cyIsICIuLi8uLi9jb21tb24vbGliL3RlbnNvci1pbXBsLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvdGVuc29yLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvdHJhY2UudHMiLCAiLi4vLi4vY29tbW9uL2xpYi9pbmZlcmVuY2Utc2Vzc2lvbi1pbXBsLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvaW5mZXJlbmNlLXNlc3Npb24udHMiLCAiLi4vLi4vY29tbW9uL2xpYi9vbm54LXZhbHVlLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvdHJhaW5pbmctc2Vzc2lvbi1pbXBsLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvdHJhaW5pbmctc2Vzc2lvbi50cyIsICIuLi8uLi9jb21tb24vbGliL2luZGV4LnRzIiwgIm5vZGVqcy1pZ25vcmU6bm9kZTpvcyIsICJub2RlanMtaWdub3JlOmZzIiwgIm5vZGVqcy1pZ25vcmU6cGF0aCIsICIuLi9saWIvd2FzbS9iaW5kaW5nL29ydC13YXNtLmpzIiwgIi4uL2xpYi93YXNtL3dhc20tZmFjdG9yeS50cyIsICIuLi9saWIvd2FzbS93YXNtLXV0aWxzLnRzIiwgIi4uL2xpYi93YXNtL3J1bi1vcHRpb25zLnRzIiwgIi4uL2xpYi93YXNtL3Nlc3Npb24tb3B0aW9ucy50cyIsICIuLi9saWIvd2FzbS93YXNtLWNvbW1vbi50cyIsICJub2RlanMtaWdub3JlOm5vZGU6ZnMvcHJvbWlzZXMiLCAiLi4vbGliL3dhc20vd2FzbS11dGlscy1sb2FkLWZpbGUudHMiLCAiLi4vbGliL3dhc20vd2FzbS1jb3JlLWltcGwudHMiLCAiLi4vbGliL3dhc20vcHJveHktd3JhcHBlci50cyIsICIuLi9saWIvd2FzbS9zZXNzaW9uLWhhbmRsZXItaW5mZXJlbmNlLnRzIiwgIi4uL2xpYi9iYWNrZW5kLXdhc20udHMiLCAiLi4vbGliL2JhY2tlbmQtd2FzbS1pbmZlcmVuY2UudHMiLCAiLi4vbGliL2luZGV4LnRzIiwgIi4uL2xpYi92ZXJzaW9uLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtCYWNrZW5kfSBmcm9tICcuL2JhY2tlbmQuanMnO1xuXG5pbnRlcmZhY2UgQmFja2VuZEluZm8ge1xuICBiYWNrZW5kOiBCYWNrZW5kO1xuICBwcmlvcml0eTogbnVtYmVyO1xuXG4gIGluaXRQcm9taXNlPzogUHJvbWlzZTx2b2lkPjtcbiAgaW5pdGlhbGl6ZWQ/OiBib29sZWFuO1xuICBhYm9ydGVkPzogYm9vbGVhbjtcbn1cblxuY29uc3QgYmFja2VuZHM6IE1hcDxzdHJpbmcsIEJhY2tlbmRJbmZvPiA9IG5ldyBNYXAoKTtcbmNvbnN0IGJhY2tlbmRzU29ydGVkQnlQcmlvcml0eTogc3RyaW5nW10gPSBbXTtcblxuLyoqXG4gKiBSZWdpc3RlciBhIGJhY2tlbmQuXG4gKlxuICogQHBhcmFtIG5hbWUgLSB0aGUgbmFtZSBhcyBhIGtleSB0byBsb29rdXAgYXMgYW4gZXhlY3V0aW9uIHByb3ZpZGVyLlxuICogQHBhcmFtIGJhY2tlbmQgLSB0aGUgYmFja2VuZCBvYmplY3QuXG4gKiBAcGFyYW0gcHJpb3JpdHkgLSBhbiBpbnRlZ2VyIGluZGljYXRpbmcgdGhlIHByaW9yaXR5IG9mIHRoZSBiYWNrZW5kLiBIaWdoZXIgbnVtYmVyIG1lYW5zIGhpZ2hlciBwcmlvcml0eS4gaWYgcHJpb3JpdHlcbiAqIDwgMCwgaXQgd2lsbCBiZSBjb25zaWRlcmVkIGFzIGEgJ2JldGEnIHZlcnNpb24gYW5kIHdpbGwgbm90IGJlIHVzZWQgYXMgYSBmYWxsYmFjayBiYWNrZW5kIGJ5IGRlZmF1bHQuXG4gKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgY29uc3QgcmVnaXN0ZXJCYWNrZW5kID0gKG5hbWU6IHN0cmluZywgYmFja2VuZDogQmFja2VuZCwgcHJpb3JpdHk6IG51bWJlcik6IHZvaWQgPT4ge1xuICBpZiAoYmFja2VuZCAmJiB0eXBlb2YgYmFja2VuZC5pbml0ID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBiYWNrZW5kLmNyZWF0ZUluZmVyZW5jZVNlc3Npb25IYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc3QgY3VycmVudEJhY2tlbmQgPSBiYWNrZW5kcy5nZXQobmFtZSk7XG4gICAgaWYgKGN1cnJlbnRCYWNrZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGJhY2tlbmRzLnNldChuYW1lLCB7YmFja2VuZCwgcHJpb3JpdHl9KTtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRCYWNrZW5kLnByaW9yaXR5ID4gcHJpb3JpdHkpIHtcbiAgICAgIC8vIHNhbWUgbmFtZSBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQgd2l0aCBhIGhpZ2hlciBwcmlvcml0eS4gc2tpcCByZWdpc3RlcmF0aW9uLlxuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoY3VycmVudEJhY2tlbmQucHJpb3JpdHkgPT09IHByaW9yaXR5KSB7XG4gICAgICBpZiAoY3VycmVudEJhY2tlbmQuYmFja2VuZCAhPT0gYmFja2VuZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbm5vdCByZWdpc3RlciBiYWNrZW5kIFwiJHtuYW1lfVwiIHVzaW5nIHByaW9yaXR5ICR7cHJpb3JpdHl9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHByaW9yaXR5ID49IDApIHtcbiAgICAgIGNvbnN0IGkgPSBiYWNrZW5kc1NvcnRlZEJ5UHJpb3JpdHkuaW5kZXhPZihuYW1lKTtcbiAgICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgICBiYWNrZW5kc1NvcnRlZEJ5UHJpb3JpdHkuc3BsaWNlKGksIDEpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJhY2tlbmRzU29ydGVkQnlQcmlvcml0eS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYmFja2VuZHMuZ2V0KGJhY2tlbmRzU29ydGVkQnlQcmlvcml0eVtpXSkhLnByaW9yaXR5IDw9IHByaW9yaXR5KSB7XG4gICAgICAgICAgYmFja2VuZHNTb3J0ZWRCeVByaW9yaXR5LnNwbGljZShpLCAwLCBuYW1lKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGJhY2tlbmRzU29ydGVkQnlQcmlvcml0eS5wdXNoKG5hbWUpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCdub3QgYSB2YWxpZCBiYWNrZW5kJyk7XG59O1xuXG4vKipcbiAqIFJlc29sdmUgYmFja2VuZCBieSBzcGVjaWZpZWQgaGludHMuXG4gKlxuICogQHBhcmFtIGJhY2tlbmRIaW50cyAtIGEgbGlzdCBvZiBleGVjdXRpb24gcHJvdmlkZXIgbmFtZXMgdG8gbG9va3VwLiBJZiBvbWl0dGVkIHVzZSByZWdpc3RlcmVkIGJhY2tlbmRzIGFzIGxpc3QuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUgYmFja2VuZC5cbiAqXG4gKiBAaWdub3JlXG4gKi9cbmV4cG9ydCBjb25zdCByZXNvbHZlQmFja2VuZCA9IGFzeW5jKGJhY2tlbmRIaW50czogcmVhZG9ubHkgc3RyaW5nW10pOiBQcm9taXNlPEJhY2tlbmQ+ID0+IHtcbiAgY29uc3QgYmFja2VuZE5hbWVzID0gYmFja2VuZEhpbnRzLmxlbmd0aCA9PT0gMCA/IGJhY2tlbmRzU29ydGVkQnlQcmlvcml0eSA6IGJhY2tlbmRIaW50cztcbiAgY29uc3QgZXJyb3JzID0gW107XG4gIGZvciAoY29uc3QgYmFja2VuZE5hbWUgb2YgYmFja2VuZE5hbWVzKSB7XG4gICAgY29uc3QgYmFja2VuZEluZm8gPSBiYWNrZW5kcy5nZXQoYmFja2VuZE5hbWUpO1xuICAgIGlmIChiYWNrZW5kSW5mbykge1xuICAgICAgaWYgKGJhY2tlbmRJbmZvLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHJldHVybiBiYWNrZW5kSW5mby5iYWNrZW5kO1xuICAgICAgfSBlbHNlIGlmIChiYWNrZW5kSW5mby5hYm9ydGVkKSB7XG4gICAgICAgIGNvbnRpbnVlOyAgLy8gY3VycmVudCBiYWNrZW5kIGlzIHVuYXZhaWxhYmxlOyB0cnkgbmV4dFxuICAgICAgfVxuXG4gICAgICBjb25zdCBpc0luaXRpYWxpemluZyA9ICEhYmFja2VuZEluZm8uaW5pdFByb21pc2U7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIWlzSW5pdGlhbGl6aW5nKSB7XG4gICAgICAgICAgYmFja2VuZEluZm8uaW5pdFByb21pc2UgPSBiYWNrZW5kSW5mby5iYWNrZW5kLmluaXQoYmFja2VuZE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IGJhY2tlbmRJbmZvLmluaXRQcm9taXNlO1xuICAgICAgICBiYWNrZW5kSW5mby5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIHJldHVybiBiYWNrZW5kSW5mby5iYWNrZW5kO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoIWlzSW5pdGlhbGl6aW5nKSB7XG4gICAgICAgICAgZXJyb3JzLnB1c2goe25hbWU6IGJhY2tlbmROYW1lLCBlcnI6IGV9KTtcbiAgICAgICAgfVxuICAgICAgICBiYWNrZW5kSW5mby5hYm9ydGVkID0gdHJ1ZTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGRlbGV0ZSBiYWNrZW5kSW5mby5pbml0UHJvbWlzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoYG5vIGF2YWlsYWJsZSBiYWNrZW5kIGZvdW5kLiBFUlI6ICR7ZXJyb3JzLm1hcChlID0+IGBbJHtlLm5hbWV9XSAke2UuZXJyfWApLmpvaW4oJywgJyl9YCk7XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb259IGZyb20gJy4vaW5mZXJlbmNlLXNlc3Npb24uanMnO1xuaW1wb3J0IHtPbm54VmFsdWV9IGZyb20gJy4vb25ueC12YWx1ZS5qcyc7XG5pbXBvcnQge1RyYWluaW5nU2Vzc2lvbn0gZnJvbSAnLi90cmFpbmluZy1zZXNzaW9uLmpzJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmV4cG9ydCBkZWNsYXJlIG5hbWVzcGFjZSBTZXNzaW9uSGFuZGxlciB7XG4gIHR5cGUgRmVlZHNUeXBlID0ge1tuYW1lOiBzdHJpbmddOiBPbm54VmFsdWV9O1xuICB0eXBlIEZldGNoZXNUeXBlID0ge1tuYW1lOiBzdHJpbmddOiBPbm54VmFsdWUgfCBudWxsfTtcbiAgdHlwZSBSZXR1cm5UeXBlID0ge1tuYW1lOiBzdHJpbmddOiBPbm54VmFsdWV9O1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgc2hhcmVkIFNlc3Npb25IYW5kbGVyIGZ1bmN0aW9uYWxpdHlcbiAqXG4gKiBAaWdub3JlXG4gKi9cbmludGVyZmFjZSBTZXNzaW9uSGFuZGxlciB7XG4gIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPjtcblxuICByZWFkb25seSBpbnB1dE5hbWVzOiByZWFkb25seSBzdHJpbmdbXTtcbiAgcmVhZG9ubHkgb3V0cHV0TmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudCBhIGhhbmRsZXIgaW5zdGFuY2Ugb2YgYW4gaW5mZXJlbmNlIHNlc3Npb24uXG4gKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEluZmVyZW5jZVNlc3Npb25IYW5kbGVyIGV4dGVuZHMgU2Vzc2lvbkhhbmRsZXIge1xuICBzdGFydFByb2ZpbGluZygpOiB2b2lkO1xuICBlbmRQcm9maWxpbmcoKTogdm9pZDtcblxuICBydW4oZmVlZHM6IFNlc3Npb25IYW5kbGVyLkZlZWRzVHlwZSwgZmV0Y2hlczogU2Vzc2lvbkhhbmRsZXIuRmV0Y2hlc1R5cGUsXG4gICAgICBvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBQcm9taXNlPFNlc3Npb25IYW5kbGVyLlJldHVyblR5cGU+O1xufVxuXG4vKipcbiAqIFJlcHJlc2VudCBhIGhhbmRsZXIgaW5zdGFuY2Ugb2YgYSB0cmFpbmluZyBpbmZlcmVuY2Ugc2Vzc2lvbi5cbiAqXG4gKiBAaWdub3JlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHJhaW5pbmdTZXNzaW9uSGFuZGxlciBleHRlbmRzIFNlc3Npb25IYW5kbGVyIHtcbiAgcmVhZG9ubHkgZXZhbElucHV0TmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xuICByZWFkb25seSBldmFsT3V0cHV0TmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xuXG4gIGxhenlSZXNldEdyYWQoKTogUHJvbWlzZTx2b2lkPjtcbiAgcnVuVHJhaW5TdGVwKFxuICAgICAgZmVlZHM6IFNlc3Npb25IYW5kbGVyLkZlZWRzVHlwZSwgZmV0Y2hlczogU2Vzc2lvbkhhbmRsZXIuRmV0Y2hlc1R5cGUsXG4gICAgICBvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBQcm9taXNlPFNlc3Npb25IYW5kbGVyLlJldHVyblR5cGU+O1xuICBydW5PcHRpbWl6ZXJTdGVwKG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFByb21pc2U8dm9pZD47XG4gIHJ1bkV2YWxTdGVwKFxuICAgICAgZmVlZHM6IFNlc3Npb25IYW5kbGVyLkZlZWRzVHlwZSwgZmV0Y2hlczogU2Vzc2lvbkhhbmRsZXIuRmV0Y2hlc1R5cGUsXG4gICAgICBvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBQcm9taXNlPFNlc3Npb25IYW5kbGVyLlJldHVyblR5cGU+O1xuXG4gIGdldFBhcmFtZXRlcnNTaXplKHRyYWluYWJsZU9ubHk6IGJvb2xlYW4pOiBQcm9taXNlPG51bWJlcj47XG4gIGxvYWRQYXJhbWV0ZXJzQnVmZmVyKGFycmF5OiBVaW50OEFycmF5LCB0cmFpbmFibGVPbmx5OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPjtcbiAgZ2V0Q29udGlndW91c1BhcmFtZXRlcnModHJhaW5hYmxlT25seTogYm9vbGVhbik6IFByb21pc2U8T25ueFZhbHVlPjtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnQgYSBiYWNrZW5kIHRoYXQgcHJvdmlkZXMgaW1wbGVtZW50YXRpb24gb2YgbW9kZWwgaW5mZXJlbmNpbmcuXG4gKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEJhY2tlbmQge1xuICAvKipcbiAgICogSW5pdGlhbGl6ZSB0aGUgYmFja2VuZCBhc3luY2hyb25vdXNseS4gU2hvdWxkIHRocm93IHdoZW4gZmFpbGVkLlxuICAgKi9cbiAgaW5pdChiYWNrZW5kTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPjtcblxuICBjcmVhdGVJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcih1cmlPckJ1ZmZlcjogc3RyaW5nfFVpbnQ4QXJyYXksIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTpcbiAgICAgIFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXI+O1xuXG4gIGNyZWF0ZVRyYWluaW5nU2Vzc2lvbkhhbmRsZXI/XG4gICAgICAoY2hlY2twb2ludFN0YXRlVXJpT3JCdWZmZXI6IFRyYWluaW5nU2Vzc2lvbi5VUklvckJ1ZmZlciwgdHJhaW5Nb2RlbFVyaU9yQnVmZmVyOiBUcmFpbmluZ1Nlc3Npb24uVVJJb3JCdWZmZXIsXG4gICAgICAgZXZhbE1vZGVsVXJpT3JCdWZmZXI6IFRyYWluaW5nU2Vzc2lvbi5VUklvckJ1ZmZlciwgb3B0aW1pemVyTW9kZWxVcmlPckJ1ZmZlcjogVHJhaW5pbmdTZXNzaW9uLlVSSW9yQnVmZmVyLFxuICAgICAgIG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiBQcm9taXNlPFRyYWluaW5nU2Vzc2lvbkhhbmRsZXI+O1xufVxuXG5leHBvcnQge3JlZ2lzdGVyQmFja2VuZH0gZnJvbSAnLi9iYWNrZW5kLWltcGwuanMnO1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG4vLyBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGJ5IC9qcy9zY3JpcHRzL3VwZGF0ZS12ZXJzaW9uLnRzXG4vLyBEbyBub3QgbW9kaWZ5IGZpbGUgY29udGVudCBtYW51YWxseS5cblxuZXhwb3J0IGNvbnN0IHZlcnNpb24gPSAnMS4xNy4wJztcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtFbnZ9IGZyb20gJy4vZW52LmpzJztcbmltcG9ydCB7dmVyc2lvbn0gZnJvbSAnLi92ZXJzaW9uLmpzJztcblxudHlwZSBMb2dMZXZlbFR5cGUgPSBFbnZbJ2xvZ0xldmVsJ107XG5cbmxldCBsb2dMZXZlbFZhbHVlOiBSZXF1aXJlZDxMb2dMZXZlbFR5cGU+ID0gJ3dhcm5pbmcnO1xuXG5leHBvcnQgY29uc3QgZW52OiBFbnYgPSB7XG4gIHdhc206IHt9IGFzIEVudi5XZWJBc3NlbWJseUZsYWdzLFxuICB3ZWJnbDoge30gYXMgRW52LldlYkdMRmxhZ3MsXG4gIHdlYmdwdToge30gYXMgRW52LldlYkdwdUZsYWdzLFxuICB2ZXJzaW9uczoge2NvbW1vbjogdmVyc2lvbn0sXG5cbiAgc2V0IGxvZ0xldmVsKHZhbHVlOiBMb2dMZXZlbFR5cGUpIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyB8fCBbJ3ZlcmJvc2UnLCAnaW5mbycsICd3YXJuaW5nJywgJ2Vycm9yJywgJ2ZhdGFsJ10uaW5kZXhPZih2YWx1ZSkgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGxvZ2dpbmcgbGV2ZWw6ICR7dmFsdWV9YCk7XG4gICAgfVxuICAgIGxvZ0xldmVsVmFsdWUgPSB2YWx1ZTtcbiAgfSxcbiAgZ2V0IGxvZ0xldmVsKCk6IFJlcXVpcmVkPExvZ0xldmVsVHlwZT4ge1xuICAgIHJldHVybiBsb2dMZXZlbFZhbHVlO1xuICB9LFxufTtcblxuLy8gc2V0IHByb3BlcnR5ICdsb2dMZXZlbCcgc28gdGhhdCB0aGV5IGNhbiBiZSBjb3JyZWN0bHkgdHJhbnNmZXJyZWQgdG8gd29ya2VyIGJ5IGBwb3N0TWVzc2FnZSgpYC5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbnYsICdsb2dMZXZlbCcsIHtlbnVtZXJhYmxlOiB0cnVlfSk7XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7ZW52IGFzIGVudkltcGx9IGZyb20gJy4vZW52LWltcGwuanMnO1xuXG5leHBvcnQgZGVjbGFyZSBuYW1lc3BhY2UgRW52IHtcbiAgZXhwb3J0IHR5cGUgV2FzbVByZWZpeE9yRmlsZVBhdGhzID0gc3RyaW5nfHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb24gKi9cbiAgICAnb3J0LXdhc20ud2FzbSc/OiBzdHJpbmc7XG4gICAgJ29ydC13YXNtLXRocmVhZGVkLndhc20nPzogc3RyaW5nO1xuICAgICdvcnQtd2FzbS1zaW1kLndhc20nPzogc3RyaW5nO1xuICAgICdvcnQtdHJhaW5pbmctd2FzbS1zaW1kLndhc20nPzogc3RyaW5nO1xuICAgICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLndhc20nPzogc3RyaW5nO1xuICAgIC8qIGVzbGludC1lbmFibGUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uICovXG4gIH07XG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViQXNzZW1ibHlGbGFncyB7XG4gICAgLyoqXG4gICAgICogc2V0IG9yIGdldCBudW1iZXIgb2YgdGhyZWFkKHMpLiBJZiBvbWl0dGVkIG9yIHNldCB0byAwLCBudW1iZXIgb2YgdGhyZWFkKHMpIHdpbGwgYmUgZGV0ZXJtaW5lZCBieSBzeXN0ZW0uIElmIHNldFxuICAgICAqIHRvIDEsIG5vIHdvcmtlciB0aHJlYWQgd2lsbCBiZSBzcGF3bmVkLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IHdoZW4gV2ViQXNzZW1ibHkgbXVsdGl0aHJlYWQgZmVhdHVyZSBpcyBhdmFpbGFibGUgaW4gY3VycmVudCBjb250ZXh0LlxuICAgICAqXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgMGBcbiAgICAgKi9cbiAgICBudW1UaHJlYWRzPzogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogc2V0IG9yIGdldCBhIGJvb2xlYW4gdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRvIGVuYWJsZSBTSU1ELiBJZiBzZXQgdG8gZmFsc2UsIFNJTUQgd2lsbCBiZSBmb3JjZWx5IGRpc2FibGVkLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IHdoZW4gV2ViQXNzZW1ibHkgU0lNRCBmZWF0dXJlIGlzIGF2YWlsYWJsZSBpbiBjdXJyZW50IGNvbnRleHQuXG4gICAgICpcbiAgICAgKiBAZGVmYXVsdFZhbHVlIGB0cnVlYFxuICAgICAqL1xuICAgIHNpbWQ/OiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogc2V0IG9yIGdldCBhIGJvb2xlYW4gdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRvIGVuYWJsZSB0cmFjZS5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0VmFsdWUgYGZhbHNlYFxuICAgICAqL1xuICAgIHRyYWNlPzogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIFNldCBvciBnZXQgYSBudW1iZXIgc3BlY2lmeWluZyB0aGUgdGltZW91dCBmb3IgaW5pdGlhbGl6YXRpb24gb2YgV2ViQXNzZW1ibHkgYmFja2VuZCwgaW4gbWlsbGlzZWNvbmRzLiBBIHplcm9cbiAgICAgKiB2YWx1ZSBpbmRpY2F0ZXMgbm8gdGltZW91dCBpcyBzZXQuXG4gICAgICpcbiAgICAgKiBAZGVmYXVsdFZhbHVlIGAwYFxuICAgICAqL1xuICAgIGluaXRUaW1lb3V0PzogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogU2V0IGEgY3VzdG9tIFVSTCBwcmVmaXggdG8gdGhlIC53YXNtIGZpbGVzIG9yIGEgc2V0IG9mIG92ZXJyaWRlcyBmb3IgZWFjaCAud2FzbSBmaWxlLiBUaGUgb3ZlcnJpZGUgcGF0aCBzaG91bGQgYmVcbiAgICAgKiBhbiBhYnNvbHV0ZSBwYXRoLlxuICAgICAqL1xuICAgIHdhc21QYXRocz86IFdhc21QcmVmaXhPckZpbGVQYXRocztcblxuICAgIC8qKlxuICAgICAqIFNldCBvciBnZXQgYSBib29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0byBwcm94eSB0aGUgZXhlY3V0aW9uIG9mIG1haW4gdGhyZWFkIHRvIGEgd29ya2VyIHRocmVhZC5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0VmFsdWUgYGZhbHNlYFxuICAgICAqL1xuICAgIHByb3h5PzogYm9vbGVhbjtcbiAgfVxuXG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViR0xGbGFncyB7XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB0aGUgV2ViR0wgQ29udGV4dCBJRCAod2ViZ2wgb3Igd2ViZ2wyKS5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0VmFsdWUgYCd3ZWJnbDInYFxuICAgICAqL1xuICAgIGNvbnRleHRJZD86ICd3ZWJnbCd8J3dlYmdsMic7XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBXZWJHTCByZW5kZXJpbmcgY29udGV4dC5cbiAgICAgKi9cbiAgICByZWFkb25seSBjb250ZXh0OiBXZWJHTFJlbmRlcmluZ0NvbnRleHQ7XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB0aGUgbWF4aW11bSBiYXRjaCBzaXplIGZvciBtYXRtdWwuIDAgbWVhbnMgdG8gZGlzYWJsZSBiYXRjaGluZy5cbiAgICAgKlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgbWF0bXVsTWF4QmF0Y2hTaXplPzogbnVtYmVyO1xuICAgIC8qKlxuICAgICAqIFNldCBvciBnZXQgdGhlIHRleHR1cmUgY2FjaGUgbW9kZS5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0VmFsdWUgYCdmdWxsJ2BcbiAgICAgKi9cbiAgICB0ZXh0dXJlQ2FjaGVNb2RlPzogJ2luaXRpYWxpemVyT25seSd8J2Z1bGwnO1xuICAgIC8qKlxuICAgICAqIFNldCBvciBnZXQgdGhlIHBhY2tlZCB0ZXh0dXJlIG1vZGVcbiAgICAgKlxuICAgICAqIEBkZWZhdWx0VmFsdWUgYGZhbHNlYFxuICAgICAqL1xuICAgIHBhY2s/OiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIFNldCBvciBnZXQgd2hldGhlciBlbmFibGUgYXN5bmMgZG93bmxvYWQuXG4gICAgICpcbiAgICAgKiBAZGVmYXVsdFZhbHVlIGBmYWxzZWBcbiAgICAgKi9cbiAgICBhc3luYz86IGJvb2xlYW47XG4gIH1cblxuICBleHBvcnQgaW50ZXJmYWNlIFdlYkdwdVByb2ZpbGluZ0RhdGFWMVRlbnNvck1ldGFkYXRhIHtcbiAgICBkaW1zOiByZWFkb25seSBudW1iZXJbXTtcbiAgICBkYXRhVHlwZTogc3RyaW5nO1xuICB9XG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViR3B1UHJvZmlsaW5nRGF0YVYxIHtcbiAgICB2ZXJzaW9uOiAxO1xuICAgIGlucHV0c01ldGFkYXRhOiByZWFkb25seSBXZWJHcHVQcm9maWxpbmdEYXRhVjFUZW5zb3JNZXRhZGF0YVtdO1xuICAgIG91dHB1dHNNZXRhZGF0YTogcmVhZG9ubHkgV2ViR3B1UHJvZmlsaW5nRGF0YVYxVGVuc29yTWV0YWRhdGFbXTtcbiAgICBrZXJuZWxJZDogbnVtYmVyO1xuICAgIGtlcm5lbFR5cGU6IHN0cmluZztcbiAgICBrZXJuZWxOYW1lOiBzdHJpbmc7XG4gICAgcHJvZ3JhbU5hbWU6IHN0cmluZztcbiAgICBzdGFydFRpbWU6IG51bWJlcjtcbiAgICBlbmRUaW1lOiBudW1iZXI7XG4gIH1cblxuICBleHBvcnQgdHlwZSBXZWJHcHVQcm9maWxpbmdEYXRhID0gV2ViR3B1UHJvZmlsaW5nRGF0YVYxO1xuXG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViR3B1RmxhZ3Mge1xuICAgIC8qKlxuICAgICAqIFNldCBvciBnZXQgdGhlIHByb2ZpbGluZyBtb2RlLlxuICAgICAqXG4gICAgICogQGRlcHJlY2F0ZWQgVXNlIGBlbnYud2ViZ3B1LnByb2ZpbGluZy5tb2RlYCBpbnN0ZWFkLiBJZiBgZW52LndlYmdwdS5wcm9maWxpbmcubW9kZWAgaXMgc2V0LCB0aGlzIHByb3BlcnR5IHdpbGwgYmVcbiAgICAgKiBpZ25vcmVkLlxuICAgICAqL1xuICAgIHByb2ZpbGluZ01vZGU/OiAnb2ZmJ3wnZGVmYXVsdCc7XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB0aGUgcHJvZmlsaW5nIGNvbmZpZ3VyYXRpb24uXG4gICAgICovXG4gICAgcHJvZmlsaW5nPzoge1xuICAgICAgLyoqXG4gICAgICAgKiBTZXQgb3IgZ2V0IHRoZSBwcm9maWxpbmcgbW9kZS5cbiAgICAgICAqXG4gICAgICAgKiBAZGVmYXVsdFZhbHVlIGAnb2ZmJ2BcbiAgICAgICAqL1xuICAgICAgbW9kZT86ICdvZmYnfCdkZWZhdWx0JztcblxuICAgICAgLyoqXG4gICAgICAgKiBTZXQgb3IgZ2V0IGEgY2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBhIHByb2ZpbGluZyBkYXRhIGlzIHJlY2VpdmVkLiBJZiBub3Qgc2V0LCB0aGUgcHJvZmlsaW5nIGRhdGEgd2lsbCBiZVxuICAgICAgICogcHJpbnRlZCB0byBjb25zb2xlLlxuICAgICAgICovXG4gICAgICBvbmRhdGE/OiAoZGF0YTogV2ViR3B1UHJvZmlsaW5nRGF0YSkgPT4gdm9pZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZGV2aWNlIGZvciBXZWJHUFUuXG4gICAgICpcbiAgICAgKiBXaGVuIHVzZSB3aXRoIFR5cGVTY3JpcHQsIHRoZSB0eXBlIG9mIHRoaXMgcHJvcGVydHkgaXMgYEdQVURldmljZWAgZGVmaW5lZCBpbiBcIkB3ZWJncHUvdHlwZXNcIi5cbiAgICAgKiBVc2UgYGNvbnN0IGRldmljZSA9IGVudi53ZWJncHUuZGV2aWNlIGFzIEdQVURldmljZTtgIGluIFR5cGVTY3JpcHQgdG8gYWNjZXNzIHRoaXMgcHJvcGVydHkgd2l0aCBjb3JyZWN0IHR5cGUuXG4gICAgICpcbiAgICAgKiBzZWUgY29tbWVudHMgb24ge0BsaW5rIEdwdUJ1ZmZlclR5cGV9IGZvciBtb3JlIGRldGFpbHMgYWJvdXQgd2h5IG5vdCB1c2UgdHlwZXMgZGVmaW5lZCBpbiBcIkB3ZWJncHUvdHlwZXNcIi5cbiAgICAgKi9cbiAgICByZWFkb25seSBkZXZpY2U6IHVua25vd247XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB3aGV0aGVyIHZhbGlkYXRlIGlucHV0IGNvbnRlbnQuXG4gICAgICpcbiAgICAgKiBAZGVmYXVsdFZhbHVlIGBmYWxzZWBcbiAgICAgKi9cbiAgICB2YWxpZGF0ZUlucHV0Q29udGVudD86IGJvb2xlYW47XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnYge1xuICAvKipcbiAgICogc2V0IHRoZSBzZXZlcml0eSBsZXZlbCBmb3IgbG9nZ2luZy5cbiAgICpcbiAgICogQGRlZmF1bHRWYWx1ZSBgJ3dhcm5pbmcnYFxuICAgKi9cbiAgbG9nTGV2ZWw/OiAndmVyYm9zZSd8J2luZm8nfCd3YXJuaW5nJ3wnZXJyb3InfCdmYXRhbCc7XG4gIC8qKlxuICAgKiBJbmRpY2F0ZSB3aGV0aGVyIHJ1biBpbiBkZWJ1ZyBtb2RlLlxuICAgKlxuICAgKiBAZGVmYXVsdFZhbHVlIGBmYWxzZWBcbiAgICovXG4gIGRlYnVnPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogR2V0IHZlcnNpb24gb2YgdGhlIGN1cnJlbnQgcGFja2FnZS5cbiAgICovXG4gIHJlYWRvbmx5IHZlcnNpb25zOiB7XG4gICAgcmVhZG9ubHkgY29tbW9uOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgd2ViPzogc3RyaW5nO1xuICAgIHJlYWRvbmx5IG5vZGU/OiBzdHJpbmc7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxuICAgIHJlYWRvbmx5ICdyZWFjdC1uYXRpdmUnPzogc3RyaW5nO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXByZXNlbnQgYSBzZXQgb2YgZmxhZ3MgZm9yIFdlYkFzc2VtYmx5XG4gICAqL1xuICByZWFkb25seSB3YXNtOiBFbnYuV2ViQXNzZW1ibHlGbGFncztcblxuICAvKipcbiAgICogUmVwcmVzZW50IGEgc2V0IG9mIGZsYWdzIGZvciBXZWJHTFxuICAgKi9cbiAgcmVhZG9ubHkgd2ViZ2w6IEVudi5XZWJHTEZsYWdzO1xuXG4gIC8qKlxuICAgKiBSZXByZXNlbnQgYSBzZXQgb2YgZmxhZ3MgZm9yIFdlYkdQVVxuICAgKi9cbiAgcmVhZG9ubHkgd2ViZ3B1OiBFbnYuV2ViR3B1RmxhZ3M7XG5cbiAgW25hbWU6IHN0cmluZ106IHVua25vd247XG59XG5cbi8qKlxuICogUmVwcmVzZW50IGEgc2V0IG9mIGZsYWdzIGFzIGEgZ2xvYmFsIHNpbmdsZXRvbi5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudjogRW52ID0gZW52SW1wbDtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtUZW5zb3JUb0RhdGFVcmxPcHRpb25zLCBUZW5zb3JUb0ltYWdlRGF0YU9wdGlvbnN9IGZyb20gJy4vdGVuc29yLWNvbnZlcnNpb24uanMnO1xuaW1wb3J0IHtUZW5zb3J9IGZyb20gJy4vdGVuc29yLmpzJztcblxuLyoqXG4gKiBpbXBsZW1lbnRhdGlvbiBvZiBUZW5zb3IudG9EYXRhVVJMKClcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvclRvRGF0YVVSTCA9ICh0ZW5zb3I6IFRlbnNvciwgb3B0aW9ucz86IFRlbnNvclRvRGF0YVVybE9wdGlvbnMpOiBzdHJpbmcgPT4ge1xuICBjb25zdCBjYW52YXMgPSB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykgOiAobmV3IE9mZnNjcmVlbkNhbnZhcygxLCAxKSk7XG4gIGNhbnZhcy53aWR0aCA9IHRlbnNvci5kaW1zWzNdO1xuICBjYW52YXMuaGVpZ2h0ID0gdGVuc29yLmRpbXNbMl07XG4gIGNvbnN0IHBpeGVsczJEQ29udGV4dCA9XG4gICAgICBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSBhcyAoQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgT2Zmc2NyZWVuQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgbnVsbCk7XG5cbiAgaWYgKHBpeGVsczJEQ29udGV4dCAhPSBudWxsKSB7XG4gICAgLy8gRGVmYXVsdCB2YWx1ZXMgZm9yIGhlaWdodCBhbmQgd2lkdGggJiBmb3JtYXRcbiAgICBsZXQgd2lkdGg6IG51bWJlcjtcbiAgICBsZXQgaGVpZ2h0OiBudW1iZXI7XG4gICAgaWYgKG9wdGlvbnM/LnRlbnNvckxheW91dCAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMudGVuc29yTGF5b3V0ID09PSAnTkhXQycpIHtcbiAgICAgIHdpZHRoID0gdGVuc29yLmRpbXNbMl07XG4gICAgICBoZWlnaHQgPSB0ZW5zb3IuZGltc1szXTtcbiAgICB9IGVsc2UgeyAgLy8gRGVmYXVsdCBsYXlvdXQgaXMgTkNXSFxuICAgICAgd2lkdGggPSB0ZW5zb3IuZGltc1szXTtcbiAgICAgIGhlaWdodCA9IHRlbnNvci5kaW1zWzJdO1xuICAgIH1cblxuICAgIGNvbnN0IGlucHV0Zm9ybWF0ID0gb3B0aW9ucz8uZm9ybWF0ICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmZvcm1hdCA6ICdSR0InO1xuXG4gICAgY29uc3Qgbm9ybSA9IG9wdGlvbnM/Lm5vcm07XG4gICAgbGV0IG5vcm1NZWFuOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcbiAgICBsZXQgbm9ybUJpYXM6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdO1xuICAgIGlmIChub3JtID09PSB1bmRlZmluZWQgfHwgbm9ybS5tZWFuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG5vcm1NZWFuID0gWzI1NSwgMjU1LCAyNTUsIDI1NV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgKG5vcm0ubWVhbikgPT09ICdudW1iZXInKSB7XG4gICAgICAgIG5vcm1NZWFuID0gW25vcm0ubWVhbiwgbm9ybS5tZWFuLCBub3JtLm1lYW4sIG5vcm0ubWVhbl07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub3JtTWVhbiA9IFtub3JtLm1lYW5bMF0sIG5vcm0ubWVhblsxXSwgbm9ybS5tZWFuWzJdLCAwXTtcbiAgICAgICAgaWYgKG5vcm0ubWVhblszXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbm9ybU1lYW5bM10gPSBub3JtLm1lYW5bM107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5vcm0gPT09IHVuZGVmaW5lZCB8fCBub3JtLmJpYXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbm9ybUJpYXMgPSBbMCwgMCwgMCwgMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgKG5vcm0uYmlhcykgPT09ICdudW1iZXInKSB7XG4gICAgICAgIG5vcm1CaWFzID0gW25vcm0uYmlhcywgbm9ybS5iaWFzLCBub3JtLmJpYXMsIG5vcm0uYmlhc107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub3JtQmlhcyA9IFtub3JtLmJpYXNbMF0sIG5vcm0uYmlhc1sxXSwgbm9ybS5iaWFzWzJdLCAwXTtcbiAgICAgICAgaWYgKG5vcm0uYmlhc1szXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbm9ybUJpYXNbM10gPSBub3JtLmJpYXNbM107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzdHJpZGUgPSBoZWlnaHQgKiB3aWR0aDtcbiAgICAvLyBEZWZhdWx0IHBvaW50ZXIgYXNzaWdubWVudHNcbiAgICBsZXQgclRlbnNvclBvaW50ZXIgPSAwLCBnVGVuc29yUG9pbnRlciA9IHN0cmlkZSwgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyLCBhVGVuc29yUG9pbnRlciA9IC0xO1xuXG4gICAgLy8gVXBkYXRpbmcgdGhlIHBvaW50ZXIgYXNzaWdubWVudHMgYmFzZWQgb24gdGhlIGlucHV0IGltYWdlIGZvcm1hdFxuICAgIGlmIChpbnB1dGZvcm1hdCA9PT0gJ1JHQkEnKSB7XG4gICAgICByVGVuc29yUG9pbnRlciA9IDA7XG4gICAgICBnVGVuc29yUG9pbnRlciA9IHN0cmlkZTtcbiAgICAgIGJUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMjtcbiAgICAgIGFUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMztcbiAgICB9IGVsc2UgaWYgKGlucHV0Zm9ybWF0ID09PSAnUkdCJykge1xuICAgICAgclRlbnNvclBvaW50ZXIgPSAwO1xuICAgICAgZ1RlbnNvclBvaW50ZXIgPSBzdHJpZGU7XG4gICAgICBiVGVuc29yUG9pbnRlciA9IHN0cmlkZSAqIDI7XG4gICAgfSBlbHNlIGlmIChpbnB1dGZvcm1hdCA9PT0gJ1JCRycpIHtcbiAgICAgIHJUZW5zb3JQb2ludGVyID0gMDtcbiAgICAgIGJUZW5zb3JQb2ludGVyID0gc3RyaWRlO1xuICAgICAgZ1RlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGVpZ2h0OyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgd2lkdGg7IGorKykge1xuICAgICAgICBjb25zdCBSID0gKCh0ZW5zb3IuZGF0YVtyVGVuc29yUG9pbnRlcisrXSBhcyBudW1iZXIpIC0gbm9ybUJpYXNbMF0pICogbm9ybU1lYW5bMF07ICAvLyBSIHZhbHVlXG4gICAgICAgIGNvbnN0IEcgPSAoKHRlbnNvci5kYXRhW2dUZW5zb3JQb2ludGVyKytdIGFzIG51bWJlcikgLSBub3JtQmlhc1sxXSkgKiBub3JtTWVhblsxXTsgIC8vIEcgdmFsdWVcbiAgICAgICAgY29uc3QgQiA9ICgodGVuc29yLmRhdGFbYlRlbnNvclBvaW50ZXIrK10gYXMgbnVtYmVyKSAtIG5vcm1CaWFzWzJdKSAqIG5vcm1NZWFuWzJdOyAgLy8gQiB2YWx1ZVxuICAgICAgICBjb25zdCBBID0gYVRlbnNvclBvaW50ZXIgPT09IC0xID9cbiAgICAgICAgICAgIDI1NSA6XG4gICAgICAgICAgICAoKHRlbnNvci5kYXRhW2FUZW5zb3JQb2ludGVyKytdIGFzIG51bWJlcikgLSBub3JtQmlhc1szXSkgKiBub3JtTWVhblszXTsgIC8vIEEgdmFsdWVcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9yZXN0cmljdC1wbHVzLW9wZXJhbmRzXG4gICAgICAgIHBpeGVsczJEQ29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgnICsgUiArICcsJyArIEcgKyAnLCcgKyBCICsgJywnICsgQSArICcpJztcbiAgICAgICAgcGl4ZWxzMkRDb250ZXh0LmZpbGxSZWN0KGosIGksIDEsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoJ3RvRGF0YVVSTCcgaW4gY2FudmFzKSB7XG4gICAgICByZXR1cm4gY2FudmFzLnRvRGF0YVVSTCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3RvRGF0YVVSTCBpcyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG5vdCBhY2Nlc3MgaW1hZ2UgZGF0YScpO1xuICB9XG59O1xuXG4vKipcbiAqIGltcGxlbWVudGF0aW9uIG9mIFRlbnNvci50b0ltYWdlRGF0YSgpXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JUb0ltYWdlRGF0YSA9ICh0ZW5zb3I6IFRlbnNvciwgb3B0aW9ucz86IFRlbnNvclRvSW1hZ2VEYXRhT3B0aW9ucyk6IEltYWdlRGF0YSA9PiB7XG4gIGNvbnN0IHBpeGVsczJEQ29udGV4dCA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgP1xuICAgICAgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykuZ2V0Q29udGV4dCgnMmQnKSA6XG4gICAgICBuZXcgT2Zmc2NyZWVuQ2FudmFzKDEsIDEpLmdldENvbnRleHQoJzJkJykgYXMgT2Zmc2NyZWVuQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICBsZXQgaW1hZ2U6IEltYWdlRGF0YTtcbiAgaWYgKHBpeGVsczJEQ29udGV4dCAhPSBudWxsKSB7XG4gICAgLy8gRGVmYXVsdCB2YWx1ZXMgZm9yIGhlaWdodCBhbmQgd2lkdGggJiBmb3JtYXRcbiAgICBsZXQgd2lkdGg6IG51bWJlcjtcbiAgICBsZXQgaGVpZ2h0OiBudW1iZXI7XG4gICAgbGV0IGNoYW5uZWxzOiBudW1iZXI7XG4gICAgaWYgKG9wdGlvbnM/LnRlbnNvckxheW91dCAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMudGVuc29yTGF5b3V0ID09PSAnTkhXQycpIHtcbiAgICAgIHdpZHRoID0gdGVuc29yLmRpbXNbMl07XG4gICAgICBoZWlnaHQgPSB0ZW5zb3IuZGltc1sxXTtcbiAgICAgIGNoYW5uZWxzID0gdGVuc29yLmRpbXNbM107XG4gICAgfSBlbHNlIHsgIC8vIERlZmF1bHQgbGF5b3V0IGlzIE5DV0hcbiAgICAgIHdpZHRoID0gdGVuc29yLmRpbXNbM107XG4gICAgICBoZWlnaHQgPSB0ZW5zb3IuZGltc1syXTtcbiAgICAgIGNoYW5uZWxzID0gdGVuc29yLmRpbXNbMV07XG4gICAgfVxuICAgIGNvbnN0IGlucHV0Zm9ybWF0ID0gb3B0aW9ucyAhPT0gdW5kZWZpbmVkID8gKG9wdGlvbnMuZm9ybWF0ICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmZvcm1hdCA6ICdSR0InKSA6ICdSR0InO1xuXG4gICAgY29uc3Qgbm9ybSA9IG9wdGlvbnM/Lm5vcm07XG4gICAgbGV0IG5vcm1NZWFuOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcbiAgICBsZXQgbm9ybUJpYXM6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdO1xuICAgIGlmIChub3JtID09PSB1bmRlZmluZWQgfHwgbm9ybS5tZWFuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG5vcm1NZWFuID0gWzI1NSwgMjU1LCAyNTUsIDI1NV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgKG5vcm0ubWVhbikgPT09ICdudW1iZXInKSB7XG4gICAgICAgIG5vcm1NZWFuID0gW25vcm0ubWVhbiwgbm9ybS5tZWFuLCBub3JtLm1lYW4sIG5vcm0ubWVhbl07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub3JtTWVhbiA9IFtub3JtLm1lYW5bMF0sIG5vcm0ubWVhblsxXSwgbm9ybS5tZWFuWzJdLCAyNTVdO1xuICAgICAgICBpZiAobm9ybS5tZWFuWzNdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBub3JtTWVhblszXSA9IG5vcm0ubWVhblszXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAobm9ybSA9PT0gdW5kZWZpbmVkIHx8IG5vcm0uYmlhcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBub3JtQmlhcyA9IFswLCAwLCAwLCAwXTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiAobm9ybS5iaWFzKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgbm9ybUJpYXMgPSBbbm9ybS5iaWFzLCBub3JtLmJpYXMsIG5vcm0uYmlhcywgbm9ybS5iaWFzXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vcm1CaWFzID0gW25vcm0uYmlhc1swXSwgbm9ybS5iaWFzWzFdLCBub3JtLmJpYXNbMl0sIDBdO1xuICAgICAgICBpZiAobm9ybS5iaWFzWzNdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBub3JtQmlhc1szXSA9IG5vcm0uYmlhc1szXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHN0cmlkZSA9IGhlaWdodCAqIHdpZHRoO1xuICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChvcHRpb25zLmZvcm1hdCAhPT0gdW5kZWZpbmVkICYmIChjaGFubmVscyA9PT0gNCAmJiBvcHRpb25zLmZvcm1hdCAhPT0gJ1JHQkEnKSB8fFxuICAgICAgICAgIChjaGFubmVscyA9PT0gMyAmJiAob3B0aW9ucy5mb3JtYXQgIT09ICdSR0InICYmIG9wdGlvbnMuZm9ybWF0ICE9PSAnQkdSJykpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVGVuc29yIGZvcm1hdCBkb2VzblxcJ3QgbWF0Y2ggaW5wdXQgdGVuc29yIGRpbXMnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZWZhdWx0IHBvaW50ZXIgYXNzaWdubWVudHNcbiAgICBjb25zdCBzdGVwID0gNDtcbiAgICBsZXQgckltYWdlUG9pbnRlciA9IDAsIGdJbWFnZVBvaW50ZXIgPSAxLCBiSW1hZ2VQb2ludGVyID0gMiwgYUltYWdlUG9pbnRlciA9IDM7XG4gICAgbGV0IHJUZW5zb3JQb2ludGVyID0gMCwgZ1RlbnNvclBvaW50ZXIgPSBzdHJpZGUsIGJUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMiwgYVRlbnNvclBvaW50ZXIgPSAtMTtcblxuICAgIC8vIFVwZGF0aW5nIHRoZSBwb2ludGVyIGFzc2lnbm1lbnRzIGJhc2VkIG9uIHRoZSBpbnB1dCBpbWFnZSBmb3JtYXRcbiAgICBpZiAoaW5wdXRmb3JtYXQgPT09ICdSR0JBJykge1xuICAgICAgclRlbnNvclBvaW50ZXIgPSAwO1xuICAgICAgZ1RlbnNvclBvaW50ZXIgPSBzdHJpZGU7XG4gICAgICBiVGVuc29yUG9pbnRlciA9IHN0cmlkZSAqIDI7XG4gICAgICBhVGVuc29yUG9pbnRlciA9IHN0cmlkZSAqIDM7XG4gICAgfSBlbHNlIGlmIChpbnB1dGZvcm1hdCA9PT0gJ1JHQicpIHtcbiAgICAgIHJUZW5zb3JQb2ludGVyID0gMDtcbiAgICAgIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlO1xuICAgICAgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyO1xuICAgIH0gZWxzZSBpZiAoaW5wdXRmb3JtYXQgPT09ICdSQkcnKSB7XG4gICAgICByVGVuc29yUG9pbnRlciA9IDA7XG4gICAgICBiVGVuc29yUG9pbnRlciA9IHN0cmlkZTtcbiAgICAgIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMjtcbiAgICB9XG5cbiAgICBpbWFnZSA9IHBpeGVsczJEQ29udGV4dC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhlaWdodCAqIHdpZHRoO1xuICAgICAgICAgckltYWdlUG9pbnRlciArPSBzdGVwLCBnSW1hZ2VQb2ludGVyICs9IHN0ZXAsIGJJbWFnZVBvaW50ZXIgKz0gc3RlcCwgYUltYWdlUG9pbnRlciArPSBzdGVwLCBpKyspIHtcbiAgICAgIGltYWdlLmRhdGFbckltYWdlUG9pbnRlcl0gPSAoKHRlbnNvci5kYXRhW3JUZW5zb3JQb2ludGVyKytdIGFzIG51bWJlcikgLSBub3JtQmlhc1swXSkgKiBub3JtTWVhblswXTsgIC8vIFIgdmFsdWVcbiAgICAgIGltYWdlLmRhdGFbZ0ltYWdlUG9pbnRlcl0gPSAoKHRlbnNvci5kYXRhW2dUZW5zb3JQb2ludGVyKytdIGFzIG51bWJlcikgLSBub3JtQmlhc1sxXSkgKiBub3JtTWVhblsxXTsgIC8vIEcgdmFsdWVcbiAgICAgIGltYWdlLmRhdGFbYkltYWdlUG9pbnRlcl0gPSAoKHRlbnNvci5kYXRhW2JUZW5zb3JQb2ludGVyKytdIGFzIG51bWJlcikgLSBub3JtQmlhc1syXSkgKiBub3JtTWVhblsyXTsgIC8vIEIgdmFsdWVcbiAgICAgIGltYWdlLmRhdGFbYUltYWdlUG9pbnRlcl0gPSBhVGVuc29yUG9pbnRlciA9PT0gLTEgP1xuICAgICAgICAgIDI1NSA6XG4gICAgICAgICAgKCh0ZW5zb3IuZGF0YVthVGVuc29yUG9pbnRlcisrXSBhcyBudW1iZXIpIC0gbm9ybUJpYXNbM10pICogbm9ybU1lYW5bM107ICAvLyBBIHZhbHVlXG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGFjY2VzcyBpbWFnZSBkYXRhJyk7XG4gIH1cbiAgcmV0dXJuIGltYWdlO1xufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtPcHRpb25zRGltZW5zaW9ucywgT3B0aW9uc0Zvcm1hdCwgT3B0aW9uc05vcm1hbGl6YXRpb25QYXJhbWV0ZXJzLCBPcHRpb25zVGVuc29yRm9ybWF0LCBPcHRpb25zVGVuc29yTGF5b3V0LCBUZW5zb3JGcm9tR3B1QnVmZmVyT3B0aW9ucywgVGVuc29yRnJvbUltYWdlQml0bWFwT3B0aW9ucywgVGVuc29yRnJvbUltYWdlRGF0YU9wdGlvbnMsIFRlbnNvckZyb21JbWFnZUVsZW1lbnRPcHRpb25zLCBUZW5zb3JGcm9tVGV4dHVyZU9wdGlvbnMsIFRlbnNvckZyb21VcmxPcHRpb25zfSBmcm9tICcuL3RlbnNvci1mYWN0b3J5LmpzJztcbmltcG9ydCB7VGVuc29yfSBmcm9tICcuL3RlbnNvci1pbXBsLmpzJztcbmltcG9ydCB7VGVuc29yIGFzIFRlbnNvckludGVyZmFjZX0gZnJvbSAnLi90ZW5zb3IuanMnO1xuXG5pbnRlcmZhY2UgQnVmZmVyVG9UZW5zb3JPcHRpb25zIGV4dGVuZHMgT3B0aW9uc0RpbWVuc2lvbnMsIE9wdGlvbnNUZW5zb3JMYXlvdXQsIE9wdGlvbnNOb3JtYWxpemF0aW9uUGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPcHRpb25zRm9ybWF0LCBPcHRpb25zVGVuc29yRm9ybWF0IHt9XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IHRlbnNvciBvYmplY3QgZnJvbSBpbWFnZSBvYmplY3RcbiAqXG4gKiBAcGFyYW0gYnVmZmVyIC0gRXh0cmFjdGVkIGltYWdlIGJ1ZmZlciBkYXRhIC0gYXNzdW1pbmcgUkdCQSBmb3JtYXRcbiAqIEBwYXJhbSBpbWFnZUZvcm1hdCAtIGlucHV0IGltYWdlIGNvbmZpZ3VyYXRpb24gLSByZXF1aXJlZCBjb25maWd1cmF0aW9ucyBoZWlnaHQsIHdpZHRoLCBmb3JtYXRcbiAqIEBwYXJhbSB0ZW5zb3JGb3JtYXQgLSBvdXRwdXQgdGVuc29yIGNvbmZpZ3VyYXRpb24gLSBEZWZhdWx0IGlzIFJHQiBmb3JtYXRcbiAqL1xuZXhwb3J0IGNvbnN0IGJ1ZmZlclRvVGVuc29yID0gKGJ1ZmZlcjogVWludDhDbGFtcGVkQXJyYXl8dW5kZWZpbmVkLCBvcHRpb25zOiBCdWZmZXJUb1RlbnNvck9wdGlvbnMpOiBUZW5zb3IgPT4ge1xuICBpZiAoYnVmZmVyID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ltYWdlIGJ1ZmZlciBtdXN0IGJlIGRlZmluZWQnKTtcbiAgfVxuICBpZiAob3B0aW9ucy5oZWlnaHQgPT09IHVuZGVmaW5lZCB8fCBvcHRpb25zLndpZHRoID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ltYWdlIGhlaWdodCBhbmQgd2lkdGggbXVzdCBiZSBkZWZpbmVkJyk7XG4gIH1cbiAgaWYgKG9wdGlvbnMudGVuc29yTGF5b3V0ID09PSAnTkhXQycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05IV0MgVGVuc29yIGxheW91dCBpcyBub3Qgc3VwcG9ydGVkIHlldCcpO1xuICB9XG5cbiAgY29uc3Qge2hlaWdodCwgd2lkdGh9ID0gb3B0aW9ucztcblxuICBjb25zdCBub3JtID0gb3B0aW9ucy5ub3JtID8/IHttZWFuOiAyNTUsIGJpYXM6IDB9O1xuICBsZXQgbm9ybU1lYW46IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdO1xuICBsZXQgbm9ybUJpYXM6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdO1xuXG4gIGlmICh0eXBlb2YgKG5vcm0ubWVhbikgPT09ICdudW1iZXInKSB7XG4gICAgbm9ybU1lYW4gPSBbbm9ybS5tZWFuLCBub3JtLm1lYW4sIG5vcm0ubWVhbiwgbm9ybS5tZWFuXTtcbiAgfSBlbHNlIHtcbiAgICBub3JtTWVhbiA9IFtub3JtLm1lYW4hWzBdLCBub3JtLm1lYW4hWzFdLCBub3JtLm1lYW4hWzJdLCBub3JtLm1lYW4hWzNdID8/IDI1NV07XG4gIH1cblxuICBpZiAodHlwZW9mIChub3JtLmJpYXMpID09PSAnbnVtYmVyJykge1xuICAgIG5vcm1CaWFzID0gW25vcm0uYmlhcywgbm9ybS5iaWFzLCBub3JtLmJpYXMsIG5vcm0uYmlhc107XG4gIH0gZWxzZSB7XG4gICAgbm9ybUJpYXMgPSBbbm9ybS5iaWFzIVswXSwgbm9ybS5iaWFzIVsxXSwgbm9ybS5iaWFzIVsyXSwgbm9ybS5iaWFzIVszXSA/PyAwXTtcbiAgfVxuXG4gIGNvbnN0IGlucHV0Zm9ybWF0ID0gb3B0aW9ucy5mb3JtYXQgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuZm9ybWF0IDogJ1JHQkEnO1xuICAvLyBkZWZhdWx0IHZhbHVlIGlzIFJHQkEgc2luY2UgaW1hZ2VkYXRhIGFuZCBIVE1MSW1hZ2VFbGVtZW50IHVzZXMgaXRcblxuICBjb25zdCBvdXRwdXRmb3JtYXQgPVxuICAgICAgb3B0aW9ucy50ZW5zb3JGb3JtYXQgIT09IHVuZGVmaW5lZCA/IChvcHRpb25zLnRlbnNvckZvcm1hdCAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy50ZW5zb3JGb3JtYXQgOiAnUkdCJykgOiAnUkdCJztcbiAgY29uc3Qgc3RyaWRlID0gaGVpZ2h0ICogd2lkdGg7XG4gIGNvbnN0IGZsb2F0MzJEYXRhID0gb3V0cHV0Zm9ybWF0ID09PSAnUkdCQScgPyBuZXcgRmxvYXQzMkFycmF5KHN0cmlkZSAqIDQpIDogbmV3IEZsb2F0MzJBcnJheShzdHJpZGUgKiAzKTtcblxuICAvLyBEZWZhdWx0IHBvaW50ZXIgYXNzaWdubWVudHNcbiAgbGV0IHN0ZXAgPSA0LCBySW1hZ2VQb2ludGVyID0gMCwgZ0ltYWdlUG9pbnRlciA9IDEsIGJJbWFnZVBvaW50ZXIgPSAyLCBhSW1hZ2VQb2ludGVyID0gMztcbiAgbGV0IHJUZW5zb3JQb2ludGVyID0gMCwgZ1RlbnNvclBvaW50ZXIgPSBzdHJpZGUsIGJUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMiwgYVRlbnNvclBvaW50ZXIgPSAtMTtcblxuICAvLyBVcGRhdGluZyB0aGUgcG9pbnRlciBhc3NpZ25tZW50cyBiYXNlZCBvbiB0aGUgaW5wdXQgaW1hZ2UgZm9ybWF0XG4gIGlmIChpbnB1dGZvcm1hdCA9PT0gJ1JHQicpIHtcbiAgICBzdGVwID0gMztcbiAgICBySW1hZ2VQb2ludGVyID0gMDtcbiAgICBnSW1hZ2VQb2ludGVyID0gMTtcbiAgICBiSW1hZ2VQb2ludGVyID0gMjtcbiAgICBhSW1hZ2VQb2ludGVyID0gLTE7XG4gIH1cblxuICAvLyBVcGRhdGluZyB0aGUgcG9pbnRlciBhc3NpZ25tZW50cyBiYXNlZCBvbiB0aGUgb3V0cHV0IHRlbnNvciBmb3JtYXRcbiAgaWYgKG91dHB1dGZvcm1hdCA9PT0gJ1JHQkEnKSB7XG4gICAgYVRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAzO1xuICB9IGVsc2UgaWYgKG91dHB1dGZvcm1hdCA9PT0gJ1JCRycpIHtcbiAgICByVGVuc29yUG9pbnRlciA9IDA7XG4gICAgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGU7XG4gICAgZ1RlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyO1xuICB9IGVsc2UgaWYgKG91dHB1dGZvcm1hdCA9PT0gJ0JHUicpIHtcbiAgICBiVGVuc29yUG9pbnRlciA9IDA7XG4gICAgZ1RlbnNvclBvaW50ZXIgPSBzdHJpZGU7XG4gICAgclRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyO1xuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpZGU7XG4gICAgICAgaSsrLCBySW1hZ2VQb2ludGVyICs9IHN0ZXAsIGJJbWFnZVBvaW50ZXIgKz0gc3RlcCwgZ0ltYWdlUG9pbnRlciArPSBzdGVwLCBhSW1hZ2VQb2ludGVyICs9IHN0ZXApIHtcbiAgICBmbG9hdDMyRGF0YVtyVGVuc29yUG9pbnRlcisrXSA9IChidWZmZXJbckltYWdlUG9pbnRlcl0gKyBub3JtQmlhc1swXSkgLyBub3JtTWVhblswXTtcbiAgICBmbG9hdDMyRGF0YVtnVGVuc29yUG9pbnRlcisrXSA9IChidWZmZXJbZ0ltYWdlUG9pbnRlcl0gKyBub3JtQmlhc1sxXSkgLyBub3JtTWVhblsxXTtcbiAgICBmbG9hdDMyRGF0YVtiVGVuc29yUG9pbnRlcisrXSA9IChidWZmZXJbYkltYWdlUG9pbnRlcl0gKyBub3JtQmlhc1syXSkgLyBub3JtTWVhblsyXTtcbiAgICBpZiAoYVRlbnNvclBvaW50ZXIgIT09IC0xICYmIGFJbWFnZVBvaW50ZXIgIT09IC0xKSB7XG4gICAgICBmbG9hdDMyRGF0YVthVGVuc29yUG9pbnRlcisrXSA9IChidWZmZXJbYUltYWdlUG9pbnRlcl0gKyBub3JtQmlhc1szXSkgLyBub3JtTWVhblszXTtcbiAgICB9XG4gIH1cblxuICAvLyBGbG9hdDMyQXJyYXkgLT4gb3J0LlRlbnNvclxuICBjb25zdCBvdXRwdXRUZW5zb3IgPSBvdXRwdXRmb3JtYXQgPT09ICdSR0JBJyA/IG5ldyBUZW5zb3IoJ2Zsb2F0MzInLCBmbG9hdDMyRGF0YSwgWzEsIDQsIGhlaWdodCwgd2lkdGhdKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFRlbnNvcignZmxvYXQzMicsIGZsb2F0MzJEYXRhLCBbMSwgMywgaGVpZ2h0LCB3aWR0aF0pO1xuICByZXR1cm4gb3V0cHV0VGVuc29yO1xufTtcblxuLyoqXG4gKiBpbXBsZW1lbnRhdGlvbiBvZiBUZW5zb3IuZnJvbUltYWdlKCkuXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JGcm9tSW1hZ2UgPSBhc3luYyhcbiAgICBpbWFnZTogSW1hZ2VEYXRhfEhUTUxJbWFnZUVsZW1lbnR8SW1hZ2VCaXRtYXB8c3RyaW5nLFxuICAgIG9wdGlvbnM/OiBUZW5zb3JGcm9tSW1hZ2VEYXRhT3B0aW9uc3xUZW5zb3JGcm9tSW1hZ2VFbGVtZW50T3B0aW9uc3xUZW5zb3JGcm9tSW1hZ2VCaXRtYXBPcHRpb25zfFxuICAgIFRlbnNvckZyb21VcmxPcHRpb25zKTogUHJvbWlzZTxUZW5zb3I+ID0+IHtcbiAgLy8gY2hlY2tpbmcgdGhlIHR5cGUgb2YgaW1hZ2Ugb2JqZWN0XG4gIGNvbnN0IGlzSFRNTEltYWdlRWxlID0gdHlwZW9mIChIVE1MSW1hZ2VFbGVtZW50KSAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1hZ2UgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50O1xuICBjb25zdCBpc0ltYWdlRGF0YUVsZSA9IHR5cGVvZiAoSW1hZ2VEYXRhKSAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1hZ2UgaW5zdGFuY2VvZiBJbWFnZURhdGE7XG4gIGNvbnN0IGlzSW1hZ2VCaXRtYXAgPSB0eXBlb2YgKEltYWdlQml0bWFwKSAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1hZ2UgaW5zdGFuY2VvZiBJbWFnZUJpdG1hcDtcbiAgY29uc3QgaXNTdHJpbmcgPSB0eXBlb2YgaW1hZ2UgPT09ICdzdHJpbmcnO1xuXG4gIGxldCBkYXRhOiBVaW50OENsYW1wZWRBcnJheXx1bmRlZmluZWQ7XG4gIGxldCBidWZmZXJUb1RlbnNvck9wdGlvbnM6IEJ1ZmZlclRvVGVuc29yT3B0aW9ucyA9IG9wdGlvbnMgPz8ge307XG5cbiAgY29uc3QgY3JlYXRlQ2FudmFzID0gKCkgPT4ge1xuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgT2Zmc2NyZWVuQ2FudmFzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIG5ldyBPZmZzY3JlZW5DYW52YXMoMSwgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FudmFzIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IGNyZWF0ZUNhbnZhc0NvbnRleHQgPSAoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudHxPZmZzY3JlZW5DYW52YXMpID0+IHtcbiAgICBpZiAoY2FudmFzIGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQpIHtcbiAgICAgIHJldHVybiBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB9IGVsc2UgaWYgKGNhbnZhcyBpbnN0YW5jZW9mIE9mZnNjcmVlbkNhbnZhcykge1xuICAgICAgcmV0dXJuIGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpIGFzIE9mZnNjcmVlbkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xuICAvLyBmaWxsaW5nIGFuZCBjaGVja2luZyBpbWFnZSBjb25maWd1cmF0aW9uIG9wdGlvbnNcbiAgaWYgKGlzSFRNTEltYWdlRWxlKSB7XG4gICAgLy8gSFRNTEltYWdlRWxlbWVudCAtIGltYWdlIG9iamVjdCAtIGZvcm1hdCBpcyBSR0JBIGJ5IGRlZmF1bHRcbiAgICBjb25zdCBjYW52YXMgPSBjcmVhdGVDYW52YXMoKTtcbiAgICBjYW52YXMud2lkdGggPSBpbWFnZS53aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuICAgIGNvbnN0IHBpeGVsczJEQ29udGV4dCA9IGNyZWF0ZUNhbnZhc0NvbnRleHQoY2FudmFzKTtcblxuICAgIGlmIChwaXhlbHMyRENvbnRleHQgIT0gbnVsbCkge1xuICAgICAgbGV0IGhlaWdodCA9IGltYWdlLmhlaWdodDtcbiAgICAgIGxldCB3aWR0aCA9IGltYWdlLndpZHRoO1xuICAgICAgaWYgKG9wdGlvbnMgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLnJlc2l6ZWRIZWlnaHQgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLnJlc2l6ZWRXaWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGhlaWdodCA9IG9wdGlvbnMucmVzaXplZEhlaWdodDtcbiAgICAgICAgd2lkdGggPSBvcHRpb25zLnJlc2l6ZWRXaWR0aDtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICBpZiAob3B0aW9ucy50ZW5zb3JGb3JtYXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW1hZ2UgaW5wdXQgY29uZmlnIGZvcm1hdCBtdXN0IGJlIFJHQkEgZm9yIEhUTUxJbWFnZUVsZW1lbnQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMudGVuc29yRm9ybWF0ID0gJ1JHQkEnO1xuICAgICAgICB9XG4gICAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy53aWR0aCA9IHdpZHRoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLnRlbnNvckZvcm1hdCA9ICdSR0JBJztcbiAgICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLndpZHRoID0gd2lkdGg7XG4gICAgICB9XG5cbiAgICAgIHBpeGVsczJEQ29udGV4dC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xuICAgICAgZGF0YSA9IHBpeGVsczJEQ29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCkuZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGFjY2VzcyBpbWFnZSBkYXRhJyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzSW1hZ2VEYXRhRWxlKSB7XG4gICAgbGV0IGhlaWdodDogbnVtYmVyO1xuICAgIGxldCB3aWR0aDogbnVtYmVyO1xuXG4gICAgaWYgKG9wdGlvbnMgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLnJlc2l6ZWRXaWR0aCAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMucmVzaXplZEhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBoZWlnaHQgPSBvcHRpb25zLnJlc2l6ZWRIZWlnaHQ7XG4gICAgICB3aWR0aCA9IG9wdGlvbnMucmVzaXplZFdpZHRoO1xuICAgIH0gZWxzZSB7XG4gICAgICBoZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG4gICAgICB3aWR0aCA9IGltYWdlLndpZHRoO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy5mb3JtYXQgPSAnUkdCQSc7XG4gICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLmhlaWdodCA9IGhlaWdodDtcbiAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMud2lkdGggPSB3aWR0aDtcblxuICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IHRlbXBDYW52YXMgPSBjcmVhdGVDYW52YXMoKTtcblxuICAgICAgdGVtcENhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgdGVtcENhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgIGNvbnN0IHBpeGVsczJEQ29udGV4dCA9IGNyZWF0ZUNhbnZhc0NvbnRleHQodGVtcENhbnZhcyk7XG5cbiAgICAgIGlmIChwaXhlbHMyRENvbnRleHQgIT0gbnVsbCkge1xuICAgICAgICBwaXhlbHMyRENvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlLCAwLCAwKTtcbiAgICAgICAgZGF0YSA9IHBpeGVsczJEQ29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCkuZGF0YTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG5vdCBhY2Nlc3MgaW1hZ2UgZGF0YScpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkYXRhID0gaW1hZ2UuZGF0YTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNJbWFnZUJpdG1hcCkge1xuICAgIC8vIEltYWdlQml0bWFwIC0gaW1hZ2Ugb2JqZWN0IC0gZm9ybWF0IG11c3QgYmUgcHJvdmlkZWQgYnkgdXNlclxuICAgIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIHByb3ZpZGUgaW1hZ2UgY29uZmlnIHdpdGggZm9ybWF0IGZvciBJbWFnZWJpdG1hcCcpO1xuICAgIH1cblxuICAgIGNvbnN0IGNhbnZhcyA9IGNyZWF0ZUNhbnZhcygpO1xuICAgIGNhbnZhcy53aWR0aCA9IGltYWdlLndpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG4gICAgY29uc3QgcGl4ZWxzMkRDb250ZXh0ID0gY3JlYXRlQ2FudmFzQ29udGV4dChjYW52YXMpO1xuXG4gICAgaWYgKHBpeGVsczJEQ29udGV4dCAhPSBudWxsKSB7XG4gICAgICBjb25zdCBoZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG4gICAgICBjb25zdCB3aWR0aCA9IGltYWdlLndpZHRoO1xuICAgICAgcGl4ZWxzMkRDb250ZXh0LmRyYXdJbWFnZShpbWFnZSwgMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICBkYXRhID0gcGl4ZWxzMkRDb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aCwgaGVpZ2h0KS5kYXRhO1xuICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLmhlaWdodCA9IGhlaWdodDtcbiAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy53aWR0aCA9IHdpZHRoO1xuICAgICAgcmV0dXJuIGJ1ZmZlclRvVGVuc29yKGRhdGEsIGJ1ZmZlclRvVGVuc29yT3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG5vdCBhY2Nlc3MgaW1hZ2UgZGF0YScpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc1N0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBjYW52YXMgPSBjcmVhdGVDYW52YXMoKTtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBjcmVhdGVDYW52YXNDb250ZXh0KGNhbnZhcyk7XG4gICAgICBpZiAoIWltYWdlIHx8ICFjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiByZWplY3QoKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG5ld0ltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICBuZXdJbWFnZS5jcm9zc09yaWdpbiA9ICdBbm9ueW1vdXMnO1xuICAgICAgbmV3SW1hZ2Uuc3JjID0gaW1hZ2U7XG4gICAgICBuZXdJbWFnZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IG5ld0ltYWdlLndpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gbmV3SW1hZ2UuaGVpZ2h0O1xuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShuZXdJbWFnZSwgMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgY29uc3QgaW1nID0gY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMuaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcbiAgICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLndpZHRoID0gY2FudmFzLndpZHRoO1xuICAgICAgICByZXNvbHZlKGJ1ZmZlclRvVGVuc29yKGltZy5kYXRhLCBidWZmZXJUb1RlbnNvck9wdGlvbnMpKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnB1dCBkYXRhIHByb3ZpZGVkIGlzIG5vdCBzdXBwb3J0ZWQgLSBhYm9ydGVkIHRlbnNvciBjcmVhdGlvbicpO1xuICB9XG5cbiAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBidWZmZXJUb1RlbnNvcihkYXRhLCBidWZmZXJUb1RlbnNvck9wdGlvbnMpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignSW5wdXQgZGF0YSBwcm92aWRlZCBpcyBub3Qgc3VwcG9ydGVkIC0gYWJvcnRlZCB0ZW5zb3IgY3JlYXRpb24nKTtcbiAgfVxufTtcblxuLyoqXG4gKiBpbXBsZW1lbnRhdGlvbiBvZiBUZW5zb3IuZnJvbVRleHR1cmUoKS5cbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckZyb21UZXh0dXJlID0gPFQgZXh0ZW5kcyBUZW5zb3JJbnRlcmZhY2UuVGV4dHVyZURhdGFUeXBlcz4oXG4gICAgdGV4dHVyZTogVGVuc29ySW50ZXJmYWNlLlRleHR1cmVUeXBlLCBvcHRpb25zOiBUZW5zb3JGcm9tVGV4dHVyZU9wdGlvbnM8VD4pOiBUZW5zb3IgPT4ge1xuICBjb25zdCB7d2lkdGgsIGhlaWdodCwgZG93bmxvYWQsIGRpc3Bvc2V9ID0gb3B0aW9ucztcbiAgLy8gQWx3YXlzIGFzc3VtZSBSR0JBRjMyLiBUT0RPOiBzdXBwb3J0IGRpZmZlcmVudCB0ZXh0dXJlIGZvcm1hdFxuICBjb25zdCBkaW1zID0gWzEsIGhlaWdodCwgd2lkdGgsIDRdO1xuICByZXR1cm4gbmV3IFRlbnNvcih7bG9jYXRpb246ICd0ZXh0dXJlJywgdHlwZTogJ2Zsb2F0MzInLCB0ZXh0dXJlLCBkaW1zLCBkb3dubG9hZCwgZGlzcG9zZX0pO1xufTtcblxuLyoqXG4gKiBpbXBsZW1lbnRhdGlvbiBvZiBUZW5zb3IuZnJvbUdwdUJ1ZmZlcigpLlxuICovXG5leHBvcnQgY29uc3QgdGVuc29yRnJvbUdwdUJ1ZmZlciA9IDxUIGV4dGVuZHMgVGVuc29ySW50ZXJmYWNlLkdwdUJ1ZmZlckRhdGFUeXBlcz4oXG4gICAgZ3B1QnVmZmVyOiBUZW5zb3JJbnRlcmZhY2UuR3B1QnVmZmVyVHlwZSwgb3B0aW9uczogVGVuc29yRnJvbUdwdUJ1ZmZlck9wdGlvbnM8VD4pOiBUZW5zb3IgPT4ge1xuICBjb25zdCB7ZGF0YVR5cGUsIGRpbXMsIGRvd25sb2FkLCBkaXNwb3NlfSA9IG9wdGlvbnM7XG4gIHJldHVybiBuZXcgVGVuc29yKHtsb2NhdGlvbjogJ2dwdS1idWZmZXInLCB0eXBlOiBkYXRhVHlwZSA/PyAnZmxvYXQzMicsIGdwdUJ1ZmZlciwgZGltcywgZG93bmxvYWQsIGRpc3Bvc2V9KTtcbn07XG5cbi8qKlxuICogaW1wbGVtZW50YXRpb24gb2YgVGVuc29yLmZyb21QaW5uZWRCdWZmZXIoKS5cbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckZyb21QaW5uZWRCdWZmZXIgPSA8VCBleHRlbmRzIFRlbnNvckludGVyZmFjZS5DcHVQaW5uZWREYXRhVHlwZXM+KFxuICAgIHR5cGU6IFQsIGJ1ZmZlcjogVGVuc29ySW50ZXJmYWNlLkRhdGFUeXBlTWFwW1RdLCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUZW5zb3IgPT5cbiAgICBuZXcgVGVuc29yKHtsb2NhdGlvbjogJ2NwdS1waW5uZWQnLCB0eXBlLCBkYXRhOiBidWZmZXIsIGRpbXM6IGRpbXMgPz8gW2J1ZmZlci5sZW5ndGhdfSk7XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7VGVuc29yfSBmcm9tICcuL3RlbnNvci5qcyc7XG5cbmV4cG9ydCB0eXBlIFN1cHBvcnRlZFR5cGVkQXJyYXlDb25zdHJ1Y3RvcnMgPSBGbG9hdDMyQXJyYXlDb25zdHJ1Y3RvcnxVaW50OEFycmF5Q29uc3RydWN0b3J8SW50OEFycmF5Q29uc3RydWN0b3J8XG4gICAgVWludDE2QXJyYXlDb25zdHJ1Y3RvcnxJbnQxNkFycmF5Q29uc3RydWN0b3J8SW50MzJBcnJheUNvbnN0cnVjdG9yfEJpZ0ludDY0QXJyYXlDb25zdHJ1Y3RvcnxVaW50OEFycmF5Q29uc3RydWN0b3J8XG4gICAgRmxvYXQ2NEFycmF5Q29uc3RydWN0b3J8VWludDMyQXJyYXlDb25zdHJ1Y3RvcnxCaWdVaW50NjRBcnJheUNvbnN0cnVjdG9yO1xuZXhwb3J0IHR5cGUgU3VwcG9ydGVkVHlwZWRBcnJheSA9IEluc3RhbmNlVHlwZTxTdXBwb3J0ZWRUeXBlZEFycmF5Q29uc3RydWN0b3JzPjtcblxuLy8gYSBydW50aW1lIG1hcCB0aGF0IG1hcHMgdHlwZSBzdHJpbmcgdG8gVHlwZWRBcnJheSBjb25zdHJ1Y3Rvci4gU2hvdWxkIG1hdGNoIFRlbnNvci5EYXRhVHlwZU1hcC5cbmV4cG9ydCBjb25zdCBOVU1FUklDX1RFTlNPUl9UWVBFX1RPX1RZUEVEQVJSQVlfTUFQID0gbmV3IE1hcDxzdHJpbmcsIFN1cHBvcnRlZFR5cGVkQXJyYXlDb25zdHJ1Y3RvcnM+KFtcbiAgWydmbG9hdDMyJywgRmxvYXQzMkFycmF5XSxcbiAgWyd1aW50OCcsIFVpbnQ4QXJyYXldLFxuICBbJ2ludDgnLCBJbnQ4QXJyYXldLFxuICBbJ3VpbnQxNicsIFVpbnQxNkFycmF5XSxcbiAgWydmbG9hdDE2JywgVWludDE2QXJyYXldLFxuICBbJ2ludDE2JywgSW50MTZBcnJheV0sXG4gIFsnaW50MzInLCBJbnQzMkFycmF5XSxcbiAgWydib29sJywgVWludDhBcnJheV0sXG4gIFsnZmxvYXQ2NCcsIEZsb2F0NjRBcnJheV0sXG4gIFsndWludDMyJywgVWludDMyQXJyYXldLFxuXSk7XG5cbi8vIGEgcnVudGltZSBtYXAgdGhhdCBtYXBzIHR5cGUgc3RyaW5nIHRvIFR5cGVkQXJyYXkgY29uc3RydWN0b3IuIFNob3VsZCBtYXRjaCBUZW5zb3IuRGF0YVR5cGVNYXAuXG5leHBvcnQgY29uc3QgTlVNRVJJQ19URU5TT1JfVFlQRURBUlJBWV9UT19UWVBFX01BUCA9IG5ldyBNYXA8U3VwcG9ydGVkVHlwZWRBcnJheUNvbnN0cnVjdG9ycywgVGVuc29yLlR5cGU+KFtcbiAgW0Zsb2F0MzJBcnJheSwgJ2Zsb2F0MzInXSxcbiAgW1VpbnQ4QXJyYXksICd1aW50OCddLFxuICBbSW50OEFycmF5LCAnaW50OCddLFxuICBbVWludDE2QXJyYXksICd1aW50MTYnXSxcbiAgW0ludDE2QXJyYXksICdpbnQxNiddLFxuICBbSW50MzJBcnJheSwgJ2ludDMyJ10sXG4gIFtGbG9hdDY0QXJyYXksICdmbG9hdDY0J10sXG4gIFtVaW50MzJBcnJheSwgJ3VpbnQzMiddLFxuXSk7XG5cbi8vIHRoZSBmb2xsb3dpbmcgY29kZSBhbGxvd3MgZGVsYXlpbmcgZXhlY3V0aW9uIG9mIEJpZ0ludCBjaGVja2luZy4gVGhpcyBhbGxvd3MgbGF6eSBpbml0aWFsaXphdGlvbiBmb3Jcbi8vIE5VTUVSSUNfVEVOU09SX1RZUEVfVE9fVFlQRURBUlJBWV9NQVAgYW5kIE5VTUVSSUNfVEVOU09SX1RZUEVEQVJSQVlfVE9fVFlQRV9NQVAsIHdoaWNoIGFsbG93cyBCaWdJbnQgcG9seWZpbGxcbi8vIGlmIGF2YWlsYWJsZS5cbmxldCBpc0JpZ0ludENoZWNrZWQgPSBmYWxzZTtcbmV4cG9ydCBjb25zdCBjaGVja0JpZ0ludCA9ICgpID0+IHtcbiAgaWYgKCFpc0JpZ0ludENoZWNrZWQpIHtcbiAgICBpc0JpZ0ludENoZWNrZWQgPSB0cnVlO1xuICAgIGNvbnN0IGlzQmlnSW50NjRBcnJheUF2YWlsYWJsZSA9IHR5cGVvZiBCaWdJbnQ2NEFycmF5ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgQmlnSW50NjRBcnJheS5mcm9tID09PSAnZnVuY3Rpb24nO1xuICAgIGNvbnN0IGlzQmlnVWludDY0QXJyYXlBdmFpbGFibGUgPVxuICAgICAgICB0eXBlb2YgQmlnVWludDY0QXJyYXkgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBCaWdVaW50NjRBcnJheS5mcm9tID09PSAnZnVuY3Rpb24nO1xuXG4gICAgaWYgKGlzQmlnSW50NjRBcnJheUF2YWlsYWJsZSkge1xuICAgICAgTlVNRVJJQ19URU5TT1JfVFlQRV9UT19UWVBFREFSUkFZX01BUC5zZXQoJ2ludDY0JywgQmlnSW50NjRBcnJheSk7XG4gICAgICBOVU1FUklDX1RFTlNPUl9UWVBFREFSUkFZX1RPX1RZUEVfTUFQLnNldChCaWdJbnQ2NEFycmF5LCAnaW50NjQnKTtcbiAgICB9XG4gICAgaWYgKGlzQmlnVWludDY0QXJyYXlBdmFpbGFibGUpIHtcbiAgICAgIE5VTUVSSUNfVEVOU09SX1RZUEVfVE9fVFlQRURBUlJBWV9NQVAuc2V0KCd1aW50NjQnLCBCaWdVaW50NjRBcnJheSk7XG4gICAgICBOVU1FUklDX1RFTlNPUl9UWVBFREFSUkFZX1RPX1RZUEVfTUFQLnNldChCaWdVaW50NjRBcnJheSwgJ3VpbnQ2NCcpO1xuICAgIH1cbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtDcHVQaW5uZWRDb25zdHJ1Y3RvclBhcmFtZXRlcnMsIEdwdUJ1ZmZlckNvbnN0cnVjdG9yUGFyYW1ldGVycywgVGV4dHVyZUNvbnN0cnVjdG9yUGFyYW1ldGVyc30gZnJvbSAnLi90ZW5zb3ItZmFjdG9yeS5qcyc7XG5pbXBvcnQge1RlbnNvcn0gZnJvbSAnLi90ZW5zb3ItaW1wbC5qcyc7XG5cbi8qKlxuICogY2FsY3VsYXRlIHNpemUgZnJvbSBkaW1zLlxuICpcbiAqIEBwYXJhbSBkaW1zIHRoZSBkaW1zIGFycmF5LiBNYXkgYmUgYW4gaWxsZWdhbCBpbnB1dC5cbiAqL1xuZXhwb3J0IGNvbnN0IGNhbGN1bGF0ZVNpemUgPSAoZGltczogcmVhZG9ubHkgdW5rbm93bltdKTogbnVtYmVyID0+IHtcbiAgbGV0IHNpemUgPSAxO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBkaW0gPSBkaW1zW2ldO1xuICAgIGlmICh0eXBlb2YgZGltICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzU2FmZUludGVnZXIoZGltKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZGltc1ske2l9XSBtdXN0IGJlIGFuIGludGVnZXIsIGdvdDogJHtkaW19YCk7XG4gICAgfVxuICAgIGlmIChkaW0gPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgZGltc1ske2l9XSBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXIsIGdvdDogJHtkaW19YCk7XG4gICAgfVxuICAgIHNpemUgKj0gZGltO1xuICB9XG4gIHJldHVybiBzaXplO1xufTtcblxuLyoqXG4gKiBpbXBsZW1lbnRhdGlvbiBvZiBUZW5zb3IucmVzaGFwZSgpXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JSZXNoYXBlID0gKHRlbnNvcjogVGVuc29yLCBkaW1zOiByZWFkb25seSBudW1iZXJbXSk6IFRlbnNvciA9PiB7XG4gIHN3aXRjaCAodGVuc29yLmxvY2F0aW9uKSB7XG4gICAgY2FzZSAnY3B1JzpcbiAgICAgIHJldHVybiBuZXcgVGVuc29yKHRlbnNvci50eXBlLCB0ZW5zb3IuZGF0YSwgZGltcyk7XG4gICAgY2FzZSAnY3B1LXBpbm5lZCc6XG4gICAgICByZXR1cm4gbmV3IFRlbnNvcih7XG4gICAgICAgIGxvY2F0aW9uOiAnY3B1LXBpbm5lZCcsXG4gICAgICAgIGRhdGE6IHRlbnNvci5kYXRhIGFzIENwdVBpbm5lZENvbnN0cnVjdG9yUGFyYW1ldGVyc1snZGF0YSddLFxuICAgICAgICB0eXBlOiB0ZW5zb3IudHlwZSBhcyBDcHVQaW5uZWRDb25zdHJ1Y3RvclBhcmFtZXRlcnNbJ3R5cGUnXSxcbiAgICAgICAgZGltcyxcbiAgICAgIH0pO1xuICAgIGNhc2UgJ3RleHR1cmUnOlxuICAgICAgcmV0dXJuIG5ldyBUZW5zb3Ioe1xuICAgICAgICBsb2NhdGlvbjogJ3RleHR1cmUnLFxuICAgICAgICB0ZXh0dXJlOiB0ZW5zb3IudGV4dHVyZSxcbiAgICAgICAgdHlwZTogdGVuc29yLnR5cGUgYXMgVGV4dHVyZUNvbnN0cnVjdG9yUGFyYW1ldGVyc1sndHlwZSddLFxuICAgICAgICBkaW1zLFxuICAgICAgfSk7XG4gICAgY2FzZSAnZ3B1LWJ1ZmZlcic6XG4gICAgICByZXR1cm4gbmV3IFRlbnNvcih7XG4gICAgICAgIGxvY2F0aW9uOiAnZ3B1LWJ1ZmZlcicsXG4gICAgICAgIGdwdUJ1ZmZlcjogdGVuc29yLmdwdUJ1ZmZlcixcbiAgICAgICAgdHlwZTogdGVuc29yLnR5cGUgYXMgR3B1QnVmZmVyQ29uc3RydWN0b3JQYXJhbWV0ZXJzWyd0eXBlJ10sXG4gICAgICAgIGRpbXMsXG4gICAgICB9KTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB0ZW5zb3JSZXNoYXBlOiB0ZW5zb3IgbG9jYXRpb24gJHt0ZW5zb3IubG9jYXRpb259IGlzIG5vdCBzdXBwb3J0ZWRgKTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHt0ZW5zb3JUb0RhdGFVUkwsIHRlbnNvclRvSW1hZ2VEYXRhfSBmcm9tICcuL3RlbnNvci1jb252ZXJzaW9uLWltcGwuanMnO1xuaW1wb3J0IHtUZW5zb3JUb0RhdGFVcmxPcHRpb25zLCBUZW5zb3JUb0ltYWdlRGF0YU9wdGlvbnN9IGZyb20gJy4vdGVuc29yLWNvbnZlcnNpb24uanMnO1xuaW1wb3J0IHt0ZW5zb3JGcm9tR3B1QnVmZmVyLCB0ZW5zb3JGcm9tSW1hZ2UsIHRlbnNvckZyb21QaW5uZWRCdWZmZXIsIHRlbnNvckZyb21UZXh0dXJlfSBmcm9tICcuL3RlbnNvci1mYWN0b3J5LWltcGwuanMnO1xuaW1wb3J0IHtDcHVQaW5uZWRDb25zdHJ1Y3RvclBhcmFtZXRlcnMsIEdwdUJ1ZmZlckNvbnN0cnVjdG9yUGFyYW1ldGVycywgVGVuc29yRnJvbUdwdUJ1ZmZlck9wdGlvbnMsIFRlbnNvckZyb21JbWFnZUJpdG1hcE9wdGlvbnMsIFRlbnNvckZyb21JbWFnZURhdGFPcHRpb25zLCBUZW5zb3JGcm9tSW1hZ2VFbGVtZW50T3B0aW9ucywgVGVuc29yRnJvbVRleHR1cmVPcHRpb25zLCBUZW5zb3JGcm9tVXJsT3B0aW9ucywgVGV4dHVyZUNvbnN0cnVjdG9yUGFyYW1ldGVyc30gZnJvbSAnLi90ZW5zb3ItZmFjdG9yeS5qcyc7XG5pbXBvcnQge2NoZWNrQmlnSW50LCBOVU1FUklDX1RFTlNPUl9UWVBFX1RPX1RZUEVEQVJSQVlfTUFQLCBOVU1FUklDX1RFTlNPUl9UWVBFREFSUkFZX1RPX1RZUEVfTUFQLCBTdXBwb3J0ZWRUeXBlZEFycmF5LCBTdXBwb3J0ZWRUeXBlZEFycmF5Q29uc3RydWN0b3JzfSBmcm9tICcuL3RlbnNvci1pbXBsLXR5cGUtbWFwcGluZy5qcyc7XG5pbXBvcnQge2NhbGN1bGF0ZVNpemUsIHRlbnNvclJlc2hhcGV9IGZyb20gJy4vdGVuc29yLXV0aWxzLWltcGwuanMnO1xuaW1wb3J0IHtUZW5zb3IgYXMgVGVuc29ySW50ZXJmYWNlfSBmcm9tICcuL3RlbnNvci5qcyc7XG5cbi8vIHR5cGUgYWxpYXNlcyBmb3IgdGhvc2UgZXhwb3J0ZWQgZnJvbSBUZW5zb3IgaW50ZXJmYWNlXG5cbnR5cGUgVGVuc29yVHlwZSA9IFRlbnNvckludGVyZmFjZS5UeXBlO1xudHlwZSBUZW5zb3JEYXRhVHlwZSA9IFRlbnNvckludGVyZmFjZS5EYXRhVHlwZTtcbnR5cGUgVGVuc29yRGF0YUxvY2F0aW9uID0gVGVuc29ySW50ZXJmYWNlLkRhdGFMb2NhdGlvbjtcbnR5cGUgVGVuc29yVGV4dHVyZVR5cGUgPSBUZW5zb3JJbnRlcmZhY2UuVGV4dHVyZVR5cGU7XG50eXBlIFRlbnNvckdwdUJ1ZmZlclR5cGUgPSBUZW5zb3JJbnRlcmZhY2UuR3B1QnVmZmVyVHlwZTtcblxuLyoqXG4gKiB0aGUgaW1wbGVtZW50YXRpb24gb2YgVGVuc29yIGludGVyZmFjZS5cbiAqXG4gKiBAaWdub3JlXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW5zb3IgaW1wbGVtZW50cyBUZW5zb3JJbnRlcmZhY2Uge1xuICAvLyAjcmVnaW9uIGNvbnN0cnVjdG9yc1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgQ1BVIHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gdHlwZSwgZGF0YSBhbmQgZGltcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgdHlwZTogVGVuc29yVHlwZSwgZGF0YTogVGVuc29yRGF0YVR5cGV8cmVhZG9ubHkgc3RyaW5nW118cmVhZG9ubHkgbnVtYmVyW118cmVhZG9ubHkgYm9vbGVhbltdLFxuICAgICAgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTtcbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBDUFUgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLiBUeXBlIGlzIGluZmVycmVkIGZyb20gZGF0YS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGRhdGE6IFRlbnNvckRhdGFUeXBlfHJlYWRvbmx5IHN0cmluZ1tdfHJlYWRvbmx5IGJvb2xlYW5bXSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTtcbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIHBpbm5lZCBDUFUgZGF0YSB3aXRoIHRoZSBnaXZlbiB0eXBlIGFuZCBkaW1zLlxuICAgKlxuICAgKiBUZW5zb3IncyBsb2NhdGlvbiB3aWxsIGJlIHNldCB0byAnY3B1LXBpbm5lZCcuXG4gICAqXG4gICAqIEBwYXJhbSBwYXJhbXMgLSBTcGVjaWZ5IHRoZSBwYXJhbWV0ZXJzIHRvIGNvbnN0cnVjdCB0aGUgdGVuc29yLlxuICAgKi9cbiAgY29uc3RydWN0b3IocGFyYW1zOiBDcHVQaW5uZWRDb25zdHJ1Y3RvclBhcmFtZXRlcnMpO1xuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgV2ViR0wgdGV4dHVyZSB3aXRoIHRoZSBnaXZlbiB0eXBlIGFuZCBkaW1zLlxuICAgKlxuICAgKiBUZW5zb3IncyBsb2NhdGlvbiB3aWxsIGJlIHNldCB0byAndGV4dHVyZScuXG4gICAqXG4gICAqIEBwYXJhbSBwYXJhbXMgLSBTcGVjaWZ5IHRoZSBwYXJhbWV0ZXJzIHRvIGNvbnN0cnVjdCB0aGUgdGVuc29yLlxuICAgKi9cbiAgY29uc3RydWN0b3IocGFyYW1zOiBUZXh0dXJlQ29uc3RydWN0b3JQYXJhbWV0ZXJzKTtcbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIFdlYkdQVSBidWZmZXIgd2l0aCB0aGUgZ2l2ZW4gdHlwZSBhbmQgZGltcy5cbiAgICpcbiAgICogVGVuc29yJ3MgbG9jYXRpb24gd2lsbCBiZSBzZXQgdG8gJ2dwdS1idWZmZXInLlxuICAgKlxuICAgKiBAcGFyYW0gcGFyYW1zIC0gU3BlY2lmeSB0aGUgcGFyYW1ldGVycyB0byBjb25zdHJ1Y3QgdGhlIHRlbnNvci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhcmFtczogR3B1QnVmZmVyQ29uc3RydWN0b3JQYXJhbWV0ZXJzKTtcblxuICAvKipcbiAgICogaW1wbGVtZW50YXRpb24uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIGFyZzA6IFRlbnNvclR5cGV8VGVuc29yRGF0YVR5cGV8cmVhZG9ubHkgc3RyaW5nW118cmVhZG9ubHkgYm9vbGVhbltdfENwdVBpbm5lZENvbnN0cnVjdG9yUGFyYW1ldGVyc3xcbiAgICAgIFRleHR1cmVDb25zdHJ1Y3RvclBhcmFtZXRlcnN8R3B1QnVmZmVyQ29uc3RydWN0b3JQYXJhbWV0ZXJzLFxuICAgICAgYXJnMT86IFRlbnNvckRhdGFUeXBlfHJlYWRvbmx5IG51bWJlcltdfHJlYWRvbmx5IHN0cmluZ1tdfHJlYWRvbmx5IGJvb2xlYW5bXSwgYXJnMj86IHJlYWRvbmx5IG51bWJlcltdKSB7XG4gICAgLy8gcGVyZm9ybSBvbmUtdGltZSBjaGVjayBmb3IgQmlnSW50IHN1cHBvcnRcbiAgICBjaGVja0JpZ0ludCgpO1xuXG4gICAgbGV0IHR5cGU6IFRlbnNvclR5cGU7XG4gICAgbGV0IGRpbXM6IHJlYWRvbmx5IG51bWJlcltdO1xuXG4gICAgaWYgKHR5cGVvZiBhcmcwID09PSAnb2JqZWN0JyAmJiAnbG9jYXRpb24nIGluIGFyZzApIHtcbiAgICAgIC8vXG4gICAgICAvLyBjb25zdHJ1Y3RpbmcgdGVuc29yIGZyb20gc3BlY2lmaWMgbG9jYXRpb25cbiAgICAgIC8vXG4gICAgICB0aGlzLmRhdGFMb2NhdGlvbiA9IGFyZzAubG9jYXRpb247XG4gICAgICB0eXBlID0gYXJnMC50eXBlO1xuICAgICAgZGltcyA9IGFyZzAuZGltcztcbiAgICAgIHN3aXRjaCAoYXJnMC5sb2NhdGlvbikge1xuICAgICAgICBjYXNlICdjcHUtcGlubmVkJzoge1xuICAgICAgICAgIGNvbnN0IGV4cGVjdGVkVHlwZWRBcnJheUNvbnN0cnVjdG9yID0gTlVNRVJJQ19URU5TT1JfVFlQRV9UT19UWVBFREFSUkFZX01BUC5nZXQodHlwZSk7XG4gICAgICAgICAgaWYgKCFleHBlY3RlZFR5cGVkQXJyYXlDb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgdW5zdXBwb3J0ZWQgdHlwZSBcIiR7dHlwZX1cIiB0byBjcmVhdGUgdGVuc29yIGZyb20gcGlubmVkIGJ1ZmZlcmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIShhcmcwLmRhdGEgaW5zdGFuY2VvZiBleHBlY3RlZFR5cGVkQXJyYXlDb25zdHJ1Y3RvcikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYGJ1ZmZlciBzaG91bGQgYmUgb2YgdHlwZSAke2V4cGVjdGVkVHlwZWRBcnJheUNvbnN0cnVjdG9yLm5hbWV9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuY3B1RGF0YSA9IGFyZzAuZGF0YTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICd0ZXh0dXJlJzoge1xuICAgICAgICAgIGlmICh0eXBlICE9PSAnZmxvYXQzMicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYHVuc3VwcG9ydGVkIHR5cGUgXCIke3R5cGV9XCIgdG8gY3JlYXRlIHRlbnNvciBmcm9tIHRleHR1cmVgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5ncHVUZXh0dXJlRGF0YSA9IGFyZzAudGV4dHVyZTtcbiAgICAgICAgICB0aGlzLmRvd25sb2FkZXIgPSBhcmcwLmRvd25sb2FkO1xuICAgICAgICAgIHRoaXMuZGlzcG9zZXIgPSBhcmcwLmRpc3Bvc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnZ3B1LWJ1ZmZlcic6IHtcbiAgICAgICAgICBpZiAoKHR5cGUgIT09ICdmbG9hdDMyJyAmJiB0eXBlICE9PSAnZmxvYXQxNicgJiYgdHlwZSAhPT0gJ2ludDMyJyAmJiB0eXBlICE9PSAnaW50NjQnICYmIHR5cGUgIT09ICd1aW50MzInICYmXG4gICAgICAgICAgICAgICB0eXBlICE9PSAnYm9vbCcpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGB1bnN1cHBvcnRlZCB0eXBlIFwiJHt0eXBlfVwiIHRvIGNyZWF0ZSB0ZW5zb3IgZnJvbSBncHUgYnVmZmVyYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZ3B1QnVmZmVyRGF0YSA9IGFyZzAuZ3B1QnVmZmVyO1xuICAgICAgICAgIHRoaXMuZG93bmxvYWRlciA9IGFyZzAuZG93bmxvYWQ7XG4gICAgICAgICAgdGhpcy5kaXNwb3NlciA9IGFyZzAuZGlzcG9zZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGVuc29yIGNvbnN0cnVjdG9yOiB1bnN1cHBvcnRlZCBsb2NhdGlvbiAnJHt0aGlzLmRhdGFMb2NhdGlvbn0nYCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vXG4gICAgICAvLyBjb25zdHJ1Y3RpbmcgdGVuc29yIG9mIGxvY2F0aW9uICdjcHUnXG4gICAgICAvL1xuICAgICAgbGV0IGRhdGE6IFRlbnNvckRhdGFUeXBlO1xuICAgICAgbGV0IG1heWJlRGltczogdHlwZW9mIGFyZzF8dHlwZW9mIGFyZzI7XG4gICAgICAvLyBjaGVjayB3aGV0aGVyIGFyZzAgaXMgdHlwZSBvciBkYXRhXG4gICAgICBpZiAodHlwZW9mIGFyZzAgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIE92ZXJyaWRlOiBjb25zdHJ1Y3Rvcih0eXBlLCBkYXRhLCAuLi4pXG4gICAgICAgIC8vXG4gICAgICAgIHR5cGUgPSBhcmcwO1xuICAgICAgICBtYXliZURpbXMgPSBhcmcyO1xuICAgICAgICBpZiAoYXJnMCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBzdHJpbmcgdGVuc29yXG4gICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGFyZzEpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBIHN0cmluZyB0ZW5zb3JcXCdzIGRhdGEgbXVzdCBiZSBhIHN0cmluZyBhcnJheS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gd2UgZG9uJ3QgY2hlY2sgd2hldGhlciBldmVyeSBlbGVtZW50IGluIHRoZSBhcnJheSBpcyBzdHJpbmc7IHRoaXMgaXMgdG9vIHNsb3cuIHdlIGFzc3VtZSBpdCdzIGNvcnJlY3QgYW5kXG4gICAgICAgICAgLy8gZXJyb3Igd2lsbCBiZSBwb3B1bGF0ZWQgYXQgaW5mZXJlbmNlXG4gICAgICAgICAgZGF0YSA9IGFyZzE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbnVtZXJpYyB0ZW5zb3JcbiAgICAgICAgICBjb25zdCB0eXBlZEFycmF5Q29uc3RydWN0b3IgPSBOVU1FUklDX1RFTlNPUl9UWVBFX1RPX1RZUEVEQVJSQVlfTUFQLmdldChhcmcwKTtcbiAgICAgICAgICBpZiAodHlwZWRBcnJheUNvbnN0cnVjdG9yID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFVuc3VwcG9ydGVkIHRlbnNvciB0eXBlOiAke2FyZzB9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhcmcxKSkge1xuICAgICAgICAgICAgaWYgKGFyZzAgPT09ICdmbG9hdDE2Jykge1xuICAgICAgICAgICAgICAvLyBUaHJvdyBlcnJvciBoZXJlIGJlY2F1c2Ugd2hlbiB1c2VyIHRyeSB0byB1c2UgbnVtYmVyIGFycmF5IGFzIGRhdGEsXG4gICAgICAgICAgICAgIC8vIGUuZy4gbmV3IFRlbnNvcignZmxvYXQxNicsIFsxLCAyLCAzLCA0XSwgZGltcykpLCBpdCB3aWxsIGFjdHVhbGx5IGNhbGxcbiAgICAgICAgICAgICAgLy8gVWludDE2QXJyYXkuZnJvbShhcmcxKSB3aGljaCBnZW5lcmF0ZXMgd3JvbmcgZGF0YS5cbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgICAgICAgICdDcmVhdGluZyBhIGZsb2F0MTYgdGVuc29yIGZyb20gbnVtYmVyIGFycmF5IGlzIG5vdCBzdXBwb3J0ZWQuIFBsZWFzZSB1c2UgVWludDE2QXJyYXkgYXMgZGF0YS4nKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJnMCA9PT0gJ3VpbnQ2NCcgfHwgYXJnMCA9PT0gJ2ludDY0Jykge1xuICAgICAgICAgICAgICAvLyB1c2UgJ2FzIGFueScgaGVyZSBiZWNhdXNlOlxuICAgICAgICAgICAgICAvLyAxLiBUeXBlU2NyaXB0J3MgY2hlY2sgb24gdHlwZSBvZiAnQXJyYXkuaXNBcnJheSgpJyBkb2VzIG5vdCB3b3JrIHdpdGggcmVhZG9ubHkgYXJyYXlzLlxuICAgICAgICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzAwMlxuICAgICAgICAgICAgICAvLyAyLiBUeXBlU2NyaXB0J3MgY2hlY2sgb24gdW5pb24gdHlwZSBvZiAnKEJpZ0ludDY0QXJyYXlDb25zdHJ1Y3RvcnxCaWdVaW50NjRBcnJheUNvbnN0cnVjdG9yKS5mcm9tKCknXG4gICAgICAgICAgICAgIC8vIGRvZXMgbm90IGFjY2VwdCBwYXJhbWV0ZXIgbWFwRm4uXG4gICAgICAgICAgICAgIC8vIDMuIHBhcmFtZXRlcnMgb2YgJ1N1cHBvcnRlZFR5cGVkQXJyYXlDb25zdHJ1Y3RvcnMuZnJvbSgpJyBkb2VzIG5vdCBtYXRjaCB0aGUgcmVxdWlyZW1lbnQgb2YgdGhlIHVuaW9uXG4gICAgICAgICAgICAgIC8vIHR5cGUuXG5cbiAgICAgICAgICAgICAgLy8gYXNzdW1lICdhcmcxJyBpcyBvZiB0eXBlIFwicmVhZG9ubHkgbnVtYmVyW118cmVhZG9ubHkgYmlnaW50W11cIiBoZXJlLlxuXG4gICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgICAgIGRhdGEgPSAodHlwZWRBcnJheUNvbnN0cnVjdG9yIGFzIGFueSkuZnJvbShhcmcxLCBCaWdJbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gYXNzdW1lICdhcmcxJyBpcyBvZiB0eXBlIFwicmVhZG9ubHkgbnVtYmVyW11cIiBoZXJlLlxuICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAgICAgICBkYXRhID0gKHR5cGVkQXJyYXlDb25zdHJ1Y3RvciBhcyBhbnkpLmZyb20oYXJnMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChhcmcxIGluc3RhbmNlb2YgdHlwZWRBcnJheUNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICBkYXRhID0gYXJnMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgQSAke3R5cGV9IHRlbnNvcidzIGRhdGEgbXVzdCBiZSB0eXBlIG9mICR7dHlwZWRBcnJheUNvbnN0cnVjdG9yfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gT3ZlcnJpZGU6IGNvbnN0cnVjdG9yKGRhdGEsIC4uLilcbiAgICAgICAgLy9cbiAgICAgICAgbWF5YmVEaW1zID0gYXJnMTtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJnMCkpIHtcbiAgICAgICAgICAvLyBvbmx5IGJvb2xlYW5bXSBhbmQgc3RyaW5nW10gaXMgc3VwcG9ydGVkXG4gICAgICAgICAgaWYgKGFyZzAubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUZW5zb3IgdHlwZSBjYW5ub3QgYmUgaW5mZXJyZWQgZnJvbSBhbiBlbXB0eSBhcnJheS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZmlyc3RFbGVtZW50VHlwZSA9IHR5cGVvZiBhcmcwWzBdO1xuICAgICAgICAgIGlmIChmaXJzdEVsZW1lbnRUeXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdHlwZSA9ICdzdHJpbmcnO1xuICAgICAgICAgICAgZGF0YSA9IGFyZzA7XG4gICAgICAgICAgfSBlbHNlIGlmIChmaXJzdEVsZW1lbnRUeXBlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIHR5cGUgPSAnYm9vbCc7XG4gICAgICAgICAgICAvLyAnYXJnMCcgaXMgb2YgdHlwZSAnYm9vbGVhbltdJy4gVWludDhBcnJheS5mcm9tKGJvb2xlYW5bXSkgYWN0dWFsbHkgd29ya3MsIGJ1dCB0eXBlc2NyaXB0IHRoaW5rcyB0aGlzIGlzXG4gICAgICAgICAgICAvLyB3cm9uZyB0eXBlLiBXZSB1c2UgJ2FzIGFueScgdG8gbWFrZSBpdCBoYXBweS5cbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgICBkYXRhID0gVWludDhBcnJheS5mcm9tKGFyZzAgYXMgYW55W10pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIGVsZW1lbnQgdHlwZSBvZiBkYXRhIGFycmF5OiAke2ZpcnN0RWxlbWVudFR5cGV9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBnZXQgdGVuc29yIHR5cGUgZnJvbSBUeXBlZEFycmF5XG4gICAgICAgICAgY29uc3QgbWFwcGVkVHlwZSA9XG4gICAgICAgICAgICAgIE5VTUVSSUNfVEVOU09SX1RZUEVEQVJSQVlfVE9fVFlQRV9NQVAuZ2V0KGFyZzAuY29uc3RydWN0b3IgYXMgU3VwcG9ydGVkVHlwZWRBcnJheUNvbnN0cnVjdG9ycyk7XG4gICAgICAgICAgaWYgKG1hcHBlZFR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgVW5zdXBwb3J0ZWQgdHlwZSBmb3IgdGVuc29yIGRhdGE6ICR7YXJnMC5jb25zdHJ1Y3Rvcn0uYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHR5cGUgPSBtYXBwZWRUeXBlO1xuICAgICAgICAgIGRhdGEgPSBhcmcwIGFzIFN1cHBvcnRlZFR5cGVkQXJyYXk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gdHlwZSBhbmQgZGF0YSBpcyBwcm9jZXNzZWQsIG5vdyBwcm9jZXNzaW5nIGRpbXNcbiAgICAgIGlmIChtYXliZURpbXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBhc3N1bWUgMS1EIHRlbnNvciBpZiBkaW1zIG9taXR0ZWRcbiAgICAgICAgbWF5YmVEaW1zID0gW2RhdGEubGVuZ3RoXTtcbiAgICAgIH0gZWxzZSBpZiAoIUFycmF5LmlzQXJyYXkobWF5YmVEaW1zKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBIHRlbnNvclxcJ3MgZGltcyBtdXN0IGJlIGEgbnVtYmVyIGFycmF5Jyk7XG4gICAgICB9XG4gICAgICBkaW1zID0gbWF5YmVEaW1zIGFzIHJlYWRvbmx5IG51bWJlcltdO1xuXG4gICAgICB0aGlzLmNwdURhdGEgPSBkYXRhO1xuICAgICAgdGhpcy5kYXRhTG9jYXRpb24gPSAnY3B1JztcbiAgICB9XG5cbiAgICAvLyBwZXJmb3JtIGNoZWNrIG9uIGRpbXNcbiAgICBjb25zdCBzaXplID0gY2FsY3VsYXRlU2l6ZShkaW1zKTtcbiAgICAvLyBpZiBkYXRhIGlzIG9uIENQVSwgY2hlY2sgd2hldGhlciBkYXRhIGxlbmd0aCBtYXRjaGVzIHRlbnNvciBzaXplXG4gICAgaWYgKHRoaXMuY3B1RGF0YSAmJiBzaXplICE9PSB0aGlzLmNwdURhdGEubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRlbnNvcidzIHNpemUoJHtzaXplfSkgZG9lcyBub3QgbWF0Y2ggZGF0YSBsZW5ndGgoJHt0aGlzLmNwdURhdGEubGVuZ3RofSkuYCk7XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLmRpbXMgPSBkaW1zO1xuICAgIHRoaXMuc2l6ZSA9IHNpemU7XG4gIH1cbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNyZWdpb24gZmFjdG9yeVxuICBzdGF0aWMgYXN5bmMgZnJvbUltYWdlKFxuICAgICAgaW1hZ2U6IEltYWdlRGF0YXxIVE1MSW1hZ2VFbGVtZW50fEltYWdlQml0bWFwfHN0cmluZyxcbiAgICAgIG9wdGlvbnM/OiBUZW5zb3JGcm9tSW1hZ2VEYXRhT3B0aW9uc3xUZW5zb3JGcm9tSW1hZ2VFbGVtZW50T3B0aW9uc3xUZW5zb3JGcm9tSW1hZ2VCaXRtYXBPcHRpb25zfFxuICAgICAgVGVuc29yRnJvbVVybE9wdGlvbnMpOiBQcm9taXNlPFRlbnNvckludGVyZmFjZT4ge1xuICAgIHJldHVybiB0ZW5zb3JGcm9tSW1hZ2UoaW1hZ2UsIG9wdGlvbnMpO1xuICB9XG5cbiAgc3RhdGljIGZyb21UZXh0dXJlPFQgZXh0ZW5kcyBUZW5zb3JJbnRlcmZhY2UuVGV4dHVyZURhdGFUeXBlcz4oXG4gICAgICB0ZXh0dXJlOiBUZW5zb3JUZXh0dXJlVHlwZSwgb3B0aW9uczogVGVuc29yRnJvbVRleHR1cmVPcHRpb25zPFQ+KTogVGVuc29ySW50ZXJmYWNlIHtcbiAgICByZXR1cm4gdGVuc29yRnJvbVRleHR1cmUodGV4dHVyZSwgb3B0aW9ucyk7XG4gIH1cblxuICBzdGF0aWMgZnJvbUdwdUJ1ZmZlcjxUIGV4dGVuZHMgVGVuc29ySW50ZXJmYWNlLkdwdUJ1ZmZlckRhdGFUeXBlcz4oXG4gICAgICBncHVCdWZmZXI6IFRlbnNvckdwdUJ1ZmZlclR5cGUsIG9wdGlvbnM6IFRlbnNvckZyb21HcHVCdWZmZXJPcHRpb25zPFQ+KTogVGVuc29ySW50ZXJmYWNlIHtcbiAgICByZXR1cm4gdGVuc29yRnJvbUdwdUJ1ZmZlcihncHVCdWZmZXIsIG9wdGlvbnMpO1xuICB9XG5cbiAgc3RhdGljIGZyb21QaW5uZWRCdWZmZXI8VCBleHRlbmRzIFRlbnNvckludGVyZmFjZS5DcHVQaW5uZWREYXRhVHlwZXM+KFxuICAgICAgdHlwZTogVCwgYnVmZmVyOiBUZW5zb3JJbnRlcmZhY2UuRGF0YVR5cGVNYXBbVF0sIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFRlbnNvciB7XG4gICAgcmV0dXJuIHRlbnNvckZyb21QaW5uZWRCdWZmZXIodHlwZSwgYnVmZmVyLCBkaW1zKTtcbiAgfVxuXG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIGNvbnZlcnNpb25zXG4gIHRvRGF0YVVSTChvcHRpb25zPzogVGVuc29yVG9EYXRhVXJsT3B0aW9ucyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRlbnNvclRvRGF0YVVSTCh0aGlzLCBvcHRpb25zKTtcbiAgfVxuXG4gIHRvSW1hZ2VEYXRhKG9wdGlvbnM/OiBUZW5zb3JUb0ltYWdlRGF0YU9wdGlvbnMpOiBJbWFnZURhdGEge1xuICAgIHJldHVybiB0ZW5zb3JUb0ltYWdlRGF0YSh0aGlzLCBvcHRpb25zKTtcbiAgfVxuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiBwdWJsaWMgZmllbGRzXG4gIHJlYWRvbmx5IGRpbXM6IHJlYWRvbmx5IG51bWJlcltdO1xuICByZWFkb25seSB0eXBlOiBUZW5zb3JUeXBlO1xuICByZWFkb25seSBzaXplOiBudW1iZXI7XG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIHByaXZhdGUgZmllbGRzXG5cbiAgLyoqXG4gICAqIHN0b3JlcyB0aGUgbG9jYXRpb24gb2YgdGhlIGRhdGEuXG4gICAqL1xuICBwcml2YXRlIGRhdGFMb2NhdGlvbjogVGVuc29yRGF0YUxvY2F0aW9uO1xuXG4gIC8qKlxuICAgKiBzdG9yZXMgdGhlIGRhdGEgb24gQ1BVLCBpZiBsb2NhdGlvbiBpcyAnY3B1JyBvciAnY3B1LXBpbm5lZCcuIG90aGVyd2lzZSBlbXB0eS5cbiAgICovXG4gIHByaXZhdGUgY3B1RGF0YT86IFRlbnNvckRhdGFUeXBlO1xuXG4gIC8qKlxuICAgKiBzdG9yZXMgdGhlIHVuZGVybHlpbmcgdGV4dHVyZSB3aGVuIGxvY2F0aW9uIGlzICd0ZXh0dXJlJy4gb3RoZXJ3aXNlIGVtcHR5LlxuICAgKi9cbiAgcHJpdmF0ZSBncHVUZXh0dXJlRGF0YT86IFRlbnNvclRleHR1cmVUeXBlO1xuXG4gIC8qKlxuICAgKiBzdG9yZXMgdGhlIHVuZGVybHlpbmcgR1BVIGJ1ZmZlciB3aGVuIGxvY2F0aW9uIGlzICdncHUtYnVmZmVyJy4gb3RoZXJ3aXNlIGVtcHR5LlxuICAgKi9cbiAgcHJpdmF0ZSBncHVCdWZmZXJEYXRhPzogVGVuc29yR3B1QnVmZmVyVHlwZTtcblxuICAvKipcbiAgICogc3RvcmVzIGFuIG9wdGlvbmFsIGRvd25sb2FkZXIgZnVuY3Rpb24gdG8gZG93bmxvYWQgZGF0YSBmcm9tIEdQVSB0byBDUFUuXG4gICAqL1xuICBwcml2YXRlIGRvd25sb2FkZXI/KCk6IFByb21pc2U8VGVuc29yRGF0YVR5cGU+O1xuXG4gIC8qKlxuICAgKiBhIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBkYXRhIGlzIGJlaW5nIGRvd25sb2FkZWQgZnJvbSBHUFUgdG8gQ1BVLlxuICAgKi9cbiAgcHJpdmF0ZSBpc0Rvd25sb2FkaW5nPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogc3RvcmVzIGFuIG9wdGlvbmFsIGRpc3Bvc2VyIGZ1bmN0aW9uIHRvIGRpc3Bvc2UgdGhlIHVuZGVybHlpbmcgZGF0YS5cbiAgICovXG4gIHByaXZhdGUgZGlzcG9zZXI/KCk6IHZvaWQ7XG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIHByb3BlcnRpZXNcbiAgZ2V0IGRhdGEoKTogVGVuc29yRGF0YVR5cGUge1xuICAgIHRoaXMuZW5zdXJlVmFsaWQoKTtcbiAgICBpZiAoIXRoaXMuY3B1RGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdUaGUgZGF0YSBpcyBub3Qgb24gQ1BVLiBVc2UgYGdldERhdGEoKWAgdG8gZG93bmxvYWQgR1BVIGRhdGEgdG8gQ1BVLCAnICtcbiAgICAgICAgICAnb3IgdXNlIGB0ZXh0dXJlYCBvciBgZ3B1QnVmZmVyYCBwcm9wZXJ0eSB0byBhY2Nlc3MgdGhlIEdQVSBkYXRhIGRpcmVjdGx5LicpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jcHVEYXRhO1xuICB9XG5cbiAgZ2V0IGxvY2F0aW9uKCk6IFRlbnNvckRhdGFMb2NhdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YUxvY2F0aW9uO1xuICB9XG5cbiAgZ2V0IHRleHR1cmUoKTogVGVuc29yVGV4dHVyZVR5cGUge1xuICAgIHRoaXMuZW5zdXJlVmFsaWQoKTtcbiAgICBpZiAoIXRoaXMuZ3B1VGV4dHVyZURhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGRhdGEgaXMgbm90IHN0b3JlZCBhcyBhIFdlYkdMIHRleHR1cmUuJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdwdVRleHR1cmVEYXRhO1xuICB9XG5cbiAgZ2V0IGdwdUJ1ZmZlcigpOiBUZW5zb3JHcHVCdWZmZXJUeXBlIHtcbiAgICB0aGlzLmVuc3VyZVZhbGlkKCk7XG4gICAgaWYgKCF0aGlzLmdwdUJ1ZmZlckRhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGRhdGEgaXMgbm90IHN0b3JlZCBhcyBhIFdlYkdQVSBidWZmZXIuJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdwdUJ1ZmZlckRhdGE7XG4gIH1cbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNyZWdpb24gbWV0aG9kc1xuXG4gIGFzeW5jIGdldERhdGEocmVsZWFzZURhdGE/OiBib29sZWFuKTogUHJvbWlzZTxUZW5zb3JEYXRhVHlwZT4ge1xuICAgIHRoaXMuZW5zdXJlVmFsaWQoKTtcbiAgICBzd2l0Y2ggKHRoaXMuZGF0YUxvY2F0aW9uKSB7XG4gICAgICBjYXNlICdjcHUnOlxuICAgICAgY2FzZSAnY3B1LXBpbm5lZCc6XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGE7XG4gICAgICBjYXNlICd0ZXh0dXJlJzpcbiAgICAgIGNhc2UgJ2dwdS1idWZmZXInOiB7XG4gICAgICAgIGlmICghdGhpcy5kb3dubG9hZGVyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgY3VycmVudCB0ZW5zb3IgaXMgbm90IGNyZWF0ZWQgd2l0aCBhIHNwZWNpZmllZCBkYXRhIGRvd25sb2FkZXIuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNEb3dubG9hZGluZykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGN1cnJlbnQgdGVuc29yIGlzIGJlaW5nIGRvd25sb2FkZWQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmlzRG93bmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmRvd25sb2FkZXIoKTtcbiAgICAgICAgICB0aGlzLmRvd25sb2FkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgdGhpcy5kYXRhTG9jYXRpb24gPSAnY3B1JztcbiAgICAgICAgICB0aGlzLmNwdURhdGEgPSBkYXRhO1xuXG4gICAgICAgICAgaWYgKHJlbGVhc2VEYXRhICYmIHRoaXMuZGlzcG9zZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcG9zZXIoKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcG9zZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGRhdGE7XG5cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0aGlzLmlzRG93bmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBjYW5ub3QgZ2V0IGRhdGEgZnJvbSBsb2NhdGlvbjogJHt0aGlzLmRhdGFMb2NhdGlvbn1gKTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmlzRG93bmxvYWRpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGN1cnJlbnQgdGVuc29yIGlzIGJlaW5nIGRvd25sb2FkZWQuJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZGlzcG9zZXIpIHtcbiAgICAgIHRoaXMuZGlzcG9zZXIoKTtcbiAgICAgIHRoaXMuZGlzcG9zZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRoaXMuY3B1RGF0YSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmdwdVRleHR1cmVEYXRhID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZ3B1QnVmZmVyRGF0YSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmRvd25sb2FkZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5pc0Rvd25sb2FkaW5nID0gdW5kZWZpbmVkO1xuXG4gICAgdGhpcy5kYXRhTG9jYXRpb24gPSAnbm9uZSc7XG4gIH1cblxuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiB0ZW5zb3IgdXRpbGl0aWVzXG4gIHByaXZhdGUgZW5zdXJlVmFsaWQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZGF0YUxvY2F0aW9uID09PSAnbm9uZScpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHRlbnNvciBpcyBkaXNwb3NlZC4nKTtcbiAgICB9XG4gIH1cblxuICByZXNoYXBlKGRpbXM6IHJlYWRvbmx5IG51bWJlcltdKTogVGVuc29ySW50ZXJmYWNlIHtcbiAgICB0aGlzLmVuc3VyZVZhbGlkKCk7XG4gICAgaWYgKHRoaXMuZG93bmxvYWRlciB8fCB0aGlzLmRpc3Bvc2VyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCByZXNoYXBlIGEgdGVuc29yIHRoYXQgb3ducyBHUFUgcmVzb3VyY2UuJyk7XG4gICAgfVxuICAgIHJldHVybiB0ZW5zb3JSZXNoYXBlKHRoaXMsIGRpbXMpO1xuICB9XG4gIC8vICNlbmRyZWdpb25cbn1cbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtUZW5zb3JGYWN0b3J5fSBmcm9tICcuL3RlbnNvci1mYWN0b3J5LmpzJztcbmltcG9ydCB7VGVuc29yIGFzIFRlbnNvckltcGx9IGZyb20gJy4vdGVuc29yLWltcGwuanMnO1xuaW1wb3J0IHtUeXBlZFRlbnNvclV0aWxzfSBmcm9tICcuL3RlbnNvci11dGlscy5qcyc7XG5cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZWRlY2xhcmUgKi9cblxuLyoqXG4gKiByZXByZXNlbnQgYSBiYXNpYyB0ZW5zb3Igd2l0aCBzcGVjaWZpZWQgZGltZW5zaW9ucyBhbmQgZGF0YSB0eXBlLlxuICovXG5pbnRlcmZhY2UgVHlwZWRUZW5zb3JCYXNlPFQgZXh0ZW5kcyBUZW5zb3IuVHlwZT4ge1xuICAvKipcbiAgICogR2V0IHRoZSBkaW1lbnNpb25zIG9mIHRoZSB0ZW5zb3IuXG4gICAqL1xuICByZWFkb25seSBkaW1zOiByZWFkb25seSBudW1iZXJbXTtcbiAgLyoqXG4gICAqIEdldCB0aGUgZGF0YSB0eXBlIG9mIHRoZSB0ZW5zb3IuXG4gICAqL1xuICByZWFkb25seSB0eXBlOiBUO1xuICAvKipcbiAgICogR2V0IHRoZSBidWZmZXIgZGF0YSBvZiB0aGUgdGVuc29yLlxuICAgKlxuICAgKiBJZiB0aGUgZGF0YSBpcyBub3Qgb24gQ1BVIChlZy4gaXQncyBpbiB0aGUgZm9ybSBvZiBXZWJHTCB0ZXh0dXJlIG9yIFdlYkdQVSBidWZmZXIpLCB0aHJvdyBlcnJvci5cbiAgICovXG4gIHJlYWRvbmx5IGRhdGE6IFRlbnNvci5EYXRhVHlwZU1hcFtUXTtcbiAgLyoqXG4gICAqIEdldCB0aGUgbG9jYXRpb24gb2YgdGhlIGRhdGEuXG4gICAqL1xuICByZWFkb25seSBsb2NhdGlvbjogVGVuc29yLkRhdGFMb2NhdGlvbjtcbiAgLyoqXG4gICAqIEdldCB0aGUgV2ViR0wgdGV4dHVyZSB0aGF0IGhvbGRzIHRoZSB0ZW5zb3IgZGF0YS5cbiAgICpcbiAgICogSWYgdGhlIGRhdGEgaXMgbm90IG9uIEdQVSBhcyBXZWJHTCB0ZXh0dXJlLCB0aHJvdyBlcnJvci5cbiAgICovXG4gIHJlYWRvbmx5IHRleHR1cmU6IFRlbnNvci5UZXh0dXJlVHlwZTtcbiAgLyoqXG4gICAqIEdldCB0aGUgV2ViR1BVIGJ1ZmZlciB0aGF0IGhvbGRzIHRoZSB0ZW5zb3IgZGF0YS5cbiAgICpcbiAgICogSWYgdGhlIGRhdGEgaXMgbm90IG9uIEdQVSBhcyBXZWJHUFUgYnVmZmVyLCB0aHJvdyBlcnJvci5cbiAgICovXG4gIHJlYWRvbmx5IGdwdUJ1ZmZlcjogVGVuc29yLkdwdUJ1ZmZlclR5cGU7XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgYnVmZmVyIGRhdGEgb2YgdGhlIHRlbnNvci5cbiAgICpcbiAgICogSWYgdGhlIGRhdGEgaXMgb24gQ1BVLCByZXR1cm5zIHRoZSBkYXRhIGltbWVkaWF0ZWx5LlxuICAgKiBJZiB0aGUgZGF0YSBpcyBvbiBHUFUsIGRvd25sb2FkcyB0aGUgZGF0YSBhbmQgcmV0dXJucyB0aGUgcHJvbWlzZS5cbiAgICpcbiAgICogQHBhcmFtIHJlbGVhc2VEYXRhIC0gd2hldGhlciByZWxlYXNlIHRoZSBkYXRhIG9uIEdQVS4gSWdub3JlIGlmIGRhdGEgaXMgYWxyZWFkeSBvbiBDUFUuXG4gICAqL1xuICBnZXREYXRhKHJlbGVhc2VEYXRhPzogYm9vbGVhbik6IFByb21pc2U8VGVuc29yLkRhdGFUeXBlTWFwW1RdPjtcblxuICAvKipcbiAgICogRGlzcG9zZSB0aGUgdGVuc29yIGRhdGEuXG4gICAqXG4gICAqIElmIHRoZSBkYXRhIGlzIG9uIENQVSwgcmVtb3ZlIGl0cyBpbnRlcm5hbCByZWZlcmVuY2UgdG8gdGhlIHVuZGVybHlpbmcgZGF0YS5cbiAgICogSWYgdGhlIGRhdGEgaXMgb24gR1BVLCByZWxlYXNlIHRoZSBkYXRhIG9uIEdQVS5cbiAgICpcbiAgICogQWZ0ZXIgY2FsbGluZyB0aGlzIGZ1bmN0aW9uLCB0aGUgdGVuc29yIGlzIGNvbnNpZGVyZWQgbm8gbG9uZ2VyIHZhbGlkLiBJdHMgbG9jYXRpb24gd2lsbCBiZSBzZXQgdG8gJ25vbmUnLlxuICAgKi9cbiAgZGlzcG9zZSgpOiB2b2lkO1xufVxuXG5leHBvcnQgZGVjbGFyZSBuYW1lc3BhY2UgVGVuc29yIHtcbiAgaW50ZXJmYWNlIERhdGFUeXBlTWFwIHtcbiAgICBmbG9hdDMyOiBGbG9hdDMyQXJyYXk7XG4gICAgdWludDg6IFVpbnQ4QXJyYXk7XG4gICAgaW50ODogSW50OEFycmF5O1xuICAgIHVpbnQxNjogVWludDE2QXJyYXk7XG4gICAgaW50MTY6IEludDE2QXJyYXk7XG4gICAgaW50MzI6IEludDMyQXJyYXk7XG4gICAgaW50NjQ6IEJpZ0ludDY0QXJyYXk7XG4gICAgc3RyaW5nOiBzdHJpbmdbXTtcbiAgICBib29sOiBVaW50OEFycmF5O1xuICAgIGZsb2F0MTY6IFVpbnQxNkFycmF5OyAgLy8gS2VlcCB1c2luZyBVaW50MTZBcnJheSB1bnRpbCB3ZSBoYXZlIGEgY29uY3JldGUgc29sdXRpb24gZm9yIGZsb2F0IDE2LlxuICAgIGZsb2F0NjQ6IEZsb2F0NjRBcnJheTtcbiAgICB1aW50MzI6IFVpbnQzMkFycmF5O1xuICAgIHVpbnQ2NDogQmlnVWludDY0QXJyYXk7XG4gICAgLy8gY29tcGxleDY0OiBuZXZlcjtcbiAgICAvLyBjb21wbGV4MTI4OiBuZXZlcjtcbiAgICAvLyBiZmxvYXQxNjogbmV2ZXI7XG4gIH1cblxuICBpbnRlcmZhY2UgRWxlbWVudFR5cGVNYXAge1xuICAgIGZsb2F0MzI6IG51bWJlcjtcbiAgICB1aW50ODogbnVtYmVyO1xuICAgIGludDg6IG51bWJlcjtcbiAgICB1aW50MTY6IG51bWJlcjtcbiAgICBpbnQxNjogbnVtYmVyO1xuICAgIGludDMyOiBudW1iZXI7XG4gICAgaW50NjQ6IGJpZ2ludDtcbiAgICBzdHJpbmc6IHN0cmluZztcbiAgICBib29sOiBib29sZWFuO1xuICAgIGZsb2F0MTY6IG51bWJlcjsgIC8vIEtlZXAgdXNpbmcgVWludDE2QXJyYXkgdW50aWwgd2UgaGF2ZSBhIGNvbmNyZXRlIHNvbHV0aW9uIGZvciBmbG9hdCAxNi5cbiAgICBmbG9hdDY0OiBudW1iZXI7XG4gICAgdWludDMyOiBudW1iZXI7XG4gICAgdWludDY0OiBiaWdpbnQ7XG4gICAgLy8gY29tcGxleDY0OiBuZXZlcjtcbiAgICAvLyBjb21wbGV4MTI4OiBuZXZlcjtcbiAgICAvLyBiZmxvYXQxNjogbmV2ZXI7XG4gIH1cblxuICB0eXBlIERhdGFUeXBlID0gRGF0YVR5cGVNYXBbVHlwZV07XG4gIHR5cGUgRWxlbWVudFR5cGUgPSBFbGVtZW50VHlwZU1hcFtUeXBlXTtcblxuICAvKipcbiAgICogc3VwcG9ydGVkIGRhdGEgdHlwZXMgZm9yIGNvbnN0cnVjdGluZyBhIHRlbnNvciBmcm9tIGEgcGlubmVkIENQVSBidWZmZXJcbiAgICovXG4gIGV4cG9ydCB0eXBlIENwdVBpbm5lZERhdGFUeXBlcyA9IEV4Y2x1ZGU8VGVuc29yLlR5cGUsICdzdHJpbmcnPjtcblxuICAvKipcbiAgICogdHlwZSBhbGlhcyBmb3IgV2ViR0wgdGV4dHVyZVxuICAgKi9cbiAgZXhwb3J0IHR5cGUgVGV4dHVyZVR5cGUgPSBXZWJHTFRleHR1cmU7XG5cbiAgLyoqXG4gICAqIHN1cHBvcnRlZCBkYXRhIHR5cGVzIGZvciBjb25zdHJ1Y3RpbmcgYSB0ZW5zb3IgZnJvbSBhIFdlYkdMIHRleHR1cmVcbiAgICovXG4gIGV4cG9ydCB0eXBlIFRleHR1cmVEYXRhVHlwZXMgPSAnZmxvYXQzMic7XG5cbiAgLyoqXG4gICAqIHR5cGUgYWxpYXMgZm9yIFdlYkdQVSBidWZmZXJcbiAgICpcbiAgICogVGhlIHJlYXNvbiB3aHkgd2UgZG9uJ3QgdXNlIHR5cGUgXCJHUFVCdWZmZXJcIiBkZWZpbmVkIGluIHdlYmdwdS5kLnRzIGZyb20gQHdlYmdwdS90eXBlcyBpcyBiZWNhdXNlIFwiQHdlYmdwdS90eXBlc1wiXG4gICAqIHJlcXVpcmVzIFwiQHR5cGVzL2RvbS13ZWJjb2RlY3NcIiBhcyBwZWVyIGRlcGVuZGVuY3kgd2hlbiB1c2luZyBUeXBlU2NyaXB0IDwgdjUuMSBhbmQgaXRzIHZlcnNpb24gbmVlZCB0byBiZSBjaG9zZW5cbiAgICogY2FyZWZ1bGx5IGFjY29yZGluZyB0byB0aGUgVHlwZVNjcmlwdCB2ZXJzaW9uIGJlaW5nIHVzZWQuIFRoaXMgbWVhbnMgc28gZmFyIHRoZXJlIGlzIG5vdCBhIHdheSB0byBrZWVwIGV2ZXJ5XG4gICAqIFR5cGVTY3JpcHQgdmVyc2lvbiBoYXBweS4gSXQgdHVybnMgb3V0IHRoYXQgd2Ugd2lsbCBlYXNpbHkgYnJva2UgdXNlcnMgb24gc29tZSBUeXBlU2NyaXB0IHZlcnNpb24uXG4gICAqXG4gICAqIGZvciBtb3JlIGluZm8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ncHV3ZWIvdHlwZXMvaXNzdWVzLzEyN1xuICAgKi9cbiAgZXhwb3J0IHR5cGUgR3B1QnVmZmVyVHlwZSA9IHtzaXplOiBudW1iZXI7IG1hcFN0YXRlOiAndW5tYXBwZWQnIHwgJ3BlbmRpbmcnIHwgJ21hcHBlZCd9O1xuXG4gIC8qKlxuICAgKiBzdXBwb3J0ZWQgZGF0YSB0eXBlcyBmb3IgY29uc3RydWN0aW5nIGEgdGVuc29yIGZyb20gYSBXZWJHUFUgYnVmZmVyXG4gICAqL1xuICBleHBvcnQgdHlwZSBHcHVCdWZmZXJEYXRhVHlwZXMgPSAnZmxvYXQzMid8J2Zsb2F0MTYnfCdpbnQzMid8J2ludDY0J3wndWludDMyJ3wnYm9vbCc7XG5cbiAgLyoqXG4gICAqIHJlcHJlc2VudCB3aGVyZSB0aGUgdGVuc29yIGRhdGEgaXMgc3RvcmVkXG4gICAqL1xuICBleHBvcnQgdHlwZSBEYXRhTG9jYXRpb24gPSAnbm9uZSd8J2NwdSd8J2NwdS1waW5uZWQnfCd0ZXh0dXJlJ3wnZ3B1LWJ1ZmZlcic7XG5cbiAgLyoqXG4gICAqIHJlcHJlc2VudCB0aGUgZGF0YSB0eXBlIG9mIGEgdGVuc29yXG4gICAqL1xuICBleHBvcnQgdHlwZSBUeXBlID0ga2V5b2YgRGF0YVR5cGVNYXA7XG59XG5cbi8qKlxuICogUmVwcmVzZW50IG11bHRpLWRpbWVuc2lvbmFsIGFycmF5cyB0byBmZWVkIHRvIG9yIGZldGNoIGZyb20gbW9kZWwgaW5mZXJlbmNpbmcuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHlwZWRUZW5zb3I8VCBleHRlbmRzIFRlbnNvci5UeXBlPiBleHRlbmRzIFR5cGVkVGVuc29yQmFzZTxUPiwgVHlwZWRUZW5zb3JVdGlsczxUPiB7fVxuLyoqXG4gKiBSZXByZXNlbnQgbXVsdGktZGltZW5zaW9uYWwgYXJyYXlzIHRvIGZlZWQgdG8gb3IgZmV0Y2ggZnJvbSBtb2RlbCBpbmZlcmVuY2luZy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUZW5zb3IgZXh0ZW5kcyBUeXBlZFRlbnNvckJhc2U8VGVuc29yLlR5cGU+LCBUeXBlZFRlbnNvclV0aWxzPFRlbnNvci5UeXBlPiB7fVxuXG4vKipcbiAqIHR5cGUgVGVuc29yQ29uc3RydWN0b3IgZGVmaW5lcyB0aGUgY29uc3RydWN0b3JzIG9mICdUZW5zb3InIHRvIGNyZWF0ZSBDUFUgdGVuc29yIGluc3RhbmNlcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUZW5zb3JDb25zdHJ1Y3RvciB7XG4gIC8vICNyZWdpb24gQ1BVIHRlbnNvciAtIHNwZWNpZnkgZWxlbWVudCB0eXBlXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgc3RyaW5nIHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gdHlwZSwgZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIHR5cGUgLSBTcGVjaWZ5IHRoZSBlbGVtZW50IHR5cGUuXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyh0eXBlOiAnc3RyaW5nJywgZGF0YTogVGVuc29yLkRhdGFUeXBlTWFwWydzdHJpbmcnXXxyZWFkb25seSBzdHJpbmdbXSxcbiAgICAgIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCdzdHJpbmcnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGJvb2wgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiB0eXBlLCBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gdHlwZSAtIFNwZWNpZnkgdGhlIGVsZW1lbnQgdHlwZS5cbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3KHR5cGU6ICdib29sJywgZGF0YTogVGVuc29yLkRhdGFUeXBlTWFwWydib29sJ118cmVhZG9ubHkgYm9vbGVhbltdLCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwnYm9vbCc+O1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgNjQtYml0IGludGVnZXIgdHlwZWQgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiB0eXBlLCBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gdHlwZSAtIFNwZWNpZnkgdGhlIGVsZW1lbnQgdHlwZS5cbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3PFQgZXh0ZW5kcyAndWludDY0J3wnaW50NjQnPihcbiAgICAgIHR5cGU6IFQsIGRhdGE6IFRlbnNvci5EYXRhVHlwZU1hcFtUXXxyZWFkb25seSBiaWdpbnRbXXxyZWFkb25seSBudW1iZXJbXSxcbiAgICAgIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPFQ+O1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgbnVtZXJpYyB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIHR5cGUsIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSB0eXBlIC0gU3BlY2lmeSB0aGUgZWxlbWVudCB0eXBlLlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXc8VCBleHRlbmRzIEV4Y2x1ZGU8VGVuc29yLlR5cGUsICdzdHJpbmcnfCdib29sJ3wndWludDY0J3wnaW50NjQnPj4oXG4gICAgICB0eXBlOiBULCBkYXRhOiBUZW5zb3IuRGF0YVR5cGVNYXBbVF18cmVhZG9ubHkgbnVtYmVyW10sIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPFQ+O1xuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiBDUFUgdGVuc29yIC0gaW5mZXIgZWxlbWVudCB0eXBlc1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgZmxvYXQzMiB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyhkYXRhOiBGbG9hdDMyQXJyYXksIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCdmbG9hdDMyJz47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBpbnQ4IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3KGRhdGE6IEludDhBcnJheSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J2ludDgnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHVpbnQ4IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3KGRhdGE6IFVpbnQ4QXJyYXksIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCd1aW50OCc+O1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgdWludDE2IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3KGRhdGE6IFVpbnQxNkFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwndWludDE2Jz47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBpbnQxNiB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyhkYXRhOiBJbnQxNkFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwnaW50MTYnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGludDMyIHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3KGRhdGE6IEludDMyQXJyYXksIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCdpbnQzMic+O1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgaW50NjQgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcoZGF0YTogQmlnSW50NjRBcnJheSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J2ludDY0Jz47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBzdHJpbmcgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcoZGF0YTogcmVhZG9ubHkgc3RyaW5nW10sIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCdzdHJpbmcnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGJvb2wgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcoZGF0YTogcmVhZG9ubHkgYm9vbGVhbltdLCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwnYm9vbCc+O1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgZmxvYXQ2NCB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyhkYXRhOiBGbG9hdDY0QXJyYXksIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCdmbG9hdDY0Jz47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyB1aW50MzIgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcoZGF0YTogVWludDMyQXJyYXksIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCd1aW50MzInPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHVpbnQ2NCB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyhkYXRhOiBCaWdVaW50NjRBcnJheSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J3VpbnQ2NCc+O1xuXG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIENQVSB0ZW5zb3IgLSBmYWxsIGJhY2sgdG8gbm9uLWdlbmVyaWMgdGVuc29yIHR5cGUgZGVjbGFyYXRpb25cblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gdHlwZSwgZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIHR5cGUgLSBTcGVjaWZ5IHRoZSBlbGVtZW50IHR5cGUuXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyh0eXBlOiBUZW5zb3IuVHlwZSwgZGF0YTogVGVuc29yLkRhdGFUeXBlfHJlYWRvbmx5IG51bWJlcltdfHJlYWRvbmx5IHN0cmluZ1tdfHJlYWRvbmx5IGJpZ2ludFtdfHJlYWRvbmx5IGJvb2xlYW5bXSxcbiAgICAgIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFRlbnNvcjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3KGRhdGE6IFRlbnNvci5EYXRhVHlwZSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVGVuc29yO1xuICAvLyAjZW5kcmVnaW9uXG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbmV4cG9ydCBjb25zdCBUZW5zb3IgPSBUZW5zb3JJbXBsIGFzIChUZW5zb3JDb25zdHJ1Y3RvciAmIFRlbnNvckZhY3RvcnkpO1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge2Vudn0gZnJvbSAnLi9lbnYtaW1wbC5qcyc7XG5cbmV4cG9ydCBjb25zdCBUUkFDRSA9IChkZXZpY2VUeXBlOiBzdHJpbmcsIGxhYmVsOiBzdHJpbmcpID0+IHtcbiAgaWYgKCFlbnYud2FzbS50cmFjZSkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICBjb25zb2xlLnRpbWVTdGFtcChgJHtkZXZpY2VUeXBlfTo6T1JUOjoke2xhYmVsfWApO1xufTtcblxuY29uc3QgVFJBQ0VfRlVOQyA9IChtc2c6IHN0cmluZywgZXh0cmFNc2c/OiBzdHJpbmcpID0+IHtcbiAgY29uc3Qgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjaz8uc3BsaXQoL1xcclxcbnxcXHJ8XFxuL2cpIHx8IFtdO1xuICBsZXQgaGFzVHJhY2VGdW5jID0gZmFsc2U7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RhY2subGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoaGFzVHJhY2VGdW5jICYmICFzdGFja1tpXS5pbmNsdWRlcygnVFJBQ0VfRlVOQycpKSB7XG4gICAgICBsZXQgbGFiZWwgPSBgRlVOQ18ke21zZ306OiR7c3RhY2tbaV0udHJpbSgpLnNwbGl0KCcgJylbMV19YDtcbiAgICAgIGlmIChleHRyYU1zZykge1xuICAgICAgICBsYWJlbCArPSBgOjoke2V4dHJhTXNnfWA7XG4gICAgICB9XG4gICAgICBUUkFDRSgnQ1BVJywgbGFiZWwpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc3RhY2tbaV0uaW5jbHVkZXMoJ1RSQUNFX0ZVTkMnKSkge1xuICAgICAgaGFzVHJhY2VGdW5jID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBUUkFDRV9GVU5DX0JFR0lOID0gKGV4dHJhTXNnPzogc3RyaW5nKSA9PiB7XG4gIGlmICghZW52Lndhc20udHJhY2UpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgVFJBQ0VfRlVOQygnQkVHSU4nLCBleHRyYU1zZyk7XG59O1xuXG5leHBvcnQgY29uc3QgVFJBQ0VfRlVOQ19FTkQgPSAoZXh0cmFNc2c/OiBzdHJpbmcpID0+IHtcbiAgaWYgKCFlbnYud2FzbS50cmFjZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBUUkFDRV9GVU5DKCdFTkQnLCBleHRyYU1zZyk7XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge3Jlc29sdmVCYWNrZW5kfSBmcm9tICcuL2JhY2tlbmQtaW1wbC5qcyc7XG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb25IYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQuanMnO1xuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9uIGFzIEluZmVyZW5jZVNlc3Npb25JbnRlcmZhY2V9IGZyb20gJy4vaW5mZXJlbmNlLXNlc3Npb24uanMnO1xuaW1wb3J0IHtPbm54VmFsdWV9IGZyb20gJy4vb25ueC12YWx1ZS5qcyc7XG5pbXBvcnQge1RlbnNvcn0gZnJvbSAnLi90ZW5zb3IuanMnO1xuaW1wb3J0IHtUUkFDRV9GVU5DX0JFR0lOLCBUUkFDRV9GVU5DX0VORH0gZnJvbSAnLi90cmFjZS5qcyc7XG5cbnR5cGUgU2Vzc2lvbk9wdGlvbnMgPSBJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlLlNlc3Npb25PcHRpb25zO1xudHlwZSBSdW5PcHRpb25zID0gSW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZS5SdW5PcHRpb25zO1xudHlwZSBGZWVkc1R5cGUgPSBJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlLkZlZWRzVHlwZTtcbnR5cGUgRmV0Y2hlc1R5cGUgPSBJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlLkZldGNoZXNUeXBlO1xudHlwZSBSZXR1cm5UeXBlID0gSW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZS5SZXR1cm5UeXBlO1xuXG5leHBvcnQgY2xhc3MgSW5mZXJlbmNlU2Vzc2lvbiBpbXBsZW1lbnRzIEluZmVyZW5jZVNlc3Npb25JbnRlcmZhY2Uge1xuICBwcml2YXRlIGNvbnN0cnVjdG9yKGhhbmRsZXI6IEluZmVyZW5jZVNlc3Npb25IYW5kbGVyKSB7XG4gICAgdGhpcy5oYW5kbGVyID0gaGFuZGxlcjtcbiAgfVxuICBydW4oZmVlZHM6IEZlZWRzVHlwZSwgb3B0aW9ucz86IFJ1bk9wdGlvbnMpOiBQcm9taXNlPFJldHVyblR5cGU+O1xuICBydW4oZmVlZHM6IEZlZWRzVHlwZSwgZmV0Y2hlczogRmV0Y2hlc1R5cGUsIG9wdGlvbnM/OiBSdW5PcHRpb25zKTogUHJvbWlzZTxSZXR1cm5UeXBlPjtcbiAgYXN5bmMgcnVuKGZlZWRzOiBGZWVkc1R5cGUsIGFyZzE/OiBGZXRjaGVzVHlwZXxSdW5PcHRpb25zLCBhcmcyPzogUnVuT3B0aW9ucyk6IFByb21pc2U8UmV0dXJuVHlwZT4ge1xuICAgIFRSQUNFX0ZVTkNfQkVHSU4oKTtcbiAgICBjb25zdCBmZXRjaGVzOiB7W25hbWU6IHN0cmluZ106IE9ubnhWYWx1ZXxudWxsfSA9IHt9O1xuICAgIGxldCBvcHRpb25zOiBSdW5PcHRpb25zID0ge307XG4gICAgLy8gY2hlY2sgaW5wdXRzXG4gICAgaWYgKHR5cGVvZiBmZWVkcyAhPT0gJ29iamVjdCcgfHwgZmVlZHMgPT09IG51bGwgfHwgZmVlZHMgaW5zdGFuY2VvZiBUZW5zb3IgfHwgQXJyYXkuaXNBcnJheShmZWVkcykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgJ1xcJ2ZlZWRzXFwnIG11c3QgYmUgYW4gb2JqZWN0IHRoYXQgdXNlIGlucHV0IG5hbWVzIGFzIGtleXMgYW5kIE9ubnhWYWx1ZSBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy4nKTtcbiAgICB9XG5cbiAgICBsZXQgaXNGZXRjaGVzRW1wdHkgPSB0cnVlO1xuICAgIC8vIGRldGVybWluZSB3aGljaCBvdmVycmlkZSBpcyBiZWluZyB1c2VkXG4gICAgaWYgKHR5cGVvZiBhcmcxID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKGFyZzEgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5leHBlY3RlZCBhcmd1bWVudFsxXTogY2Fubm90IGJlIG51bGwuJyk7XG4gICAgICB9XG4gICAgICBpZiAoYXJnMSBpbnN0YW5jZW9mIFRlbnNvcikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcXCdmZXRjaGVzXFwnIGNhbm5vdCBiZSBhIFRlbnNvcicpO1xuICAgICAgfVxuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShhcmcxKSkge1xuICAgICAgICBpZiAoYXJnMS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcXCdmZXRjaGVzXFwnIGNhbm5vdCBiZSBhbiBlbXB0eSBhcnJheS4nKTtcbiAgICAgICAgfVxuICAgICAgICBpc0ZldGNoZXNFbXB0eSA9IGZhbHNlO1xuICAgICAgICAvLyBvdXRwdXQgbmFtZXNcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIGFyZzEpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcXCdmZXRjaGVzXFwnIG11c3QgYmUgYSBzdHJpbmcgYXJyYXkgb3IgYW4gb2JqZWN0LicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5vdXRwdXROYW1lcy5pbmRleE9mKG5hbWUpID09PSAtMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYCdmZXRjaGVzJyBjb250YWlucyBpbnZhbGlkIG91dHB1dCBuYW1lOiAke25hbWV9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmZXRjaGVzW25hbWVdID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgYXJnMiA9PT0gJ29iamVjdCcgJiYgYXJnMiAhPT0gbnVsbCkge1xuICAgICAgICAgIG9wdGlvbnMgPSBhcmcyO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1xcJ29wdGlvbnNcXCcgbXVzdCBiZSBhbiBvYmplY3QuJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGRlY2lkZSB3aGV0aGVyIGFyZzEgaXMgZmV0Y2hlcyBvciBvcHRpb25zXG4gICAgICAgIC8vIGlmIGFueSBvdXRwdXQgbmFtZSBpcyBwcmVzZW50IGFuZCBpdHMgdmFsdWUgaXMgdmFsaWQgT25ueFZhbHVlLCB3ZSBjb25zaWRlciBpdCBmZXRjaGVzXG4gICAgICAgIGxldCBpc0ZldGNoZXMgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgYXJnMUtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhhcmcxKTtcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMub3V0cHV0TmFtZXMpIHtcbiAgICAgICAgICBpZiAoYXJnMUtleXMuaW5kZXhPZihuYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IHYgPSAoYXJnMSBhcyBJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlLk51bGxhYmxlT25ueFZhbHVlTWFwVHlwZSlbbmFtZV07XG4gICAgICAgICAgICBpZiAodiA9PT0gbnVsbCB8fCB2IGluc3RhbmNlb2YgVGVuc29yKSB7XG4gICAgICAgICAgICAgIGlzRmV0Y2hlcyA9IHRydWU7XG4gICAgICAgICAgICAgIGlzRmV0Y2hlc0VtcHR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgIGZldGNoZXNbbmFtZV0gPSB2O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0ZldGNoZXMpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIGFyZzIgPT09ICdvYmplY3QnICYmIGFyZzIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBhcmcyO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcXCdvcHRpb25zXFwnIG11c3QgYmUgYW4gb2JqZWN0LicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvcHRpb25zID0gYXJnMSBhcyBSdW5PcHRpb25zO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYXJnMSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VuZXhwZWN0ZWQgYXJndW1lbnRbMV06IG11c3QgYmUgXFwnZmV0Y2hlc1xcJyBvciBcXCdvcHRpb25zXFwnLicpO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGlmIGFsbCBpbnB1dHMgYXJlIGluIGZlZWRcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy5pbnB1dE5hbWVzKSB7XG4gICAgICBpZiAodHlwZW9mIGZlZWRzW25hbWVdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGlucHV0ICcke25hbWV9JyBpcyBtaXNzaW5nIGluICdmZWVkcycuYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaWYgbm8gZmV0Y2hlcyBpcyBzcGVjaWZpZWQsIHdlIHVzZSB0aGUgZnVsbCBvdXRwdXQgbmFtZXMgbGlzdFxuICAgIGlmIChpc0ZldGNoZXNFbXB0eSkge1xuICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMub3V0cHV0TmFtZXMpIHtcbiAgICAgICAgZmV0Y2hlc1tuYW1lXSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gZmVlZHMsIGZldGNoZXMgYW5kIG9wdGlvbnMgYXJlIHByZXBhcmVkXG5cbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5oYW5kbGVyLnJ1bihmZWVkcywgZmV0Y2hlcywgb3B0aW9ucyk7XG4gICAgY29uc3QgcmV0dXJuVmFsdWU6IHtbbmFtZTogc3RyaW5nXTogT25ueFZhbHVlfSA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IGluIHJlc3VsdHMpIHtcbiAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChyZXN1bHRzLCBrZXkpKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc3VsdHNba2V5XTtcbiAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFRlbnNvcikge1xuICAgICAgICAgIHJldHVyblZhbHVlW2tleV0gPSByZXN1bHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuVmFsdWVba2V5XSA9IG5ldyBUZW5zb3IocmVzdWx0LnR5cGUsIHJlc3VsdC5kYXRhLCByZXN1bHQuZGltcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgVFJBQ0VfRlVOQ19FTkQoKTtcbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gIH1cblxuICBhc3luYyByZWxlYXNlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmhhbmRsZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZShwYXRoOiBzdHJpbmcsIG9wdGlvbnM/OiBTZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZT47XG4gIHN0YXRpYyBjcmVhdGUoYnVmZmVyOiBBcnJheUJ1ZmZlckxpa2UsIG9wdGlvbnM/OiBTZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZT47XG4gIHN0YXRpYyBjcmVhdGUoYnVmZmVyOiBBcnJheUJ1ZmZlckxpa2UsIGJ5dGVPZmZzZXQ6IG51bWJlciwgYnl0ZUxlbmd0aD86IG51bWJlciwgb3B0aW9ucz86IFNlc3Npb25PcHRpb25zKTpcbiAgICAgIFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZT47XG4gIHN0YXRpYyBjcmVhdGUoYnVmZmVyOiBVaW50OEFycmF5LCBvcHRpb25zPzogU2Vzc2lvbk9wdGlvbnMpOiBQcm9taXNlPEluZmVyZW5jZVNlc3Npb25JbnRlcmZhY2U+O1xuICBzdGF0aWMgYXN5bmMgY3JlYXRlKFxuICAgICAgYXJnMDogc3RyaW5nfEFycmF5QnVmZmVyTGlrZXxVaW50OEFycmF5LCBhcmcxPzogU2Vzc2lvbk9wdGlvbnN8bnVtYmVyLCBhcmcyPzogbnVtYmVyLFxuICAgICAgYXJnMz86IFNlc3Npb25PcHRpb25zKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlPiB7XG4gICAgVFJBQ0VfRlVOQ19CRUdJTigpO1xuICAgIC8vIGVpdGhlciBsb2FkIGZyb20gYSBmaWxlIG9yIGJ1ZmZlclxuICAgIGxldCBmaWxlUGF0aE9yVWludDhBcnJheTogc3RyaW5nfFVpbnQ4QXJyYXk7XG4gICAgbGV0IG9wdGlvbnM6IFNlc3Npb25PcHRpb25zID0ge307XG5cbiAgICBpZiAodHlwZW9mIGFyZzAgPT09ICdzdHJpbmcnKSB7XG4gICAgICBmaWxlUGF0aE9yVWludDhBcnJheSA9IGFyZzA7XG4gICAgICBpZiAodHlwZW9mIGFyZzEgPT09ICdvYmplY3QnICYmIGFyZzEgIT09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IGFyZzE7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcxICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcXCdvcHRpb25zXFwnIG11c3QgYmUgYW4gb2JqZWN0LicpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoYXJnMCBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAgIGZpbGVQYXRoT3JVaW50OEFycmF5ID0gYXJnMDtcbiAgICAgIGlmICh0eXBlb2YgYXJnMSA9PT0gJ29iamVjdCcgJiYgYXJnMSAhPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0gYXJnMTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzEgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1xcJ29wdGlvbnNcXCcgbXVzdCBiZSBhbiBvYmplY3QuJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgYXJnMCBpbnN0YW5jZW9mIEFycmF5QnVmZmVyIHx8XG4gICAgICAgICh0eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIGFyZzAgaW5zdGFuY2VvZiBTaGFyZWRBcnJheUJ1ZmZlcikpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGFyZzA7XG4gICAgICBsZXQgYnl0ZU9mZnNldCA9IDA7XG4gICAgICBsZXQgYnl0ZUxlbmd0aCA9IGFyZzAuYnl0ZUxlbmd0aDtcbiAgICAgIGlmICh0eXBlb2YgYXJnMSA9PT0gJ29iamVjdCcgJiYgYXJnMSAhPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0gYXJnMTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzEgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGJ5dGVPZmZzZXQgPSBhcmcxO1xuICAgICAgICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKGJ5dGVPZmZzZXQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ2J5dGVPZmZzZXRcXCcgbXVzdCBiZSBhbiBpbnRlZ2VyLicpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChieXRlT2Zmc2V0IDwgMCB8fCBieXRlT2Zmc2V0ID49IGJ1ZmZlci5ieXRlTGVuZ3RoKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYCdieXRlT2Zmc2V0JyBpcyBvdXQgb2YgcmFuZ2UgWzAsICR7YnVmZmVyLmJ5dGVMZW5ndGh9KS5gKTtcbiAgICAgICAgfVxuICAgICAgICBieXRlTGVuZ3RoID0gYXJnMC5ieXRlTGVuZ3RoIC0gYnl0ZU9mZnNldDtcbiAgICAgICAgaWYgKHR5cGVvZiBhcmcyID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGJ5dGVMZW5ndGggPSBhcmcyO1xuICAgICAgICAgIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIoYnl0ZUxlbmd0aCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdieXRlTGVuZ3RoXFwnIG11c3QgYmUgYW4gaW50ZWdlci4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGJ5dGVMZW5ndGggPD0gMCB8fCBieXRlT2Zmc2V0ICsgYnl0ZUxlbmd0aCA+IGJ1ZmZlci5ieXRlTGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgJ2J5dGVMZW5ndGgnIGlzIG91dCBvZiByYW5nZSAoMCwgJHtidWZmZXIuYnl0ZUxlbmd0aCAtIGJ5dGVPZmZzZXR9XS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiBhcmczID09PSAnb2JqZWN0JyAmJiBhcmczICE9PSBudWxsKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gYXJnMztcbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmczICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXFwnb3B0aW9uc1xcJyBtdXN0IGJlIGFuIG9iamVjdC4nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXFwnYnl0ZUxlbmd0aFxcJyBtdXN0IGJlIGEgbnVtYmVyLicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcxICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcXCdvcHRpb25zXFwnIG11c3QgYmUgYW4gb2JqZWN0LicpO1xuICAgICAgfVxuICAgICAgZmlsZVBhdGhPclVpbnQ4QXJyYXkgPSBuZXcgVWludDhBcnJheShidWZmZXIsIGJ5dGVPZmZzZXQsIGJ5dGVMZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmV4cGVjdGVkIGFyZ3VtZW50WzBdOiBtdXN0IGJlIFxcJ3BhdGhcXCcgb3IgXFwnYnVmZmVyXFwnLicpO1xuICAgIH1cblxuICAgIC8vIGdldCBiYWNrZW5kIGhpbnRzXG4gICAgY29uc3QgZXBzID0gb3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMgfHwgW107XG4gICAgY29uc3QgYmFja2VuZEhpbnRzID0gZXBzLm1hcChpID0+IHR5cGVvZiBpID09PSAnc3RyaW5nJyA/IGkgOiBpLm5hbWUpO1xuICAgIGNvbnN0IGJhY2tlbmQgPSBhd2FpdCByZXNvbHZlQmFja2VuZChiYWNrZW5kSGludHMpO1xuICAgIGNvbnN0IGhhbmRsZXIgPSBhd2FpdCBiYWNrZW5kLmNyZWF0ZUluZmVyZW5jZVNlc3Npb25IYW5kbGVyKGZpbGVQYXRoT3JVaW50OEFycmF5LCBvcHRpb25zKTtcbiAgICBUUkFDRV9GVU5DX0VORCgpO1xuICAgIHJldHVybiBuZXcgSW5mZXJlbmNlU2Vzc2lvbihoYW5kbGVyKTtcbiAgfVxuXG4gIHN0YXJ0UHJvZmlsaW5nKCk6IHZvaWQge1xuICAgIHRoaXMuaGFuZGxlci5zdGFydFByb2ZpbGluZygpO1xuICB9XG4gIGVuZFByb2ZpbGluZygpOiB2b2lkIHtcbiAgICB0aGlzLmhhbmRsZXIuZW5kUHJvZmlsaW5nKCk7XG4gIH1cblxuICBnZXQgaW5wdXROYW1lcygpOiByZWFkb25seSBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlci5pbnB1dE5hbWVzO1xuICB9XG4gIGdldCBvdXRwdXROYW1lcygpOiByZWFkb25seSBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlci5vdXRwdXROYW1lcztcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlcjogSW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXI7XG59XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7SW5mZXJlbmNlU2Vzc2lvbiBhcyBJbmZlcmVuY2VTZXNzaW9uSW1wbH0gZnJvbSAnLi9pbmZlcmVuY2Utc2Vzc2lvbi1pbXBsLmpzJztcbmltcG9ydCB7T25ueE1vZGVsT3B0aW9uc30gZnJvbSAnLi9vbm54LW1vZGVsLmpzJztcbmltcG9ydCB7T25ueFZhbHVlLCBPbm54VmFsdWVEYXRhTG9jYXRpb259IGZyb20gJy4vb25ueC12YWx1ZS5qcyc7XG5cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZWRlY2xhcmUgKi9cblxuZXhwb3J0IGRlY2xhcmUgbmFtZXNwYWNlIEluZmVyZW5jZVNlc3Npb24ge1xuICAvLyAjcmVnaW9uIGlucHV0L291dHB1dCB0eXBlc1xuXG4gIHR5cGUgT25ueFZhbHVlTWFwVHlwZSA9IHtyZWFkb25seSBbbmFtZTogc3RyaW5nXTogT25ueFZhbHVlfTtcbiAgdHlwZSBOdWxsYWJsZU9ubnhWYWx1ZU1hcFR5cGUgPSB7cmVhZG9ubHkgW25hbWU6IHN0cmluZ106IE9ubnhWYWx1ZSB8IG51bGx9O1xuXG4gIC8qKlxuICAgKiBBIGZlZWRzIChtb2RlbCBpbnB1dHMpIGlzIGFuIG9iamVjdCB0aGF0IHVzZXMgaW5wdXQgbmFtZXMgYXMga2V5cyBhbmQgT25ueFZhbHVlIGFzIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICAgKi9cbiAgdHlwZSBGZWVkc1R5cGUgPSBPbm54VmFsdWVNYXBUeXBlO1xuXG4gIC8qKlxuICAgKiBBIGZldGNoZXMgKG1vZGVsIG91dHB1dHMpIGNvdWxkIGJlIG9uZSBvZiB0aGUgZm9sbG93aW5nOlxuICAgKlxuICAgKiAtIE9taXR0ZWQuIFVzZSBtb2RlbCdzIG91dHB1dCBuYW1lcyBkZWZpbml0aW9uLlxuICAgKiAtIEFuIGFycmF5IG9mIHN0cmluZyBpbmRpY2F0aW5nIHRoZSBvdXRwdXQgbmFtZXMuXG4gICAqIC0gQW4gb2JqZWN0IHRoYXQgdXNlIG91dHB1dCBuYW1lcyBhcyBrZXlzIGFuZCBPbm54VmFsdWUgb3IgbnVsbCBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgICpcbiAgICogQHJlbWFya1xuICAgKiBkaWZmZXJlbnQgZnJvbSBpbnB1dCBhcmd1bWVudCwgaW4gb3V0cHV0LCBPbm54VmFsdWUgaXMgb3B0aW9uYWwuIElmIGFuIE9ubnhWYWx1ZSBpcyBwcmVzZW50IGl0IHdpbGwgYmVcbiAgICogdXNlZCBhcyBhIHByZS1hbGxvY2F0ZWQgdmFsdWUgYnkgdGhlIGluZmVyZW5jZSBlbmdpbmU7IGlmIG9taXR0ZWQsIGluZmVyZW5jZSBlbmdpbmUgd2lsbCBhbGxvY2F0ZSBidWZmZXJcbiAgICogaW50ZXJuYWxseS5cbiAgICovXG4gIHR5cGUgRmV0Y2hlc1R5cGUgPSByZWFkb25seSBzdHJpbmdbXXxOdWxsYWJsZU9ubnhWYWx1ZU1hcFR5cGU7XG5cbiAgLyoqXG4gICAqIEEgaW5mZXJlbmNpbmcgcmV0dXJuIHR5cGUgaXMgYW4gb2JqZWN0IHRoYXQgdXNlcyBvdXRwdXQgbmFtZXMgYXMga2V5cyBhbmQgT25ueFZhbHVlIGFzIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICAgKi9cbiAgdHlwZSBSZXR1cm5UeXBlID0gT25ueFZhbHVlTWFwVHlwZTtcblxuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiBzZXNzaW9uIG9wdGlvbnNcblxuICAvKipcbiAgICogQSBzZXQgb2YgY29uZmlndXJhdGlvbnMgZm9yIHNlc3Npb24gYmVoYXZpb3IuXG4gICAqL1xuICBleHBvcnQgaW50ZXJmYWNlIFNlc3Npb25PcHRpb25zIGV4dGVuZHMgT25ueE1vZGVsT3B0aW9ucyB7XG4gICAgLyoqXG4gICAgICogQW4gYXJyYXkgb2YgZXhlY3V0aW9uIHByb3ZpZGVyIG9wdGlvbnMuXG4gICAgICpcbiAgICAgKiBBbiBleGVjdXRpb24gcHJvdmlkZXIgb3B0aW9uIGNhbiBiZSBhIHN0cmluZyBpbmRpY2F0aW5nIHRoZSBuYW1lIG9mIHRoZSBleGVjdXRpb24gcHJvdmlkZXIsXG4gICAgICogb3IgYW4gb2JqZWN0IG9mIGNvcnJlc3BvbmRpbmcgdHlwZS5cbiAgICAgKi9cbiAgICBleGVjdXRpb25Qcm92aWRlcnM/OiByZWFkb25seSBFeGVjdXRpb25Qcm92aWRlckNvbmZpZ1tdO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGludHJhIE9QIHRocmVhZHMgbnVtYmVyLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSkuXG4gICAgICovXG4gICAgaW50cmFPcE51bVRocmVhZHM/OiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgaW50ZXIgT1AgdGhyZWFkcyBudW1iZXIuXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlKS5cbiAgICAgKi9cbiAgICBpbnRlck9wTnVtVGhyZWFkcz86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZS5cbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpIG9yIFdlYkFzc2VtYmx5IGJhY2tlbmRcbiAgICAgKi9cbiAgICBmcmVlRGltZW5zaW9uT3ZlcnJpZGVzPzoge3JlYWRvbmx5IFtkaW1lbnNpb25OYW1lOiBzdHJpbmddOiBudW1iZXJ9O1xuXG4gICAgLyoqXG4gICAgICogVGhlIG9wdGltaXphdGlvbiBsZXZlbC5cbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpIG9yIFdlYkFzc2VtYmx5IGJhY2tlbmRcbiAgICAgKi9cbiAgICBncmFwaE9wdGltaXphdGlvbkxldmVsPzogJ2Rpc2FibGVkJ3wnYmFzaWMnfCdleHRlbmRlZCd8J2FsbCc7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGVuYWJsZSBDUFUgbWVtb3J5IGFyZW5hLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSkgb3IgV2ViQXNzZW1ibHkgYmFja2VuZFxuICAgICAqL1xuICAgIGVuYWJsZUNwdU1lbUFyZW5hPzogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgZW5hYmxlIG1lbW9yeSBwYXR0ZXJuLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSkgb3IgV2ViQXNzZW1ibHkgYmFja2VuZFxuICAgICAqL1xuICAgIGVuYWJsZU1lbVBhdHRlcm4/OiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogRXhlY3V0aW9uIG1vZGUuXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlKSBvciBXZWJBc3NlbWJseSBiYWNrZW5kXG4gICAgICovXG4gICAgZXhlY3V0aW9uTW9kZT86ICdzZXF1ZW50aWFsJ3wncGFyYWxsZWwnO1xuXG4gICAgLyoqXG4gICAgICogT3B0aW1pemVkIG1vZGVsIGZpbGUgcGF0aC5cbiAgICAgKlxuICAgICAqIElmIHRoaXMgc2V0dGluZyBpcyBzcGVjaWZpZWQsIHRoZSBvcHRpbWl6ZWQgbW9kZWwgd2lsbCBiZSBkdW1wZWQuIEluIGJyb3dzZXIsIGEgYmxvYiB3aWxsIGJlIGNyZWF0ZWRcbiAgICAgKiB3aXRoIGEgcG9wLXVwIHdpbmRvdy5cbiAgICAgKi9cbiAgICBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogV2V0aGVyIGVuYWJsZSBwcm9maWxpbmcuXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYSBwbGFjZWhvbGRlciBmb3IgYSBmdXR1cmUgdXNlLlxuICAgICAqL1xuICAgIGVuYWJsZVByb2ZpbGluZz86IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBGaWxlIHByZWZpeCBmb3IgcHJvZmlsaW5nLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGEgcGxhY2Vob2xkZXIgZm9yIGEgZnV0dXJlIHVzZS5cbiAgICAgKi9cbiAgICBwcm9maWxlRmlsZVByZWZpeD86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIExvZyBJRC5cbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpIG9yIFdlYkFzc2VtYmx5IGJhY2tlbmRcbiAgICAgKi9cbiAgICBsb2dJZD86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIExvZyBzZXZlcml0eSBsZXZlbC4gU2VlXG4gICAgICogaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9vbm54cnVudGltZS9ibG9iL21haW4vaW5jbHVkZS9vbm54cnVudGltZS9jb3JlL2NvbW1vbi9sb2dnaW5nL3NldmVyaXR5LmhcbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpIG9yIFdlYkFzc2VtYmx5IGJhY2tlbmRcbiAgICAgKi9cbiAgICBsb2dTZXZlcml0eUxldmVsPzogMHwxfDJ8M3w0O1xuXG4gICAgLyoqXG4gICAgICogTG9nIHZlcmJvc2l0eSBsZXZlbC5cbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBXZWJBc3NlbWJseSBiYWNrZW5kLiBXaWxsIHN1cHBvcnQgTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUgbGF0ZXJcbiAgICAgKi9cbiAgICBsb2dWZXJib3NpdHlMZXZlbD86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFNwZWNpZnkgc3RyaW5nIGFzIGEgcHJlZmVycmVkIGRhdGEgbG9jYXRpb24gZm9yIGFsbCBvdXRwdXRzLCBvciBhbiBvYmplY3QgdGhhdCB1c2Ugb3V0cHV0IG5hbWVzIGFzIGtleXMgYW5kIGFcbiAgICAgKiBwcmVmZXJyZWQgZGF0YSBsb2NhdGlvbiBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSBXZWIgZm9yIFdlYkdMIGFuZCBXZWJHUFUgRVAuXG4gICAgICovXG4gICAgcHJlZmVycmVkT3V0cHV0TG9jYXRpb24/OiBPbm54VmFsdWVEYXRhTG9jYXRpb258e3JlYWRvbmx5IFtvdXRwdXROYW1lOiBzdHJpbmddOiBPbm54VmFsdWVEYXRhTG9jYXRpb259O1xuXG4gICAgLyoqXG4gICAgICogU3RvcmUgY29uZmlndXJhdGlvbnMgZm9yIGEgc2Vzc2lvbi4gU2VlXG4gICAgICogaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9vbm54cnVudGltZS9ibG9iL21haW4vaW5jbHVkZS9vbm54cnVudGltZS9jb3JlL3Nlc3Npb24vXG4gICAgICogb25ueHJ1bnRpbWVfc2Vzc2lvbl9vcHRpb25zX2NvbmZpZ19rZXlzLmhcbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBXZWJBc3NlbWJseSBiYWNrZW5kLiBXaWxsIHN1cHBvcnQgTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUgbGF0ZXJcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiBleHRyYToge1xuICAgICAqICAgc2Vzc2lvbjoge1xuICAgICAqICAgICBzZXRfZGVub3JtYWxfYXNfemVybzogXCIxXCIsXG4gICAgICogICAgIGRpc2FibGVfcHJlcGFja2luZzogXCIxXCJcbiAgICAgKiAgIH0sXG4gICAgICogICBvcHRpbWl6YXRpb246IHtcbiAgICAgKiAgICAgZW5hYmxlX2dlbHVfYXBwcm94aW1hdGlvbjogXCIxXCJcbiAgICAgKiAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICovXG4gICAgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgfVxuXG4gIC8vICNyZWdpb24gZXhlY3V0aW9uIHByb3ZpZGVyc1xuXG4gIC8vIEN1cnJlbnRseSwgd2UgaGF2ZSB0aGUgZm9sbG93aW5nIGJhY2tlbmRzIHRvIHN1cHBvcnQgZXhlY3V0aW9uIHByb3ZpZGVyczpcbiAgLy8gQmFja2VuZCBOb2RlLmpzIGJpbmRpbmc6IHN1cHBvcnRzICdjcHUnIGFuZCAnY3VkYScuXG4gIC8vIEJhY2tlbmQgV2ViQXNzZW1ibHk6IHN1cHBvcnRzICdjcHUnLCAnd2FzbScsICd3ZWJncHUnIGFuZCAnd2Vibm4nLlxuICAvLyBCYWNrZW5kIE9OTlguanM6IHN1cHBvcnRzICd3ZWJnbCcuXG4gIC8vIEJhY2tlbmQgUmVhY3QgTmF0aXZlOiBzdXBwb3J0cyAnY3B1JywgJ3hubnBhY2snLCAnY29yZW1sJyAoaU9TKSwgJ25uYXBpJyAoQW5kcm9pZCkuXG4gIGludGVyZmFjZSBFeGVjdXRpb25Qcm92aWRlck9wdGlvbk1hcCB7XG4gICAgY3B1OiBDcHVFeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICBjb3JlbWw6IENvcmVNbEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgIGN1ZGE6IEN1ZGFFeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICBkbWw6IERtbEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgIHRlbnNvcnJ0OiBUZW5zb3JSdEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgIHdhc206IFdlYkFzc2VtYmx5RXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgd2ViZ2w6IFdlYkdMRXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgeG5ucGFjazogWG5ucGFja0V4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgIHdlYmdwdTogV2ViR3B1RXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgd2Vibm46IFdlYk5ORXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgbm5hcGk6IE5uYXBpRXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gIH1cblxuICB0eXBlIEV4ZWN1dGlvblByb3ZpZGVyTmFtZSA9IGtleW9mIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uTWFwO1xuICB0eXBlIEV4ZWN1dGlvblByb3ZpZGVyQ29uZmlnID1cbiAgICAgIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uTWFwW0V4ZWN1dGlvblByb3ZpZGVyTmFtZV18RXhlY3V0aW9uUHJvdmlkZXJPcHRpb258RXhlY3V0aW9uUHJvdmlkZXJOYW1lfHN0cmluZztcblxuICBleHBvcnQgaW50ZXJmYWNlIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcbiAgICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIH1cbiAgZXhwb3J0IGludGVyZmFjZSBDcHVFeGVjdXRpb25Qcm92aWRlck9wdGlvbiBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcbiAgICByZWFkb25seSBuYW1lOiAnY3B1JztcbiAgICB1c2VBcmVuYT86IGJvb2xlYW47XG4gIH1cbiAgZXhwb3J0IGludGVyZmFjZSBDdWRhRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gZXh0ZW5kcyBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XG4gICAgcmVhZG9ubHkgbmFtZTogJ2N1ZGEnO1xuICAgIGRldmljZUlkPzogbnVtYmVyO1xuICB9XG4gIGV4cG9ydCBpbnRlcmZhY2UgQ29yZU1sRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gZXh0ZW5kcyBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XG4gICAgcmVhZG9ubHkgbmFtZTogJ2NvcmVtbCc7XG4gICAgY29yZU1sRmxhZ3M/OiBudW1iZXI7XG4gIH1cbiAgZXhwb3J0IGludGVyZmFjZSBEbWxFeGVjdXRpb25Qcm92aWRlck9wdGlvbiBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcbiAgICByZWFkb25seSBuYW1lOiAnZG1sJztcbiAgICBkZXZpY2VJZD86IG51bWJlcjtcbiAgfVxuICBleHBvcnQgaW50ZXJmYWNlIFRlbnNvclJ0RXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gZXh0ZW5kcyBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XG4gICAgcmVhZG9ubHkgbmFtZTogJ3RlbnNvcnJ0JztcbiAgICBkZXZpY2VJZD86IG51bWJlcjtcbiAgfVxuICBleHBvcnQgaW50ZXJmYWNlIFdlYkFzc2VtYmx5RXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gZXh0ZW5kcyBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XG4gICAgcmVhZG9ubHkgbmFtZTogJ3dhc20nO1xuICB9XG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViR0xFeGVjdXRpb25Qcm92aWRlck9wdGlvbiBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcbiAgICByZWFkb25seSBuYW1lOiAnd2ViZ2wnO1xuICAgIC8vIFRPRE86IGFkZCBmbGFnc1xuICB9XG4gIGV4cG9ydCBpbnRlcmZhY2UgWG5ucGFja0V4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xuICAgIHJlYWRvbmx5IG5hbWU6ICd4bm5wYWNrJztcbiAgfVxuICBleHBvcnQgaW50ZXJmYWNlIFdlYkdwdUV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xuICAgIHJlYWRvbmx5IG5hbWU6ICd3ZWJncHUnO1xuICAgIHByZWZlcnJlZExheW91dD86ICdOQ0hXJ3wnTkhXQyc7XG4gIH1cbiAgZXhwb3J0IGludGVyZmFjZSBXZWJOTkV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xuICAgIHJlYWRvbmx5IG5hbWU6ICd3ZWJubic7XG4gICAgZGV2aWNlVHlwZT86ICdjcHUnfCdncHUnO1xuICAgIG51bVRocmVhZHM/OiBudW1iZXI7XG4gICAgcG93ZXJQcmVmZXJlbmNlPzogJ2RlZmF1bHQnfCdsb3ctcG93ZXInfCdoaWdoLXBlcmZvcm1hbmNlJztcbiAgfVxuICBleHBvcnQgaW50ZXJmYWNlIENvcmVNTEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xuICAgIHJlYWRvbmx5IG5hbWU6ICdjb3JlbWwnO1xuICAgIHVzZUNQVU9ubHk/OiBib29sZWFuO1xuICAgIGVuYWJsZU9uU3ViZ3JhcGg/OiBib29sZWFuO1xuICAgIG9ubHlFbmFibGVEZXZpY2VXaXRoQU5FPzogYm9vbGVhbjtcbiAgfVxuICBleHBvcnQgaW50ZXJmYWNlIE5uYXBpRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gZXh0ZW5kcyBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XG4gICAgcmVhZG9ubHkgbmFtZTogJ25uYXBpJztcbiAgICB1c2VGUDE2PzogYm9vbGVhbjtcbiAgICB1c2VOQ0hXPzogYm9vbGVhbjtcbiAgICBjcHVEaXNhYmxlZD86IGJvb2xlYW47XG4gICAgY3B1T25seT86IGJvb2xlYW47XG4gIH1cbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIHJ1biBvcHRpb25zXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGNvbmZpZ3VyYXRpb25zIGZvciBpbmZlcmVuY2UgcnVuIGJlaGF2aW9yXG4gICAqL1xuICBleHBvcnQgaW50ZXJmYWNlIFJ1bk9wdGlvbnMge1xuICAgIC8qKlxuICAgICAqIExvZyBzZXZlcml0eSBsZXZlbC4gU2VlXG4gICAgICogaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9vbm54cnVudGltZS9ibG9iL21haW4vaW5jbHVkZS9vbm54cnVudGltZS9jb3JlL2NvbW1vbi9sb2dnaW5nL3NldmVyaXR5LmhcbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpIG9yIFdlYkFzc2VtYmx5IGJhY2tlbmRcbiAgICAgKi9cbiAgICBsb2dTZXZlcml0eUxldmVsPzogMHwxfDJ8M3w0O1xuXG4gICAgLyoqXG4gICAgICogTG9nIHZlcmJvc2l0eSBsZXZlbC5cbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBXZWJBc3NlbWJseSBiYWNrZW5kLiBXaWxsIHN1cHBvcnQgTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUgbGF0ZXJcbiAgICAgKi9cbiAgICBsb2dWZXJib3NpdHlMZXZlbD86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFRlcm1pbmF0ZSBhbGwgaW5jb21wbGV0ZSBPcnRSdW4gY2FsbHMgYXMgc29vbiBhcyBwb3NzaWJsZSBpZiB0cnVlXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gV2ViQXNzZW1ibHkgYmFja2VuZC4gV2lsbCBzdXBwb3J0IE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlIGxhdGVyXG4gICAgICovXG4gICAgdGVybWluYXRlPzogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIEEgdGFnIGZvciB0aGUgUnVuKCkgY2FsbHMgdXNpbmcgdGhpc1xuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSkgb3IgV2ViQXNzZW1ibHkgYmFja2VuZFxuICAgICAqL1xuICAgIHRhZz86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFNldCBhIHNpbmdsZSBydW4gY29uZmlndXJhdGlvbiBlbnRyeS4gU2VlXG4gICAgICogaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9vbm54cnVudGltZS9ibG9iL21haW4vaW5jbHVkZS9vbm54cnVudGltZS9jb3JlL3Nlc3Npb24vXG4gICAgICogb25ueHJ1bnRpbWVfcnVuX29wdGlvbnNfY29uZmlnX2tleXMuaFxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIFdlYkFzc2VtYmx5IGJhY2tlbmQuIFdpbGwgc3VwcG9ydCBOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSBsYXRlclxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIGBgYGpzXG4gICAgICogZXh0cmE6IHtcbiAgICAgKiAgIG1lbW9yeToge1xuICAgICAqICAgICBlbmFibGVfbWVtb3J5X2FyZW5hX3Nocmlua2FnZTogXCIxXCIsXG4gICAgICogICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqL1xuICAgIGV4dHJhPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIH1cblxuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiB2YWx1ZSBtZXRhZGF0YVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZW1wdHktaW50ZXJmYWNlXG4gIGludGVyZmFjZSBWYWx1ZU1ldGFkYXRhIHtcbiAgICAvLyBUQkRcbiAgfVxuXG4gIC8vICNlbmRyZWdpb25cbn1cblxuLyoqXG4gKiBSZXByZXNlbnQgYSBydW50aW1lIGluc3RhbmNlIG9mIGFuIE9OTlggbW9kZWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW5mZXJlbmNlU2Vzc2lvbiB7XG4gIC8vICNyZWdpb24gcnVuKClcblxuICAvKipcbiAgICogRXhlY3V0ZSB0aGUgbW9kZWwgYXN5bmNocm9ub3VzbHkgd2l0aCB0aGUgZ2l2ZW4gZmVlZHMgYW5kIG9wdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSBmZWVkcyAtIFJlcHJlc2VudGF0aW9uIG9mIHRoZSBtb2RlbCBpbnB1dC4gU2VlIHR5cGUgZGVzY3JpcHRpb24gb2YgYEluZmVyZW5jZVNlc3Npb24uSW5wdXRUeXBlYCBmb3IgZGV0YWlsLlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbmFsLiBBIHNldCBvZiBvcHRpb25zIHRoYXQgY29udHJvbHMgdGhlIGJlaGF2aW9yIG9mIG1vZGVsIGluZmVyZW5jZS5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBtYXAsIHdoaWNoIHVzZXMgb3V0cHV0IG5hbWVzIGFzIGtleXMgYW5kIE9ubnhWYWx1ZSBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgICovXG4gIHJ1bihmZWVkczogSW5mZXJlbmNlU2Vzc2lvbi5GZWVkc1R5cGUsIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBQcm9taXNlPEluZmVyZW5jZVNlc3Npb24uUmV0dXJuVHlwZT47XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGUgdGhlIG1vZGVsIGFzeW5jaHJvbm91c2x5IHdpdGggdGhlIGdpdmVuIGZlZWRzLCBmZXRjaGVzIGFuZCBvcHRpb25zLlxuICAgKlxuICAgKiBAcGFyYW0gZmVlZHMgLSBSZXByZXNlbnRhdGlvbiBvZiB0aGUgbW9kZWwgaW5wdXQuIFNlZSB0eXBlIGRlc2NyaXB0aW9uIG9mIGBJbmZlcmVuY2VTZXNzaW9uLklucHV0VHlwZWAgZm9yIGRldGFpbC5cbiAgICogQHBhcmFtIGZldGNoZXMgLSBSZXByZXNlbnRhdGlvbiBvZiB0aGUgbW9kZWwgb3V0cHV0LiBTZWUgdHlwZSBkZXNjcmlwdGlvbiBvZiBgSW5mZXJlbmNlU2Vzc2lvbi5PdXRwdXRUeXBlYCBmb3JcbiAgICogZGV0YWlsLlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbmFsLiBBIHNldCBvZiBvcHRpb25zIHRoYXQgY29udHJvbHMgdGhlIGJlaGF2aW9yIG9mIG1vZGVsIGluZmVyZW5jZS5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBtYXAsIHdoaWNoIHVzZXMgb3V0cHV0IG5hbWVzIGFzIGtleXMgYW5kIE9ubnhWYWx1ZSBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgICovXG4gIHJ1bihmZWVkczogSW5mZXJlbmNlU2Vzc2lvbi5GZWVkc1R5cGUsIGZldGNoZXM6IEluZmVyZW5jZVNlc3Npb24uRmV0Y2hlc1R5cGUsXG4gICAgICBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uLlJldHVyblR5cGU+O1xuXG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIHJlbGVhc2UoKVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlIHRoZSBpbmZlcmVuY2Ugc2Vzc2lvbiBhbmQgdGhlIHVuZGVybHlpbmcgcmVzb3VyY2VzLlxuICAgKi9cbiAgcmVsZWFzZSgpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIHByb2ZpbGluZ1xuXG4gIC8qKlxuICAgKiBTdGFydCBwcm9maWxpbmcuXG4gICAqL1xuICBzdGFydFByb2ZpbGluZygpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBFbmQgcHJvZmlsaW5nLlxuICAgKi9cbiAgZW5kUHJvZmlsaW5nKCk6IHZvaWQ7XG5cbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNyZWdpb24gbWV0YWRhdGFcblxuICAvKipcbiAgICogR2V0IGlucHV0IG5hbWVzIG9mIHRoZSBsb2FkZWQgbW9kZWwuXG4gICAqL1xuICByZWFkb25seSBpbnB1dE5hbWVzOiByZWFkb25seSBzdHJpbmdbXTtcblxuICAvKipcbiAgICogR2V0IG91dHB1dCBuYW1lcyBvZiB0aGUgbG9hZGVkIG1vZGVsLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0TmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xuXG4gIC8vIC8qKlxuICAvLyAgKiBHZXQgaW5wdXQgbWV0YWRhdGEgb2YgdGhlIGxvYWRlZCBtb2RlbC5cbiAgLy8gICovXG4gIC8vIHJlYWRvbmx5IGlucHV0TWV0YWRhdGE6IFJlYWRvbmx5QXJyYXk8UmVhZG9ubHk8SW5mZXJlbmNlU2Vzc2lvbi5WYWx1ZU1ldGFkYXRhPj47XG5cbiAgLy8gLyoqXG4gIC8vICAqIEdldCBvdXRwdXQgbWV0YWRhdGEgb2YgdGhlIGxvYWRlZCBtb2RlbC5cbiAgLy8gICovXG4gIC8vIHJlYWRvbmx5IG91dHB1dE1ldGFkYXRhOiBSZWFkb25seUFycmF5PFJlYWRvbmx5PEluZmVyZW5jZVNlc3Npb24uVmFsdWVNZXRhZGF0YT4+O1xuXG4gIC8vICNlbmRyZWdpb25cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbmZlcmVuY2VTZXNzaW9uRmFjdG9yeSB7XG4gIC8vICNyZWdpb24gY3JlYXRlKClcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGluZmVyZW5jZSBzZXNzaW9uIGFuZCBsb2FkIG1vZGVsIGFzeW5jaHJvbm91c2x5IGZyb20gYW4gT05OWCBtb2RlbCBmaWxlLlxuICAgKlxuICAgKiBAcGFyYW0gdXJpIC0gVGhlIFVSSSBvciBmaWxlIHBhdGggb2YgdGhlIG1vZGVsIHRvIGxvYWQuXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gc3BlY2lmeSBjb25maWd1cmF0aW9uIGZvciBjcmVhdGluZyBhIG5ldyBpbmZlcmVuY2Ugc2Vzc2lvbi5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gSW5mZXJlbmNlU2Vzc2lvbiBvYmplY3QuXG4gICAqL1xuICBjcmVhdGUodXJpOiBzdHJpbmcsIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uPjtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGluZmVyZW5jZSBzZXNzaW9uIGFuZCBsb2FkIG1vZGVsIGFzeW5jaHJvbm91c2x5IGZyb20gYW4gYXJyYXkgYnVmZXIuXG4gICAqXG4gICAqIEBwYXJhbSBidWZmZXIgLSBBbiBBcnJheUJ1ZmZlciByZXByZXNlbnRhdGlvbiBvZiBhbiBPTk5YIG1vZGVsLlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIHNwZWNpZnkgY29uZmlndXJhdGlvbiBmb3IgY3JlYXRpbmcgYSBuZXcgaW5mZXJlbmNlIHNlc3Npb24uXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIEluZmVyZW5jZVNlc3Npb24gb2JqZWN0LlxuICAgKi9cbiAgY3JlYXRlKGJ1ZmZlcjogQXJyYXlCdWZmZXJMaWtlLCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbj47XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBpbmZlcmVuY2Ugc2Vzc2lvbiBhbmQgbG9hZCBtb2RlbCBhc3luY2hyb25vdXNseSBmcm9tIHNlZ21lbnQgb2YgYW4gYXJyYXkgYnVmZXIuXG4gICAqXG4gICAqIEBwYXJhbSBidWZmZXIgLSBBbiBBcnJheUJ1ZmZlciByZXByZXNlbnRhdGlvbiBvZiBhbiBPTk5YIG1vZGVsLlxuICAgKiBAcGFyYW0gYnl0ZU9mZnNldCAtIFRoZSBiZWdpbm5pbmcgb2YgdGhlIHNwZWNpZmllZCBwb3J0aW9uIG9mIHRoZSBhcnJheSBidWZmZXIuXG4gICAqIEBwYXJhbSBieXRlTGVuZ3RoIC0gVGhlIGxlbmd0aCBpbiBieXRlcyBvZiB0aGUgYXJyYXkgYnVmZmVyLlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIHNwZWNpZnkgY29uZmlndXJhdGlvbiBmb3IgY3JlYXRpbmcgYSBuZXcgaW5mZXJlbmNlIHNlc3Npb24uXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIEluZmVyZW5jZVNlc3Npb24gb2JqZWN0LlxuICAgKi9cbiAgY3JlYXRlKGJ1ZmZlcjogQXJyYXlCdWZmZXJMaWtlLCBieXRlT2Zmc2V0OiBudW1iZXIsIGJ5dGVMZW5ndGg/OiBudW1iZXIsIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTpcbiAgICAgIFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbj47XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBpbmZlcmVuY2Ugc2Vzc2lvbiBhbmQgbG9hZCBtb2RlbCBhc3luY2hyb25vdXNseSBmcm9tIGEgVWludDhBcnJheS5cbiAgICpcbiAgICogQHBhcmFtIGJ1ZmZlciAtIEEgVWludDhBcnJheSByZXByZXNlbnRhdGlvbiBvZiBhbiBPTk5YIG1vZGVsLlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIHNwZWNpZnkgY29uZmlndXJhdGlvbiBmb3IgY3JlYXRpbmcgYSBuZXcgaW5mZXJlbmNlIHNlc3Npb24uXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIEluZmVyZW5jZVNlc3Npb24gb2JqZWN0LlxuICAgKi9cbiAgY3JlYXRlKGJ1ZmZlcjogVWludDhBcnJheSwgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiBQcm9taXNlPEluZmVyZW5jZVNlc3Npb24+O1xuXG4gIC8vICNlbmRyZWdpb25cbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxuZXhwb3J0IGNvbnN0IEluZmVyZW5jZVNlc3Npb246IEluZmVyZW5jZVNlc3Npb25GYWN0b3J5ID0gSW5mZXJlbmNlU2Vzc2lvbkltcGw7XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7VGVuc29yfSBmcm9tICcuL3RlbnNvci5qcyc7XG5cbnR5cGUgTm9uVGVuc29yVHlwZSA9IG5ldmVyO1xuXG4vKipcbiAqIFR5cGUgT25ueFZhbHVlIFJlcHJlc2VudHMgYm90aCB0ZW5zb3JzIGFuZCBub24tdGVuc29ycyB2YWx1ZSBmb3IgbW9kZWwncyBpbnB1dHMvb3V0cHV0cy5cbiAqXG4gKiBOT1RFOiBjdXJyZW50bHkgbm90IHN1cHBvcnQgbm9uLXRlbnNvclxuICovXG5leHBvcnQgdHlwZSBPbm54VmFsdWUgPSBUZW5zb3J8Tm9uVGVuc29yVHlwZTtcblxuLyoqXG4gKiBUeXBlIE9ubnhWYWx1ZURhdGFMb2NhdGlvbiByZXByZXNlbnRzIHRoZSBsb2NhdGlvbiBvZiB0aGUgZGF0YSBvZiBhbiBPbm54VmFsdWUuXG4gKi9cbmV4cG9ydCB0eXBlIE9ubnhWYWx1ZURhdGFMb2NhdGlvbiA9IFRlbnNvci5EYXRhTG9jYXRpb247XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7cmVzb2x2ZUJhY2tlbmR9IGZyb20gJy4vYmFja2VuZC1pbXBsLmpzJztcbmltcG9ydCB7U2Vzc2lvbkhhbmRsZXIsIFRyYWluaW5nU2Vzc2lvbkhhbmRsZXJ9IGZyb20gJy4vYmFja2VuZC5qcyc7XG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb24gYXMgSW5mZXJlbmNlU2Vzc2lvbn0gZnJvbSAnLi9pbmZlcmVuY2Utc2Vzc2lvbi5qcyc7XG5pbXBvcnQge09ubnhWYWx1ZX0gZnJvbSAnLi9vbm54LXZhbHVlLmpzJztcbmltcG9ydCB7VGVuc29yfSBmcm9tICcuL3RlbnNvci5qcyc7XG5pbXBvcnQge1RyYWluaW5nU2Vzc2lvbiBhcyBUcmFpbmluZ1Nlc3Npb25JbnRlcmZhY2UsIFRyYWluaW5nU2Vzc2lvbkNyZWF0ZU9wdGlvbnN9IGZyb20gJy4vdHJhaW5pbmctc2Vzc2lvbi5qcyc7XG5cbnR5cGUgU2Vzc2lvbk9wdGlvbnMgPSBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zO1xudHlwZSBGZWVkc1R5cGUgPSBJbmZlcmVuY2VTZXNzaW9uLkZlZWRzVHlwZTtcbnR5cGUgRmV0Y2hlc1R5cGUgPSBJbmZlcmVuY2VTZXNzaW9uLkZldGNoZXNUeXBlO1xudHlwZSBSZXR1cm5UeXBlID0gSW5mZXJlbmNlU2Vzc2lvbi5SZXR1cm5UeXBlO1xudHlwZSBSdW5PcHRpb25zID0gSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zO1xuXG5jb25zdCBub0JhY2tlbmRFcnJNc2c6IHN0cmluZyA9ICdUcmFpbmluZyBiYWNrZW5kIGNvdWxkIG5vdCBiZSByZXNvbHZlZC4gJyArXG4gICAgJ01ha2Ugc3VyZSB5b3VcXCdyZSB1c2luZyB0aGUgY29ycmVjdCBjb25maWd1cmF0aW9uICYgV2ViQXNzZW1ibHkgZmlsZXMuJztcblxuZXhwb3J0IGNsYXNzIFRyYWluaW5nU2Vzc2lvbiBpbXBsZW1lbnRzIFRyYWluaW5nU2Vzc2lvbkludGVyZmFjZSB7XG4gIHByaXZhdGUgY29uc3RydWN0b3IoaGFuZGxlcjogVHJhaW5pbmdTZXNzaW9uSGFuZGxlciwgaGFzT3B0aW1pemVyTW9kZWw6IGJvb2xlYW4sIGhhc0V2YWxNb2RlbDogYm9vbGVhbikge1xuICAgIHRoaXMuaGFuZGxlciA9IGhhbmRsZXI7XG4gICAgdGhpcy5oYXNPcHRpbWl6ZXJNb2RlbCA9IGhhc09wdGltaXplck1vZGVsO1xuICAgIHRoaXMuaGFzRXZhbE1vZGVsID0gaGFzRXZhbE1vZGVsO1xuICB9XG4gIHByaXZhdGUgaGFuZGxlcjogVHJhaW5pbmdTZXNzaW9uSGFuZGxlcjtcbiAgcHJpdmF0ZSBoYXNPcHRpbWl6ZXJNb2RlbDogYm9vbGVhbjtcbiAgcHJpdmF0ZSBoYXNFdmFsTW9kZWw6IGJvb2xlYW47XG5cbiAgZ2V0IHRyYWluaW5nSW5wdXROYW1lcygpOiByZWFkb25seSBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlci5pbnB1dE5hbWVzO1xuICB9XG4gIGdldCB0cmFpbmluZ091dHB1dE5hbWVzKCk6IHJlYWRvbmx5IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVyLm91dHB1dE5hbWVzO1xuICB9XG5cbiAgZ2V0IGV2YWxJbnB1dE5hbWVzKCk6IHJlYWRvbmx5IHN0cmluZ1tdIHtcbiAgICBpZiAodGhpcy5oYXNFdmFsTW9kZWwpIHtcbiAgICAgIHJldHVybiB0aGlzLmhhbmRsZXIuZXZhbElucHV0TmFtZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyB0cmFpbmluZyBzZXNzaW9uIGhhcyBubyBldmFsTW9kZWwgbG9hZGVkLicpO1xuICAgIH1cbiAgfVxuICBnZXQgZXZhbE91dHB1dE5hbWVzKCk6IHJlYWRvbmx5IHN0cmluZ1tdIHtcbiAgICBpZiAodGhpcy5oYXNFdmFsTW9kZWwpIHtcbiAgICAgIHJldHVybiB0aGlzLmhhbmRsZXIuZXZhbE91dHB1dE5hbWVzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgdHJhaW5pbmcgc2Vzc2lvbiBoYXMgbm8gZXZhbE1vZGVsIGxvYWRlZC4nKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgY3JlYXRlKHRyYWluaW5nT3B0aW9uczogVHJhaW5pbmdTZXNzaW9uQ3JlYXRlT3B0aW9ucywgc2Vzc2lvbk9wdGlvbnM/OiBTZXNzaW9uT3B0aW9ucyk6XG4gICAgICBQcm9taXNlPFRyYWluaW5nU2Vzc2lvbj4ge1xuICAgIGNvbnN0IGV2YWxNb2RlbDogc3RyaW5nfFVpbnQ4QXJyYXkgPSB0cmFpbmluZ09wdGlvbnMuZXZhbE1vZGVsIHx8ICcnO1xuICAgIGNvbnN0IG9wdGltaXplck1vZGVsOiBzdHJpbmd8VWludDhBcnJheSA9IHRyYWluaW5nT3B0aW9ucy5vcHRpbWl6ZXJNb2RlbCB8fCAnJztcbiAgICBjb25zdCBvcHRpb25zOiBTZXNzaW9uT3B0aW9ucyA9IHNlc3Npb25PcHRpb25zIHx8IHt9O1xuXG4gICAgLy8gZ2V0IGJhY2tlbmQgaGludHNcbiAgICBjb25zdCBlcHMgPSBvcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycyB8fCBbXTtcbiAgICBjb25zdCBiYWNrZW5kSGludHMgPSBlcHMubWFwKGkgPT4gdHlwZW9mIGkgPT09ICdzdHJpbmcnID8gaSA6IGkubmFtZSk7XG4gICAgY29uc3QgYmFja2VuZCA9IGF3YWl0IHJlc29sdmVCYWNrZW5kKGJhY2tlbmRIaW50cyk7XG4gICAgaWYgKGJhY2tlbmQuY3JlYXRlVHJhaW5pbmdTZXNzaW9uSGFuZGxlcikge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGF3YWl0IGJhY2tlbmQuY3JlYXRlVHJhaW5pbmdTZXNzaW9uSGFuZGxlcihcbiAgICAgICAgICB0cmFpbmluZ09wdGlvbnMuY2hlY2twb2ludFN0YXRlLCB0cmFpbmluZ09wdGlvbnMudHJhaW5Nb2RlbCwgZXZhbE1vZGVsLCBvcHRpbWl6ZXJNb2RlbCwgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gbmV3IFRyYWluaW5nU2Vzc2lvbihoYW5kbGVyLCAhIXRyYWluaW5nT3B0aW9ucy5vcHRpbWl6ZXJNb2RlbCwgISF0cmFpbmluZ09wdGlvbnMuZXZhbE1vZGVsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKG5vQmFja2VuZEVyck1zZyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiBmb3IgcnVuVHJhaW5TdGVwIGFuZCBmdXR1cmUgcnVuU3RlcCBtZXRob2RzIHRoYXQgaGFuZGxlcyB0aGUgdHlwZS1uYXJyb3dpbmcgY29udmVyc2lvbiBmcm9tXG4gICAqIHRoZSBnaXZlbiBwYXJhbWV0ZXJzIHRvIFNlc3Npb25IYW5kbGVyLkZldGNoZXNUeXBlIGFuZCBSdW5PcHRpb25zLlxuICAgKlxuICAgKiBAcGFyYW0gaW5wdXROYW1lcyB0aGUgZmVlZHMgb2JqZWN0IGlzIGNoZWNrZWQgdGhhdCB0aGV5IGNvbnRhaW4gYWxsIGlucHV0IG5hbWVzIGluIHRoZSBwcm92aWRlZCBsaXN0IG9mIGlucHV0XG4gICAqIG5hbWVzLlxuICAgKiBAcGFyYW0gb3V0cHV0TmFtZXMgdGhlIGZldGNoZXMgb2JqZWN0IGlzIGNoZWNrZWQgdGhhdCB0aGVpciBrZXlzIG1hdGNoIHVwIHdpdGggdmFsaWQgbmFtZXMgaW4gdGhlIGxpc3Qgb2Ygb3V0cHV0XG4gICAqIG5hbWVzLlxuICAgKiBAcGFyYW0gZmVlZHMgdGhlIHJlcXVpcmVkIGlucHV0XG4gICAqIEBwYXJhbSBhcmcxIG5hcnJvd2VkICYgY29udmVydGVkIGludG8gdGhlIFNlc3Npb25IYW5kbGVyLkZldGNoZXNUeXBlIG9yIFJ1bk9wdGlvbnMgb2JqZWN0XG4gICAqIEBwYXJhbSBhcmcyIG9wdGlvbmFsIFJ1bk9wdGlvbnMgb2JqZWN0LlxuICAgKiBAcmV0dXJuc1xuICAgKi9cbiAgdHlwZU5hcnJvd2luZ0ZvclJ1blN0ZXAoXG4gICAgICBpbnB1dE5hbWVzOiByZWFkb25seSBzdHJpbmdbXSwgb3V0cHV0TmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdLCBmZWVkczogRmVlZHNUeXBlLCBhcmcxPzogRmV0Y2hlc1R5cGV8UnVuT3B0aW9ucyxcbiAgICAgIGFyZzI/OiBSdW5PcHRpb25zKTogW1Nlc3Npb25IYW5kbGVyLkZldGNoZXNUeXBlLCBSdW5PcHRpb25zXSB7XG4gICAgY29uc3QgZmV0Y2hlczoge1tuYW1lOiBzdHJpbmddOiBPbm54VmFsdWV8bnVsbH0gPSB7fTtcbiAgICBsZXQgb3B0aW9uczogUnVuT3B0aW9ucyA9IHt9O1xuICAgIC8vIGNoZWNrIGlucHV0c1xuICAgIGlmICh0eXBlb2YgZmVlZHMgIT09ICdvYmplY3QnIHx8IGZlZWRzID09PSBudWxsIHx8IGZlZWRzIGluc3RhbmNlb2YgVGVuc29yIHx8IEFycmF5LmlzQXJyYXkoZmVlZHMpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICdcXCdmZWVkc1xcJyBtdXN0IGJlIGFuIG9iamVjdCB0aGF0IHVzZSBpbnB1dCBuYW1lcyBhcyBrZXlzIGFuZCBPbm54VmFsdWUgYXMgY29ycmVzcG9uZGluZyB2YWx1ZXMuJyk7XG4gICAgfVxuXG4gICAgbGV0IGlzRmV0Y2hlc0VtcHR5ID0gdHJ1ZTtcbiAgICAvLyBkZXRlcm1pbmUgd2hpY2ggb3ZlcnJpZGUgaXMgYmVpbmcgdXNlZFxuICAgIGlmICh0eXBlb2YgYXJnMSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChhcmcxID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VuZXhwZWN0ZWQgYXJndW1lbnRbMV06IGNhbm5vdCBiZSBudWxsLicpO1xuICAgICAgfVxuICAgICAgaWYgKGFyZzEgaW5zdGFuY2VvZiBUZW5zb3IpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXFwnZmV0Y2hlc1xcJyBjYW5ub3QgYmUgYSBUZW5zb3InKTtcbiAgICAgIH1cblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJnMSkpIHtcbiAgICAgICAgaWYgKGFyZzEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXFwnZmV0Y2hlc1xcJyBjYW5ub3QgYmUgYW4gZW1wdHkgYXJyYXkuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaXNGZXRjaGVzRW1wdHkgPSBmYWxzZTtcbiAgICAgICAgLy8gb3V0cHV0IG5hbWVzXG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBhcmcxKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXFwnZmV0Y2hlc1xcJyBtdXN0IGJlIGEgc3RyaW5nIGFycmF5IG9yIGFuIG9iamVjdC4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG91dHB1dE5hbWVzLmluZGV4T2YobmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgJ2ZldGNoZXMnIGNvbnRhaW5zIGludmFsaWQgb3V0cHV0IG5hbWU6ICR7bmFtZX0uYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZldGNoZXNbbmFtZV0gPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBhcmcyID09PSAnb2JqZWN0JyAmJiBhcmcyICE9PSBudWxsKSB7XG4gICAgICAgICAgb3B0aW9ucyA9IGFyZzI7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXFwnb3B0aW9uc1xcJyBtdXN0IGJlIGFuIG9iamVjdC4nKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZGVjaWRlIHdoZXRoZXIgYXJnMSBpcyBmZXRjaGVzIG9yIG9wdGlvbnNcbiAgICAgICAgLy8gaWYgYW55IG91dHB1dCBuYW1lIGlzIHByZXNlbnQgYW5kIGl0cyB2YWx1ZSBpcyB2YWxpZCBPbm54VmFsdWUsIHdlIGNvbnNpZGVyIGl0IGZldGNoZXNcbiAgICAgICAgbGV0IGlzRmV0Y2hlcyA9IGZhbHNlO1xuICAgICAgICBjb25zdCBhcmcxS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFyZzEpO1xuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2Ygb3V0cHV0TmFtZXMpIHtcbiAgICAgICAgICBpZiAoYXJnMUtleXMuaW5kZXhPZihuYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IHYgPSAoYXJnMSBhcyBJbmZlcmVuY2VTZXNzaW9uLk51bGxhYmxlT25ueFZhbHVlTWFwVHlwZSlbbmFtZV07XG4gICAgICAgICAgICBpZiAodiA9PT0gbnVsbCB8fCB2IGluc3RhbmNlb2YgVGVuc29yKSB7XG4gICAgICAgICAgICAgIGlzRmV0Y2hlcyA9IHRydWU7XG4gICAgICAgICAgICAgIGlzRmV0Y2hlc0VtcHR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgIGZldGNoZXNbbmFtZV0gPSB2O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0ZldGNoZXMpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIGFyZzIgPT09ICdvYmplY3QnICYmIGFyZzIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBhcmcyO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcXCdvcHRpb25zXFwnIG11c3QgYmUgYW4gb2JqZWN0LicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvcHRpb25zID0gYXJnMSBhcyBSdW5PcHRpb25zO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYXJnMSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VuZXhwZWN0ZWQgYXJndW1lbnRbMV06IG11c3QgYmUgXFwnZmV0Y2hlc1xcJyBvciBcXCdvcHRpb25zXFwnLicpO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGlmIGFsbCBpbnB1dHMgYXJlIGluIGZlZWRcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgaW5wdXROYW1lcykge1xuICAgICAgaWYgKHR5cGVvZiBmZWVkc1tuYW1lXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnB1dCAnJHtuYW1lfScgaXMgbWlzc2luZyBpbiAnZmVlZHMnLmApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlmIG5vIGZldGNoZXMgaXMgc3BlY2lmaWVkLCB3ZSB1c2UgdGhlIGZ1bGwgb3V0cHV0IG5hbWVzIGxpc3RcbiAgICBpZiAoaXNGZXRjaGVzRW1wdHkpIHtcbiAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBvdXRwdXROYW1lcykge1xuICAgICAgICBmZXRjaGVzW25hbWVdID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gW2ZldGNoZXMsIG9wdGlvbnNdO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBtZXRob2QgZm9yIHJ1blRyYWluU3RlcCBhbmQgYW55IG90aGVyIHJ1blN0ZXAgbWV0aG9kcy4gVGFrZXMgdGhlIFJldHVyblR5cGUgcmVzdWx0IGZyb20gdGhlIFNlc3Npb25IYW5kbGVyXG4gICAqIGFuZCBjaGFuZ2VzIGl0IGludG8gYSBtYXAgb2YgVGVuc29ycy5cbiAgICpcbiAgICogQHBhcmFtIHJlc3VsdHNcbiAgICogQHJldHVybnNcbiAgICovXG4gIGNvbnZlcnRIYW5kbGVyUmV0dXJuVHlwZVRvTWFwT2ZUZW5zb3JzKHJlc3VsdHM6IFNlc3Npb25IYW5kbGVyLlJldHVyblR5cGUpOiBSZXR1cm5UeXBlIHtcbiAgICBjb25zdCByZXR1cm5WYWx1ZToge1tuYW1lOiBzdHJpbmddOiBPbm54VmFsdWV9ID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgaW4gcmVzdWx0cykge1xuICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHJlc3VsdHMsIGtleSkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVzdWx0c1trZXldO1xuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgVGVuc29yKSB7XG4gICAgICAgICAgcmV0dXJuVmFsdWVba2V5XSA9IHJlc3VsdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm5WYWx1ZVtrZXldID0gbmV3IFRlbnNvcihyZXN1bHQudHlwZSwgcmVzdWx0LmRhdGEsIHJlc3VsdC5kaW1zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gIH1cblxuICBhc3luYyBsYXp5UmVzZXRHcmFkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuaGFuZGxlci5sYXp5UmVzZXRHcmFkKCk7XG4gIH1cblxuICBydW5UcmFpblN0ZXAoZmVlZHM6IEZlZWRzVHlwZSwgb3B0aW9ucz86IFJ1bk9wdGlvbnMpOiBQcm9taXNlPFJldHVyblR5cGU+O1xuICBydW5UcmFpblN0ZXAoZmVlZHM6IEZlZWRzVHlwZSwgZmV0Y2hlczogRmV0Y2hlc1R5cGUsIG9wdGlvbnM/OiBSdW5PcHRpb25zKTogUHJvbWlzZTxSZXR1cm5UeXBlPjtcbiAgYXN5bmMgcnVuVHJhaW5TdGVwKGZlZWRzOiBGZWVkc1R5cGUsIGFyZzE/OiBGZXRjaGVzVHlwZXxSdW5PcHRpb25zLCBhcmcyPzogUnVuT3B0aW9ucyk6IFByb21pc2U8UmV0dXJuVHlwZT4ge1xuICAgIGNvbnN0IFtmZXRjaGVzLCBvcHRpb25zXSA9XG4gICAgICAgIHRoaXMudHlwZU5hcnJvd2luZ0ZvclJ1blN0ZXAodGhpcy50cmFpbmluZ0lucHV0TmFtZXMsIHRoaXMudHJhaW5pbmdPdXRwdXROYW1lcywgZmVlZHMsIGFyZzEsIGFyZzIpO1xuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCB0aGlzLmhhbmRsZXIucnVuVHJhaW5TdGVwKGZlZWRzLCBmZXRjaGVzLCBvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcy5jb252ZXJ0SGFuZGxlclJldHVyblR5cGVUb01hcE9mVGVuc29ycyhyZXN1bHRzKTtcbiAgfVxuXG4gIGFzeW5jIHJ1bk9wdGltaXplclN0ZXAob3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9uc3x1bmRlZmluZWQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5oYXNPcHRpbWl6ZXJNb2RlbCkge1xuICAgICAgYXdhaXQgdGhpcy5oYW5kbGVyLnJ1bk9wdGltaXplclN0ZXAob3B0aW9ucyB8fCB7fSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBUcmFpbmluZ1Nlc3Npb24gaGFzIG5vIE9wdGltaXplck1vZGVsIGxvYWRlZC4nKTtcbiAgICB9XG4gIH1cblxuICBydW5FdmFsU3RlcChmZWVkczogRmVlZHNUeXBlLCBvcHRpb25zPzogUnVuT3B0aW9uc3x1bmRlZmluZWQpOiBQcm9taXNlPFJldHVyblR5cGU+O1xuICBydW5FdmFsU3RlcChmZWVkczogRmVlZHNUeXBlLCBmZXRjaGVzOiBGZXRjaGVzVHlwZSwgb3B0aW9ucz86IFJ1bk9wdGlvbnN8dW5kZWZpbmVkKTogUHJvbWlzZTxSZXR1cm5UeXBlPjtcbiAgYXN5bmMgcnVuRXZhbFN0ZXAoZmVlZHM6IEZlZWRzVHlwZSwgYXJnMT86IEZldGNoZXNUeXBlfFJ1bk9wdGlvbnMsIGFyZzI/OiBSdW5PcHRpb25zKTogUHJvbWlzZTxSZXR1cm5UeXBlPiB7XG4gICAgaWYgKHRoaXMuaGFzRXZhbE1vZGVsKSB7XG4gICAgICBjb25zdCBbZmV0Y2hlcywgb3B0aW9uc10gPVxuICAgICAgICAgIHRoaXMudHlwZU5hcnJvd2luZ0ZvclJ1blN0ZXAodGhpcy5ldmFsSW5wdXROYW1lcywgdGhpcy5ldmFsT3V0cHV0TmFtZXMsIGZlZWRzLCBhcmcxLCBhcmcyKTtcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCB0aGlzLmhhbmRsZXIucnVuRXZhbFN0ZXAoZmVlZHMsIGZldGNoZXMsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIHRoaXMuY29udmVydEhhbmRsZXJSZXR1cm5UeXBlVG9NYXBPZlRlbnNvcnMocmVzdWx0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBUcmFpbmluZ1Nlc3Npb24gaGFzIG5vIEV2YWxNb2RlbCBsb2FkZWQuJyk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0UGFyYW1ldGVyc1NpemUodHJhaW5hYmxlT25seSA9IHRydWUpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmhhbmRsZXIuZ2V0UGFyYW1ldGVyc1NpemUodHJhaW5hYmxlT25seSk7XG4gIH1cblxuICBhc3luYyBsb2FkUGFyYW1ldGVyc0J1ZmZlcihhcnJheTogVWludDhBcnJheSwgdHJhaW5hYmxlT25seSA9IHRydWUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXJhbXNTaXplID0gYXdhaXQgdGhpcy5nZXRQYXJhbWV0ZXJzU2l6ZSh0cmFpbmFibGVPbmx5KTtcbiAgICAvLyBjaGVja2luZyB0aGF0IHRoZSBzaXplIG9mIHRoZSBVaW50OEFycmF5IGlzIGVxdWl2YWxlbnQgdG8gdGhlIGJ5dGUgbGVuZ3RoIG9mIGEgRmxvYXQzMkFycmF5IG9mIHRoZSBudW1iZXJcbiAgICAvLyBvZiBwYXJhbWV0ZXJzXG4gICAgaWYgKGFycmF5Lmxlbmd0aCAhPT0gNCAqIHBhcmFtc1NpemUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnU2l6ZSBvZiB0aGUgYnVmZmVyIHBhc3NlZCBpbnRvIGxvYWRQYXJhbWV0ZXJzQnVmZmVyIG11c3QgbWF0Y2ggdGhlIG51bWJlciBvZiBwYXJhbWV0ZXJzIGluICcgK1xuICAgICAgICAgICd0aGUgbW9kZWwuIFBsZWFzZSB1c2UgZ2V0UGFyYW1ldGVyc1NpemUgbWV0aG9kIHRvIGNoZWNrLicpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5oYW5kbGVyLmxvYWRQYXJhbWV0ZXJzQnVmZmVyKGFycmF5LCB0cmFpbmFibGVPbmx5KTtcbiAgfVxuXG4gIGFzeW5jIGdldENvbnRpZ3VvdXNQYXJhbWV0ZXJzKHRyYWluYWJsZU9ubHkgPSB0cnVlKTogUHJvbWlzZTxPbm54VmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVyLmdldENvbnRpZ3VvdXNQYXJhbWV0ZXJzKHRyYWluYWJsZU9ubHkpO1xuICB9XG5cbiAgYXN5bmMgcmVsZWFzZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb259IGZyb20gJy4vaW5mZXJlbmNlLXNlc3Npb24uanMnO1xuaW1wb3J0IHtPbm54VmFsdWV9IGZyb20gJy4vb25ueC12YWx1ZS5qcyc7XG5pbXBvcnQge1RyYWluaW5nU2Vzc2lvbiBhcyBUcmFpbmluZ1Nlc3Npb25JbXBsfSBmcm9tICcuL3RyYWluaW5nLXNlc3Npb24taW1wbC5qcyc7XG5cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZWRlY2xhcmUgKi9cblxuZXhwb3J0IGRlY2xhcmUgbmFtZXNwYWNlIFRyYWluaW5nU2Vzc2lvbiB7XG4gIC8qKlxuICAgKiBFaXRoZXIgVVJJIGZpbGUgcGF0aCAoc3RyaW5nKSBvciBVaW50OEFycmF5IGNvbnRhaW5pbmcgbW9kZWwgb3IgY2hlY2twb2ludCBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHR5cGUgVVJJb3JCdWZmZXIgPSBzdHJpbmd8VWludDhBcnJheTtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnQgYSBydW50aW1lIGluc3RhbmNlIG9mIGFuIE9OTlggdHJhaW5pbmcgc2Vzc2lvbixcbiAqIHdoaWNoIGNvbnRhaW5zIGEgbW9kZWwgdGhhdCBjYW4gYmUgdHJhaW5lZCwgYW5kLCBvcHRpb25hbGx5LFxuICogYW4gZXZhbCBhbmQgb3B0aW1pemVyIG1vZGVsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRyYWluaW5nU2Vzc2lvbiB7XG4gIC8vICNyZWdpb24gcnVuKClcblxuICAvKipcbiAgICogTGF6aWx5IHJlc2V0cyB0aGUgZ3JhZGllbnRzIG9mIGFsbCB0cmFpbmFibGUgcGFyYW1ldGVycyB0byB6ZXJvLiBTaG91bGQgaGFwcGVuIGFmdGVyIHRoZSBpbnZvY2F0aW9uIG9mXG4gICAqIHJ1bk9wdGltaXplclN0ZXAuXG4gICAqL1xuICBsYXp5UmVzZXRHcmFkKCk6IFByb21pc2U8dm9pZD47XG5cbiAgLyoqXG4gICAqIFJ1biBUcmFpblN0ZXAgYXN5bmNocm9ub3VzbHkgd2l0aCB0aGUgZ2l2ZW4gZmVlZHMgYW5kIG9wdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSBmZWVkcyAtIFJlcHJlc2VudGF0aW9uIG9mIHRoZSBtb2RlbCBpbnB1dC4gU2VlIHR5cGUgZGVzY3JpcHRpb24gb2YgYEluZmVyZW5jZVNlc3Npb24uSW5wdXRUeXBlYCBmb3JcbiAgIGRldGFpbC5cbiAgICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25hbC4gQSBzZXQgb2Ygb3B0aW9ucyB0aGF0IGNvbnRyb2xzIHRoZSBiZWhhdmlvciBvZiBtb2RlbCB0cmFpbmluZy5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBtYXAsIHdoaWNoIHVzZXMgb3V0cHV0IG5hbWVzIGFzIGtleXMgYW5kIE9ubnhWYWx1ZSBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgICovXG4gIHJ1blRyYWluU3RlcChmZWVkczogSW5mZXJlbmNlU2Vzc2lvbi5GZWVkc1R5cGUsIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOlxuICAgICAgUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uLlJldHVyblR5cGU+O1xuXG4gIC8qKlxuICAgKiBSdW4gYSBzaW5nbGUgdHJhaW4gc3RlcCB3aXRoIHRoZSBnaXZlbiBpbnB1dHMgYW5kIG9wdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSBmZWVkcyAtIFJlcHJlc2VudGF0aW9uIG9mIHRoZSBtb2RlbCBpbnB1dC5cbiAgICogQHBhcmFtIGZldGNoZXMgLSBSZXByZXNlbnRhdGlvbiBvZiB0aGUgbW9kZWwgb3V0cHV0LlxuICAgKiBkZXRhaWwuXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9uYWwuIEEgc2V0IG9mIG9wdGlvbnMgdGhhdCBjb250cm9scyB0aGUgYmVoYXZpb3Igb2YgbW9kZWwgdHJhaW5pbmcuXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgbWFwLCB3aGljaCB1c2VzIG91dHB1dCBuYW1lcyBhcyBrZXlzIGFuZCBPbm54VmFsdWUgYXMgY29ycmVzcG9uZGluZ1xuICAgdmFsdWVzLlxuICAgKi9cbiAgcnVuVHJhaW5TdGVwKFxuICAgICAgZmVlZHM6IEluZmVyZW5jZVNlc3Npb24uRmVlZHNUeXBlLCBmZXRjaGVzOiBJbmZlcmVuY2VTZXNzaW9uLkZldGNoZXNUeXBlLFxuICAgICAgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbi5SZXR1cm5UeXBlPjtcblxuICAvKipcbiAgICogUnVucyBhIHNpbmdsZSBvcHRpbWl6ZXIgc3RlcCwgd2hpY2ggcGVyZm9ybXMgd2VpZ2h0IHVwZGF0ZXMgZm9yIHRoZSB0cmFpbmFibGUgcGFyYW1ldGVycyB1c2luZyB0aGUgb3B0aW1pemVyIG1vZGVsLlxuICAgKlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbmFsLiBBIHNldCBvZiBvcHRpb25zIHRoYXQgY29udHJvbHMgdGhlIGJlaGF2aW9yIG9mIG1vZGVsIG9wdGltaXppbmcuXG4gICAqL1xuICBydW5PcHRpbWl6ZXJTdGVwKG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBSdW4gYSBzaW5nbGUgZXZhbCBzdGVwIHdpdGggdGhlIGdpdmVuIGlucHV0cyBhbmQgb3B0aW9ucyB1c2luZyB0aGUgZXZhbCBtb2RlbC5cbiAgICpcbiAgICogQHBhcmFtIGZlZWRzIC0gUmVwcmVzZW50YXRpb24gb2YgdGhlIG1vZGVsIGlucHV0LlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbmFsLiBBIHNldCBvZiBvcHRpb25zIHRoYXQgY29udHJvbHMgdGhlIGJlaGF2aW9yIG9mIG1vZGVsIGV2YWwgc3RlcC5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBtYXAsIHdoaWNoIHVzZXMgb3V0cHV0IG5hbWVzIGFzIGtleXMgYW5kIE9ubnhWYWx1ZSBhcyBjb3JyZXNwb25kaW5nXG4gICB2YWx1ZXMuXG4gICAqL1xuICBydW5FdmFsU3RlcChmZWVkczogSW5mZXJlbmNlU2Vzc2lvbi5GZWVkc1R5cGUsIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOlxuICAgICAgUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uLlJldHVyblR5cGU+O1xuXG4gIC8qKlxuICAgKiBSdW4gYSBzaW5nbGUgZXZhbCBzdGVwIHdpdGggdGhlIGdpdmVuIGlucHV0cyBhbmQgb3B0aW9ucyB1c2luZyB0aGUgZXZhbCBtb2RlbC5cbiAgICpcbiAgICogQHBhcmFtIGZlZWRzIC0gUmVwcmVzZW50YXRpb24gb2YgdGhlIG1vZGVsIGlucHV0LlxuICAgKiBAcGFyYW0gZmV0Y2hlcyAtIFJlcHJlc2VudGF0aW9uIG9mIHRoZSBtb2RlbCBvdXRwdXQuXG4gICAqIGRldGFpbC5cbiAgICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25hbC4gQSBzZXQgb2Ygb3B0aW9ucyB0aGF0IGNvbnRyb2xzIHRoZSBiZWhhdmlvciBvZiBtb2RlbCBldmFsIHN0ZXAuXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgbWFwLCB3aGljaCB1c2VzIG91dHB1dCBuYW1lcyBhcyBrZXlzIGFuZCBPbm54VmFsdWUgYXMgY29ycmVzcG9uZGluZ1xuICAgdmFsdWVzLlxuICAgKi9cbiAgcnVuRXZhbFN0ZXAoXG4gICAgICBmZWVkczogSW5mZXJlbmNlU2Vzc2lvbi5GZWVkc1R5cGUsIGZldGNoZXM6IEluZmVyZW5jZVNlc3Npb24uRmV0Y2hlc1R5cGUsXG4gICAgICBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uLlJldHVyblR5cGU+O1xuXG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIGNvcHkgcGFyYW1ldGVyc1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIHNpemUgb2YgYWxsIHBhcmFtZXRlcnMgZm9yIHRoZSB0cmFpbmluZyBzdGF0ZS4gQ2FsY3VsYXRlcyB0aGUgdG90YWwgbnVtYmVyIG9mIHByaW1pdGl2ZSAoZGF0YXR5cGUgb2ZcbiAgICogdGhlIHBhcmFtZXRlcnMpIGVsZW1lbnRzIG9mIGFsbCB0aGUgcGFyYW1ldGVycyBpbiB0aGUgdHJhaW5pbmcgc3RhdGUuXG4gICAqXG4gICAqIEBwYXJhbSB0cmFpbmFibGVPbmx5IC0gV2hlbiBzZXQgdG8gdHJ1ZSwgdGhlIHNpemUgaXMgY2FsY3VsYXRlZCBmb3IgdHJhaW5hYmxlIHBhcmFtcyBvbmx5LiBEZWZhdWx0IHZhbHVlIGlzIHRydWUuXG4gICAqL1xuICBnZXRQYXJhbWV0ZXJzU2l6ZSh0cmFpbmFibGVPbmx5OiBib29sZWFuKTogUHJvbWlzZTxudW1iZXI+O1xuXG4gIC8qKlxuICAgKiBDb3BpZXMgcGFyYW1ldGVyIHZhbHVlcyBmcm9tIHRoZSBnaXZlbiBhcnJheSB0byB0aGUgdHJhaW5pbmcgc3RhdGUuIEN1cnJlbnRseSwgb25seSBzdXBwb3J0aW5nIG1vZGVscyB3aXRoXG4gICAqIHBhcmFtZXRlcnMgb2YgdHlwZSBGbG9hdDMyLlxuICAgKlxuICAgKiBAcGFyYW0gYnVmZmVyIC0gRmxvYXQzMiBidWZmZXIgY29udGFpbmluZyBwYXJhbWV0ZXJzIGNvbnZlcnRlZCB0byBhIFVpbnQ4QXJyYXkuXG4gICAqIEBwYXJhbSB0cmFpbmFibGVPbmx5IC0gVHJ1ZSBpZiB0cmFpbmFibGUgcGFyYW1ldGVycyBvbmx5IHRvIGJlIG1vZGlmaWVkLCBmYWxzZSBvdGhlcndpc2UuIERlZmF1bHQgdmFsdWUgaXMgdHJ1ZS5cbiAgICovXG4gIGxvYWRQYXJhbWV0ZXJzQnVmZmVyKGFycmF5OiBVaW50OEFycmF5LCB0cmFpbmFibGVPbmx5OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogQ29waWVzIHRoZSBtb2RlbCBwYXJhbWV0ZXJzIHRvIGEgY29udGlndW91cyBidWZmZXIuIFVzdWFsbHkgdXNlZCBpbiB0aGUgY29udGV4dCBvZiBGZWRlcmF0ZWQgTGVhcm5pbmcuXG4gICAqIEN1cnJlbnRseSwgb25seSBzdXBwb3J0aW5nIG1vZGVscyB3aXRoIHBhcmFtZXRlcnMgb2YgdHlwZSBGbG9hdDMyLlxuICAgKlxuICAgKiBAcGFyYW0gdHJhaW5hYmxlT25seSAtIFdoZW4gc2V0IHRvIHRydWUsIG9ubHkgdHJhaW5hYmxlIHBhcmFtZXRlcnMgYXJlIGNvcGllZC4gVHJhaW5hYmxlIHBhcmFtZXRlcnMgYXJlIHBhcmFtZXRlcnNcbiAgICogZm9yIHdoaWNoIHJlcXVpcmVzX2dyYWQgaXMgc2V0IHRvIHRydWUuIERlZmF1bHQgdmFsdWUgaXMgdHJ1ZS5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBGbG9hdDMyIE9ubnhWYWx1ZSBvZiB0aGUgcmVxdWVzdGVkIHBhcmFtZXRlcnMuXG4gICAqL1xuICBnZXRDb250aWd1b3VzUGFyYW1ldGVycyh0cmFpbmFibGVPbmx5OiBib29sZWFuKTogUHJvbWlzZTxPbm54VmFsdWU+O1xuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiByZWxlYXNlKClcblxuICAvKipcbiAgICogUmVsZWFzZSB0aGUgaW5mZXJlbmNlIHNlc3Npb24gYW5kIHRoZSB1bmRlcmx5aW5nIHJlc291cmNlcy5cbiAgICovXG4gIHJlbGVhc2UoKTogUHJvbWlzZTx2b2lkPjtcbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNyZWdpb24gbWV0YWRhdGFcblxuICAvKipcbiAgICogR2V0IGlucHV0IG5hbWVzIG9mIHRoZSBsb2FkZWQgdHJhaW5pbmcgbW9kZWwuXG4gICAqL1xuICByZWFkb25seSB0cmFpbmluZ0lucHV0TmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBHZXQgb3V0cHV0IG5hbWVzIG9mIHRoZSBsb2FkZWQgdHJhaW5pbmcgbW9kZWwuXG4gICAqL1xuICByZWFkb25seSB0cmFpbmluZ091dHB1dE5hbWVzOiByZWFkb25seSBzdHJpbmdbXTtcblxuICAvKipcbiAgICogR2V0IGlucHV0IG5hbWVzIG9mIHRoZSBsb2FkZWQgZXZhbCBtb2RlbC4gSXMgYW4gZW1wdHkgYXJyYXkgaWYgbm8gZXZhbCBtb2RlbCBpcyBsb2FkZWQuXG4gICAqL1xuICByZWFkb25seSBldmFsSW5wdXROYW1lczogcmVhZG9ubHkgc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIEdldCBvdXRwdXQgbmFtZXMgb2YgdGhlIGxvYWRlZCBldmFsIG1vZGVsLiBJcyBhbiBlbXB0eSBhcnJheSBpZiBubyBldmFsIG1vZGVsIGlzIGxvYWRlZC5cbiAgICovXG4gIHJlYWRvbmx5IGV2YWxPdXRwdXROYW1lczogcmVhZG9ubHkgc3RyaW5nW107XG5cbiAgLy8gI2VuZHJlZ2lvblxufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIG9wdGlvbmFsIHBhcmFtZXRlcnMgdGhhdCBjYW4gYmUgcGFzc2VkIGludG8gdGhlIFRyYWluaW5nU2Vzc2lvbkZhY3RvcnkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHJhaW5pbmdTZXNzaW9uQ3JlYXRlT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBVUkkgb3IgYnVmZmVyIGZvciBhIC5ja3B0IGZpbGUgdGhhdCBjb250YWlucyB0aGUgY2hlY2twb2ludCBmb3IgdGhlIHRyYWluaW5nIG1vZGVsLlxuICAgKi9cbiAgY2hlY2twb2ludFN0YXRlOiBUcmFpbmluZ1Nlc3Npb24uVVJJb3JCdWZmZXI7XG4gIC8qKlxuICAgKiBVUkkgb3IgYnVmZmVyIGZvciB0aGUgLm9ubnggdHJhaW5pbmcgZmlsZS5cbiAgICovXG4gIHRyYWluTW9kZWw6IFRyYWluaW5nU2Vzc2lvbi5VUklvckJ1ZmZlcjtcbiAgLyoqXG4gICAqIE9wdGlvbmFsLiBVUkkgb3IgYnVmZmVyIGZvciB0aGUgLm9ubnggb3B0aW1pemVyIG1vZGVsIGZpbGUuXG4gICAqL1xuICBvcHRpbWl6ZXJNb2RlbD86IFRyYWluaW5nU2Vzc2lvbi5VUklvckJ1ZmZlcjtcbiAgLyoqXG4gICAqIE9wdGlvbmFsLiBVUkkgb3IgYnVmZmVyIGZvciB0aGUgLm9ubnggZXZhbCBtb2RlbCBmaWxlLlxuICAgKi9cbiAgZXZhbE1vZGVsPzogVHJhaW5pbmdTZXNzaW9uLlVSSW9yQnVmZmVyO1xufVxuXG4vKipcbiAqIERlZmluZXMgbWV0aG9kIG92ZXJsb2FkIHBvc3NpYmlsaXRpZXMgZm9yIGNyZWF0aW5nIGEgVHJhaW5pbmdTZXNzaW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRyYWluaW5nU2Vzc2lvbkZhY3Rvcnkge1xuICAvLyAjcmVnaW9uIGNyZWF0ZSgpXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgVHJhaW5pbmdTZXNzaW9uIGFuZCBhc3luY2hyb25vdXNseSBsb2FkcyBhbnkgbW9kZWxzIHBhc3NlZCBpbiB0aHJvdWdoIHRyYWluaW5nT3B0aW9uc1xuICAgKlxuICAgKiBAcGFyYW0gdHJhaW5pbmdPcHRpb25zIHNwZWNpZnkgbW9kZWxzIGFuZCBjaGVja3BvaW50cyB0byBsb2FkIGludG8gdGhlIFRyYWluaW5nIFNlc3Npb25cbiAgICogQHBhcmFtIHNlc3Npb25PcHRpb25zIHNwZWNpZnkgY29uZmlndXJhdGlvbiBmb3IgdHJhaW5pbmcgc2Vzc2lvbiBiZWhhdmlvclxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBUcmFpbmluZ1Nlc3Npb24gb2JqZWN0XG4gICAqL1xuICBjcmVhdGUodHJhaW5pbmdPcHRpb25zOiBUcmFpbmluZ1Nlc3Npb25DcmVhdGVPcHRpb25zLCBzZXNzaW9uT3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOlxuICAgICAgUHJvbWlzZTxUcmFpbmluZ1Nlc3Npb24+O1xuXG4gIC8vICNlbmRyZWdpb25cbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxuZXhwb3J0IGNvbnN0IFRyYWluaW5nU2Vzc2lvbjogVHJhaW5pbmdTZXNzaW9uRmFjdG9yeSA9IFRyYWluaW5nU2Vzc2lvbkltcGw7XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbi8qKlxuICogIyBPTk5YIFJ1bnRpbWUgSmF2YVNjcmlwdCBBUElcbiAqXG4gKiBPTk5YIFJ1bnRpbWUgSmF2YVNjcmlwdCBBUEkgaXMgYSB1bmlmaWVkIEFQSSBmb3IgYWxsIEphdmFTY3JpcHQgdXNhZ2VzLCBpbmNsdWRpbmcgdGhlIGZvbGxvd2luZyBOUE0gcGFja2FnZXM6XG4gKlxuICogLSBbb25ueHJ1bnRpbWUtbm9kZV0oaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2Uvb25ueHJ1bnRpbWUtbm9kZSlcbiAqIC0gW29ubnhydW50aW1lLXdlYl0oaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2Uvb25ueHJ1bnRpbWUtd2ViKVxuICogLSBbb25ueHJ1bnRpbWUtcmVhY3QtbmF0aXZlXShodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9vbm54cnVudGltZS1yZWFjdC1uYXRpdmUpXG4gKlxuICogU2VlIGFsc286XG4gKiAtIFtHZXQgU3RhcnRlZF0oaHR0cHM6Ly9vbm54cnVudGltZS5haS9kb2NzL2dldC1zdGFydGVkL3dpdGgtamF2YXNjcmlwdC5odG1sKVxuICogLSBbSW5mZXJlbmNlIGV4YW1wbGVzXShodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L29ubnhydW50aW1lLWluZmVyZW5jZS1leGFtcGxlcy90cmVlL21haW4vanMpXG4gKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKi9cblxuZXhwb3J0ICogZnJvbSAnLi9iYWNrZW5kLmpzJztcbmV4cG9ydCAqIGZyb20gJy4vZW52LmpzJztcbmV4cG9ydCAqIGZyb20gJy4vaW5mZXJlbmNlLXNlc3Npb24uanMnO1xuZXhwb3J0ICogZnJvbSAnLi90ZW5zb3IuanMnO1xuZXhwb3J0ICogZnJvbSAnLi90cmFjZS5qcyc7XG5leHBvcnQgKiBmcm9tICcuL29ubngtdmFsdWUuanMnO1xuZXhwb3J0ICogZnJvbSAnLi90cmFpbmluZy1zZXNzaW9uLmpzJztcbiIsICJleHBvcnQgY29uc3QgY3B1cyA9IHVuZGVmaW5lZDsiLCAiZXhwb3J0IGNvbnN0IHJlYWRGaWxlID0gdW5kZWZpbmVkO2V4cG9ydCBjb25zdCByZWFkRmlsZVN5bmMgPSB1bmRlZmluZWQ7ZXhwb3J0IGNvbnN0IGNyZWF0ZVJlYWRTdHJlYW0gPSB1bmRlZmluZWQ7IiwgImV4cG9ydCBjb25zdCBqb2luID0gdW5kZWZpbmVkOyIsICJcbnZhciBvcnRXYXNtID0gKCgpID0+IHtcbiAgdmFyIF9zY3JpcHREaXIgPSB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LmN1cnJlbnRTY3JpcHQgPyBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyA6IHVuZGVmaW5lZDtcbiAgaWYgKHR5cGVvZiBfX2ZpbGVuYW1lICE9PSAndW5kZWZpbmVkJykgX3NjcmlwdERpciA9IF9zY3JpcHREaXIgfHwgX19maWxlbmFtZTtcbiAgcmV0dXJuIChcbmZ1bmN0aW9uKG1vZHVsZUFyZyA9IHt9KSB7XG5cbnZhciBnPW1vZHVsZUFyZyxhYSxsO2cucmVhZHk9bmV3IFByb21pc2UoKGEsYik9PnthYT1hO2w9Yn0pO3ZhciBiYT1PYmplY3QuYXNzaWduKHt9LGcpLGNhPVwiLi90aGlzLnByb2dyYW1cIixkYT1cIm9iamVjdFwiPT10eXBlb2Ygd2luZG93LHA9XCJmdW5jdGlvblwiPT10eXBlb2YgaW1wb3J0U2NyaXB0cyxlYT1cIm9iamVjdFwiPT10eXBlb2YgcHJvY2VzcyYmXCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMmJlwic3RyaW5nXCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zLm5vZGUsdD1cIlwiLGZhLHcseDtcbmlmKGVhKXt2YXIgZnM9cmVxdWlyZShcImZzXCIpLGhhPXJlcXVpcmUoXCJwYXRoXCIpO3Q9cD9oYS5kaXJuYW1lKHQpK1wiL1wiOl9fZGlybmFtZStcIi9cIjtmYT0oYSxiKT0+e2E9eihhKT9uZXcgVVJMKGEpOmhhLm5vcm1hbGl6ZShhKTtyZXR1cm4gZnMucmVhZEZpbGVTeW5jKGEsYj92b2lkIDA6XCJ1dGY4XCIpfTt4PWE9PnthPWZhKGEsITApO2EuYnVmZmVyfHwoYT1uZXcgVWludDhBcnJheShhKSk7cmV0dXJuIGF9O3c9KGEsYixjLGQ9ITApPT57YT16KGEpP25ldyBVUkwoYSk6aGEubm9ybWFsaXplKGEpO2ZzLnJlYWRGaWxlKGEsZD92b2lkIDA6XCJ1dGY4XCIsKGUsaCk9PntlP2MoZSk6YihkP2guYnVmZmVyOmgpfSl9OyFnLnRoaXNQcm9ncmFtJiYxPHByb2Nlc3MuYXJndi5sZW5ndGgmJihjYT1wcm9jZXNzLmFyZ3ZbMV0ucmVwbGFjZSgvXFxcXC9nLFwiL1wiKSk7cHJvY2Vzcy5hcmd2LnNsaWNlKDIpO2cuaW5zcGVjdD0oKT0+XCJbRW1zY3JpcHRlbiBNb2R1bGUgb2JqZWN0XVwifWVsc2UgaWYoZGF8fFxucClwP3Q9c2VsZi5sb2NhdGlvbi5ocmVmOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBkb2N1bWVudCYmZG9jdW1lbnQuY3VycmVudFNjcmlwdCYmKHQ9ZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmMpLF9zY3JpcHREaXImJih0PV9zY3JpcHREaXIpLDAhPT10LmluZGV4T2YoXCJibG9iOlwiKT90PXQuc3Vic3RyKDAsdC5yZXBsYWNlKC9bPyNdLiovLFwiXCIpLmxhc3RJbmRleE9mKFwiL1wiKSsxKTp0PVwiXCIsZmE9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnNlbmQobnVsbCk7cmV0dXJuIGIucmVzcG9uc2VUZXh0fSxwJiYoeD1hPT57dmFyIGI9bmV3IFhNTEh0dHBSZXF1ZXN0O2Iub3BlbihcIkdFVFwiLGEsITEpO2IucmVzcG9uc2VUeXBlPVwiYXJyYXlidWZmZXJcIjtiLnNlbmQobnVsbCk7cmV0dXJuIG5ldyBVaW50OEFycmF5KGIucmVzcG9uc2UpfSksdz0oYSxiLGMpPT57dmFyIGQ9bmV3IFhNTEh0dHBSZXF1ZXN0O2Qub3BlbihcIkdFVFwiLGEsITApO2QucmVzcG9uc2VUeXBlPVxuXCJhcnJheWJ1ZmZlclwiO2Qub25sb2FkPSgpPT57MjAwPT1kLnN0YXR1c3x8MD09ZC5zdGF0dXMmJmQucmVzcG9uc2U/YihkLnJlc3BvbnNlKTpjKCl9O2Qub25lcnJvcj1jO2Quc2VuZChudWxsKX07dmFyIGlhPWNvbnNvbGUubG9nLmJpbmQoY29uc29sZSksQT1jb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSk7T2JqZWN0LmFzc2lnbihnLGJhKTtiYT1udWxsO1wib2JqZWN0XCIhPXR5cGVvZiBXZWJBc3NlbWJseSYmamEoXCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkXCIpO3ZhciBCLGthPSExLEMsRCxFLEcsSSxKLGxhLG1hLG5hLG9hO1xuZnVuY3Rpb24gcGEoKXt2YXIgYT1CLmJ1ZmZlcjtnLkhFQVA4PUM9bmV3IEludDhBcnJheShhKTtnLkhFQVAxNj1FPW5ldyBJbnQxNkFycmF5KGEpO2cuSEVBUFU4PUQ9bmV3IFVpbnQ4QXJyYXkoYSk7Zy5IRUFQVTE2PUc9bmV3IFVpbnQxNkFycmF5KGEpO2cuSEVBUDMyPUk9bmV3IEludDMyQXJyYXkoYSk7Zy5IRUFQVTMyPUo9bmV3IFVpbnQzMkFycmF5KGEpO2cuSEVBUEYzMj1sYT1uZXcgRmxvYXQzMkFycmF5KGEpO2cuSEVBUEY2ND1vYT1uZXcgRmxvYXQ2NEFycmF5KGEpO2cuSEVBUDY0PW1hPW5ldyBCaWdJbnQ2NEFycmF5KGEpO2cuSEVBUFU2ND1uYT1uZXcgQmlnVWludDY0QXJyYXkoYSl9dmFyIHFhPVtdLHJhPVtdLHNhPVtdLEs9MCx0YT1udWxsLEw9bnVsbDtcbmZ1bmN0aW9uIGphKGEpe2E9XCJBYm9ydGVkKFwiK2ErXCIpXCI7QShhKTtrYT0hMDthPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3IoYStcIi4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby5cIik7bChhKTt0aHJvdyBhO312YXIgdWE9YT0+YS5zdGFydHNXaXRoKFwiZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LFwiKSx6PWE9PmEuc3RhcnRzV2l0aChcImZpbGU6Ly9cIiksTTtNPVwib3J0LXdhc20ud2FzbVwiO2lmKCF1YShNKSl7dmFyIHZhPU07TT1nLmxvY2F0ZUZpbGU/Zy5sb2NhdGVGaWxlKHZhLHQpOnQrdmF9ZnVuY3Rpb24gd2EoYSl7aWYoeClyZXR1cm4geChhKTt0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjt9XG5mdW5jdGlvbiB4YShhKXtpZihkYXx8cCl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZmV0Y2gmJiF6KGEpKXJldHVybiBmZXRjaChhLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGI9PntpZighYi5vayl0aHJvd1wiZmFpbGVkIHRvIGxvYWQgd2FzbSBiaW5hcnkgZmlsZSBhdCAnXCIrYStcIidcIjtyZXR1cm4gYi5hcnJheUJ1ZmZlcigpfSkuY2F0Y2goKCk9PndhKGEpKTtpZih3KXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e3coYSxkPT5iKG5ldyBVaW50OEFycmF5KGQpKSxjKX0pfXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT53YShhKSl9ZnVuY3Rpb24geWEoYSxiLGMpe3JldHVybiB4YShhKS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGQsYikpLnRoZW4oZD0+ZCkudGhlbihjLGQ9PntBKGBmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAke2R9YCk7amEoZCl9KX1cbmZ1bmN0aW9uIHphKGEsYil7dmFyIGM9TTtyZXR1cm5cImZ1bmN0aW9uXCIhPXR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZ3x8dWEoYyl8fHooYyl8fGVhfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBmZXRjaD95YShjLGEsYik6ZmV0Y2goYyx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSkudGhlbihkPT5XZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhkLGEpLnRoZW4oYixmdW5jdGlvbihlKXtBKGB3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogJHtlfWApO0EoXCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvblwiKTtyZXR1cm4geWEoYyxhLGIpfSkpfVxudmFyIEFhPXs4OTA4MjQ6KGEsYixjLGQpPT57aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIGd8fCFnLmNiKXJldHVybiAxO2E9TihhPj4+MCk7YS5zdGFydHNXaXRoKFwiLi9cIikmJihhPWEuc3Vic3RyaW5nKDIpKTthPWcuY2IuZ2V0KGEpO2lmKCFhKXJldHVybiAyO2I+Pj49MDtjPj4+PTA7aWYoYitjPmEuYnl0ZUxlbmd0aClyZXR1cm4gMzt0cnl7cmV0dXJuIEQuc2V0KGEuc3ViYXJyYXkoYixiK2MpLGQ+Pj4wPj4+MCksMH1jYXRjaHtyZXR1cm4gNH19fTtmdW5jdGlvbiBCYShhKXt0aGlzLlVhPWEtMjQ7dGhpcy5mYj1mdW5jdGlvbihiKXtKW3RoaXMuVWErND4+PjI+Pj4wXT1ifTt0aGlzLmViPWZ1bmN0aW9uKGIpe0pbdGhpcy5VYSs4Pj4+Mj4+PjBdPWJ9O3RoaXMuWWE9ZnVuY3Rpb24oYixjKXt0aGlzLlphKCk7dGhpcy5mYihiKTt0aGlzLmViKGMpfTt0aGlzLlphPWZ1bmN0aW9uKCl7Slt0aGlzLlVhKzE2Pj4+Mj4+PjBdPTB9fVxudmFyIENhPTAsRGE9MCxFYT1cInVuZGVmaW5lZFwiIT10eXBlb2YgVGV4dERlY29kZXI/bmV3IFRleHREZWNvZGVyKFwidXRmOFwiKTp2b2lkIDAsRmE9KGEsYixjKT0+e2I+Pj49MDt2YXIgZD1iK2M7Zm9yKGM9YjthW2NdJiYhKGM+PWQpOykrK2M7aWYoMTY8Yy1iJiZhLmJ1ZmZlciYmRWEpcmV0dXJuIEVhLmRlY29kZShhLnN1YmFycmF5KGIsYykpO2ZvcihkPVwiXCI7YjxjOyl7dmFyIGU9YVtiKytdO2lmKGUmMTI4KXt2YXIgaD1hW2IrK10mNjM7aWYoMTkyPT0oZSYyMjQpKWQrPVN0cmluZy5mcm9tQ2hhckNvZGUoKGUmMzEpPDw2fGgpO2Vsc2V7dmFyIGs9YVtiKytdJjYzO2U9MjI0PT0oZSYyNDApPyhlJjE1KTw8MTJ8aDw8NnxrOihlJjcpPDwxOHxoPDwxMnxrPDw2fGFbYisrXSY2Mzs2NTUzNj5lP2QrPVN0cmluZy5mcm9tQ2hhckNvZGUoZSk6KGUtPTY1NTM2LGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8ZT4+MTAsNTYzMjB8ZSYxMDIzKSl9fWVsc2UgZCs9U3RyaW5nLmZyb21DaGFyQ29kZShlKX1yZXR1cm4gZH0sXG5OPShhLGIpPT4oYT4+Pj0wKT9GYShELGEsYik6XCJcIixPPWE9Pntmb3IodmFyIGI9MCxjPTA7YzxhLmxlbmd0aDsrK2Mpe3ZhciBkPWEuY2hhckNvZGVBdChjKTsxMjc+PWQ/YisrOjIwNDc+PWQ/Yis9Mjo1NTI5Njw9ZCYmNTczNDM+PWQ/KGIrPTQsKytjKTpiKz0zfXJldHVybiBifSxQPShhLGIsYyxkKT0+e2M+Pj49MDtpZighKDA8ZCkpcmV0dXJuIDA7dmFyIGU9YztkPWMrZC0xO2Zvcih2YXIgaD0wO2g8YS5sZW5ndGg7KytoKXt2YXIgaz1hLmNoYXJDb2RlQXQoaCk7aWYoNTUyOTY8PWsmJjU3MzQzPj1rKXt2YXIgbT1hLmNoYXJDb2RlQXQoKytoKTtrPTY1NTM2KygoayYxMDIzKTw8MTApfG0mMTAyM31pZigxMjc+PWspe2lmKGM+PWQpYnJlYWs7YltjKys+Pj4wXT1rfWVsc2V7aWYoMjA0Nz49ayl7aWYoYysxPj1kKWJyZWFrO2JbYysrPj4+MF09MTkyfGs+PjZ9ZWxzZXtpZig2NTUzNT49ayl7aWYoYysyPj1kKWJyZWFrO2JbYysrPj4+MF09MjI0fGs+PjEyfWVsc2V7aWYoYyszPj1cbmQpYnJlYWs7YltjKys+Pj4wXT0yNDB8az4+MTg7YltjKys+Pj4wXT0xMjh8az4+MTImNjN9YltjKys+Pj4wXT0xMjh8az4+NiY2M31iW2MrKz4+PjBdPTEyOHxrJjYzfX1iW2M+Pj4wXT0wO3JldHVybiBjLWV9LEdhPWE9PntpZihudWxsPT09YSlyZXR1cm5cIm51bGxcIjt2YXIgYj10eXBlb2YgYTtyZXR1cm5cIm9iamVjdFwiPT09Ynx8XCJhcnJheVwiPT09Ynx8XCJmdW5jdGlvblwiPT09Yj9hLnRvU3RyaW5nKCk6XCJcIithfSxIYSxRPWE9Pntmb3IodmFyIGI9XCJcIjtEW2E+Pj4wXTspYis9SGFbRFthKys+Pj4wXV07cmV0dXJuIGJ9LElhPXt9LEphPXt9LEthPXt9LFI7XG5mdW5jdGlvbiBMYShhLGIsYz17fSl7dmFyIGQ9Yi5uYW1lO2lmKCFhKXRocm93IG5ldyBSKGB0eXBlIFwiJHtkfVwiIG11c3QgaGF2ZSBhIHBvc2l0aXZlIGludGVnZXIgdHlwZWlkIHBvaW50ZXJgKTtpZihKYS5oYXNPd25Qcm9wZXJ0eShhKSl7aWYoYy5nYilyZXR1cm47dGhyb3cgbmV3IFIoYENhbm5vdCByZWdpc3RlciB0eXBlICcke2R9JyB0d2ljZWApO31KYVthXT1iO2RlbGV0ZSBLYVthXTtJYS5oYXNPd25Qcm9wZXJ0eShhKSYmKGI9SWFbYV0sZGVsZXRlIElhW2FdLGIuZm9yRWFjaChlPT5lKCkpKX1mdW5jdGlvbiBTKGEsYixjPXt9KXtpZighKFwiYXJnUGFja0FkdmFuY2VcImluIGIpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJyZWdpc3RlclR5cGUgcmVnaXN0ZXJlZEluc3RhbmNlIHJlcXVpcmVzIGFyZ1BhY2tBZHZhbmNlXCIpO0xhKGEsYixjKX1cbnZhciBNYT0oYSxiLGMpPT57c3dpdGNoKGIpe2Nhc2UgMTpyZXR1cm4gYz9kPT5DW2Q+Pj4wPj4+MF06ZD0+RFtkPj4+MD4+PjBdO2Nhc2UgMjpyZXR1cm4gYz9kPT5FW2Q+Pj4xPj4+MF06ZD0+R1tkPj4+MT4+PjBdO2Nhc2UgNDpyZXR1cm4gYz9kPT5JW2Q+Pj4yPj4+MF06ZD0+SltkPj4+Mj4+PjBdO2Nhc2UgODpyZXR1cm4gYz9kPT5tYVtkPj4+M106ZD0+bmFbZD4+PjNdO2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcihgaW52YWxpZCBpbnRlZ2VyIHdpZHRoICgke2J9KTogJHthfWApO319O2Z1bmN0aW9uIE5hKCl7dGhpcy5SYT1bdm9pZCAwXTt0aGlzLmFiPVtdfXZhciBUPW5ldyBOYTtmdW5jdGlvbiBPYShhKXthPj4+PTA7YT49VC5VYSYmMD09PS0tVC5nZXQoYSkuYmImJlQuWmEoYSl9XG52YXIgVT1hPT57aWYoIWEpdGhyb3cgbmV3IFIoXCJDYW5ub3QgdXNlIGRlbGV0ZWQgdmFsLiBoYW5kbGUgPSBcIithKTtyZXR1cm4gVC5nZXQoYSkudmFsdWV9LFY9YT0+e3N3aXRjaChhKXtjYXNlIHZvaWQgMDpyZXR1cm4gMTtjYXNlIG51bGw6cmV0dXJuIDI7Y2FzZSAhMDpyZXR1cm4gMztjYXNlICExOnJldHVybiA0O2RlZmF1bHQ6cmV0dXJuIFQuWWEoe2JiOjEsdmFsdWU6YX0pfX07ZnVuY3Rpb24gUGEoYSl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKElbYT4+PjI+Pj4wXSl9dmFyIFFhPShhLGIpPT57c3dpdGNoKGIpe2Nhc2UgNDpyZXR1cm4gZnVuY3Rpb24oYyl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKGxhW2M+Pj4yPj4+MF0pfTtjYXNlIDg6cmV0dXJuIGZ1bmN0aW9uKGMpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZShvYVtjPj4+Mz4+PjBdKX07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGZsb2F0IHdpZHRoICgke2J9KTogJHthfWApO319O1xuZnVuY3Rpb24gUmEoYSl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKEpbYT4+PjI+Pj4wXSl9XG52YXIgU2E9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0Zi0xNmxlXCIpOnZvaWQgMCxUYT0oYSxiKT0+e3ZhciBjPWE+PjE7Zm9yKHZhciBkPWMrYi8yOyEoYz49ZCkmJkdbYz4+PjBdOykrK2M7Yzw8PTE7aWYoMzI8Yy1hJiZTYSlyZXR1cm4gU2EuZGVjb2RlKEQuc3ViYXJyYXkoYT4+PjAsYz4+PjApKTtjPVwiXCI7Zm9yKGQ9MDshKGQ+PWIvMik7KytkKXt2YXIgZT1FW2ErMipkPj4+MT4+PjBdO2lmKDA9PWUpYnJlYWs7Yys9U3RyaW5nLmZyb21DaGFyQ29kZShlKX1yZXR1cm4gY30sVWE9KGEsYixjKT0+e2M/Pz0yMTQ3NDgzNjQ3O2lmKDI+YylyZXR1cm4gMDtjLT0yO3ZhciBkPWI7Yz1jPDIqYS5sZW5ndGg/Yy8yOmEubGVuZ3RoO2Zvcih2YXIgZT0wO2U8YzsrK2UpRVtiPj4+MT4+PjBdPWEuY2hhckNvZGVBdChlKSxiKz0yO0VbYj4+PjE+Pj4wXT0wO3JldHVybiBiLWR9LFZhPWE9PjIqYS5sZW5ndGgsV2E9KGEsYik9Pntmb3IodmFyIGM9XG4wLGQ9XCJcIjshKGM+PWIvNCk7KXt2YXIgZT1JW2ErNCpjPj4+Mj4+PjBdO2lmKDA9PWUpYnJlYWs7KytjOzY1NTM2PD1lPyhlLT02NTUzNixkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGU+PjEwLDU2MzIwfGUmMTAyMykpOmQrPVN0cmluZy5mcm9tQ2hhckNvZGUoZSl9cmV0dXJuIGR9LFhhPShhLGIsYyk9PntiPj4+PTA7Yz8/PTIxNDc0ODM2NDc7aWYoND5jKXJldHVybiAwO3ZhciBkPWI7Yz1kK2MtNDtmb3IodmFyIGU9MDtlPGEubGVuZ3RoOysrZSl7dmFyIGg9YS5jaGFyQ29kZUF0KGUpO2lmKDU1Mjk2PD1oJiY1NzM0Mz49aCl7dmFyIGs9YS5jaGFyQ29kZUF0KCsrZSk7aD02NTUzNisoKGgmMTAyMyk8PDEwKXxrJjEwMjN9SVtiPj4+Mj4+PjBdPWg7Yis9NDtpZihiKzQ+YylicmVha31JW2I+Pj4yPj4+MF09MDtyZXR1cm4gYi1kfSxZYT1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZD1hLmNoYXJDb2RlQXQoYyk7NTUyOTY8PWQmJjU3MzQzPj1kJiZcbisrYztiKz00fXJldHVybiBifSwkYT0oYSxiKT0+e3ZhciBjPUphW2FdO2lmKHZvaWQgMD09PWMpdGhyb3cgYT1aYShhKSxjPVEoYSksVyhhKSxuZXcgUihiK1wiIGhhcyB1bmtub3duIHR5cGUgXCIrYyk7cmV0dXJuIGN9LGFiPShhLGIsYyk9Pnt2YXIgZD1bXTthPWEudG9XaXJlVHlwZShkLGMpO2QubGVuZ3RoJiYoSltiPj4+Mj4+PjBdPVYoZCkpO3JldHVybiBhfSxYPVtdLGNiPXt9LGRiPWE9Pnt2YXIgYj1jYlthXTtyZXR1cm4gdm9pZCAwPT09Yj9RKGEpOmJ9LGViPSgpPT5cIm9iamVjdFwiPT10eXBlb2YgZ2xvYmFsVGhpcz9nbG9iYWxUaGlzOkZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSxmYj1hPT57dmFyIGI9WC5sZW5ndGg7WC5wdXNoKGEpO3JldHVybiBifSxnYj0oYSxiKT0+e2Zvcih2YXIgYz1BcnJheShhKSxkPTA7ZDxhOysrZCljW2RdPSRhKEpbYis0KmQ+Pj4yPj4+MF0sXCJwYXJhbWV0ZXIgXCIrZCk7cmV0dXJuIGN9LGhiPShhLGIpPT5PYmplY3QuZGVmaW5lUHJvcGVydHkoYixcblwibmFtZVwiLHt2YWx1ZTphfSk7ZnVuY3Rpb24gaWIoYSl7dmFyIGI9RnVuY3Rpb247aWYoIShiIGluc3RhbmNlb2YgRnVuY3Rpb24pKXRocm93IG5ldyBUeXBlRXJyb3IoYG5ld18gY2FsbGVkIHdpdGggY29uc3RydWN0b3IgdHlwZSAke3R5cGVvZiBifSB3aGljaCBpcyBub3QgYSBmdW5jdGlvbmApO3ZhciBjPWhiKGIubmFtZXx8XCJ1bmtub3duRnVuY3Rpb25OYW1lXCIsZnVuY3Rpb24oKXt9KTtjLnByb3RvdHlwZT1iLnByb3RvdHlwZTtjPW5ldyBjO2E9Yi5hcHBseShjLGEpO3JldHVybiBhIGluc3RhbmNlb2YgT2JqZWN0P2E6Y31cbnZhciBZPWE9PjA9PT1hJTQmJigwIT09YSUxMDB8fDA9PT1hJTQwMCksamI9WzAsMzEsNjAsOTEsMTIxLDE1MiwxODIsMjEzLDI0NCwyNzQsMzA1LDMzNV0sa2I9WzAsMzEsNTksOTAsMTIwLDE1MSwxODEsMjEyLDI0MywyNzMsMzA0LDMzNF0sbWI9YT0+e3ZhciBiPU8oYSkrMSxjPWxiKGIpO2MmJlAoYSxELGMsYik7cmV0dXJuIGN9LG5iPVtdLG9iPXt9LHFiPSgpPT57aWYoIXBiKXt2YXIgYT17VVNFUjpcIndlYl91c2VyXCIsTE9HTkFNRTpcIndlYl91c2VyXCIsUEFUSDpcIi9cIixQV0Q6XCIvXCIsSE9NRTpcIi9ob21lL3dlYl91c2VyXCIsTEFORzooXCJvYmplY3RcIj09dHlwZW9mIG5hdmlnYXRvciYmbmF2aWdhdG9yLmxhbmd1YWdlcyYmbmF2aWdhdG9yLmxhbmd1YWdlc1swXXx8XCJDXCIpLnJlcGxhY2UoXCItXCIsXCJfXCIpK1wiLlVURi04XCIsXzpjYXx8XCIuL3RoaXMucHJvZ3JhbVwifSxiO2ZvcihiIGluIG9iKXZvaWQgMD09PW9iW2JdP2RlbGV0ZSBhW2JdOmFbYl09b2JbYl07dmFyIGM9W107Zm9yKGIgaW4gYSljLnB1c2goYCR7Yn09JHthW2JdfWApO1xucGI9Y31yZXR1cm4gcGJ9LHBiLHJiPVtudWxsLFtdLFtdXSxzYj1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdLHRiPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07ZnVuY3Rpb24gdWIoYSl7dmFyIGI9QXJyYXkoTyhhKSsxKTtQKGEsYiwwLGIubGVuZ3RoKTtyZXR1cm4gYn1cbmZ1bmN0aW9uIHZiKGEsYixjLGQpe2Z1bmN0aW9uIGUoZixyLHUpe2ZvcihmPVwibnVtYmVyXCI9PXR5cGVvZiBmP2YudG9TdHJpbmcoKTpmfHxcIlwiO2YubGVuZ3RoPHI7KWY9dVswXStmO3JldHVybiBmfWZ1bmN0aW9uIGgoZixyKXtyZXR1cm4gZShmLHIsXCIwXCIpfWZ1bmN0aW9uIGsoZixyKXtmdW5jdGlvbiB1KGJiKXtyZXR1cm4gMD5iYj8tMTowPGJiPzE6MH12YXIgSDswPT09KEg9dShmLmdldEZ1bGxZZWFyKCktci5nZXRGdWxsWWVhcigpKSkmJjA9PT0oSD11KGYuZ2V0TW9udGgoKS1yLmdldE1vbnRoKCkpKSYmKEg9dShmLmdldERhdGUoKS1yLmdldERhdGUoKSkpO3JldHVybiBIfWZ1bmN0aW9uIG0oZil7c3dpdGNoKGYuZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gZjtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLFxuMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiBxKGYpe3ZhciByPWYuU2E7Zm9yKGY9bmV3IERhdGUoKG5ldyBEYXRlKGYuVGErMTkwMCwwLDEpKS5nZXRUaW1lKCkpOzA8cjspe3ZhciB1PWYuZ2V0TW9udGgoKSxIPShZKGYuZ2V0RnVsbFllYXIoKSk/c2I6dGIpW3VdO2lmKHI+SC1mLmdldERhdGUoKSlyLT1ILWYuZ2V0RGF0ZSgpKzEsZi5zZXREYXRlKDEpLDExPnU/Zi5zZXRNb250aCh1KzEpOihmLnNldE1vbnRoKDApLGYuc2V0RnVsbFllYXIoZi5nZXRGdWxsWWVhcigpKzEpKTtlbHNle2Yuc2V0RGF0ZShmLmdldERhdGUoKStyKTticmVha319dT1uZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCkrMSwwLDQpO3I9bShuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksXG4wLDQpKTt1PW0odSk7cmV0dXJuIDA+PWsocixmKT8wPj1rKHUsZik/Zi5nZXRGdWxsWWVhcigpKzE6Zi5nZXRGdWxsWWVhcigpOmYuZ2V0RnVsbFllYXIoKS0xfWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDt2YXIgbj1KW2QrNDA+Pj4yPj4+MF07ZD17a2I6SVtkPj4+Mj4+PjBdLGpiOklbZCs0Pj4+Mj4+PjBdLFdhOklbZCs4Pj4+Mj4+PjBdLCRhOklbZCsxMj4+PjI+Pj4wXSxYYTpJW2QrMTY+Pj4yPj4+MF0sVGE6SVtkKzIwPj4+Mj4+PjBdLE5hOklbZCsyND4+PjI+Pj4wXSxTYTpJW2QrMjg+Pj4yPj4+MF0sbWI6SVtkKzMyPj4+Mj4+PjBdLGliOklbZCszNj4+PjI+Pj4wXSxsYjpuP04obik6XCJcIn07Yz1OKGMpO249e1wiJWNcIjpcIiVhICViICVkICVIOiVNOiVTICVZXCIsXCIlRFwiOlwiJW0vJWQvJXlcIixcIiVGXCI6XCIlWS0lbS0lZFwiLFwiJWhcIjpcIiViXCIsXCIlclwiOlwiJUk6JU06JVMgJXBcIixcIiVSXCI6XCIlSDolTVwiLFwiJVRcIjpcIiVIOiVNOiVTXCIsXCIleFwiOlwiJW0vJWQvJXlcIixcIiVYXCI6XCIlSDolTTolU1wiLFxuXCIlRWNcIjpcIiVjXCIsXCIlRUNcIjpcIiVDXCIsXCIlRXhcIjpcIiVtLyVkLyV5XCIsXCIlRVhcIjpcIiVIOiVNOiVTXCIsXCIlRXlcIjpcIiV5XCIsXCIlRVlcIjpcIiVZXCIsXCIlT2RcIjpcIiVkXCIsXCIlT2VcIjpcIiVlXCIsXCIlT0hcIjpcIiVIXCIsXCIlT0lcIjpcIiVJXCIsXCIlT21cIjpcIiVtXCIsXCIlT01cIjpcIiVNXCIsXCIlT1NcIjpcIiVTXCIsXCIlT3VcIjpcIiV1XCIsXCIlT1VcIjpcIiVVXCIsXCIlT1ZcIjpcIiVWXCIsXCIlT3dcIjpcIiV3XCIsXCIlT1dcIjpcIiVXXCIsXCIlT3lcIjpcIiV5XCJ9O2Zvcih2YXIgdiBpbiBuKWM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAodixcImdcIiksblt2XSk7dmFyIHk9XCJTdW5kYXkgTW9uZGF5IFR1ZXNkYXkgV2VkbmVzZGF5IFRodXJzZGF5IEZyaWRheSBTYXR1cmRheVwiLnNwbGl0KFwiIFwiKSxGPVwiSmFudWFyeSBGZWJydWFyeSBNYXJjaCBBcHJpbCBNYXkgSnVuZSBKdWx5IEF1Z3VzdCBTZXB0ZW1iZXIgT2N0b2JlciBOb3ZlbWJlciBEZWNlbWJlclwiLnNwbGl0KFwiIFwiKTtuPXtcIiVhXCI6Zj0+eVtmLk5hXS5zdWJzdHJpbmcoMCwzKSxcIiVBXCI6Zj0+eVtmLk5hXSxcIiViXCI6Zj0+XG5GW2YuWGFdLnN1YnN0cmluZygwLDMpLFwiJUJcIjpmPT5GW2YuWGFdLFwiJUNcIjpmPT5oKChmLlRhKzE5MDApLzEwMHwwLDIpLFwiJWRcIjpmPT5oKGYuJGEsMiksXCIlZVwiOmY9PmUoZi4kYSwyLFwiIFwiKSxcIiVnXCI6Zj0+cShmKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcIiVHXCI6Zj0+cShmKSxcIiVIXCI6Zj0+aChmLldhLDIpLFwiJUlcIjpmPT57Zj1mLldhOzA9PWY/Zj0xMjoxMjxmJiYoZi09MTIpO3JldHVybiBoKGYsMil9LFwiJWpcIjpmPT57Zm9yKHZhciByPTAsdT0wO3U8PWYuWGEtMTtyKz0oWShmLlRhKzE5MDApP3NiOnRiKVt1KytdKTtyZXR1cm4gaChmLiRhK3IsMyl9LFwiJW1cIjpmPT5oKGYuWGErMSwyKSxcIiVNXCI6Zj0+aChmLmpiLDIpLFwiJW5cIjooKT0+XCJcXG5cIixcIiVwXCI6Zj0+MDw9Zi5XYSYmMTI+Zi5XYT9cIkFNXCI6XCJQTVwiLFwiJVNcIjpmPT5oKGYua2IsMiksXCIldFwiOigpPT5cIlxcdFwiLFwiJXVcIjpmPT5mLk5hfHw3LFwiJVVcIjpmPT5oKE1hdGguZmxvb3IoKGYuU2ErNy1mLk5hKS83KSwyKSxcIiVWXCI6Zj0+XG57dmFyIHI9TWF0aC5mbG9vcigoZi5TYSs3LShmLk5hKzYpJTcpLzcpOzI+PShmLk5hKzM3MS1mLlNhLTIpJTcmJnIrKztpZihyKTUzPT1yJiYodT0oZi5OYSszNzEtZi5TYSklNyw0PT11fHwzPT11JiZZKGYuVGEpfHwocj0xKSk7ZWxzZXtyPTUyO3ZhciB1PShmLk5hKzctZi5TYS0xKSU3Oyg0PT11fHw1PT11JiZZKGYuVGElNDAwLTEpKSYmcisrfXJldHVybiBoKHIsMil9LFwiJXdcIjpmPT5mLk5hLFwiJVdcIjpmPT5oKE1hdGguZmxvb3IoKGYuU2ErNy0oZi5OYSs2KSU3KS83KSwyKSxcIiV5XCI6Zj0+KGYuVGErMTkwMCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlWVwiOmY9PmYuVGErMTkwMCxcIiV6XCI6Zj0+e2Y9Zi5pYjt2YXIgcj0wPD1mO2Y9TWF0aC5hYnMoZikvNjA7cmV0dXJuKHI/XCIrXCI6XCItXCIpK1N0cmluZyhcIjAwMDBcIisoZi82MCoxMDArZiU2MCkpLnNsaWNlKC00KX0sXCIlWlwiOmY9PmYubGIsXCIlJVwiOigpPT5cIiVcIn07Yz1jLnJlcGxhY2UoLyUlL2csXCJcXHgwMFxceDAwXCIpO2Zvcih2IGluIG4pYy5pbmNsdWRlcyh2KSYmXG4oYz1jLnJlcGxhY2UobmV3IFJlZ0V4cCh2LFwiZ1wiKSxuW3ZdKGQpKSk7Yz1jLnJlcGxhY2UoL1xcMFxcMC9nLFwiJVwiKTt2PXViKGMpO2lmKHYubGVuZ3RoPmIpcmV0dXJuIDA7Qy5zZXQodixhPj4+MCk7cmV0dXJuIHYubGVuZ3RoLTF9Zm9yKHZhciB3Yj1BcnJheSgyNTYpLHhiPTA7MjU2PnhiOysreGIpd2JbeGJdPVN0cmluZy5mcm9tQ2hhckNvZGUoeGIpO0hhPXdiO1I9Zy5CaW5kaW5nRXJyb3I9Y2xhc3MgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3RvcihhKXtzdXBlcihhKTt0aGlzLm5hbWU9XCJCaW5kaW5nRXJyb3JcIn19O2cuSW50ZXJuYWxFcnJvcj1jbGFzcyBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKGEpe3N1cGVyKGEpO3RoaXMubmFtZT1cIkludGVybmFsRXJyb3JcIn19O1xuT2JqZWN0LmFzc2lnbihOYS5wcm90b3R5cGUse2dldChhKXtyZXR1cm4gdGhpcy5SYVthXX0saGFzKGEpe3JldHVybiB2b2lkIDAhPT10aGlzLlJhW2FdfSxZYShhKXt2YXIgYj10aGlzLmFiLnBvcCgpfHx0aGlzLlJhLmxlbmd0aDt0aGlzLlJhW2JdPWE7cmV0dXJuIGJ9LFphKGEpe3RoaXMuUmFbYV09dm9pZCAwO3RoaXMuYWIucHVzaChhKX19KTtULlJhLnB1c2goe3ZhbHVlOnZvaWQgMH0se3ZhbHVlOm51bGx9LHt2YWx1ZTohMH0se3ZhbHVlOiExfSk7VC5VYT1ULlJhLmxlbmd0aDtnLmNvdW50X2VtdmFsX2hhbmRsZXM9KCk9Pntmb3IodmFyIGE9MCxiPVQuVWE7YjxULlJhLmxlbmd0aDsrK2Ipdm9pZCAwIT09VC5SYVtiXSYmKythO3JldHVybiBhfTtcbnZhciB6Yj17YTpmdW5jdGlvbihhLGIsYyl7YT4+Pj0wOyhuZXcgQmEoYSkpLllhKGI+Pj4wLGM+Pj4wKTtDYT1hO0RhKys7dGhyb3cgQ2E7fSx0OmZ1bmN0aW9uKCl7cmV0dXJuIDB9LCQ6ZnVuY3Rpb24oKXt9LE06ZnVuY3Rpb24oKXt9LE86ZnVuY3Rpb24oKXt9LEc6ZnVuY3Rpb24oKXtyZXR1cm4gMH0sWjpmdW5jdGlvbigpe30sVTpmdW5jdGlvbigpe30sWTpmdW5jdGlvbigpe30sQjpmdW5jdGlvbigpe30sTjpmdW5jdGlvbigpe30sSzpmdW5jdGlvbigpe30sXzpmdW5jdGlvbigpe30sTDpmdW5jdGlvbigpe30sRTpmdW5jdGlvbihhLGIsYyxkLGUpe2I+Pj49MDtiPVEoYik7dmFyIGg9LTEhPWIuaW5kZXhPZihcInVcIik7aCYmKGU9KDFuPDw2NG4pLTFuKTtTKGE+Pj4wLHtuYW1lOmIsZnJvbVdpcmVUeXBlOms9PmssdG9XaXJlVHlwZTpmdW5jdGlvbihrLG0pe2lmKFwiYmlnaW50XCIhPXR5cGVvZiBtJiZcIm51bWJlclwiIT10eXBlb2YgbSl0aHJvdyBuZXcgVHlwZUVycm9yKGBDYW5ub3QgY29udmVydCBcIiR7R2EobSl9XCIgdG8gJHt0aGlzLm5hbWV9YCk7XG5pZihtPGR8fG0+ZSl0aHJvdyBuZXcgVHlwZUVycm9yKGBQYXNzaW5nIGEgbnVtYmVyIFwiJHtHYShtKX1cIiBmcm9tIEpTIHNpZGUgdG8gQy9DKysgc2lkZSB0byBhbiBhcmd1bWVudCBvZiB0eXBlIFwiJHtifVwiLCB3aGljaCBpcyBvdXRzaWRlIHRoZSB2YWxpZCByYW5nZSBbJHtkfSwgJHtlfV0hYCk7cmV0dXJuIG19LGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6TWEoYixjPj4+MCwhaCksVmE6bnVsbH0pfSxkYTpmdW5jdGlvbihhLGIsYyxkKXtiPVEoYj4+PjApO1MoYT4+PjAse25hbWU6Yixmcm9tV2lyZVR5cGU6ZnVuY3Rpb24oZSl7cmV0dXJuISFlfSx0b1dpcmVUeXBlOmZ1bmN0aW9uKGUsaCl7cmV0dXJuIGg/YzpkfSxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZShEW2U+Pj4wXSl9LFZhOm51bGx9KX0sY2E6ZnVuY3Rpb24oYSxiKXtiPVEoYj4+PjApO1MoYT4+PjAse25hbWU6YixcbmZyb21XaXJlVHlwZTpjPT57dmFyIGQ9VShjKTtPYShjKTtyZXR1cm4gZH0sdG9XaXJlVHlwZTooYyxkKT0+VihkKSxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOlBhLFZhOm51bGx9KX0sRDpmdW5jdGlvbihhLGIsYyl7Yj1RKGI+Pj4wKTtTKGE+Pj4wLHtuYW1lOmIsZnJvbVdpcmVUeXBlOmQ9PmQsdG9XaXJlVHlwZTooZCxlKT0+ZSxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOlFhKGIsYz4+PjApLFZhOm51bGx9KX0scTpmdW5jdGlvbihhLGIsYyxkLGUpe2E+Pj49MDtjPj4+PTA7Yj1RKGI+Pj4wKTstMT09PWUmJihlPTQyOTQ5NjcyOTUpO2U9bT0+bTtpZigwPT09ZCl7dmFyIGg9MzItOCpjO2U9bT0+bTw8aD4+Pmh9dmFyIGs9Yi5pbmNsdWRlcyhcInVuc2lnbmVkXCIpP2Z1bmN0aW9uKG0scSl7cmV0dXJuIHE+Pj4wfTpmdW5jdGlvbihtLHEpe3JldHVybiBxfTtTKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6ZSx0b1dpcmVUeXBlOmssYXJnUGFja0FkdmFuY2U6OCxcbnJlYWRWYWx1ZUZyb21Qb2ludGVyOk1hKGIsYywwIT09ZCksVmE6bnVsbH0pfSxsOmZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGgpe3JldHVybiBuZXcgZShDLmJ1ZmZlcixKW2grND4+PjI+Pj4wXSxKW2g+Pj4yPj4+MF0pfXZhciBlPVtJbnQ4QXJyYXksVWludDhBcnJheSxJbnQxNkFycmF5LFVpbnQxNkFycmF5LEludDMyQXJyYXksVWludDMyQXJyYXksRmxvYXQzMkFycmF5LEZsb2F0NjRBcnJheSxCaWdJbnQ2NEFycmF5LEJpZ1VpbnQ2NEFycmF5XVtiXTtjPVEoYz4+PjApO1MoYT4+PjAse25hbWU6Yyxmcm9tV2lyZVR5cGU6ZCxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOmR9LHtnYjohMH0pfSxGOmZ1bmN0aW9uKGEsYil7Yj1RKGI+Pj4wKTt2YXIgYz1cInN0ZDo6c3RyaW5nXCI9PT1iO1MoYT4+PjAse25hbWU6Yixmcm9tV2lyZVR5cGU6ZnVuY3Rpb24oZCl7dmFyIGU9SltkPj4+Mj4+PjBdLGg9ZCs0O2lmKGMpZm9yKHZhciBrPWgsbT0wO208PWU7KyttKXt2YXIgcT1cbmgrbTtpZihtPT1lfHwwPT1EW3E+Pj4wXSl7az1OKGsscS1rKTtpZih2b2lkIDA9PT1uKXZhciBuPWs7ZWxzZSBuKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApLG4rPWs7az1xKzF9fWVsc2V7bj1BcnJheShlKTtmb3IobT0wO208ZTsrK20pblttXT1TdHJpbmcuZnJvbUNoYXJDb2RlKERbaCttPj4+MF0pO249bi5qb2luKFwiXCIpfVcoZCk7cmV0dXJuIG59LHRvV2lyZVR5cGU6ZnVuY3Rpb24oZCxlKXtlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXImJihlPW5ldyBVaW50OEFycmF5KGUpKTt2YXIgaD1cInN0cmluZ1wiPT10eXBlb2YgZTtpZighKGh8fGUgaW5zdGFuY2VvZiBVaW50OEFycmF5fHxlIGluc3RhbmNlb2YgVWludDhDbGFtcGVkQXJyYXl8fGUgaW5zdGFuY2VvZiBJbnQ4QXJyYXkpKXRocm93IG5ldyBSKFwiQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBzdGQ6OnN0cmluZ1wiKTt2YXIgaz1jJiZoP08oZSk6ZS5sZW5ndGg7dmFyIG09bGIoNCtrKzEpLHE9bSs0O0pbbT4+PjI+Pj4wXT1rO1xuaWYoYyYmaClQKGUsRCxxLGsrMSk7ZWxzZSBpZihoKWZvcihoPTA7aDxrOysraCl7dmFyIG49ZS5jaGFyQ29kZUF0KGgpO2lmKDI1NTxuKXRocm93IFcocSksbmV3IFIoXCJTdHJpbmcgaGFzIFVURi0xNiBjb2RlIHVuaXRzIHRoYXQgZG8gbm90IGZpdCBpbiA4IGJpdHNcIik7RFtxK2g+Pj4wXT1ufWVsc2UgZm9yKGg9MDtoPGs7KytoKURbcStoPj4+MF09ZVtoXTtudWxsIT09ZCYmZC5wdXNoKFcsbSk7cmV0dXJuIG19LGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6UmEsVmEoZCl7VyhkKX19KX0sdjpmdW5jdGlvbihhLGIsYyl7Yj4+Pj0wO2M+Pj49MDtjPVEoYyk7aWYoMj09PWIpe3ZhciBkPVRhO3ZhciBlPVVhO3ZhciBoPVZhO3ZhciBrPSgpPT5HO3ZhciBtPTF9ZWxzZSA0PT09YiYmKGQ9V2EsZT1YYSxoPVlhLGs9KCk9PkosbT0yKTtTKGE+Pj4wLHtuYW1lOmMsZnJvbVdpcmVUeXBlOnE9Pntmb3IodmFyIG49SltxPj4+Mj4+PjBdLHY9aygpLHksRj1xKzQsZj1cbjA7Zjw9bjsrK2Ype3ZhciByPXErNCtmKmI7aWYoZj09bnx8MD09dltyPj4+bV0pRj1kKEYsci1GKSx2b2lkIDA9PT15P3k9RjooeSs9U3RyaW5nLmZyb21DaGFyQ29kZSgwKSx5Kz1GKSxGPXIrYn1XKHEpO3JldHVybiB5fSx0b1dpcmVUeXBlOihxLG4pPT57aWYoXCJzdHJpbmdcIiE9dHlwZW9mIG4pdGhyb3cgbmV3IFIoYENhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gQysrIHN0cmluZyB0eXBlICR7Y31gKTt2YXIgdj1oKG4pLHk9bGIoNCt2K2IpO0pbeT4+PjJdPXY+Pm07ZShuLHkrNCx2K2IpO251bGwhPT1xJiZxLnB1c2goVyx5KTtyZXR1cm4geX0sYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpQYSxWYShxKXtXKHEpfX0pfSxlYTpmdW5jdGlvbihhLGIpe2I9UShiPj4+MCk7UyhhPj4+MCx7aGI6ITAsbmFtZTpiLGFyZ1BhY2tBZHZhbmNlOjAsZnJvbVdpcmVUeXBlOigpPT57fSx0b1dpcmVUeXBlOigpPT57fX0pfSxhYTooKT0+MSxvOmZ1bmN0aW9uKGEsYixjKXtiPj4+PVxuMDtjPj4+PTA7YT1VKGE+Pj4wKTtiPSRhKGIsXCJlbXZhbDo6YXNcIik7cmV0dXJuIGFiKGIsYyxhKX0seDpmdW5jdGlvbihhLGIsYyxkKXtjPj4+PTA7ZD4+Pj0wO2E9WFthPj4+MF07Yj1VKGI+Pj4wKTtyZXR1cm4gYShudWxsLGIsYyxkKX0sajpmdW5jdGlvbihhLGIsYyxkLGUpe2M+Pj49MDtkPj4+PTA7ZT4+Pj0wO2E9WFthPj4+MF07Yj1VKGI+Pj4wKTtjPWRiKGMpO3JldHVybiBhKGIsYltjXSxkLGUpfSxiOk9hLHc6ZnVuY3Rpb24oYSxiKXtiPj4+PTA7YT1VKGE+Pj4wKTtiPVUoYik7cmV0dXJuIGE9PWJ9LHM6ZnVuY3Rpb24oYSl7YT4+Pj0wO2lmKDA9PT1hKXJldHVybiBWKGViKCkpO2E9ZGIoYSk7cmV0dXJuIFYoZWIoKVthXSl9LGk6ZnVuY3Rpb24oYSxiLGMpe2I9Z2IoYSxiPj4+MCk7dmFyIGQ9Yi5zaGlmdCgpO2EtLTt2YXIgZT1cInJldHVybiBmdW5jdGlvbiAob2JqLCBmdW5jLCBkZXN0cnVjdG9yc1JlZiwgYXJncykge1xcblwiLGg9MCxrPVtdOzA9PT1jJiZrLnB1c2goXCJvYmpcIik7XG5mb3IodmFyIG09W1wicmV0VHlwZVwiXSxxPVtkXSxuPTA7bjxhOysrbilrLnB1c2goXCJhcmdcIituKSxtLnB1c2goXCJhcmdUeXBlXCIrbikscS5wdXNoKGJbbl0pLGUrPWAgIHZhciBhcmcke259ID0gYXJnVHlwZSR7bn0ucmVhZFZhbHVlRnJvbVBvaW50ZXIoYXJncyR7aD9cIitcIitoOlwiXCJ9KTtcXG5gLGgrPWJbbl0uYXJnUGFja0FkdmFuY2U7ZSs9YCAgdmFyIHJ2ID0gJHsxPT09Yz9cIm5ldyBmdW5jXCI6XCJmdW5jLmNhbGxcIn0oJHtrLmpvaW4oXCIsIFwiKX0pO1xcbmA7Zm9yKG49MDtuPGE7KytuKWJbbl0uZGVsZXRlT2JqZWN0JiYoZSs9YCAgYXJnVHlwZSR7bn0uZGVsZXRlT2JqZWN0KGFyZyR7bn0pO1xcbmApO2QuaGJ8fChtLnB1c2goXCJlbXZhbF9yZXR1cm5WYWx1ZVwiKSxxLnB1c2goYWIpLGUrPVwiICByZXR1cm4gZW12YWxfcmV0dXJuVmFsdWUocmV0VHlwZSwgZGVzdHJ1Y3RvcnNSZWYsIHJ2KTtcXG5cIik7bS5wdXNoKGUrXCJ9O1xcblwiKTthPWliKG0pLmFwcGx5KG51bGwscSk7Yz1gbWV0aG9kQ2FsbGVyPCgke2IubWFwKHY9Plxudi5uYW1lKS5qb2luKFwiLCBcIil9KSA9PiAke2QubmFtZX0+YDtyZXR1cm4gZmIoaGIoYyxhKSl9LHA6ZnVuY3Rpb24oYSxiKXtiPj4+PTA7YT1VKGE+Pj4wKTtiPVUoYik7cmV0dXJuIFYoYVtiXSl9LGM6ZnVuY3Rpb24oYSl7YT4+Pj0wOzQ8YSYmKFQuZ2V0KGEpLmJiKz0xKX0scjpmdW5jdGlvbigpe3JldHVybiBWKFtdKX0sazpmdW5jdGlvbihhKXthPVUoYT4+PjApO2Zvcih2YXIgYj1BcnJheShhLmxlbmd0aCksYz0wO2M8YS5sZW5ndGg7YysrKWJbY109YVtjXTtyZXR1cm4gVihiKX0sZDpmdW5jdGlvbihhKXtyZXR1cm4gVihkYihhPj4+MCkpfSxoOmZ1bmN0aW9uKCl7cmV0dXJuIFYoe30pfSxnOmZ1bmN0aW9uKGEpe2E+Pj49MDtmb3IodmFyIGI9VShhKTtiLmxlbmd0aDspe3ZhciBjPWIucG9wKCk7Yi5wb3AoKShjKX1PYShhKX0sZjpmdW5jdGlvbihhLGIsYyl7Yj4+Pj0wO2M+Pj49MDthPVUoYT4+PjApO2I9VShiKTtjPVUoYyk7YVtiXT1jfSxlOmZ1bmN0aW9uKGEsYil7Yj4+Pj1cbjA7YT0kYShhPj4+MCxcIl9lbXZhbF90YWtlX3ZhbHVlXCIpO2E9YS5yZWFkVmFsdWVGcm9tUG9pbnRlcihiKTtyZXR1cm4gVihhKX0sUjpmdW5jdGlvbihhLGIpe2E9LTkwMDcxOTkyNTQ3NDA5OTI+YXx8OTAwNzE5OTI1NDc0MDk5MjxhP05hTjpOdW1iZXIoYSk7Yj4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO0lbYj4+PjI+Pj4wXT1hLmdldFVUQ1NlY29uZHMoKTtJW2IrND4+PjI+Pj4wXT1hLmdldFVUQ01pbnV0ZXMoKTtJW2IrOD4+PjI+Pj4wXT1hLmdldFVUQ0hvdXJzKCk7SVtiKzEyPj4+Mj4+PjBdPWEuZ2V0VVRDRGF0ZSgpO0lbYisxNj4+PjI+Pj4wXT1hLmdldFVUQ01vbnRoKCk7SVtiKzIwPj4+Mj4+PjBdPWEuZ2V0VVRDRnVsbFllYXIoKS0xOTAwO0lbYisyND4+PjI+Pj4wXT1hLmdldFVUQ0RheSgpO0lbYisyOD4+PjI+Pj4wXT0oYS5nZXRUaW1lKCktRGF0ZS5VVEMoYS5nZXRVVENGdWxsWWVhcigpLDAsMSwwLDAsMCwwKSkvODY0RTV8MH0sUzpmdW5jdGlvbihhLGIpe2E9LTkwMDcxOTkyNTQ3NDA5OTI+XG5hfHw5MDA3MTk5MjU0NzQwOTkyPGE/TmFOOk51bWJlcihhKTtiPj4+PTA7YT1uZXcgRGF0ZSgxRTMqYSk7SVtiPj4+Mj4+PjBdPWEuZ2V0U2Vjb25kcygpO0lbYis0Pj4+Mj4+PjBdPWEuZ2V0TWludXRlcygpO0lbYis4Pj4+Mj4+PjBdPWEuZ2V0SG91cnMoKTtJW2IrMTI+Pj4yPj4+MF09YS5nZXREYXRlKCk7SVtiKzE2Pj4+Mj4+PjBdPWEuZ2V0TW9udGgoKTtJW2IrMjA+Pj4yPj4+MF09YS5nZXRGdWxsWWVhcigpLTE5MDA7SVtiKzI0Pj4+Mj4+PjBdPWEuZ2V0RGF5KCk7SVtiKzI4Pj4+Mj4+PjBdPShZKGEuZ2V0RnVsbFllYXIoKSk/amI6a2IpW2EuZ2V0TW9udGgoKV0rYS5nZXREYXRlKCktMXwwO0lbYiszNj4+PjI+Pj4wXT0tKDYwKmEuZ2V0VGltZXpvbmVPZmZzZXQoKSk7dmFyIGM9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGQ9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO0lbYitcbjMyPj4+Mj4+PjBdPShjIT1kJiZhLmdldFRpbWV6b25lT2Zmc2V0KCk9PU1hdGgubWluKGQsYykpfDB9LFQ6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW5ldyBEYXRlKElbYSsyMD4+PjI+Pj4wXSsxOTAwLElbYSsxNj4+PjI+Pj4wXSxJW2ErMTI+Pj4yPj4+MF0sSVthKzg+Pj4yPj4+MF0sSVthKzQ+Pj4yPj4+MF0sSVthPj4+Mj4+PjBdLDApLGM9SVthKzMyPj4+Mj4+PjBdLGQ9Yi5nZXRUaW1lem9uZU9mZnNldCgpLGU9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGg9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGs9TWF0aC5taW4oaCxlKTswPmM/SVthKzMyPj4+Mj4+PjBdPU51bWJlcihlIT1oJiZrPT1kKTowPGMhPShrPT1kKSYmKGU9TWF0aC5tYXgoaCxlKSxiLnNldFRpbWUoYi5nZXRUaW1lKCkrNkU0KigoMDxjP2s6ZSktZCkpKTtJW2ErMjQ+Pj4yPj4+MF09Yi5nZXREYXkoKTtJW2ErXG4yOD4+PjI+Pj4wXT0oWShiLmdldEZ1bGxZZWFyKCkpP2piOmtiKVtiLmdldE1vbnRoKCldK2IuZ2V0RGF0ZSgpLTF8MDtJW2E+Pj4yPj4+MF09Yi5nZXRTZWNvbmRzKCk7SVthKzQ+Pj4yPj4+MF09Yi5nZXRNaW51dGVzKCk7SVthKzg+Pj4yPj4+MF09Yi5nZXRIb3VycygpO0lbYSsxMj4+PjI+Pj4wXT1iLmdldERhdGUoKTtJW2ErMTY+Pj4yPj4+MF09Yi5nZXRNb250aCgpO0lbYSsyMD4+PjI+Pj4wXT1iLmdldFllYXIoKTthPWIuZ2V0VGltZSgpO2lzTmFOKGEpPyhJW3liKCk+Pj4yPj4+MF09NjEsYT0tMSk6YS89MUUzO3JldHVybiBCaWdJbnQoYSl9LFA6ZnVuY3Rpb24oKXtyZXR1cm4tNTJ9LFE6ZnVuY3Rpb24oKXt9LEk6ZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQocSl7cmV0dXJuKHE9cS50b1RpbWVTdHJpbmcoKS5tYXRjaCgvXFwoKFtBLVphLXogXSspXFwpJC8pKT9xWzFdOlwiR01UXCJ9Yz4+Pj0wO3ZhciBlPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSxoPW5ldyBEYXRlKGUsXG4wLDEpLGs9bmV3IERhdGUoZSw2LDEpO2U9aC5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBtPWsuZ2V0VGltZXpvbmVPZmZzZXQoKTtKW2E+Pj4wPj4+Mj4+PjBdPTYwKk1hdGgubWF4KGUsbSk7SVtiPj4+MD4+PjI+Pj4wXT1OdW1iZXIoZSE9bSk7YT1kKGgpO2I9ZChrKTthPW1iKGEpO2I9bWIoYik7bTxlPyhKW2M+Pj4yPj4+MF09YSxKW2MrND4+PjI+Pj4wXT1iKTooSltjPj4+Mj4+PjBdPWIsSltjKzQ+Pj4yPj4+MF09YSl9LHk6KCk9PntqYShcIlwiKX0sZmE6ZnVuY3Rpb24oYSxiLGMpe2E+Pj49MDtiPj4+PTA7Yz4+Pj0wO25iLmxlbmd0aD0wO2Zvcih2YXIgZDtkPURbYisrPj4+MF07KXt2YXIgZT0xMDUhPWQ7ZSY9MTEyIT1kO2MrPWUmJmMlOD80OjA7bmIucHVzaCgxMTI9PWQ/SltjPj4+Mj4+PjBdOjEwNj09ZD9tYVtjPj4+M106MTA1PT1kP0lbYz4+PjI+Pj4wXTpvYVtjPj4+Mz4+PjBdKTtjKz1lPzg6NH1yZXR1cm4gQWFbYV0uYXBwbHkobnVsbCxuYil9LEM6KCk9PkRhdGUubm93KCksXG5KOmZ1bmN0aW9uKCl7cmV0dXJuIDQyOTQ5MDE3NjB9LG46KCk9PnBlcmZvcm1hbmNlLm5vdygpLEg6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPUQubGVuZ3RoO2lmKDQyOTQ5MDE3NjA8YSlyZXR1cm4hMTtmb3IodmFyIGM9MTs0Pj1jO2MqPTIpe3ZhciBkPWIqKDErLjIvYyk7ZD1NYXRoLm1pbihkLGErMTAwNjYzMjk2KTt2YXIgZT1NYXRoO2Q9TWF0aC5tYXgoYSxkKTthOntlPShlLm1pbi5jYWxsKGUsNDI5NDkwMTc2MCxkKyg2NTUzNi1kJTY1NTM2KSU2NTUzNiktQi5idWZmZXIuYnl0ZUxlbmd0aCs2NTUzNSkvNjU1MzY7dHJ5e0IuZ3JvdyhlKTtwYSgpO3ZhciBoPTE7YnJlYWsgYX1jYXRjaChrKXt9aD12b2lkIDB9aWYoaClyZXR1cm4hMH1yZXR1cm4hMX0sVzpmdW5jdGlvbihhLGIpe2E+Pj49MDtiPj4+PTA7dmFyIGM9MDtxYigpLmZvckVhY2goKGQsZSk9Pnt2YXIgaD1iK2M7ZT1KW2ErNCplPj4+Mj4+PjBdPWg7Zm9yKGg9MDtoPGQubGVuZ3RoOysraClDW2UrKz4+PjA+Pj5cbjBdPWQuY2hhckNvZGVBdChoKTtDW2U+Pj4wPj4+MF09MDtjKz1kLmxlbmd0aCsxfSk7cmV0dXJuIDB9LFg6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj4+Pj0wO3ZhciBjPXFiKCk7SlthPj4+Mj4+PjBdPWMubGVuZ3RoO3ZhciBkPTA7Yy5mb3JFYWNoKGU9PmQrPWUubGVuZ3RoKzEpO0pbYj4+PjI+Pj4wXT1kO3JldHVybiAwfSx1OigpPT41MixBOmZ1bmN0aW9uKCl7cmV0dXJuIDUyfSxWOmZ1bmN0aW9uKCl7cmV0dXJuIDcwfSx6OmZ1bmN0aW9uKGEsYixjLGQpe2I+Pj49MDtjPj4+PTA7ZD4+Pj0wO2Zvcih2YXIgZT0wLGg9MDtoPGM7aCsrKXt2YXIgaz1KW2I+Pj4yPj4+MF0sbT1KW2IrND4+PjI+Pj4wXTtiKz04O2Zvcih2YXIgcT0wO3E8bTtxKyspe3ZhciBuPURbaytxPj4+MF0sdj1yYlthXTswPT09bnx8MTA9PT1uPygoMT09PWE/aWE6QSkoRmEodiwwKSksdi5sZW5ndGg9MCk6di5wdXNoKG4pfWUrPW19SltkPj4+Mj4+PjBdPWU7cmV0dXJuIDB9LGJhOnZiLG06ZnVuY3Rpb24oYSxcbmIsYyxkKXtyZXR1cm4gdmIoYT4+PjAsYj4+PjAsYz4+PjAsZD4+PjApfX0sWj1mdW5jdGlvbigpe2Z1bmN0aW9uIGEoYyl7Wj1jLmV4cG9ydHM7Wj1BYigpO0I9Wi5nYTtwYSgpO3JhLnVuc2hpZnQoWi5oYSk7Sy0tOzA9PUsmJihudWxsIT09dGEmJihjbGVhckludGVydmFsKHRhKSx0YT1udWxsKSxMJiYoYz1MLEw9bnVsbCxjKCkpKTtyZXR1cm4gWn12YXIgYj17YTp6Yn07SysrO2lmKGcuaW5zdGFudGlhdGVXYXNtKXRyeXtyZXR1cm4gZy5pbnN0YW50aWF0ZVdhc20oYixhKX1jYXRjaChjKXtBKGBNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiAke2N9YCksbChjKX16YShiLGZ1bmN0aW9uKGMpe2EoYy5pbnN0YW5jZSl9KS5jYXRjaChsKTtyZXR1cm57fX0oKTtnLl9PcnRJbml0PShhLGIpPT4oZy5fT3J0SW5pdD1aLmlhKShhLGIpO2cuX09ydEdldExhc3RFcnJvcj0oYSxiKT0+KGcuX09ydEdldExhc3RFcnJvcj1aLmphKShhLGIpO1xuZy5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9KGEsYixjLGQsZSxoLGssbSxxLG4pPT4oZy5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9Wi5rYSkoYSxiLGMsZCxlLGgsayxtLHEsbik7Zy5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9KGEsYik9PihnLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj1aLmxhKShhLGIpO2cuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT0oYSxiLGMpPT4oZy5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPVoubWEpKGEsYixjKTtnLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9KGEsYixjKT0+KGcuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT1aLm5hKShhLGIsYyk7Zy5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPWE9PihnLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9Wi5vYSkoYSk7Zy5fT3J0Q3JlYXRlU2Vzc2lvbj0oYSxiLGMpPT4oZy5fT3J0Q3JlYXRlU2Vzc2lvbj1aLnBhKShhLGIsYyk7XG5nLl9PcnRSZWxlYXNlU2Vzc2lvbj1hPT4oZy5fT3J0UmVsZWFzZVNlc3Npb249Wi5xYSkoYSk7Zy5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD0oYSxiLGMpPT4oZy5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD1aLnJhKShhLGIsYyk7Zy5fT3J0R2V0SW5wdXROYW1lPShhLGIpPT4oZy5fT3J0R2V0SW5wdXROYW1lPVouc2EpKGEsYik7Zy5fT3J0R2V0T3V0cHV0TmFtZT0oYSxiKT0+KGcuX09ydEdldE91dHB1dE5hbWU9Wi50YSkoYSxiKTtnLl9PcnRGcmVlPWE9PihnLl9PcnRGcmVlPVoudWEpKGEpO2cuX09ydENyZWF0ZVRlbnNvcj0oYSxiLGMsZCxlLGgpPT4oZy5fT3J0Q3JlYXRlVGVuc29yPVoudmEpKGEsYixjLGQsZSxoKTtnLl9PcnRHZXRUZW5zb3JEYXRhPShhLGIsYyxkLGUpPT4oZy5fT3J0R2V0VGVuc29yRGF0YT1aLndhKShhLGIsYyxkLGUpO2cuX09ydFJlbGVhc2VUZW5zb3I9YT0+KGcuX09ydFJlbGVhc2VUZW5zb3I9Wi54YSkoYSk7XG5nLl9PcnRDcmVhdGVSdW5PcHRpb25zPShhLGIsYyxkKT0+KGcuX09ydENyZWF0ZVJ1bk9wdGlvbnM9Wi55YSkoYSxiLGMsZCk7Zy5fT3J0QWRkUnVuQ29uZmlnRW50cnk9KGEsYixjKT0+KGcuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PVouemEpKGEsYixjKTtnLl9PcnRSZWxlYXNlUnVuT3B0aW9ucz1hPT4oZy5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9Wi5BYSkoYSk7Zy5fT3J0Q3JlYXRlQmluZGluZz1hPT4oZy5fT3J0Q3JlYXRlQmluZGluZz1aLkJhKShhKTtnLl9PcnRCaW5kSW5wdXQ9KGEsYixjKT0+KGcuX09ydEJpbmRJbnB1dD1aLkNhKShhLGIsYyk7Zy5fT3J0QmluZE91dHB1dD0oYSxiLGMsZCk9PihnLl9PcnRCaW5kT3V0cHV0PVouRGEpKGEsYixjLGQpO2cuX09ydENsZWFyQm91bmRPdXRwdXRzPWE9PihnLl9PcnRDbGVhckJvdW5kT3V0cHV0cz1aLkVhKShhKTtnLl9PcnRSZWxlYXNlQmluZGluZz1hPT4oZy5fT3J0UmVsZWFzZUJpbmRpbmc9Wi5GYSkoYSk7XG5nLl9PcnRSdW5XaXRoQmluZGluZz0oYSxiLGMsZCxlKT0+KGcuX09ydFJ1bldpdGhCaW5kaW5nPVouR2EpKGEsYixjLGQsZSk7Zy5fT3J0UnVuPShhLGIsYyxkLGUsaCxrLG0pPT4oZy5fT3J0UnVuPVouSGEpKGEsYixjLGQsZSxoLGssbSk7Zy5fT3J0RW5kUHJvZmlsaW5nPWE9PihnLl9PcnRFbmRQcm9maWxpbmc9Wi5JYSkoYSk7dmFyIHliPSgpPT4oeWI9Wi5KYSkoKSxsYj1nLl9tYWxsb2M9YT0+KGxiPWcuX21hbGxvYz1aLkthKShhKSxXPWcuX2ZyZWU9YT0+KFc9Zy5fZnJlZT1aLkxhKShhKSxaYT1hPT4oWmE9Wi5NYSkoYSksQmI9KCk9PihCYj1aLk9hKSgpLENiPWE9PihDYj1aLlBhKShhKSxEYj1hPT4oRGI9Wi5RYSkoYSk7XG5mdW5jdGlvbiBBYigpe3ZhciBhPVo7YT1PYmplY3QuYXNzaWduKHt9LGEpO3ZhciBiPWQ9PigpPT5kKCk+Pj4wLGM9ZD0+ZT0+ZChlKT4+PjA7YS5KYT1iKGEuSmEpO2EuS2E9YyhhLkthKTthLk1hPWMoYS5NYSk7YS5PYT1iKGEuT2EpO2EuUWE9YyhhLlFhKTtyZXR1cm4gYX1nLnN0YWNrQWxsb2M9RGI7Zy5zdGFja1NhdmU9QmI7Zy5zdGFja1Jlc3RvcmU9Q2I7Zy5VVEY4VG9TdHJpbmc9TjtnLnN0cmluZ1RvVVRGOD0oYSxiLGMpPT5QKGEsRCxiLGMpO2cubGVuZ3RoQnl0ZXNVVEY4PU87dmFyIEViO0w9ZnVuY3Rpb24gRmIoKXtFYnx8R2IoKTtFYnx8KEw9RmIpfTtcbmZ1bmN0aW9uIEdiKCl7aWYoISgwPEspKXtpZihnLnByZVJ1bilmb3IoXCJmdW5jdGlvblwiPT10eXBlb2YgZy5wcmVSdW4mJihnLnByZVJ1bj1bZy5wcmVSdW5dKTtnLnByZVJ1bi5sZW5ndGg7KXt2YXIgYT1nLnByZVJ1bi5zaGlmdCgpO3FhLnVuc2hpZnQoYSl9Zm9yKDswPHFhLmxlbmd0aDspcWEuc2hpZnQoKShnKTtpZighKDA8S3x8RWJ8fChFYj0hMCxnLmNhbGxlZFJ1bj0hMCxrYSkpKXtmb3IoOzA8cmEubGVuZ3RoOylyYS5zaGlmdCgpKGcpO2ZvcihhYShnKTswPHNhLmxlbmd0aDspc2Euc2hpZnQoKShnKX19fUdiKCk7XG5cblxuICByZXR1cm4gbW9kdWxlQXJnLnJlYWR5XG59XG4pO1xufSkoKTtcbjtcbmlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG4gIG1vZHVsZS5leHBvcnRzID0gb3J0V2FzbTtcbmVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSlcbiAgZGVmaW5lKFtdLCAoKSA9PiBvcnRXYXNtKTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHtFbnZ9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7T3J0V2FzbU1vZHVsZX0gZnJvbSAnLi9iaW5kaW5nL29ydC13YXNtJztcbmltcG9ydCB7T3J0V2FzbVRocmVhZGVkTW9kdWxlfSBmcm9tICcuL2JpbmRpbmcvb3J0LXdhc20tdGhyZWFkZWQnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzICovXG5sZXQgb3J0V2FzbUZhY3Rvcnk6IEVtc2NyaXB0ZW5Nb2R1bGVGYWN0b3J5PE9ydFdhc21Nb2R1bGU+O1xuXG5pZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9UUkFJTklORykge1xuICBvcnRXYXNtRmFjdG9yeSA9IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtdHJhaW5pbmctd2FzbS1zaW1kLmpzJyk7XG59IGVsc2Uge1xuICBvcnRXYXNtRmFjdG9yeSA9XG4gICAgICBCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVID8gcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLmpzJykgOiByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20tc2ltZC5qc2VwLmpzJyk7XG59XG5cbmNvbnN0IG9ydFdhc21GYWN0b3J5VGhyZWFkZWQ6IEVtc2NyaXB0ZW5Nb2R1bGVGYWN0b3J5PE9ydFdhc21Nb2R1bGU+ID0gIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1RIUkVBRCA/XG4gICAgKEJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgPyByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20tdGhyZWFkZWQuanMnKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20tc2ltZC10aHJlYWRlZC5qc2VwLmpzJykpIDpcbiAgICBvcnRXYXNtRmFjdG9yeTtcbi8qIGVzbGludC1lbmFibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cyAqL1xuXG5sZXQgd2FzbTogT3J0V2FzbU1vZHVsZXx1bmRlZmluZWQ7XG5sZXQgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbmxldCBpbml0aWFsaXppbmcgPSBmYWxzZTtcbmxldCBhYm9ydGVkID0gZmFsc2U7XG5cbmNvbnN0IGlzTXVsdGlUaHJlYWRTdXBwb3J0ZWQgPSAoKTogYm9vbGVhbiA9PiB7XG4gIHRyeSB7XG4gICAgLy8gSWYgJ1NoYXJlZEFycmF5QnVmZmVyJyBpcyBub3QgYXZhaWxhYmxlLCBXZWJBc3NlbWJseSB0aHJlYWRzIHdpbGwgbm90IHdvcmsuXG4gICAgaWYgKHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBUZXN0IGZvciB0cmFuc2ZlcmFiaWxpdHkgb2YgU0FCcyAoZm9yIGJyb3dzZXJzLiBuZWVkZWQgZm9yIEZpcmVmb3gpXG4gICAgLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIW1zZy9tb3ppbGxhLmRldi5wbGF0Zm9ybS9JSGtCWmxIRVRwQS9kd3NNTmNoV0VRQUpcbiAgICBpZiAodHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgbmV3IE1lc3NhZ2VDaGFubmVsKCkucG9ydDEucG9zdE1lc3NhZ2UobmV3IFNoYXJlZEFycmF5QnVmZmVyKDEpKTtcbiAgICB9XG5cbiAgICAvLyBUZXN0IGZvciBXZWJBc3NlbWJseSB0aHJlYWRzIGNhcGFiaWxpdHkgKGZvciBib3RoIGJyb3dzZXJzIGFuZCBOb2RlLmpzKVxuICAgIC8vIFRoaXMgdHlwZWQgYXJyYXkgaXMgYSBXZWJBc3NlbWJseSBwcm9ncmFtIGNvbnRhaW5pbmcgdGhyZWFkZWQgaW5zdHJ1Y3Rpb25zLlxuICAgIHJldHVybiBXZWJBc3NlbWJseS52YWxpZGF0ZShuZXcgVWludDhBcnJheShbXG4gICAgICAwLCA5NywgMTE1LCAxMDksIDEsIDAsICAwLCAgMCwgMSwgNCwgMSwgIDk2LCAwLCAgIDAsICAzLCAyLCAxLCAgMCwgNSxcbiAgICAgIDQsIDEsICAzLCAgIDEsICAgMSwgMTAsIDExLCAxLCA5LCAwLCA2NSwgMCwgIDI1NCwgMTYsIDIsIDAsIDI2LCAxMVxuICAgIF0pKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuY29uc3QgaXNTaW1kU3VwcG9ydGVkID0gKCk6IGJvb2xlYW4gPT4ge1xuICB0cnkge1xuICAgIC8vIFRlc3QgZm9yIFdlYkFzc2VtYmx5IFNJTUQgY2FwYWJpbGl0eSAoZm9yIGJvdGggYnJvd3NlcnMgYW5kIE5vZGUuanMpXG4gICAgLy8gVGhpcyB0eXBlZCBhcnJheSBpcyBhIFdlYkFzc2VtYmx5IHByb2dyYW0gY29udGFpbmluZyBTSU1EIGluc3RydWN0aW9ucy5cblxuICAgIC8vIFRoZSBiaW5hcnkgZGF0YSBpcyBnZW5lcmF0ZWQgZnJvbSB0aGUgZm9sbG93aW5nIGNvZGUgYnkgd2F0Mndhc206XG4gICAgLy9cbiAgICAvLyAobW9kdWxlXG4gICAgLy8gICAodHlwZSAkdDAgKGZ1bmMpKVxuICAgIC8vICAgKGZ1bmMgJGYwICh0eXBlICR0MClcbiAgICAvLyAgICAgKGRyb3BcbiAgICAvLyAgICAgICAoaTMyeDQuZG90X2kxNng4X3NcbiAgICAvLyAgICAgICAgIChpOHgxNi5zcGxhdFxuICAgIC8vICAgICAgICAgICAoaTMyLmNvbnN0IDApKVxuICAgIC8vICAgICAgICAgKHYxMjguY29uc3QgaTMyeDQgMHgwMDAwMDAwMCAweDAwMDAwMDAwIDB4MDAwMDAwMDAgMHgwMDAwMDAwMCkpKSkpXG5cbiAgICByZXR1cm4gV2ViQXNzZW1ibHkudmFsaWRhdGUobmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgMCwgICA5NywgMTE1LCAxMDksIDEsIDAsIDAsIDAsIDEsIDQsIDEsIDk2LCAwLCAwLCAzLCAyLCAxLCAwLCAxMCwgMzAsIDEsICAgMjgsICAwLCA2NSwgMCxcbiAgICAgIDI1MywgMTUsIDI1MywgMTIsICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAgMCwgMCwgMCwgMCwgMCwgMCwgMCwgIDAsICAyNTMsIDE4NiwgMSwgMjYsIDExXG4gICAgXSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBnZXRXYXNtRmlsZU5hbWUgPSAodXNlU2ltZDogYm9vbGVhbiwgdXNlVGhyZWFkczogYm9vbGVhbikgPT4ge1xuICBpZiAodXNlU2ltZCkge1xuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1RSQUlOSU5HKSB7XG4gICAgICByZXR1cm4gJ29ydC10cmFpbmluZy13YXNtLXNpbWQud2FzbSc7XG4gICAgfVxuICAgIHJldHVybiB1c2VUaHJlYWRzID8gJ29ydC13YXNtLXNpbWQtdGhyZWFkZWQud2FzbScgOiAnb3J0LXdhc20tc2ltZC53YXNtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdXNlVGhyZWFkcyA/ICdvcnQtd2FzbS10aHJlYWRlZC53YXNtJyA6ICdvcnQtd2FzbS53YXNtJztcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGluaXRpYWxpemVXZWJBc3NlbWJseSA9IGFzeW5jKGZsYWdzOiBFbnYuV2ViQXNzZW1ibHlGbGFncyk6IFByb21pc2U8dm9pZD4gPT4ge1xuICBpZiAoaW5pdGlhbGl6ZWQpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cbiAgaWYgKGluaXRpYWxpemluZykge1xuICAgIHRocm93IG5ldyBFcnJvcignbXVsdGlwbGUgY2FsbHMgdG8gXFwnaW5pdGlhbGl6ZVdlYkFzc2VtYmx5KClcXCcgZGV0ZWN0ZWQuJyk7XG4gIH1cbiAgaWYgKGFib3J0ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3ByZXZpb3VzIGNhbGwgdG8gXFwnaW5pdGlhbGl6ZVdlYkFzc2VtYmx5KClcXCcgZmFpbGVkLicpO1xuICB9XG5cbiAgaW5pdGlhbGl6aW5nID0gdHJ1ZTtcblxuICAvLyB3YXNtIGZsYWdzIGFyZSBhbHJlYWR5IGluaXRpYWxpemVkXG4gIGNvbnN0IHRpbWVvdXQgPSBmbGFncy5pbml0VGltZW91dCE7XG4gIGNvbnN0IG51bVRocmVhZHMgPSBmbGFncy5udW1UaHJlYWRzITtcbiAgY29uc3Qgc2ltZCA9IGZsYWdzLnNpbWQhO1xuXG4gIGNvbnN0IHVzZVRocmVhZHMgPSBudW1UaHJlYWRzID4gMSAmJiBpc011bHRpVGhyZWFkU3VwcG9ydGVkKCk7XG4gIGNvbnN0IHVzZVNpbWQgPSBzaW1kICYmIGlzU2ltZFN1cHBvcnRlZCgpO1xuXG4gIGNvbnN0IHdhc21QYXRocyA9IGZsYWdzLndhc21QYXRocztcbiAgY29uc3Qgd2FzbVByZWZpeE92ZXJyaWRlID0gdHlwZW9mIHdhc21QYXRocyA9PT0gJ3N0cmluZycgPyB3YXNtUGF0aHMgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHdhc21GaWxlTmFtZSA9IGdldFdhc21GaWxlTmFtZSh1c2VTaW1kLCB1c2VUaHJlYWRzKTtcbiAgY29uc3Qgd2FzbVBhdGhPdmVycmlkZSA9IHR5cGVvZiB3YXNtUGF0aHMgPT09ICdvYmplY3QnID8gd2FzbVBhdGhzW3dhc21GaWxlTmFtZV0gOiB1bmRlZmluZWQ7XG5cbiAgbGV0IGlzVGltZW91dCA9IGZhbHNlO1xuXG4gIGNvbnN0IHRhc2tzOiBBcnJheTxQcm9taXNlPHZvaWQ+PiA9IFtdO1xuXG4gIC8vIHByb21pc2UgZm9yIHRpbWVvdXRcbiAgaWYgKHRpbWVvdXQgPiAwKSB7XG4gICAgdGFza3MucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlzVGltZW91dCA9IHRydWU7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0sIHRpbWVvdXQpO1xuICAgIH0pKTtcbiAgfVxuXG4gIC8vIHByb21pc2UgZm9yIG1vZHVsZSBpbml0aWFsaXphdGlvblxuICB0YXNrcy5wdXNoKG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBmYWN0b3J5ID0gdXNlVGhyZWFkcyA/IG9ydFdhc21GYWN0b3J5VGhyZWFkZWQgOiBvcnRXYXNtRmFjdG9yeTtcbiAgICBjb25zdCBjb25maWc6IFBhcnRpYWw8T3J0V2FzbU1vZHVsZT4gPSB7XG4gICAgICBsb2NhdGVGaWxlOiAoZmlsZU5hbWU6IHN0cmluZywgc2NyaXB0RGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9USFJFQUQgJiYgdXNlVGhyZWFkcyAmJiBmaWxlTmFtZS5lbmRzV2l0aCgnLndvcmtlci5qcycpICYmXG4gICAgICAgICAgICB0eXBlb2YgQmxvYiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXR1cm4gVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihcbiAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgcmVxdWlyZSgpIGZ1bmN0aW9uIGlzIGhhbmRsZWQgYnkgZXNidWlsZCBwbHVnaW4gdG8gbG9hZCBmaWxlIGNvbnRlbnQgYXMgc3RyaW5nLlxuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzXG4gICAgICAgICAgICAgICAgcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLndvcmtlci5qcycpXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIHt0eXBlOiAndGV4dC9qYXZhc2NyaXB0J30pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWxlTmFtZS5lbmRzV2l0aCgnLndhc20nKSkge1xuICAgICAgICAgIGlmICh3YXNtUGF0aE92ZXJyaWRlKSB7XG4gICAgICAgICAgICByZXR1cm4gd2FzbVBhdGhPdmVycmlkZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBwcmVmaXggPSB3YXNtUHJlZml4T3ZlcnJpZGUgPz8gc2NyaXB0RGlyZWN0b3J5O1xuXG4gICAgICAgICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVKSB7XG4gICAgICAgICAgICBpZiAod2FzbUZpbGVOYW1lID09PSAnb3J0LXdhc20tc2ltZC53YXNtJykge1xuICAgICAgICAgICAgICByZXR1cm4gcHJlZml4ICsgJ29ydC13YXNtLXNpbWQuanNlcC53YXNtJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod2FzbUZpbGVOYW1lID09PSAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC53YXNtJykge1xuICAgICAgICAgICAgICByZXR1cm4gcHJlZml4ICsgJ29ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC53YXNtJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gcHJlZml4ICsgd2FzbUZpbGVOYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNjcmlwdERpcmVjdG9yeSArIGZpbGVOYW1lO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1RIUkVBRCAmJiB1c2VUaHJlYWRzKSB7XG4gICAgICBjb25maWcubnVtVGhyZWFkcyA9IG51bVRocmVhZHM7XG4gICAgICBpZiAodHlwZW9mIEJsb2IgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbmZpZy5tYWluU2NyaXB0VXJsT3JCbG9iID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ29ydC13YXNtLXRocmVhZGVkLmpzJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBzY3JpcHRTb3VyY2VDb2RlID0gYHZhciBvcnRXYXNtVGhyZWFkZWQ9JHtmYWN0b3J5LnRvU3RyaW5nKCl9O2A7XG4gICAgICAgIGNvbmZpZy5tYWluU2NyaXB0VXJsT3JCbG9iID0gbmV3IEJsb2IoW3NjcmlwdFNvdXJjZUNvZGVdLCB7dHlwZTogJ3RleHQvamF2YXNjcmlwdCd9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmYWN0b3J5KGNvbmZpZykudGhlbihcbiAgICAgICAgLy8gd2FzbSBtb2R1bGUgaW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgIG1vZHVsZSA9PiB7XG4gICAgICAgICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgIHdhc20gPSBtb2R1bGU7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9LFxuICAgICAgICAvLyB3YXNtIG1vZHVsZSBmYWlsZWQgdG8gaW5pdGlhbGl6ZVxuICAgICAgICAod2hhdCkgPT4ge1xuICAgICAgICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgICAgIGFib3J0ZWQgPSB0cnVlO1xuICAgICAgICAgIHJlamVjdCh3aGF0KTtcbiAgICAgICAgfSk7XG4gIH0pKTtcblxuICBhd2FpdCBQcm9taXNlLnJhY2UodGFza3MpO1xuXG4gIGlmIChpc1RpbWVvdXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFdlYkFzc2VtYmx5IGJhY2tlbmQgaW5pdGlhbGl6aW5nIGZhaWxlZCBkdWUgdG8gdGltZW91dDogJHt0aW1lb3V0fW1zYCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBnZXRJbnN0YW5jZSA9ICgpOiBPcnRXYXNtTW9kdWxlID0+IHtcbiAgaWYgKGluaXRpYWxpemVkICYmIHdhc20pIHtcbiAgICByZXR1cm4gd2FzbTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignV2ViQXNzZW1ibHkgaXMgbm90IGluaXRpYWxpemVkIHlldC4nKTtcbn07XG5cbmV4cG9ydCBjb25zdCBkaXNwb3NlID0gKCk6IHZvaWQgPT4ge1xuICBpZiAoaW5pdGlhbGl6ZWQgJiYgIWluaXRpYWxpemluZyAmJiAhYWJvcnRlZCkge1xuICAgIGluaXRpYWxpemluZyA9IHRydWU7XG5cbiAgICAod2FzbSBhcyBPcnRXYXNtVGhyZWFkZWRNb2R1bGUpLlBUaHJlYWQ/LnRlcm1pbmF0ZUFsbFRocmVhZHMoKTtcbiAgICB3YXNtID0gdW5kZWZpbmVkO1xuXG4gICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtnZXRJbnN0YW5jZX0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuXG5leHBvcnQgY29uc3QgYWxsb2NXYXNtU3RyaW5nID0gKGRhdGE6IHN0cmluZywgYWxsb2NzOiBudW1iZXJbXSk6IG51bWJlciA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuXG4gIGNvbnN0IGRhdGFMZW5ndGggPSB3YXNtLmxlbmd0aEJ5dGVzVVRGOChkYXRhKSArIDE7XG4gIGNvbnN0IGRhdGFPZmZzZXQgPSB3YXNtLl9tYWxsb2MoZGF0YUxlbmd0aCk7XG4gIHdhc20uc3RyaW5nVG9VVEY4KGRhdGEsIGRhdGFPZmZzZXQsIGRhdGFMZW5ndGgpO1xuICBhbGxvY3MucHVzaChkYXRhT2Zmc2V0KTtcblxuICByZXR1cm4gZGF0YU9mZnNldDtcbn07XG5cbmludGVyZmFjZSBFeHRyYU9wdGlvbnNIYW5kbGVyIHtcbiAgKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjb25zdCBpdGVyYXRlRXh0cmFPcHRpb25zID1cbiAgICAob3B0aW9uczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIHByZWZpeDogc3RyaW5nLCBzZWVuOiBXZWFrU2V0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PixcbiAgICAgaGFuZGxlcjogRXh0cmFPcHRpb25zSGFuZGxlcik6IHZvaWQgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09ICdvYmplY3QnICYmIG9wdGlvbnMgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKHNlZW4uaGFzKG9wdGlvbnMpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDaXJjdWxhciByZWZlcmVuY2UgaW4gb3B0aW9ucycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlZW4uYWRkKG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5lbnRyaWVzKG9wdGlvbnMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICBjb25zdCBuYW1lID0gKHByZWZpeCkgPyBwcmVmaXggKyBrZXkgOiBrZXk7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgaXRlcmF0ZUV4dHJhT3B0aW9ucyh2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgbmFtZSArICcuJywgc2VlbiwgaGFuZGxlcik7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgaGFuZGxlcihuYW1lLCB2YWx1ZS50b1N0cmluZygpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIGhhbmRsZXIobmFtZSwgKHZhbHVlKSA/ICcxJyA6ICcwJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCBoYW5kbGUgZXh0cmEgY29uZmlnIHR5cGU6ICR7dHlwZW9mIHZhbHVlfWApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4vKipcbiAqIGNoZWNrIHdlYiBhc3NlbWJseSBBUEkncyBsYXN0IGVycm9yIGFuZCB0aHJvdyBlcnJvciBpZiBhbnkgZXJyb3Igb2NjdXJyZWQuXG4gKiBAcGFyYW0gbWVzc2FnZSBhIG1lc3NhZ2UgdXNlZCB3aGVuIGFuIGVycm9yIG9jY3VycmVkLlxuICovXG5leHBvcnQgY29uc3QgY2hlY2tMYXN0RXJyb3IgPSAobWVzc2FnZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuXG4gIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJhbXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoOCk7XG4gICAgd2FzbS5fT3J0R2V0TGFzdEVycm9yKHBhcmFtc09mZnNldCwgcGFyYW1zT2Zmc2V0ICsgNCk7XG4gICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5IRUFQMzJbcGFyYW1zT2Zmc2V0IC8gNF07XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlUG9pbnRlciA9IHdhc20uSEVBUFUzMltwYXJhbXNPZmZzZXQgLyA0ICsgMV07XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlUG9pbnRlciA/IHdhc20uVVRGOFRvU3RyaW5nKGVycm9yTWVzc2FnZVBvaW50ZXIpIDogJyc7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke21lc3NhZ2V9IEVSUk9SX0NPREU6ICR7ZXJyb3JDb2RlfSwgRVJST1JfTUVTU0FHRTogJHtlcnJvck1lc3NhZ2V9YCk7XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb259IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvciwgaXRlcmF0ZUV4dHJhT3B0aW9uc30gZnJvbSAnLi93YXNtLXV0aWxzJztcblxuZXhwb3J0IGNvbnN0IHNldFJ1bk9wdGlvbnMgPSAob3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogW251bWJlciwgbnVtYmVyW11dID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGxldCBydW5PcHRpb25zSGFuZGxlID0gMDtcbiAgY29uc3QgYWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IHJ1bk9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdHJ5IHtcbiAgICBpZiAob3B0aW9ucz8ubG9nU2V2ZXJpdHlMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBydW5PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPSAyOyAgLy8gRGVmYXVsdCB0byB3YXJuaW5nXG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgdHlwZW9mIG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIob3B0aW9ucy5sb2dTZXZlcml0eUxldmVsKSB8fFxuICAgICAgICBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPCAwIHx8IG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA+IDQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHNlcnZlcml0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7b3B0aW9ucy5sb2dTZXZlcml0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy5sb2dWZXJib3NpdHlMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBydW5PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsID0gMDsgIC8vIERlZmF1bHQgdG8gMFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKG9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyB2ZXJib3NpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke29wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWx9YCk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LnRlcm1pbmF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBydW5PcHRpb25zLnRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGxldCB0YWdEYXRhT2Zmc2V0ID0gMDtcbiAgICBpZiAob3B0aW9ucz8udGFnICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRhZ0RhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcob3B0aW9ucy50YWcsIGFsbG9jcyk7XG4gICAgfVxuXG4gICAgcnVuT3B0aW9uc0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZVJ1bk9wdGlvbnMoXG4gICAgICAgIHJ1bk9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCEsIHJ1bk9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwhLCAhIXJ1bk9wdGlvbnMudGVybWluYXRlISwgdGFnRGF0YU9mZnNldCk7XG4gICAgaWYgKHJ1bk9wdGlvbnNIYW5kbGUgPT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBydW4gb3B0aW9ucy4nKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8uZXh0cmEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaXRlcmF0ZUV4dHJhT3B0aW9ucyhvcHRpb25zLmV4dHJhLCAnJywgbmV3IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KCksIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoa2V5LCBhbGxvY3MpO1xuICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcodmFsdWUsIGFsbG9jcyk7XG5cbiAgICAgICAgaWYgKHdhc20uX09ydEFkZFJ1bkNvbmZpZ0VudHJ5KHJ1bk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgcnVuIGNvbmZpZyBlbnRyeTogJHtrZXl9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBbcnVuT3B0aW9uc0hhbmRsZSwgYWxsb2NzXTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChydW5PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlUnVuT3B0aW9ucyhydW5PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgYWxsb2NzLmZvckVhY2goYWxsb2MgPT4gd2FzbS5fZnJlZShhbGxvYykpO1xuICAgIHRocm93IGU7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7SW5mZXJlbmNlU2Vzc2lvbn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtnZXRJbnN0YW5jZX0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuaW1wb3J0IHthbGxvY1dhc21TdHJpbmcsIGNoZWNrTGFzdEVycm9yLCBpdGVyYXRlRXh0cmFPcHRpb25zfSBmcm9tICcuL3dhc20tdXRpbHMnO1xuXG5jb25zdCBnZXRHcmFwaE9wdGltemF0aW9uTGV2ZWwgPSAoZ3JhcGhPcHRpbWl6YXRpb25MZXZlbDogc3RyaW5nfHVua25vd24pOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGdyYXBoT3B0aW1pemF0aW9uTGV2ZWwpIHtcbiAgICBjYXNlICdkaXNhYmxlZCc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdiYXNpYyc6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlICdleHRlbmRlZCc6XG4gICAgICByZXR1cm4gMjtcbiAgICBjYXNlICdhbGwnOlxuICAgICAgcmV0dXJuIDk5O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGdyYXBoIG9wdGltaXphdGlvbiBsZXZlbDogJHtncmFwaE9wdGltaXphdGlvbkxldmVsfWApO1xuICB9XG59O1xuXG5jb25zdCBnZXRFeGVjdXRpb25Nb2RlID0gKGV4ZWN1dGlvbk1vZGU6ICdzZXF1ZW50aWFsJ3wncGFyYWxsZWwnKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChleGVjdXRpb25Nb2RlKSB7XG4gICAgY2FzZSAnc2VxdWVudGlhbCc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdwYXJhbGxlbCc6XG4gICAgICByZXR1cm4gMTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBleGVjdXRpb24gbW9kZTogJHtleGVjdXRpb25Nb2RlfWApO1xuICB9XG59O1xuXG5jb25zdCBhcHBlbmREZWZhdWx0T3B0aW9ucyA9IChvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogdm9pZCA9PiB7XG4gIGlmICghb3B0aW9ucy5leHRyYSkge1xuICAgIG9wdGlvbnMuZXh0cmEgPSB7fTtcbiAgfVxuICBpZiAoIW9wdGlvbnMuZXh0cmEuc2Vzc2lvbikge1xuICAgIG9wdGlvbnMuZXh0cmEuc2Vzc2lvbiA9IHt9O1xuICB9XG4gIGNvbnN0IHNlc3Npb24gPSBvcHRpb25zLmV4dHJhLnNlc3Npb24gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgaWYgKCFzZXNzaW9uLnVzZV9vcnRfbW9kZWxfYnl0ZXNfZGlyZWN0bHkpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgc2Vzc2lvbi51c2Vfb3J0X21vZGVsX2J5dGVzX2RpcmVjdGx5ID0gJzEnO1xuICB9XG5cbiAgLy8gaWYgdXNpbmcgSlNFUCB3aXRoIFdlYkdQVSwgYWx3YXlzIGRpc2FibGUgbWVtb3J5IHBhdHRlcm5cbiAgaWYgKG9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzICYmXG4gICAgICBvcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycy5zb21lKGVwID0+ICh0eXBlb2YgZXAgPT09ICdzdHJpbmcnID8gZXAgOiBlcC5uYW1lKSA9PT0gJ3dlYmdwdScpKSB7XG4gICAgb3B0aW9ucy5lbmFibGVNZW1QYXR0ZXJuID0gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IHNldEV4ZWN1dGlvblByb3ZpZGVycyA9XG4gICAgKHNlc3Npb25PcHRpb25zSGFuZGxlOiBudW1iZXIsIGV4ZWN1dGlvblByb3ZpZGVyczogcmVhZG9ubHkgSW5mZXJlbmNlU2Vzc2lvbi5FeGVjdXRpb25Qcm92aWRlckNvbmZpZ1tdLFxuICAgICBhbGxvY3M6IG51bWJlcltdKTogdm9pZCA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGVwIG9mIGV4ZWN1dGlvblByb3ZpZGVycykge1xuICAgICAgICBsZXQgZXBOYW1lID0gdHlwZW9mIGVwID09PSAnc3RyaW5nJyA/IGVwIDogZXAubmFtZTtcblxuICAgICAgICAvLyBjaGVjayBFUCBuYW1lXG4gICAgICAgIHN3aXRjaCAoZXBOYW1lKSB7XG4gICAgICAgICAgY2FzZSAnd2Vibm4nOlxuICAgICAgICAgICAgZXBOYW1lID0gJ1dFQk5OJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXAgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHdlYm5uT3B0aW9ucyA9IGVwIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViTk5FeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8uZGV2aWNlVHlwZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ2RldmljZVR5cGUnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh3ZWJubk9wdGlvbnMuZGV2aWNlVHlwZSwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdkZXZpY2VUeXBlJyAtICR7d2Vibm5PcHRpb25zLmRldmljZVR5cGV9LmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAod2Vibm5PcHRpb25zPy5udW1UaHJlYWRzKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bVRocmVhZHMgPSB3ZWJubk9wdGlvbnMubnVtVGhyZWFkcztcbiAgICAgICAgICAgICAgICAvLyBKdXN0IGlnbm9yZSBpbnZhbGlkIHdlYm5uT3B0aW9ucy5udW1UaHJlYWRzLlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbnVtVGhyZWFkcyAhPSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihudW1UaHJlYWRzKSB8fCBudW1UaHJlYWRzIDwgMCkge1xuICAgICAgICAgICAgICAgICAgbnVtVGhyZWFkcyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ251bVRocmVhZHMnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhudW1UaHJlYWRzLnRvU3RyaW5nKCksIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAnbnVtVGhyZWFkcycgLSAke3dlYm5uT3B0aW9ucy5udW1UaHJlYWRzfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8ucG93ZXJQcmVmZXJlbmNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygncG93ZXJQcmVmZXJlbmNlJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2Vibm5PcHRpb25zLnBvd2VyUHJlZmVyZW5jZSwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdwb3dlclByZWZlcmVuY2UnIC0gJHt3ZWJubk9wdGlvbnMucG93ZXJQcmVmZXJlbmNlfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3dlYmdwdSc6XG4gICAgICAgICAgICBlcE5hbWUgPSAnSlMnO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgY29uc3Qgd2ViZ3B1T3B0aW9ucyA9IGVwIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViR3B1RXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgICAgICAgICAgIGlmICh3ZWJncHVPcHRpb25zPy5wcmVmZXJyZWRMYXlvdXQpIHtcbiAgICAgICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQgIT09ICdOQ0hXJyAmJiB3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCAhPT0gJ05IV0MnKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHByZWZlcnJlZExheW91dCBtdXN0IGJlIGVpdGhlciAnTkNIVycgb3IgJ05IV0MnOiAke3dlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0fWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdwcmVmZXJyZWRMYXlvdXQnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdwcmVmZXJyZWRMYXlvdXQnIC0gJHt3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dH0uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd3YXNtJzpcbiAgICAgICAgICBjYXNlICdjcHUnOlxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgbm90IHN1cHBvcnRlZCBleGVjdXRpb24gcHJvdmlkZXI6ICR7ZXBOYW1lfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXBOYW1lRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhlcE5hbWUsIGFsbG9jcyk7XG4gICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcihzZXNzaW9uT3B0aW9uc0hhbmRsZSwgZXBOYW1lRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYXBwZW5kIGV4ZWN1dGlvbiBwcm92aWRlcjogJHtlcE5hbWV9LmApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuZXhwb3J0IGNvbnN0IHNldFNlc3Npb25PcHRpb25zID0gKG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogW251bWJlciwgbnVtYmVyW11dID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGxldCBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGNvbnN0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBzZXNzaW9uT3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGFwcGVuZERlZmF1bHRPcHRpb25zKHNlc3Npb25PcHRpb25zKTtcblxuICB0cnkge1xuICAgIGNvbnN0IGdyYXBoT3B0aW1pemF0aW9uTGV2ZWwgPSBnZXRHcmFwaE9wdGltemF0aW9uTGV2ZWwoc2Vzc2lvbk9wdGlvbnMuZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCA/PyAnYWxsJyk7XG4gICAgY29uc3QgZXhlY3V0aW9uTW9kZSA9IGdldEV4ZWN1dGlvbk1vZGUoc2Vzc2lvbk9wdGlvbnMuZXhlY3V0aW9uTW9kZSA/PyAnc2VxdWVudGlhbCcpO1xuICAgIGNvbnN0IGxvZ0lkRGF0YU9mZnNldCA9XG4gICAgICAgIHR5cGVvZiBzZXNzaW9uT3B0aW9ucy5sb2dJZCA9PT0gJ3N0cmluZycgPyBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMubG9nSWQsIGFsbG9jcykgOiAwO1xuXG4gICAgY29uc3QgbG9nU2V2ZXJpdHlMZXZlbCA9IHNlc3Npb25PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPz8gMjsgIC8vIERlZmF1bHQgdG8gMiAtIHdhcm5pbmdcbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIobG9nU2V2ZXJpdHlMZXZlbCkgfHwgbG9nU2V2ZXJpdHlMZXZlbCA8IDAgfHwgbG9nU2V2ZXJpdHlMZXZlbCA+IDQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHNlcnZlcml0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7bG9nU2V2ZXJpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dWZXJib3NpdHlMZXZlbCA9IHNlc3Npb25PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsID8/IDA7ICAvLyBEZWZhdWx0IHRvIDAgLSB2ZXJib3NlXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGxvZ1ZlcmJvc2l0eUxldmVsKSB8fCBsb2dWZXJib3NpdHlMZXZlbCA8IDAgfHwgbG9nVmVyYm9zaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyB2ZXJib3NpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke2xvZ1ZlcmJvc2l0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGltaXplZE1vZGVsRmlsZVBhdGhPZmZzZXQgPSB0eXBlb2Ygc2Vzc2lvbk9wdGlvbnMub3B0aW1pemVkTW9kZWxGaWxlUGF0aCA9PT0gJ3N0cmluZycgP1xuICAgICAgICBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMub3B0aW1pemVkTW9kZWxGaWxlUGF0aCwgYWxsb2NzKSA6XG4gICAgICAgIDA7XG5cbiAgICBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZVNlc3Npb25PcHRpb25zKFxuICAgICAgICBncmFwaE9wdGltaXphdGlvbkxldmVsLCAhIXNlc3Npb25PcHRpb25zLmVuYWJsZUNwdU1lbUFyZW5hLCAhIXNlc3Npb25PcHRpb25zLmVuYWJsZU1lbVBhdHRlcm4sIGV4ZWN1dGlvbk1vZGUsXG4gICAgICAgICEhc2Vzc2lvbk9wdGlvbnMuZW5hYmxlUHJvZmlsaW5nLCAwLCBsb2dJZERhdGFPZmZzZXQsIGxvZ1NldmVyaXR5TGV2ZWwsIGxvZ1ZlcmJvc2l0eUxldmVsLFxuICAgICAgICBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoT2Zmc2V0KTtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBzZXNzaW9uIG9wdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycykge1xuICAgICAgc2V0RXhlY3V0aW9uUHJvdmlkZXJzKHNlc3Npb25PcHRpb25zSGFuZGxlLCBzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMsIGFsbG9jcyk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmZyZWVEaW1lbnNpb25PdmVycmlkZXMpIHtcbiAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSkge1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSBuYW1lIG11c3QgYmUgYSBzdHJpbmc6ICR7bmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSB2YWx1ZSBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXI6ICR7dmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmFtZU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhuYW1lLCBhbGxvY3MpO1xuICAgICAgICBpZiAod2FzbS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlKHNlc3Npb25PcHRpb25zSGFuZGxlLCBuYW1lT2Zmc2V0LCB2YWx1ZSkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGU6ICR7bmFtZX0gLSAke3ZhbHVlfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5leHRyYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKHNlc3Npb25PcHRpb25zLmV4dHJhLCAnJywgbmV3IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KCksIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoa2V5LCBhbGxvY3MpO1xuICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcodmFsdWUsIGFsbG9jcyk7XG5cbiAgICAgICAgaWYgKHdhc20uX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJHtrZXl9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBbc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucyhzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge1RlbnNvcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuLy8gVGhpcyBmaWxlIGluY2x1ZGVzIGNvbW1vbiBkZWZpbml0aW9ucy4gVGhleSBkbyBOT1QgaGF2ZSBkZXBlbmRlbmN5IG9uIHRoZSBXZWJBc3NlbWJseSBpbnN0YW5jZS5cblxuLyoqXG4gKiBDb3BpZWQgZnJvbSBPTk5YIGRlZmluaXRpb24uIFVzZSB0aGlzIHRvIGRyb3AgZGVwZW5kZW5jeSAnb25ueF9wcm90bycgdG8gZGVjcmVhc2UgY29tcGlsZWQgLmpzIGZpbGUgc2l6ZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gRGF0YVR5cGUge1xuICB1bmRlZmluZWQgPSAwLFxuICBmbG9hdCA9IDEsXG4gIHVpbnQ4ID0gMixcbiAgaW50OCA9IDMsXG4gIHVpbnQxNiA9IDQsXG4gIGludDE2ID0gNSxcbiAgaW50MzIgPSA2LFxuICBpbnQ2NCA9IDcsXG4gIHN0cmluZyA9IDgsXG4gIGJvb2wgPSA5LFxuICBmbG9hdDE2ID0gMTAsXG4gIGRvdWJsZSA9IDExLFxuICB1aW50MzIgPSAxMixcbiAgdWludDY0ID0gMTMsXG4gIGNvbXBsZXg2NCA9IDE0LFxuICBjb21wbGV4MTI4ID0gMTUsXG4gIGJmbG9hdDE2ID0gMTZcbn1cblxuLyoqXG4gKiBNYXAgc3RyaW5nIHRlbnNvciBkYXRhIHRvIGVudW0gdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtID0gKHR5cGU6IHN0cmluZyk6IERhdGFUeXBlID0+IHtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnaW50OCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50ODtcbiAgICBjYXNlICd1aW50OCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDg7XG4gICAgY2FzZSAnYm9vbCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuYm9vbDtcbiAgICBjYXNlICdpbnQxNic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50MTY7XG4gICAgY2FzZSAndWludDE2JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50MTY7XG4gICAgY2FzZSAnaW50MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDMyO1xuICAgIGNhc2UgJ3VpbnQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDMyO1xuICAgIGNhc2UgJ2Zsb2F0MTYnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmZsb2F0MTY7XG4gICAgY2FzZSAnZmxvYXQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZmxvYXQ7XG4gICAgY2FzZSAnZmxvYXQ2NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZG91YmxlO1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuc3RyaW5nO1xuICAgIGNhc2UgJ2ludDY0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQ2NDtcbiAgICBjYXNlICd1aW50NjQnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQ2NDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlfWApO1xuICB9XG59O1xuXG4vKipcbiAqIE1hcCBlbnVtIHZhbHVlIHRvIHN0cmluZyB0ZW5zb3IgZGF0YVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcgPSAodHlwZVByb3RvOiBEYXRhVHlwZSk6IFRlbnNvci5UeXBlID0+IHtcbiAgc3dpdGNoICh0eXBlUHJvdG8pIHtcbiAgICBjYXNlIERhdGFUeXBlLmludDg6XG4gICAgICByZXR1cm4gJ2ludDgnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDg6XG4gICAgICByZXR1cm4gJ3VpbnQ4JztcbiAgICBjYXNlIERhdGFUeXBlLmJvb2w6XG4gICAgICByZXR1cm4gJ2Jvb2wnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50MTY6XG4gICAgICByZXR1cm4gJ2ludDE2JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQxNjpcbiAgICAgIHJldHVybiAndWludDE2JztcbiAgICBjYXNlIERhdGFUeXBlLmludDMyOlxuICAgICAgcmV0dXJuICdpbnQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50MzI6XG4gICAgICByZXR1cm4gJ3VpbnQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS5mbG9hdDE2OlxuICAgICAgcmV0dXJuICdmbG9hdDE2JztcbiAgICBjYXNlIERhdGFUeXBlLmZsb2F0OlxuICAgICAgcmV0dXJuICdmbG9hdDMyJztcbiAgICBjYXNlIERhdGFUeXBlLmRvdWJsZTpcbiAgICAgIHJldHVybiAnZmxvYXQ2NCc7XG4gICAgY2FzZSBEYXRhVHlwZS5zdHJpbmc6XG4gICAgICByZXR1cm4gJ3N0cmluZyc7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQ2NDpcbiAgICAgIHJldHVybiAnaW50NjQnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDY0OlxuICAgICAgcmV0dXJuICd1aW50NjQnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGVQcm90b31gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBnZXQgdGVuc29yIGVsZW1lbnQgc2l6ZSBpbiBieXRlcyBieSB0aGUgZ2l2ZW4gZGF0YSB0eXBlXG4gKiBAcmV0dXJucyBzaXplIGluIGludGVnZXIgb3IgdW5kZWZpbmVkIGlmIHRoZSBkYXRhIHR5cGUgaXMgbm90IHN1cHBvcnRlZFxuICovXG5leHBvcnQgY29uc3QgZ2V0VGVuc29yRWxlbWVudFNpemUgPSAoZGF0ZVR5cGU6IG51bWJlcik6IG51bWJlcnxcbiAgICB1bmRlZmluZWQgPT4gW3VuZGVmaW5lZCwgNCwgMSwgMSwgMiwgMiwgNCwgOCwgdW5kZWZpbmVkLCAxLCAyLCA4LCA0LCA4LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkXVtkYXRlVHlwZV07XG5cbi8qKlxuICogZ2V0IHR5cGVkIGFycmF5IGNvbnN0cnVjdG9yIGJ5IHRoZSBnaXZlbiB0ZW5zb3IgdHlwZVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yID0gKHR5cGU6IFRlbnNvci5UeXBlKTogRmxvYXQzMkFycmF5Q29uc3RydWN0b3J8VWludDhBcnJheUNvbnN0cnVjdG9yfFxuICAgIEludDhBcnJheUNvbnN0cnVjdG9yfFVpbnQxNkFycmF5Q29uc3RydWN0b3J8SW50MTZBcnJheUNvbnN0cnVjdG9yfEludDMyQXJyYXlDb25zdHJ1Y3RvcnxCaWdJbnQ2NEFycmF5Q29uc3RydWN0b3J8XG4gICAgVWludDhBcnJheUNvbnN0cnVjdG9yfEZsb2F0NjRBcnJheUNvbnN0cnVjdG9yfFVpbnQzMkFycmF5Q29uc3RydWN0b3J8QmlnVWludDY0QXJyYXlDb25zdHJ1Y3RvciA9PiB7XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnZmxvYXQxNic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdmbG9hdDMyJzpcbiAgICAgICAgICByZXR1cm4gRmxvYXQzMkFycmF5O1xuICAgICAgICBjYXNlICd1aW50OCc6XG4gICAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDgnOlxuICAgICAgICAgIHJldHVybiBJbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQxNic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdpbnQxNic6XG4gICAgICAgICAgcmV0dXJuIEludDE2QXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDMyJzpcbiAgICAgICAgICByZXR1cm4gSW50MzJBcnJheTtcbiAgICAgICAgY2FzZSAnYm9vbCc6XG4gICAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ2Zsb2F0NjQnOlxuICAgICAgICAgIHJldHVybiBGbG9hdDY0QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQzMic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQzMkFycmF5O1xuICAgICAgICBjYXNlICdpbnQ2NCc6XG4gICAgICAgICAgcmV0dXJuIEJpZ0ludDY0QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQ2NCc6XG4gICAgICAgICAgcmV0dXJuIEJpZ1VpbnQ2NEFycmF5O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgdHlwZTogJHt0eXBlfWApO1xuICAgICAgfVxuICAgIH07XG5cbi8qKlxuICogTWFwIHN0cmluZyBsb2cgbGV2ZWwgdG8gaW50ZWdlciB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgbG9nTGV2ZWxTdHJpbmdUb0VudW0gPSAobG9nTGV2ZWw/OiAndmVyYm9zZSd8J2luZm8nfCd3YXJuaW5nJ3wnZXJyb3InfCdmYXRhbCcpOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGxvZ0xldmVsKSB7XG4gICAgY2FzZSAndmVyYm9zZSc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdpbmZvJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAnZXJyb3InOlxuICAgICAgcmV0dXJuIDM7XG4gICAgY2FzZSAnZmF0YWwnOlxuICAgICAgcmV0dXJuIDQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgbG9nZ2luZyBsZXZlbDogJHtsb2dMZXZlbH1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiB0ZW5zb3IgdHlwZSBpcyBzdXBwb3J0ZWQgYnkgR1BVIGJ1ZmZlclxuICovXG5leHBvcnQgY29uc3QgaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlID0gKHR5cGU6IFRlbnNvci5UeXBlKTogdHlwZSBpcyBUZW5zb3IuR3B1QnVmZmVyRGF0YVR5cGVzID0+IHR5cGUgPT09ICdmbG9hdDMyJyB8fFxuICAgIHR5cGUgPT09ICdpbnQzMicgfHwgdHlwZSA9PT0gJ2ludDY0JyB8fCB0eXBlID09PSAnYm9vbCcgfHwgdHlwZSA9PT0gJ2Zsb2F0MTYnIHx8IHR5cGUgPT09ICd1aW50MzInO1xuXG4vKipcbiAqIE1hcCBzdHJpbmcgZGF0YSBsb2NhdGlvbiB0byBpbnRlZ2VyIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0gPSAobG9jYXRpb246IFRlbnNvci5EYXRhTG9jYXRpb24pOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGxvY2F0aW9uKSB7XG4gICAgY2FzZSAnbm9uZSc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdjcHUnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnY3B1LXBpbm5lZCc6XG4gICAgICByZXR1cm4gMjtcbiAgICBjYXNlICd0ZXh0dXJlJzpcbiAgICAgIHJldHVybiAzO1xuICAgIGNhc2UgJ2dwdS1idWZmZXInOlxuICAgICAgcmV0dXJuIDQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSBsb2NhdGlvbjogJHtsb2NhdGlvbn1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXAgaW50ZWdlciBkYXRhIGxvY2F0aW9uIHRvIHN0cmluZyB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZGF0YUxvY2F0aW9uRW51bVRvU3RyaW5nID0gKGxvY2F0aW9uOiBudW1iZXIpOiBUZW5zb3IuRGF0YUxvY2F0aW9ufHVuZGVmaW5lZCA9PlxuICAgIChbJ25vbmUnLCAnY3B1JywgJ2NwdS1waW5uZWQnLCAndGV4dHVyZScsICdncHUtYnVmZmVyJ10gYXMgY29uc3QpW2xvY2F0aW9uXTtcbiIsICJleHBvcnQgY29uc3QgcmVhZEZpbGUgPSB1bmRlZmluZWQ7ZXhwb3J0IGNvbnN0IHJlYWRGaWxlU3luYyA9IHVuZGVmaW5lZDtleHBvcnQgY29uc3QgY3JlYXRlUmVhZFN0cmVhbSA9IHVuZGVmaW5lZDsiLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7cmVhZEZpbGV9IGZyb20gJ25vZGU6ZnMvcHJvbWlzZXMnO1xuXG4vKipcbiAqIExvYWQgYSBmaWxlIGludG8gYSBVaW50OEFycmF5LlxuICpcbiAqIEBwYXJhbSBmaWxlIC0gdGhlIGZpbGUgdG8gbG9hZC4gQ2FuIGJlIGEgVVJML3BhdGgsIGEgQmxvYiwgYW4gQXJyYXlCdWZmZXIsIG9yIGEgVWludDhBcnJheS5cbiAqIEByZXR1cm5zIGEgVWludDhBcnJheSBjb250YWluaW5nIHRoZSBmaWxlIGRhdGEuXG4gKi9cbmV4cG9ydCBjb25zdCBsb2FkRmlsZSA9IGFzeW5jKGZpbGU6IHN0cmluZ3xCbG9ifEFycmF5QnVmZmVyTGlrZXxVaW50OEFycmF5KTogUHJvbWlzZTxVaW50OEFycmF5PiA9PiB7XG4gIGlmICh0eXBlb2YgZmlsZSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlKSB7XG4gICAgICAvLyBsb2FkIGZpbGUgaW50byBBcnJheUJ1ZmZlciBpbiBOb2RlLmpzXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVhZEZpbGUoZmlsZSkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZS5jb2RlID09PSAnRVJSX0ZTX0ZJTEVfVE9PX0xBUkdFJykge1xuICAgICAgICAgIC8vIGZpbGUgaXMgdG9vIGxhcmdlLCB1c2UgZnMuY3JlYXRlUmVhZFN0cmVhbSBpbnN0ZWFkXG4gICAgICAgICAgY29uc3Qgc3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlKTtcbiAgICAgICAgICBjb25zdCBjaHVua3M6IFVpbnQ4QXJyYXlbXSA9IFtdO1xuICAgICAgICAgIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2Ygc3RyZWFtKSB7XG4gICAgICAgICAgICBjaHVua3MucHVzaChjaHVuayk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShCdWZmZXIuY29uY2F0KGNodW5rcykpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGxvYWQgZmlsZSBpbnRvIEFycmF5QnVmZmVyIGluIGJyb3dzZXJzXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGZpbGUpO1xuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGZhaWxlZCB0byBsb2FkIGV4dGVybmFsIGRhdGEgZmlsZTogJHtmaWxlfWApO1xuICAgICAgfVxuICAgICAgY29uc3QgY29udGVudExlbmd0aEhlYWRlciA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LUxlbmd0aCcpO1xuICAgICAgY29uc3QgZmlsZVNpemUgPSBjb250ZW50TGVuZ3RoSGVhZGVyID8gcGFyc2VJbnQoY29udGVudExlbmd0aEhlYWRlciwgMTApIDogMDtcbiAgICAgIGlmIChmaWxlU2l6ZSA8IDEwNzM3NDE4MjQgLyogMUdCICovKSB7XG4gICAgICAgIC8vIHdoZW4gQ29udGVudC1MZW5ndGggaGVhZGVyIGlzIG5vdCBzZXQsIHdlIGNhbm5vdCBkZXRlcm1pbmUgdGhlIGZpbGUgc2l6ZS4gV2UgYXNzdW1lIGl0IGlzIHNtYWxsIGVub3VnaCB0b1xuICAgICAgICAvLyBsb2FkIGludG8gbWVtb3J5LlxuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBmaWxlIGlzIHRvbyBsYXJnZSwgdXNlIHN0cmVhbSBpbnN0ZWFkXG4gICAgICAgIGlmICghcmVzcG9uc2UuYm9keSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZmFpbGVkIHRvIGxvYWQgZXh0ZXJuYWwgZGF0YSBmaWxlOiAke2ZpbGV9LCBubyByZXNwb25zZSBib2R5LmApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlLmJvZHkuZ2V0UmVhZGVyKCk7XG5cbiAgICAgICAgLy8gdXNlIFdlYkFzc2VtYmx5IE1lbW9yeSB0byBhbGxvY2F0ZSBsYXJnZXIgQXJyYXlCdWZmZXJcbiAgICAgICAgY29uc3QgcGFnZXMgPSBNYXRoLmNlaWwoZmlsZVNpemUgLyA2NTUzNik7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBXZWJBc3NlbWJseS5NZW1vcnkoe2luaXRpYWw6IHBhZ2VzLCBtYXhpbXVtOiBwYWdlc30pLmJ1ZmZlcjtcblxuICAgICAgICBsZXQgb2Zmc2V0ID0gMDtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgIGNvbnN0IHtkb25lLCB2YWx1ZX0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgY2h1bmtTaXplID0gdmFsdWUuYnl0ZUxlbmd0aDtcbiAgICAgICAgICBjb25zdCBjaHVuayA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgb2Zmc2V0LCBjaHVua1NpemUpO1xuICAgICAgICAgIGNodW5rLnNldCh2YWx1ZSk7XG4gICAgICAgICAgb2Zmc2V0ICs9IGNodW5rU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyLCAwLCBmaWxlU2l6ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH0gZWxzZSBpZiAoZmlsZSBpbnN0YW5jZW9mIEJsb2IpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgZmlsZS5hcnJheUJ1ZmZlcigpKTtcbiAgfSBlbHNlIGlmIChmaWxlIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgIHJldHVybiBmaWxlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShmaWxlKTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtFbnYsIEluZmVyZW5jZVNlc3Npb24sIFRlbnNvcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlciwgU2VyaWFsaXphYmxlU2Vzc2lvbk1ldGFkYXRhLCBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YSwgVGVuc29yTWV0YWRhdGF9IGZyb20gJy4vcHJveHktbWVzc2FnZXMnO1xuaW1wb3J0IHtzZXRSdW5PcHRpb25zfSBmcm9tICcuL3J1bi1vcHRpb25zJztcbmltcG9ydCB7c2V0U2Vzc2lvbk9wdGlvbnN9IGZyb20gJy4vc2Vzc2lvbi1vcHRpb25zJztcbmltcG9ydCB7ZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtLCBnZXRUZW5zb3JFbGVtZW50U2l6ZSwgaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlLCBsb2dMZXZlbFN0cmluZ1RvRW51bSwgdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcsIHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtLCB0ZW5zb3JUeXBlVG9UeXBlZEFycmF5Q29uc3RydWN0b3J9IGZyb20gJy4vd2FzbS1jb21tb24nO1xuaW1wb3J0IHtnZXRJbnN0YW5jZX0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuaW1wb3J0IHthbGxvY1dhc21TdHJpbmcsIGNoZWNrTGFzdEVycm9yfSBmcm9tICcuL3dhc20tdXRpbHMnO1xuaW1wb3J0IHtsb2FkRmlsZX0gZnJvbSAnLi93YXNtLXV0aWxzLWxvYWQtZmlsZSc7XG5cbi8vICNyZWdpb24gSW5pdGlhbGl6YXRpb25zXG5cbi8qKlxuICogVGhlcmUgYXJlIDQgZGlmZmVyZW50IFwiaW5pdGlhbGl6YXRpb25cIiBzdGVwcyBmb3IgT1JULiBUaGV5IGhhcHBlbiBpbiBkaWZmZXJlbnQgcGxhY2VzIGFuZCBkaWZmZXJlbnQgdGltZS5cbiAqXG4gKiAxLiBKYXZhU2NyaXB0IGluaXRpYWxpemF0aW9uIGZvciBvbm54cnVudGltZS1jb21tb24gYW5kIG9ubnhydW50aW1lLXdlYi5cbiAqICAgIFRoaXMgaXMgdGhlIGZpcnN0IGluaXRpYWxpemF0aW9uIHN0ZXAuIEluIHRoaXMgc3RlcCwgb25ueHJ1bnRpbWUtd2ViIGNhbGxzIG9ubnhydW50aW1lLWNvbW1vbidzIHJlZ2lzdGVyQmFja2VuZCgpXG4gKiBmdW5jdGlvbiBtdWx0aXBsZSB0aW1lcyB0byByZWdpc3RlciBhbGwgdGhlIGF2YWlsYWJsZSBiYWNrZW5kcy4gVGhlIGJhY2tlbmQgcmVnaXN0cmF0aW9uIGlzIHZlcnkgZmFzdC4gSXQgb25seVxuICogcmVnaXN0ZXJzIHRoZSBiYWNrZW5kIG5hbWUgd2l0aCB0aGUgdW5pbml0aWFsaXplZCBiYWNrZW5kIG9iamVjdC4gTm8gaGVhdnkgaW5pdGlhbGl6YXRpb24gaXMgZG9uZSBpbiB0aGlzIHN0ZXAuXG4gKiAgICBSZWZlciB0byB3ZWIvbGliL2luZGV4LnRzIGZvciB0aGUgYmFja2VuZCByZWdpc3RyYXRpb24uXG4gKlxuICogMi4gV2ViQXNzZW1ibHkgYXJ0aWZhY3QgaW5pdGlhbGl6YXRpb24uXG4gKiAgICBUaGlzIGhhcHBlbnMgd2hlbiBhbnkgcmVnaXN0ZXJlZCB3YXNtIGJhY2tlbmQgaXMgdXNlZCBmb3IgdGhlIGZpcnN0IHRpbWUgKGllLiBgb3J0LkluZmVyZW5jZVNlc3Npb24uY3JlYXRlKClgIG9yXG4gKiBgb3J0LlRyYWluaW5nU2Vzc2lvbi5jcmVhdGUoKWAgaXMgY2FsbGVkKS4gSW4gdGhpcyBzdGVwLCBvbm54cnVudGltZS13ZWIgZG9lcyB0aGUgZm9sbG93aW5nczpcbiAqICAgICAtIGNyZWF0ZSBhIHByb3h5IHdvcmtlciBhbmQgbWFrZSBzdXJlIHRoZSBwcm94eSB3b3JrZXIgaXMgcmVhZHkgdG8gcmVjZWl2ZSBtZXNzYWdlcywgaWYgcHJveHkgaXMgZW5hYmxlZC5cbiAqICAgICAtIHBlcmZvcm0gZmVhdHVyZSBkZXRlY3Rpb24sIGxvY2F0ZSBjb3JyZWN0IFdlYkFzc2VtYmx5IGFydGlmYWN0IHBhdGggYW5kIGNhbGwgdGhlIEVtc2NyaXB0ZW4gZ2VuZXJhdGVkXG4gKiBKYXZhU2NyaXB0IGNvZGUgdG8gaW5pdGlhbGl6ZSB0aGUgV2ViQXNzZW1ibHkgcnVudGltZS5cbiAqICAgICAgICAgLSBpZiBwcm94eSBpcyBlbmFibGVkLCB0aGlzIHN0ZXAgaGFwcGVucyBpbiB0aGUgcHJveHkgd29ya2VyIHVzaW5nIG1lc3NhZ2UgJ2luaXQtd2FzbScuXG4gKiAgICAgICAgIC0gZG93bmxvYWRpbmcgdGhlICdvcnQtd2FzbXsuLi59Lndhc20nIGZpbGUgaXMgZG9uZSBpbiB0aGlzIHN0ZXAuXG4gKiAgICAgICAgIC0gaWYgbXVsdGktdGhyZWFkIGlzIGVuYWJsZWQsIG9uZSBvciBtb3JlIHdlYndvcmtlciB3aWxsIGJlIGNyZWF0ZWQgdG8gaW5pdGlhbGl6ZSB0aGUgUFRocmVhZCB0aHJlYWRwb29sLlxuICpcbiAqIDMuIE9SVCBlbnZpcm9ubWVudCBpbml0aWFsaXphdGlvbi5cbiAqICAgIFRoaXMgaGFwcGVucyBhZnRlciBzdGVwIDIuIEluIHRoaXMgc3RlcCwgb25ueHJ1bnRpbWUtd2ViIHBlcmZvcm1zIE9OTlggUnVudGltZSBlbnZpcm9ubWVudCBpbml0aWFsaXphdGlvbi5cbiAqIEZ1bmN0aW9uIGBfT3J0SW5pdCgpYCBpcyBjYWxsZWQgaW4gdGhpcyBzdGVwLlxuICogICAgIC0gaWYgcHJveHkgaXMgZW5hYmxlZCwgdGhpcyBzdGVwIGhhcHBlbnMgaW4gdGhlIHByb3h5IHdvcmtlciB1c2luZyBtZXNzYWdlICdpbml0LW9ydCcuXG4gKiAgICAgLSBsb2dnaW5nIGxldmVsIChvcnQuZW52LmxvZ0xldmVsKSBhbmQgdGhyZWFkIG51bWJlciAob3J0LmVudi53YXNtLm51bVRocmVhZHMpIGFyZSBzZXQgaW4gdGhpcyBzdGVwLlxuICpcbiAqIDQuIFNlc3Npb24gaW5pdGlhbGl6YXRpb24uXG4gKiAgICBUaGlzIGhhcHBlbnMgd2hlbiBgb3J0LkluZmVyZW5jZVNlc3Npb24uY3JlYXRlKClgIG9yIGBvcnQuVHJhaW5pbmdTZXNzaW9uLmNyZWF0ZSgpYCBpcyBjYWxsZWQuIFVubGlrZSB0aGUgZmlyc3QgM1xuICogc3RlcHMgKHRoZXkgb25seSBjYWxsZWQgb25jZSksIHRoaXMgc3RlcCB3aWxsIGJlIGRvbmUgZm9yIGVhY2ggc2Vzc2lvbi4gSW4gdGhpcyBzdGVwLCBvbm54cnVudGltZS13ZWIgZG9lcyB0aGVcbiAqIGZvbGxvd2luZ3M6XG4gKiAgICBJZiB0aGUgcGFyYW1ldGVyIGlzIGEgVVJMOlxuICogICAgLSBkb3dubG9hZCB0aGUgbW9kZWwgZGF0YSBmcm9tIHRoZSBVUkwuXG4gKiAgICAtIGNvcHkgdGhlIG1vZGVsIGRhdGEgdG8gdGhlIFdBU00gaGVhcC4gKHByb3h5OiAnY29weS1mcm9tJylcbiAqICAgIC0gZGVyZWZlcmVuY2UgdGhlIG1vZGVsIGJ1ZmZlci4gVGhpcyBzdGVwIGFsbG93cyB0aGUgb3JpZ2luYWwgQXJyYXlCdWZmZXIgdG8gYmUgZ2FyYmFnZSBjb2xsZWN0ZWQuXG4gKiAgICAtIGNhbGwgYF9PcnRDcmVhdGVTZXNzaW9uKClgIHRvIGNyZWF0ZSB0aGUgc2Vzc2lvbi4gKHByb3h5OiAnY3JlYXRlJylcbiAqXG4gKiAgICBJZiB0aGUgcGFyYW1ldGVyIGlzIGEgVWludDhBcnJheSBvYmplY3Q6XG4gKiAgICAtIGNvcHkgdGhlIG1vZGVsIGRhdGEgdG8gdGhlIFdBU00gaGVhcC4gKHByb3h5OiAnY29weS1mcm9tJylcbiAqICAgIC0gY2FsbCBgX09ydENyZWF0ZVNlc3Npb24oKWAgdG8gY3JlYXRlIHRoZSBzZXNzaW9uLiAocHJveHk6ICdjcmVhdGUnKVxuICpcbiAqXG4gKi9cblxuLyoqXG4gKiBpbml0aWFsaXplIE9SVCBlbnZpcm9ubWVudC5cbiAqXG4gKiBAcGFyYW0gbnVtVGhyZWFkcyBTZXRHbG9iYWxJbnRyYU9wTnVtVGhyZWFkcyhudW1UaHJlYWRzKVxuICogQHBhcmFtIGxvZ2dpbmdMZXZlbCBDcmVhdGVFbnYoc3RhdGljX2Nhc3Q8T3J0TG9nZ2luZ0xldmVsPihsb2dnaW5nX2xldmVsKSlcbiAqL1xuY29uc3QgaW5pdE9ydCA9IChudW1UaHJlYWRzOiBudW1iZXIsIGxvZ2dpbmdMZXZlbDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IGVycm9yQ29kZSA9IGdldEluc3RhbmNlKCkuX09ydEluaXQobnVtVGhyZWFkcywgbG9nZ2luZ0xldmVsKTtcbiAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGluaXRpYWxpemUgb25ueHJ1bnRpbWUuJyk7XG4gIH1cbn07XG5cbi8qKlxuICogaW50aWFsaXplIHJ1bnRpbWUgZW52aXJvbm1lbnQuXG4gKiBAcGFyYW0gZW52IHBhc3NlZCBpbiB0aGUgZW52aXJvbm1lbnQgY29uZmlnIG9iamVjdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGluaXRSdW50aW1lID0gYXN5bmMoZW52OiBFbnYpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgLy8gaW5pdCBPUlRcbiAgaW5pdE9ydChlbnYud2FzbS5udW1UaHJlYWRzISwgbG9nTGV2ZWxTdHJpbmdUb0VudW0oZW52LmxvZ0xldmVsKSk7XG59O1xuXG4vKipcbiAqIHBlcmZvcm0gRVAgc3BlY2lmaWMgaW5pdGlhbGl6YXRpb24uXG4gKlxuICogQHBhcmFtIGVudlxuICogQHBhcmFtIGVwTmFtZVxuICovXG5leHBvcnQgY29uc3QgaW5pdEVwID0gYXN5bmMoZW52OiBFbnYsIGVwTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiAoZXBOYW1lID09PSAnd2ViZ3B1JyB8fCBlcE5hbWUgPT09ICd3ZWJubicpKSB7XG4gICAgLy8gcGVyZm9ybSBXZWJHUFUgYXZhaWxhYmlsaXR5IGNoZWNrXG4gICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnIHx8ICFuYXZpZ2F0b3IuZ3B1KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkdQVSBpcyBub3Qgc3VwcG9ydGVkIGluIGN1cnJlbnQgZW52aXJvbm1lbnQnKTtcbiAgICB9XG4gICAgY29uc3QgYWRhcHRlciA9IGF3YWl0IG5hdmlnYXRvci5ncHUucmVxdWVzdEFkYXB0ZXIoKTtcbiAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnRmFpbGVkIHRvIGdldCBHUFUgYWRhcHRlci4gWW91IG1heSBuZWVkIHRvIGVuYWJsZSBmbGFnIFwiLS1lbmFibGUtdW5zYWZlLXdlYmdwdVwiIGlmIHlvdSBhcmUgdXNpbmcgQ2hyb21lLicpO1xuICAgIH1cblxuICAgIGlmICghZW52Lndhc20uc2ltZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdOb3Qgc3VwcG9ydGVkIGZvciBXZWJHUFU9T04gYW5kIFNJTUQ9T0ZGLiBQbGVhc2Ugc2V0IGBlbnYud2FzbS5zaW1kYCB0byB0cnVlIHdoZW4gdXNpbmcgYHdlYmdwdWAgRVAnKTtcbiAgICB9XG5cbiAgICAvLyBpbml0IEpTRVAgaWYgYXZhaWxhYmxlXG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cywgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICAgIGNvbnN0IGluaXRKc2VwID0gcmVxdWlyZSgnLi9qc2VwL2luaXQnKS5pbml0O1xuICAgIGF3YWl0IGluaXRKc2VwKGdldEluc3RhbmNlKCksIGVudiwgYWRhcHRlcik7XG4gIH1cbn07XG5cbi8vICNlbmRyZWdpb24gSW5pdGlhbGl6YXRpb25zXG5cbi8qKlxuICogdmFsaWQgZGF0YSBsb2NhdGlvbnMgZm9yIGlucHV0L291dHB1dCB0ZW5zb3JzLlxuICovXG50eXBlIFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0ID0gJ2NwdSd8J2NwdS1waW5uZWQnfCdncHUtYnVmZmVyJztcblxudHlwZSBJT0JpbmRpbmdTdGF0ZSA9IHtcbiAgLyoqXG4gICAqIHRoZSBoYW5kbGUgb2YgSU8gYmluZGluZy5cbiAgICovXG4gIHJlYWRvbmx5IGhhbmRsZTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiB0aGUgcHJlZmVycmVkIGxvY2F0aW9uIGZvciBlYWNoIG91dHB1dCB0ZW5zb3IuXG4gICAqXG4gICAqIHZhbHVlIGlzIG9uZSBvZiAnY3B1JywgJ2NwdS1waW5uZWQnLCAnZ3B1LWJ1ZmZlcicuXG4gICAqL1xuICByZWFkb25seSBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnM6IHJlYWRvbmx5IFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0W107XG5cbiAgLyoqXG4gICAqIGVudW0gdmFsdWUgb2YgdGhlIHByZWZlcnJlZCBsb2NhdGlvbiBmb3IgZWFjaCBvdXRwdXQgdGVuc29yLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZDogcmVhZG9ubHkgbnVtYmVyW107XG59O1xuXG4vKipcbiAqICB0dXBsZSBlbGVtZW50cyBhcmU6IEluZmVyZW5jZVNlc3Npb24gSUQ7IGlucHV0TmFtZXNVVEY4RW5jb2RlZDsgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDsgYmluZGluZ1N0YXRlXG4gKi9cbnR5cGUgU2Vzc2lvbk1ldGFkYXRhID0gW1xuICBpbmZlcmVuY2VTZXNzaW9uSWQ6IG51bWJlciwgaW5wdXROYW1lc1VURjhFbmNvZGVkOiBudW1iZXJbXSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDogbnVtYmVyW10sXG4gIGJpbmRpbmdTdGF0ZTogSU9CaW5kaW5nU3RhdGV8bnVsbFxuXTtcblxuY29uc3QgYWN0aXZlU2Vzc2lvbnMgPSBuZXcgTWFwPG51bWJlciwgU2Vzc2lvbk1ldGFkYXRhPigpO1xuXG4vKipcbiAqIGdldCB0aGUgaW5wdXQvb3V0cHV0IGNvdW50IG9mIHRoZSBzZXNzaW9uLlxuICogQHBhcmFtIHNlc3Npb25IYW5kbGUgdGhlIGhhbmRsZSByZXByZXNlbnRpbmcgdGhlIHNlc3Npb24uIHNob3VsZCBiZSBub24temVyby5cbiAqIEByZXR1cm5zIGEgdHVwbGUgaW5jbHVkaW5nIDIgbnVtYmVycywgcmVwcmVzZW50aW5nIHRoZSBpbnB1dCBjb3VudCBhbmQgb3V0cHV0IGNvdW50LlxuICovXG5jb25zdCBnZXRTZXNzaW9uSW5wdXRPdXRwdXRDb3VudCA9IChzZXNzaW9uSGFuZGxlOiBudW1iZXIpOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBkYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDgpO1xuICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEdldElucHV0T3V0cHV0Q291bnQoc2Vzc2lvbkhhbmRsZSwgZGF0YU9mZnNldCwgZGF0YU9mZnNldCArIDQpO1xuICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBzZXNzaW9uIGlucHV0L291dHB1dCBjb3VudC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIFt3YXNtLkhFQVAzMltkYXRhT2Zmc2V0IC8gNF0sIHdhc20uSEVBUDMyW2RhdGFPZmZzZXQgLyA0ICsgMV1dO1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgfVxufTtcblxuLyoqXG4gKiBhbGxvY2F0ZSB0aGUgbWVtb3J5IGFuZCBtZW1jcHkgdGhlIGV4dGVybmFsIGJ1ZmZlci5cbiAqXG4gKiBAcGFyYW0gbW9kZWwgLSB0aGUgZXh0ZXJuYWwgYnVmZmVyIGNvbnRhaW5pbmcgdGhlIG1vZGVsIGRhdGEuIE11c3Qgbm90IGJlIHRoZSBzYW1lIGJ1ZmZlciBhcyB0aGUgV0FTTSBoZWFwLlxuICogQHJldHVybnMgYSAyLWVsZW1lbnRzIHR1cGxlIC0gdGhlIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIGFsbG9jYXRlZCBidWZmZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIgPSAobW9kZWw6IFVpbnQ4QXJyYXkpOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IG1vZGVsRGF0YU9mZnNldCA9IHdhc20uX21hbGxvYyhtb2RlbC5ieXRlTGVuZ3RoKTtcbiAgaWYgKG1vZGVsRGF0YU9mZnNldCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgY3JlYXRlIGEgc2Vzc2lvbi4gZmFpbGVkIHRvIGFsbG9jYXRlIGEgYnVmZmVyIG9mIHNpemUgJHttb2RlbC5ieXRlTGVuZ3RofS5gKTtcbiAgfVxuICB3YXNtLkhFQVBVOC5zZXQobW9kZWwsIG1vZGVsRGF0YU9mZnNldCk7XG4gIHJldHVybiBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbC5ieXRlTGVuZ3RoXTtcbn07XG5cbi8qKlxuICogY3JlYXRlIGFuIGluZmVyZW5jZSBzZXNzaW9uIGZyb20gYSBtb2RlbCBkYXRhIGJ1ZmZlci5cbiAqXG4gKiBAcGFyYW0gbW9kZWxEYXRhIC0gZWl0aGVyIGEgVWludDhBcnJheSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBtb2RlbCBkYXRhLCBvciBhIDItZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyB0aGVcbiAqICAgICBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBtb2RlbCBkYXRhIGJ1ZmZlci5cbiAqIEBwYXJhbSBvcHRpb25zIGFuIG9wdGlvbmFsIHNlc3Npb24gb3B0aW9ucyBvYmplY3QuXG4gKiBAcmV0dXJucyBhIDMtZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyBbc2Vzc2lvbiBoYW5kbGUsIGlucHV0IG5hbWVzLCBvdXRwdXQgbmFtZXNdXG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uID0gYXN5bmMoXG4gICAgbW9kZWxEYXRhOiBVaW50OEFycmF5fFNlcmlhbGl6YWJsZUludGVybmFsQnVmZmVyLFxuICAgIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogUHJvbWlzZTxTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGE+ID0+IHtcbiAgbGV0IG1vZGVsRGF0YU9mZnNldDogbnVtYmVyLCBtb2RlbERhdGFMZW5ndGg6IG51bWJlcjtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkobW9kZWxEYXRhKSkge1xuICAgIC8vIGlmIG1vZGVsIGRhdGEgaXMgYW4gYXJyYXksIGl0IG11c3QgYmUgYSAyLWVsZW1lbnRzIHR1cGxlIGNvbnRhaW5pbmcgdGhlIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIG1vZGVsIGRhdGFcbiAgICBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGhdID0gbW9kZWxEYXRhO1xuICB9IGVsc2UgaWYgKG1vZGVsRGF0YS5idWZmZXIgPT09IHdhc20uSEVBUFU4LmJ1ZmZlcikge1xuICAgIC8vIGlmIG1vZGVsIGRhdGEgdXNlcyB0aGUgc2FtZSBidWZmZXIgYXMgdGhlIFdBU00gaGVhcCwgd2UgZG9uJ3QgbmVlZCB0byBjb3B5IGl0LlxuICAgIFttb2RlbERhdGFPZmZzZXQsIG1vZGVsRGF0YUxlbmd0aF0gPSBbbW9kZWxEYXRhLmJ5dGVPZmZzZXQsIG1vZGVsRGF0YS5ieXRlTGVuZ3RoXTtcbiAgfSBlbHNlIHtcbiAgICAvLyBvdGhlcndpc2UsIGNvcHkgdGhlIG1vZGVsIGRhdGEgdG8gdGhlIFdBU00gaGVhcC5cbiAgICBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGhdID0gY29weUZyb21FeHRlcm5hbEJ1ZmZlcihtb2RlbERhdGEpO1xuICB9XG5cbiAgbGV0IHNlc3Npb25IYW5kbGUgPSAwO1xuICBsZXQgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSAwO1xuICBsZXQgaW9CaW5kaW5nSGFuZGxlID0gMDtcbiAgbGV0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgaW5wdXROYW1lc1VURjhFbmNvZGVkID0gW107XG4gIGNvbnN0IG91dHB1dE5hbWVzVVRGOEVuY29kZWQgPSBbXTtcblxuICB0cnkge1xuICAgIFtzZXNzaW9uT3B0aW9uc0hhbmRsZSwgYWxsb2NzXSA9IHNldFNlc3Npb25PcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgaWYgKG9wdGlvbnM/LmV4dGVybmFsRGF0YSAmJiB3YXNtLm1vdW50RXh0ZXJuYWxEYXRhKSB7XG4gICAgICBjb25zdCBsb2FkaW5nUHJvbWlzZXMgPSBbXTtcbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBvcHRpb25zLmV4dGVybmFsRGF0YSkge1xuICAgICAgICBjb25zdCBwYXRoID0gdHlwZW9mIGZpbGUgPT09ICdzdHJpbmcnID8gZmlsZSA6IGZpbGUucGF0aDtcbiAgICAgICAgbG9hZGluZ1Byb21pc2VzLnB1c2gobG9hZEZpbGUodHlwZW9mIGZpbGUgPT09ICdzdHJpbmcnID8gZmlsZSA6IGZpbGUuZGF0YSkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICB3YXNtLm1vdW50RXh0ZXJuYWxEYXRhIShwYXRoLCBkYXRhKTtcbiAgICAgICAgfSkpO1xuICAgICAgfVxuXG4gICAgICAvLyB3YWl0IGZvciBhbGwgZXh0ZXJuYWwgZGF0YSBmaWxlcyB0byBiZSBsb2FkZWRcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGxvYWRpbmdQcm9taXNlcyk7XG4gICAgfVxuXG4gICAgc2Vzc2lvbkhhbmRsZSA9IGF3YWl0IHdhc20uX09ydENyZWF0ZVNlc3Npb24obW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGgsIHNlc3Npb25PcHRpb25zSGFuZGxlKTtcbiAgICBpZiAoc2Vzc2lvbkhhbmRsZSA9PT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgY3JlYXRlIGEgc2Vzc2lvbi4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBbaW5wdXRDb3VudCwgb3V0cHV0Q291bnRdID0gZ2V0U2Vzc2lvbklucHV0T3V0cHV0Q291bnQoc2Vzc2lvbkhhbmRsZSk7XG5cbiAgICBjb25zdCBpbnB1dE5hbWVzID0gW107XG4gICAgY29uc3Qgb3V0cHV0TmFtZXMgPSBbXTtcbiAgICBjb25zdCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnM6IFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0W10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xuICAgICAgY29uc3QgbmFtZSA9IHdhc20uX09ydEdldElucHV0TmFtZShzZXNzaW9uSGFuZGxlLCBpKTtcbiAgICAgIGlmIChuYW1lID09PSAwKSB7XG4gICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBhbiBpbnB1dCBuYW1lLicpO1xuICAgICAgfVxuICAgICAgaW5wdXROYW1lc1VURjhFbmNvZGVkLnB1c2gobmFtZSk7XG4gICAgICBpbnB1dE5hbWVzLnB1c2god2FzbS5VVEY4VG9TdHJpbmcobmFtZSkpO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgIGNvbnN0IG5hbWUgPSB3YXNtLl9PcnRHZXRPdXRwdXROYW1lKHNlc3Npb25IYW5kbGUsIGkpO1xuICAgICAgaWYgKG5hbWUgPT09IDApIHtcbiAgICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIG91dHB1dCBuYW1lLicpO1xuICAgICAgfVxuICAgICAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZC5wdXNoKG5hbWUpO1xuICAgICAgY29uc3QgbmFtZVN0cmluZyA9IHdhc20uVVRGOFRvU3RyaW5nKG5hbWUpO1xuICAgICAgb3V0cHV0TmFtZXMucHVzaChuYW1lU3RyaW5nKTtcblxuICAgICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVKSB7XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdHlwZW9mIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uID09PSAnc3RyaW5nJyA/XG4gICAgICAgICAgICBvcHRpb25zLnByZWZlcnJlZE91dHB1dExvY2F0aW9uIDpcbiAgICAgICAgICAgIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uPy5bbmFtZVN0cmluZ10gPz8gJ2NwdSc7XG4gICAgICAgIGlmIChsb2NhdGlvbiAhPT0gJ2NwdScgJiYgbG9jYXRpb24gIT09ICdjcHUtcGlubmVkJyAmJiBsb2NhdGlvbiAhPT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBOb3Qgc3VwcG9ydGVkIHByZWZlcnJlZCBvdXRwdXQgbG9jYXRpb246ICR7bG9jYXRpb259LmApO1xuICAgICAgICB9XG4gICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5wdXNoKGxvY2F0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB1c2UgSU8gYmluZGluZyBvbmx5IHdoZW4gYXQgbGVhc3Qgb25lIG91dHB1dCBpcyBwcmVmZmVyZWQgdG8gYmUgb24gR1BVLlxuICAgIGxldCBiaW5kaW5nU3RhdGU6IElPQmluZGluZ1N0YXRlfG51bGwgPSBudWxsO1xuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMuc29tZShsID0+IGwgPT09ICdncHUtYnVmZmVyJykpIHtcbiAgICAgIGlvQmluZGluZ0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZUJpbmRpbmcoc2Vzc2lvbkhhbmRsZSk7XG4gICAgICBpZiAoaW9CaW5kaW5nSGFuZGxlID09PSAwKSB7XG4gICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBJTyBiaW5kaW5nLicpO1xuICAgICAgfVxuXG4gICAgICBiaW5kaW5nU3RhdGUgPSB7XG4gICAgICAgIGhhbmRsZTogaW9CaW5kaW5nSGFuZGxlLFxuICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMsXG4gICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWQ6IG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5tYXAobCA9PiBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0obCkpLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBhY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvbkhhbmRsZSwgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgYmluZGluZ1N0YXRlXSk7XG4gICAgcmV0dXJuIFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzLCBvdXRwdXROYW1lc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpbnB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcbiAgICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG5cbiAgICBpZiAoaW9CaW5kaW5nSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlQmluZGluZyhpb0JpbmRpbmdIYW5kbGUpO1xuICAgIH1cblxuICAgIGlmIChzZXNzaW9uSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbihzZXNzaW9uSGFuZGxlKTtcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLl9mcmVlKG1vZGVsRGF0YU9mZnNldCk7XG4gICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnMoc2Vzc2lvbk9wdGlvbnNIYW5kbGUpO1xuICAgIH1cbiAgICBhbGxvY3MuZm9yRWFjaChhbGxvYyA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XG5cbiAgICAvLyB1bm1vdW50IGV4dGVybmFsIGRhdGEgaWYgbmVjZXNzYXJ5XG4gICAgd2FzbS51bm1vdW50RXh0ZXJuYWxEYXRhPy4oKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHJlbGVhc2VTZXNzaW9uID0gKHNlc3Npb25JZDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJlbGVhc2Ugc2Vzc2lvbi4gaW52YWxpZCBzZXNzaW9uIGlkOiAke3Nlc3Npb25JZH1gKTtcbiAgfVxuICBjb25zdCBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkLCBpb0JpbmRpbmdTdGF0ZV0gPSBzZXNzaW9uO1xuXG4gIGlmIChpb0JpbmRpbmdTdGF0ZSkge1xuICAgIHdhc20uX09ydFJlbGVhc2VCaW5kaW5nKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gIH1cblxuICB3YXNtLmpzZXBVbnJlZ2lzdGVyQnVmZmVycz8uKHNlc3Npb25JZCk7XG5cbiAgaW5wdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gIG91dHB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcbiAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb24oc2Vzc2lvbkhhbmRsZSk7XG4gIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uSWQpO1xufTtcblxuZXhwb3J0IGNvbnN0IHByZXBhcmVJbnB1dE91dHB1dFRlbnNvciA9XG4gICAgKHRlbnNvcjogVGVuc29yTWV0YWRhdGF8bnVsbCwgdGVuc29ySGFuZGxlczogbnVtYmVyW10sIGFsbG9jczogbnVtYmVyW10sIHNlc3Npb25JZDogbnVtYmVyLCBpbmRleDogbnVtYmVyKTpcbiAgICAgICAgdm9pZCA9PiB7XG4gICAgICAgICAgaWYgKCF0ZW5zb3IpIHtcbiAgICAgICAgICAgIHRlbnNvckhhbmRsZXMucHVzaCgwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICAgIGNvbnN0IGRhdGFUeXBlID0gdGVuc29yWzBdO1xuICAgICAgICAgIGNvbnN0IGRpbXMgPSB0ZW5zb3JbMV07XG4gICAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0ZW5zb3JbM107XG5cbiAgICAgICAgICBsZXQgcmF3RGF0YTogbnVtYmVyO1xuICAgICAgICAgIGxldCBkYXRhQnl0ZUxlbmd0aDogbnVtYmVyO1xuXG4gICAgICAgICAgaWYgKGRhdGFUeXBlID09PSAnc3RyaW5nJyAmJiBsb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmluZyB0ZW5zb3IgaXMgbm90IHN1cHBvcnRlZCBvbiBHUFUuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGxvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgIGNvbnN0IGdwdUJ1ZmZlciA9IHRlbnNvclsyXS5ncHVCdWZmZXIgYXMgR1BVQnVmZmVyO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNpemVJbkJ5dGVzID0gZ2V0VGVuc29yRWxlbWVudFNpemUodGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0oZGF0YVR5cGUpKSE7XG4gICAgICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IGRpbXMucmVkdWNlKChhLCBiKSA9PiBhICogYiwgMSkgKiBlbGVtZW50U2l6ZUluQnl0ZXM7XG4gICAgICAgICAgICByYXdEYXRhID0gd2FzbS5qc2VwUmVnaXN0ZXJCdWZmZXIoc2Vzc2lvbklkLCBpbmRleCwgZ3B1QnVmZmVyLCBkYXRhQnl0ZUxlbmd0aCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB0ZW5zb3JbMl07XG5cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgIC8vIHN0cmluZyB0ZW5zb3JcbiAgICAgICAgICAgICAgZGF0YUJ5dGVMZW5ndGggPSA0ICogZGF0YS5sZW5ndGg7XG4gICAgICAgICAgICAgIHJhd0RhdGEgPSB3YXNtLl9tYWxsb2MoZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgICAgICAgICBhbGxvY3MucHVzaChyYXdEYXRhKTtcbiAgICAgICAgICAgICAgbGV0IGRhdGFJbmRleCA9IHJhd0RhdGEgLyA0O1xuICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGB0ZW5zb3IgZGF0YSBhdCBpbmRleCAke2l9IGlzIG5vdCBhIHN0cmluZ2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB3YXNtLkhFQVBVMzJbZGF0YUluZGV4KytdID0gYWxsb2NXYXNtU3RyaW5nKGRhdGFbaV0sIGFsbG9jcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gZGF0YS5ieXRlTGVuZ3RoO1xuICAgICAgICAgICAgICByYXdEYXRhID0gd2FzbS5fbWFsbG9jKGRhdGFCeXRlTGVuZ3RoKTtcbiAgICAgICAgICAgICAgYWxsb2NzLnB1c2gocmF3RGF0YSk7XG4gICAgICAgICAgICAgIHdhc20uSEVBUFU4LnNldChuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhQnl0ZUxlbmd0aCksIHJhd0RhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgICAgICAgICBjb25zdCBkaW1zT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiBkaW1zLmxlbmd0aCk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBkaW1JbmRleCA9IGRpbXNPZmZzZXQgLyA0O1xuICAgICAgICAgICAgZGltcy5mb3JFYWNoKGQgPT4gd2FzbS5IRUFQMzJbZGltSW5kZXgrK10gPSBkKTtcbiAgICAgICAgICAgIGNvbnN0IHRlbnNvciA9IHdhc20uX09ydENyZWF0ZVRlbnNvcihcbiAgICAgICAgICAgICAgICB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bShkYXRhVHlwZSksIHJhd0RhdGEsIGRhdGFCeXRlTGVuZ3RoLCBkaW1zT2Zmc2V0LCBkaW1zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0obG9jYXRpb24pKTtcbiAgICAgICAgICAgIGlmICh0ZW5zb3IgPT09IDApIHtcbiAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGNyZWF0ZSB0ZW5zb3IgZm9yIGlucHV0L291dHB1dC4gc2Vzc2lvbj0ke3Nlc3Npb25JZH0sIGluZGV4PSR7aW5kZXh9LmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGVuc29ySGFuZGxlcy5wdXNoKHRlbnNvcik7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbi8qKlxuICogcGVyZm9ybSBpbmZlcmVuY2UgcnVuXG4gKi9cbmV4cG9ydCBjb25zdCBydW4gPSBhc3luYyhcbiAgICBzZXNzaW9uSWQ6IG51bWJlciwgaW5wdXRJbmRpY2VzOiBudW1iZXJbXSwgaW5wdXRUZW5zb3JzOiBUZW5zb3JNZXRhZGF0YVtdLCBvdXRwdXRJbmRpY2VzOiBudW1iZXJbXSxcbiAgICBvdXRwdXRUZW5zb3JzOiBBcnJheTxUZW5zb3JNZXRhZGF0YXxudWxsPiwgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogUHJvbWlzZTxUZW5zb3JNZXRhZGF0YVtdPiA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJ1biBpbmZlcmVuY2UuIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3QgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgaW9CaW5kaW5nU3RhdGVdID0gc2Vzc2lvbjtcblxuICBjb25zdCBpbnB1dENvdW50ID0gaW5wdXRJbmRpY2VzLmxlbmd0aDtcbiAgY29uc3Qgb3V0cHV0Q291bnQgPSBvdXRwdXRJbmRpY2VzLmxlbmd0aDtcblxuICBsZXQgcnVuT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGxldCBydW5PcHRpb25zQWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IGlucHV0VGVuc29ySGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3Qgb3V0cHV0VGVuc29ySGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgaW5wdXRPdXRwdXRBbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgYmVmb3JlUnVuU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICBjb25zdCBpbnB1dFZhbHVlc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhpbnB1dENvdW50ICogNCk7XG4gIGNvbnN0IGlucHV0TmFtZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoaW5wdXRDb3VudCAqIDQpO1xuICBjb25zdCBvdXRwdXRWYWx1ZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2Mob3V0cHV0Q291bnQgKiA0KTtcbiAgY29uc3Qgb3V0cHV0TmFtZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2Mob3V0cHV0Q291bnQgKiA0KTtcblxuICB0cnkge1xuICAgIFtydW5PcHRpb25zSGFuZGxlLCBydW5PcHRpb25zQWxsb2NzXSA9IHNldFJ1bk9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAvLyBjcmVhdGUgaW5wdXQgdGVuc29yc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IoaW5wdXRUZW5zb3JzW2ldLCBpbnB1dFRlbnNvckhhbmRsZXMsIGlucHV0T3V0cHV0QWxsb2NzLCBzZXNzaW9uSWQsIGlucHV0SW5kaWNlc1tpXSk7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIG91dHB1dCB0ZW5zb3JzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IoXG4gICAgICAgICAgb3V0cHV0VGVuc29yc1tpXSwgb3V0cHV0VGVuc29ySGFuZGxlcywgaW5wdXRPdXRwdXRBbGxvY3MsIHNlc3Npb25JZCwgaW5wdXRDb3VudCArIG91dHB1dEluZGljZXNbaV0pO1xuICAgIH1cblxuICAgIGxldCBpbnB1dFZhbHVlc0luZGV4ID0gaW5wdXRWYWx1ZXNPZmZzZXQgLyA0O1xuICAgIGxldCBpbnB1dE5hbWVzSW5kZXggPSBpbnB1dE5hbWVzT2Zmc2V0IC8gNDtcbiAgICBsZXQgb3V0cHV0VmFsdWVzSW5kZXggPSBvdXRwdXRWYWx1ZXNPZmZzZXQgLyA0O1xuICAgIGxldCBvdXRwdXROYW1lc0luZGV4ID0gb3V0cHV0TmFtZXNPZmZzZXQgLyA0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICB3YXNtLkhFQVBVMzJbaW5wdXRWYWx1ZXNJbmRleCsrXSA9IGlucHV0VGVuc29ySGFuZGxlc1tpXTtcbiAgICAgIHdhc20uSEVBUFUzMltpbnB1dE5hbWVzSW5kZXgrK10gPSBpbnB1dE5hbWVzVVRGOEVuY29kZWRbaW5wdXRJbmRpY2VzW2ldXTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzSW5kZXgrK10gPSBvdXRwdXRUZW5zb3JIYW5kbGVzW2ldO1xuICAgICAgd2FzbS5IRUFQVTMyW291dHB1dE5hbWVzSW5kZXgrK10gPSBvdXRwdXROYW1lc1VURjhFbmNvZGVkW291dHB1dEluZGljZXNbaV1dO1xuICAgIH1cblxuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiBpb0JpbmRpbmdTdGF0ZSkge1xuICAgICAgY29uc3Qge2hhbmRsZSwgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkfSA9IGlvQmluZGluZ1N0YXRlO1xuXG4gICAgICBpZiAoaW5wdXROYW1lc1VURjhFbmNvZGVkLmxlbmd0aCAhPT0gaW5wdXRDb3VudCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGlucHV0IGNvdW50IGZyb20gZmVlZHMgKCR7XG4gICAgICAgICAgICBpbnB1dENvdW50fSkgaXMgZXhwZWN0ZWQgdG8gYmUgYWx3YXlzIGVxdWFsIHRvIG1vZGVsJ3MgaW5wdXQgY291bnQgKCR7aW5wdXROYW1lc1VURjhFbmNvZGVkLmxlbmd0aH0pLmApO1xuICAgICAgfVxuXG4gICAgICAvLyBwcm9jZXNzIGlucHV0c1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBpbnB1dEluZGljZXNbaV07XG4gICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydEJpbmRJbnB1dChoYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIGlucHV0VGVuc29ySGFuZGxlc1tpXSk7XG4gICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBpbnB1dFske2l9XSBmb3Igc2Vzc2lvbj0ke3Nlc3Npb25JZH0uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcHJvY2VzcyBwcmUtYWxsb2NhdGVkIG91dHB1dHNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgICBjb25zdCBpbmRleCA9IG91dHB1dEluZGljZXNbaV07XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gb3V0cHV0VGVuc29yc1tpXT8uWzNdOyAgLy8gdW5kZWZpbmVkIG1lYW5zIG91dHB1dCBpcyBub3QgcHJlLWFsbG9jYXRlZC5cblxuICAgICAgICBpZiAobG9jYXRpb24pIHtcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgcHJlLWFsbG9jYXRlZC4gYmluZCB0aGUgdGVuc29yLlxuICAgICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEJpbmRPdXRwdXQoaGFuZGxlLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkW2luZGV4XSwgb3V0cHV0VGVuc29ySGFuZGxlc1tpXSwgMCk7XG4gICAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgcHJlLWFsbG9jYXRlZCBvdXRwdXRbJHtpfV0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgbm90IHByZS1hbGxvY2F0ZWQuIHJlc2V0IHByZWZlcnJlZCBsb2NhdGlvbi5cbiAgICAgICAgICBjb25zdCBlcnJvckNvZGUgPVxuICAgICAgICAgICAgICB3YXNtLl9PcnRCaW5kT3V0cHV0KGhhbmRsZSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIDAsIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWRbaW5kZXhdKTtcbiAgICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBvdXRwdXRbJHtpfV0gdG8gJHtvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbaV19IGZvciBzZXNzaW9uPSR7c2Vzc2lvbklkfS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZXJyb3JDb2RlOiBudW1iZXI7XG5cbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bldpdGhCaW5kaW5nKFxuICAgICAgICAgIHNlc3Npb25IYW5kbGUsIGlvQmluZGluZ1N0YXRlLmhhbmRsZSwgb3V0cHV0Q291bnQsIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bihcbiAgICAgICAgICBzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzT2Zmc2V0LCBpbnB1dFZhbHVlc09mZnNldCwgaW5wdXRDb3VudCwgb3V0cHV0TmFtZXNPZmZzZXQsIG91dHB1dENvdW50LFxuICAgICAgICAgIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ2ZhaWxlZCB0byBjYWxsIE9ydFJ1bigpLicpO1xuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dDogVGVuc29yTWV0YWRhdGFbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzT2Zmc2V0IC8gNCArIGldO1xuICAgICAgaWYgKHRlbnNvciA9PT0gb3V0cHV0VGVuc29ySGFuZGxlc1tpXSkge1xuICAgICAgICAvLyBvdXRwdXQgdGVuc29yIGlzIHByZS1hbGxvY2F0ZWQuIG5vIG5lZWQgdG8gY29weSBkYXRhLlxuICAgICAgICBvdXRwdXQucHVzaChvdXRwdXRUZW5zb3JzW2ldISk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICAgICAgLy8gc3RhY2sgYWxsb2NhdGUgNCBwb2ludGVyIHZhbHVlXG4gICAgICBjb25zdCB0ZW5zb3JEYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiA0KTtcblxuICAgICAgbGV0IGtlZXBPdXRwdXRUZW5zb3IgPSBmYWxzZTtcbiAgICAgIGxldCB0eXBlOiBUZW5zb3IuVHlwZXx1bmRlZmluZWQsIGRhdGFPZmZzZXQgPSAwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0VGVuc29yRGF0YShcbiAgICAgICAgICAgIHRlbnNvciwgdGVuc29yRGF0YU9mZnNldCwgdGVuc29yRGF0YU9mZnNldCArIDQsIHRlbnNvckRhdGFPZmZzZXQgKyA4LCB0ZW5zb3JEYXRhT2Zmc2V0ICsgMTIpO1xuICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGFjY2VzcyBvdXRwdXQgdGVuc29yIGRhdGEgb24gaW5kZXggJHtpfS5gKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGVuc29yRGF0YUluZGV4ID0gdGVuc29yRGF0YU9mZnNldCAvIDQ7XG4gICAgICAgIGNvbnN0IGRhdGFUeXBlID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgZGF0YU9mZnNldCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGNvbnN0IGRpbXNPZmZzZXQgPSB3YXNtLkhFQVBVMzJbdGVuc29yRGF0YUluZGV4KytdO1xuICAgICAgICBjb25zdCBkaW1zTGVuZ3RoID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgY29uc3QgZGltcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgIGRpbXMucHVzaCh3YXNtLkhFQVBVMzJbZGltc09mZnNldCAvIDQgKyBpXSk7XG4gICAgICAgIH1cbiAgICAgICAgd2FzbS5fT3J0RnJlZShkaW1zT2Zmc2V0KTtcblxuICAgICAgICBjb25zdCBzaXplID0gZGltcy5yZWR1Y2UoKGEsIGIpID0+IGEgKiBiLCAxKTtcbiAgICAgICAgdHlwZSA9IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nKGRhdGFUeXBlKTtcblxuICAgICAgICBjb25zdCBwcmVmZXJyZWRMb2NhdGlvbiA9IGlvQmluZGluZ1N0YXRlPy5vdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbb3V0cHV0SW5kaWNlc1tpXV07XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3RyaW5nIHRlbnNvciBpcyBub3Qgc3VwcG9ydGVkIG9uIEdQVS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgc3RyaW5nRGF0YTogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBsZXQgZGF0YUluZGV4ID0gZGF0YU9mZnNldCAvIDQ7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHdhc20uSEVBUFUzMltkYXRhSW5kZXgrK107XG4gICAgICAgICAgICBjb25zdCBtYXhCeXRlc1RvUmVhZCA9IGkgPT09IHNpemUgLSAxID8gdW5kZWZpbmVkIDogd2FzbS5IRUFQVTMyW2RhdGFJbmRleF0gLSBvZmZzZXQ7XG4gICAgICAgICAgICBzdHJpbmdEYXRhLnB1c2god2FzbS5VVEY4VG9TdHJpbmcob2Zmc2V0LCBtYXhCeXRlc1RvUmVhZCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgc3RyaW5nRGF0YSwgJ2NwdSddKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBhIGNlcnRhaW4gb3V0cHV0J3MgcHJlZmVycmVkIGxvY2F0aW9uIGlzIEdQVSBidXQgdGhlIHRlbnNvciBpcyBlbXB0eSwgd2Ugc3RpbGwgbmVlZCB0byBjcmVhdGUgYSBDUFVcbiAgICAgICAgICAvLyB0ZW5zb3IgZm9yIGl0LiBUaGVyZSBpcyBubyBtYXBwaW5nIEdQVSBidWZmZXIgZm9yIGFuIGVtcHR5IHRlbnNvci5cbiAgICAgICAgICBpZiAocHJlZmVycmVkTG9jYXRpb24gPT09ICdncHUtYnVmZmVyJyAmJiBzaXplID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZ3B1QnVmZmVyID0gd2FzbS5qc2VwR2V0QnVmZmVyKGRhdGFPZmZzZXQpO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNpemUgPSBnZXRUZW5zb3JFbGVtZW50U2l6ZShkYXRhVHlwZSk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudFNpemUgPT09IHVuZGVmaW5lZCB8fCAhaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGV9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRvIG5vdCByZWxlYXNlIHRoZSB0ZW5zb3IgcmlnaHQgbm93LiBpdCB3aWxsIGJlIHJlbGVhc2VkIHdoZW4gdXNlciBjYWxscyB0ZW5zb3IuZGlzcG9zZSgpLlxuICAgICAgICAgICAga2VlcE91dHB1dFRlbnNvciA9IHRydWU7XG5cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFtcbiAgICAgICAgICAgICAgdHlwZSwgZGltcywge1xuICAgICAgICAgICAgICAgIGdwdUJ1ZmZlcixcbiAgICAgICAgICAgICAgICBkb3dubG9hZDogd2FzbS5qc2VwQ3JlYXRlRG93bmxvYWRlcihncHVCdWZmZXIsIHNpemUgKiBlbGVtZW50U2l6ZSwgdHlwZSksXG4gICAgICAgICAgICAgICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ2dwdS1idWZmZXInXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZWRBcnJheUNvbnN0cnVjdG9yID0gdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yKHR5cGUpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyB0eXBlZEFycmF5Q29uc3RydWN0b3Ioc2l6ZSk7XG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpXG4gICAgICAgICAgICAgICAgLnNldCh3YXNtLkhFQVBVOC5zdWJhcnJheShkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgZGF0YS5ieXRlTGVuZ3RoKSk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgZGF0YSwgJ2NwdSddKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKGJlZm9yZUdldFRlbnNvckRhdGFTdGFjayk7XG4gICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiBkYXRhT2Zmc2V0KSB7XG4gICAgICAgICAgd2FzbS5fZnJlZShkYXRhT2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWtlZXBPdXRwdXRUZW5zb3IpIHtcbiAgICAgICAgICB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHRlbnNvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIHdhc20uX09ydENsZWFyQm91bmRPdXRwdXRzKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShiZWZvcmVSdW5TdGFjayk7XG5cbiAgICBpbnB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIG91dHB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIGlucHV0T3V0cHV0QWxsb2NzLmZvckVhY2gocCA9PiB3YXNtLl9mcmVlKHApKTtcblxuICAgIGlmIChydW5PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlUnVuT3B0aW9ucyhydW5PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgcnVuT3B0aW9uc0FsbG9jcy5mb3JFYWNoKHAgPT4gd2FzbS5fZnJlZShwKSk7XG4gIH1cbn07XG5cbi8qKlxuICogZW5kIHByb2ZpbGluZ1xuICovXG5leHBvcnQgY29uc3QgZW5kUHJvZmlsaW5nID0gKHNlc3Npb25JZDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzZXNzaW9uIGlkJyk7XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbkhhbmRsZSA9IHNlc3Npb25bMF07XG5cbiAgLy8gcHJvZmlsZSBmaWxlIG5hbWUgaXMgbm90IHVzZWQgeWV0LCBidXQgaXQgbXVzdCBiZSBmcmVlZC5cbiAgY29uc3QgcHJvZmlsZUZpbGVOYW1lID0gd2FzbS5fT3J0RW5kUHJvZmlsaW5nKHNlc3Npb25IYW5kbGUpO1xuICBpZiAocHJvZmlsZUZpbGVOYW1lID09PSAwKSB7XG4gICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIHByb2ZpbGUgZmlsZSBuYW1lLicpO1xuICB9XG4gIHdhc20uX09ydEZyZWUocHJvZmlsZUZpbGVOYW1lKTtcbn07XG5cbmV4cG9ydCBjb25zdCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycyA9ICh0ZW5zb3JzOiByZWFkb25seSBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YVtdKTogQXJyYXlCdWZmZXJMaWtlW10gPT4ge1xuICBjb25zdCBidWZmZXJzOiBBcnJheUJ1ZmZlckxpa2VbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHRlbnNvciBvZiB0ZW5zb3JzKSB7XG4gICAgY29uc3QgZGF0YSA9IHRlbnNvclsyXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkgJiYgJ2J1ZmZlcicgaW4gZGF0YSkge1xuICAgICAgYnVmZmVycy5wdXNoKGRhdGEuYnVmZmVyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ1ZmZlcnM7XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge2VudiwgSW5mZXJlbmNlU2Vzc2lvbn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtPcnRXYXNtTWVzc2FnZSwgU2VyaWFsaXphYmxlSW50ZXJuYWxCdWZmZXIsIFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YSwgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGEsIFRlbnNvck1ldGFkYXRhfSBmcm9tICcuL3Byb3h5LW1lc3NhZ2VzJztcbmltcG9ydCAqIGFzIGNvcmUgZnJvbSAnLi93YXNtLWNvcmUtaW1wbCc7XG5pbXBvcnQge2luaXRpYWxpemVXZWJBc3NlbWJseX0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuXG5jb25zdCBpc1Byb3h5ID0gKCk6IGJvb2xlYW4gPT4gISFlbnYud2FzbS5wcm94eSAmJiB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnO1xubGV0IHByb3h5V29ya2VyOiBXb3JrZXJ8dW5kZWZpbmVkO1xubGV0IGluaXRpYWxpemluZyA9IGZhbHNlO1xubGV0IGluaXRpYWxpemVkID0gZmFsc2U7XG5sZXQgYWJvcnRlZCA9IGZhbHNlO1xuXG50eXBlIFByb21pc2VDYWxsYmFja3M8VCA9IHZvaWQ+ID0gW3Jlc29sdmU6IChyZXN1bHQ6IFQpID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbjogdW5rbm93bikgPT4gdm9pZF07XG5sZXQgaW5pdFdhc21DYWxsYmFja3M6IFByb21pc2VDYWxsYmFja3M7XG5jb25zdCBxdWV1ZWRDYWxsYmFja3M6IE1hcDxPcnRXYXNtTWVzc2FnZVsndHlwZSddLCBBcnJheTxQcm9taXNlQ2FsbGJhY2tzPHVua25vd24+Pj4gPSBuZXcgTWFwKCk7XG5cbmNvbnN0IGVucXVldWVDYWxsYmFja3MgPSAodHlwZTogT3J0V2FzbU1lc3NhZ2VbJ3R5cGUnXSwgY2FsbGJhY2tzOiBQcm9taXNlQ2FsbGJhY2tzPHVua25vd24+KTogdm9pZCA9PiB7XG4gIGNvbnN0IHF1ZXVlID0gcXVldWVkQ2FsbGJhY2tzLmdldCh0eXBlKTtcbiAgaWYgKHF1ZXVlKSB7XG4gICAgcXVldWUucHVzaChjYWxsYmFja3MpO1xuICB9IGVsc2Uge1xuICAgIHF1ZXVlZENhbGxiYWNrcy5zZXQodHlwZSwgW2NhbGxiYWNrc10pO1xuICB9XG59O1xuXG5jb25zdCBlbnN1cmVXb3JrZXIgPSAoKTogdm9pZCA9PiB7XG4gIGlmIChpbml0aWFsaXppbmcgfHwgIWluaXRpYWxpemVkIHx8IGFib3J0ZWQgfHwgIXByb3h5V29ya2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd3b3JrZXIgbm90IHJlYWR5Jyk7XG4gIH1cbn07XG5cbmNvbnN0IG9uUHJveHlXb3JrZXJNZXNzYWdlID0gKGV2OiBNZXNzYWdlRXZlbnQ8T3J0V2FzbU1lc3NhZ2U+KTogdm9pZCA9PiB7XG4gIHN3aXRjaCAoZXYuZGF0YS50eXBlKSB7XG4gICAgY2FzZSAnaW5pdC13YXNtJzpcbiAgICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgaWYgKGV2LmRhdGEuZXJyKSB7XG4gICAgICAgIGFib3J0ZWQgPSB0cnVlO1xuICAgICAgICBpbml0V2FzbUNhbGxiYWNrc1sxXShldi5kYXRhLmVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIGluaXRXYXNtQ2FsbGJhY2tzWzBdKCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdpbml0LWVwJzpcbiAgICBjYXNlICdjb3B5LWZyb20nOlxuICAgIGNhc2UgJ2NyZWF0ZSc6XG4gICAgY2FzZSAncmVsZWFzZSc6XG4gICAgY2FzZSAncnVuJzpcbiAgICBjYXNlICdlbmQtcHJvZmlsaW5nJzoge1xuICAgICAgY29uc3QgY2FsbGJhY2tzID0gcXVldWVkQ2FsbGJhY2tzLmdldChldi5kYXRhLnR5cGUpITtcbiAgICAgIGlmIChldi5kYXRhLmVycikge1xuICAgICAgICBjYWxsYmFja3Muc2hpZnQoKSFbMV0oZXYuZGF0YS5lcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2tzLnNoaWZ0KCkhWzBdKGV2LmRhdGEub3V0ISk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgZGVmYXVsdDpcbiAgfVxufTtcblxuY29uc3Qgc2NyaXB0U3JjID0gdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyA/IChkb2N1bWVudD8uY3VycmVudFNjcmlwdCBhcyBIVE1MU2NyaXB0RWxlbWVudCk/LnNyYyA6IHVuZGVmaW5lZDtcblxuZXhwb3J0IGNvbnN0IGluaXRpYWxpemVXZWJBc3NlbWJseUFuZE9ydFJ1bnRpbWUgPSBhc3luYygpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgaWYgKGluaXRpYWxpemVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChpbml0aWFsaXppbmcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ211bHRpcGxlIGNhbGxzIHRvIFxcJ2luaXRXYXNtKClcXCcgZGV0ZWN0ZWQuJyk7XG4gIH1cbiAgaWYgKGFib3J0ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3ByZXZpb3VzIGNhbGwgdG8gXFwnaW5pdFdhc20oKVxcJyBmYWlsZWQuJyk7XG4gIH1cblxuICBpbml0aWFsaXppbmcgPSB0cnVlO1xuXG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fUFJPWFkgJiYgaXNQcm94eSgpKSB7XG4gICAgLy8gb3ZlcndyaXRlIHdhc20gZmlsZXBhdGhzXG4gICAgaWYgKGVudi53YXNtLndhc21QYXRocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoc2NyaXB0U3JjICYmIHNjcmlwdFNyYy5pbmRleE9mKCdibG9iOicpICE9PSAwKSB7XG4gICAgICAgIGVudi53YXNtLndhc21QYXRocyA9IHNjcmlwdFNyYy5zdWJzdHIoMCwgKyhzY3JpcHRTcmMpLmxhc3RJbmRleE9mKCcvJykgKyAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcHJveHlXb3JrZXI/LnRlcm1pbmF0ZSgpO1xuXG4gICAgICBjb25zdCB3b3JrZXJVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIC8vIFRoaXMgcmVxdWlyZSgpIGZ1bmN0aW9uIGlzIGhhbmRsZWQgYnkgZXNidWlsZCBwbHVnaW4gdG8gbG9hZCBmaWxlIGNvbnRlbnQgYXMgc3RyaW5nLlxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHNcbiAgICAgICAgICAgIHJlcXVpcmUoJy4vcHJveHktd29ya2VyL21haW4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAge3R5cGU6ICd0ZXh0L2phdmFzY3JpcHQnfSkpO1xuICAgICAgcHJveHlXb3JrZXIgPSBuZXcgV29ya2VyKHdvcmtlclVybCwge25hbWU6ICdvcnQtd2FzbS1wcm94eS13b3JrZXInfSk7XG4gICAgICBwcm94eVdvcmtlci5vbmVycm9yID0gKGV2OiBFcnJvckV2ZW50KSA9PiByZWplY3QoZXYpO1xuICAgICAgcHJveHlXb3JrZXIub25tZXNzYWdlID0gb25Qcm94eVdvcmtlck1lc3NhZ2U7XG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHdvcmtlclVybCk7XG4gICAgICBpbml0V2FzbUNhbGxiYWNrcyA9IFtyZXNvbHZlLCByZWplY3RdO1xuICAgICAgY29uc3QgbWVzc2FnZTogT3J0V2FzbU1lc3NhZ2UgPSB7dHlwZTogJ2luaXQtd2FzbScsIGluIDogZW52fTtcbiAgICAgIHByb3h5V29ya2VyLnBvc3RNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH0pO1xuXG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGluaXRpYWxpemVXZWJBc3NlbWJseShlbnYud2FzbSk7XG4gICAgICBhd2FpdCBjb3JlLmluaXRSdW50aW1lKGVudik7XG4gICAgICBpbml0aWFsaXplZCA9IHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgYWJvcnRlZCA9IHRydWU7XG4gICAgICB0aHJvdyBlO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBpbml0aWFsaXplT3J0RXAgPSBhc3luYyhlcE5hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4gPT4ge1xuICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1BST1hZICYmIGlzUHJveHkoKSkge1xuICAgIGVuc3VyZVdvcmtlcigpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBlbnF1ZXVlQ2FsbGJhY2tzKCdpbml0LWVwJywgW3Jlc29sdmUsIHJlamVjdF0pO1xuICAgICAgY29uc3QgbWVzc2FnZTogT3J0V2FzbU1lc3NhZ2UgPSB7dHlwZTogJ2luaXQtZXAnLCBpbiA6IHtlcE5hbWUsIGVudn19O1xuICAgICAgcHJveHlXb3JrZXIhLnBvc3RNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGF3YWl0IGNvcmUuaW5pdEVwKGVudiwgZXBOYW1lKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIgPSBhc3luYyhidWZmZXI6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPFNlcmlhbGl6YWJsZUludGVybmFsQnVmZmVyPiA9PiB7XG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fUFJPWFkgJiYgaXNQcm94eSgpKSB7XG4gICAgZW5zdXJlV29ya2VyKCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFNlcmlhbGl6YWJsZUludGVybmFsQnVmZmVyPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBlbnF1ZXVlQ2FsbGJhY2tzKCdjb3B5LWZyb20nLCBbcmVzb2x2ZSwgcmVqZWN0XSk7XG4gICAgICBjb25zdCBtZXNzYWdlOiBPcnRXYXNtTWVzc2FnZSA9IHt0eXBlOiAnY29weS1mcm9tJywgaW4gOiB7YnVmZmVyfX07XG4gICAgICBwcm94eVdvcmtlciEucG9zdE1lc3NhZ2UobWVzc2FnZSwgW2J1ZmZlci5idWZmZXJdKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY29yZS5jb3B5RnJvbUV4dGVybmFsQnVmZmVyKGJ1ZmZlcik7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uID1cbiAgICBhc3luYyhtb2RlbDogU2VyaWFsaXphYmxlSW50ZXJuYWxCdWZmZXJ8VWludDhBcnJheSwgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOlxuICAgICAgICBQcm9taXNlPFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YT4gPT4ge1xuICAgICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fUFJPWFkgJiYgaXNQcm94eSgpKSB7XG4gICAgICAgICAgICAvLyBjaGVjayB1bnN1cHBvcnRlZCBvcHRpb25zXG4gICAgICAgICAgICBpZiAob3B0aW9ucz8ucHJlZmVycmVkT3V0cHV0TG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXNzaW9uIG9wdGlvbiBcInByZWZlcnJlZE91dHB1dExvY2F0aW9uXCIgaXMgbm90IHN1cHBvcnRlZCBmb3IgcHJveHkuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbnN1cmVXb3JrZXIoKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGE+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgZW5xdWV1ZUNhbGxiYWNrcygnY3JlYXRlJywgW3Jlc29sdmUsIHJlamVjdF0pO1xuICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlOiBPcnRXYXNtTWVzc2FnZSA9IHt0eXBlOiAnY3JlYXRlJywgaW4gOiB7bW9kZWwsIG9wdGlvbnN9fTtcbiAgICAgICAgICAgICAgY29uc3QgdHJhbnNmZXJhYmxlOiBUcmFuc2ZlcmFibGVbXSA9IFtdO1xuICAgICAgICAgICAgICBpZiAobW9kZWwgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICAgICAgICAgICAgdHJhbnNmZXJhYmxlLnB1c2gobW9kZWwuYnVmZmVyKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwcm94eVdvcmtlciEucG9zdE1lc3NhZ2UobWVzc2FnZSwgdHJhbnNmZXJhYmxlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY29yZS5jcmVhdGVTZXNzaW9uKG1vZGVsLCBvcHRpb25zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbmV4cG9ydCBjb25zdCByZWxlYXNlU2Vzc2lvbiA9IGFzeW5jKHNlc3Npb25JZDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fUFJPWFkgJiYgaXNQcm94eSgpKSB7XG4gICAgZW5zdXJlV29ya2VyKCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGVucXVldWVDYWxsYmFja3MoJ3JlbGVhc2UnLCBbcmVzb2x2ZSwgcmVqZWN0XSk7XG4gICAgICBjb25zdCBtZXNzYWdlOiBPcnRXYXNtTWVzc2FnZSA9IHt0eXBlOiAncmVsZWFzZScsIGluIDogc2Vzc2lvbklkfTtcbiAgICAgIHByb3h5V29ya2VyIS5wb3N0TWVzc2FnZShtZXNzYWdlKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBjb3JlLnJlbGVhc2VTZXNzaW9uKHNlc3Npb25JZCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBydW4gPSBhc3luYyhcbiAgICBzZXNzaW9uSWQ6IG51bWJlciwgaW5wdXRJbmRpY2VzOiBudW1iZXJbXSwgaW5wdXRzOiBUZW5zb3JNZXRhZGF0YVtdLCBvdXRwdXRJbmRpY2VzOiBudW1iZXJbXSxcbiAgICBvdXRwdXRzOiBBcnJheTxUZW5zb3JNZXRhZGF0YXxudWxsPiwgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogUHJvbWlzZTxUZW5zb3JNZXRhZGF0YVtdPiA9PiB7XG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fUFJPWFkgJiYgaXNQcm94eSgpKSB7XG4gICAgLy8gY2hlY2sgaW5wdXRzIGxvY2F0aW9uXG4gICAgaWYgKGlucHV0cy5zb21lKHQgPT4gdFszXSAhPT0gJ2NwdScpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lucHV0IHRlbnNvciBvbiBHUFUgaXMgbm90IHN1cHBvcnRlZCBmb3IgcHJveHkuJyk7XG4gICAgfVxuICAgIC8vIGNoZWNrIG91dHB1dHMgbG9jYXRpb25cbiAgICBpZiAob3V0cHV0cy5zb21lKHQgPT4gdCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigncHJlLWFsbG9jYXRlZCBvdXRwdXQgdGVuc29yIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIHByb3h5LicpO1xuICAgIH1cbiAgICBlbnN1cmVXb3JrZXIoKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8U2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGFbXT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZW5xdWV1ZUNhbGxiYWNrcygncnVuJywgW3Jlc29sdmUsIHJlamVjdF0pO1xuICAgICAgY29uc3Qgc2VyaWFsaXphYmxlSW5wdXRzID0gaW5wdXRzIGFzIFNlcmlhbGl6YWJsZVRlbnNvck1ldGFkYXRhW107ICAvLyBldmVyeSBpbnB1dCBpcyBvbiBDUFUuXG4gICAgICBjb25zdCBtZXNzYWdlOiBPcnRXYXNtTWVzc2FnZSA9XG4gICAgICAgICAge3R5cGU6ICdydW4nLCBpbiA6IHtzZXNzaW9uSWQsIGlucHV0SW5kaWNlcywgaW5wdXRzOiBzZXJpYWxpemFibGVJbnB1dHMsIG91dHB1dEluZGljZXMsIG9wdGlvbnN9fTtcbiAgICAgIHByb3h5V29ya2VyIS5wb3N0TWVzc2FnZShtZXNzYWdlLCBjb3JlLmV4dHJhY3RUcmFuc2ZlcmFibGVCdWZmZXJzKHNlcmlhbGl6YWJsZUlucHV0cykpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjb3JlLnJ1bihzZXNzaW9uSWQsIGlucHV0SW5kaWNlcywgaW5wdXRzLCBvdXRwdXRJbmRpY2VzLCBvdXRwdXRzLCBvcHRpb25zKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGVuZFByb2ZpbGluZyA9IGFzeW5jKHNlc3Npb25JZDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fUFJPWFkgJiYgaXNQcm94eSgpKSB7XG4gICAgZW5zdXJlV29ya2VyKCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGVucXVldWVDYWxsYmFja3MoJ2VuZC1wcm9maWxpbmcnLCBbcmVzb2x2ZSwgcmVqZWN0XSk7XG4gICAgICBjb25zdCBtZXNzYWdlOiBPcnRXYXNtTWVzc2FnZSA9IHt0eXBlOiAnZW5kLXByb2ZpbGluZycsIGluIDogc2Vzc2lvbklkfTtcbiAgICAgIHByb3h5V29ya2VyIS5wb3N0TWVzc2FnZShtZXNzYWdlKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBjb3JlLmVuZFByb2ZpbGluZyhzZXNzaW9uSWQpO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb24sIEluZmVyZW5jZVNlc3Npb25IYW5kbGVyLCBTZXNzaW9uSGFuZGxlciwgVGVuc29yLCBUUkFDRV9GVU5DX0JFR0lOLCBUUkFDRV9GVU5DX0VORH0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlciwgVGVuc29yTWV0YWRhdGF9IGZyb20gJy4vcHJveHktbWVzc2FnZXMnO1xuaW1wb3J0IHtjb3B5RnJvbUV4dGVybmFsQnVmZmVyLCBjcmVhdGVTZXNzaW9uLCBlbmRQcm9maWxpbmcsIHJlbGVhc2VTZXNzaW9uLCBydW59IGZyb20gJy4vcHJveHktd3JhcHBlcic7XG5pbXBvcnQge2lzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZX0gZnJvbSAnLi93YXNtLWNvbW1vbic7XG5pbXBvcnQge2xvYWRGaWxlfSBmcm9tICcuL3dhc20tdXRpbHMtbG9hZC1maWxlJztcblxuZXhwb3J0IGNvbnN0IGVuY29kZVRlbnNvck1ldGFkYXRhID0gKHRlbnNvcjogVGVuc29yLCBnZXROYW1lOiAoKSA9PiBzdHJpbmcpOiBUZW5zb3JNZXRhZGF0YSA9PiB7XG4gIHN3aXRjaCAodGVuc29yLmxvY2F0aW9uKSB7XG4gICAgY2FzZSAnY3B1JzpcbiAgICAgIHJldHVybiBbdGVuc29yLnR5cGUsIHRlbnNvci5kaW1zLCB0ZW5zb3IuZGF0YSwgJ2NwdSddO1xuICAgIGNhc2UgJ2dwdS1idWZmZXInOlxuICAgICAgcmV0dXJuIFt0ZW5zb3IudHlwZSwgdGVuc29yLmRpbXMsIHtncHVCdWZmZXI6IHRlbnNvci5ncHVCdWZmZXJ9LCAnZ3B1LWJ1ZmZlciddO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgZGF0YSBsb2NhdGlvbjogJHt0ZW5zb3IubG9jYXRpb259IGZvciAke2dldE5hbWUoKX1gKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGRlY29kZVRlbnNvck1ldGFkYXRhID0gKHRlbnNvcjogVGVuc29yTWV0YWRhdGEpOiBUZW5zb3IgPT4ge1xuICBzd2l0Y2ggKHRlbnNvclszXSkge1xuICAgIGNhc2UgJ2NwdSc6XG4gICAgICByZXR1cm4gbmV3IFRlbnNvcih0ZW5zb3JbMF0sIHRlbnNvclsyXSwgdGVuc29yWzFdKTtcbiAgICBjYXNlICdncHUtYnVmZmVyJzoge1xuICAgICAgY29uc3QgZGF0YVR5cGUgPSB0ZW5zb3JbMF07XG4gICAgICBpZiAoIWlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZShkYXRhVHlwZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBub3Qgc3VwcG9ydGVkIGRhdGEgdHlwZTogJHtkYXRhVHlwZX0gZm9yIGRlc2VyaWFsaXppbmcgR1BVIHRlbnNvcmApO1xuICAgICAgfVxuICAgICAgY29uc3Qge2dwdUJ1ZmZlciwgZG93bmxvYWQsIGRpc3Bvc2V9ID0gdGVuc29yWzJdO1xuICAgICAgcmV0dXJuIFRlbnNvci5mcm9tR3B1QnVmZmVyKGdwdUJ1ZmZlciwge2RhdGFUeXBlLCBkaW1zOiB0ZW5zb3JbMV0sIGRvd25sb2FkLCBkaXNwb3NlfSk7XG4gICAgfVxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgZGF0YSBsb2NhdGlvbjogJHt0ZW5zb3JbM119YCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjbGFzcyBPbm54cnVudGltZVdlYkFzc2VtYmx5U2Vzc2lvbkhhbmRsZXIgaW1wbGVtZW50cyBJbmZlcmVuY2VTZXNzaW9uSGFuZGxlciB7XG4gIHByaXZhdGUgc2Vzc2lvbklkOiBudW1iZXI7XG5cbiAgaW5wdXROYW1lczogc3RyaW5nW107XG4gIG91dHB1dE5hbWVzOiBzdHJpbmdbXTtcblxuICBhc3luYyBmZXRjaE1vZGVsQW5kQ29weVRvV2FzbU1lbW9yeShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPFNlcmlhbGl6YWJsZUludGVybmFsQnVmZmVyPiB7XG4gICAgLy8gZmV0Y2ggbW9kZWwgZnJvbSB1cmwgYW5kIG1vdmUgdG8gd2FzbSBoZWFwLlxuICAgIHJldHVybiBjb3B5RnJvbUV4dGVybmFsQnVmZmVyKGF3YWl0IGxvYWRGaWxlKHBhdGgpKTtcbiAgfVxuXG4gIGFzeW5jIGxvYWRNb2RlbChwYXRoT3JCdWZmZXI6IHN0cmluZ3xVaW50OEFycmF5LCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8dm9pZD4ge1xuICAgIFRSQUNFX0ZVTkNfQkVHSU4oKTtcbiAgICBsZXQgbW9kZWw6IFBhcmFtZXRlcnM8dHlwZW9mIGNyZWF0ZVNlc3Npb24+WzBdO1xuXG4gICAgaWYgKHR5cGVvZiBwYXRoT3JCdWZmZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlKSB7XG4gICAgICAgIC8vIG5vZGVcbiAgICAgICAgbW9kZWwgPSBhd2FpdCBsb2FkRmlsZShwYXRoT3JCdWZmZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYnJvd3NlclxuICAgICAgICAvLyBmZXRjaCBtb2RlbCBhbmQgY29weSB0byB3YXNtIGhlYXAuXG4gICAgICAgIG1vZGVsID0gYXdhaXQgdGhpcy5mZXRjaE1vZGVsQW5kQ29weVRvV2FzbU1lbW9yeShwYXRoT3JCdWZmZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtb2RlbCA9IHBhdGhPckJ1ZmZlcjtcbiAgICB9XG5cbiAgICBbdGhpcy5zZXNzaW9uSWQsIHRoaXMuaW5wdXROYW1lcywgdGhpcy5vdXRwdXROYW1lc10gPSBhd2FpdCBjcmVhdGVTZXNzaW9uKG1vZGVsLCBvcHRpb25zKTtcbiAgICBUUkFDRV9GVU5DX0VORCgpO1xuICB9XG5cbiAgYXN5bmMgZGlzcG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gcmVsZWFzZVNlc3Npb24odGhpcy5zZXNzaW9uSWQpO1xuICB9XG5cbiAgYXN5bmMgcnVuKGZlZWRzOiBTZXNzaW9uSGFuZGxlci5GZWVkc1R5cGUsIGZldGNoZXM6IFNlc3Npb25IYW5kbGVyLkZldGNoZXNUeXBlLCBvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOlxuICAgICAgUHJvbWlzZTxTZXNzaW9uSGFuZGxlci5SZXR1cm5UeXBlPiB7XG4gICAgVFJBQ0VfRlVOQ19CRUdJTigpO1xuICAgIGNvbnN0IGlucHV0QXJyYXk6IFRlbnNvcltdID0gW107XG4gICAgY29uc3QgaW5wdXRJbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICAgIE9iamVjdC5lbnRyaWVzKGZlZWRzKS5mb3JFYWNoKGt2cCA9PiB7XG4gICAgICBjb25zdCBuYW1lID0ga3ZwWzBdO1xuICAgICAgY29uc3QgdGVuc29yID0ga3ZwWzFdO1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmlucHV0TmFtZXMuaW5kZXhPZihuYW1lKTtcbiAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGlucHV0ICcke25hbWV9J2ApO1xuICAgICAgfVxuICAgICAgaW5wdXRBcnJheS5wdXNoKHRlbnNvcik7XG4gICAgICBpbnB1dEluZGljZXMucHVzaChpbmRleCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBvdXRwdXRBcnJheTogQXJyYXk8VGVuc29yfG51bGw+ID0gW107XG4gICAgY29uc3Qgb3V0cHV0SW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgICBPYmplY3QuZW50cmllcyhmZXRjaGVzKS5mb3JFYWNoKGt2cCA9PiB7XG4gICAgICBjb25zdCBuYW1lID0ga3ZwWzBdO1xuICAgICAgY29uc3QgdGVuc29yID0ga3ZwWzFdO1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLm91dHB1dE5hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBvdXRwdXQgJyR7bmFtZX0nYCk7XG4gICAgICB9XG4gICAgICBvdXRwdXRBcnJheS5wdXNoKHRlbnNvcik7XG4gICAgICBvdXRwdXRJbmRpY2VzLnB1c2goaW5kZXgpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgaW5wdXRzID1cbiAgICAgICAgaW5wdXRBcnJheS5tYXAoKHQsIGkpID0+IGVuY29kZVRlbnNvck1ldGFkYXRhKHQsICgpID0+IGBpbnB1dCBcIiR7dGhpcy5pbnB1dE5hbWVzW2lucHV0SW5kaWNlc1tpXV19XCJgKSk7XG4gICAgY29uc3Qgb3V0cHV0cyA9IG91dHB1dEFycmF5Lm1hcChcbiAgICAgICAgKHQsIGkpID0+IHQgPyBlbmNvZGVUZW5zb3JNZXRhZGF0YSh0LCAoKSA9PiBgb3V0cHV0IFwiJHt0aGlzLm91dHB1dE5hbWVzW291dHB1dEluZGljZXNbaV1dfVwiYCkgOiBudWxsKTtcblxuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBydW4odGhpcy5zZXNzaW9uSWQsIGlucHV0SW5kaWNlcywgaW5wdXRzLCBvdXRwdXRJbmRpY2VzLCBvdXRwdXRzLCBvcHRpb25zKTtcblxuICAgIGNvbnN0IHJlc3VsdE1hcDogU2Vzc2lvbkhhbmRsZXIuUmV0dXJuVHlwZSA9IHt9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0TWFwW3RoaXMub3V0cHV0TmFtZXNbb3V0cHV0SW5kaWNlc1tpXV1dID0gb3V0cHV0QXJyYXlbaV0gPz8gZGVjb2RlVGVuc29yTWV0YWRhdGEocmVzdWx0c1tpXSk7XG4gICAgfVxuICAgIFRSQUNFX0ZVTkNfRU5EKCk7XG4gICAgcmV0dXJuIHJlc3VsdE1hcDtcbiAgfVxuXG4gIHN0YXJ0UHJvZmlsaW5nKCk6IHZvaWQge1xuICAgIC8vIFRPRE86IGltcGxlbWVudCBwcm9maWxpbmdcbiAgfVxuXG4gIGVuZFByb2ZpbGluZygpOiB2b2lkIHtcbiAgICB2b2lkIGVuZFByb2ZpbGluZyh0aGlzLnNlc3Npb25JZCk7XG4gIH1cbn1cbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtjcHVzfSBmcm9tICdub2RlOm9zJztcbmltcG9ydCB7QmFja2VuZCwgZW52LCBJbmZlcmVuY2VTZXNzaW9uLCBJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtpbml0aWFsaXplT3J0RXAsIGluaXRpYWxpemVXZWJBc3NlbWJseUFuZE9ydFJ1bnRpbWV9IGZyb20gJy4vd2FzbS9wcm94eS13cmFwcGVyJztcbmltcG9ydCB7T25ueHJ1bnRpbWVXZWJBc3NlbWJseVNlc3Npb25IYW5kbGVyfSBmcm9tICcuL3dhc20vc2Vzc2lvbi1oYW5kbGVyLWluZmVyZW5jZSc7XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBpbml0aWFsaXplcyBhbGwgZmxhZ3MgZm9yIFdlYkFzc2VtYmx5LlxuICpcbiAqIFRob3NlIGZsYWdzIGFyZSBhY2Nlc3NpYmxlIGZyb20gYG9ydC5lbnYud2FzbWAuIFVzZXJzIGFyZSBhbGxvdyB0byBzZXQgdGhvc2UgZmxhZ3MgYmVmb3JlIHRoZSBmaXJzdCBpbmZlcmVuY2Ugc2Vzc2lvblxuICogYmVpbmcgY3JlYXRlZCwgdG8gb3ZlcnJpZGUgZGVmYXVsdCB2YWx1ZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGluaXRpYWxpemVGbGFncyA9ICgpOiB2b2lkID0+IHtcbiAgaWYgKHR5cGVvZiBlbnYud2FzbS5pbml0VGltZW91dCAhPT0gJ251bWJlcicgfHwgZW52Lndhc20uaW5pdFRpbWVvdXQgPCAwKSB7XG4gICAgZW52Lndhc20uaW5pdFRpbWVvdXQgPSAwO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBlbnYud2FzbS5zaW1kICE9PSAnYm9vbGVhbicpIHtcbiAgICBlbnYud2FzbS5zaW1kID0gdHJ1ZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZW52Lndhc20ucHJveHkgIT09ICdib29sZWFuJykge1xuICAgIGVudi53YXNtLnByb3h5ID0gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIGVudi53YXNtLnRyYWNlICE9PSAnYm9vbGVhbicpIHtcbiAgICBlbnYud2FzbS50cmFjZSA9IGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBlbnYud2FzbS5udW1UaHJlYWRzICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihlbnYud2FzbS5udW1UaHJlYWRzKSB8fCBlbnYud2FzbS5udW1UaHJlYWRzIDw9IDApIHtcbiAgICBjb25zdCBudW1DcHVMb2dpY2FsQ29yZXMgPSB0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyA/IGNwdXMoKS5sZW5ndGggOiBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeTtcbiAgICBlbnYud2FzbS5udW1UaHJlYWRzID0gTWF0aC5taW4oNCwgTWF0aC5jZWlsKChudW1DcHVMb2dpY2FsQ29yZXMgfHwgMSkgLyAyKSk7XG4gIH1cbn07XG5cbmV4cG9ydCBjbGFzcyBPbm54cnVudGltZVdlYkFzc2VtYmx5QmFja2VuZCBpbXBsZW1lbnRzIEJhY2tlbmQge1xuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiBpbml0aWFsaXplcyB0aGUgV2ViQXNzZW1ibHkgYmFja2VuZC5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBvbmx5IG9uY2UgZm9yIGVhY2ggYmFja2VuZCBuYW1lLiBJdCB3aWxsIGJlIGNhbGxlZCB0aGUgZmlyc3QgdGltZSB3aGVuXG4gICAqIGBvcnQuSW5mZXJlbmNlU2Vzc2lvbi5jcmVhdGUoKWAgaXMgY2FsbGVkIHdpdGggYSByZWdpc3RlcmVkIGJhY2tlbmQgbmFtZS5cbiAgICpcbiAgICogQHBhcmFtIGJhY2tlbmROYW1lIC0gdGhlIHJlZ2lzdGVyZWQgYmFja2VuZCBuYW1lLlxuICAgKi9cbiAgYXN5bmMgaW5pdChiYWNrZW5kTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gcG9wdWxhdGUgd2FzbSBmbGFnc1xuICAgIGluaXRpYWxpemVGbGFncygpO1xuXG4gICAgLy8gaW5pdCB3YXNtXG4gICAgYXdhaXQgaW5pdGlhbGl6ZVdlYkFzc2VtYmx5QW5kT3J0UnVudGltZSgpO1xuXG4gICAgLy8gcGVyZm9ybWUgRVAgc3BlY2lmaWMgaW5pdGlhbGl6YXRpb25cbiAgICBhd2FpdCBpbml0aWFsaXplT3J0RXAoYmFja2VuZE5hbWUpO1xuICB9XG4gIGNyZWF0ZUluZmVyZW5jZVNlc3Npb25IYW5kbGVyKHBhdGg6IHN0cmluZywgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOlxuICAgICAgUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcj47XG4gIGNyZWF0ZUluZmVyZW5jZVNlc3Npb25IYW5kbGVyKGJ1ZmZlcjogVWludDhBcnJheSwgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOlxuICAgICAgUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcj47XG4gIGFzeW5jIGNyZWF0ZUluZmVyZW5jZVNlc3Npb25IYW5kbGVyKHBhdGhPckJ1ZmZlcjogc3RyaW5nfFVpbnQ4QXJyYXksIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTpcbiAgICAgIFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXI+IHtcbiAgICBjb25zdCBoYW5kbGVyID0gbmV3IE9ubnhydW50aW1lV2ViQXNzZW1ibHlTZXNzaW9uSGFuZGxlcigpO1xuICAgIGF3YWl0IGhhbmRsZXIubG9hZE1vZGVsKHBhdGhPckJ1ZmZlciwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShoYW5kbGVyKTtcbiAgfVxufVxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge09ubnhydW50aW1lV2ViQXNzZW1ibHlCYWNrZW5kfSBmcm9tICcuL2JhY2tlbmQtd2FzbSc7XG5leHBvcnQgY29uc3Qgd2FzbUJhY2tlbmQgPSBuZXcgT25ueHJ1bnRpbWVXZWJBc3NlbWJseUJhY2tlbmQoKTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlcywgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cyAqL1xuLy8gV2UgdXNlIFwicmVxdWlyZVwiIGluc3RlYWQgb2YgXCJpbXBvcnRcIiBoZXJlIGJlY2F1c2UgaW1wb3J0IHN0YXRlbWVudCBtdXN0IGJlIHB1dCBpbiB0b3AgbGV2ZWwuIE91ciBjdXJyZW50IGNvZGUgZG9lc1xuLy8gbm90IGFsbG93IGJ1bmRsZXIgdG8gdHJlZS1zaGFraW5nIGNvZGUgYXMgZXhwZWN0ZWQgYmVjYXVzZSBzb21lIGNvZGVzIGFyZSB0cmVhdGVkIGFzIGhhdmluZyBzaWRlIGVmZmVjdHMuXG4vLyBTbyB3ZSBpbXBvcnQgY29kZSBpbnNpZGUgdGhlIGlmLWNsYXVzZSB0byBhbGxvdyBidW5kbGVyIHJlbW92ZSB0aGUgY29kZSBzYWZlbHkuXG5cbmV4cG9ydCAqIGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5pbXBvcnQgKiBhcyBvcnQgZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcbmV4cG9ydCBkZWZhdWx0IG9ydDtcblxuaW1wb3J0IHtyZWdpc3RlckJhY2tlbmQsIGVudn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcbmltcG9ydCB7dmVyc2lvbn0gZnJvbSAnLi92ZXJzaW9uJztcblxuaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR0wpIHtcbiAgY29uc3Qgb25ueGpzQmFja2VuZCA9IHJlcXVpcmUoJy4vYmFja2VuZC1vbm54anMnKS5vbm54anNCYWNrZW5kO1xuICByZWdpc3RlckJhY2tlbmQoJ3dlYmdsJywgb25ueGpzQmFja2VuZCwgLTEwKTtcbn1cblxuaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTSkge1xuICBjb25zdCB3YXNtQmFja2VuZCA9IEJVSUxEX0RFRlMuRElTQUJMRV9UUkFJTklORyA/IHJlcXVpcmUoJy4vYmFja2VuZC13YXNtLWluZmVyZW5jZScpLndhc21CYWNrZW5kIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlKCcuL2JhY2tlbmQtd2FzbS10cmFpbmluZycpLndhc21CYWNrZW5kO1xuICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUpIHtcbiAgICByZWdpc3RlckJhY2tlbmQoJ3dlYmdwdScsIHdhc21CYWNrZW5kLCA1KTtcbiAgICByZWdpc3RlckJhY2tlbmQoJ3dlYm5uJywgd2FzbUJhY2tlbmQsIDUpO1xuICB9XG4gIHJlZ2lzdGVyQmFja2VuZCgnY3B1Jywgd2FzbUJhY2tlbmQsIDEwKTtcbiAgcmVnaXN0ZXJCYWNrZW5kKCd3YXNtJywgd2FzbUJhY2tlbmQsIDEwKTtcbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGVudi52ZXJzaW9ucywgJ3dlYicsIHt2YWx1ZTogdmVyc2lvbiwgZW51bWVyYWJsZTogdHJ1ZX0pO1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG4vLyBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGJ5IC9qcy9zY3JpcHRzL3VwZGF0ZS12ZXJzaW9uLnRzXG4vLyBEbyBub3QgbW9kaWZ5IGZpbGUgY29udGVudCBtYW51YWxseS5cblxuZXhwb3J0IGNvbnN0IHZlcnNpb24gPSAnMS4xNy4wJztcbiJdLAogICJtYXBwaW5n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LE9BQUcsR0FBRyxFQUFFLEtBQUcsUUFBTSxNQUFJLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRyxHQUFFLE1BQUssT0FBRyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDLEdBQUUsTUFBSyxPQUFHO0FBQUMsa0JBQUUsRUFBRTtBQUFHLG1CQUFHLElBQUUsSUFBRSxLQUFHLEtBQUcsTUFBSSxLQUFHO0FBQUkscUJBQU8sRUFBRSxHQUFFLENBQUM7QUFBQSxZQUFDLEdBQUUsTUFBSyxPQUFHO0FBQUMsdUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFHLEVBQUUsS0FBRyxHQUFFLE1BQUksRUFBRSxFQUFFLEtBQUcsSUFBSSxJQUFFLEtBQUcsSUFBSSxHQUFHO0FBQUU7QUFBQyxxQkFBTyxFQUFFLEVBQUUsS0FBRyxHQUFFLENBQUM7QUFBQSxZQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxLQUFHLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDLEdBQUUsTUFBSyxNQUFJLE1BQUssTUFBSyxPQUFHLEtBQUcsRUFBRSxNQUFJLEtBQUcsRUFBRSxLQUFHLE9BQUssTUFBSyxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQyxHQUFFLE1BQUssTUFBSSxLQUFLLE1BQUssT0FBRyxFQUFFLE1BQUksR0FBRSxNQUFLLE9BQUcsRUFBRSxLQUFLLE9BQU8sRUFBRSxLQUFHLElBQUUsRUFBRSxNQUFJLENBQUMsR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUNuZjtBQUFDLGtCQUFJLElBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxLQUFHLEVBQUUsS0FBRyxLQUFHLEtBQUcsQ0FBQztBQUFFLG9CQUFJLEVBQUUsS0FBRyxNQUFJLEVBQUUsS0FBRyxL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RyxNQUFJO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRSxHQUFFLEdBQUU7QUFBQyxxQkFDdmY7QUFBRSxxQkFBSztBQUFFLGtCQUFFLEVBQUUsTUFBSSxDQUFDO0FBQUUsa0JBQUUsR0FBRyxHQUFFLFdBQVc7QUFBRSxxQkFBTyxHQUFHLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxxQkFBSztBQUFFLHFCQUFLO0FBQUUsa0JBQUUsRUFBRSxNQUFJLENBQUM7QUFBRSxrQkFBRSxFQUFFLE1BQUksQ0FBQztBQUFFLHFCQUFPLEVBQUUsTUFBSyxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxxQkFBSztBQUFFLHFCQUFLO0FBQUUscUJBQUs7QUFBRSxrQkFBRSxFQUFFLE1BQUksQ0FBQztBQUFFLGtCQUFFLEVBQUUsTUFBSSxDQUFDO0FBQUUsa0JBQUUsR0FBRyxDQUFDO0FBQUUscUJBQU8sRUFBRSxHQUFFLEVBQUUsQ0FBQyxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUU7QUFBQSxZQUFHLEdBQUUsU0FBUyxHQUFFLEdBQUU7QUFBQyxxQkFBSztBQUFFLGtCQUFFLEVBQUUsTUFBSSxDQUFDO0FBQUUsa0JBQUUsRUFBRSxDQUFDO0FBQUUscUJBQU8sS0FBRztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFO0FBQUMscUJBQUs7QUFBRSxrQkFBRyxNQUFJO0FBQUUsdUJBQU8sRUFBRSxHQUFHLENBQUM7QUFBRSxrQkFBRSxHQUFHLENBQUM7QUFBRSxxQkFBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRSxHQUFFLEdBQUU7QUFBQyxrQkFBRSxHQUFHLEdBQUUsTUFBSSxDQUFDO0FBQUUsa0JBQUksSUFBRSxFQUFFLE1BQU07QUFBRTtBQUFJ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QUFBO0FBQUEsNEJBQUFDO0FBQUEsSUFBQTtBQUFBO0FBQUE7QUFBQSxrQkFBQUM7QUFBQSxJQUFBLHVCQUFBQztBQUFBLElBQUE7QUFBQSxlQUFBQztBQUFBLElBQUE7QUFBQTtBQVFBO0FBQ0E7QUFHQTs7O0FDTk8sTUFBTUMsV0FBVTs7O0FESXZCLE1BQU8sY0FBUTtBQUtmLE1BQUksT0FBMkI7QUFDN0IsVUFBTSxnQkFBZ0IsS0FBNEI7QUFDbEQsb0JBQWdCLFNBQVMsZUFBZSxHQUFHO0FBQUEsRUFDN0M7QUFFQSxNQUFJLE1BQTBCO0FBQzVCLFVBQU1DLGVBQWMsT0FBOEIsOEVBQW9DLGNBQ3BDLEtBQW1DO0FBQ3JGLFFBQUksT0FBNEI7QUFDOUIsc0JBQWdCLFVBQVVBLGNBQWEsQ0FBQztBQUN4QyxzQkFBZ0IsU0FBU0EsY0FBYSxDQUFDO0FBQUEsSUFDekM7QUFDQSxvQkFBZ0IsT0FBT0EsY0FBYSxFQUFFO0FBQ3RDLG9CQUFnQixRQUFRQSxjQUFhLEVBQUU7QUFBQSxFQUN6QztBQUVBLFNBQU8sZUFBZUMsS0FBSSxVQUFVLE9BQU8sRUFBQyxPQUFPQyxVQUFTLFlBQVksS0FBSSxDQUFDOyIsCiAgIm5hbWVzIjogWyJpIiwgImVudiIsICJUZW5zb3IiLCAiVGVuc29yIiwgIkluZmVyZW5jZVNlc3Npb24iLCAiVGVuc29yIiwgIlRyYWluaW5nU2Vzc2lvbiIsICJJbmZlcmVuY2VTZXNzaW9uIiwgIlRlbnNvciIsICJUcmFpbmluZ1Nlc3Npb24iLCAiZW52IiwgIndhc20iLCAid2FzbSIsICJ3YXNtIiwgInJlYWRGaWxlIiwgInJlYWRGaWxlIiwgImVudiIsICJ3YXNtIiwgInRlbnNvciIsICJlcnJvckNvZGUiLCAiaSIsICJpbml0aWFsaXppbmciLCAiaW5pdGlhbGl6ZWQiLCAiYWJvcnRlZCIsICJjb3B5RnJvbUV4dGVybmFsQnVmZmVyIiwgImNyZWF0ZVNlc3Npb24iLCAicmVsZWFzZVNlc3Npb24iLCAicnVuIiwgImVuZFByb2ZpbGluZyIsICJlbnYiLCAiVGVuc29yIiwgImNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIiLCAiY3JlYXRlU2Vzc2lvbiIsICJyZWxlYXNlU2Vzc2lvbiIsICJydW4iLCAiZW5kUHJvZmlsaW5nIiwgImVudiIsICJJbmZlcmVuY2VTZXNzaW9uIiwgIlRlbnNvciIsICJUcmFpbmluZ1Nlc3Npb24iLCAiZW52IiwgInZlcnNpb24iLCAid2FzbUJhY2tlbmQiLCAiZW52IiwgInZlcnNpb24iXQp9Cg==
