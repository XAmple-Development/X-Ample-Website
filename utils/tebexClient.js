const token = process.env.NEXT_PUBLIC_TEBEX_TOKEN;

export const tebexClient = async (query, cookies) => {
    let tokenToUse = token;
    
    if (cookies && cookies.get('demo-tebex-public-key')) {
        tokenToUse = cookies.get('demo-tebex-public-key').value;
    }
    
    return await fetch(`https://headless.tebex.io/api/accounts/${tokenToUse}/${query}`, {
        method: 'GET',
        headers: {},
    })
    .then(res => res.json())
    .catch(err => console.log(err));
}
