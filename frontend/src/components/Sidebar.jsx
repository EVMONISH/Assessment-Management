import React from 'react';
import { 
  FaHome, 
  FaBook, 
  FaClipboardCheck, 
  FaChartLine, 
  FaSignOutAlt,
  FaUserGraduate,
  FaChalkboardTeacher 
} from 'react-icons/fa';

const Sidebar = ({ user, activeTab, onTabChange, onLogout }) => {
  const teacherItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
    { id: 'assignments', label: 'Assignments', icon: <FaBook /> },
    { id: 'exams', label: 'Exams', icon: <FaClipboardCheck /> },
    { id: 'marks', label: 'Marks', icon: <FaChartLine /> },
  ];

  const studentItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
    { id: 'assignments', label: 'Assignments', icon: <FaBook /> },
    { id: 'exams', label: 'Exams', icon: <FaClipboardCheck /> },
    { id: 'marks', label: 'My Marks', icon: <FaChartLine /> },
  ];

  const items = user.userType === 'teacher' ? teacherItems : studentItems;

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        {/* User Info */}
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            {user.userType === 'teacher' ? 
              <FaChalkboardTeacher size={20} /> : 
              <FaUserGraduate size={20} />
            }
          </div>
          <div className="ml-3">
            <h3 className="font-bold">{user.name}</h3>
            <p className="text-sm text-gray-300 capitalize">{user.userType}</p>
            {user.registrationNumber && (
              <p className="text-xs text-gray-400">{user.registrationNumber}</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-3 mt-8 text-gray-300 hover:bg-gray-800 rounded-lg"
        >
          <FaSignOutAlt className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;