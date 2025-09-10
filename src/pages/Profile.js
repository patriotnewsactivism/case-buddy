import React, { useState } from 'react';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    company: "Legal Solutions Inc.",
    twoFactorEnabled: true,
    notificationsEnabled: true
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({...profileData});
  const [trialEndDate, setTrialEndDate] = useState("2025-09-24");
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = () => {
    setProfileData({...editedData});
    setIsEditing(false);
  };
  
  const handleChange = (field, value) => {
    setEditedData(prev => ({...prev, [field]: value}));
  };
  
  const toggleTwoFactor = () => {
    setEditedData(prev => ({...prev, twoFactorEnabled: !prev.twoFactorEnabled}));
  };
  
  const toggleNotifications = () => {
    setEditedData(prev => ({...prev, notificationsEnabled: !prev.notificationsEnabled}));
  };
  
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">User Profile</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Account Information</h3>
          {!isEditing ? (
            <button 
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <button 
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Save Changes
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-800 p-3 bg-gray-50 rounded-md">{profileData.fullName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Email Address</label>
            {isEditing ? (
              <input
                type="email"
                value={editedData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-800 p-3 bg-gray-50 rounded-md">{profileData.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Company</label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-800 p-3 bg-gray-50 rounded-md">{profileData.company}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Security Settings</h3>
        
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md mb-3">
          <div>
            <h4 className="font-medium">Two-Factor Authentication</h4>
            <p className="text-gray-600 text-sm">
              {profileData.twoFactorEnabled 
                ? "Enabled - Adds extra security to your account" 
                : "Disabled - Enable for additional security"}
            </p>
          </div>
          <button 
            onClick={toggleTwoFactor}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              editedData.twoFactorEnabled ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span 
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                editedData.twoFactorEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
          <div>
            <h4 className="font-medium">Login Notifications</h4>
            <p className="text-gray-600 text-sm">
              {profileData.notificationsEnabled 
                ? "Enabled - Receive alerts for login attempts" 
                : "Disabled - Enable to receive security alerts"}
            </p>
          </div>
          <button 
            onClick={toggleNotifications}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              editedData.notificationsEnabled ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span 
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                editedData.notificationsEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Subscription</h3>
        
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-md mb-4">
          <div className="flex justify-between">
            <div>
              <h4 className="font-medium text-orange-800">Free Trial</h4>
              <p className="text-orange-700 text-sm">All features unlocked</p>
            </div>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
              Active
            </span>
          </div>
          
          <div className="mt-3">
            <p className="text-orange-700">
              Your free trial ends on <span className="font-semibold">{trialEndDate}</span>
            </p>
          </div>
        </div>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
};

export default Profile;