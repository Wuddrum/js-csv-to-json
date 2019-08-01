let entryArrays;
let values;
let outputObjects;

const csvInputEl = document.getElementById("csvinput");
csvInputEl.addEventListener("change", onCsvFileSelected);

function processCsv(csvContents) {
  const csvLines = csvContents.split(/\r?\n/);
  for (let i = 1; i < csvLines.length; i++) {
    const line = csvLines[i];

    processCsvLine(line, i);
  }

  var json = JSON.stringify(outputObjects, null, 2);
  saveJson(json);
}

function processCsvLine(line, lineNum) {
  const lineEntries = line.split(",");
  const entriesSoFar = [];
  let previousId = "";

  for (let i = 0; i < lineEntries.length; i++) {
    if (entryArrays.length < i + 1) {
      entryArrays.push([]);
    }

    const entry = lineEntries[i];
    if (entry.length === 0) {
      continue;
    }

    const id = getEntryId(entry, i, previousId);

    entriesSoFar.push(entry);
    const value = entriesSoFar.join(" > ");
    if (values.indexOf(value) !== -1) {
      previousId = previousId + id;
      continue;
    }

    values.push(value);

    var entryObject = getEntryObject(entry, value, id, previousId, lineNum);
    outputObjects.push(entryObject);

    previousId = previousId + id;
  }
}

function getEntryObject(entry, value, id, previousId, lineNum) {
  let parentId = previousId ? previousId : null;
  return {
    id: previousId + id,
    position: lineNum,
    label: entry,
    value: value,
    title: entry,
    parentID: parentId
  };
}

function getEntryId(entry, entryLevel) {
  let id;

  const entryArrayIndex = entryArrays[entryLevel].indexOf(entry);
  if (entryArrayIndex > -1) {
    id = entryArrayIndex + 1;
  } else {
    entryArrays[entryLevel].push(entry);
    id = entryArrays[entryLevel].length;
  }

  if (entryLevel === 0) {
    return id.toString().padStart(2, "0");
  }

  return id.toString().padStart(4, "0");
}

function init() {
  entryArrays = [];
  values = [];
  outputObjects = [];
}

function saveJson(json) {
  var aEl = document.createElement("a");
  var jsonBlob = new Blob([json], { type: "text/json" });
  aEl.href = URL.createObjectURL(jsonBlob);
  aEl.download = "output.json";
  aEl.click();
}

function onCsvFileSelected(e) {
  init();

  const csvFile = e.target.files[0];
  const fileReader = new FileReader();

  fileReader.addEventListener("load", onFileLoad);
  fileReader.readAsText(csvFile);
}

function onFileLoad(e) {
  const csv = e.target.result;

  processCsv(csv);
}
