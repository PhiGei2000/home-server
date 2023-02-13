import Header from "./header";

export default function Layout({ children }) {
    return (
        <>
            <Header />
            <main>
                <div className="container-xl">
                    {children}
                </div>
            </main>
        </>
    )
}
