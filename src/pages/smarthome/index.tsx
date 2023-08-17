import { useEffect, useState } from "react"
import { ClimateMeasure } from "../../lib/climate";
import Link from "next/link";
import Light from "../../lib/light";

type SmarthomeState = {
    latestMeasures: ClimateMeasure[];
    lights: Light[]
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

        var updateLightValue = function (newLight?: Light) {
            if (newLight) {
                setData((prevState) => {
                    if (prevState) {
                        const newLights = prevState.lights.map(l => l.id == newLight.id ? newLight : l);

                        const newState = {
                            ...prevState,
                            lights: newLights
                        };
                        return newState;
                    }
                    return prevState;
                });
            }
        }

        return (<>
            <h3>Temperaturen</h3>
            <div className="row">
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
            </div>
            <h3 className="mt-3">Light Control</h3>
            <div className="row">
                {
                    data.lights.map((light) =>
                        <div key={light.id} className="col-6">
                            <div className="card">
                                <div className="card-body row">
                                    <h5 className="col card-title">{light.name} {light.currentValue}</h5>
                                    <div className="col-4">
                                        <div className="btn-group" role="group" aria-label="Light Control">
                                            {light.pwm ? <button type="button" className="btn btn-secondary" onClick={() => {
                                                if (light.currentValue == 0) {
                                                    return;
                                                }

                                                var value = light.currentValue - 128;
                                                setLightValue(light.id, value).then(updateLightValue);
                                            }}>-</button> : <></>}
                                            <button type="button" className="btn btn-secondary" onClick={
                                                () => {
                                                    var value = 0;
                                                    if (light.currentValue === 0) {
                                                        value = light.pwm ? 511 : 1;
                                                    }

                                                    setLightValue(light.id, value).then(updateLightValue);
                                                }}>{light.currentValue > 0 ? "Off" : "On"}</button>
                                            {light.pwm ? <button type="button" className="btn btn-secondary" onClick={() => {
                                                var value = light.currentValue + 128;
                                                if (value > 1023) {
                                                    return;
                                                }

                                                setLightValue(light.id, value).then(updateLightValue);
                                            }}>+</button> : <></>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </>);
    }
}

async function getState(): Promise<SmarthomeState> {
    const measures = await fetch('/api/climate/latest')
        .then(res => res.json())
        .then(json => json.map((obj: any) => new ClimateMeasure(new Date(obj.time), obj.temperature, obj.sensorId)));

    const lights = await fetch('/api/smarthome/lights')
        .then(res => res.json())
        .then(json => json.map((obj: any) => new Light(obj.id, obj.pwm, obj.gpio, obj.currentValue, obj.name)));

    return {
        latestMeasures: measures,
        lights: lights
    };
}

function setLightValue(id: number, value: number): Promise<Light | undefined> {
    return fetch(`/api/smarthome/lights?id=${id}&value=${value}`, {
        method: "POST"
    }).then(res => res.json()).then(obj => new Light(obj.id, obj.pwm, obj.gpio, obj.currentValue, obj.name));
}
