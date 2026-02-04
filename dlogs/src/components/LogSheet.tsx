import React from 'react';
import type { LogSegment } from '../constants/types';
import { STATUS_Y } from '../constants/types';

interface Props {
  segments: LogSegment[];
  day: number;
  date: string;
  driverName: string;
  carrierName: string;
  startCityName?: string;
  pickUpCityName?: string;
  dropOffCityName?: string;
  numberOfDays?: number;
}

export const ELDLogSheet: React.FC<Props> = ({ segments, day, date, driverName, carrierName, startCityName, pickUpCityName, dropOffCityName, numberOfDays }) => {
  const chartWidth = 760;
  const hourWidth = (chartWidth - 150) / 24;

  // Calcul des totaux par ligne
  const getSum = (status: string) => 
    segments.filter(s => s.status === status).reduce((a, b) => a + b.duration, 0).toFixed(1);
  const getSumMilesMoved = () => 
    segments.filter(s => s.status === "DRIVING").reduce((a, b) => a + b.miles_moved, 0).toFixed(1);

  // Extraction des remarques (ex: Pickup, Fuel, etc.)
  const remarks = segments.filter(s => s.label !== 'Driving');
  const date_splited = date.split('-');

  return (
    <div className="bg-white p-6 shadow-2xl rounded-xl border border-gray-300 mb-12 w-[850px] mx-auto">
      <div className="top-[45px] left-[60px] font-mono text-sm text-blue-800 font-bold uppercase">
          {`Day log: ${date}. ${startCityName ? "Start from: " + startCityName : ""}${pickUpCityName ? ", Pickup from: " + pickUpCityName : ""}${dropOffCityName ? ", Drop off at: " + dropOffCityName : ""}${" (" + day + " of " + (numberOfDays || "?") + " days)"}`}
        </div>
      <div className="relative border-2 border-black" style={{ width: '800px', height: '500px' }}>
        {/* L'image de fond fournie */}
        <img src="/blank-paper-log.png" className="absolute inset-0 w-full h-full object-fill" alt="Log Sheet" style={{width: "100%", height: "100%"}}/>
        
        <div style={{top: 5, left: 406, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}} className="absolute top-[45px] left-[60px] font-mono text-sm text-blue-800 font-bold uppercase">
          {date_splited[0]}
        </div>
        <div style={{top: 5, left: 288, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}}  className="absolute top-[45px] left-[60px] font-mono text-sm text-blue-800 font-bold uppercase">
          {date_splited[1]}
        </div>
        <div style={{top: 5, left: 355, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}}  className="absolute top-[45px] left-[60px] font-mono text-sm text-blue-800 font-bold uppercase">
          {date_splited[2]}
        </div>
        <div style={{top: 32, left: 150, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}}  className="absolute top-[45px] left-[60px] font-mono text-sm text-blue-800 font-bold uppercase">
          {pickUpCityName}
        </div>
        <div style={{top: 32, left: 430, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}}  className="absolute top-[45px] left-[60px] font-mono text-sm text-blue-800 font-bold uppercase">
          {dropOffCityName}
        </div>
        <div  style={{top: 64, left: 485, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}} className="absolute top-[75px] left-[60px] font-mono text-xs text-blue-800 font-bold uppercase">
          {carrierName}
        </div>
        <div style={{top: 67, left: 132, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}} className="absolute top-[75px] left-[60px] font-mono text-xs text-blue-800 font-bold uppercase">
          {getSumMilesMoved()}
        </div>
        <div style={{top: 67, left: 255, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}} className="absolute top-[75px] left-[60px] font-mono text-xs text-blue-800 font-bold uppercase">
          {getSumMilesMoved()}
        </div>

        {/* --- 2. GRAPHIQUE SVG (LIGNES ROUGES) --- */}
        <svg className="absolute top-[0px] left-[0px] w-[0px] h-[0px]" width={"100%"} height={"100%"}>
          {segments.map((seg, i) => {
            const x1 = seg.start_hour * hourWidth;
            const x2 = x1 + (seg.duration * hourWidth);
            const y = STATUS_Y[seg.status] - 10; // Ajustement Y selon ta grille
            const next = segments[i + 1];

            return (
              <g key={i}>
                {/* Ligne horizontale de statut */}
                <line x1={x1 + 99} y1={y} x2={x2 + 99} y2={y} stroke="#d00" strokeWidth="2.5" />
                {/* Ligne verticale de transition */}
                {next && <line x1={x2 + 99} y1={y} x2={x2 + 99} y2={STATUS_Y[next.status] - 10} stroke="#d00" strokeWidth="2.5" />}
              </g>
            );
          })}
        </svg>

        {/* --- 3. TOTAUX HORAIRES (COLONNE DE DROITE) --- */}
        <div style={{right: 30, width: 40, textAlign: "center", top: 175, color: "red"}} className="absolute top-[148px] right-[28px] flex flex-col gap-[14px] font-mono text-red-700 font-bold text-sm">
            <div style={{lineHeight: 1, marginTop: 3}}>{getSum('OFF_DUTY')}</div>
            <div style={{lineHeight: 1, marginTop: 1}}>{getSum('SLEEPER')}</div>
            <div style={{lineHeight: 1, marginTop: 0}}>{getSum('DRIVING')}</div>
            <div style={{lineHeight: 1, marginTop: 0}}>{getSum('ON_DUTY')}</div>
            <div style={{lineHeight: 1, marginTop: 11}}>{(parseFloat(getSum('OFF_DUTY')) + parseFloat(getSum('SLEEPER')) + parseFloat(getSum('DRIVING')) + parseFloat(getSum('ON_DUTY'))).toFixed(1)}</div>
        </div>

        {/* --- 4. REMARQUES (L'ENDROIT OÙ ÇA S'EST PASSÉ) --- */}
        <div style={{top: 310, left: 0}} className="absolute top-[320px] left-[40px] w-[720px] h-[150px] flex flex-col gap-1">
          {remarks.map((r, i) => {
            
            const x1 = r.start_hour * hourWidth;
            return <div style={{width: "150px", textAlign: "right", fontSize: 12, left: x1, transform: "rotate(-70deg)", color: "red"}} key={i} className="absolute flex justify-between border-b border-gray-100 text-[11px] font-mono text-blue-900">
              <span>{r.label}</span>
            </div>
    })}
        </div>
      </div>

    </div>
  );
};