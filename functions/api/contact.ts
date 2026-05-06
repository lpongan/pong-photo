interface Env {
  CONTACT_EMAIL: string;
  MAILCHANNELS_API_KEY?: string;
}

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("Origin") ?? "";
  const allowed = origin.endsWith(".pages.dev") || origin === "https://pong-photo.pages.dev";
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://pong-photo.pages.dev",
    "Content-Type": "application/json",
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const headers = getCorsHeaders(context.request);

  try {
    const formData = await context.request.formData();
    const name = formData.get("name")?.toString().trim() ?? "";
    const email = formData.get("email")?.toString().trim() ?? "";
    const message = formData.get("message")?.toString().trim() ?? "";

    if (!name || !email || !message) {
      return Response.json({ error: "All fields are required." }, { status: 400, headers });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email address." }, { status: 400, headers });
    }

    await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: context.env.CONTACT_EMAIL }],
        }],
        from: {
          email: "no-reply@pong-photo.pages.dev",
          name: "Pong Photo Contact Form",
        },
        reply_to: { email, name },
        subject: `New session inquiry from ${name}`,
        content: [{
          type: "text/plain",
          value: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        }],
      }),
    });

    return Response.json({ success: true }, { status: 200, headers });

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500, headers });
  }
};

export const onRequestOptions: PagesFunction = async (context) => {
  const origin = context.request.headers.get("Origin") ?? "";
  const allowed = origin.endsWith(".pages.dev") || origin === "https://pong-photo.pages.dev";
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": allowed ? origin : "https://pong-photo.pages.dev",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
