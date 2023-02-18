import Header from "./header";

export type LayoutProps = {
    children: string | JSX.Element | JSX.Element[] | (() => JSX.Element)
};

export default function Layout({ children }: LayoutProps) {
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
