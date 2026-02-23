const { queryRef, executeQuery, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'charatech-web',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const listAllMoviesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllMovies');
}
listAllMoviesRef.operationName = 'ListAllMovies';
exports.listAllMoviesRef = listAllMoviesRef;

exports.listAllMovies = function listAllMovies(dc) {
  return executeQuery(listAllMoviesRef(dc));
};
