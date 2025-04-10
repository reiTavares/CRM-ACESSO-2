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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

// Types
export type ProcedimentoConfig = {
  id: string;
  tipo: string;
  descricao: string;
  preco: number;
  hospital_id?: number | null;
  hospitalVinculado: string;
};

export const initialProcedimentos: ProcedimentoConfig[] = [
  { id: "1", tipo: "Cirurgia", descricao: "SMC", preco: 12000, hospitalVinculado: "Hospital A" },
  { id: "2", tipo: "Cirurgia", descricao: "Lente Intra Ocular", preco: 8000, hospitalVinculado: "Hospital B" },
  { id: "3", tipo: "Cirurgia", descricao: "Crosslinking", preco: 6000, hospitalVinculado: "Hospital A" },
];

const ProcedimentosSettings: React.FC = () => {
  const { toast } = useToast();
  const [procedimentos, setProcedimentos] = useState<ProcedimentoConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProcedimento, setCurrentProcedimento] = useState<ProcedimentoConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hospitais, setHospitais] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const [formValues, setFormValues] = useState({
    descricao: '',
    preco: '',
    tipo: '',
    hospitalVinculado: ''
  });

  useEffect(() => {
    const fetchHospitais = async () => {
      try {
        const { data, error } = await supabase
          .from('hospitais')
          .select('*');
          
        if (error) throw error;
        setHospitais(data || []);
      } catch (error: any) {
        console.error("Erro ao carregar hospitais:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar hospitais",
          description: error.message
        });
      }
    };
    
    fetchHospitais();
  }, [toast]);

  useEffect(() => {
    const fetchProcedimentos = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('procedimentos_config')
          .select(`
            id, descricao, preco, hospital_id, tipo,
            hospitais (nome)
          `);
          
        if (error) throw error;
        
        const formattedData: ProcedimentoConfig[] = data.map(p => ({
          id: p.id.toString(),
          descricao: p.descricao,
          preco: p.preco,
          tipo: p.tipo || '',
          hospitalVinculado: p.hospitais?.nome || ''
        }));
        
        setProcedimentos(formattedData);
      } catch (error: any) {
        console.error("Error fetching procedimentos:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar procedimentos",
          description: error.message
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProcedimentos();
  }, [toast]);

  const openAddDialog = () => {
    setCurrentProcedimento(null);
    setFormValues({
      descricao: '',
      preco: '',
      tipo: '',
      hospitalVinculado: ''
    });
    setIsOpen(true);
  };

  const openEditDialog = (procedimento: ProcedimentoConfig) => {
    setCurrentProcedimento(procedimento);
    setFormValues({
      descricao: procedimento.descricao,
      preco: procedimento.preco.toString(),
      tipo: procedimento.tipo || '',
      hospitalVinculado: procedimento.hospitalVinculado
    });
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const findHospitalId = (hospitalName: string): number | undefined => {
    return hospitais.find(h => h.nome === hospitalName)?.id;
  };

  const handleSave = async (procedimento: ProcedimentoConfig) => {
    setIsSubmitting(true);
    
    try {
      if (currentProcedimento) {
        // Update existing procedure
        const { error } = await supabase
          .from('procedimentos_config')
          .update({
            descricao: procedimento.descricao,
            tipo: procedimento.tipo as any, // Cast to any to bypass TypeScript restriction
            preco: parseFloat(procedimento.preco.toString()),
            hospital_id: findHospitalId(procedimento.hospitalVinculado)
          })
          .eq('id', parseInt(currentProcedimento.id));
          
        if (error) throw error;
        
        setProcedimentos(prevProcedimentos =>
          prevProcedimentos.map(p => 
            p.id === currentProcedimento.id ? procedimento : p
          )
        );
        
        toast({
          title: "Procedimento atualizado com sucesso",
          description: `${procedimento.descricao} foi atualizado.`
        });
      } else {
        // Create new procedure
        const { data, error } = await supabase
          .from('procedimentos_config')
          .insert({
            descricao: procedimento.descricao,
            tipo: procedimento.tipo as any, // Cast to any to bypass TypeScript restriction
            preco: parseFloat(procedimento.preco.toString()),
            hospital_id: findHospitalId(procedimento.hospitalVinculado)
          })
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          const newProc: ProcedimentoConfig = {
            id: data[0].id.toString(),
            descricao: procedimento.descricao,
            preco: procedimento.preco,
            tipo: procedimento.tipo,
            hospitalVinculado: procedimento.hospitalVinculado
          };
          
          setProcedimentos(prevProcedimentos => [...prevProcedimentos, newProc]);
          
          toast({
            title: "Procedimento criado com sucesso",
            description: `${procedimento.descricao} foi adicionado.`
          });
        }
      }
      
      setIsOpen(false);
      setCurrentProcedimento(null);
    } catch (error: any) {
      console.error("Erro ao salvar procedimento:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar procedimento",
        description: error.message || "Ocorreu um erro ao tentar salvar o procedimento."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (procedimentoId: string, procedimentoDescricao: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${procedimentoDescricao}"?`)) {
      try {
        const { error } = await supabase
          .from('procedimentos_config')
          .delete()
          .eq('id', parseInt(procedimentoId));
        
        if (error) throw error;
        
        setProcedimentos(prev => prev.filter(p => p.id !== procedimentoId));
        toast({ title: "Procedimento Excluído" });
      } catch (error: any) {
        console.error("Error deleting procedimento:", error);
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

  const procedimentosColumns: ColumnDef<ProcedimentoConfig>[] = [
    {
      accessorKey: "descricao",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Descrição<ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
		{ accessorKey: "tipo", header: "Tipo" },
    { accessorKey: "preco", header: "Preço" },
    { accessorKey: "hospitalVinculado", header: "Hospital" },
    {
      id: "acoes",
      cell: ({ row }) => {
        const procedimento = row.original;
        return (
          <div className="flex justify-end space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => openEditDialog(procedimento)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive hover:text-destructive" 
              onClick={() => handleDelete(procedimento.id, procedimento.descricao)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
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
            <CardTitle>Configuração de Procedimentos</CardTitle>
            <CardDescription>Gerencie os procedimentos oferecidos.</CardDescription>
          </div>
          <div className="flex space-x-2 self-end sm:self-center">
            <Button variant="outline" onClick={handleFileUpload}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
            <Button onClick={openAddDialog}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Procedimento
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={procedimentosColumns} 
          data={procedimentos} 
          searchPlaceholder="Filtrar procedimentos..." 
        />
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{currentProcedimento ? 'Editar' : 'Adicionar'} Procedimento</DialogTitle>
              <DialogDescription>
                Preencha os detalhes do procedimento.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[calc(100%-8rem)] pr-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="descricao" className="text-right">
                    Descrição
                  </Label>
                  <Input 
                    id="descricao" 
                    name="descricao"
                    value={formValues.descricao} 
                    onChange={handleInputChange} 
                    className="col-span-3" 
                  />
                </div>
								
								<div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipo" className="text-right">
                    Tipo
                  </Label>
									<Input 
                    id="tipo" 
                    name="tipo"
                    value={formValues.tipo} 
                    onChange={handleInputChange} 
                    className="col-span-3" 
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="preco" className="text-right">
                    Preço
                  </Label>
                  <Input 
                    id="preco" 
                    name="preco"
                    type="number"
                    value={formValues.preco} 
                    onChange={handleInputChange} 
                    className="col-span-3" 
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hospitalVinculado" className="text-right">
                    Hospital
                  </Label>
                  <Select onValueChange={(value) => handleSelectChange('hospitalVinculado', value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione" defaultValue={formValues.hospitalVinculado} />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitais.map(hospital => (
                        <SelectItem key={hospital.id} value={hospital.nome}>{hospital.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ScrollArea>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button 
                type="button" 
                onClick={() => handleSave({
                  id: currentProcedimento?.id || '',
                  descricao: formValues.descricao,
                  preco: parseFloat(formValues.preco),
                  tipo: formValues.tipo || '',
                  hospitalVinculado: formValues.hospitalVinculado
                })}
                disabled={isSubmitting}
              >
                {currentProcedimento ? 'Salvar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProcedimentosSettings;
