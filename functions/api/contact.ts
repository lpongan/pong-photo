interface Env {
  CONTACT_EMAIL: string;
  RESEND_API_KEY: string;
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

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Pong Photo Contact <onboarding@resend.dev>",
        to: [context.env.CONTACT_EMAIL],
        reply_to: email,
        subject: `New session inquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return Response.json({ error: "Failed to send message." }, { status: 500, headers });
    }

    return Response.json({ success: true }, { status: 200, headers });

  } catch (err) {
    console.error("Function error:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500, headers });
  }
};