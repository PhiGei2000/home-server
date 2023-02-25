import { useEffect, useState } from "react"
import { ClimateMeasure } from "../../lib/climate";
import Link from "next/link";

type SmarthomeState = {
    latestMeasures: ClimateMeasure[];
}

export default function Dashboard() {
    const [data, setData] = useState<SmarthomeState>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!data) {
            setLoading(true);
            getState().then(state => {
                setData(state);
                setLoading(false);
            });
        }
    }, [data])

    if (loading)
        return (
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );

    if (data) {
        const timeString = data.latestMeasures[0].time.toLocaleString('de-DE', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        return (<div className="row">
            <div className="col-6">
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Temperatur: {data.latestMeasures[0].temperature}&deg;C</h5>
                        <div className="row">
                            <div className="col">
                                <h6 className="card-subtitle text-muted">{timeString} Uhr</h6>
                            </div>
                            <div className="col text-end">
                                <Link className="card-link" href="/smarthome/climate">Verlauf</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>)
    }
}

async function getState(): Promise<SmarthomeState> {
    const measures = await fetch('/api/climate/latest')
        .then(res => res.json())
        .then(json => json.map((obj: any) => new ClimateMeasure(new Date(obj.time), obj.temperature, obj.sensorId)));

    return {
        latestMeasures: measures
    };
}
