import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';

const App = () => {
  const [notes, setNotes] = useState([]);
  const [composer, setComposer] = useState('Unknown Composer');
  const [title, setTitle] = useState('');
  const [octave, setOctave] = useState(4);
  const [beatLength, setBeatLength] = useState(1);
  const [keySignature, setKeySignature] = useState(0);
  const [timeNumerator, setTimeNumerator] = useState(4);
  const [timeDenominator, setTimeDenominator] = useState(4);

  const keyOptions = [
    { label: 'C major / A minor', value: 0 },
    { label: 'G major / E minor', value: 1 },
    { label: 'D major / B minor', value: 2 },
    { label: 'A major / F# minor', value: 3 },
    { label: 'E major / C# minor', value: 4 },
    { label: 'B major / G# minor', value: 5 },
    { label: 'F# major / D# minor', value: 6 },
    { label: 'Db major / Bb minor', value: -5 },
    { label: 'Ab major / F minor', value: -4 },
    { label: 'Eb major / C minor', value: -3 },
    { label: 'Bb major / G minor', value: -2 },
    { label: 'F major / D minor', value: -1 },
  ];

  const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const sharpNotes = ['C#', 'D#', 'F#', 'G#', 'A#'];
  const flatNotes = ['Db', 'Eb', 'Gb', 'Ab', 'Bb'];

  const handlers = useSwipeable({
    onSwipedUp: () => setOctave((prev) => Math.min(prev + 1, 5)),
    onSwipedDown: () => setOctave((prev) => Math.max(prev - 1, 3)),
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const addNote = (note) => {
    const selectedOctave = octave || 4;
    const selectedBeatLength = beatLength || 1;
    setNotes([...notes, { note, octave: selectedOctave, duration: selectedBeatLength, isRest: false }]);
  };

  const addRest = () => {
    const selectedBeatLength = beatLength || 1;
    setNotes([...notes, { duration: selectedBeatLength, isRest: true }]);
  };

  const handleBeatChange = (newValue) => {
    if (newValue >= 0.5) {
      setBeatLength(parseFloat(newValue));
    }
  };

  const getNoteTypeAndDots = (duration) => {
    if (duration === 0.5) return { type: 'eighth', dots: 0 };
    if (duration === 1) return { type: 'quarter', dots: 0 };
    if (duration === 2) return { type: 'half', dots: 0 };
    if (duration === 3) return { type: 'half', dots: 1 };
    if (duration === 4) return { type: 'whole', dots: 0 };
    return { type: 'whole', dots: 0 };
  };

  const generateMusicXML = () => {
    const header = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC
    "-//Recordare//DTD MusicXML 3.1 Partwise//EN"
    "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>${title}</work-title>
  </work>
  <movement-title>${title}</movement-title>
  <identification>
    <creator type="composer">${composer}</creator>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
      <score-instrument id="P1-I1">
        <instrument-name>Piano</instrument-name>
      </score-instrument>
      <midi-instrument id="P1-I1">
        <midi-channel>1</midi-channel>
        <midi-program>1</midi-program>
      </midi-instrument>
    </score-part>
  </part-list>
  <part id="P1">`;

    const measures = [];
    let measureNumber = 1;
    let notesInMeasure = 0;
    let measureNotes = '';

    notes.forEach((noteObj, index) => {
      let { note, octave, duration, isRest } = noteObj;

      while (duration > 0) {
        const remainingBeatsInMeasure = timeNumerator - notesInMeasure;
        const currentDuration = Math.min(duration, remainingBeatsInMeasure);

        const { type, dots } = getNoteTypeAndDots(currentDuration);

        let noteXML = `<note>`;

        if (isRest) {
          noteXML += `<rest/>`;
        } else {
          noteXML += `<pitch>
    <step>${note.charAt(0)}</step>
    <alter>${note.includes('#') ? 1 : note.includes('b') ? -1 : 0}</alter>
    <octave>${octave}</octave>
  </pitch>`;
        }

        noteXML += `<duration>${currentDuration}</duration>
  <type>${type}</type>`;

        if (dots > 0) {
          noteXML += `<dot/>`;
        }

        if (!isRest && duration > currentDuration) {
          noteXML += `
  <notations>
    <tied type="start"/>
  </notations>`;
        }

        if (!isRest && duration < noteObj.duration && currentDuration === duration) {
          noteXML += `
  <notations>
    <tied type="stop"/>
  </notations>`;
        }

        noteXML += `</note>`;
        measureNotes += noteXML;
        notesInMeasure += currentDuration / (4 / timeDenominator);
        duration -= currentDuration;

        if (notesInMeasure >= timeNumerator || (index === notes.length - 1 && duration <= 0)) {
          const attributes = measureNumber === 1 ? `
    <attributes>
      <divisions>1</divisions>
      <key>
        <fifths>${keySignature}</fifths>
      </key>
      <time>
        <beats>${timeNumerator}</beats>
        <beat-type>${timeDenominator}</beat-type>
      </time>
      <clef>
        <sign>G</sign>
        <line>2</line>
      </clef>
    </attributes>` : '';

          measures.push(`
  <measure number="${measureNumber}">
    ${attributes}
    ${measureNotes}
  </measure>`);
          measureNumber++;
          notesInMeasure = 0;
          measureNotes = '';
        }
      }
    });

    const footer = `
    </part>
</score-partwise>`;

    return `${header}\n${measures.join('\n')}\n${footer}`;
  };

  const downloadMusicXML = () => {
    const xmlContent = generateMusicXML();
    const blob = new Blob([xmlContent], { type: 'application/vnd.recordare.musicxml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.musicxml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div {...handlers}>
      <h1>Note Composer</h1>
      <div>
        <label>Title:
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
      </div>
      <div>
        <label>Composer:
          <input type="text" value={composer} onChange={(e) => setComposer(e.target.value)} />
        </label>
      </div>
      <div>
        <label>Key Signature:
          <select value={keySignature} onChange={(e) => setKeySignature(parseInt(e.target.value, 10))}>
            {keyOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>Time Signature:
          <input type="number" min="1" value={timeNumerator} onChange={(e) => setTimeNumerator(parseInt(e.target.value, 10))} />
          /
          <input type="number" min="1" value={timeDenominator} onChange={(e) => setTimeDenominator(parseInt(e.target.value, 10))} />
        </label>
      </div>
      <div>
        <label>Beat Length:</label>
        <button onClick={() => handleBeatChange(beatLength - 0.5)}>-</button>
        <input type="number" step="0.5" min="0.5" value={beatLength} onChange={(e) => handleBeatChange(e.target.value)} />
        <button onClick={() => handleBeatChange(beatLength + 0.5)}>+</button>
      </div>
      <div>
        <div>
          {sharpNotes.map((note) => (
            <button key={note} onClick={() => addNote(note)}>{note} (Octave {octave})</button>
          ))}
        </div>
        <div>
          {naturalNotes.map((note) => (
            <button key={note} onClick={() => addNote(note)}>{note} (Octave {octave})</button>
          ))}
        </div>
        <div>
          {flatNotes.map((note) => (
            <button key={note} onClick={() => addNote(note)}>{note} (Octave {octave})</button>
          ))}
        </div>
        <button onClick={addRest}>Rest (Duration: {beatLength})</button>
      </div>
      <div>
        <h2>Entered Notes:</h2>
        <ul>
          {notes.map((note, index) => (
            <li key={index}>
              {note.isRest
                ? `Rest - Duration: ${note.duration}`
                : `${note.note}${note.octave} - Duration: ${note.duration}`}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <button onClick={downloadMusicXML}>Download as MusicXML</button>
      </div>
    </div>
  );
};

export default App;
