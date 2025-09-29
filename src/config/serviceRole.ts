
/**
 * Configuração para a chave Service Role do Supabase
 * Esta classe fornece métodos para acessar e gerenciar a chave Service Role
 * que permite ações administrativas no Supabase
 */

// Nome da chave no localStorage para armazenar a chave service role
const SERVICE_ROLE_KEY_NAME = 'supabase_service_role_key';

export class ServiceRoleConfig {
  /**
   * Obtém a chave service role armazenada
   * @returns string ou undefined se não estiver configurada
   */
  static get(): string | undefined {
    try {
      // Prefer environment variable in server / deployment environments
      if (typeof process !== 'undefined' && process.env && process.env.SUPABASE_SERVICE_ROLE) {
        return process.env.SUPABASE_SERVICE_ROLE;
      }
      // Em ambiente de servidor, não temos localStorage
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return undefined;
      }

      return localStorage.getItem(SERVICE_ROLE_KEY_NAME) || undefined;
    } catch (error) {
      console.error('Erro ao obter chave service role:', error);
      return undefined;
    }
  }

  /**
   * Define a chave service role
   * @param key Chave service role do Supabase
   * @returns booleano indicando sucesso
   */
  static set(key: string): boolean {
    try {
      // Em ambiente de servidor, não temos localStorage
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return false;
      }

      if (!key) {
        localStorage.removeItem(SERVICE_ROLE_KEY_NAME);
        return true;
      }

      localStorage.setItem(SERVICE_ROLE_KEY_NAME, key);
      return true;
    } catch (error) {
      console.error('Erro ao salvar chave service role:', error);
      return false;
    }
  }

  /**
   * Remove a chave service role armazenada
   * @returns booleano indicando sucesso
   */
  static clear(): boolean {
    try {
      // Em ambiente de servidor, não temos localStorage
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return false;
      }

      localStorage.removeItem(SERVICE_ROLE_KEY_NAME);
      return true;
    } catch (error) {
      console.error('Erro ao remover chave service role:', error);
      return false;
    }
  }

  /**
   * Verifica se existe uma chave service role configurada
   * @returns booleano indicando se há uma chave configurada
   */
  static exists(): boolean {
    return !!ServiceRoleConfig.get();
  }
}
