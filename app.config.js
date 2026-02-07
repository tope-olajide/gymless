// Dynamic Expo configuration
// Extends app.json and makes environment variables accessible via Constants

export default ({ config }) => {
    return {
        ...config,
        extra: {
            ...config.extra,
            geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
            env: process.env.EXPO_PUBLIC_ENV || 'development',
        },
    };
};
