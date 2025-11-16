export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      // ============================
      // ROUTE : /status
      // ============================
      if (url.pathname === "/status") {
        const maintenance = await env.BOT_CONFIG.get("maintenance");
        const botStatus = await env.BOT_STATUS.get("status");

        // Si le bot n’a jamais envoyé son status → offline
        if (!botStatus) {
          return new Response(JSON.stringify({
            online: false,
            error: "Bot unreachable",
            maintenance: maintenance === "true"
          }), {
            headers: { "Content-Type": "application/json" }
          });
        }

        return new Response(botStatus, {
          headers: { "Content-Type": "application/json" }
        });
      }

      // ============================
      // ROUTE : /admin/maintenance
      // ============================
      if (url.pathname === "/admin/maintenance") {
        if (request.method !== "POST") {
          return new Response("Method Not Allowed", { status: 405 });
        }

        const body = await request.json();

        if (typeof body.maintenance !== "boolean") {
          return new Response(JSON.stringify({
            error: "maintenance must be boolean"
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        await env.BOT_CONFIG.put("maintenance", body.maintenance ? "true" : "false");

        return new Response(JSON.stringify({
          success: true,
          maintenance: body.maintenance
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // ============================
      // ROUTE : /update
      // envoyée par ton bot Discord
      // ============================
      if (url.pathname === "/update") {
        if (request.method !== "POST") {
          return new Response("Method Not Allowed", { status: 405 });
        }

        const body = await request.json();

        // Stocker le status envoyé par ton bot
        await env.BOT_STATUS.put("status", JSON.stringify(body));

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Si aucune route ne correspond :
      return new Response("Not Found", { status: 404 });

    } catch (err) {
      return new Response("Worker Error: " + err.toString(), {
        status: 500,
        headers: { "Content-Type": "text/plain" }
      });
    }
  }
};
