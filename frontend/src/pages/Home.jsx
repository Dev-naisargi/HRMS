import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheckIcon,
  UsersIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowRightIcon,
  SparklesIcon,
  IdentificationIcon,
  UserGroupIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";
import ThemeToggle from "../components/ThemeToggle";

const Home = () => {

  const features = [
    { icon: UsersIcon, title: "Employee Management", desc: "Detailed records with department-wise categorization and digital profiles." },
    { icon: ClockIcon, title: "Smart Attendance", desc: "Real-time clock-in/out system with automated shift and late-entry tracking." },
    { icon: DocumentTextIcon, title: "Leave Management", desc: "Request and approve leaves digitally with real-time balance updates." },
    { icon: CurrencyDollarIcon, title: "Payroll Processing", desc: "One-click monthly payouts with automated tax and benefit deductions." },
    { icon: ChartBarIcon, title: "Analytics & Reports", desc: "Generate professional PDF and Excel reports for audit-ready data." },
    { icon: ShieldCheckIcon, title: "Secure Authentication", desc: "Enterprise-grade role-based access for Admins, HR, and Staff." },
  ];

  const steps = [
    { icon: GlobeAltIcon, step: "01", title: "Register Company", desc: "Set up your workspace by providing company details and brand identity." },
    { icon: UserGroupIcon, step: "02", title: "Onboard Team", desc: "Add your staff members and assign specific roles and departments." },
    { icon: IdentificationIcon, step: "03", title: "Automate Work", desc: "Start tracking attendance and processing payroll with zero manual effort." }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/20 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 font-sans text-gray-800 dark:text-gray-200 antialiased transition-colors duration-300">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/75 backdrop-blur-xl border-b border-emerald-100/60 dark:border-gray-700/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-xl shadow-md">
              <ShieldCheckIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              HR<span className="text-emerald-600">MS</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition duration-300">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition duration-300">
              How It Works
            </a>

          </div>


          <div className="hidden md:flex items-center gap-5">

            <ThemeToggle />

            <Link
              to="/login"
              className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition-colors duration-300"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition duration-300 shadow-md hover:shadow-lg active:scale-95"
            >
              Get Started
            </Link>

          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative py-16 md:py-20 lg:py-24 bg-gradient-to-b from-emerald-50/70 via-white to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-200/30 dark:bg-emerald-900/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 animate-fadeIn">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 mb-6 font-extrabold text-[11px] uppercase tracking-widest shadow-sm">
            <SparklesIcon className="h-3 w-3" /> Efficiency redefined
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-[1.08]">
            Smart Management for <br />
            <span className="text-emerald-600 italic">Modern Teams.</span>
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg max-w-2xl mx-auto mb-9 leading-relaxed font-medium">
            A comprehensive HRMS designed to eliminate paperwork and automate your entire employee lifecycle seamlessly.
          </p>

        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-emerald-50/40 dark:from-gray-900 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Platform Features
            </h2>
            <div className="h-1 w-14 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">

            {features.map((f, i) => (
              <div
                key={i}
                className="group p-6 lg:p-8 bg-white/95 dark:bg-gray-800/90 border border-emerald-100 dark:border-gray-700 rounded-2xl shadow-sm hover:-translate-y-1 hover:border-emerald-300 dark:hover:border-emerald-700 transition duration-300 hover:shadow-xl"
              >

                <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-gray-700 dark:to-gray-700 rounded-xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-300 group-hover:from-emerald-500 group-hover:to-emerald-600 group-hover:text-white transition duration-300 shadow-sm">
                  <f.icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  {f.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  {f.desc}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-emerald-50/60 to-white dark:from-gray-800 dark:to-gray-900 border-y border-emerald-100/70 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-gray-400 dark:text-gray-500 mt-2 font-bold text-[10px] uppercase tracking-widest">
              3 Simple Steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">

            {steps.map((s, i) => (
              <div key={i} className="p-6 lg:p-8 text-center bg-white/95 dark:bg-gray-800/95 rounded-3xl shadow-sm border border-emerald-100 dark:border-gray-700 hover:-translate-y-1 hover:scale-[1.01] transition duration-300 hover:shadow-xl">

                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 text-emerald-700 dark:text-emerald-200 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <s.icon className="w-6 h-6" />
                </div>

                <span className="inline-flex px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs uppercase tracking-widest shadow-sm">
                  {s.step}
                </span>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3 mb-3">
                  {s.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                  {s.desc}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>
      {/* ABOUT HRMS */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div className="text-center mb-12 animate-fadeIn">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">
              About Our HR Management System
            </h2>

            <p className="mt-5 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed text-base md:text-lg">
              Our Human Resource Management System (HRMS) is a modern web-based
              platform designed to simplify and automate core HR operations within
              an organization. It helps businesses efficiently manage employees,
              attendance, leave requests, and payroll while improving productivity
              and transparency across departments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">

            <div className="bg-white dark:bg-gray-800 p-7 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 hover:-translate-y-1 hover:shadow-xl transition duration-300">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                Employee Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                HR and administrators can add, update, and manage employee records
                efficiently while maintaining structured employee data within the system.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-7 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 hover:-translate-y-1 hover:shadow-xl transition duration-300">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                Attendance & Leave Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Employees can mark attendance and apply for leave, while HR managers
                can approve or reject requests with complete visibility of employee activity.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-7 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 hover:-translate-y-1 hover:shadow-xl transition duration-300">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                Payroll & Reports
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                The system provides payroll management and reporting features to
                streamline salary processing and generate useful insights for HR teams.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-gray-900 py-12 border-t border-emerald-100 dark:border-gray-700">
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-1.5 rounded-lg shadow-sm">
            <ShieldCheckIcon className="h-4 w-4 text-white" />
          </div>
          <span className="font-extrabold tracking-tight text-xl text-gray-900 dark:text-white">
            HRMS.
          </span>
        </div>

        <p className="text-gray-500 dark:text-gray-400 font-bold text-[11px] uppercase tracking-widest text-center px-6">
          © {new Date().getFullYear()} HRMS Solution. Smart • Secure • Simple.
        </p>
      </footer>

    </div>
  );
};

export default Home;