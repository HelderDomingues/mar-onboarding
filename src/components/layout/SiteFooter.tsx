
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Logo e descrição */}
          <div className="md:col-span-4 flex flex-col space-y-4">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/61519f42-b5d3-4dec-9ee6-b8aba97c5725.png" 
                alt="MAR Logo" 
                className="h-8 mr-2" 
              />
              <span className="font-bold text-xl">MAR</span>
            </div>
            <p className="text-slate-400 text-sm">
              Transformando negócios através da inteligência artificial
              e estratégias de alto rendimento para empresas de todos os
              tamanhos.
            </p>
            <div className="flex space-x-4 pt-2">
              <a 
                href="https://www.facebook.com/crievalor" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-blue-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://www.instagram.com/crievalor" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-pink-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://www.linkedin.com/company/crievalor" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-blue-500 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Navegação */}
          <div className="md:col-span-2">
            <h3 className="font-semibold text-lg mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="text-slate-400 hover:text-white transition-colors">
                  Questionário MAR
                </Link>
              </li>
              <li>
                <Link to="/materials" className="text-slate-400 hover:text-white transition-colors">
                  Materiais
                </Link>
              </li>
              <li>
                <Link to="/quiz/view-answers" className="text-slate-400 hover:text-white transition-colors">
                  Minhas Respostas
                </Link>
              </li>
              <li>
                <Link to="/member" className="text-slate-400 hover:text-white transition-colors">
                  Área do Membro
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Serviços */}
          <div className="md:col-span-2">
            <h3 className="font-semibold text-lg mb-4">Serviços</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://crievalor.com.br/mar" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  MAR - Mapa Alto Rendimento
                </a>
              </li>
              <li>
                <a href="https://crievalor.com.br/gestao" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  Escola de Gestão
                </a>
              </li>
              <li>
                <a href="https://crievalor.com.br/mentorias" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  Mentorias
                </a>
              </li>
              <li>
                <a href="https://crievalor.com.br/branding" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  Branding
                </a>
              </li>
              <li>
                <a href="https://crievalor.com.br/projetos" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  Projetos sob Medida
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contato */}
          <div className="md:col-span-4">
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                <span className="text-slate-400">
                  <a href="mailto:contato@crievalor.com.br" className="hover:text-white transition-colors">
                    contato@crievalor.com.br
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="text-slate-400">
                  <div>
                    <a href="https://wa.me/5567996542991" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                      (67) 99654-2991 (MS)
                    </a>
                  </div>
                  <div className="mt-1">
                    <a href="https://wa.me/554799215-0289" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                      (47) 99215-0289 (SC)
                    </a>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="text-slate-400">
                  <p>MS: Campo Grande</p>
                  <p className="text-sm">
                    Rua Roque Tertuliano de Andrade, 836 - Vila Morumbi
                  </p>
                  <p className="mt-2">SC: Navegantes</p>
                  <p className="text-sm">
                    Rua Senador Carlos Gomes de Oliveira, 214 - Meia Praia
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Separador */}
        <div className="border-t border-slate-800 my-6"></div>
        
        {/* Copyright */}
        <div className="text-center text-slate-500 text-sm">
          <p>© {currentYear} Crie Valor. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
