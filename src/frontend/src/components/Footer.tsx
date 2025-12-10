import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 text-sm">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <div>
                <div className="text-white leading-tight">CollegeTrack</div>
                <div className="text-[11px] text-gray-400">Application manager</div>
              </div>
            </Link>
          </div>

          <p className="text-gray-500 text-xs sm:text-sm sm:text-right">
            &copy; {currentYear} CollegeTrack · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}