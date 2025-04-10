import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { 
  ArrowUpDown, FileSpreadsheet, PlusCircle, Trash2, Pencil 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

// Types
type Hospital = {
  id: number;
  nome: string;
  endereco: string;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  telefone: string | null;
  responsavel: string | null;
  contatoSCM: string | null;
  contatoAgendamento: string | null;
};

// Form interface
interface HospitalFormData {
  nome: string;
  endereco: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  responsavel: string;
  contatoSCM: string;
  contatoAgendamento: string;
}

const HospitaisSettings: React.FC = () => {
  const { toast } = useToast();
  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentHospital, setCurrentHospital] = useState<Hospital | null>(null);
  const [formData, setFormData] = useState<HospitalFormData>({
    nome: '',
    endereco: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    responsavel: '',
    contatoSCM: '',
    contatoAgendamento: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof HospitalFormData, string>>>({});
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Check user permissions
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('nivel_acesso')
            .eq('id', session.user.id)
            .single();
          
          setUserRole(profileData?.nivel_acesso || null);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    
    checkUserRole();
  }, []);
  
  const canEdit = userRole === 'Gestor' || userRole === 'Admin' || userRole === 'Super Admin';
  const canDelete = userRole === 'Admin' || userRole === 'Super Admin';

  // Fetch hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('hospitais')
          .select('*');
          
        if (error) throw error;
        
        const formattedData = data.map(h => ({
          id: h.id,
          nome: h.nome,
          endereco: h.endereco || '',
          complemento: h.complemento || '',
          bairro: h.bairro || '',
          cidade: h.cidade || '',
          estado: h.estado || '',
          cep: h.cep || '',
          telefone: h.telefone || '',
          responsavel: h.responsavel || '',
          contatoSCM: h.contato_scm || '',
          contatoAgendamento: h.contato_agendamento || ''
        }));
        
        setHospitais(formattedData);
      } catch (error: any) {
        console.error("Error fetching hospitals:", error);
        toast({ 
          variant: "destructive",
          title: "Erro ao carregar hospitais", 
          description: error.message 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHospitals();
  }, [toast]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof HospitalFormData, string>> = {};
    
    if (!formData.nome.trim()) errors.nome = "Nome é obrigatório.";
    if (!formData.endereco.trim()) errors.endereco = "Endereço é obrigatório.";
    if (!formData.cidade.trim()) errors.cidade = "Cidade é obrigatória.";
    if (formData.estado.trim() && formData.estado.length !== 2) {
      errors.estado = "Estado deve ter 2 caracteres (ex: SP).";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof HospitalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const openAddDialog = () => {
    setCurrentHospital(null);
    setFormData({
      nome: '',
      endereco: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      responsavel: '',
      contatoSCM: '',
      contatoAgendamento: ''
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (hospital: Hospital) => {
    setCurrentHospital(hospital);
    setFormData({
      nome: hospital.nome,
      endereco: hospital.endereco || '',
      complemento: hospital.complemento || '',
      bairro: hospital.bairro || '',
      cidade: hospital.cidade || '',
      estado: hospital.estado || '',
      cep: hospital.cep || '',
      telefone: hospital.telefone || '',
      responsavel: hospital.responsavel || '',
      contatoSCM: hospital.contatoSCM || '',
      contatoAgendamento: hospital.contatoAgendamento || ''
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      toast({ 
        variant: "destructive", 
        title: "Erro de Validação", 
        description: "Corrija os campos indicados." 
      });
      return;
    }
    
    try {
      if (currentHospital) {
        // Update existing hospital
        const { error } = await supabase
          .from('hospitais')
          .update({
            nome: formData.nome,
            endereco: formData.endereco,
            complemento: formData.complemento || null,
            bairro: formData.bairro || null,
            cidade: formData.cidade || null,
            estado: formData.estado || null,
            cep: formData.cep || null,
            telefone: formData.telefone || null,
            responsavel: formData.responsavel || null,
            contato_scm: formData.contatoSCM || null,
            contato_agendamento: formData.contatoAgendamento || null
          })
          .eq('id', currentHospital.id);
        
        if (error) throw error;
        
        setHospitais(prev => prev.map(h => 
          h.id === currentHospital.id ? {
            ...h,
            nome: formData.nome,
            endereco: formData.endereco,
            complemento: formData.complemento,
            bairro: formData.bairro,
            cidade: formData.cidade,
            estado: formData.estado,
            cep: formData.cep,
            telefone: formData.telefone,
            responsavel: formData.responsavel,
            contatoSCM: formData.contatoSCM,
            contatoAgendamento: formData.contatoAgendamento
          } : h
        ));
        
        toast({ title: "Hospital Atualizado" });
      } else {
        // Create new hospital
        const { data, error } = await supabase
          .from('hospitais')
          .insert({
            nome: formData.nome,
            endereco: formData.endereco,
            complemento: formData.complemento || null,
            bairro: formData.bairro || null,
            cidade: formData.cidade || null,
            estado: formData.estado || null,
            cep: formData.cep || null,
            telefone: formData.telefone || null,
            responsavel: formData.responsavel || null,
            contato_scm: formData.contatoSCM || null,
            contato_agendamento: formData.contatoAgendamento || null
          })
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const newHospital: Hospital = {
            id: data[0].id,
            nome: data[0].nome,
            endereco: data[0].endereco || '',
            complemento: data[0].complemento || '',
            bairro: data[0].bairro || '',
            cidade: data[0].cidade || '',
            estado: data[0].estado || '',
            cep: data[0].cep || '',
            telefone: data[0].telefone || '',
            responsavel: data[0].responsavel || '',
            contatoSCM: data[0].contato_scm || '',
            contatoAgendamento: data[0].contato_agendamento || ''
          };
          
          setHospitais(prev => [newHospital, ...prev]);
          toast({ title: "Hospital Adicionado" });
        }
      }
      
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving hospital:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro ao salvar", 
        description: error.message 
      });
    }
  };

  const handleDelete = async (hospitalId: number, hospitalName: string) => {
    if (!canDelete) {
      toast({ 
        variant: "destructive", 
        title: "Sem permissão", 
        description: "Apenas administradores podem excluir hospitais." 
      });
      return;
    }
    
    if (window.confirm(`Tem certeza que deseja excluir "${hospitalName}"?`)) {
      try {
        const { error } = await supabase
          .from('hospitais')
          .delete()
          .eq('id', hospitalId);
        
        if (error) throw error;
        
        setHospitais(prev => prev.filter(h => h.id !== hospitalId));
        toast({ title: "Hospital Excluído" });
      } catch (error: any) {
        console.error("Error deleting hospital:", error);
        toast({ 
          variant: "destructive", 
          title: "Erro ao excluir", 
          description: error.message 
        });
      }
    }
  };

  const handleFileUpload = () => {
    toast({ 
      title: "Upload de arquivo", 
      description: "Funcionalidade em desenvolvimento" 
    });
  };

  const hospitaisColumns: ColumnDef<Hospital>[] = [
    {
      accessorKey: "nome",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nome<ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    { accessorKey: "endereco", header: "Endereço" },
    { accessorKey: "cidade", header: "Cidade" },
    { accessorKey: "telefone", header: "Telefone" },
    { accessorKey: "responsavel", header: "Responsável" },
    {
      id: "acoes",
      cell: ({ row }) => {
        const hospital = row.original;
        return (
          <div className="flex justify-end space-x-2">
            {canEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => openEditDialog(hospital)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
            {canDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:text-destructive" 
                onClick={() => handleDelete(hospital.id, hospital.nome)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Hospitais Parceiros</CardTitle>
            <CardDescription>Gerencie os hospitais parceiros.</CardDescription>
          </div>
          <div className="flex space-x-2 self-end sm:self-center">
            {canEdit && (
              <>
                <Button variant="outline" onClick={handleFileUpload}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Importar CSV
                </Button>
                <Button onClick={openAddDialog}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Novo Hospital
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={hospitaisColumns} 
          data={hospitais} 
          searchPlaceholder="Filtrar hospitais..." 
        />
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {currentHospital ? 'Editar' : 'Adicionar'} Hospital
                </DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do hospital.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nome" className="text-right">
                    Nome*
                  </Label>
                  <Input 
                    id="nome" 
                    value={formData.nome} 
                    onChange={(e) => handleInputChange('nome', e.target.value)} 
                    className={cn(
                      "col-span-3", 
                      formErrors.nome && "border-destructive"
                    )} 
                  />
                  {formErrors.nome && (
                    <p className="col-start-2 col-span-3 text-xs text-destructive mt-1">
                      {formErrors.nome}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endereco" className="text-right">
                    Endereço*
                  </Label>
                  <Input 
                    id="endereco" 
                    value={formData.endereco} 
                    onChange={(e) => handleInputChange('endereco', e.target.value)} 
                    className={cn(
                      "col-span-3", 
                      formErrors.endereco && "border-destructive"
                    )} 
                  />
                  {formErrors.endereco && (
                    <p className="col-start-2 col-span-3 text-xs text-destructive mt-1">
                      {formErrors.endereco}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="complemento" className="text-right">
                    Complemento
                  </Label>
                  <Input 
                    id="complemento" 
                    value={formData.complemento} 
                    onChange={(e) => handleInputChange('complemento', e.target.value)} 
                    className="col-span-3" 
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bairro" className="text-right">
                    Bairro
                  </Label>
                  <Input 
                    id="bairro" 
                    value={formData.bairro} 
                    onChange={(e) => handleInputChange('bairro', e.target.value)} 
                    className="col-span-3" 
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cidade" className="text-right">
                    Cidade*
                  </Label>
                  <Input 
                    id="cidade" 
                    value={formData.cidade} 
                    onChange={(e) => handleInputChange('cidade', e.target.value)} 
                    className={cn(
                      "col-span-3", 
                      formErrors.cidade && "border-destructive"
                    )} 
                  />
                  {formErrors.cidade && (
                    <p className="col-start-2 col-span-3 text-xs text-destructive mt-1">
                      {formErrors.cidade}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="estado" className="text-right">
                    Estado (UF)
                  </Label>
                  <Input 
                    id="estado" 
                    value={formData.estado} 
                    onChange={(e) => handleInputChange('estado', e.target.value.toUpperCase())} 
                    maxLength={2}
                    className={cn(
                      "col-span-1", 
                      formErrors.estado && "border-destructive"
                    )} 
                  />
                  
                  <Label htmlFor="cep" className="text-right">
                    CEP
                  </Label>
                  <Input 
                    id="cep" 
                    value={formData.cep} 
                    onChange={(e) => handleInputChange('cep', e.target.value)} 
                    className="col-span-1" 
                  />
                  
                  {formErrors.estado && (
                    <p className="col-start-2 col-span-3 text-xs text-destructive mt-1">
                      {formErrors.estado}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="telefone" className="text-right">
                    Telefone
                  </Label>
                  <Input 
                    id="telefone" 
                    value={formData.telefone} 
                    onChange={(e) => handleInputChange('telefone', e.target.value)} 
                    className="col-span-3" 
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="responsavel" className="text-right">
                    Responsável
                  </Label>
                  <Input 
                    id="responsavel" 
                    value={formData.responsavel} 
                    onChange={(e) => handleInputChange('responsavel', e.target.value)} 
                    className="col-span-3" 
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contatoSCM" className="text-right">
                    Contato SCM
                  </Label>
                  <Input 
                    id="contatoSCM" 
                    value={formData.contatoSCM} 
                    onChange={(e) => handleInputChange('contatoSCM', e.target.value)} 
                    className="col-span-3" 
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contatoAgendamento" className="text-right">
                    Contato Agendamento
                  </Label>
                  <Input 
                    id="contatoAgendamento" 
                    value={formData.contatoAgendamento} 
                    onChange={(e) => handleInputChange('contatoAgendamento', e.target.value)} 
                    className="col-span-3" 
                  />
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit">
                  {currentHospital ? 'Salvar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default HospitaisSettings;
