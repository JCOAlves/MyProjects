interface Env {
  readonly NODE_ENV: string;
  readonly NG_APP_HOSTBACK?: string;
  readonly NG_APP_PORTBACK?: string;
  readonly NG_APP_API_URL?: string;
  readonly NG_APP_DEMO_MODE?: string;
  readonly NG_APP_DEBUG_MODE?: string;
}

interface ImportMeta {
  readonly env: Env;
}

declare const _NGX_ENV_: Env;
