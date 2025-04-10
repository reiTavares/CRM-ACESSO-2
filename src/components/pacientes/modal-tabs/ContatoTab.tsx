import React, { useState, useEffect } from 'react';
import { PacienteDataExtended } from '@/components/pacientes/paciente-card';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Profile } from '@/hooks/useProfilesData';
import { useConvenios } from '@/hooks/useConvenios';

interface ContatoTabProps {
  paciente: PacienteDataExtended;
  handleInputChange: (field: string, value: any) => void;
  handleMarketingInputChange: (field: string, value: any) => void;
  handleHospitalChange: (hospitalName: string) => void;
  handleDoctorChange: (doctorName: string) => void;
  availableDoctors: { id: string, nome: string }[];
  hospitalNames: string[];
  formattedNascimento: string;
  formattedMarketingIndicacao: string | undefined;
  formattedMarketingEvento: string | undefined;
  consultores?: Profile[];
}

export const ContatoTab: React.FC<ContatoTabProps> = ({
  paciente,
  handleInputChange,
  handleMarketingInputChange,
  handleHospitalChange,
  handleDoctorChange,
  availableDoctors,
  hospitalNames,
  formattedNascimento,
  formattedMarketingIndicacao,
  formattedMarketingEvento,
  consultores = []
}) => {
  const { convenios, getConveniosByHospital } = useConvenios();
  const [availableConvenios, setAvailableConvenios] = useState<string[]>([]);

  // Update convenios when hospital changes
  useEffect(() => {
    if (paciente.hospital_id) {
      const hospitalConvenios = getConveniosByHospital(paciente.hospital_id);
      setAvailableConvenios(hospitalConvenios.map(c => c.nome));
    } else {
      setAvailableConvenios([]);
    }
  }, [paciente.hospital_id, getConveniosByHospital]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Dados Pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              value={paciente.nome || ''}
              onChange={(e) => handleInputChange('nome', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={paciente.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={paciente.cpf || ''}
              onChange={(e) => handleInputChange('cpf', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dataNascimento">Data de Nascimento</Label>
            <Input
              id="dataNascimento"
              type="date"
              value={formattedNascimento || ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                handleInputChange('dataNascimento', date);
              }}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone Principal</Label>
            <Input
              id="telefone"
              value={paciente.telefone || ''}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefone2">Telefone Alternativo</Label>
            <Input
              id="telefone2"
              value={paciente.telefone2 || ''}
              onChange={(e) => handleInputChange('telefone2', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="uf">Estado</Label>
            <Input
              id="uf"
              value={paciente.uf || ''}
              onChange={(e) => handleInputChange('uf', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={paciente.cidade || ''}
              onChange={(e) => handleInputChange('cidade', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              value={paciente.bairro || ''}
              onChange={(e) => handleInputChange('bairro', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Informações Médicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hospital">Hospital</Label>
            <Select 
              value={paciente.hospital || ''} 
              onValueChange={handleHospitalChange}
            >
              <SelectTrigger id="hospital">
                <SelectValue placeholder="Selecione o hospital" />
              </SelectTrigger>
              <SelectContent>
                {hospitalNames.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="medico">Médico</Label>
            <Select 
              value={paciente.medico || ''} 
              onValueChange={handleDoctorChange}
            >
              <SelectTrigger id="medico">
                <SelectValue placeholder="Selecione o médico" />
              </SelectTrigger>
              <SelectContent>
                {availableDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.nome}>{doctor.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="consultor">Consultor Responsável</Label>
            <Select 
              value={paciente.consultorResponsavel || ''} 
              onValueChange={(value) => {
                const selectedConsultor = consultores.find(c => c.nome === value);
                if (selectedConsultor) {
                  handleInputChange('consultorResponsavel', value);
                  handleInputChange('consultor_responsavel_id', selectedConsultor.id);
                }
              }}
            >
              <SelectTrigger id="consultor">
                <SelectValue placeholder="Selecione o consultor" />
              </SelectTrigger>
              <SelectContent>
                {consultores.map((consultor) => (
                  <SelectItem key={consultor.id} value={consultor.nome}>{consultor.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="convenio">Convênio</Label>
            <Select
              value={paciente.convenio || ''}
              onValueChange={(value) => handleInputChange('convenio', value)}
            >
              <SelectTrigger id="convenio">
                <SelectValue placeholder="Selecione o convênio" />
              </SelectTrigger>
              <SelectContent>
                {availableConvenios.map((convenio) => (
                  <SelectItem key={convenio} value={convenio}>{convenio}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Marketing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origem">Origem</Label>
            <Select 
              value={paciente.origem || ''} 
              onValueChange={(value) => handleInputChange('origem', value)}
            >
              <SelectTrigger id="origem">
                <SelectValue placeholder="Selecione a origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Publicidade Digital">Publicidade Digital</SelectItem>
                <SelectItem value="Publicidade Tradicional">Publicidade Tradicional</SelectItem>
                <SelectItem value="Indicação">Indicação</SelectItem>
                <SelectItem value="Evento">Evento</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {paciente.origem === 'Indicação' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="indicador">Nome do Indicador</Label>
                <Input
                  id="indicador"
                  value={paciente.marketingData?.indicador || ''}
                  onChange={(e) => handleMarketingInputChange('indicador', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataIndicacao">Data da Indicação</Label>
                <Input
                  id="dataIndicacao"
                  type="date"
                  value={formattedMarketingIndicacao || ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    handleMarketingInputChange('dataIndicacao', date);
                  }}
                />
              </div>
            </>
          )}
          
          {paciente.origem === 'Evento' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nomeEvento">Nome do Evento</Label>
                <Input
                  id="nomeEvento"
                  value={paciente.marketingData?.nomeEvento || ''}
                  onChange={(e) => handleMarketingInputChange('nomeEvento', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataEvento">Data do Evento</Label>
                <Input
                  id="dataEvento"
                  type="date"
                  value={formattedMarketingEvento || ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    handleMarketingInputChange('dataEvento', date);
                  }}
                />
              </div>
            </>
          )}
          
          {paciente.origem === 'Publicidade Digital' && (
            <div className="space-y-2">
              <Label htmlFor="canalDigital">Canal Digital</Label>
              <Select 
                value={paciente.marketingData?.canalDigital || ''} 
                onValueChange={(value) => handleMarketingInputChange('canalDigital', value)}
              >
                <SelectTrigger id="canalDigital">
                  <SelectValue placeholder="Selecione o canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google">Google</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="E-mail">E-mail</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {paciente.origem === 'Publicidade Tradicional' && (
            <div className="space-y-2">
              <Label htmlFor="canalTradicional">Canal Tradicional</Label>
              <Select 
                value={paciente.marketingData?.canalTradicional || ''} 
                onValueChange={(value) => handleMarketingInputChange('canalTradicional', value)}
              >
                <SelectTrigger id="canalTradicional">
                  <SelectValue placeholder="Selecione o canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TV">TV</SelectItem>
                  <SelectItem value="Rádio">Rádio</SelectItem>
                  <SelectItem value="Jornal">Jornal</SelectItem>
                  <SelectItem value="Revista">Revista</SelectItem>
                  <SelectItem value="Outdoor">Outdoor</SelectItem>
                  <SelectItem value="Folheto">Folheto</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
