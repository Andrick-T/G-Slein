import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";

import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Prescription from "../models/Prescription.js";
import Review from "../models/Review.js";
import Payment from "../models/Payment.js";

const toIsoDate = (date) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toTimeValue = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const seedDatabase = async () => {
  try {
    console.log("========================================");
    console.log("G-SLEIN V1 DATABASE SEED");
    console.log("========================================");

    // --------------------------------------------------
    // 1. Connect to MongoDB
    // --------------------------------------------------

    await connectDB();

    console.log("\nConnected to MongoDB.");
    console.log("Preparing database reset...");

    // --------------------------------------------------
    // 2. Clear existing application data
    // --------------------------------------------------

    await Promise.all([
      User.deleteMany({}),
      Appointment.deleteMany({}),
      MedicalRecord.deleteMany({}),
      Prescription.deleteMany({}),
      Review.deleteMany({}),
      Payment.deleteMany({}),
    ]);

    console.log("Existing application data cleared.");

    // --------------------------------------------------
    // 3. Create users
    // --------------------------------------------------

    const password = "Password123!";
    const MIN_CONSULTATION_FEE_XAF = 5000;

    const admin = await User.create({
      firstName: "System",
      lastName: "Administrator",
      email: "admin@g-slein.test",
      password: password,
      role: "admin",
      phone: "+237690000001",
    });

    const doctor1 = await User.create({
      firstName: "Sarah",
      lastName: "Mbeki",
      email: "sarah.doctor@g-slein.test",
      password: password,
      role: "doctor",
      phone: "+237690000002",

      doctorProfile: {
        specialization: "Cardiology",
        licenseNumber: "CM-CARD-1001",
        experience: 8,
        consultationFee: Math.max(5000, MIN_CONSULTATION_FEE_XAF),
        bio: "Cardiologist specializing in cardiovascular disease prevention and general cardiac care.",
        languages: ["English", "French"],
        isVerified: true,
      },
    });

    const doctor2 = await User.create({
      firstName: "Michael",
      lastName: "Nfor",
      email: "michael.doctor@g-slein.test",
      password: password,
      role: "doctor",
      phone: "+237690000003",

      doctorProfile: {
        specialization: "General Medicine",
        licenseNumber: "CM-GEN-1002",
        experience: 5,
        consultationFee: 6500,
        bio: "General practitioner providing primary healthcare consultations and preventive care.",
        languages: ["English", "French"],
        isVerified: true,
      },
    });

    const seededDoctorFees = {
      doctor1: Math.max(
        Number(doctor1.doctorProfile.consultationFee || 0),
        MIN_CONSULTATION_FEE_XAF,
      ),
      doctor2: Math.max(
        Number(doctor2.doctorProfile.consultationFee || 0),
        MIN_CONSULTATION_FEE_XAF,
      ),
    };

    const patient1 = await User.create({
      firstName: "Daniel",
      lastName: "Kamga",
      email: "daniel.patient@g-slein.test",
      password: password,
      role: "patient",
      phone: "+237690000004",

      patientProfile: {
        dateOfBirth: new Date("1995-05-15"),
        gender: "male",
        bloodGroup: "O+",
        allergies: ["Penicillin"],
        emergencyContact: {
          name: "Grace Kamga",
          phone: "+237690000005",
          relationship: "Sister",
        },
      },
    });

    const patient2 = await User.create({
      firstName: "Emily",
      lastName: "Tambe",
      email: "emily.patient@g-slein.test",
      password: password,
      role: "patient",
      phone: "+237690000006",

      patientProfile: {
        dateOfBirth: new Date("1998-10-21"),
        gender: "female",
        bloodGroup: "A+",
        allergies: [],
        emergencyContact: {
          name: "Paul Tambe",
          phone: "+237690000007",
          relationship: "Brother",
        },
      },
    });

    console.log("Users created.");

    // --------------------------------------------------
    // 4. Create appointments
    // --------------------------------------------------

    const appointment1 = await Appointment.create({
      patient: patient1._id,
      doctor: doctor1._id,
      date: new Date("2026-08-12"),
      startTime: "10:00",
      endTime: "10:30",
      status: "completed",
      consultationType: "video",
      meetingUrl: "https://meet.jit.si/g-slein-demo-appointment-001",
      reason: "Routine cardiovascular consultation",
      paymentStatus: "pending",
    });

    const appointment2 = await Appointment.create({
      patient: patient2._id,
      doctor: doctor2._id,
      date: new Date("2026-08-13"),
      startTime: "14:00",
      endTime: "14:30",
      status: "confirmed",
      consultationType: "video",
      meetingUrl: "https://meet.jit.si/g-slein-demo-appointment-002",
      reason: "General health consultation",
      paymentStatus: "pending",
    });

    const appointment3 = await Appointment.create({
      patient: patient1._id,
      doctor: doctor2._id,
      date: new Date("2026-08-15"),
      startTime: "09:00",
      endTime: "09:30",
      status: "pending",
      consultationType: "video",
      meetingUrl: "https://meet.jit.si/g-slein-demo-appointment-003",
      reason: "Follow-up consultation",
      paymentStatus: "pending",
    });

    // --------------------------------------------------
    // Development-only Jitsi regression test appointment
    // This record is intentionally paid and confirmed so
    // doctor/patient can test the real consultation flow.
    // --------------------------------------------------

    const now = new Date();
    const jitsiTestDate = new Date(now);
    jitsiTestDate.setHours(12, 0, 0, 0);

    const jitsiTestEnd = new Date(now);
    jitsiTestEnd.setMinutes(jitsiTestEnd.getMinutes() + 30);

    const jitsiTestStartTime = toTimeValue(now);
    const jitsiTestEndTime = toTimeValue(jitsiTestEnd);
    const jitsiTestToken = `JITSI_TEST_${Date.now()}`;

    const jitsiTestAppointment = await Appointment.create({
      patient: patient1._id,
      doctor: doctor1._id,
      date: jitsiTestDate,
      startTime: jitsiTestStartTime,
      endTime: jitsiTestEndTime,
      status: "confirmed",
      consultationType: "video",
      reason: "DEV ONLY - Jitsi paid consultation regression test",
      paymentStatus: "paid",
    });

    console.log("Appointments created.");

    // --------------------------------------------------
    // 5. Create medical records
    // --------------------------------------------------

    await MedicalRecord.create([
      {
        patient: patient1._id,
        title: "Previous Blood Test",
        description:
          "Sample laboratory blood test record for development purposes.",
        fileUrl: "https://example.com/g-slein/sample-blood-test.pdf",
        fileName: "sample-blood-test.pdf",
        fileType: "application/pdf",
        uploadedBy: patient1._id,
      },

      {
        patient: patient1._id,
        title: "Cardiology Report",
        description: "Sample cardiology report for development purposes.",
        fileUrl: "https://example.com/g-slein/sample-cardiology-report.pdf",
        fileName: "sample-cardiology-report.pdf",
        fileType: "application/pdf",
        uploadedBy: doctor1._id,
      },

      {
        patient: patient2._id,
        title: "General Health Report",
        description: "Sample health report for development purposes.",
        fileUrl: "https://example.com/g-slein/sample-health-report.pdf",
        fileName: "sample-health-report.pdf",
        fileType: "application/pdf",
        uploadedBy: patient2._id,
      },
    ]);

    console.log("Medical records created.");

    // --------------------------------------------------
    // 6. Create prescription
    // --------------------------------------------------

    const prescription1 = await Prescription.create({
      patient: patient1._id,
      doctor: doctor1._id,
      appointment: appointment1._id,

      medications: [
        {
          name: "Aspirin",
          dosage: "75 mg",
          frequency: "Once daily",
          duration: "30 days",
          instructions: "Take after breakfast.",
        },

        {
          name: "Atorvastatin",
          dosage: "20 mg",
          frequency: "Once daily",
          duration: "30 days",
          instructions: "Take in the evening.",
        },
      ],

      notes: "Sample prescription created for development and testing.",
    });

    console.log("Prescription created.");

    // --------------------------------------------------
    // 7. Create reviews
    // --------------------------------------------------

    await Review.create({
      patient: patient1._id,
      doctor: doctor1._id,
      appointment: appointment1._id,
      rating: 5,
      comment:
        "Excellent consultation. The doctor was professional and explained everything clearly.",
    });

    console.log("Review created.");

    // --------------------------------------------------
    // 8. Create payments
    // --------------------------------------------------

    await Payment.create([
      {
        patient: patient1._id,
        doctor: doctor1._id,
        appointment: appointment1._id,
        amount: seededDoctorFees.doctor1,
        currency: "XAF",
        status: "pending",
        provider: "stripe",
        transactionId: "STRIPE-TEST-PAY-001",
      },

      {
        patient: patient2._id,
        doctor: doctor2._id,
        appointment: appointment2._id,
        amount: seededDoctorFees.doctor2,
        currency: "XAF",
        status: "pending",
        provider: "stripe",
        transactionId: "STRIPE-TEST-PAY-002",
      },

      {
        patient: patient1._id,
        doctor: doctor1._id,
        appointment: jitsiTestAppointment._id,
        amount: seededDoctorFees.doctor1,
        currency: "XAF",
        status: "paid",
        provider: "stripe",
        transactionId: jitsiTestToken,
        transactionReference: `${jitsiTestToken}_REF`,
        providerPaymentId: `${jitsiTestToken}_PROVIDER`,
        paidAt: new Date(),
      },
    ]);

    console.log("Payments created.");

    // --------------------------------------------------
    // 9. Summary
    // --------------------------------------------------

    const [
      userCount,
      appointmentCount,
      medicalRecordCount,
      prescriptionCount,
      reviewCount,
      paymentCount,
    ] = await Promise.all([
      User.countDocuments(),
      Appointment.countDocuments(),
      MedicalRecord.countDocuments(),
      Prescription.countDocuments(),
      Review.countDocuments(),
      Payment.countDocuments(),
    ]);

    console.log("\n========================================");
    console.log("DATABASE SEED COMPLETED");
    console.log("========================================");

    console.log(`Users:           ${userCount}`);
    console.log(`Appointments:    ${appointmentCount}`);
    console.log(`Medical Records: ${medicalRecordCount}`);
    console.log(`Prescriptions:   ${prescriptionCount}`);
    console.log(`Reviews:         ${reviewCount}`);
    console.log(`Payments:        ${paymentCount}`);

    console.log("\n----------------------------------------");
    console.log("TEST ACCOUNTS");
    console.log("----------------------------------------");

    console.log("\nAdmin");
    console.log("Email:    admin@g-slein.test");
    console.log("Password: Password123!");

    console.log("\nDoctor 1");
    console.log("Email:    sarah.doctor@g-slein.test");
    console.log("Password: Password123!");

    console.log("\nDoctor 2");
    console.log("Email:    michael.doctor@g-slein.test");
    console.log("Password: Password123!");

    console.log("\nPatient 1");
    console.log("Email:    daniel.patient@g-slein.test");
    console.log("Password: Password123!");

    console.log("\nPatient 2");
    console.log("Email:    emily.patient@g-slein.test");
    console.log("Password: Password123!");

    console.log("\n----------------------------------------");
    console.log("G-SLEIN JITSI TEST APPOINTMENT");
    console.log("----------------------------------------");
    console.log(
      `Patient: ${patient1.firstName} ${patient1.lastName} (${patient1.email})`,
    );
    console.log(
      `Doctor: ${doctor1.firstName} ${doctor1.lastName} (${doctor1.email})`,
    );
    console.log(`Appointment ID: ${jitsiTestAppointment._id}`);
    console.log(`Appointment status: ${jitsiTestAppointment.status}`);
    console.log(`Payment status: ${jitsiTestAppointment.paymentStatus}`);
    console.log(`Consultation type: ${jitsiTestAppointment.consultationType}`);
    console.log(
      `Scheduled: ${toIsoDate(jitsiTestAppointment.date)} ${jitsiTestAppointment.startTime}-${jitsiTestAppointment.endTime}`,
    );
    console.log(`Payment reference: ${jitsiTestToken}`);
    console.log("Consultation room: generated when doctor starts");

    console.log("\nMANUAL JITSI TEST PROCEDURE");
    console.log("1. Login as the seeded doctor.");
    console.log("2. Open the test appointment.");
    console.log("3. Start the consultation.");
    console.log("4. Confirm the consultation becomes active.");
    console.log("5. Open a second browser/incognito window.");
    console.log("6. Login as the seeded patient.");
    console.log("7. Open the same appointment.");
    console.log("8. Join consultation.");
    console.log("9. Test microphone.");
    console.log("10. Test camera.");
    console.log("11. Confirm doctor sees patient.");
    console.log("12. Confirm patient sees doctor.");
    console.log("13. Test mute/unmute.");
    console.log("14. Test camera on/off.");
    console.log("15. Leave the consultation.");
    console.log(
      "16. Have the doctor end the consultation using the normal application flow.",
    );

    console.log("\n========================================");
  } catch (error) {
    console.error("\n========================================");
    console.error("DATABASE SEED FAILED");
    console.error("========================================");
    console.error(error);

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();

    console.log("\nMongoDB connection closed.");
  }
};

seedDatabase();
