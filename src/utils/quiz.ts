
import { supabase } from '@/integrations/supabase/client';
import { QuizModule, QuizQuestion, QuizOption, QuizSubmission, QuizAnswer } from '@/types/quiz';

export async function fetchModules(): Promise<QuizModule[]> {
  const { data, error } = await supabase
    .from('quiz_modules')
    .select('*')
    .order('order_number');
    
  if (error) throw error;
  return data || [];
}

export async function fetchQuestions(moduleId: string): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select(`
      *,
      quiz_options (*)
    `)
    .eq('module_id', moduleId)
    .order('order_number');
    
  if (error) throw error;
  
  return data?.map(question => ({
    ...question,
    options: question.quiz_options
  })) || [];
}

export async function fetchSubmission(userId: string): Promise<QuizSubmission | null> {
  const { data, error } = await supabase
    .from('quiz_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  if (error) throw error;
  return data;
}

export async function saveAnswer(
  submissionId: string,
  questionId: string,
  answer: string | null
): Promise<void> {
  const { error } = await supabase
    .from('quiz_answers')
    .upsert({
      submission_id: submissionId,
      question_id: questionId,
      answer,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'submission_id,question_id'
    });
    
  if (error) throw error;
}

export async function completeQuiz(submissionId: string): Promise<void> {
  const { error } = await supabase
    .from('quiz_submissions')
    .update({
      completed: true,
      completed_at: new Date().toISOString()
    })
    .eq('id', submissionId);
    
  if (error) throw error;
}

export async function isQuizComplete(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('is_quiz_complete', { p_user_id: userId });
    
  if (error) throw error;
  return data || false;
}
