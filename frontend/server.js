// From https://www.npmjs.com/package/parcel-proxy-server

const ParcelProxyServer = require('parcel-proxy-server');

// configure the proxy server
const server = new ParcelProxyServer({
  entryPoint: './index.html',
  parcelOptions: {
    // provide parcel options here
    // these are directly passed into the
    // parcel bundler
    //
    // More info on supported options are documented at
    // https://parceljs.org/api
    https: false,
    autoinstall: false,
  },
  proxies: {
    '/api': {
      target: 'http://localhost:8002/'
    },
    '/build': {
      target: 'http://localhost:8000/'
    }
  }
});

// the underlying parcel bundler is exposed on the server
// and can be used if needed
server.bundler.on('buildEnd', () => {
  console.log('Build completed!');
});

// start up the server
server.listen(1235, () => {
  console.log('Parcel proxy server has started');
});
