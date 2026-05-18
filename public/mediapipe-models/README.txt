MediaPipe Model Assets
======================

This folder must contain the following files before running the app.
These files are NOT included in the repository (they are too large).

Download instructions: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker

Required files
--------------

wasm/
  vision_wasm_internal.wasm
  vision_wasm_internal.js
  vision_wasm_nosimd_internal.wasm
  vision_wasm_nosimd_internal.js

pose_landmarker_lite.task   (pose landmark model file)

How to get the WASM files
--------------------------
Option A: Copy from the npm package after install:
  cp -r node_modules/@mediapipe/tasks-vision/wasm/* public/mediapipe-models/wasm/

Option B: Download from the MediaPipe CDN:
  https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm/

How to get the model file
--------------------------
Download from:
  https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task

Place it at:
  public/mediapipe-models/pose_landmarker_lite.task

Notes
-----
- The app code (src/lib/pose.ts) expects these files to be served at /mediapipe-models/
- Without these files, pose detection will fail at runtime (lazy-loaded on first use)
- A future task may automate the download via a setup script
