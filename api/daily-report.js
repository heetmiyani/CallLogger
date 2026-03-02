import ExcelJS from "exceljs";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {

    // 🔐 Protect cron endpoint
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 📅 Get today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calls = await prisma.call.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
      include: {
        staff: true,   // assuming relation exists
        client: true,  // assuming relation exists
      },
    });

    // =========================
    // 📊 Create Excel
    // =========================

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Daily CRM Report");

    worksheet.columns = [
      { header: "Staff Name", key: "staffName", width: 25 },
      { header: "Client Name", key: "clientName", width: 25 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Input Type", key: "inputType", width: 20 },
      { header: "Call Notes", key: "notes", width: 40 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    calls.forEach((call) => {
      worksheet.addRow({
        staffName: call.staff?.name || "",
        clientName: call.client?.name || "",
        phone: call.client?.phone || "",
        inputType: call.inputType || "",
        notes: call.notes || "",
        createdAt: call.createdAt,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    // =========================
    // 📈 Create Staff Summary
    // =========================

    const staffSummary = {};

    calls.forEach((call) => {
      const name = call.staff?.name || "Unknown";
      staffSummary[name] = (staffSummary[name] || 0) + 1;
    });

    let summaryText = "Daily Call Summary:\n\n";

    Object.keys(staffSummary).forEach((name) => {
      summaryText += `${name} → ${staffSummary[name]} calls\n`;
    });

    if (calls.length === 0) {
      summaryText += "No calls recorded today.";
    }

    // =========================
    // 👥 Get All Admin Emails
    // =========================

    const admins = await prisma.staff.findMany({
      where: {
        role: "admin", // adjust if different in your schema
      },
      select: {
        email: true,
      },
    });

    const adminEmails = admins.map((a) => a.email);

    // =========================
    // 📧 Send Email
    // =========================

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmails,
      subject: "Daily CRM Report",
      text: summaryText,
      attachments: [
        {
          filename: "DailyCRMReport.xlsx",
          content: buffer,
        },
      ],
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to send report" });
  }
}