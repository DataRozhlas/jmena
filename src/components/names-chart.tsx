import { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import exporting from 'highcharts/modules/exporting';
import offlineExporting from 'highcharts/modules/offline-exporting';
import exportData from 'highcharts/modules/export-data';

exporting(Highcharts);
offlineExporting(Highcharts);
exportData(Highcharts);

import { HighchartsChart, HighchartsProvider, Chart, Legend, LineSeries, XAxis, YAxis, Tooltip } from "react-jsx-highcharts";

Highcharts.setOptions({
    lang: {
        numericSymbols: [" tis.", " mil.", " mld.", " bil."],
        downloadPNG: "Stáhnout obrázek PNG",
        downloadCSV: "Stáhnout data CSV",
    },
    exporting: {
        buttons: {
            contextButton: {
                enabled: false
            },
            exportButton: {
                text: 'Stáhnout',
                // Use only the download related menu items from the default
                // context button
                menuItems: [
                    'downloadPNG',
                    'downloadCSV',
                ]
            },
        },
        filename: 'jmena',
        enabled: true,
    },
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
    // const years = Array.from({ length: 2023 - 1900 + 1 }, (_, i) => Date.UTC(1990 + i, 0, 1));

    const years = Array.from({ length: 2023 - 1900 + 1 }, (_, i) => (1900 + i).toString());

    const [namesData, setNamesData] = useState<NamesData[]>([]);
    const [legendHeight, setLegendHeight] = useState<number>(0);


    useEffect(() => {
        const fetchData = async (url: string) => {
            const response = await fetch(url);
            const data = await response.json();
            //      console.log(`Fetched ${data.processedName} from ${url}`)
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

    useEffect(() => {
        const legendElement = document.querySelector('.highcharts-legend');
        if (legendElement) {
            setLegendHeight(legendElement.clientHeight);
        }
    }, [namesData]);

    // if (props.selectedNames.length !== namesData.length) {
    //     return <div>Loading...</div>;
    // }

    if (props.selectedNames.length === 0) {
        return <div className="flex items-center justify-center h-80 text-gray-500">
            Vyberte jména, která chcete porovnat
        </div>
    }

    return (
        <HighchartsProvider Highcharts={Highcharts}>
            <HighchartsChart
                plotOptions={{
                    series: {
                        animation: false,
                        states: { hover: { enabled: false } }, // disable hover
                    }
                }}>
                <Chart
                    height={500 + legendHeight}
                />

                <Legend layout="horizontal" align="center" verticalAlign="bottom" />

                <Tooltip shared valueSuffix=' lidí' />

                <XAxis categories={years} crosshair={true}>
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
                <a href="https://www.mvcr.gov.cz/clanek/obecna-informace-k-registru-obyvatel.aspx">Zdroj dat: Ministerstvo vnitra – Registr obyvatel</a>
            </p>

            {/* <div>
                <h1>Chart</h1>
                <p>{props.selectedNames.length} </p>
                <p>{props.simpleData.length}</p>
                <p>{props.complexData.length}</p>
            </div> */}
        </HighchartsProvider>
    )
}

export default NamesChart;