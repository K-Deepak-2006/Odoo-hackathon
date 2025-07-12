
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Search, User, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { sendEmailNotification, getUserEmail } from '@/lib/emailService';

interface UserProfile {
  id: string;
  name: string;
  location: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  isPublic: boolean;
  rating?: number;
  profilePicture?: string;
}

const Browse = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

  // Sample profile photos for demo purposes
  const profilePhotos = [
    'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face'
  ];

  useEffect(() => {
    loadProfiles();
    loadPendingRequests();
    
    // Set up real-time subscription for profiles
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          loadProfiles();
        }
      )
      .subscribe();

    // Set up real-time subscription for swap requests
    const requestsChannel = supabase
      .channel('requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'swap_requests'
        },
        () => {
          loadPendingRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [user?.id]);

  const loadProfiles = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true);
      
      // Only exclude current user if they are authenticated
      if (user?.id) {
        query = query.neq('user_id', user.id);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Error loading profiles:', error);
        return;
      }

      const formattedProfiles = data.map((profile) => ({
        id: profile.user_id,
        name: profile.name,
        location: profile.location || '',
        skillsOffered: profile.skills_offered || [],
        skillsWanted: profile.skills_wanted || [],
        availability: profile.availability || [],
        isPublic: profile.is_public,
        rating: Math.floor(Math.random() * 2) + 4, // Random rating between 4-5
        profilePicture: profile.profile_picture || null
      }));

      setProfiles(formattedProfiles);
    } catch (error) {
      console.error('Unexpected error loading profiles:', error);
    }
  };

  const loadPendingRequests = async () => {
    if (!user?.id) {
      // If user is not authenticated, clear pending requests
      setPendingRequests(new Set());
      return;
    }

    try {
      const { data, error } = await supabase
        .from('swap_requests')
        .select('to_user_id')
        .eq('from_user_id', user.id)
        .eq('status', 'pending');

      if (error) {
        console.error('Error loading pending requests:', error);
        return;
      }

      const pendingUserIds = new Set(data.map(request => request.to_user_id));
      setPendingRequests(pendingUserIds);
    } catch (error) {
      console.error('Unexpected error loading pending requests:', error);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !searchTerm || 
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.skillsOffered.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      profile.skillsWanted.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      profile.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAvailability = availabilityFilter === 'all' || 
      profile.availability.some(avail => avail.toLowerCase().includes(availabilityFilter.toLowerCase()));

    return matchesSearch && matchesAvailability;
  });

  const sendSwapRequest = async (targetUserId: string, targetUserName: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to send swap requests.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get recipient email for notification
      const recipientEmail = await getUserEmail(targetUserId);

      const requestData = {
        from_user_id: user.id,
        from_user_name: user.name || 'User',
        to_user_id: targetUserId,
        to_user_name: targetUserName,
        message: `Hi ${targetUserName}! I'd love to connect for a skill exchange.`,
        status: 'pending'
      };

      const { error } = await supabase
        .from('swap_requests')
        .insert(requestData);

      if (error) {
        console.error('Error sending request:', error);
        toast({
          title: "Error",
          description: "Failed to send swap request. Please try again.",
          variant: "destructive"
        });
      } else {
        // Update local state to show pending status
        setPendingRequests(prev => new Set([...prev, targetUserId]));

        // Send email notification if recipient has email
        if (recipientEmail) {
          await sendEmailNotification({
            to: recipientEmail,
            subject: `New Skill Swap Request from ${user.name}`,
            type: 'request_sent',
            requestData: {
              fromUserName: user.name || 'User',
              toUserName: targetUserName,
              message: requestData.message
            }
          });
        }

        toast({
          title: "Request sent!",
          description: `Your swap request has been sent to ${targetUserName}.`,
        });
      }
    } catch (error) {
      console.error('Unexpected error sending request:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen gradient-primary">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Skill Swap Platform</h1>
            <div className="flex items-center gap-2 text-sm text-white/80 bg-white/10 rounded-full px-4 py-2">
              <User className="h-4 w-4" />
              <span>Find your perfect skill match</span>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-40 bg-white/10 backdrop-blur-sm border-white/30 text-white rounded-xl">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl shadow-xl">
                <SelectItem value="all">All Times</SelectItem>
                <SelectItem value="weekday">Weekdays</SelectItem>
                <SelectItem value="weekend">Weekends</SelectItem>
                <SelectItem value="evening">Evenings</SelectItem>
                <SelectItem value="morning">Mornings</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative flex-1">
              <Input
                placeholder="Search by name, skill, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-24 bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 rounded-xl py-3 text-lg focus-ring"
              />
              <Button 
                size="sm" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4 btn-gradient rounded-lg"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {filteredProfiles.map((profile, index) => (
            <div 
              key={profile.id} 
              className="bg-white/95 backdrop-blur-sm border-0 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                {/* Profile Photo */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden shadow-lg">
                    {profile.profilePicture ? (
                      <img 
                        src={profile.profilePicture} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Show fallback icon when image fails to load
                          const parent = target.parentElement;
                          if (parent) {
                            const fallbackIcon = parent.querySelector('.fallback-icon') as HTMLElement;
                            if (fallbackIcon) {
                              fallbackIcon.style.display = 'block';
                            }
                          }
                        }}
                      />
                    ) : (
                      <img 
                        src={profilePhotos[index % profilePhotos.length]} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Show fallback icon when demo image fails to load
                          const parent = target.parentElement;
                          if (parent) {
                            const fallbackIcon = parent.querySelector('.fallback-icon') as HTMLElement;
                            if (fallbackIcon) {
                              fallbackIcon.style.display = 'block';
                            }
                          }
                        }}
                      />
                    )}
                    <User className="h-10 w-10 text-white absolute inset-0 m-auto fallback-icon" style={{ display: profile.profilePicture ? 'none' : 'none' }} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white rounded-full px-2 py-1 shadow-lg">
                    <span className="text-xs font-bold text-white">
                      ⭐ {profile.rating}/5
                    </span>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 truncate">{profile.name}</h3>
                      {profile.location && (
                        <p className="text-lg text-gray-600 truncate flex items-center gap-1 mt-1">
                          📍 {profile.location}
                        </p>
                      )}
                    </div>
                    <Button 
                      size="lg" 
                      variant={pendingRequests.has(profile.id) ? "outline" : "default"}
                      className={pendingRequests.has(profile.id) 
                        ? "ml-4 border-2 border-orange-400 text-orange-600 hover:bg-orange-50 rounded-xl px-6 py-3 text-lg font-semibold" 
                        : "ml-4 btn-gradient rounded-xl px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl"
                      }
                      onClick={() => sendSwapRequest(profile.id, profile.name)}
                      disabled={pendingRequests.has(profile.id)}
                    >
                      {pendingRequests.has(profile.id) ? (
                        <>
                          <Clock className="h-5 w-5 mr-2" />
                          Pending
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-5 w-5 mr-2" />
                          Request
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Skills */}
                  <div className="space-y-4">
                    {profile.skillsOffered.length > 0 && (
                      <div>
                        <span className="text-sm font-semibold text-gray-700 block mb-2 flex items-center gap-2">
                          🎯 Skills offered:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {profile.skillsOffered.slice(0, 3).map((skill, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className="text-sm py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 rounded-full font-medium shadow-md"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {profile.skillsOffered.length > 3 && (
                            <Badge className="text-sm py-2 px-4 bg-gray-200 text-gray-700 rounded-full font-medium">
                              +{profile.skillsOffered.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {profile.skillsWanted.length > 0 && (
                      <div>
                        <span className="text-sm font-semibold text-gray-700 block mb-2 flex items-center gap-2">
                          🎓 Skills wanted:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {profile.skillsWanted.slice(0, 3).map((skill, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-sm py-2 px-4 border-2 border-emerald-400 text-emerald-600 rounded-full font-medium bg-emerald-50"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {profile.skillsWanted.length > 3 && (
                            <Badge className="text-sm py-2 px-4 border-2 border-gray-300 text-gray-600 rounded-full font-medium bg-gray-50">
                              +{profile.skillsWanted.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-white/80 font-medium">
              {searchTerm 
                ? "No profiles match your search criteria." 
                : "No public profiles available at the moment."
              }
            </p>
            <p className="text-lg text-white/60 mt-2">
              Try adjusting your search or filters to find more matches.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
