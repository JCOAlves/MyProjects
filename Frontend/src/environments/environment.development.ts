const host = import.meta.env.NG_APP_HOSTBACK || 'localhost';
const port = Number(import.meta.env.NG_APP_PORTBACK) || 3000;

const environment = {
  production: false,
  HostBackend: host,
  PortBackend: port,
  apiUrl: import.meta.env.NG_APP_API_URL || `http://${host}:${port}`,
  demoMode: import.meta.env.NG_APP_DEMO_MODE !== 'false',
  debug: import.meta.env.NG_APP_DEBUG_MODE === 'true',
};

export default environment;
