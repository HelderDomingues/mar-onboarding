
import React from "react";
import { Link } from "react-router-dom";
import { 
  Mail, 
  MessageSquare, 
  MapPin, 
  ExternalLink,
  Linkedin,
  Instagram,
  Twitter
} from "lucide-react";

export function SiteFooler() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-blue-900 text-white">
      <div className="container mx-auto px-4 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1">
            <img 
              src="https://static.wixstatic.com/media/783feb_0e0fffdb3f3e4eafa422021dcea535d4~mv2.png" 
              alt="MAR - Mapa para Alto Rendimento" 
              className="h-8 mb-4"
            />
            <p className="mb-4 text-blue-100 text-sm">
              Transformando negócios através da inteligência artificial e estratégias de alto rendimento para empresas de todos os tamanhos.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.linkedin.com/company/crievalor" 
                target="_blank" 
                rel="noreferrer" 
                className="text-blue-100 hover:text-white transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/crievalor" 
                target="_blank" 
                rel="noreferrer" 
                className="text-blue-100 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com/crievalor" 
                target="_blank" 
                rel="noreferrer" 
                className="text-blue-100 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-medium text-lg mb-4">Navegação</h3>
            <ul className="space-y-2 text-blue-100">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="hover:text-white transition-colors">
                  Questionário MAR
                </Link>
              </li>
              <li>
                <Link to="/quiz/review" className="hover:text-white transition-colors">
                  Análises e Resultados
                </Link>
              </li>
              <li>
                <Link to="/materials" className="hover:text-white transition-colors">
                  Materiais
                </Link>
              </li>
              <li>
                <Link to="/member" className="hover:text-white transition-colors">
                  Área do Membro
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-medium text-lg mb-4">Serviços</h3>
            <ul className="space-y-2 text-blue-100">
              <li>
                <a 
                  href="https://crievalor.com.br/mar" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  MAR - Mapa para Alto Rendimento
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://crievalor.com.br/escola-de-gestao" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Escola de Gestão
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://crievalor.com.br/mentorias" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Mentorias
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://crievalor.com.br/branding" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Branding
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://crievalor.com.br/projetos-sob-medida" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Projetos sob Medida
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-medium text-lg mb-4">Contato</h3>
            <ul className="space-y-3 text-blue-100">
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 shrink-0 mt-0.5" />
                <a 
                  href="mailto:contato@crievalor.com.br" 
                  className="hover:text-white transition-colors"
                >
                  contato@crievalor.com.br
                </a>
              </li>
              
              <li className="flex items-start gap-2">
                <MessageSquare className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <div>67 99654-2991 (MS)</div>
                  <div>47 99215-0289 (SC)</div>
                </div>
              </li>
              
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium mb-1">MS: Campo Grande</div>
                  <div className="text-sm">Rua Roque Tertuliano de Andrade, 836 - Vila Morumbi</div>
                </div>
              </li>
              
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium mb-1">SC: Navegantes</div>
                  <div className="text-sm">Rua Senador Carlos Gomes de Oliveira, 214 - Meia Praia</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-blue-800 pt-6 pb-4 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-blue-200">
              © {currentYear} Crie Valor. Todos os direitos reservados.
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-blue-200">
              <a 
                href="https://crievalor.com.br/politica-de-privacidade" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-white transition-colors"
              >
                Política de Privacidade
              </a>
              <a 
                href="https://crievalor.com.br/termos-de-servico" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-white transition-colors"
              >
                Termos de Serviço
              </a>
              <a 
                href="https://crievalor.com.br/politica-de-entrega-e-reembolso" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-white transition-colors"
              >
                Política de Entrega e Reembolso
              </a>
              <a 
                href="https://crievalor.com.br/acessibilidade" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-white transition-colors"
              >
                Acessibilidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
