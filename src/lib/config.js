export const siteTitle = "Web AI Benchmark";
export const siteDescription = "";
export const siteURL = "";

export let environment = {
  cpu: null,
  logicCores: 0,
  gpu: null,
  os: null,
  osVersion: null,
  webbrowser: null,
  browserVersion: null,
  onnxruntimeweb: 1.16
};

export const localhost = '10.239.115.52:5173';

export const corsSites = [
  'ibelem.github.io',
  'webai.run',
  'ai-benchmark.vercel.app'
]

export const ortDists = {
  public: 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js',
  webgpu: '../ort/1.17/web/webgpu/ort.webgpu.min.js',
  webnn_webglfix: 'https://ibelem.github.io/onnxruntime-web-dist/1.16_20/ort.min.js'
}

export const modelHosts = {
  hf: 'https://huggingface.co/webml/models/resolve/main/',
  cf: 'https://d3i5xkfad89fac.cloudfront.net/benchmark/',
  local: 'models/'
}

export const uniqueBackends = [
  'wasm_1',
  'wasm_4',
  'webgl',
  'webgpu',
  'webnn_cpu_1',
  'webnn_cpu_4',
  'webnn_gpu',
  'webnn_npu'
];

export let models = [
  {
    category: 'Model Access Check',
    id: 'model_access_check',
    name: 'Model Access Check',
    description: '',
    source: '',
    model: '01.onnx'
  },
  {
    category: 'Image Classification',
    id: 'efficientnet_lite',
    name: 'EfficientNet Lite 4',
    description: 'A convolutional neural network architecture and scaling method',
    source: 'https://github.com/onnx/models/raw/main/vision/classification/efficientnet-lite4/model/efficientnet-lite4-11.onnx',
    model: 'efficientnet-lite4-11.onnx',
    size: '49.5 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{ 'images:0': ['float32', 'random', [1, 224, 224, 3], {}] }]
  },
  {
    category: 'Image Classification',
    id: 'mobilenet_v2',
    name: 'MobileNet v2_10',
    description: 'A computer vision model designed for training classifiers',
    source: 'https://github.com/onnx/models/raw/main/vision/classification/mobilenet/model/mobilenetv2-10.onnx',
    model: 'mobilenetv2-10.onnx',
    size: '13.3 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{ 'input': ['float32', 'random', [1, 3, 224, 224], { "batch_size": 1 }] }]
  },
  {
    category: 'Image Classification',
    id: 'mobilenet_v2_12',
    name: 'MobileNet v2_12',
    description: 'A computer vision model designed for training classifiers',
    source: 'https://github.com/onnx/models/raw/main/vision/classification/mobilenet/model/mobilenetv2-12.onnx',
    model: 'mobilenetv2-12.onnx',
    size: '13.3 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{ 'input': ['float32', 'random', [1, 3, 224, 224], { "batch_size": 1 }] }]
  },
  {
    category: 'Image Classification',
    id: 'mobilenet_v2_12_int8',
    name: 'MobileNet v2_12',
    description: 'A computer vision model designed for training classifiers',
    source: 'https://github.com/onnx/models/tree/main/vision/classification/mobilenet',
    model: 'mobilenetv2-12-int8.onnx',
    size: '13.3 MB',
    format: 'onnx',
    datatype: 'int8',
    inputs: [{ 'input': ['float32', 'random', [1, 3, 224, 224], { "batch_size": 1 }] }]
  },
  // {
  //   category: 'Image Classification',
  //   id: 'mobilenet_v2',
  //   name: 'MobileNet v2',
  //   source: '',
  //   model: '',
  //   format: 'npy',
  //   datatype: 'fp32',
  //   inputs: {
  //     value: { 'input': ['float32', 'random', [1, 3, 224, 224]] },
  //     batch: { "batch_size": 1 }
  //   }
  // },
  // {
  //   category: 'Image Classification',
  //   id: 'mobilenet_v2',
  //   name: 'MobileNet v2',
  //   source: '',
  //   model: '',
  //   format: 'pt',
  //   datatype: 'fp32',
  //   inputs: {
  //     value: { 'input': ['float32', 'random', [1, 3, 224, 224]] },
  //     batch: { "batch_size": 1 }
  //   }
  // },
  {
    category: 'Image Classification',
    id: 'resnet50_v1',
    name: 'ResNet50 v1',
    description: 'A convolutional neural network that is 50 layers deep',
    source: 'https://github.com/onnx/models/raw/main/vision/classification/resnet/model/resnet50-v1-12.onnx',
    model: 'resnet50-v1-12.onnx',
    size: '97.8 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{ 'data': ['float32', 'random', [1, 3, 224, 224], { "N": 1 }] }]
  },
  {
    category: 'Image Classification',
    id: 'resnet50_v2',
    name: 'ResNet50 v2',
    description: 'A convolutional neural network that is 50 layers deep',
    source: 'https://github.com/onnx/models/raw/main/vision/classification/resnet/model/resnet50-v2-7.onnx',
    model: 'resnet50-v2-7.onnx',
    size: '97.7 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{ 'data': ['float32', 'random', [1, 3, 224, 224], { "N": 1 }] }]
  },
  {
    category: 'Image Classification',
    id: 'squeezenet',
    name: 'SqueezeNet 1.1',
    description: 'A deep convolutional neural network (CNN) perform image classification',
    source: 'https://github.com/onnx/models/raw/main/vision/classification/squeezenet/model/squeezenet1.1-7.onnx',
    model: 'squeezenet1.1-7.onnx',
    size: '4.72 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{ 'data': ['float32', 'random', [1, 3, 224, 224], {}] }]
  },
  {
    category: 'Image Classification',
    id: 'densenet',
    name: 'DenseNet 121',
    description: 'A type of convolutional neural network that utilises dense connections between layers',
    source: 'https://github.com/onnx/models/blob/main/vision/classification/densenet-121/model/densenet-9.onnx',
    model: 'densenet-9.onnx',
    size: '31.2 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{ 'data_0': ['float32', 'random', [1, 3, 224, 224], {}] }]
  },
  {
    category: 'Semantic Segmentation',
    id: 'deeplab_v3',
    name: 'DeepLab v3',
    description: 'A series of deep learning architectures designed to tackle the problem of semantic segmentation',
    source: 'ftlite converted',
    model: 'deeplab-mobilenetv2.onnx',
    size: '8.46 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{ 'sub_7': ['float32', 'random', [1, 513, 513, 3], {}] }]
  },
  {
    category: 'Face Analysis',
    id: 'emotion_ferplus',
    name: 'Emotion FERPlus',
    description: 'A deep convolutional neural network for emotion recognition in faces',
    source: 'https://github.com/onnx/models/raw/main/vision/body_analysis/emotion_ferplus/model/emotion-ferplus-8.onnx',
    model: 'emotion-ferplus-8.onnx',
    size: '35 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{ 'Input3': ['float32', 'random', [1, 1, 64, 64], {}] }]
  },
  {
    category: 'Style Transfer',
    id: 'fns_candy',
    name: 'FNS Candy',
    description: 'A style transfer model to re-style images or video streams',
    source: 'https://github.com/microsoft/Windows-Machine-Learning/raw/master/Samples/CustomTensorization/CustomTensorization/fns-candy.onnx',
    model: 'fns-candy.onnx',
    size: '1.63 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{ 'inputImage': ['float32', 'random', [1, 3, 720, 720], { 'None': 1 }] }]
  },
  {
    category: 'Object Detection',
    id: 'tinyyolo_v2',
    name: 'Tiny YOLO v2',
    description: 'A real-time neural network for object detection',
    source: 'https://github.com/onnx/models/raw/main/vision/object_detection_segmentation/tiny-yolov2/model/tinyyolov2-8.onnx',
    model: 'tinyyolov2-8.onnx',
    size: '60.5 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{ 'image': ['float32', 'random', [1, 3, 416, 416], { "None": 1 }] }]
  },
  {
    category: 'Text Generation Transformer',
    id: 'gpt2_decoder',
    name: 'GPT-2 Decoder',
    description: 'A transformers model pretrained on a very large corpus of English data in a self-supervised fashion',
    source: 'https://huggingface.co/gpt2/tree/main/onnx',
    model: 'gpt2-decoder.onnx',
    size: '623 MB',
    format: 'onnx',
    datatype: 'int64',
    inputs: [{
      'input_ids': ['int64', 99n, [1, 8], { "batch_size": 1 }],
      'attention_mask': ['int64', 1n, [1, 8], { "batch_size": 1 }]
    }]
  },
  {
    category: 'Semantic Segmentation',
    id: 'selfie_segmentation_landscape',
    name: 'Selfie Segmentation Landscape',
    description: 'Easily separate the background from users within a scene and focus on what matters',
    source: 'https://storage.googleapis.com/mediapipe-assets/selfie_segmentation.tflite https://github.com/keijiro/SelfieBarracuda',
    model: 'selfie-segmentation-landscape.onnx',
    size: '435 KB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{ 'input_1:0': ['float32', 'random', [1, 144, 256, 3], {}] }]
  },
  // {
  //   category: 'Semantic Segmentation',
  //   id: 'selfie_segmentation_general',
  //   name: 'Selfie Segmentation (General)',
  //   description: 'Easily separate the background from users within a scene and focus on what matters',
  //   source: 'https://storage.googleapis.com/mediapipe-assets/selfie_segmentation.tflite',
  //   model: 'selfie-segmentation.tflite',
  //   size: '',
  //   format: 'tflite',
  //   datatype: 'fp32',
  //   inputs: []
  // },
  {
    category: 'Semantic Segmentation',
    id: 'segment_anything_fp32',
    name: 'Segment Anything',
    description: 'An AI model from Meta AI that can cut out any object in any image',
    source: 'MSFT',
    model: 'segment-anything-vit-h-static-shapes-origin-im-size-initializer-optimized-float32.onnx',
    size: '19.6 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{ 'image_embeddings': ['float32', 'random', [1, 256, 64, 64], {}] },
    { 'point_coords': ['float32', 'random', [1, 2, 2], {}] },
    { 'point_labels': ['float32', 'random', [1, 2], {}] },
    { 'mask_input': ['float32', 'random', [1, 1, 256, 256], {}] },
    { 'has_mask_input': ['float32', 'random', [1], {}] }]
  },
  {
    category: 'Semantic Segmentation Transformer',
    id: 'segment_anything_fp16',
    name: 'Segment Anything',
    description: 'An AI model from Meta AI that can cut out any object in any image',
    source: 'MSFT',
    model: 'segment-anything-vit-h-static-shapes-origin-im-size-initializer-optimized-float16.onnx',
    size: '9.8 MB',
    format: 'onnx',
    datatype: 'fp16',
    inputs: [{ 'image_embeddings': ['float16', 'random', [1, 256, 64, 64], {}] },
    { 'point_coords': ['float16', 'random', [1, 2, 2], {}] },
    { 'point_labels': ['float16', 'random', [1, 2], {}] },
    { 'mask_input': ['float16', 'random', [1, 1, 256, 256], {}] },
    { 'has_mask_input': ['float16', 'random', [1], {}] }]
  },
  {
    category: 'Stable Diffusion 2.1 Transformer',
    id: 'sd_2_1_vae_decoder',
    name: 'SD 2.1 VAE Decoder',
    description: 'Stable Diffusion 2.1 (text-to-image diffusion model)',
    source: 'https://huggingface.co/aislamov/stable-diffusion-2-1-base-onnx/tree/main',
    model: 'sd-2.1-vae-decoder.onnx',
    size: '94.5 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{
      'latent_sample': ['float32', 'random', [1, 4, 64, 64], { "vaedec_sample_batch": 1 }]
    }]
  },
  {
    category: 'Stable Diffusion 2.1 Transformer',
    id: 'sd_2_1_vae_encoder',
    name: 'SD 2.1 VAE Encoder',
    description: 'Stable Diffusion 2.1 (text-to-image diffusion model)',
    source: 'https://huggingface.co/aislamov/stable-diffusion-2-1-base-onnx/tree/main',
    model: 'sd-2.1-vae-encoder.onnx',
    size: '130 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{
      'latent_sample': ['float32', 'random', [1, 4, 64, 64], { "vaedec_sample_batch": 1 }]
    }]
  },
  {
    category: 'Text-To-Text Transfer Transformer',
    id: 't5_small_encoder',
    name: 'T5 Small Encoder',
    description: 'A Text-To-Text transfer transformer model',
    source: 'https://huggingface.co/t5-small/tree/main/onnx',
    model: 't5-small-encoder.onnx',
    size: '134.9 MB',
    format: 'onnx',
    datatype: 'int64',
    inputs: [{ 'input_ids': ['int64', 99n, [1, 128], { "batch_size": 1 }] }, { 'attention_mask': ['int64', 1n, [1, 128], { "batch_size": 1 }] }]
  },
  {
    category: 'Text-To-Text Transfer Transformer',
    id: 't5_small_decoder',
    name: 'T5 Small Decoder',
    description: 'A Text-To-Text transfer transformer model',
    source: 'https://huggingface.co/t5-small/tree/main/onnx',
    model: 't5-small-decoder.onnx',
    size: '221 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{ 'input_ids': ['int64', 99n, [1, 128], { "batch_size": 1 }] }, { 'encoder_hidden_states': ['float32', 'random', [1, 128, 512], { "batch_size": 1 }] }]
  },
  {
    category: 'Speech Recognition Transformer',
    id: 'whisper_tiny_encoder',
    name: 'Whisper Tiny Encoder',
    description: 'A pre-trained model for automatic speech recognition (ASR) and speech translation',
    source: 'https://huggingface.co/Xenova/whisper-tiny.en/tree/main/onnx',
    model: 'whisper-tiny-encoder.onnx',
    size: '31.4 MB',
    format: 'onnx',
    datatype: 'fp32',
    inputs: [{
      'input_features': ['float32', 'random', [1, 80, 3000], { "batch_size": 1 }]
    }]
  },
  {
    category: 'Speech Recognition Transformer',
    id: 'whisper_tiny_decoder',
    name: 'Whisper Tiny Decoder',
    description: 'A pre-trained model for automatic speech recognition (ASR) and speech translation',
    source: 'https://huggingface.co/Xenova/whisper-tiny.en/tree/main/onnx',
    model: 'whisper-tiny-decoder.onnx',
    size: '189 MB',
    format: 'onnx',
    datatype: 'int64',
    inputs: [{
      'input_ids': ['int64', 1n, [1, 1], { "batch_size": 1 }],
      'encoder_hidden_states': ['float32', 'random', [1, 1500, 384], { "batch_size": 1 }]
    }]
  },
  {
    category: 'Multilingual Translation Transformer',
    id: 'm2m100_decoder',
    name: 'M2M100 418M Decoder',
    description: 'A multilingual encoder-decoder (seq-to-seq) model',
    source: 'https://huggingface.co/Xenova/m2m100_418M/tree/main/onnx',
    model: 'm2m100-decoder.onnx',
    size: '1.24GB',
    format: 'onnx',
    datatype: 'int64',
    inputs: [{
      'input_ids': ['int64', 99n, [1, 128], { "batch_size": 1 }],
      'encoder_attention_mask': ['int64', 1n, [1, 128], { "batch_size": 1 }],
      'encoder_hidden_states': ['float32', 1, [1, 128, 1024], { "batch_size": 1 }]
    }]
  },
  {
    category: 'Multilingual Translation Transformer',
    id: 'm2m100_encoder',
    name: 'M2M100 418M Encoder',
    description: 'A multilingual encoder-decoder (seq-to-seq) model',
    source: 'https://huggingface.co/Xenova/m2m100_418M/tree/main/onnx',
    model: 'm2m100-encoder.onnx',
    size: '1.05GB',
    format: 'onnx',
    datatype: 'int64',
    inputs: [{
      'input_ids': ['int64', 99n, [1, 128], { "batch_size": 1 }],
      'attention_mask': ['int64', 1n, [1, 128], { "batch_size": 1 }],
    }]
  },
];

