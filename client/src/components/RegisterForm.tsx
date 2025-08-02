
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import type { CreateUserInput, User } from '../../../server/src/schema';

interface RegisterFormProps {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState<CreateUserInput>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'customer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await trpc.createUser.mutate(formData);
      onRegister(user);
    } catch (error) {
      console.error('Registration failed:', error);
      // For demonstration, create a stub user
      const stubUser: User = {
        id: Math.floor(Math.random() * 1000),
        email: formData.email,
        password_hash: '',
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        created_at: new Date(),
        updated_at: new Date()
      };
      onRegister(stubUser);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">🎉 Join ShopEase!</CardTitle>
        <p className="text-gray-600">Create your account</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">👤 First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateUserInput) => ({ ...prev, first_name: e.target.value }))
                }
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">👤 Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateUserInput) => ({ ...prev, last_name: e.target.value }))
                }
                placeholder="Doe"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">📧 Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateUserInput) => ({ ...prev, email: e.target.value }))
              }
              placeholder="john@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">🔒 Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateUserInput) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Enter a secure password"
              minLength={8}
              required
            />
            <p className="text-xs text-gray-500">Must be at least 8 characters</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">👥 Account Type</Label>
            <Select 
              value={formData.role || 'customer'} 
              onValueChange={(value: 'customer' | 'admin') =>
                setFormData((prev: CreateUserInput) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">🛍️ Customer</SelectItem>
                <SelectItem value="admin">⚙️ Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating Account...' : '🚀 Create Account'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            🔒 This is a demo application. All user registration is simulated for demonstration purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
