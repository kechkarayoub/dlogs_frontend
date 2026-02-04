import React from 'react';
import type { LogSegment } from '../constants/types';
import { STATUS_Y } from '../constants/types';

// Props interface for the LogSheet component
// Contains trip data to display on the FMCSA Hours of Service log form
interface Props {
  segments: LogSegment[];
  day: number;
  date: string;
  driverName?: string;
  carrierName: string;
  startCityName?: string;
  pickUpCityName?: string;
  dropOffCityName?: string;
  numberOfDays?: number;
}

export const LogSheet: React.FC<Props> = ({ segments, day, date, carrierName, startCityName, pickUpCityName, dropOffCityName, numberOfDays }) => {
  // Chart dimensions and calculations
  const chartWidth = 760; // Total width of the chart in pixels
  const hourWidth = (chartWidth - 150) / 24; // Width allocated per hour (760 - 150 left margin) / 24 hours

  // Helper functions to calculate totals time by driver status
  // getSum: Calculates total duration (in hours) for a specific status (OFF_DUTY, SLEEPER, DRIVING, ON_DUTY)
  const getSum = (status: string) => 
    segments.filter(s => s.status === status).reduce((a, b) => a + b.duration, 0).toFixed(1);
  
  // getSumMilesMoved: Calculates total miles driven during DRIVING status segments
  const getSumMilesMoved = () => 
    segments.filter(s => s.status === "DRIVING").reduce((a, b) => a + b.miles_moved, 0).toFixed(1);

  // Extract remarks/events (Pickup, Fuel, etc.) - anything that's not a Driving segment
  const remarks = segments.filter(s => s.label !== 'Driving');
  
  // Split date string (YYYY-MM-DD) into components for display on form
  const date_splited = date.split('-');

  return (
    <div style={{marginTop: 25, paddingBottom: 50}} className="LogSheet bg-white p-6 shadow-2xl rounded-xl border border-gray-300 mb-12 w-[850px] mx-auto">
      <div className="top-[45px] left-[60px] font-mono text-sm text-blue-800 font-bold uppercase">
          {`Day log: ${date}. ${startCityName ? "Start from: " + startCityName : ""}${pickUpCityName ? ", Pickup from: " + pickUpCityName : ""}${dropOffCityName ? ", Drop off at: " + dropOffCityName : ""}${" (" + day + " of " + (numberOfDays || "?") + " days)"}`}
        </div>
      <div className="relative border-2 border-black" style={{ width: '800px', height: '500px' }}>
        {/* Background image: Official FMCSA Hours of Service log form template */}
        <img src="/blank-paper-log.png" className="absolute inset-0 w-full h-full object-fill" alt="Log Sheet" style={{width: "100%", height: "100%", marginBottom: 25}}/>
        
        {/* Date fields: Year, Month, Day (positioned to match form template) */}
        <div style={{top: 5, left: 406, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}} className="absolute top-[45px] left-[60px] font-mono text-sm text-blue-800 font-bold uppercase">
          {date_splited[0]} {/* Year */}
        </div>
        <div style={{top: 5, left: 288, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}}  className="absolute top-[45px] left-[60px] font-mono text-sm text-blue-800 font-bold uppercase">
          {date_splited[1]} {/* Month */}
        </div>
        <div style={{top: 5, left: 355, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}}  className="absolute top-[45px] left-[60px] font-mono text-sm text-blue-800 font-bold uppercase">
          {date_splited[2]} {/* Day */}
        </div>
        
        {/* Trip location fields */}
        <div style={{top: 32, left: 150, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}}  className="absolute top-[45px] left-[60px] font-mono text-sm text-blue-800 font-bold uppercase">
          {pickUpCityName} {/* Starting city */}
        </div>
        <div style={{top: 32, left: 430, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}}  className="absolute top-[45px] left-[60px] font-mono text-sm text-blue-800 font-bold uppercase">
          {dropOffCityName} {/* Destination city */}
        </div>
        
        {/* Carrier name and mileage fields */}
        <div  style={{top: 64, left: 485, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}} className="absolute top-[75px] left-[60px] font-mono text-xs text-blue-800 font-bold uppercase">
          {carrierName}
        </div>
        <div style={{top: 67, left: 132, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}} className="absolute top-[75px] left-[60px] font-mono text-xs text-blue-800 font-bold uppercase">
          {getSumMilesMoved()} {/* Total miles driven */}
        </div>
        <div style={{top: 67, left: 255, color: "red", lineHeight: 1, fontSize: "12px", fontWeight: "bold"}} className="absolute top-[75px] left-[60px] font-mono text-xs text-blue-800 font-bold uppercase">
          {getSumMilesMoved()} {/* Miles driven (duplicate field on form) */}
        </div>

        {/* SVG Chart: Draws red lines representing driver status timeline */}
        {/* Each line's position and height is determined by the driver's status during that time period */}
        <svg className="absolute top-[0px] left-[0px] w-[0px] h-[0px]" width={"100%"} height={"100%"}>
          {segments.map((seg, i) => {
            // Calculate horizontal position based on start hour
            const x1 = seg.start_hour * hourWidth;
            // Calculate end position based on duration
            const x2 = x1 + (seg.duration * hourWidth);
            // Get vertical position from status mapping (OFF_DUTY, SLEEPER, DRIVING, ON_DUTY)
            const y = STATUS_Y[seg.status] - 10;
            // Reference to next segment for transition line
            const next = segments[i + 1];

            return (
              <g key={i}>
                {/* Horizontal line representing the current status segment */}
                <line x1={x1 + 99} y1={y} x2={x2 + 99} y2={y} stroke="#d00" strokeWidth="2.5" />
                {/* Vertical transition line when status changes to next segment */}
                {next && <line x1={x2 + 99} y1={y} x2={x2 + 99} y2={STATUS_Y[next.status] - 10} stroke="#d00" strokeWidth="2.5" />}
              </g>
            );
          })}
        </svg>

        {/* Totals column on the right side of form: shows hours for each status and total hours */}
        <div style={{right: 30, width: 40, textAlign: "center", top: 175, color: "red"}} className="absolute top-[148px] right-[28px] flex flex-col gap-[14px] font-mono text-red-700 font-bold text-sm">
            <div style={{lineHeight: 1, marginTop: 3}}>{getSum('OFF_DUTY')}</div> {/* Off-Duty hours */}
            <div style={{lineHeight: 1, marginTop: 1}}>{getSum('SLEEPER')}</div> {/* Sleeper hours */}
            <div style={{lineHeight: 1, marginTop: 0}}>{getSum('DRIVING')}</div> {/* Driving hours */}
            <div style={{lineHeight: 1, marginTop: 0}}>{getSum('ON_DUTY')}</div> {/* On-Duty hours */}
            <div style={{lineHeight: 1, marginTop: 11}}>{(parseFloat(getSum('OFF_DUTY')) + parseFloat(getSum('SLEEPER')) + parseFloat(getSum('DRIVING')) + parseFloat(getSum('ON_DUTY'))).toFixed(1)}</div> {/* Total of all hours */}
        </div>

        {/* Remarks section: displays events like Pickup, Fuel, etc. at their corresponding time positions */}
        <div style={{top: 310, left: 0}} className="absolute top-[320px] left-[40px] w-[720px] h-[150px] flex flex-col gap-1">
          {remarks.map((r, i) => {
            // Calculate position of remark based on the hour it occurred
            const x1 = r.start_hour * hourWidth;
            return <div style={{width: "150px", textAlign: "right", fontSize: 12, left: x1, transform: "rotate(-70deg)", color: "red"}} key={i} className="absolute flex justify-between border-b border-gray-100 text-[11px] font-mono text-blue-900">
              <span>{r.label}</span> {/* Display the event/remark label */}
            </div>
    })}
        </div>
      </div>

    </div>
  );
};