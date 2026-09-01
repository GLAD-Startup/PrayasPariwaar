// PM2 Process Manager Configuration for Windows Server
// Usage:
// 1. Build: npm run web:build
// 2. Start: pm2 start ecosystem.config.js
// 3. Save:  pm2 save

module.exports = {
  apps: [
    {
      name: "prayas-web-3005",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3005",
      cwd: "./apps/web",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3005,
      },
    },
  ],
};
