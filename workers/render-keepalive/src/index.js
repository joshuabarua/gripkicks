async function ping(url) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "gripkicks-render-keepalive" },
      signal: AbortSignal.timeout(90_000),
    });
    const elapsed = Date.now() - started;
    if (response.ok) {
      console.log(`keepalive ok status=${response.status} elapsed=${elapsed}ms`);
    } else {
      console.error(`keepalive non-ok status=${response.status} elapsed=${elapsed}ms`);
    }
  } catch (error) {
    const elapsed = Date.now() - started;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`keepalive failed elapsed=${elapsed}ms error=${message}`);
  }
}

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(ping(env.TARGET_URL));
  },
};
