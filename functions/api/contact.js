export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  if (form.get("website")) return json({ ok: true }, 200);

  const name = (form.get("name") || "").toString().trim();
  const email = (form.get("email") || "").toString().trim();
  const message = (form.get("message") || "").toString().trim();
  const locale = (form.get("locale") || "en").toString();

  if (!name || !email || !message) return json({ ok: false, error: "missing_fields" }, 400);
  if (message.length > 5000) return json({ ok: false, error: "too_long" }, 413);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return json({ ok: false, error: "bad_email" }, 400);

  if (env.RESEND_API_KEY && env.CONTACT_TO_EMAIL) {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM || "noreply@pchelovod.tj",
        to: env.CONTACT_TO_EMAIL,
        subject: `[Pchelovod/${locale}] Contact from ${name}`,
        reply_to: email,
        text: `${message}\n\n— ${name} <${email}>`,
      }),
    });
    if (!resp.ok) return json({ ok: false, error: "upstream" }, 502);
  } else if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    const resp = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: `Contact (${locale}) from ${name} <${email}>:\n\n${message}`,
      }),
    });
    if (!resp.ok) return json({ ok: false, error: "upstream" }, 502);
  } else {
    return json({ ok: false, error: "not_configured" }, 500);
  }

  return Response.redirect(new URL(`/${locale}/contact/?sent=1`, request.url), 303);
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
