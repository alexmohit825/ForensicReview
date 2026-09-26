import React, { useState } from 'react';
import { VitalSignPoint } from '../types/forensic';
import { Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface VitalsChartProps {
  vitals: VitalSignPoint[];
  onSelectReading: (vital: VitalSignPoint) => void;
}

export const VitalsChart: React.FC<VitalsChartProps> = ({ vitals, onSelectReading }) => {
  const [hoveredPoint, setHoveredPoint] = useState<VitalSignPoint | null>(null);

  if (!vitals || vitals.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
        <Activity className="w-8 h-8 mx-auto text-slate-600 mb-2" />
        <p className="font-semibold text-slate-300">No physiological vital signs charted yet.</p>
        <p className="text-slate-400 mt-1">
          Ingest medical records to auto-extract blood pressure, heart rate, and oxygenation curves.
        </p>
      </div>
    );
  }

  // Chart dimensions & scaling
  const chartHeight = 220;
  const paddingLeft = 50;
  const paddingRight = 40;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartWidth = 900;

  // SBP range 40 to 220
  const minY = 30;
  const maxY = 220;
  const scaleY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return chartHeight - paddingBottom - ((clamped - minY) / (maxY - minY)) * (chartHeight - paddingTop - paddingBottom);
  };

  const stepX = (chartWidth - paddingLeft - paddingRight) / Math.max(1, vitals.length - 1);

  // Generate SVG Path for SBP and DBP
  const sbpPoints = vitals.map((v, i) => `${paddingLeft + i * stepX},${scaleY(v.sbp || 120)}`).join(' ');
  const dbpPoints = vitals.map((v, i) => `${paddingLeft + i * stepX},${scaleY(v.dbp || 80)}`).join(' ');
  const mapPoints = vitals.map((v, i) => `${paddingLeft + i * stepX},${scaleY(v.map || 93)}`).join(' ');

  // Critical MAP threshold line at 65 mmHg
  const yMap65 = scaleY(65);
  // SBP Crisis threshold line at 180 mmHg
  const ySbp180 = scaleY(180);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Hemodynamic Trajectory & Vital Signs Curve
          </h4>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800">
            {vitals.length} Data Points
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">SBP (Systolic)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-300">DBP (Diastolic)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-300">MAP</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-400">
            <span className="w-3 border-t-2 border-dashed border-red-500" />
            <span>MAP &lt; 65 Shock Line</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[750px] select-none"
        >
          {/* Background grid lines */}
          {[60, 90, 120, 150, 180, 210].map((val) => {
            const y = scaleY(val);
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Critical Threshold Warning Lines */}
          <line
            x1={paddingLeft}
            y1={yMap65}
            x2={chartWidth - paddingRight}
            y2={yMap65}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.8"
          />
          <text
            x={chartWidth - paddingRight + 4}
            y={yMap65 + 3}
            fill="#ef4444"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            MAP 65
          </text>

          <line
            x1={paddingLeft}
            y1={ySbp180}
            x2={chartWidth - paddingRight}
            y2={ySbp180}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.7"
          />
          <text
            x={chartWidth - paddingRight + 4}
            y={ySbp180 + 3}
            fill="#f59e0b"
            fontSize="8"
            fontFamily="monospace"
          >
            SBP 180
          </text>

          {/* Area between SBP and DBP (Pulse Pressure Band) */}
          <polygon
            points={`
              ${sbpPoints} 
              ${vitals.map((_, i) => {
                const revIdx = vitals.length - 1 - i;
                return `${paddingLeft + revIdx * stepX},${scaleY(vitals[revIdx].dbp || 80)}`;
              }).join(' ')}
            `}
            fill="#0284c7"
            fillOpacity="0.12"
          />

          {/* SBP Line */}
          <polyline
            points={sbpPoints}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* DBP Line */}
          <polyline
            points={dbpPoints}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* MAP Line */}
          <polyline
            points={mapPoints}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {vitals.map((v, i) => {
            const x = paddingLeft + i * stepX;
            const ySbp = scaleY(v.sbp || 120);
            const yMap = scaleY(v.map || 93);
            const isHovered = hoveredPoint?.id === v.id;

            return (
              <g
                key={v.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(v)}
                onClick={() => onSelectReading(v)}
              >
                {/* Vertical Scrubber Guide on Hover */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={chartHeight - paddingBottom}
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* SBP Point Circle */}
                <circle
                  cx={x}
                  cy={ySbp}
                  r={isHovered ? 6 : v.criticalFlag ? 4.5 : 3.5}
                  fill={v.criticalFlag ? '#ef4444' : '#38bdf8'}
                  stroke="#0f172a"
                  strokeWidth="2"
                />

                {/* MAP Point Circle */}
                <circle
                  cx={x}
                  cy={yMap}
                  r={isHovered ? 4.5 : 2.5}
                  fill="#f59e0b"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />

                {/* X Axis Time Labels */}
                <text
                  x={x}
                  y={chartHeight - paddingBottom + 16}
                  textAnchor="middle"
                  fill={isHovered ? '#38bdf8' : '#94a3b8'}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                >
                  {v.timeDisplay}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Hover Card Detail */}
      {hoveredPoint && (
        <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-4 font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">TIMESTAMP</span>
              <span className="font-bold text-white">{hoveredPoint.timeDisplay}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">BLOOD PRESSURE</span>
              <span className="font-bold text-cyan-400">{hoveredPoint.sbp}/{hoveredPoint.dbp} mmHg</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">MAP</span>
              <span className={`font-bold ${(hoveredPoint.map || 0) < 65 ? 'text-red-400' : 'text-amber-400'}`}>
                {hoveredPoint.map} mmHg
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">HEART RATE</span>
              <span className="font-bold text-white">{hoveredPoint.hr || '—'} bpm</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 max-w-sm truncate text-[11px] italic">
              {hoveredPoint.providerNote}
            </span>
            <button
              onClick={() => onSelectReading(hoveredPoint)}
              className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 font-mono text-[11px] transition-colors flex items-center gap-1"
            >
              <span>{hoveredPoint.batesNumber}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
