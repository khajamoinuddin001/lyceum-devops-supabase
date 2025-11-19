
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useToast } from './Toast';

export const Settings: React.FC = () => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const { addToast } = useToast();

    // Profile State
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    // Security State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Preferences State
    const [notifyCourseUpdates, setNotifyCourseUpdates] = useState(false);
    const [notifyMarketing, setNotifyMarketing] = useState(false);

    useEffect(() => {
        const getProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setSession(session);
                setEmail(session.user.email || '');
                
                // Load data from metadata
                const meta = session.user.user_metadata || {};
                setFullName(meta.full_name || '');
                setPhone(meta.phone || '');
                setNotifyCourseUpdates(meta.notifications?.course_updates ?? true);
                setNotifyMarketing(meta.notifications?.marketing ?? false);
            }
        };
        getProfile();
    }, []);

    const handleProfileUpdate = async () => {
        setProfileLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    phone: phone,
                }
            });

            if (error) throw error;
            addToast("Profile information updated!", "success");
        } catch (error: any) {
            addToast(error.message, "error");
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePreferenceUpdate = async (key: string, value: boolean) => {
        // Optimistic update
        if (key === 'course_updates') setNotifyCourseUpdates(value);
        if (key === 'marketing') setNotifyMarketing(value);

        try {
            // Merge with existing notifications
            const currentMeta = session?.user?.user_metadata?.notifications || {};
            const { error } = await supabase.auth.updateUser({
                data: {
                    notifications: {
                        ...currentMeta,
                        [key]: value
                    }
                }
            });
            if (error) throw error;
            addToast("Preferences saved.", "success");
        } catch (error: any) {
            addToast("Failed to save preference.", "error");
        }
    };

    const handlePasswordUpdate = async () => {
        if (!newPassword || !confirmPassword) {
            addToast("Please fill in all fields", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            addToast("Passwords do not match", "error");
            return;
        }
        if (newPassword.length < 6) {
            addToast("Password must be at least 6 characters", "error");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            addToast("Password updated successfully!", "success");
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            addToast(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-10">
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sm:p-8 space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your profile, security, and preferences.</p>
                </div>

                {/* Profile Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Profile Information</h3>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                         <div className="sm:col-span-6">
                            <div className="flex items-center">
                                <span className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-600 shadow-sm">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${fullName || email}&background=3b82f6&color=fff`} 
                                        alt="Profile" 
                                        className="h-full w-full object-cover"
                                    />
                                </span>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Profile Photo</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Generated automatically from your name.</p>
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                             <input 
                                type="text" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                             />
                        </div>

                        <div className="sm:col-span-3">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                             <input 
                                type="tel" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                             />
                        </div>

                        <div className="sm:col-span-4">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                             <input 
                                type="text" 
                                disabled
                                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500 sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 cursor-not-allowed"
                                value={email}
                                readOnly
                             />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={handleProfileUpdate}
                            disabled={profileLoading}
                            className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                        >
                            {profileLoading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </div>

                {/* Security Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                     <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Security</h3>
                     <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                            <input 
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                            <input 
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                     </div>
                     <div className="mt-4 flex justify-end">
                        <button 
                            onClick={handlePasswordUpdate}
                            disabled={loading}
                            className="bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                     <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Notifications</h3>
                     <div className="mt-4 space-y-4">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input 
                                    id="course_updates" 
                                    type="checkbox" 
                                    checked={notifyCourseUpdates}
                                    onChange={(e) => handlePreferenceUpdate('course_updates', e.target.checked)}
                                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600" 
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="course_updates" className="font-medium text-gray-700 dark:text-gray-300">Course Updates</label>
                                <p className="text-gray-500 dark:text-gray-400">Get notified when a new lesson is added to your enrolled courses.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input 
                                    id="marketing" 
                                    type="checkbox" 
                                    checked={notifyMarketing}
                                    onChange={(e) => handlePreferenceUpdate('marketing', e.target.checked)}
                                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600" 
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="marketing" className="font-medium text-gray-700 dark:text-gray-300">Marketing & Offers</label>
                                <p className="text-gray-500 dark:text-gray-400">Receive updates about new academy features and discounts.</p>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    )
}
