import { useEffect, useState } from 'react';
import { FileSystemEntry } from '../lib/fileSystemEntry';

export default function Files(): JSX.Element {
    const [files, setFiles] = useState<FileSystemEntry[]>([]);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getFiles('').then(files => {
            setFiles(files);
            setLoading(false);
        })
    }, [])

    return (<>
        <h1>Dateien</h1>
        {
            isLoading ? <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
                : <ul className="list-group">
                    {
                        files.map(Checkbox)
                    }
                </ul>
        }
    </>
    )
}

async function getFiles(filename: string): Promise<FileSystemEntry[]> {
    return fetch(`/api/files/${filename}`)
        .then((res) => res.json())
        .then((files: string[]) => files.map(file => new FileSystemEntry(file)));
}

function Checkbox(file: FileSystemEntry) {
    const id = `checkbox${file.filename}`;

    return (<li className="list-group-item" key={file.filename}>
        <label className="form-check-label stretched-link" htmlFor={id}>
            <input className="form-check-input me-1" type="checkbox" value="" id={id} />
            {file.filename}
        </label>
    </li>);
}