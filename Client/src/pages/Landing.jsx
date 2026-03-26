import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BrainCircuit, BarChart3, Target, Mic, Code2, TrendingUp } from 'lucide-react';
import { heroTextVariants, staggerContainer, staggerItem, floatVariants } from '../animations/variants.js';

const TYPING_TEXTS = [
  'Reverse a linked list in O(n)...',
  'Design a URL shortener system...',
  'Tell me about a challenging project...',
  'Implement LRU Cache...',
  'Explain SOLID principles...',
];

function TypingEffect() {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = TYPING_TEXTS[textIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < text.length) {
        setCharIndex(charIndex + 1);
      } else if (!isDeleting && charIndex === text.length) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && charIndex > 0) {
        setCharIndex(charIndex - 1);
      } else {
        setIsDeleting(false);
        setTextIndex((textIndex + 1) % TYPING_TEXTS.length);
      }
    }, isDeleting ? 30 : 60);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex]);

  return (
    <span className="text-primary-light">
      {TYPING_TEXTS[textIndex].slice(0, charIndex)}
      <span className="animate-pulse">|</span>
    </span>
  );
}

const features = [
  { icon: <BrainCircuit className="w-8 h-8 text-primary" />, title: 'AI-Powered Questions', desc: 'GPT-4o generates questions tailored to your level, role, and target company.' },
  { icon: <BarChart3 className="w-8 h-8 text-success" />, title: 'Detailed Analysis', desc: 'Get scored on correctness, time complexity, code quality, and communication.' },
  { icon: <Target className="w-8 h-8 text-warning" />, title: 'Company Specific', desc: 'Practice for FAANG, startups, fintech, and more with relevant question sets.' },
  { icon: <Mic className="w-8 h-8 text-danger" />, title: 'Voice Interviews', desc: 'Practice HR rounds with speech-to-text and STAR framework analysis.' },
  { icon: <Code2 className="w-8 h-8 text-info" />, title: 'Live Code Editor', desc: 'Write code in JS, Python, Java, or C++ with Monaco Editor.' },
  { icon: <TrendingUp className="w-8 h-8 text-primary-light" />, title: 'Track Progress', desc: 'See your improvement trends, weak areas, and percentile rankings.' },
];

const steps = [
  { num: '01', title: 'Choose Your Level', desc: 'Select SDE-1 to SDE-4 based on your experience.' },
  { num: '02', title: 'Start Interview', desc: 'AI generates rounds tailored to your profile.' },
  { num: '03', title: 'Get AI Feedback', desc: 'Receive detailed scores and improvement areas.' },
];

export default function Landing() {
  return (
    <div className="animated-gradient min-h-screen">
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <motion.div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" variants={floatVariants} animate="animate" />
        <motion.div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" variants={floatVariants} animate="animate" style={{ animationDelay: '2s' }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div custom={0} variants={heroTextVariants} initial="initial" animate="animate" className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary-light mb-6">
            🚀 AI-Powered Mock Interviews
          </motion.div>

          <motion.h1 custom={1} variants={heroTextVariants} initial="initial" animate="animate" className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Crack Your Next
            <br />
            <span className="gradient-text">Tech Interview</span>
          </motion.h1>

          <motion.div custom={2} variants={heroTextVariants} initial="initial" animate="animate" className="text-lg sm:text-xl text-text-secondary mb-4 h-8 font-mono">
            <TypingEffect />
          </motion.div>

          <motion.p custom={3} variants={heroTextVariants} initial="initial" animate="animate" className="text-base text-text-secondary max-w-2xl mx-auto mb-10">
            Practice DSA, System Design, HR rounds with GPT-4o & Gemini. Get scored like a real interview — from SDE-1 to SDE-4.
          </motion.p>

          <motion.div custom={4} variants={heroTextVariants} initial="initial" animate="animate" className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="px-8 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-base font-semibold transition-all btn-glow">
              Start Free Interview →
            </Link>
            <Link to="/login" className="px-8 py-3.5 border border-border hover:border-primary/50 rounded-xl text-base transition-colors">
              Login
            </Link>
          </motion.div>

          <motion.div custom={5} variants={heroTextVariants} initial="initial" animate="animate" className="mt-12 flex items-center justify-center gap-8 text-sm text-text-muted">
            <span>🎓 <strong className="text-text-primary">10,000+</strong> Interviews</span>
            <span>⭐ <strong className="text-text-primary">4.8</strong> Rating</span>
            <span>🏢 <strong className="text-text-primary">50+</strong> Companies</span>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Everything You Need to <span className="gradient-text">Succeed</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-text-muted mb-12 max-w-xl mx-auto">
            A complete interview simulation platform powered by the best AI models.
          </motion.p>

          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <motion.div key={f.title} variants={staggerItem} whileHover={{ y: -4, borderColor: 'var(--color-primary)' }} className="p-6 bg-bg-card rounded-xl border border-border transition-colors">
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-text-muted">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-bg-surface/50">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl font-bold text-center mb-12">
            How It <span className="gradient-text">Works</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-[#A78BFA] flex items-center justify-center text-xl font-bold mx-auto mb-4">{step.num}</div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-text-muted">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Ace Your Interview?
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-text-muted mb-8 text-lg">
            Start practicing with our free plan. Upgrade anytime for unlimited interviews and premium feedback.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="inline-block px-10 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-lg font-semibold transition-all btn-glow">
              Get Started Free →
            </Link>
            <Link to="/pricing" className="inline-block px-10 py-4 border border-border hover:border-primary/50 text-text-primary rounded-xl text-lg font-semibold transition-all">
              View Plans
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-text-muted">
          <span className="gradient-text font-bold">MockPrep AI</span>
          <span>© 2026 All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
