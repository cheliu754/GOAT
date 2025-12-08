import { useNavigate } from "react-router-dom";
import { Lock, GraduationCap } from "lucide-react";

export default function EmptyDashboard() {
  const navigate = useNavigate();

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
      {/* Header Section */}
      <section className="mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-gray-900 mb-0.5">My Application Dashboard</h1>
            <p className="text-gray-600">Track your college applications and deadlines</p>
          </div>
        </div>
      </section>

      {/* Empty State with Login Prompt */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-gray-900 mb-2">Sign in to Access Your Dashboard</h2>
            <p className="text-gray-600">
              Please sign in or create an account to track your college applications, manage deadlines, and save your favorite schools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/signin")}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center justify-center gap-2 h-11"
            >
              Sign In / Sign Up
            </button>
            <button
              onClick={() => navigate("/colleges")}
              className="w-full sm:w-auto px-6 py-2.5 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors inline-flex items-center justify-center gap-2 h-11"
            >
              <GraduationCap className="w-4 h-4" />
              Browse Colleges
            </button>
          </div>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center opacity-60">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-gray-900 mb-1">Track Applications</h3>
          <p className="text-gray-600 text-sm">Monitor your application progress in real-time</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center opacity-60">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-gray-900 mb-1">Manage Deadlines</h3>
          <p className="text-gray-600 text-sm">Never miss an important deadline</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center opacity-60">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-gray-900 mb-1">View Progress</h3>
          <p className="text-gray-600 text-sm">Visualize your application journey</p>
        </div>
      </div>
    </main>
  );
}