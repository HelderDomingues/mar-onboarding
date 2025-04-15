
/**
 * Arquivo de exportação centralizada dos dados do questionário MAR
 * 
 * Este arquivo importa os dados dos módulos específicos e os exporta de forma consolidada.
 * A separação em arquivos menores facilita a manutenção do código.
 */

import { quizModulesData } from './quiz-modules-data';
import { quizQuestionsData } from './quiz-questions-data';
import { quizOptionsData } from './quiz-options-data';

export { quizModulesData, quizQuestionsData, quizOptionsData };
