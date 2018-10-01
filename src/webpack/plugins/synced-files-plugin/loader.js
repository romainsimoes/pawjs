const SynckedFilesPlugin = require('./index');

module.exports = function () {
  const callback = this.async();
  const loaders = this.query.requestedLoaders;
  let syncPlugin = null;

  this._compiler.options.plugins.forEach((plugin) => {
    if (plugin instanceof SynckedFilesPlugin) {
      syncPlugin = plugin;
    }
  });


  let requestString = '';
  let syncKey = '';
  let fileLoaderOptions = {};
  loaders.forEach((loader) => {
    requestString += `!${loader.loader}?${JSON.stringify(loader.options || {})}`;
    if (loader.loader === 'file-loader') {
      syncKey += `!${loader.loader}`;
      fileLoaderOptions = loader.options;
    } else {
      syncKey += `!${loader.loader}?${JSON.stringify(loader.options || {})}`;
    }
  });

  requestString = `!${requestString}!${this.resourcePath}${this.resourceQuery}`;
  syncKey = `!${syncKey}!${this.resourcePath}${this.resourceQuery}`;

  let syncSource;
  const publicPath = `${this._compiler.options.output.publicPath}${fileLoaderOptions ? fileLoaderOptions.publicPath : ''}`;

  if (syncPlugin && (syncSource = syncPlugin.get(syncKey))) {
    callback(null, syncSource.replace('__webpack_public_path__', JSON.stringify(publicPath)));
    return;
  }

  this.loadModule(requestString, (error, source) => {
    if (!error) {
      if (syncPlugin && source.indexOf('require') === -1) {
        syncPlugin.add(syncKey, source);
      }
    }
    callback(error, source);
  });
};
