const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const convexDir = path.resolve(__dirname, '../../convex');

config.resolver.sourceExts.push('cjs');
// 3D models for the Home hero.
config.resolver.assetExts.push('glb');
// better-auth (and other modern packages) expose subpaths only through package.json "exports".
config.resolver.unstable_enablePackageExports = true;
// Metro only bundles watched files; the monorepo defaults skip the root convex/ folder.
config.watchFolders = [...(config.watchFolders ?? []), convexDir];
// The app keeps its own React 19.3 in packages/app/node_modules; the web app's
// React sits at the repo root. Always resolve the app's copy first.
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../../node_modules'),
];

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
