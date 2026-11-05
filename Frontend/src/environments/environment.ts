const environment = {
    production: false,
    HostBackend: import.meta.env.NG_APP_HOSTBACK || "localhost",
    PortBackend: import.meta.env.NG_APP_PORTBACK || 3000,
    debug: import.meta.env.NG_APP_DEBUG_MODE === "true" || true
};

export default environment
