import { createServer } from './modules/app/server';
import { createCloudflareKVStorageFactory } from './modules/storage/factories/cloudflare-kv.storage';

const { storageFactory } = createCloudflareKVStorageFactory();

const { app } = createServer({ storageFactory });

const API_PATH_PREFIX = '/api';

type WorkerEnv = {
  ASSETS: {
    fetch: typeof fetch;
  };
};

export default {
  fetch(request: Request, env: WorkerEnv, executionContext: ExecutionContext) {
    const { pathname } = new URL(request.url);

    if (pathname === API_PATH_PREFIX || pathname.startsWith(`${API_PATH_PREFIX}/`)) {
      return app.fetch(request, env, executionContext);
    }

    return env.ASSETS.fetch(request);
  },
};
