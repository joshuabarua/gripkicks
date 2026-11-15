const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const convexDir = path.resolve(__dirname, '../../convex');

config.resolver.sourceExts.push('cjs');
// better-auth (and other modern packages) expose subpaths only through package.json "exports".
config.resolver.unstable_enablePackageExports = true;
// Metro only bundles watched files; the monorepo defaults skip the root convex/ folder.
config.watchFolders = [...(config.watchFolders ?? []), convexDir];

// `convex/_generated/*` is the repo's Convex folder, not the `convex` npm
// package (which owns `convex/react`, `convex/server`, ...).
const defaultResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('convex/_generated/')) {
    const target = path.join(convexDir, moduleName.slice('convex/'.length));
    return context.resolveRequest(context, target, platform);
  }
  return (defaultResolve ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
