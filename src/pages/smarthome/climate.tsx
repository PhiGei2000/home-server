import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartData, ScaleChartOptions, TimeSeriesScale, ElementChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2'
import { ClimateMeasure } from '../../lib/climate';
import { useEffect, useState } from 'react';
import { NextRouter, useRouter } from 'next/router';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeSeriesScale);

export default function Climate() {
    const [data, setData] = useState<ChartData<"line", number[]>>();
    const [loading, setLoading] = useState(false);
    const [dirty, setDirty] = useState(true);

    const router = useRouter();
    let { begin, end } = getTimeSpan(router);

    useEffect(() => {
        if (dirty && !loading) {
            setLoading(true);

            fetchClimateData(begin, end).then(data => {
                setData({
                    labels: data.map(measure => measure.time.toLocaleString('de-DE', measure.time.getHours() === 0 && measure.time.getMinutes() === 0 ? {
                        year: 'numeric', month: '2-digit', day: 'numeric'
                    } : {
                        hour: '2-digit', minute: '2-digit'
                    })),
                    datasets: [{
                        label: 'Temperatur',
                        data: data.map(measure => measure.temperature),
                        borderColor: '#cc0000',
                        backgroundColor: '#cc0000',
                        tension: 0.2
                    }]
                });

                setLoading(false);
                setDirty(false);
            })
        }
    }, [begin, end, dirty, loading]);

    if (loading || !data) {
        return <span className='spinner'></span>
    }

    const options: any = {
        scales: {
            x: {
                title: {
                    text: 'Zeit',
                    display: true
                },
                type: 'category',
                ticks: {
                    autoSkip: true, maxRotation: 0
                }
            },
            y: {
                title: { text: 'Temperatur', display: true }
            }
        }
    }

    return (
        <Line data={data} options={options} />
    )
}

function fetchClimateData(begin: Date, end: Date): Promise<ClimateMeasure[]> {
    return fetch(`/api/climate?begin=${begin.toISOString()}&end=${end.toISOString()}`)
        .then(res => res.json())
        .then(json => json.map((obj: any) => new ClimateMeasure(new Date(obj.time), obj.temperature, obj.sensorId)));
}

function getTimeSpan(router: NextRouter): {
    begin: Date, end: Date
} {
    const now = new Date();
    var end = now;
    var begin = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (router.query.begin) {
        begin = new Date(router.query.begin as string);
    }

    if (router.query.end) {
        end = new Date(router.query.end as string);
    }

    return { begin, end };
}