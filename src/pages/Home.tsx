import React from "react";
import "./Home.css";
import YearPicker from "../components/YearPicker";
import { useYearStats } from "../hooks/UseYearStats";
import { judgeSummaryFromCases } from "../utils/transform";
import SummaryPanel from "../components/viewers/SummaryPanel";
import TimelinePanel from "../components/viewers/TimelinePanel";

const POSTAL_TO_PRUID = { NL:"10", PE:"11", NS:"12", NB:"13", QC:"24", ON:"35",
  MB:"46", SK:"47", AB:"48", BC:"59", YT:"60", NT:"61", NU:"62" };
const ALL_POSTALS = Object.keys(POSTAL_TO_PRUID);

function normalizeProvinceSummary(src: Record<string, number>) {
  return Object.fromEntries(
    ALL_POSTALS.map(pc => [pc, src[pc] ?? 0]) 
  );
}

export default function Home() {
    const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
    const { data, loading, error } = useYearStats(selectedYear);

  return (
    <div className="home-container">
        <div className="main-content">
            <div className="title">
            Supreme Court Case Dashboard
            </div>
            <div className="subtitle" style={{paddingBottom:"15px"}}>
            Select which year you would like to view Canadian Supreme Court judgments for
            </div>
      <YearPicker
      onYearSelect={(y) => setSelectedYear(y)}
      onSelect={() => setSelectedYear(null)} 
      />  
      {selectedYear !== null && (
          <div style={{ margin: 30}}>
            <p style={{ fontSize: 20, paddingBottom: 16, margin: 0 }}>
  {loading && <>Loading {selectedYear}…</>}
  {error && <>Could not load {selectedYear}: {error.message}</>}
  {data && !loading && (
    <>
      {data.case_count} Supreme Court judgments in {selectedYear}
      {console.log("data is", data)}
    </>
  )}
</p>
            {data?.cases && (
  <TimelinePanel
    title="Timeline of Judgments"
    description="Judgments over the months in the selected year."
    cases={data.cases}
    year={Number(data.year)}
    modes={["line", "table"]}
  />
  
)}
            {data?.case_brought_summary && (
  <SummaryPanel 
  description="How each matter reached the Court (e.g., by leave vs. as of right)." 
  title="Case Brought Summary" 
  type="Case Brought"
  modes={["bar", "pie", "table"]} 
  summary={data.case_brought_summary}  
  totalCases={data.case_count}
  cases={data.cases}                
    dim="case_brought" 
    year={selectedYear}
  />
)}
{data?.cases && (
  <SummaryPanel
    title="Justice Participation"
    modes={["bar","table"]} 
    type="Judge"      
    summary={judgeSummaryFromCases(data.cases, 20)} 
    totalCases={data.case_count} 
    description="Number of judgments each justice participated in."
    cases={data.cases}                
    dim="judge"  
    year={selectedYear}
      />
)}
{data?.case_type_summary && (
  <SummaryPanel title="Case Type Summary" 
  description="Types of cases judged on for the year."
  type="Type"
  modes={["bar", "pie", "table"]} summary={data.case_type_summary}  totalCases={data.case_count}
  cases={data.cases}             
  dim="case_type" 
  year={selectedYear}

   />
)}

{data?.decision_summary && (
  <SummaryPanel 
  description="Outcome categories for judgments" 
  title="Decision Summary" 
  type="Decision Outcome"
  modes={["bar", "pie", "table"]} 
  summary={data.decision_summary}  
  totalCases={data.case_count}
  cases={data.cases} 
  dim="decision_category" 
  year={selectedYear}
  />
)}
{data?.province_summary && (
    <SummaryPanel description="Origin of appeal by province/territory" 
    title="Summary of the Provinces on Appeal" 
    type="Appeal From"
    modes={["map","bar", "pie", "table"]} 
    summary={normalizeProvinceSummary(data.province_summary)}  
    totalCases={data.case_count}
    cases={data.cases} 
    dim="province"
    year={selectedYear}
  />
)}
{data?.subject_summary && (
  <SummaryPanel 
  description="Legal subject areas associated with judgments (e.g., administrative law, torts)." 
  title="Subject Summary" 
  type="Subject"
  modes={["bar", "pie", "table"]} 
  summary={data.subject_summary}  
  totalCases={data.case_count}
  cases={data.cases}
  dim="subject" 
  year={selectedYear}
 
  />
)}

          </div>
        )}
      </div>
    </div>
  );
}

