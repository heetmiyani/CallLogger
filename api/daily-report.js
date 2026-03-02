import ExcelJS from "exceljs";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ Correct model name
    const calls = await prisma.callLog.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
      include: {
        staff: true,
        client: true,
      },
    });

    // ========================
    // 📊 Create Excel
    // ========================

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Daily CRM Report");

    worksheet.columns = [
      { header: "Staff Name", key: "staffName", width: 25 },
      { header: "Client Code", key: "clientCode", width: 20 },
      { header: "Client Name", key: "clientName", width: 25 },
      { header: "Phone Number", key: "phoneNumber", width: 20 },
      { header: "Call Regarding", key: "callRegarding", width: 25 },
      { header: "Status", key: "status", width: 20 },
      { header: "Interest Status", key: "interestStatus", width: 20 },
      { header: "Reminder Days", key: "reminderDays", width: 15 },
      { header: "Response", key: "response", width: 40 },
      { header: "Call DateTime", key: "dateTime", width: 25 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    calls.forEach((call) => {
      worksheet.addRow({
        staffName: call.staff.name,
        clientCode: call.client.clientCode,
        clientName: call.client.clientName,
        phoneNumber: call.client.phoneNumber,
        callRegarding: call.callRegarding,
        status: call.status,
        interestStatus: call.interestStatus,
        reminderDays: call.reminderDays || "",
        response: call.response || "",
        dateTime: call.dateTime,
        createdAt: call.createdAt,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    // ========================
    // 📈 Staff Summary
    // ========================

    const staffSummary = {};

    calls.forEach((call) => {
      const name = call.staff.name;
      staffSummary[name] = (staffSummary[name] || 0) + 1;
    });

    let summaryText = "Daily Call Summary:\n\n";

    if (calls.length === 0) {
      summaryText += "No calls recorded today.";
    } else {
      Object.keys(staffSummary).forEach((name) => {
        summaryText += `${name} → ${staffSummary[name]} calls\n`;
      });
    }

    // ========================
    // 👥 Get Admin Emails
    // ========================

    const admins = await prisma.staff.findMany({
      where: {
        role: "admin",   // must match your DB value exactly
      },
      select: {
        email: true,
      },
    });

    const adminEmails = admins.map((a) => a.email);

    // ========================
    // 📧 Send Email
    // ========================

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