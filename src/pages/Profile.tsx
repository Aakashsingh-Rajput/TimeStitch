
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Edit3, Save, X, User, Mail, Phone, MapPin, Calendar, ArrowLeft, Linkedin, Github, Twitter, Instagram, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  joinDate: string;
  linkedin: string;
  github: string;
  twitter: string;
  instagram: string;
  website: string;
}

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    joinDate: '',
    linkedin: '',
    github: '',
    twitter: '',
    instagram: '',
    website: ''
  });
  
  const [editProfile, setEditProfile] = useState<ProfileData>(profile);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user && !profile.email) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const joinDate = user.created_at 
        ? new Date(user.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        : 'Recently';

      if (data) {
        const profileData: ProfileData = {
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: user.email || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
          joinDate: joinDate,
          linkedin: data.linkedin || '',
          github: data.github || '',
          twitter: data.twitter || '',
          instagram: data.instagram || '',
          website: data.website || ''
        };
        setProfile(profileData);
        setEditProfile(profileData);
      } else {
        // Initialize with user data if no profile exists
        const profileData: ProfileData = {
          firstName: '',
          lastName: '',
          email: user.email || '',
          phone: '',
          location: '',
          bio: '',
          joinDate: joinDate,
          linkedin: '',
          github: '',
          twitter: '',
          instagram: '',
          website: ''
        };
        setProfile(profileData);
        setEditProfile(profileData);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updates = {
        id: user.id,
        first_name: editProfile.firstName,
        last_name: editProfile.lastName,
        phone: editProfile.phone,
        location: editProfile.location,
        bio: editProfile.bio,
        linkedin: editProfile.linkedin,
        github: editProfile.github,
        twitter: editProfile.twitter,
        instagram: editProfile.instagram,
        website: editProfile.website,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      setProfile(editProfile);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header with Back Button */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="destructive" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-32 relative">
                <div className="absolute -bottom-16 left-8">
                  <div className="relative">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                      {profile.firstName && profile.lastName ? (
                        <span className="text-3xl font-bold text-gray-700">
                          {profile.firstName[0]}{profile.lastName[0]}
                        </span>
                      ) : (
                        <User className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors">
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="pt-20 pb-6 px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.firstName && profile.lastName 
                    ? `${profile.firstName} ${profile.lastName}`
                    : 'Your Name'
                  }
                </h1>
                <p className="text-gray-600 mb-4">{profile.email}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {profile.joinDate}
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  {isEditing ? (
                    <Input
                      value={editProfile.firstName}
                      onChange={(e) => setEditProfile({...editProfile, firstName: e.target.value})}
                      placeholder="Enter your first name"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.firstName || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  {isEditing ? (
                    <Input
                      value={editProfile.lastName}
                      onChange={(e) => setEditProfile({...editProfile, lastName: e.target.value})}
                      placeholder="Enter your last name"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.lastName || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  {isEditing ? (
                    <Input
                      value={editProfile.phone}
                      onChange={(e) => setEditProfile({...editProfile, phone: e.target.value})}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.phone || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  {isEditing ? (
                    <Input
                      value={editProfile.location}
                      onChange={(e) => setEditProfile({...editProfile, location: e.target.value})}
                      placeholder="Enter your location"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.location || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About Me</h2>
              {isEditing ? (
                <textarea
                  value={editProfile.bio}
                  onChange={(e) => setEditProfile({...editProfile, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {profile.bio || 'No bio yet. Click Edit Profile to add one!'}
                </p>
              )}
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Linkedin className="w-4 h-4 mr-2 text-blue-600" />
                    LinkedIn
                  </label>
                  {isEditing ? (
                    <Input
                      value={editProfile.linkedin}
                      onChange={(e) => setEditProfile({...editProfile, linkedin: e.target.value})}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  ) : (
                    profile.linkedin ? (
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.linkedin}
                      </a>
                    ) : (
                      <p className="text-gray-500">Not set</p>
                    )
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Github className="w-4 h-4 mr-2 text-gray-800" />
                    GitHub
                  </label>
                  {isEditing ? (
                    <Input
                      value={editProfile.github}
                      onChange={(e) => setEditProfile({...editProfile, github: e.target.value})}
                      placeholder="https://github.com/yourusername"
                    />
                  ) : (
                    profile.github ? (
                      <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">
                        {profile.github}
                      </a>
                    ) : (
                      <p className="text-gray-500">Not set</p>
                    )
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                    Twitter
                  </label>
                  {isEditing ? (
                    <Input
                      value={editProfile.twitter}
                      onChange={(e) => setEditProfile({...editProfile, twitter: e.target.value})}
                      placeholder="https://twitter.com/yourusername"
                    />
                  ) : (
                    profile.twitter ? (
                      <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {profile.twitter}
                      </a>
                    ) : (
                      <p className="text-gray-500">Not set</p>
                    )
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Instagram className="w-4 h-4 mr-2 text-pink-500" />
                    Instagram
                  </label>
                  {isEditing ? (
                    <Input
                      value={editProfile.instagram}
                      onChange={(e) => setEditProfile({...editProfile, instagram: e.target.value})}
                      placeholder="https://instagram.com/yourusername"
                    />
                  ) : (
                    profile.instagram ? (
                      <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">
                        {profile.instagram}
                      </a>
                    ) : (
                      <p className="text-gray-500">Not set</p>
                    )
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-green-600" />
                    Website
                  </label>
                  {isEditing ? (
                    <Input
                      value={editProfile.website}
                      onChange={(e) => setEditProfile({...editProfile, website: e.target.value})}
                      placeholder="https://yourwebsite.com"
                    />
                  ) : (
                    profile.website ? (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                        {profile.website}
                      </a>
                    ) : (
                      <p className="text-gray-500">Not set</p>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Activity</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="text-3xl font-bold">12</div>
                  <div className="text-blue-100">Projects</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                  <div className="text-3xl font-bold">48</div>
                  <div className="text-purple-100">Memories</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                  <div className="text-3xl font-bold">156</div>
                  <div className="text-green-100">Photos</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                  <div className="text-3xl font-bold">89</div>
                  <div className="text-orange-100">Days Active</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Create Memory
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <User className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">TimeStitch</h3>
              <p className="text-gray-400 text-sm">
                Capture and preserve your precious moments forever with rich stories and beautiful imagery.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Projects</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Memories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Gallery</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sharing</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} TimeStitch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Profile;
