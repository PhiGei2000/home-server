// RFC 62265 Section 4.1.1
export default class Cookie {
    public readonly name: string;
    public readonly value: string;

    // represents the maximum lifetime of the cookie
    public readonly expires: Date;
    // represents the number of seconds unitl the cookie expires
    public readonly maxAge: number;
    // specifies to wich domain the cookie will be sent
    public readonly domain: string;
    // specifies the path to wich the cookie will be sent
    public readonly path: string;
    // limits the scope of the cookie to secure channels only
    public readonly secure: boolean;
    // limits the scope of the cookie to http requests only
    public readonly httpOnly: boolean;
    // additional data
    public readonly extension: string;
}

export class CookieCollection {
    private data: { [key: string]: Cookie };

    get(name: string): Cookie {
        return this.data[name];
    }

    set(cookie: Cookie) {
        this.data[cookie.name] = cookie;
    }
}

export function parseCookie(cookieString: string): Cookie {
    const parts = cookieString.split(';');


}
