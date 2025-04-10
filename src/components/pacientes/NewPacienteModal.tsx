import React, { useState, useEffect } from 'react';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrigemTipo } from '@/types/supabase';
import { PacienteDataExtended } from './paciente-card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Hospital {
  id: number;
  nome: string;
}

interface Medico {
  id: number;
  nome: string;
  hospital_id: number;
}

interface NewPacienteModalProps {
  onSave: (data: Omit<PacienteDataExtended, 'id' | 'status'>, closeModal?: () => void) => void;
  onClose?: () => void;
}

export function NewPacienteModal({ onSave, onClose }: NewPacienteModalProps) {
  const [formData, setFormData] = useState<Omit<PacienteDataExtended, 'id' | 'status'>>({
    nome: '',
    hospital: '',
    medico: '',
    convenio: '',
    telefone: '',
    dataNascimento: null,
    cpf: '',
    telefone2: '',
    email: '',
    uf: '',
    cidade: '',
    bairro: '',
    origem: 'Publicidade Digital',
    consultorResponsavel: '',
    gestorResponsavel: '',
    valor: 0,
    marketingData: {},
    historico: [],
    procedimentos: [],
    notas: []
  });

  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [filteredMedicos, setFilteredMedicos] = useState<Medico[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: hospitaisData, error: hospitaisError } = await supabase
          .from('hospitais')
          .select('id, nome');
        
        if (hospitaisError) throw hospitaisError;
        setHospitais(hospitaisData || []);
        
        const { data: medicosData, error: medicosError } = await supabase
          .from('medicos')
          .select('id, nome, hospital_id');
        
        if (medicosError) throw medicosError;
        setMedicos(medicosData || []);
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (!formData.hospital) {
      setFilteredMedicos([]);
      return;
    }
    
    const hospitalObj = hospitais.find(h => h.nome === formData.hospital);
    if (hospitalObj) {
      const medicosDoHospital = medicos.filter(m => m.hospital_id === hospitalObj.id);
      setFilteredMedicos(medicosDoHospital);
      
      if (formData.medico && !medicosDoHospital.some(m => m.nome === formData.medico)) {
        setFormData(prev => ({...prev, medico: ''}));
      }
    }
  }, [formData.hospital, hospitais, medicos]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData, onClose);
  };

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Novo Paciente</DialogTitle>
      </DialogHeader>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo*</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Nome do paciente"
                value={formData.nome}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone*</Label>
              <Input
                id="telefone"
                name="telefone"
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital">Hospital*</Label>
              <Select
                value={formData.hospital}
                onValueChange={(value) => handleSelectChange('hospital', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar hospital" />
                </SelectTrigger>
                <SelectContent>
                  {hospitais.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.nome}>
                      {hospital.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medico">Médico</Label>
              <Select
                value={formData.medico}
                onValueChange={(value) => handleSelectChange('medico', value)}
                disabled={!formData.hospital || filteredMedicos.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filteredMedicos.length === 0 ? 
                    (formData.hospital ? "Nenhum médico disponível" : "Primeiro selecione um hospital") : 
                    "Selecionar médico"} 
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredMedicos.map((medico) => (
                    <SelectItem key={medico.id} value={medico.nome}>
                      {medico.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="exemplo@email.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="origem">Origem*</Label>
              <Select
                value={formData.origem}
                onValueChange={(value) => handleSelectChange('origem', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Publicidade Digital">Publicidade Digital</SelectItem>
                  <SelectItem value="Publicidade Tradicional">Publicidade Tradicional</SelectItem>
                  <SelectItem value="Indicação">Indicação</SelectItem>
                  <SelectItem value="Evento">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="convenio">Convênio</Label>
              <Input
                id="convenio"
                name="convenio"
                placeholder="Convênio"
                value={formData.convenio || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      )}
    </DialogContent>
  );
}
