const fs = require('fs');
const path = require('path');

const venvPython = path.resolve(__dirname, 'venv/bin/python');
const pythonInterpreter = fs.existsSync(venvPython) ? venvPython : 'python3';

module.exports = {
  apps: [
    {
      name: 'macvcoin-server',
      cwd: path.resolve(__dirname, 'server'),
      script: 'dist/index.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 30,
      restart_delay: 3000,
      min_uptime: '10s',
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'macvcoin-bot',
      cwd: path.resolve(__dirname, 'bot'),
      script: 'bot.py',
      interpreter: pythonInterpreter,
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 30,
      restart_delay: 3000,
      min_uptime: '10s',
      max_memory_restart: '300M',
      env: {
        PYTHONIOENCODING: 'utf-8',
        PYTHONUTF8: '1',
        LANG: 'C.UTF-8',
        LC_ALL: 'C.UTF-8'
      }
    }
  ]
};
