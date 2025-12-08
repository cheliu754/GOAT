import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Main Footer Content */}
        <div className="py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎓</span>
              </div>
              <div>
                <div className="text-white leading-tight text-sm">CollegeTrack</div>
                <div className="text-xs text-gray-400">Application Manager</div>
              </div>
            </Link>
            <p className="text-xs text-gray-400 max-w-lg">
              The ultimate college application tracking platform. Manage deadlines, essays, and recommendations all in one place.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-2 text-center">
          <p className="text-xs text-gray-500">
            &copy; {currentYear} CollegeTrack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}