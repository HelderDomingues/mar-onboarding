
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import { addLogEntry } from '@/utils/projectLog';

export const useAvatarUpload = (userId: string) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);
      
      // Validar tipo e tamanho do arquivo
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        throw new Error('Apenas imagens JPEG, PNG e GIF são permitidas');
      }
      
      if (file.size > 5 * 1024 * 1024) {  // Limite de 5MB
        throw new Error('O arquivo deve ter no máximo 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${fileExt}`;
      
      // Fazer upload para o bucket de avatares
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Construir URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Atualizar perfil do usuário com a nova URL do avatar
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (profileUpdateError) throw profileUpdateError;

      // Registrar log de sucesso
      logger.info('Avatar atualizado com sucesso', {
        tag: 'AvatarUpload',
        data: { userId, fileName }
      });

      addLogEntry('info', 'Avatar do usuário atualizado', { userId });

      toast({
        title: 'Avatar Atualizado',
        description: 'Seu avatar foi atualizado com sucesso.',
        variant: 'default'
      });

      return publicUrl;
    } catch (error: any) {
      logger.error('Erro no upload do avatar', {
        tag: 'AvatarUpload',
        data: { error: error.message }
      });

      addLogEntry('error', 'Erro no upload do avatar', { 
        error: error.message, 
        userId 
      });

      toast({
        title: 'Erro no Upload',
        description: error.message,
        variant: 'destructive'
      });

      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async () => {
    try {
      // Lógica para excluir avatar do Supabase Storage
      const { error: storageError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (storageError) throw storageError;

      toast({
        title: 'Avatar Removido',
        description: 'Seu avatar foi removido com sucesso.',
        variant: 'default'
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao Remover Avatar',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  return { uploadAvatar, deleteAvatar, uploading };
};
