// PM2 Process Manager Configuration for Windows Server
// Usage:
// 1. Build: npm run web:build
// 2. Start: pm2 start ecosystem.config.js
// 3. Save:  pm2 save

const path = require("path");

module.exports = {
  apps: [
    {
      name: "prayas-web-3005",
      script: path.resolve(__dirname, "node_modules/next/dist/bin/next"),
      args: "start -p 3005",
      cwd: path.resolve(__dirname, "apps/web"),
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3005,
        NEXT_PUBLIC_BASE_PATH: "/prayas",
        NEXT_PUBLIC_APP_URL: "https://gladstudio.net/prayas",
        NEXT_PUBLIC_API_URL: "https://gladstudio.net/prayas/api",
        EXPO_PUBLIC_API_URL: "https://gladstudio.net/prayas/api",
        GOOGLE_CLIENT_ID: "258806422821-dme2jv73q5cn9ehk8d01i58324qp8n9r.apps.googleusercontent.com",
        GOOGLE_CLIENT_SECRET: "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",
      },
    },
  ],
};
