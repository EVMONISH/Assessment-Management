import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { 
  FaBook, 
  FaClipboardCheck, 
  FaChartLine,
  FaPlus,
  FaTrash,
  FaSave,
  FaSpinner,
  FaHome,
  FaUserGraduate,
  FaChalkboardTeacher
} from 'react-icons/fa';
import { assignmentAPI, examAPI, marksAPI } from '../services/api';

const Dashboard = ({ user, onLogout }) => {
  // Safety check
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-500">User data not found. Please login again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('dashboard');
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Teacher forms state
  const [newAssignment, setNewAssignment] = useState({ 
    title: '', subject: '', dueDate: '', description: '' 
  });
  const [newExam, setNewExam] = useState({ 
    examName: '', subject: '', date: '', duration: '', totalMarks: '' 
  });
  const [newMark, setNewMark] = useState({ 
    registrationNumber: '', assessmentType: 'assignment', assessmentName: '', marksObtained: '', semester: '' 
  });

  // Fetch data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'assignments' || activeTab === 'dashboard') {
        const response = await assignmentAPI.getAll();
        if (response.data.success) {
          setAssignments(response.data.assignments || []);
        }
      }
      
      if (activeTab === 'exams' || activeTab === 'dashboard') {
        const response = await examAPI.getAll();
        if (response.data.success) {
          setExams(response.data.exams || []);
        }
      }
      
      if (activeTab === 'marks' || activeTab === 'dashboard') {
        const response = await marksAPI.getAll();
        if (response.data.success) {
          setMarks(response.data.marks || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add Assignment (Teacher only)
  const addAssignment = async () => {
    if (!newAssignment.title.trim()) {
      alert('Please enter assignment title');
      return;
    }
    
    try {
      setLoading(true);
      const response = await assignmentAPI.create(newAssignment);
      
      if (response.data.success) {
        alert('Assignment created successfully!');
        setNewAssignment({ title: '', subject: '', dueDate: '', description: '' });
        fetchData(); // Refresh data
      } else {
        alert(response.data.message || 'Failed to create assignment');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  // Add Exam (Teacher only)
  const addExam = async () => {
    if (!newExam.examName.trim()) {
      alert('Please enter exam name');
      return;
    }
    
    try {
      setLoading(true);
      const response = await examAPI.create({
        ...newExam,
        duration: parseInt(newExam.duration),
        totalMarks: parseInt(newExam.totalMarks)
      });
      
      if (response.data.success) {
        alert('Exam created successfully!');
        setNewExam({ examName: '', subject: '', date: '', duration: '', totalMarks: '' });
        fetchData(); // Refresh data
      } else {
        alert(response.data.message || 'Failed to create exam');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  // Add Marks (Teacher only)
  const addMarks = async () => {
    if (!newMark.registrationNumber.trim()) {
      alert('Please enter registration number');
      return;
    }
    
    try {
      setLoading(true);
      const response = await marksAPI.add({
        ...newMark,
        marksObtained: parseInt(newMark.marksObtained)
      });
      
      if (response.data.success) {
        alert('Marks added successfully!');
        setNewMark({ 
          registrationNumber: '', 
          assessmentType: 'assignment', 
          assessmentName: '', 
          marksObtained: '', 
          semester: '' 
        });
        fetchData(); // Refresh data
      } else {
        alert(response.data.message || 'Failed to add marks');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add marks');
    } finally {
      setLoading(false);
    }
  };

  // Delete Assignment (Teacher only)
  const deleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      setLoading(true);
      const response = await assignmentAPI.delete(id);
      
      if (response.data.success) {
        alert('Assignment deleted successfully!');
        fetchData(); // Refresh data
      } else {
        alert(response.data.message || 'Failed to delete assignment');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setLoading(false);
    }
  };

  // Delete Exam (Teacher only)
  const deleteExam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    
    try {
      setLoading(true);
      const response = await examAPI.delete(id);
      
      if (response.data.success) {
        alert('Exam deleted successfully!');
        fetchData(); // Refresh data
      } else {
        alert(response.data.message || 'Failed to delete exam');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete exam');
    } finally {
      setLoading(false);
    }
  };

  // Filter marks for student
  const getStudentMarks = () => {
    if (user.userType === 'student') {
      return marks.filter(mark => 
        mark.registrationNumber === user.registrationNumber
      );
    }
    return marks;
  };

  // Calculate CGPA for student
  const calculateCGPA = () => {
    const studentMarks = getStudentMarks();
    if (studentMarks.length === 0) return { overallCGPA: 0, semesterData: {} };

    // Group by semester
    const semesterData = {};
    studentMarks.forEach(mark => {
      const semester = mark.semester;
      if (!semesterData[semester]) {
        semesterData[semester] = {
          totalGradePoints: 0,
          totalSubjects: 0,
          marks: []
        };
      }
      
      // Calculate grade point
      let gradePoint = 0;
      if (mark.marksObtained >= 90) gradePoint = 10;
      else if (mark.marksObtained >= 80) gradePoint = 9;
      else if (mark.marksObtained >= 70) gradePoint = 8;
      else if (mark.marksObtained >= 60) gradePoint = 7;
      else if (mark.marksObtained >= 50) gradePoint = 6;
      else if (mark.marksObtained >= 40) gradePoint = 5;
      
      semesterData[semester].totalGradePoints += gradePoint;
      semesterData[semester].totalSubjects += 1;
      semesterData[semester].marks.push({
        ...mark,
        gradePoint: gradePoint,
        grade: mark.marksObtained >= 90 ? 'O' :
               mark.marksObtained >= 80 ? 'A+' :
               mark.marksObtained >= 70 ? 'A' :
               mark.marksObtained >= 60 ? 'B+' :
               mark.marksObtained >= 50 ? 'B' :
               mark.marksObtained >= 40 ? 'C' : 'F'
      });
    });

    // Calculate overall CGPA
    let totalGradePoints = 0;
    let totalSubjects = 0;
    
    Object.values(semesterData).forEach(semester => {
      totalGradePoints += semester.totalGradePoints;
      totalSubjects += semester.totalSubjects;
    });
    
    const overallCGPA = totalSubjects > 0 ? (totalGradePoints / totalSubjects).toFixed(2) : 0;

    return { overallCGPA, semesterData };
  };

  // Render Teacher Forms
  const renderTeacherForms = () => {
    if (user.userType !== 'teacher') return null;

    switch (activeTab) {
      case 'assignments':
        return (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Create New Assignment</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <input
                  type="text"
                  placeholder="Assignment Title *"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Subject *"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={newAssignment.subject}
                  onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Description"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                />
              </div>
            </div>
            <button 
              onClick={addAssignment}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className="mr-2" />}
              {loading ? 'Creating...' : 'Add Assignment'}
            </button>
          </div>
        );

      case 'exams':
        return (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Create New Exam</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <input
                  type="text"
                  placeholder="Exam Name *"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={newExam.examName}
                  onChange={(e) => setNewExam({...newExam, examName: e.target.value})}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Subject *"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={newExam.subject}
                  onChange={(e) => setNewExam({...newExam, subject: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Exam Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={newExam.date}
                  onChange={(e) => setNewExam({...newExam, date: e.target.value})}
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={newExam.duration}
                  onChange={(e) => setNewExam({...newExam, duration: e.target.value})}
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Total Marks"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={newExam.totalMarks}
                  onChange={(e) => setNewExam({...newExam, totalMarks: e.target.value})}
                />
              </div>
            </div>
            <button 
              onClick={addExam}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className="mr-2" />}
              {loading ? 'Creating...' : 'Add Exam'}
            </button>
          </div>
        );

      case 'marks':
        return (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Add Student Marks</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <input
                  type="text"
                  placeholder="Registration Number *"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={newMark.registrationNumber}
                  onChange={(e) => setNewMark({...newMark, registrationNumber: e.target.value})}
                />
              </div>
              <div>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={newMark.assessmentType}
                  onChange={(e) => setNewMark({...newMark, assessmentType: e.target.value})}
                >
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Assessment Name *"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={newMark.assessmentName}
                  onChange={(e) => setNewMark({...newMark, assessmentName: e.target.value})}
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Marks (0-100) *"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={newMark.marksObtained}
                  onChange={(e) => setNewMark({...newMark, marksObtained: e.target.value})}
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={newMark.semester}
                  onChange={(e) => setNewMark({...newMark, semester: e.target.value})}
                  placeholder="e.g., Semester 1"
                />
              </div>
            </div>
            <button 
              onClick={addMarks}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
              {loading ? 'Saving...' : 'Save Marks'}
            </button>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                💡 <strong>Note:</strong> Student can only see marks with matching Registration Number
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render Content
  const renderContent = () => {
    if (loading && activeTab !== 'dashboard') {
      return (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      );
    }

    const studentMarks = getStudentMarks();
    const { overallCGPA, semesterData } = calculateCGPA();
    const semesters = Object.keys(semesterData).sort();

    switch (activeTab) {
      case 'assignments':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {user.userType === 'teacher' ? 'Manage Assignments' : 'My Assignments'}
            </h2>
            
            {renderTeacherForms()}
            
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                {user.userType === 'teacher' ? 'All Assignments' : 'Assignments List'}
              </h3>
              {assignments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {user.userType === 'teacher' ? 'No assignments created yet' : 'No assignments assigned yet'}
                </p>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{assignment.subject}</p>
                          {assignment.description && (
                            <p className="text-gray-500 text-sm mt-2">{assignment.description}</p>
                          )}
                          <p className="text-gray-500 text-sm mt-2">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {new Date(assignment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {user.userType === 'teacher' && (
                          <button
                            onClick={() => deleteAssignment(assignment._id)}
                            className="text-red-500 hover:text-red-700 ml-4"
                            disabled={loading}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'exams':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {user.userType === 'teacher' ? 'Manage Exams' : 'Upcoming Exams'}
            </h2>
            
            {renderTeacherForms()}
            
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                {user.userType === 'teacher' ? 'All Exams' : 'Exams Schedule'}
              </h3>
              {exams.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {user.userType === 'teacher' ? 'No exams created yet' : 'No exams scheduled yet'}
                </p>
              ) : (
                <div className="space-y-4">
                  {exams.map((exam) => (
                    <div key={exam._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{exam.examName}</h4>
                          <p className="text-gray-600 text-sm mt-1">{exam.subject}</p>
                          <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                            <span>Date: {new Date(exam.date).toLocaleDateString()}</span>
                            <span>Duration: {exam.duration} mins</span>
                            <span>Total Marks: {exam.totalMarks}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {new Date(exam.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {user.userType === 'teacher' && (
                          <button
                            onClick={() => deleteExam(exam._id)}
                            className="text-red-500 hover:text-red-700 ml-4"
                            disabled={loading}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'marks':
        if (user.userType === 'teacher') {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-6">Manage Marks</h2>
              
              {renderTeacherForms()}
              
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">All Students Marks</h3>
                
                {marks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No marks recorded yet</p>
                ) : (
                  <div>
                    {/* Quick Stats for Teacher */}
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">Total Students</p>
                        <p className="text-2xl font-bold text-blue-800">
                          {[...new Set(marks.map(m => m.registrationNumber))].length}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600">Total Assessments</p>
                        <p className="text-2xl font-bold text-green-800">{marks.length}</p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-yellow-600">Average Marks</p>
                        <p className="text-2xl font-bold text-yellow-800">
                          {(marks.reduce((sum, m) => sum + m.marksObtained, 0) / marks.length).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-600">Failed (40%)</p>
                        <p className="text-2xl font-bold text-red-800">
                          {marks.filter(m => m.marksObtained < 40).length}
                        </p>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="p-3 text-left">Reg No</th>
                            <th className="p-3 text-left">Assessment</th>
                            <th className="p-3 text-left">Type</th>
                            <th className="p-3 text-left">Marks</th>
                            <th className="p-3 text-left">Semester</th>
                            <th className="p-3 text-left">Grade</th>
                            <th className="p-3 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {marks.map((mark) => (
                            <tr key={mark._id} className="border-b">
                              <td className="p-3 font-medium">{mark.registrationNumber}</td>
                              <td className="p-3">{mark.assessmentName}</td>
                              <td className="p-3 capitalize">{mark.assessmentType}</td>
                              <td className="p-3">
                                <span className={`font-bold ${mark.marksObtained >= 40 ? 'text-green-600' : 'text-red-600'}`}>
                                  {mark.marksObtained}/100
                                </span>
                              </td>
                              <td className="p-3">{mark.semester}</td>
                              <td className="p-3">
                                {mark.marksObtained >= 90 ? 'O' : 
                                 mark.marksObtained >= 80 ? 'A+' :
                                 mark.marksObtained >= 70 ? 'A' :
                                 mark.marksObtained >= 60 ? 'B+' :
                                 mark.marksObtained >= 50 ? 'B' :
                                 mark.marksObtained >= 40 ? 'C' : 'F'}
                              </td>
                              <td className="p-3">{new Date(mark.date).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        } else {
          // Student Marks View with CGPA
          return (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Marks & CGPA</h2>
              
              {studentMarks.length === 0 ? (
                <div className="bg-green-200 rounded-xl shadow p-6">
                  <p className="text-gray-500 text-center py-8">No marks available yet</p>
                </div>
              ) : (
                <>
                  {/* CGPA Section */}
                  <div className=" from-purple-500 to-pink-500 text-black rounded-xl shadow-lg p-6 mb-8">
                    <h3 className="text-xl font-bold mb-6">📊 Academic Performance</h3>
                    
                    {/* Overall CGPA */}
                    <div className="bg-blue-200 backdrop-blur-sm rounded-xl p-6 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold">Overall CGPA</h4>
                          <p className="text-black text-sm">Based on all semesters</p>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold">{overallCGPA}</div>
                          <p className="text-sm text-red-400">out of 10.0</p>
                        </div>
                      </div>
                    </div>

                    {/* Semester-wise CGPA */}
                    <h4 className="text-lg font-semibold mb-4">Semester-wise CGPA</h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {semesters.map((semester, index) => {
                        const semesterCGPA = (semesterData[semester].totalGradePoints / semesterData[semester].totalSubjects).toFixed(2);
                        const colors = [
                          'from-blue-500 to-cyan-400',
                          'from-green-500 to-emerald-400',
                          'from-orange-500 to-amber-400',
                          'from-red-500 to-pink-400',
                          'from-indigo-500 to-purple-400',
                          'from-teal-500 to-green-400'
                        ];
                        
                        return (
                          <div key={semester} className={` ${colors[index % colors.length]} rounded-lg p-4 bg-black`}>
                            <div className="text-center">
                              <h4 className="font-bold text-white">{semester}</h4>
                              <div className="text-3xl font-bold text-white mt-2">{semesterCGPA}</div>
                              <p className="text-sm text-white text-opacity-90">CGPA</p>
                              <p className="text-xs text-white text-opacity-80 mt-1">
                                {semesterData[semester].totalSubjects} subject(s)
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed Marks Table */}
                  <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold">📋 Detailed Marks Breakdown</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Total: {studentMarks.length} assessments</span>
                        <span className="text-sm text-gray-600">|</span>
                        <span className="text-sm text-gray-600">
                          Avg: {(
                            studentMarks.reduce((sum, mark) => sum + mark.marksObtained, 0) / studentMarks.length
                          ).toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="p-3 text-left">Semester</th>
                            <th className="p-3 text-left">Assessment</th>
                            <th className="p-3 text-left">Type</th>
                            <th className="p-3 text-left">Marks</th>
                            <th className="p-3 text-left">Percentage</th>
                            <th className="p-3 text-left">Grade</th>
                            <th className="p-3 text-left">Grade Point</th>
                            <th className="p-3 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentMarks.sort((a, b) => new Date(b.date) - new Date(a.date)).map((mark) => {
                            // Calculate grade and grade point
                            let grade = 'F';
                            let gradePoint = 0;
                            let gradeColor = 'text-red-600';
                            
                            if (mark.marksObtained >= 90) {
                              grade = 'O'; gradePoint = 10; gradeColor = 'text-green-600';
                            } else if (mark.marksObtained >= 80) {
                              grade = 'A+'; gradePoint = 9; gradeColor = 'text-green-600';
                            } else if (mark.marksObtained >= 70) {
                              grade = 'A'; gradePoint = 8; gradeColor = 'text-green-500';
                            } else if (mark.marksObtained >= 60) {
                              grade = 'B+'; gradePoint = 7; gradeColor = 'text-blue-600';
                            } else if (mark.marksObtained >= 50) {
                              grade = 'B'; gradePoint = 6; gradeColor = 'text-blue-500';
                            } else if (mark.marksObtained >= 40) {
                              grade = 'C'; gradePoint = 5; gradeColor = 'text-yellow-600';
                            }

                            return (
                              <tr key={mark._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {mark.semester}
                                  </span>
                                </td>
                                <td className="p-3 font-medium">{mark.assessmentName}</td>
                                <td className="p-3 capitalize">{mark.assessmentType}</td>
                                <td className="p-3">
                                  <span className={`font-bold ${mark.marksObtained >= 40 ? 'text-green-600' : 'text-red-600'}`}>
                                    {mark.marksObtained}/100
                                  </span>
                                </td>
                                <td className="p-3">{mark.marksObtained}%</td>
                                <td className="p-3">
                                  <span className={`font-bold ${gradeColor}`}>{grade}</span>
                                </td>
                                <td className="p-3">
                                  <span className="font-semibold">{gradePoint}</span>
                                </td>
                                <td className="p-3 text-sm text-gray-600">
                                  {new Date(mark.date).toLocaleDateString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Performance Summary */}
                    <div className="mt-8 grid md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">🎯 Performance Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Subjects:</span>
                            <span className="font-semibold">
                              {[...new Set(studentMarks.map(m => m.assessmentName))].length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Assessments:</span>
                            <span className="font-semibold">{studentMarks.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Highest Marks:</span>
                            <span className="font-semibold text-green-600">
                              {Math.max(...studentMarks.map(m => m.marksObtained))}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lowest Marks:</span>
                            <span className="font-semibold text-red-600">
                              {Math.min(...studentMarks.map(m => m.marksObtained))}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">📈 Semester Performance</h4>
                        <div className="space-y-2">
                          {semesters.map(semester => {
                            const semesterMarks = studentMarks.filter(m => m.semester === semester);
                            const avg = semesterMarks.reduce((sum, m) => sum + m.marksObtained, 0) / semesterMarks.length;
                            return (
                              <div key={semester} className="flex justify-between">
                                <span className="text-gray-600">{semester}:</span>
                                <span className={`font-semibold ${avg >= 40 ? 'text-green-600' : 'text-red-600'}`}>
                                  {avg.toFixed(1)}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-800 mb-2">📊 Grade Distribution</h4>
                        <div className="space-y-2">
                          {(() => {
                            const gradeCounts = {
                              'O (90-100)': 0,
                              'A+ (80-89)': 0,
                              'A (70-79)': 0,
                              'B+ (60-69)': 0,
                              'B (50-59)': 0,
                              'C (40-49)': 0,
                              'F (<40)': 0
                            };

                            studentMarks.forEach(mark => {
                              if (mark.marksObtained >= 90) gradeCounts['O (90-100)']++;
                              else if (mark.marksObtained >= 80) gradeCounts['A+ (80-89)']++;
                              else if (mark.marksObtained >= 70) gradeCounts['A (70-79)']++;
                              else if (mark.marksObtained >= 60) gradeCounts['B+ (60-69)']++;
                              else if (mark.marksObtained >= 50) gradeCounts['B (50-59)']++;
                              else if (mark.marksObtained >= 40) gradeCounts['C (40-49)']++;
                              else gradeCounts['F (<40)']++;
                            });

                            return Object.entries(gradeCounts).map(([grade, count]) => (
                              <div key={grade} className="flex justify-between">
                                <span className="text-gray-600">{grade}:</span>
                                <span className="font-semibold">{count}</span>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Pass/Fail Status */}
                    <div className="mt-6 p-4  from-blue-50 to-cyan-50 border border-blue-300 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900">Status Check</h4>
                          <p className="text-sm text-blue-700">
                            {studentMarks.filter(m => m.marksObtained < 40).length === 0 ? (
                              <span className="text-green-600 font-semibold">✅ All subjects passed</span>
                            ) : (
                              <span className="text-red-600 font-semibold">
                                ⚠️ {studentMarks.filter(m => m.marksObtained < 40).length} subject(s) need improvement
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-blue-800">
                            Registration: <span className="font-semibold">{user.registrationNumber}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        }

      default: // dashboard
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Welcome, {user.name}!</h2>
            <p className="text-gray-600 mb-8">
              You are logged in as a {user.userType}. 
              {user.registrationNumber && ` Registration: ${user.registrationNumber}`}
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-500 text-white p-6 rounded-xl">
                <FaBook className="text-3xl mb-4" />
                <h3 className="text-xl font-bold">Assignments</h3>
                <p className="text-3xl font-bold mt-2">{assignments.length}</p>
                <p className="text-blue-100 text-sm mt-1">
                  {user.userType === 'teacher' ? 'Created' : 'Assigned'}
                </p>
              </div>
              
              <div className="bg-green-500 text-white p-6 rounded-xl">
                <FaClipboardCheck className="text-3xl mb-4" />
                <h3 className="text-xl font-bold">Exams</h3>
                <p className="text-3xl font-bold mt-2">{exams.length}</p>
                <p className="text-green-100 text-sm mt-1">
                  {user.userType === 'teacher' ? 'Created' : 'Upcoming'}
                </p>
              </div>
              
              <div className="bg-purple-500 text-white p-6 rounded-xl">
                <FaChartLine className="text-3xl mb-4" />
                <h3 className="text-xl font-bold">
                  {user.userType === 'teacher' ? 'Marks' : 'Performance'}
                </h3>
                <p className="text-3xl font-bold mt-2">
                  {user.userType === 'teacher' ? 
                    marks.length : 
                    overallCGPA > 0 ? `${overallCGPA} CGPA` : 'N/A'
                  }
                </p>
                <p className="text-purple-100 text-sm mt-1">
                  {user.userType === 'teacher' ? 'Recorded' : 'CGPA'}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
  <h3 className="text-lg font-semibold mb-6"></h3>
  
  {/* 5 Images Grid */}
  <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
    {/* Image 1 */}
    <div className="overflow-hidden rounded-lg">
      <img 
        src="/image/class1.jpg" 
        alt="Classroom" 
        className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
      />
    </div>
    
    {/* Image 2 */}
    <div className="overflow-hidden rounded-lg">
      <img 
        src="/image/library1.jpg" 
        alt="Library" 
        className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
      />
    </div>
    
    {/* Image 3 */}
    <div className="overflow-hidden rounded-lg">
      <img 
        src="/image/school1.jpg" 
        alt="School" 
        className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
      />
    </div>
    
    {/* Image 4 */}
    <div className="overflow-hidden rounded-lg">
      <img 
        src="/image/teacher1.jpg" 
        alt="Teacher" 
        className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
      />
    </div>
    
    {/* Image 5 */}
   
  </div>
</div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;