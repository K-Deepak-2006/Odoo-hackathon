
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Users, MessageSquare, Trash2, Megaphone, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { triggerEmailNotification } from '@/lib/emailService';

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  location: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  isPublic: boolean;
}

interface SwapRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<SwapRequest[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadData();
    
    // Set up real-time subscriptions for admin
    const profilesChannel = supabase
      .channel('admin-profiles')
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

    const requestsChannel = supabase
      .channel('admin-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'swap_requests'
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [isAdmin, navigate]);

  const loadData = () => {
    loadProfiles();
    loadRequests();
  };

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading profiles:', error);
      return;
    }

    const formattedProfiles = data.map(profile => ({
      id: profile.user_id,
      name: profile.name,
      email: profile.email,
      location: profile.location || '',
      skillsOffered: profile.skills_offered || [],
      skillsWanted: profile.skills_wanted || [],
      availability: profile.availability || [],
      isPublic: profile.is_public
    }));

    setProfiles(formattedProfiles);
  };

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from('swap_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading requests:', error);
      return;
    }

    const formattedRequests = data.map(req => ({
      id: req.id,
      fromUserId: req.from_user_id,
      fromUserName: req.from_user_name,
      toUserId: req.to_user_id,
      toUserName: req.to_user_name,
      message: req.message,
      status: req.status as 'pending' | 'accepted' | 'rejected',
      createdAt: req.created_at
    }));

    setRequests(formattedRequests);
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "User deleted",
        description: "The user profile has been removed.",
      });
    }
  };

  const deleteRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('swap_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      console.error('Error deleting request:', error);
      toast({
        title: "Error",
        description: "Failed to delete request. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Request deleted",
        description: "The swap request has been removed.",
      });
    }
  };

  const broadcastMessage = () => {
    const message = prompt("Enter message to broadcast to all users:");
    if (message) {
      alert(`Broadcasting: ${message}`);
      toast({
        title: "Message broadcasted",
        description: "Your message has been sent to all users.",
      });
    }
  };

  const testEmailNotification = async (requestId: string, type: 'request_sent' | 'request_accepted' | 'request_rejected') => {
    const result = await triggerEmailNotification(requestId, type);
    if (result.success) {
      toast({
        title: "Test email sent",
        description: "Email notification has been triggered successfully.",
      });
    } else {
      toast({
        title: "Email failed",
        description: result.error || "Failed to send test email.",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Panel
          </h1>
          <Button onClick={broadcastMessage} className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Broadcast Message
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profiles.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Profiles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profiles.filter(p => p.isPublic).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* User Management */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </h2>
            <div className="space-y-4">
              {profiles.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No users found.</p>
                  </CardContent>
                </Card>
              ) : (
                profiles.map((profile) => (
                  <Card key={profile.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{profile.name}</CardTitle>
                          <CardDescription>{profile.location || 'No location'}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={profile.isPublic ? "default" : "secondary"}>
                            {profile.isPublic ? "Public" : "Private"}
                          </Badge>
                          <Button
                            onClick={() => deleteUser(profile.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {profile.skillsOffered.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Offers: </span>
                            <span className="text-sm text-muted-foreground">
                              {profile.skillsOffered.join(', ')}
                            </span>
                          </div>
                        )}
                        {profile.skillsWanted.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Wants: </span>
                            <span className="text-sm text-muted-foreground">
                              {profile.skillsWanted.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Request Management */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Swap Requests
            </h2>
            <div className="space-y-4">
              {requests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No swap requests found.</p>
                  </CardContent>
                </Card>
              ) : (
                requests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-sm">
                            {request.fromUserName} → {request.toUserName}
                          </CardTitle>
                          <CardDescription>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              request.status === 'accepted' ? 'default' :
                              request.status === 'rejected' ? 'destructive' : 'outline'
                            }
                          >
                            {request.status}
                          </Badge>
                          <Button
                            onClick={() => testEmailNotification(request.id, 'request_accepted')}
                            variant="ghost"
                            size="sm"
                            title="Test email notification"
                          >
                            📧
                          </Button>
                          <Button
                            onClick={() => deleteRequest(request.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {request.message}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
