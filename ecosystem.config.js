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
      cwd: path.resolve(__dirname, 'bot'),
      script: 'bot.py',
      interpreter: pythonInterpreter,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        PYTHONIOENCODING: 'utf-8',
        PYTHONUTF8: '1'
      }
    }
  ]
};
