import { useState, useEffect } from "react";
import { tsvParseRows } from "d3-dsv";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/multi-select";
import { Toaster } from "@/components/ui/sonner"
import NamesChart from "@/components/names-chart"


function App() {

  const [simpleData, setSimpleData] = useState<[string, number, number, string][]>([]);
  const [simpleLoaded, setSimpleLoaded] = useState(false);
  const [showSimple, setShowSimple] = useState(true);

  const [complexData, setComplexData] = useState<[string, number, number, string][]>([]);
  const [complexLoaded, setComplexLoaded] = useState(false);
  const [showComplex, setShowComplex] = useState(false);

  const [selectedNames, setSelectedNames] = useState<{ id: number, set: string }[]>([
    {
      "id": 85,
      "set": "s"
    },
    {
      "id": 419,
      "set": "s"
    },
    {
      "id": 2,
      "set": "s"
    },
    {
      "id": 20,
      "set": "s"
    },
    {
      "id": 599,
      "set": "s"
    },
    {
      "id": 7,
      "set": "s"
    }
  ]);

  const [currentData, setCurrentData] = useState<[string, number, number, string][]>(simpleData);

  const fetchData = async (url: string) => {
    const response = await fetch(url);
    const text = await response.text();
    const parsed = await tsvParseRows(text);
    const data = await parsed.map((d, index) => [d[0], +d[1], index, url.includes("Complex") ? "c" : "s"]);
    console.log(`Fetched ${data.length} rows from ${url}`)
    return data;
  };

  const toggleChecked = (checked: boolean, which: string) => () => {
    if (which === "simple") {
      setShowSimple(checked);
      let data = [];
      if (checked) { data.push(...simpleData) }
      if (showComplex) { data.push(...complexData) }
      data.sort((a, b) => b[1] - a[1]);
      setCurrentData(data);
      if (!checked) {
        const newSelectedNames = selectedNames.filter(name => name.set === "c");
        setSelectedNames(newSelectedNames);
      }
    }
    if (which === "complex") {
      setShowComplex(checked);
      let data = [];
      if (showSimple) { data.push(...simpleData) }
      if (checked) { data.push(...complexData) }
      data.sort((a, b) => b[1] - a[1]);
      setCurrentData(data);
      if (!checked) {
        const newSelectedNames = selectedNames.filter(name => name.set === "s");
        setSelectedNames(newSelectedNames);
      }
    }
  }

  useEffect(() => {
    if (!simpleLoaded) {
      const data = fetchData("data/namesSimple.tsv");
      data.then((d) => {
        setSimpleData(d as [string, number, number, string][]);
        setSimpleLoaded(true);
        setCurrentData(d as [string, number, number, string][]);
      });
    }
    if (!complexLoaded) {
      const data = fetchData("data/namesComplex.tsv");
      data.then((d) => {
        setComplexData(d as [string, number, number, string][]);
        setComplexLoaded(true);
      });
    }
  }, [])

  // useEffect(() => {
  //   console.log("Selected names changed", selectedNames)
  // }, [selectedNames])


  if (!simpleLoaded) {
    return <div>Strpení...</div>
  }

  return (
    <div className="space-y-2 max-w-[620px] mx-auto">
      <h1 className="text-xl font-bold mb-4">{`Prohledat ${currentData.length.toLocaleString("cs-CZ")} křestních jmen`}</h1>
      <div className="pb-4 space-y-2">
        <div className="flex items-center space-x-2">
          <Switch id="simple-names" checked={showSimple} onCheckedChange={toggleChecked(!showSimple, "simple")} />
          <Label htmlFor="simple-names">Jednoslovná jména, např. Marie</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="complex-names" checked={showComplex} onCheckedChange={toggleChecked(!showComplex, "complex")} />
          <Label htmlFor="complex-names">Složená jména, např. Anna Marie</Label>
        </div>
      </div>
      <div className="">
        {simpleLoaded && <MultiSelect
          options={currentData}
          onValueChange={setSelectedNames}
          defaultValue={selectedNames}
          placeholder="Vyberte jméno"
          variant="inverted"
          animation={2}
          maxCount={6}
        />}

      </div>
      <div className="pt-4">
        <NamesChart selectedNames={selectedNames} simpleData={simpleData} complexData={complexData} />
      </div>
      <Toaster position="top-center" />
    </div>)
}

export default App;
