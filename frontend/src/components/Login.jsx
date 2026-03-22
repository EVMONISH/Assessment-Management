import React, { useState } from 'react';
import { FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import { authAPI } from '../services/api';

const Login = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [userType, setUserType] = useState('student');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        registrationNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let response;
            
            if (isLogin) {
                // Login API call
                response = await authAPI.login({
                    email: formData.email,
                    password: formData.password,
                    userType: userType
                });
            } else {
                // Register API call
                response = await authAPI.register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    userType: userType,
                    registrationNumber: userType === 'student' ? formData.registrationNumber : null
                });
            }

            if (response.data.success) {
                // Save token and user data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                onLogin(response.data.user);
            } else {
                setError(response.data.message || 'Something went wrong');
            }

        } catch (err) {
            console.error('API Error:', err);
            setError(err.response?.data?.message || 'Connection failed. Check if backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Assessment Management</h1>
                    
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex mb-6">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 font-medium ${isLogin ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 font-medium ${!isLogin ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                        >
                            Register
                        </button>
                    </div>

                    {/* User Type Selection */}
                    <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-200">
                        <button
                            type="button"
                            onClick={() => setUserType('student')}
                            className={`flex-1 py-3 flex items-center justify-center ${userType === 'student' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            <FaUserGraduate className="mr-2" />
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserType('teacher')}
                            className={`flex-1 py-3 flex items-center justify-center ${userType === 'teacher' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            <FaChalkboardTeacher className="mr-2" />
                            Teacher
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-gray-700 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required={!isLogin}
                                    placeholder="Enter your full name"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-gray-700 mb-2">Email *</label>
                            <input
                                type="email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                                placeholder="Enter email address"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2">Password *</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                                placeholder="Enter password (min 6 characters)"
                                minLength="6"
                            />
                        </div>

                        {!isLogin && userType === 'student' && (
                            <div>
                                <label className="block text-gray-700 mb-2">Registration Number *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.registrationNumber}
                                    onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                                    required={!isLogin && userType === 'student'}
                                    placeholder="e.g., 2023001"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    
                </div>
            </div>
        </div>
    );
};

export default Login;