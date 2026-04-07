import React, { useState } from 'react';
import './Onboarding.css';
import { IoBulbOutline, IoMicOutline, IoPencilOutline, IoSendOutline, IoStopCircleOutline } from 'react-icons/io5';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Onboarding: React.FC = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [inputMode, setInputMode] = useState<'none' | 'text' | 'voice'>('none');
  const [textValue, setTextValue] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [finished, setFinished] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [askingApellido, setAskingApellido] = useState(false);

  const questions = [
    '¿Cuál es tu nombre?',
    askingApellido ? '¿Y tu apellido?' : '',
    '¿A qué te dedicas actualmente?',
    '¿Cuál es tu principal meta financiera?',
    '¿Tienes algún negocio o emprendimiento?',
    '¿Platicanos un poco más sobre tu negocio, de qué trata?',
    '¿Cómo prefieres recibir consejos financieros?',
  ].filter(Boolean);

  const getInitials = (name: string, last: string) => {
    const n = name.trim()[0]?.toUpperCase() || '';
    const l = last.trim()[0]?.toUpperCase() || '';
    return `${n}${l}`;
  };

  const saveUserToStorage = (name: string, last: string) => {
    localStorage.setItem('feria_nombre', name);
    localStorage.setItem('feria_apellido', last);
    localStorage.setItem('feria_initials', getInitials(name, last));
  };

  const handleModeSelect = (mode: 'text' | 'voice') => {
    setInputMode(mode);
  };

  const handleSubmitText = () => {
    if (!textValue.trim()) return;
    submitAnswer(textValue.trim());
  };

  const submitAnswer = (answer: string) => {
    // Pregunta 0: nombre
    if (currentQ === 0) {
      const parts = answer.trim().split(' ');
      if (parts.length >= 2) {
        // Dio nombre y apellido juntos
        const n = parts[0];
        const a = parts.slice(1).join(' ');
        setNombre(n);
        setApellido(a);
        saveUserToStorage(n, a);
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);
        setTextValue('');
        setCurrentQ(currentQ + 1);
        return;
      } else {
        // Solo dio nombre, pedir apellido
        setNombre(parts[0]);
        setAskingApellido(true);
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);
        setTextValue('');
        setCurrentQ(currentQ + 1);
        return;
      }
    }

    // Pregunta de apellido (si aplica)
    if (askingApellido && currentQ === 1) {
      const a = answer.trim();
      setApellido(a);
      saveUserToStorage(nombre, a);
      setAskingApellido(false);
      const newAnswers = [...answers, answer];
      setAnswers(newAnswers);
      setTextValue('');
      setCurrentQ(currentQ + 1);
      return;
    }

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setTextValue('');

    if (currentQ + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-MX';
    recognition.interimResults = false;
    setIsRecording(true);
    recognition.start();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      submitAnswer(transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
  };

  const progress = (currentQ / questions.length) * 100;
  const displayName = apellido ? `${nombre} ${apellido}` : nombre;
  const initials = getInitials(nombre, apellido);

  if (finished) {
    return (
      <div className="onboarding-page">
        <Navbar userName={displayName} avatarInitials={initials} notificationCount={0} />
        <div className="onboarding">
          <div className="onboarding__finished">
            <div className="onboarding__ai-icon">
              <IoBulbOutline size={40} />
            </div>
            <h2>¡Listo, {nombre}!</h2>
            <p>Ya te conozco mejor. Estoy lista para ayudarte a alcanzar tus metas financieras. 🚀</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <Navbar userName={displayName || 'FerIA'} avatarInitials={initials || 'FE'} notificationCount={0} />
      <div className="onboarding">

        <div className="onboarding__header">
          <h1 className="onboarding__title">Bienvenido a <span>FerIA</span></h1>
          <p className="onboarding__subtitle">Queremos conocerte más</p>
        </div>

        <div className="onboarding__progress-bar">
          <div className="onboarding__progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="onboarding__progress-text">{currentQ + 1} de {questions.length}</p>

        <div className="onboarding__bubble-wrapper">
          <div className="onboarding__ai-avatar">
            <IoBulbOutline size={28} />
          </div>
          <div className="onboarding__bubble">
            <p>{questions[currentQ]}</p>
          </div>
        </div>

        {inputMode === 'none' && (
          <div className="onboarding__mode">
            <p>¿Cómo deseas responder?</p>
            <div className="onboarding__mode-btns">
              <button className="onboarding__mode-btn" onClick={() => handleModeSelect('voice')}>
                <IoMicOutline size={28} />
                <span>Voz</span>
              </button>
              <button className="onboarding__mode-btn" onClick={() => handleModeSelect('text')}>
                <IoPencilOutline size={28} />
                <span>Escribir</span>
              </button>
            </div>
          </div>
        )}

        {inputMode === 'text' && (
          <div className="onboarding__input-wrapper">
            <input
              className="onboarding__input"
              type="text"
              placeholder="Escribe tu respuesta..."
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitText()}
              autoFocus
            />
            <button className="onboarding__send-btn" onClick={handleSubmitText}>
              <IoSendOutline size={20} />
            </button>
          </div>
        )}

        {inputMode === 'voice' && (
          <div className="onboarding__voice">
            <button
              className={`onboarding__mic-btn ${isRecording ? 'onboarding__mic-btn--recording' : ''}`}
              onClick={handleVoice}
              disabled={isRecording}
            >
              {isRecording ? <IoStopCircleOutline size={36} /> : <IoMicOutline size={36} />}
            </button>
            <p>{isRecording ? 'Escuchando...' : 'Toca el micrófono para responder'}</p>
          </div>
        )}

        {inputMode !== 'none' && (
          <button className="onboarding__change-mode" onClick={() => setInputMode('none')}>
            Cambiar forma de responder
          </button>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Onboarding;