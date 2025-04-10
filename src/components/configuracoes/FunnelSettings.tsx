import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreVertical, Edit, Trash2, PlusCircle, Move, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Funnel, PipelineStage } from '@/types/funnel';

const FunnelSettings = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [newFunnelName, setNewFunnelName] = useState('');
  const [newFunnelDescription, setNewFunnelDescription] = useState('');
  const [newStageName, setNewStageName] = useState('');
  const [isAddingFunnel, setIsAddingFunnel] = useState(false);
  const [isEditingStage, setIsEditingStage] = useState<number | null>(null);
  const [editStageName, setEditStageName] = useState('');
  const { toast } = useToast();

  // Fetch all funnels
  useEffect(() => {
    const fetchFunnels = async () => {
      try {
        const { data, error } = await supabase
          .from('funnels')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          const typedFunnels = data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            created_at: item.created_at,
            is_default: item.is_default
          })) as Funnel[];
          
          setFunnels(typedFunnels);
          
          // Select the first funnel by default
          if (typedFunnels.length > 0 && !selectedFunnel) {
            setSelectedFunnel(typedFunnels[0]);
          }
        }
      } catch (error: any) {
        console.error('Error fetching funnels:', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar os funis.'
        });
      }
    };

    fetchFunnels();
  }, []);

  // Fetch pipeline stages when selected funnel changes
  useEffect(() => {
    if (selectedFunnel) {
      const fetchPipelineStages = async () => {
        try {
          const { data, error } = await supabase
            .from('pipeline_stages')
            .select('*')
            .eq('funnel_id', selectedFunnel.id)
            .order('position', { ascending: true });

          if (error) throw error;
          if (data) {
            const typedStages = data.map(item => ({
              id: item.id,
              funnel_id: item.funnel_id,
              name: item.name,
              position: item.position,
              created_at: item.created_at
            })) as PipelineStage[];
            
            setPipelineStages(typedStages);
          }
        } catch (error: any) {
          console.error('Error fetching pipeline stages:', error);
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Não foi possível carregar as etapas do funil.'
          });
        }
      };

      fetchPipelineStages();
    }
  }, [selectedFunnel]);

  const handleAddFunnel = async () => {
    if (!newFunnelName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O nome do funil é obrigatório.'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('funnels')
        .insert({
          name: newFunnelName.trim(), 
          description: newFunnelDescription.trim() || null
        })
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const newFunnel: Funnel = {
          id: data[0].id,
          name: data[0].name,
          description: data[0].description,
          created_at: data[0].created_at,
          is_default: data[0].is_default
        };
        
        setFunnels([...funnels, newFunnel]);
        setSelectedFunnel(newFunnel);
        setNewFunnelName('');
        setNewFunnelDescription('');
        setIsAddingFunnel(false);

        toast({
          title: 'Sucesso',
          description: 'Funil criado com sucesso.'
        });
      }
    } catch (error: any) {
      console.error('Error adding funnel:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível criar o funil.'
      });
    }
  };

  const handleDeleteFunnel = async (id: number) => {
    if (funnels.length <= 1) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Deve existir pelo menos um funil.'
      });
      return;
    }

    try {
      // First delete all pipeline stages
      const { error: stageError } = await supabase
        .from('pipeline_stages')
        .delete()
        .eq('funnel_id', id);

      if (stageError) throw stageError;

      // Then delete the funnel
      const { error } = await supabase
        .from('funnels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update state
      const updatedFunnels = funnels.filter(funnel => funnel.id !== id);
      setFunnels(updatedFunnels);

      // If the deleted funnel was selected, select another one
      if (selectedFunnel && selectedFunnel.id === id) {
        setSelectedFunnel(updatedFunnels[0] || null);
      }

      toast({
        title: 'Sucesso',
        description: 'Funil excluído com sucesso.'
      });
    } catch (error: any) {
      console.error('Error deleting funnel:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir o funil.'
      });
    }
  };

  const handleAddStage = async () => {
    if (!selectedFunnel) return;
    if (!newStageName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O nome da etapa é obrigatório.'
      });
      return;
    }

    try {
      const position = pipelineStages.length + 1;
      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert({
          funnel_id: selectedFunnel.id, 
          name: newStageName.trim(), 
          position: position
        })
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const newStage: PipelineStage = {
          id: data[0].id,
          funnel_id: data[0].funnel_id,
          name: data[0].name,
          position: data[0].position,
          created_at: data[0].created_at
        };
        
        setPipelineStages([...pipelineStages, newStage]);
        setNewStageName('');

        toast({
          title: 'Sucesso',
          description: 'Etapa adicionada com sucesso.'
        });
      }
    } catch (error: any) {
      console.error('Error adding stage:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível adicionar a etapa.'
      });
    }
  };

  const handleEditStage = async (id: number) => {
    if (!editStageName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O nome da etapa é obrigatório.'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('pipeline_stages')
        .update({ name: editStageName.trim() })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setPipelineStages(
        pipelineStages.map(stage => 
          stage.id === id ? { ...stage, name: editStageName.trim() } : stage
        )
      );

      setIsEditingStage(null);
      setEditStageName('');

      toast({
        title: 'Sucesso',
        description: 'Etapa atualizada com sucesso.'
      });
    } catch (error: any) {
      console.error('Error updating stage:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar a etapa.'
      });
    }
  };

  const handleDeleteStage = async (id: number) => {
    try {
      const { error } = await supabase
        .from('pipeline_stages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state and reorder positions
      const updatedStages = pipelineStages
        .filter(stage => stage.id !== id)
        .map((stage, index) => ({ ...stage, position: index + 1 }));
      
      setPipelineStages(updatedStages);

      // Update positions in database
      for (const stage of updatedStages) {
        await supabase
          .from('pipeline_stages')
          .update({ position: stage.position })
          .eq('id', stage.id);
      }

      toast({
        title: 'Sucesso',
        description: 'Etapa excluída com sucesso.'
      });
    } catch (error: any) {
      console.error('Error deleting stage:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir a etapa.'
      });
    }
  };

  const startEditingStage = (stage: PipelineStage) => {
    setIsEditingStage(stage.id);
    setEditStageName(stage.name);
  };

  const handleMoveStage = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = pipelineStages.findIndex(stage => stage.id === id);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'up') {
      if (currentIndex === 0) return; // Already at the top
      newIndex = currentIndex - 1;
    } else {
      if (currentIndex === pipelineStages.length - 1) return; // Already at the bottom
      newIndex = currentIndex + 1;
    }

    try {
      // Swap positions
      const updatedStages = [...pipelineStages];
      const stageToMove = { ...updatedStages[currentIndex] };
      const stageToSwap = { ...updatedStages[newIndex] };
      
      // Swap positions
      const tempPosition = stageToMove.position;
      stageToMove.position = stageToSwap.position;
      stageToSwap.position = tempPosition;
      
      updatedStages[currentIndex] = stageToSwap;
      updatedStages[newIndex] = stageToMove;
      
      // Sort by position
      updatedStages.sort((a, b) => a.position - b.position);
      
      // Update local state
      setPipelineStages(updatedStages);
      
      // Update positions in database
      const { error: error1 } = await supabase
        .from('pipeline_stages')
        .update({ position: stageToMove.position })
        .eq('id', stageToMove.id);
        
      const { error: error2 } = await supabase
        .from('pipeline_stages')
        .update({ position: stageToSwap.position })
        .eq('id', stageToSwap.id);
        
      if (error1 || error2) throw error1 || error2;
    } catch (error: any) {
      console.error('Error moving stage:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível mover a etapa.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Gerenciar Funis</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddingFunnel(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Funil
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Funil</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="funnel-name">Nome</Label>
                <Input
                  id="funnel-name"
                  placeholder="Nome do funil"
                  value={newFunnelName}
                  onChange={(e) => setNewFunnelName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="funnel-description">Descrição</Label>
                <Input
                  id="funnel-description"
                  placeholder="Descrição do funil"
                  value={newFunnelDescription}
                  onChange={(e) => setNewFunnelDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingFunnel(false)}>Cancelar</Button>
              <Button onClick={handleAddFunnel}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {funnels.length > 0 ? (
        <Tabs
          value={selectedFunnel?.id.toString() || ''}
          onValueChange={(value) => {
            const funnel = funnels.find(f => f.id.toString() === value);
            if (funnel) setSelectedFunnel(funnel);
          }}
        >
          <TabsList className="mb-4">
            {funnels.map((funnel) => (
              <TabsTrigger key={funnel.id} value={funnel.id.toString()}>
                {funnel.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {funnels.map((funnel) => (
            <TabsContent key={funnel.id} value={funnel.id.toString()}>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{funnel.name}</CardTitle>
                      <CardDescription>{funnel.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteFunnel(funnel.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          <span>Excluir Funil</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="font-medium">Etapas do Funil</h3>
                    <div className="space-y-2">
                      {pipelineStages.map((stage) => (
                        <div
                          key={stage.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-md"
                        >
                          {isEditingStage === stage.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editStageName}
                                onChange={(e) => setEditStageName(e.target.value)}
                                className="flex-1"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditStage(stage.id)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsEditingStage(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span>{stage.name}</span>
                              <div className="flex items-center">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMoveStage(stage.id, 'up')}
                                  disabled={stage.position === 1}
                                >
                                  <Move className="h-4 w-4 rotate-90" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMoveStage(stage.id, 'down')}
                                  disabled={stage.position === pipelineStages.length}
                                >
                                  <Move className="h-4 w-4 -rotate-90" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditingStage(stage)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteStage(stage.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Input
                    placeholder="Nome da nova etapa"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                  />
                  <Button onClick={handleAddStage}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    <span>Adicionar Etapa</span>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-center text-muted-foreground mb-4">
              Nenhum funil encontrado. Crie um novo funil para começar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FunnelSettings;
