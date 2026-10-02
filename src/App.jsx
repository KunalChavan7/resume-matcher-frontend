import { useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, FileText, History as HistoryIcon, LoaderCircle, RotateCcw, Sparkles, Upload, X } from "lucide-react";
import { analyzeResume, getAnalysisHistory } from "./api.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function App() {
  const [resumeMode, setResumeMode] = useState("text");
  const [resumeText, setResumeText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function selectFile(event) {
    const selected = event.target.files?.[0] || null;
    setError("");
    if (selected && selected.type !== "application/pdf") {
      setFile(null);
      setError("Choose a PDF file to continue.");
      event.target.value = "";
      return;
    }
    if (selected && selected.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("This PDF is larger than 5 MB. Choose a smaller file.");
      event.target.value = "";
      return;
    }
    setFile(selected);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!jdText.trim()) {
      setError("Add the job description before analyzing.");
      return;
    }
    if (resumeMode === "text" && !resumeText.trim()) {
      setError("Paste your resume or switch to PDF upload.");
      return;
    }
    if (resumeMode === "pdf" && !file) {
      setError("Choose a PDF resume to continue.");
      return;
    }

    const formData = new FormData();
    formData.append("jobTitle", jobTitle.trim());
    formData.append("jdText", jdText.trim());
    if (resumeMode === "pdf") formData.append("resumeFile", file);
    else formData.append("resumeText", resumeText.trim());

    setIsSubmitting(true);
    try {
      setAnalysis(await analyzeResume(formData));
      setSelectedHistory(null);
      setHistoryOpen(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function startOver() {
    setAnalysis(null);
    setSelectedHistory(null);
    setHistoryOpen(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function openHistory() {
    setHistoryOpen(true);
    setHistoryError("");
    setHistoryLoading(true);
    try {
      setHistoryEntries(await getAnalysisHistory());
    } catch (requestError) {
      setHistoryError(requestError.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Margin home">
          <span className="wordmark-mark" aria-hidden="true">m.</span>
          <span>margin</span>
        </a>
        <span className="topbar-note">A clearer read on your next move</span>
      </header>

      <section className="intro" id="top">
        <div className="eyebrow"><span /> CAREER NOTES, NO. 01</div>
        <h1>Make your experience<br className="desktop-break" /> <em>fit the opportunity.</em></h1>
        <p>See where your resume meets the role, and what to bring into sharper focus.</p>
      </section>

      <div className="workspace">
        <form className="analysis-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <div>
              <span className="section-index">01 / THE MATERIALS</span>
              <h2>Set the context</h2>
            </div>
            <FileText size={19} strokeWidth={1.6} aria-hidden="true" />
          </div>

          <label className="field-label" htmlFor="job-title">Job title <span>OPTIONAL</span></label>
          <input
            id="job-title"
            className="text-input"
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
            placeholder="e.g. Product Designer"
            maxLength={120}
          />

          <div className="resume-label-row">
            <span className="field-label">Your resume</span>
            <div className="mode-switch" role="group" aria-label="Resume input type">
              <button type="button" className={resumeMode === "text" ? "mode-button active" : "mode-button"} onClick={() => setResumeMode("text")}>Paste text</button>
              <button type="button" className={resumeMode === "pdf" ? "mode-button active" : "mode-button"} onClick={() => setResumeMode("pdf")}>Upload PDF</button>
            </div>
          </div>
          {resumeMode === "text" ? (
            <textarea
              className="text-area resume-area"
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              placeholder="Paste your resume here, including your experience, skills, and education..."
              rows={7}
            />
          ) : (
            <div className={file ? "upload-area has-file" : "upload-area"}>
              <input id="resume-file" type="file" accept="application/pdf,.pdf" onChange={selectFile} />
              {file ? (
                <div className="file-selected">
                  <span className="file-icon"><FileText size={19} /></span>
                  <span className="file-meta"><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small></span>
                  <button type="button" className="icon-button remove-file" onClick={() => setFile(null)} aria-label="Remove resume"><X size={17} /></button>
                </div>
              ) : (
                <label className="upload-prompt" htmlFor="resume-file">
                  <span className="upload-icon"><Upload size={19} /></span>
                  <strong>Choose a PDF resume</strong>
                  <span>PDF only · up to 5 MB</span>
                </label>
              )}
            </div>
          )}

          <label className="field-label jd-label" htmlFor="job-description">Job description</label>
          <textarea
            id="job-description"
            className="text-area jd-area"
            value={jdText}
            onChange={(event) => setJdText(event.target.value)}
            placeholder="Paste the role description here..."
            rows={7}
          />

          {error && <p className="error-message" role="alert"><AlertCircle size={17} />{error}</p>}
          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><LoaderCircle className="spin" size={18} /> Reading your materials...</> : <>Compare documents <ArrowRight size={17} /></>}
          </button>
          <p className="privacy-note">Your documents are only used to generate this analysis.</p>
        </form>

        {analysis ? historyOpen ? (
          <HistoryPanel
            entries={historyEntries}
            isLoading={historyLoading}
            error={historyError}
            onBack={() => setHistoryOpen(false)}
            onSelect={(entry) => {
              setSelectedHistory(entry);
              setHistoryOpen(false);
            }}
          />
        ) : (
          <Results
            analysis={selectedHistory || analysis}
            isHistorical={Boolean(selectedHistory)}
            onOpenHistory={openHistory}
            onBackToCurrent={() => setSelectedHistory(null)}
            onStartOver={startOver}
          />
        ) : (
          <aside className="side-note" aria-label="How your analysis is presented">
            <div className="paper-lines" aria-hidden="true"><span /><span /><span /><span /><span /></div>
            <div className="side-note-copy">
              <Sparkles size={17} strokeWidth={1.5} />
              <p>A thoughtful comparison is more than a number. Find the overlap, spot the gaps, then refine the details that matter.</p>
            </div>
            <span className="side-note-caption">YOUR NEXT DRAFT STARTS HERE</span>
          </aside>
        )}
      </div>
      <footer className="page-footer"><span>MARGIN / RESUME MATCH</span><span>Made for the next chapter</span></footer>
    </main>
  );
}

function Results({ analysis, isHistorical, onOpenHistory, onBackToCurrent, onStartOver }) {
  const score = Math.max(0, Math.min(100, Number(analysis.matchScore) || 0));
  const suggestions = Array.isArray(analysis.bulletSuggestions) ? analysis.bulletSuggestions : [];
  const circumference = 2 * Math.PI * 48;

  return (
    <section className="results-panel" aria-live="polite" aria-labelledby="results-title">
      <div className="results-topline">
        <div>
          <span className="section-index">02 / THE READOUT</span>
          <h2 id="results-title">Your match notes</h2>
        </div>
        <div className="results-actions">
          {isHistorical ? (
            <button type="button" className="text-action" onClick={onBackToCurrent}><ArrowLeft size={14} /> Back</button>
          ) : (
            <button type="button" className="text-action" onClick={onOpenHistory}><HistoryIcon size={14} /> History</button>
          )}
          <button type="button" className="icon-button restart-button" onClick={onStartOver} aria-label="Start a new analysis" title="Start a new analysis"><RotateCcw size={17} /></button>
        </div>
      </div>

      <div className="score-summary">
        <div className="score-ring" role="img" aria-label={`Resume match score: ${score} percent`}>
          <svg viewBox="0 0 112 112" aria-hidden="true">
            <circle className="score-track" cx="56" cy="56" r="48" />
            <circle className="score-progress" cx="56" cy="56" r="48" style={{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - score / 100) }} />
          </svg>
          <div className="score-value"><strong>{score}</strong><span> MATCH</span></div>
        </div>
        <div className="score-copy">
          <span className="score-label">{analysis.jobTitle || "RESUME ALIGNMENT"}</span>
          <p>{analysis.summary || "Your analysis is ready. Review the skills and suggested edits below."}</p>
        </div>
      </div>

      <div className="skills-section">
        <SkillGroup title="In common" skills={analysis.matchedSkills} tone="matched" icon={<Check size={13} />} empty="No clear skill matches found." />
        <SkillGroup title="Worth addressing" skills={analysis.missingSkills} tone="missing" icon={<span className="missing-dot" />} empty="No notable skill gaps found." />
      </div>

      {suggestions.length > 0 && (
        <div className="rewrites-section">
          <div className="subsection-heading"><span className="section-index">A MORE PRECISE STORY</span><span>{suggestions.length} SUGGESTED EDIT{suggestions.length === 1 ? "" : "S"}</span></div>
          <div className="rewrite-list">
            {suggestions.map((suggestion, index) => {
              const improved = suggestion.improved || suggestion.rewrite || "";
              return (
                <article className="rewrite-item" key={`${index}-${suggestion.original}`}>
                  <div className="rewrite-number">0{index + 1}</div>
                  <div className="rewrite-copy">
                    <div className="rewrite-before"><span>YOUR BULLET</span><p>{suggestion.original}</p></div>
                    <div className="rewrite-after"><span>REFINED</span><p>{improved}</p></div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function HistoryPanel({ entries, isLoading, error, onBack, onSelect }) {
  return (
    <section className="results-panel history-panel" aria-live="polite" aria-labelledby="history-title">
      <div className="results-topline">
        <div>
          <span className="section-index">02 / THE ARCHIVE</span>
          <h2 id="history-title">History</h2>
        </div>
        <button type="button" className="text-action" onClick={onBack}><ArrowLeft size={14} /> Back</button>
      </div>

      {isLoading ? (
        <div className="history-status"><LoaderCircle className="spin" size={18} /> Loading saved analyses...</div>
      ) : error ? (
        <p className="history-error" role="alert"><AlertCircle size={16} />{error}</p>
      ) : entries.length === 0 ? (
        <p className="history-empty">No saved analyses yet.</p>
      ) : (
        <ul className="history-list">
          {entries.map((entry, index) => (
            <li key={entry._id || `${entry.createdAt || "analysis"}-${index}`}>
              <button type="button" className="history-entry" onClick={() => onSelect(entry)}>
                <MiniScoreRing score={entry.matchScore} />
                <span className="history-entry-copy">
                  <strong>{entry.jobTitle?.trim() || "Untitled role"}</strong>
                  <small>{formatAnalysisDate(entry.createdAt)}</small>
                </span>
                <ArrowRight className="history-entry-arrow" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MiniScoreRing({ score: rawScore }) {
  const score = Math.max(0, Math.min(100, Number(rawScore) || 0));
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  return (
    <span className="mini-score-ring" role="img" aria-label={`${score}% match`}>
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle className="mini-score-track" cx="22" cy="22" r={radius} />
        <circle className="mini-score-progress" cx="22" cy="22" r={radius} style={{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - score / 100) }} />
      </svg>
      <span>{score}</span>
    </span>
  );
}

function formatAnalysisDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function SkillGroup({ title, skills, tone, icon, empty }) {
  const list = Array.isArray(skills) ? skills : [];
  return (
    <div className={`skill-group ${tone}`}>
      <h3>{icon}<span>{title}</span><small>{list.length}</small></h3>
      {list.length ? <ul className="skill-list">{list.map((skill) => <li key={skill}>{skill}</li>)}</ul> : <p className="empty-skills">{empty}</p>}
    </div>
  );
}