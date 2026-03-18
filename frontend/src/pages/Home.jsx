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
   <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200 antialiased transition-colors duration-300">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border-b border-green-100 dark:border-gray-700 py-3">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-emerald-600 p-1.5 rounded-lg shadow-sm">
              <ShieldCheckIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              HR<span className="text-emerald-600">MS</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-[14px] font-semibold text-gray-500 dark:text-gray-300 hover:text-emerald-600 transition">
              Features
            </a>
            <a href="#how-it-works" className="text-[14px] font-semibold text-gray-500 dark:text-gray-300 hover:text-emerald-600 transition">
            How It Works
            </a>
            
          </div>
          

         <div className="hidden md:flex items-center gap-6">

  <ThemeToggle />

  <Link
    to="/login"
    className="text-[14px] font-semibold text-gray-500 dark:text-gray-300 hover:text-emerald-600 transition-colors"
  >
    Login
  </Link>

  <Link
    to="/signup"
    className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-[13px] font-bold hover:bg-emerald-700 transition shadow-sm active:scale-95"
  >
    Get Started
  </Link>

</div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative py-24 bg-gradient-to-b from-green-50/50 dark:from-gray-800 to-white dark:to-gray-900 text-center">
       <div className="relative z-10 max-w-5xl mx-auto px-6 animate-fadeIn">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 mb-6 font-bold text-[10px] uppercase tracking-widest">
            <SparklesIcon className="h-3 w-3" /> Efficiency redefined
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
            Smart Management for <br />
            <span className="text-emerald-600 italic">Modern Teams.</span>
          </h1>

          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed font-medium">
            A comprehensive HRMS designed to eliminate paperwork and automate your entire employee lifecycle seamlessly.
          </p>

          <Link
            to="/signup"
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-[13px] font-bold hover:bg-emerald-700 transition shadow-lg active:scale-95 inline-flex items-center gap-2"
          >
            Sign Up Free <ArrowRightIcon className="h-4 w-4" />
          </Link>

        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-8">

          <div className="text-center mb-16">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Platform Features
            </h2>
            <div className="h-1 w-12 bg-emerald-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {features.map((f, i) => (
              <div
                key={i}
                className="p-8 bg-white dark:bg-gray-800 border border-green-50 dark:border-gray-700 rounded-2xl hover:border-emerald-500 transition hover:shadow-xl"
              >

                <div className="w-12 h-12 bg-green-50 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-6 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <f.icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
                  {f.title}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  {f.desc}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-green-50/30 dark:bg-gray-800 border-y border-green-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-8">

          <div className="text-center mb-16">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-gray-400 dark:text-gray-500 mt-2 font-bold text-[10px] uppercase tracking-widest">
              3 Simple Steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {steps.map((s, i) => (
              <div key={i} className="p-8 text-center bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-green-50 dark:border-gray-700 hover:-translate-y-1 transition">

                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <s.icon className="w-6 h-6" />
                </div>

                <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                  {s.step}
                </span>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 mb-3">
                  {s.title}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  {s.desc}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>
{/* ABOUT HRMS */}
<section className="py-20 bg-gray-50 dark:bg-gray-900">
  <div className="max-w-7xl mx-auto px-6">

    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
        About Our HR Management System
      </h2>

      <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
        Our Human Resource Management System (HRMS) is a modern web-based 
        platform designed to simplify and automate core HR operations within 
        an organization. It helps businesses efficiently manage employees, 
        attendance, leave requests, and payroll while improving productivity 
        and transparency across departments.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-8">

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
          Employee Management
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          HR and administrators can add, update, and manage employee records 
          efficiently while maintaining structured employee data within the system.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
          Attendance & Leave Tracking
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Employees can mark attendance and apply for leave, while HR managers 
          can approve or reject requests with complete visibility of employee activity.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
          Payroll & Reports
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          The system provides payroll management and reporting features to 
          streamline salary processing and generate useful insights for HR teams.
        </p>
      </div>

    </div>

  </div>
</section>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-gray-900 py-12 text-center border-t border-green-100 dark:border-gray-700">
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="bg-emerald-600 p-1 rounded">
            <ShieldCheckIcon className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold tracking-tighter text-lg text-gray-900 dark:text-white">
            HRMS.
          </span>
        </div>

        <p className="text-gray-400 dark:text-gray-500 font-bold text-[10px] uppercase tracking-widest">
          © {new Date().getFullYear()} HRMS Solution. Smart • Secure • Simple.
        </p>
      </footer>

    </div>
  );
};

export default Home;