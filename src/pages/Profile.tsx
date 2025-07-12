import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Camera, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  name: string;
  location: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  isPublic: boolean;
  profilePicture?: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || '',
    location: '',
    skillsOffered: [],
    skillsWanted: [],
    availability: [],
    isPublic: true,
    profilePicture: ''
  });
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  const availabilityOptions = [
    'Weekday Mornings',
    'Weekday Afternoons',
    'Weekday Evenings',
    'Weekend Mornings',
    'Weekend Afternoons',
    'Weekend Evenings'
  ];

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setHasExistingProfile(true);
        setProfile({
          name: data.name || user.name || '',
          location: data.location || '',
          skillsOffered: data.skills_offered || [],
          skillsWanted: data.skills_wanted || [],
          availability: data.availability || [],
          isPublic: data.is_public !== false,
          profilePicture: data.profile_picture || ''
        });
      } else {
        setHasExistingProfile(false);
        // No profile exists, use user data as defaults
        setProfile(prev => ({
          ...prev,
          name: user.name || ''
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 2MB for base64 storage)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingImage(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        // Update profile state with base64 image
        setProfile(prev => ({
          ...prev,
          profilePicture: base64String
        }));

        toast({
          title: "Image uploaded!",
          description: "Your profile picture has been updated. Don't forget to save your profile.",
        });

        setIsUploadingImage(false);
      };

      reader.onerror = () => {
        console.error('Error reading file');
        toast({
          title: "Upload failed",
          description: "Failed to read the image file. Please try again.",
          variant: "destructive"
        });
        setIsUploadingImage(false);
      };

      // Read the file as data URL (base64)
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "An error occurred while processing the image.",
        variant: "destructive"
      });
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save your profile.",
        variant: "destructive"
      });
      return;
    }

    if (!profile.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const profileData = {
        user_id: user.id,
        name: profile.name.trim(),
        email: user.email,
        location: profile.location || null,
        skills_offered: profile.skillsOffered,
        skills_wanted: profile.skillsWanted,
        availability: profile.availability,
        is_public: profile.isPublic,
        profile_picture: profile.profilePicture || null
      };

      let error;

      if (hasExistingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id);
        error = updateError;
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData);
        error = insertError;
      }

      if (error) {
        console.error('Error saving profile:', error);
        toast({
          title: "Error",
          description: "Failed to save profile. Please try again.",
          variant: "destructive"
        });
      } else {
        setHasExistingProfile(true);
        toast({
          title: "Profile saved!",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSkillOffered = () => {
    if (newSkillOffered.trim()) {
      setProfile(prev => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, newSkillOffered.trim()]
      }));
      setNewSkillOffered('');
    }
  };

  const addSkillWanted = () => {
    if (newSkillWanted.trim()) {
      setProfile(prev => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, newSkillWanted.trim()]
      }));
      setNewSkillWanted('');
    }
  };

  const removeSkillOffered = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skillsOffered: prev.skillsOffered.filter(s => s !== skill)
    }));
  };

  const removeSkillWanted = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skillsWanted: prev.skillsWanted.filter(s => s !== skill)
    }));
  };

  const toggleAvailability = (option: string) => {
    setProfile(prev => ({
      ...prev,
      availability: prev.availability.includes(option)
        ? prev.availability.filter(a => a !== option)
        : [...prev.availability, option]
    }));
  };

  return (
    <div className="min-h-screen gradient-primary">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 text-white p-8">
            <CardTitle className="text-3xl font-bold">Your Profile</CardTitle>
            <CardDescription className="text-white/90 text-lg">
              Update your information to help others find you for skill exchanges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-2xl">
                  <AvatarImage 
                    src={profile.profilePicture} 
                    alt={profile.name}
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                    {profile.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="flex items-center gap-3 btn-gradient border-0 rounded-xl px-6 py-3 text-lg"
                >
                  {isUploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="h-5 w-5" />
                      {profile.profilePicture ? 'Change Photo' : 'Add Photo'}
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-lg font-semibold text-gray-800">Full Name *</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="text-lg py-3 rounded-xl border-2 focus-ring"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="location" className="text-lg font-semibold text-gray-800">Location</Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  className="text-lg py-3 rounded-xl border-2 focus-ring"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
                <Label className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                  🎯 Skills I Can Offer
                </Label>
                <div className="flex gap-3 mb-4">
                  <Input
                    placeholder="Add a skill you can teach"
                    value={newSkillOffered}
                    onChange={(e) => setNewSkillOffered(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkillOffered()}
                    className="text-lg py-3 rounded-xl border-2 focus-ring"
                  />
                  <Button onClick={addSkillOffered} size="lg" className="btn-gradient rounded-xl px-6">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {profile.skillsOffered.map((skill, index) => (
                    <Badge key={index} className="flex items-center gap-2 text-lg py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 rounded-full">
                      {skill}
                      <X 
                        className="h-4 w-4 cursor-pointer hover:bg-white/20 rounded-full p-0.5" 
                        onClick={() => removeSkillOffered(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6">
                <Label className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                  🎓 Skills I Want to Learn
                </Label>
                <div className="flex gap-3 mb-4">
                  <Input
                    placeholder="Add a skill you want to learn"
                    value={newSkillWanted}
                    onChange={(e) => setNewSkillWanted(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkillWanted()}
                    className="text-lg py-3 rounded-xl border-2 focus-ring"
                  />
                  <Button onClick={addSkillWanted} size="lg" className="btn-secondary-gradient rounded-xl px-6">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {profile.skillsWanted.map((skill, index) => (
                    <Badge key={index} className="flex items-center gap-2 text-lg py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 rounded-full">
                      {skill}
                      <X 
                        className="h-4 w-4 cursor-pointer hover:bg-white/20 rounded-full p-0.5" 
                        onClick={() => removeSkillWanted(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6">
                <Label className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                  📅 Availability
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availabilityOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-3 cursor-pointer bg-white rounded-xl p-4 border-2 border-transparent hover:border-orange-200 transition-all duration-200">
                      <input
                        type="checkbox"
                        checked={profile.availability.includes(option)}
                        onChange={() => toggleAvailability(option)}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-lg font-medium text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={profile.isPublic}
                  onChange={(e) => setProfile(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-6 h-6 rounded"
                />
                <Label htmlFor="isPublic" className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  🌍 Make my profile public (others can find me)
                </Label>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full btn-gradient text-xl py-4 rounded-2xl shadow-xl hover:shadow-2xl" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Saving...
                </>
              ) : (
                <>
                  💾 Save Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
