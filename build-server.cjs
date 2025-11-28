const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// Ensure dist directories exist
const serverDist = path.join(__dirname, 'server/dist');
const electronDist = path.join(__dirname, 'electron/dist');

[serverDist, electronDist].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Build Server
esbuild.build({
    entryPoints: ['server/index.cjs'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'server/cfg/server.cjs',
    outfile: 'server/cfg/server.cjs',
    external: ['electron'],
    loader: { '.node': 'file' },
    loader: { '.node': 'file' },
}).catch(() => process.exit(1));

// Build Main Process
esbuild.build({
    entryPoints: ['electron/main.cjs'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'electron/dist/main.cjs',
    external: ['electron'],
}).catch(() => process.exit(1));

// Copy db_config.json if it exists (it might not in dev, but good to have logic)
// In production, we might want to copy a default or let the app create it.
// The app logic handles missing config.

console.log('Server built successfully!');
