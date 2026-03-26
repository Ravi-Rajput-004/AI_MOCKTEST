import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useCreateSession } from '../queries/interview.queries.js';
import LevelSelector from '../components/setup/LevelSelector.jsx';
import RoleSelector from '../components/setup/RoleSelector.jsx';
import CompanySelector from '../components/setup/CompanySelector.jsx';
import { pageVariants, slideRight } from '../animations/variants.js';

const STEPS = ['Level', 'Role', 'Company'];

export default function Setup() {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState('');
  const [role, setRole] = useState('');
  const [companyType, setCompanyType] = useState('');
  const createSession = useCreateSession();
  const navigate = useNavigate();

  const canProceed = step === 0 ? !!level : step === 1 ? !!role : !!companyType;

  const handleNext = () => {
    if (step < 2) { setStep(step + 1); return; }
    createSession.mutate({ level, role, companyType }, {
      onSuccess: (data) => navigate(`/interview/${data.id}`),
    });
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= step ? 'bg-primary text-white' : 'bg-bg-card text-text-muted border border-border'}`}>{i + 1}</div>
              <span className={`text-sm hidden sm:block ${i <= step ? 'text-primary' : 'text-text-muted'}`}>{s}</span>
              {i < 2 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} variants={slideRight} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <h2 className="text-2xl font-bold mb-2">
              {step === 0 && 'Select Your Experience Level'}
              {step === 1 && 'Choose Your Target Role'}
              {step === 2 && 'Pick Company Type'}
            </h2>
            <p className="text-sm text-text-muted mb-8">
              {step === 0 && 'This determines the difficulty and round structure of your interview.'}
              {step === 1 && 'Questions will be tailored to your role specialization.'}
              {step === 2 && 'Company type affects the interview format and question style.'}
            </p>

            {step === 0 && <LevelSelector selected={level} onSelect={setLevel} />}
            {step === 1 && <RoleSelector selected={role} onSelect={setRole} />}
            {step === 2 && <CompanySelector selected={companyType} onSelect={setCompanyType} />}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-10">
          <button onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0} className="px-6 py-2.5 text-sm border border-border rounded-lg hover:bg-bg-card transition-colors disabled:opacity-30">Back</button>
          <button onClick={handleNext} disabled={!canProceed || createSession.isPending} className="px-8 py-2.5 text-sm bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 btn-glow">
            {createSession.isPending ? 'Creating...' : step === 2 ? 'Start Interview →' : 'Next →'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
