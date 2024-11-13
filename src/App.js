import React, { useState } from 'react';

const App = () => {
  const [notes, setNotes] = useState([]);
  const [composer, setComposer] = useState('Unknown Composer');
  const [title, setTitle] = useState('');
  const [beatLength, setBeatLength] = useState(1);
  const [keySignature, setKeySignature] = useState(0);
  const [timeNumerator, setTimeNumerator] = useState(4);
  const [timeDenominator, setTimeDenominator] = useState(4);
  const [octaves, setOctaves] = useState({});

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

  const naturalNotes = [
    { western: 'C', sargam: 'Sa' },
    { western: 'D', sargam: 'Re' },
    { western: 'E', sargam: 'Ga' },
    { western: 'F', sargam: 'Ma' },
    { western: 'G', sargam: 'Pa' },
    { western: 'A', sargam: 'Dha' },
    { western: 'B', sargam: 'Ni' },
  ];

  const sharpNotes = [
    { western: 'C#', sargam: 'Sa#' },
    { western: 'D#', sargam: 'Re#' },
    { western: 'F#', sargam: 'Ma#' },
    { western: 'G#', sargam: 'Pa#' },
    { western: 'A#', sargam: 'Dha#' },
  ];

  const flatNotes = [
    { western: 'Db', sargam: 'Re♭' },
    { western: 'Eb', sargam: 'Ga♭' },
    { western: 'Gb', sargam: 'Pa♭' },
    { western: 'Ab', sargam: 'Dha♭' },
    { western: 'Bb', sargam: 'Ni♭' },
  ];

  const addNote = (note, octave) => {
    const selectedBeatLength = beatLength || 1;
    setNotes([...notes, { note, octave, duration: selectedBeatLength, isRest: false }]);
  };

  const addRest = () => {
    const selectedBeatLength = beatLength || 1;
    setNotes([...notes, { duration: selectedBeatLength, isRest: true }]);
  };

  const changeOctave = (note, delta) => {
    setOctaves((prevOctaves) => {
      const newOctave = Math.max(1, (prevOctaves[note] || 4) + delta);
      return { ...prevOctaves, [note]: newOctave };
    });
  };

  const undoLastNote = () => {
    setNotes((prevNotes) => prevNotes.slice(0, -1));
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
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-4">Note Composer</h1>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <label className="flex flex-col">
            <span className="font-semibold">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col">
            <span className="font-semibold">Composer</span>
            <input
              type="text"
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col">
            <span className="font-semibold">Key Signature</span>
            <select
              value={keySignature}
              onChange={(e) => setKeySignature(parseInt(e.target.value, 10))}
              className="border rounded px-2 py-1"
            >
              {keyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Time Signature:</span>
            <input
              type="number"
              min="1"
              value={timeNumerator}
              onChange={(e) => setTimeNumerator(parseInt(e.target.value, 10))}
              className="border rounded w-12 text-center"
            />
            <span>/</span>
            <input
              type="number"
              min="1"
              value={timeDenominator}
              onChange={(e) => setTimeDenominator(parseInt(e.target.value, 10))}
              className="border rounded w-12 text-center"
            />
          </div>
        </div>
        <div className="mb-6">
          <span className="font-semibold">Beat Length:</span>
          <div className="inline-flex ml-2 items-center">
            <button onClick={() => handleBeatChange(beatLength - 0.5)} className="px-2 py-1 bg-gray-200 rounded">-</button>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={beatLength}
              onChange={(e) => handleBeatChange(e.target.value)}
              className="border rounded w-16 text-center mx-2"
            />
            <button onClick={() => handleBeatChange(beatLength + 0.5)} className="px-2 py-1 bg-gray-200 rounded">+</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[sharpNotes, naturalNotes, flatNotes].map((noteSet, idx) => (
            <div key={idx} className="flex flex-wrap gap-2">
              {noteSet.map(({ western, sargam }) => (
                <div key={western} className="flex flex-col items-center">
                  <button
                    onClick={() => addNote(western, octaves[western] || 4)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md"
                  >
                    {sargam} (Octave {octaves[western] || 4})
                  </button>
                  <div className="flex space-x-1 mt-1">
                    <button onClick={() => changeOctave(western, -1)} className="text-sm bg-gray-300 px-2 rounded">-</button>
                    <button onClick={() => changeOctave(western, 1)} className="text-sm bg-gray-300 px-2 rounded">+</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <button onClick={addRest} className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-md">
          Add Rest (Duration: {beatLength})
        </button>
        <button onClick={undoLastNote} disabled={notes.length === 0} className="mt-4 ml-2 bg-red-500 text-white px-4 py-2 rounded-md">
          Undo Last Note
        </button>

        <button onClick={downloadMusicXML} className="mt-4 ml-2 bg-green-500 text-white px-4 py-2 rounded-md">
          Download as MusicXML
        </button>
      </div>

      <div className="w-1/4 bg-white shadow-lg border-l p-6">
        <h2 className="text-xl font-semibold mb-4">Entered Notes</h2>
        <ul className="space-y-2">
          {notes.map((note, index) => (
            <li key={index} className="border-b pb-2">
              {note.isRest
                ? `Rest - Duration: ${note.duration}`
                : `${note.note}${note.octave} - Duration: ${note.duration}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
