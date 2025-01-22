import React, { useEffect, useState } from 'react';

const App = () => {
  const [notes, setNotes] = useState([]);
  const [composer, setComposer] = useState('Unknown Composer');
  const [title, setTitle] = useState('');
  const [beatLength, setBeatLength] = useState(1);
  const [keySignature, setKeySignature] = useState(0);
  const [timeNumerator, setTimeNumerator] = useState(4);
  const [timeDenominator, setTimeDenominator] = useState(4);
  const [octaves, setOctaves] = useState({});
  const [isGraceNote, setIsGraceNote] = useState(false);
  const [pickupDuration, setPickupDuration] = useState(0);
  const [notesVisual, setNotesVisual] = useState('')
  const [unfinishedEighthNotePair, setUnfinishedEighthNotePair] = useState()


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

  const generateCustomNotation = () => {
    let result = '| ';
    let unfinshedPair = false
    let measureBeat = 0
    notes.forEach((noteObj, index) => {
      const { note, octave, duration, isRest, isGraceNote, beat } = noteObj;

      if (true) {
        if (isRest) {
          if (duration == 1) {
            if (measureBeat % timeNumerator == 0) {
              result += "| "
            }
            result += "𝄽 "
            measureBeat += 1
          }
          if (duration == 0.5) {
            result += "𝄾 "
            measureBeat += 0.5
          }
          if (duration > 1) {
            for (let index = 0; index < duration; index++) {
              if (measureBeat % timeNumerator == 0) {
                result += "| "
              }
              result += "𝄽 "
              measureBeat += 1
            }
          }
        }
        else if (isGraceNote) {
          if (note.startsWith("A")) {
            result += "ᴬ"
          } if (note.startsWith("B")) {
            result += "ᴮ"
          } if (note.startsWith("C")) {
            result += "ꟲ"
          } if (note.startsWith("D")) {
            result += "ᴰ"
          } if (note.startsWith("E")) {
            result += "ᴱ"
          } if (note.startsWith("F")) {
            result += "ꟳ"
          } if (note.startsWith("G")) {
            result += "ᴳ"
          }
        }
        else if (duration == 1) {
          if (measureBeat % timeNumerator == 0 && measureBeat !== 0) {
            result += "| "
          }
          result += `${note}${octave} `
          measureBeat += 1
        }
        else if (duration == 0.5 && !index == 0 && notes[index - 1] && notes[index - 1].duration == 0.5 && !notes[index - 1].handled) {
          if (measureBeat % timeNumerator == 0 && measureBeat !== 0) {
            result += "| "
          }
          result += `${notes[index - 1].note}${notes[index - 1].octave}◡${note}${octave} `
          notes[index].handled = true
          notes[index - 1].handled = true
          unfinshedPair = false
          measureBeat += 1
        }
        else if (duration == 0.5) {
          unfinshedPair = true
        }
        else if (duration > 1) {
          if (measureBeat % timeNumerator == 0 && measureBeat !== 0) {
            result += "| "
          }
          result += `${note}${octave} `
          measureBeat += 1
          for (let index = 0; index < duration - 1; index++) {
            if (measureBeat % timeNumerator == 0) {
              result += "| "
            }
            result += "- "
            measureBeat += 1

          }
        }
      }
    });
    setUnfinishedEighthNotePair(unfinshedPair)
    notes.forEach((noteObj, index) => {
      if (notes[index].handled) {
        notes[index].handled = false
      }
    })
    return result;
  };

  useEffect(() => {
    const notesText = generateCustomNotation()
    setNotesVisual(notesText)
  }, [notes])

  const addNote = (note, octave) => {
    const selectedBeatLength = beatLength || 1;
    const duration = isGraceNote ? 0.5 : selectedBeatLength; // Grace notes have zero duration in terms of beat count
    if (notes.length != 0) {
      setNotes([...notes, { note, octave, duration, isRest: false, isGraceNote, beat: notes[notes.length - 1].beat + duration }]);
    }
    else {
      setNotes([...notes, { note, octave, duration, isRest: false, isGraceNote, beat: duration }]);
    }

    console.log(notes)
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
    const pickupMeasure = pickupDuration > 0;

    notes.forEach((noteObj, index) => {
      let { note, octave, duration, isRest, isGraceNote } = noteObj;
      const remainingBeatsInMeasure = pickupMeasure && measureNumber === 1 ? pickupDuration : timeNumerator;

      // Always include grace notes, even if duration is 0
      if (isGraceNote) {
        let noteXML = `<note>\n<grace slash="yes"/>\n`;
        if (!isRest) {
          noteXML += `<pitch>
          <step>${note.charAt(0)}</step>
          <alter>${note.includes('#') ? 1 : note.includes('b') ? -1 : 0}</alter>
          <octave>${octave}</octave>
        </pitch>\n`;
        } else {
          noteXML += `<rest/>\n`;
        }
        noteXML += `<type>eighth</type>\n</note>\n`; // Grace notes often default to eighth notes
        measureNotes += noteXML;
        return; // Skip further processing for this note
      }

      // Process regular or rest notes
      while (duration > 0) {
        const currentDuration = Math.min(duration, remainingBeatsInMeasure - notesInMeasure);
        let noteXML = `<note>\n`;

        if (isRest) {
          noteXML += `<rest/>\n`;
          noteXML += `<duration>${currentDuration}</duration>\n`;
          noteXML += `<type>${currentDuration === 1 ? 'quarter' : 'half'}</type>\n`;
        } else {
          noteXML += `<pitch>
          <step>${note.charAt(0)}</step>
          <alter>${note.includes('#') ? 1 : note.includes('b') ? -1 : 0}</alter>
          <octave>${octave}</octave>
        </pitch>\n`;
          noteXML += `<duration>${currentDuration}</duration>\n`;
          noteXML += `<type>${currentDuration === 1 ? 'quarter' : currentDuration == 0.5 ? 'eighth' : 'half'}</type>\n`;
        }

        noteXML += `</note>\n`;
        measureNotes += noteXML;
        notesInMeasure += currentDuration;
        duration -= currentDuration;

        // Handle measure overflow
        if (notesInMeasure >= remainingBeatsInMeasure || (index === notes.length - 1 && duration <= 0)) {
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

        <label className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            checked={isGraceNote}
            onChange={(e) => setIsGraceNote(e.target.checked)}
          />
          <span className="font-semibold">Grace Note Mode</span>
        </label>

        <label className="flex flex-col mb-4">
          <span className="font-semibold">Pickup Measure Duration (beats)</span>
          <input
            type="number"
            min="0"
            value={pickupDuration}
            onChange={(e) => setPickupDuration(parseFloat(e.target.value))}
            className="border rounded px-2 py-1 w-24"
          />
        </label>

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

      <div className="w-1/4 bg-white shadow-lg border-l p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-4">Entered Notes</h2>
          <p>{notesVisual}</p>
        </div>
        {unfinishedEighthNotePair && <div className='bg-red-500 rounded p-2'>
          <p className='text-white'>Unfinished Eight Note Pair</p>
        </div>}
      </div>
    </div>
  );
};

export default App;
