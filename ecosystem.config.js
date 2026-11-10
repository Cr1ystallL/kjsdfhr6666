module.exports = {
  apps: [
    {
      name: 'macvcoin-server',
      cwd: './server',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'macvcoin-bot',
      cwd: './bot',
      script: 'bot.py',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M'
    }
  ]
};
