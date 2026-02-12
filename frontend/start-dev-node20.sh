#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd /home/purelogics-3529/Desktop/topskill-lms/frontend
nvm use 20
export PATH="$HOME/.nvm/versions/node/v20.20.0/bin:$PATH"
node -v
npm run dev
