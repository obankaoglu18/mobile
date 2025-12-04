const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

console.log('Loading Metro Config...');
console.log('Project Root:', projectRoot);
console.log('Workspace Root:', workspaceRoot);

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies to a single version
// config.resolver.disableHierarchicalLookup = true;

config.resolver.extraNodeModules = new Proxy(
    {},
    {
        get: (target, name) => {
            // Redirect any module resolution to the workspace root
            return path.join(workspaceRoot, 'node_modules', name);
        },
    },
);

module.exports = config;
