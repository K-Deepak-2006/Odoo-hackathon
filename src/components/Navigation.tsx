
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Search, 
  MessageSquare, 
  Settings, 
  LogOut,
  Home,
  Users
} from 'lucide-react';

const Navigation = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  if (!user) {
    return (
      <nav className="bg-white/95 backdrop-blur-sm border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            SkillSwap
          </Link>
          <div className="flex gap-4">
            <Button variant="ghost" asChild className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl px-6 py-2">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild className="btn-gradient px-6 py-2 rounded-xl">
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          SkillSwap
        </Link>
        
        <div className="flex items-center gap-4">
          <Button 
            variant={isActive('/') ? 'default' : 'ghost'} 
            size="sm" 
            asChild
            className={isActive('/') 
              ? 'btn-gradient rounded-xl px-4 py-2' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl px-4 py-2'
            }
          >
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
          
          <Button 
            variant={isActive('/browse') ? 'default' : 'ghost'} 
            size="sm" 
            asChild
            className={isActive('/browse') 
              ? 'btn-secondary-gradient rounded-xl px-4 py-2' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl px-4 py-2'
            }
          >
            <Link to="/browse" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Browse
            </Link>
          </Button>
          
          <Button 
            variant={isActive('/requests') ? 'default' : 'ghost'} 
            size="sm" 
            asChild
            className={isActive('/requests') 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl px-4 py-2 border-0' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl px-4 py-2'
            }
          >
            <Link to="/requests" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Requests
            </Link>
          </Button>
          
          <Button 
            variant={isActive('/profile') ? 'default' : 'ghost'} 
            size="sm" 
            asChild
            className={isActive('/profile') 
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl px-4 py-2 border-0' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl px-4 py-2'
            }
          >
            <Link to="/profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </Link>
          </Button>
          
          {isAdmin && (
            <Button 
              variant={isActive('/admin') ? 'default' : 'ghost'} 
              size="sm" 
              asChild
              className={isActive('/admin') 
                ? 'bg-gradient-to-r from-red-500 to-purple-600 text-white rounded-xl px-4 py-2 border-0' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl px-4 py-2'
              }
            >
              <Link to="/admin" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}
          
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl px-4 py-2">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
