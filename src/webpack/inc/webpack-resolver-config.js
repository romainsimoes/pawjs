const fs = require('fs');
const path = require('path');

const babelServer = require('./babel-server-rule')({
  cacheDirectory: false,
}).use.options;

require('@babel/register')({
  presets: babelServer.presets.default ? babelServer.presets.default : babelServer.presets,
  plugins: babelServer.plugins,
  cache: false,
  ignore: [
    /node_modules\/(?!(@pawjs|pawjs-)).*/,
  ],
});
const CliHandler = require('../../../scripts/cli').default;

if (!process.env.PROJECT_ROOT) {
  // eslint-disable-next-line
  const cli = new CliHandler();
}
const directories = require('../utils/directories');

const emptyClass = path.resolve(process.env.LIB_ROOT, 'src', 'webpack', 'utils', 'emptyClass.js');
const projectClientPath = `${process.env.PROJECT_ROOT}/src/client.js`;
const projectClientExists = fs.existsSync(projectClientPath);

const projectServerPath = `${process.env.PROJECT_ROOT}/src/server.js`;
const projectServerExists = fs.existsSync(projectServerPath);

const commonResolvers = [
  'node_modules',
  path.resolve(path.join(directories.root, 'node_modules')),
];

if (
  process.env.LIB_ROOT !== process.cwd()
  && process.env.LIB_ROOT !== path.resolve(process.cwd(), '..')
) {
  if (fs.existsSync(path.join(process.env.LIB_ROOT, 'node_modules'))) {
    commonResolvers.push(path.join(process.env.LIB_ROOT, 'node_modules'));
  }

  if (fs.existsSync(path.join(process.env.LIB_ROOT, '..', 'node_modules'))) {
    commonResolvers.push(path.join(process.env.LIB_ROOT, '..', 'node_modules'));
  }

  if (fs.existsSync(path.join(process.env.LIB_ROOT, '..', '..', 'node_modules'))) {
    commonResolvers.push(path.join(process.env.LIB_ROOT, '..', '..', 'node_modules'));
  }

  if (fs.existsSync(path.join(process.env.LIB_ROOT, '..', '..', '..', 'node_modules'))) {
    commonResolvers.push(path.join(process.env.LIB_ROOT, '..', '..', '..', 'node_modules'));
  }
}

const loaderResolver = commonResolvers.slice(0);
loaderResolver.push(path.join(process.env.LIB_ROOT, 'src', 'webpack', 'loaders'));

const processDir = process.cwd();
let projectRoot = process.env.PROJECT_ROOT || process.env.PROJECT_ROOT || (processDir + path.sep);
projectRoot = path.isAbsolute(projectRoot) ? projectRoot : path.resolve(processDir, projectRoot);


const resolver = {
  resolve: {
    alias: {
      pawjs: path.resolve(path.join(process.env.LIB_ROOT)),
      pawProjectClient: projectClientExists ? projectClientPath : emptyClass,
      pawProjectServer: projectServerExists ? projectServerPath : emptyClass,
      'react-router-dom': path.join(projectRoot, 'node_modules', '@pawjs', 'pawjs', 'node_modules', 'react-router-dom')
    },
    modules: commonResolvers,
    extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx', '.ts', '.tsx'],
  },
  resolveLoader: {
    modules: loaderResolver,
  },
};
module.exports = resolver;
