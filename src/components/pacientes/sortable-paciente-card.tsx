import React from 'react';
  import { useSortable } from '@dnd-kit/sortable';
  import { CSS } from '@dnd-kit/utilities';
  import { PacienteCard, PacienteData } from './paciente-card';
  import { ApiConfigProps } from '@/pages/Pacientes'; // Import if needed

  interface SortablePacienteCardProps {
    id: string; // ID must be string for dnd-kit
    paciente: PacienteData;
    apiConfig: ApiConfigProps | null;
  }

  export function SortablePacienteCard({ id, paciente, apiConfig }: SortablePacienteCardProps) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging, // Use this to style the card while dragging
    } = useSortable({ id: id }); // Use the patient ID

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1, // Make card semi-transparent while dragging
      zIndex: isDragging ? 100 : 'auto', // Ensure dragged item is on top
      cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {/* Render the original PacienteCard, passing necessary props */}
        <PacienteCard paciente={paciente} apiConfig={apiConfig} />
      </div>
    );
  }
