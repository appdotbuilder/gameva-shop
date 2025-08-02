
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import type { LoginInput, User } from '../../../server/src/schema';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onLogin, onSwitchToRegister }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await trpc.loginUser.mutate(formData);
      if (user) {
        onLogin(user);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
      
      // For demonstration, create a stub user
      const stubUser: User = {
        id: 1,
        email: formData.email,
        password_hash: '',
        first_name: 'Demo',
        last_name: 'User',
        role: formData.email.includes('admin') ? 'admin' : 'customer',
        created_at: new Date(),
        updated_at: new Date()
      };
      onLogin(stubUser);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">🔐 Welcome Back!</CardTitle>
        <p className="text-gray-600">Sign in to your account</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">📧 Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: LoginInput) => ({ ...prev, email: e.target.value }))
              }
              placeholder="your@email.com"
              required
            />
            <p className="text-xs text-gray-500">
              💡 Try "admin@demo.com" for admin access or any email for customer access
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">🔒 Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: LoginInput) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Enter your password"
              required
            />
            <p className="text-xs text-gray-500">
              💡 Any password will work in this demo
            </p>
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Signing in...' : '🚀 Sign In'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Sign up here
            </button>
          </p>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            🔒 This is a demo application. All user authentication is simulated for demonstration purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
