const mongoose = require('mongoose');
const dns = require('dns');
const { promisify } = require('util');

const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);

// Use public DNS to bypass ISP DNS issues with Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const ensureDatabaseName = (uri, dbName = 'kalma-mixtail') => {
  if (!uri.includes('mongodb+srv://') && !uri.includes('mongodb://')) {
    return uri;
  }

  if (uri.includes('.mongodb.net/?')) {
    return uri.replace('.mongodb.net/?', `.mongodb.net/${dbName}?`);
  }

  if (uri.match(/\.mongodb\.net\/\?/)) {
    return uri.replace('.mongodb.net/?', `.mongodb.net/${dbName}?`);
  }

  if (uri.match(/\.mongodb\.net\/$/)) {
    return `${uri}${dbName}`;
  }

  return uri;
};

const parseSrvUri = (srvUri) => {
  const withoutScheme = srvUri.replace('mongodb+srv://', '');
  const [credentials, hostAndPath] = withoutScheme.split('@');
  const [host, ...pathParts] = hostAndPath.split('/');
  const pathAndQuery = pathParts.join('/') || '';
  const [dbName = 'kalma-mixtail', query = ''] = pathAndQuery.split('?');

  return {
    credentials,
    host,
    dbName: dbName || 'kalma-mixtail',
    query,
  };
};

const buildDirectUriFromSrv = async (srvUri) => {
  const { credentials, host, dbName, query } = parseSrvUri(srvUri);
  const srvRecords = await resolveSrv(`_mongodb._tcp.${host}`);
  const txtRecords = await resolveTxt(`_mongodb._tcp.${host}`);

  let replicaSet = '';
  txtRecords.forEach((record) => {
    const text = Array.isArray(record) ? record.join('') : String(record);
    const match = text.match(/replicaSet=([^&]+)/);
    if (match) replicaSet = match[1];
  });

  const hosts = srvRecords.map((record) => `${record.name}:${record.port}`).join(',');
  const params = new URLSearchParams(query);
  params.set('ssl', 'true');
  params.set('authSource', 'admin');
  if (replicaSet) params.set('replicaSet', replicaSet);
  if (process.env.NODE_ENV !== 'production') {
    params.set('tlsAllowInvalidCertificates', 'true');
  }

  return `mongodb://${credentials}@${hosts}/${dbName}?${params.toString()}`;
};

const shouldUseDirectUri = (error) =>
  /querySrv|ECONNREFUSED|whitelist|Server selection timed out/i.test(error.message);

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  let useDirectUri = false;
  const uri = ensureDatabaseName(process.env.MONGODB_URI);

  const options = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
  };

  if (process.env.NODE_ENV !== 'production') {
    options.tlsAllowInvalidCertificates = true;
  }

  const attemptConnection = async () => {
    try {
      const connectUri = useDirectUri ? await buildDirectUriFromSrv(uri) : uri;
      const conn = await mongoose.connect(connectUri, options);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return true;
    } catch (error) {
      retries += 1;

      if (!useDirectUri && uri.startsWith('mongodb+srv://') && shouldUseDirectUri(error)) {
        useDirectUri = true;
        console.warn('SRV connection failed. Retrying with direct Atlas hosts...');
        return attemptConnection();
      }

      if (retries < maxRetries) {
        console.warn(`Connection attempt ${retries}/${maxRetries} failed. Retrying in 3 seconds...`);
        console.warn(`Error: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return attemptConnection();
      }

      console.error(`Failed to connect to MongoDB after ${maxRetries} attempts`);
      console.error(`Error: ${error.message}`);
      console.warn('Server will continue running without database connection');
      return false;
    }
  };

  return attemptConnection();
};

module.exports = connectDB;
