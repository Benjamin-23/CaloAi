'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Chrome } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthForm() {
    const { signInWithMagicLink, signInWithGoogle, user, signOut } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            await signInWithMagicLink(email);
            toast.success('Check your email for the magic link!');
        } catch (error) {
            toast.error('Failed to send magic link: ' + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            toast.error('Google sign-in failed: ' + (error as any).message);
            setLoading(false);
        }
    };

    if (user) {
        return (
            <Card className="w-full max-w-md border-primary/20 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Welcome back!</CardTitle>
                    <CardDescription>You are signed in as {user.email}</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="outline" onClick={signOut} className="w-full">
                        Sign Out
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md border-primary/20 bg-background/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">Sign in to CaloAi</CardTitle>
                <CardDescription>
                    Save your wellness searches and access your personalized history.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Tabs defaultValue="magic-link" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
                        <TabsTrigger value="google">Google</TabsTrigger>
                    </TabsList>

                    <TabsContent value="magic-link" className="space-y-4">
                        <form onSubmit={handleMagicLink} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-background/80"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                                Send Magic Link
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="google">
                        <Button variant="outline" onClick={handleGoogleSignIn} className="w-full py-6" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4 text-primary" />}
                            Continue with Google
                        </Button>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-center text-muted-foreground w-full">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </CardFooter>
        </Card>
    );
}
