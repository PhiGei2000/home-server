import { setCookie } from 'typescript-cookie';
import { CookieAttributes } from 'typescript-cookie/dist/types';

export function processCookie(cookieString: string) {
    const parts = cookieString.split(';');

    // get cookie name and value
    const cookiePair = parts[0].split('=');
    const name = cookiePair[0], value = cookiePair[1];

    // process attributes
    var attributes: CookieAttributes;
    for (var i = 1; i < parts.length; i++) {
        const attributePair = parts[i];

        if (attributePair == 'HttpOnly') {
            // not supported on client side
            continue;
        } else if (attributePair == 'Secure') {
            attributes.secure = true;
        } else {
            const attributeParts = attributePair.split('=');
            const attributeName = attributeParts[0], attributeValue = attributeParts[1];

            switch (attributeName) {
                case 'Expires':
                    attributes.expires = parseCookieDate(attributeValue);
                    break;
                case 'Max-Age':
                    attributes.expires = getExpireDate(parseInt(attributeValue));
                    break;
                case 'Path':
                    attributes.path = attributeValue;
                    break;
                case 'Domain':
                    attributes.domain = attributeValue;
                    break;
                // case 'Same-Site':
                //     attributes.sameSite = attributeValue;
                //     break;
                default:
                    break;
            }
        }
    }

    setCookie(name, value, attributes);
}

function parseCookieDate(cookieDateString: string): Date | undefined {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
        'Oct', 'Nov', 'Dec'
    ];

    const pattern =
        /(\w{3}),\s(\d{2})\s(\w{3})\s(\d{4})\s(\d{2}):(\d{2}):(\d{2})/;

    const match = pattern.exec(cookieDateString);

    if (match) {
        const date = parseInt(match[2]);
        const month = months.indexOf(match[3]);
        const year = parseInt(match[4]);

        const hours = parseInt(match[5]);
        const minutes = parseInt(match[6]);
        const seconds = parseInt(match[7]);

        return new Date(year, month, date, hours, minutes, seconds);
    }
}

function getExpireDate(maxAgeValue: number): Date {
    return new Date(Date.now() + maxAgeValue * 1000);
}
