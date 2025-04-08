import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const navigate = useNavigate();
  
  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/pacientes');
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">CRM Acesso Oftalmologia</h1>
        <p className="text-muted-foreground">Sistema de gestão de pacientes</p>
      </div>
      
      <AuthForm />
      
      <div className="mt-8 text-sm text-muted-foreground text-center">
        <p>© 2025 Acesso Oftalmologia. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}
