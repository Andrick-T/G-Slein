import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Stethoscope,
  Users,
  Video,
} from "lucide-react";

import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Secure access",
    text: "Protected sign-in and role-based access for every account.",
  },
  {
    icon: CalendarDays,
    title: "Simple appointments",
    text: "Move from doctor discovery to booking with less friction.",
  },
  {
    icon: Video,
    title: "Connected consultations",
    text: "Support scheduled telemedicine sessions from one platform.",
  },
  {
    icon: FileText,
    title: "Organized records",
    text: "Keep prescriptions and medical information structured.",
  },
];

const steps = [
  {
    number: "01",
    icon: Stethoscope,
    title: "Find a doctor",
    text: "Discover the healthcare professional you need through the patient experience.",
  },
  {
    number: "02",
    icon: CalendarDays,
    title: "Book a consultation",
    text: "Choose an available appointment and provide the information needed for your visit.",
  },
  {
    number: "03",
    icon: Video,
    title: "Consult and continue",
    text: "Join your consultation and keep your healthcare journey organized afterward.",
  },
];

const benefits = [
  {
    icon: CheckCircle2,
    title: "Straightforward workflows",
    text: "Important healthcare actions remain easy to find and understand.",
  },
  {
    icon: ShieldCheck,
    title: "Designed around trust",
    text: "Security, clarity, and controlled access remain central to the experience.",
  },
  {
    icon: Users,
    title: "One connected platform",
    text: "Patients, doctors, and administrators work through role-aware experiences.",
  },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-white">
        <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-[#DBEAFE]/60 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#CCFBF1]/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#1D4ED8]">
              Healthcare, made easier
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl lg:leading-[1.06]">
              Better access to care, without unnecessary complexity.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-[#64748B] sm:text-lg">
              G-Slein connects patients and healthcare professionals through a
              simple digital healthcare experience for discovery, appointments,
              consultations, and ongoing care.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button type="button" onClick={() => navigate("/register")}>
                Get started
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/login")}
              >
                Sign in
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#64748B]">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#0D9488]" />
                Secure access
              </span>

              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#2563EB]" />
                Simple booking
              </span>

              <span className="flex items-center gap-2">
                <Video className="h-4 w-4 text-[#0D9488]" />
                Telemedicine ready
              </span>
            </div>
          </div>

          {/* Hero product preview */}
          <div className="relative">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-[#DBEAFE]/50 blur-2xl" />

            <Card className="overflow-hidden p-0 shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
              <div className="border-b border-[#E2E8F0] bg-white px-6 py-5 sm:px-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                      Patient dashboard
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#0F172A]">
                      Your care overview
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF] text-sm font-bold text-[#2563EB]">
                    G
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-[#F8FAFC] p-5 sm:p-6">
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                        Next consultation
                      </p>

                      <p className="mt-2 text-base font-bold text-[#0F172A]">
                        Dr. Amina Mensah
                      </p>

                      <p className="mt-1 text-sm text-[#64748B]">
                        Video consultation · Thursday, 10:30 AM
                      </p>
                    </div>

                    <StatusBadge status="Confirmed" />
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-[#EFF6FF] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#2563EB] shadow-sm">
                        <Video className="h-4 w-4" />
                      </div>

                      <span className="text-sm font-medium text-[#1E3A8A]">
                        Upcoming appointment
                      </span>
                    </div>

                    <ArrowRight className="h-4 w-4 text-[#2563EB]" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                    <CalendarDays className="h-5 w-5 text-[#2563EB]" />

                    <p className="mt-4 text-sm font-semibold text-[#0F172A]">
                      Appointments
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#64748B]">
                      Keep upcoming care organized.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                    <FileText className="h-5 w-5 text-[#0D9488]" />

                    <p className="mt-4 text-sm font-semibold text-[#0F172A]">
                      Records
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#64748B]">
                      Keep healthcare information accessible.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-[#0F172A]">
                      {item.title}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-[#64748B]">
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-20 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0D9488]">
            How it works
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
            A clear path from finding care to consultation.
          </h2>

          <p className="mt-4 text-base leading-7 text-[#64748B]">
            G-Slein keeps the essential steps visible so patients can focus on
            getting the care they need.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <Card key={step.number} className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-[0.16em] text-[#94A3B8]">
                    {step.number}
                  </span>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>

                <h3 className="mt-6 text-lg font-semibold text-[#0F172A]">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#64748B]">
                  {step.text}
                </p>

                {step.number !== "03" ? (
                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#94A3B8]">
                    <span>Next step</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Why G-Slein */}
      <section
        id="why-g-slein"
        className="scroll-mt-20 border-y border-[#E2E8F0] bg-white"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0D9488]">
              Why G-Slein
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              Healthcare technology should feel clear, not complicated.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-[#64748B]">
              G-Slein focuses on the parts of digital healthcare that matter
              most: access, organization, communication, and continuity of care.
            </p>

            <div className="mt-8 space-y-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="flex gap-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0FDFA] text-[#0F766E]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[#0F172A]">
                        {benefit.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[#64748B]">
                        {benefit.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="bg-[#0F172A] p-7 text-white sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#99F6E4]">
                Built for real care workflows
              </p>

              <h3 className="mt-4 text-2xl font-bold tracking-tight">
                Everything important stays connected.
              </h3>

              <div className="mt-8 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-sm font-semibold">Appointments</p>

                  <p className="mt-1 text-sm leading-5 text-white/65">
                    Keep consultations scheduled and visible.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-sm font-semibold">Consultations</p>

                  <p className="mt-1 text-sm leading-5 text-white/65">
                    Support connected telemedicine sessions.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-sm font-semibold">Medical information</p>

                  <p className="mt-1 text-sm leading-5 text-white/65">
                    Keep prescriptions and records structured.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] p-7 sm:p-8">
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">
                      Patient-first experience
                    </p>

                    <p className="text-xs text-[#64748B]">
                      Calm, readable, and focused.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Human-centered section */}
      <section className="bg-[#F8FAFC]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-20">
          <div className="order-2 lg:order-1">
            <Card className="overflow-hidden p-0">
              <div className="bg-[#EFF6FF] p-7 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D4ED8]">
                  Healthcare stays human
                </p>

                <div className="mt-5 rounded-2xl border border-white/80 bg-white/90 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#CCFBF1] text-[#0F766E]">
                      <Users className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">
                        Patient and doctor connection
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#64748B]">
                        Clear communication and guided healthcare workflows.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-white p-7 sm:p-8">
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">
                    Human, not mechanical
                  </p>

                  <p className="mt-1 text-sm leading-5 text-[#64748B]">
                    Technology supports the care relationship rather than
                    getting in its way.
                  </p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">
                    Accessible by design
                  </p>

                  <p className="mt-1 text-sm leading-5 text-[#64748B]">
                    Interfaces stay readable, calm, and easy to navigate.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0D9488]">
              Human healthcare
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              Technology that keeps care approachable.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-[#64748B]">
              Digital healthcare should reduce friction, not add another layer
              of complexity. G-Slein is designed to make the next step in the
              care journey clear.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Card className="overflow-hidden bg-[#0F172A] p-0 text-white">
          <div className="px-6 py-10 text-center sm:px-10 sm:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#99F6E4]">
              Ready to begin?
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Start your healthcare journey with G-Slein.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
              Create your account and continue into the patient experience when
              you're ready.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button type="button" onClick={() => navigate("/register")}>
                Create an account
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/login")}
              >
                Sign in
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default Home;
