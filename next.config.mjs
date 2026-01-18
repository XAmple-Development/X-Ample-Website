import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    },
};

export default withNextIntl(nextConfig);
