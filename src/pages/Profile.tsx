import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, Upload, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user, refreshSession } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('nome, id')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setName(data.nome || '');
        await fetchAvatar(user?.id);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvatar = async (userId: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .download(`${userId}`);
        
      if (error) {
        if (error.message !== 'The resource was not found') {
          console.error('Error downloading avatar:', error.message);
        }
        return;
      }
      
      const avatarUrl = URL.createObjectURL(data);
      setAvatarUrl(avatarUrl);
    } catch (error: any) {
      console.error('Error downloading avatar:', error.message);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}`;
      const filePath = fileName;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      toast({
        title: "Sucesso!",
        description: "Foto de perfil atualizada com sucesso.",
      });
      
      await fetchAvatar(user?.id as string);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar foto",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      
      // First update the profile in the database
      const { error } = await supabase
        .from('profiles')
        .update({ nome: name })
        .eq('id', user?.id);

      if (error) throw error;

      // Then update the user metadata to have the name available at auth level
      const { error: authError } = await supabase.auth.updateUser({
        data: { nome: name }
      });
      
      if (authError) throw authError;

      // Refresh the session to get updated user data
      await refreshSession();
      
      toast({
        title: "Perfil atualizado",
        description: "Seu nome foi atualizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Perfil do Usuário</h1>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Suas Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={avatarUrl || ''} alt="Foto de perfil" />
                  <AvatarFallback className="bg-muted-foreground/10">
                    <User className="h-12 w-12 text-muted-foreground/50" />
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 rounded-full bg-primary text-white p-1 cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={uploadAvatar}
                    disabled={loading}
                  />
                </label>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Clique no ícone para alterar sua foto</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                disabled={loading} 
              />
            </div>
            
            <Button 
              onClick={updateProfile} 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
