import { motion as Motion } from 'framer-motion';
import { AlertTriangle, Trophy } from 'lucide-react';
import { staggerItem } from '../../animations/variants.js';

export default function WeakAreaCard({ areas = [], type = 'weak' }) {
  const isWeak = type === 'weak';
  return (
    <div className="bg-bg-card rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        {isWeak ? <><AlertTriangle className="w-4 h-4 text-warning" /> Weak Areas</> : <><Trophy className="w-4 h-4 text-success" /> Strong Areas</>}
      </h3>
      {areas.length === 0 ? (
        <p className="text-xs text-text-muted">Complete more interviews to identify {isWeak ? 'weak' : 'strong'} areas</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {areas.map((area) => (
            <Motion.span key={area} variants={staggerItem} className={`text-xs px-3 py-1.5 rounded-full capitalize ${isWeak ? 'bg-danger/10 text-danger-light' : 'bg-success/10 text-success-light'}`}>{area.replace(/([A-Z])/g, ' $1').trim()}</Motion.span>
          ))}
        </div>
      )}
    </div>
  );
}
