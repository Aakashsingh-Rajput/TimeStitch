
import React from 'react';
import { User, Home, LogOut, HelpCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProfileDropdown: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-9 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl text-sm flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          <span>Account</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-medium">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-gray-900">{user.user_metadata?.full_name || user.email}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            {!user.email_confirmed_at && (
              <span className="text-xs text-yellow-600">Email not verified</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-50">
          <Link to="/" className="flex items-center">
            <Home className="w-4 h-4 mr-2" />
            <span>Back to Home</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-50">
          <Link to="/profile" className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            <span>View Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-gray-50">
          <Shield className="w-4 h-4 mr-2" />
          <span>Privacy</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-gray-50">
          <HelpCircle className="w-4 h-4 mr-2" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer hover:bg-red-50 text-red-600" onClick={async () => { await signOut(); navigate('/login'); }}>
          <LogOut className="w-4 h-4 mr-2" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
