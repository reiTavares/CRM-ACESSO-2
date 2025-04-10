import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProcedimentoObservacaoProps {
  index: number;
  value: string | null | undefined;
  onChange: (index: number, field: string, value: string) => void;
}

export const ProcedimentoObservacao: React.FC<ProcedimentoObservacaoProps> = ({
  index,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={`observacao-${index}`}>Observação</Label>
      <Textarea
        id={`observacao-${index}`}
        value={value || ''}
        onChange={(e) => onChange(index, 'observacao', e.target.value)}
        className="min-h-[80px]"
        placeholder="Adicione observações sobre o procedimento..."
      />
    </div>
  );
};
