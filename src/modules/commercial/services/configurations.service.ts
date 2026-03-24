import { apiClient } from './apiClient';

export interface Configuration {
  id: number;
  cle: string;
  valeur: number;
  libelle: string;
}

export async function getConfigurations(): Promise<Configuration[]> {
  const res = await apiClient.get<any>('/configurations');
  return res.data || res || [];
}

export async function updateConfiguration(id: number, valeur: number): Promise<Configuration> {
  const res = await apiClient.put<any>(`/configurations/${id}`, { valeur });
  return res.data || res;
}
