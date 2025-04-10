import React from 'react';
import { Search, UserPlus } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewPacienteModal } from '@/components/pacientes/NewPacienteModal';
import { useFetchData } from './FetchDataContext';

interface PacientesHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewPaciente: (newPacienteData: any, closeModal?: () => void) => void;
}

export const PacientesHeader: React.FC<PacientesHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onNewPaciente
}) => {
  const { funnels, selectedFunnelId, setSelectedFunnelId } = useFetchData();

  const handleFunnelChange = (value: string) => {
    setSelectedFunnelId(Number(value));
  };

  return (
    <div className="p-4 border-b">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <div className="flex items-center gap-4">
          <Select
            value={selectedFunnelId.toString()}
            onValueChange={handleFunnelChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecionar Funil" />
            </SelectTrigger>
            <SelectContent>
              {funnels.map((funnel) => (
                <SelectItem key={funnel.id} value={funnel.id.toString()}>
                  {funnel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Paciente
              </Button>
            </DialogTrigger>
            <NewPacienteModal onSave={onNewPaciente} />
          </Dialog>
        </div>
      </div>
    </div>
  );
};
