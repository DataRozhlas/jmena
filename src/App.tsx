import { useState, useEffect } from "react";
import { tsvParseRows } from "d3-dsv";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

function App() {

  const [simpleData, setSimpleData] = useState<[string, number][]>([]);
  const [simpleLoaded, setSimpleLoaded] = useState(false);
  const [showSimple, setShowSimple] = useState(true);

  const [complexData, setComplexData] = useState<[string, number][]>([]);
  const [complexLoaded, setComplexLoaded] = useState(false);
  const [showComplex, setShowComplex] = useState(false);

  const fetchData = async (url: string) => {
    const response = await fetch(url);
    const text = await response.text();
    const parsed = await tsvParseRows(text);
    const data = await parsed.map((d) => [d[0], +d[1]]);
    return data;
  };

  const toggleChecked = (checked: boolean, which: string) => () => {
    if (which === "simple") { setShowSimple(checked); }
    if (which === "complex") {
      if (!complexLoaded) {
        const data = fetchData("data/namesComplex.tsv");
        data.then((d) => {
          setComplexData(d as [string, number][]);
          setComplexLoaded(true);
        });
      }
      setShowComplex(checked);
    }
  }

  useEffect(() => {
    if (!simpleLoaded) {
      const data = fetchData("data/namesSimple.tsv");
      data.then((d) => {
        setSimpleData(d as [string, number][]);
        setSimpleLoaded(true);
      });
    }
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Switch id="simple-names" checked={showSimple} onCheckedChange={toggleChecked(!showSimple, "simple")} />
        <Label htmlFor="simple-names">Jednoslovná jména, např. Marie</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="complex-names" checked={showComplex} onCheckedChange={toggleChecked(!showComplex, "complex")} />
        <Label htmlFor="complex-names">Složená jména, např. Anna Marie</Label>
      </div>
    </div>)
}

export default App
