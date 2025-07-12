
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Check, X, Clock, Send, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { sendEmailNotification, getUserEmail } from '@/lib/emailService';

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

const Requests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<SwapRequest[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadRequests();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('requests-changes')
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
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const loadRequests = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('swap_requests')
      .select('*')
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
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

  const sentRequests = requests.filter(req => req.fromUserId === user?.id);
  const receivedRequests = requests.filter(req => req.toUserId === user?.id);

  const handleAcceptRequest = async (requestId: string) => {
    const request = requests.find(req => req.id === requestId);
    if (!request) return;

    // Get sender email for notification
    const senderEmail = await getUserEmail(request.fromUserId);

    const { error } = await supabase
      .from('swap_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept request. Please try again.",
        variant: "destructive"
      });
    } else {
      // Send email notification to the sender
      if (senderEmail) {
        await sendEmailNotification({
          to: senderEmail,
          subject: 'Your skill swap request was accepted!',
          type: 'request_accepted',
          requestData: {
            fromUserName: request.fromUserName,
            toUserName: request.toUserName,
            message: request.message
          }
        });
      }

      toast({
        title: "Request accepted!",
        description: `You accepted the swap request from ${request?.fromUserName}.`,
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const request = requests.find(req => req.id === requestId);
    if (!request) return;

    // Get sender email for notification
    const senderEmail = await getUserEmail(request.fromUserId);

    const { error } = await supabase
      .from('swap_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive"
      });
    } else {
      // Send email notification to the sender
      if (senderEmail) {
        await sendEmailNotification({
          to: senderEmail,
          subject: 'Update on your skill swap request',
          type: 'request_rejected',
          requestData: {
            fromUserName: request.fromUserName,
            toUserName: request.toUserName,
            message: request.message
          }
        });
      }

      toast({
        title: "Request rejected",
        description: "The swap request has been rejected.",
      });
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
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
        description: "The swap request has been deleted.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="default"><Check className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Swap Requests</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Received Requests */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Send className="h-5 w-5" />
              Received Requests ({receivedRequests.length})
            </h2>
            <div className="space-y-4">
              {receivedRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No requests received yet.</p>
                  </CardContent>
                </Card>
              ) : (
                receivedRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{request.fromUserName}</CardTitle>
                          <CardDescription>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {request.message}
                      </p>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleAcceptRequest(request.id)}
                            size="sm"
                            className="flex-1"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            onClick={() => handleRejectRequest(request.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sent Requests */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Send className="h-5 w-5 rotate-180" />
              Sent Requests ({sentRequests.length})
            </h2>
            <div className="space-y-4">
              {sentRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No requests sent yet.</p>
                  </CardContent>
                </Card>
              ) : (
                sentRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{request.toUserName}</CardTitle>
                          <CardDescription>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(request.status)}
                          {request.status === 'pending' && (
                            <Button
                              onClick={() => handleDeleteRequest(request.id)}
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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

export default Requests;
