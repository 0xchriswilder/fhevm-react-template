const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for Node.js modules that shouldn't be bundled
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "util": false,
        "path": false,
        "fs": false,
        "buffer": false,
        "crypto": false,
        "stream": false,
        "os": false,
        "net": false,
        "tls": false,
        "child_process": false,
        "worker_threads": false,
        "perf_hooks": false,
        "async_hooks": false,
        "cluster": false,
        "dgram": false,
        "dns": false,
        "http": false,
        "https": false,
        "http2": false,
        "querystring": false,
        "url": false,
        "zlib": false,
        "readline": false,
        "repl": false,
        "vm": false,
        "v8": false,
        "inspector": false,
        "trace_events": false,
        "assert": false,
        "events": false,
        "punycode": false,
        "string_decoder": false,
        "timers": false,
        "tty": false,
        "constants": false,
        "domain": false,
        "process": false,
        "module": false,
        "require": false,
        "global": false,
        "Buffer": false,
        "__dirname": false,
        "__filename": false,
        "console": false,
        "setImmediate": false,
        "clearImmediate": false,
        "setTimeout": false,
        "clearTimeout": false,
        "setInterval": false,
        "clearInterval": false
      };

      // Ignore Vue imports in React showcase (Vue adapters are not used)
      const path = require('path');
      
      // Ignore vue imports from @fhevm-sdk
      webpackConfig.plugins = webpackConfig.plugins || [];
      webpackConfig.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^vue$/,
          contextRegExp: /@fhevm-sdk/
        })
      );

      // Only externalize Node.js specific modules, not browser-compatible ones
      webpackConfig.externals = webpackConfig.externals || [];
      webpackConfig.externals.push({
        '@zama-fhe/relayer-sdk/node': 'commonjs @zama-fhe/relayer-sdk/node'
        // Note: ethers is browser-compatible, so we bundle it instead of externalizing
      });

      // Ensure proper module resolution order to prevent multiple React instances
      // Don't use aliases for React as it breaks subpath imports (react/jsx-dev-runtime, react-dom/client)
      // Instead, ensure node_modules resolution prioritizes the app's node_modules
      webpackConfig.resolve = webpackConfig.resolve || {};
      
      // Alias vue to empty module to prevent resolution errors from @fhevm-sdk
      // This ensures any 'vue' import resolves to an empty stub instead of failing
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'vue': path.resolve(__dirname, 'src/vue-empty.js')
      };
      
      webpackConfig.resolve.modules = [
        path.resolve(__dirname, 'node_modules'), // Prioritize app's node_modules
        ...(webpackConfig.resolve.modules || ['node_modules']),
        'node_modules'
      ];

      // Ensure symlinks are resolved to prevent duplicate React instances
      webpackConfig.resolve.symlinks = true;

      return webpackConfig;
    },
  },
};
