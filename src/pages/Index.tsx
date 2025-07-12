
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { ArrowRight, Users, Search, MessageSquare, Shield } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen gradient-primary">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Welcome to SkillSwap
            </h1>
            <p className="text-xl text-white/90 mb-8 font-medium">
              Connect, learn, and grow through skill exchange
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group bg-white/95 backdrop-blur-sm border-0">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Browse Skills</CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Discover people with skills you want to learn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full btn-gradient text-lg py-6 rounded-xl">
                  <Link to="/browse">
                    Start Browsing <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group bg-white/95 backdrop-blur-sm border-0">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Swap Requests</CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Manage your skill exchange requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full btn-secondary-gradient text-lg py-6 rounded-xl">
                  <Link to="/requests">
                    View Requests <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group bg-white/95 backdrop-blur-sm border-0">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Your Profile</CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Update your skills and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-6 rounded-xl">
                  <Link to="/profile">
                    Edit Profile <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-primary">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Exchange Skills, Build Connections
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto font-medium leading-relaxed">
            Join SkillSwap to share what you know and learn what you need. 
            Connect with others for meaningful skill exchanges.
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Button asChild size="lg" className="btn-gradient text-xl px-8 py-4 rounded-xl shadow-2xl hover:scale-105 transition-all duration-300">
              <Link to="/register">
                Get Started <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-xl px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 shadow-xl hover:scale-105 transition-all duration-300">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-2xl transition-all duration-300 bg-white/95 backdrop-blur-sm border-0">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-800">Share Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-base leading-relaxed">
                List your expertise and help others learn
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-2xl transition-all duration-300 bg-white/95 backdrop-blur-sm border-0">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-800">Find Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-base leading-relaxed">
                Search for people who can teach you new skills
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-2xl transition-all duration-300 bg-white/95 backdrop-blur-sm border-0">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-800">Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-base leading-relaxed">
                Send requests and arrange skill exchanges
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-2xl transition-all duration-300 bg-white/95 backdrop-blur-sm border-0">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-800">Safe Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-base leading-relaxed">
                Moderated community with user profiles
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
