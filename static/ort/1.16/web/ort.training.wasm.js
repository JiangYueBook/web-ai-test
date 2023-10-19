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
  var TrainingSession;
  var init_training_session_impl = __esm({
    "common/dist/esm/training-session-impl.js"() {
      "use strict";
      TrainingSession = class {
        constructor(handler) {
          this.handler = handler;
        }
        get inputNames() {
          return this.handler.inputNames;
        }
        get outputNames() {
          return this.handler.outputNames;
        }
        static async create(_trainingOptions, _sessionOptions) {
          throw new Error("Method not implemented");
        }
        async loadParametersBuffer(_array, _trainableOnly) {
          throw new Error("Method not implemented.");
        }
        async getContiguousParameters(_trainableOnly) {
          throw new Error("Method not implemented.");
        }
        async runTrainStep(_feeds, _fetches, _options) {
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
    "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module) {
      "use strict";
      var ortWasm = (() => {
        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
        if (typeof __filename !== "undefined")
          _scriptDir = _scriptDir || __filename;
        return function(moduleArg = {}) {
          var d = moduleArg, k, l;
          d.ready = new Promise((a, b) => {
            k = a;
            l = b;
          });
          var r = Object.assign({}, d), v = "./this.program", aa = "object" == typeof window, x = "function" == typeof importScripts, ba = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, y = "", A, B, C;
          if (ba) {
            var fs = (init_fs(), __toCommonJS(fs_exports)), D = (init_path(), __toCommonJS(path_exports));
            y = x ? D.dirname(y) + "/" : __dirname + "/";
            A = (a, b) => {
              a = a.startsWith("file://") ? new URL(a) : D.normalize(a);
              return fs.readFileSync(a, b ? void 0 : "utf8");
            };
            C = (a) => {
              a = A(a, true);
              a.buffer || (a = new Uint8Array(a));
              return a;
            };
            B = (a, b, c, f = true) => {
              a = a.startsWith("file://") ? new URL(a) : D.normalize(a);
              fs.readFile(a, f ? void 0 : "utf8", (g, h) => {
                g ? c(g) : b(f ? h.buffer : h);
              });
            };
            !d.thisProgram && 1 < process.argv.length && (v = process.argv[1].replace(/\\/g, "/"));
            process.argv.slice(2);
            d.inspect = () => "[Emscripten Module object]";
          } else if (aa || x)
            x ? y = self.location.href : "undefined" != typeof document && document.currentScript && (y = document.currentScript.src), _scriptDir && (y = _scriptDir), 0 !== y.indexOf("blob:") ? y = y.substr(0, y.replace(/[?#].*/, "").lastIndexOf("/") + 1) : y = "", A = (a) => {
              var b = new XMLHttpRequest();
              b.open("GET", a, false);
              b.send(null);
              return b.responseText;
            }, x && (C = (a) => {
              var b = new XMLHttpRequest();
              b.open("GET", a, false);
              b.responseType = "arraybuffer";
              b.send(null);
              return new Uint8Array(b.response);
            }), B = (a, b, c) => {
              var f = new XMLHttpRequest();
              f.open("GET", a, true);
              f.responseType = "arraybuffer";
              f.onload = () => {
                200 == f.status || 0 == f.status && f.response ? b(f.response) : c();
              };
              f.onerror = c;
              f.send(null);
            };
          var ca = d.print || console.log.bind(console), E = d.printErr || console.error.bind(console);
          Object.assign(d, r);
          r = null;
          d.thisProgram && (v = d.thisProgram);
          var F;
          d.wasmBinary && (F = d.wasmBinary);
          var noExitRuntime = d.noExitRuntime || true;
          "object" != typeof WebAssembly && G("no native wasm support detected");
          var H, I, da = false, J, K, L, M;
          function ea() {
            var a = H.buffer;
            d.HEAP8 = J = new Int8Array(a);
            d.HEAP16 = new Int16Array(a);
            d.HEAP32 = L = new Int32Array(a);
            d.HEAPU8 = K = new Uint8Array(a);
            d.HEAPU16 = new Uint16Array(a);
            d.HEAPU32 = M = new Uint32Array(a);
            d.HEAPF32 = new Float32Array(a);
            d.HEAPF64 = new Float64Array(a);
          }
          var fa = [], ha = [], ia = [];
          function ja() {
            var a = d.preRun.shift();
            fa.unshift(a);
          }
          var N = 0, O = null, P = null;
          function G(a) {
            if (d.onAbort)
              d.onAbort(a);
            a = "Aborted(" + a + ")";
            E(a);
            da = true;
            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
            l(a);
            throw a;
          }
          function ka(a) {
            return a.startsWith("data:application/octet-stream;base64,");
          }
          var Q;
          Q = "ort-training-wasm-simd.wasm";
          if (!ka(Q)) {
            var la = Q;
            Q = d.locateFile ? d.locateFile(la, y) : y + la;
          }
          function ma(a) {
            if (a == Q && F)
              return new Uint8Array(F);
            if (C)
              return C(a);
            throw "both async and sync fetching of the wasm failed";
          }
          function na(a) {
            if (!F && (aa || x)) {
              if ("function" == typeof fetch && !a.startsWith("file://"))
                return fetch(a, { credentials: "same-origin" }).then((b) => {
                  if (!b.ok)
                    throw "failed to load wasm binary file at '" + a + "'";
                  return b.arrayBuffer();
                }).catch(() => ma(a));
              if (B)
                return new Promise((b, c) => {
                  B(a, (f) => b(new Uint8Array(f)), c);
                });
            }
            return Promise.resolve().then(() => ma(a));
          }
          function oa(a, b, c) {
            return na(a).then((f) => WebAssembly.instantiate(f, b)).then((f) => f).then(c, (f) => {
              E("failed to asynchronously prepare wasm: " + f);
              G(f);
            });
          }
          function pa(a, b) {
            var c = Q;
            return F || "function" != typeof WebAssembly.instantiateStreaming || ka(c) || c.startsWith("file://") || ba || "function" != typeof fetch ? oa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((f) => WebAssembly.instantiateStreaming(f, a).then(b, function(g) {
              E("wasm streaming compile failed: " + g);
              E("falling back to ArrayBuffer instantiation");
              return oa(c, a, b);
            }));
          }
          var R, S = (a) => {
            for (; 0 < a.length; )
              a.shift()(d);
          };
          function qa(a) {
            this.Ha = a - 24;
            this.La = function(b) {
              M[this.Ha + 4 >> 2 >>> 0] = b;
            };
            this.Ka = function(b) {
              M[this.Ha + 8 >> 2 >>> 0] = b;
            };
            this.Ia = function(b, c) {
              this.Ja();
              this.La(b);
              this.Ka(c);
            };
            this.Ja = function() {
              M[this.Ha + 16 >> 2 >>> 0] = 0;
            };
          }
          var ra = 0, sa = 0, ta = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, ua = (a, b, c) => {
            b >>>= 0;
            var f = b + c;
            for (c = b; a[c] && !(c >= f); )
              ++c;
            if (16 < c - b && a.buffer && ta)
              return ta.decode(a.subarray(b, c));
            for (f = ""; b < c; ) {
              var g = a[b++];
              if (g & 128) {
                var h = a[b++] & 63;
                if (192 == (g & 224))
                  f += String.fromCharCode((g & 31) << 6 | h);
                else {
                  var m = a[b++] & 63;
                  g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | m : (g & 7) << 18 | h << 12 | m << 6 | a[b++] & 63;
                  65536 > g ? f += String.fromCharCode(g) : (g -= 65536, f += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));
                }
              } else
                f += String.fromCharCode(g);
            }
            return f;
          }, T = (a, b) => (a >>>= 0) ? ua(K, a, b) : "", U = (a) => {
            for (var b = 0, c = 0; c < a.length; ++c) {
              var f = a.charCodeAt(c);
              127 >= f ? b++ : 2047 >= f ? b += 2 : 55296 <= f && 57343 >= f ? (b += 4, ++c) : b += 3;
            }
            return b;
          }, V = (a, b, c, f) => {
            c >>>= 0;
            if (!(0 < f))
              return 0;
            var g = c;
            f = c + f - 1;
            for (var h = 0; h < a.length; ++h) {
              var m = a.charCodeAt(h);
              if (55296 <= m && 57343 >= m) {
                var q = a.charCodeAt(++h);
                m = 65536 + ((m & 1023) << 10) | q & 1023;
              }
              if (127 >= m) {
                if (c >= f)
                  break;
                b[c++ >>> 0] = m;
              } else {
                if (2047 >= m) {
                  if (c + 1 >= f)
                    break;
                  b[c++ >>> 0] = 192 | m >> 6;
                } else {
                  if (65535 >= m) {
                    if (c + 2 >= f)
                      break;
                    b[c++ >>> 0] = 224 | m >> 12;
                  } else {
                    if (c + 3 >= f)
                      break;
                    b[c++ >>> 0] = 240 | m >> 18;
                    b[c++ >>> 0] = 128 | m >> 12 & 63;
                  }
                  b[c++ >>> 0] = 128 | m >> 6 & 63;
                }
                b[c++ >>> 0] = 128 | m & 63;
              }
            }
            b[c >>> 0] = 0;
            return c - g;
          }, W = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), va = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], wa = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Ba = (a) => {
            var b = U(a) + 1, c = Aa(b);
            c && V(a, K, c, b);
            return c;
          }, X = {}, Ca = () => {
            if (!Y) {
              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(
                "-",
                "_"
              ) + ".UTF-8", _: v || "./this.program" }, b;
              for (b in X)
                void 0 === X[b] ? delete a[b] : a[b] = X[b];
              var c = [];
              for (b in a)
                c.push(`${b}=${a[b]}`);
              Y = c;
            }
            return Y;
          }, Y, Da = [null, [], []], Ea = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Fa = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
          function Ga(a) {
            var b = Array(U(a) + 1);
            V(a, b, 0, b.length);
            return b;
          }
          function Ha(a, b, c, f) {
            function g(e, n, p) {
              for (e = "number" == typeof e ? e.toString() : e || ""; e.length < n; )
                e = p[0] + e;
              return e;
            }
            function h(e, n) {
              return g(e, n, "0");
            }
            function m(e, n) {
              function p(xa) {
                return 0 > xa ? -1 : 0 < xa ? 1 : 0;
              }
              var z;
              0 === (z = p(e.getFullYear() - n.getFullYear())) && 0 === (z = p(e.getMonth() - n.getMonth())) && (z = p(e.getDate() - n.getDate()));
              return z;
            }
            function q(e) {
              switch (e.getDay()) {
                case 0:
                  return new Date(e.getFullYear() - 1, 11, 29);
                case 1:
                  return e;
                case 2:
                  return new Date(e.getFullYear(), 0, 3);
                case 3:
                  return new Date(
                    e.getFullYear(),
                    0,
                    2
                  );
                case 4:
                  return new Date(e.getFullYear(), 0, 1);
                case 5:
                  return new Date(e.getFullYear() - 1, 11, 31);
                case 6:
                  return new Date(e.getFullYear() - 1, 11, 30);
              }
            }
            function w(e) {
              var n = e.Ca;
              for (e = new Date(new Date(e.Da + 1900, 0, 1).getTime()); 0 < n; ) {
                var p = e.getMonth(), z = (W(e.getFullYear()) ? Ea : Fa)[p];
                if (n > z - e.getDate())
                  n -= z - e.getDate() + 1, e.setDate(1), 11 > p ? e.setMonth(p + 1) : (e.setMonth(0), e.setFullYear(e.getFullYear() + 1));
                else {
                  e.setDate(e.getDate() + n);
                  break;
                }
              }
              p = new Date(e.getFullYear() + 1, 0, 4);
              n = q(new Date(
                e.getFullYear(),
                0,
                4
              ));
              p = q(p);
              return 0 >= m(n, e) ? 0 >= m(p, e) ? e.getFullYear() + 1 : e.getFullYear() : e.getFullYear() - 1;
            }
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            f >>>= 0;
            var t = L[f + 40 >> 2 >>> 0];
            f = { Oa: L[f >> 2 >>> 0], Na: L[f + 4 >> 2 >>> 0], Ea: L[f + 8 >> 2 >>> 0], Ga: L[f + 12 >> 2 >>> 0], Fa: L[f + 16 >> 2 >>> 0], Da: L[f + 20 >> 2 >>> 0], xa: L[f + 24 >> 2 >>> 0], Ca: L[f + 28 >> 2 >>> 0], Qa: L[f + 32 >> 2 >>> 0], Ma: L[f + 36 >> 2 >>> 0], Pa: t ? T(t) : "" };
            c = T(c);
            t = {
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
            for (var u in t)
              c = c.replace(new RegExp(u, "g"), t[u]);
            var ya = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), za = "January February March April May June July August September October November December".split(" ");
            t = { "%a": (e) => ya[e.xa].substring(0, 3), "%A": (e) => ya[e.xa], "%b": (e) => za[e.Fa].substring(0, 3), "%B": (e) => za[e.Fa], "%C": (e) => h((e.Da + 1900) / 100 | 0, 2), "%d": (e) => h(e.Ga, 2), "%e": (e) => g(e.Ga, 2, " "), "%g": (e) => w(e).toString().substring(2), "%G": (e) => w(e), "%H": (e) => h(e.Ea, 2), "%I": (e) => {
              e = e.Ea;
              0 == e ? e = 12 : 12 < e && (e -= 12);
              return h(e, 2);
            }, "%j": (e) => {
              for (var n = 0, p = 0; p <= e.Fa - 1; n += (W(e.Da + 1900) ? Ea : Fa)[p++])
                ;
              return h(e.Ga + n, 3);
            }, "%m": (e) => h(e.Fa + 1, 2), "%M": (e) => h(e.Na, 2), "%n": () => "\n", "%p": (e) => 0 <= e.Ea && 12 > e.Ea ? "AM" : "PM", "%S": (e) => h(e.Oa, 2), "%t": () => "	", "%u": (e) => e.xa || 7, "%U": (e) => h(Math.floor((e.Ca + 7 - e.xa) / 7), 2), "%V": (e) => {
              var n = Math.floor((e.Ca + 7 - (e.xa + 6) % 7) / 7);
              2 >= (e.xa + 371 - e.Ca - 2) % 7 && n++;
              if (n)
                53 == n && (p = (e.xa + 371 - e.Ca) % 7, 4 == p || 3 == p && W(e.Da) || (n = 1));
              else {
                n = 52;
                var p = (e.xa + 7 - e.Ca - 1) % 7;
                (4 == p || 5 == p && W(e.Da % 400 - 1)) && n++;
              }
              return h(n, 2);
            }, "%w": (e) => e.xa, "%W": (e) => h(Math.floor((e.Ca + 7 - (e.xa + 6) % 7) / 7), 2), "%y": (e) => (e.Da + 1900).toString().substring(2), "%Y": (e) => e.Da + 1900, "%z": (e) => {
              e = e.Ma;
              var n = 0 <= e;
              e = Math.abs(e) / 60;
              return (n ? "+" : "-") + String("0000" + (e / 60 * 100 + e % 60)).slice(-4);
            }, "%Z": (e) => e.Pa, "%%": () => "%" };
            c = c.replace(/%%/g, "\0\0");
            for (u in t)
              c.includes(u) && (c = c.replace(new RegExp(u, "g"), t[u](f)));
            c = c.replace(/\0\0/g, "%");
            u = Ga(c);
            if (u.length > b)
              return 0;
            J.set(u, a >>> 0);
            return u.length - 1;
          }
          var Ja = {
            a: function(a, b, c) {
              a >>>= 0;
              new qa(a).Ia(b >>> 0, c >>> 0);
              ra = a;
              sa++;
              throw ra;
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
            k: function() {
              return 0;
            },
            F: function() {
            },
            B: function() {
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
              L[c >> 2 >>> 0] = a.getUTCSeconds();
              L[c + 4 >> 2 >>> 0] = a.getUTCMinutes();
              L[c + 8 >> 2 >>> 0] = a.getUTCHours();
              L[c + 12 >> 2 >>> 0] = a.getUTCDate();
              L[c + 16 >> 2 >>> 0] = a.getUTCMonth();
              L[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;
              L[c + 24 >> 2 >>> 0] = a.getUTCDay();
              L[c + 28 >> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
            },
            p: function(a, b, c) {
              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
              c >>>= 0;
              a = new Date(1e3 * a);
              L[c >> 2 >>> 0] = a.getSeconds();
              L[c + 4 >> 2 >>> 0] = a.getMinutes();
              L[c + 8 >> 2 >>> 0] = a.getHours();
              L[c + 12 >> 2 >>> 0] = a.getDate();
              L[c + 16 >> 2 >>> 0] = a.getMonth();
              L[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;
              L[c + 24 >> 2 >>> 0] = a.getDay();
              L[c + 28 >> 2 >>> 0] = (W(a.getFullYear()) ? va : wa)[a.getMonth()] + a.getDate() - 1 | 0;
              L[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());
              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
              var f = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
              L[c + 32 >> 2 >>> 0] = (b != f && a.getTimezoneOffset() == Math.min(f, b)) | 0;
            },
            q: function(a) {
              a >>>= 0;
              var b = new Date(L[a + 20 >> 2 >>> 0] + 1900, L[a + 16 >> 2 >>> 0], L[a + 12 >> 2 >>> 0], L[a + 8 >> 2 >>> 0], L[a + 4 >> 2 >>> 0], L[a >> 2 >>> 0], 0), c = L[a + 32 >> 2 >>> 0], f = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), m = Math.min(h, g);
              0 > c ? L[a + 32 >> 2 >>> 0] = Number(g != h && m == f) : 0 < c != (m == f) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? m : g) - f)));
              L[a + 24 >> 2 >>> 0] = b.getDay();
              L[a + 28 >> 2 >>> 0] = (W(b.getFullYear()) ? va : wa)[b.getMonth()] + b.getDate() - 1 | 0;
              L[a >> 2 >>> 0] = b.getSeconds();
              L[a + 4 >> 2 >>> 0] = b.getMinutes();
              L[a + 8 >> 2 >>> 0] = b.getHours();
              L[a + 12 >> 2 >>> 0] = b.getDate();
              L[a + 16 >> 2 >>> 0] = b.getMonth();
              L[a + 20 >> 2 >>> 0] = b.getYear();
              a = b.getTime() / 1e3;
              return Ia((R = a, 1 <= +Math.abs(R) ? 0 < R ? +Math.floor(R / 4294967296) >>> 0 : ~~+Math.ceil((R - +(~~R >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;
            },
            m: function() {
              return -52;
            },
            n: function() {
            },
            t: function(a, b, c) {
              function f(w) {
                return (w = w.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? w[1] : "GMT";
              }
              c >>>= 0;
              var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), m = new Date(g, 6, 1);
              g = h.getTimezoneOffset();
              var q = m.getTimezoneOffset();
              M[a >>> 0 >> 2 >>> 0] = 60 * Math.max(g, q);
              L[b >>> 0 >> 2 >>> 0] = Number(g != q);
              a = f(h);
              b = f(m);
              a = Ba(a);
              b = Ba(b);
              q < g ? (M[c >> 2 >>> 0] = a, M[c + 4 >> 2 >>> 0] = b) : (M[c >> 2 >>> 0] = b, M[c + 4 >> 2 >>> 0] = a);
            },
            d: () => {
              G("");
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
              return K.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);
            },
            s: function(a) {
              a >>>= 0;
              var b = K.length;
              if (4294901760 < a)
                return false;
              for (var c = 1; 4 >= c; c *= 2) {
                var f = b * (1 + 0.2 / c);
                f = Math.min(f, a + 100663296);
                var g = Math;
                f = Math.max(a, f);
                a: {
                  g = g.min.call(g, 4294901760, f + (65536 - f % 65536) % 65536) - H.buffer.byteLength + 65535 >>> 16;
                  try {
                    H.grow(g);
                    ea();
                    var h = 1;
                    break a;
                  } catch (m) {
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
              Ca().forEach(function(f, g) {
                var h = b + c;
                g = M[a + 4 * g >> 2 >>> 0] = h;
                for (h = 0; h < f.length; ++h)
                  J[g++ >> 0 >>> 0] = f.charCodeAt(h);
                J[g >> 0 >>> 0] = 0;
                c += f.length + 1;
              });
              return 0;
            },
            D: function(a, b) {
              a >>>= 0;
              b >>>= 0;
              var c = Ca();
              M[a >> 2 >>> 0] = c.length;
              var f = 0;
              c.forEach(function(g) {
                f += g.length + 1;
              });
              M[b >> 2 >>> 0] = f;
              return 0;
            },
            f: () => 52,
            j: function() {
              return 52;
            },
            r: function() {
              return 70;
            },
            i: function(a, b, c, f) {
              b >>>= 0;
              c >>>= 0;
              f >>>= 0;
              for (var g = 0, h = 0; h < c; h++) {
                var m = M[b >> 2 >>> 0], q = M[b + 4 >> 2 >>> 0];
                b += 8;
                for (var w = 0; w < q; w++) {
                  var t = K[m + w >>> 0], u = Da[a];
                  0 === t || 10 === t ? ((1 === a ? ca : E)(ua(u, 0)), u.length = 0) : u.push(t);
                }
                g += q;
              }
              M[f >> 2 >>> 0] = g;
              return 0;
            },
            A: Ha,
            c: function(a, b, c, f) {
              return Ha(a >>> 0, b >>> 0, c >>> 0, f >>> 0);
            }
          };
          (function() {
            function a(c) {
              c = c.exports;
              I = c = Ka(c);
              H = I.J;
              ea();
              ha.unshift(I.K);
              N--;
              d.monitorRunDependencies && d.monitorRunDependencies(N);
              if (0 == N && (null !== O && (clearInterval(O), O = null), P)) {
                var f = P;
                P = null;
                f();
              }
              return c;
            }
            var b = { a: Ja };
            N++;
            d.monitorRunDependencies && d.monitorRunDependencies(N);
            if (d.instantiateWasm)
              try {
                return d.instantiateWasm(b, a);
              } catch (c) {
                E("Module.instantiateWasm callback failed with error: " + c), l(c);
              }
            pa(b, function(c) {
              a(c.instance);
            }).catch(l);
            return {};
          })();
          d._OrtInit = (a, b) => (d._OrtInit = I.L)(a, b);
          d._OrtGetLastError = (a, b) => (d._OrtGetLastError = I.M)(a, b);
          d._OrtCreateSessionOptions = (a, b, c, f, g, h, m, q, w, t) => (d._OrtCreateSessionOptions = I.N)(a, b, c, f, g, h, m, q, w, t);
          d._OrtAppendExecutionProvider = (a, b) => (d._OrtAppendExecutionProvider = I.O)(a, b);
          d._OrtAddFreeDimensionOverride = (a, b, c) => (d._OrtAddFreeDimensionOverride = I.P)(a, b, c);
          d._OrtAddSessionConfigEntry = (a, b, c) => (d._OrtAddSessionConfigEntry = I.Q)(a, b, c);
          d._OrtReleaseSessionOptions = (a) => (d._OrtReleaseSessionOptions = I.R)(a);
          d._OrtCreateSession = (a, b, c) => (d._OrtCreateSession = I.S)(a, b, c);
          d._OrtReleaseSession = (a) => (d._OrtReleaseSession = I.T)(a);
          d._OrtGetInputOutputCount = (a, b, c) => (d._OrtGetInputOutputCount = I.U)(a, b, c);
          d._OrtGetInputName = (a, b) => (d._OrtGetInputName = I.V)(a, b);
          d._OrtGetOutputName = (a, b) => (d._OrtGetOutputName = I.W)(a, b);
          d._OrtFree = (a) => (d._OrtFree = I.X)(a);
          d._OrtCreateTensor = (a, b, c, f, g, h) => (d._OrtCreateTensor = I.Y)(a, b, c, f, g, h);
          d._OrtGetTensorData = (a, b, c, f, g) => (d._OrtGetTensorData = I.Z)(a, b, c, f, g);
          d._OrtReleaseTensor = (a) => (d._OrtReleaseTensor = I._)(a);
          d._OrtCreateRunOptions = (a, b, c, f) => (d._OrtCreateRunOptions = I.$)(a, b, c, f);
          d._OrtAddRunConfigEntry = (a, b, c) => (d._OrtAddRunConfigEntry = I.aa)(a, b, c);
          d._OrtReleaseRunOptions = (a) => (d._OrtReleaseRunOptions = I.ba)(a);
          d._OrtCreateBinding = (a) => (d._OrtCreateBinding = I.ca)(a);
          d._OrtBindInput = (a, b, c) => (d._OrtBindInput = I.da)(a, b, c);
          d._OrtBindOutput = (a, b, c, f) => (d._OrtBindOutput = I.ea)(a, b, c, f);
          d._OrtClearBoundOutputs = (a) => (d._OrtClearBoundOutputs = I.fa)(a);
          d._OrtReleaseBinding = (a) => (d._OrtReleaseBinding = I.ga)(a);
          d._OrtRunWithBinding = (a, b, c, f, g) => (d._OrtRunWithBinding = I.ha)(a, b, c, f, g);
          d._OrtRun = (a, b, c, f, g, h, m, q) => (d._OrtRun = I.ia)(a, b, c, f, g, h, m, q);
          d._OrtEndProfiling = (a) => (d._OrtEndProfiling = I.ja)(a);
          d._OrtTrainingLoadCheckpoint = (a, b) => (d._OrtTrainingLoadCheckpoint = I.ka)(a, b);
          d._OrtTrainingReleaseCheckpoint = (a) => (d._OrtTrainingReleaseCheckpoint = I.la)(a);
          d._OrtTrainingCreateSession = (a, b, c, f, g, h, m, q) => (d._OrtTrainingCreateSession = I.ma)(a, b, c, f, g, h, m, q);
          d._OrtTrainingLazyResetGrad = (a) => (d._OrtTrainingLazyResetGrad = I.na)(a);
          d._OrtTrainingRunTrainStep = (a, b, c, f, g, h) => (d._OrtTrainingRunTrainStep = I.oa)(a, b, c, f, g, h);
          d._OrtTrainingOptimizerStep = (a, b) => (d._OrtTrainingOptimizerStep = I.pa)(a, b);
          d._OrtTrainingEvalStep = (a, b, c, f, g, h) => (d._OrtTrainingEvalStep = I.qa)(a, b, c, f, g, h);
          d._OrtTrainingGetParametersSize = (a, b, c) => (d._OrtTrainingGetParametersSize = I.ra)(a, b, c);
          d._OrtTrainingCopyParametersToBuffer = (a, b, c, f) => (d._OrtTrainingCopyParametersToBuffer = I.sa)(a, b, c, f);
          d._OrtTrainingCopyParametersFromBuffer = (a, b, c, f) => (d._OrtTrainingCopyParametersFromBuffer = I.ta)(a, b, c, f);
          d._OrtTrainingReleaseSession = (a) => (d._OrtTrainingReleaseSession = I.ua)(a);
          var Aa = d._malloc = (a) => (Aa = d._malloc = I.va)(a);
          d._free = (a) => (d._free = I.wa)(a);
          var Ia = (a) => (Ia = I.ya)(a), La = () => (La = I.za)(), Ma = (a) => (Ma = I.Aa)(a), Na = (a) => (Na = I.Ba)(a);
          function Ka(a) {
            a = Object.assign({}, a);
            var b = (f) => () => f() >>> 0, c = (f) => (g) => f(g) >>> 0;
            a.__errno_location = b(a.__errno_location);
            a.malloc = c(a.malloc);
            a.stackSave = b(a.stackSave);
            a.stackAlloc = c(a.stackAlloc);
            return a;
          }
          d.stackAlloc = Na;
          d.stackSave = La;
          d.stackRestore = Ma;
          d.UTF8ToString = T;
          d.stringToUTF8 = (a, b, c) => V(a, K, b, c);
          d.lengthBytesUTF8 = U;
          var Z;
          P = function Oa() {
            Z || Pa();
            Z || (P = Oa);
          };
          function Pa() {
            function a() {
              if (!Z && (Z = true, d.calledRun = true, !da)) {
                S(ha);
                k(d);
                if (d.onRuntimeInitialized)
                  d.onRuntimeInitialized();
                if (d.postRun)
                  for ("function" == typeof d.postRun && (d.postRun = [d.postRun]); d.postRun.length; ) {
                    var b = d.postRun.shift();
                    ia.unshift(b);
                  }
                S(ia);
              }
            }
            if (!(0 < N)) {
              if (d.preRun)
                for ("function" == typeof d.preRun && (d.preRun = [d.preRun]); d.preRun.length; )
                  ja();
              S(fa);
              0 < N || (d.setStatus ? (d.setStatus("Running..."), setTimeout(function() {
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
          Pa();
          return moduleArg.ready;
        };
      })();
      if (typeof exports === "object" && typeof module === "object")
        module.exports = ortWasm;
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
    "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module) {
      "use strict";
      var ortWasmThreaded = (() => {
        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
        if (typeof __filename !== "undefined")
          _scriptDir = _scriptDir || __filename;
        return function(moduleArg = {}) {
          function h() {
            m.buffer != n.buffer && p();
            return n;
          }
          function t() {
            m.buffer != n.buffer && p();
            return aa;
          }
          function v() {
            m.buffer != n.buffer && p();
            return ba;
          }
          function ca() {
            m.buffer != n.buffer && p();
            return da;
          }
          function w() {
            m.buffer != n.buffer && p();
            return ea;
          }
          function z() {
            m.buffer != n.buffer && p();
            return fa;
          }
          function ha() {
            m.buffer != n.buffer && p();
            return ia;
          }
          var A = moduleArg, ja, ka;
          A.ready = new Promise((a, b) => {
            ja = a;
            ka = b;
          });
          var la = Object.assign({}, A), ma = "./this.program", na = (a, b) => {
            throw b;
          }, oa = "object" == typeof window, B = "function" == typeof importScripts, D = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, E = A.ENVIRONMENT_IS_PTHREAD || false, F = "";
          function pa(a) {
            return A.locateFile ? A.locateFile(a, F) : F + a;
          }
          var qa, ra, sa;
          if (D) {
            var fs = (init_fs(), __toCommonJS(fs_exports)), ta = (init_path(), __toCommonJS(path_exports));
            F = B ? ta.dirname(F) + "/" : __dirname + "/";
            qa = (b, c) => {
              b = b.startsWith("file://") ? new URL(b) : ta.normalize(b);
              return fs.readFileSync(b, c ? void 0 : "utf8");
            };
            sa = (b) => {
              b = qa(b, true);
              b.buffer || (b = new Uint8Array(b));
              return b;
            };
            ra = (b, c, d, e = true) => {
              b = b.startsWith("file://") ? new URL(b) : ta.normalize(b);
              fs.readFile(b, e ? void 0 : "utf8", (f, k) => {
                f ? d(f) : c(e ? k.buffer : k);
              });
            };
            !A.thisProgram && 1 < process.argv.length && (ma = process.argv[1].replace(/\\/g, "/"));
            process.argv.slice(2);
            na = (b, c) => {
              process.exitCode = b;
              throw c;
            };
            A.inspect = () => "[Emscripten Module object]";
            let a;
            try {
              a = require_worker_threads();
            } catch (b) {
              throw console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?'), b;
            }
            global.Worker = a.Worker;
          } else if (oa || B)
            B ? F = self.location.href : "undefined" != typeof document && document.currentScript && (F = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (F = _scriptDir), 0 !== F.indexOf("blob:") ? F = F.substr(0, F.replace(/[?#].*/, "").lastIndexOf("/") + 1) : F = "", D || (qa = (a) => {
              var b = new XMLHttpRequest();
              b.open("GET", a, false);
              b.send(null);
              return b.responseText;
            }, B && (sa = (a) => {
              var b = new XMLHttpRequest();
              b.open("GET", a, false);
              b.responseType = "arraybuffer";
              b.send(null);
              return new Uint8Array(b.response);
            }), ra = (a, b, c) => {
              var d = new XMLHttpRequest();
              d.open("GET", a, true);
              d.responseType = "arraybuffer";
              d.onload = () => {
                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
              };
              d.onerror = c;
              d.send(null);
            });
          D && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);
          var ua = console.log.bind(console), va = console.error.bind(console);
          D && (ua = (...a) => fs.writeSync(1, a.join(" ") + "\n"), va = (...a) => fs.writeSync(2, a.join(" ") + "\n"));
          var wa = ua, G = va;
          Object.assign(A, la);
          la = null;
          var noExitRuntime = true;
          "object" != typeof WebAssembly && H("no native wasm support detected");
          var m, xa, ya = false, I, n, aa, ba, da, ea, fa, za, J, Aa, ia;
          function p() {
            var a = m.buffer;
            A.HEAP8 = n = new Int8Array(a);
            A.HEAP16 = ba = new Int16Array(a);
            A.HEAPU8 = aa = new Uint8Array(a);
            A.HEAPU16 = da = new Uint16Array(a);
            A.HEAP32 = ea = new Int32Array(a);
            A.HEAPU32 = fa = new Uint32Array(a);
            A.HEAPF32 = za = new Float32Array(a);
            A.HEAPF64 = ia = new Float64Array(a);
            A.HEAP64 = J = new BigInt64Array(a);
            A.HEAPU64 = Aa = new BigUint64Array(a);
          }
          var Ba = 16777216;
          5242880 <= Ba || H("INITIAL_MEMORY should be larger than STACK_SIZE, was " + Ba + "! (STACK_SIZE=5242880)");
          if (E)
            m = A.wasmMemory;
          else if (m = new WebAssembly.Memory({ initial: Ba / 65536, maximum: 65536, shared: true }), !(m.buffer instanceof SharedArrayBuffer))
            throw G("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), D && G("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");
          p();
          Ba = m.buffer.byteLength;
          var Ca = [], Da = [], Ea = [], Fa = 0;
          function Ga() {
            return noExitRuntime || 0 < Fa;
          }
          var K = 0, Ha = null, L = null;
          function Ia() {
            K--;
            if (0 == K && (null !== Ha && (clearInterval(Ha), Ha = null), L)) {
              var a = L;
              L = null;
              a();
            }
          }
          function H(a) {
            a = "Aborted(" + a + ")";
            G(a);
            ya = true;
            I = 1;
            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
            ka(a);
            throw a;
          }
          function Ja(a) {
            return a.startsWith("data:application/octet-stream;base64,");
          }
          var M;
          M = "ort-wasm-threaded.wasm";
          Ja(M) || (M = pa(M));
          function Ka(a) {
            if (sa)
              return sa(a);
            throw "both async and sync fetching of the wasm failed";
          }
          function La(a) {
            if (oa || B) {
              if ("function" == typeof fetch && !a.startsWith("file://"))
                return fetch(a, { credentials: "same-origin" }).then((b) => {
                  if (!b.ok)
                    throw "failed to load wasm binary file at '" + a + "'";
                  return b.arrayBuffer();
                }).catch(() => Ka(a));
              if (ra)
                return new Promise((b, c) => {
                  ra(a, (d) => b(new Uint8Array(d)), c);
                });
            }
            return Promise.resolve().then(() => Ka(a));
          }
          function Ma(a, b, c) {
            return La(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {
              G(`failed to asynchronously prepare wasm: ${d}`);
              H(d);
            });
          }
          function Na(a, b) {
            var c = M;
            return "function" != typeof WebAssembly.instantiateStreaming || Ja(c) || c.startsWith("file://") || D || "function" != typeof fetch ? Ma(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {
              G(`wasm streaming compile failed: ${e}`);
              G("falling back to ArrayBuffer instantiation");
              return Ma(c, a, b);
            }));
          }
          function Oa(a) {
            this.name = "ExitStatus";
            this.message = `Program terminated with exit(${a})`;
            this.status = a;
          }
          var Pa = (a) => {
            a.terminate();
            a.onmessage = () => {
            };
          }, Qa = (a) => {
            if (0 == O.qb.length) {
              var b = pa("ort-wasm-threaded.worker.js");
              b = new Worker(b);
              O.qb.push(b);
              O.Jb(O.qb[0]);
            }
            b = O.qb.pop();
            if (!b)
              return 6;
            O.nb.push(b);
            O.jb[a.mb] = b;
            b.mb = a.mb;
            var c = { cmd: "run", start_routine: a.Mb, arg: a.Fb, pthread_ptr: a.mb };
            D && b.unref();
            b.postMessage(c, a.Sb);
            return 0;
          }, Ra = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Sa = (a, b, c) => {
            b >>>= 0;
            var d = b + c;
            for (c = b; a[c] && !(c >= d); )
              ++c;
            if (16 < c - b && a.buffer && Ra)
              return Ra.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));
            for (d = ""; b < c; ) {
              var e = a[b++];
              if (e & 128) {
                var f = a[b++] & 63;
                if (192 == (e & 224))
                  d += String.fromCharCode((e & 31) << 6 | f);
                else {
                  var k = a[b++] & 63;
                  e = 224 == (e & 240) ? (e & 15) << 12 | f << 6 | k : (e & 7) << 18 | f << 12 | k << 6 | a[b++] & 63;
                  65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
                }
              } else
                d += String.fromCharCode(e);
            }
            return d;
          }, Ta = (a, b) => (a >>>= 0) ? Sa(t(), a, b) : "";
          function Ua(a) {
            if (E)
              return P(0, 1, a);
            I = a;
            Ga() || (O.Nb(), ya = true);
            na(a, new Oa(a));
          }
          var Wa = (a) => {
            I = a;
            if (E)
              throw Va(a), "unwind";
            Ua(a);
          };
          function Xa() {
            Ca.unshift(() => {
              K++;
              Ia();
            });
          }
          var O = { qb: [], nb: [], Eb: [], jb: {}, vb() {
            E ? (O.receiveObjectTransfer = O.Lb, O.threadInitTLS = O.Db, O.setExitStatus = O.Cb, noExitRuntime = false) : Xa();
          }, Cb: (a) => {
            I = a;
          }, Vb: ["$terminateWorker"], Nb: () => {
            for (var a of O.nb)
              Pa(a);
            for (a of O.qb)
              Pa(a);
            O.qb = [];
            O.nb = [];
            O.jb = [];
          }, Bb: (a) => {
            var b = a.mb;
            delete O.jb[b];
            O.qb.push(a);
            O.nb.splice(O.nb.indexOf(a), 1);
            a.mb = 0;
            Ya(b);
          }, Lb() {
          }, Db() {
            O.Eb.forEach((a) => a());
          }, Jb: (a) => new Promise((b) => {
            a.onmessage = (f) => {
              f = f.data;
              var k = f.cmd;
              if (f.targetThread && f.targetThread != Za()) {
                var l = O.jb[f.targetThread];
                l ? l.postMessage(f, f.transferList) : G(`Internal error! Worker sent a message "${k}" to target pthread ${f.targetThread}, but that thread no longer exists!`);
              } else if ("checkMailbox" === k)
                $a();
              else if ("spawnThread" === k)
                Qa(f);
              else if ("cleanupThread" === k)
                (f = O.jb[f.thread]) || H(), O.Bb(f);
              else if ("killThread" === k)
                f = f.thread, k = O.jb[f], delete O.jb[f], Pa(k), Ya(f), O.nb.splice(O.nb.indexOf(k), 1), k.mb = 0;
              else if ("cancelThread" === k)
                O.jb[f.thread].postMessage({ cmd: "cancel" });
              else if ("loaded" === k)
                a.loaded = true, b(a);
              else if ("alert" === k)
                alert(`Thread ${f.threadId}: ${f.text}`);
              else if ("setimmediate" === f.target)
                a.postMessage(f);
              else if ("callHandler" === k)
                A[f.handler](...f.args);
              else
                k && G(`worker sent an unknown command ${k}`);
            };
            a.onerror = (f) => {
              G(`${"worker sent an error!"} ${f.filename}:${f.lineno}: ${f.message}`);
              throw f;
            };
            D && (a.on("message", (f) => a.onmessage({ data: f })), a.on("error", (f) => a.onerror(f)));
            var c = [], d = [], e;
            for (e of d)
              A.hasOwnProperty(e) && c.push(e);
            a.postMessage({
              cmd: "load",
              handlers: c,
              urlOrBlob: A.mainScriptUrlOrBlob || _scriptDir,
              wasmMemory: m,
              wasmModule: xa
            });
          }) };
          A.PThread = O;
          var ab = (a) => {
            for (; 0 < a.length; )
              a.shift()(A);
          };
          A.establishStackSpace = () => {
            var a = Za(), b = z()[a + 52 >>> 2 >>> 0];
            a = z()[a + 56 >>> 2 >>> 0];
            bb(b, b - a);
            cb(b);
          };
          function Va(a) {
            if (E)
              return P(1, 0, a);
            Wa(a);
          }
          var db = [], eb;
          A.invokeEntryPoint = (a, b) => {
            var c = db[a];
            c || (a >= db.length && (db.length = a + 1), db[a] = c = eb.get(a));
            a = c(b);
            Ga() ? O.Cb(a) : fb(a);
          };
          function gb(a) {
            this.sb = a - 24;
            this.Kb = function(b) {
              z()[this.sb + 4 >>> 2 >>> 0] = b;
            };
            this.xb = function(b) {
              z()[this.sb + 8 >>> 2 >>> 0] = b;
            };
            this.vb = function(b, c) {
              this.wb();
              this.Kb(b);
              this.xb(c);
            };
            this.wb = function() {
              z()[this.sb + 16 >>> 2 >>> 0] = 0;
            };
          }
          var hb = 0, ib = 0;
          function jb(a, b, c, d) {
            return E ? P(2, 1, a, b, c, d) : kb(a, b, c, d);
          }
          function kb(a, b, c, d) {
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            d >>>= 0;
            if ("undefined" == typeof SharedArrayBuffer)
              return G("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;
            var e = [];
            if (E && 0 === e.length)
              return jb(a, b, c, d);
            a = { Mb: c, mb: a, Fb: d, Sb: e };
            return E ? (a.Ub = "spawnThread", postMessage(a, e), 0) : Qa(a);
          }
          function lb(a, b, c) {
            return E ? P(3, 1, a, b, c) : 0;
          }
          function mb(a, b) {
            if (E)
              return P(4, 1, a, b);
          }
          var nb = (a) => {
            for (var b = 0, c = 0; c < a.length; ++c) {
              var d = a.charCodeAt(c);
              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
            }
            return b;
          }, ob = (a, b, c, d) => {
            c >>>= 0;
            if (!(0 < d))
              return 0;
            var e = c;
            d = c + d - 1;
            for (var f = 0; f < a.length; ++f) {
              var k = a.charCodeAt(f);
              if (55296 <= k && 57343 >= k) {
                var l = a.charCodeAt(++f);
                k = 65536 + ((k & 1023) << 10) | l & 1023;
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
          }, pb = (a, b, c) => ob(a, t(), b, c);
          function qb(a, b) {
            if (E)
              return P(5, 1, a, b);
          }
          function rb(a, b, c) {
            if (E)
              return P(6, 1, a, b, c);
          }
          function sb(a, b, c) {
            return E ? P(7, 1, a, b, c) : 0;
          }
          function tb(a, b) {
            if (E)
              return P(8, 1, a, b);
          }
          function ub(a, b, c) {
            if (E)
              return P(9, 1, a, b, c);
          }
          function vb(a, b, c, d) {
            if (E)
              return P(10, 1, a, b, c, d);
          }
          function wb(a, b, c, d) {
            if (E)
              return P(11, 1, a, b, c, d);
          }
          function xb(a, b, c, d) {
            if (E)
              return P(12, 1, a, b, c, d);
          }
          function yb(a) {
            if (E)
              return P(13, 1, a);
          }
          function zb(a, b) {
            if (E)
              return P(14, 1, a, b);
          }
          function Ab(a, b, c) {
            if (E)
              return P(15, 1, a, b, c);
          }
          var Bb = (a) => {
            if (null === a)
              return "null";
            var b = typeof a;
            return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
          }, Cb, R = (a) => {
            for (var b = ""; t()[a >>> 0]; )
              b += Cb[t()[a++ >>> 0]];
            return b;
          }, Db = {}, Eb = {}, Fb = {}, S;
          function Gb(a, b, c = {}) {
            var d = b.name;
            if (!a)
              throw new S(`type "${d}" must have a positive integer typeid pointer`);
            if (Eb.hasOwnProperty(a)) {
              if (c.Hb)
                return;
              throw new S(`Cannot register type '${d}' twice`);
            }
            Eb[a] = b;
            delete Fb[a];
            Db.hasOwnProperty(a) && (b = Db[a], delete Db[a], b.forEach((e) => e()));
          }
          function T(a, b, c = {}) {
            if (!("argPackAdvance" in b))
              throw new TypeError("registerType registeredInstance requires argPackAdvance");
            Gb(a, b, c);
          }
          var Hb = (a, b, c) => {
            switch (b) {
              case 1:
                return c ? (d) => h()[d >>> 0 >>> 0] : (d) => t()[d >>> 0 >>> 0];
              case 2:
                return c ? (d) => v()[d >>> 1 >>> 0] : (d) => ca()[d >>> 1 >>> 0];
              case 4:
                return c ? (d) => w()[d >>> 2 >>> 0] : (d) => z()[d >>> 2 >>> 0];
              case 8:
                return c ? (d) => J[d >>> 3] : (d) => Aa[d >>> 3];
              default:
                throw new TypeError(`invalid integer width (${b}): ${a}`);
            }
          };
          function Ib() {
            this.lb = [void 0];
            this.zb = [];
          }
          var U = new Ib();
          function Jb(a) {
            a >>>= 0;
            a >= U.sb && 0 === --U.get(a).Ab && U.xb(a);
          }
          var V = (a) => {
            if (!a)
              throw new S("Cannot use deleted val. handle = " + a);
            return U.get(a).value;
          }, W = (a) => {
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
                return U.wb({ Ab: 1, value: a });
            }
          };
          function Kb(a) {
            return this.fromWireType(w()[a >>> 2 >>> 0]);
          }
          var Lb = (a, b) => {
            switch (b) {
              case 4:
                return function(c) {
                  var d = this.fromWireType;
                  m.buffer != n.buffer && p();
                  return d.call(this, za[c >>> 2 >>> 0]);
                };
              case 8:
                return function(c) {
                  return this.fromWireType(ha()[c >>> 3 >>> 0]);
                };
              default:
                throw new TypeError(`invalid float width (${b}): ${a}`);
            }
          };
          function Mb(a) {
            return this.fromWireType(z()[a >>> 2 >>> 0]);
          }
          var Nb = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, Ob = (a, b) => {
            var c = a >> 1;
            for (var d = c + b / 2; !(c >= d) && ca()[c >>> 0]; )
              ++c;
            c <<= 1;
            if (32 < c - a && Nb)
              return Nb.decode(t().slice(a, c));
            c = "";
            for (d = 0; !(d >= b / 2); ++d) {
              var e = v()[a + 2 * d >>> 1 >>> 0];
              if (0 == e)
                break;
              c += String.fromCharCode(e);
            }
            return c;
          }, Pb = (a, b, c) => {
            void 0 === c && (c = 2147483647);
            if (2 > c)
              return 0;
            c -= 2;
            var d = b;
            c = c < 2 * a.length ? c / 2 : a.length;
            for (var e = 0; e < c; ++e) {
              var f = a.charCodeAt(e);
              v()[b >>> 1 >>> 0] = f;
              b += 2;
            }
            v()[b >>> 1 >>> 0] = 0;
            return b - d;
          }, Qb = (a) => 2 * a.length, Rb = (a, b) => {
            for (var c = 0, d = ""; !(c >= b / 4); ) {
              var e = w()[a + 4 * c >>> 2 >>> 0];
              if (0 == e)
                break;
              ++c;
              65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);
            }
            return d;
          }, Sb = (a, b, c) => {
            b >>>= 0;
            void 0 === c && (c = 2147483647);
            if (4 > c)
              return 0;
            var d = b;
            c = d + c - 4;
            for (var e = 0; e < a.length; ++e) {
              var f = a.charCodeAt(e);
              if (55296 <= f && 57343 >= f) {
                var k = a.charCodeAt(++e);
                f = 65536 + ((f & 1023) << 10) | k & 1023;
              }
              w()[b >>> 2 >>> 0] = f;
              b += 4;
              if (b + 4 > c)
                break;
            }
            w()[b >>> 2 >>> 0] = 0;
            return b - d;
          }, Tb = (a) => {
            for (var b = 0, c = 0; c < a.length; ++c) {
              var d = a.charCodeAt(c);
              55296 <= d && 57343 >= d && ++c;
              b += 4;
            }
            return b;
          }, Ub = (a) => {
            if (!ya)
              try {
                if (a(), !Ga())
                  try {
                    E ? fb(I) : Wa(I);
                  } catch (b) {
                    b instanceof Oa || "unwind" == b || na(1, b);
                  }
              } catch (b) {
                b instanceof Oa || "unwind" == b || na(1, b);
              }
          };
          function Vb(a) {
            a >>>= 0;
            "function" === typeof Atomics.Tb && (Atomics.Tb(w(), a >>> 2, a).value.then($a), a += 128, Atomics.store(w(), a >>> 2, 1));
          }
          A.__emscripten_thread_mailbox_await = Vb;
          var $a = () => {
            var a = Za();
            a && (Vb(a), Ub(() => Wb()));
          };
          A.checkMailbox = $a;
          var Yb = (a) => {
            var b = Xb();
            a = a();
            cb(b);
            return a;
          };
          function P(a, b) {
            var c = arguments.length - 2, d = arguments;
            return Yb(() => {
              for (var e = 2 * c, f = Zb(8 * e), k = f >>> 3, l = 0; l < c; l++) {
                var q = d[2 + l];
                "bigint" == typeof q ? (J[k + 2 * l] = 1n, J[k + 2 * l + 1] = q) : (J[k + 2 * l] = 0n, ha()[k + 2 * l + 1 >>> 0] = q);
              }
              return $b(a, e, f, b);
            });
          }
          var ac = [], cc = (a, b) => {
            var c = Eb[a];
            if (void 0 === c)
              throw a = bc(a), c = R(a), X(a), new S(b + " has unknown type " + c);
            return c;
          }, dc = {}, ec = (a) => {
            var b = dc[a];
            return void 0 === b ? R(a) : b;
          }, fc = [], gc = () => "object" == typeof globalThis ? globalThis : Function("return this")(), hc = (a) => {
            var b = fc.length;
            fc.push(a);
            return b;
          }, ic = (a, b) => {
            for (var c = Array(a), d = 0; d < a; ++d)
              c[d] = cc(z()[b + 4 * d >>> 2 >>> 0], "parameter " + d);
            return c;
          }, jc = (a) => {
            if (void 0 === a)
              return "_unknown";
            a = a.replace(/[^a-zA-Z0-9_]/g, "$");
            var b = a.charCodeAt(0);
            return 48 <= b && 57 >= b ? `_${a}` : a;
          }, lc = {};
          function mc(a, b) {
            a = jc(a);
            return { [a]: function() {
              return b.apply(this, arguments);
            } }[a];
          }
          function nc(a) {
            var b = Function;
            if (!(b instanceof Function))
              throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);
            var c = mc(b.name || "unknownFunctionName", function() {
            });
            c.prototype = b.prototype;
            c = new c();
            a = b.apply(c, a);
            return a instanceof Object ? a : c;
          }
          var oc = (a) => {
            for (var b = "", c = 0; c < a; ++c)
              b += (0 !== c ? ", " : "") + "arg" + c;
            var d = "return function emval_allocator_" + a + "(constructor, argTypes, args) {\n  var HEAPU32 = getMemory();\n";
            for (c = 0; c < a; ++c)
              d += "var argType" + c + " = requireRegisteredType(HEAPU32[((argTypes)>>>2)], 'parameter " + c + "');\nvar arg" + c + " = argType" + c + ".readValueFromPointer(args);\nargs += argType" + c + "['argPackAdvance'];\nargTypes += 4;\n";
            return new Function("requireRegisteredType", "Module", "valueToHandle", "getMemory", d + ("var obj = new constructor(" + b + ");\nreturn valueToHandle(obj);\n}\n"))(cc, A, W, () => z());
          }, pc = {}, Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), qc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], rc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
          function sc(a, b, c, d, e, f, k) {
            return E ? P(16, 1, a, b, c, d, e, f, k) : -52;
          }
          function tc(a, b, c, d, e, f) {
            if (E)
              return P(17, 1, a, b, c, d, e, f);
          }
          var vc = (a) => {
            var b = nb(a) + 1, c = uc(b);
            c && pb(a, c, b);
            return c;
          }, wc = {}, yc = () => {
            if (!xc) {
              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ma || "./this.program" }, b;
              for (b in wc)
                void 0 === wc[b] ? delete a[b] : a[b] = wc[b];
              var c = [];
              for (b in a)
                c.push(`${b}=${a[b]}`);
              xc = c;
            }
            return xc;
          }, xc;
          function zc(a, b) {
            if (E)
              return P(18, 1, a, b);
            a >>>= 0;
            b >>>= 0;
            var c = 0;
            yc().forEach((d, e) => {
              var f = b + c;
              e = z()[a + 4 * e >>> 2 >>> 0] = f;
              for (f = 0; f < d.length; ++f)
                h()[e++ >>> 0 >>> 0] = d.charCodeAt(f);
              h()[e >>> 0 >>> 0] = 0;
              c += d.length + 1;
            });
            return 0;
          }
          function Ac(a, b) {
            if (E)
              return P(19, 1, a, b);
            a >>>= 0;
            b >>>= 0;
            var c = yc();
            z()[a >>> 2 >>> 0] = c.length;
            var d = 0;
            c.forEach((e) => d += e.length + 1);
            z()[b >>> 2 >>> 0] = d;
            return 0;
          }
          function Bc(a) {
            return E ? P(20, 1, a) : 52;
          }
          function Cc(a, b, c, d) {
            return E ? P(21, 1, a, b, c, d) : 52;
          }
          function Dc(a, b, c, d) {
            return E ? P(22, 1, a, b, c, d) : 70;
          }
          var Ec = [null, [], []];
          function Fc(a, b, c, d) {
            if (E)
              return P(23, 1, a, b, c, d);
            b >>>= 0;
            c >>>= 0;
            d >>>= 0;
            for (var e = 0, f = 0; f < c; f++) {
              var k = z()[b >>> 2 >>> 0], l = z()[b + 4 >>> 2 >>> 0];
              b += 8;
              for (var q = 0; q < l; q++) {
                var r = t()[k + q >>> 0], x = Ec[a];
                0 === r || 10 === r ? ((1 === a ? wa : G)(Sa(x, 0)), x.length = 0) : x.push(r);
              }
              e += l;
            }
            z()[d >>> 2 >>> 0] = e;
            return 0;
          }
          var Gc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Hc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
          function Ic(a) {
            var b = Array(nb(a) + 1);
            ob(a, b, 0, b.length);
            return b;
          }
          var Jc = (a, b) => {
            h().set(a, b >>> 0);
          };
          function Kc(a, b, c, d) {
            function e(g, u, y) {
              for (g = "number" == typeof g ? g.toString() : g || ""; g.length < u; )
                g = y[0] + g;
              return g;
            }
            function f(g, u) {
              return e(g, u, "0");
            }
            function k(g, u) {
              function y(kc) {
                return 0 > kc ? -1 : 0 < kc ? 1 : 0;
              }
              var Q;
              0 === (Q = y(g.getFullYear() - u.getFullYear())) && 0 === (Q = y(g.getMonth() - u.getMonth())) && (Q = y(g.getDate() - u.getDate()));
              return Q;
            }
            function l(g) {
              switch (g.getDay()) {
                case 0:
                  return new Date(g.getFullYear() - 1, 11, 29);
                case 1:
                  return g;
                case 2:
                  return new Date(g.getFullYear(), 0, 3);
                case 3:
                  return new Date(
                    g.getFullYear(),
                    0,
                    2
                  );
                case 4:
                  return new Date(g.getFullYear(), 0, 1);
                case 5:
                  return new Date(g.getFullYear() - 1, 11, 31);
                case 6:
                  return new Date(g.getFullYear() - 1, 11, 30);
              }
            }
            function q(g) {
              var u = g.ob;
              for (g = new Date(new Date(g.pb + 1900, 0, 1).getTime()); 0 < u; ) {
                var y = g.getMonth(), Q = (Y(g.getFullYear()) ? Gc : Hc)[y];
                if (u > Q - g.getDate())
                  u -= Q - g.getDate() + 1, g.setDate(1), 11 > y ? g.setMonth(y + 1) : (g.setMonth(0), g.setFullYear(g.getFullYear() + 1));
                else {
                  g.setDate(g.getDate() + u);
                  break;
                }
              }
              y = new Date(g.getFullYear() + 1, 0, 4);
              u = l(new Date(
                g.getFullYear(),
                0,
                4
              ));
              y = l(y);
              return 0 >= k(u, g) ? 0 >= k(y, g) ? g.getFullYear() + 1 : g.getFullYear() : g.getFullYear() - 1;
            }
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            d >>>= 0;
            var r = z()[d + 40 >>> 2 >>> 0];
            d = { Qb: w()[d >>> 2 >>> 0], Pb: w()[d + 4 >>> 2 >>> 0], tb: w()[d + 8 >>> 2 >>> 0], yb: w()[d + 12 >>> 2 >>> 0], ub: w()[d + 16 >>> 2 >>> 0], pb: w()[d + 20 >>> 2 >>> 0], kb: w()[d + 24 >>> 2 >>> 0], ob: w()[d + 28 >>> 2 >>> 0], Wb: w()[d + 32 >>> 2 >>> 0], Ob: w()[d + 36 >>> 2 >>> 0], Rb: r ? Ta(r) : "" };
            c = Ta(c);
            r = {
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
            for (var x in r)
              c = c.replace(new RegExp(x, "g"), r[x]);
            var C = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), N = "January February March April May June July August September October November December".split(" ");
            r = { "%a": (g) => C[g.kb].substring(0, 3), "%A": (g) => C[g.kb], "%b": (g) => N[g.ub].substring(0, 3), "%B": (g) => N[g.ub], "%C": (g) => f((g.pb + 1900) / 100 | 0, 2), "%d": (g) => f(g.yb, 2), "%e": (g) => e(g.yb, 2, " "), "%g": (g) => q(g).toString().substring(2), "%G": (g) => q(g), "%H": (g) => f(g.tb, 2), "%I": (g) => {
              g = g.tb;
              0 == g ? g = 12 : 12 < g && (g -= 12);
              return f(g, 2);
            }, "%j": (g) => {
              for (var u = 0, y = 0; y <= g.ub - 1; u += (Y(g.pb + 1900) ? Gc : Hc)[y++])
                ;
              return f(g.yb + u, 3);
            }, "%m": (g) => f(g.ub + 1, 2), "%M": (g) => f(g.Pb, 2), "%n": () => "\n", "%p": (g) => 0 <= g.tb && 12 > g.tb ? "AM" : "PM", "%S": (g) => f(g.Qb, 2), "%t": () => "	", "%u": (g) => g.kb || 7, "%U": (g) => f(Math.floor((g.ob + 7 - g.kb) / 7), 2), "%V": (g) => {
              var u = Math.floor((g.ob + 7 - (g.kb + 6) % 7) / 7);
              2 >= (g.kb + 371 - g.ob - 2) % 7 && u++;
              if (u)
                53 == u && (y = (g.kb + 371 - g.ob) % 7, 4 == y || 3 == y && Y(g.pb) || (u = 1));
              else {
                u = 52;
                var y = (g.kb + 7 - g.ob - 1) % 7;
                (4 == y || 5 == y && Y(g.pb % 400 - 1)) && u++;
              }
              return f(u, 2);
            }, "%w": (g) => g.kb, "%W": (g) => f(Math.floor((g.ob + 7 - (g.kb + 6) % 7) / 7), 2), "%y": (g) => (g.pb + 1900).toString().substring(2), "%Y": (g) => g.pb + 1900, "%z": (g) => {
              g = g.Ob;
              var u = 0 <= g;
              g = Math.abs(g) / 60;
              return (u ? "+" : "-") + String("0000" + (g / 60 * 100 + g % 60)).slice(-4);
            }, "%Z": (g) => g.Rb, "%%": () => "%" };
            c = c.replace(/%%/g, "\0\0");
            for (x in r)
              c.includes(x) && (c = c.replace(new RegExp(x, "g"), r[x](d)));
            c = c.replace(/\0\0/g, "%");
            x = Ic(c);
            if (x.length > b)
              return 0;
            Jc(x, a);
            return x.length - 1;
          }
          O.vb();
          for (var Lc = Array(256), Mc = 0; 256 > Mc; ++Mc)
            Lc[Mc] = String.fromCharCode(Mc);
          Cb = Lc;
          S = A.BindingError = class extends Error {
            constructor(a) {
              super(a);
              this.name = "BindingError";
            }
          };
          A.InternalError = class extends Error {
            constructor(a) {
              super(a);
              this.name = "InternalError";
            }
          };
          Object.assign(Ib.prototype, { get(a) {
            return this.lb[a];
          }, has(a) {
            return void 0 !== this.lb[a];
          }, wb(a) {
            var b = this.zb.pop() || this.lb.length;
            this.lb[b] = a;
            return b;
          }, xb(a) {
            this.lb[a] = void 0;
            this.zb.push(a);
          } });
          U.lb.push({ value: void 0 }, { value: null }, { value: true }, { value: false });
          U.sb = U.lb.length;
          A.count_emval_handles = () => {
            for (var a = 0, b = U.sb; b < U.lb.length; ++b)
              void 0 !== U.lb[b] && ++a;
            return a;
          };
          var Nc = [Ua, Va, jb, lb, mb, qb, rb, sb, tb, ub, vb, wb, xb, yb, zb, Ab, sc, tc, zc, Ac, Bc, Cc, Dc, Fc], Pc = {
            b: function(a, b, c) {
              a >>>= 0;
              new gb(a).vb(b >>> 0, c >>> 0);
              hb = a;
              ib++;
              throw hb;
            },
            ea: function(a) {
              Oc(a >>> 0, !B, 1, !oa, 131072, false);
              O.Db();
            },
            D: function(a) {
              a >>>= 0;
              E ? postMessage({ cmd: "cleanupThread", thread: a }) : ((a = O.jb[a]) || H(), O.Bb(a));
            },
            W: kb,
            y: lb,
            ka: mb,
            S: qb,
            U: rb,
            L: sb,
            ia: tb,
            ba: ub,
            ha: vb,
            F: wb,
            T: xb,
            Q: yb,
            ja: zb,
            R: Ab,
            I: function(a, b, c, d, e) {
              a >>>= 0;
              b >>>= 0;
              c >>>= 0;
              b = R(b);
              var f = -1 != b.indexOf("u");
              f && (e = (1n << 64n) - 1n);
              T(a, { name: b, fromWireType: (k) => k, toWireType: function(k, l) {
                if ("bigint" != typeof l && "number" != typeof l)
                  throw new TypeError(`Cannot convert "${Bb(l)}" to ${this.name}`);
                if (l < d || l > e)
                  throw new TypeError(`Passing a number "${Bb(l)}" from JS side to C/C++ side to an argument of type "${b}", which is outside the valid range [${d}, ${e}]!`);
                return l;
              }, argPackAdvance: 8, readValueFromPointer: Hb(b, c, !f), rb: null });
            },
            qa: function(a, b, c, d) {
              a >>>= 0;
              b = R(b >>> 0);
              T(a, {
                name: b,
                fromWireType: function(e) {
                  return !!e;
                },
                toWireType: function(e, f) {
                  return f ? c : d;
                },
                argPackAdvance: 8,
                readValueFromPointer: function(e) {
                  return this.fromWireType(t()[e >>> 0]);
                },
                rb: null
              });
            },
            pa: function(a, b) {
              a >>>= 0;
              b = R(b >>> 0);
              T(a, { name: b, fromWireType: (c) => {
                var d = V(c);
                Jb(c);
                return d;
              }, toWireType: (c, d) => W(d), argPackAdvance: 8, readValueFromPointer: Kb, rb: null });
            },
            H: function(a, b, c) {
              a >>>= 0;
              c >>>= 0;
              b = R(b >>> 0);
              T(a, { name: b, fromWireType: (d) => d, toWireType: (d, e) => e, argPackAdvance: 8, readValueFromPointer: Lb(b, c), rb: null });
            },
            t: function(a, b, c, d, e) {
              a >>>= 0;
              c >>>= 0;
              b = R(b >>> 0);
              -1 === e && (e = 4294967295);
              e = (l) => l;
              if (0 === d) {
                var f = 32 - 8 * c;
                e = (l) => l << f >>> f;
              }
              var k = b.includes("unsigned") ? function(l, q) {
                return q >>> 0;
              } : function(l, q) {
                return q;
              };
              T(a, { name: b, fromWireType: e, toWireType: k, argPackAdvance: 8, readValueFromPointer: Hb(b, c, 0 !== d), rb: null });
            },
            m: function(a, b, c) {
              function d(f) {
                var k = z()[f >>> 2 >>> 0];
                f = z()[f + 4 >>> 2 >>> 0];
                return new e(h().buffer, f, k);
              }
              a >>>= 0;
              var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];
              c = R(c >>> 0);
              T(
                a,
                { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d },
                { Hb: true }
              );
            },
            J: function(a, b) {
              a >>>= 0;
              b = R(b >>> 0);
              var c = "std::string" === b;
              T(a, { name: b, fromWireType: function(d) {
                var e = z()[d >>> 2 >>> 0], f = d + 4;
                if (c)
                  for (var k = f, l = 0; l <= e; ++l) {
                    var q = f + l;
                    if (l == e || 0 == t()[q >>> 0]) {
                      k = Ta(k, q - k);
                      if (void 0 === r)
                        var r = k;
                      else
                        r += String.fromCharCode(0), r += k;
                      k = q + 1;
                    }
                  }
                else {
                  r = Array(e);
                  for (l = 0; l < e; ++l)
                    r[l] = String.fromCharCode(t()[f + l >>> 0]);
                  r = r.join("");
                }
                X(d);
                return r;
              }, toWireType: function(d, e) {
                e instanceof ArrayBuffer && (e = new Uint8Array(e));
                var f = "string" == typeof e;
                if (!(f || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array))
                  throw new S("Cannot pass non-string to std::string");
                var k = c && f ? nb(e) : e.length;
                var l = uc(4 + k + 1), q = l + 4;
                z()[l >>> 2 >>> 0] = k;
                if (c && f)
                  pb(e, q, k + 1);
                else if (f)
                  for (f = 0; f < k; ++f) {
                    var r = e.charCodeAt(f);
                    if (255 < r)
                      throw X(q), new S("String has UTF-16 code units that do not fit in 8 bits");
                    t()[q + f >>> 0] = r;
                  }
                else
                  for (f = 0; f < k; ++f)
                    t()[q + f >>> 0] = e[f];
                null !== d && d.push(X, l);
                return l;
              }, argPackAdvance: 8, readValueFromPointer: Mb, rb(d) {
                X(d);
              } });
            },
            A: function(a, b, c) {
              a >>>= 0;
              b >>>= 0;
              c >>>= 0;
              c = R(c);
              if (2 === b) {
                var d = Ob;
                var e = Pb;
                var f = Qb;
                var k = () => ca();
                var l = 1;
              } else
                4 === b && (d = Rb, e = Sb, f = Tb, k = () => z(), l = 2);
              T(a, {
                name: c,
                fromWireType: (q) => {
                  for (var r = z()[q >>> 2 >>> 0], x = k(), C, N = q + 4, g = 0; g <= r; ++g) {
                    var u = q + 4 + g * b;
                    if (g == r || 0 == x[u >>> l])
                      N = d(N, u - N), void 0 === C ? C = N : (C += String.fromCharCode(0), C += N), N = u + b;
                  }
                  X(q);
                  return C;
                },
                toWireType: (q, r) => {
                  if ("string" != typeof r)
                    throw new S(`Cannot pass non-string to C++ string type ${c}`);
                  var x = f(r), C = uc(4 + x + b);
                  z()[C >>> 2] = x >> l;
                  e(r, C + 4, x + b);
                  null !== q && q.push(X, C);
                  return C;
                },
                argPackAdvance: 8,
                readValueFromPointer: Kb,
                rb(q) {
                  X(q);
                }
              });
            },
            ra: function(a, b) {
              a >>>= 0;
              b = R(b >>> 0);
              T(a, { Ib: true, name: b, argPackAdvance: 0, fromWireType: () => {
              }, toWireType: () => {
              } });
            },
            na: () => true,
            O: function(a, b) {
              a >>>= 0;
              a == b >>> 0 ? setTimeout(() => $a()) : E ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = O.jb[a]) && a.postMessage({ cmd: "checkMailbox" });
            },
            X: function(a, b, c, d) {
              b >>>= 0;
              c /= 2;
              ac.length = c;
              d = d >>> 0 >>> 3;
              for (var e = 0; e < c; e++)
                ac[e] = J[d + 2 * e] ? J[d + 2 * e + 1] : ha()[d + 2 * e + 1 >>> 0];
              a = Nc[a];
              O.Gb = b;
              b = a.apply(null, ac);
              O.Gb = 0;
              return b;
            },
            da: Vb,
            ma: function(a) {
              D && O.jb[a >>> 0].ref();
            },
            r: function(a, b, c) {
              b >>>= 0;
              c >>>= 0;
              a = V(a >>> 0);
              b = cc(b, "emval::as");
              var d = [], e = W(d);
              z()[c >>> 2 >>> 0] = e;
              return b.toWireType(d, a);
            },
            i: function(a, b, c, d, e) {
              c >>>= 0;
              d >>>= 0;
              e >>>= 0;
              a = fc[a >>> 0];
              b = V(b >>> 0);
              c = ec(c);
              var f = [];
              z()[d >>> 2 >>> 0] = W(f);
              return a(b, c, f, e);
            },
            u: function(a, b, c, d) {
              c >>>= 0;
              d >>>= 0;
              a = fc[a >>> 0];
              b = V(b >>> 0);
              c = ec(c);
              a(b, c, null, d);
            },
            c: Jb,
            K: function(a, b) {
              b >>>= 0;
              a = V(a >>> 0);
              b = V(b);
              return a == b;
            },
            o: function(a) {
              a >>>= 0;
              if (0 === a)
                return W(gc());
              a = ec(a);
              return W(gc()[a]);
            },
            h: function(a, b) {
              var c = ic(a, b >>> 0), d = c[0];
              b = d.name + "_$" + c.slice(1).map(function(x) {
                return x.name;
              }).join("_") + "$";
              var e = lc[b];
              if (void 0 !== e)
                return e;
              e = ["retType"];
              for (var f = [d], k = "", l = 0; l < a - 1; ++l)
                k += (0 !== l ? ", " : "") + "arg" + l, e.push("argType" + l), f.push(c[1 + l]);
              var q = "return function " + jc("methodCaller_" + b) + "(handle, name, destructors, args) {\n", r = 0;
              for (l = 0; l < a - 1; ++l)
                q += "    var arg" + l + " = argType" + l + ".readValueFromPointer(args" + (r ? "+" + r : "") + ");\n", r += c[l + 1].argPackAdvance;
              q += "    var rv = handle[name](" + k + ");\n";
              for (l = 0; l < a - 1; ++l)
                c[l + 1].deleteObject && (q += "    argType" + l + ".deleteObject(arg" + l + ");\n");
              d.Ib || (q += "    return retType.toWireType(destructors, rv);\n");
              e.push(q + "};\n");
              a = nc(e).apply(null, f);
              e = hc(a);
              return lc[b] = e;
            },
            q: function(a, b) {
              b >>>= 0;
              a = V(a >>> 0);
              b = V(b);
              return W(a[b]);
            },
            d: function(a) {
              a >>>= 0;
              4 < a && (U.get(a).Ab += 1);
            },
            x: function(a, b, c, d) {
              c >>>= 0;
              d >>>= 0;
              a = V(a >>> 0);
              var e = pc[b];
              e || (e = oc(b), pc[b] = e);
              return e(a, c, d);
            },
            v: function() {
              return W([]);
            },
            l: function(a) {
              a = V(a >>> 0);
              for (var b = Array(a.length), c = 0; c < a.length; c++)
                b[c] = a[c];
              return W(b);
            },
            e: function(a) {
              return W(ec(a >>> 0));
            },
            k: function() {
              return W({});
            },
            g: function(a) {
              a >>>= 0;
              for (var b = V(a); b.length; ) {
                var c = b.pop();
                b.pop()(c);
              }
              Jb(a);
            },
            j: function(a, b, c) {
              b >>>= 0;
              c >>>= 0;
              a = V(a >>> 0);
              b = V(b);
              c = V(c);
              a[b] = c;
            },
            f: function(a, b) {
              b >>>= 0;
              a = cc(a >>> 0, "_emval_take_value");
              a = a.readValueFromPointer(b);
              return W(a);
            },
            _: function(a, b) {
              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
              b >>>= 0;
              a = new Date(1e3 * a);
              w()[b >>> 2 >>> 0] = a.getUTCSeconds();
              w()[b + 4 >>> 2 >>> 0] = a.getUTCMinutes();
              w()[b + 8 >>> 2 >>> 0] = a.getUTCHours();
              w()[b + 12 >>> 2 >>> 0] = a.getUTCDate();
              w()[b + 16 >>> 2 >>> 0] = a.getUTCMonth();
              w()[b + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;
              w()[b + 24 >>> 2 >>> 0] = a.getUTCDay();
              a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
              w()[b + 28 >>> 2 >>> 0] = a;
            },
            $: function(a, b) {
              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
              b >>>= 0;
              a = new Date(1e3 * a);
              w()[b >>> 2 >>> 0] = a.getSeconds();
              w()[b + 4 >>> 2 >>> 0] = a.getMinutes();
              w()[b + 8 >>> 2 >>> 0] = a.getHours();
              w()[b + 12 >>> 2 >>> 0] = a.getDate();
              w()[b + 16 >>> 2 >>> 0] = a.getMonth();
              w()[b + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;
              w()[b + 24 >>> 2 >>> 0] = a.getDay();
              var c = (Y(a.getFullYear()) ? qc : rc)[a.getMonth()] + a.getDate() - 1 | 0;
              w()[b + 28 >>> 2 >>> 0] = c;
              w()[b + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());
              c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
              var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
              a = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
              w()[b + 32 >>> 2 >>> 0] = a;
            },
            aa: function(a) {
              a >>>= 0;
              var b = new Date(w()[a + 20 >>> 2 >>> 0] + 1900, w()[a + 16 >>> 2 >>> 0], w()[a + 12 >>> 2 >>> 0], w()[a + 8 >>> 2 >>> 0], w()[a + 4 >>> 2 >>> 0], w()[a >>> 2 >>> 0], 0), c = w()[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), e = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), f = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(f, e);
              0 > c ? w()[a + 32 >>> 2 >>> 0] = Number(e != f && k == d) : 0 < c != (k == d) && (e = Math.max(f, e), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : e) - d)));
              w()[a + 24 >>> 2 >>> 0] = b.getDay();
              c = (Y(b.getFullYear()) ? qc : rc)[b.getMonth()] + b.getDate() - 1 | 0;
              w()[a + 28 >>> 2 >>> 0] = c;
              w()[a >>> 2 >>> 0] = b.getSeconds();
              w()[a + 4 >>> 2 >>> 0] = b.getMinutes();
              w()[a + 8 >>> 2 >>> 0] = b.getHours();
              w()[a + 12 >>> 2 >>> 0] = b.getDate();
              w()[a + 16 >>> 2 >>> 0] = b.getMonth();
              w()[a + 20 >>> 2 >>> 0] = b.getYear();
              return BigInt(b.getTime() / 1e3);
            },
            Y: sc,
            Z: tc,
            N: function(a, b, c) {
              function d(r) {
                return (r = r.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? r[1] : "GMT";
              }
              a >>>= 0;
              b >>>= 0;
              c >>>= 0;
              var e = (/* @__PURE__ */ new Date()).getFullYear(), f = new Date(e, 0, 1), k = new Date(e, 6, 1);
              e = f.getTimezoneOffset();
              var l = k.getTimezoneOffset(), q = Math.max(e, l);
              z()[a >>> 2 >>> 0] = 60 * q;
              w()[b >>> 2 >>> 0] = Number(e != l);
              a = d(f);
              b = d(k);
              a = vc(a);
              b = vc(b);
              l < e ? (z()[c >>> 2 >>> 0] = a, z()[c + 4 >>> 2 >>> 0] = b) : (z()[c >>> 2 >>> 0] = b, z()[c + 4 >>> 2 >>> 0] = a);
            },
            n: () => {
              H("");
            },
            E: () => {
            },
            G: () => Date.now(),
            la: () => {
              Fa += 1;
              throw "unwind";
            },
            P: function() {
              return 4294901760;
            },
            s: () => performance.timeOrigin + performance.now(),
            w: () => D ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency,
            M: function(a) {
              a >>>= 0;
              var b = t().length;
              if (a <= b || 4294901760 < a)
                return false;
              for (var c = 1; 4 >= c; c *= 2) {
                var d = b * (1 + 0.2 / c);
                d = Math.min(d, a + 100663296);
                var e = Math;
                d = Math.max(a, d);
                a: {
                  e = (e.min.call(e, 4294901760, d + (65536 - d % 65536) % 65536) - m.buffer.byteLength + 65535) / 65536;
                  try {
                    m.grow(e);
                    p();
                    var f = 1;
                    break a;
                  } catch (k) {
                  }
                  f = void 0;
                }
                if (f)
                  return true;
              }
              return false;
            },
            fa: zc,
            ga: Ac,
            V: Wa,
            z: Bc,
            C: Cc,
            ca: Dc,
            B: Fc,
            a: m || A.wasmMemory,
            oa: Kc,
            p: function(a, b, c, d) {
              return Kc(a >>> 0, b >>> 0, c >>> 0, d >>> 0);
            }
          }, Z = function() {
            var a = { a: Pc };
            K++;
            Na(a, function(b) {
              var c = b.module;
              Z = b.instance.exports;
              Z = Qc();
              O.Eb.push(Z.Xa);
              eb = Z._a;
              Da.unshift(Z.sa);
              xa = c;
              Ia();
            }).catch(ka);
            return {};
          }();
          A._OrtInit = (a, b) => (A._OrtInit = Z.ta)(a, b);
          A._OrtGetLastError = (a, b) => (A._OrtGetLastError = Z.ua)(a, b);
          A._OrtCreateSessionOptions = (a, b, c, d, e, f, k, l, q, r) => (A._OrtCreateSessionOptions = Z.va)(a, b, c, d, e, f, k, l, q, r);
          A._OrtAppendExecutionProvider = (a, b) => (A._OrtAppendExecutionProvider = Z.wa)(a, b);
          A._OrtAddFreeDimensionOverride = (a, b, c) => (A._OrtAddFreeDimensionOverride = Z.xa)(a, b, c);
          A._OrtAddSessionConfigEntry = (a, b, c) => (A._OrtAddSessionConfigEntry = Z.ya)(a, b, c);
          A._OrtReleaseSessionOptions = (a) => (A._OrtReleaseSessionOptions = Z.za)(a);
          A._OrtCreateSession = (a, b, c) => (A._OrtCreateSession = Z.Aa)(a, b, c);
          A._OrtReleaseSession = (a) => (A._OrtReleaseSession = Z.Ba)(a);
          A._OrtGetInputOutputCount = (a, b, c) => (A._OrtGetInputOutputCount = Z.Ca)(a, b, c);
          A._OrtGetInputName = (a, b) => (A._OrtGetInputName = Z.Da)(a, b);
          A._OrtGetOutputName = (a, b) => (A._OrtGetOutputName = Z.Ea)(a, b);
          A._OrtFree = (a) => (A._OrtFree = Z.Fa)(a);
          A._OrtCreateTensor = (a, b, c, d, e, f) => (A._OrtCreateTensor = Z.Ga)(a, b, c, d, e, f);
          A._OrtGetTensorData = (a, b, c, d, e) => (A._OrtGetTensorData = Z.Ha)(a, b, c, d, e);
          A._OrtReleaseTensor = (a) => (A._OrtReleaseTensor = Z.Ia)(a);
          A._OrtCreateRunOptions = (a, b, c, d) => (A._OrtCreateRunOptions = Z.Ja)(a, b, c, d);
          A._OrtAddRunConfigEntry = (a, b, c) => (A._OrtAddRunConfigEntry = Z.Ka)(a, b, c);
          A._OrtReleaseRunOptions = (a) => (A._OrtReleaseRunOptions = Z.La)(a);
          A._OrtCreateBinding = (a) => (A._OrtCreateBinding = Z.Ma)(a);
          A._OrtBindInput = (a, b, c) => (A._OrtBindInput = Z.Na)(a, b, c);
          A._OrtBindOutput = (a, b, c, d) => (A._OrtBindOutput = Z.Oa)(a, b, c, d);
          A._OrtClearBoundOutputs = (a) => (A._OrtClearBoundOutputs = Z.Pa)(a);
          A._OrtReleaseBinding = (a) => (A._OrtReleaseBinding = Z.Qa)(a);
          A._OrtRunWithBinding = (a, b, c, d, e) => (A._OrtRunWithBinding = Z.Ra)(a, b, c, d, e);
          A._OrtRun = (a, b, c, d, e, f, k, l) => (A._OrtRun = Z.Sa)(a, b, c, d, e, f, k, l);
          A._OrtEndProfiling = (a) => (A._OrtEndProfiling = Z.Ta)(a);
          var Za = A._pthread_self = () => (Za = A._pthread_self = Z.Ua)(), uc = A._malloc = (a) => (uc = A._malloc = Z.Va)(a), X = A._free = (a) => (X = A._free = Z.Wa)(a);
          A.__emscripten_tls_init = () => (A.__emscripten_tls_init = Z.Xa)();
          var bc = (a) => (bc = Z.Ya)(a);
          A.__embind_initialize_bindings = () => (A.__embind_initialize_bindings = Z.Za)();
          var Oc = A.__emscripten_thread_init = (a, b, c, d, e, f) => (Oc = A.__emscripten_thread_init = Z.$a)(a, b, c, d, e, f);
          A.__emscripten_thread_crashed = () => (A.__emscripten_thread_crashed = Z.ab)();
          var $b = (a, b, c, d) => ($b = Z.bb)(a, b, c, d), Ya = (a) => (Ya = Z.cb)(a), fb = A.__emscripten_thread_exit = (a) => (fb = A.__emscripten_thread_exit = Z.db)(a), Wb = A.__emscripten_check_mailbox = () => (Wb = A.__emscripten_check_mailbox = Z.eb)(), bb = (a, b) => (bb = Z.fb)(a, b), Xb = () => (Xb = Z.gb)(), cb = (a) => (cb = Z.hb)(a), Zb = (a) => (Zb = Z.ib)(a);
          function Qc() {
            var a = Z;
            a = Object.assign({}, a);
            var b = (d) => () => d() >>> 0, c = (d) => (e) => d(e) >>> 0;
            a.__errno_location = b(a.__errno_location);
            a.Ua = b(a.Ua);
            a.Va = c(a.Va);
            a.Ya = c(a.Ya);
            a.gb = b(a.gb);
            a.ib = c(a.ib);
            return a;
          }
          A.keepRuntimeAlive = Ga;
          A.wasmMemory = m;
          A.stackAlloc = Zb;
          A.stackSave = Xb;
          A.stackRestore = cb;
          A.UTF8ToString = Ta;
          A.stringToUTF8 = pb;
          A.lengthBytesUTF8 = nb;
          A.ExitStatus = Oa;
          A.PThread = O;
          var Rc;
          L = function Sc() {
            Rc || Tc();
            Rc || (L = Sc);
          };
          function Tc() {
            0 < K || (E ? (ja(A), E || ab(Da), startWorker(A)) : (ab(Ca), 0 < K || Rc || (Rc = true, A.calledRun = true, ya || (E || ab(Da), ja(A), E || ab(Ea)))));
          }
          Tc();
          return moduleArg.ready;
        };
      })();
      if (typeof exports === "object" && typeof module === "object")
        module.exports = ortWasmThreaded;
      else if (typeof define === "function" && define["amd"])
        define([], () => ortWasmThreaded);
    }
  });

  // web/lib/wasm/binding/ort-wasm-threaded.worker.js
  var require_ort_wasm_threaded_worker = __commonJS({
    "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module) {
      module.exports = '"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>(0,eval)(fs.readFileSync(f,"utf8")+"//# sourceURL="+f),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*is_main=*/0,/*is_runtime=*/0,/*can_block=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){Module["__embind_initialize_bindings"]();initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err(`worker.js received unknown command ${e.data.cmd}`);err(e.data)}}catch(ex){if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}}self.onmessage=handleMessage;\n';
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
  var getSessionInputOutputCount, initOrt, initRuntime, activeSessions, createSessionAllocate, createSessionFinalize, createSession, releaseSession, prepareInputOutputTensor, run, endProfiling, extractTransferableBuffers;
  var init_wasm_core_impl = __esm({
    "web/lib/wasm/wasm-core-impl.ts"() {
      "use strict";
      init_run_options();
      init_session_options();
      init_wasm_common();
      init_wasm_factory();
      init_wasm_utils();
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
      };
      activeSessions = /* @__PURE__ */ new Map();
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
    "proxy-worker:./proxy-worker/main"(exports, module) {
      module.exports = '/*!\n * ONNX Runtime Web v1.17.0\n * Copyright (c) Microsoft Corporation. All rights reserved.\n * Licensed under the MIT License.\n */\n"use strict";\n(() => {\n  var __defProp = Object.defineProperty;\n  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n  var __getOwnPropNames = Object.getOwnPropertyNames;\n  var __hasOwnProp = Object.prototype.hasOwnProperty;\n  var __esm = (fn, res) => function __init() {\n    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;\n  };\n  var __commonJS = (cb, mod) => function __require() {\n    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;\n  };\n  var __export = (target, all) => {\n    for (var name in all)\n      __defProp(target, name, { get: all[name], enumerable: true });\n  };\n  var __copyProps = (to, from, except, desc) => {\n    if (from && typeof from === "object" || typeof from === "function") {\n      for (let key of __getOwnPropNames(from))\n        if (!__hasOwnProp.call(to, key) && key !== except)\n          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });\n    }\n    return to;\n  };\n  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);\n\n  // nodejs-ignore:fs\n  var fs_exports = {};\n  __export(fs_exports, {\n    readFile: () => readFile\n  });\n  var readFile;\n  var init_fs = __esm({\n    "nodejs-ignore:fs"() {\n      readFile = void 0;\n    }\n  });\n\n  // nodejs-ignore:path\n  var path_exports = {};\n  __export(path_exports, {\n    join: () => join2\n  });\n  var join2;\n  var init_path = __esm({\n    "nodejs-ignore:path"() {\n      join2 = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-training-wasm-simd.js\n  var require_ort_training_wasm_simd = __commonJS({\n    "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module) {\n      "use strict";\n      var ortWasm = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          var d = moduleArg, k, l;\n          d.ready = new Promise((a, b) => {\n            k = a;\n            l = b;\n          });\n          var r = Object.assign({}, d), v = "./this.program", aa = "object" == typeof window, x = "function" == typeof importScripts, ba = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, y = "", A, B, C;\n          if (ba) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), D = (init_path(), __toCommonJS(path_exports));\n            y = x ? D.dirname(y) + "/" : __dirname + "/";\n            A = (a, b) => {\n              a = a.startsWith("file://") ? new URL(a) : D.normalize(a);\n              return fs.readFileSync(a, b ? void 0 : "utf8");\n            };\n            C = (a) => {\n              a = A(a, true);\n              a.buffer || (a = new Uint8Array(a));\n              return a;\n            };\n            B = (a, b, c, f = true) => {\n              a = a.startsWith("file://") ? new URL(a) : D.normalize(a);\n              fs.readFile(a, f ? void 0 : "utf8", (g, h) => {\n                g ? c(g) : b(f ? h.buffer : h);\n              });\n            };\n            !d.thisProgram && 1 < process.argv.length && (v = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            d.inspect = () => "[Emscripten Module object]";\n          } else if (aa || x)\n            x ? y = self.location.href : "undefined" != typeof document && document.currentScript && (y = document.currentScript.src), _scriptDir && (y = _scriptDir), 0 !== y.indexOf("blob:") ? y = y.substr(0, y.replace(/[?#].*/, "").lastIndexOf("/") + 1) : y = "", A = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, x && (C = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), B = (a, b, c) => {\n              var f = new XMLHttpRequest();\n              f.open("GET", a, true);\n              f.responseType = "arraybuffer";\n              f.onload = () => {\n                200 == f.status || 0 == f.status && f.response ? b(f.response) : c();\n              };\n              f.onerror = c;\n              f.send(null);\n            };\n          var ca = d.print || console.log.bind(console), E = d.printErr || console.error.bind(console);\n          Object.assign(d, r);\n          r = null;\n          d.thisProgram && (v = d.thisProgram);\n          var F;\n          d.wasmBinary && (F = d.wasmBinary);\n          var noExitRuntime = d.noExitRuntime || true;\n          "object" != typeof WebAssembly && G("no native wasm support detected");\n          var H, I, da = false, J, K, L, M;\n          function ea() {\n            var a = H.buffer;\n            d.HEAP8 = J = new Int8Array(a);\n            d.HEAP16 = new Int16Array(a);\n            d.HEAP32 = L = new Int32Array(a);\n            d.HEAPU8 = K = new Uint8Array(a);\n            d.HEAPU16 = new Uint16Array(a);\n            d.HEAPU32 = M = new Uint32Array(a);\n            d.HEAPF32 = new Float32Array(a);\n            d.HEAPF64 = new Float64Array(a);\n          }\n          var fa = [], ha = [], ia = [];\n          function ja() {\n            var a = d.preRun.shift();\n            fa.unshift(a);\n          }\n          var N = 0, O = null, P = null;\n          function G(a) {\n            if (d.onAbort)\n              d.onAbort(a);\n            a = "Aborted(" + a + ")";\n            E(a);\n            da = true;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            l(a);\n            throw a;\n          }\n          function ka(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var Q;\n          Q = "ort-training-wasm-simd.wasm";\n          if (!ka(Q)) {\n            var la = Q;\n            Q = d.locateFile ? d.locateFile(la, y) : y + la;\n          }\n          function ma(a) {\n            if (a == Q && F)\n              return new Uint8Array(F);\n            if (C)\n              return C(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function na(a) {\n            if (!F && (aa || x)) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => ma(a));\n              if (B)\n                return new Promise((b, c) => {\n                  B(a, (f) => b(new Uint8Array(f)), c);\n                });\n            }\n            return Promise.resolve().then(() => ma(a));\n          }\n          function oa(a, b, c) {\n            return na(a).then((f) => WebAssembly.instantiate(f, b)).then((f) => f).then(c, (f) => {\n              E("failed to asynchronously prepare wasm: " + f);\n              G(f);\n            });\n          }\n          function pa(a, b) {\n            var c = Q;\n            return F || "function" != typeof WebAssembly.instantiateStreaming || ka(c) || c.startsWith("file://") || ba || "function" != typeof fetch ? oa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((f) => WebAssembly.instantiateStreaming(f, a).then(b, function(g) {\n              E("wasm streaming compile failed: " + g);\n              E("falling back to ArrayBuffer instantiation");\n              return oa(c, a, b);\n            }));\n          }\n          var R, S = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(d);\n          };\n          function qa(a) {\n            this.Ha = a - 24;\n            this.La = function(b) {\n              M[this.Ha + 4 >> 2 >>> 0] = b;\n            };\n            this.Ka = function(b) {\n              M[this.Ha + 8 >> 2 >>> 0] = b;\n            };\n            this.Ia = function(b, c) {\n              this.Ja();\n              this.La(b);\n              this.Ka(c);\n            };\n            this.Ja = function() {\n              M[this.Ha + 16 >> 2 >>> 0] = 0;\n            };\n          }\n          var ra = 0, sa = 0, ta = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, ua = (a, b, c) => {\n            b >>>= 0;\n            var f = b + c;\n            for (c = b; a[c] && !(c >= f); )\n              ++c;\n            if (16 < c - b && a.buffer && ta)\n              return ta.decode(a.subarray(b, c));\n            for (f = ""; b < c; ) {\n              var g = a[b++];\n              if (g & 128) {\n                var h = a[b++] & 63;\n                if (192 == (g & 224))\n                  f += String.fromCharCode((g & 31) << 6 | h);\n                else {\n                  var m = a[b++] & 63;\n                  g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | m : (g & 7) << 18 | h << 12 | m << 6 | a[b++] & 63;\n                  65536 > g ? f += String.fromCharCode(g) : (g -= 65536, f += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));\n                }\n              } else\n                f += String.fromCharCode(g);\n            }\n            return f;\n          }, T = (a, b) => (a >>>= 0) ? ua(K, a, b) : "", U = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var f = a.charCodeAt(c);\n              127 >= f ? b++ : 2047 >= f ? b += 2 : 55296 <= f && 57343 >= f ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, V = (a, b, c, f) => {\n            c >>>= 0;\n            if (!(0 < f))\n              return 0;\n            var g = c;\n            f = c + f - 1;\n            for (var h = 0; h < a.length; ++h) {\n              var m = a.charCodeAt(h);\n              if (55296 <= m && 57343 >= m) {\n                var q = a.charCodeAt(++h);\n                m = 65536 + ((m & 1023) << 10) | q & 1023;\n              }\n              if (127 >= m) {\n                if (c >= f)\n                  break;\n                b[c++ >>> 0] = m;\n              } else {\n                if (2047 >= m) {\n                  if (c + 1 >= f)\n                    break;\n                  b[c++ >>> 0] = 192 | m >> 6;\n                } else {\n                  if (65535 >= m) {\n                    if (c + 2 >= f)\n                      break;\n                    b[c++ >>> 0] = 224 | m >> 12;\n                  } else {\n                    if (c + 3 >= f)\n                      break;\n                    b[c++ >>> 0] = 240 | m >> 18;\n                    b[c++ >>> 0] = 128 | m >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | m >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | m & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - g;\n          }, W = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), va = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], wa = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Ba = (a) => {\n            var b = U(a) + 1, c = Aa(b);\n            c && V(a, K, c, b);\n            return c;\n          }, X = {}, Ca = () => {\n            if (!Y) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(\n                "-",\n                "_"\n              ) + ".UTF-8", _: v || "./this.program" }, b;\n              for (b in X)\n                void 0 === X[b] ? delete a[b] : a[b] = X[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              Y = c;\n            }\n            return Y;\n          }, Y, Da = [null, [], []], Ea = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Fa = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Ga(a) {\n            var b = Array(U(a) + 1);\n            V(a, b, 0, b.length);\n            return b;\n          }\n          function Ha(a, b, c, f) {\n            function g(e, n, p) {\n              for (e = "number" == typeof e ? e.toString() : e || ""; e.length < n; )\n                e = p[0] + e;\n              return e;\n            }\n            function h(e, n) {\n              return g(e, n, "0");\n            }\n            function m(e, n) {\n              function p(xa) {\n                return 0 > xa ? -1 : 0 < xa ? 1 : 0;\n              }\n              var z;\n              0 === (z = p(e.getFullYear() - n.getFullYear())) && 0 === (z = p(e.getMonth() - n.getMonth())) && (z = p(e.getDate() - n.getDate()));\n              return z;\n            }\n            function q(e) {\n              switch (e.getDay()) {\n                case 0:\n                  return new Date(e.getFullYear() - 1, 11, 29);\n                case 1:\n                  return e;\n                case 2:\n                  return new Date(e.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    e.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(e.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(e.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(e.getFullYear() - 1, 11, 30);\n              }\n            }\n            function w(e) {\n              var n = e.Ca;\n              for (e = new Date(new Date(e.Da + 1900, 0, 1).getTime()); 0 < n; ) {\n                var p = e.getMonth(), z = (W(e.getFullYear()) ? Ea : Fa)[p];\n                if (n > z - e.getDate())\n                  n -= z - e.getDate() + 1, e.setDate(1), 11 > p ? e.setMonth(p + 1) : (e.setMonth(0), e.setFullYear(e.getFullYear() + 1));\n                else {\n                  e.setDate(e.getDate() + n);\n                  break;\n                }\n              }\n              p = new Date(e.getFullYear() + 1, 0, 4);\n              n = q(new Date(\n                e.getFullYear(),\n                0,\n                4\n              ));\n              p = q(p);\n              return 0 >= m(n, e) ? 0 >= m(p, e) ? e.getFullYear() + 1 : e.getFullYear() : e.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            f >>>= 0;\n            var t = L[f + 40 >> 2 >>> 0];\n            f = { Oa: L[f >> 2 >>> 0], Na: L[f + 4 >> 2 >>> 0], Ea: L[f + 8 >> 2 >>> 0], Ga: L[f + 12 >> 2 >>> 0], Fa: L[f + 16 >> 2 >>> 0], Da: L[f + 20 >> 2 >>> 0], xa: L[f + 24 >> 2 >>> 0], Ca: L[f + 28 >> 2 >>> 0], Qa: L[f + 32 >> 2 >>> 0], Ma: L[f + 36 >> 2 >>> 0], Pa: t ? T(t) : "" };\n            c = T(c);\n            t = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var u in t)\n              c = c.replace(new RegExp(u, "g"), t[u]);\n            var ya = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), za = "January February March April May June July August September October November December".split(" ");\n            t = { "%a": (e) => ya[e.xa].substring(0, 3), "%A": (e) => ya[e.xa], "%b": (e) => za[e.Fa].substring(0, 3), "%B": (e) => za[e.Fa], "%C": (e) => h((e.Da + 1900) / 100 | 0, 2), "%d": (e) => h(e.Ga, 2), "%e": (e) => g(e.Ga, 2, " "), "%g": (e) => w(e).toString().substring(2), "%G": (e) => w(e), "%H": (e) => h(e.Ea, 2), "%I": (e) => {\n              e = e.Ea;\n              0 == e ? e = 12 : 12 < e && (e -= 12);\n              return h(e, 2);\n            }, "%j": (e) => {\n              for (var n = 0, p = 0; p <= e.Fa - 1; n += (W(e.Da + 1900) ? Ea : Fa)[p++])\n                ;\n              return h(e.Ga + n, 3);\n            }, "%m": (e) => h(e.Fa + 1, 2), "%M": (e) => h(e.Na, 2), "%n": () => "\\n", "%p": (e) => 0 <= e.Ea && 12 > e.Ea ? "AM" : "PM", "%S": (e) => h(e.Oa, 2), "%t": () => "	", "%u": (e) => e.xa || 7, "%U": (e) => h(Math.floor((e.Ca + 7 - e.xa) / 7), 2), "%V": (e) => {\n              var n = Math.floor((e.Ca + 7 - (e.xa + 6) % 7) / 7);\n              2 >= (e.xa + 371 - e.Ca - 2) % 7 && n++;\n              if (n)\n                53 == n && (p = (e.xa + 371 - e.Ca) % 7, 4 == p || 3 == p && W(e.Da) || (n = 1));\n              else {\n                n = 52;\n                var p = (e.xa + 7 - e.Ca - 1) % 7;\n                (4 == p || 5 == p && W(e.Da % 400 - 1)) && n++;\n              }\n              return h(n, 2);\n            }, "%w": (e) => e.xa, "%W": (e) => h(Math.floor((e.Ca + 7 - (e.xa + 6) % 7) / 7), 2), "%y": (e) => (e.Da + 1900).toString().substring(2), "%Y": (e) => e.Da + 1900, "%z": (e) => {\n              e = e.Ma;\n              var n = 0 <= e;\n              e = Math.abs(e) / 60;\n              return (n ? "+" : "-") + String("0000" + (e / 60 * 100 + e % 60)).slice(-4);\n            }, "%Z": (e) => e.Pa, "%%": () => "%" };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (u in t)\n              c.includes(u) && (c = c.replace(new RegExp(u, "g"), t[u](f)));\n            c = c.replace(/\\0\\0/g, "%");\n            u = Ga(c);\n            if (u.length > b)\n              return 0;\n            J.set(u, a >>> 0);\n            return u.length - 1;\n          }\n          var Ja = {\n            a: function(a, b, c) {\n              a >>>= 0;\n              new qa(a).Ia(b >>> 0, c >>> 0);\n              ra = a;\n              sa++;\n              throw ra;\n            },\n            e: function() {\n              return 0;\n            },\n            H: function() {\n            },\n            x: function() {\n            },\n            z: function() {\n            },\n            k: function() {\n              return 0;\n            },\n            F: function() {\n            },\n            B: function() {\n            },\n            E: function() {\n            },\n            g: function() {\n            },\n            y: function() {\n            },\n            v: function() {\n            },\n            G: function() {\n            },\n            w: function() {\n            },\n            l: () => true,\n            o: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              L[c >> 2 >>> 0] = a.getUTCSeconds();\n              L[c + 4 >> 2 >>> 0] = a.getUTCMinutes();\n              L[c + 8 >> 2 >>> 0] = a.getUTCHours();\n              L[c + 12 >> 2 >>> 0] = a.getUTCDate();\n              L[c + 16 >> 2 >>> 0] = a.getUTCMonth();\n              L[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              L[c + 24 >> 2 >>> 0] = a.getUTCDay();\n              L[c + 28 >> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n            },\n            p: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              L[c >> 2 >>> 0] = a.getSeconds();\n              L[c + 4 >> 2 >>> 0] = a.getMinutes();\n              L[c + 8 >> 2 >>> 0] = a.getHours();\n              L[c + 12 >> 2 >>> 0] = a.getDate();\n              L[c + 16 >> 2 >>> 0] = a.getMonth();\n              L[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;\n              L[c + 24 >> 2 >>> 0] = a.getDay();\n              L[c + 28 >> 2 >>> 0] = (W(a.getFullYear()) ? va : wa)[a.getMonth()] + a.getDate() - 1 | 0;\n              L[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var f = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              L[c + 32 >> 2 >>> 0] = (b != f && a.getTimezoneOffset() == Math.min(f, b)) | 0;\n            },\n            q: function(a) {\n              a >>>= 0;\n              var b = new Date(L[a + 20 >> 2 >>> 0] + 1900, L[a + 16 >> 2 >>> 0], L[a + 12 >> 2 >>> 0], L[a + 8 >> 2 >>> 0], L[a + 4 >> 2 >>> 0], L[a >> 2 >>> 0], 0), c = L[a + 32 >> 2 >>> 0], f = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), m = Math.min(h, g);\n              0 > c ? L[a + 32 >> 2 >>> 0] = Number(g != h && m == f) : 0 < c != (m == f) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? m : g) - f)));\n              L[a + 24 >> 2 >>> 0] = b.getDay();\n              L[a + 28 >> 2 >>> 0] = (W(b.getFullYear()) ? va : wa)[b.getMonth()] + b.getDate() - 1 | 0;\n              L[a >> 2 >>> 0] = b.getSeconds();\n              L[a + 4 >> 2 >>> 0] = b.getMinutes();\n              L[a + 8 >> 2 >>> 0] = b.getHours();\n              L[a + 12 >> 2 >>> 0] = b.getDate();\n              L[a + 16 >> 2 >>> 0] = b.getMonth();\n              L[a + 20 >> 2 >>> 0] = b.getYear();\n              a = b.getTime() / 1e3;\n              return Ia((R = a, 1 <= +Math.abs(R) ? 0 < R ? +Math.floor(R / 4294967296) >>> 0 : ~~+Math.ceil((R - +(~~R >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;\n            },\n            m: function() {\n              return -52;\n            },\n            n: function() {\n            },\n            t: function(a, b, c) {\n              function f(w) {\n                return (w = w.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? w[1] : "GMT";\n              }\n              c >>>= 0;\n              var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), m = new Date(g, 6, 1);\n              g = h.getTimezoneOffset();\n              var q = m.getTimezoneOffset();\n              M[a >>> 0 >> 2 >>> 0] = 60 * Math.max(g, q);\n              L[b >>> 0 >> 2 >>> 0] = Number(g != q);\n              a = f(h);\n              b = f(m);\n              a = Ba(a);\n              b = Ba(b);\n              q < g ? (M[c >> 2 >>> 0] = a, M[c + 4 >> 2 >>> 0] = b) : (M[c >> 2 >>> 0] = b, M[c + 4 >> 2 >>> 0] = a);\n            },\n            d: () => {\n              G("");\n            },\n            h: function() {\n              return Date.now();\n            },\n            u: function() {\n              return 4294901760;\n            },\n            b: () => performance.now(),\n            I: function(a, b, c) {\n              b >>>= 0;\n              return K.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);\n            },\n            s: function(a) {\n              a >>>= 0;\n              var b = K.length;\n              if (4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var f = b * (1 + 0.2 / c);\n                f = Math.min(f, a + 100663296);\n                var g = Math;\n                f = Math.max(a, f);\n                a: {\n                  g = g.min.call(g, 4294901760, f + (65536 - f % 65536) % 65536) - H.buffer.byteLength + 65535 >>> 16;\n                  try {\n                    H.grow(g);\n                    ea();\n                    var h = 1;\n                    break a;\n                  } catch (m) {\n                  }\n                  h = void 0;\n                }\n                if (h)\n                  return true;\n              }\n              return false;\n            },\n            C: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = 0;\n              Ca().forEach(function(f, g) {\n                var h = b + c;\n                g = M[a + 4 * g >> 2 >>> 0] = h;\n                for (h = 0; h < f.length; ++h)\n                  J[g++ >> 0 >>> 0] = f.charCodeAt(h);\n                J[g >> 0 >>> 0] = 0;\n                c += f.length + 1;\n              });\n              return 0;\n            },\n            D: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = Ca();\n              M[a >> 2 >>> 0] = c.length;\n              var f = 0;\n              c.forEach(function(g) {\n                f += g.length + 1;\n              });\n              M[b >> 2 >>> 0] = f;\n              return 0;\n            },\n            f: () => 52,\n            j: function() {\n              return 52;\n            },\n            r: function() {\n              return 70;\n            },\n            i: function(a, b, c, f) {\n              b >>>= 0;\n              c >>>= 0;\n              f >>>= 0;\n              for (var g = 0, h = 0; h < c; h++) {\n                var m = M[b >> 2 >>> 0], q = M[b + 4 >> 2 >>> 0];\n                b += 8;\n                for (var w = 0; w < q; w++) {\n                  var t = K[m + w >>> 0], u = Da[a];\n                  0 === t || 10 === t ? ((1 === a ? ca : E)(ua(u, 0)), u.length = 0) : u.push(t);\n                }\n                g += q;\n              }\n              M[f >> 2 >>> 0] = g;\n              return 0;\n            },\n            A: Ha,\n            c: function(a, b, c, f) {\n              return Ha(a >>> 0, b >>> 0, c >>> 0, f >>> 0);\n            }\n          };\n          (function() {\n            function a(c) {\n              c = c.exports;\n              I = c = Ka(c);\n              H = I.J;\n              ea();\n              ha.unshift(I.K);\n              N--;\n              d.monitorRunDependencies && d.monitorRunDependencies(N);\n              if (0 == N && (null !== O && (clearInterval(O), O = null), P)) {\n                var f = P;\n                P = null;\n                f();\n              }\n              return c;\n            }\n            var b = { a: Ja };\n            N++;\n            d.monitorRunDependencies && d.monitorRunDependencies(N);\n            if (d.instantiateWasm)\n              try {\n                return d.instantiateWasm(b, a);\n              } catch (c) {\n                E("Module.instantiateWasm callback failed with error: " + c), l(c);\n              }\n            pa(b, function(c) {\n              a(c.instance);\n            }).catch(l);\n            return {};\n          })();\n          d._OrtInit = (a, b) => (d._OrtInit = I.L)(a, b);\n          d._OrtGetLastError = (a, b) => (d._OrtGetLastError = I.M)(a, b);\n          d._OrtCreateSessionOptions = (a, b, c, f, g, h, m, q, w, t) => (d._OrtCreateSessionOptions = I.N)(a, b, c, f, g, h, m, q, w, t);\n          d._OrtAppendExecutionProvider = (a, b) => (d._OrtAppendExecutionProvider = I.O)(a, b);\n          d._OrtAddFreeDimensionOverride = (a, b, c) => (d._OrtAddFreeDimensionOverride = I.P)(a, b, c);\n          d._OrtAddSessionConfigEntry = (a, b, c) => (d._OrtAddSessionConfigEntry = I.Q)(a, b, c);\n          d._OrtReleaseSessionOptions = (a) => (d._OrtReleaseSessionOptions = I.R)(a);\n          d._OrtCreateSession = (a, b, c) => (d._OrtCreateSession = I.S)(a, b, c);\n          d._OrtReleaseSession = (a) => (d._OrtReleaseSession = I.T)(a);\n          d._OrtGetInputOutputCount = (a, b, c) => (d._OrtGetInputOutputCount = I.U)(a, b, c);\n          d._OrtGetInputName = (a, b) => (d._OrtGetInputName = I.V)(a, b);\n          d._OrtGetOutputName = (a, b) => (d._OrtGetOutputName = I.W)(a, b);\n          d._OrtFree = (a) => (d._OrtFree = I.X)(a);\n          d._OrtCreateTensor = (a, b, c, f, g, h) => (d._OrtCreateTensor = I.Y)(a, b, c, f, g, h);\n          d._OrtGetTensorData = (a, b, c, f, g) => (d._OrtGetTensorData = I.Z)(a, b, c, f, g);\n          d._OrtReleaseTensor = (a) => (d._OrtReleaseTensor = I._)(a);\n          d._OrtCreateRunOptions = (a, b, c, f) => (d._OrtCreateRunOptions = I.$)(a, b, c, f);\n          d._OrtAddRunConfigEntry = (a, b, c) => (d._OrtAddRunConfigEntry = I.aa)(a, b, c);\n          d._OrtReleaseRunOptions = (a) => (d._OrtReleaseRunOptions = I.ba)(a);\n          d._OrtCreateBinding = (a) => (d._OrtCreateBinding = I.ca)(a);\n          d._OrtBindInput = (a, b, c) => (d._OrtBindInput = I.da)(a, b, c);\n          d._OrtBindOutput = (a, b, c, f) => (d._OrtBindOutput = I.ea)(a, b, c, f);\n          d._OrtClearBoundOutputs = (a) => (d._OrtClearBoundOutputs = I.fa)(a);\n          d._OrtReleaseBinding = (a) => (d._OrtReleaseBinding = I.ga)(a);\n          d._OrtRunWithBinding = (a, b, c, f, g) => (d._OrtRunWithBinding = I.ha)(a, b, c, f, g);\n          d._OrtRun = (a, b, c, f, g, h, m, q) => (d._OrtRun = I.ia)(a, b, c, f, g, h, m, q);\n          d._OrtEndProfiling = (a) => (d._OrtEndProfiling = I.ja)(a);\n          d._OrtTrainingLoadCheckpoint = (a, b) => (d._OrtTrainingLoadCheckpoint = I.ka)(a, b);\n          d._OrtTrainingReleaseCheckpoint = (a) => (d._OrtTrainingReleaseCheckpoint = I.la)(a);\n          d._OrtTrainingCreateSession = (a, b, c, f, g, h, m, q) => (d._OrtTrainingCreateSession = I.ma)(a, b, c, f, g, h, m, q);\n          d._OrtTrainingLazyResetGrad = (a) => (d._OrtTrainingLazyResetGrad = I.na)(a);\n          d._OrtTrainingRunTrainStep = (a, b, c, f, g, h) => (d._OrtTrainingRunTrainStep = I.oa)(a, b, c, f, g, h);\n          d._OrtTrainingOptimizerStep = (a, b) => (d._OrtTrainingOptimizerStep = I.pa)(a, b);\n          d._OrtTrainingEvalStep = (a, b, c, f, g, h) => (d._OrtTrainingEvalStep = I.qa)(a, b, c, f, g, h);\n          d._OrtTrainingGetParametersSize = (a, b, c) => (d._OrtTrainingGetParametersSize = I.ra)(a, b, c);\n          d._OrtTrainingCopyParametersToBuffer = (a, b, c, f) => (d._OrtTrainingCopyParametersToBuffer = I.sa)(a, b, c, f);\n          d._OrtTrainingCopyParametersFromBuffer = (a, b, c, f) => (d._OrtTrainingCopyParametersFromBuffer = I.ta)(a, b, c, f);\n          d._OrtTrainingReleaseSession = (a) => (d._OrtTrainingReleaseSession = I.ua)(a);\n          var Aa = d._malloc = (a) => (Aa = d._malloc = I.va)(a);\n          d._free = (a) => (d._free = I.wa)(a);\n          var Ia = (a) => (Ia = I.ya)(a), La = () => (La = I.za)(), Ma = (a) => (Ma = I.Aa)(a), Na = (a) => (Na = I.Ba)(a);\n          function Ka(a) {\n            a = Object.assign({}, a);\n            var b = (f) => () => f() >>> 0, c = (f) => (g) => f(g) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.malloc = c(a.malloc);\n            a.stackSave = b(a.stackSave);\n            a.stackAlloc = c(a.stackAlloc);\n            return a;\n          }\n          d.stackAlloc = Na;\n          d.stackSave = La;\n          d.stackRestore = Ma;\n          d.UTF8ToString = T;\n          d.stringToUTF8 = (a, b, c) => V(a, K, b, c);\n          d.lengthBytesUTF8 = U;\n          var Z;\n          P = function Oa() {\n            Z || Pa();\n            Z || (P = Oa);\n          };\n          function Pa() {\n            function a() {\n              if (!Z && (Z = true, d.calledRun = true, !da)) {\n                S(ha);\n                k(d);\n                if (d.onRuntimeInitialized)\n                  d.onRuntimeInitialized();\n                if (d.postRun)\n                  for ("function" == typeof d.postRun && (d.postRun = [d.postRun]); d.postRun.length; ) {\n                    var b = d.postRun.shift();\n                    ia.unshift(b);\n                  }\n                S(ia);\n              }\n            }\n            if (!(0 < N)) {\n              if (d.preRun)\n                for ("function" == typeof d.preRun && (d.preRun = [d.preRun]); d.preRun.length; )\n                  ja();\n              S(fa);\n              0 < N || (d.setStatus ? (d.setStatus("Running..."), setTimeout(function() {\n                setTimeout(function() {\n                  d.setStatus("");\n                }, 1);\n                a();\n              }, 1)) : a());\n            }\n          }\n          if (d.preInit)\n            for ("function" == typeof d.preInit && (d.preInit = [d.preInit]); 0 < d.preInit.length; )\n              d.preInit.pop()();\n          Pa();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasm;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasm);\n    }\n  });\n\n  // nodejs-ignore:worker_threads\n  var require_worker_threads = __commonJS({\n    "nodejs-ignore:worker_threads"() {\n    }\n  });\n\n  // nodejs-ignore:perf_hooks\n  var require_perf_hooks = __commonJS({\n    "nodejs-ignore:perf_hooks"() {\n    }\n  });\n\n  // nodejs-ignore:os\n  var os_exports = {};\n  __export(os_exports, {\n    cpus: () => cpus\n  });\n  var cpus;\n  var init_os = __esm({\n    "nodejs-ignore:os"() {\n      cpus = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.js\n  var require_ort_wasm_threaded = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module) {\n      "use strict";\n      var ortWasmThreaded = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          function h() {\n            m.buffer != n.buffer && p();\n            return n;\n          }\n          function t() {\n            m.buffer != n.buffer && p();\n            return aa;\n          }\n          function v() {\n            m.buffer != n.buffer && p();\n            return ba;\n          }\n          function ca() {\n            m.buffer != n.buffer && p();\n            return da;\n          }\n          function w() {\n            m.buffer != n.buffer && p();\n            return ea;\n          }\n          function z() {\n            m.buffer != n.buffer && p();\n            return fa;\n          }\n          function ha() {\n            m.buffer != n.buffer && p();\n            return ia;\n          }\n          var A = moduleArg, ja, ka;\n          A.ready = new Promise((a, b) => {\n            ja = a;\n            ka = b;\n          });\n          var la = Object.assign({}, A), ma = "./this.program", na = (a, b) => {\n            throw b;\n          }, oa = "object" == typeof window, B = "function" == typeof importScripts, D = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, E = A.ENVIRONMENT_IS_PTHREAD || false, F = "";\n          function pa(a) {\n            return A.locateFile ? A.locateFile(a, F) : F + a;\n          }\n          var qa, ra, sa;\n          if (D) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), ta = (init_path(), __toCommonJS(path_exports));\n            F = B ? ta.dirname(F) + "/" : __dirname + "/";\n            qa = (b, c) => {\n              b = b.startsWith("file://") ? new URL(b) : ta.normalize(b);\n              return fs.readFileSync(b, c ? void 0 : "utf8");\n            };\n            sa = (b) => {\n              b = qa(b, true);\n              b.buffer || (b = new Uint8Array(b));\n              return b;\n            };\n            ra = (b, c, d, e = true) => {\n              b = b.startsWith("file://") ? new URL(b) : ta.normalize(b);\n              fs.readFile(b, e ? void 0 : "utf8", (f, k) => {\n                f ? d(f) : c(e ? k.buffer : k);\n              });\n            };\n            !A.thisProgram && 1 < process.argv.length && (ma = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            na = (b, c) => {\n              process.exitCode = b;\n              throw c;\n            };\n            A.inspect = () => "[Emscripten Module object]";\n            let a;\n            try {\n              a = require_worker_threads();\n            } catch (b) {\n              throw console.error(\'The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?\'), b;\n            }\n            global.Worker = a.Worker;\n          } else if (oa || B)\n            B ? F = self.location.href : "undefined" != typeof document && document.currentScript && (F = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (F = _scriptDir), 0 !== F.indexOf("blob:") ? F = F.substr(0, F.replace(/[?#].*/, "").lastIndexOf("/") + 1) : F = "", D || (qa = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, B && (sa = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), ra = (a, b, c) => {\n              var d = new XMLHttpRequest();\n              d.open("GET", a, true);\n              d.responseType = "arraybuffer";\n              d.onload = () => {\n                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();\n              };\n              d.onerror = c;\n              d.send(null);\n            });\n          D && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);\n          var ua = console.log.bind(console), va = console.error.bind(console);\n          D && (ua = (...a) => fs.writeSync(1, a.join(" ") + "\\n"), va = (...a) => fs.writeSync(2, a.join(" ") + "\\n"));\n          var wa = ua, G = va;\n          Object.assign(A, la);\n          la = null;\n          var noExitRuntime = true;\n          "object" != typeof WebAssembly && H("no native wasm support detected");\n          var m, xa, ya = false, I, n, aa, ba, da, ea, fa, za, J, Aa, ia;\n          function p() {\n            var a = m.buffer;\n            A.HEAP8 = n = new Int8Array(a);\n            A.HEAP16 = ba = new Int16Array(a);\n            A.HEAPU8 = aa = new Uint8Array(a);\n            A.HEAPU16 = da = new Uint16Array(a);\n            A.HEAP32 = ea = new Int32Array(a);\n            A.HEAPU32 = fa = new Uint32Array(a);\n            A.HEAPF32 = za = new Float32Array(a);\n            A.HEAPF64 = ia = new Float64Array(a);\n            A.HEAP64 = J = new BigInt64Array(a);\n            A.HEAPU64 = Aa = new BigUint64Array(a);\n          }\n          var Ba = 16777216;\n          5242880 <= Ba || H("INITIAL_MEMORY should be larger than STACK_SIZE, was " + Ba + "! (STACK_SIZE=5242880)");\n          if (E)\n            m = A.wasmMemory;\n          else if (m = new WebAssembly.Memory({ initial: Ba / 65536, maximum: 65536, shared: true }), !(m.buffer instanceof SharedArrayBuffer))\n            throw G("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), D && G("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");\n          p();\n          Ba = m.buffer.byteLength;\n          var Ca = [], Da = [], Ea = [], Fa = 0;\n          function Ga() {\n            return noExitRuntime || 0 < Fa;\n          }\n          var K = 0, Ha = null, L = null;\n          function Ia() {\n            K--;\n            if (0 == K && (null !== Ha && (clearInterval(Ha), Ha = null), L)) {\n              var a = L;\n              L = null;\n              a();\n            }\n          }\n          function H(a) {\n            a = "Aborted(" + a + ")";\n            G(a);\n            ya = true;\n            I = 1;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            ka(a);\n            throw a;\n          }\n          function Ja(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var M;\n          M = "ort-wasm-threaded.wasm";\n          Ja(M) || (M = pa(M));\n          function Ka(a) {\n            if (sa)\n              return sa(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function La(a) {\n            if (oa || B) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => Ka(a));\n              if (ra)\n                return new Promise((b, c) => {\n                  ra(a, (d) => b(new Uint8Array(d)), c);\n                });\n            }\n            return Promise.resolve().then(() => Ka(a));\n          }\n          function Ma(a, b, c) {\n            return La(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {\n              G(`failed to asynchronously prepare wasm: ${d}`);\n              H(d);\n            });\n          }\n          function Na(a, b) {\n            var c = M;\n            return "function" != typeof WebAssembly.instantiateStreaming || Ja(c) || c.startsWith("file://") || D || "function" != typeof fetch ? Ma(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {\n              G(`wasm streaming compile failed: ${e}`);\n              G("falling back to ArrayBuffer instantiation");\n              return Ma(c, a, b);\n            }));\n          }\n          function Oa(a) {\n            this.name = "ExitStatus";\n            this.message = `Program terminated with exit(${a})`;\n            this.status = a;\n          }\n          var Pa = (a) => {\n            a.terminate();\n            a.onmessage = () => {\n            };\n          }, Qa = (a) => {\n            if (0 == O.qb.length) {\n              var b = pa("ort-wasm-threaded.worker.js");\n              b = new Worker(b);\n              O.qb.push(b);\n              O.Jb(O.qb[0]);\n            }\n            b = O.qb.pop();\n            if (!b)\n              return 6;\n            O.nb.push(b);\n            O.jb[a.mb] = b;\n            b.mb = a.mb;\n            var c = { cmd: "run", start_routine: a.Mb, arg: a.Fb, pthread_ptr: a.mb };\n            D && b.unref();\n            b.postMessage(c, a.Sb);\n            return 0;\n          }, Ra = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Sa = (a, b, c) => {\n            b >>>= 0;\n            var d = b + c;\n            for (c = b; a[c] && !(c >= d); )\n              ++c;\n            if (16 < c - b && a.buffer && Ra)\n              return Ra.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));\n            for (d = ""; b < c; ) {\n              var e = a[b++];\n              if (e & 128) {\n                var f = a[b++] & 63;\n                if (192 == (e & 224))\n                  d += String.fromCharCode((e & 31) << 6 | f);\n                else {\n                  var k = a[b++] & 63;\n                  e = 224 == (e & 240) ? (e & 15) << 12 | f << 6 | k : (e & 7) << 18 | f << 12 | k << 6 | a[b++] & 63;\n                  65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));\n                }\n              } else\n                d += String.fromCharCode(e);\n            }\n            return d;\n          }, Ta = (a, b) => (a >>>= 0) ? Sa(t(), a, b) : "";\n          function Ua(a) {\n            if (E)\n              return P(0, 1, a);\n            I = a;\n            Ga() || (O.Nb(), ya = true);\n            na(a, new Oa(a));\n          }\n          var Wa = (a) => {\n            I = a;\n            if (E)\n              throw Va(a), "unwind";\n            Ua(a);\n          };\n          function Xa() {\n            Ca.unshift(() => {\n              K++;\n              Ia();\n            });\n          }\n          var O = { qb: [], nb: [], Eb: [], jb: {}, vb() {\n            E ? (O.receiveObjectTransfer = O.Lb, O.threadInitTLS = O.Db, O.setExitStatus = O.Cb, noExitRuntime = false) : Xa();\n          }, Cb: (a) => {\n            I = a;\n          }, Vb: ["$terminateWorker"], Nb: () => {\n            for (var a of O.nb)\n              Pa(a);\n            for (a of O.qb)\n              Pa(a);\n            O.qb = [];\n            O.nb = [];\n            O.jb = [];\n          }, Bb: (a) => {\n            var b = a.mb;\n            delete O.jb[b];\n            O.qb.push(a);\n            O.nb.splice(O.nb.indexOf(a), 1);\n            a.mb = 0;\n            Ya(b);\n          }, Lb() {\n          }, Db() {\n            O.Eb.forEach((a) => a());\n          }, Jb: (a) => new Promise((b) => {\n            a.onmessage = (f) => {\n              f = f.data;\n              var k = f.cmd;\n              if (f.targetThread && f.targetThread != Za()) {\n                var l = O.jb[f.targetThread];\n                l ? l.postMessage(f, f.transferList) : G(`Internal error! Worker sent a message "${k}" to target pthread ${f.targetThread}, but that thread no longer exists!`);\n              } else if ("checkMailbox" === k)\n                $a();\n              else if ("spawnThread" === k)\n                Qa(f);\n              else if ("cleanupThread" === k)\n                (f = O.jb[f.thread]) || H(), O.Bb(f);\n              else if ("killThread" === k)\n                f = f.thread, k = O.jb[f], delete O.jb[f], Pa(k), Ya(f), O.nb.splice(O.nb.indexOf(k), 1), k.mb = 0;\n              else if ("cancelThread" === k)\n                O.jb[f.thread].postMessage({ cmd: "cancel" });\n              else if ("loaded" === k)\n                a.loaded = true, b(a);\n              else if ("alert" === k)\n                alert(`Thread ${f.threadId}: ${f.text}`);\n              else if ("setimmediate" === f.target)\n                a.postMessage(f);\n              else if ("callHandler" === k)\n                A[f.handler](...f.args);\n              else\n                k && G(`worker sent an unknown command ${k}`);\n            };\n            a.onerror = (f) => {\n              G(`${"worker sent an error!"} ${f.filename}:${f.lineno}: ${f.message}`);\n              throw f;\n            };\n            D && (a.on("message", (f) => a.onmessage({ data: f })), a.on("error", (f) => a.onerror(f)));\n            var c = [], d = [], e;\n            for (e of d)\n              A.hasOwnProperty(e) && c.push(e);\n            a.postMessage({\n              cmd: "load",\n              handlers: c,\n              urlOrBlob: A.mainScriptUrlOrBlob || _scriptDir,\n              wasmMemory: m,\n              wasmModule: xa\n            });\n          }) };\n          A.PThread = O;\n          var ab = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(A);\n          };\n          A.establishStackSpace = () => {\n            var a = Za(), b = z()[a + 52 >>> 2 >>> 0];\n            a = z()[a + 56 >>> 2 >>> 0];\n            bb(b, b - a);\n            cb(b);\n          };\n          function Va(a) {\n            if (E)\n              return P(1, 0, a);\n            Wa(a);\n          }\n          var db = [], eb;\n          A.invokeEntryPoint = (a, b) => {\n            var c = db[a];\n            c || (a >= db.length && (db.length = a + 1), db[a] = c = eb.get(a));\n            a = c(b);\n            Ga() ? O.Cb(a) : fb(a);\n          };\n          function gb(a) {\n            this.sb = a - 24;\n            this.Kb = function(b) {\n              z()[this.sb + 4 >>> 2 >>> 0] = b;\n            };\n            this.xb = function(b) {\n              z()[this.sb + 8 >>> 2 >>> 0] = b;\n            };\n            this.vb = function(b, c) {\n              this.wb();\n              this.Kb(b);\n              this.xb(c);\n            };\n            this.wb = function() {\n              z()[this.sb + 16 >>> 2 >>> 0] = 0;\n            };\n          }\n          var hb = 0, ib = 0;\n          function jb(a, b, c, d) {\n            return E ? P(2, 1, a, b, c, d) : kb(a, b, c, d);\n          }\n          function kb(a, b, c, d) {\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            if ("undefined" == typeof SharedArrayBuffer)\n              return G("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;\n            var e = [];\n            if (E && 0 === e.length)\n              return jb(a, b, c, d);\n            a = { Mb: c, mb: a, Fb: d, Sb: e };\n            return E ? (a.Ub = "spawnThread", postMessage(a, e), 0) : Qa(a);\n          }\n          function lb(a, b, c) {\n            return E ? P(3, 1, a, b, c) : 0;\n          }\n          function mb(a, b) {\n            if (E)\n              return P(4, 1, a, b);\n          }\n          var nb = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, ob = (a, b, c, d) => {\n            c >>>= 0;\n            if (!(0 < d))\n              return 0;\n            var e = c;\n            d = c + d - 1;\n            for (var f = 0; f < a.length; ++f) {\n              var k = a.charCodeAt(f);\n              if (55296 <= k && 57343 >= k) {\n                var l = a.charCodeAt(++f);\n                k = 65536 + ((k & 1023) << 10) | l & 1023;\n              }\n              if (127 >= k) {\n                if (c >= d)\n                  break;\n                b[c++ >>> 0] = k;\n              } else {\n                if (2047 >= k) {\n                  if (c + 1 >= d)\n                    break;\n                  b[c++ >>> 0] = 192 | k >> 6;\n                } else {\n                  if (65535 >= k) {\n                    if (c + 2 >= d)\n                      break;\n                    b[c++ >>> 0] = 224 | k >> 12;\n                  } else {\n                    if (c + 3 >= d)\n                      break;\n                    b[c++ >>> 0] = 240 | k >> 18;\n                    b[c++ >>> 0] = 128 | k >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | k >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | k & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - e;\n          }, pb = (a, b, c) => ob(a, t(), b, c);\n          function qb(a, b) {\n            if (E)\n              return P(5, 1, a, b);\n          }\n          function rb(a, b, c) {\n            if (E)\n              return P(6, 1, a, b, c);\n          }\n          function sb(a, b, c) {\n            return E ? P(7, 1, a, b, c) : 0;\n          }\n          function tb(a, b) {\n            if (E)\n              return P(8, 1, a, b);\n          }\n          function ub(a, b, c) {\n            if (E)\n              return P(9, 1, a, b, c);\n          }\n          function vb(a, b, c, d) {\n            if (E)\n              return P(10, 1, a, b, c, d);\n          }\n          function wb(a, b, c, d) {\n            if (E)\n              return P(11, 1, a, b, c, d);\n          }\n          function xb(a, b, c, d) {\n            if (E)\n              return P(12, 1, a, b, c, d);\n          }\n          function yb(a) {\n            if (E)\n              return P(13, 1, a);\n          }\n          function zb(a, b) {\n            if (E)\n              return P(14, 1, a, b);\n          }\n          function Ab(a, b, c) {\n            if (E)\n              return P(15, 1, a, b, c);\n          }\n          var Bb = (a) => {\n            if (null === a)\n              return "null";\n            var b = typeof a;\n            return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;\n          }, Cb, R = (a) => {\n            for (var b = ""; t()[a >>> 0]; )\n              b += Cb[t()[a++ >>> 0]];\n            return b;\n          }, Db = {}, Eb = {}, Fb = {}, S;\n          function Gb(a, b, c = {}) {\n            var d = b.name;\n            if (!a)\n              throw new S(`type "${d}" must have a positive integer typeid pointer`);\n            if (Eb.hasOwnProperty(a)) {\n              if (c.Hb)\n                return;\n              throw new S(`Cannot register type \'${d}\' twice`);\n            }\n            Eb[a] = b;\n            delete Fb[a];\n            Db.hasOwnProperty(a) && (b = Db[a], delete Db[a], b.forEach((e) => e()));\n          }\n          function T(a, b, c = {}) {\n            if (!("argPackAdvance" in b))\n              throw new TypeError("registerType registeredInstance requires argPackAdvance");\n            Gb(a, b, c);\n          }\n          var Hb = (a, b, c) => {\n            switch (b) {\n              case 1:\n                return c ? (d) => h()[d >>> 0 >>> 0] : (d) => t()[d >>> 0 >>> 0];\n              case 2:\n                return c ? (d) => v()[d >>> 1 >>> 0] : (d) => ca()[d >>> 1 >>> 0];\n              case 4:\n                return c ? (d) => w()[d >>> 2 >>> 0] : (d) => z()[d >>> 2 >>> 0];\n              case 8:\n                return c ? (d) => J[d >>> 3] : (d) => Aa[d >>> 3];\n              default:\n                throw new TypeError(`invalid integer width (${b}): ${a}`);\n            }\n          };\n          function Ib() {\n            this.lb = [void 0];\n            this.zb = [];\n          }\n          var U = new Ib();\n          function Jb(a) {\n            a >>>= 0;\n            a >= U.sb && 0 === --U.get(a).Ab && U.xb(a);\n          }\n          var V = (a) => {\n            if (!a)\n              throw new S("Cannot use deleted val. handle = " + a);\n            return U.get(a).value;\n          }, W = (a) => {\n            switch (a) {\n              case void 0:\n                return 1;\n              case null:\n                return 2;\n              case true:\n                return 3;\n              case false:\n                return 4;\n              default:\n                return U.wb({ Ab: 1, value: a });\n            }\n          };\n          function Kb(a) {\n            return this.fromWireType(w()[a >>> 2 >>> 0]);\n          }\n          var Lb = (a, b) => {\n            switch (b) {\n              case 4:\n                return function(c) {\n                  var d = this.fromWireType;\n                  m.buffer != n.buffer && p();\n                  return d.call(this, za[c >>> 2 >>> 0]);\n                };\n              case 8:\n                return function(c) {\n                  return this.fromWireType(ha()[c >>> 3 >>> 0]);\n                };\n              default:\n                throw new TypeError(`invalid float width (${b}): ${a}`);\n            }\n          };\n          function Mb(a) {\n            return this.fromWireType(z()[a >>> 2 >>> 0]);\n          }\n          var Nb = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, Ob = (a, b) => {\n            var c = a >> 1;\n            for (var d = c + b / 2; !(c >= d) && ca()[c >>> 0]; )\n              ++c;\n            c <<= 1;\n            if (32 < c - a && Nb)\n              return Nb.decode(t().slice(a, c));\n            c = "";\n            for (d = 0; !(d >= b / 2); ++d) {\n              var e = v()[a + 2 * d >>> 1 >>> 0];\n              if (0 == e)\n                break;\n              c += String.fromCharCode(e);\n            }\n            return c;\n          }, Pb = (a, b, c) => {\n            void 0 === c && (c = 2147483647);\n            if (2 > c)\n              return 0;\n            c -= 2;\n            var d = b;\n            c = c < 2 * a.length ? c / 2 : a.length;\n            for (var e = 0; e < c; ++e) {\n              var f = a.charCodeAt(e);\n              v()[b >>> 1 >>> 0] = f;\n              b += 2;\n            }\n            v()[b >>> 1 >>> 0] = 0;\n            return b - d;\n          }, Qb = (a) => 2 * a.length, Rb = (a, b) => {\n            for (var c = 0, d = ""; !(c >= b / 4); ) {\n              var e = w()[a + 4 * c >>> 2 >>> 0];\n              if (0 == e)\n                break;\n              ++c;\n              65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);\n            }\n            return d;\n          }, Sb = (a, b, c) => {\n            b >>>= 0;\n            void 0 === c && (c = 2147483647);\n            if (4 > c)\n              return 0;\n            var d = b;\n            c = d + c - 4;\n            for (var e = 0; e < a.length; ++e) {\n              var f = a.charCodeAt(e);\n              if (55296 <= f && 57343 >= f) {\n                var k = a.charCodeAt(++e);\n                f = 65536 + ((f & 1023) << 10) | k & 1023;\n              }\n              w()[b >>> 2 >>> 0] = f;\n              b += 4;\n              if (b + 4 > c)\n                break;\n            }\n            w()[b >>> 2 >>> 0] = 0;\n            return b - d;\n          }, Tb = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              55296 <= d && 57343 >= d && ++c;\n              b += 4;\n            }\n            return b;\n          }, Ub = (a) => {\n            if (!ya)\n              try {\n                if (a(), !Ga())\n                  try {\n                    E ? fb(I) : Wa(I);\n                  } catch (b) {\n                    b instanceof Oa || "unwind" == b || na(1, b);\n                  }\n              } catch (b) {\n                b instanceof Oa || "unwind" == b || na(1, b);\n              }\n          };\n          function Vb(a) {\n            a >>>= 0;\n            "function" === typeof Atomics.Tb && (Atomics.Tb(w(), a >>> 2, a).value.then($a), a += 128, Atomics.store(w(), a >>> 2, 1));\n          }\n          A.__emscripten_thread_mailbox_await = Vb;\n          var $a = () => {\n            var a = Za();\n            a && (Vb(a), Ub(() => Wb()));\n          };\n          A.checkMailbox = $a;\n          var Yb = (a) => {\n            var b = Xb();\n            a = a();\n            cb(b);\n            return a;\n          };\n          function P(a, b) {\n            var c = arguments.length - 2, d = arguments;\n            return Yb(() => {\n              for (var e = 2 * c, f = Zb(8 * e), k = f >>> 3, l = 0; l < c; l++) {\n                var q = d[2 + l];\n                "bigint" == typeof q ? (J[k + 2 * l] = 1n, J[k + 2 * l + 1] = q) : (J[k + 2 * l] = 0n, ha()[k + 2 * l + 1 >>> 0] = q);\n              }\n              return $b(a, e, f, b);\n            });\n          }\n          var ac = [], cc = (a, b) => {\n            var c = Eb[a];\n            if (void 0 === c)\n              throw a = bc(a), c = R(a), X(a), new S(b + " has unknown type " + c);\n            return c;\n          }, dc = {}, ec = (a) => {\n            var b = dc[a];\n            return void 0 === b ? R(a) : b;\n          }, fc = [], gc = () => "object" == typeof globalThis ? globalThis : Function("return this")(), hc = (a) => {\n            var b = fc.length;\n            fc.push(a);\n            return b;\n          }, ic = (a, b) => {\n            for (var c = Array(a), d = 0; d < a; ++d)\n              c[d] = cc(z()[b + 4 * d >>> 2 >>> 0], "parameter " + d);\n            return c;\n          }, jc = (a) => {\n            if (void 0 === a)\n              return "_unknown";\n            a = a.replace(/[^a-zA-Z0-9_]/g, "$");\n            var b = a.charCodeAt(0);\n            return 48 <= b && 57 >= b ? `_${a}` : a;\n          }, lc = {};\n          function mc(a, b) {\n            a = jc(a);\n            return { [a]: function() {\n              return b.apply(this, arguments);\n            } }[a];\n          }\n          function nc(a) {\n            var b = Function;\n            if (!(b instanceof Function))\n              throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);\n            var c = mc(b.name || "unknownFunctionName", function() {\n            });\n            c.prototype = b.prototype;\n            c = new c();\n            a = b.apply(c, a);\n            return a instanceof Object ? a : c;\n          }\n          var oc = (a) => {\n            for (var b = "", c = 0; c < a; ++c)\n              b += (0 !== c ? ", " : "") + "arg" + c;\n            var d = "return function emval_allocator_" + a + "(constructor, argTypes, args) {\\n  var HEAPU32 = getMemory();\\n";\n            for (c = 0; c < a; ++c)\n              d += "var argType" + c + " = requireRegisteredType(HEAPU32[((argTypes)>>>2)], \'parameter " + c + "\');\\nvar arg" + c + " = argType" + c + ".readValueFromPointer(args);\\nargs += argType" + c + "[\'argPackAdvance\'];\\nargTypes += 4;\\n";\n            return new Function("requireRegisteredType", "Module", "valueToHandle", "getMemory", d + ("var obj = new constructor(" + b + ");\\nreturn valueToHandle(obj);\\n}\\n"))(cc, A, W, () => z());\n          }, pc = {}, Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), qc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], rc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];\n          function sc(a, b, c, d, e, f, k) {\n            return E ? P(16, 1, a, b, c, d, e, f, k) : -52;\n          }\n          function tc(a, b, c, d, e, f) {\n            if (E)\n              return P(17, 1, a, b, c, d, e, f);\n          }\n          var vc = (a) => {\n            var b = nb(a) + 1, c = uc(b);\n            c && pb(a, c, b);\n            return c;\n          }, wc = {}, yc = () => {\n            if (!xc) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ma || "./this.program" }, b;\n              for (b in wc)\n                void 0 === wc[b] ? delete a[b] : a[b] = wc[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              xc = c;\n            }\n            return xc;\n          }, xc;\n          function zc(a, b) {\n            if (E)\n              return P(18, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            yc().forEach((d, e) => {\n              var f = b + c;\n              e = z()[a + 4 * e >>> 2 >>> 0] = f;\n              for (f = 0; f < d.length; ++f)\n                h()[e++ >>> 0 >>> 0] = d.charCodeAt(f);\n              h()[e >>> 0 >>> 0] = 0;\n              c += d.length + 1;\n            });\n            return 0;\n          }\n          function Ac(a, b) {\n            if (E)\n              return P(19, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = yc();\n            z()[a >>> 2 >>> 0] = c.length;\n            var d = 0;\n            c.forEach((e) => d += e.length + 1);\n            z()[b >>> 2 >>> 0] = d;\n            return 0;\n          }\n          function Bc(a) {\n            return E ? P(20, 1, a) : 52;\n          }\n          function Cc(a, b, c, d) {\n            return E ? P(21, 1, a, b, c, d) : 52;\n          }\n          function Dc(a, b, c, d) {\n            return E ? P(22, 1, a, b, c, d) : 70;\n          }\n          var Ec = [null, [], []];\n          function Fc(a, b, c, d) {\n            if (E)\n              return P(23, 1, a, b, c, d);\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            for (var e = 0, f = 0; f < c; f++) {\n              var k = z()[b >>> 2 >>> 0], l = z()[b + 4 >>> 2 >>> 0];\n              b += 8;\n              for (var q = 0; q < l; q++) {\n                var r = t()[k + q >>> 0], x = Ec[a];\n                0 === r || 10 === r ? ((1 === a ? wa : G)(Sa(x, 0)), x.length = 0) : x.push(r);\n              }\n              e += l;\n            }\n            z()[d >>> 2 >>> 0] = e;\n            return 0;\n          }\n          var Gc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Hc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Ic(a) {\n            var b = Array(nb(a) + 1);\n            ob(a, b, 0, b.length);\n            return b;\n          }\n          var Jc = (a, b) => {\n            h().set(a, b >>> 0);\n          };\n          function Kc(a, b, c, d) {\n            function e(g, u, y) {\n              for (g = "number" == typeof g ? g.toString() : g || ""; g.length < u; )\n                g = y[0] + g;\n              return g;\n            }\n            function f(g, u) {\n              return e(g, u, "0");\n            }\n            function k(g, u) {\n              function y(kc) {\n                return 0 > kc ? -1 : 0 < kc ? 1 : 0;\n              }\n              var Q;\n              0 === (Q = y(g.getFullYear() - u.getFullYear())) && 0 === (Q = y(g.getMonth() - u.getMonth())) && (Q = y(g.getDate() - u.getDate()));\n              return Q;\n            }\n            function l(g) {\n              switch (g.getDay()) {\n                case 0:\n                  return new Date(g.getFullYear() - 1, 11, 29);\n                case 1:\n                  return g;\n                case 2:\n                  return new Date(g.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    g.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(g.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(g.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(g.getFullYear() - 1, 11, 30);\n              }\n            }\n            function q(g) {\n              var u = g.ob;\n              for (g = new Date(new Date(g.pb + 1900, 0, 1).getTime()); 0 < u; ) {\n                var y = g.getMonth(), Q = (Y(g.getFullYear()) ? Gc : Hc)[y];\n                if (u > Q - g.getDate())\n                  u -= Q - g.getDate() + 1, g.setDate(1), 11 > y ? g.setMonth(y + 1) : (g.setMonth(0), g.setFullYear(g.getFullYear() + 1));\n                else {\n                  g.setDate(g.getDate() + u);\n                  break;\n                }\n              }\n              y = new Date(g.getFullYear() + 1, 0, 4);\n              u = l(new Date(\n                g.getFullYear(),\n                0,\n                4\n              ));\n              y = l(y);\n              return 0 >= k(u, g) ? 0 >= k(y, g) ? g.getFullYear() + 1 : g.getFullYear() : g.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            var r = z()[d + 40 >>> 2 >>> 0];\n            d = { Qb: w()[d >>> 2 >>> 0], Pb: w()[d + 4 >>> 2 >>> 0], tb: w()[d + 8 >>> 2 >>> 0], yb: w()[d + 12 >>> 2 >>> 0], ub: w()[d + 16 >>> 2 >>> 0], pb: w()[d + 20 >>> 2 >>> 0], kb: w()[d + 24 >>> 2 >>> 0], ob: w()[d + 28 >>> 2 >>> 0], Wb: w()[d + 32 >>> 2 >>> 0], Ob: w()[d + 36 >>> 2 >>> 0], Rb: r ? Ta(r) : "" };\n            c = Ta(c);\n            r = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var x in r)\n              c = c.replace(new RegExp(x, "g"), r[x]);\n            var C = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), N = "January February March April May June July August September October November December".split(" ");\n            r = { "%a": (g) => C[g.kb].substring(0, 3), "%A": (g) => C[g.kb], "%b": (g) => N[g.ub].substring(0, 3), "%B": (g) => N[g.ub], "%C": (g) => f((g.pb + 1900) / 100 | 0, 2), "%d": (g) => f(g.yb, 2), "%e": (g) => e(g.yb, 2, " "), "%g": (g) => q(g).toString().substring(2), "%G": (g) => q(g), "%H": (g) => f(g.tb, 2), "%I": (g) => {\n              g = g.tb;\n              0 == g ? g = 12 : 12 < g && (g -= 12);\n              return f(g, 2);\n            }, "%j": (g) => {\n              for (var u = 0, y = 0; y <= g.ub - 1; u += (Y(g.pb + 1900) ? Gc : Hc)[y++])\n                ;\n              return f(g.yb + u, 3);\n            }, "%m": (g) => f(g.ub + 1, 2), "%M": (g) => f(g.Pb, 2), "%n": () => "\\n", "%p": (g) => 0 <= g.tb && 12 > g.tb ? "AM" : "PM", "%S": (g) => f(g.Qb, 2), "%t": () => "	", "%u": (g) => g.kb || 7, "%U": (g) => f(Math.floor((g.ob + 7 - g.kb) / 7), 2), "%V": (g) => {\n              var u = Math.floor((g.ob + 7 - (g.kb + 6) % 7) / 7);\n              2 >= (g.kb + 371 - g.ob - 2) % 7 && u++;\n              if (u)\n                53 == u && (y = (g.kb + 371 - g.ob) % 7, 4 == y || 3 == y && Y(g.pb) || (u = 1));\n              else {\n                u = 52;\n                var y = (g.kb + 7 - g.ob - 1) % 7;\n                (4 == y || 5 == y && Y(g.pb % 400 - 1)) && u++;\n              }\n              return f(u, 2);\n            }, "%w": (g) => g.kb, "%W": (g) => f(Math.floor((g.ob + 7 - (g.kb + 6) % 7) / 7), 2), "%y": (g) => (g.pb + 1900).toString().substring(2), "%Y": (g) => g.pb + 1900, "%z": (g) => {\n              g = g.Ob;\n              var u = 0 <= g;\n              g = Math.abs(g) / 60;\n              return (u ? "+" : "-") + String("0000" + (g / 60 * 100 + g % 60)).slice(-4);\n            }, "%Z": (g) => g.Rb, "%%": () => "%" };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (x in r)\n              c.includes(x) && (c = c.replace(new RegExp(x, "g"), r[x](d)));\n            c = c.replace(/\\0\\0/g, "%");\n            x = Ic(c);\n            if (x.length > b)\n              return 0;\n            Jc(x, a);\n            return x.length - 1;\n          }\n          O.vb();\n          for (var Lc = Array(256), Mc = 0; 256 > Mc; ++Mc)\n            Lc[Mc] = String.fromCharCode(Mc);\n          Cb = Lc;\n          S = A.BindingError = class extends Error {\n            constructor(a) {\n              super(a);\n              this.name = "BindingError";\n            }\n          };\n          A.InternalError = class extends Error {\n            constructor(a) {\n              super(a);\n              this.name = "InternalError";\n            }\n          };\n          Object.assign(Ib.prototype, { get(a) {\n            return this.lb[a];\n          }, has(a) {\n            return void 0 !== this.lb[a];\n          }, wb(a) {\n            var b = this.zb.pop() || this.lb.length;\n            this.lb[b] = a;\n            return b;\n          }, xb(a) {\n            this.lb[a] = void 0;\n            this.zb.push(a);\n          } });\n          U.lb.push({ value: void 0 }, { value: null }, { value: true }, { value: false });\n          U.sb = U.lb.length;\n          A.count_emval_handles = () => {\n            for (var a = 0, b = U.sb; b < U.lb.length; ++b)\n              void 0 !== U.lb[b] && ++a;\n            return a;\n          };\n          var Nc = [Ua, Va, jb, lb, mb, qb, rb, sb, tb, ub, vb, wb, xb, yb, zb, Ab, sc, tc, zc, Ac, Bc, Cc, Dc, Fc], Pc = {\n            b: function(a, b, c) {\n              a >>>= 0;\n              new gb(a).vb(b >>> 0, c >>> 0);\n              hb = a;\n              ib++;\n              throw hb;\n            },\n            ea: function(a) {\n              Oc(a >>> 0, !B, 1, !oa, 131072, false);\n              O.Db();\n            },\n            D: function(a) {\n              a >>>= 0;\n              E ? postMessage({ cmd: "cleanupThread", thread: a }) : ((a = O.jb[a]) || H(), O.Bb(a));\n            },\n            W: kb,\n            y: lb,\n            ka: mb,\n            S: qb,\n            U: rb,\n            L: sb,\n            ia: tb,\n            ba: ub,\n            ha: vb,\n            F: wb,\n            T: xb,\n            Q: yb,\n            ja: zb,\n            R: Ab,\n            I: function(a, b, c, d, e) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              b = R(b);\n              var f = -1 != b.indexOf("u");\n              f && (e = (1n << 64n) - 1n);\n              T(a, { name: b, fromWireType: (k) => k, toWireType: function(k, l) {\n                if ("bigint" != typeof l && "number" != typeof l)\n                  throw new TypeError(`Cannot convert "${Bb(l)}" to ${this.name}`);\n                if (l < d || l > e)\n                  throw new TypeError(`Passing a number "${Bb(l)}" from JS side to C/C++ side to an argument of type "${b}", which is outside the valid range [${d}, ${e}]!`);\n                return l;\n              }, argPackAdvance: 8, readValueFromPointer: Hb(b, c, !f), rb: null });\n            },\n            qa: function(a, b, c, d) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              T(a, {\n                name: b,\n                fromWireType: function(e) {\n                  return !!e;\n                },\n                toWireType: function(e, f) {\n                  return f ? c : d;\n                },\n                argPackAdvance: 8,\n                readValueFromPointer: function(e) {\n                  return this.fromWireType(t()[e >>> 0]);\n                },\n                rb: null\n              });\n            },\n            pa: function(a, b) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              T(a, { name: b, fromWireType: (c) => {\n                var d = V(c);\n                Jb(c);\n                return d;\n              }, toWireType: (c, d) => W(d), argPackAdvance: 8, readValueFromPointer: Kb, rb: null });\n            },\n            H: function(a, b, c) {\n              a >>>= 0;\n              c >>>= 0;\n              b = R(b >>> 0);\n              T(a, { name: b, fromWireType: (d) => d, toWireType: (d, e) => e, argPackAdvance: 8, readValueFromPointer: Lb(b, c), rb: null });\n            },\n            t: function(a, b, c, d, e) {\n              a >>>= 0;\n              c >>>= 0;\n              b = R(b >>> 0);\n              -1 === e && (e = 4294967295);\n              e = (l) => l;\n              if (0 === d) {\n                var f = 32 - 8 * c;\n                e = (l) => l << f >>> f;\n              }\n              var k = b.includes("unsigned") ? function(l, q) {\n                return q >>> 0;\n              } : function(l, q) {\n                return q;\n              };\n              T(a, { name: b, fromWireType: e, toWireType: k, argPackAdvance: 8, readValueFromPointer: Hb(b, c, 0 !== d), rb: null });\n            },\n            m: function(a, b, c) {\n              function d(f) {\n                var k = z()[f >>> 2 >>> 0];\n                f = z()[f + 4 >>> 2 >>> 0];\n                return new e(h().buffer, f, k);\n              }\n              a >>>= 0;\n              var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];\n              c = R(c >>> 0);\n              T(\n                a,\n                { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d },\n                { Hb: true }\n              );\n            },\n            J: function(a, b) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              var c = "std::string" === b;\n              T(a, { name: b, fromWireType: function(d) {\n                var e = z()[d >>> 2 >>> 0], f = d + 4;\n                if (c)\n                  for (var k = f, l = 0; l <= e; ++l) {\n                    var q = f + l;\n                    if (l == e || 0 == t()[q >>> 0]) {\n                      k = Ta(k, q - k);\n                      if (void 0 === r)\n                        var r = k;\n                      else\n                        r += String.fromCharCode(0), r += k;\n                      k = q + 1;\n                    }\n                  }\n                else {\n                  r = Array(e);\n                  for (l = 0; l < e; ++l)\n                    r[l] = String.fromCharCode(t()[f + l >>> 0]);\n                  r = r.join("");\n                }\n                X(d);\n                return r;\n              }, toWireType: function(d, e) {\n                e instanceof ArrayBuffer && (e = new Uint8Array(e));\n                var f = "string" == typeof e;\n                if (!(f || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array))\n                  throw new S("Cannot pass non-string to std::string");\n                var k = c && f ? nb(e) : e.length;\n                var l = uc(4 + k + 1), q = l + 4;\n                z()[l >>> 2 >>> 0] = k;\n                if (c && f)\n                  pb(e, q, k + 1);\n                else if (f)\n                  for (f = 0; f < k; ++f) {\n                    var r = e.charCodeAt(f);\n                    if (255 < r)\n                      throw X(q), new S("String has UTF-16 code units that do not fit in 8 bits");\n                    t()[q + f >>> 0] = r;\n                  }\n                else\n                  for (f = 0; f < k; ++f)\n                    t()[q + f >>> 0] = e[f];\n                null !== d && d.push(X, l);\n                return l;\n              }, argPackAdvance: 8, readValueFromPointer: Mb, rb(d) {\n                X(d);\n              } });\n            },\n            A: function(a, b, c) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              c = R(c);\n              if (2 === b) {\n                var d = Ob;\n                var e = Pb;\n                var f = Qb;\n                var k = () => ca();\n                var l = 1;\n              } else\n                4 === b && (d = Rb, e = Sb, f = Tb, k = () => z(), l = 2);\n              T(a, {\n                name: c,\n                fromWireType: (q) => {\n                  for (var r = z()[q >>> 2 >>> 0], x = k(), C, N = q + 4, g = 0; g <= r; ++g) {\n                    var u = q + 4 + g * b;\n                    if (g == r || 0 == x[u >>> l])\n                      N = d(N, u - N), void 0 === C ? C = N : (C += String.fromCharCode(0), C += N), N = u + b;\n                  }\n                  X(q);\n                  return C;\n                },\n                toWireType: (q, r) => {\n                  if ("string" != typeof r)\n                    throw new S(`Cannot pass non-string to C++ string type ${c}`);\n                  var x = f(r), C = uc(4 + x + b);\n                  z()[C >>> 2] = x >> l;\n                  e(r, C + 4, x + b);\n                  null !== q && q.push(X, C);\n                  return C;\n                },\n                argPackAdvance: 8,\n                readValueFromPointer: Kb,\n                rb(q) {\n                  X(q);\n                }\n              });\n            },\n            ra: function(a, b) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              T(a, { Ib: true, name: b, argPackAdvance: 0, fromWireType: () => {\n              }, toWireType: () => {\n              } });\n            },\n            na: () => true,\n            O: function(a, b) {\n              a >>>= 0;\n              a == b >>> 0 ? setTimeout(() => $a()) : E ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = O.jb[a]) && a.postMessage({ cmd: "checkMailbox" });\n            },\n            X: function(a, b, c, d) {\n              b >>>= 0;\n              c /= 2;\n              ac.length = c;\n              d = d >>> 0 >>> 3;\n              for (var e = 0; e < c; e++)\n                ac[e] = J[d + 2 * e] ? J[d + 2 * e + 1] : ha()[d + 2 * e + 1 >>> 0];\n              a = Nc[a];\n              O.Gb = b;\n              b = a.apply(null, ac);\n              O.Gb = 0;\n              return b;\n            },\n            da: Vb,\n            ma: function(a) {\n              D && O.jb[a >>> 0].ref();\n            },\n            r: function(a, b, c) {\n              b >>>= 0;\n              c >>>= 0;\n              a = V(a >>> 0);\n              b = cc(b, "emval::as");\n              var d = [], e = W(d);\n              z()[c >>> 2 >>> 0] = e;\n              return b.toWireType(d, a);\n            },\n            i: function(a, b, c, d, e) {\n              c >>>= 0;\n              d >>>= 0;\n              e >>>= 0;\n              a = fc[a >>> 0];\n              b = V(b >>> 0);\n              c = ec(c);\n              var f = [];\n              z()[d >>> 2 >>> 0] = W(f);\n              return a(b, c, f, e);\n            },\n            u: function(a, b, c, d) {\n              c >>>= 0;\n              d >>>= 0;\n              a = fc[a >>> 0];\n              b = V(b >>> 0);\n              c = ec(c);\n              a(b, c, null, d);\n            },\n            c: Jb,\n            K: function(a, b) {\n              b >>>= 0;\n              a = V(a >>> 0);\n              b = V(b);\n              return a == b;\n            },\n            o: function(a) {\n              a >>>= 0;\n              if (0 === a)\n                return W(gc());\n              a = ec(a);\n              return W(gc()[a]);\n            },\n            h: function(a, b) {\n              var c = ic(a, b >>> 0), d = c[0];\n              b = d.name + "_$" + c.slice(1).map(function(x) {\n                return x.name;\n              }).join("_") + "$";\n              var e = lc[b];\n              if (void 0 !== e)\n                return e;\n              e = ["retType"];\n              for (var f = [d], k = "", l = 0; l < a - 1; ++l)\n                k += (0 !== l ? ", " : "") + "arg" + l, e.push("argType" + l), f.push(c[1 + l]);\n              var q = "return function " + jc("methodCaller_" + b) + "(handle, name, destructors, args) {\\n", r = 0;\n              for (l = 0; l < a - 1; ++l)\n                q += "    var arg" + l + " = argType" + l + ".readValueFromPointer(args" + (r ? "+" + r : "") + ");\\n", r += c[l + 1].argPackAdvance;\n              q += "    var rv = handle[name](" + k + ");\\n";\n              for (l = 0; l < a - 1; ++l)\n                c[l + 1].deleteObject && (q += "    argType" + l + ".deleteObject(arg" + l + ");\\n");\n              d.Ib || (q += "    return retType.toWireType(destructors, rv);\\n");\n              e.push(q + "};\\n");\n              a = nc(e).apply(null, f);\n              e = hc(a);\n              return lc[b] = e;\n            },\n            q: function(a, b) {\n              b >>>= 0;\n              a = V(a >>> 0);\n              b = V(b);\n              return W(a[b]);\n            },\n            d: function(a) {\n              a >>>= 0;\n              4 < a && (U.get(a).Ab += 1);\n            },\n            x: function(a, b, c, d) {\n              c >>>= 0;\n              d >>>= 0;\n              a = V(a >>> 0);\n              var e = pc[b];\n              e || (e = oc(b), pc[b] = e);\n              return e(a, c, d);\n            },\n            v: function() {\n              return W([]);\n            },\n            l: function(a) {\n              a = V(a >>> 0);\n              for (var b = Array(a.length), c = 0; c < a.length; c++)\n                b[c] = a[c];\n              return W(b);\n            },\n            e: function(a) {\n              return W(ec(a >>> 0));\n            },\n            k: function() {\n              return W({});\n            },\n            g: function(a) {\n              a >>>= 0;\n              for (var b = V(a); b.length; ) {\n                var c = b.pop();\n                b.pop()(c);\n              }\n              Jb(a);\n            },\n            j: function(a, b, c) {\n              b >>>= 0;\n              c >>>= 0;\n              a = V(a >>> 0);\n              b = V(b);\n              c = V(c);\n              a[b] = c;\n            },\n            f: function(a, b) {\n              b >>>= 0;\n              a = cc(a >>> 0, "_emval_take_value");\n              a = a.readValueFromPointer(b);\n              return W(a);\n            },\n            _: function(a, b) {\n              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);\n              b >>>= 0;\n              a = new Date(1e3 * a);\n              w()[b >>> 2 >>> 0] = a.getUTCSeconds();\n              w()[b + 4 >>> 2 >>> 0] = a.getUTCMinutes();\n              w()[b + 8 >>> 2 >>> 0] = a.getUTCHours();\n              w()[b + 12 >>> 2 >>> 0] = a.getUTCDate();\n              w()[b + 16 >>> 2 >>> 0] = a.getUTCMonth();\n              w()[b + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              w()[b + 24 >>> 2 >>> 0] = a.getUTCDay();\n              a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n              w()[b + 28 >>> 2 >>> 0] = a;\n            },\n            $: function(a, b) {\n              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);\n              b >>>= 0;\n              a = new Date(1e3 * a);\n              w()[b >>> 2 >>> 0] = a.getSeconds();\n              w()[b + 4 >>> 2 >>> 0] = a.getMinutes();\n              w()[b + 8 >>> 2 >>> 0] = a.getHours();\n              w()[b + 12 >>> 2 >>> 0] = a.getDate();\n              w()[b + 16 >>> 2 >>> 0] = a.getMonth();\n              w()[b + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;\n              w()[b + 24 >>> 2 >>> 0] = a.getDay();\n              var c = (Y(a.getFullYear()) ? qc : rc)[a.getMonth()] + a.getDate() - 1 | 0;\n              w()[b + 28 >>> 2 >>> 0] = c;\n              w()[b + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              a = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;\n              w()[b + 32 >>> 2 >>> 0] = a;\n            },\n            aa: function(a) {\n              a >>>= 0;\n              var b = new Date(w()[a + 20 >>> 2 >>> 0] + 1900, w()[a + 16 >>> 2 >>> 0], w()[a + 12 >>> 2 >>> 0], w()[a + 8 >>> 2 >>> 0], w()[a + 4 >>> 2 >>> 0], w()[a >>> 2 >>> 0], 0), c = w()[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), e = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), f = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(f, e);\n              0 > c ? w()[a + 32 >>> 2 >>> 0] = Number(e != f && k == d) : 0 < c != (k == d) && (e = Math.max(f, e), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : e) - d)));\n              w()[a + 24 >>> 2 >>> 0] = b.getDay();\n              c = (Y(b.getFullYear()) ? qc : rc)[b.getMonth()] + b.getDate() - 1 | 0;\n              w()[a + 28 >>> 2 >>> 0] = c;\n              w()[a >>> 2 >>> 0] = b.getSeconds();\n              w()[a + 4 >>> 2 >>> 0] = b.getMinutes();\n              w()[a + 8 >>> 2 >>> 0] = b.getHours();\n              w()[a + 12 >>> 2 >>> 0] = b.getDate();\n              w()[a + 16 >>> 2 >>> 0] = b.getMonth();\n              w()[a + 20 >>> 2 >>> 0] = b.getYear();\n              return BigInt(b.getTime() / 1e3);\n            },\n            Y: sc,\n            Z: tc,\n            N: function(a, b, c) {\n              function d(r) {\n                return (r = r.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? r[1] : "GMT";\n              }\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              var e = (/* @__PURE__ */ new Date()).getFullYear(), f = new Date(e, 0, 1), k = new Date(e, 6, 1);\n              e = f.getTimezoneOffset();\n              var l = k.getTimezoneOffset(), q = Math.max(e, l);\n              z()[a >>> 2 >>> 0] = 60 * q;\n              w()[b >>> 2 >>> 0] = Number(e != l);\n              a = d(f);\n              b = d(k);\n              a = vc(a);\n              b = vc(b);\n              l < e ? (z()[c >>> 2 >>> 0] = a, z()[c + 4 >>> 2 >>> 0] = b) : (z()[c >>> 2 >>> 0] = b, z()[c + 4 >>> 2 >>> 0] = a);\n            },\n            n: () => {\n              H("");\n            },\n            E: () => {\n            },\n            G: () => Date.now(),\n            la: () => {\n              Fa += 1;\n              throw "unwind";\n            },\n            P: function() {\n              return 4294901760;\n            },\n            s: () => performance.timeOrigin + performance.now(),\n            w: () => D ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency,\n            M: function(a) {\n              a >>>= 0;\n              var b = t().length;\n              if (a <= b || 4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var d = b * (1 + 0.2 / c);\n                d = Math.min(d, a + 100663296);\n                var e = Math;\n                d = Math.max(a, d);\n                a: {\n                  e = (e.min.call(e, 4294901760, d + (65536 - d % 65536) % 65536) - m.buffer.byteLength + 65535) / 65536;\n                  try {\n                    m.grow(e);\n                    p();\n                    var f = 1;\n                    break a;\n                  } catch (k) {\n                  }\n                  f = void 0;\n                }\n                if (f)\n                  return true;\n              }\n              return false;\n            },\n            fa: zc,\n            ga: Ac,\n            V: Wa,\n            z: Bc,\n            C: Cc,\n            ca: Dc,\n            B: Fc,\n            a: m || A.wasmMemory,\n            oa: Kc,\n            p: function(a, b, c, d) {\n              return Kc(a >>> 0, b >>> 0, c >>> 0, d >>> 0);\n            }\n          }, Z = function() {\n            var a = { a: Pc };\n            K++;\n            Na(a, function(b) {\n              var c = b.module;\n              Z = b.instance.exports;\n              Z = Qc();\n              O.Eb.push(Z.Xa);\n              eb = Z._a;\n              Da.unshift(Z.sa);\n              xa = c;\n              Ia();\n            }).catch(ka);\n            return {};\n          }();\n          A._OrtInit = (a, b) => (A._OrtInit = Z.ta)(a, b);\n          A._OrtGetLastError = (a, b) => (A._OrtGetLastError = Z.ua)(a, b);\n          A._OrtCreateSessionOptions = (a, b, c, d, e, f, k, l, q, r) => (A._OrtCreateSessionOptions = Z.va)(a, b, c, d, e, f, k, l, q, r);\n          A._OrtAppendExecutionProvider = (a, b) => (A._OrtAppendExecutionProvider = Z.wa)(a, b);\n          A._OrtAddFreeDimensionOverride = (a, b, c) => (A._OrtAddFreeDimensionOverride = Z.xa)(a, b, c);\n          A._OrtAddSessionConfigEntry = (a, b, c) => (A._OrtAddSessionConfigEntry = Z.ya)(a, b, c);\n          A._OrtReleaseSessionOptions = (a) => (A._OrtReleaseSessionOptions = Z.za)(a);\n          A._OrtCreateSession = (a, b, c) => (A._OrtCreateSession = Z.Aa)(a, b, c);\n          A._OrtReleaseSession = (a) => (A._OrtReleaseSession = Z.Ba)(a);\n          A._OrtGetInputOutputCount = (a, b, c) => (A._OrtGetInputOutputCount = Z.Ca)(a, b, c);\n          A._OrtGetInputName = (a, b) => (A._OrtGetInputName = Z.Da)(a, b);\n          A._OrtGetOutputName = (a, b) => (A._OrtGetOutputName = Z.Ea)(a, b);\n          A._OrtFree = (a) => (A._OrtFree = Z.Fa)(a);\n          A._OrtCreateTensor = (a, b, c, d, e, f) => (A._OrtCreateTensor = Z.Ga)(a, b, c, d, e, f);\n          A._OrtGetTensorData = (a, b, c, d, e) => (A._OrtGetTensorData = Z.Ha)(a, b, c, d, e);\n          A._OrtReleaseTensor = (a) => (A._OrtReleaseTensor = Z.Ia)(a);\n          A._OrtCreateRunOptions = (a, b, c, d) => (A._OrtCreateRunOptions = Z.Ja)(a, b, c, d);\n          A._OrtAddRunConfigEntry = (a, b, c) => (A._OrtAddRunConfigEntry = Z.Ka)(a, b, c);\n          A._OrtReleaseRunOptions = (a) => (A._OrtReleaseRunOptions = Z.La)(a);\n          A._OrtCreateBinding = (a) => (A._OrtCreateBinding = Z.Ma)(a);\n          A._OrtBindInput = (a, b, c) => (A._OrtBindInput = Z.Na)(a, b, c);\n          A._OrtBindOutput = (a, b, c, d) => (A._OrtBindOutput = Z.Oa)(a, b, c, d);\n          A._OrtClearBoundOutputs = (a) => (A._OrtClearBoundOutputs = Z.Pa)(a);\n          A._OrtReleaseBinding = (a) => (A._OrtReleaseBinding = Z.Qa)(a);\n          A._OrtRunWithBinding = (a, b, c, d, e) => (A._OrtRunWithBinding = Z.Ra)(a, b, c, d, e);\n          A._OrtRun = (a, b, c, d, e, f, k, l) => (A._OrtRun = Z.Sa)(a, b, c, d, e, f, k, l);\n          A._OrtEndProfiling = (a) => (A._OrtEndProfiling = Z.Ta)(a);\n          var Za = A._pthread_self = () => (Za = A._pthread_self = Z.Ua)(), uc = A._malloc = (a) => (uc = A._malloc = Z.Va)(a), X = A._free = (a) => (X = A._free = Z.Wa)(a);\n          A.__emscripten_tls_init = () => (A.__emscripten_tls_init = Z.Xa)();\n          var bc = (a) => (bc = Z.Ya)(a);\n          A.__embind_initialize_bindings = () => (A.__embind_initialize_bindings = Z.Za)();\n          var Oc = A.__emscripten_thread_init = (a, b, c, d, e, f) => (Oc = A.__emscripten_thread_init = Z.$a)(a, b, c, d, e, f);\n          A.__emscripten_thread_crashed = () => (A.__emscripten_thread_crashed = Z.ab)();\n          var $b = (a, b, c, d) => ($b = Z.bb)(a, b, c, d), Ya = (a) => (Ya = Z.cb)(a), fb = A.__emscripten_thread_exit = (a) => (fb = A.__emscripten_thread_exit = Z.db)(a), Wb = A.__emscripten_check_mailbox = () => (Wb = A.__emscripten_check_mailbox = Z.eb)(), bb = (a, b) => (bb = Z.fb)(a, b), Xb = () => (Xb = Z.gb)(), cb = (a) => (cb = Z.hb)(a), Zb = (a) => (Zb = Z.ib)(a);\n          function Qc() {\n            var a = Z;\n            a = Object.assign({}, a);\n            var b = (d) => () => d() >>> 0, c = (d) => (e) => d(e) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.Ua = b(a.Ua);\n            a.Va = c(a.Va);\n            a.Ya = c(a.Ya);\n            a.gb = b(a.gb);\n            a.ib = c(a.ib);\n            return a;\n          }\n          A.keepRuntimeAlive = Ga;\n          A.wasmMemory = m;\n          A.stackAlloc = Zb;\n          A.stackSave = Xb;\n          A.stackRestore = cb;\n          A.UTF8ToString = Ta;\n          A.stringToUTF8 = pb;\n          A.lengthBytesUTF8 = nb;\n          A.ExitStatus = Oa;\n          A.PThread = O;\n          var Rc;\n          L = function Sc() {\n            Rc || Tc();\n            Rc || (L = Sc);\n          };\n          function Tc() {\n            0 < K || (E ? (ja(A), E || ab(Da), startWorker(A)) : (ab(Ca), 0 < K || Rc || (Rc = true, A.calledRun = true, ya || (E || ab(Da), ja(A), E || ab(Ea)))));\n          }\n          Tc();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasmThreaded;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasmThreaded);\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.worker.js\n  var require_ort_wasm_threaded_worker = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module) {\n      module.exports = \'"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>(0,eval)(fs.readFileSync(f,"utf8")+"//# sourceURL="+f),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*is_main=*/0,/*is_runtime=*/0,/*can_block=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){Module["__embind_initialize_bindings"]();initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err(`worker.js received unknown command ${e.data.cmd}`);err(e.data)}}catch(ex){if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}}self.onmessage=handleMessage;\\n\';\n    }\n  });\n\n  // nodejs-ignore:node:path\n  var join = void 0;\n\n  // web/lib/wasm/wasm-factory.ts\n  var ortWasmFactory;\n  if (true) {\n    ortWasmFactory = require_ort_training_wasm_simd();\n  } else {\n    ortWasmFactory = true ? null : null;\n  }\n  var ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;\n  var wasm;\n  var initialized = false;\n  var initializing = false;\n  var aborted = false;\n  var isMultiThreadSupported = () => {\n    try {\n      if (typeof SharedArrayBuffer === "undefined") {\n        return false;\n      }\n      if (typeof MessageChannel !== "undefined") {\n        new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));\n      }\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        5,\n        4,\n        1,\n        3,\n        1,\n        1,\n        10,\n        11,\n        1,\n        9,\n        0,\n        65,\n        0,\n        254,\n        16,\n        2,\n        0,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var isSimdSupported = () => {\n    try {\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        10,\n        30,\n        1,\n        28,\n        0,\n        65,\n        0,\n        253,\n        15,\n        253,\n        12,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        253,\n        186,\n        1,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var getWasmFileName = (useSimd, useThreads) => {\n    if (useSimd) {\n      if (true) {\n        return "ort-training-wasm-simd.wasm";\n      }\n      return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";\n    } else {\n      return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";\n    }\n  };\n  var initializeWebAssembly = async (flags) => {\n    if (initialized) {\n      return Promise.resolve();\n    }\n    if (initializing) {\n      throw new Error("multiple calls to \'initializeWebAssembly()\' detected.");\n    }\n    if (aborted) {\n      throw new Error("previous call to \'initializeWebAssembly()\' failed.");\n    }\n    initializing = true;\n    const timeout = flags.initTimeout;\n    const numThreads = flags.numThreads;\n    const simd = flags.simd;\n    const useThreads = numThreads > 1 && isMultiThreadSupported();\n    const useSimd = simd && isSimdSupported();\n    const wasmPaths = flags.wasmPaths;\n    const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;\n    const wasmFileName = getWasmFileName(useSimd, useThreads);\n    const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;\n    let isTimeout = false;\n    const tasks = [];\n    if (timeout > 0) {\n      tasks.push(new Promise((resolve) => {\n        setTimeout(() => {\n          isTimeout = true;\n          resolve();\n        }, timeout);\n      }));\n    }\n    tasks.push(new Promise((resolve, reject) => {\n      const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;\n      const config = {\n        locateFile: (fileName, scriptDirectory) => {\n          if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {\n            return URL.createObjectURL(new Blob(\n              [\n                // This require() function is handled by esbuild plugin to load file content as string.\n                // eslint-disable-next-line @typescript-eslint/no-require-imports\n                require_ort_wasm_threaded_worker()\n              ],\n              { type: "text/javascript" }\n            ));\n          }\n          if (fileName.endsWith(".wasm")) {\n            if (wasmPathOverride) {\n              return wasmPathOverride;\n            }\n            const prefix = wasmPrefixOverride ?? scriptDirectory;\n            if (false) {\n              if (wasmFileName === "ort-wasm-simd.wasm") {\n                return prefix + "ort-wasm-simd.jsep.wasm";\n              } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {\n                return prefix + "ort-wasm-simd-threaded.jsep.wasm";\n              }\n            }\n            return prefix + wasmFileName;\n          }\n          return scriptDirectory + fileName;\n        }\n      };\n      if (useThreads) {\n        if (typeof Blob === "undefined") {\n          config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");\n        } else {\n          const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;\n          config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });\n        }\n      }\n      factory(config).then(\n        // wasm module initialized successfully\n        (module) => {\n          initializing = false;\n          initialized = true;\n          wasm = module;\n          resolve();\n        },\n        // wasm module failed to initialize\n        (what) => {\n          initializing = false;\n          aborted = true;\n          reject(what);\n        }\n      );\n    }));\n    await Promise.race(tasks);\n    if (isTimeout) {\n      throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);\n    }\n  };\n  var getInstance = () => {\n    if (initialized && wasm) {\n      return wasm;\n    }\n    throw new Error("WebAssembly is not initialized yet.");\n  };\n\n  // web/lib/wasm/wasm-utils.ts\n  var allocWasmString = (data, allocs) => {\n    const wasm2 = getInstance();\n    const dataLength = wasm2.lengthBytesUTF8(data) + 1;\n    const dataOffset = wasm2._malloc(dataLength);\n    wasm2.stringToUTF8(data, dataOffset, dataLength);\n    allocs.push(dataOffset);\n    return dataOffset;\n  };\n  var iterateExtraOptions = (options, prefix, seen, handler) => {\n    if (typeof options == "object" && options !== null) {\n      if (seen.has(options)) {\n        throw new Error("Circular reference in options");\n      } else {\n        seen.add(options);\n      }\n    }\n    Object.entries(options).forEach(([key, value]) => {\n      const name = prefix ? prefix + key : key;\n      if (typeof value === "object") {\n        iterateExtraOptions(value, name + ".", seen, handler);\n      } else if (typeof value === "string" || typeof value === "number") {\n        handler(name, value.toString());\n      } else if (typeof value === "boolean") {\n        handler(name, value ? "1" : "0");\n      } else {\n        throw new Error(`Can\'t handle extra config type: ${typeof value}`);\n      }\n    });\n  };\n  var checkLastError = (message) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const paramsOffset = wasm2.stackAlloc(8);\n      wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);\n      const errorCode = wasm2.HEAP32[paramsOffset / 4];\n      const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];\n      const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";\n      throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n\n  // web/lib/wasm/run-options.ts\n  var setRunOptions = (options) => {\n    const wasm2 = getInstance();\n    let runOptionsHandle = 0;\n    const allocs = [];\n    const runOptions = options || {};\n    try {\n      if (options?.logSeverityLevel === void 0) {\n        runOptions.logSeverityLevel = 2;\n      } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);\n      }\n      if (options?.logVerbosityLevel === void 0) {\n        runOptions.logVerbosityLevel = 0;\n      } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {\n        throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);\n      }\n      if (options?.terminate === void 0) {\n        runOptions.terminate = false;\n      }\n      let tagDataOffset = 0;\n      if (options?.tag !== void 0) {\n        tagDataOffset = allocWasmString(options.tag, allocs);\n      }\n      runOptionsHandle = wasm2._OrtCreateRunOptions(\n        runOptions.logSeverityLevel,\n        runOptions.logVerbosityLevel,\n        !!runOptions.terminate,\n        tagDataOffset\n      );\n      if (runOptionsHandle === 0) {\n        checkLastError("Can\'t create run options.");\n      }\n      if (options?.extra !== void 0) {\n        iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a run config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [runOptionsHandle, allocs];\n    } catch (e) {\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/session-options.ts\n  var getGraphOptimzationLevel = (graphOptimizationLevel) => {\n    switch (graphOptimizationLevel) {\n      case "disabled":\n        return 0;\n      case "basic":\n        return 1;\n      case "extended":\n        return 2;\n      case "all":\n        return 99;\n      default:\n        throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);\n    }\n  };\n  var getExecutionMode = (executionMode) => {\n    switch (executionMode) {\n      case "sequential":\n        return 0;\n      case "parallel":\n        return 1;\n      default:\n        throw new Error(`unsupported execution mode: ${executionMode}`);\n    }\n  };\n  var appendDefaultOptions = (options) => {\n    if (!options.extra) {\n      options.extra = {};\n    }\n    if (!options.extra.session) {\n      options.extra.session = {};\n    }\n    const session = options.extra.session;\n    if (!session.use_ort_model_bytes_directly) {\n      session.use_ort_model_bytes_directly = "1";\n    }\n    if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {\n      options.enableMemPattern = false;\n    }\n  };\n  var setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {\n    for (const ep of executionProviders) {\n      let epName = typeof ep === "string" ? ep : ep.name;\n      switch (epName) {\n        case "xnnpack":\n          epName = "XNNPACK";\n          break;\n        case "webnn":\n          epName = "WEBNN";\n          if (typeof ep !== "string") {\n            const webnnOptions = ep;\n            if (webnnOptions?.deviceType) {\n              const keyDataOffset = allocWasmString("deviceType", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'deviceType\' - ${webnnOptions.deviceType}.`);\n              }\n            }\n            if (webnnOptions?.numThreads) {\n              let numThreads = webnnOptions.numThreads;\n              if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {\n                numThreads = 0;\n              }\n              const keyDataOffset = allocWasmString("numThreads", allocs);\n              const valueDataOffset = allocWasmString(numThreads.toString(), allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'numThreads\' - ${webnnOptions.numThreads}.`);\n              }\n            }\n            if (webnnOptions?.powerPreference) {\n              const keyDataOffset = allocWasmString("powerPreference", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'powerPreference\' - ${webnnOptions.powerPreference}.`\n                );\n              }\n            }\n          }\n          break;\n        case "webgpu":\n          epName = "JS";\n          if (typeof ep !== "string") {\n            const webgpuOptions = ep;\n            if (webgpuOptions?.preferredLayout) {\n              if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {\n                throw new Error(`preferredLayout must be either \'NCHW\' or \'NHWC\': ${webgpuOptions.preferredLayout}`);\n              }\n              const keyDataOffset = allocWasmString("preferredLayout", allocs);\n              const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'preferredLayout\' - ${webgpuOptions.preferredLayout}.`\n                );\n              }\n            }\n          }\n          break;\n        case "wasm":\n        case "cpu":\n          continue;\n        default:\n          throw new Error(`not supported execution provider: ${epName}`);\n      }\n      const epNameDataOffset = allocWasmString(epName, allocs);\n      if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {\n        checkLastError(`Can\'t append execution provider: ${epName}.`);\n      }\n    }\n  };\n  var setSessionOptions = (options) => {\n    const wasm2 = getInstance();\n    let sessionOptionsHandle = 0;\n    const allocs = [];\n    const sessionOptions = options || {};\n    appendDefaultOptions(sessionOptions);\n    try {\n      const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");\n      const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");\n      const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;\n      const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;\n      if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);\n      }\n      const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;\n      if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {\n        throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);\n      }\n      const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;\n      sessionOptionsHandle = wasm2._OrtCreateSessionOptions(\n        graphOptimizationLevel,\n        !!sessionOptions.enableCpuMemArena,\n        !!sessionOptions.enableMemPattern,\n        executionMode,\n        !!sessionOptions.enableProfiling,\n        0,\n        logIdDataOffset,\n        logSeverityLevel,\n        logVerbosityLevel,\n        optimizedModelFilePathOffset\n      );\n      if (sessionOptionsHandle === 0) {\n        checkLastError("Can\'t create session options.");\n      }\n      if (sessionOptions.executionProviders) {\n        setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);\n      }\n      if (sessionOptions.freeDimensionOverrides) {\n        for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {\n          if (typeof name !== "string") {\n            throw new Error(`free dimension override name must be a string: ${name}`);\n          }\n          if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {\n            throw new Error(`free dimension override value must be a non-negative integer: ${value}`);\n          }\n          const nameOffset = allocWasmString(name, allocs);\n          if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {\n            checkLastError(`Can\'t set a free dimension override: ${name} - ${value}.`);\n          }\n        }\n      }\n      if (sessionOptions.extra !== void 0) {\n        iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a session config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [sessionOptionsHandle, allocs];\n    } catch (e) {\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/wasm-common.ts\n  var tensorDataTypeStringToEnum = (type) => {\n    switch (type) {\n      case "int8":\n        return 3 /* int8 */;\n      case "uint8":\n        return 2 /* uint8 */;\n      case "bool":\n        return 9 /* bool */;\n      case "int16":\n        return 5 /* int16 */;\n      case "uint16":\n        return 4 /* uint16 */;\n      case "int32":\n        return 6 /* int32 */;\n      case "uint32":\n        return 12 /* uint32 */;\n      case "float16":\n        return 10 /* float16 */;\n      case "float32":\n        return 1 /* float */;\n      case "float64":\n        return 11 /* double */;\n      case "string":\n        return 8 /* string */;\n      case "int64":\n        return 7 /* int64 */;\n      case "uint64":\n        return 13 /* uint64 */;\n      default:\n        throw new Error(`unsupported data type: ${type}`);\n    }\n  };\n  var tensorDataTypeEnumToString = (typeProto) => {\n    switch (typeProto) {\n      case 3 /* int8 */:\n        return "int8";\n      case 2 /* uint8 */:\n        return "uint8";\n      case 9 /* bool */:\n        return "bool";\n      case 5 /* int16 */:\n        return "int16";\n      case 4 /* uint16 */:\n        return "uint16";\n      case 6 /* int32 */:\n        return "int32";\n      case 12 /* uint32 */:\n        return "uint32";\n      case 10 /* float16 */:\n        return "float16";\n      case 1 /* float */:\n        return "float32";\n      case 11 /* double */:\n        return "float64";\n      case 8 /* string */:\n        return "string";\n      case 7 /* int64 */:\n        return "int64";\n      case 13 /* uint64 */:\n        return "uint64";\n      default:\n        throw new Error(`unsupported data type: ${typeProto}`);\n    }\n  };\n  var getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];\n  var tensorTypeToTypedArrayConstructor = (type) => {\n    switch (type) {\n      case "float16":\n        return Uint16Array;\n      case "float32":\n        return Float32Array;\n      case "uint8":\n        return Uint8Array;\n      case "int8":\n        return Int8Array;\n      case "uint16":\n        return Uint16Array;\n      case "int16":\n        return Int16Array;\n      case "int32":\n        return Int32Array;\n      case "bool":\n        return Uint8Array;\n      case "float64":\n        return Float64Array;\n      case "uint32":\n        return Uint32Array;\n      case "int64":\n        return BigInt64Array;\n      case "uint64":\n        return BigUint64Array;\n      default:\n        throw new Error(`unsupported type: ${type}`);\n    }\n  };\n  var logLevelStringToEnum = (logLevel) => {\n    switch (logLevel) {\n      case "verbose":\n        return 0;\n      case "info":\n        return 1;\n      case "warning":\n        return 2;\n      case "error":\n        return 3;\n      case "fatal":\n        return 4;\n      default:\n        throw new Error(`unsupported logging level: ${logLevel}`);\n    }\n  };\n  var isGpuBufferSupportedType = (type) => type === "float32" || type === "int32" || type === "int64" || type === "bool" || type === "float16" || type === "uint32";\n  var dataLocationStringToEnum = (location) => {\n    switch (location) {\n      case "none":\n        return 0;\n      case "cpu":\n        return 1;\n      case "cpu-pinned":\n        return 2;\n      case "texture":\n        return 3;\n      case "gpu-buffer":\n        return 4;\n      default:\n        throw new Error(`unsupported data location: ${location}`);\n    }\n  };\n\n  // web/lib/wasm/wasm-core-impl.ts\n  var getSessionInputOutputCount = (sessionHandle) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const dataOffset = wasm2.stackAlloc(8);\n      const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);\n      if (errorCode !== 0) {\n        checkLastError("Can\'t get session input/output count.");\n      }\n      return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var initOrt = (numThreads, loggingLevel) => {\n    const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);\n    if (errorCode !== 0) {\n      checkLastError("Can\'t initialize onnxruntime.");\n    }\n  };\n  var initRuntime = async (env) => {\n    initOrt(env.wasm.numThreads, logLevelStringToEnum(env.logLevel));\n    if (false) {\n      const initJsep = null.init;\n      await initJsep(getInstance(), env);\n    }\n  };\n  var activeSessions = /* @__PURE__ */ new Map();\n  var createSessionAllocate = (model) => {\n    const wasm2 = getInstance();\n    const modelDataOffset = wasm2._malloc(model.byteLength);\n    if (modelDataOffset === 0) {\n      throw new Error(`Can\'t create a session. failed to allocate a buffer of size ${model.byteLength}.`);\n    }\n    wasm2.HEAPU8.set(model, modelDataOffset);\n    return [modelDataOffset, model.byteLength];\n  };\n  var createSessionFinalize = (modelData, options) => {\n    const wasm2 = getInstance();\n    let sessionHandle = 0;\n    let sessionOptionsHandle = 0;\n    let ioBindingHandle = 0;\n    let allocs = [];\n    const inputNamesUTF8Encoded = [];\n    const outputNamesUTF8Encoded = [];\n    try {\n      [sessionOptionsHandle, allocs] = setSessionOptions(options);\n      sessionHandle = wasm2._OrtCreateSession(modelData[0], modelData[1], sessionOptionsHandle);\n      if (sessionHandle === 0) {\n        checkLastError("Can\'t create a session.");\n      }\n      const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);\n      const inputNames = [];\n      const outputNames = [];\n      const outputPreferredLocations = [];\n      for (let i = 0; i < inputCount; i++) {\n        const name = wasm2._OrtGetInputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an input name.");\n        }\n        inputNamesUTF8Encoded.push(name);\n        inputNames.push(wasm2.UTF8ToString(name));\n      }\n      for (let i = 0; i < outputCount; i++) {\n        const name = wasm2._OrtGetOutputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an output name.");\n        }\n        outputNamesUTF8Encoded.push(name);\n        const nameString = wasm2.UTF8ToString(name);\n        outputNames.push(nameString);\n        if (false) {\n          const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";\n          if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}.`);\n          }\n          outputPreferredLocations.push(location);\n        }\n      }\n      let bindingState = null;\n      if (false) {\n        ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);\n        if (ioBindingHandle === 0) {\n          checkLastError("Can\'t create IO binding.");\n        }\n        bindingState = {\n          handle: ioBindingHandle,\n          outputPreferredLocations,\n          outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))\n        };\n      }\n      activeSessions.set(sessionHandle, [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState]);\n      return [sessionHandle, inputNames, outputNames];\n    } catch (e) {\n      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      if (ioBindingHandle !== 0) {\n        wasm2._OrtReleaseBinding(ioBindingHandle);\n      }\n      if (sessionHandle !== 0) {\n        wasm2._OrtReleaseSession(sessionHandle);\n      }\n      throw e;\n    } finally {\n      wasm2._free(modelData[0]);\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n    }\n  };\n  var createSession = (model, options) => {\n    const modelData = createSessionAllocate(model);\n    return createSessionFinalize(modelData, options);\n  };\n  var releaseSession = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot release session. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    if (ioBindingState) {\n      wasm2._OrtReleaseBinding(ioBindingState.handle);\n    }\n    wasm2.jsepUnregisterBuffers?.(sessionId);\n    inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    wasm2._OrtReleaseSession(sessionHandle);\n    activeSessions.delete(sessionId);\n  };\n  var prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index) => {\n    if (!tensor) {\n      tensorHandles.push(0);\n      return;\n    }\n    const wasm2 = getInstance();\n    const dataType = tensor[0];\n    const dims = tensor[1];\n    const location = tensor[3];\n    let rawData;\n    let dataByteLength;\n    if (dataType === "string" && location === "gpu-buffer") {\n      throw new Error("String tensor is not supported on GPU.");\n    }\n    if (location === "gpu-buffer") {\n      const gpuBuffer = tensor[2].gpuBuffer;\n      const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));\n      dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;\n      rawData = wasm2.jsepRegisterBuffer(sessionId, index, gpuBuffer, dataByteLength);\n    } else {\n      const data = tensor[2];\n      if (Array.isArray(data)) {\n        dataByteLength = 4 * data.length;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        let dataIndex = rawData / 4;\n        for (let i = 0; i < data.length; i++) {\n          if (typeof data[i] !== "string") {\n            throw new TypeError(`tensor data at index ${i} is not a string`);\n          }\n          wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);\n        }\n      } else {\n        dataByteLength = data.byteLength;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);\n      }\n    }\n    const stack = wasm2.stackSave();\n    const dimsOffset = wasm2.stackAlloc(4 * dims.length);\n    try {\n      let dimIndex = dimsOffset / 4;\n      dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);\n      const tensor2 = wasm2._OrtCreateTensor(\n        tensorDataTypeStringToEnum(dataType),\n        rawData,\n        dataByteLength,\n        dimsOffset,\n        dims.length,\n        dataLocationStringToEnum(location)\n      );\n      if (tensor2 === 0) {\n        checkLastError(`Can\'t create tensor for input/output. session=${sessionId}, index=${index}.`);\n      }\n      tensorHandles.push(tensor2);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot run inference. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    const inputCount = inputIndices.length;\n    const outputCount = outputIndices.length;\n    let runOptionsHandle = 0;\n    let runOptionsAllocs = [];\n    const inputTensorHandles = [];\n    const outputTensorHandles = [];\n    const inputOutputAllocs = [];\n    const beforeRunStack = wasm2.stackSave();\n    const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);\n    const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);\n    const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);\n    const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);\n    try {\n      [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);\n      for (let i = 0; i < inputCount; i++) {\n        prepareInputOutputTensor(inputTensors[i], inputTensorHandles, inputOutputAllocs, sessionId, inputIndices[i]);\n      }\n      for (let i = 0; i < outputCount; i++) {\n        prepareInputOutputTensor(\n          outputTensors[i],\n          outputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputCount + outputIndices[i]\n        );\n      }\n      let inputValuesIndex = inputValuesOffset / 4;\n      let inputNamesIndex = inputNamesOffset / 4;\n      let outputValuesIndex = outputValuesOffset / 4;\n      let outputNamesIndex = outputNamesOffset / 4;\n      for (let i = 0; i < inputCount; i++) {\n        wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];\n        wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];\n      }\n      for (let i = 0; i < outputCount; i++) {\n        wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];\n        wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];\n      }\n      if (false) {\n        const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;\n        if (inputNamesUTF8Encoded.length !== inputCount) {\n          throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model\'s input count (${inputNamesUTF8Encoded.length}).`);\n        }\n        for (let i = 0; i < inputCount; i++) {\n          const index = inputIndices[i];\n          const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t bind input[${i}] for session=${sessionId}.`);\n          }\n        }\n        for (let i = 0; i < outputCount; i++) {\n          const index = outputIndices[i];\n          const location = outputTensors[i]?.[3];\n          if (location) {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind pre-allocated output[${i}] for session=${sessionId}.`);\n            }\n          } else {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);\n            }\n          }\n        }\n      }\n      let errorCode;\n      if (false) {\n        errorCode = await wasm2._OrtRunWithBinding(\n          sessionHandle,\n          ioBindingState.handle,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      } else {\n        errorCode = await wasm2._OrtRun(\n          sessionHandle,\n          inputNamesOffset,\n          inputValuesOffset,\n          inputCount,\n          outputNamesOffset,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      }\n      if (errorCode !== 0) {\n        checkLastError("failed to call OrtRun().");\n      }\n      const output = [];\n      for (let i = 0; i < outputCount; i++) {\n        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];\n        if (tensor === outputTensorHandles[i]) {\n          output.push(outputTensors[i]);\n          continue;\n        }\n        const beforeGetTensorDataStack = wasm2.stackSave();\n        const tensorDataOffset = wasm2.stackAlloc(4 * 4);\n        let keepOutputTensor = false;\n        let type, dataOffset = 0;\n        try {\n          const errorCode2 = wasm2._OrtGetTensorData(\n            tensor,\n            tensorDataOffset,\n            tensorDataOffset + 4,\n            tensorDataOffset + 8,\n            tensorDataOffset + 12\n          );\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t access output tensor data on index ${i}.`);\n          }\n          let tensorDataIndex = tensorDataOffset / 4;\n          const dataType = wasm2.HEAPU32[tensorDataIndex++];\n          dataOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];\n          const dims = [];\n          for (let i2 = 0; i2 < dimsLength; i2++) {\n            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);\n          }\n          wasm2._OrtFree(dimsOffset);\n          const size = dims.reduce((a, b) => a * b, 1);\n          type = tensorDataTypeEnumToString(dataType);\n          const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];\n          if (type === "string") {\n            if (preferredLocation === "gpu-buffer") {\n              throw new Error("String tensor is not supported on GPU.");\n            }\n            const stringData = [];\n            let dataIndex = dataOffset / 4;\n            for (let i2 = 0; i2 < size; i2++) {\n              const offset = wasm2.HEAPU32[dataIndex++];\n              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;\n              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));\n            }\n            output.push([type, dims, stringData, "cpu"]);\n          } else {\n            if (preferredLocation === "gpu-buffer" && size > 0) {\n              const gpuBuffer = wasm2.jsepGetBuffer(dataOffset);\n              const elementSize = getTensorElementSize(dataType);\n              if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {\n                throw new Error(`Unsupported data type: ${type}`);\n              }\n              keepOutputTensor = true;\n              output.push([\n                type,\n                dims,\n                {\n                  gpuBuffer,\n                  download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),\n                  dispose: () => {\n                    wasm2._OrtReleaseTensor(tensor);\n                  }\n                },\n                "gpu-buffer"\n              ]);\n            } else {\n              const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);\n              const data = new typedArrayConstructor(size);\n              new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));\n              output.push([type, dims, data, "cpu"]);\n            }\n          }\n        } finally {\n          wasm2.stackRestore(beforeGetTensorDataStack);\n          if (type === "string" && dataOffset) {\n            wasm2._free(dataOffset);\n          }\n          if (!keepOutputTensor) {\n            wasm2._OrtReleaseTensor(tensor);\n          }\n        }\n      }\n      if (ioBindingState) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n      }\n      return output;\n    } finally {\n      wasm2.stackRestore(beforeRunStack);\n      inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      inputOutputAllocs.forEach((p) => wasm2._free(p));\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      runOptionsAllocs.forEach((p) => wasm2._free(p));\n    }\n  };\n  var endProfiling = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error("invalid session id");\n    }\n    const sessionHandle = session[0];\n    const profileFileName = wasm2._OrtEndProfiling(sessionHandle);\n    if (profileFileName === 0) {\n      checkLastError("Can\'t get an profile file name.");\n    }\n    wasm2._OrtFree(profileFileName);\n  };\n  var extractTransferableBuffers = (tensors) => {\n    const buffers = [];\n    for (const tensor of tensors) {\n      const data = tensor[2];\n      if (!Array.isArray(data) && "buffer" in data) {\n        buffers.push(data.buffer);\n      }\n    }\n    return buffers;\n  };\n\n  // web/lib/wasm/proxy-worker/main.ts\n  self.onmessage = (ev) => {\n    switch (ev.data.type) {\n      case "init-wasm":\n        try {\n          initializeWebAssembly(ev.data.in).then(\n            () => postMessage({ type: "init-wasm" }),\n            (err) => postMessage({ type: "init-wasm", err })\n          );\n        } catch (err) {\n          postMessage({ type: "init-wasm", err });\n        }\n        break;\n      case "init-ort":\n        try {\n          initRuntime(ev.data.in).then(() => postMessage({ type: "init-ort" }), (err) => postMessage({\n            type: "init-ort",\n            err\n          }));\n        } catch (err) {\n          postMessage({ type: "init-ort", err });\n        }\n        break;\n      case "create_allocate":\n        try {\n          const { model } = ev.data.in;\n          const modeldata = createSessionAllocate(model);\n          postMessage({ type: "create_allocate", out: modeldata });\n        } catch (err) {\n          postMessage({ type: "create_allocate", err });\n        }\n        break;\n      case "create_finalize":\n        try {\n          const { modeldata, options } = ev.data.in;\n          const sessionMetadata = createSessionFinalize(modeldata, options);\n          postMessage({ type: "create_finalize", out: sessionMetadata });\n        } catch (err) {\n          postMessage({ type: "create_finalize", err });\n        }\n        break;\n      case "create":\n        try {\n          const { model, options } = ev.data.in;\n          const sessionMetadata = createSession(model, options);\n          postMessage({ type: "create", out: sessionMetadata });\n        } catch (err) {\n          postMessage({ type: "create", err });\n        }\n        break;\n      case "release":\n        try {\n          const handler = ev.data.in;\n          releaseSession(handler);\n          postMessage({ type: "release" });\n        } catch (err) {\n          postMessage({ type: "release", err });\n        }\n        break;\n      case "run":\n        try {\n          const { sessionId, inputIndices, inputs, outputIndices, options } = ev.data.in;\n          run(sessionId, inputIndices, inputs, outputIndices, options).then(\n            (outputs) => {\n              postMessage({ type: "run", out: outputs }, extractTransferableBuffers(outputs));\n            },\n            (err) => {\n              postMessage({ type: "run", err });\n            }\n          );\n        } catch (err) {\n          postMessage({ type: "run", err });\n        }\n        break;\n      case "end-profiling":\n        try {\n          const handler = ev.data.in;\n          endProfiling(handler);\n          postMessage({ type: "end-profiling" });\n        } catch (err) {\n          postMessage({ type: "end-profiling", err });\n        }\n        break;\n      default:\n    }\n  };\n})();\n//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZWpzLWlnbm9yZTpmcyIsICJub2RlanMtaWdub3JlOnBhdGgiLCAiLi4vbGliL3dhc20vYmluZGluZy9vcnQtdHJhaW5pbmctd2FzbS1zaW1kLmpzIiwgIm5vZGVqcy1pZ25vcmU6d29ya2VyX3RocmVhZHMiLCAibm9kZWpzLWlnbm9yZTpwZXJmX2hvb2tzIiwgIm5vZGVqcy1pZ25vcmU6b3MiLCAiLi4vbGliL3dhc20vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC5qcyIsICIuLi9saWIvd2FzbS9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLndvcmtlci5qcyIsICJub2RlanMtaWdub3JlOm5vZGU6cGF0aCIsICIuLi9saWIvd2FzbS93YXNtLWZhY3RvcnkudHMiLCAiLi4vbGliL3dhc20vd2FzbS11dGlscy50cyIsICIuLi9saWIvd2FzbS9ydW4tb3B0aW9ucy50cyIsICIuLi9saWIvd2FzbS9zZXNzaW9uLW9wdGlvbnMudHMiLCAiLi4vbGliL3dhc20vd2FzbS1jb21tb24udHMiLCAiLi4vbGliL3dhc20vd2FzbS1jb3JlLWltcGwudHMiLCAiLi4vbGliL3dhc20vcHJveHktd29ya2VyL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBjb25zdCByZWFkRmlsZSA9IHVuZGVmaW5lZDsiLCAiZXhwb3J0IGNvbnN0IGpvaW4gPSB1bmRlZmluZWQ7IiwgIlxudmFyIG9ydFdhc20gPSAoKCkgPT4ge1xuICB2YXIgX3NjcmlwdERpciA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuY3VycmVudFNjcmlwdCA/IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjIDogdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIF9fZmlsZW5hbWUgIT09ICd1bmRlZmluZWQnKSBfc2NyaXB0RGlyID0gX3NjcmlwdERpciB8fCBfX2ZpbGVuYW1lO1xuICByZXR1cm4gKFxuZnVuY3Rpb24obW9kdWxlQXJnID0ge30pIHtcblxudmFyIGQ9bW9kdWxlQXJnLGssbDtkLnJlYWR5PW5ldyBQcm9taXNlKChhLGIpPT57az1hO2w9Yn0pO3ZhciByPU9iamVjdC5hc3NpZ24oe30sZCksdj1cIi4vdGhpcy5wcm9ncmFtXCIsYWE9XCJvYmplY3RcIj09dHlwZW9mIHdpbmRvdyx4PVwiZnVuY3Rpb25cIj09dHlwZW9mIGltcG9ydFNjcmlwdHMsYmE9XCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MmJlwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zJiZcInN0cmluZ1wiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlLHk9XCJcIixBLEIsQztcbmlmKGJhKXt2YXIgZnM9cmVxdWlyZShcImZzXCIpLEQ9cmVxdWlyZShcInBhdGhcIik7eT14P0QuZGlybmFtZSh5KStcIi9cIjpfX2Rpcm5hbWUrXCIvXCI7QT0oYSxiKT0+e2E9YS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGEpOkQubm9ybWFsaXplKGEpO3JldHVybiBmcy5yZWFkRmlsZVN5bmMoYSxiP3ZvaWQgMDpcInV0ZjhcIil9O0M9YT0+e2E9QShhLCEwKTthLmJ1ZmZlcnx8KGE9bmV3IFVpbnQ4QXJyYXkoYSkpO3JldHVybiBhfTtCPShhLGIsYyxmPSEwKT0+e2E9YS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGEpOkQubm9ybWFsaXplKGEpO2ZzLnJlYWRGaWxlKGEsZj92b2lkIDA6XCJ1dGY4XCIsKGcsaCk9PntnP2MoZyk6YihmP2guYnVmZmVyOmgpfSl9OyFkLnRoaXNQcm9ncmFtJiYxPHByb2Nlc3MuYXJndi5sZW5ndGgmJih2PXByb2Nlc3MuYXJndlsxXS5yZXBsYWNlKC9cXFxcL2csXCIvXCIpKTtwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7ZC5pbnNwZWN0PSgpPT5cIltFbXNjcmlwdGVuIE1vZHVsZSBvYmplY3RdXCJ9ZWxzZSBpZihhYXx8XG54KXg/eT1zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYoeT1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksX3NjcmlwdERpciYmKHk9X3NjcmlwdERpciksMCE9PXkuaW5kZXhPZihcImJsb2I6XCIpP3k9eS5zdWJzdHIoMCx5LnJlcGxhY2UoL1s/I10uKi8sXCJcIikubGFzdEluZGV4T2YoXCIvXCIpKzEpOnk9XCJcIixBPWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5zZW5kKG51bGwpO3JldHVybiBiLnJlc3BvbnNlVGV4dH0seCYmKEM9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7Yi5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheShiLnJlc3BvbnNlKX0pLEI9KGEsYixjKT0+e3ZhciBmPW5ldyBYTUxIdHRwUmVxdWVzdDtmLm9wZW4oXCJHRVRcIixhLCEwKTtmLnJlc3BvbnNlVHlwZT1cblwiYXJyYXlidWZmZXJcIjtmLm9ubG9hZD0oKT0+ezIwMD09Zi5zdGF0dXN8fDA9PWYuc3RhdHVzJiZmLnJlc3BvbnNlP2IoZi5yZXNwb25zZSk6YygpfTtmLm9uZXJyb3I9YztmLnNlbmQobnVsbCl9O3ZhciBjYT1kLnByaW50fHxjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLEU9ZC5wcmludEVycnx8Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpO09iamVjdC5hc3NpZ24oZCxyKTtyPW51bGw7ZC50aGlzUHJvZ3JhbSYmKHY9ZC50aGlzUHJvZ3JhbSk7dmFyIEY7ZC53YXNtQmluYXJ5JiYoRj1kLndhc21CaW5hcnkpO3ZhciBub0V4aXRSdW50aW1lPWQubm9FeGl0UnVudGltZXx8ITA7XCJvYmplY3RcIiE9dHlwZW9mIFdlYkFzc2VtYmx5JiZHKFwibm8gbmF0aXZlIHdhc20gc3VwcG9ydCBkZXRlY3RlZFwiKTt2YXIgSCxJLGRhPSExLEosSyxMLE07XG5mdW5jdGlvbiBlYSgpe3ZhciBhPUguYnVmZmVyO2QuSEVBUDg9Sj1uZXcgSW50OEFycmF5KGEpO2QuSEVBUDE2PW5ldyBJbnQxNkFycmF5KGEpO2QuSEVBUDMyPUw9bmV3IEludDMyQXJyYXkoYSk7ZC5IRUFQVTg9Sz1uZXcgVWludDhBcnJheShhKTtkLkhFQVBVMTY9bmV3IFVpbnQxNkFycmF5KGEpO2QuSEVBUFUzMj1NPW5ldyBVaW50MzJBcnJheShhKTtkLkhFQVBGMzI9bmV3IEZsb2F0MzJBcnJheShhKTtkLkhFQVBGNjQ9bmV3IEZsb2F0NjRBcnJheShhKX12YXIgZmE9W10saGE9W10saWE9W107ZnVuY3Rpb24gamEoKXt2YXIgYT1kLnByZVJ1bi5zaGlmdCgpO2ZhLnVuc2hpZnQoYSl9dmFyIE49MCxPPW51bGwsUD1udWxsO1xuZnVuY3Rpb24gRyhhKXtpZihkLm9uQWJvcnQpZC5vbkFib3J0KGEpO2E9XCJBYm9ydGVkKFwiK2ErXCIpXCI7RShhKTtkYT0hMDthPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3IoYStcIi4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby5cIik7bChhKTt0aHJvdyBhO31mdW5jdGlvbiBrYShhKXtyZXR1cm4gYS5zdGFydHNXaXRoKFwiZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LFwiKX12YXIgUTtRPVwib3J0LXRyYWluaW5nLXdhc20tc2ltZC53YXNtXCI7aWYoIWthKFEpKXt2YXIgbGE9UTtRPWQubG9jYXRlRmlsZT9kLmxvY2F0ZUZpbGUobGEseSk6eStsYX1mdW5jdGlvbiBtYShhKXtpZihhPT1RJiZGKXJldHVybiBuZXcgVWludDhBcnJheShGKTtpZihDKXJldHVybiBDKGEpO3Rocm93XCJib3RoIGFzeW5jIGFuZCBzeW5jIGZldGNoaW5nIG9mIHRoZSB3YXNtIGZhaWxlZFwiO31cbmZ1bmN0aW9uIG5hKGEpe2lmKCFGJiYoYWF8fHgpKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBmZXRjaCYmIWEuc3RhcnRzV2l0aChcImZpbGU6Ly9cIikpcmV0dXJuIGZldGNoKGEse2NyZWRlbnRpYWxzOlwic2FtZS1vcmlnaW5cIn0pLnRoZW4oYj0+e2lmKCFiLm9rKXRocm93XCJmYWlsZWQgdG8gbG9hZCB3YXNtIGJpbmFyeSBmaWxlIGF0ICdcIithK1wiJ1wiO3JldHVybiBiLmFycmF5QnVmZmVyKCl9KS5jYXRjaCgoKT0+bWEoYSkpO2lmKEIpcmV0dXJuIG5ldyBQcm9taXNlKChiLGMpPT57QihhLGY9PmIobmV3IFVpbnQ4QXJyYXkoZikpLGMpfSl9cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCk9Pm1hKGEpKX1mdW5jdGlvbiBvYShhLGIsYyl7cmV0dXJuIG5hKGEpLnRoZW4oZj0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoZixiKSkudGhlbihmPT5mKS50aGVuKGMsZj0+e0UoXCJmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiBcIitmKTtHKGYpfSl9XG5mdW5jdGlvbiBwYShhLGIpe3ZhciBjPVE7cmV0dXJuIEZ8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nfHxrYShjKXx8Yy5zdGFydHNXaXRoKFwiZmlsZTovL1wiKXx8YmF8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIGZldGNoP29hKGMsYSxiKTpmZXRjaChjLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGY9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKGYsYSkudGhlbihiLGZ1bmN0aW9uKGcpe0UoXCJ3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogXCIrZyk7RShcImZhbGxpbmcgYmFjayB0byBBcnJheUJ1ZmZlciBpbnN0YW50aWF0aW9uXCIpO3JldHVybiBvYShjLGEsYil9KSl9dmFyIFIsUz1hPT57Zm9yKDswPGEubGVuZ3RoOylhLnNoaWZ0KCkoZCl9O1xuZnVuY3Rpb24gcWEoYSl7dGhpcy5IYT1hLTI0O3RoaXMuTGE9ZnVuY3Rpb24oYil7TVt0aGlzLkhhKzQ+PjI+Pj4wXT1ifTt0aGlzLkthPWZ1bmN0aW9uKGIpe01bdGhpcy5IYSs4Pj4yPj4+MF09Yn07dGhpcy5JYT1mdW5jdGlvbihiLGMpe3RoaXMuSmEoKTt0aGlzLkxhKGIpO3RoaXMuS2EoYyl9O3RoaXMuSmE9ZnVuY3Rpb24oKXtNW3RoaXMuSGErMTY+PjI+Pj4wXT0wfX1cbnZhciByYT0wLHNhPTAsdGE9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0ZjhcIik6dm9pZCAwLHVhPShhLGIsYyk9PntiPj4+PTA7dmFyIGY9YitjO2ZvcihjPWI7YVtjXSYmIShjPj1mKTspKytjO2lmKDE2PGMtYiYmYS5idWZmZXImJnRhKXJldHVybiB0YS5kZWNvZGUoYS5zdWJhcnJheShiLGMpKTtmb3IoZj1cIlwiO2I8Yzspe3ZhciBnPWFbYisrXTtpZihnJjEyOCl7dmFyIGg9YVtiKytdJjYzO2lmKDE5Mj09KGcmMjI0KSlmKz1TdHJpbmcuZnJvbUNoYXJDb2RlKChnJjMxKTw8NnxoKTtlbHNle3ZhciBtPWFbYisrXSY2MztnPTIyND09KGcmMjQwKT8oZyYxNSk8PDEyfGg8PDZ8bTooZyY3KTw8MTh8aDw8MTJ8bTw8NnxhW2IrK10mNjM7NjU1MzY+Zz9mKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGcpOihnLT02NTUzNixmKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGc+PjEwLDU2MzIwfGcmMTAyMykpfX1lbHNlIGYrPVN0cmluZy5mcm9tQ2hhckNvZGUoZyl9cmV0dXJuIGZ9LFxuVD0oYSxiKT0+KGE+Pj49MCk/dWEoSyxhLGIpOlwiXCIsVT1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZj1hLmNoYXJDb2RlQXQoYyk7MTI3Pj1mP2IrKzoyMDQ3Pj1mP2IrPTI6NTUyOTY8PWYmJjU3MzQzPj1mPyhiKz00LCsrYyk6Yis9M31yZXR1cm4gYn0sVj0oYSxiLGMsZik9PntjPj4+PTA7aWYoISgwPGYpKXJldHVybiAwO3ZhciBnPWM7Zj1jK2YtMTtmb3IodmFyIGg9MDtoPGEubGVuZ3RoOysraCl7dmFyIG09YS5jaGFyQ29kZUF0KGgpO2lmKDU1Mjk2PD1tJiY1NzM0Mz49bSl7dmFyIHE9YS5jaGFyQ29kZUF0KCsraCk7bT02NTUzNisoKG0mMTAyMyk8PDEwKXxxJjEwMjN9aWYoMTI3Pj1tKXtpZihjPj1mKWJyZWFrO2JbYysrPj4+MF09bX1lbHNle2lmKDIwNDc+PW0pe2lmKGMrMT49ZilicmVhaztiW2MrKz4+PjBdPTE5MnxtPj42fWVsc2V7aWYoNjU1MzU+PW0pe2lmKGMrMj49ZilicmVhaztiW2MrKz4+PjBdPTIyNHxtPj4xMn1lbHNle2lmKGMrMz49XG5mKWJyZWFrO2JbYysrPj4+MF09MjQwfG0+PjE4O2JbYysrPj4+MF09MTI4fG0+PjEyJjYzfWJbYysrPj4+MF09MTI4fG0+PjYmNjN9YltjKys+Pj4wXT0xMjh8bSY2M319YltjPj4+MF09MDtyZXR1cm4gYy1nfSxXPWE9PjA9PT1hJTQmJigwIT09YSUxMDB8fDA9PT1hJTQwMCksdmE9WzAsMzEsNjAsOTEsMTIxLDE1MiwxODIsMjEzLDI0NCwyNzQsMzA1LDMzNV0sd2E9WzAsMzEsNTksOTAsMTIwLDE1MSwxODEsMjEyLDI0MywyNzMsMzA0LDMzNF0sQmE9YT0+e3ZhciBiPVUoYSkrMSxjPUFhKGIpO2MmJlYoYSxLLGMsYik7cmV0dXJuIGN9LFg9e30sQ2E9KCk9PntpZighWSl7dmFyIGE9e1VTRVI6XCJ3ZWJfdXNlclwiLExPR05BTUU6XCJ3ZWJfdXNlclwiLFBBVEg6XCIvXCIsUFdEOlwiL1wiLEhPTUU6XCIvaG9tZS93ZWJfdXNlclwiLExBTkc6KFwib2JqZWN0XCI9PXR5cGVvZiBuYXZpZ2F0b3ImJm5hdmlnYXRvci5sYW5ndWFnZXMmJm5hdmlnYXRvci5sYW5ndWFnZXNbMF18fFwiQ1wiKS5yZXBsYWNlKFwiLVwiLFxuXCJfXCIpK1wiLlVURi04XCIsXzp2fHxcIi4vdGhpcy5wcm9ncmFtXCJ9LGI7Zm9yKGIgaW4gWCl2b2lkIDA9PT1YW2JdP2RlbGV0ZSBhW2JdOmFbYl09WFtiXTt2YXIgYz1bXTtmb3IoYiBpbiBhKWMucHVzaChgJHtifT0ke2FbYl19YCk7WT1jfXJldHVybiBZfSxZLERhPVtudWxsLFtdLFtdXSxFYT1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdLEZhPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07ZnVuY3Rpb24gR2EoYSl7dmFyIGI9QXJyYXkoVShhKSsxKTtWKGEsYiwwLGIubGVuZ3RoKTtyZXR1cm4gYn1cbmZ1bmN0aW9uIEhhKGEsYixjLGYpe2Z1bmN0aW9uIGcoZSxuLHApe2ZvcihlPVwibnVtYmVyXCI9PXR5cGVvZiBlP2UudG9TdHJpbmcoKTplfHxcIlwiO2UubGVuZ3RoPG47KWU9cFswXStlO3JldHVybiBlfWZ1bmN0aW9uIGgoZSxuKXtyZXR1cm4gZyhlLG4sXCIwXCIpfWZ1bmN0aW9uIG0oZSxuKXtmdW5jdGlvbiBwKHhhKXtyZXR1cm4gMD54YT8tMTowPHhhPzE6MH12YXIgejswPT09KHo9cChlLmdldEZ1bGxZZWFyKCktbi5nZXRGdWxsWWVhcigpKSkmJjA9PT0oej1wKGUuZ2V0TW9udGgoKS1uLmdldE1vbnRoKCkpKSYmKHo9cChlLmdldERhdGUoKS1uLmdldERhdGUoKSkpO3JldHVybiB6fWZ1bmN0aW9uIHEoZSl7c3dpdGNoKGUuZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoZS5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gZTtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGUuZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoZS5nZXRGdWxsWWVhcigpLFxuMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGUuZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUoZS5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoZS5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiB3KGUpe3ZhciBuPWUuQ2E7Zm9yKGU9bmV3IERhdGUoKG5ldyBEYXRlKGUuRGErMTkwMCwwLDEpKS5nZXRUaW1lKCkpOzA8bjspe3ZhciBwPWUuZ2V0TW9udGgoKSx6PShXKGUuZ2V0RnVsbFllYXIoKSk/RWE6RmEpW3BdO2lmKG4+ei1lLmdldERhdGUoKSluLT16LWUuZ2V0RGF0ZSgpKzEsZS5zZXREYXRlKDEpLDExPnA/ZS5zZXRNb250aChwKzEpOihlLnNldE1vbnRoKDApLGUuc2V0RnVsbFllYXIoZS5nZXRGdWxsWWVhcigpKzEpKTtlbHNle2Uuc2V0RGF0ZShlLmdldERhdGUoKStuKTticmVha319cD1uZXcgRGF0ZShlLmdldEZ1bGxZZWFyKCkrMSwwLDQpO249cShuZXcgRGF0ZShlLmdldEZ1bGxZZWFyKCksXG4wLDQpKTtwPXEocCk7cmV0dXJuIDA+PW0obixlKT8wPj1tKHAsZSk/ZS5nZXRGdWxsWWVhcigpKzE6ZS5nZXRGdWxsWWVhcigpOmUuZ2V0RnVsbFllYXIoKS0xfWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Y+Pj49MDt2YXIgdD1MW2YrNDA+PjI+Pj4wXTtmPXtPYTpMW2Y+PjI+Pj4wXSxOYTpMW2YrND4+Mj4+PjBdLEVhOkxbZis4Pj4yPj4+MF0sR2E6TFtmKzEyPj4yPj4+MF0sRmE6TFtmKzE2Pj4yPj4+MF0sRGE6TFtmKzIwPj4yPj4+MF0seGE6TFtmKzI0Pj4yPj4+MF0sQ2E6TFtmKzI4Pj4yPj4+MF0sUWE6TFtmKzMyPj4yPj4+MF0sTWE6TFtmKzM2Pj4yPj4+MF0sUGE6dD9UKHQpOlwiXCJ9O2M9VChjKTt0PXtcIiVjXCI6XCIlYSAlYiAlZCAlSDolTTolUyAlWVwiLFwiJURcIjpcIiVtLyVkLyV5XCIsXCIlRlwiOlwiJVktJW0tJWRcIixcIiVoXCI6XCIlYlwiLFwiJXJcIjpcIiVJOiVNOiVTICVwXCIsXCIlUlwiOlwiJUg6JU1cIixcIiVUXCI6XCIlSDolTTolU1wiLFwiJXhcIjpcIiVtLyVkLyV5XCIsXCIlWFwiOlwiJUg6JU06JVNcIixcIiVFY1wiOlwiJWNcIixcblwiJUVDXCI6XCIlQ1wiLFwiJUV4XCI6XCIlbS8lZC8leVwiLFwiJUVYXCI6XCIlSDolTTolU1wiLFwiJUV5XCI6XCIleVwiLFwiJUVZXCI6XCIlWVwiLFwiJU9kXCI6XCIlZFwiLFwiJU9lXCI6XCIlZVwiLFwiJU9IXCI6XCIlSFwiLFwiJU9JXCI6XCIlSVwiLFwiJU9tXCI6XCIlbVwiLFwiJU9NXCI6XCIlTVwiLFwiJU9TXCI6XCIlU1wiLFwiJU91XCI6XCIldVwiLFwiJU9VXCI6XCIlVVwiLFwiJU9WXCI6XCIlVlwiLFwiJU93XCI6XCIld1wiLFwiJU9XXCI6XCIlV1wiLFwiJU95XCI6XCIleVwifTtmb3IodmFyIHUgaW4gdCljPWMucmVwbGFjZShuZXcgUmVnRXhwKHUsXCJnXCIpLHRbdV0pO3ZhciB5YT1cIlN1bmRheSBNb25kYXkgVHVlc2RheSBXZWRuZXNkYXkgVGh1cnNkYXkgRnJpZGF5IFNhdHVyZGF5XCIuc3BsaXQoXCIgXCIpLHphPVwiSmFudWFyeSBGZWJydWFyeSBNYXJjaCBBcHJpbCBNYXkgSnVuZSBKdWx5IEF1Z3VzdCBTZXB0ZW1iZXIgT2N0b2JlciBOb3ZlbWJlciBEZWNlbWJlclwiLnNwbGl0KFwiIFwiKTt0PXtcIiVhXCI6ZT0+eWFbZS54YV0uc3Vic3RyaW5nKDAsMyksXCIlQVwiOmU9PnlhW2UueGFdLFwiJWJcIjplPT5cbnphW2UuRmFdLnN1YnN0cmluZygwLDMpLFwiJUJcIjplPT56YVtlLkZhXSxcIiVDXCI6ZT0+aCgoZS5EYSsxOTAwKS8xMDB8MCwyKSxcIiVkXCI6ZT0+aChlLkdhLDIpLFwiJWVcIjplPT5nKGUuR2EsMixcIiBcIiksXCIlZ1wiOmU9PncoZSkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlR1wiOmU9PncoZSksXCIlSFwiOmU9PmgoZS5FYSwyKSxcIiVJXCI6ZT0+e2U9ZS5FYTswPT1lP2U9MTI6MTI8ZSYmKGUtPTEyKTtyZXR1cm4gaChlLDIpfSxcIiVqXCI6ZT0+e2Zvcih2YXIgbj0wLHA9MDtwPD1lLkZhLTE7bis9KFcoZS5EYSsxOTAwKT9FYTpGYSlbcCsrXSk7cmV0dXJuIGgoZS5HYStuLDMpfSxcIiVtXCI6ZT0+aChlLkZhKzEsMiksXCIlTVwiOmU9PmgoZS5OYSwyKSxcIiVuXCI6KCk9PlwiXFxuXCIsXCIlcFwiOmU9PjA8PWUuRWEmJjEyPmUuRWE/XCJBTVwiOlwiUE1cIixcIiVTXCI6ZT0+aChlLk9hLDIpLFwiJXRcIjooKT0+XCJcXHRcIixcIiV1XCI6ZT0+ZS54YXx8NyxcIiVVXCI6ZT0+aChNYXRoLmZsb29yKChlLkNhKzctZS54YSkvNyksMiksXCIlVlwiOmU9Plxue3ZhciBuPU1hdGguZmxvb3IoKGUuQ2ErNy0oZS54YSs2KSU3KS83KTsyPj0oZS54YSszNzEtZS5DYS0yKSU3JiZuKys7aWYobik1Mz09biYmKHA9KGUueGErMzcxLWUuQ2EpJTcsND09cHx8Mz09cCYmVyhlLkRhKXx8KG49MSkpO2Vsc2V7bj01Mjt2YXIgcD0oZS54YSs3LWUuQ2EtMSklNzsoND09cHx8NT09cCYmVyhlLkRhJTQwMC0xKSkmJm4rK31yZXR1cm4gaChuLDIpfSxcIiV3XCI6ZT0+ZS54YSxcIiVXXCI6ZT0+aChNYXRoLmZsb29yKChlLkNhKzctKGUueGErNiklNykvNyksMiksXCIleVwiOmU9PihlLkRhKzE5MDApLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLFwiJVlcIjplPT5lLkRhKzE5MDAsXCIlelwiOmU9PntlPWUuTWE7dmFyIG49MDw9ZTtlPU1hdGguYWJzKGUpLzYwO3JldHVybihuP1wiK1wiOlwiLVwiKStTdHJpbmcoXCIwMDAwXCIrKGUvNjAqMTAwK2UlNjApKS5zbGljZSgtNCl9LFwiJVpcIjplPT5lLlBhLFwiJSVcIjooKT0+XCIlXCJ9O2M9Yy5yZXBsYWNlKC8lJS9nLFwiXFx4MDBcXHgwMFwiKTtmb3IodSBpbiB0KWMuaW5jbHVkZXModSkmJlxuKGM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAodSxcImdcIiksdFt1XShmKSkpO2M9Yy5yZXBsYWNlKC9cXDBcXDAvZyxcIiVcIik7dT1HYShjKTtpZih1Lmxlbmd0aD5iKXJldHVybiAwO0ouc2V0KHUsYT4+PjApO3JldHVybiB1Lmxlbmd0aC0xfVxudmFyIEphPXthOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7KG5ldyBxYShhKSkuSWEoYj4+PjAsYz4+PjApO3JhPWE7c2ErKzt0aHJvdyByYTt9LGU6ZnVuY3Rpb24oKXtyZXR1cm4gMH0sSDpmdW5jdGlvbigpe30seDpmdW5jdGlvbigpe30sejpmdW5jdGlvbigpe30sazpmdW5jdGlvbigpe3JldHVybiAwfSxGOmZ1bmN0aW9uKCl7fSxCOmZ1bmN0aW9uKCl7fSxFOmZ1bmN0aW9uKCl7fSxnOmZ1bmN0aW9uKCl7fSx5OmZ1bmN0aW9uKCl7fSx2OmZ1bmN0aW9uKCl7fSxHOmZ1bmN0aW9uKCl7fSx3OmZ1bmN0aW9uKCl7fSxsOigpPT4hMCxvOmZ1bmN0aW9uKGEsYixjKXthPWIrMjA5NzE1Mj4+PjA8NDE5NDMwNS0hIWE/KGE+Pj4wKSs0Mjk0OTY3Mjk2KmI6TmFOO2M+Pj49MDthPW5ldyBEYXRlKDFFMyphKTtMW2M+PjI+Pj4wXT1hLmdldFVUQ1NlY29uZHMoKTtMW2MrND4+Mj4+PjBdPWEuZ2V0VVRDTWludXRlcygpO0xbYys4Pj4yPj4+MF09YS5nZXRVVENIb3VycygpO0xbYysxMj4+Mj4+PlxuMF09YS5nZXRVVENEYXRlKCk7TFtjKzE2Pj4yPj4+MF09YS5nZXRVVENNb250aCgpO0xbYysyMD4+Mj4+PjBdPWEuZ2V0VVRDRnVsbFllYXIoKS0xOTAwO0xbYysyND4+Mj4+PjBdPWEuZ2V0VVRDRGF5KCk7TFtjKzI4Pj4yPj4+MF09KGEuZ2V0VGltZSgpLURhdGUuVVRDKGEuZ2V0VVRDRnVsbFllYXIoKSwwLDEsMCwwLDAsMCkpLzg2NEU1fDB9LHA6ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO0xbYz4+Mj4+PjBdPWEuZ2V0U2Vjb25kcygpO0xbYys0Pj4yPj4+MF09YS5nZXRNaW51dGVzKCk7TFtjKzg+PjI+Pj4wXT1hLmdldEhvdXJzKCk7TFtjKzEyPj4yPj4+MF09YS5nZXREYXRlKCk7TFtjKzE2Pj4yPj4+MF09YS5nZXRNb250aCgpO0xbYysyMD4+Mj4+PjBdPWEuZ2V0RnVsbFllYXIoKS0xOTAwO0xbYysyND4+Mj4+PjBdPWEuZ2V0RGF5KCk7TFtjKzI4Pj4yPj4+XG4wXT0oVyhhLmdldEZ1bGxZZWFyKCkpP3ZhOndhKVthLmdldE1vbnRoKCldK2EuZ2V0RGF0ZSgpLTF8MDtMW2MrMzY+PjI+Pj4wXT0tKDYwKmEuZ2V0VGltZXpvbmVPZmZzZXQoKSk7Yj0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGY9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO0xbYyszMj4+Mj4+PjBdPShiIT1mJiZhLmdldFRpbWV6b25lT2Zmc2V0KCk9PU1hdGgubWluKGYsYikpfDB9LHE6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW5ldyBEYXRlKExbYSsyMD4+Mj4+PjBdKzE5MDAsTFthKzE2Pj4yPj4+MF0sTFthKzEyPj4yPj4+MF0sTFthKzg+PjI+Pj4wXSxMW2ErND4+Mj4+PjBdLExbYT4+Mj4+PjBdLDApLGM9TFthKzMyPj4yPj4+MF0sZj1iLmdldFRpbWV6b25lT2Zmc2V0KCksZz0obmV3IERhdGUoYi5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCksXG5oPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksMCwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxtPU1hdGgubWluKGgsZyk7MD5jP0xbYSszMj4+Mj4+PjBdPU51bWJlcihnIT1oJiZtPT1mKTowPGMhPShtPT1mKSYmKGc9TWF0aC5tYXgoaCxnKSxiLnNldFRpbWUoYi5nZXRUaW1lKCkrNkU0KigoMDxjP206ZyktZikpKTtMW2ErMjQ+PjI+Pj4wXT1iLmdldERheSgpO0xbYSsyOD4+Mj4+PjBdPShXKGIuZ2V0RnVsbFllYXIoKSk/dmE6d2EpW2IuZ2V0TW9udGgoKV0rYi5nZXREYXRlKCktMXwwO0xbYT4+Mj4+PjBdPWIuZ2V0U2Vjb25kcygpO0xbYSs0Pj4yPj4+MF09Yi5nZXRNaW51dGVzKCk7TFthKzg+PjI+Pj4wXT1iLmdldEhvdXJzKCk7TFthKzEyPj4yPj4+MF09Yi5nZXREYXRlKCk7TFthKzE2Pj4yPj4+MF09Yi5nZXRNb250aCgpO0xbYSsyMD4+Mj4+PjBdPWIuZ2V0WWVhcigpO2E9Yi5nZXRUaW1lKCkvMUUzO3JldHVybiBJYSgoUj1hLDE8PStNYXRoLmFicyhSKT8wPFI/K01hdGguZmxvb3IoUi9cbjQyOTQ5NjcyOTYpPj4+MDp+fitNYXRoLmNlaWwoKFItKyh+flI+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApKSxhPj4+MH0sbTpmdW5jdGlvbigpe3JldHVybi01Mn0sbjpmdW5jdGlvbigpe30sdDpmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZih3KXtyZXR1cm4odz13LnRvVGltZVN0cmluZygpLm1hdGNoKC9cXCgoW0EtWmEteiBdKylcXCkkLykpP3dbMV06XCJHTVRcIn1jPj4+PTA7dmFyIGc9KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpLGg9bmV3IERhdGUoZywwLDEpLG09bmV3IERhdGUoZyw2LDEpO2c9aC5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBxPW0uZ2V0VGltZXpvbmVPZmZzZXQoKTtNW2E+Pj4wPj4yPj4+MF09NjAqTWF0aC5tYXgoZyxxKTtMW2I+Pj4wPj4yPj4+MF09TnVtYmVyKGchPXEpO2E9ZihoKTtiPWYobSk7YT1CYShhKTtiPUJhKGIpO3E8Zz8oTVtjPj4yPj4+MF09YSxNW2MrND4+Mj4+PjBdPWIpOihNW2M+PjI+Pj4wXT1iLE1bYys0Pj4yPj4+MF09YSl9LGQ6KCk9PntHKFwiXCIpfSxcbmg6ZnVuY3Rpb24oKXtyZXR1cm4gRGF0ZS5ub3coKX0sdTpmdW5jdGlvbigpe3JldHVybiA0Mjk0OTAxNzYwfSxiOigpPT5wZXJmb3JtYW5jZS5ub3coKSxJOmZ1bmN0aW9uKGEsYixjKXtiPj4+PTA7cmV0dXJuIEsuY29weVdpdGhpbihhPj4+MD4+PjAsYj4+PjAsYisoYz4+PjApPj4+MCl9LHM6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPUsubGVuZ3RoO2lmKDQyOTQ5MDE3NjA8YSlyZXR1cm4hMTtmb3IodmFyIGM9MTs0Pj1jO2MqPTIpe3ZhciBmPWIqKDErLjIvYyk7Zj1NYXRoLm1pbihmLGErMTAwNjYzMjk2KTt2YXIgZz1NYXRoO2Y9TWF0aC5tYXgoYSxmKTthOntnPWcubWluLmNhbGwoZyw0Mjk0OTAxNzYwLGYrKDY1NTM2LWYlNjU1MzYpJTY1NTM2KS1ILmJ1ZmZlci5ieXRlTGVuZ3RoKzY1NTM1Pj4+MTY7dHJ5e0guZ3JvdyhnKTtlYSgpO3ZhciBoPTE7YnJlYWsgYX1jYXRjaChtKXt9aD12b2lkIDB9aWYoaClyZXR1cm4hMH1yZXR1cm4hMX0sQzpmdW5jdGlvbihhLGIpe2E+Pj49XG4wO2I+Pj49MDt2YXIgYz0wO0NhKCkuZm9yRWFjaChmdW5jdGlvbihmLGcpe3ZhciBoPWIrYztnPU1bYSs0Kmc+PjI+Pj4wXT1oO2ZvcihoPTA7aDxmLmxlbmd0aDsrK2gpSltnKys+PjA+Pj4wXT1mLmNoYXJDb2RlQXQoaCk7SltnPj4wPj4+MF09MDtjKz1mLmxlbmd0aCsxfSk7cmV0dXJuIDB9LEQ6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj4+Pj0wO3ZhciBjPUNhKCk7TVthPj4yPj4+MF09Yy5sZW5ndGg7dmFyIGY9MDtjLmZvckVhY2goZnVuY3Rpb24oZyl7Zis9Zy5sZW5ndGgrMX0pO01bYj4+Mj4+PjBdPWY7cmV0dXJuIDB9LGY6KCk9PjUyLGo6ZnVuY3Rpb24oKXtyZXR1cm4gNTJ9LHI6ZnVuY3Rpb24oKXtyZXR1cm4gNzB9LGk6ZnVuY3Rpb24oYSxiLGMsZil7Yj4+Pj0wO2M+Pj49MDtmPj4+PTA7Zm9yKHZhciBnPTAsaD0wO2g8YztoKyspe3ZhciBtPU1bYj4+Mj4+PjBdLHE9TVtiKzQ+PjI+Pj4wXTtiKz04O2Zvcih2YXIgdz0wO3c8cTt3Kyspe3ZhciB0PUtbbSt3Pj4+MF0sdT1cbkRhW2FdOzA9PT10fHwxMD09PXQ/KCgxPT09YT9jYTpFKSh1YSh1LDApKSx1Lmxlbmd0aD0wKTp1LnB1c2godCl9Zys9cX1NW2Y+PjI+Pj4wXT1nO3JldHVybiAwfSxBOkhhLGM6ZnVuY3Rpb24oYSxiLGMsZil7cmV0dXJuIEhhKGE+Pj4wLGI+Pj4wLGM+Pj4wLGY+Pj4wKX19O1xuKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShjKXtjPWMuZXhwb3J0cztJPWM9S2EoYyk7SD1JLko7ZWEoKTtoYS51bnNoaWZ0KEkuSyk7Ti0tO2QubW9uaXRvclJ1bkRlcGVuZGVuY2llcyYmZC5tb25pdG9yUnVuRGVwZW5kZW5jaWVzKE4pO2lmKDA9PU4mJihudWxsIT09TyYmKGNsZWFySW50ZXJ2YWwoTyksTz1udWxsKSxQKSl7dmFyIGY9UDtQPW51bGw7ZigpfXJldHVybiBjfXZhciBiPXthOkphfTtOKys7ZC5tb25pdG9yUnVuRGVwZW5kZW5jaWVzJiZkLm1vbml0b3JSdW5EZXBlbmRlbmNpZXMoTik7aWYoZC5pbnN0YW50aWF0ZVdhc20pdHJ5e3JldHVybiBkLmluc3RhbnRpYXRlV2FzbShiLGEpfWNhdGNoKGMpe0UoXCJNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiBcIitjKSxsKGMpfXBhKGIsZnVuY3Rpb24oYyl7YShjLmluc3RhbmNlKX0pLmNhdGNoKGwpO3JldHVybnt9fSkoKTtcbmQuX09ydEluaXQ9KGEsYik9PihkLl9PcnRJbml0PUkuTCkoYSxiKTtkLl9PcnRHZXRMYXN0RXJyb3I9KGEsYik9PihkLl9PcnRHZXRMYXN0RXJyb3I9SS5NKShhLGIpO2QuX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPShhLGIsYyxmLGcsaCxtLHEsdyx0KT0+KGQuX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPUkuTikoYSxiLGMsZixnLGgsbSxxLHcsdCk7ZC5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9KGEsYik9PihkLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj1JLk8pKGEsYik7ZC5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPShhLGIsYyk9PihkLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9SS5QKShhLGIsYyk7ZC5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PShhLGIsYyk9PihkLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9SS5RKShhLGIsYyk7ZC5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPWE9PihkLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9SS5SKShhKTtcbmQuX09ydENyZWF0ZVNlc3Npb249KGEsYixjKT0+KGQuX09ydENyZWF0ZVNlc3Npb249SS5TKShhLGIsYyk7ZC5fT3J0UmVsZWFzZVNlc3Npb249YT0+KGQuX09ydFJlbGVhc2VTZXNzaW9uPUkuVCkoYSk7ZC5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD0oYSxiLGMpPT4oZC5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD1JLlUpKGEsYixjKTtkLl9PcnRHZXRJbnB1dE5hbWU9KGEsYik9PihkLl9PcnRHZXRJbnB1dE5hbWU9SS5WKShhLGIpO2QuX09ydEdldE91dHB1dE5hbWU9KGEsYik9PihkLl9PcnRHZXRPdXRwdXROYW1lPUkuVykoYSxiKTtkLl9PcnRGcmVlPWE9PihkLl9PcnRGcmVlPUkuWCkoYSk7ZC5fT3J0Q3JlYXRlVGVuc29yPShhLGIsYyxmLGcsaCk9PihkLl9PcnRDcmVhdGVUZW5zb3I9SS5ZKShhLGIsYyxmLGcsaCk7ZC5fT3J0R2V0VGVuc29yRGF0YT0oYSxiLGMsZixnKT0+KGQuX09ydEdldFRlbnNvckRhdGE9SS5aKShhLGIsYyxmLGcpO1xuZC5fT3J0UmVsZWFzZVRlbnNvcj1hPT4oZC5fT3J0UmVsZWFzZVRlbnNvcj1JLl8pKGEpO2QuX09ydENyZWF0ZVJ1bk9wdGlvbnM9KGEsYixjLGYpPT4oZC5fT3J0Q3JlYXRlUnVuT3B0aW9ucz1JLiQpKGEsYixjLGYpO2QuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PShhLGIsYyk9PihkLl9PcnRBZGRSdW5Db25maWdFbnRyeT1JLmFhKShhLGIsYyk7ZC5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9YT0+KGQuX09ydFJlbGVhc2VSdW5PcHRpb25zPUkuYmEpKGEpO2QuX09ydENyZWF0ZUJpbmRpbmc9YT0+KGQuX09ydENyZWF0ZUJpbmRpbmc9SS5jYSkoYSk7ZC5fT3J0QmluZElucHV0PShhLGIsYyk9PihkLl9PcnRCaW5kSW5wdXQ9SS5kYSkoYSxiLGMpO2QuX09ydEJpbmRPdXRwdXQ9KGEsYixjLGYpPT4oZC5fT3J0QmluZE91dHB1dD1JLmVhKShhLGIsYyxmKTtkLl9PcnRDbGVhckJvdW5kT3V0cHV0cz1hPT4oZC5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9SS5mYSkoYSk7XG5kLl9PcnRSZWxlYXNlQmluZGluZz1hPT4oZC5fT3J0UmVsZWFzZUJpbmRpbmc9SS5nYSkoYSk7ZC5fT3J0UnVuV2l0aEJpbmRpbmc9KGEsYixjLGYsZyk9PihkLl9PcnRSdW5XaXRoQmluZGluZz1JLmhhKShhLGIsYyxmLGcpO2QuX09ydFJ1bj0oYSxiLGMsZixnLGgsbSxxKT0+KGQuX09ydFJ1bj1JLmlhKShhLGIsYyxmLGcsaCxtLHEpO2QuX09ydEVuZFByb2ZpbGluZz1hPT4oZC5fT3J0RW5kUHJvZmlsaW5nPUkuamEpKGEpO2QuX09ydFRyYWluaW5nTG9hZENoZWNrcG9pbnQ9KGEsYik9PihkLl9PcnRUcmFpbmluZ0xvYWRDaGVja3BvaW50PUkua2EpKGEsYik7ZC5fT3J0VHJhaW5pbmdSZWxlYXNlQ2hlY2twb2ludD1hPT4oZC5fT3J0VHJhaW5pbmdSZWxlYXNlQ2hlY2twb2ludD1JLmxhKShhKTtkLl9PcnRUcmFpbmluZ0NyZWF0ZVNlc3Npb249KGEsYixjLGYsZyxoLG0scSk9PihkLl9PcnRUcmFpbmluZ0NyZWF0ZVNlc3Npb249SS5tYSkoYSxiLGMsZixnLGgsbSxxKTtcbmQuX09ydFRyYWluaW5nTGF6eVJlc2V0R3JhZD1hPT4oZC5fT3J0VHJhaW5pbmdMYXp5UmVzZXRHcmFkPUkubmEpKGEpO2QuX09ydFRyYWluaW5nUnVuVHJhaW5TdGVwPShhLGIsYyxmLGcsaCk9PihkLl9PcnRUcmFpbmluZ1J1blRyYWluU3RlcD1JLm9hKShhLGIsYyxmLGcsaCk7ZC5fT3J0VHJhaW5pbmdPcHRpbWl6ZXJTdGVwPShhLGIpPT4oZC5fT3J0VHJhaW5pbmdPcHRpbWl6ZXJTdGVwPUkucGEpKGEsYik7ZC5fT3J0VHJhaW5pbmdFdmFsU3RlcD0oYSxiLGMsZixnLGgpPT4oZC5fT3J0VHJhaW5pbmdFdmFsU3RlcD1JLnFhKShhLGIsYyxmLGcsaCk7ZC5fT3J0VHJhaW5pbmdHZXRQYXJhbWV0ZXJzU2l6ZT0oYSxiLGMpPT4oZC5fT3J0VHJhaW5pbmdHZXRQYXJhbWV0ZXJzU2l6ZT1JLnJhKShhLGIsYyk7ZC5fT3J0VHJhaW5pbmdDb3B5UGFyYW1ldGVyc1RvQnVmZmVyPShhLGIsYyxmKT0+KGQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNUb0J1ZmZlcj1JLnNhKShhLGIsYyxmKTtcbmQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNGcm9tQnVmZmVyPShhLGIsYyxmKT0+KGQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNGcm9tQnVmZmVyPUkudGEpKGEsYixjLGYpO2QuX09ydFRyYWluaW5nUmVsZWFzZVNlc3Npb249YT0+KGQuX09ydFRyYWluaW5nUmVsZWFzZVNlc3Npb249SS51YSkoYSk7dmFyIEFhPWQuX21hbGxvYz1hPT4oQWE9ZC5fbWFsbG9jPUkudmEpKGEpO2QuX2ZyZWU9YT0+KGQuX2ZyZWU9SS53YSkoYSk7dmFyIElhPWE9PihJYT1JLnlhKShhKSxMYT0oKT0+KExhPUkuemEpKCksTWE9YT0+KE1hPUkuQWEpKGEpLE5hPWE9PihOYT1JLkJhKShhKTtcbmZ1bmN0aW9uIEthKGEpe2E9T2JqZWN0LmFzc2lnbih7fSxhKTt2YXIgYj1mPT4oKT0+ZigpPj4+MCxjPWY9Pmc9PmYoZyk+Pj4wO2EuX19lcnJub19sb2NhdGlvbj1iKGEuX19lcnJub19sb2NhdGlvbik7YS5tYWxsb2M9YyhhLm1hbGxvYyk7YS5zdGFja1NhdmU9YihhLnN0YWNrU2F2ZSk7YS5zdGFja0FsbG9jPWMoYS5zdGFja0FsbG9jKTtyZXR1cm4gYX1kLnN0YWNrQWxsb2M9TmE7ZC5zdGFja1NhdmU9TGE7ZC5zdGFja1Jlc3RvcmU9TWE7ZC5VVEY4VG9TdHJpbmc9VDtkLnN0cmluZ1RvVVRGOD0oYSxiLGMpPT5WKGEsSyxiLGMpO2QubGVuZ3RoQnl0ZXNVVEY4PVU7dmFyIFo7UD1mdW5jdGlvbiBPYSgpe1p8fFBhKCk7Wnx8KFA9T2EpfTtcbmZ1bmN0aW9uIFBhKCl7ZnVuY3Rpb24gYSgpe2lmKCFaJiYoWj0hMCxkLmNhbGxlZFJ1bj0hMCwhZGEpKXtTKGhhKTtrKGQpO2lmKGQub25SdW50aW1lSW5pdGlhbGl6ZWQpZC5vblJ1bnRpbWVJbml0aWFsaXplZCgpO2lmKGQucG9zdFJ1bilmb3IoXCJmdW5jdGlvblwiPT10eXBlb2YgZC5wb3N0UnVuJiYoZC5wb3N0UnVuPVtkLnBvc3RSdW5dKTtkLnBvc3RSdW4ubGVuZ3RoOyl7dmFyIGI9ZC5wb3N0UnVuLnNoaWZ0KCk7aWEudW5zaGlmdChiKX1TKGlhKX19aWYoISgwPE4pKXtpZihkLnByZVJ1bilmb3IoXCJmdW5jdGlvblwiPT10eXBlb2YgZC5wcmVSdW4mJihkLnByZVJ1bj1bZC5wcmVSdW5dKTtkLnByZVJ1bi5sZW5ndGg7KWphKCk7UyhmYSk7MDxOfHwoZC5zZXRTdGF0dXM/KGQuc2V0U3RhdHVzKFwiUnVubmluZy4uLlwiKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2V0VGltZW91dChmdW5jdGlvbigpe2Quc2V0U3RhdHVzKFwiXCIpfSwxKTthKCl9LDEpKTphKCkpfX1cbmlmKGQucHJlSW5pdClmb3IoXCJmdW5jdGlvblwiPT10eXBlb2YgZC5wcmVJbml0JiYoZC5wcmVJbml0PVtkLnByZUluaXRdKTswPGQucHJlSW5pdC5sZW5ndGg7KWQucHJlSW5pdC5wb3AoKSgpO1BhKCk7XG5cblxuICByZXR1cm4gbW9kdWxlQXJnLnJlYWR5XG59XG5cbik7XG59KSgpO1xuaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JylcbiAgbW9kdWxlLmV4cG9ydHMgPSBvcnRXYXNtO1xuZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmVbJ2FtZCddKVxuICBkZWZpbmUoW10sICgpID0+IG9ydFdhc20pO1xuIiwgIiIsICIiLCAiZXhwb3J0IGNvbnN0IGNwdXMgPSB1bmRlZmluZWQ7IiwgIlxudmFyIG9ydFdhc21UaHJlYWRlZCA9ICgoKSA9PiB7XG4gIHZhciBfc2NyaXB0RGlyID0gdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5jdXJyZW50U2NyaXB0ID8gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmMgOiB1bmRlZmluZWQ7XG4gIGlmICh0eXBlb2YgX19maWxlbmFtZSAhPT0gJ3VuZGVmaW5lZCcpIF9zY3JpcHREaXIgPSBfc2NyaXB0RGlyIHx8IF9fZmlsZW5hbWU7XG4gIHJldHVybiAoXG5mdW5jdGlvbihtb2R1bGVBcmcgPSB7fSkge1xuXG5mdW5jdGlvbiBoKCl7bS5idWZmZXIhPW4uYnVmZmVyJiZwKCk7cmV0dXJuIG59ZnVuY3Rpb24gdCgpe20uYnVmZmVyIT1uLmJ1ZmZlciYmcCgpO3JldHVybiBhYX1mdW5jdGlvbiB2KCl7bS5idWZmZXIhPW4uYnVmZmVyJiZwKCk7cmV0dXJuIGJhfWZ1bmN0aW9uIGNhKCl7bS5idWZmZXIhPW4uYnVmZmVyJiZwKCk7cmV0dXJuIGRhfWZ1bmN0aW9uIHcoKXttLmJ1ZmZlciE9bi5idWZmZXImJnAoKTtyZXR1cm4gZWF9ZnVuY3Rpb24geigpe20uYnVmZmVyIT1uLmJ1ZmZlciYmcCgpO3JldHVybiBmYX1mdW5jdGlvbiBoYSgpe20uYnVmZmVyIT1uLmJ1ZmZlciYmcCgpO3JldHVybiBpYX12YXIgQT1tb2R1bGVBcmcsamEsa2E7QS5yZWFkeT1uZXcgUHJvbWlzZSgoYSxiKT0+e2phPWE7a2E9Yn0pO1xudmFyIGxhPU9iamVjdC5hc3NpZ24oe30sQSksbWE9XCIuL3RoaXMucHJvZ3JhbVwiLG5hPShhLGIpPT57dGhyb3cgYjt9LG9hPVwib2JqZWN0XCI9PXR5cGVvZiB3aW5kb3csQj1cImZ1bmN0aW9uXCI9PXR5cGVvZiBpbXBvcnRTY3JpcHRzLEQ9XCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MmJlwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zJiZcInN0cmluZ1wiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlLEU9QS5FTlZJUk9OTUVOVF9JU19QVEhSRUFEfHwhMSxGPVwiXCI7ZnVuY3Rpb24gcGEoYSl7cmV0dXJuIEEubG9jYXRlRmlsZT9BLmxvY2F0ZUZpbGUoYSxGKTpGK2F9dmFyIHFhLHJhLHNhO1xuaWYoRCl7dmFyIGZzPXJlcXVpcmUoXCJmc1wiKSx0YT1yZXF1aXJlKFwicGF0aFwiKTtGPUI/dGEuZGlybmFtZShGKStcIi9cIjpfX2Rpcm5hbWUrXCIvXCI7cWE9KGIsYyk9PntiPWIuc3RhcnRzV2l0aChcImZpbGU6Ly9cIik/bmV3IFVSTChiKTp0YS5ub3JtYWxpemUoYik7cmV0dXJuIGZzLnJlYWRGaWxlU3luYyhiLGM/dm9pZCAwOlwidXRmOFwiKX07c2E9Yj0+e2I9cWEoYiwhMCk7Yi5idWZmZXJ8fChiPW5ldyBVaW50OEFycmF5KGIpKTtyZXR1cm4gYn07cmE9KGIsYyxkLGU9ITApPT57Yj1iLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpP25ldyBVUkwoYik6dGEubm9ybWFsaXplKGIpO2ZzLnJlYWRGaWxlKGIsZT92b2lkIDA6XCJ1dGY4XCIsKGYsayk9PntmP2QoZik6YyhlP2suYnVmZmVyOmspfSl9OyFBLnRoaXNQcm9ncmFtJiYxPHByb2Nlc3MuYXJndi5sZW5ndGgmJihtYT1wcm9jZXNzLmFyZ3ZbMV0ucmVwbGFjZSgvXFxcXC9nLFwiL1wiKSk7cHJvY2Vzcy5hcmd2LnNsaWNlKDIpO25hPShiLGMpPT57cHJvY2Vzcy5leGl0Q29kZT1cbmI7dGhyb3cgYzt9O0EuaW5zcGVjdD0oKT0+XCJbRW1zY3JpcHRlbiBNb2R1bGUgb2JqZWN0XVwiO2xldCBhO3RyeXthPXJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKX1jYXRjaChiKXt0aHJvdyBjb25zb2xlLmVycm9yKCdUaGUgXCJ3b3JrZXJfdGhyZWFkc1wiIG1vZHVsZSBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgbm9kZS5qcyBidWlsZCAtIHBlcmhhcHMgYSBuZXdlciB2ZXJzaW9uIGlzIG5lZWRlZD8nKSxiO31nbG9iYWwuV29ya2VyPWEuV29ya2VyfWVsc2UgaWYob2F8fEIpQj9GPXNlbGYubG9jYXRpb24uaHJlZjpcInVuZGVmaW5lZFwiIT10eXBlb2YgZG9jdW1lbnQmJmRvY3VtZW50LmN1cnJlbnRTY3JpcHQmJihGPWRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjKSwodHlwZW9mIF9zY3JpcHREaXIgIT09IFwidW5kZWZpbmVkXCIgJiYgX3NjcmlwdERpcikmJihGPV9zY3JpcHREaXIpLDAhPT1GLmluZGV4T2YoXCJibG9iOlwiKT9GPUYuc3Vic3RyKDAsRi5yZXBsYWNlKC9bPyNdLiovLFwiXCIpLmxhc3RJbmRleE9mKFwiL1wiKSsxKTpGPVwiXCIsRHx8KHFhPWE9Pnt2YXIgYj1cbm5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnNlbmQobnVsbCk7cmV0dXJuIGIucmVzcG9uc2VUZXh0fSxCJiYoc2E9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7Yi5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheShiLnJlc3BvbnNlKX0pLHJhPShhLGIsYyk9Pnt2YXIgZD1uZXcgWE1MSHR0cFJlcXVlc3Q7ZC5vcGVuKFwiR0VUXCIsYSwhMCk7ZC5yZXNwb25zZVR5cGU9XCJhcnJheWJ1ZmZlclwiO2Qub25sb2FkPSgpPT57MjAwPT1kLnN0YXR1c3x8MD09ZC5zdGF0dXMmJmQucmVzcG9uc2U/YihkLnJlc3BvbnNlKTpjKCl9O2Qub25lcnJvcj1jO2Quc2VuZChudWxsKX0pO0QmJlwidW5kZWZpbmVkXCI9PXR5cGVvZiBwZXJmb3JtYW5jZSYmKGdsb2JhbC5wZXJmb3JtYW5jZT1yZXF1aXJlKFwicGVyZl9ob29rc1wiKS5wZXJmb3JtYW5jZSk7XG52YXIgdWE9Y29uc29sZS5sb2cuYmluZChjb25zb2xlKSx2YT1jb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSk7RCYmKHVhPSguLi5hKT0+ZnMud3JpdGVTeW5jKDEsYS5qb2luKFwiIFwiKStcIlxcblwiKSx2YT0oLi4uYSk9PmZzLndyaXRlU3luYygyLGEuam9pbihcIiBcIikrXCJcXG5cIikpO3ZhciB3YT11YSxHPXZhO09iamVjdC5hc3NpZ24oQSxsYSk7bGE9bnVsbDt2YXIgbm9FeGl0UnVudGltZT0hMDtcIm9iamVjdFwiIT10eXBlb2YgV2ViQXNzZW1ibHkmJkgoXCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkXCIpO3ZhciBtLHhhLHlhPSExLEksbixhYSxiYSxkYSxlYSxmYSx6YSxKLEFhLGlhO1xuZnVuY3Rpb24gcCgpe3ZhciBhPW0uYnVmZmVyO0EuSEVBUDg9bj1uZXcgSW50OEFycmF5KGEpO0EuSEVBUDE2PWJhPW5ldyBJbnQxNkFycmF5KGEpO0EuSEVBUFU4PWFhPW5ldyBVaW50OEFycmF5KGEpO0EuSEVBUFUxNj1kYT1uZXcgVWludDE2QXJyYXkoYSk7QS5IRUFQMzI9ZWE9bmV3IEludDMyQXJyYXkoYSk7QS5IRUFQVTMyPWZhPW5ldyBVaW50MzJBcnJheShhKTtBLkhFQVBGMzI9emE9bmV3IEZsb2F0MzJBcnJheShhKTtBLkhFQVBGNjQ9aWE9bmV3IEZsb2F0NjRBcnJheShhKTtBLkhFQVA2ND1KPW5ldyBCaWdJbnQ2NEFycmF5KGEpO0EuSEVBUFU2ND1BYT1uZXcgQmlnVWludDY0QXJyYXkoYSl9dmFyIEJhPTE2Nzc3MjE2OzUyNDI4ODA8PUJhfHxIKFwiSU5JVElBTF9NRU1PUlkgc2hvdWxkIGJlIGxhcmdlciB0aGFuIFNUQUNLX1NJWkUsIHdhcyBcIitCYStcIiEgKFNUQUNLX1NJWkU9NTI0Mjg4MClcIik7XG5pZihFKW09QS53YXNtTWVtb3J5O2Vsc2UgaWYobT1uZXcgV2ViQXNzZW1ibHkuTWVtb3J5KHtpbml0aWFsOkJhLzY1NTM2LG1heGltdW06NjU1MzYsc2hhcmVkOiEwfSksIShtLmJ1ZmZlciBpbnN0YW5jZW9mIFNoYXJlZEFycmF5QnVmZmVyKSl0aHJvdyBHKFwicmVxdWVzdGVkIGEgc2hhcmVkIFdlYkFzc2VtYmx5Lk1lbW9yeSBidXQgdGhlIHJldHVybmVkIGJ1ZmZlciBpcyBub3QgYSBTaGFyZWRBcnJheUJ1ZmZlciwgaW5kaWNhdGluZyB0aGF0IHdoaWxlIHRoZSBicm93c2VyIGhhcyBTaGFyZWRBcnJheUJ1ZmZlciBpdCBkb2VzIG5vdCBoYXZlIFdlYkFzc2VtYmx5IHRocmVhZHMgc3VwcG9ydCAtIHlvdSBtYXkgbmVlZCB0byBzZXQgYSBmbGFnXCIpLEQmJkcoXCIob24gbm9kZSB5b3UgbWF5IG5lZWQ6IC0tZXhwZXJpbWVudGFsLXdhc20tdGhyZWFkcyAtLWV4cGVyaW1lbnRhbC13YXNtLWJ1bGstbWVtb3J5IGFuZC9vciByZWNlbnQgdmVyc2lvbilcIiksRXJyb3IoXCJiYWQgbWVtb3J5XCIpO1xucCgpO0JhPW0uYnVmZmVyLmJ5dGVMZW5ndGg7dmFyIENhPVtdLERhPVtdLEVhPVtdLEZhPTA7ZnVuY3Rpb24gR2EoKXtyZXR1cm4gbm9FeGl0UnVudGltZXx8MDxGYX12YXIgSz0wLEhhPW51bGwsTD1udWxsO2Z1bmN0aW9uIElhKCl7Sy0tO2lmKDA9PUsmJihudWxsIT09SGEmJihjbGVhckludGVydmFsKEhhKSxIYT1udWxsKSxMKSl7dmFyIGE9TDtMPW51bGw7YSgpfX1mdW5jdGlvbiBIKGEpe2E9XCJBYm9ydGVkKFwiK2ErXCIpXCI7RyhhKTt5YT0hMDtJPTE7YT1uZXcgV2ViQXNzZW1ibHkuUnVudGltZUVycm9yKGErXCIuIEJ1aWxkIHdpdGggLXNBU1NFUlRJT05TIGZvciBtb3JlIGluZm8uXCIpO2thKGEpO3Rocm93IGE7fWZ1bmN0aW9uIEphKGEpe3JldHVybiBhLnN0YXJ0c1dpdGgoXCJkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtiYXNlNjQsXCIpfXZhciBNO009XCJvcnQtd2FzbS10aHJlYWRlZC53YXNtXCI7SmEoTSl8fChNPXBhKE0pKTtcbmZ1bmN0aW9uIEthKGEpe2lmKHNhKXJldHVybiBzYShhKTt0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjt9ZnVuY3Rpb24gTGEoYSl7aWYob2F8fEIpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGZldGNoJiYhYS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKSlyZXR1cm4gZmV0Y2goYSx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSkudGhlbihiPT57aWYoIWIub2spdGhyb3dcImZhaWxlZCB0byBsb2FkIHdhc20gYmluYXJ5IGZpbGUgYXQgJ1wiK2ErXCInXCI7cmV0dXJuIGIuYXJyYXlCdWZmZXIoKX0pLmNhdGNoKCgpPT5LYShhKSk7aWYocmEpcmV0dXJuIG5ldyBQcm9taXNlKChiLGMpPT57cmEoYSxkPT5iKG5ldyBVaW50OEFycmF5KGQpKSxjKX0pfXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT5LYShhKSl9XG5mdW5jdGlvbiBNYShhLGIsYyl7cmV0dXJuIExhKGEpLnRoZW4oZD0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoZCxiKSkudGhlbihkPT5kKS50aGVuKGMsZD0+e0coYGZhaWxlZCB0byBhc3luY2hyb25vdXNseSBwcmVwYXJlIHdhc206ICR7ZH1gKTtIKGQpfSl9XG5mdW5jdGlvbiBOYShhLGIpe3ZhciBjPU07cmV0dXJuXCJmdW5jdGlvblwiIT10eXBlb2YgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmd8fEphKGMpfHxjLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpfHxEfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBmZXRjaD9NYShjLGEsYik6ZmV0Y2goYyx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSkudGhlbihkPT5XZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhkLGEpLnRoZW4oYixmdW5jdGlvbihlKXtHKGB3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogJHtlfWApO0coXCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvblwiKTtyZXR1cm4gTWEoYyxhLGIpfSkpfWZ1bmN0aW9uIE9hKGEpe3RoaXMubmFtZT1cIkV4aXRTdGF0dXNcIjt0aGlzLm1lc3NhZ2U9YFByb2dyYW0gdGVybWluYXRlZCB3aXRoIGV4aXQoJHthfSlgO3RoaXMuc3RhdHVzPWF9XG52YXIgUGE9YT0+e2EudGVybWluYXRlKCk7YS5vbm1lc3NhZ2U9KCk9Pnt9fSxRYT1hPT57aWYoMD09Ty5xYi5sZW5ndGgpe3ZhciBiPXBhKFwib3J0LXdhc20tdGhyZWFkZWQud29ya2VyLmpzXCIpO2I9bmV3IFdvcmtlcihiKTtPLnFiLnB1c2goYik7Ty5KYihPLnFiWzBdKX1iPU8ucWIucG9wKCk7aWYoIWIpcmV0dXJuIDY7Ty5uYi5wdXNoKGIpO08uamJbYS5tYl09YjtiLm1iPWEubWI7dmFyIGM9e2NtZDpcInJ1blwiLHN0YXJ0X3JvdXRpbmU6YS5NYixhcmc6YS5GYixwdGhyZWFkX3B0cjphLm1ifTtEJiZiLnVucmVmKCk7Yi5wb3N0TWVzc2FnZShjLGEuU2IpO3JldHVybiAwfSxSYT1cInVuZGVmaW5lZFwiIT10eXBlb2YgVGV4dERlY29kZXI/bmV3IFRleHREZWNvZGVyKFwidXRmOFwiKTp2b2lkIDAsU2E9KGEsYixjKT0+e2I+Pj49MDt2YXIgZD1iK2M7Zm9yKGM9YjthW2NdJiYhKGM+PWQpOykrK2M7aWYoMTY8Yy1iJiZhLmJ1ZmZlciYmUmEpcmV0dXJuIFJhLmRlY29kZShhLmJ1ZmZlciBpbnN0YW5jZW9mXG5TaGFyZWRBcnJheUJ1ZmZlcj9hLnNsaWNlKGIsYyk6YS5zdWJhcnJheShiLGMpKTtmb3IoZD1cIlwiO2I8Yzspe3ZhciBlPWFbYisrXTtpZihlJjEyOCl7dmFyIGY9YVtiKytdJjYzO2lmKDE5Mj09KGUmMjI0KSlkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKChlJjMxKTw8NnxmKTtlbHNle3ZhciBrPWFbYisrXSY2MztlPTIyND09KGUmMjQwKT8oZSYxNSk8PDEyfGY8PDZ8azooZSY3KTw8MTh8Zjw8MTJ8azw8NnxhW2IrK10mNjM7NjU1MzY+ZT9kKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGUpOihlLT02NTUzNixkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGU+PjEwLDU2MzIwfGUmMTAyMykpfX1lbHNlIGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoZSl9cmV0dXJuIGR9LFRhPShhLGIpPT4oYT4+Pj0wKT9TYSh0KCksYSxiKTpcIlwiO2Z1bmN0aW9uIFVhKGEpe2lmKEUpcmV0dXJuIFAoMCwxLGEpO0k9YTtHYSgpfHwoTy5OYigpLHlhPSEwKTtuYShhLG5ldyBPYShhKSl9XG52YXIgV2E9YT0+e0k9YTtpZihFKXRocm93IFZhKGEpLFwidW53aW5kXCI7VWEoYSl9O2Z1bmN0aW9uIFhhKCl7Q2EudW5zaGlmdCgoKT0+e0srKztJYSgpfSl9XG52YXIgTz17cWI6W10sbmI6W10sRWI6W10samI6e30sdmIoKXtFPyhPLnJlY2VpdmVPYmplY3RUcmFuc2Zlcj1PLkxiLE8udGhyZWFkSW5pdFRMUz1PLkRiLE8uc2V0RXhpdFN0YXR1cz1PLkNiLG5vRXhpdFJ1bnRpbWU9ITEpOlhhKCl9LENiOmE9PntJPWF9LFZiOltcIiR0ZXJtaW5hdGVXb3JrZXJcIl0sTmI6KCk9Pntmb3IodmFyIGEgb2YgTy5uYilQYShhKTtmb3IoYSBvZiBPLnFiKVBhKGEpO08ucWI9W107Ty5uYj1bXTtPLmpiPVtdfSxCYjphPT57dmFyIGI9YS5tYjtkZWxldGUgTy5qYltiXTtPLnFiLnB1c2goYSk7Ty5uYi5zcGxpY2UoTy5uYi5pbmRleE9mKGEpLDEpO2EubWI9MDtZYShiKX0sTGIoKXt9LERiKCl7Ty5FYi5mb3JFYWNoKGE9PmEoKSl9LEpiOmE9Pm5ldyBQcm9taXNlKGI9PnthLm9ubWVzc2FnZT1mPT57Zj1mLmRhdGE7dmFyIGs9Zi5jbWQ7aWYoZi50YXJnZXRUaHJlYWQmJmYudGFyZ2V0VGhyZWFkIT1aYSgpKXt2YXIgbD1PLmpiW2YudGFyZ2V0VGhyZWFkXTtsP1xubC5wb3N0TWVzc2FnZShmLGYudHJhbnNmZXJMaXN0KTpHKGBJbnRlcm5hbCBlcnJvciEgV29ya2VyIHNlbnQgYSBtZXNzYWdlIFwiJHtrfVwiIHRvIHRhcmdldCBwdGhyZWFkICR7Zi50YXJnZXRUaHJlYWR9LCBidXQgdGhhdCB0aHJlYWQgbm8gbG9uZ2VyIGV4aXN0cyFgKX1lbHNlIGlmKFwiY2hlY2tNYWlsYm94XCI9PT1rKSRhKCk7ZWxzZSBpZihcInNwYXduVGhyZWFkXCI9PT1rKVFhKGYpO2Vsc2UgaWYoXCJjbGVhbnVwVGhyZWFkXCI9PT1rKShmPU8uamJbZi50aHJlYWRdKXx8SCgpLE8uQmIoZik7ZWxzZSBpZihcImtpbGxUaHJlYWRcIj09PWspZj1mLnRocmVhZCxrPU8uamJbZl0sZGVsZXRlIE8uamJbZl0sUGEoayksWWEoZiksTy5uYi5zcGxpY2UoTy5uYi5pbmRleE9mKGspLDEpLGsubWI9MDtlbHNlIGlmKFwiY2FuY2VsVGhyZWFkXCI9PT1rKU8uamJbZi50aHJlYWRdLnBvc3RNZXNzYWdlKHtjbWQ6XCJjYW5jZWxcIn0pO2Vsc2UgaWYoXCJsb2FkZWRcIj09PWspYS5sb2FkZWQ9ITAsYihhKTtlbHNlIGlmKFwiYWxlcnRcIj09PVxuaylhbGVydChgVGhyZWFkICR7Zi50aHJlYWRJZH06ICR7Zi50ZXh0fWApO2Vsc2UgaWYoXCJzZXRpbW1lZGlhdGVcIj09PWYudGFyZ2V0KWEucG9zdE1lc3NhZ2UoZik7ZWxzZSBpZihcImNhbGxIYW5kbGVyXCI9PT1rKUFbZi5oYW5kbGVyXSguLi5mLmFyZ3MpO2Vsc2UgayYmRyhgd29ya2VyIHNlbnQgYW4gdW5rbm93biBjb21tYW5kICR7a31gKX07YS5vbmVycm9yPWY9PntHKGAke1wid29ya2VyIHNlbnQgYW4gZXJyb3IhXCJ9ICR7Zi5maWxlbmFtZX06JHtmLmxpbmVub306ICR7Zi5tZXNzYWdlfWApO3Rocm93IGY7fTtEJiYoYS5vbihcIm1lc3NhZ2VcIixmPT5hLm9ubWVzc2FnZSh7ZGF0YTpmfSkpLGEub24oXCJlcnJvclwiLGY9PmEub25lcnJvcihmKSkpO3ZhciBjPVtdLGQ9W10sZTtmb3IoZSBvZiBkKUEuaGFzT3duUHJvcGVydHkoZSkmJmMucHVzaChlKTthLnBvc3RNZXNzYWdlKHtjbWQ6XCJsb2FkXCIsaGFuZGxlcnM6Yyx1cmxPckJsb2I6QS5tYWluU2NyaXB0VXJsT3JCbG9ifHxfc2NyaXB0RGlyLFxud2FzbU1lbW9yeTptLHdhc21Nb2R1bGU6eGF9KX0pfTtBLlBUaHJlYWQ9Tzt2YXIgYWI9YT0+e2Zvcig7MDxhLmxlbmd0aDspYS5zaGlmdCgpKEEpfTtBLmVzdGFibGlzaFN0YWNrU3BhY2U9KCk9Pnt2YXIgYT1aYSgpLGI9eigpW2ErNTI+Pj4yPj4+MF07YT16KClbYSs1Nj4+PjI+Pj4wXTtiYihiLGItYSk7Y2IoYil9O2Z1bmN0aW9uIFZhKGEpe2lmKEUpcmV0dXJuIFAoMSwwLGEpO1dhKGEpfXZhciBkYj1bXSxlYjtBLmludm9rZUVudHJ5UG9pbnQ9KGEsYik9Pnt2YXIgYz1kYlthXTtjfHwoYT49ZGIubGVuZ3RoJiYoZGIubGVuZ3RoPWErMSksZGJbYV09Yz1lYi5nZXQoYSkpO2E9YyhiKTtHYSgpP08uQ2IoYSk6ZmIoYSl9O1xuZnVuY3Rpb24gZ2IoYSl7dGhpcy5zYj1hLTI0O3RoaXMuS2I9ZnVuY3Rpb24oYil7eigpW3RoaXMuc2IrND4+PjI+Pj4wXT1ifTt0aGlzLnhiPWZ1bmN0aW9uKGIpe3ooKVt0aGlzLnNiKzg+Pj4yPj4+MF09Yn07dGhpcy52Yj1mdW5jdGlvbihiLGMpe3RoaXMud2IoKTt0aGlzLktiKGIpO3RoaXMueGIoYyl9O3RoaXMud2I9ZnVuY3Rpb24oKXt6KClbdGhpcy5zYisxNj4+PjI+Pj4wXT0wfX12YXIgaGI9MCxpYj0wO2Z1bmN0aW9uIGpiKGEsYixjLGQpe3JldHVybiBFP1AoMiwxLGEsYixjLGQpOmtiKGEsYixjLGQpfVxuZnVuY3Rpb24ga2IoYSxiLGMsZCl7YT4+Pj0wO2I+Pj49MDtjPj4+PTA7ZD4+Pj0wO2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlcilyZXR1cm4gRyhcIkN1cnJlbnQgZW52aXJvbm1lbnQgZG9lcyBub3Qgc3VwcG9ydCBTaGFyZWRBcnJheUJ1ZmZlciwgcHRocmVhZHMgYXJlIG5vdCBhdmFpbGFibGUhXCIpLDY7dmFyIGU9W107aWYoRSYmMD09PWUubGVuZ3RoKXJldHVybiBqYihhLGIsYyxkKTthPXtNYjpjLG1iOmEsRmI6ZCxTYjplfTtyZXR1cm4gRT8oYS5VYj1cInNwYXduVGhyZWFkXCIscG9zdE1lc3NhZ2UoYSxlKSwwKTpRYShhKX1mdW5jdGlvbiBsYihhLGIsYyl7cmV0dXJuIEU/UCgzLDEsYSxiLGMpOjB9ZnVuY3Rpb24gbWIoYSxiKXtpZihFKXJldHVybiBQKDQsMSxhLGIpfVxudmFyIG5iPWE9Pntmb3IodmFyIGI9MCxjPTA7YzxhLmxlbmd0aDsrK2Mpe3ZhciBkPWEuY2hhckNvZGVBdChjKTsxMjc+PWQ/YisrOjIwNDc+PWQ/Yis9Mjo1NTI5Njw9ZCYmNTczNDM+PWQ/KGIrPTQsKytjKTpiKz0zfXJldHVybiBifSxvYj0oYSxiLGMsZCk9PntjPj4+PTA7aWYoISgwPGQpKXJldHVybiAwO3ZhciBlPWM7ZD1jK2QtMTtmb3IodmFyIGY9MDtmPGEubGVuZ3RoOysrZil7dmFyIGs9YS5jaGFyQ29kZUF0KGYpO2lmKDU1Mjk2PD1rJiY1NzM0Mz49ayl7dmFyIGw9YS5jaGFyQ29kZUF0KCsrZik7az02NTUzNisoKGsmMTAyMyk8PDEwKXxsJjEwMjN9aWYoMTI3Pj1rKXtpZihjPj1kKWJyZWFrO2JbYysrPj4+MF09a31lbHNle2lmKDIwNDc+PWspe2lmKGMrMT49ZClicmVhaztiW2MrKz4+PjBdPTE5MnxrPj42fWVsc2V7aWYoNjU1MzU+PWspe2lmKGMrMj49ZClicmVhaztiW2MrKz4+PjBdPTIyNHxrPj4xMn1lbHNle2lmKGMrMz49ZClicmVhaztiW2MrKz4+PjBdPTI0MHxrPj5cbjE4O2JbYysrPj4+MF09MTI4fGs+PjEyJjYzfWJbYysrPj4+MF09MTI4fGs+PjYmNjN9YltjKys+Pj4wXT0xMjh8ayY2M319YltjPj4+MF09MDtyZXR1cm4gYy1lfSxwYj0oYSxiLGMpPT5vYihhLHQoKSxiLGMpO2Z1bmN0aW9uIHFiKGEsYil7aWYoRSlyZXR1cm4gUCg1LDEsYSxiKX1mdW5jdGlvbiByYihhLGIsYyl7aWYoRSlyZXR1cm4gUCg2LDEsYSxiLGMpfWZ1bmN0aW9uIHNiKGEsYixjKXtyZXR1cm4gRT9QKDcsMSxhLGIsYyk6MH1mdW5jdGlvbiB0YihhLGIpe2lmKEUpcmV0dXJuIFAoOCwxLGEsYil9ZnVuY3Rpb24gdWIoYSxiLGMpe2lmKEUpcmV0dXJuIFAoOSwxLGEsYixjKX1mdW5jdGlvbiB2YihhLGIsYyxkKXtpZihFKXJldHVybiBQKDEwLDEsYSxiLGMsZCl9ZnVuY3Rpb24gd2IoYSxiLGMsZCl7aWYoRSlyZXR1cm4gUCgxMSwxLGEsYixjLGQpfWZ1bmN0aW9uIHhiKGEsYixjLGQpe2lmKEUpcmV0dXJuIFAoMTIsMSxhLGIsYyxkKX1cbmZ1bmN0aW9uIHliKGEpe2lmKEUpcmV0dXJuIFAoMTMsMSxhKX1mdW5jdGlvbiB6YihhLGIpe2lmKEUpcmV0dXJuIFAoMTQsMSxhLGIpfWZ1bmN0aW9uIEFiKGEsYixjKXtpZihFKXJldHVybiBQKDE1LDEsYSxiLGMpfXZhciBCYj1hPT57aWYobnVsbD09PWEpcmV0dXJuXCJudWxsXCI7dmFyIGI9dHlwZW9mIGE7cmV0dXJuXCJvYmplY3RcIj09PWJ8fFwiYXJyYXlcIj09PWJ8fFwiZnVuY3Rpb25cIj09PWI/YS50b1N0cmluZygpOlwiXCIrYX0sQ2IsUj1hPT57Zm9yKHZhciBiPVwiXCI7dCgpW2E+Pj4wXTspYis9Q2JbdCgpW2ErKz4+PjBdXTtyZXR1cm4gYn0sRGI9e30sRWI9e30sRmI9e30sUztcbmZ1bmN0aW9uIEdiKGEsYixjPXt9KXt2YXIgZD1iLm5hbWU7aWYoIWEpdGhyb3cgbmV3IFMoYHR5cGUgXCIke2R9XCIgbXVzdCBoYXZlIGEgcG9zaXRpdmUgaW50ZWdlciB0eXBlaWQgcG9pbnRlcmApO2lmKEViLmhhc093blByb3BlcnR5KGEpKXtpZihjLkhiKXJldHVybjt0aHJvdyBuZXcgUyhgQ2Fubm90IHJlZ2lzdGVyIHR5cGUgJyR7ZH0nIHR3aWNlYCk7fUViW2FdPWI7ZGVsZXRlIEZiW2FdO0RiLmhhc093blByb3BlcnR5KGEpJiYoYj1EYlthXSxkZWxldGUgRGJbYV0sYi5mb3JFYWNoKGU9PmUoKSkpfWZ1bmN0aW9uIFQoYSxiLGM9e30pe2lmKCEoXCJhcmdQYWNrQWR2YW5jZVwiaW4gYikpdGhyb3cgbmV3IFR5cGVFcnJvcihcInJlZ2lzdGVyVHlwZSByZWdpc3RlcmVkSW5zdGFuY2UgcmVxdWlyZXMgYXJnUGFja0FkdmFuY2VcIik7R2IoYSxiLGMpfVxudmFyIEhiPShhLGIsYyk9Pntzd2l0Y2goYil7Y2FzZSAxOnJldHVybiBjP2Q9PmgoKVtkPj4+MD4+PjBdOmQ9PnQoKVtkPj4+MD4+PjBdO2Nhc2UgMjpyZXR1cm4gYz9kPT52KClbZD4+PjE+Pj4wXTpkPT5jYSgpW2Q+Pj4xPj4+MF07Y2FzZSA0OnJldHVybiBjP2Q9PncoKVtkPj4+Mj4+PjBdOmQ9PnooKVtkPj4+Mj4+PjBdO2Nhc2UgODpyZXR1cm4gYz9kPT5KW2Q+Pj4zXTpkPT5BYVtkPj4+M107ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGludGVnZXIgd2lkdGggKCR7Yn0pOiAke2F9YCk7fX07ZnVuY3Rpb24gSWIoKXt0aGlzLmxiPVt2b2lkIDBdO3RoaXMuemI9W119dmFyIFU9bmV3IEliO2Z1bmN0aW9uIEpiKGEpe2E+Pj49MDthPj1VLnNiJiYwPT09LS1VLmdldChhKS5BYiYmVS54YihhKX1cbnZhciBWPWE9PntpZighYSl0aHJvdyBuZXcgUyhcIkNhbm5vdCB1c2UgZGVsZXRlZCB2YWwuIGhhbmRsZSA9IFwiK2EpO3JldHVybiBVLmdldChhKS52YWx1ZX0sVz1hPT57c3dpdGNoKGEpe2Nhc2Ugdm9pZCAwOnJldHVybiAxO2Nhc2UgbnVsbDpyZXR1cm4gMjtjYXNlICEwOnJldHVybiAzO2Nhc2UgITE6cmV0dXJuIDQ7ZGVmYXVsdDpyZXR1cm4gVS53Yih7QWI6MSx2YWx1ZTphfSl9fTtmdW5jdGlvbiBLYihhKXtyZXR1cm4gdGhpcy5mcm9tV2lyZVR5cGUodygpW2E+Pj4yPj4+MF0pfVxudmFyIExiPShhLGIpPT57c3dpdGNoKGIpe2Nhc2UgNDpyZXR1cm4gZnVuY3Rpb24oYyl7dmFyIGQ9dGhpcy5mcm9tV2lyZVR5cGU7bS5idWZmZXIhPW4uYnVmZmVyJiZwKCk7cmV0dXJuIGQuY2FsbCh0aGlzLHphW2M+Pj4yPj4+MF0pfTtjYXNlIDg6cmV0dXJuIGZ1bmN0aW9uKGMpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZShoYSgpW2M+Pj4zPj4+MF0pfTtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoYGludmFsaWQgZmxvYXQgd2lkdGggKCR7Yn0pOiAke2F9YCk7fX07ZnVuY3Rpb24gTWIoYSl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKHooKVthPj4+Mj4+PjBdKX1cbnZhciBOYj1cInVuZGVmaW5lZFwiIT10eXBlb2YgVGV4dERlY29kZXI/bmV3IFRleHREZWNvZGVyKFwidXRmLTE2bGVcIik6dm9pZCAwLE9iPShhLGIpPT57dmFyIGM9YT4+MTtmb3IodmFyIGQ9YytiLzI7IShjPj1kKSYmY2EoKVtjPj4+MF07KSsrYztjPDw9MTtpZigzMjxjLWEmJk5iKXJldHVybiBOYi5kZWNvZGUodCgpLnNsaWNlKGEsYykpO2M9XCJcIjtmb3IoZD0wOyEoZD49Yi8yKTsrK2Qpe3ZhciBlPXYoKVthKzIqZD4+PjE+Pj4wXTtpZigwPT1lKWJyZWFrO2MrPVN0cmluZy5mcm9tQ2hhckNvZGUoZSl9cmV0dXJuIGN9LFBiPShhLGIsYyk9Pnt2b2lkIDA9PT1jJiYoYz0yMTQ3NDgzNjQ3KTtpZigyPmMpcmV0dXJuIDA7Yy09Mjt2YXIgZD1iO2M9YzwyKmEubGVuZ3RoP2MvMjphLmxlbmd0aDtmb3IodmFyIGU9MDtlPGM7KytlKXt2YXIgZj1hLmNoYXJDb2RlQXQoZSk7digpW2I+Pj4xPj4+MF09ZjtiKz0yfXYoKVtiPj4+MT4+PjBdPTA7cmV0dXJuIGItZH0sUWI9YT0+MiphLmxlbmd0aCxcblJiPShhLGIpPT57Zm9yKHZhciBjPTAsZD1cIlwiOyEoYz49Yi80KTspe3ZhciBlPXcoKVthKzQqYz4+PjI+Pj4wXTtpZigwPT1lKWJyZWFrOysrYzs2NTUzNjw9ZT8oZS09NjU1MzYsZCs9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxlPj4xMCw1NjMyMHxlJjEwMjMpKTpkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGUpfXJldHVybiBkfSxTYj0oYSxiLGMpPT57Yj4+Pj0wO3ZvaWQgMD09PWMmJihjPTIxNDc0ODM2NDcpO2lmKDQ+YylyZXR1cm4gMDt2YXIgZD1iO2M9ZCtjLTQ7Zm9yKHZhciBlPTA7ZTxhLmxlbmd0aDsrK2Upe3ZhciBmPWEuY2hhckNvZGVBdChlKTtpZig1NTI5Njw9ZiYmNTczNDM+PWYpe3ZhciBrPWEuY2hhckNvZGVBdCgrK2UpO2Y9NjU1MzYrKChmJjEwMjMpPDwxMCl8ayYxMDIzfXcoKVtiPj4+Mj4+PjBdPWY7Yis9NDtpZihiKzQ+YylicmVha313KClbYj4+PjI+Pj4wXT0wO3JldHVybiBiLWR9LFRiPWE9Pntmb3IodmFyIGI9MCxjPTA7YzxhLmxlbmd0aDsrK2Mpe3ZhciBkPVxuYS5jaGFyQ29kZUF0KGMpOzU1Mjk2PD1kJiY1NzM0Mz49ZCYmKytjO2IrPTR9cmV0dXJuIGJ9LFViPWE9PntpZigheWEpdHJ5e2lmKGEoKSwhR2EoKSl0cnl7RT9mYihJKTpXYShJKX1jYXRjaChiKXtiIGluc3RhbmNlb2YgT2F8fFwidW53aW5kXCI9PWJ8fG5hKDEsYil9fWNhdGNoKGIpe2IgaW5zdGFuY2VvZiBPYXx8XCJ1bndpbmRcIj09Ynx8bmEoMSxiKX19O2Z1bmN0aW9uIFZiKGEpe2E+Pj49MDtcImZ1bmN0aW9uXCI9PT10eXBlb2YgQXRvbWljcy5UYiYmKEF0b21pY3MuVGIodygpLGE+Pj4yLGEpLnZhbHVlLnRoZW4oJGEpLGErPTEyOCxBdG9taWNzLnN0b3JlKHcoKSxhPj4+MiwxKSl9QS5fX2Vtc2NyaXB0ZW5fdGhyZWFkX21haWxib3hfYXdhaXQ9VmI7dmFyICRhPSgpPT57dmFyIGE9WmEoKTthJiYoVmIoYSksVWIoKCk9PldiKCkpKX07QS5jaGVja01haWxib3g9JGE7dmFyIFliPWE9Pnt2YXIgYj1YYigpO2E9YSgpO2NiKGIpO3JldHVybiBhfTtcbmZ1bmN0aW9uIFAoYSxiKXt2YXIgYz1hcmd1bWVudHMubGVuZ3RoLTIsZD1hcmd1bWVudHM7cmV0dXJuIFliKCgpPT57Zm9yKHZhciBlPTIqYyxmPVpiKDgqZSksaz1mPj4+MyxsPTA7bDxjO2wrKyl7dmFyIHE9ZFsyK2xdO1wiYmlnaW50XCI9PXR5cGVvZiBxPyhKW2srMipsXT0xbixKW2srMipsKzFdPXEpOihKW2srMipsXT0wbixoYSgpW2srMipsKzE+Pj4wXT1xKX1yZXR1cm4gJGIoYSxlLGYsYil9KX1cbnZhciBhYz1bXSxjYz0oYSxiKT0+e3ZhciBjPUViW2FdO2lmKHZvaWQgMD09PWMpdGhyb3cgYT1iYyhhKSxjPVIoYSksWChhKSxuZXcgUyhiK1wiIGhhcyB1bmtub3duIHR5cGUgXCIrYyk7cmV0dXJuIGN9LGRjPXt9LGVjPWE9Pnt2YXIgYj1kY1thXTtyZXR1cm4gdm9pZCAwPT09Yj9SKGEpOmJ9LGZjPVtdLGdjPSgpPT5cIm9iamVjdFwiPT10eXBlb2YgZ2xvYmFsVGhpcz9nbG9iYWxUaGlzOkZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSxoYz1hPT57dmFyIGI9ZmMubGVuZ3RoO2ZjLnB1c2goYSk7cmV0dXJuIGJ9LGljPShhLGIpPT57Zm9yKHZhciBjPUFycmF5KGEpLGQ9MDtkPGE7KytkKWNbZF09Y2MoeigpW2IrNCpkPj4+Mj4+PjBdLFwicGFyYW1ldGVyIFwiK2QpO3JldHVybiBjfSxqYz1hPT57aWYodm9pZCAwPT09YSlyZXR1cm5cIl91bmtub3duXCI7YT1hLnJlcGxhY2UoL1teYS16QS1aMC05X10vZyxcIiRcIik7dmFyIGI9YS5jaGFyQ29kZUF0KDApO3JldHVybiA0ODw9YiYmNTc+PWI/YF8ke2F9YDpcbmF9LGxjPXt9O2Z1bmN0aW9uIG1jKGEsYil7YT1qYyhhKTtyZXR1cm57W2FdOmZ1bmN0aW9uKCl7cmV0dXJuIGIuYXBwbHkodGhpcyxhcmd1bWVudHMpfX1bYV19ZnVuY3Rpb24gbmMoYSl7dmFyIGI9RnVuY3Rpb247aWYoIShiIGluc3RhbmNlb2YgRnVuY3Rpb24pKXRocm93IG5ldyBUeXBlRXJyb3IoYG5ld18gY2FsbGVkIHdpdGggY29uc3RydWN0b3IgdHlwZSAke3R5cGVvZiBifSB3aGljaCBpcyBub3QgYSBmdW5jdGlvbmApO3ZhciBjPW1jKGIubmFtZXx8XCJ1bmtub3duRnVuY3Rpb25OYW1lXCIsZnVuY3Rpb24oKXt9KTtjLnByb3RvdHlwZT1iLnByb3RvdHlwZTtjPW5ldyBjO2E9Yi5hcHBseShjLGEpO3JldHVybiBhIGluc3RhbmNlb2YgT2JqZWN0P2E6Y31cbnZhciBvYz1hPT57Zm9yKHZhciBiPVwiXCIsYz0wO2M8YTsrK2MpYis9KDAhPT1jP1wiLCBcIjpcIlwiKStcImFyZ1wiK2M7dmFyIGQ9XCJyZXR1cm4gZnVuY3Rpb24gZW12YWxfYWxsb2NhdG9yX1wiK2ErXCIoY29uc3RydWN0b3IsIGFyZ1R5cGVzLCBhcmdzKSB7XFxuICB2YXIgSEVBUFUzMiA9IGdldE1lbW9yeSgpO1xcblwiO2ZvcihjPTA7YzxhOysrYylkKz1cInZhciBhcmdUeXBlXCIrYytcIiA9IHJlcXVpcmVSZWdpc3RlcmVkVHlwZShIRUFQVTMyWygoYXJnVHlwZXMpPj4+MildLCAncGFyYW1ldGVyIFwiK2MrXCInKTtcXG52YXIgYXJnXCIrYytcIiA9IGFyZ1R5cGVcIitjK1wiLnJlYWRWYWx1ZUZyb21Qb2ludGVyKGFyZ3MpO1xcbmFyZ3MgKz0gYXJnVHlwZVwiK2MrXCJbJ2FyZ1BhY2tBZHZhbmNlJ107XFxuYXJnVHlwZXMgKz0gNDtcXG5cIjtyZXR1cm4obmV3IEZ1bmN0aW9uKFwicmVxdWlyZVJlZ2lzdGVyZWRUeXBlXCIsXCJNb2R1bGVcIixcInZhbHVlVG9IYW5kbGVcIixcImdldE1lbW9yeVwiLGQrKFwidmFyIG9iaiA9IG5ldyBjb25zdHJ1Y3RvcihcIitcbmIrXCIpO1xcbnJldHVybiB2YWx1ZVRvSGFuZGxlKG9iaik7XFxufVxcblwiKSkpKGNjLEEsVywoKT0+eigpKX0scGM9e30sWT1hPT4wPT09YSU0JiYoMCE9PWElMTAwfHwwPT09YSU0MDApLHFjPVswLDMxLDYwLDkxLDEyMSwxNTIsMTgyLDIxMywyNDQsMjc0LDMwNSwzMzVdLHJjPVswLDMxLDU5LDkwLDEyMCwxNTEsMTgxLDIxMiwyNDMsMjczLDMwNCwzMzRdO2Z1bmN0aW9uIHNjKGEsYixjLGQsZSxmLGspe3JldHVybiBFP1AoMTYsMSxhLGIsYyxkLGUsZixrKTotNTJ9ZnVuY3Rpb24gdGMoYSxiLGMsZCxlLGYpe2lmKEUpcmV0dXJuIFAoMTcsMSxhLGIsYyxkLGUsZil9XG52YXIgdmM9YT0+e3ZhciBiPW5iKGEpKzEsYz11YyhiKTtjJiZwYihhLGMsYik7cmV0dXJuIGN9LHdjPXt9LHljPSgpPT57aWYoIXhjKXt2YXIgYT17VVNFUjpcIndlYl91c2VyXCIsTE9HTkFNRTpcIndlYl91c2VyXCIsUEFUSDpcIi9cIixQV0Q6XCIvXCIsSE9NRTpcIi9ob21lL3dlYl91c2VyXCIsTEFORzooXCJvYmplY3RcIj09dHlwZW9mIG5hdmlnYXRvciYmbmF2aWdhdG9yLmxhbmd1YWdlcyYmbmF2aWdhdG9yLmxhbmd1YWdlc1swXXx8XCJDXCIpLnJlcGxhY2UoXCItXCIsXCJfXCIpK1wiLlVURi04XCIsXzptYXx8XCIuL3RoaXMucHJvZ3JhbVwifSxiO2ZvcihiIGluIHdjKXZvaWQgMD09PXdjW2JdP2RlbGV0ZSBhW2JdOmFbYl09d2NbYl07dmFyIGM9W107Zm9yKGIgaW4gYSljLnB1c2goYCR7Yn09JHthW2JdfWApO3hjPWN9cmV0dXJuIHhjfSx4YztcbmZ1bmN0aW9uIHpjKGEsYil7aWYoRSlyZXR1cm4gUCgxOCwxLGEsYik7YT4+Pj0wO2I+Pj49MDt2YXIgYz0wO3ljKCkuZm9yRWFjaCgoZCxlKT0+e3ZhciBmPWIrYztlPXooKVthKzQqZT4+PjI+Pj4wXT1mO2ZvcihmPTA7ZjxkLmxlbmd0aDsrK2YpaCgpW2UrKz4+PjA+Pj4wXT1kLmNoYXJDb2RlQXQoZik7aCgpW2U+Pj4wPj4+MF09MDtjKz1kLmxlbmd0aCsxfSk7cmV0dXJuIDB9ZnVuY3Rpb24gQWMoYSxiKXtpZihFKXJldHVybiBQKDE5LDEsYSxiKTthPj4+PTA7Yj4+Pj0wO3ZhciBjPXljKCk7eigpW2E+Pj4yPj4+MF09Yy5sZW5ndGg7dmFyIGQ9MDtjLmZvckVhY2goZT0+ZCs9ZS5sZW5ndGgrMSk7eigpW2I+Pj4yPj4+MF09ZDtyZXR1cm4gMH1mdW5jdGlvbiBCYyhhKXtyZXR1cm4gRT9QKDIwLDEsYSk6NTJ9ZnVuY3Rpb24gQ2MoYSxiLGMsZCl7cmV0dXJuIEU/UCgyMSwxLGEsYixjLGQpOjUyfVxuZnVuY3Rpb24gRGMoYSxiLGMsZCl7cmV0dXJuIEU/UCgyMiwxLGEsYixjLGQpOjcwfXZhciBFYz1bbnVsbCxbXSxbXV07ZnVuY3Rpb24gRmMoYSxiLGMsZCl7aWYoRSlyZXR1cm4gUCgyMywxLGEsYixjLGQpO2I+Pj49MDtjPj4+PTA7ZD4+Pj0wO2Zvcih2YXIgZT0wLGY9MDtmPGM7ZisrKXt2YXIgaz16KClbYj4+PjI+Pj4wXSxsPXooKVtiKzQ+Pj4yPj4+MF07Yis9ODtmb3IodmFyIHE9MDtxPGw7cSsrKXt2YXIgcj10KClbaytxPj4+MF0seD1FY1thXTswPT09cnx8MTA9PT1yPygoMT09PWE/d2E6RykoU2EoeCwwKSkseC5sZW5ndGg9MCk6eC5wdXNoKHIpfWUrPWx9eigpW2Q+Pj4yPj4+MF09ZTtyZXR1cm4gMH12YXIgR2M9WzMxLDI5LDMxLDMwLDMxLDMwLDMxLDMxLDMwLDMxLDMwLDMxXSxIYz1bMzEsMjgsMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdO2Z1bmN0aW9uIEljKGEpe3ZhciBiPUFycmF5KG5iKGEpKzEpO29iKGEsYiwwLGIubGVuZ3RoKTtyZXR1cm4gYn1cbnZhciBKYz0oYSxiKT0+e2goKS5zZXQoYSxiPj4+MCl9O1xuZnVuY3Rpb24gS2MoYSxiLGMsZCl7ZnVuY3Rpb24gZShnLHUseSl7Zm9yKGc9XCJudW1iZXJcIj09dHlwZW9mIGc/Zy50b1N0cmluZygpOmd8fFwiXCI7Zy5sZW5ndGg8dTspZz15WzBdK2c7cmV0dXJuIGd9ZnVuY3Rpb24gZihnLHUpe3JldHVybiBlKGcsdSxcIjBcIil9ZnVuY3Rpb24gayhnLHUpe2Z1bmN0aW9uIHkoa2Mpe3JldHVybiAwPmtjPy0xOjA8a2M/MTowfXZhciBROzA9PT0oUT15KGcuZ2V0RnVsbFllYXIoKS11LmdldEZ1bGxZZWFyKCkpKSYmMD09PShRPXkoZy5nZXRNb250aCgpLXUuZ2V0TW9udGgoKSkpJiYoUT15KGcuZ2V0RGF0ZSgpLXUuZ2V0RGF0ZSgpKSk7cmV0dXJuIFF9ZnVuY3Rpb24gbChnKXtzd2l0Y2goZy5nZXREYXkoKSl7Y2FzZSAwOnJldHVybiBuZXcgRGF0ZShnLmdldEZ1bGxZZWFyKCktMSwxMSwyOSk7Y2FzZSAxOnJldHVybiBnO2Nhc2UgMjpyZXR1cm4gbmV3IERhdGUoZy5nZXRGdWxsWWVhcigpLDAsMyk7Y2FzZSAzOnJldHVybiBuZXcgRGF0ZShnLmdldEZ1bGxZZWFyKCksXG4wLDIpO2Nhc2UgNDpyZXR1cm4gbmV3IERhdGUoZy5nZXRGdWxsWWVhcigpLDAsMSk7Y2FzZSA1OnJldHVybiBuZXcgRGF0ZShnLmdldEZ1bGxZZWFyKCktMSwxMSwzMSk7Y2FzZSA2OnJldHVybiBuZXcgRGF0ZShnLmdldEZ1bGxZZWFyKCktMSwxMSwzMCl9fWZ1bmN0aW9uIHEoZyl7dmFyIHU9Zy5vYjtmb3IoZz1uZXcgRGF0ZSgobmV3IERhdGUoZy5wYisxOTAwLDAsMSkpLmdldFRpbWUoKSk7MDx1Oyl7dmFyIHk9Zy5nZXRNb250aCgpLFE9KFkoZy5nZXRGdWxsWWVhcigpKT9HYzpIYylbeV07aWYodT5RLWcuZ2V0RGF0ZSgpKXUtPVEtZy5nZXREYXRlKCkrMSxnLnNldERhdGUoMSksMTE+eT9nLnNldE1vbnRoKHkrMSk6KGcuc2V0TW9udGgoMCksZy5zZXRGdWxsWWVhcihnLmdldEZ1bGxZZWFyKCkrMSkpO2Vsc2V7Zy5zZXREYXRlKGcuZ2V0RGF0ZSgpK3UpO2JyZWFrfX15PW5ldyBEYXRlKGcuZ2V0RnVsbFllYXIoKSsxLDAsNCk7dT1sKG5ldyBEYXRlKGcuZ2V0RnVsbFllYXIoKSxcbjAsNCkpO3k9bCh5KTtyZXR1cm4gMD49ayh1LGcpPzA+PWsoeSxnKT9nLmdldEZ1bGxZZWFyKCkrMTpnLmdldEZ1bGxZZWFyKCk6Zy5nZXRGdWxsWWVhcigpLTF9YT4+Pj0wO2I+Pj49MDtjPj4+PTA7ZD4+Pj0wO3ZhciByPXooKVtkKzQwPj4+Mj4+PjBdO2Q9e1FiOncoKVtkPj4+Mj4+PjBdLFBiOncoKVtkKzQ+Pj4yPj4+MF0sdGI6dygpW2QrOD4+PjI+Pj4wXSx5Yjp3KClbZCsxMj4+PjI+Pj4wXSx1Yjp3KClbZCsxNj4+PjI+Pj4wXSxwYjp3KClbZCsyMD4+PjI+Pj4wXSxrYjp3KClbZCsyND4+PjI+Pj4wXSxvYjp3KClbZCsyOD4+PjI+Pj4wXSxXYjp3KClbZCszMj4+PjI+Pj4wXSxPYjp3KClbZCszNj4+PjI+Pj4wXSxSYjpyP1RhKHIpOlwiXCJ9O2M9VGEoYyk7cj17XCIlY1wiOlwiJWEgJWIgJWQgJUg6JU06JVMgJVlcIixcIiVEXCI6XCIlbS8lZC8leVwiLFwiJUZcIjpcIiVZLSVtLSVkXCIsXCIlaFwiOlwiJWJcIixcIiVyXCI6XCIlSTolTTolUyAlcFwiLFwiJVJcIjpcIiVIOiVNXCIsXCIlVFwiOlwiJUg6JU06JVNcIixcIiV4XCI6XCIlbS8lZC8leVwiLFxuXCIlWFwiOlwiJUg6JU06JVNcIixcIiVFY1wiOlwiJWNcIixcIiVFQ1wiOlwiJUNcIixcIiVFeFwiOlwiJW0vJWQvJXlcIixcIiVFWFwiOlwiJUg6JU06JVNcIixcIiVFeVwiOlwiJXlcIixcIiVFWVwiOlwiJVlcIixcIiVPZFwiOlwiJWRcIixcIiVPZVwiOlwiJWVcIixcIiVPSFwiOlwiJUhcIixcIiVPSVwiOlwiJUlcIixcIiVPbVwiOlwiJW1cIixcIiVPTVwiOlwiJU1cIixcIiVPU1wiOlwiJVNcIixcIiVPdVwiOlwiJXVcIixcIiVPVVwiOlwiJVVcIixcIiVPVlwiOlwiJVZcIixcIiVPd1wiOlwiJXdcIixcIiVPV1wiOlwiJVdcIixcIiVPeVwiOlwiJXlcIn07Zm9yKHZhciB4IGluIHIpYz1jLnJlcGxhY2UobmV3IFJlZ0V4cCh4LFwiZ1wiKSxyW3hdKTt2YXIgQz1cIlN1bmRheSBNb25kYXkgVHVlc2RheSBXZWRuZXNkYXkgVGh1cnNkYXkgRnJpZGF5IFNhdHVyZGF5XCIuc3BsaXQoXCIgXCIpLE49XCJKYW51YXJ5IEZlYnJ1YXJ5IE1hcmNoIEFwcmlsIE1heSBKdW5lIEp1bHkgQXVndXN0IFNlcHRlbWJlciBPY3RvYmVyIE5vdmVtYmVyIERlY2VtYmVyXCIuc3BsaXQoXCIgXCIpO3I9e1wiJWFcIjpnPT5DW2cua2JdLnN1YnN0cmluZygwLDMpLFwiJUFcIjpnPT5cbkNbZy5rYl0sXCIlYlwiOmc9Pk5bZy51Yl0uc3Vic3RyaW5nKDAsMyksXCIlQlwiOmc9Pk5bZy51Yl0sXCIlQ1wiOmc9PmYoKGcucGIrMTkwMCkvMTAwfDAsMiksXCIlZFwiOmc9PmYoZy55YiwyKSxcIiVlXCI6Zz0+ZShnLnliLDIsXCIgXCIpLFwiJWdcIjpnPT5xKGcpLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLFwiJUdcIjpnPT5xKGcpLFwiJUhcIjpnPT5mKGcudGIsMiksXCIlSVwiOmc9PntnPWcudGI7MD09Zz9nPTEyOjEyPGcmJihnLT0xMik7cmV0dXJuIGYoZywyKX0sXCIlalwiOmc9Pntmb3IodmFyIHU9MCx5PTA7eTw9Zy51Yi0xO3UrPShZKGcucGIrMTkwMCk/R2M6SGMpW3krK10pO3JldHVybiBmKGcueWIrdSwzKX0sXCIlbVwiOmc9PmYoZy51YisxLDIpLFwiJU1cIjpnPT5mKGcuUGIsMiksXCIlblwiOigpPT5cIlxcblwiLFwiJXBcIjpnPT4wPD1nLnRiJiYxMj5nLnRiP1wiQU1cIjpcIlBNXCIsXCIlU1wiOmc9PmYoZy5RYiwyKSxcIiV0XCI6KCk9PlwiXFx0XCIsXCIldVwiOmc9Pmcua2J8fDcsXCIlVVwiOmc9PmYoTWF0aC5mbG9vcigoZy5vYis3LWcua2IpL1xuNyksMiksXCIlVlwiOmc9Pnt2YXIgdT1NYXRoLmZsb29yKChnLm9iKzctKGcua2IrNiklNykvNyk7Mj49KGcua2IrMzcxLWcub2ItMiklNyYmdSsrO2lmKHUpNTM9PXUmJih5PShnLmtiKzM3MS1nLm9iKSU3LDQ9PXl8fDM9PXkmJlkoZy5wYil8fCh1PTEpKTtlbHNle3U9NTI7dmFyIHk9KGcua2IrNy1nLm9iLTEpJTc7KDQ9PXl8fDU9PXkmJlkoZy5wYiU0MDAtMSkpJiZ1Kyt9cmV0dXJuIGYodSwyKX0sXCIld1wiOmc9Pmcua2IsXCIlV1wiOmc9PmYoTWF0aC5mbG9vcigoZy5vYis3LShnLmtiKzYpJTcpLzcpLDIpLFwiJXlcIjpnPT4oZy5wYisxOTAwKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcIiVZXCI6Zz0+Zy5wYisxOTAwLFwiJXpcIjpnPT57Zz1nLk9iO3ZhciB1PTA8PWc7Zz1NYXRoLmFicyhnKS82MDtyZXR1cm4odT9cIitcIjpcIi1cIikrU3RyaW5nKFwiMDAwMFwiKyhnLzYwKjEwMCtnJTYwKSkuc2xpY2UoLTQpfSxcIiVaXCI6Zz0+Zy5SYixcIiUlXCI6KCk9PlwiJVwifTtjPWMucmVwbGFjZSgvJSUvZyxcIlxceDAwXFx4MDBcIik7XG5mb3IoeCBpbiByKWMuaW5jbHVkZXMoeCkmJihjPWMucmVwbGFjZShuZXcgUmVnRXhwKHgsXCJnXCIpLHJbeF0oZCkpKTtjPWMucmVwbGFjZSgvXFwwXFwwL2csXCIlXCIpO3g9SWMoYyk7aWYoeC5sZW5ndGg+YilyZXR1cm4gMDtKYyh4LGEpO3JldHVybiB4Lmxlbmd0aC0xfU8udmIoKTtmb3IodmFyIExjPUFycmF5KDI1NiksTWM9MDsyNTY+TWM7KytNYylMY1tNY109U3RyaW5nLmZyb21DaGFyQ29kZShNYyk7Q2I9TGM7Uz1BLkJpbmRpbmdFcnJvcj1jbGFzcyBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKGEpe3N1cGVyKGEpO3RoaXMubmFtZT1cIkJpbmRpbmdFcnJvclwifX07QS5JbnRlcm5hbEVycm9yPWNsYXNzIGV4dGVuZHMgRXJyb3J7Y29uc3RydWN0b3IoYSl7c3VwZXIoYSk7dGhpcy5uYW1lPVwiSW50ZXJuYWxFcnJvclwifX07XG5PYmplY3QuYXNzaWduKEliLnByb3RvdHlwZSx7Z2V0KGEpe3JldHVybiB0aGlzLmxiW2FdfSxoYXMoYSl7cmV0dXJuIHZvaWQgMCE9PXRoaXMubGJbYV19LHdiKGEpe3ZhciBiPXRoaXMuemIucG9wKCl8fHRoaXMubGIubGVuZ3RoO3RoaXMubGJbYl09YTtyZXR1cm4gYn0seGIoYSl7dGhpcy5sYlthXT12b2lkIDA7dGhpcy56Yi5wdXNoKGEpfX0pO1UubGIucHVzaCh7dmFsdWU6dm9pZCAwfSx7dmFsdWU6bnVsbH0se3ZhbHVlOiEwfSx7dmFsdWU6ITF9KTtVLnNiPVUubGIubGVuZ3RoO0EuY291bnRfZW12YWxfaGFuZGxlcz0oKT0+e2Zvcih2YXIgYT0wLGI9VS5zYjtiPFUubGIubGVuZ3RoOysrYil2b2lkIDAhPT1VLmxiW2JdJiYrK2E7cmV0dXJuIGF9O1xudmFyIE5jPVtVYSxWYSxqYixsYixtYixxYixyYixzYix0Yix1Yix2Yix3Yix4Yix5Yix6YixBYixzYyx0Yyx6YyxBYyxCYyxDYyxEYyxGY10sUGM9e2I6ZnVuY3Rpb24oYSxiLGMpe2E+Pj49MDsobmV3IGdiKGEpKS52YihiPj4+MCxjPj4+MCk7aGI9YTtpYisrO3Rocm93IGhiO30sZWE6ZnVuY3Rpb24oYSl7T2MoYT4+PjAsIUIsMSwhb2EsMTMxMDcyLCExKTtPLkRiKCl9LEQ6ZnVuY3Rpb24oYSl7YT4+Pj0wO0U/cG9zdE1lc3NhZ2Uoe2NtZDpcImNsZWFudXBUaHJlYWRcIix0aHJlYWQ6YX0pOigoYT1PLmpiW2FdKXx8SCgpLE8uQmIoYSkpfSxXOmtiLHk6bGIsa2E6bWIsUzpxYixVOnJiLEw6c2IsaWE6dGIsYmE6dWIsaGE6dmIsRjp3YixUOnhiLFE6eWIsamE6emIsUjpBYixJOmZ1bmN0aW9uKGEsYixjLGQsZSl7YT4+Pj0wO2I+Pj49MDtjPj4+PTA7Yj1SKGIpO3ZhciBmPS0xIT1iLmluZGV4T2YoXCJ1XCIpO2YmJihlPSgxbjw8NjRuKS0xbik7VChhLHtuYW1lOmIsZnJvbVdpcmVUeXBlOms9Plxuayx0b1dpcmVUeXBlOmZ1bmN0aW9uKGssbCl7aWYoXCJiaWdpbnRcIiE9dHlwZW9mIGwmJlwibnVtYmVyXCIhPXR5cGVvZiBsKXRocm93IG5ldyBUeXBlRXJyb3IoYENhbm5vdCBjb252ZXJ0IFwiJHtCYihsKX1cIiB0byAke3RoaXMubmFtZX1gKTtpZihsPGR8fGw+ZSl0aHJvdyBuZXcgVHlwZUVycm9yKGBQYXNzaW5nIGEgbnVtYmVyIFwiJHtCYihsKX1cIiBmcm9tIEpTIHNpZGUgdG8gQy9DKysgc2lkZSB0byBhbiBhcmd1bWVudCBvZiB0eXBlIFwiJHtifVwiLCB3aGljaCBpcyBvdXRzaWRlIHRoZSB2YWxpZCByYW5nZSBbJHtkfSwgJHtlfV0hYCk7cmV0dXJuIGx9LGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6SGIoYixjLCFmKSxyYjpudWxsfSl9LHFhOmZ1bmN0aW9uKGEsYixjLGQpe2E+Pj49MDtiPVIoYj4+PjApO1QoYSx7bmFtZTpiLGZyb21XaXJlVHlwZTpmdW5jdGlvbihlKXtyZXR1cm4hIWV9LHRvV2lyZVR5cGU6ZnVuY3Rpb24oZSxmKXtyZXR1cm4gZj9jOmR9LGFyZ1BhY2tBZHZhbmNlOjgsXG5yZWFkVmFsdWVGcm9tUG9pbnRlcjpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5mcm9tV2lyZVR5cGUodCgpW2U+Pj4wXSl9LHJiOm51bGx9KX0scGE6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj1SKGI+Pj4wKTtUKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6Yz0+e3ZhciBkPVYoYyk7SmIoYyk7cmV0dXJuIGR9LHRvV2lyZVR5cGU6KGMsZCk9PlcoZCksYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpLYixyYjpudWxsfSl9LEg6ZnVuY3Rpb24oYSxiLGMpe2E+Pj49MDtjPj4+PTA7Yj1SKGI+Pj4wKTtUKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6ZD0+ZCx0b1dpcmVUeXBlOihkLGUpPT5lLGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6TGIoYixjKSxyYjpudWxsfSl9LHQ6ZnVuY3Rpb24oYSxiLGMsZCxlKXthPj4+PTA7Yz4+Pj0wO2I9UihiPj4+MCk7LTE9PT1lJiYoZT00Mjk0OTY3Mjk1KTtlPWw9Pmw7aWYoMD09PWQpe3ZhciBmPTMyLTgqYztlPWw9PlxubDw8Zj4+PmZ9dmFyIGs9Yi5pbmNsdWRlcyhcInVuc2lnbmVkXCIpP2Z1bmN0aW9uKGwscSl7cmV0dXJuIHE+Pj4wfTpmdW5jdGlvbihsLHEpe3JldHVybiBxfTtUKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6ZSx0b1dpcmVUeXBlOmssYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpIYihiLGMsMCE9PWQpLHJiOm51bGx9KX0sbTpmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChmKXt2YXIgaz16KClbZj4+PjI+Pj4wXTtmPXooKVtmKzQ+Pj4yPj4+MF07cmV0dXJuIG5ldyBlKGgoKS5idWZmZXIsZixrKX1hPj4+PTA7dmFyIGU9W0ludDhBcnJheSxVaW50OEFycmF5LEludDE2QXJyYXksVWludDE2QXJyYXksSW50MzJBcnJheSxVaW50MzJBcnJheSxGbG9hdDMyQXJyYXksRmxvYXQ2NEFycmF5LEJpZ0ludDY0QXJyYXksQmlnVWludDY0QXJyYXldW2JdO2M9UihjPj4+MCk7VChhLHtuYW1lOmMsZnJvbVdpcmVUeXBlOmQsYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpkfSxcbntIYjohMH0pfSxKOmZ1bmN0aW9uKGEsYil7YT4+Pj0wO2I9UihiPj4+MCk7dmFyIGM9XCJzdGQ6OnN0cmluZ1wiPT09YjtUKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6ZnVuY3Rpb24oZCl7dmFyIGU9eigpW2Q+Pj4yPj4+MF0sZj1kKzQ7aWYoYylmb3IodmFyIGs9ZixsPTA7bDw9ZTsrK2wpe3ZhciBxPWYrbDtpZihsPT1lfHwwPT10KClbcT4+PjBdKXtrPVRhKGsscS1rKTtpZih2b2lkIDA9PT1yKXZhciByPWs7ZWxzZSByKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApLHIrPWs7az1xKzF9fWVsc2V7cj1BcnJheShlKTtmb3IobD0wO2w8ZTsrK2wpcltsXT1TdHJpbmcuZnJvbUNoYXJDb2RlKHQoKVtmK2w+Pj4wXSk7cj1yLmpvaW4oXCJcIil9WChkKTtyZXR1cm4gcn0sdG9XaXJlVHlwZTpmdW5jdGlvbihkLGUpe2UgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciYmKGU9bmV3IFVpbnQ4QXJyYXkoZSkpO3ZhciBmPVwic3RyaW5nXCI9PXR5cGVvZiBlO2lmKCEoZnx8ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXl8fFxuZSBpbnN0YW5jZW9mIFVpbnQ4Q2xhbXBlZEFycmF5fHxlIGluc3RhbmNlb2YgSW50OEFycmF5KSl0aHJvdyBuZXcgUyhcIkNhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gc3RkOjpzdHJpbmdcIik7dmFyIGs9YyYmZj9uYihlKTplLmxlbmd0aDt2YXIgbD11Yyg0K2srMSkscT1sKzQ7eigpW2w+Pj4yPj4+MF09aztpZihjJiZmKXBiKGUscSxrKzEpO2Vsc2UgaWYoZilmb3IoZj0wO2Y8azsrK2Ype3ZhciByPWUuY2hhckNvZGVBdChmKTtpZigyNTU8cil0aHJvdyBYKHEpLG5ldyBTKFwiU3RyaW5nIGhhcyBVVEYtMTYgY29kZSB1bml0cyB0aGF0IGRvIG5vdCBmaXQgaW4gOCBiaXRzXCIpO3QoKVtxK2Y+Pj4wXT1yfWVsc2UgZm9yKGY9MDtmPGs7KytmKXQoKVtxK2Y+Pj4wXT1lW2ZdO251bGwhPT1kJiZkLnB1c2goWCxsKTtyZXR1cm4gbH0sYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpNYixyYihkKXtYKGQpfX0pfSxBOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7Yj4+Pj0wO1xuYz4+Pj0wO2M9UihjKTtpZigyPT09Yil7dmFyIGQ9T2I7dmFyIGU9UGI7dmFyIGY9UWI7dmFyIGs9KCk9PmNhKCk7dmFyIGw9MX1lbHNlIDQ9PT1iJiYoZD1SYixlPVNiLGY9VGIsaz0oKT0+eigpLGw9Mik7VChhLHtuYW1lOmMsZnJvbVdpcmVUeXBlOnE9Pntmb3IodmFyIHI9eigpW3E+Pj4yPj4+MF0seD1rKCksQyxOPXErNCxnPTA7Zzw9cjsrK2cpe3ZhciB1PXErNCtnKmI7aWYoZz09cnx8MD09eFt1Pj4+bF0pTj1kKE4sdS1OKSx2b2lkIDA9PT1DP0M9TjooQys9U3RyaW5nLmZyb21DaGFyQ29kZSgwKSxDKz1OKSxOPXUrYn1YKHEpO3JldHVybiBDfSx0b1dpcmVUeXBlOihxLHIpPT57aWYoXCJzdHJpbmdcIiE9dHlwZW9mIHIpdGhyb3cgbmV3IFMoYENhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gQysrIHN0cmluZyB0eXBlICR7Y31gKTt2YXIgeD1mKHIpLEM9dWMoNCt4K2IpO3ooKVtDPj4+Ml09eD4+bDtlKHIsQys0LHgrYik7bnVsbCE9PXEmJnEucHVzaChYLEMpO3JldHVybiBDfSxcbmFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6S2IscmIocSl7WChxKX19KX0scmE6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj1SKGI+Pj4wKTtUKGEse0liOiEwLG5hbWU6YixhcmdQYWNrQWR2YW5jZTowLGZyb21XaXJlVHlwZTooKT0+e30sdG9XaXJlVHlwZTooKT0+e319KX0sbmE6KCk9PiEwLE86ZnVuY3Rpb24oYSxiKXthPj4+PTA7YT09Yj4+PjA/c2V0VGltZW91dCgoKT0+JGEoKSk6RT9wb3N0TWVzc2FnZSh7dGFyZ2V0VGhyZWFkOmEsY21kOlwiY2hlY2tNYWlsYm94XCJ9KTooYT1PLmpiW2FdKSYmYS5wb3N0TWVzc2FnZSh7Y21kOlwiY2hlY2tNYWlsYm94XCJ9KX0sWDpmdW5jdGlvbihhLGIsYyxkKXtiPj4+PTA7Yy89MjthYy5sZW5ndGg9YztkPWQ+Pj4wPj4+Mztmb3IodmFyIGU9MDtlPGM7ZSsrKWFjW2VdPUpbZCsyKmVdP0pbZCsyKmUrMV06aGEoKVtkKzIqZSsxPj4+MF07YT1OY1thXTtPLkdiPWI7Yj1hLmFwcGx5KG51bGwsYWMpO08uR2I9MDtyZXR1cm4gYn0sXG5kYTpWYixtYTpmdW5jdGlvbihhKXtEJiZPLmpiW2E+Pj4wXS5yZWYoKX0scjpmdW5jdGlvbihhLGIsYyl7Yj4+Pj0wO2M+Pj49MDthPVYoYT4+PjApO2I9Y2MoYixcImVtdmFsOjphc1wiKTt2YXIgZD1bXSxlPVcoZCk7eigpW2M+Pj4yPj4+MF09ZTtyZXR1cm4gYi50b1dpcmVUeXBlKGQsYSl9LGk6ZnVuY3Rpb24oYSxiLGMsZCxlKXtjPj4+PTA7ZD4+Pj0wO2U+Pj49MDthPWZjW2E+Pj4wXTtiPVYoYj4+PjApO2M9ZWMoYyk7dmFyIGY9W107eigpW2Q+Pj4yPj4+MF09VyhmKTtyZXR1cm4gYShiLGMsZixlKX0sdTpmdW5jdGlvbihhLGIsYyxkKXtjPj4+PTA7ZD4+Pj0wO2E9ZmNbYT4+PjBdO2I9VihiPj4+MCk7Yz1lYyhjKTthKGIsYyxudWxsLGQpfSxjOkpiLEs6ZnVuY3Rpb24oYSxiKXtiPj4+PTA7YT1WKGE+Pj4wKTtiPVYoYik7cmV0dXJuIGE9PWJ9LG86ZnVuY3Rpb24oYSl7YT4+Pj0wO2lmKDA9PT1hKXJldHVybiBXKGdjKCkpO2E9ZWMoYSk7cmV0dXJuIFcoZ2MoKVthXSl9LGg6ZnVuY3Rpb24oYSxcbmIpe3ZhciBjPWljKGEsYj4+PjApLGQ9Y1swXTtiPWQubmFtZStcIl8kXCIrYy5zbGljZSgxKS5tYXAoZnVuY3Rpb24oeCl7cmV0dXJuIHgubmFtZX0pLmpvaW4oXCJfXCIpK1wiJFwiO3ZhciBlPWxjW2JdO2lmKHZvaWQgMCE9PWUpcmV0dXJuIGU7ZT1bXCJyZXRUeXBlXCJdO2Zvcih2YXIgZj1bZF0saz1cIlwiLGw9MDtsPGEtMTsrK2wpays9KDAhPT1sP1wiLCBcIjpcIlwiKStcImFyZ1wiK2wsZS5wdXNoKFwiYXJnVHlwZVwiK2wpLGYucHVzaChjWzErbF0pO3ZhciBxPVwicmV0dXJuIGZ1bmN0aW9uIFwiK2pjKFwibWV0aG9kQ2FsbGVyX1wiK2IpK1wiKGhhbmRsZSwgbmFtZSwgZGVzdHJ1Y3RvcnMsIGFyZ3MpIHtcXG5cIixyPTA7Zm9yKGw9MDtsPGEtMTsrK2wpcSs9XCIgICAgdmFyIGFyZ1wiK2wrXCIgPSBhcmdUeXBlXCIrbCtcIi5yZWFkVmFsdWVGcm9tUG9pbnRlcihhcmdzXCIrKHI/XCIrXCIrcjpcIlwiKStcIik7XFxuXCIscis9Y1tsKzFdLmFyZ1BhY2tBZHZhbmNlO3ErPVwiICAgIHZhciBydiA9IGhhbmRsZVtuYW1lXShcIitrK1wiKTtcXG5cIjtcbmZvcihsPTA7bDxhLTE7KytsKWNbbCsxXS5kZWxldGVPYmplY3QmJihxKz1cIiAgICBhcmdUeXBlXCIrbCtcIi5kZWxldGVPYmplY3QoYXJnXCIrbCtcIik7XFxuXCIpO2QuSWJ8fChxKz1cIiAgICByZXR1cm4gcmV0VHlwZS50b1dpcmVUeXBlKGRlc3RydWN0b3JzLCBydik7XFxuXCIpO2UucHVzaChxK1wifTtcXG5cIik7YT1uYyhlKS5hcHBseShudWxsLGYpO2U9aGMoYSk7cmV0dXJuIGxjW2JdPWV9LHE6ZnVuY3Rpb24oYSxiKXtiPj4+PTA7YT1WKGE+Pj4wKTtiPVYoYik7cmV0dXJuIFcoYVtiXSl9LGQ6ZnVuY3Rpb24oYSl7YT4+Pj0wOzQ8YSYmKFUuZ2V0KGEpLkFiKz0xKX0seDpmdW5jdGlvbihhLGIsYyxkKXtjPj4+PTA7ZD4+Pj0wO2E9VihhPj4+MCk7dmFyIGU9cGNbYl07ZXx8KGU9b2MoYikscGNbYl09ZSk7cmV0dXJuIGUoYSxjLGQpfSx2OmZ1bmN0aW9uKCl7cmV0dXJuIFcoW10pfSxsOmZ1bmN0aW9uKGEpe2E9VihhPj4+MCk7Zm9yKHZhciBiPUFycmF5KGEubGVuZ3RoKSxjPTA7YzxhLmxlbmd0aDtjKyspYltjXT1cbmFbY107cmV0dXJuIFcoYil9LGU6ZnVuY3Rpb24oYSl7cmV0dXJuIFcoZWMoYT4+PjApKX0sazpmdW5jdGlvbigpe3JldHVybiBXKHt9KX0sZzpmdW5jdGlvbihhKXthPj4+PTA7Zm9yKHZhciBiPVYoYSk7Yi5sZW5ndGg7KXt2YXIgYz1iLnBvcCgpO2IucG9wKCkoYyl9SmIoYSl9LGo6ZnVuY3Rpb24oYSxiLGMpe2I+Pj49MDtjPj4+PTA7YT1WKGE+Pj4wKTtiPVYoYik7Yz1WKGMpO2FbYl09Y30sZjpmdW5jdGlvbihhLGIpe2I+Pj49MDthPWNjKGE+Pj4wLFwiX2VtdmFsX3Rha2VfdmFsdWVcIik7YT1hLnJlYWRWYWx1ZUZyb21Qb2ludGVyKGIpO3JldHVybiBXKGEpfSxfOmZ1bmN0aW9uKGEsYil7YT0tOTAwNzE5OTI1NDc0MDk5Mj5hfHw5MDA3MTk5MjU0NzQwOTkyPGE/TmFOOk51bWJlcihhKTtiPj4+PTA7YT1uZXcgRGF0ZSgxRTMqYSk7dygpW2I+Pj4yPj4+MF09YS5nZXRVVENTZWNvbmRzKCk7dygpW2IrND4+PjI+Pj4wXT1hLmdldFVUQ01pbnV0ZXMoKTt3KClbYis4Pj4+Mj4+PjBdPVxuYS5nZXRVVENIb3VycygpO3coKVtiKzEyPj4+Mj4+PjBdPWEuZ2V0VVRDRGF0ZSgpO3coKVtiKzE2Pj4+Mj4+PjBdPWEuZ2V0VVRDTW9udGgoKTt3KClbYisyMD4+PjI+Pj4wXT1hLmdldFVUQ0Z1bGxZZWFyKCktMTkwMDt3KClbYisyND4+PjI+Pj4wXT1hLmdldFVUQ0RheSgpO2E9KGEuZ2V0VGltZSgpLURhdGUuVVRDKGEuZ2V0VVRDRnVsbFllYXIoKSwwLDEsMCwwLDAsMCkpLzg2NEU1fDA7dygpW2IrMjg+Pj4yPj4+MF09YX0sJDpmdW5jdGlvbihhLGIpe2E9LTkwMDcxOTkyNTQ3NDA5OTI+YXx8OTAwNzE5OTI1NDc0MDk5MjxhP05hTjpOdW1iZXIoYSk7Yj4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO3coKVtiPj4+Mj4+PjBdPWEuZ2V0U2Vjb25kcygpO3coKVtiKzQ+Pj4yPj4+MF09YS5nZXRNaW51dGVzKCk7dygpW2IrOD4+PjI+Pj4wXT1hLmdldEhvdXJzKCk7dygpW2IrMTI+Pj4yPj4+MF09YS5nZXREYXRlKCk7dygpW2IrMTY+Pj4yPj4+MF09YS5nZXRNb250aCgpO3coKVtiKzIwPj4+XG4yPj4+MF09YS5nZXRGdWxsWWVhcigpLTE5MDA7dygpW2IrMjQ+Pj4yPj4+MF09YS5nZXREYXkoKTt2YXIgYz0oWShhLmdldEZ1bGxZZWFyKCkpP3FjOnJjKVthLmdldE1vbnRoKCldK2EuZ2V0RGF0ZSgpLTF8MDt3KClbYisyOD4+PjI+Pj4wXT1jO3coKVtiKzM2Pj4+Mj4+PjBdPS0oNjAqYS5nZXRUaW1lem9uZU9mZnNldCgpKTtjPShuZXcgRGF0ZShhLmdldEZ1bGxZZWFyKCksNiwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKTt2YXIgZD0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDAsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7YT0oYyE9ZCYmYS5nZXRUaW1lem9uZU9mZnNldCgpPT1NYXRoLm1pbihkLGMpKXwwO3coKVtiKzMyPj4+Mj4+PjBdPWF9LGFhOmZ1bmN0aW9uKGEpe2E+Pj49MDt2YXIgYj1uZXcgRGF0ZSh3KClbYSsyMD4+PjI+Pj4wXSsxOTAwLHcoKVthKzE2Pj4+Mj4+PjBdLHcoKVthKzEyPj4+Mj4+PjBdLHcoKVthKzg+Pj4yPj4+MF0sdygpW2ErND4+PjI+Pj4wXSx3KClbYT4+PlxuMj4+PjBdLDApLGM9dygpW2ErMzI+Pj4yPj4+MF0sZD1iLmdldFRpbWV6b25lT2Zmc2V0KCksZT0obmV3IERhdGUoYi5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCksZj0obmV3IERhdGUoYi5nZXRGdWxsWWVhcigpLDAsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCksaz1NYXRoLm1pbihmLGUpOzA+Yz93KClbYSszMj4+PjI+Pj4wXT1OdW1iZXIoZSE9ZiYmaz09ZCk6MDxjIT0oaz09ZCkmJihlPU1hdGgubWF4KGYsZSksYi5zZXRUaW1lKGIuZ2V0VGltZSgpKzZFNCooKDA8Yz9rOmUpLWQpKSk7dygpW2ErMjQ+Pj4yPj4+MF09Yi5nZXREYXkoKTtjPShZKGIuZ2V0RnVsbFllYXIoKSk/cWM6cmMpW2IuZ2V0TW9udGgoKV0rYi5nZXREYXRlKCktMXwwO3coKVthKzI4Pj4+Mj4+PjBdPWM7dygpW2E+Pj4yPj4+MF09Yi5nZXRTZWNvbmRzKCk7dygpW2ErND4+PjI+Pj4wXT1iLmdldE1pbnV0ZXMoKTt3KClbYSs4Pj4+Mj4+PjBdPWIuZ2V0SG91cnMoKTt3KClbYSsxMj4+PlxuMj4+PjBdPWIuZ2V0RGF0ZSgpO3coKVthKzE2Pj4+Mj4+PjBdPWIuZ2V0TW9udGgoKTt3KClbYSsyMD4+PjI+Pj4wXT1iLmdldFllYXIoKTtyZXR1cm4gQmlnSW50KGIuZ2V0VGltZSgpLzFFMyl9LFk6c2MsWjp0YyxOOmZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKHIpe3JldHVybihyPXIudG9UaW1lU3RyaW5nKCkubWF0Y2goL1xcKChbQS1aYS16IF0rKVxcKSQvKSk/clsxXTpcIkdNVFwifWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO3ZhciBlPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSxmPW5ldyBEYXRlKGUsMCwxKSxrPW5ldyBEYXRlKGUsNiwxKTtlPWYuZ2V0VGltZXpvbmVPZmZzZXQoKTt2YXIgbD1rLmdldFRpbWV6b25lT2Zmc2V0KCkscT1NYXRoLm1heChlLGwpO3ooKVthPj4+Mj4+PjBdPTYwKnE7dygpW2I+Pj4yPj4+MF09TnVtYmVyKGUhPWwpO2E9ZChmKTtiPWQoayk7YT12YyhhKTtiPXZjKGIpO2w8ZT8oeigpW2M+Pj4yPj4+MF09YSx6KClbYys0Pj4+Mj4+PjBdPWIpOih6KClbYz4+PlxuMj4+PjBdPWIseigpW2MrND4+PjI+Pj4wXT1hKX0sbjooKT0+e0goXCJcIil9LEU6KCk9Pnt9LEc6KCk9PkRhdGUubm93KCksbGE6KCk9PntGYSs9MTt0aHJvd1widW53aW5kXCI7fSxQOmZ1bmN0aW9uKCl7cmV0dXJuIDQyOTQ5MDE3NjB9LHM6KCk9PnBlcmZvcm1hbmNlLnRpbWVPcmlnaW4rcGVyZm9ybWFuY2Uubm93KCksdzooKT0+RD9yZXF1aXJlKFwib3NcIikuY3B1cygpLmxlbmd0aDpuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSxNOmZ1bmN0aW9uKGEpe2E+Pj49MDt2YXIgYj10KCkubGVuZ3RoO2lmKGE8PWJ8fDQyOTQ5MDE3NjA8YSlyZXR1cm4hMTtmb3IodmFyIGM9MTs0Pj1jO2MqPTIpe3ZhciBkPWIqKDErLjIvYyk7ZD1NYXRoLm1pbihkLGErMTAwNjYzMjk2KTt2YXIgZT1NYXRoO2Q9TWF0aC5tYXgoYSxkKTthOntlPShlLm1pbi5jYWxsKGUsNDI5NDkwMTc2MCxkKyg2NTUzNi1kJTY1NTM2KSU2NTUzNiktbS5idWZmZXIuYnl0ZUxlbmd0aCs2NTUzNSkvNjU1MzY7dHJ5e20uZ3JvdyhlKTtcbnAoKTt2YXIgZj0xO2JyZWFrIGF9Y2F0Y2goayl7fWY9dm9pZCAwfWlmKGYpcmV0dXJuITB9cmV0dXJuITF9LGZhOnpjLGdhOkFjLFY6V2EsejpCYyxDOkNjLGNhOkRjLEI6RmMsYTptfHxBLndhc21NZW1vcnksb2E6S2MscDpmdW5jdGlvbihhLGIsYyxkKXtyZXR1cm4gS2MoYT4+PjAsYj4+PjAsYz4+PjAsZD4+PjApfX0sWj1mdW5jdGlvbigpe3ZhciBhPXthOlBjfTtLKys7TmEoYSxmdW5jdGlvbihiKXt2YXIgYz1iLm1vZHVsZTtaPWIuaW5zdGFuY2UuZXhwb3J0cztaPVFjKCk7Ty5FYi5wdXNoKFouWGEpO2ViPVouX2E7RGEudW5zaGlmdChaLnNhKTt4YT1jO0lhKCl9KS5jYXRjaChrYSk7cmV0dXJue319KCk7QS5fT3J0SW5pdD0oYSxiKT0+KEEuX09ydEluaXQ9Wi50YSkoYSxiKTtBLl9PcnRHZXRMYXN0RXJyb3I9KGEsYik9PihBLl9PcnRHZXRMYXN0RXJyb3I9Wi51YSkoYSxiKTtcbkEuX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPShhLGIsYyxkLGUsZixrLGwscSxyKT0+KEEuX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPVoudmEpKGEsYixjLGQsZSxmLGssbCxxLHIpO0EuX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyPShhLGIpPT4oQS5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9Wi53YSkoYSxiKTtBLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9KGEsYixjKT0+KEEuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT1aLnhhKShhLGIsYyk7QS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PShhLGIsYyk9PihBLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9Wi55YSkoYSxiLGMpO0EuX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucz1hPT4oQS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPVouemEpKGEpO0EuX09ydENyZWF0ZVNlc3Npb249KGEsYixjKT0+KEEuX09ydENyZWF0ZVNlc3Npb249Wi5BYSkoYSxiLGMpO1xuQS5fT3J0UmVsZWFzZVNlc3Npb249YT0+KEEuX09ydFJlbGVhc2VTZXNzaW9uPVouQmEpKGEpO0EuX09ydEdldElucHV0T3V0cHV0Q291bnQ9KGEsYixjKT0+KEEuX09ydEdldElucHV0T3V0cHV0Q291bnQ9Wi5DYSkoYSxiLGMpO0EuX09ydEdldElucHV0TmFtZT0oYSxiKT0+KEEuX09ydEdldElucHV0TmFtZT1aLkRhKShhLGIpO0EuX09ydEdldE91dHB1dE5hbWU9KGEsYik9PihBLl9PcnRHZXRPdXRwdXROYW1lPVouRWEpKGEsYik7QS5fT3J0RnJlZT1hPT4oQS5fT3J0RnJlZT1aLkZhKShhKTtBLl9PcnRDcmVhdGVUZW5zb3I9KGEsYixjLGQsZSxmKT0+KEEuX09ydENyZWF0ZVRlbnNvcj1aLkdhKShhLGIsYyxkLGUsZik7QS5fT3J0R2V0VGVuc29yRGF0YT0oYSxiLGMsZCxlKT0+KEEuX09ydEdldFRlbnNvckRhdGE9Wi5IYSkoYSxiLGMsZCxlKTtBLl9PcnRSZWxlYXNlVGVuc29yPWE9PihBLl9PcnRSZWxlYXNlVGVuc29yPVouSWEpKGEpO1xuQS5fT3J0Q3JlYXRlUnVuT3B0aW9ucz0oYSxiLGMsZCk9PihBLl9PcnRDcmVhdGVSdW5PcHRpb25zPVouSmEpKGEsYixjLGQpO0EuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PShhLGIsYyk9PihBLl9PcnRBZGRSdW5Db25maWdFbnRyeT1aLkthKShhLGIsYyk7QS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9YT0+KEEuX09ydFJlbGVhc2VSdW5PcHRpb25zPVouTGEpKGEpO0EuX09ydENyZWF0ZUJpbmRpbmc9YT0+KEEuX09ydENyZWF0ZUJpbmRpbmc9Wi5NYSkoYSk7QS5fT3J0QmluZElucHV0PShhLGIsYyk9PihBLl9PcnRCaW5kSW5wdXQ9Wi5OYSkoYSxiLGMpO0EuX09ydEJpbmRPdXRwdXQ9KGEsYixjLGQpPT4oQS5fT3J0QmluZE91dHB1dD1aLk9hKShhLGIsYyxkKTtBLl9PcnRDbGVhckJvdW5kT3V0cHV0cz1hPT4oQS5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9Wi5QYSkoYSk7QS5fT3J0UmVsZWFzZUJpbmRpbmc9YT0+KEEuX09ydFJlbGVhc2VCaW5kaW5nPVouUWEpKGEpO1xuQS5fT3J0UnVuV2l0aEJpbmRpbmc9KGEsYixjLGQsZSk9PihBLl9PcnRSdW5XaXRoQmluZGluZz1aLlJhKShhLGIsYyxkLGUpO0EuX09ydFJ1bj0oYSxiLGMsZCxlLGYsayxsKT0+KEEuX09ydFJ1bj1aLlNhKShhLGIsYyxkLGUsZixrLGwpO0EuX09ydEVuZFByb2ZpbGluZz1hPT4oQS5fT3J0RW5kUHJvZmlsaW5nPVouVGEpKGEpO3ZhciBaYT1BLl9wdGhyZWFkX3NlbGY9KCk9PihaYT1BLl9wdGhyZWFkX3NlbGY9Wi5VYSkoKSx1Yz1BLl9tYWxsb2M9YT0+KHVjPUEuX21hbGxvYz1aLlZhKShhKSxYPUEuX2ZyZWU9YT0+KFg9QS5fZnJlZT1aLldhKShhKTtBLl9fZW1zY3JpcHRlbl90bHNfaW5pdD0oKT0+KEEuX19lbXNjcmlwdGVuX3Rsc19pbml0PVouWGEpKCk7dmFyIGJjPWE9PihiYz1aLllhKShhKTtBLl9fZW1iaW5kX2luaXRpYWxpemVfYmluZGluZ3M9KCk9PihBLl9fZW1iaW5kX2luaXRpYWxpemVfYmluZGluZ3M9Wi5aYSkoKTtcbnZhciBPYz1BLl9fZW1zY3JpcHRlbl90aHJlYWRfaW5pdD0oYSxiLGMsZCxlLGYpPT4oT2M9QS5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXQ9Wi4kYSkoYSxiLGMsZCxlLGYpO0EuX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkPSgpPT4oQS5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWQ9Wi5hYikoKTt2YXIgJGI9KGEsYixjLGQpPT4oJGI9Wi5iYikoYSxiLGMsZCksWWE9YT0+KFlhPVouY2IpKGEpLGZiPUEuX19lbXNjcmlwdGVuX3RocmVhZF9leGl0PWE9PihmYj1BLl9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdD1aLmRiKShhKSxXYj1BLl9fZW1zY3JpcHRlbl9jaGVja19tYWlsYm94PSgpPT4oV2I9QS5fX2Vtc2NyaXB0ZW5fY2hlY2tfbWFpbGJveD1aLmViKSgpLGJiPShhLGIpPT4oYmI9Wi5mYikoYSxiKSxYYj0oKT0+KFhiPVouZ2IpKCksY2I9YT0+KGNiPVouaGIpKGEpLFpiPWE9PihaYj1aLmliKShhKTtcbmZ1bmN0aW9uIFFjKCl7dmFyIGE9WjthPU9iamVjdC5hc3NpZ24oe30sYSk7dmFyIGI9ZD0+KCk9PmQoKT4+PjAsYz1kPT5lPT5kKGUpPj4+MDthLl9fZXJybm9fbG9jYXRpb249YihhLl9fZXJybm9fbG9jYXRpb24pO2EuVWE9YihhLlVhKTthLlZhPWMoYS5WYSk7YS5ZYT1jKGEuWWEpO2EuZ2I9YihhLmdiKTthLmliPWMoYS5pYik7cmV0dXJuIGF9QS5rZWVwUnVudGltZUFsaXZlPUdhO0Eud2FzbU1lbW9yeT1tO0Euc3RhY2tBbGxvYz1aYjtBLnN0YWNrU2F2ZT1YYjtBLnN0YWNrUmVzdG9yZT1jYjtBLlVURjhUb1N0cmluZz1UYTtBLnN0cmluZ1RvVVRGOD1wYjtBLmxlbmd0aEJ5dGVzVVRGOD1uYjtBLkV4aXRTdGF0dXM9T2E7QS5QVGhyZWFkPU87dmFyIFJjO0w9ZnVuY3Rpb24gU2MoKXtSY3x8VGMoKTtSY3x8KEw9U2MpfTtcbmZ1bmN0aW9uIFRjKCl7MDxLfHwoRT8oamEoQSksRXx8YWIoRGEpLHN0YXJ0V29ya2VyKEEpKTooYWIoQ2EpLDA8S3x8UmN8fChSYz0hMCxBLmNhbGxlZFJ1bj0hMCx5YXx8KEV8fGFiKERhKSxqYShBKSxFfHxhYihFYSkpKSkpfVRjKCk7XG5cblxuICByZXR1cm4gbW9kdWxlQXJnLnJlYWR5XG59XG5cbik7XG59KSgpO1xuaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JylcbiAgbW9kdWxlLmV4cG9ydHMgPSBvcnRXYXNtVGhyZWFkZWQ7XG5lbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZVsnYW1kJ10pXG4gIGRlZmluZShbXSwgKCkgPT4gb3J0V2FzbVRocmVhZGVkKTtcbiIsICJcInVzZSBzdHJpY3RcIjt2YXIgTW9kdWxlPXt9O3ZhciBFTlZJUk9OTUVOVF9JU19OT0RFPXR5cGVvZiBwcm9jZXNzPT1cIm9iamVjdFwiJiZ0eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucz09XCJvYmplY3RcIiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZT09XCJzdHJpbmdcIjtpZihFTlZJUk9OTUVOVF9JU19OT0RFKXt2YXIgbm9kZVdvcmtlclRocmVhZHM9cmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpO3ZhciBwYXJlbnRQb3J0PW5vZGVXb3JrZXJUaHJlYWRzLnBhcmVudFBvcnQ7cGFyZW50UG9ydC5vbihcIm1lc3NhZ2VcIixkYXRhPT5vbm1lc3NhZ2Uoe2RhdGE6ZGF0YX0pKTt2YXIgZnM9cmVxdWlyZShcImZzXCIpO09iamVjdC5hc3NpZ24oZ2xvYmFsLHtzZWxmOmdsb2JhbCxyZXF1aXJlOnJlcXVpcmUsTW9kdWxlOk1vZHVsZSxsb2NhdGlvbjp7aHJlZjpfX2ZpbGVuYW1lfSxXb3JrZXI6bm9kZVdvcmtlclRocmVhZHMuV29ya2VyLGltcG9ydFNjcmlwdHM6Zj0+KDAsZXZhbCkoZnMucmVhZEZpbGVTeW5jKGYsXCJ1dGY4XCIpK1wiLy8jIHNvdXJjZVVSTD1cIitmKSxwb3N0TWVzc2FnZTptc2c9PnBhcmVudFBvcnQucG9zdE1lc3NhZ2UobXNnKSxwZXJmb3JtYW5jZTpnbG9iYWwucGVyZm9ybWFuY2V8fHtub3c6RGF0ZS5ub3d9fSl9dmFyIGluaXRpYWxpemVkSlM9ZmFsc2U7ZnVuY3Rpb24gdGhyZWFkUHJpbnRFcnIoKXt2YXIgdGV4dD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oXCIgXCIpO2lmKEVOVklST05NRU5UX0lTX05PREUpe2ZzLndyaXRlU3luYygyLHRleHQrXCJcXG5cIik7cmV0dXJufWNvbnNvbGUuZXJyb3IodGV4dCl9ZnVuY3Rpb24gdGhyZWFkQWxlcnQoKXt2YXIgdGV4dD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oXCIgXCIpO3Bvc3RNZXNzYWdlKHtjbWQ6XCJhbGVydFwiLHRleHQ6dGV4dCx0aHJlYWRJZDpNb2R1bGVbXCJfcHRocmVhZF9zZWxmXCJdKCl9KX12YXIgZXJyPXRocmVhZFByaW50RXJyO3NlbGYuYWxlcnQ9dGhyZWFkQWxlcnQ7TW9kdWxlW1wiaW5zdGFudGlhdGVXYXNtXCJdPShpbmZvLHJlY2VpdmVJbnN0YW5jZSk9Pnt2YXIgbW9kdWxlPU1vZHVsZVtcIndhc21Nb2R1bGVcIl07TW9kdWxlW1wid2FzbU1vZHVsZVwiXT1udWxsO3ZhciBpbnN0YW5jZT1uZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UobW9kdWxlLGluZm8pO3JldHVybiByZWNlaXZlSW5zdGFuY2UoaW5zdGFuY2UpfTtzZWxmLm9udW5oYW5kbGVkcmVqZWN0aW9uPWU9Pnt0aHJvdyBlLnJlYXNvbnx8ZX07ZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShlKXt0cnl7aWYoZS5kYXRhLmNtZD09PVwibG9hZFwiKXtsZXQgbWVzc2FnZVF1ZXVlPVtdO3NlbGYub25tZXNzYWdlPWU9Pm1lc3NhZ2VRdWV1ZS5wdXNoKGUpO3NlbGYuc3RhcnRXb3JrZXI9aW5zdGFuY2U9PntNb2R1bGU9aW5zdGFuY2U7cG9zdE1lc3NhZ2Uoe1wiY21kXCI6XCJsb2FkZWRcIn0pO2ZvcihsZXQgbXNnIG9mIG1lc3NhZ2VRdWV1ZSl7aGFuZGxlTWVzc2FnZShtc2cpfXNlbGYub25tZXNzYWdlPWhhbmRsZU1lc3NhZ2V9O01vZHVsZVtcIndhc21Nb2R1bGVcIl09ZS5kYXRhLndhc21Nb2R1bGU7Zm9yKGNvbnN0IGhhbmRsZXIgb2YgZS5kYXRhLmhhbmRsZXJzKXtNb2R1bGVbaGFuZGxlcl09KC4uLmFyZ3MpPT57cG9zdE1lc3NhZ2Uoe2NtZDpcImNhbGxIYW5kbGVyXCIsaGFuZGxlcjpoYW5kbGVyLGFyZ3M6YXJnc30pfX1Nb2R1bGVbXCJ3YXNtTWVtb3J5XCJdPWUuZGF0YS53YXNtTWVtb3J5O01vZHVsZVtcImJ1ZmZlclwiXT1Nb2R1bGVbXCJ3YXNtTWVtb3J5XCJdLmJ1ZmZlcjtNb2R1bGVbXCJFTlZJUk9OTUVOVF9JU19QVEhSRUFEXCJdPXRydWU7aWYodHlwZW9mIGUuZGF0YS51cmxPckJsb2I9PVwic3RyaW5nXCIpe2ltcG9ydFNjcmlwdHMoZS5kYXRhLnVybE9yQmxvYil9ZWxzZXt2YXIgb2JqZWN0VXJsPVVSTC5jcmVhdGVPYmplY3RVUkwoZS5kYXRhLnVybE9yQmxvYik7aW1wb3J0U2NyaXB0cyhvYmplY3RVcmwpO1VSTC5yZXZva2VPYmplY3RVUkwob2JqZWN0VXJsKX1vcnRXYXNtVGhyZWFkZWQoTW9kdWxlKX1lbHNlIGlmKGUuZGF0YS5jbWQ9PT1cInJ1blwiKXtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXRcIl0oZS5kYXRhLnB0aHJlYWRfcHRyLC8qaXNfbWFpbj0qLzAsLyppc19ydW50aW1lPSovMCwvKmNhbl9ibG9jaz0qLzEpO01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfbWFpbGJveF9hd2FpdFwiXShlLmRhdGEucHRocmVhZF9wdHIpO01vZHVsZVtcImVzdGFibGlzaFN0YWNrU3BhY2VcIl0oKTtNb2R1bGVbXCJQVGhyZWFkXCJdLnJlY2VpdmVPYmplY3RUcmFuc2ZlcihlLmRhdGEpO01vZHVsZVtcIlBUaHJlYWRcIl0udGhyZWFkSW5pdFRMUygpO2lmKCFpbml0aWFsaXplZEpTKXtNb2R1bGVbXCJfX2VtYmluZF9pbml0aWFsaXplX2JpbmRpbmdzXCJdKCk7aW5pdGlhbGl6ZWRKUz10cnVlfXRyeXtNb2R1bGVbXCJpbnZva2VFbnRyeVBvaW50XCJdKGUuZGF0YS5zdGFydF9yb3V0aW5lLGUuZGF0YS5hcmcpfWNhdGNoKGV4KXtpZihleCE9XCJ1bndpbmRcIil7dGhyb3cgZXh9fX1lbHNlIGlmKGUuZGF0YS5jbWQ9PT1cImNhbmNlbFwiKXtpZihNb2R1bGVbXCJfcHRocmVhZF9zZWxmXCJdKCkpe01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdFwiXSgtMSl9fWVsc2UgaWYoZS5kYXRhLnRhcmdldD09PVwic2V0aW1tZWRpYXRlXCIpe31lbHNlIGlmKGUuZGF0YS5jbWQ9PT1cImNoZWNrTWFpbGJveFwiKXtpZihpbml0aWFsaXplZEpTKXtNb2R1bGVbXCJjaGVja01haWxib3hcIl0oKX19ZWxzZSBpZihlLmRhdGEuY21kKXtlcnIoYHdvcmtlci5qcyByZWNlaXZlZCB1bmtub3duIGNvbW1hbmQgJHtlLmRhdGEuY21kfWApO2VycihlLmRhdGEpfX1jYXRjaChleCl7aWYoTW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkXCJdKXtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWRcIl0oKX10aHJvdyBleH19c2VsZi5vbm1lc3NhZ2U9aGFuZGxlTWVzc2FnZTtcbiIsICJleHBvcnQgY29uc3Qgam9pbiA9IHVuZGVmaW5lZDsiLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7RW52fSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge09ydFdhc21Nb2R1bGV9IGZyb20gJy4vYmluZGluZy9vcnQtd2FzbSc7XG5pbXBvcnQge09ydFdhc21UaHJlYWRlZE1vZHVsZX0gZnJvbSAnLi9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkJztcblxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cyAqL1xubGV0IG9ydFdhc21GYWN0b3J5OiBFbXNjcmlwdGVuTW9kdWxlRmFjdG9yeTxPcnRXYXNtTW9kdWxlPjtcblxuaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfVFJBSU5JTkcpIHtcbiAgb3J0V2FzbUZhY3RvcnkgPSByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXRyYWluaW5nLXdhc20tc2ltZC5qcycpO1xufSBlbHNlIHtcbiAgb3J0V2FzbUZhY3RvcnkgPVxuICAgICAgQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSA/IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS5qcycpIDogcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXNpbWQuanNlcC5qcycpO1xufVxuXG5jb25zdCBvcnRXYXNtRmFjdG9yeVRocmVhZGVkOiBFbXNjcmlwdGVuTW9kdWxlRmFjdG9yeTxPcnRXYXNtTW9kdWxlPiA9ICFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9USFJFQUQgP1xuICAgIChCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVID8gcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLmpzJykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC5qcycpKSA6XG4gICAgb3J0V2FzbUZhY3Rvcnk7XG4vKiBlc2xpbnQtZW5hYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMgKi9cblxubGV0IHdhc206IE9ydFdhc21Nb2R1bGV8dW5kZWZpbmVkO1xubGV0IGluaXRpYWxpemVkID0gZmFsc2U7XG5sZXQgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG5sZXQgYWJvcnRlZCA9IGZhbHNlO1xuXG5jb25zdCBpc011bHRpVGhyZWFkU3VwcG9ydGVkID0gKCk6IGJvb2xlYW4gPT4ge1xuICB0cnkge1xuICAgIC8vIElmICdTaGFyZWRBcnJheUJ1ZmZlcicgaXMgbm90IGF2YWlsYWJsZSwgV2ViQXNzZW1ibHkgdGhyZWFkcyB3aWxsIG5vdCB3b3JrLlxuICAgIGlmICh0eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gVGVzdCBmb3IgdHJhbnNmZXJhYmlsaXR5IG9mIFNBQnMgKGZvciBicm93c2Vycy4gbmVlZGVkIGZvciBGaXJlZm94KVxuICAgIC8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyFtc2cvbW96aWxsYS5kZXYucGxhdGZvcm0vSUhrQlpsSEVUcEEvZHdzTU5jaFdFUUFKXG4gICAgaWYgKHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG5ldyBNZXNzYWdlQ2hhbm5lbCgpLnBvcnQxLnBvc3RNZXNzYWdlKG5ldyBTaGFyZWRBcnJheUJ1ZmZlcigxKSk7XG4gICAgfVxuXG4gICAgLy8gVGVzdCBmb3IgV2ViQXNzZW1ibHkgdGhyZWFkcyBjYXBhYmlsaXR5IChmb3IgYm90aCBicm93c2VycyBhbmQgTm9kZS5qcylcbiAgICAvLyBUaGlzIHR5cGVkIGFycmF5IGlzIGEgV2ViQXNzZW1ibHkgcHJvZ3JhbSBjb250YWluaW5nIHRocmVhZGVkIGluc3RydWN0aW9ucy5cbiAgICByZXR1cm4gV2ViQXNzZW1ibHkudmFsaWRhdGUobmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgMCwgOTcsIDExNSwgMTA5LCAxLCAwLCAgMCwgIDAsIDEsIDQsIDEsICA5NiwgMCwgICAwLCAgMywgMiwgMSwgIDAsIDUsXG4gICAgICA0LCAxLCAgMywgICAxLCAgIDEsIDEwLCAxMSwgMSwgOSwgMCwgNjUsIDAsICAyNTQsIDE2LCAyLCAwLCAyNiwgMTFcbiAgICBdKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IGlzU2ltZFN1cHBvcnRlZCA9ICgpOiBib29sZWFuID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBUZXN0IGZvciBXZWJBc3NlbWJseSBTSU1EIGNhcGFiaWxpdHkgKGZvciBib3RoIGJyb3dzZXJzIGFuZCBOb2RlLmpzKVxuICAgIC8vIFRoaXMgdHlwZWQgYXJyYXkgaXMgYSBXZWJBc3NlbWJseSBwcm9ncmFtIGNvbnRhaW5pbmcgU0lNRCBpbnN0cnVjdGlvbnMuXG5cbiAgICAvLyBUaGUgYmluYXJ5IGRhdGEgaXMgZ2VuZXJhdGVkIGZyb20gdGhlIGZvbGxvd2luZyBjb2RlIGJ5IHdhdDJ3YXNtOlxuICAgIC8vXG4gICAgLy8gKG1vZHVsZVxuICAgIC8vICAgKHR5cGUgJHQwIChmdW5jKSlcbiAgICAvLyAgIChmdW5jICRmMCAodHlwZSAkdDApXG4gICAgLy8gICAgIChkcm9wXG4gICAgLy8gICAgICAgKGkzMng0LmRvdF9pMTZ4OF9zXG4gICAgLy8gICAgICAgICAoaTh4MTYuc3BsYXRcbiAgICAvLyAgICAgICAgICAgKGkzMi5jb25zdCAwKSlcbiAgICAvLyAgICAgICAgICh2MTI4LmNvbnN0IGkzMng0IDB4MDAwMDAwMDAgMHgwMDAwMDAwMCAweDAwMDAwMDAwIDB4MDAwMDAwMDApKSkpKVxuXG4gICAgcmV0dXJuIFdlYkFzc2VtYmx5LnZhbGlkYXRlKG5ldyBVaW50OEFycmF5KFtcbiAgICAgIDAsICAgOTcsIDExNSwgMTA5LCAxLCAwLCAwLCAwLCAxLCA0LCAxLCA5NiwgMCwgMCwgMywgMiwgMSwgMCwgMTAsIDMwLCAxLCAgIDI4LCAgMCwgNjUsIDAsXG4gICAgICAyNTMsIDE1LCAyNTMsIDEyLCAgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgIDAsIDAsIDAsIDAsIDAsIDAsIDAsICAwLCAgMjUzLCAxODYsIDEsIDI2LCAxMVxuICAgIF0pKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuY29uc3QgZ2V0V2FzbUZpbGVOYW1lID0gKHVzZVNpbWQ6IGJvb2xlYW4sIHVzZVRocmVhZHM6IGJvb2xlYW4pID0+IHtcbiAgaWYgKHVzZVNpbWQpIHtcbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9UUkFJTklORykge1xuICAgICAgcmV0dXJuICdvcnQtdHJhaW5pbmctd2FzbS1zaW1kLndhc20nO1xuICAgIH1cbiAgICByZXR1cm4gdXNlVGhyZWFkcyA/ICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLndhc20nIDogJ29ydC13YXNtLXNpbWQud2FzbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHVzZVRocmVhZHMgPyAnb3J0LXdhc20tdGhyZWFkZWQud2FzbScgOiAnb3J0LXdhc20ud2FzbSc7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBpbml0aWFsaXplV2ViQXNzZW1ibHkgPSBhc3luYyhmbGFnczogRW52LldlYkFzc2VtYmx5RmxhZ3MpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgaWYgKGluaXRpYWxpemVkKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG4gIGlmIChpbml0aWFsaXppbmcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ211bHRpcGxlIGNhbGxzIHRvIFxcJ2luaXRpYWxpemVXZWJBc3NlbWJseSgpXFwnIGRldGVjdGVkLicpO1xuICB9XG4gIGlmIChhYm9ydGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcmV2aW91cyBjYWxsIHRvIFxcJ2luaXRpYWxpemVXZWJBc3NlbWJseSgpXFwnIGZhaWxlZC4nKTtcbiAgfVxuXG4gIGluaXRpYWxpemluZyA9IHRydWU7XG5cbiAgLy8gd2FzbSBmbGFncyBhcmUgYWxyZWFkeSBpbml0aWFsaXplZFxuICBjb25zdCB0aW1lb3V0ID0gZmxhZ3MuaW5pdFRpbWVvdXQhO1xuICBjb25zdCBudW1UaHJlYWRzID0gZmxhZ3MubnVtVGhyZWFkcyE7XG4gIGNvbnN0IHNpbWQgPSBmbGFncy5zaW1kITtcblxuICBjb25zdCB1c2VUaHJlYWRzID0gbnVtVGhyZWFkcyA+IDEgJiYgaXNNdWx0aVRocmVhZFN1cHBvcnRlZCgpO1xuICBjb25zdCB1c2VTaW1kID0gc2ltZCAmJiBpc1NpbWRTdXBwb3J0ZWQoKTtcblxuICBjb25zdCB3YXNtUGF0aHMgPSBmbGFncy53YXNtUGF0aHM7XG4gIGNvbnN0IHdhc21QcmVmaXhPdmVycmlkZSA9IHR5cGVvZiB3YXNtUGF0aHMgPT09ICdzdHJpbmcnID8gd2FzbVBhdGhzIDogdW5kZWZpbmVkO1xuICBjb25zdCB3YXNtRmlsZU5hbWUgPSBnZXRXYXNtRmlsZU5hbWUodXNlU2ltZCwgdXNlVGhyZWFkcyk7XG4gIGNvbnN0IHdhc21QYXRoT3ZlcnJpZGUgPSB0eXBlb2Ygd2FzbVBhdGhzID09PSAnb2JqZWN0JyA/IHdhc21QYXRoc1t3YXNtRmlsZU5hbWVdIDogdW5kZWZpbmVkO1xuXG4gIGxldCBpc1RpbWVvdXQgPSBmYWxzZTtcblxuICBjb25zdCB0YXNrczogQXJyYXk8UHJvbWlzZTx2b2lkPj4gPSBbXTtcblxuICAvLyBwcm9taXNlIGZvciB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ID4gMCkge1xuICAgIHRhc2tzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpc1RpbWVvdXQgPSB0cnVlO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9LCB0aW1lb3V0KTtcbiAgICB9KSk7XG4gIH1cblxuICAvLyBwcm9taXNlIGZvciBtb2R1bGUgaW5pdGlhbGl6YXRpb25cbiAgdGFza3MucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgZmFjdG9yeSA9IHVzZVRocmVhZHMgPyBvcnRXYXNtRmFjdG9yeVRocmVhZGVkIDogb3J0V2FzbUZhY3Rvcnk7XG4gICAgY29uc3QgY29uZmlnOiBQYXJ0aWFsPE9ydFdhc21Nb2R1bGU+ID0ge1xuICAgICAgbG9jYXRlRmlsZTogKGZpbGVOYW1lOiBzdHJpbmcsIHNjcmlwdERpcmVjdG9yeTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fVEhSRUFEICYmIHVzZVRocmVhZHMgJiYgZmlsZU5hbWUuZW5kc1dpdGgoJy53b3JrZXIuanMnKSAmJlxuICAgICAgICAgICAgdHlwZW9mIEJsb2IgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmV0dXJuIFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoXG4gICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIHJlcXVpcmUoKSBmdW5jdGlvbiBpcyBoYW5kbGVkIGJ5IGVzYnVpbGQgcGx1Z2luIHRvIGxvYWQgZmlsZSBjb250ZW50IGFzIHN0cmluZy5cbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0c1xuICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC53b3JrZXIuanMnKVxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB7dHlwZTogJ3RleHQvamF2YXNjcmlwdCd9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmlsZU5hbWUuZW5kc1dpdGgoJy53YXNtJykpIHtcbiAgICAgICAgICBpZiAod2FzbVBhdGhPdmVycmlkZSkge1xuICAgICAgICAgICAgcmV0dXJuIHdhc21QYXRoT3ZlcnJpZGU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgcHJlZml4ID0gd2FzbVByZWZpeE92ZXJyaWRlID8/IHNjcmlwdERpcmVjdG9yeTtcblxuICAgICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xuICAgICAgICAgICAgaWYgKHdhc21GaWxlTmFtZSA9PT0gJ29ydC13YXNtLXNpbWQud2FzbScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArICdvcnQtd2FzbS1zaW1kLmpzZXAud2FzbSc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHdhc21GaWxlTmFtZSA9PT0gJ29ydC13YXNtLXNpbWQtdGhyZWFkZWQud2FzbScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAud2FzbSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHByZWZpeCArIHdhc21GaWxlTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzY3JpcHREaXJlY3RvcnkgKyBmaWxlTmFtZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9USFJFQUQgJiYgdXNlVGhyZWFkcykge1xuICAgICAgaWYgKHR5cGVvZiBCbG9iID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25maWcubWFpblNjcmlwdFVybE9yQmxvYiA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdvcnQtd2FzbS10aHJlYWRlZC5qcycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc2NyaXB0U291cmNlQ29kZSA9IGB2YXIgb3J0V2FzbVRocmVhZGVkPSR7ZmFjdG9yeS50b1N0cmluZygpfTtgO1xuICAgICAgICBjb25maWcubWFpblNjcmlwdFVybE9yQmxvYiA9IG5ldyBCbG9iKFtzY3JpcHRTb3VyY2VDb2RlXSwge3R5cGU6ICd0ZXh0L2phdmFzY3JpcHQnfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZmFjdG9yeShjb25maWcpLnRoZW4oXG4gICAgICAgIC8vIHdhc20gbW9kdWxlIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICBtb2R1bGUgPT4ge1xuICAgICAgICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICB3YXNtID0gbW9kdWxlO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gd2FzbSBtb2R1bGUgZmFpbGVkIHRvIGluaXRpYWxpemVcbiAgICAgICAgKHdoYXQpID0+IHtcbiAgICAgICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgICAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICByZWplY3Qod2hhdCk7XG4gICAgICAgIH0pO1xuICB9KSk7XG5cbiAgYXdhaXQgUHJvbWlzZS5yYWNlKHRhc2tzKTtcblxuICBpZiAoaXNUaW1lb3V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBXZWJBc3NlbWJseSBiYWNrZW5kIGluaXRpYWxpemluZyBmYWlsZWQgZHVlIHRvIHRpbWVvdXQ6ICR7dGltZW91dH1tc2ApO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0SW5zdGFuY2UgPSAoKTogT3J0V2FzbU1vZHVsZSA9PiB7XG4gIGlmIChpbml0aWFsaXplZCAmJiB3YXNtKSB7XG4gICAgcmV0dXJuIHdhc207XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkFzc2VtYmx5IGlzIG5vdCBpbml0aWFsaXplZCB5ZXQuJyk7XG59O1xuXG5leHBvcnQgY29uc3QgZGlzcG9zZSA9ICgpOiB2b2lkID0+IHtcbiAgaWYgKGluaXRpYWxpemVkICYmICFpbml0aWFsaXppbmcgJiYgIWFib3J0ZWQpIHtcbiAgICBpbml0aWFsaXppbmcgPSB0cnVlO1xuXG4gICAgKHdhc20gYXMgT3J0V2FzbVRocmVhZGVkTW9kdWxlKS5QVGhyZWFkPy50ZXJtaW5hdGVBbGxUaHJlYWRzKCk7XG4gICAgd2FzbSA9IHVuZGVmaW5lZDtcblxuICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgIGluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgYWJvcnRlZCA9IHRydWU7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcblxuZXhwb3J0IGNvbnN0IGFsbG9jV2FzbVN0cmluZyA9IChkYXRhOiBzdHJpbmcsIGFsbG9jczogbnVtYmVyW10pOiBudW1iZXIgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBjb25zdCBkYXRhTGVuZ3RoID0gd2FzbS5sZW5ndGhCeXRlc1VURjgoZGF0YSkgKyAxO1xuICBjb25zdCBkYXRhT2Zmc2V0ID0gd2FzbS5fbWFsbG9jKGRhdGFMZW5ndGgpO1xuICB3YXNtLnN0cmluZ1RvVVRGOChkYXRhLCBkYXRhT2Zmc2V0LCBkYXRhTGVuZ3RoKTtcbiAgYWxsb2NzLnB1c2goZGF0YU9mZnNldCk7XG5cbiAgcmV0dXJuIGRhdGFPZmZzZXQ7XG59O1xuXG5pbnRlcmZhY2UgRXh0cmFPcHRpb25zSGFuZGxlciB7XG4gIChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgaXRlcmF0ZUV4dHJhT3B0aW9ucyA9XG4gICAgKG9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBwcmVmaXg6IHN0cmluZywgc2VlbjogV2Vha1NldDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4sXG4gICAgIGhhbmRsZXI6IEV4dHJhT3B0aW9uc0hhbmRsZXIpOiB2b2lkID0+IHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAnb2JqZWN0JyAmJiBvcHRpb25zICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChzZWVuLmhhcyhvcHRpb25zKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2lyY3VsYXIgcmVmZXJlbmNlIGluIG9wdGlvbnMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWVuLmFkZChvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBPYmplY3QuZW50cmllcyhvcHRpb25zKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IChwcmVmaXgpID8gcHJlZml4ICsga2V5IDoga2V5O1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIGl0ZXJhdGVFeHRyYU9wdGlvbnModmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIG5hbWUgKyAnLicsIHNlZW4sIGhhbmRsZXIpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGhhbmRsZXIobmFtZSwgdmFsdWUudG9TdHJpbmcoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBoYW5kbGVyKG5hbWUsICh2YWx1ZSkgPyAnMScgOiAnMCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgaGFuZGxlIGV4dHJhIGNvbmZpZyB0eXBlOiAke3R5cGVvZiB2YWx1ZX1gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuLyoqXG4gKiBjaGVjayB3ZWIgYXNzZW1ibHkgQVBJJ3MgbGFzdCBlcnJvciBhbmQgdGhyb3cgZXJyb3IgaWYgYW55IGVycm9yIG9jY3VycmVkLlxuICogQHBhcmFtIG1lc3NhZ2UgYSBtZXNzYWdlIHVzZWQgd2hlbiBhbiBlcnJvciBvY2N1cnJlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGNoZWNrTGFzdEVycm9yID0gKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBjb25zdCBzdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyYW1zT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDgpO1xuICAgIHdhc20uX09ydEdldExhc3RFcnJvcihwYXJhbXNPZmZzZXQsIHBhcmFtc09mZnNldCArIDQpO1xuICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uSEVBUDMyW3BhcmFtc09mZnNldCAvIDRdO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZVBvaW50ZXIgPSB3YXNtLkhFQVBVMzJbcGFyYW1zT2Zmc2V0IC8gNCArIDFdO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZVBvaW50ZXIgPyB3YXNtLlVURjhUb1N0cmluZyhlcnJvck1lc3NhZ2VQb2ludGVyKSA6ICcnO1xuICAgIHRocm93IG5ldyBFcnJvcihgJHttZXNzYWdlfSBFUlJPUl9DT0RFOiAke2Vycm9yQ29kZX0sIEVSUk9SX01FU1NBR0U6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9ufSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQge2FsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3IsIGl0ZXJhdGVFeHRyYU9wdGlvbnN9IGZyb20gJy4vd2FzbS11dGlscyc7XG5cbmV4cG9ydCBjb25zdCBzZXRSdW5PcHRpb25zID0gKG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFtudW1iZXIsIG51bWJlcltdXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBsZXQgcnVuT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGNvbnN0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBydW5PcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHRyeSB7XG4gICAgaWYgKG9wdGlvbnM/LmxvZ1NldmVyaXR5TGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID0gMjsgIC8vIERlZmF1bHQgdG8gd2FybmluZ1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHR5cGVvZiBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCkgfHxcbiAgICAgICAgb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsIDwgMCB8fCBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyBzZXJ2ZXJpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke29wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8ubG9nVmVyYm9zaXR5TGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCA9IDA7ICAvLyBEZWZhdWx0IHRvIDBcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgdmVyYm9zaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy50ZXJtaW5hdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy50ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgdGFnRGF0YU9mZnNldCA9IDA7XG4gICAgaWYgKG9wdGlvbnM/LnRhZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0YWdEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKG9wdGlvbnMudGFnLCBhbGxvY3MpO1xuICAgIH1cblxuICAgIHJ1bk9wdGlvbnNIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVSdW5PcHRpb25zKFxuICAgICAgICBydW5PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwhLCBydW5PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsISwgISFydW5PcHRpb25zLnRlcm1pbmF0ZSEsIHRhZ0RhdGFPZmZzZXQpO1xuICAgIGlmIChydW5PcHRpb25zSGFuZGxlID09PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgcnVuIG9wdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LmV4dHJhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGl0ZXJhdGVFeHRyYU9wdGlvbnMob3B0aW9ucy5leHRyYSwgJycsIG5ldyBXZWFrU2V0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PigpLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKGtleSwgYWxsb2NzKTtcbiAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHZhbHVlLCBhbGxvY3MpO1xuXG4gICAgICAgIGlmICh3YXNtLl9PcnRBZGRSdW5Db25maWdFbnRyeShydW5PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHJ1biBjb25maWcgZW50cnk6ICR7a2V5fSAtICR7dmFsdWV9LmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3J1bk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnMocnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb259IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvciwgaXRlcmF0ZUV4dHJhT3B0aW9uc30gZnJvbSAnLi93YXNtLXV0aWxzJztcblxuY29uc3QgZ2V0R3JhcGhPcHRpbXphdGlvbkxldmVsID0gKGdyYXBoT3B0aW1pemF0aW9uTGV2ZWw6IHN0cmluZ3x1bmtub3duKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChncmFwaE9wdGltaXphdGlvbkxldmVsKSB7XG4gICAgY2FzZSAnZGlzYWJsZWQnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnYmFzaWMnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnZXh0ZW5kZWQnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAnYWxsJzpcbiAgICAgIHJldHVybiA5OTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBncmFwaCBvcHRpbWl6YXRpb24gbGV2ZWw6ICR7Z3JhcGhPcHRpbWl6YXRpb25MZXZlbH1gKTtcbiAgfVxufTtcblxuY29uc3QgZ2V0RXhlY3V0aW9uTW9kZSA9IChleGVjdXRpb25Nb2RlOiAnc2VxdWVudGlhbCd8J3BhcmFsbGVsJyk6IG51bWJlciA9PiB7XG4gIHN3aXRjaCAoZXhlY3V0aW9uTW9kZSkge1xuICAgIGNhc2UgJ3NlcXVlbnRpYWwnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAncGFyYWxsZWwnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZXhlY3V0aW9uIG1vZGU6ICR7ZXhlY3V0aW9uTW9kZX1gKTtcbiAgfVxufTtcblxuY29uc3QgYXBwZW5kRGVmYXVsdE9wdGlvbnMgPSAob3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IHZvaWQgPT4ge1xuICBpZiAoIW9wdGlvbnMuZXh0cmEpIHtcbiAgICBvcHRpb25zLmV4dHJhID0ge307XG4gIH1cbiAgaWYgKCFvcHRpb25zLmV4dHJhLnNlc3Npb24pIHtcbiAgICBvcHRpb25zLmV4dHJhLnNlc3Npb24gPSB7fTtcbiAgfVxuICBjb25zdCBzZXNzaW9uID0gb3B0aW9ucy5leHRyYS5zZXNzaW9uIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIGlmICghc2Vzc2lvbi51c2Vfb3J0X21vZGVsX2J5dGVzX2RpcmVjdGx5KSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIHNlc3Npb24udXNlX29ydF9tb2RlbF9ieXRlc19kaXJlY3RseSA9ICcxJztcbiAgfVxuXG4gIC8vIGlmIHVzaW5nIEpTRVAgd2l0aCBXZWJHUFUsIGFsd2F5cyBkaXNhYmxlIG1lbW9yeSBwYXR0ZXJuXG4gIGlmIChvcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycyAmJlxuICAgICAgb3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMuc29tZShlcCA9PiAodHlwZW9mIGVwID09PSAnc3RyaW5nJyA/IGVwIDogZXAubmFtZSkgPT09ICd3ZWJncHUnKSkge1xuICAgIG9wdGlvbnMuZW5hYmxlTWVtUGF0dGVybiA9IGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBzZXRFeGVjdXRpb25Qcm92aWRlcnMgPVxuICAgIChzZXNzaW9uT3B0aW9uc0hhbmRsZTogbnVtYmVyLCBleGVjdXRpb25Qcm92aWRlcnM6IHJlYWRvbmx5IEluZmVyZW5jZVNlc3Npb24uRXhlY3V0aW9uUHJvdmlkZXJDb25maWdbXSxcbiAgICAgYWxsb2NzOiBudW1iZXJbXSk6IHZvaWQgPT4ge1xuICAgICAgZm9yIChjb25zdCBlcCBvZiBleGVjdXRpb25Qcm92aWRlcnMpIHtcbiAgICAgICAgbGV0IGVwTmFtZSA9IHR5cGVvZiBlcCA9PT0gJ3N0cmluZycgPyBlcCA6IGVwLm5hbWU7XG5cbiAgICAgICAgLy8gY2hlY2sgRVAgbmFtZVxuICAgICAgICBzd2l0Y2ggKGVwTmFtZSkge1xuICAgICAgICAgIGNhc2UgJ3hubnBhY2snOlxuICAgICAgICAgICAgZXBOYW1lID0gJ1hOTlBBQ0snO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnd2Vibm4nOlxuICAgICAgICAgICAgZXBOYW1lID0gJ1dFQk5OJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXAgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHdlYm5uT3B0aW9ucyA9IGVwIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViTk5FeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8uZGV2aWNlVHlwZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ2RldmljZVR5cGUnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh3ZWJubk9wdGlvbnMuZGV2aWNlVHlwZSwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdkZXZpY2VUeXBlJyAtICR7d2Vibm5PcHRpb25zLmRldmljZVR5cGV9LmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAod2Vibm5PcHRpb25zPy5udW1UaHJlYWRzKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bVRocmVhZHMgPSB3ZWJubk9wdGlvbnMubnVtVGhyZWFkcztcbiAgICAgICAgICAgICAgICAvLyBKdXN0IGlnbm9yZSBpbnZhbGlkIHdlYm5uT3B0aW9ucy5udW1UaHJlYWRzLlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbnVtVGhyZWFkcyAhPSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihudW1UaHJlYWRzKSB8fCBudW1UaHJlYWRzIDwgMCkge1xuICAgICAgICAgICAgICAgICAgbnVtVGhyZWFkcyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ251bVRocmVhZHMnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhudW1UaHJlYWRzLnRvU3RyaW5nKCksIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAnbnVtVGhyZWFkcycgLSAke3dlYm5uT3B0aW9ucy5udW1UaHJlYWRzfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8ucG93ZXJQcmVmZXJlbmNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygncG93ZXJQcmVmZXJlbmNlJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2Vibm5PcHRpb25zLnBvd2VyUHJlZmVyZW5jZSwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdwb3dlclByZWZlcmVuY2UnIC0gJHt3ZWJubk9wdGlvbnMucG93ZXJQcmVmZXJlbmNlfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3dlYmdwdSc6XG4gICAgICAgICAgICBlcE5hbWUgPSAnSlMnO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgY29uc3Qgd2ViZ3B1T3B0aW9ucyA9IGVwIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViR3B1RXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgICAgICAgICAgIGlmICh3ZWJncHVPcHRpb25zPy5wcmVmZXJyZWRMYXlvdXQpIHtcbiAgICAgICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQgIT09ICdOQ0hXJyAmJiB3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCAhPT0gJ05IV0MnKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHByZWZlcnJlZExheW91dCBtdXN0IGJlIGVpdGhlciAnTkNIVycgb3IgJ05IV0MnOiAke3dlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0fWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdwcmVmZXJyZWRMYXlvdXQnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdwcmVmZXJyZWRMYXlvdXQnIC0gJHt3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dH0uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd3YXNtJzpcbiAgICAgICAgICBjYXNlICdjcHUnOlxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgbm90IHN1cHBvcnRlZCBleGVjdXRpb24gcHJvdmlkZXI6ICR7ZXBOYW1lfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXBOYW1lRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhlcE5hbWUsIGFsbG9jcyk7XG4gICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcihzZXNzaW9uT3B0aW9uc0hhbmRsZSwgZXBOYW1lRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYXBwZW5kIGV4ZWN1dGlvbiBwcm92aWRlcjogJHtlcE5hbWV9LmApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuZXhwb3J0IGNvbnN0IHNldFNlc3Npb25PcHRpb25zID0gKG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogW251bWJlciwgbnVtYmVyW11dID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGxldCBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGNvbnN0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBzZXNzaW9uT3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGFwcGVuZERlZmF1bHRPcHRpb25zKHNlc3Npb25PcHRpb25zKTtcblxuICB0cnkge1xuICAgIGNvbnN0IGdyYXBoT3B0aW1pemF0aW9uTGV2ZWwgPSBnZXRHcmFwaE9wdGltemF0aW9uTGV2ZWwoc2Vzc2lvbk9wdGlvbnMuZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCA/PyAnYWxsJyk7XG4gICAgY29uc3QgZXhlY3V0aW9uTW9kZSA9IGdldEV4ZWN1dGlvbk1vZGUoc2Vzc2lvbk9wdGlvbnMuZXhlY3V0aW9uTW9kZSA/PyAnc2VxdWVudGlhbCcpO1xuICAgIGNvbnN0IGxvZ0lkRGF0YU9mZnNldCA9XG4gICAgICAgIHR5cGVvZiBzZXNzaW9uT3B0aW9ucy5sb2dJZCA9PT0gJ3N0cmluZycgPyBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMubG9nSWQsIGFsbG9jcykgOiAwO1xuXG4gICAgY29uc3QgbG9nU2V2ZXJpdHlMZXZlbCA9IHNlc3Npb25PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPz8gMjsgIC8vIERlZmF1bHQgdG8gMiAtIHdhcm5pbmdcbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIobG9nU2V2ZXJpdHlMZXZlbCkgfHwgbG9nU2V2ZXJpdHlMZXZlbCA8IDAgfHwgbG9nU2V2ZXJpdHlMZXZlbCA+IDQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHNlcnZlcml0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7bG9nU2V2ZXJpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dWZXJib3NpdHlMZXZlbCA9IHNlc3Npb25PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsID8/IDA7ICAvLyBEZWZhdWx0IHRvIDAgLSB2ZXJib3NlXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGxvZ1ZlcmJvc2l0eUxldmVsKSB8fCBsb2dWZXJib3NpdHlMZXZlbCA8IDAgfHwgbG9nVmVyYm9zaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyB2ZXJib3NpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke2xvZ1ZlcmJvc2l0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGltaXplZE1vZGVsRmlsZVBhdGhPZmZzZXQgPSB0eXBlb2Ygc2Vzc2lvbk9wdGlvbnMub3B0aW1pemVkTW9kZWxGaWxlUGF0aCA9PT0gJ3N0cmluZycgP1xuICAgICAgICBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMub3B0aW1pemVkTW9kZWxGaWxlUGF0aCwgYWxsb2NzKSA6XG4gICAgICAgIDA7XG5cbiAgICBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZVNlc3Npb25PcHRpb25zKFxuICAgICAgICBncmFwaE9wdGltaXphdGlvbkxldmVsLCAhIXNlc3Npb25PcHRpb25zLmVuYWJsZUNwdU1lbUFyZW5hLCAhIXNlc3Npb25PcHRpb25zLmVuYWJsZU1lbVBhdHRlcm4sIGV4ZWN1dGlvbk1vZGUsXG4gICAgICAgICEhc2Vzc2lvbk9wdGlvbnMuZW5hYmxlUHJvZmlsaW5nLCAwLCBsb2dJZERhdGFPZmZzZXQsIGxvZ1NldmVyaXR5TGV2ZWwsIGxvZ1ZlcmJvc2l0eUxldmVsLFxuICAgICAgICBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoT2Zmc2V0KTtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBzZXNzaW9uIG9wdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycykge1xuICAgICAgc2V0RXhlY3V0aW9uUHJvdmlkZXJzKHNlc3Npb25PcHRpb25zSGFuZGxlLCBzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMsIGFsbG9jcyk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmZyZWVEaW1lbnNpb25PdmVycmlkZXMpIHtcbiAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSkge1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSBuYW1lIG11c3QgYmUgYSBzdHJpbmc6ICR7bmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSB2YWx1ZSBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXI6ICR7dmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmFtZU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhuYW1lLCBhbGxvY3MpO1xuICAgICAgICBpZiAod2FzbS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlKHNlc3Npb25PcHRpb25zSGFuZGxlLCBuYW1lT2Zmc2V0LCB2YWx1ZSkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGU6ICR7bmFtZX0gLSAke3ZhbHVlfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5leHRyYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKHNlc3Npb25PcHRpb25zLmV4dHJhLCAnJywgbmV3IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KCksIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoa2V5LCBhbGxvY3MpO1xuICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcodmFsdWUsIGFsbG9jcyk7XG5cbiAgICAgICAgaWYgKHdhc20uX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJHtrZXl9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBbc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucyhzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge1RlbnNvcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuLy8gVGhpcyBmaWxlIGluY2x1ZGVzIGNvbW1vbiBkZWZpbml0aW9ucy4gVGhleSBkbyBOT1QgaGF2ZSBkZXBlbmRlbmN5IG9uIHRoZSBXZWJBc3NlbWJseSBpbnN0YW5jZS5cblxuLyoqXG4gKiBDb3BpZWQgZnJvbSBPTk5YIGRlZmluaXRpb24uIFVzZSB0aGlzIHRvIGRyb3AgZGVwZW5kZW5jeSAnb25ueF9wcm90bycgdG8gZGVjcmVhc2UgY29tcGlsZWQgLmpzIGZpbGUgc2l6ZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gRGF0YVR5cGUge1xuICB1bmRlZmluZWQgPSAwLFxuICBmbG9hdCA9IDEsXG4gIHVpbnQ4ID0gMixcbiAgaW50OCA9IDMsXG4gIHVpbnQxNiA9IDQsXG4gIGludDE2ID0gNSxcbiAgaW50MzIgPSA2LFxuICBpbnQ2NCA9IDcsXG4gIHN0cmluZyA9IDgsXG4gIGJvb2wgPSA5LFxuICBmbG9hdDE2ID0gMTAsXG4gIGRvdWJsZSA9IDExLFxuICB1aW50MzIgPSAxMixcbiAgdWludDY0ID0gMTMsXG4gIGNvbXBsZXg2NCA9IDE0LFxuICBjb21wbGV4MTI4ID0gMTUsXG4gIGJmbG9hdDE2ID0gMTZcbn1cblxuLyoqXG4gKiBNYXAgc3RyaW5nIHRlbnNvciBkYXRhIHRvIGVudW0gdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtID0gKHR5cGU6IHN0cmluZyk6IERhdGFUeXBlID0+IHtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnaW50OCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50ODtcbiAgICBjYXNlICd1aW50OCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDg7XG4gICAgY2FzZSAnYm9vbCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuYm9vbDtcbiAgICBjYXNlICdpbnQxNic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50MTY7XG4gICAgY2FzZSAndWludDE2JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50MTY7XG4gICAgY2FzZSAnaW50MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDMyO1xuICAgIGNhc2UgJ3VpbnQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDMyO1xuICAgIGNhc2UgJ2Zsb2F0MTYnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmZsb2F0MTY7XG4gICAgY2FzZSAnZmxvYXQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZmxvYXQ7XG4gICAgY2FzZSAnZmxvYXQ2NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZG91YmxlO1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuc3RyaW5nO1xuICAgIGNhc2UgJ2ludDY0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQ2NDtcbiAgICBjYXNlICd1aW50NjQnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQ2NDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlfWApO1xuICB9XG59O1xuXG4vKipcbiAqIE1hcCBlbnVtIHZhbHVlIHRvIHN0cmluZyB0ZW5zb3IgZGF0YVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcgPSAodHlwZVByb3RvOiBEYXRhVHlwZSk6IFRlbnNvci5UeXBlID0+IHtcbiAgc3dpdGNoICh0eXBlUHJvdG8pIHtcbiAgICBjYXNlIERhdGFUeXBlLmludDg6XG4gICAgICByZXR1cm4gJ2ludDgnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDg6XG4gICAgICByZXR1cm4gJ3VpbnQ4JztcbiAgICBjYXNlIERhdGFUeXBlLmJvb2w6XG4gICAgICByZXR1cm4gJ2Jvb2wnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50MTY6XG4gICAgICByZXR1cm4gJ2ludDE2JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQxNjpcbiAgICAgIHJldHVybiAndWludDE2JztcbiAgICBjYXNlIERhdGFUeXBlLmludDMyOlxuICAgICAgcmV0dXJuICdpbnQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50MzI6XG4gICAgICByZXR1cm4gJ3VpbnQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS5mbG9hdDE2OlxuICAgICAgcmV0dXJuICdmbG9hdDE2JztcbiAgICBjYXNlIERhdGFUeXBlLmZsb2F0OlxuICAgICAgcmV0dXJuICdmbG9hdDMyJztcbiAgICBjYXNlIERhdGFUeXBlLmRvdWJsZTpcbiAgICAgIHJldHVybiAnZmxvYXQ2NCc7XG4gICAgY2FzZSBEYXRhVHlwZS5zdHJpbmc6XG4gICAgICByZXR1cm4gJ3N0cmluZyc7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQ2NDpcbiAgICAgIHJldHVybiAnaW50NjQnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDY0OlxuICAgICAgcmV0dXJuICd1aW50NjQnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGVQcm90b31gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBnZXQgdGVuc29yIGVsZW1lbnQgc2l6ZSBpbiBieXRlcyBieSB0aGUgZ2l2ZW4gZGF0YSB0eXBlXG4gKiBAcmV0dXJucyBzaXplIGluIGludGVnZXIgb3IgdW5kZWZpbmVkIGlmIHRoZSBkYXRhIHR5cGUgaXMgbm90IHN1cHBvcnRlZFxuICovXG5leHBvcnQgY29uc3QgZ2V0VGVuc29yRWxlbWVudFNpemUgPSAoZGF0ZVR5cGU6IG51bWJlcik6IG51bWJlcnxcbiAgICB1bmRlZmluZWQgPT4gW3VuZGVmaW5lZCwgNCwgMSwgMSwgMiwgMiwgNCwgOCwgdW5kZWZpbmVkLCAxLCAyLCA4LCA0LCA4LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkXVtkYXRlVHlwZV07XG5cbi8qKlxuICogZ2V0IHR5cGVkIGFycmF5IGNvbnN0cnVjdG9yIGJ5IHRoZSBnaXZlbiB0ZW5zb3IgdHlwZVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yID0gKHR5cGU6IFRlbnNvci5UeXBlKTogRmxvYXQzMkFycmF5Q29uc3RydWN0b3J8VWludDhBcnJheUNvbnN0cnVjdG9yfFxuICAgIEludDhBcnJheUNvbnN0cnVjdG9yfFVpbnQxNkFycmF5Q29uc3RydWN0b3J8SW50MTZBcnJheUNvbnN0cnVjdG9yfEludDMyQXJyYXlDb25zdHJ1Y3RvcnxCaWdJbnQ2NEFycmF5Q29uc3RydWN0b3J8XG4gICAgVWludDhBcnJheUNvbnN0cnVjdG9yfEZsb2F0NjRBcnJheUNvbnN0cnVjdG9yfFVpbnQzMkFycmF5Q29uc3RydWN0b3J8QmlnVWludDY0QXJyYXlDb25zdHJ1Y3RvciA9PiB7XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnZmxvYXQxNic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdmbG9hdDMyJzpcbiAgICAgICAgICByZXR1cm4gRmxvYXQzMkFycmF5O1xuICAgICAgICBjYXNlICd1aW50OCc6XG4gICAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDgnOlxuICAgICAgICAgIHJldHVybiBJbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQxNic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdpbnQxNic6XG4gICAgICAgICAgcmV0dXJuIEludDE2QXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDMyJzpcbiAgICAgICAgICByZXR1cm4gSW50MzJBcnJheTtcbiAgICAgICAgY2FzZSAnYm9vbCc6XG4gICAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ2Zsb2F0NjQnOlxuICAgICAgICAgIHJldHVybiBGbG9hdDY0QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQzMic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQzMkFycmF5O1xuICAgICAgICBjYXNlICdpbnQ2NCc6XG4gICAgICAgICAgcmV0dXJuIEJpZ0ludDY0QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQ2NCc6XG4gICAgICAgICAgcmV0dXJuIEJpZ1VpbnQ2NEFycmF5O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgdHlwZTogJHt0eXBlfWApO1xuICAgICAgfVxuICAgIH07XG5cbi8qKlxuICogTWFwIHN0cmluZyBsb2cgbGV2ZWwgdG8gaW50ZWdlciB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgbG9nTGV2ZWxTdHJpbmdUb0VudW0gPSAobG9nTGV2ZWw/OiAndmVyYm9zZSd8J2luZm8nfCd3YXJuaW5nJ3wnZXJyb3InfCdmYXRhbCcpOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGxvZ0xldmVsKSB7XG4gICAgY2FzZSAndmVyYm9zZSc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdpbmZvJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAnZXJyb3InOlxuICAgICAgcmV0dXJuIDM7XG4gICAgY2FzZSAnZmF0YWwnOlxuICAgICAgcmV0dXJuIDQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgbG9nZ2luZyBsZXZlbDogJHtsb2dMZXZlbH1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiB0ZW5zb3IgdHlwZSBpcyBzdXBwb3J0ZWQgYnkgR1BVIGJ1ZmZlclxuICovXG5leHBvcnQgY29uc3QgaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlID0gKHR5cGU6IFRlbnNvci5UeXBlKTogdHlwZSBpcyBUZW5zb3IuR3B1QnVmZmVyRGF0YVR5cGVzID0+IHR5cGUgPT09ICdmbG9hdDMyJyB8fFxuICAgIHR5cGUgPT09ICdpbnQzMicgfHwgdHlwZSA9PT0gJ2ludDY0JyB8fCB0eXBlID09PSAnYm9vbCcgfHwgdHlwZSA9PT0gJ2Zsb2F0MTYnIHx8IHR5cGUgPT09ICd1aW50MzInO1xuXG4vKipcbiAqIE1hcCBzdHJpbmcgZGF0YSBsb2NhdGlvbiB0byBpbnRlZ2VyIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0gPSAobG9jYXRpb246IFRlbnNvci5EYXRhTG9jYXRpb24pOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGxvY2F0aW9uKSB7XG4gICAgY2FzZSAnbm9uZSc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdjcHUnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnY3B1LXBpbm5lZCc6XG4gICAgICByZXR1cm4gMjtcbiAgICBjYXNlICd0ZXh0dXJlJzpcbiAgICAgIHJldHVybiAzO1xuICAgIGNhc2UgJ2dwdS1idWZmZXInOlxuICAgICAgcmV0dXJuIDQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSBsb2NhdGlvbjogJHtsb2NhdGlvbn1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXAgaW50ZWdlciBkYXRhIGxvY2F0aW9uIHRvIHN0cmluZyB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZGF0YUxvY2F0aW9uRW51bVRvU3RyaW5nID0gKGxvY2F0aW9uOiBudW1iZXIpOiBUZW5zb3IuRGF0YUxvY2F0aW9ufHVuZGVmaW5lZCA9PlxuICAgIChbJ25vbmUnLCAnY3B1JywgJ2NwdS1waW5uZWQnLCAndGV4dHVyZScsICdncHUtYnVmZmVyJ10gYXMgY29uc3QpW2xvY2F0aW9uXTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtFbnYsIEluZmVyZW5jZVNlc3Npb24sIFRlbnNvcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtTZXJpYWxpemFibGVNb2RlbGRhdGEsIFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YSwgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGEsIFRlbnNvck1ldGFkYXRhfSBmcm9tICcuL3Byb3h5LW1lc3NhZ2VzJztcbmltcG9ydCB7c2V0UnVuT3B0aW9uc30gZnJvbSAnLi9ydW4tb3B0aW9ucyc7XG5pbXBvcnQge3NldFNlc3Npb25PcHRpb25zfSBmcm9tICcuL3Nlc3Npb24tb3B0aW9ucyc7XG5pbXBvcnQge2RhdGFMb2NhdGlvblN0cmluZ1RvRW51bSwgZ2V0VGVuc29yRWxlbWVudFNpemUsIGlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSwgbG9nTGV2ZWxTdHJpbmdUb0VudW0sIHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nLCB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bSwgdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yfSBmcm9tICcuL3dhc20tY29tbW9uJztcbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvcn0gZnJvbSAnLi93YXNtLXV0aWxzJztcblxuLyoqXG4gKiBnZXQgdGhlIGlucHV0L291dHB1dCBjb3VudCBvZiB0aGUgc2Vzc2lvbi5cbiAqIEBwYXJhbSBzZXNzaW9uSGFuZGxlIHRoZSBoYW5kbGUgcmVwcmVzZW50aW5nIHRoZSBzZXNzaW9uLiBzaG91bGQgYmUgbm9uLXplcm8uXG4gKiBAcmV0dXJucyBhIHR1cGxlIGluY2x1ZGluZyAyIG51bWJlcnMsIHJlcHJlc2VudGluZyB0aGUgaW5wdXQgY291bnQgYW5kIG91dHB1dCBjb3VudC5cbiAqL1xuY29uc3QgZ2V0U2Vzc2lvbklucHV0T3V0cHV0Q291bnQgPSAoc2Vzc2lvbkhhbmRsZTogbnVtYmVyKTogW251bWJlciwgbnVtYmVyXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgZGF0YU9mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg4KTtcbiAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLl9PcnRHZXRJbnB1dE91dHB1dENvdW50KHNlc3Npb25IYW5kbGUsIGRhdGFPZmZzZXQsIGRhdGFPZmZzZXQgKyA0KTtcbiAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBnZXQgc2Vzc2lvbiBpbnB1dC9vdXRwdXQgY291bnQuJyk7XG4gICAgfVxuICAgIHJldHVybiBbd2FzbS5IRUFQMzJbZGF0YU9mZnNldCAvIDRdLCB3YXNtLkhFQVAzMltkYXRhT2Zmc2V0IC8gNCArIDFdXTtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShzdGFjayk7XG4gIH1cbn07XG5cbi8qKlxuICogaW5pdGlhbGl6ZSBPUlQgZW52aXJvbm1lbnQuXG4gKiBAcGFyYW0gbnVtVGhyZWFkcyBTZXRHbG9iYWxJbnRyYU9wTnVtVGhyZWFkcyhudW1UaHJlYWRzKVxuICogQHBhcmFtIGxvZ2dpbmdMZXZlbCBDcmVhdGVFbnYoc3RhdGljX2Nhc3Q8T3J0TG9nZ2luZ0xldmVsPihsb2dnaW5nX2xldmVsKSlcbiAqL1xuY29uc3QgaW5pdE9ydCA9IChudW1UaHJlYWRzOiBudW1iZXIsIGxvZ2dpbmdMZXZlbDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IGVycm9yQ29kZSA9IGdldEluc3RhbmNlKCkuX09ydEluaXQobnVtVGhyZWFkcywgbG9nZ2luZ0xldmVsKTtcbiAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGluaXRpYWxpemUgb25ueHJ1bnRpbWUuJyk7XG4gIH1cbn07XG5cbi8qKlxuICogaW50aWFsaXplIHJ1bnRpbWUgZW52aXJvbm1lbnQuXG4gKiBAcGFyYW0gZW52IHBhc3NlZCBpbiB0aGUgZW52aXJvbm1lbnQgY29uZmlnIG9iamVjdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGluaXRSdW50aW1lID0gYXN5bmMoZW52OiBFbnYpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgLy8gaW5pdCBPUlRcbiAgaW5pdE9ydChlbnYud2FzbS5udW1UaHJlYWRzISwgbG9nTGV2ZWxTdHJpbmdUb0VudW0oZW52LmxvZ0xldmVsKSk7XG5cbiAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVKSB7XG4gICAgLy8gaW5pdCBKU0VQIGlmIGF2YWlsYWJsZVxuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMsIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcbiAgICBjb25zdCBpbml0SnNlcCA9IHJlcXVpcmUoJy4vanNlcC9pbml0JykuaW5pdDtcbiAgICBhd2FpdCBpbml0SnNlcChnZXRJbnN0YW5jZSgpLCBlbnYpO1xuICB9XG59O1xuXG4vKipcbiAqIHZhbGlkIGRhdGEgbG9jYXRpb25zIGZvciBpbnB1dC9vdXRwdXQgdGVuc29ycy5cbiAqL1xudHlwZSBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dCA9ICdjcHUnfCdjcHUtcGlubmVkJ3wnZ3B1LWJ1ZmZlcic7XG5cbnR5cGUgSU9CaW5kaW5nU3RhdGUgPSB7XG4gIC8qKlxuICAgKiB0aGUgaGFuZGxlIG9mIElPIGJpbmRpbmcuXG4gICAqL1xuICByZWFkb25seSBoYW5kbGU6IG51bWJlcjtcblxuICAvKipcbiAgICogdGhlIHByZWZlcnJlZCBsb2NhdGlvbiBmb3IgZWFjaCBvdXRwdXQgdGVuc29yLlxuICAgKlxuICAgKiB2YWx1ZSBpcyBvbmUgb2YgJ2NwdScsICdjcHUtcGlubmVkJywgJ2dwdS1idWZmZXInLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zOiByZWFkb25seSBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dFtdO1xuXG4gIC8qKlxuICAgKiBlbnVtIHZhbHVlIG9mIHRoZSBwcmVmZXJyZWQgbG9jYXRpb24gZm9yIGVhY2ggb3V0cHV0IHRlbnNvci5cbiAgICovXG4gIHJlYWRvbmx5IG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWQ6IHJlYWRvbmx5IG51bWJlcltdO1xufTtcblxuLyoqXG4gKiAgdHVwbGUgZWxlbWVudHMgYXJlOiBJbmZlcmVuY2VTZXNzaW9uIElEOyBpbnB1dE5hbWVzVVRGOEVuY29kZWQ7IG91dHB1dE5hbWVzVVRGOEVuY29kZWQ7IGJpbmRpbmdTdGF0ZVxuICovXG50eXBlIFNlc3Npb25NZXRhZGF0YSA9IFtcbiAgaW5mZXJlbmNlU2Vzc2lvbklkOiBudW1iZXIsIGlucHV0TmFtZXNVVEY4RW5jb2RlZDogbnVtYmVyW10sIG91dHB1dE5hbWVzVVRGOEVuY29kZWQ6IG51bWJlcltdLFxuICBiaW5kaW5nU3RhdGU6IElPQmluZGluZ1N0YXRlfG51bGxcbl07XG5cbmNvbnN0IGFjdGl2ZVNlc3Npb25zID0gbmV3IE1hcDxudW1iZXIsIFNlc3Npb25NZXRhZGF0YT4oKTtcblxuLyoqXG4gKiBhbGxvY2F0ZSB0aGUgbWVtb3J5IGFuZCBtZW1jcHkgdGhlIG1vZGVsIGJ5dGVzLCBwcmVwYXJpbmcgZm9yIGNyZWF0aW5nIGFuIGluc3RhbmNlIG9mIEluZmVyZW5jZVNlc3Npb24uXG4gKiBAcmV0dXJucyBhIDItZWxlbWVudHMgdHVwbGUgLSB0aGUgcG9pbnRlciBhbmQgc2l6ZSBvZiB0aGUgYWxsb2NhdGVkIGJ1ZmZlclxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlU2Vzc2lvbkFsbG9jYXRlID0gKG1vZGVsOiBVaW50OEFycmF5KTogW251bWJlciwgbnVtYmVyXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBtb2RlbERhdGFPZmZzZXQgPSB3YXNtLl9tYWxsb2MobW9kZWwuYnl0ZUxlbmd0aCk7XG4gIGlmIChtb2RlbERhdGFPZmZzZXQgPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGNyZWF0ZSBhIHNlc3Npb24uIGZhaWxlZCB0byBhbGxvY2F0ZSBhIGJ1ZmZlciBvZiBzaXplICR7bW9kZWwuYnl0ZUxlbmd0aH0uYCk7XG4gIH1cbiAgd2FzbS5IRUFQVTguc2V0KG1vZGVsLCBtb2RlbERhdGFPZmZzZXQpO1xuICByZXR1cm4gW21vZGVsRGF0YU9mZnNldCwgbW9kZWwuYnl0ZUxlbmd0aF07XG59O1xuXG4vKipcbiAqIGNyZWF0ZSBhbiBpbmZlcmVuY2Ugc2Vzc2lvbiB1c2luZyB0aGUgcHJlcGFyZWQgYnVmZmVyIGNvbnRhaW5pbmcgdGhlIG1vZGVsIGRhdGEuXG4gKiBAcGFyYW0gbW9kZWxEYXRhIGEgMi1lbGVtZW50cyB0dXBsZSBjb250YWluaW5nIHRoZSBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBtb2RlbCBkYXRhIGJ1ZmZlci5cbiAqIEBwYXJhbSBvcHRpb25zIGFuIG9wdGlvbmFsIHNlc3Npb24gb3B0aW9ucyBvYmplY3QuXG4gKiBAcmV0dXJucyBhIDMtZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyBbc2Vzc2lvbiBoYW5kbGUsIGlucHV0IG5hbWVzLCBvdXRwdXQgbmFtZXNdXG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uRmluYWxpemUgPVxuICAgIChtb2RlbERhdGE6IFNlcmlhbGl6YWJsZU1vZGVsZGF0YSwgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiBTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGEgPT4ge1xuICAgICAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgICAgIGxldCBzZXNzaW9uSGFuZGxlID0gMDtcbiAgICAgIGxldCBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IDA7XG4gICAgICBsZXQgaW9CaW5kaW5nSGFuZGxlID0gMDtcbiAgICAgIGxldCBhbGxvY3M6IG51bWJlcltdID0gW107XG4gICAgICBjb25zdCBpbnB1dE5hbWVzVVRGOEVuY29kZWQgPSBbXTtcbiAgICAgIGNvbnN0IG91dHB1dE5hbWVzVVRGOEVuY29kZWQgPSBbXTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgW3Nlc3Npb25PcHRpb25zSGFuZGxlLCBhbGxvY3NdID0gc2V0U2Vzc2lvbk9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAgICAgc2Vzc2lvbkhhbmRsZSA9IHdhc20uX09ydENyZWF0ZVNlc3Npb24obW9kZWxEYXRhWzBdLCBtb2RlbERhdGFbMV0sIHNlc3Npb25PcHRpb25zSGFuZGxlKTtcbiAgICAgICAgaWYgKHNlc3Npb25IYW5kbGUgPT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgYSBzZXNzaW9uLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgW2lucHV0Q291bnQsIG91dHB1dENvdW50XSA9IGdldFNlc3Npb25JbnB1dE91dHB1dENvdW50KHNlc3Npb25IYW5kbGUpO1xuXG4gICAgICAgIGNvbnN0IGlucHV0TmFtZXMgPSBbXTtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZXMgPSBbXTtcbiAgICAgICAgY29uc3Qgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zOiBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dFtdID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IHdhc20uX09ydEdldElucHV0TmFtZShzZXNzaW9uSGFuZGxlLCBpKTtcbiAgICAgICAgICBpZiAobmFtZSA9PT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIGlucHV0IG5hbWUuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5wdXNoKG5hbWUpO1xuICAgICAgICAgIGlucHV0TmFtZXMucHVzaCh3YXNtLlVURjhUb1N0cmluZyhuYW1lKSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IHdhc20uX09ydEdldE91dHB1dE5hbWUoc2Vzc2lvbkhhbmRsZSwgaSk7XG4gICAgICAgICAgaWYgKG5hbWUgPT09IDApIHtcbiAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBhbiBvdXRwdXQgbmFtZS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZC5wdXNoKG5hbWUpO1xuICAgICAgICAgIGNvbnN0IG5hbWVTdHJpbmcgPSB3YXNtLlVURjhUb1N0cmluZyhuYW1lKTtcbiAgICAgICAgICBvdXRwdXROYW1lcy5wdXNoKG5hbWVTdHJpbmcpO1xuXG4gICAgICAgICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVKSB7XG4gICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHR5cGVvZiBvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA9PT0gJ3N0cmluZycgP1xuICAgICAgICAgICAgICAgIG9wdGlvbnMucHJlZmVycmVkT3V0cHV0TG9jYXRpb24gOlxuICAgICAgICAgICAgICAgIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uPy5bbmFtZVN0cmluZ10gPz8gJ2NwdSc7XG4gICAgICAgICAgICBpZiAobG9jYXRpb24gIT09ICdjcHUnICYmIGxvY2F0aW9uICE9PSAnY3B1LXBpbm5lZCcgJiYgbG9jYXRpb24gIT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vdCBzdXBwb3J0ZWQgcHJlZmVycmVkIG91dHB1dCBsb2NhdGlvbjogJHtsb2NhdGlvbn0uYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMucHVzaChsb2NhdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXNlIElPIGJpbmRpbmcgb25seSB3aGVuIGF0IGxlYXN0IG9uZSBvdXRwdXQgaXMgcHJlZmZlcmVkIHRvIGJlIG9uIEdQVS5cbiAgICAgICAgbGV0IGJpbmRpbmdTdGF0ZTogSU9CaW5kaW5nU3RhdGV8bnVsbCA9IG51bGw7XG4gICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMuc29tZShsID0+IGwgPT09ICdncHUtYnVmZmVyJykpIHtcbiAgICAgICAgICBpb0JpbmRpbmdIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVCaW5kaW5nKHNlc3Npb25IYW5kbGUpO1xuICAgICAgICAgIGlmIChpb0JpbmRpbmdIYW5kbGUgPT09IDApIHtcbiAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBJTyBiaW5kaW5nLicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJpbmRpbmdTdGF0ZSA9IHtcbiAgICAgICAgICAgIGhhbmRsZTogaW9CaW5kaW5nSGFuZGxlLFxuICAgICAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLFxuICAgICAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZDogb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLm1hcChsID0+IGRhdGFMb2NhdGlvblN0cmluZ1RvRW51bShsKSksXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFjdGl2ZVNlc3Npb25zLnNldChzZXNzaW9uSGFuZGxlLCBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkLCBiaW5kaW5nU3RhdGVdKTtcbiAgICAgICAgcmV0dXJuIFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzLCBvdXRwdXROYW1lc107XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKGJ1ZiA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuICAgICAgICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG5cbiAgICAgICAgaWYgKGlvQmluZGluZ0hhbmRsZSAhPT0gMCkge1xuICAgICAgICAgIHdhc20uX09ydFJlbGVhc2VCaW5kaW5nKGlvQmluZGluZ0hhbmRsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2Vzc2lvbkhhbmRsZSAhPT0gMCkge1xuICAgICAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uKHNlc3Npb25IYW5kbGUpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB3YXNtLl9mcmVlKG1vZGVsRGF0YVswXSk7XG4gICAgICAgIGlmIChzZXNzaW9uT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucyhzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgYWxsb2NzLmZvckVhY2goYWxsb2MgPT4gd2FzbS5fZnJlZShhbGxvYykpO1xuICAgICAgfVxuICAgIH07XG5cblxuLyoqXG4gKiBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgSW5mZXJlbmNlU2Vzc2lvbi5cbiAqIEByZXR1cm5zIHRoZSBtZXRhZGF0YSBvZiBJbmZlcmVuY2VTZXNzaW9uLiAwLXZhbHVlIGhhbmRsZSBmb3IgZmFpbHVyZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVNlc3Npb24gPVxuICAgIChtb2RlbDogVWludDhBcnJheSwgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiBTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGEgPT4ge1xuICAgICAgY29uc3QgbW9kZWxEYXRhOiBTZXJpYWxpemFibGVNb2RlbGRhdGEgPSBjcmVhdGVTZXNzaW9uQWxsb2NhdGUobW9kZWwpO1xuICAgICAgcmV0dXJuIGNyZWF0ZVNlc3Npb25GaW5hbGl6ZShtb2RlbERhdGEsIG9wdGlvbnMpO1xuICAgIH07XG5cbmV4cG9ydCBjb25zdCByZWxlYXNlU2Vzc2lvbiA9IChzZXNzaW9uSWQ6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbm5vdCByZWxlYXNlIHNlc3Npb24uIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3QgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgaW9CaW5kaW5nU3RhdGVdID0gc2Vzc2lvbjtcblxuICBpZiAoaW9CaW5kaW5nU3RhdGUpIHtcbiAgICB3YXNtLl9PcnRSZWxlYXNlQmluZGluZyhpb0JpbmRpbmdTdGF0ZS5oYW5kbGUpO1xuICB9XG5cbiAgd2FzbS5qc2VwVW5yZWdpc3RlckJ1ZmZlcnM/LihzZXNzaW9uSWQpO1xuXG4gIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKGJ1ZiA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uKHNlc3Npb25IYW5kbGUpO1xuICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvbklkKTtcbn07XG5cbmNvbnN0IHByZXBhcmVJbnB1dE91dHB1dFRlbnNvciA9XG4gICAgKHRlbnNvcjogVGVuc29yTWV0YWRhdGF8bnVsbCwgdGVuc29ySGFuZGxlczogbnVtYmVyW10sIGFsbG9jczogbnVtYmVyW10sIHNlc3Npb25JZDogbnVtYmVyLCBpbmRleDogbnVtYmVyKTpcbiAgICAgICAgdm9pZCA9PiB7XG4gICAgICAgICAgaWYgKCF0ZW5zb3IpIHtcbiAgICAgICAgICAgIHRlbnNvckhhbmRsZXMucHVzaCgwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICAgIGNvbnN0IGRhdGFUeXBlID0gdGVuc29yWzBdO1xuICAgICAgICAgIGNvbnN0IGRpbXMgPSB0ZW5zb3JbMV07XG4gICAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0ZW5zb3JbM107XG5cbiAgICAgICAgICBsZXQgcmF3RGF0YTogbnVtYmVyO1xuICAgICAgICAgIGxldCBkYXRhQnl0ZUxlbmd0aDogbnVtYmVyO1xuXG4gICAgICAgICAgaWYgKGRhdGFUeXBlID09PSAnc3RyaW5nJyAmJiBsb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmluZyB0ZW5zb3IgaXMgbm90IHN1cHBvcnRlZCBvbiBHUFUuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGxvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgIGNvbnN0IGdwdUJ1ZmZlciA9IHRlbnNvclsyXS5ncHVCdWZmZXIgYXMgR1BVQnVmZmVyO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNpemVJbkJ5dGVzID0gZ2V0VGVuc29yRWxlbWVudFNpemUodGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0oZGF0YVR5cGUpKSE7XG4gICAgICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IGRpbXMucmVkdWNlKChhLCBiKSA9PiBhICogYiwgMSkgKiBlbGVtZW50U2l6ZUluQnl0ZXM7XG4gICAgICAgICAgICByYXdEYXRhID0gd2FzbS5qc2VwUmVnaXN0ZXJCdWZmZXIoc2Vzc2lvbklkLCBpbmRleCwgZ3B1QnVmZmVyLCBkYXRhQnl0ZUxlbmd0aCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB0ZW5zb3JbMl07XG5cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgIC8vIHN0cmluZyB0ZW5zb3JcbiAgICAgICAgICAgICAgZGF0YUJ5dGVMZW5ndGggPSA0ICogZGF0YS5sZW5ndGg7XG4gICAgICAgICAgICAgIHJhd0RhdGEgPSB3YXNtLl9tYWxsb2MoZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgICAgICAgICBhbGxvY3MucHVzaChyYXdEYXRhKTtcbiAgICAgICAgICAgICAgbGV0IGRhdGFJbmRleCA9IHJhd0RhdGEgLyA0O1xuICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGB0ZW5zb3IgZGF0YSBhdCBpbmRleCAke2l9IGlzIG5vdCBhIHN0cmluZ2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB3YXNtLkhFQVBVMzJbZGF0YUluZGV4KytdID0gYWxsb2NXYXNtU3RyaW5nKGRhdGFbaV0sIGFsbG9jcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gZGF0YS5ieXRlTGVuZ3RoO1xuICAgICAgICAgICAgICByYXdEYXRhID0gd2FzbS5fbWFsbG9jKGRhdGFCeXRlTGVuZ3RoKTtcbiAgICAgICAgICAgICAgYWxsb2NzLnB1c2gocmF3RGF0YSk7XG4gICAgICAgICAgICAgIHdhc20uSEVBUFU4LnNldChuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhQnl0ZUxlbmd0aCksIHJhd0RhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgICAgICAgICBjb25zdCBkaW1zT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiBkaW1zLmxlbmd0aCk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBkaW1JbmRleCA9IGRpbXNPZmZzZXQgLyA0O1xuICAgICAgICAgICAgZGltcy5mb3JFYWNoKGQgPT4gd2FzbS5IRUFQMzJbZGltSW5kZXgrK10gPSBkKTtcbiAgICAgICAgICAgIGNvbnN0IHRlbnNvciA9IHdhc20uX09ydENyZWF0ZVRlbnNvcihcbiAgICAgICAgICAgICAgICB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bShkYXRhVHlwZSksIHJhd0RhdGEsIGRhdGFCeXRlTGVuZ3RoLCBkaW1zT2Zmc2V0LCBkaW1zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0obG9jYXRpb24pKTtcbiAgICAgICAgICAgIGlmICh0ZW5zb3IgPT09IDApIHtcbiAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGNyZWF0ZSB0ZW5zb3IgZm9yIGlucHV0L291dHB1dC4gc2Vzc2lvbj0ke3Nlc3Npb25JZH0sIGluZGV4PSR7aW5kZXh9LmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGVuc29ySGFuZGxlcy5wdXNoKHRlbnNvcik7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbi8qKlxuICogcGVyZm9ybSBpbmZlcmVuY2UgcnVuXG4gKi9cbmV4cG9ydCBjb25zdCBydW4gPSBhc3luYyhcbiAgICBzZXNzaW9uSWQ6IG51bWJlciwgaW5wdXRJbmRpY2VzOiBudW1iZXJbXSwgaW5wdXRUZW5zb3JzOiBUZW5zb3JNZXRhZGF0YVtdLCBvdXRwdXRJbmRpY2VzOiBudW1iZXJbXSxcbiAgICBvdXRwdXRUZW5zb3JzOiBBcnJheTxUZW5zb3JNZXRhZGF0YXxudWxsPiwgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogUHJvbWlzZTxUZW5zb3JNZXRhZGF0YVtdPiA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJ1biBpbmZlcmVuY2UuIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3QgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgaW9CaW5kaW5nU3RhdGVdID0gc2Vzc2lvbjtcblxuICBjb25zdCBpbnB1dENvdW50ID0gaW5wdXRJbmRpY2VzLmxlbmd0aDtcbiAgY29uc3Qgb3V0cHV0Q291bnQgPSBvdXRwdXRJbmRpY2VzLmxlbmd0aDtcblxuICBsZXQgcnVuT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGxldCBydW5PcHRpb25zQWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IGlucHV0VGVuc29ySGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3Qgb3V0cHV0VGVuc29ySGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgaW5wdXRPdXRwdXRBbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgYmVmb3JlUnVuU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICBjb25zdCBpbnB1dFZhbHVlc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhpbnB1dENvdW50ICogNCk7XG4gIGNvbnN0IGlucHV0TmFtZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoaW5wdXRDb3VudCAqIDQpO1xuICBjb25zdCBvdXRwdXRWYWx1ZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2Mob3V0cHV0Q291bnQgKiA0KTtcbiAgY29uc3Qgb3V0cHV0TmFtZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2Mob3V0cHV0Q291bnQgKiA0KTtcblxuICB0cnkge1xuICAgIFtydW5PcHRpb25zSGFuZGxlLCBydW5PcHRpb25zQWxsb2NzXSA9IHNldFJ1bk9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAvLyBjcmVhdGUgaW5wdXQgdGVuc29yc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IoaW5wdXRUZW5zb3JzW2ldLCBpbnB1dFRlbnNvckhhbmRsZXMsIGlucHV0T3V0cHV0QWxsb2NzLCBzZXNzaW9uSWQsIGlucHV0SW5kaWNlc1tpXSk7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIG91dHB1dCB0ZW5zb3JzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IoXG4gICAgICAgICAgb3V0cHV0VGVuc29yc1tpXSwgb3V0cHV0VGVuc29ySGFuZGxlcywgaW5wdXRPdXRwdXRBbGxvY3MsIHNlc3Npb25JZCwgaW5wdXRDb3VudCArIG91dHB1dEluZGljZXNbaV0pO1xuICAgIH1cblxuICAgIGxldCBpbnB1dFZhbHVlc0luZGV4ID0gaW5wdXRWYWx1ZXNPZmZzZXQgLyA0O1xuICAgIGxldCBpbnB1dE5hbWVzSW5kZXggPSBpbnB1dE5hbWVzT2Zmc2V0IC8gNDtcbiAgICBsZXQgb3V0cHV0VmFsdWVzSW5kZXggPSBvdXRwdXRWYWx1ZXNPZmZzZXQgLyA0O1xuICAgIGxldCBvdXRwdXROYW1lc0luZGV4ID0gb3V0cHV0TmFtZXNPZmZzZXQgLyA0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICB3YXNtLkhFQVBVMzJbaW5wdXRWYWx1ZXNJbmRleCsrXSA9IGlucHV0VGVuc29ySGFuZGxlc1tpXTtcbiAgICAgIHdhc20uSEVBUFUzMltpbnB1dE5hbWVzSW5kZXgrK10gPSBpbnB1dE5hbWVzVVRGOEVuY29kZWRbaW5wdXRJbmRpY2VzW2ldXTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzSW5kZXgrK10gPSBvdXRwdXRUZW5zb3JIYW5kbGVzW2ldO1xuICAgICAgd2FzbS5IRUFQVTMyW291dHB1dE5hbWVzSW5kZXgrK10gPSBvdXRwdXROYW1lc1VURjhFbmNvZGVkW291dHB1dEluZGljZXNbaV1dO1xuICAgIH1cblxuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiBpb0JpbmRpbmdTdGF0ZSkge1xuICAgICAgY29uc3Qge2hhbmRsZSwgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkfSA9IGlvQmluZGluZ1N0YXRlO1xuXG4gICAgICBpZiAoaW5wdXROYW1lc1VURjhFbmNvZGVkLmxlbmd0aCAhPT0gaW5wdXRDb3VudCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGlucHV0IGNvdW50IGZyb20gZmVlZHMgKCR7XG4gICAgICAgICAgICBpbnB1dENvdW50fSkgaXMgZXhwZWN0ZWQgdG8gYmUgYWx3YXlzIGVxdWFsIHRvIG1vZGVsJ3MgaW5wdXQgY291bnQgKCR7aW5wdXROYW1lc1VURjhFbmNvZGVkLmxlbmd0aH0pLmApO1xuICAgICAgfVxuXG4gICAgICAvLyBwcm9jZXNzIGlucHV0c1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBpbnB1dEluZGljZXNbaV07XG4gICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydEJpbmRJbnB1dChoYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIGlucHV0VGVuc29ySGFuZGxlc1tpXSk7XG4gICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBpbnB1dFske2l9XSBmb3Igc2Vzc2lvbj0ke3Nlc3Npb25JZH0uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcHJvY2VzcyBwcmUtYWxsb2NhdGVkIG91dHB1dHNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgICBjb25zdCBpbmRleCA9IG91dHB1dEluZGljZXNbaV07XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gb3V0cHV0VGVuc29yc1tpXT8uWzNdOyAgLy8gdW5kZWZpbmVkIG1lYW5zIG91dHB1dCBpcyBub3QgcHJlLWFsbG9jYXRlZC5cblxuICAgICAgICBpZiAobG9jYXRpb24pIHtcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgcHJlLWFsbG9jYXRlZC4gYmluZCB0aGUgdGVuc29yLlxuICAgICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEJpbmRPdXRwdXQoaGFuZGxlLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkW2luZGV4XSwgb3V0cHV0VGVuc29ySGFuZGxlc1tpXSwgMCk7XG4gICAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgcHJlLWFsbG9jYXRlZCBvdXRwdXRbJHtpfV0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgbm90IHByZS1hbGxvY2F0ZWQuIHJlc2V0IHByZWZlcnJlZCBsb2NhdGlvbi5cbiAgICAgICAgICBjb25zdCBlcnJvckNvZGUgPVxuICAgICAgICAgICAgICB3YXNtLl9PcnRCaW5kT3V0cHV0KGhhbmRsZSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIDAsIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWRbaW5kZXhdKTtcbiAgICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBvdXRwdXRbJHtpfV0gdG8gJHtvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbaV19IGZvciBzZXNzaW9uPSR7c2Vzc2lvbklkfS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZXJyb3JDb2RlOiBudW1iZXI7XG5cbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bldpdGhCaW5kaW5nKFxuICAgICAgICAgIHNlc3Npb25IYW5kbGUsIGlvQmluZGluZ1N0YXRlLmhhbmRsZSwgb3V0cHV0Q291bnQsIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bihcbiAgICAgICAgICBzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzT2Zmc2V0LCBpbnB1dFZhbHVlc09mZnNldCwgaW5wdXRDb3VudCwgb3V0cHV0TmFtZXNPZmZzZXQsIG91dHB1dENvdW50LFxuICAgICAgICAgIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ2ZhaWxlZCB0byBjYWxsIE9ydFJ1bigpLicpO1xuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dDogVGVuc29yTWV0YWRhdGFbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzT2Zmc2V0IC8gNCArIGldO1xuICAgICAgaWYgKHRlbnNvciA9PT0gb3V0cHV0VGVuc29ySGFuZGxlc1tpXSkge1xuICAgICAgICAvLyBvdXRwdXQgdGVuc29yIGlzIHByZS1hbGxvY2F0ZWQuIG5vIG5lZWQgdG8gY29weSBkYXRhLlxuICAgICAgICBvdXRwdXQucHVzaChvdXRwdXRUZW5zb3JzW2ldISk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICAgICAgLy8gc3RhY2sgYWxsb2NhdGUgNCBwb2ludGVyIHZhbHVlXG4gICAgICBjb25zdCB0ZW5zb3JEYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiA0KTtcblxuICAgICAgbGV0IGtlZXBPdXRwdXRUZW5zb3IgPSBmYWxzZTtcbiAgICAgIGxldCB0eXBlOiBUZW5zb3IuVHlwZXx1bmRlZmluZWQsIGRhdGFPZmZzZXQgPSAwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0VGVuc29yRGF0YShcbiAgICAgICAgICAgIHRlbnNvciwgdGVuc29yRGF0YU9mZnNldCwgdGVuc29yRGF0YU9mZnNldCArIDQsIHRlbnNvckRhdGFPZmZzZXQgKyA4LCB0ZW5zb3JEYXRhT2Zmc2V0ICsgMTIpO1xuICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGFjY2VzcyBvdXRwdXQgdGVuc29yIGRhdGEgb24gaW5kZXggJHtpfS5gKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGVuc29yRGF0YUluZGV4ID0gdGVuc29yRGF0YU9mZnNldCAvIDQ7XG4gICAgICAgIGNvbnN0IGRhdGFUeXBlID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgZGF0YU9mZnNldCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGNvbnN0IGRpbXNPZmZzZXQgPSB3YXNtLkhFQVBVMzJbdGVuc29yRGF0YUluZGV4KytdO1xuICAgICAgICBjb25zdCBkaW1zTGVuZ3RoID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgY29uc3QgZGltcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgIGRpbXMucHVzaCh3YXNtLkhFQVBVMzJbZGltc09mZnNldCAvIDQgKyBpXSk7XG4gICAgICAgIH1cbiAgICAgICAgd2FzbS5fT3J0RnJlZShkaW1zT2Zmc2V0KTtcblxuICAgICAgICBjb25zdCBzaXplID0gZGltcy5yZWR1Y2UoKGEsIGIpID0+IGEgKiBiLCAxKTtcbiAgICAgICAgdHlwZSA9IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nKGRhdGFUeXBlKTtcblxuICAgICAgICBjb25zdCBwcmVmZXJyZWRMb2NhdGlvbiA9IGlvQmluZGluZ1N0YXRlPy5vdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbb3V0cHV0SW5kaWNlc1tpXV07XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3RyaW5nIHRlbnNvciBpcyBub3Qgc3VwcG9ydGVkIG9uIEdQVS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgc3RyaW5nRGF0YTogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBsZXQgZGF0YUluZGV4ID0gZGF0YU9mZnNldCAvIDQ7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHdhc20uSEVBUFUzMltkYXRhSW5kZXgrK107XG4gICAgICAgICAgICBjb25zdCBtYXhCeXRlc1RvUmVhZCA9IGkgPT09IHNpemUgLSAxID8gdW5kZWZpbmVkIDogd2FzbS5IRUFQVTMyW2RhdGFJbmRleF0gLSBvZmZzZXQ7XG4gICAgICAgICAgICBzdHJpbmdEYXRhLnB1c2god2FzbS5VVEY4VG9TdHJpbmcob2Zmc2V0LCBtYXhCeXRlc1RvUmVhZCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgc3RyaW5nRGF0YSwgJ2NwdSddKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBhIGNlcnRhaW4gb3V0cHV0J3MgcHJlZmVycmVkIGxvY2F0aW9uIGlzIEdQVSBidXQgdGhlIHRlbnNvciBpcyBlbXB0eSwgd2Ugc3RpbGwgbmVlZCB0byBjcmVhdGUgYSBDUFVcbiAgICAgICAgICAvLyB0ZW5zb3IgZm9yIGl0LiBUaGVyZSBpcyBubyBtYXBwaW5nIEdQVSBidWZmZXIgZm9yIGFuIGVtcHR5IHRlbnNvci5cbiAgICAgICAgICBpZiAocHJlZmVycmVkTG9jYXRpb24gPT09ICdncHUtYnVmZmVyJyAmJiBzaXplID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZ3B1QnVmZmVyID0gd2FzbS5qc2VwR2V0QnVmZmVyKGRhdGFPZmZzZXQpO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNpemUgPSBnZXRUZW5zb3JFbGVtZW50U2l6ZShkYXRhVHlwZSk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudFNpemUgPT09IHVuZGVmaW5lZCB8fCAhaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGV9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRvIG5vdCByZWxlYXNlIHRoZSB0ZW5zb3IgcmlnaHQgbm93LiBpdCB3aWxsIGJlIHJlbGVhc2VkIHdoZW4gdXNlciBjYWxscyB0ZW5zb3IuZGlzcG9zZSgpLlxuICAgICAgICAgICAga2VlcE91dHB1dFRlbnNvciA9IHRydWU7XG5cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFtcbiAgICAgICAgICAgICAgdHlwZSwgZGltcywge1xuICAgICAgICAgICAgICAgIGdwdUJ1ZmZlcixcbiAgICAgICAgICAgICAgICBkb3dubG9hZDogd2FzbS5qc2VwQ3JlYXRlRG93bmxvYWRlcihncHVCdWZmZXIsIHNpemUgKiBlbGVtZW50U2l6ZSwgdHlwZSksXG4gICAgICAgICAgICAgICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ2dwdS1idWZmZXInXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZWRBcnJheUNvbnN0cnVjdG9yID0gdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yKHR5cGUpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyB0eXBlZEFycmF5Q29uc3RydWN0b3Ioc2l6ZSk7XG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpXG4gICAgICAgICAgICAgICAgLnNldCh3YXNtLkhFQVBVOC5zdWJhcnJheShkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgZGF0YS5ieXRlTGVuZ3RoKSk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgZGF0YSwgJ2NwdSddKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKGJlZm9yZUdldFRlbnNvckRhdGFTdGFjayk7XG4gICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiBkYXRhT2Zmc2V0KSB7XG4gICAgICAgICAgd2FzbS5fZnJlZShkYXRhT2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWtlZXBPdXRwdXRUZW5zb3IpIHtcbiAgICAgICAgICB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHRlbnNvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIHdhc20uX09ydENsZWFyQm91bmRPdXRwdXRzKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShiZWZvcmVSdW5TdGFjayk7XG5cbiAgICBpbnB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIG91dHB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIGlucHV0T3V0cHV0QWxsb2NzLmZvckVhY2gocCA9PiB3YXNtLl9mcmVlKHApKTtcblxuICAgIGlmIChydW5PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlUnVuT3B0aW9ucyhydW5PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgcnVuT3B0aW9uc0FsbG9jcy5mb3JFYWNoKHAgPT4gd2FzbS5fZnJlZShwKSk7XG4gIH1cbn07XG5cbi8qKlxuICogZW5kIHByb2ZpbGluZ1xuICovXG5leHBvcnQgY29uc3QgZW5kUHJvZmlsaW5nID0gKHNlc3Npb25JZDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzZXNzaW9uIGlkJyk7XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbkhhbmRsZSA9IHNlc3Npb25bMF07XG5cbiAgLy8gcHJvZmlsZSBmaWxlIG5hbWUgaXMgbm90IHVzZWQgeWV0LCBidXQgaXQgbXVzdCBiZSBmcmVlZC5cbiAgY29uc3QgcHJvZmlsZUZpbGVOYW1lID0gd2FzbS5fT3J0RW5kUHJvZmlsaW5nKHNlc3Npb25IYW5kbGUpO1xuICBpZiAocHJvZmlsZUZpbGVOYW1lID09PSAwKSB7XG4gICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIHByb2ZpbGUgZmlsZSBuYW1lLicpO1xuICB9XG4gIHdhc20uX09ydEZyZWUocHJvZmlsZUZpbGVOYW1lKTtcbn07XG5cbmV4cG9ydCBjb25zdCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycyA9ICh0ZW5zb3JzOiByZWFkb25seSBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YVtdKTogQXJyYXlCdWZmZXJMaWtlW10gPT4ge1xuICBjb25zdCBidWZmZXJzOiBBcnJheUJ1ZmZlckxpa2VbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHRlbnNvciBvZiB0ZW5zb3JzKSB7XG4gICAgY29uc3QgZGF0YSA9IHRlbnNvclsyXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkgJiYgJ2J1ZmZlcicgaW4gZGF0YSkge1xuICAgICAgYnVmZmVycy5wdXNoKGRhdGEuYnVmZmVyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ1ZmZlcnM7XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBsaWI9XCJ3ZWJ3b3JrZXJcIiAvPlxuXG5pbXBvcnQge09ydFdhc21NZXNzYWdlfSBmcm9tICcuLi9wcm94eS1tZXNzYWdlcyc7XG5pbXBvcnQge2NyZWF0ZVNlc3Npb24sIGNyZWF0ZVNlc3Npb25BbGxvY2F0ZSwgY3JlYXRlU2Vzc2lvbkZpbmFsaXplLCBlbmRQcm9maWxpbmcsIGV4dHJhY3RUcmFuc2ZlcmFibGVCdWZmZXJzLCBpbml0UnVudGltZSwgcmVsZWFzZVNlc3Npb24sIHJ1bn0gZnJvbSAnLi4vd2FzbS1jb3JlLWltcGwnO1xuaW1wb3J0IHtpbml0aWFsaXplV2ViQXNzZW1ibHl9IGZyb20gJy4uL3dhc20tZmFjdG9yeSc7XG5cbnNlbGYub25tZXNzYWdlID0gKGV2OiBNZXNzYWdlRXZlbnQ8T3J0V2FzbU1lc3NhZ2U+KTogdm9pZCA9PiB7XG4gIHN3aXRjaCAoZXYuZGF0YS50eXBlKSB7XG4gICAgY2FzZSAnaW5pdC13YXNtJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIGluaXRpYWxpemVXZWJBc3NlbWJseShldi5kYXRhLmluKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgKCkgPT4gcG9zdE1lc3NhZ2Uoe3R5cGU6ICdpbml0LXdhc20nfSBhcyBPcnRXYXNtTWVzc2FnZSksXG4gICAgICAgICAgICAgICAgZXJyID0+IHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC13YXNtJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSkpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC13YXNtJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdpbml0LW9ydCc6XG4gICAgICB0cnkge1xuICAgICAgICBpbml0UnVudGltZShldi5kYXRhLmluKS50aGVuKCgpID0+IHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC1vcnQnfSBhcyBPcnRXYXNtTWVzc2FnZSksIGVyciA9PiBwb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5pdC1vcnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBhcyBPcnRXYXNtTWVzc2FnZSkpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC1vcnQnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NyZWF0ZV9hbGxvY2F0ZSc6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7bW9kZWx9ID0gZXYuZGF0YS5pbiE7XG4gICAgICAgIGNvbnN0IG1vZGVsZGF0YSA9IGNyZWF0ZVNlc3Npb25BbGxvY2F0ZShtb2RlbCk7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnY3JlYXRlX2FsbG9jYXRlJywgb3V0OiBtb2RlbGRhdGF9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2NyZWF0ZV9hbGxvY2F0ZScsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY3JlYXRlX2ZpbmFsaXplJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHttb2RlbGRhdGEsIG9wdGlvbnN9ID0gZXYuZGF0YS5pbiE7XG4gICAgICAgIGNvbnN0IHNlc3Npb25NZXRhZGF0YSA9IGNyZWF0ZVNlc3Npb25GaW5hbGl6ZShtb2RlbGRhdGEsIG9wdGlvbnMpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2NyZWF0ZV9maW5hbGl6ZScsIG91dDogc2Vzc2lvbk1ldGFkYXRhfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdjcmVhdGVfZmluYWxpemUnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NyZWF0ZSc6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7bW9kZWwsIG9wdGlvbnN9ID0gZXYuZGF0YS5pbiE7XG4gICAgICAgIGNvbnN0IHNlc3Npb25NZXRhZGF0YSA9IGNyZWF0ZVNlc3Npb24obW9kZWwsIG9wdGlvbnMpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2NyZWF0ZScsIG91dDogc2Vzc2lvbk1ldGFkYXRhfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdjcmVhdGUnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JlbGVhc2UnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IGV2LmRhdGEuaW4hO1xuICAgICAgICByZWxlYXNlU2Vzc2lvbihoYW5kbGVyKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdyZWxlYXNlJ30gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAncmVsZWFzZScsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncnVuJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHtzZXNzaW9uSWQsIGlucHV0SW5kaWNlcywgaW5wdXRzLCBvdXRwdXRJbmRpY2VzLCBvcHRpb25zfSA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBydW4oc2Vzc2lvbklkLCBpbnB1dEluZGljZXMsIGlucHV0cywgb3V0cHV0SW5kaWNlcywgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgIG91dHB1dHMgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdydW4nLCBvdXQ6IG91dHB1dHN9IGFzIE9ydFdhc21NZXNzYWdlLCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycyhvdXRwdXRzKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdydW4nLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ3J1bicsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZW5kLXByb2ZpbGluZyc6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gZXYuZGF0YS5pbiE7XG4gICAgICAgIGVuZFByb2ZpbGluZyhoYW5kbGVyKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdlbmQtcHJvZmlsaW5nJ30gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnZW5kLXByb2ZpbGluZycsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgfVxufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFhO0FBQWI7QUFBQTtBQUFPLE1BQU0sV0FBVztBQUFBO0FBQUE7OztBQ0F4QjtBQUFBO0FBQUEsZ0JBQUFBO0FBQUE7QUFBQSxNQUFhQTtBQUFiO0FBQUE7QUFBTyxNQUFNQSxRQUFPO0FBQUE7QUFBQTs7O0FDQXBCO0FBQUE7QUFBQTtBQUNBLFVBQUksV0FBVyxNQUFNO0FBQ25CLFlBQUksYUFBYSxPQUFPLGFBQWEsZUFBZSxTQUFTLGdCQUFnQixTQUFTLGNBQWMsTUFBTTtBQUMxRyxZQUFJLE9BQU8sZUFBZTtBQUFhLHVCQUFhLGNBQWM7QUFDbEUsZUFDRixTQUFTLFlBQVksQ0FBQyxHQUFHO0FBRXpCLGNBQUksSUFBRSxXQUFVLEdBQUU7QUFBRSxZQUFFLFFBQU0sSUFBSSxRQUFRLENBQUMsR0FBRSxNQUFJ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QUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsWUFBSTtBQUFFLHFCQUFRLEtBQUs7QUFBRSxrQkFBRSxFQUFFLFFBQVEsSUFBSSxPQUFPLEdBQUUsR0FBRyxHQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQUUsZ0JBQUksS0FBRywyREFBMkQsTUFBTSxHQUFHLEdBQUUsS0FBRyx3RkFBd0YsTUFBTSxHQUFHO0FBQUUsZ0JBQUUsRUFBQyxNQUFLLE9BQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxHQUFHLEVBQUUsRUFBRSxHQUFFLE1BQUssT0FDbGYsR0FBRyxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxHQUFHLEVBQUUsRUFBRSxHQUFFLE1BQUssT0FBRyxHQUFHLEVBQUUsS0FBRyxRQUFNLE1BQUksR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsR0FBRSxHQUFHLEdBQUUsTUFBSyxPQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE9BQUc7QUFBQyxrQkFBRSxFQUFFO0FBQUcsbUJBQUcsSUFBRSxJQUFFLEtBQUcsS0FBRyxNQUFJLEtBQUc7QUFBSSxxQkFBTyxFQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsR0FBRSxNQUFLLE9BQUc7QUFBQyx1QkFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLEtBQUcsRUFBRSxLQUFHLEdBQUUsTUFBSSxFQUFFLEVBQUUsS0FBRyxJQUFJ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RSxHQUFFLFdBQVU7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFdBQVU7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFdBQVU7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFdBQVU7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFdBQVU7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFdBQVU7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFdBQVU7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLE1BQUk7QUFBQSxZQUFHLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRTtBQUFDLGtCQUFFLElBQUUsWUFBVSxJQUFFLFVBQVEsQ0FBQyxDQUFDLEtBQUcsTUFBSSxLQUFHLGFBQVcsSUFBRTtBQUFJLHFCQUFLO0FBQUUsa0JBQUUsSUFBSSxLQUFLLE1BQUksQ0FBQztBQUFFLGdCQUFFLEtBQUcsTUFBSSxDQUFDLElBQUUsRUFBRSxjQUFjO0FBQUUsZ0JBQUUsSUFBRSxLQUFHLE1BQUksQ0FBQyxJQUFFLEVBQUUsY0FBYztBQUFFLGdCQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVk7QUFBRSxnQkFBRSxJQUFFLE1BQUksTUFDbGYsQ0FBQyxJQUFFLEVBQUUsV0FBVztBQUFFLGdCQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVk7QUFBRSxnQkFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxlQUFlLElBQUU7QUFBSyxnQkFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxVQUFVO0FBQUUsZ0JBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxLQUFHLEVBQUUsUUFBUSxJQUFFLEtBQUssSUFBSSxFQUFFLGVBQWUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxLQUFHLFFBQU07QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRSxHQUFFLEdBQUU7QUFBQyxrQkFBRSxJQUFFLFlBQVUsSUFBRSxVQUFRLENBQUMsQ0FBQyxLQUFHLE1BQUks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QU8sS0FBRyxFQUFFLEtBQUcsZUFBYyxZQUFZLEdBQUUsQ0FBQyxHQUFFLEtBQUcsR0FBRyxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxtQkFBTyxJQUFFLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLElBQUU7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFDNVksY0FBSSxLQUFHLE9BQUc7QUFBQyxxQkFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLElBQUUsRUFBRSxRQUFPLEVBQUUsR0FBRTtBQUFDLGtCQUFJLElBQUUsRUFBRSxXQUFXLENBQUM7QUFBRSxxQkFBSyxJQUFFLE1BQUksUUFBTSxJQUFFLEtBQUcsSUFBRSxTQUFPLEtBQUcsU0FBTyxLQUFHLEtBQUcsR0FBRSxFQUFFLEtBQUcsS0FBRztBQUFBLFlBQUM7QUFBQyxtQkFBTztBQUFBLFVBQUMsR0FBRSxLQUFHLENBQUMsR0FBRSxHQUFFLEdBQUUsTUFBSTtBQUFDLG1CQUFLO0FBQUUsZ0JBQUcsRUFBRSxJQUFFO0FBQUcscUJBQU87QUFBRSxnQkFBSSxJQUFFO0FBQUUsZ0JBQUUsSUFBRSxJQUFFO0FBQUUscUJBQVEsSUFBRSxHQUFFLElBQUUsRUFBRSxRQUFPLEVBQUUsR0FBRTtBQUFDLGtCQUFJLElBQUUsRUFBRSxXQUFXLENBQUM7QUFBRSxrQkFBRyxTQUFPLEtBQUcsU0FBTyxHQUFFO0FBQUMsb0JBQUksSUFBRSxFQUFFLFdBQVcsRUFBRSxDQUFDO0FBQUUsb0JBQUUsVUFBUSxJQUFFLFNBQU8sTUFBSSxJQUFFO0FBQUEsY0FBSTtBQUFDLGtCQUFHLE9BQUssR0FBRTtBQUFDLG9CQUFHLEtBQUc7QUFBRTtBQUFNLGtCQUFFLFFBQU0sQ0FBQyxJQUFFO0FBQUEsY0FBQyxPQUFLO0FBQUMsb0JBQUcsUUFBTSxHQUFFO0FBQUMsc0JBQUcsSUFBRSxLQUFHO0FBQUU7QUFBTSxvQkFBRSxRQUFNLENBQUMsSUFBRSxNQUFJLEtBQUc7QUFBQSxnQkFBQyxPQUFLO0FBQUMsc0JBQUcsU0FBTyxHQUFFO0FBQUMsd0JBQUcsSUFBRSxLQUFHO0FBQUU7QUFBTSxzQkFBRSxRQUFNLENBQUMsSUFBRSxNQUFJLEtBQUc7QUFBQSxrQkFBRSxPQUFLO0FBQUMsd0JBQUcsSUFBRSxLQUFHO0FBQUU7QUFBTSxzQkFBRSxRQUFNLENBQUMsSUFBRSxNQUFJLEtBQ3BmO0FBQUcsc0JBQUUsUUFBTSxDQUFDLElBQUUsTUFBSSxLQUFHLEtBQUc7QUFBQSxrQkFBRTtBQUFDLG9CQUFFLFFBQU0sQ0FBQyxJQUFFLE1BQUksS0FBRyxJQUFFO0FBQUEsZ0JBQUU7QUFBQyxrQkFBRSxRQUFNLENBQUMsSUFBRSxNQUFJLElBQUU7QUFBQSxjQUFFO0FBQUEsWUFBQztBQUFDLGNBQUUsTUFBSSxDQUFDLElBQUU7QUFBRSxtQkFBTyxJQUFFO0FBQUEsVUFBQyxHQUFFLEtBQUcsQ0FBQyxHQUFFLEdBQUUsTUFBSSxHQUFHLEdBQUUsRUFBRSxHQUFFLEdBQUUsQ0FBQztBQUFFLG1CQUFTLEdBQUcsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsSUFBRTtBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUM3ZCxtQkFBUyxHQUFHLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxjQUFJLEtBQUcsT0FBRztBQUFDLGdCQUFHLFNBQU87QUFBRSxxQkFBTTtBQUFPLGdCQUFJLElBQUUsT0FBTztBQUFFLG1CQUFNLGFBQVcsS0FBRyxZQUFVLEtBQUcsZUFBYSxJQUFFLEVBQUUsU0FBUyxJQUFFLEtBQUc7QUFBQSxVQUFDLEdBQUUsSUFBRyxJQUFFLE9BQUc7QUFBQyxxQkFBUSxJQUFFLElBQUcsRUFBRSxFQUFFLE1BQUksQ0FBQztBQUFHLG1CQUFHLEdBQUcsRUFBRSxFQUFFLFFBQU0sQ0FBQyxDQUFDO0FBQUUsbUJBQU87QUFBQSxVQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsS0FBRyxDQUFDLEdB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QUFHLEtBQUcsRUFBRSxTQUFPLENBQUM7QUFBRSxjQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsSUFBRTtBQUFFLG1CQUFPO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxJQUFHLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBRTtBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBRTtBQUNwYyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxtQkFBTyxJQUFFLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsSUFBRTtBQUFBLFVBQUU7QUFBQyxjQUFJLEtBQUcsQ0FBQyxNQUFLLENBQUMsR0FBRSxDQUFDLENBQUM7QUFBRSxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBRSxtQkFBSztBQUFFLG1CQUFLO0FBQUUsbUJBQUs7QUFBRSxxQkFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFJO0FBQUMsa0JBQUksSUFBRSxFQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFFLEVBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDO0FBQUUsbUJBQUc7QUFBRSx1QkFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLEtBQUk7QUFBQyxvQkFBSSxJQUFFLEVBQUUsRUFBRSxJQUFFLE1BQUksQ0FBQyxHQUFFLElBQUUsR0FBRyxDQUFDO0FBQUUsc0JBQUksS0FBRyxPQUFLLE1BQUksTUFBSSxJQUFFLEtBQUcsR0FBRyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEdBQUUsRUFBRSxTQUFPLEtBQUcsRUFBRSxLQUFLLENBQUM7QUFBQSxjQUFDO0FBQUMsbUJBQUc7QUFBQSxZQUFDO0FBQUMsY0FBRSxFQUFFLE1BQUksTUFBSSxDQUFDLElBQUU7QUFBRSxtQkFBTztBQUFBLFVBQUM7QUFBQyxjQUFJLEtBQUcsQ0FBQyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsRUFBRSxHQUFFLEtBQUcsQ0FBQyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsRUFBRTtBQUFFLG1CQUFTLEdBQUcsR0FBRTtBQUFDLGdCQUFJLElBQUUsTUFBTSxHQUFHLENBQUMsSUFBRSxDQUFDO0FBQUUsZUFBRyxHQUFFLEdBQUUsR0FBRSxFQUFFLE1BQU07QUFBRSxtQkFBTztBQUFBLFVBQUM7QUFDaGYsY0FBSSxLQUFHLENBQUMsR0FBRSxNQUFJO0FBQUMsY0FBRSxFQUFFLElBQUksR0FBRSxNQUFJLENBQUM7QUFBQSxVQUFDO0FBQy9CLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLHFCQUFTLEVBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxtQkFBSSxJQUFFLFlBQVUsT0FBTyxJQUFFLEVBQUUsU0FBUyxJQUFFLEtBQUcsSUFBRyxFQUFFLFNBQU87QUFBRyxvQkFBRSxFQUFFLENBQUMsSUFBRTtBQUFFLHFCQUFPO0FBQUEsWUFBQztBQUFDLHFCQUFTLEVBQUUsR0FBRSxHQUFFO0FBQUMscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRztBQUFBLFlBQUM7QUFBQyxxQkFBUyxFQUFFLEdBQUUsR0FBRTtBQUFDLHVCQUFTLEVBQUUsSUFBRztBQUFDLHVCQUFPLElBQUUsS0FBRyxLQUFHLElBQUUsS0FBRyxJQUFFO0FBQUEsY0FBQztBQUFDLGtCQUFJO0FBQUUscUJBQUssSUFBRSxFQUFFLEVBQUUsWUFBWSxJQUFFLEVBQUUsWUFBWSxDQUFDLE1BQUksT0FBSyxJQUFFLEVBQUUsRUFBRSxTQUFTLElBQUUsRUFBRSxTQUFTLENBQUMsT0FBSyxJQUFFLEVBQUUsRUFBRSxRQUFRLElBQUUsRUFBRSxRQUFRLENBQUM7QUFBRyxxQkFBTztBQUFBLFlBQUM7QUFBQyxxQkFBUyxFQUFFLEdBQUU7QUFBQyxzQkFBTyxFQUFFLE9BQU8sR0FBRTtBQUFBLGdCQUFDLEtBQUs7QUFBRSx5QkFBTyxJQUFJLEtBQUssRUFBRSxZQUFZLElBQUUsR0FBRSxJQUFHLEVBQUU7QUFBQSxnQkFBRSxLQUFLO0FBQUUseUJBQU87QUFBQSxnQkFBRSxLQUFLO0FBQUUseUJBQU8sSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQztBQUFBLGdCQUFFLEtBQUs7QUFBRSx5QkFBTyxJQUFJO0FBQUEsb0JBQUssRUFBRSxZQUFZO0FBQUEsb0JBQzVmO0FBQUEsb0JBQUU7QUFBQSxrQkFBQztBQUFBLGdCQUFFLEtBQUs7QUFBRSx5QkFBTyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDO0FBQUEsZ0JBQUUsS0FBSztBQUFFLHlCQUFPLElBQUksS0FBSyxFQUFFLFlBQVksSUFBRSxHQUFFLElBQUcsRUFBRTtBQUFBLGdCQUFFLEtBQUs7QUFBRSx5QkFBTyxJQUFJLEtBQUssRUFBRSxZQUFZLElBQUUsR0FBRSxJQUFHLEVBQUU7QUFBQSxjQUFDO0FBQUEsWUFBQztBQUFDLHFCQUFTLEVBQUUsR0FBRTtBQUFDLGtCQUFJLElBQUUsRUFBRTtBQUFHLG1CQUFJLElBQUUsSUFBSSxLQUFNLElBQUksS0FBSyxFQUFFLEtBQUcsTUFBSyxHQUFFLENBQUMsRUFBRyxRQUFRLENBQUMsR0FBRSxJQUFFLEtBQUc7QUFBQyxvQkFBSSxJQUFFLEVBQUUsU0FBUyxHQUFFLEtBQUcsRUFBRSxFQUFFLFlBQVksQ0FBQyxJQUFFLEtBQUcsSUFBSSxDQUFDO0FBQUUsb0JBQUcsSUFBRSxJQUFFLEVBQUUsUUFBUTtBQUFFLHVCQUFHLElBQUUsRUFBRSxRQUFRLElBQUUsR0FBRSxFQUFFLFFBQVEsQ0FBQyxHQUFFLEtBQUcsSUFBRSxFQUFFLFNBQVMsSUFBRSxDQUFDLEtBQUcsRUFBRSxTQUFTLENBQUMsR0FBRSxFQUFFLFlBQVksRUFBRSxZQUFZLElBQUUsQ0FBQztBQUFBLHFCQUFPO0FBQUMsb0JBQUUsUUFBUSxFQUFFLFFBQVEsSUFBRSxDQUFDO0FBQUU7QUFBQSxnQkFBSztBQUFBLGNBQUM7QUFBQyxrQkFBRSxJQUFJLEtBQUssRUFBRSxZQUFZLElBQUUsR0FBRSxHQUFFLENBQUM7QUFBRSxrQkFBRSxFQUFFLElBQUk7QUFBQSxnQkFBSyxFQUFFLFlBQVk7QUFBQSxnQkFDbmY7QUFBQSxnQkFBRTtBQUFBLGNBQUMsQ0FBQztBQUFFLGtCQUFFLEVBQUUsQ0FBQztBQUFFLHFCQUFPLEtBQUcsRUFBRSxHQUFFLENBQUMsSUFBRSxLQUFHLEVBQUUsR0FBRSxDQUFDLElBQUUsRUFBRSxZQUFZLElBQUUsSUFBRSxFQUFFLFlBQVksSUFBRSxFQUFFLFlBQVksSUFBRTtBQUFBLFlBQUM7QUFBQyxtQkFBSztBQUFFLG1CQUFLO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLGdCQUFJLElBQUUsRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUM7QUFBRSxnQkFBRSxFQUFDLElBQUcsRUFBRSxFQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxJQUFFLEdBQUcsQ0FBQyxJQUFFLEdBQUU7QUFBRSxnQkFBRSxHQUFHLENBQUM7QUFBRSxnQkFBRTtBQUFBLGNBQUMsTUFBSztBQUFBLGNBQXVCLE1BQUs7QUFBQSxjQUFXLE1BQUs7QUFBQSxjQUFXLE1BQUs7QUFBQSxjQUFLLE1BQUs7QUFBQSxjQUFjLE1BQUs7QUFBQSxjQUFRLE1BQUs7QUFBQSxjQUFXLE1BQUs7QUFBQSxjQUNyZixNQUFLO0FBQUEsY0FBVyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBVyxPQUFNO0FBQUEsY0FBVyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsWUFBSTtBQUFFLHFCQUFRLEtBQUs7QUFBRSxrQkFBRSxFQUFFLFFBQVEsSUFBSSxPQUFPLEdBQUUsR0FBRyxHQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQUUsZ0JBQUksSUFBRSwyREFBMkQsTUFBTSxHQUFHLEdBQUUsSUFBRSx3RkFBd0YsTUFBTSxHQUFHO0FBQUUsZ0JBQUUsRUFBQyxNQUFLLE9BQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FDemYsRUFBRSxFQUFFLEVBQUUsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFFLE1BQUssT0FBRyxHQUFHLEVBQUUsS0FBRyxRQUFNLE1BQUksR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsR0FBRSxHQUFHLEdBQUUsTUFBSyxPQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE9BQUc7QUFBQyxrQkFBRSxFQUFFO0FBQUcsbUJBQUcsSUFBRSxJQUFFLEtBQUcsS0FBRyxNQUFJLEtBQUc7QUFBSSxxQkFBTyxFQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsR0FBRSxNQUFLLE9BQUc7QUFBQyx1QkFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLEtBQUcsRUFBRSxLQUFHLEdBQUUsTUFBSSxFQUFFLEVBQUUsS0FBRyxJQUFJLElBQUUsS0FBRyxJQUFJLEdBQUc7QUFBRTtBQUFDLHFCQUFPLEVBQUUsRUFBRSxLQUFHLEdBQUUsQ0FBQztBQUFBLFlBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLEtBQUcsR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE1BQUksTUFBSyxNQUFLLE9BQUcsS0FBRyxFQUFFLE1BQUksS0FBRyxFQUFFLEtBQUcsT0FBSyxNQUFLLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDLEdBQUUsTUFBSyxNQUFJLEtBQUssTUFBSyxPQUFHLEVBQUUsTUFBSSxHQUFFLE1BQUssT0FBRyxFQUFFLEtBQUssT0FBTyxFQUFFLEtBQUcsSUFBRSxFQUFFLE1BQ3BmLENBQUMsR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHO0FBQUMsa0JBQUksSUFBRSxLQUFLLE9BQU8sRUFBRSxLQUFHLEtBQUcsRUFBRSxLQUFHLEtBQUcsS0FBRyxDQUFDO0FBQUUsb0JBQUksRUFBRSxLQUFHLE1BQUksRUFBRSxLQUFHLEtBQUcsS0FBRztBQUFJLGtCQUFHO0FBQUUsc0JBQUksTUFBSSxLQUFHLEVBQUUsS0FBRyxNQUFJLEVBQUUsTUFBSSxHQUFFLEtBQUcsS0FBRyxLQUFHLEtBQUcsRUFBRSxFQUFFLEVBQUUsTUFBSSxJQUFFO0FBQUEsbUJBQVE7QUFB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QUFTLEdBQUUsR0FBRSxHQUFFO0FBQUMscUJBQUs7QUFBRSxxQkFBSztBQUFFLGtCQUFFLEVBQUUsTUFBSSxDQUFDO0FBQUUsa0JBQUUsR0FBRyxHQUFFLFdBQVc7QUFBRSxrQkFBSSxJQUFFLENBQUMsR0FBRSxJQUFFLEVBQUUsQ0FBQztBQUFFLGdCQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsSUFBRTtBQUFFLHFCQUFPLEVBQUUsV0FBVyxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMscUJBQUs7QUFBRSxxQkFBSztBQUFFLHFCQUFLO0FBQUUsa0JBQUUsR0FBRyxNQUFJLENBQUM7QUFBRSxrQkFBRSxFQUFFLE1BQUksQ0FBQztBQUFFLGtCQUFFLEdBQUcsQ0FBQztBQUFFLGtCQUFJLElBQUUsQ0FBQztBQUFFLGdCQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLENBQUM7QUFBRSxxQkFBTyxFQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLHFCQUFLO0FBQUUscUJBQUs7QUFBRSxrQkFBRSxHQUFHLE1BQUksQ0FBQztBQUFFLGtCQUFFLEVBQUUsTUFBSSxDQUFDO0FBQUUsa0JBQUUsR0FBRyxDQUFDO0FBQUUsZ0JBQUUsR0FBRSxHQUFFLE1BQUssQ0FBQztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUU7QUFBQSxZQUFHLEdBQUUsU0FBUyxHQUFFLEdBQUU7QUFBQyxxQkFBSztBQUFFLGtCQUFFLEVBQUUsTUFBSSxDQUFDO0FBQUUsa0JBQUUsRUFBRSxDQUFDO0FBQUUscUJBQU8sS0FBRztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFO0FBQUMscUJBQUs7QUFBRSxrQkFBRyxNQUFJO0FBQUUsdUJBQU8sRUFBRSxHQUFHLENBQUM7QUFBRSxrQkFBRSxHQUFHLENBQUM7QUFBRSxxQkFBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FDN2YsR0FBRTtBQUFDLGtCQUFJLElBQUUsR0FBRyxHQUFFLE1BQUksQ0FBQyxHQUFFLElBQUUsRUFBRSxDQUFDO0FBQUUsa0JBQUUsRUFBRSxPQUFLLE9BQUssRUFBRSxNQUFNLENBQUMsRUFBRSxJQUFJLFNBQVMsR0FBRTtBQUFDLHVCQUFPLEVBQUU7QUFBQSxjQUFJLENBQUMsRUFBRSxLQUFLLEdBQUcsSUFBRTtBQUFJLGtCQUFJLElBQUUsR0FBRyxDQUFDO0FBQUUsa0JBQUcsV0FBUztBQUFFLHVCQUFPO0FBQUUsa0JBQUUsQ0FBQyxTQUFTO0FBQUUsdUJBQVEsSUFBRSxDQUFDLENBQUMsR0FBRSxJQUFFLElBQUcsSUFBRSxHQUFFLElBQUUsSUFBRSxHQUFFLEVBQUU7QUFBRSxzQkFBSSxNQUFJLElBQUUsT0FBSyxNQUFJLFFBQU0sR0FBRSxFQUFFLEtBQUssWUFBVSxDQUFDLEdBQUUsRUFBRSxLQUFLLEVBQUUsSUFBRSxDQUFDLENBQUM7QUFBRSxrQkFBSSxJQUFFLHFCQUFtQixHQUFHLGtCQUFnQixDQUFDLElBQUUseUNBQXdDLElBQUU7QUFBRSxtQkFBSSxJQUFFLEdBQUUsSUFBRSxJQUFFLEdBQUUsRUFBRTtBQUFFLHFCQUFHLGdCQUFjLElBQUUsZUFBYSxJQUFFLGdDQUE4QixJQUFFLE1BQUksSUFBRSxNQUFJLFFBQU8sS0FBRyxFQUFFLElBQUUsQ0FBQyxFQUFFO0FBQWUsbUJBQUcsK0JBQTZCLElBQUU7QUFDOWUsbUJBQUksSUFBRSxHQUFFLElBQUUsSUFBRSxHQUFFLEVBQUU7QUFBRSxrQkFBRSxJQUFFLENBQUMsRUFBRSxpQkFBZSxLQUFHLGdCQUFjLElBQUUsc0JBQW9CLElBQUU7QUFBUSxnQkFBRSxPQUFLLEtBQUc7QUFBcUQsZ0JBQUUsS0FBSyxJQUFFLE1BQU07QUFBRSxrQkFBRSxHQUFHLENBQUMsRUFBRSxNQUFNLE1BQUssQ0FBQztBQUFFLGtCQUFFLEdBQUcsQ0FBQztBQUFFLHFCQUFPLEdBQUcsQ0FBQyxJQUFFO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUUsR0FBRTtBQUFDLHFCQUFLO0FBQUUsa0JBQUUsRUFBRSxNQUFJLENBQUM7QUFBRSxrQkFBRSxFQUFFLENBQUM7QUFBRSxxQkFBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUU7QUFBQyxxQkFBSztBQUFFLGtCQUFFLE1BQUksRUFBRSxJQUFJLENBQUMsRUFBRSxNQUFJO0FBQUEsWUFBRTtBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxxQkFBSztBQUFFLHFCQUFLO0FBQUUsa0JBQUUsRUFBRSxNQUFJLENBQUM7QUFBRSxrQkFBSSxJQUFFLEdBQUcsQ0FBQztBQUFFLG9CQUFJLElBQUUsR0FBRyxDQUFDLEdBQUUsR0FBRyxDQUFDLElBQUU7QUFBRyxxQkFBTyxFQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxXQUFVO0FBQUMscUJBQU8sRUFBRSxDQUFDLENBQUM7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRTtBQUFDLGtCQUFFLEVBQUUsTUFBSSxDQUFDO0FBQUUsdUJBQVEsSUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFFLElBQUUsR0FBRSxJQUFFLEVBQUUsUUFBTztBQUFJLGtCQUFFLENBQUMsSUFDL2YsRUFBRSxDQUFDO0FBQUUscUJBQU8sRUFBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUU7QUFBQyxxQkFBTyxFQUFFLEdBQUcsTUFBSSxDQUFDLENBQUM7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFdBQVU7QUFBQyxxQkFBTyxFQUFFLENBQUMsQ0FBQztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFO0FBQUMscUJBQUs7QUFBRSx1QkFBUSxJQUFFLEVBQUUsQ0FBQyxHQUFFLEVBQUUsVUFBUTtBQUFDLG9CQUFJLElBQUUsRUFBRSxJQUFJ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QjtBQUFBLFFBQ3JEO0FBQ0E7QUFBQSxNQUNGLEtBQUs7QUFDSCxZQUFJO0FBQ0YsZ0JBQU0sVUFBVSxHQUFHLEtBQUs7QUFDeEIseUJBQWUsT0FBTztBQUN0QixzQkFBWSxFQUFDLE1BQU0sVUFBUyxDQUFtQjtBQUFBLFFBQ2pELFNBQVMsS0FBSztBQUNaLHNCQUFZLEVBQUMsTUFBTSxXQUFXLElBQUcsQ0FBbUI7QUFBQSxRQUN0RDtBQUNBO0FBQUEsTUFDRixLQUFLO0FBQ0gsWUFBSTtBQUNGLGdCQUFNLEVBQUMsV0FBVyxjQUFjLFFBQVEsZUFBZSxRQUFPLElBQUksR0FBRyxLQUFLO0FBQzFFLGNBQUksV0FBVyxjQUFjLFFBQVEsZUFBZSxPQUFPLEVBQ3REO0FBQUEsWUFDRyxhQUFXO0FBQ1QsMEJBQVksRUFBQyxNQUFNLE9BQU8sS0FBSyxRQUFPLEdBQXFCLDJCQUEyQixPQUFPLENBQUM7QUFBQSxZQUNoRztBQUFBLFlBQ0EsU0FBTztBQUNMLDBCQUFZLEVBQUMsTUFBTSxPQUFPLElBQUcsQ0FBbUI7QUFBQSxZQUNsRDtBQUFBLFVBQUM7QUFBQSxRQUNYLFNBQVMsS0FBSztBQUNaLHNCQUFZLEVBQUMsTUFBTSxPQUFPLElBQUcsQ0FBbUI7QUFBQSxRQUNsRDtBQUNBO0FBQUEsTUFDRixLQUFLO0FBQ0gsWUFBSTtBQUNGLGdCQUFNLFVBQVUsR0FBRyxLQUFLO0FBQ3hCLHVCQUFhLE9BQU87QUFDcEIsc0JBQVksRUFBQyxNQUFNLGdCQUFlLENBQW1CO0FBQUEsUUFDdkQsU0FBUyxLQUFLO0FBQ1osc0JBQVksRUFBQyxNQUFNLGlCQUFpQixJQUFHLENBQW1CO0FBQUEsUUFDNUQ7QUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjsiLAogICJuYW1lcyI6IFsiam9pbiIsICJ3YXNtIiwgIndhc20iLCAid2FzbSIsICJ3YXNtIiwgInRlbnNvciIsICJlcnJvckNvZGUiLCAiaSJdCn0K\n';
    }
  });

  // web/lib/wasm/proxy-wrapper.ts
  var isProxy, proxyWorker, initializing2, initialized2, aborted2, initWasmCallbacks, initOrtCallbacks, createSessionAllocateCallbacks, createSessionFinalizeCallbacks, createSessionCallbacks, releaseSessionCallbacks, runCallbacks, endProfilingCallbacks, ensureWorker, onProxyWorkerMessage, scriptSrc, initializeWebAssemblyInstance, initializeRuntime, createSessionAllocate2, createSessionFinalize2, createSession2, releaseSession2, run2, endProfiling2;
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
    }
  });

  // nodejs-ignore:node:fs/promises
  var readFile2;
  var init_promises = __esm({
    "nodejs-ignore:node:fs/promises"() {
      readFile2 = void 0;
    }
  });

  // web/lib/wasm/session-handler.ts
  var runtimeInitialized, runtimeInitializationPromise, encodeTensorMetadata, decodeTensorMetadata, OnnxruntimeWebAssemblySessionHandler;
  var init_session_handler = __esm({
    "web/lib/wasm/session-handler.ts"() {
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
          if (!runtimeInitialized) {
            if (!runtimeInitializationPromise) {
              runtimeInitializationPromise = initializeRuntime(env2);
            }
            await runtimeInitializationPromise;
            runtimeInitializationPromise = void 0;
            runtimeInitialized = true;
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
      init_session_handler();
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
      OnnxruntimeTrainingWebAssemblyBackend = class extends OnnxruntimeWebAssemblyBackend {
        async createTrainingSessionHandler(_checkpointStateUriOrBuffer, _trainModelUriOrBuffer, _evalModelUriOrBuffer, _optimizerModelUriOrBuffer, _options) {
          throw new Error("Method not implemented yet.");
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
    env: () => env2,
    registerBackend: () => registerBackend
  });
  init_esm();
  init_esm();

  // web/lib/version.ts
  var version2 = "1.17.0";

  // web/lib/index.ts
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
  return __toCommonJS(lib_exports);
})();