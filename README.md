
# 🏋️ Gymless: Your AI-Powered Home Fitness Coach

**No Gym. No Equipment. No Trainer. Just You and AI.**

Gymless is a revolutionary AI-powered home fitness application that delivers real-time, personalized workout guidance using advanced computer vision and generative AI. It transforms your living room into a high-tech training studio, helping you train safely and effectively without the cost and complexity of traditional fitness solutions.

---

## 🔴 The Problem

At-home workouts often fail because of three primary barriers:
1.  **Cost**: Personal trainers and premium gym equipment are expensive.
2.  **Safety**: Without guidance, users often perform exercises with poor form, leading to chronic injuries.
3.  **Static Guidance**: Traditional apps rely on prerecorded, static video loops that don't know if you're actually doing the work—or doing it right.

## ✨ The Solution: Intelligent Coaching

Gymless breaks these barriers by providing an **Agentic AI Coach** that watches, learns, and guides.

-   **Real-Time Movement Analysis**: Unlike static apps, Gymless uses on-device camera feeds to count reps, evaluate form, and provide instant corrective feedback.
-   **Gemini 3 Flash (Agentic Vision)**: Powered by the latest Gemini 3 Flash model, the AI reasons over your movement to deliver technical coaching cues that feel like a real personal trainer.
-   **Privacy-First Architecture**: Zero video footage ever leaves your device. All pose detection happens locally, ensuring 100% privacy and zero-latency feedback.
-   **Safety Priority System**: Our priority-based messaging elevates critical form and injury-prevention cues above non-urgent feedback, ensuring yoursafety even under high-intensity training.
-   **Fully Personalized**: Adaptive onboarding captures your goals (fat loss, glute growth, etc.), experience level, and physical limitations to tailor every session.

---

## 🚀 Get Started

Make it dead simple to test the app:

### 1. Prerequisites
- Node.js & npm
- Android Studio (for emulator or device testing)
- [Expo Go](https://expo.dev/go) or a Development Client

### 2. Environment Setup (Testing Only)
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```
> [!IMPORTANT]
> The `.env` file is for **local testing and development only**. In production, API keys are handled securely via Firebase.
> [!TIP]
>  If you don't want to mess with `.env` files, you can enter your Gemini API Key directly in the **App Settings** once the app is running!

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Clean and prebuild native modules (Crucial for MediaPipe/Vision Camera)
npx expo prebuild --clean

# Run on Android
npx expo run:android
```

---

## 🛠️ Technical Stack

-   **Framework**: React Native / Expo (New Architecture / Turbo Modules)
-   **AI Core**: Gemini 3 Flash (beta) via Google Generative AI SDK
-   **Computer Vision**: MediaPipe Pose Detection / TensorFlow Lite
-   **Graphics**: Shopify React Native Skia (Real-time Skeleton Overlay)
-   **Camera**: React Native Vision Camera v4
-   **Animation**: React Native Reanimated

## 🧠 How it Works

1.  **On-Device Detection**: MediaPipe processes 33 pose landmarks locally at high FPS.
2.  **Multimodal Reasoning**: Key frames are analyzed by Gemini 3 Flash to understand the *nuance* of the movement.
3.  **Dynamic HUD**: A React Native Skia overlay provides real-time skeletal feedback (Green = Good, Red = Correction Needed).
4.  **Audio Coaching**: `expo-speech` delivers verbal cues and rep counts so you don't have to keep staring at the screen.

---

## 🔒 Privacy

Privacy isn't a feature; it's the foundation. Gymless architecture is designed so that **no image or video data is ever stored or uploaded to any server.** The AI only processes mathematical point coordinates and temporary frame buffers that are purged immediately after analysis.

---
=

Made with ❤️ by [Temitope Olajide]
