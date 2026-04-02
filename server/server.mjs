import "dotenv/config";
import cors from "cors";
import express from "express";
import nodemailer from "nodemailer";

const app = express();
const port = process.env.PORT || 8787;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed"));
    },
  }),
);

function getTransport() {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  if (sendgridApiKey) {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: sendgridApiKey,
      },
    });
  }

  const host = process.env.SMTP_HOST;
  const portValue = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: portValue,
    secure: portValue === 465,
    auth: {
      user,
      pass,
    },
  });
}

function normalize(value) {
  return String(value || "").trim();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "flexgcc-form-api" });
});

app.post("/api/contact", async (req, res) => {
  const payload = {
    name: normalize(req.body.name),
    company: normalize(req.body.company),
    email: normalize(req.body.email),
    role: normalize(req.body.role),
    workflow: normalize(req.body.workflow),
    impact: normalize(req.body.impact),
    tools: normalize(req.body.tools),
    notes: normalize(req.body.notes),
  };

  const requiredFields = ["name", "company", "email", "role", "workflow", "impact"];
  const missingFields = requiredFields.filter((field) => !payload[field]);

  if (missingFields.length > 0) {
    res.status(400).json({
      ok: false,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
    return;
  }

  const transport = getTransport();
  if (!transport) {
    res.status(503).json({
      ok: false,
      message: "Email service is not configured yet.",
    });
    return;
  }

  const subject = `FlexGCC Workflow Review Request - ${payload.company}`;
  const text = [
    "FlexGCC workflow review request",
    "",
    `Name: ${payload.name}`,
    `Company: ${payload.company}`,
    `Work email: ${payload.email}`,
    `Role: ${payload.role}`,
    "",
    "Workflow or bottleneck:",
    payload.workflow,
    "",
    "Main business impact today:",
    payload.impact,
    "",
    "Systems or tools involved:",
    payload.tools || "(not provided)",
    "",
    "Anything else we should know:",
    payload.notes || "(not provided)",
  ].join("\n");

  try {
    await transport.sendMail({
      from:
        process.env.SENDGRID_FROM_NAME && process.env.SENDGRID_FROM_EMAIL
          ? `"${process.env.SENDGRID_FROM_NAME}" <${process.env.SENDGRID_FROM_EMAIL}>`
          : process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER,
      to: "sunit.gala@flexgcc.com",
      cc: "kandarp.soni@flexgcc.com",
      replyTo: payload.email,
      subject,
      text,
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Email send failed", error);
    res.status(502).json({
      ok: false,
      message: "Unable to send the form email right now.",
    });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    ok: false,
    message: "Unexpected server error.",
  });
});

app.listen(port, () => {
  console.log(`flexgcc-form-api listening on ${port}`);
});
