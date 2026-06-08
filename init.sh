#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd frontend

export CI=true
echo "Running npm install..."
npm install --no-fund --no-audit --loglevel error > npm_install.log 2>&1

echo "Installing Tailwind CSS..."
npm install -D tailwindcss postcss autoprefixer --no-fund --no-audit --loglevel error > tailwind.log 2>&1
npx tailwindcss init -p > tailwind_init.log 2>&1

echo "Installing axios..."
npm install axios --no-fund --no-audit --loglevel error > axios.log 2>&1

echo "Done dependencies."
