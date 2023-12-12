export const conformanceEnv = {
  "version": '122.0.6178.0',
  'last_update': 'Dec 12, 2023'
}

export const conformance = [
  {
    "name": "densenet",
    "gpu": "NVIDIA GeForce RTX 2080 Ti Direct3D11",
    "wasm_4": {
      "e3": "1e-3",
      "e4": "1e-4",
      "e5": "1e-5",
      "e6": "1e-6",
      "e7": "1e-7",
      "e8": "1e-8",
      "error": ""
    },
    "webnn_cpu_4": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000022619962692260742,
        0.000018477439880371094,
        0.00001811981201171875
      ]
    },
    "webgl": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000006556510925292969,
        0.000006198883056640625,
        0.0000059604644775390625
      ]
    },
    "webgpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.00001049041748046875,
        0.000010251998901367188,
        0.000009931623935699463
      ]
    },
    "webnn_gpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000008106231689453125,
        0.00000718235969543457,
        0.00000667572021484375
      ]
    }
  },
  {
    "name": "efficientnet_lite",
    "gpu": "NVIDIA GeForce RTX 2080 Ti Direct3D11",
    "wasm_4": {
      "e3": "1e-3",
      "e4": "1e-4",
      "e5": "1e-5",
      "e6": "1e-6",
      "e7": "1e-7",
      "e8": "1e-8",
      "error": ""
    },
    "webnn_cpu_4": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "pass",
      "e7": "pass",
      "e8": "fail",
      "error": "",
      "max_diff": [
        1.3969838619232178e-8,
        1.0710209608078003e-8,
        1.0710209608078003e-8
      ]
    },
    "webgl": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "pass",
      "e7": "pass",
      "e8": "pass",
      "error": "",
      "max_diff": [
        9.546056389808655e-9,
        8.847564458847046e-9,
        8.381903171539307e-9
      ]
    },
    "webgpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "pass",
      "e7": "pass",
      "e8": "fail",
      "error": "",
      "max_diff": [
        1.1175870895385742e-8,
        9.778887033462524e-9,
        8.614733815193176e-9
      ]
    },
    "webnn_gpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "pass",
      "e7": "pass",
      "e8": "fail",
      "error": "",
      "max_diff": [
        1.1175870895385742e-8,
        8.847564458847046e-9,
        7.2177499532699585e-9
      ]
    }
  },
  {
    "name": "mobilenet_v2",
    "gpu": "NVIDIA GeForce RTX 2080 Ti Direct3D11",
    "wasm_4": {
      "e3": "1e-3",
      "e4": "1e-4",
      "e5": "1e-5",
      "e6": "1e-6",
      "e7": "1e-7",
      "e8": "1e-8",
      "error": ""
    },
    "webnn_cpu_4": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.00005996227264404297,
        0.00005817413330078125,
        0.00005650520324707031
      ]
    },
    "webgl": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000016450881958007812,
        0.00001621246337890625,
        0.00001621246337890625
      ]
    },
    "webgpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000006318092346191406,
        0.0000059604644775390625,
        0.0000057220458984375
      ]
    },
    "webnn_gpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000044226646423339844,
        0.000043272972106933594,
        0.00004088878631591797
      ]
    }
  },
  {
    "name": "mobilenet_v2_12",
    "gpu": "NVIDIA GeForce RTX 2080 Ti Direct3D11",
    "wasm_4": {
      "e3": "1e-3",
      "e4": "1e-4",
      "e5": "1e-5",
      "e6": "1e-6",
      "e7": "1e-7",
      "e8": "1e-8",
      "error": ""
    },
    "webnn_cpu_4": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.00005996227264404297,
        0.00005817413330078125,
        0.00005650520324707031
      ]
    },
    "webgl": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000016450881958007812,
        0.00001621246337890625,
        0.00001621246337890625
      ]
    },
    "webgpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000006318092346191406,
        0.0000059604644775390625,
        0.0000057220458984375
      ]
    },
    "webnn_gpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000044226646423339844,
        0.000043272972106933594,
        0.00004088878631591797
      ]
    }
  },
  {
    "name": "resnet50_v1",
    "gpu": "NVIDIA GeForce RTX 2080 Ti Direct3D11",
    "wasm_4": {
      "e3": "1e-3",
      "e4": "1e-4",
      "e5": "1e-5",
      "e6": "1e-6",
      "e7": "1e-7",
      "e8": "1e-8",
      "error": ""
    },
    "webnn_cpu_4": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.00003355741500854492,
        0.000029981136322021484,
        0.000028848648071289062
      ]
    },
    "webgl": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.0000073909759521484375,
        0.0000054836273193359375,
        0.000005364418029785156
      ]
    },
    "webgpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000011324882507324219,
        0.000010609626770019531,
        0.00001049041748046875
      ]
    },
    "webnn_gpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000007152557373046875,
        0.0000059604644775390625,
        0.0000054389238357543945
      ]
    }
  },
  {
    "name": "resnet50_v2",
    "gpu": "NVIDIA GeForce RTX 2080 Ti Direct3D11",
    "wasm_4": {
      "e3": "1e-3",
      "e4": "1e-4",
      "e5": "1e-5",
      "e6": "1e-6",
      "e7": "1e-7",
      "e8": "1e-8",
      "error": ""
    },
    "webnn_cpu_4": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000018596649169921875,
        0.000018417835235595703,
        0.000015616416931152344
      ]
    },
    "webgl": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000011920928955078125,
        0.000008344650268554688,
        0.000008285045623779297
      ]
    },
    "webgpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000009298324584960938,
        0.000008344650268554688,
        0.000008046627044677734
      ]
    },
    "webnn_gpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.0000040531158447265625,
        0.0000033974647521972656,
        0.0000032186508178710938
      ]
    }
  },
  {
    "name": "squeezenet",
    "gpu": "NVIDIA GeForce RTX 2080 Ti Direct3D11",
    "wasm_4": {
      "e3": "1e-3",
      "e4": "1e-4",
      "e5": "1e-5",
      "e6": "1e-6",
      "e7": "1e-7",
      "e8": "1e-8",
      "error": ""
    },
    "webnn_cpu_4": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.00001239776611328125,
        0.000011682510375976562,
        0.000011682510375976562
      ]
    },
    "webgl": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000011563301086425781,
        0.000011563301086425781,
        0.000011086463928222656
      ]
    },
    "webgpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000009775161743164062,
        0.000009298324584960938,
        0.000009298324584960938
      ]
    },
    "webnn_gpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000003337860107421875,
        0.0000030994415283203125,
        0.00000286102294921875
      ]
    }
  },
  {
    "name": "selfie_segmentation_general",
    "gpu": "NVIDIA GeForce RTX 2080 Ti Direct3D11",
    "wasm_4": {
      "e3": "1e-3",
      "e4": "1e-4",
      "e5": "1e-5",
      "e6": "1e-6",
      "e7": "1e-7",
      "e8": "1e-8",
      "error": ""
    },
    "webnn_cpu_4": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "pass",
      "e7": "pass",
      "e8": "fail",
      "error": "",
      "max_diff": [
        5.96046447758973e-8,
        5.960464477539865e-8,
        5.960464477539616e-8
      ]
    },
    "webgl": {
      "e3": "fail",
      "e4": "fail",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        1.0000000596046448,
        1.0000000596046448,
        1.0000000596046448
      ]
    },
    "webgpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "pass",
      "e7": "pass",
      "e8": "fail",
      "error": "",
      "max_diff": [
        5.96046447758971e-8,
        5.960464477539863e-8,
        5.960464477539614e-8
      ]
    },
    "webnn_gpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "pass",
      "e7": "pass",
      "e8": "fail",
      "error": "",
      "max_diff": [
        5.960464477589735e-8,
        5.960464477539865e-8,
        5.960464477539616e-8
      ]
    }
  },
  {
    "name": "selfie_segmentation_landscape",
    "gpu": "NVIDIA GeForce RTX 2080 Ti Direct3D11",
    "wasm_4": {
      "e3": "1e-3",
      "e4": "1e-4",
      "e5": "1e-5",
      "e6": "1e-6",
      "e7": "1e-7",
      "e8": "1e-8",
      "error": ""
    },
    "webnn_cpu_4": {
      "e3": "n/a",
      "e4": "n/a",
      "e5": "n/a",
      "e6": "n/a",
      "e7": "n/a",
      "e8": "n/a",
      "error": "Can't create a session. ERROR_CODE: 1, ERROR_MESSAGE: Node 'Resize' OpType:Resize with domain:com.ms.internal.nhwc was inserted using the NHWC format as requested by WebNNExecutionProvider, but was not selected by that EP. This means the graph is now invalid as there will not be an EP able to run the node. This could be a bug in layout transformer, or in the GetCapability implementation of the EP.",
      "max_diff": [
        5.96046447758973e-8,
        5.960464477539865e-8,
        5.960464477539616e-8
      ]
    },
    "webgl": {
      "e3": "fail",
      "e4": "fail",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        1.0000000596046448,
        1.0000000596046448,
        1.0000000596046448
      ]
    },
    "webgpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "pass",
      "e7": "pass",
      "e8": "fail",
      "error": "",
      "max_diff": [
        5.960479321975778e-8,
        5.960476901692294e-8,
        5.960475240266984e-8
      ]
    },
    "webnn_gpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "pass",
      "e7": "pass",
      "e8": "fail",
      "error": "",
      "max_diff": [
        5.960479380299078e-8,
        5.960476954727399e-8,
        5.96047522979969e-8
      ]
    }
  },
  {
    "name": "emotion_ferplus",
    "gpu": "NVIDIA GeForce RTX 2080 Ti Direct3D11",
    "wasm_4": {
      "e3": "1e-3",
      "e4": "1e-4",
      "e5": "1e-5",
      "e6": "1e-6",
      "e7": "1e-7",
      "e8": "1e-8",
      "error": ""
    },
    "webnn_cpu_4": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "Can't create a session. ERROR_CODE: 1, ERROR_MESSAGE: Node 'Resize' OpType:Resize with domain:com.ms.internal.nhwc was inserted using the NHWC format as requested by WebNNExecutionProvider, but was not selected by that EP. This means the graph is now invalid as there will not be an EP able to run the node. This could be a bug in layout transformer, or in the GetCapability implementation of the EP.",
      "max_diff": [
        0.0000011920928955078125,
        9.685754776000977e-7,
        9.5367431640625e-7
      ]
    },
    "webgl": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.0000016689300537109375,
        0.0000016689300537109375,
        4.76837158203125e-7
      ]
    },
    "webgpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.0000016689300537109375,
        0.0000010728836059570312,
        9.685754776000977e-7
      ]
    },
    "webnn_gpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "pass",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        6.556510925292969e-7,
        4.954636096954346e-7,
        4.76837158203125e-7
      ]
    }
  },
  {
    "name": "realesrgan_x4_64_fp32",
    "gpu": "NVIDIA GeForce RTX 2080 Ti Direct3D11",
    "wasm_4": {
      "e3": "1e-3",
      "e4": "1e-4",
      "e5": "1e-5",
      "e6": "1e-6",
      "e7": "1e-7",
      "e8": "1e-8",
      "error": ""
    },
    "webnn_cpu_4": {
      "e3": "n/a",
      "e4": "n/a",
      "e5": "n/a",
      "e6": "n/a",
      "e7": "n/a",
      "e8": "n/a",
      "error": "Can't create a session. ERROR_CODE: 1, ERROR_MESSAGE: Node 'Resize' OpType:Resize with domain:com.ms.internal.nhwc was inserted using the NHWC format as requested by WebNNExecutionProvider, but was not selected by that EP. This means the graph is now invalid as there will not be an EP able to run the node. This could be a bug in layout transformer, or in the GetCapability implementation of the EP.",
      "max_diff": []
    },
    "webgl": {
      "e3": "n/a",
      "e4": "n/a",
      "e5": "n/a",
      "e6": "n/a",
      "e7": "n/a",
      "e8": "n/a",
      "error": "Failed to compile shader: \nShader source:\n#version 300 es\n    precision highp float;\n    precision highp int;\n    precision highp sampler2D;\n    in vec2 TexCoords;\n    out vec4 outputColor;\n    const vec2 halfCR = vec2(0.5, 0.5);\n\n    // Custom vector types to handle higher dimenalities.\n    struct ivec5\n    {\n      int x;\n      int y;\n      int z;\n      int w;\n      int u;\n    };\n\n    struct ivec6\n    {\n      int x;\n      int y;\n      int z;\n      int w;\n      int u;\n      int v;\n    };\n\n    int imod(int x, int y) {\n      return x - y * (x / y);\n    }\n\n    \n    uniform sampler2D Im2Col;\nuniform sampler2D K;\nuniform sampler2D B;\n    \n      vec2 offsetToCoords(int offset, int width, int height) {\n        int t = offset / width;\n        int s = offset - t*width;\n        vec2 coords = (vec2(s,t) + vec2(0.5,0.5)) / vec2(width, height);\n        return coords;\n      }\n      \n\n      int coordsToOffset(vec2 coords, int width, int height) {\n        float s = coords.s * float(width);\n        float t = coords.t * float(height);\n        int offset = int(t) * width + int(s);\n        return offset;\n      }\n      \n\n      void toVec(vec2 texCoords, out int c[4]) {\n        int offset = coordsToOffset(texCoords, 4096, 64);\n        \n        c[0] = offset / 262144;\n        offset -= c[0] * 262144;\n        c[1] = offset / 4096;\n        offset -= c[1] * 4096;\n        c[2] = offset / 64;\n        offset -= c[2] * 64;\n        c[3] = offset;\n      }\n      void toVec(int offset, out int c[4]) {\n        \n        c[0] = offset / 262144;\n        offset -= c[0] * 262144;\n        c[1] = offset / 4096;\n        offset -= c[1] * 4096;\n        c[2] = offset / 64;\n        offset -= c[2] * 64;\n        c[3] = offset;\n      }\n    \n\n      int indicesToOffset_B(int indices[1]) {\n        int offset = 0;\n        \n        offset += indices[0] * 1;\n        \n        return offset;\n      }\n      \nhighp float decode(highp vec4 rgba) {\n        return rgba.r;\n      }\n        \n\n        float getColorAsFloat(vec4 color) {\n            return decode(color);\n        }\n        \n\n        float _B(int m[1]) {\n          int offset = indicesToOffset_B(m);\n          vec2 coords = offsetToCoords(offset, 1, 64);\n          float value = getColorAsFloat(texture(B, coords));\n          return value;\n        }\n        \n\n    \n\nfloat process(int indices[4]) {\n  int b[1];\n  b[0] = indices[1];\n  int im2col[4];\n  im2col[0] = indices[0];\n  im2col[1] = indices[2];\n  im2col[2] = indices[3];\n  int im2colOffset = im2col[0] * 589824 + im2col[1] * 9216 + im2col[2] * 144;\n  int kernelOffset = indices[1] * 144;\n  float value = _B(b);\n  for (int i = 0; i < 144; ++i) {\n    vec2 im2colCoords = offsetToCoords(im2colOffset, 144, 4096);\n    vec2 kernelCoords = offsetToCoords(kernelOffset, 144, 64);\n    value += dot(texture(Im2Col, im2colCoords), texture(K, kernelCoords));\n    ++im2colOffset;\n    ++kernelOffset;\n  }\n  \n  return value;\n}\n      \n  void main() {\n    int indices[4];\n    toVec(TexCoords, indices);\n    vec4 result = vec4(process(indices));\n    outputColor = result;\n  }\n  ",
      "max_diff": []
    },
    "webgpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "pass",
      "e7": "pass",
      "e8": "pass",
      "error": "",
      "max_diff": [
        null,
        null,
        null
      ]
    },
    "webnn_gpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "pass",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000005304813385009766,
        0.000005066394805908203,
        0.000005066394805908203
      ]
    }
  },
  {
    "name": "tinyyolo_v2",
    "gpu": "NVIDIA GeForce RTX 2080 Ti Direct3D11",
    "wasm_4": {
      "e3": "1e-3",
      "e4": "1e-4",
      "e5": "1e-5",
      "e6": "1e-6",
      "e7": "1e-7",
      "e8": "1e-8",
      "error": ""
    },
    "webnn_cpu_4": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "Failed to execute 'buildSync' on 'MLGraphBuilder': XNNPACK only supports constant padding mode.",
      "max_diff": [
        0.0000209808349609375,
        0.000019073486328125,
        0.000018358230590820312
      ]
    },
    "webgl": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "cannot resolve operator 'Crop' with opsets: ai.onnx v7",
      "max_diff": [
        0.000010930001735687256,
        0.00000959634780883789,
        0.00000903010368347168
      ]
    },
    "webgpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "max_diff": [
        0.00002193450927734375,
        0.00002002716064453125,
        0.00001895427703857422
      ]
    },
    "webnn_gpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000010132789611816406,
        0.000010132789611816406,
        0.000010132789611816406
      ]
    }
  },
  {
    "name": "detr_resnet_50",
    "gpu": "NVIDIA GeForce RTX 2080 Ti Direct3D11",
    "wasm_4": {
      "e3": "1e-3",
      "e4": "1e-4",
      "e5": "1e-5",
      "e6": "1e-6",
      "e7": "1e-7",
      "e8": "1e-8",
      "error": ""
    },
    "webnn_cpu_4": {
      "e3": "n/a",
      "e4": "n/a",
      "e5": "n/a",
      "e6": "n/a",
      "e7": "n/a",
      "e8": "n/a",
      "error": "Failed to execute 'buildSync' on 'MLGraphBuilder': Resample2d only supports Linear mode.",
      "max_diff": []
    },
    "webgl": {
      "e3": "n/a",
      "e4": "n/a",
      "e5": "n/a",
      "e6": "n/a",
      "e7": "n/a",
      "e8": "n/a",
      "error": "Cannot read properties of null (reading 'irVersion')",
      "max_diff": []
    },
    "webgpu": {
      "e3": "fail",
      "e4": "fail",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        3.7048935890197754,
        3.1106033325195312,
        2.7789793014526367
      ]
    },
    "webnn_gpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.00008869171142578125,
        0.00008487701416015625,
        0.00008106231689453125
      ]
    }
  },
  {
    "name": "whisper_tiny_decoder",
    "gpu": "NVIDIA GeForce RTX 2080 Ti Direct3D11",
    "wasm_4": {
      "e3": "1e-3",
      "e4": "1e-4",
      "e5": "1e-5",
      "e6": "1e-6",
      "e7": "1e-7",
      "e8": "1e-8",
      "error": ""
    },
    "webnn_cpu_4": {
      "e3": "n/a",
      "e4": "n/a",
      "e5": "n/a",
      "e6": "n/a",
      "e7": "n/a",
      "e8": "n/a",
      "error": "Failed to execute 'buildSync' on 'MLGraphBuilder': XNNPACK can't support keep dimensions.",
      "max_diff": []
    },
    "webgl": {
      "e3": "n/a",
      "e4": "n/a",
      "e5": "n/a",
      "e6": "n/a",
      "e7": "n/a",
      "e8": "n/a",
      "error": "Cannot read properties of null (reading 'irVersion')",
      "max_diff": []
    },
    "webgpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.000034332275390625,
        0.0000286102294921875,
        0.0000286102294921875
      ]
    },
    "webnn_gpu": {
      "e3": "pass",
      "e4": "pass",
      "e5": "fail",
      "e6": "fail",
      "e7": "fail",
      "e8": "fail",
      "error": "",
      "max_diff": [
        0.0000286102294921875,
        0.000026702880859375,
        0.0000247955322265625
      ]
    }
  }
]