export const gpu = [
  "Intel Arc A770 (16GB)",
  "Intel Arc A770 (8GB)",
  "Intel Arc A770M (16GB)",
  "Intel Arc A750 (8GB)",
  "Intel Arc A730M (12GB)",
  "Intel Arc A570M (8GB)",
  "Intel Arc A550M (8GB)",
  "Intel Arc A530M (4/8GB)",
  "Intel Arc A370M (4GB)",
  "Intel Arc A350M (4GB)",
  "Intel Arc A310 (4GB)",
  "Intel Arc Pro A60(12GB)",
  "Intel Arc Pro A60M(8GB)",
  "Intel Arc Pro A50(6GB)",
  "Intel Arc Pro A40(6GB)",
  "Intel Arc Pro A30M(4GB)",
  "Nvidia GeForce RTX 4090",
  "Nvidia GeForce RTX 4080",
  "Nvidia GeForce RTX 4070 Ti",
  "Nvidia GeForce RTX 4070",
  "Nvidia GeForce RTX 4060 Ti",
  "Nvidia GeForce RTX 4060",
  "Nvidia GeForce RTX 3090 Ti",
  "Nvidia GeForce RTX 3090",
  "Nvidia GeForce RTX 3080 Ti",
  "Nvidia GeForce RTX 3080",
  "Nvidia GeForce RTX 3070 Ti",
  "Nvidia GeForce RTX 3070",
  "Nvidia GeForce RTX 3060 Ti",
  "Nvidia GeForce RTX 3060",
  "Nvidia GeForce RTX 3050"];