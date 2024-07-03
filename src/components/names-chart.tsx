import { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import { HighchartsChart, HighchartsProvider, Chart, Legend, LineSeries, XAxis, YAxis, Tooltip } from "react-jsx-highcharts";

Highcharts.setOptions({
    lang: {
        numericSymbols: [" tis.", " mil.", " mld.", " bil."],
    }
});


type ChartProps = {
    selectedNames: { id: number, set: string }[],
    simpleData: [string, number, number, string][],
    complexData: [string, number, number, string][],
};

type NamesData = {
    url: string,
    name: string,
    count: number,
    data: number[]
};


function NamesChart(props: ChartProps) {
    const years = Array.from({ length: 2023 - 1900 + 1 }, (_, i) => Date.UTC(1990 + i, 0, 1));

    const [namesData, setNamesData] = useState<NamesData[]>([]);

    useEffect(() => {
        const fetchData = async (url: string) => {
            const response = await fetch(url);
            const data = await response.json();
            console.log(`Fetched ${data.name} from ${url}`)
            setNamesData(prevData => ([...prevData, { url, name: data.processedName, count: data.count, data: Array.from({ length: 2023 - 1900 + 1 }, (_, i) => 1900 + i).map(year => data[year] ?? 0) }]));
        };
        if (props.selectedNames.length === 0) {
            return;
        }
        if (props.selectedNames.length < namesData.length) {
            const newNamesData = namesData.filter(data => props.selectedNames.some(name => data.url === `data/${name.set === "s" ? "simple" : "complex"}/${name.id}.json`));
            setNamesData(newNamesData);
        }
        props.selectedNames.forEach(name => {
            const url = `data/${name.set === "s" ? "simple" : "complex"}/${name.id}.json`;
            if (!namesData.some(data => data.url === url)) {
                fetchData(url);
            }
        });
    }, [
        props.selectedNames,
    ]);

    // if (props.selectedNames.length !== namesData.length) {
    //     return <div>Loading...</div>;
    // }

    return (
        <HighchartsProvider Highcharts={Highcharts}>
            <HighchartsChart plotOptions={{
                series: {
                    animation: false,
                    states: { hover: { enabled: false } }, // disable hover
                }
            }}>
                <Chart height={500} />

                <Legend layout="horizontal" align="center" verticalAlign="bottom" />

                <Tooltip shared valueSuffix=' lidí' />

                <XAxis type="datetime" tickPositions={years}>
                    <XAxis.Title>Rok narození</XAxis.Title>
                </XAxis>


                <YAxis>
                    <YAxis.Title>Počet lidí s daným jménem</YAxis.Title>
                    {props.selectedNames.map((name) => {
                        const url = `data/${name.set === "s" ? "simple" : "complex"}/${name.id}.json`;
                        const option = namesData.find(name => name.url === url)
                        return <LineSeries key={`line-${name.set}-${name.id}`} name={option?.name} data={option?.data} visible={option?.count ? option?.count > 19 : false} />
                    })}

                </YAxis>
            </HighchartsChart>
            <p className="text-xs text-end">
                Zdroj dat: Ministerstvo vnitra – <a href="https://www.mvcr.gov.cz/clanek/obecna-informace-k-registru-obyvatel.aspx">Registr obyvatel</a>
            </p>

            <div>
                <h1>Chart</h1>
                <p>{props.selectedNames.length} </p>
                <p>{props.simpleData.length}</p>
                <p>{props.complexData.length}</p>
            </div>
        </HighchartsProvider>
    )
}

export default NamesChart;