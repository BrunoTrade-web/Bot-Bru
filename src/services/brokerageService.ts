
export enum ConnectionStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  FAILED = 'failed',
  DISCONNECTED = 'disconnected'
}

export interface BrokerageCredentials {
  name: string;
  server?: string;
  accountType: 'Real' | 'Demo';
  login?: string;
  password?: string;
  apiKey?: string;
  secretKey?: string;
}

export interface ConnectionResult {
  success: boolean;
  message: string;
  status: ConnectionStatus;
  error?: string;
}

/**
 * Service to handle brokerage connections (MT5 and APIs)
 */
export const brokerageService = {
  /**
   * Connects to a brokerage account via the backend API.
   * Handles encryption-on-the-wire logic and status transitions.
   */
  async connectAccount(
    credentials: BrokerageCredentials,
    token: string
  ): Promise<ConnectionResult> {
    try {
      const response = await fetch('/api/brokerage/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Connection failed',
          status: ConnectionStatus.FAILED,
          error: data.error
        };
      }

      return {
        success: true,
        message: data.message || 'Connected successfully',
        status: ConnectionStatus.CONNECTED
      };
    } catch (error: any) {
      console.error('Brokerage Connection Error:', error);
      return {
        success: false,
        message: 'Network or system error occurred',
        status: ConnectionStatus.FAILED,
        error: error.message
      };
    }
  },

  /**
   * Fetches the list of connected brokerages for the user.
   */
  async getConnectedBrokerages(token: string): Promise<any[]> {
    try {
      const response = await fetch('/api/brokerage/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch brokerages');
      return await response.json();
    } catch (error) {
      console.error('Fetch Brokerages Error:', error);
      return [];
    }
  }
};
