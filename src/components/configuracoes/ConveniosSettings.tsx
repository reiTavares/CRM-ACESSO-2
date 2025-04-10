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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

// Types
type Hospital = {
  id: number;
  nome: string;
};

type Convenio = {
  id: number;
  nome: string;
  tipo: string | null;
  hospital_id: number;
  hospital_nome: string;
};

// Form interface
interface ConvenioFormData {
  nome: string;
  tipo: string;
  hospital_id: string;
}

const ConveniosSettings: React.FC = () => {
  const { toast } = useToast();
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentConvenio, setCurrentConvenio] = useState<Convenio | null>(null);
  const [formData, setFormData] = useState<ConvenioFormData>({
    nome: '',
    tipo: '',
    hospital_id: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ConvenioFormData, string>>>({});
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

  // Fetch hospitals for dropdown
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const { data, error } = await supabase
          .from('hospitais')
          .select('id, nome')
          .order('nome');
          
        if (error) throw error;
        
        setHospitais(data);
      } catch (error: any) {
        console.error("Error fetching hospitals:", error);
        toast({ 
          variant: "destructive", 
          title: "Erro ao carregar hospitais", 
          description: error.message 
        });
      }
    };
    
    fetchHospitals();
  }, [toast]);

  // Fetch convenios
  useEffect(() => {
    const fetchConvenios = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('convenios')
          .select(`
            id, nome, tipo, hospital_id,
            hospitais (nome)
          `);
          
        if (error) throw error;
        
        const formattedData = data.map(c => ({
          id: c.id,
          nome: c.nome,
          tipo: c.tipo,
          hospital_id: c.hospital_id,
          hospital_nome: c.hospitais?.nome || 'Hospital não encontrado'
        }));
        
        setConvenios(formattedData);
      } catch (error: any) {
        console.error("Error fetching convenios:", error);
        toast({ 
          variant: "destructive", 
          title: "Erro ao carregar convênios", 
          description: error.message 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConvenios();
  }, [toast]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ConvenioFormData, string>> = {};
    
    if (!formData.nome.trim()) errors.nome = "Nome é obrigatório.";
    if (!formData.hospital_id) errors.hospital_id = "Hospital é obrigatório.";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof ConvenioFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const openAddDialog = () => {
    if (!canEdit) {
      toast({ 
        variant: "destructive", 
        title: "Sem permissão", 
        description: "Apenas gestores e administradores podem adicionar convênios." 
      });
      return;
    }
    
    setCurrentConvenio(null);
    setFormData({
      nome: '',
      tipo: '',
      hospital_id: ''
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (convenio: Convenio) => {
    if (!canEdit) {
      toast({ 
        variant: "destructive", 
        title: "Sem permissão", 
        description: "Apenas gestores e administradores podem editar convênios." 
      });
      return;
    }
    
    setCurrentConvenio(convenio);
    setFormData({
      nome: convenio.nome,
      tipo: convenio.tipo || '',
      hospital_id: String(convenio.hospital_id)
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
      const hospital = hospitais.find(h => h.id === Number(formData.hospital_id));
      if (!hospital) {
        throw new Error("Hospital selecionado não encontrado");
      }
      
      if (currentConvenio) {
        // Update existing convenio
        const { error } = await supabase
          .from('convenios')
          .update({
            nome: formData.nome,
            tipo: formData.tipo || null,
            hospital_id: Number(formData.hospital_id)
          })
          .eq('id', currentConvenio.id);
        
        if (error) throw error;
        
        setConvenios(prev => prev.map(c => 
          c.id === currentConvenio.id ? {
            ...c,
            nome: formData.nome,
            tipo: formData.tipo || null,
            hospital_id: Number(formData.hospital_id),
            hospital_nome: hospital.nome
          } : c
        ));
        
        toast({ title: "Convênio Atualizado" });
      } else {
        // Create new convenio
        const { data, error } = await supabase
          .from('convenios')
          .insert({
            nome: formData.nome,
            tipo: formData.tipo || null,
            hospital_id: Number(formData.hospital_id)
          })
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const newConvenio: Convenio = {
            id: data[0].id,
            nome: data[0].nome,
            tipo: data[0].tipo,
            hospital_id: data[0].hospital_id,
            hospital_nome: hospital.nome
          };
          
          setConvenios(prev => [newConvenio, ...prev]);
          toast({ title: "Convênio Adicionado" });
        }
      }
      
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving convenio:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro ao salvar", 
        description: error.message 
      });
    }
  };

  const handleDelete = async (convenioId: number, convenioName: string) => {
    if (!canDelete) {
      toast({ 
        variant: "destructive", 
        title: "Sem permissão", 
        description: "Apenas administradores podem excluir convênios." 
      });
      return;
    }
    
    if (window.confirm(`Tem certeza que deseja excluir "${convenioName}"?`)) {
      try {
        const { error } = await supabase
          .from('convenios')
          .delete()
          .eq('id', convenioId);
        
        if (error) throw error;
        
        setConvenios(prev => prev.filter(c => c.id !== convenioId));
        toast({ title: "Convênio Excluído" });
      } catch (error: any) {
        console.error("Error deleting convenio:", error);
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

  const conveniosColumns: ColumnDef<Convenio>[] = [
    {
      accessorKey: "nome",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nome<ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    { accessorKey: "tipo", header: "Tipo" },
    { accessorKey: "hospital_nome", header: "Hospital" },
    {
      id: "acoes",
      cell: ({ row }) => {
        const convenio = row.original;
        return (
          <div className="flex justify-end space-x-2">
            {canEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => openEditDialog(convenio)}
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
                onClick={() => handleDelete(convenio.id, convenio.nome)}
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
            <CardTitle>Convênios</CardTitle>
            <CardDescription>Gerencie os convênios associados.</CardDescription>
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
                  Novo Convênio
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={conveniosColumns} 
          data={convenios} 
          searchPlaceholder="Filtrar convênios..." 
        />
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {currentConvenio ? 'Editar' : 'Adicionar'} Convênio
                </DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do convênio.
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
                  <Label htmlFor="tipo" className="text-right">
                    Tipo
                  </Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value) => handleInputChange('tipo', value)}
                  >
                    <SelectTrigger id="tipo" className="col-span-3">
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pré-pago">Pré-pago</SelectItem>
                      <SelectItem value="Pós-pago">Pós-pago</SelectItem>
                      <SelectItem value="Co-participação">Co-participação</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hospital" className="text-right">
                    Hospital*
                  </Label>
                  <div className="col-span-3">
                    <Select 
                      value={formData.hospital_id} 
                      onValueChange={(value) => handleInputChange('hospital_id', value)}
                    >
                      <SelectTrigger 
                        id="hospital" 
                        className={cn(formErrors.hospital_id && "border-destructive")}
                      >
                        <SelectValue placeholder="Selecione um hospital" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitais.map((hospital) => (
                          <SelectItem key={hospital.id} value={String(hospital.id)}>
                            {hospital.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.hospital_id && (
                      <p className="text-xs text-destructive mt-1">
                        {formErrors.hospital_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit">
                  {currentConvenio ? 'Salvar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ConveniosSettings;
