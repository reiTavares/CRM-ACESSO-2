import { useState, useEffect } from 'react';
import { useFetchData } from '../FetchDataContext';
import { useProfilesData } from '@/hooks/useProfilesData';
import { PacienteDataExtended } from '../paciente-card';

interface UseModalDataDependenciesProps {
  paciente: PacienteDataExtended | null;
}

export const useModalDataDependencies = ({ paciente }: UseModalDataDependenciesProps) => {
  const { hospitais, medicos } = useFetchData();
  const { profiles } = useProfilesData();
  const [availableDoctors, setAvailableDoctors] = useState<{ id: string, nome: string }[]>([]);
  const [hospitalsData, setHospitalsData] = useState<Record<string, string[]>>({});

  // Setup hospitals and doctors data mapping
  useEffect(() => {
    if (hospitais.length > 0) {
      const hospitalsMap: Record<string, string[]> = {};
      hospitais.forEach(hospital => {
        if (hospital?.nome) {
          hospitalsMap[hospital.nome] = medicos
            .filter(medico => medico?.hospital_id === hospital.id)
            .map(medico => medico?.nome || '')
            .filter(Boolean);
        }
      });
      setHospitalsData(hospitalsMap);
    }
  }, [hospitais, medicos]);

  // Update available doctors when the patient's hospital changes
  useEffect(() => {
    if (paciente?.hospital) {
      const hospitalObj = hospitais.find(h => h?.nome === paciente.hospital);
      if (hospitalObj) {
        const doctorsList = medicos
          .filter(medico => medico?.hospital_id === hospitalObj.id)
          .map(medico => ({
            id: medico?.id.toString() || '',
            nome: medico?.nome || ''
          }))
          .filter(doctor => doctor.nome);
        setAvailableDoctors(doctorsList);
      } else {
        setAvailableDoctors([]);
      }
    } else {
      setAvailableDoctors([]);
    }
  }, [paciente?.hospital, hospitais, medicos]);

  const consultores = profiles.filter(p =>
    ['Consultor', 'Supervisor', 'Gestor', 'Admin', 'Super Admin'].includes(p.nivel_acesso || '')
  );

  const hospitalNames = Object.keys(hospitalsData).filter(name => name !== "");


  return {
    hospitais,
    medicos,
    profiles,
    consultores,
    availableDoctors,
    hospitalsData,
    hospitalNames,
  };
};
