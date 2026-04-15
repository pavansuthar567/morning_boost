import api from '@/lib/api';
import { ApiResponse } from '@/types/api';

export interface SystemConfig {
  _id: string;
  killSwitchOn: boolean;
  isDebug: boolean;
  isVirtualTrading: boolean;
  dhanClientId: string;
  dhanAccessToken: string;
  geminiApiKey: string;
  lastUpdated: string;
}

export interface UpdateConfigPayload {
  dhanClientId?: string;
  dhanAccessToken?: string;
  geminiApiKey?: string;
  killSwitchOn?: boolean;
  isDebug?: boolean;
  isVirtualTrading?: boolean;
}

type ConfigData = { config: SystemConfig };

export const systemConfigService = {
  getConfig: async (): Promise<ConfigData> => {
    const res = (await api.get('/system-config')) as ApiResponse<ConfigData>;
    return res.data;
  },

  updateConfig: async (payload: UpdateConfigPayload): Promise<ConfigData> => {
    const res = (await api.patch('/system-config', payload)) as ApiResponse<ConfigData>;
    return res.data;
  },
};
