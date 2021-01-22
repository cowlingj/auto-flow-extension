#!/usr/bin/env sh
chokidar "**/*" -i ".git/**/*" -i "node_modules/**/*" -i ".parcel-cache/**/*" -i "extension/dist/**/*" -c "npm run $@" --initial