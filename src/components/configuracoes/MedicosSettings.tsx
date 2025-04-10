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

type Medico = {
  id: number;
  nome: string;
  crm: string | null;
  rqe: string | null;
  hospital_id: number;
  hospital_nome: string;
};

// Form interface
interface MedicoFormData {
  nome: string;
  crm: string;
  rqe: string;
  hospital_id: string;
}

const MedicosSettings: React.FC = () => {
  const { toast } = useToast();
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMedico, setCurrentMedico] = useState<Medico | null>(null);
  const [formData, setFormData] = useState<MedicoFormData>({
    nome: '',
    crm: '',
    rqe: '',
    hospital_id: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MedicoFormData, string>>>({});
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

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('medicos')
          .select(`
            id, nome, crm, rqe, hospital_id,
            hospitais (nome)
          `);
          
        if (error) throw error;
        
        const formattedData = data.map(m => ({
          id: m.id,
          nome: m.nome,
          crm: m.crm,
          rqe: m.rqe,
          hospital_id: m.hospital_id,
          hospital_nome: m.hospitais?.nome || 'Hospital não encontrado'
        }));
        
        setMedicos(formattedData);
      } catch (error: any) {
        console.error("Error fetching doctors:", error);
        toast({ 
          variant: "destructive", 
          title: "Erro ao carregar médicos", 
          description: error.message 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctors();
  }, [toast]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof MedicoFormData, string>> = {};
    
    if (!formData.nome.trim()) errors.nome = "Nome é obrigatório.";
    if (!formData.hospital_id) errors.hospital_id = "Hospital é obrigatório.";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof MedicoFormData, value: string) => {
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
        description: "Apenas gestores e administradores podem adicionar médicos." 
      });
      return;
    }
    
    setCurrentMedico(null);
    setFormData({
      nome: '',
      crm: '',
      rqe: '',
      hospital_id: ''
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (medico: Medico) => {
    if (!canEdit) {
      toast({ 
        variant: "destructive", 
        title: "Sem permissão", 
        description: "Apenas gestores e administradores podem editar médicos." 
      });
      return;
    }
    
    setCurrentMedico(medico);
    setFormData({
      nome: medico.nome,
      crm: medico.crm || '',
      rqe: medico.rqe || '',
      hospital_id: String(medico.hospital_id)
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
      
      if (currentMedico) {
        // Update existing doctor
        const { error } = await supabase
          .from('medicos')
          .update({
            nome: formData.nome,
            crm: formData.crm || null,
            rqe: formData.rqe || null,
            hospital_id: Number(formData.hospital_id)
          })
          .eq('id', currentMedico.id);
        
        if (error) throw error;
        
        setMedicos(prev => prev.map(m => 
          m.id === currentMedico.id ? {
            ...m,
            nome: formData.nome,
            crm: formData.crm || null,
            rqe: formData.rqe || null,
            hospital_id: Number(formData.hospital_id),
            hospital_nome: hospital.nome
          } : m
        ));
        
        toast({ title: "Médico Atualizado" });
      } else {
        // Create new doctor
        const { data, error } = await supabase
          .from('medicos')
          .insert({
            nome: formData.nome,
            crm: formData.crm || null,
            rqe: formData.rqe || null,
            hospital_id: Number(formData.hospital_id)
          })
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const newMedico: Medico = {
            id: data[0].id,
            nome: data[0].nome,
            crm: data[0].crm,
            rqe: data[0].rqe,
            hospital_id: data[0].hospital_id,
            hospital_nome: hospital.nome
          };
          
          setMedicos(prev => [newMedico, ...prev]);
          toast({ title: "Médico Adicionado" });
        }
      }
      
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving doctor:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro ao salvar", 
        description: error.message 
      });
    }
  };

  const handleDelete = async (medicoId: number, medicoName: string) => {
    if (!canDelete) {
      toast({ 
        variant: "destructive", 
        title: "Sem permissão", 
        description: "Apenas administradores podem excluir médicos." 
      });
      return;
    }
    
    if (window.confirm(`Tem certeza que deseja excluir "${medicoName}"?`)) {
      try {
        const { error } = await supabase
          .from('medicos')
          .delete()
          .eq('id', medicoId);
        
        if (error) throw error;
        
        setMedicos(prev => prev.filter(m => m.id !== medicoId));
        toast({ title: "Médico Excluído" });
      } catch (error: any) {
        console.error("Error deleting doctor:", error);
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

  const medicosColumns: ColumnDef<Medico>[] = [
    {
      accessorKey: "nome",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nome<ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    { accessorKey: "crm", header: "CRM" },
    { accessorKey: "rqe", header: "RQE" },
    { accessorKey: "hospital_nome", header: "Hospital" },
    {
      id: "acoes",
      cell: ({ row }) => {
        const medico = row.original;
        return (
          <div className="flex justify-end space-x-2">
            {canEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => openEditDialog(medico)}
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
                onClick={() => handleDelete(medico.id, medico.nome)}
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
            <CardTitle>Médicos</CardTitle>
            <CardDescription>Gerencie os médicos cadastrados.</CardDescription>
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
                  Novo Médico
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={medicosColumns} 
          data={medicos} 
          searchPlaceholder="Filtrar médicos..." 
        />
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {currentMedico ? 'Editar' : 'Adicionar'} Médico
                </DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do médico.
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
                  <Label htmlFor="crm" className="text-right">
                    CRM
                  </Label>
                  <Input 
                    id="crm" 
                    value={formData.crm} 
                    onChange={(e) => handleInputChange('crm', e.target.value)} 
                    className="col-span-3" 
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rqe" className="text-right">
                    RQE
                  </Label>
                  <Input 
                    id="rqe" 
                    value={formData.rqe} 
                    onChange={(e) => handleInputChange('rqe', e.target.value)} 
                    className="col-span-3" 
                  />
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
                  {currentMedico ? 'Salvar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MedicosSettings;
