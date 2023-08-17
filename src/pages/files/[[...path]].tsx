import { useEffect, useState } from 'react';
import { FileSystemEntry, FileSystemEntryType } from '../../lib/fileSystemEntry';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { dirname, join } from 'path';

export default function Files(): JSX.Element {
    const [files, setFiles] = useState<FileSystemEntry[]>([]);
    const [isLoading, setLoading] = useState(false);
    const [path, setPath] = useState('');

    const router = useRouter();
    if (router.query.path) {
        const queryPath = (router.query.path as string[]).join('/');
        updatePath(queryPath);
    }
    else {
        updatePath('');
    }

    function updatePath(newPath: string) {
        if (path !== newPath) {
            setPath(newPath);
        }
    }


    useEffect(() => {
        setLoading(true);
        getFiles(path).then(files => {
            setFiles(files);
            setLoading(false);
        })
    }, [path])

    if (isLoading) {
        return (<div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>);
    }

    const parentDir = dirname(path);

    return (<>
        <h1>Dateien</h1>
        <h5>/{path}</h5>
        <div className="container">
            <div className="row align-items-center">
                <div className="col-auto">
                    <Link href={`/files/${parentDir}`} passHref className="text-decoration-none text-body">
                        <span className="material-symbols-outlined">arrow_upward</span>
                    </Link>
                </div>
                <div className="col-auto">
                    <span className="material-symbols-outlined">upload_file</span>
                </div>
                <div className="col">
                    <form className="d-flex" role='search'>
                        <input type="search" className="form-control me-2" placeholder='Datei suchen' />
                        <button className="btn btn-outlined-success" type='submit'>Suchen</button>
                    </form>
                </div>
            </div>
            <div className="row mt-5">
                {files.map((file) => File(file, path))}
            </div>
        </div>
    </>
    )
}

async function getFiles(filename: string): Promise<FileSystemEntry[]> {
    return fetch(`/api/files/${filename}`)
        .then((res) => res.json())
        .then((files: string[]) => files.map(file => new FileSystemEntry(file)));
}

function File(file: FileSystemEntry, path: string) {
    const filetype = file.type === FileSystemEntryType.DIRECTORY ? "folder" : "draft";
    const link = `/files/${join(path, file.filename)}`;

    return (<div className="col-sm-2 col-6 text-center text-break">
        <Link href={link} passHref className="text-decoration-none text-body">
            <span className="material-symbols-outlined">{filetype}</span>
            <p>{file.filename}</p>
        </Link>
    </div>);
}