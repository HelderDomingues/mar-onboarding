import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { QuizModule, QuizQuestion, QuizOption } from '@/types/quiz';

interface QuizEditorDialogProps {
  type: 'module' | 'question' | 'option';
  item?: QuizModule | QuizQuestion | QuizOption;
  moduleId?: string;
  questionId?: string;
  onSave: () => void;
  trigger: React.ReactNode;
}

export const QuizEditorDialog: React.FC<QuizEditorDialogProps> = ({
  type,
  item,
  moduleId,
  questionId,
  onSave,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [modules, setModules] = useState<QuizModule[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadRelatedData();
      initializeFormData();
    }
  }, [open, item]);

  const loadRelatedData = async () => {
    if (type === 'question' || type === 'option') {
      const { data: moduleData } = await supabase
        .from('quiz_modules')
        .select('*')
        .order('order_number');
      setModules(moduleData || []);
    }
    
    if (type === 'option') {
      const { data: questionData } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('order_number');
      setQuestions(questionData || []);
    }
  };

  const initializeFormData = () => {
    if (item) {
      setFormData({ ...item });
    } else {
      switch (type) {
        case 'module':
          setFormData({
            title: '',
            description: '',
            order_number: 1
          });
          break;
        case 'question':
          setFormData({
            module_id: moduleId || '',
            text: '',
            type: 'text',
            required: true,
            hint: '',
            order_number: 1
          });
          break;
        case 'option':
          setFormData({
            question_id: questionId || '',
            text: '',
            order_number: 1
          });
          break;
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const table = type === 'module' ? 'quiz_modules' : 
                   type === 'question' ? 'quiz_questions' : 'quiz_options';
      
      if (item) {
        // Atualizar item existente
        const { error } = await supabase
          .from(table)
          .update(formData)
          .eq('id', (item as any).id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: `${type === 'module' ? 'Módulo' : type === 'question' ? 'Questão' : 'Opção'} atualizado com sucesso!`
        });
      } else {
        // Criar novo item
        const { error } = await supabase
          .from(table)
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: `${type === 'module' ? 'Módulo' : type === 'question' ? 'Questão' : 'Opção'} criado com sucesso!`
        });
      }
      
      setOpen(false);
      onSave();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar alterações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    
    setLoading(true);
    try {
      const table = type === 'module' ? 'quiz_modules' : 
                   type === 'question' ? 'quiz_questions' : 'quiz_options';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', (item as any).id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `${type === 'module' ? 'Módulo' : type === 'question' ? 'Questão' : 'Opção'} excluído com sucesso!`
      });
      
      setOpen(false);
      onSave();
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir item",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderModuleForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Título do Módulo</Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Digite o título do módulo"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Digite a descrição do módulo"
        />
      </div>
      
      <div>
        <Label htmlFor="order_number">Ordem</Label>
        <Input
          id="order_number"
          type="number"
          value={formData.order_number || 1}
          onChange={(e) => setFormData({ ...formData, order_number: parseInt(e.target.value) })}
          min="1"
        />
      </div>
    </div>
  );

  const renderQuestionForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="module_id">Módulo</Label>
        <Select
          value={formData.module_id || ''}
          onValueChange={(value) => setFormData({ ...formData, module_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um módulo" />
          </SelectTrigger>
          <SelectContent>
            {modules.map((module) => (
              <SelectItem key={module.id} value={module.id}>
                {module.order_number}. {module.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="text">Texto da Questão</Label>
        <Textarea
          id="text"
          value={formData.text || ''}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          placeholder="Digite o texto da questão"
        />
      </div>
      
      <div>
        <Label htmlFor="type">Tipo de Questão</Label>
        <Select
          value={formData.type || 'text'}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Texto</SelectItem>
            <SelectItem value="textarea">Texto Longo</SelectItem>
            <SelectItem value="number">Número</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="url">URL</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="radio">Escolha Única</SelectItem>
            <SelectItem value="checkbox">Múltipla Escolha</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="hint">Dica (opcional)</Label>
        <Input
          id="hint"
          value={formData.hint || ''}
          onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
          placeholder="Digite uma dica para a questão"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="required"
          checked={formData.required || false}
          onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
        />
        <Label htmlFor="required">Questão obrigatória</Label>
      </div>
      
      <div>
        <Label htmlFor="order_number">Ordem</Label>
        <Input
          id="order_number"
          type="number"
          value={formData.order_number || 1}
          onChange={(e) => setFormData({ ...formData, order_number: parseInt(e.target.value) })}
          min="1"
        />
      </div>
    </div>
  );

  const renderOptionForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="question_id">Questão</Label>
        <Select
          value={formData.question_id || ''}
          onValueChange={(value) => setFormData({ ...formData, question_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma questão" />
          </SelectTrigger>
          <SelectContent>
            {questions.filter(q => q.type === 'radio' || q.type === 'checkbox').map((question) => (
              <SelectItem key={question.id} value={question.id}>
                {question.order_number}. {question.text}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="text">Texto da Opção</Label>
        <Input
          id="text"
          value={formData.text || ''}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          placeholder="Digite o texto da opção"
        />
      </div>
      
      <div>
        <Label htmlFor="order_number">Ordem</Label>
        <Input
          id="order_number"
          type="number"
          value={formData.order_number || 1}
          onChange={(e) => setFormData({ ...formData, order_number: parseInt(e.target.value) })}
          min="1"
        />
      </div>
    </div>
  );

  const getTitle = () => {
    const action = item ? 'Editar' : 'Adicionar';
    const itemType = type === 'module' ? 'Módulo' : 
                     type === 'question' ? 'Questão' : 'Opção';
    return `${action} ${itemType}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {type === 'module' && renderModuleForm()}
          {type === 'question' && renderQuestionForm()}
          {type === 'option' && renderOptionForm()}
        </div>
        
        <div className="flex justify-between">
          <div>
            {item && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};