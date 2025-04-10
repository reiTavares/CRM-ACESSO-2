import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { cn } from '@/lib/utils';
import { PacienteProcedimento } from '@/components/pacientes/paciente-card';
import { ProcedimentoConfig } from '@/components/configuracoes/ProcedimentosSettings';
import { useConvenios } from '@/hooks/useConvenios';

interface ProcedimentoFormFieldsProps {
  procedimento: PacienteProcedimento;
  index: number;
  onProcedureInputChange: (index: number, field: string, value: any) => void;
  configuredProcedures: ProcedimentoConfig[];
  medicos: { id: string | number, nome: string }[];
  hospital_id?: number | null;
}

export const ProcedimentoFormFields: React.FC<ProcedimentoFormFieldsProps> = ({
  procedimento,
  index,
  onProcedureInputChange,
  configuredProcedures,
  medicos,
  hospital_id,
}) => {
  const { getConveniosByHospital } = useConvenios();
  const [availableConvenios, setAvailableConvenios] = useState<string[]>([]);
  const [filteredProcedures, setFilteredProcedures] = useState<ProcedimentoConfig[]>([]);
  const [date, setDate] = useState<Date | undefined>(procedimento.data || undefined);
  const [time, setTime] = useState<string>(
    procedimento.data ? format(procedimento.data, 'HH:mm') : '09:00'
  );

  // Filter procedures and convenios based on hospital_id
  useEffect(() => {
    if (hospital_id) {
      const hospitalProcedures = configuredProcedures.filter(
        proc => proc.hospitalId === hospital_id
      );
      setFilteredProcedures(hospitalProcedures);

      const hospitalConvenios = getConveniosByHospital(hospital_id);
      setAvailableConvenios(hospitalConvenios.map(c => c.nome));
    } else {
      // If no hospital selected for the patient, show all procedures/convenios? Or none?
      // Current behavior: show all configured procedures, no convenios. Adjust if needed.
      setFilteredProcedures(configuredProcedures);
      setAvailableConvenios([]);
    }
  }, [hospital_id, configuredProcedures, getConveniosByHospital]);

  // Update local date/time state when procedure data changes externally
  useEffect(() => {
    setDate(procedimento.data || undefined);
    setTime(procedimento.data ? format(procedimento.data, 'HH:mm') : '09:00');
  }, [procedimento.data]);


  // Handle date and time changes
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const combinedDate = new Date(newDate);
      combinedDate.setHours(hours, minutes, 0, 0); // Set seconds/ms to 0
      onProcedureInputChange(index, 'data', combinedDate);
    } else {
      onProcedureInputChange(index, 'data', null);
    }
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = event.target.value;
    setTime(newTime);
    if (date && newTime) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const combinedDate = new Date(date);
      combinedDate.setHours(hours, minutes, 0, 0); // Set seconds/ms to 0
      onProcedureInputChange(index, 'data', combinedDate);
    } else if (!newTime && date) {
      // If time is cleared but date exists, keep date only (or set time to 00:00?)
      // Current: keeps date with previous time until date is changed.
      // To set time to 00:00:
      // const combinedDate = new Date(date);
      // combinedDate.setHours(0, 0, 0, 0);
      // onProcedureInputChange(index, 'data', combinedDate);
    }
  };

  const handleProcedureSelect = (procedimentoDescricao: string) => {
    const selectedProcedimento = filteredProcedures.find(p => p.descricao === procedimentoDescricao);
    if (selectedProcedimento) {
      onProcedureInputChange(index, 'procedimento', procedimentoDescricao);
      onProcedureInputChange(index, 'tipo', selectedProcedimento.tipo);
      onProcedureInputChange(index, 'valor', selectedProcedimento.preco);
    } else {
      // Handle case where selection is cleared or invalid?
      onProcedureInputChange(index, 'procedimento', '');
      onProcedureInputChange(index, 'tipo', ''); // Reset type if procedure is cleared
      // Optionally reset valor too: onProcedureInputChange(index, 'valor', 0);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="space-y-2">
        <Label htmlFor={`procedimento-${index}`}>Procedimento</Label>
        <Select
          value={procedimento.procedimento}
          onValueChange={handleProcedureSelect}
        >
          <SelectTrigger id={`procedimento-${index}`}>
            <SelectValue placeholder="Selecionar procedimento" />
          </SelectTrigger>
          <SelectContent>
            {filteredProcedures.map((proc) => (
              <SelectItem key={proc.id} value={proc.descricao}>
                {proc.descricao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`tipo-${index}`}>Tipo de Procedimento</Label>
        <Input
          id={`tipo-${index}`}
          value={procedimento.tipo}
          disabled
          className="bg-muted/50" // Use muted background for disabled
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`convenio-${index}`}>Convênio</Label>
        <Select
          value={procedimento.convenio || ''}
          onValueChange={(value) => onProcedureInputChange(index, 'convenio', value)}
          disabled={availableConvenios.length === 0 && !procedimento.convenio} // Disable if no options and none selected
        >
          <SelectTrigger id={`convenio-${index}`}>
            <SelectValue placeholder={availableConvenios.length > 0 ? "Selecionar convênio" : "Nenhum convênio (Hospital)"} />
          </SelectTrigger>
          <SelectContent>
            {availableConvenios.map((convenio) => (
              <SelectItem key={convenio} value={convenio}>
                {convenio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`medico-${index}`}>Médico</Label>
        <Select
          value={procedimento.medico || ''}
          onValueChange={(value) => onProcedureInputChange(index, 'medico', value)}
        >
          <SelectTrigger id={`medico-${index}`}>
            <SelectValue placeholder="Selecionar médico" />
          </SelectTrigger>
          <SelectContent>
            {medicos.map((medico) => (
              <SelectItem key={medico.id.toString()} value={medico.nome}>
                {medico.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`valor-${index}`}>Valor (R$)</Label>
        <Input
          id={`valor-${index}`}
          type="number"
          step="0.01" // Allow decimals
          value={procedimento.valor?.toString() ?? ''} // Handle potential null/undefined
          onChange={(e) => onProcedureInputChange(index, 'valor', parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="space-y-2">
        <Label>Data/Hora</Label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal flex-1",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecionar data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <Input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="w-24"
            disabled={!date} // Disable time input if no date is selected
          />
        </div>
      </div>
    </div>
  );
};
